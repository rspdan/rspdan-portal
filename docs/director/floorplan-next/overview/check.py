from pathlib import Path
import json
from playwright.sync_api import sync_playwright
ROOT=Path('/workspace/rspdan-portal');OUT=Path('/workspace/scratch/floorplan-overview');cfg=json.loads(Path('/workspace/scratch/floorplan-test-env.json').read_text());fixture=json.loads((ROOT/'docs/director/floorplan-next/receiving/multi-level-fixture.json').read_text());fixture=fixture.get('plan',fixture)
checks=[]
def check(name,passed):
 checks.append({'check':name,'passed':bool(passed)});assert passed,name
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':390,'height':844},has_touch=True,is_mobile=True);errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.context.route_web_socket('**',lambda ws:None)
 page.goto('http://127.0.0.1:4341/director/floorplan-overview.js')
 page.evaluate('''async plan=>{document.body.innerHTML='';document.head.innerHTML='<meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/director/floorplan-overview.css">';document.body.style.cssText='margin:0;font-family:system-ui,sans-serif';const host=document.createElement('div');host.style.height='100dvh';document.body.append(host);const {createFloorplanOverview}=await import('/director/floorplan-overview.js');window.testPlan=plan;window.testOriginal=JSON.stringify(plan);window.selected=[];window.overview=createFloorplanOverview({host,onSelectLevel:id=>selected.push(id)});overview.setPlan(plan);overview.setVisible(true);}''',fixture)
 page.locator('.fp-overview-card').first.wait_for();page.screenshot(path=str(OUT/'phone-levels.png'));page.locator('.fp-overview-floors').scroll_into_view_if_needed();page.screenshot(path=str(OUT/'phone-floors.png'))
 check('Four independent level cards',page.locator('.fp-overview-card').count()==4)
 check('Exact descending elevation groups',page.locator('.fp-overview-stack-row').evaluate_all('(nodes)=>nodes.map(n=>Number(n.dataset.elevation))')==[5.2,0,-3.2])
 check('Duplicate elevations are grouped explicitly',page.locator('.fp-overview-same-height').count()==1)
 check('Three distinct connection records',page.locator('.fp-overview-link').count()==3)
 check('No plan mutation',page.evaluate('JSON.stringify(testPlan)===testOriginal'))
 check('No phone horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
 for level in fixture['levels']:
  button=page.locator('.fp-overview-card[data-overview-level="'+level['id']+'"] button');button.click();check('Level callback uses '+level['id'],page.evaluate('selected.at(-1)')==level['id'])
 check('Empty level stays visible',page.locator('.fp-overview-card').filter(has_text='No rooms drawn on this level.').count()==1)
 page.evaluate("overview.setVisible(false)");check('Hidden overview',page.locator('.fp-building-overview').is_hidden());page.evaluate("overview.setVisible(true)")
 button=page.locator('.fp-overview-level-button').first;button.focus();page.keyboard.press('Enter');check('Keyboard selection fires callback',page.evaluate('selected.length')==5)
 page.evaluate("testPlan.levels[0].name='<img src=x onerror=alert(1)> Living';overview.setPlan(testPlan)")
 check('Level names remain literal text',page.locator('img').count()==0 and '<img src=x onerror=alert(1)>' in page.locator('.fp-building-overview').inner_text())
 page.set_viewport_size({'width':1280,'height':900});page.evaluate("document.querySelector('.fp-building-overview').scrollTop=0");page.screenshot(path=str(OUT/'desktop-overview.png'))
 check('No desktop horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
 page.evaluate('''async()=>{const {createPlan}=await import('/director/floorplan-model.js');const p=createPlan();p.levels.push({id:'micro-upper',name:'Micro upper',elevation:0.00001,height:2.7});p.rooms.push({id:'narrow',levelId:p.activeLevelId,name:'Clockwise narrow room',points:[[0,0],[0,1],[4,1],[4,0]],wallThickness:.12,wallColor:'#e8e2d8',floorColor:'#bda98a',openings:[{id:'west-door',type:'door',edge:0,at:.5,width:.9,height:2.1,sill:0}]});p.connectors.push({id:'micro-link',type:'stairs',name:'Micro separation',fromLevelId:p.activeLevelId,toLevelId:'micro-upper',position:[2,.5],size:[.5,.5],rotation:0});overview.setPlan(p);}''')
 check('Tiny distinct elevation retains exact value','0.00001 u' in page.locator('.fp-overview-levels').inner_text())
 check('Tiny connection difference is nonzero','vertical difference 0.00001 u' in page.locator('.fp-overview-connections').inner_text())
 check('Clockwise door glyph stays inside mini-plan',page.locator('.fp-overview-mini line').evaluate_all('(lines)=>lines.every(l=>["x1","x2"].every(k=>Number(l.getAttribute(k))>=0&&Number(l.getAttribute(k))<=320)&&["y1","y2"].every(k=>Number(l.getAttribute(k))>=0&&Number(l.getAttribute(k))<=180))'))
 check('Overview is a named accessible region',page.get_by_role('region',name='Building overview').count()==1)
 page.evaluate('overview.dispose()');check('Dispose removes content',page.locator('.fp-overview-card').count()==0);check('No runtime exceptions',not errors)
 browser.close()
(OUT/'checks.json').write_text(json.dumps(checks,indent=2)+'\n');print(json.dumps({'passed':len(checks),'errors':errors}))
