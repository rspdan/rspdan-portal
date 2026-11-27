"""Independent effects integration receiving. Local saves only; no Crew send."""
from pathlib import Path
from datetime import datetime,timezone
import json,time,hmac,hashlib,base64,traceback,math,io
from PIL import Image,ImageStat,ImageChops
from playwright.sync_api import sync_playwright
ROOT=Path('/workspace/rspdan-portal');OUT=ROOT/'docs/director/pass3/lens-controls-receiving';OUT.mkdir(exist_ok=True)
env=json.loads(Path('/workspace/scratch/director-ui-test-env.json').read_text());payload=json.dumps({'user':'dan','exp':int(time.time()*1000)+7200000},separators=(',',':'))
token=base64.urlsafe_b64encode(payload.encode()).decode().rstrip('=')+'.'+hmac.new(env['PSPT_SECRET'].encode(),payload.encode(),hashlib.sha256).hexdigest()
SOURCES={n:(ROOT/'public/director'/n).read_bytes() for n in ['director.js','appearance.js','lighting.js','stage.js','kinematics.js','direct-manipulation.js','animation.js','optics.js']}
r={'author':'Independent lens controls receiving agent','execution_utc':datetime.now(timezone.utc).isoformat(),'scope':'Actual local Director DOM interactions and live Babylon scene. Desktop and Chromium touch emulation; input-event checks are labeled separately from physical pointer interactions. Local save shared:false only. No physical ACHE, native rendering, or artistic approval claimed.','hashes':{n:hashlib.sha256(v).hexdigest() for n,v in SOURCES.items()},'checks':[],'errors':[],'captures':[],'events':[]}
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
 def open_page(mobile=False,take=None):
  c=b.new_context(viewport={'width':390,'height':844} if mobile else {'width':1440,'height':1000},device_scale_factor=3 if mobile else 1,is_mobile=mobile,has_touch=mobile);c.add_cookies([{'name':'pspt_session','value':token,'url':'http://127.0.0.1:5174','sameSite':'Strict'}]);pg=c.new_page();pg.on('pageerror',lambda e:r['errors'].append(str(e)));pg.route_web_socket('**',lambda ws:None)
  for name,body in SOURCES.items():
   def handler(content):return lambda route:route.fulfill(status=200,content_type='application/javascript',body=content)
   pg.route('**/director/'+name,handler(body))
  pg.goto('http://127.0.0.1:5174/director'+('?take='+take if take else ''),wait_until='domcontentloaded');pg.wait_for_function('window.directorError || window.directorStudio?.ready',timeout=90000);assert not pg.evaluate('window.directorError||null');pg.wait_for_timeout(500);return c,pg
 def material(pg):
  return pg.evaluate("""()=>{const s=directorStudio.scene,m=s.meshes.find(m=>m.metadata?.directorCharacter),spill=s.lights.find(l=>l.metadata?.directorAppearanceLight);return{albedo:m.material.albedoColor.asArray(),emission:m.material.emissiveColor.asArray(),spill:spill?.diffuse.asArray(),outline:m.renderOutline,look:directorStudio.snapshot().look};}""")
 def canvas(pg,name):
  pg.wait_for_timeout(500);raw=pg.locator('#room').evaluate('c=>c.toDataURL("image/png")');data=base64.b64decode(raw.split(',')[1]);(OUT/(name+'.png')).write_bytes(data);im=Image.open(io.BytesIO(data)).convert('RGB');r['captures'].append({'name':name+'.png','png_sha256':hashlib.sha256(data).hexdigest(),'size':im.size});write();return im
 def white(pg,label):
  pg.wait_for_timeout(450);raw=pg.locator('#room').evaluate('c=>c.toDataURL("image/png")');im=Image.open(io.BytesIO(base64.b64decode(raw.split(',')[1]))).convert('RGB');point=pg.evaluate("""()=>{const B=BABYLON,s=directorStudio.scene,e=s.getEngine(),n=s.getTransformNodeByName('shin.R'),v=B.Vector3.TransformCoordinates(new B.Vector3(0,.18474,0),n.computeWorldMatrix(true)),q=B.Vector3.Project(v,B.Matrix.Identity(),s.getTransformMatrix(),new B.Viewport(0,0,e.getRenderWidth(),e.getRenderHeight()));return[q.x,q.y];}""");x,y=map(round,point);median=ImageStat.Stat(im.crop((x-3,y-3,x+4,y+4))).median;ck(label,min(median)>145,{'pixel':point,'median_RGB':median,'appearance':material(pg)})
 def optics(pg):
  return pg.evaluate("""()=>directorStudio.scene.lensFlareSystems.map(f=>({name:f.name,enabled:f.isEnabled,emitter:f._emitter.name,parent:f._emitter.parent?.name,grandparent:f._emitter.parent?.parent?.name,source:f.getEmitterPosition().asArray(),parts:f.lensFlares.map(x=>({texture:x.texture?.name,color:x.color.asArray(),size:x.size,position:x.position}))}))""")
 def setup(pg,mobile=False):
  button(pg,'#trip',mobile);button(pg,'#mode-stage',mobile);input_event(pg,'#backdrop-color','#020205');input_event(pg,'#floor-color','#111118');button(pg,'#mode-pose',mobile);select(pg,'#preset','raised-arm');input_event(pg,'#trip-body-linked',False,True);input_event(pg,'#trip-body-temperature',6500);input_event(pg,'#trip-glow',.6);input_event(pg,'#trip-temperature',3000);input_event(pg,'#trip-flare',0);button(pg,'#handles',mobile);button(pg,'#frame-character',mobile);return snap(pg)
 try:
  c,page=open_page(False,'dir_afe8ff95-f918-4c4e-bca8-9592dc421e38');response=page.request.get('http://127.0.0.1:5174/api/director?id=dir_afe8ff95-f918-4c4e-bca8-9592dc421e38');old=response.json();record=old.get('saved',old.get('record',old));oldTake=record.get('take',old.get('take'));ck('old stored take still omits new optional fields',response.status==200 and 'tripLens' not in oldTake and 'tripBodyTemperature' not in oldTake and all('lens' not in l for l in oldTake['lighting']['lights']));current=snap(page);ck('old reopen preserves linked body and omitted lens snapshots','tripBodyTemperature' not in current and 'tripLens' not in current and all('lens' not in l for l in current['lighting']['lights']) and page.locator('#trip-body-linked').is_checked());c.close()
  c,page=open_page();setup(page);ck('fresh default head flare remains Off',snap(page)['tripFlare']==0 and not any(o['enabled'] for o in optics(page)))
  samples=[]
  for k in [1800,3000,4500,6500,8500]:
   input_event(page,'#trip-temperature',k);m=material(page);samples.append({'temperature':k,**m});ck('neutral body independent from external '+str(k)+' K',near(m['albedo'],[1,1,1]) and len(set(round(x,7) for x in m['emission']))==1 and snap(page)['tripBodyTemperature']==6500)
  r['temperature_samples']=samples;ck('external spill actually changes hue',not near(samples[0]['spill'],samples[-1]['spill']))
  input_event(page,'#trip-temperature',3000);input_event(page,'#trip-body-linked',True,True);linked=material(page);ck('link body omits optional override and applies warm tint','tripBodyTemperature' not in snap(page) and linked['albedo'][0]>linked['albedo'][2]);button(page,'#undo');ck('Undo restores independent neutral body',snap(page).get('tripBodyTemperature')==6500 and near(material(page)['albedo'],[1,1,1]));button(page,'#redo');ck('Redo restores linked omission','tripBodyTemperature' not in snap(page));input_event(page,'#trip-body-linked',False,True);input_event(page,'#trip-temperature',6500);input_event(page,'#trip-flare',.85)
  beforePose=snap(page)['pose'];images={};r['desktop_lens_states']={}
  for preset in ['glow','starburst','anamorphic','glass']:
   select(page,'#trip-lens-style',preset);image=canvas(page,'desktop-'+preset);images[preset]=image;state=snap(page);ck('desktop '+preset+' preset uses matching independent component defaults',state['tripLens']==page.evaluate('p=>DirectorOptics.defaults(p)',preset) and near(state['pose'],beforePose));r['desktop_lens_states'][preset]={'lens':state['tripLens'],'optics':optics(page)}
  deltas={}
  names=list(images)
  for i,a in enumerate(names):
   for bname in names[i+1:]:deltas[a+' vs '+bname]=max(ImageStat.Stat(ImageChops.difference(images[a],images[bname])).mean)
  ck('all four desktop types produce distinct actual pixels',all(v>.002 for v in deltas.values()),deltas)
  select(page,'#trip-lens-style','starburst');states=[snap(page)['tripLens']]
  for sel,value in [('#trip-lens-ray-count',12),('#trip-lens-rotation',37),('#trip-lens-spread',1.5)]:input_event(page,sel,value);states.append(snap(page)['tripLens'])
  for i in [2,1,0]:button(page,'#undo');ck('Undo lens component state '+str(i),near(snap(page)['tripLens'],states[i]))
  for i in [1,2,3]:button(page,'#redo');ck('Redo lens component state '+str(i),near(snap(page)['tripLens'],states[i]))
  savedTrip=snap(page)['tripLens'];button(page,'#mode-lighting');button(page,'#add-left-hand-light');left=snap(page)['lighting']['lights'][-1]['id'];select(page,'#light-lens-style','glass');input_event(page,'#light-flare',.6);input_event(page,'#light-lens-ghosts',.7);leftLens=next(l for l in snap(page)['lighting']['lights'] if l['id']==left)['lens'];button(page,'#add-right-hand-light');right=snap(page)['lighting']['lights'][-1]['id'];select(page,'#light-lens-style','anamorphic');input_event(page,'#light-flare',.4);input_event(page,'#light-lens-streak',.55);state=snap(page);ck('hand lens configs independent from each other and Trip',near(state['tripLens'],savedTrip) and near(next(l for l in state['lighting']['lights'] if l['id']==left)['lens'],leftLens) and next(l for l in state['lighting']['lights'] if l['id']==right)['lens']['preset']=='anamorphic');obs=observe(page);ck('new lens controls keep both actual hand endpoints attached',all(dist(l['position'],l['tip'])<1e-6 for l in obs['lights'] if l['id'] in [left,right]));head=next(o for o in optics(page) if o['emitter']=='Director Trip head flare source');ck('Trip lens source remains parented to head',head['parent']=='head');button(page,'#mode-pose');button(page,'#handles');white(page,'neutral Trip stays white with handles and new lens controls');take,sent=save(page,'Independent lens styles and neutral body receiving');r['saved_take']={'id':take,'shared':False};c.close()
  c,page=open_page(True,take);restored=snap(page);ck('fresh mobile reopen preserves new lens/body fields',all(near(restored[k],sent[k]) for k in ['tripLens','tripBodyTemperature','tripTemperature','tripFlare','lighting','pose']));white(page,'fresh mobile lens take preserves white Trip with controls');button(page,'#handles',True);button(page,'#mode-lighting',True)
  for id in [left,right]:select(page,'#light-select',id);input_event(page,'#light-flare',0)
  button(page,'#mode-pose',True);mobileImages={}
  for preset in ['glow','starburst','anamorphic','glass']:
   select(page,'#trip-lens-style',preset);mobileImages[preset]=canvas(page,'mobile-'+preset);ck('mobile '+preset+' preset state',snap(page)['tripLens']['preset']==preset)
  mdeltas={};names=list(mobileImages)
  for i,a in enumerate(names):
   for bname in names[i+1:]:mdeltas[a+' vs '+bname]=max(ImageStat.Stat(ImageChops.difference(mobileImages[a],mobileImages[bname])).mean)
  ck('all four mobile types produce distinct actual pixels',all(v>.002 for v in mdeltas.values()),mdeltas);select(page,'#trip-lens-style','starburst');before=snap(page)['tripLens']['rays'];actual=touch_slider(page,'#trip-lens-rays',.35);ck('actual mobile touch changes lens rays',abs(actual-before)>.1 and abs(snap(page)['tripLens']['rays']-actual)<1e-8,{'before':before,'actual':actual});button(page,'#undo',True);ck('mobile Undo restores lens ray strength',snap(page)['tripLens']['rays']==before);button(page,'#redo',True);ck('mobile Redo restores touched lens ray strength',snap(page)['tripLens']['rays']==actual);button(page,'#handles',True);white(page,'mobile component Undo Redo does not blacken Trip');page.evaluate('scrollTo(0,0)');page.screenshot(path=str(OUT/'mobile-component-controls.png'));ck('no JavaScript page errors',not r['errors'],r['errors']);r['passed']=True;c.close()
 except Exception:r['passed']=False;r['exception']=traceback.format_exc();print(r['exception'],flush=True)
 finally:b.close();write();print(json.dumps({'passed':r.get('passed'),'checks':len(r['checks']),'errors':r['errors']}),flush=True)
if not r.get('passed'):raise SystemExit(1)
