"""Halp's local-only, actual-UI receiving session. No production state mutation."""
from pathlib import Path
from datetime import datetime,timezone
import json,time,hmac,hashlib,base64,math,io,uuid
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw
ROOT=Path('/workspace/rspdan-portal');OUT=ROOT/'docs/director/pass3/next-update-receiving'
config=json.loads(Path('/workspace/scratch/director-ui-test-env.json').read_text())
payload=json.dumps({'user':'dan','exp':int(time.time()*1000)+7200000},separators=(',',':'))
token=base64.urlsafe_b64encode(payload.encode()).decode().rstrip('=')+'.'+hmac.new(config['PSPT_SECRET'].encode(),payload.encode(),hashlib.sha256).hexdigest()
receipt={'author':'Halp','execution_started_utc':datetime.now(timezone.utc).isoformat(),'source_stamp_raw':'DPS112426 7:16pm','scope':'Independent actual local desktop and emulated touch UI; sandbox saves only; no Crew send; no native parity or physical-device claim.','checks':{},'metrics':{},'errors':[],'events':[]}
fixture=Image.new('RGB',(320,200));draw=ImageDraw.Draw(fixture);draw.rectangle((0,0,159,199),fill=(255,0,255));draw.rectangle((160,0,319,199),fill=(0,255,255));draw.rectangle((0,0,319,12),fill=(0,0,0));draw.rectangle((0,187,319,199),fill=(255,255,0));fixture.save(OUT/'backdrop-fixture.png')
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
 event('Opened independent mobile context' if mobile else 'Opened independent desktop context',{'take_id':take_id,'source_hashes':{str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in [ROOT/'public/director'/n for n in ['director.js','appearance.js','lighting.js','stage.js','animation.js']]}})
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
def desktop_scenario():
 global desktop_id,desktop_sent,desktop_light,desktop_object
 open_context();capture('01-desktop-arrival')
 check('desktop_mode_tabs_present',all(page.locator('#mode-'+m).is_visible() for m in ['pose','lighting','stage']))
 click('#trip');expand_for('#trip-glow');slider('#trip-glow',.42);slider('#trip-temperature',2700);slider('#outline-tone',.55);slider('#outline-width',.0045)
 appearance=snap();slider('#trip-temperature',8000);changed=snap();click('#undo');check('desktop_temperature_undo',snap()['tripTemperature']==appearance['tripTemperature']);click('#redo');check('desktop_temperature_redo',snap()['tripTemperature']==changed['tripTemperature']);click('#undo')
 click('#ouch');ouch=snap();check('desktop_ouch_preserves_trip_controls',all(ouch[k]==appearance[k] for k in ['tripGlow','tripTemperature','outline']));capture('02-desktop-ouch-preserved')
 click('#trip');check('desktop_trip_restores_controls',all(snap()[k]==appearance[k] for k in ['tripGlow','tripTemperature','outline']))
 click('#mode-lighting');page.select_option('#light-type','spot');click('#add-light');desktop_light=page.locator('#light-select').input_value();field('#light-name','Halp warm side light');field('#scene-pos-x',1.35);field('#scene-pos-y',1.4);field('#scene-pos-z',2.1);field('#scene-rot-y',35);field('#scene-rot-z',-12)
 before_intensity=snap();slider('#light-intensity',3.5);light_state=snap();target=next(l for l in light_state['lighting']['lights'] if l['id']==desktop_light)
 check('desktop_light_ui_transform',delta(target['position'],[1.35,1.4,2.1])<1e-6 and abs(target['rotation'][1]-math.radians(35))<1e-5 and target['intensity']>3, target)
 capture('03-desktop-light-edited');click('#mode-stage');click('#undo');check('desktop_shared_undo_from_stage_restores_light',delta(snap()['lighting'],before_intensity['lighting'])<1e-6);click('#redo');check('desktop_shared_redo_from_stage_restores_light',delta(snap()['lighting'],light_state['lighting'])<1e-6)
 expand_for('#stage-type');page.select_option('#stage-type','box');click('#add-stage-object');desktop_object=page.locator('#stage-select').input_value();field('#stage-name','Halp little plinth');field('#scene-pos-x',.65);field('#scene-pos-y',.18);field('#scene-pos-z',.1);field('#scene-scale-x',.35);field('#scene-scale-y',.35);field('#scene-scale-z',.35);field('#scene-rot-y',25);object_state=snap()['stage']['design']['objects'];capture('04-desktop-stage-edited')
 click('#remove-stage-object');check('desktop_stage_delete',not any(o['id']==desktop_object for o in snap()['stage']['design']['objects']));click('#undo');check('desktop_stage_delete_undo',delta(snap()['stage']['design']['objects'],object_state)<1e-6);click('#redo');check('desktop_stage_delete_redo',not any(o['id']==desktop_object for o in snap()['stage']['design']['objects']));click('#undo')
 expand_for('#floor-enabled');click('#floor-enabled');page.locator('#backdrop-file').set_input_files(str(OUT/'backdrop-fixture.png'));page.wait_for_function('directorStudio.snapshot().stage.design.backdrop.image !== null',timeout=30000);page.select_option('#backdrop-fit','cover');page.wait_for_timeout(650);capture('05-desktop-upload-canvas');counts=colors('05-desktop-upload-canvas');check('desktop_uploaded_image_in_raw_canvas',counts['magenta']>1000 and counts['cyan']>1000,counts)
 image=snap()['stage']['design']['backdrop']['image'];check('desktop_upload_bounded_local_data',image['dataUrl'].startswith(('data:image/webp;base64,','data:image/jpeg;base64,','data:image/png;base64,')) and len(image['dataUrl'])<=400000,{'characters':len(image['dataUrl']),'name':image['name']})
 desktop_id,desktop_sent=save_local('Halp next-update desktop '+uuid.uuid4().hex[:6]);reopen(desktop_id);compare_saved('desktop',desktop_sent);capture('06-desktop-reopened');counts=colors('06-desktop-reopened');check('desktop_reopened_image_in_raw_canvas',counts['magenta']>1000 and counts['cyan']>1000,counts);context.close()
def mobile_scenario():
 global mobile_id,mobile_sent
 open_context(True,desktop_id);capture('07-mobile-opened-desktop-take');compare_saved('mobile_cross_context',desktop_sent)
 click('#mode-lighting');page.select_option('#light-select',desktop_light);before=snap();slider('#light-intensity',5.2);edited=snap();click('#mode-stage');click('#undo');check('mobile_touch_shared_undo_light',delta(snap()['lighting'],before['lighting'])<1e-6);click('#redo');check('mobile_touch_shared_redo_light',delta(snap()['lighting'],edited['lighting'])<1e-6)
 expand_for('#stage-type');page.select_option('#stage-type','sphere');click('#add-stage-object');sphere=page.locator('#stage-select').input_value();field('#scene-pos-x',-.35);field('#scene-pos-y',.35);field('#scene-pos-z',0);field('#scene-scale-x',.18);field('#scene-scale-y',.18);field('#scene-scale-z',.18);before_delete=snap()['stage']['design']['objects'];click('#remove-stage-object');check('mobile_touch_stage_delete',not any(o['id']==sphere for o in snap()['stage']['design']['objects']));click('#undo');check('mobile_touch_stage_delete_undo',delta(snap()['stage']['design']['objects'],before_delete)<1e-6)
 click('#mode-pose');expand_for('#trip-glow');before=snap();slider('#trip-glow',.75);glow=snap();click('#undo');check('mobile_touch_glow_undo',snap()['tripGlow']==before['tripGlow']);click('#redo');check('mobile_touch_glow_redo',snap()['tripGlow']==glow['tripGlow']);slider('#trip-temperature',8500);slider('#outline-tone',.1);slider('#outline-width',.003);appearance=snap();click('#ouch');check('mobile_ouch_switch_preserves_appearance',all(snap()[k]==appearance[k] for k in ['tripGlow','tripTemperature','outline']));click('#trip');check('mobile_trip_switch_preserves_appearance',all(snap()[k]==appearance[k] for k in ['tripGlow','tripTemperature','outline']))
 capture('08-mobile-appearance-scene');mobile_id,mobile_sent=save_local('Halp next-update touch '+uuid.uuid4().hex[:6]);reopen(mobile_id);compare_saved('mobile',mobile_sent);capture('09-mobile-reopened');counts=colors('09-mobile-reopened');check('mobile_reopened_image_in_raw_canvas',counts['magenta']>1000 and counts['cyan']>1000,counts);context.close()
def legacy_scenario():
 take_id='dir_ab2e2d65-025c-48d9-928c-0c499ca065a5';open_context(False,take_id);original=page.request.get('http://127.0.0.1:5174/api/director?id='+take_id).json()['take'];current=snap()
 check('legacy_v1_opened_without_rewrite',original['schema']=='nest-director-take/v1' and 'lighting' not in original and 'design' not in original['stage'] and 'tripTemperature' not in original)
 check('legacy_motion_and_pose_retained',current['animation']['transition']=='hold' and delta(current['pose'],original['pose'])<1e-6 and current['keyframes']==original['keyframes'])
 check('legacy_new_controls_compatible_defaults',current['tripGlow']==0 and current['tripTemperature']==6500 and current['outline']['enabled'] is False)
 capture('10-legacy-take-opened');context.close()

def centered_click(selector):
 """Verified touch target for controls near sticky mobile chrome."""
 loc=page.locator(selector);loc.evaluate('(e)=>e.scrollIntoView({block:"center"})');page.wait_for_timeout(300)
 r=loc.bounding_box();x=r['x']+r['width']/2;y=r['y']+r['height']/2
 hit=page.evaluate('([x,y])=>{const e=document.elementFromPoint(x,y);return e?{id:e.id,tag:e.tagName,text:e.textContent.slice(0,70)}:null}',[x,y])
 event('Centered actual touch target',{'selector':selector,'x':x,'y':y,'hit':hit});touch(x,y)
