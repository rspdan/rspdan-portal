"""Reproduce toolbar dragging on Android-style touch and desktop pointer input."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).parent
config=json.loads(Path('/workspace/scratch/floorplan-test-env.json').read_text())
records=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for name,touch in [('android-touch',True),('desktop-mouse',False)]:
        context=browser.new_context(viewport={'width':390 if touch else 1280,'height':844 if touch else 900},device_scale_factor=1,has_touch=touch,is_mobile=touch)
        context.route_web_socket('**',lambda websocket:None);context.add_cookies([config['cookie']])
        page=context.new_page();page.add_init_script("window.qaMenus=0;document.addEventListener('contextmenu',()=>window.qaMenus++,true)")
        page.goto(config['url']+'/director',wait_until='domcontentloaded');page.wait_for_function('window.directorStudio?.ready',timeout=60000)
        cdp=context.new_cdp_session(page)
        def tap(node):node.tap() if touch else node.click()
        def drag(a,b,hold=0):
            if touch:
                cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':a[0],'y':a[1]}]})
                if hold:page.wait_for_timeout(hold)
                for i in range(1,11):cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':a[0]+(b[0]-a[0])*i/10,'y':a[1]+(b[1]-a[1])*i/10}]})
                cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
            else:
                page.mouse.move(*a);page.mouse.down()
                if hold:page.wait_for_timeout(hold)
                page.mouse.move(*b,steps=10);page.mouse.up()
        def center(node):
            b=node.bounding_box();return [b['x']+b['width']/2,b['y']+b['height']/2]
        def state(label):
            value=page.evaluate("({plan:window.directorStudio.snapshot().stage.design.floorplan,selectedTool:document.querySelector('.fp-toolbar button[aria-pressed=true]')?.dataset.tool,hint:document.querySelector('.fp-hint').textContent,selection:getSelection().toString(),menus:window.qaMenus,scrollY})")
            plan=value.pop('plan') or {};value.update({'device':name,'step':label,'rooms':len(plan.get('rooms',[])),'connectors':len(plan.get('connectors',[])),'levels':len(plan.get('levels',[]))})
            records.append(value);print(json.dumps(value),flush=True)
            page.screenshot(path=str(OUT/f'{name}-{label}.png'))
        tap(page.locator('#mode-floorplan'));tap(page.locator('button[data-tool="rectangle"]'))
        box=page.locator('.fp-svg').bounding_box();a=[box['x']+box['width']*.25,box['y']+box['height']*.2];b=[box['x']+box['width']*.7,box['y']+box['height']*.65]
        drag(a,b);state('room-draw')
        target=[(a[0]+b[0])/2,(a[1]+b[1])/2]
        drag(center(page.locator('button[data-tool="stairs"]')),target);state('stairs-toolbar-drag')
        tap(page.locator('button[data-tool="stairs"]'))
        page.touchscreen.tap(*target) if touch else page.mouse.click(*target)
        state('stairs-tap-tap-one-level')
        tap(page.locator('button[data-tool="select"]'))
        drag(center(page.locator('button[data-tool="elevator"]')),target,hold=900);state('elevator-longpress-drag')
        context.close()
    browser.close()
(OUT/'baseline-reproduction.json').write_text(json.dumps(records,indent=2)+'\n')
