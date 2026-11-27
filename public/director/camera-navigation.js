/* Camera gestures own their pointer stream before joint/gizmo manipulation.
 * Touch takeover restores an in-progress object edit before starting one camera
 * transaction. A remaining finger is drained after pinch, never reused to edit.
 */
(() => {
  'use strict';
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  function install(options) {
    const { canvas, camera } = options, B = globalThis.BABYLON;
    const pointers = new Map(), removers = [];
    let gesture = null, wheel = null, wheelTimer = null, firstEdit = null, drain = false, disposed = false, transferring = false;
    const onCanvas = event => event.target === canvas || canvas.contains(event.target);
    const enabled = () => !disposed && options.isEnabled();
    const own = event => { event.preventDefault(); event.stopImmediatePropagation(); };
    const point = event => ({ x: event.clientX, y: event.clientY, type: event.pointerType });
    function listen(target, name, fn, extra = {}) { const settings = { capture: true, passive: false, ...extra }; target.addEventListener(name, fn, settings); removers.push(() => target.removeEventListener(name, fn, settings)); }
    function capture(id) { try { canvas.setPointerCapture(id); } catch {} }
    function release(id) { try { if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id); } catch {} }
    function pair() { const [a,b] = [...pointers.values()]; return a && b ? { x: (a.x+b.x)/2, y: (a.y+b.y)/2, span: Math.max(4,Math.hypot(a.x-b.x,a.y-b.y)) } : null; }
    function constrainPosition() {
      const limit = options.limits().coordinate, position = camera.position, target = camera.target;
      if ([...position.asArray(),...target.asArray()].some(v => !Number.isFinite(v))) throw new Error('Camera movement must stay finite.');
      return limit;
    }
    function zoom(factor) {
      factor = clamp(factor,.05,20);
      if (camera.mode === B.Camera.ORTHOGRAPHIC_CAMERA) {
        const size = clamp((camera.orthoTop-camera.orthoBottom)*factor,.01,options.limits().ortho);
        camera.orthoTop = size/2; camera.orthoBottom = -size/2; options.fitOrtho();
      } else {
        camera.getViewMatrix(true);
        const outward = camera.position.subtract(camera.target).normalize(), bound = options.limits().coordinate;
        let maximum = camera.upperRadiusLimit || 400;
        for (const axis of ['x','y','z']) if (Math.abs(outward[axis])>1e-10) maximum = Math.min(maximum,(outward[axis]>0 ? bound-camera.target[axis] : -bound-camera.target[axis])/outward[axis]);
        if(maximum<.01)return;camera.radius = clamp(camera.radius*factor,Math.max(.01,camera.lowerRadiusLimit || .01),maximum);
        camera.getViewMatrix(true);
      }
      options.onChange?.();
    }
    function pan(dx,dy) {
      camera.getViewMatrix(true);
      const rect = canvas.getBoundingClientRect(), aspect = rect.width/Math.max(1,rect.height), forward = camera.getForwardRay().direction.normalize();
      const right = B.Vector3.Cross(forward,camera.upVector).normalize(), up = B.Vector3.Cross(right,forward).normalize();
      const half = camera.mode === B.Camera.ORTHOGRAPHIC_CAMERA ? (camera.orthoTop-camera.orthoBottom)/2 : camera.radius*Math.tan(camera.fov/2)/(camera.fovMode===B.Camera.FOVMODE_HORIZONTAL_FIXED ? aspect : 1);
      const delta = right.scale(-dx*2*half/Math.max(1,rect.height)).add(up.scale(dy*2*half/Math.max(1,rect.height))), bound = constrainPosition();
      for (const axis of ['x','y','z']) delta[axis] = clamp(delta[axis],Math.max(-bound-camera.target[axis],-bound-camera.position[axis]),Math.min(bound-camera.target[axis],bound-camera.position[axis]));
      const position=camera.position.add(delta);camera.setTarget(camera.target.add(delta));camera.setPosition(position);camera.getViewMatrix(true);options.onChange?.();
    }
    function orbit(dx,dy) { const alpha=camera.alpha,beta=camera.beta;camera.alpha-=dx*.006;camera.beta=clamp(camera.beta-dy*.006,Math.PI/180,Math.PI-Math.PI/180);camera.getViewMatrix(true);if(camera.position.asArray().some(v=>Math.abs(v)>options.limits().coordinate)){camera.alpha=alpha;camera.beta=beta;camera.getViewMatrix(true);}options.onChange?.(); }
    function endWheel(cancelled=false) { if (!wheel) return; clearTimeout(wheelTimer); const current=wheel; wheel=null; options.onEnd(current.before,cancelled); }
    function begin(kind,last) { endWheel(); gesture={kind,last,before:options.onBegin(),suspended:false}; canvas.style.cursor='grabbing'; }
    function finish(cancelled=false) { if (!gesture) return; const current=gesture; gesture=null; canvas.style.cursor=''; options.onEnd(current.before,cancelled); }
    function takeover() {
      transferring=true;try{options.onTakeover?.(firstEdit);}finally{transferring=false;}firstEdit=null;
      // Gizmo release can reattach inputs. The navigation module remains their owner.
      camera.inputs.clear();
    }
    function down(event) {
      if (!enabled() || !onCanvas(event) || (event.pointerType!=='touch' && ![0,1,2].includes(event.button))) return;
      endWheel();
      if (pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId,point(event));
      if (drain) { capture(event.pointerId); own(event); return; }
      const touches=[...pointers.values()].filter(p=>p.type==='touch');
      if (touches.length>=2) {
        if (!gesture) takeover();
        if (!gesture) begin('pinch',pair()); else { gesture.kind='pinch';gesture.last=pair(); }
        for (const id of pointers.keys()) capture(id);
        own(event); return;
      }
      let tool=options.getTool();
      if (event.button===1) tool=event.ctrlKey||event.metaKey?'zoom':event.shiftKey?'pan':'orbit';
      else if (event.button===2) tool=event.ctrlKey||event.metaKey?'zoom':'pan';
      else if (event.altKey) tool=event.ctrlKey||event.metaKey?'zoom':event.shiftKey?'pan':'orbit';
      if (tool==='edit' && options.isEditingHit(event)) { firstEdit=options.captureEdit(); return; }
      if (tool==='edit') tool='orbit';
      begin(tool,point(event)); capture(event.pointerId); own(event);
    }
    function move(event) {
      if (!pointers.has(event.pointerId)) return;
      const previous=pointers.get(event.pointerId);pointers.set(event.pointerId,point(event));
      if (drain) { own(event);return; }
      if (!gesture) return;
      own(event);
      if (gesture.suspended) return;
      if (gesture.kind==='pinch') {
        const next=pair(); if (!next) return;
        zoom(gesture.last.span/next.span);pan(next.x-gesture.last.x,next.y-gesture.last.y);gesture.last=next;
      } else {
        const dx=event.clientX-previous.x,dy=event.clientY-previous.y;
        if (gesture.kind==='zoom') zoom(Math.exp(dy*.012)); else if (gesture.kind==='pan') pan(dx,dy); else orbit(dx,dy);
        gesture.last=point(event);
      }
    }
    function up(event,cancelled=false) {
      if (!pointers.has(event.pointerId)) return;
      const claimed=!!gesture||drain;
      pointers.delete(event.pointerId);
      if (claimed) own(event);
      if (cancelled && gesture) { finish(true);drain=pointers.size>0; }
      else if (gesture && pointers.size) { gesture.suspended=true;drain=true; }
      if (!pointers.size) { finish(false);firstEdit=null;drain=false; }
      release(event.pointerId);
    }
    function cancel() {
      endWheel(true);finish(true);if(firstEdit)takeover();firstEdit=null;drain=false;
      const ids=[...pointers.keys()];pointers.clear();ids.forEach(release);canvas.style.cursor='';
    }
    function wheelEvent(event) {
      if (!enabled()||!onCanvas(event)) return;
      own(event);if (pointers.size) return;
      if (!wheel) { takeover();wheel={before:options.onBegin()}; }
      const unit=event.deltaMode===1?16:event.deltaMode===2?canvas.clientHeight:1;
      zoom(Math.exp(clamp(event.deltaY*unit,-400,400)*.0018));
      clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>endWheel(),180);
    }
    camera.inputs.clear();
    listen(window,'pointerdown',down);listen(window,'pointermove',move);listen(window,'pointerup',event=>up(event));listen(window,'pointercancel',event=>up(event,true));
    listen(canvas,'lostpointercapture',event=>{if(transferring||canvas.hasPointerCapture(event.pointerId))return;if(pointers.has(event.pointerId)){pointers.delete(event.pointerId);if(!gesture&&firstEdit)takeover();finish(true);drain=pointers.size>0;if(!drain)firstEdit=null;}});
    listen(window,'wheel',wheelEvent);listen(window,'blur',cancel);listen(document,'visibilitychange',()=>{if(document.hidden)cancel();});
    listen(window,'keydown',event=>{if(event.key==='Escape'&&(gesture||wheel)){own(event);cancel();}});
    listen(canvas,'contextmenu',event=>own(event));
    return Object.freeze({cancel,finish:()=>{endWheel();finish();},get active(){return !!gesture||!!wheel;},dispose(){cancel();disposed=true;removers.forEach(remove=>remove());}});
  }
  globalThis.DirectorCameraNavigation=Object.freeze({install});
})();
