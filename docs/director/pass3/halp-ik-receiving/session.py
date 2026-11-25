"""Halp's local-only, actual-UI receiving session. No production state mutation."""
from pathlib import Path
from datetime import datetime,timezone
import json,time,hmac,hashlib,base64,math,io,uuid
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw
ROOT=Path('/workspace/rspdan-portal');OUT=ROOT/'docs/director/pass3/halp-ik-receiving'
config=json.loads(Path('/workspace/scratch/director-ui-test-env.json').read_text())
payload=json.dumps({'user':'dan','exp':int(time.time()*1000)+7200000},separators=(',',':'))
token=base64.urlsafe_b64encode(payload.encode()).decode().rstrip('=')+'.'+hmac.new(config['PSPT_SECRET'].encode(),payload.encode(),hashlib.sha256).hexdigest()
receipt={'author':'Halp','execution_started_utc':datetime.now(timezone.utc).isoformat(),'source_stamp_raw':'DPS112426 7:16pm','scope':'Independent actual local desktop and emulated touch UI; sandbox saves only; no Crew send; no native parity or physical-device claim.','checks':{},'metrics':{},'errors':[],'events':[]}
def write(): (OUT/'receiving.json').write_text(json.dumps(receipt,indent=2)+'\n')
def event(action,detail=None): receipt['events'].append({'execution_utc':datetime.now(timezone.utc).isoformat(),'action':action,'detail':detail});write()
def check(name,passed,detail=None):
 receipt['checks'][name]=bool(passed)
 if detail is not None:receipt['metrics'][name]=detail
 write();print(name, bool(passed),flush=True)
def delta(a,b):
 if isinstance(a,dict):return max((delta(a[k],b[k]) for k in a),default=0) if set(a)==set(b) else float('inf')
 if isinstance(a,list):return max((delta(x,y) for x,y in zip(a,b)),default=0) if len(a)==len(b) else float('inf')
 if isinstance(a,(int,float)):return abs(a-b)
 return 0 if a==b else float('inf')
playwright=sync_playwright().start();browser=playwright.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
def open_context(mobile=False,take_id=None):
 global context,page,cdp,is_mobile
 is_mobile=mobile
 context=browser.new_context(viewport={'width':390 if mobile else 1440,'height':844 if mobile else 1000},device_scale_factor=3 if mobile else 1,is_mobile=mobile,has_touch=mobile)
 context.add_cookies([{'name':'pspt_session','value':token,'url':'http://127.0.0.1:5174','sameSite':'Strict'}])
 page=context.new_page();page.on('pageerror',lambda e:receipt['errors'].append(str(e)));cdp=context.new_cdp_session(page)
 page.goto('http://127.0.0.1:5174/director'+('?take='+take_id if take_id else ''),wait_until='domcontentloaded');ready()
 event('Opened independent mobile context' if mobile else 'Opened independent desktop context',{'take_id':take_id,'source_hashes':{str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in [ROOT/'public/director'/n for n in ['director.js','appearance.js','lighting.js','stage.js','animation.js','kinematics.js','direct-manipulation.js']]}})
def ready():
 page.wait_for_function('window.directorError || window.directorStudio?.ready',timeout=90000);assert not page.evaluate('window.directorError||null');page.wait_for_timeout(250)
def snap():return page.evaluate('directorStudio.snapshot()')
def field(selector,value):page.locator(selector).fill(str(value));page.locator(selector).press('Tab');page.wait_for_timeout(100)
def touch(x,y):
 cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'radiusX':5,'radiusY':5,'force':1,'id':1}]});page.wait_for_timeout(70);cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(130)
def click(selector):
 loc=page.locator(selector);loc.scroll_into_view_if_needed()
 if is_mobile:
  r=loc.bounding_box();touch(r['x']+r['width']/2,r['y']+r['height']/2)
 else:loc.click();page.wait_for_timeout(100)
def slider(selector,value):
 loc=page.locator(selector);loc.scroll_into_view_if_needed();r=loc.bounding_box();low=float(loc.get_attribute('min'));high=float(loc.get_attribute('max'));old=float(loc.input_value());x0=r['x']+8+(r['width']-16)*(old-low)/(high-low);x1=r['x']+8+(r['width']-16)*(value-low)/(high-low);y=r['y']+r['height']/2
 if is_mobile:
  cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x0,'y':y,'radiusX':4,'radiusY':4,'force':1,'id':3}]})
  for i in range(1,9):cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x0+(x1-x0)*i/8,'y':y,'radiusX':4,'radiusY':4,'force':1,'id':3}]});page.wait_for_timeout(20)
  cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
 else:page.mouse.move(x0,y);page.mouse.down();page.mouse.move(x1,y,steps=8);page.mouse.up()
 page.wait_for_timeout(150);event('Actual touch range drag' if is_mobile else 'Actual mouse range drag',{'selector':selector,'before':old,'requested':value,'actual':loc.input_value()})
def capture(name):
 page.screenshot(path=str(OUT/(name+'.png')),full_page=True)
 raw=page.locator('#room').evaluate('c=>c.toDataURL("image/png")');(OUT/(name+'-canvas.png')).write_bytes(base64.b64decode(raw.split(',',1)[1]))
 (OUT/(name+'.json')).write_text(json.dumps({'execution_utc':datetime.now(timezone.utc).isoformat(),'status':page.locator('#status').inner_text(),'take':snap()},indent=2)+'\n');event('Actual UI and canvas capture',name)
def colors(name):
 im=Image.open(OUT/(name+'-canvas.png')).convert('RGB');p=list(im.getdata());return {'magenta':sum(r>180 and b>180 and g<90 for r,g,b in p),'cyan':sum(g>180 and b>180 and r<90 for r,g,b in p),'pixels':len(p)}
def save_local(name):
 field('#take-name',name)
 with page.expect_response(lambda r:'/api/director' in r.url and r.request.method=='POST') as response:click('#save')
 result=response.value.json();assert response.value.status==200,result;assert result['shared'] is False,result
 sent=response.value.request.post_data_json['take'];take_id=result['saved']['id'];(OUT/(take_id+'.json')).write_text(json.dumps({'response':result,'take':sent},indent=2)+'\n');event('Saved through UI to local sandbox only',{'id':take_id,'shared':False});return take_id,sent
def reopen(take_id):page.goto('http://127.0.0.1:5174/director?take='+take_id,wait_until='domcontentloaded');ready()
print('HALP_RECEIVING_PREPARED',flush=True)
def expand_for(selector):
 for detail in page.locator(selector).locator('xpath=ancestor::details').all():
  if detail.get_attribute('open') is None:click_detail=detail.locator(':scope > summary');click_detail.click();page.wait_for_timeout(80)
def compare_saved(label,sent):
 current=snap();fixed=['asset','name','notes','look','fps','frame','range','keyframes','animation','output','tripGlow','tripTemperature','outline','lighting','stage']
 check(label+'_fields_survive_reopen',all(delta(sent[k],current[k])<1e-6 for k in fixed),{k:delta(sent[k],current[k]) for k in fixed})
 check(label+'_pose_survives_reopen',delta(sent['pose'],current['pose'])<1e-6,delta(sent['pose'],current['pose']))
def centered_click(selector):
 """Verified touch target for controls near sticky mobile chrome."""
 loc=page.locator(selector);loc.evaluate('(e)=>e.scrollIntoView({block:"center"})');page.wait_for_timeout(300)
 r=loc.bounding_box();x=r['x']+r['width']/2;y=r['y']+r['height']/2
 hit=page.evaluate('([x,y])=>{const e=document.elementFromPoint(x,y);return e?{id:e.id,tag:e.tagName,text:e.textContent.slice(0,70)}:null}',[x,y])
 event('Centered actual touch target',{'selector':selector,'x':x,'y':y,'hit':hit});touch(x,y)

def observation():
 return page.evaluate('''()=>{const B=BABYLON,s=directorStudio.scene,m=directorStudio.manifest;
 const names=m.bones, nodes=Object.fromEntries(names.map(n=>[n,s.getTransformNodeByName(n)]));
 const definitions={'hand.L':['upper_arm.L','lower_arm.L',.2222248911857605],'hand.R':['upper_arm.R','lower_arm.R',.22601574659347534],'foot.L':['thigh.L','shin.L',.36943960189819336],'foot.R':['thigh.R','shin.R',.3694828748703003]};
 return {pose:directorStudio.snapshot().pose,points:Object.fromEntries(Object.entries(definitions).map(([id,[u,l,len]])=>{const a=nodes[u],b=nodes[l];a.computeWorldMatrix(true);b.computeWorldMatrix(true);const end=B.Vector3.TransformCoordinates(new B.Vector3(0,len,0),b.getWorldMatrix());return[id,{upper:a.getAbsolutePosition().asArray(),joint:b.getAbsolutePosition().asArray(),end:end.asArray(),lengths:[B.Vector3.Distance(a.getAbsolutePosition(),b.getAbsolutePosition()),B.Vector3.Distance(b.getAbsolutePosition(),end)]}]}))};}''')
def project_marker(name):
 page.locator('#room').evaluate('(e)=>e.scrollIntoView({block:"start"})');page.wait_for_timeout(250)
 return page.evaluate('''name=>{const B=BABYLON,s=directorStudio.scene,c=document.querySelector('#room').getBoundingClientRect();s.activeCamera.getViewMatrix(true);s.updateTransformMatrix();const h=s.meshes.find(m=>m.metadata?.joint===name&&m.isEnabled());if(!h)throw Error('No enabled marker '+name);h.computeWorldMatrix(true);const p=B.Vector3.Project(h.getAbsolutePosition(),B.Matrix.Identity(),s.getTransformMatrix(),new B.Viewport(0,0,c.width,c.height));const x=c.left+p.x,y=c.top+p.y,hit=document.elementFromPoint(x,y);return{x,y,z:p.z,hit:hit?.id,rect:{x:c.x,y:c.y,width:c.width,height:c.height}};}''',name)
def hold_drag(name,dx,dy,cancel=False):
 p=project_marker(name);assert p['hit']=='room',p
 cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':p['x'],'y':p['y'],'id':7}]});page.wait_for_timeout(470)
 started=page.locator('#hint').inner_text()
 for i in range(1,9):
  cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':p['x']+dx*i/8,'y':p['y']+dy*i/8,'id':7}]});page.wait_for_timeout(55)
 during=observation();cdp.send('Input.dispatchTouchEvent',{'type':'touchCancel' if cancel else 'touchEnd','touchPoints':[]});page.wait_for_timeout(250)
 event('Actual mobile hold-drag'+(' then pointer cancellation' if cancel else ''),{'id':name,'projected_start':p,'dx':dx,'dy':dy,'hold_ms':470,'hint_after_hold':started,'during':during});return during

def dist(a,b):return math.sqrt(sum((x-y)**2 for x,y in zip(a,b)))
def feet_error(a,b):return max(dist(a['points'][f]['end'],b['points'][f]['end']) for f in ['foot.L','foot.R'])
def limb_offsets_match(a,b,ids):
 return max(delta(a['pose']['bones'][n][k],b['pose']['bones'][n][k]) for n in ids for k in ['position','scale'])
def centered_slider(selector,value):
 page.locator(selector).evaluate('(e)=>e.scrollIntoView({block:"center"})');page.wait_for_timeout(300);slider(selector,value)
