"""Independent effects integration receiving. Local saves only; no Crew send."""
from pathlib import Path
from datetime import datetime,timezone
import json,time,hmac,hashlib,base64,traceback,math,io
from PIL import Image,ImageStat,ImageChops
from playwright.sync_api import sync_playwright
ROOT=Path('/workspace/rspdan-portal');OUT=ROOT/'docs/director/pass3/effects-receiving';OUT.mkdir(exist_ok=True)
env=json.loads(Path('/workspace/scratch/director-ui-test-env.json').read_text());payload=json.dumps({'user':'dan','exp':int(time.time()*1000)+7200000},separators=(',',':'))
token=base64.urlsafe_b64encode(payload.encode()).decode().rstrip('=')+'.'+hmac.new(env['PSPT_SECRET'].encode(),payload.encode(),hashlib.sha256).hexdigest()
SOURCES={n:(ROOT/'public/director'/n).read_bytes() for n in ['director.js','appearance.js','lighting.js','stage.js','kinematics.js','direct-manipulation.js','animation.js']}
r={'author':'Independent effects receiving agent','execution_utc':datetime.now(timezone.utc).isoformat(),'scope':'Actual local Director DOM interactions and live Babylon scene. Desktop and Chromium touch emulation; input-event checks are labeled separately from physical pointer interactions. Local save shared:false only. No physical ACHE, native rendering, or artistic approval claimed.','hashes':{n:hashlib.sha256(v).hexdigest() for n,v in SOURCES.items()},'checks':[],'errors':[],'captures':[],'events':[]}
def write(): (OUT/'receiving.json').write_text(json.dumps(r,indent=2)+'\n')
def ck(name,ok,detail=None):
 r['checks'].append({'name':name,'passed':bool(ok),'detail':detail});write();print(name,bool(ok),flush=True)
 if not ok:raise AssertionError(name)
def near(a,b,tol=1e-6):
 if isinstance(a,dict):return set(a)==set(b) and all(near(a[k],b[k],tol) for k in a)
 if isinstance(a,list):return len(a)==len(b) and all(near(x,y,tol) for x,y in zip(a,b))
 if isinstance(a,(int,float)):return isinstance(b,(int,float)) and abs(a-b)<=tol
 return a==b
def dist(a,b):return math.sqrt(sum((x-y)**2 for x,y in zip(a,b)))
def expand(page,sel):
 for d in page.locator(sel).locator('xpath=ancestor::details').all():
  if d.get_attribute('open') is None:d.locator(':scope > summary').click()
def button(page,sel,mobile=False):
 expand(page,sel);loc=page.locator(sel);loc.evaluate('e=>e.scrollIntoView({block:"center"})');page.wait_for_timeout(80)
 if mobile:loc.tap()
 else:loc.click()
 page.wait_for_timeout(80)
def input_event(page,sel,value,change_only=False):
 expand(page,sel)
 page.locator(sel).evaluate('''(e,a)=>{e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));if(e.type==='checkbox')e.checked=a.v;else e.value=a.v;if(!a.change)e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));e.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));}''',{'v':value,'change':change_only});page.wait_for_timeout(80)
def select(page,sel,value):expand(page,sel);page.select_option(sel,value);page.wait_for_timeout(80)
def snap(page):return page.evaluate('directorStudio.snapshot()')
def observe(page):
 return page.evaluate('''()=>{const B=BABYLON,s=directorStudio.scene,t=directorStudio.snapshot();return {lights:t.lighting.lights.map(l=>{const node=s.transformNodes.find(n=>n.metadata?.directorLightId===l.id);node.computeWorldMatrix(true);const anchor=node.parent,hand=l.attachment?.startsWith('hand.')?s.getTransformNodeByName('lower_arm.'+l.attachment.slice(-1)):null;let tip=null;if(hand)tip=B.Vector3.TransformCoordinates(new B.Vector3(0,l.attachment==='hand.L'?.2222248911857605:.22601574659347534,0),hand.computeWorldMatrix(true));const light=s.lights.find(x=>x.metadata?.directorLightId===l.id);return {id:l.id,attachment:l.attachment||'world',position:node.getAbsolutePosition().asArray(),local:node.position.asArray(),rotation:(node.rotationQuaternion?node.rotationQuaternion.toEulerAngles():node.rotation).asArray(),parent:anchor?.name||null,tip:tip?.asArray(),light:{type:light.getClassName(),enabled:light.isEnabled(),intensity:light.intensity,color:light.diffuse.asArray()},effects:s.meshes.filter(m=>m.metadata?.directorLightEffect&&m.metadata.directorLightId===l.id).map(m=>({name:m.name,enabled:m.isEnabled(),world:m.getAbsolutePosition().asArray(),pickable:m.isPickable}))};}),flare:s.lensFlareSystems.map(f=>({enabled:f.isEnabled,position:f.getEmitterPosition().asArray(),parent:f._emitter?.parent?.name||null,local:f._emitter?.position.asArray(),parentPosition:f._emitter?.parent?.position.asArray()})),snapshot:t};}''')
def save(page,name):
 page.locator('#take-name').fill(name);page.locator('#take-name').press('Tab')
 with page.expect_response(lambda x:'/api/director' in x.url and x.request.method=='POST') as resp:button(page,'#save')
 response=resp.value;data=response.json();ck('local save HTTP200 shared:false',response.status==200 and data.get('shared') is False,{'status':response.status,'shared':data.get('shared')});return data['saved']['id'],response.request.post_data_json['take']
def capture(page,name):
 page.evaluate('scrollTo(0,0)');page.screenshot(path=str(OUT/(name+'.png')));page.locator('#room').screenshot(path=str(OUT/(name+'-canvas.png')),scale='css');r['captures'].append(name+'.png');write()
def touch_slider(page,selector,target):
 expand(page,selector);loc=page.locator(selector);loc.evaluate('e=>e.scrollIntoView({block:"center"})');page.wait_for_timeout(150);box=loc.bounding_box();lo=float(loc.get_attribute('min'));hi=float(loc.get_attribute('max'));old=float(loc.input_value());x0=box['x']+8+(box['width']-16)*(old-lo)/(hi-lo);x1=box['x']+8+(box['width']-16)*(target-lo)/(hi-lo);y=box['y']+box['height']/2;cdp=page.context.new_cdp_session(page)
 cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x0,'y':y,'id':4}]})
 for i in range(1,9):cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x0+(x1-x0)*i/8,'y':y,'id':4}]});page.wait_for_timeout(30)
 cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(100);actual=float(loc.input_value());r['events'].append({'type':'actual CDP touch range drag','selector':selector,'before':old,'target':target,'actual':actual});return actual

with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 results=[]
 try:
  for mobile in [False,True]:
   c=b.new_context(viewport={'width':390,'height':844} if mobile else {'width':1440,'height':1000},device_scale_factor=3 if mobile else 1,is_mobile=mobile,has_touch=mobile);c.add_cookies([{'name':'pspt_session','value':token,'url':'http://127.0.0.1:5174','sameSite':'Strict'}]);pg=c.new_page();errors=[];pg.on('console',lambda msg:errors.append(msg.text) if msg.type=='error' else None);pg.on('pageerror',lambda e:errors.append(str(e)));pg.route_web_socket('**',lambda ws:None)
   for name,body in SOURCES.items():
    def handler(content):return lambda route:route.fulfill(status=200,content_type='application/javascript',body=content)
    pg.route('**/director/'+name,handler(body))
   pg.goto('http://127.0.0.1:5174/director?take=dir_0cf546e9-ff53-4ca9-be17-a71058febbef',wait_until='domcontentloaded');pg.wait_for_function('window.directorError || window.directorStudio?.ready',timeout=90000);pg.wait_for_timeout(1200)
   def stage(name):
    record=pg.evaluate("""()=>{const s=directorStudio.scene,t=directorStudio.snapshot();return {takeLook:t.look,glow:t.tripGlow,outline:t.outline,bodies:s.meshes.filter(m=>m.metadata?.directorCharacter).map(m=>({name:m.name,material:m.material.name,albedo:m.material.albedoColor?.asArray(),emission:m.material.emissiveColor?.asArray(),ready:m.material.isReady(m),outline:m.renderOutline,outlineColor:m.outlineColor.asArray()})),layers:s.effectLayers.map(l=>({enabled:l.isEnabled,name:l.name})),stencil:s.getEngine().getStencilBuffer(),depth:s.getEngine().getDepthBuffer(),depthWrite:s.getEngine().getDepthWrite()};}""")
    pg.evaluate('scrollTo(0,0)');pg.locator('#room').screenshot(path=str(OUT/(('mobile' if mobile else 'desktop')+'-black-probe-'+name+'.png')),scale='css');results.append({'mobile':mobile,'stage':name,'observation':record,'console_errors':list(errors)});(OUT/'black-render-probe.json').write_text(json.dumps(results,indent=2)+'\n');print(mobile,name,record,flush=True)
   stage('reopen')
   button(pg,'#mode-lighting',mobile);select(pg,'#light-select',next(x['id'] for x in snap(pg)['lighting']['lights'] if x.get('attachment')=='hand.R' and x.get('effect',{}).get('shape')=='beam'));input_event(pg,'#light-effect-strength',.82);button(pg,'#undo',mobile);button(pg,'#redo',mobile);button(pg,'#mode-pose',mobile);pg.wait_for_timeout(600);stage('undo-redo')
   input_event(pg,'#outline-enabled',False,True);pg.wait_for_timeout(500);stage('outline-off')
   input_event(pg,'#outline-enabled',True,True);input_event(pg,'#trip-glow',0);pg.wait_for_timeout(500);stage('glow-off')
   c.close()
 finally:b.close()
