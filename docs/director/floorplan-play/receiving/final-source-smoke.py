"""Focused receiving of the final mouse-completion adjustment and served bytes."""
import hashlib,json,re
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).parent
config=json.loads(Path('/workspace/scratch/floorplan-test-env.json').read_text())
checks=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    context=browser.new_context(viewport={'width':1280,'height':900},device_scale_factor=1,has_touch=True)
    context.route_web_socket('**',lambda websocket:None);context.add_cookies([config['cookie']]);page=context.new_page();cdp=context.new_cdp_session(page)
    errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
    def record(name,value):
        checks.append({'check':name,'passed':bool(value)});print(json.dumps(checks[-1]),flush=True)
        if not value:raise AssertionError(name)
    def plan():return page.evaluate('window.directorStudio.snapshot().stage.design.floorplan')
    def history():return int(re.search(r'(\d+) back',page.locator('[data-action="undo"]').get_attribute('title')).group(1))
    def world(x,z):return page.locator('.fp-svg').evaluate('(svg,p)=>{const v=svg.createSVGPoint();v.x=p[0];v.y=p[1];const q=v.matrixTransform(svg.getScreenCTM());return[q.x,q.y]}',[x,z])
    def center(node):
        b=node.bounding_box();return[b['x']+b['width']/2,b['y']+b['height']/2]
    def drag(a,b,touch=False):
        if touch:
            cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':a[0],'y':a[1]}]})
            for i in range(1,11):cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':a[0]+(b[0]-a[0])*i/10,'y':a[1]+(b[1]-a[1])*i/10}]})
            page.locator('[data-placement-ghost][data-valid="true"]').wait_for(state='attached',timeout=3000)
            cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        else:page.mouse.move(*a);page.mouse.down();page.mouse.move(*b,steps=10);page.mouse.up()
    try:
        page.goto(config['url']+'/director',wait_until='domcontentloaded');page.wait_for_function('window.directorStudio?.ready',timeout=60000)
        page.locator('#mode-floorplan').click();page.locator('button[data-tool="polygon"]').tap()
        for point in [(0,0),(.25,0),(.25,.5),(0,.5),(0,0)]:page.touchscreen.tap(*world(*point))
        record('Rapid nearby touch corners finish only at first corner',len(plan()['rooms'])==1 and len(plan()['rooms'][0]['points'])==4 and history()==1)
        page.locator('[data-action="undo"]').click();record('Touch polygon remains one undo',not plan())
        page.locator('button[data-tool="polygon"]').click()
        for point in [(1,0),(2,0),(1.5,1)]:page.mouse.click(*world(*point))
        page.mouse.dblclick(*world(1.5,1))
        record('Mouse same-corner doubleclick finishes triangle',len(plan()['rooms'])==1 and len(plan()['rooms'][0]['points'])==3 and history()==1)
        baseline=plan();count=history()
        drag(center(page.locator('button[data-tool="door"]')),world(1.5,0))
        record('Final-source mouse toolbar drop is one undo',len(plan()['rooms'][0]['openings'])==1 and history()==count+1)
        page.locator('[data-action="undo"]').click();record('Final-source mouse drop undo exact',plan()==baseline)
        drag(center(page.locator('button[data-tool="window"]')),world(1.5,0),True)
        record('Final-source touch toolbar drop is one undo',len(plan()['rooms'][0]['openings'])==1 and history()==count+1)
        page.locator('[data-action="undo"]').click();record('Final-source touch drop undo exact',plan()==baseline)
        page.locator('[data-field="grid"]').fill('.25');page.locator('[data-field="grid"]').press('Tab');page.locator('.fp-hint-text').click()
        record('Real hint text selection produces no application error',not [e for e in errors if 'dev-toolbar' not in e])
        page.screenshot(path=str(OUT/'final-source-smoke.png'))
        hashes={name:hashlib.sha256(page.request.get(config['url']+'/director/'+name).body()).hexdigest() for name in ['floorplan-editor.js','floorplan-editor.css']}
        (OUT/'tested-source-sha256.json').write_text(json.dumps(hashes,indent=2)+'\n')
        print(json.dumps({'source_hashes':hashes}),flush=True)
    except Exception as error:
        checks.append({'check':'workflow exception','passed':False,'details':str(error)});print(json.dumps(checks[-1]),flush=True)
        page.screenshot(path=str(OUT/'final-source-smoke-failure.png'))
    finally:browser.close()
(OUT/'final-source-smoke-results.json').write_text(json.dumps(checks,indent=2)+'\n')
