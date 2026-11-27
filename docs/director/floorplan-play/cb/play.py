"""C.B.'s local invented-set play. Credentials remain outside this record."""
from pathlib import Path
from datetime import datetime,timezone
from hashlib import sha256
import json,math
from playwright.sync_api import sync_playwright
OUT=Path(__file__).parent / "candidate"
OUT.mkdir(exist_ok=True)
config=json.loads(Path('/workspace/scratch/floorplan-test-env.json').read_text())
record={'observer':'C.B.','started_utc':datetime.now(timezone.utc).isoformat(),'environment':'Local Chromium touch emulation 390x844, not physical phone','steps':[]}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=1);c.route_web_socket('**',lambda ws:None);c.add_cookies([config['cookie']]);page=c.new_page();cdp=c.new_cdp_session(page)
 def log(action,observation):record['steps'].append({'action':action,'observation':observation});print(action,flush=True)
 def plan():return page.evaluate('window.directorStudio.snapshot().stage.design.floorplan')
 def tap(x,y):
  cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]});cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
 def point(x,z):return page.locator('.fp-svg').evaluate('''(s,p)=>{let q=s.createSVGPoint();q.x=p[0];q.y=p[1];q=q.matrixTransform(s.getScreenCTM());return[q.x,q.y]}''',[x,z])
 def drag(a,b):
  cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':a[0],'y':a[1]}]})
  for n in range(1,16):
   t=n/15;cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':a[0]+(b[0]-a[0])*t,'y':a[1]+(b[1]-a[1])*t}]});page.wait_for_timeout(25)
  cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
 def field(name,value):
  n=page.locator('[data-field="'+name+'"]');n.fill(str(value));n.press('Tab')
 try:
  page.goto(config['url']+'/director',wait_until='domcontentloaded');page.wait_for_function('window.directorStudio?.ready',timeout=90000)
  record['editor_sha256']=sha256(c.request.get(config['url']+'/director/floorplan-editor.js').body()).hexdigest()
  pose=page.evaluate('directorStudio.snapshot().pose');page.locator('#mode-floorplan').tap()
  page.locator('button[data-tool=rectangle]').tap();drag(point(0,-.5),point(4,2.5))
  field('room-name','Reading nook');field('plan-name','CB invented lookout play')
  page.evaluate('scrollTo(0,0)');page.locator('[data-action=fit]').tap();page.screenshot(path=str(OUT/'01-reading-nook.png'))
  log('Draw and name reading nook','A rectangle dragged into the plan, then renamed. The naming field required scrolling below the sticky plan.')
  a=page.locator('button[data-tool=window]').bounding_box();before=plan();drag([a['x']+a['width']/2,a['y']+a['height']/2],point(2,-.5));after=plan()
  log('Drag Window from toolbar to north wall',{'plan_changed':before!=after,'opening_count':sum(len(r['openings']) for r in after['rooms']),'hint':page.locator('.fp-hint').inner_text(),'selected_text':page.evaluate('getSelection().toString()')})
  page.screenshot(path=str(OUT/'02-toolbar-window-drag.png'))
  page.locator('button[data-tool=window]').tap();tap(*point(4,1));
  log('Tap Window, then east wall',{'opening_count':sum(len(r['openings']) for r in plan()['rooms']),'hint':page.locator('.fp-hint').inner_text()})
  page.locator('button[data-tool=door]').tap();tap(*point(0,1));
  log('Give the nook a west doorway',{'openings':[o['type'] for o in plan()['rooms'][0]['openings']]})
  page.locator('button[data-tool=stairs]').tap();before=plan();tap(*point(3,1.5));
  log('Try a stair in a one-level plan',{'unchanged':before==plan(),'hint':page.locator('.fp-hint').inner_text()})
  page.screenshot(path=str(OUT/'03-one-level-stair.png'))
  page.locator('.fp-hint-action[data-action=add-level]').tap();field('level-name','Lookout');page.evaluate('scrollTo(0,0)')
  log('Add a second level',{'active_level':plan()['activeLevelId'],'visible_room_count':sum(r['levelId']==plan()['activeLevelId'] for r in plan()['rooms']),'hint':page.locator('.fp-hint').inner_text()})
  field('new-width',3);field('new-depth',2);page.locator('[data-action=add-room]').tap();field('room-name','Lookout landing');
  log('Add a small landing on the upper level',{'rooms':[r['name'] for r in plan()['rooms']]})
  ground=plan()['levels'][0]['id'];page.locator('[data-field=level-select]').select_option(ground);page.evaluate('scrollTo(0,0)')
  page.locator('button[data-tool=stairs]').tap();tap(*point(3,1.5));
  log('Return to first level and place stair',{'connections':len(plan()['connectors']),'levels':[l['name'] for l in plan()['levels']]})
  page.locator('button[data-tool=select]').tap();start=plan()['connectors'][0]['position'];drag(point(*start),point(2.5,1.5));
  log('Slide stair within the room',{'before':start,'after':plan()['connectors'][0]['position']})
  page.locator('[data-action=preview]').tap();page.wait_for_timeout(1000);page.screenshot(path=str(OUT/'04-3d-nook.png'))
  log('Preview in 3D',{'pose_unchanged':pose==page.evaluate('directorStudio.snapshot().pose')})
  page.locator('#mode-floorplan').tap();page.locator('[data-action=export]').scroll_into_view_if_needed()
  with page.expect_download() as d:page.locator('[data-action=export]').tap()
  d.value.save_as(str(OUT/'invented-lookout.floorplan.json'));page.evaluate('scrollTo(0,0)');page.screenshot(path=str(OUT/'05-returned-plan.png'))
  log('Export and return to drawing','Portable package retained as invented test geometry; no shared Save or Crew message.')
  record['completed']=True
 except Exception as e:
  record['completed']=False;record['failure']=str(e).split('Call log:')[0][:600];page.screenshot(path=str(OUT/'play-stopped.png'))
 finally:
  b.close();record['ended_utc']=datetime.now(timezone.utc).isoformat();(OUT/'play.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps({'completed':record['completed'],'steps':len(record['steps']),'failure':record.get('failure')}))
