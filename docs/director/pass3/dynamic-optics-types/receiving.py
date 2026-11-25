from pathlib import Path
import json,time,hmac,hashlib,base64,traceback
from playwright.sync_api import sync_playwright
root=Path('/workspace/rspdan-portal');out=root/'docs/director/pass3/dynamic-optics-types'
env=json.loads(Path('/workspace/scratch/director-ui-test-env.json').read_text())
payload=json.dumps({'user':'dan','exp':int(time.time()*1000)+3600000},separators=(',',':'))
token=base64.urlsafe_b64encode(payload.encode()).decode().rstrip('=')+'.'+hmac.new(env['PSPT_SECRET'].encode(),payload.encode(),hashlib.sha256).hexdigest()
files={name:(root/'public/director'/name).read_bytes() for name in ['director.js','appearance.js','lighting.js','stage.js','kinematics.js','optics.js']}
r={'scope':'Actual Chromium/softwareWebGL on integrated scene, independent optics controller at the existing geometric head anchor; no live save/send. Source/camera changes and exact fixed-state stability.','hashes':{k:hashlib.sha256(v).hexdigest() for k,v in files.items()},'checks':[],'captures':[],'errors':[]}
def ck(name,ok,detail=None):
 r['checks'].append({'name':name,'passed':bool(ok),'detail':detail});assert ok,name

def inp(page,id,value,event='input'):
 page.locator('#'+id).evaluate('(e,a)=>{if(e.type==="checkbox")e.checked=a.value;else e.value=a.value;e.dispatchEvent(new Event(a.event,{bubbles:true}));if(a.event==="input")e.dispatchEvent(new Event("change",{bubbles:true}));}',{'value':value,'event':event})
def click(page,id):page.locator('#'+id).evaluate('e=>e.click()')
def settle(page):page.evaluate('()=>new Promise(resolve=>{let n=3;const o=directorStudio.scene.onAfterRenderObservable.add(()=>{if(!--n){directorStudio.scene.onAfterRenderObservable.remove(o);resolve()}})})')
def capture(page,name):
 settle(page);page.locator('#room').screenshot(path=str(out/(name+'.png')),scale='css');state=page.evaluate('opticsProbe.inspect()');r['captures'].append({'image':name+'.png','state':state});return state
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 try:
  c=b.new_context(viewport={'width':1440,'height':1000});c.add_cookies([{'name':'pspt_session','value':token,'url':'http://127.0.0.1:5174','sameSite':'Strict'}]);page=c.new_page()
  for name,data in files.items():page.route('**/director/'+name,(lambda body: lambda route: route.fulfill(status=200,content_type='application/javascript',body=body))(data))
  page.route_web_socket('**',lambda ws:None);page.on('pageerror',lambda e:r['errors'].append(str(e)))
  page.goto('http://127.0.0.1:5174/director',wait_until='domcontentloaded');page.wait_for_function('window.directorError || window.directorStudio?.ready',timeout=90000);ck('room ready',not page.evaluate('window.directorError||null'))
  # The independent probe is loaded explicitly if the pinned Astro shell predates its script.
  if not page.evaluate('!!window.DirectorOptics'):page.add_script_tag(content=files['optics.js'].decode())
  page.add_style_tag(content='.stage-top,.stage-bottom,.mode-switcher{visibility:hidden!important}');click(page,'handles');page.select_option('#preset','raised-arm')
  click(page,'mode-lighting');inp(page,'ambient-intensity',.35);page.select_option('#light-select','light-key');inp(page,'light-intensity',1.65);page.select_option('#light-select','light-rim');inp(page,'light-enabled',False,'change')
  click(page,'mode-stage');inp(page,'backdrop-color','#010102');inp(page,'floor-color','#060608')
  click(page,'mode-pose');click(page,'trip');inp(page,'outline-enabled',True,'change');inp(page,'outline-tone',0);inp(page,'trip-glow',.35);inp(page,'trip-flare',1);settle(page);inp(page,'trip-flare',0)
  page.evaluate('''()=>{const B=BABYLON,s=directorStudio.scene,c=s.activeCamera;c.setTarget(new B.Vector3(0,.59,0));c.alpha=Math.PI/2-.35;c.beta=Math.PI/2-.11;c.radius=2.45;c.getViewMatrix(true);window.opticsProbe=DirectorOptics.create(s,s.getTransformNodeByName('Director Trip head flare source'),{name:'Independent optics receiving'});opticsProbe.apply({strength:1,color:[1,1,1],sourceRadius:.03,lens:{preset:'glass'}});scrollTo(0,0)}''')
  for preset in ['glow','starburst','anamorphic','glass']:
   page.evaluate("preset=>opticsProbe.apply({strength:1,color:[1,1,1],sourceRadius:.03,lens:{preset}})",preset)
   state=capture(page,'preset-'+preset);ck('preset '+preset+' is selected and visible',state['visible'] and state['lens']['preset']==preset,state['lens'])
  page.evaluate("opticsProbe.apply({strength:1,color:[1,1,1],sourceRadius:.03,lens:{preset:'glass',glow:.7,streak:.6}})")
  capture(page,'preset-multi-iris-with-glow-streak')
  page.evaluate("opticsProbe.apply({strength:1,color:[1,1,1],sourceRadius:.03,lens:{preset:'glass'}})")
  defaults=page.evaluate("()=>{const a=DirectorOptics.defaults('starburst');a.glow=0;return{fresh:DirectorOptics.defaults('starburst').glow,missing:DirectorOptics.defaults(),unknown:DirectorOptics.defaults('invalid')}}")
  ck('defaults are independent and unknown presets use compact glow',defaults['fresh']==.5 and defaults['missing']==defaults['unknown'],defaults)
  initial=capture(page,'01-initial-head-glass');ck('source visible with streak and bounded ghosts',initial['visible'] and initial['visibility']==1 and len(initial['ghosts'])==3,initial)
  settle(page);stable=page.evaluate('opticsProbe.inspect()');ck('fixed source and camera do not pulse',initial==stable)
  a=page.locator('#room').screenshot(scale='css');settle(page);bPixels=page.locator('#room').screenshot(scale='css');ck('fixed source and camera produce identical pixels',a==bPixels)
  page.evaluate('directorStudio.scene.activeCamera.target.x=.32');moved=capture(page,'02-camera-pan');ck('camera pan moves optical ghost axis',initial['ghosts'][0]['pixel']!=moved['ghosts'][0]['pixel'] and initial['ghosts'][0]['color']!=moved['ghosts'][0]['color'],moved)
  page.evaluate('directorStudio.scene.activeCamera.radius=1.7');close=capture(page,'03-camera-nearer');ck('distance changes apparent streak size',close['streakSize']>moved['streakSize'],close)
  page.evaluate('''()=>{const s=directorStudio.scene,c=s.activeCamera;c.radius=2.45;c.target.x=0;const h=s.getTransformNodeByName('head');window.originalHeadPosition=h.position.clone();h.position.x+=.2;h.computeWorldMatrix(true)}''');shift=capture(page,'04-source-moved');ck('moving source changes response without camera motion',shift['source']!=initial['source'] and shift['ghosts'][1]['pixel']!=initial['ghosts'][1]['pixel'],shift)
  page.evaluate('''()=>{const B=BABYLON,s=directorStudio.scene,h=s.getTransformNodeByName('head');h.position.copyFrom(originalHeadPosition);h.computeWorldMatrix(true);const e=s.getTransformNodeByName('Director Trip head flare source');e.computeWorldMatrix(true);const c=s.activeCamera;c.getViewMatrix(true);window.blocker=B.MeshBuilder.CreateBox('Complete source blocker',{size:.7},s);blocker.position.copyFrom(B.Vector3.Lerp(c.globalPosition,e.getAbsolutePosition(),.5));blocker.computeWorldMatrix(true)}''');blocked=capture(page,'05-occluded');ck('complete nearby occluder hides optics',not blocked['visible'] and blocked['visibility']==0,blocked)
  page.evaluate('blocker.dispose()');settle(page);ck('removing occluder restores optics',page.evaluate('opticsProbe.inspect().visible'))
  partial=page.evaluate('''()=>{const B=BABYLON,s=directorStudio.scene,c=s.activeCamera,e=s.getTransformNodeByName('Director Trip head flare source'),center=B.Vector3.Lerp(c.globalPosition,e.getAbsolutePosition(),.5),right=B.Vector3.TransformNormal(B.Vector3.Right(),c.getViewMatrix().clone().invert()).normalize();window.half=B.MeshBuilder.CreatePlane('Partial source blocker',{width:1,height:1,sideOrientation:B.Mesh.DOUBLESIDE},s);half.position.copyFrom(center.add(right.scale(.5)));half.rotationQuaternion=B.Quaternion.FromRotationMatrix(c.getViewMatrix().clone().invert());half.computeWorldMatrix(true);return true}''');partial=capture(page,'06-partial-occlusion');ck('partial occlusion reduces brightness',0<partial['visibility']<1 and partial['transmission']<initial['transmission'],partial)
  page.evaluate('half.dispose()');page.evaluate('''()=>{const B=BABYLON,s=directorStudio.scene,c=s.activeCamera;window.previousCamera=c;const away=new B.FreeCamera('Reverse optics receiving',c.globalPosition.clone(),s);away.setTarget(c.globalPosition.add(c.globalPosition.subtract(s.getTransformNodeByName('Director Trip head flare source').getAbsolutePosition())));s.activeCamera=away}''');settle(page);ck('behind camera hides optics',not page.evaluate('opticsProbe.inspect().visible'))
  page.evaluate('''()=>{const s=directorStudio.scene,c=s.activeCamera;s.activeCamera=previousCamera;c.dispose();previousCamera.target.x=4}''');settle(page);ck('offscreen source hides optics',not page.evaluate('opticsProbe.inspect().visible'))
  page.evaluate("directorStudio.scene.activeCamera.target.x=0;opticsProbe.apply({strength:1,color:[1,1,1],lens:{preset:'anamorphic',rotation:90,spread:.65}})")
  rotated=capture(page,'07-rotated-anamorphic');ck('rotation and spread retained',rotated['lens']['rotation']==90 and rotated['lens']['spread']==.65 and rotated['lens']['streak']==1,rotated['lens'])
  page.evaluate("opticsProbe.apply({strength:1,color:[1,1,1],lens:{preset:'starburst',rayCount:13,spread:1.4,rotation:22}})")
  radial=capture(page,'08-thirteen-ray-starburst');ck('custom ray count and rotation retained',radial['lens']['rayCount']==13 and radial['lens']['rotation']==22,radial['lens'])
  page.evaluate("opticsProbe.apply({strength:1,color:[1,1,1],lens:{preset:'glass',glow:0,rays:0,streak:0,ghosts:0}})");settle(page);ck('each component can be completely disabled',not page.evaluate('opticsProbe.inspect().visible'))
  page.evaluate("opticsProbe.apply({strength:1,color:[1,1,1],lens:{preset:'glow',glow:2,rays:-1,spread:50,rotation:999,rayCount:3}})");settle(page);bounds=page.evaluate('opticsProbe.inspect().lens');ck('component limits are bounded',bounds['glow']==1 and bounds['rays']==0 and bounds['spread']==2 and bounds['rotation']==180 and bounds['rayCount']==4,bounds)
  page.evaluate('directorStudio.scene.activeCamera.target.x=0;opticsProbe.apply({strength:0,color:[1,1,1]})');settle(page);ck('Off remains off',not page.evaluate('opticsProbe.inspect().visible'))
  lifecycle=page.evaluate('''()=>{opticsProbe.dispose();opticsProbe.dispose();const s=directorStudio.scene,e=s.getTransformNodeByName('Director Trip head flare source'),before=[s.lensFlareSystems.length,s.textures.length,s.onBeforeRenderObservable.observers.length];for(let i=0;i<5;i++){const ctl=DirectorOptics.create(s,e);ctl.apply({strength:1,color:[1,.5,.2]});for(const preset of ['glow','starburst','anamorphic','glass'])ctl.apply({strength:.7,color:[1,1,1],lens:{preset,rotation:27,rayCount:11}});ctl.dispose()}return{before,after:[s.lensFlareSystems.length,s.textures.length,s.onBeforeRenderObservable.observers.length]}}''');ck('repeat create/apply/dispose leaves no resources',lifecycle['before']==lifecycle['after'],lifecycle)
  c.close()
 except Exception:r['exception']=traceback.format_exc();print(r['exception'],flush=True)
 finally:
  b.close();r['passed']=not r.get('exception') and not r['errors'] and all(x['passed'] for x in r['checks']);(out/'receiving.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({'passed':r['passed'],'checks':len(r['checks']),'errors':r['errors']}),flush=True)
assert r['passed']
