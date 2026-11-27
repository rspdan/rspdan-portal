from pathlib import Path
import json,time,hmac,hashlib,base64,traceback
from playwright.sync_api import sync_playwright
root=Path('/workspace/rspdan-portal');out=root/'docs/director/pass3/attached-light-framing'
env=json.loads(Path('/workspace/scratch/director-ui-test-env.json').read_text());payload=json.dumps({'user':'dan','exp':int(time.time()*1000)+3600000},separators=(',',':'));token=base64.urlsafe_b64encode(payload.encode()).decode().rstrip('=')+'.'+hmac.new(env['PSPT_SECRET'].encode(),payload.encode(),hashlib.sha256).hexdigest()
r={'scope':'Local integrated Frame and Frame Motion geometry receiving with actual attached effect meshes. No live save or Crew send.','checks':[],'errors':[]}
def check(name,ok,detail=None):
 r['checks'].append({'name':name,'passed':bool(ok),'detail':detail});assert ok,name
def inputv(page,id,v):
 page.locator('#'+id).evaluate('(e,v)=>{e.value=String(v);e.dispatchEvent(new Event("change",{bubbles:true}));}',v)
def projected(page):
 return page.evaluate('''()=>{const B=BABYLON,s=directorStudio.scene,c=s.activeCamera;s.render();const engine=s.getEngine(),viewport=c.viewport.toGlobal(engine.getRenderWidth(),engine.getRenderHeight()),rect=document.querySelector('#room').getBoundingClientRect();const items=directorStudio.snapshot().lighting.lights,ids=new Set(items.filter(l=>l.enabled&&l.attachment&&l.attachment!=='world').map(l=>l.id));let min=[Infinity,Infinity],max=[-Infinity,-Infinity],count=0;for(const m of s.meshes){if(!m.metadata?.directorLightEffect||!ids.has(m.metadata.directorLightId)||!m.isEnabled()||!m.isVisible||m.visibility<=0)continue;const positions=m.getPositionData(true,true),world=m.computeWorldMatrix(true);for(let i=0;i<positions.length;i+=3){const p=B.Vector3.Project(new B.Vector3(positions[i],positions[i+1],positions[i+2]),world,s.getTransformMatrix(),viewport);min[0]=Math.min(min[0],p.x/engine.getRenderWidth()*rect.width);min[1]=Math.min(min[1],p.y/engine.getRenderHeight()*rect.height);max[0]=Math.max(max[0],p.x/engine.getRenderWidth()*rect.width);max[1]=Math.max(max[1],p.y/engine.getRenderHeight()*rect.height);count++}}return{min,max,count,width:rect.width,height:rect.height,camera:directorStudio.snapshot().camera,pose:directorStudio.snapshot().pose}}''')
def inside(x):return x['count']>0 and min(x['min'])>=0 and x['max'][0]<=x['width'] and x['max'][1]<=x['height']
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 try:
  for mobile in [False,True]:
   c=b.new_context(viewport={'width':390,'height':844} if mobile else {'width':1100,'height':900},is_mobile=mobile,has_touch=mobile,device_scale_factor=3 if mobile else 1);c.add_cookies([{'name':'pspt_session','value':token,'url':'http://127.0.0.1:5174','sameSite':'Strict'}]);page=c.new_page();page.route_web_socket('**',lambda ws:None);page.on('pageerror',lambda e:r['errors'].append(str(e)));page.goto('http://127.0.0.1:5174/director',wait_until='domcontentloaded');page.wait_for_function('window.directorStudio?.ready||window.directorError',timeout=90000);prefix='mobile ' if mobile else 'desktop ';check(prefix+'startup',not page.evaluate('window.directorError||null'))
   click=lambda id:page.locator('#'+id).evaluate('e=>e.click()')
   click('mode-lighting');click('add-left-hand-light');inputv(page,'scene-pos-y',1.1);inputv(page,'scene-pos-z',-.15);inputv(page,'light-effect-radius',.16)
   click('mode-pose');before=page.evaluate('directorStudio.snapshot().pose');click('frame-character');bounds=projected(page);check(prefix+'offset hand ball fully inside Frame',inside(bounds),bounds);check(prefix+'Frame preserves pose',bounds['pose']==before)
   if not mobile:
    original=bounds['camera'];click('mode-lighting');click('add-light');inputv(page,'light-effect-shape','ball');inputv(page,'scene-pos-x',90);inputv(page,'scene-pos-y',80);click('mode-pose');click('frame-character');same=projected(page);check('distant world effect excluded from character Frame',all(abs(a-b)<1e-6 for key in ['position','target'] for a,b in zip(original[key],same['camera'][key])),{'before':original,'after':same['camera']})
   click('mode-lighting');click('add-right-hand-light');inputv(page,'light-effect-shape','beam');inputv(page,'light-effect-length',2);inputv(page,'light-effect-radius',.12);inputv(page,'scene-rot-x',-90);click('mode-pose');click('frame-character');beam=projected(page);check(prefix+'attached beam included in Frame',inside(beam),beam)
   click('load-example');click('frame-motion');motionpose=page.evaluate('directorStudio.snapshot().pose');frames=page.evaluate('directorStudio.snapshot().keyframes.map(k=>k.frame)');samples=[]
   for frame in frames:
    inputv(page,'frame',frame);samples.append(projected(page))
   check(prefix+'Frame Motion includes attached effects at all keys',all(inside(s) for s in samples),[{'min':s['min'],'max':s['max'],'width':s['width'],'height':s['height']} for s in samples])
   page.locator('#room').screenshot(path=str(out/(prefix.strip()+'-framed-motion.png')),scale='css');c.close()
 except Exception:r['exception']=traceback.format_exc();print(r['exception'])
 finally:
  b.close();r['source_sha256']={name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in ['public/director/director.js','public/director/lighting.js']};r['passed']=not r.get('exception') and not r['errors'] and all(x['passed'] for x in r['checks']);(out/'receiving.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({'passed':r['passed'],'checks':len(r['checks']),'errors':r['errors']}))
assert r['passed']
