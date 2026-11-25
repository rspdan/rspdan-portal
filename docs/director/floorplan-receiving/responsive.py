"""Real touchscreen interactions against the isolated Director test server."""
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).parent
config=json.loads(Path('/workspace/scratch/floorplan-test-env.json').read_text())
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for label,width,height in [('tablet',820,1180),('mobile',390,844)]:
        if len(sys.argv)>1 and label != sys.argv[1]: continue
        context=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1,has_touch=True,is_mobile=True)
        context.route_web_socket('**',lambda websocket:None)
        context.add_cookies([config['cookie']]); page=context.new_page()
        errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
        def plan():return page.evaluate('window.directorStudio.snapshot().stage.design.floorplan')
        def shot(name):
            page.screenshot(path=str(OUT/f'{label}-{name}-viewport.png'))
            page.screenshot(path=str(OUT/f'{label}-{name}.png'),full_page=True)
        def result(name,passed,details=None):
            item={'device':label,'check':name,'passed':bool(passed)}
            if details is not None:item['details']=details
            results.append(item);print(json.dumps(item),flush=True)
            if not passed:raise AssertionError(name)
        try:
            page.goto(config['url']+'/director',wait_until='domcontentloaded')
            page.wait_for_function('window.directorStudio?.ready',timeout=60000)
            original_pose=page.evaluate('window.directorStudio.snapshot().pose')
            page.locator('#mode-floorplan').tap()
            result('No horizontal page overflow',page.evaluate('document.documentElement.scrollWidth <= innerWidth'),page.evaluate('({viewport:innerWidth,scroll:document.documentElement.scrollWidth})'))
            shot('initial')
            if label=='tablet':
                page.get_by_role('button',name='Draw room',exact=True).tap()
                rect=page.locator('.fp-svg').bounding_box()
                start={'x':rect['x']+rect['width']*.3,'y':rect['y']+rect['height']*.3}
                end={'x':rect['x']+rect['width']*.65,'y':rect['y']+rect['height']*.7}
                cdp=context.new_cdp_session(page)
                cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[start]})
                for i in range(1,11):
                    touch={axis:start[axis]+(end[axis]-start[axis])*i/10 for axis in ['x','y']}
                    cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[touch]})
                cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
                result('Touch drag draws room',len(plan()['rooms'])==1)
            else:
                # This path is also available to users who cannot drag precisely.
                for name,value in [('new-width','4'),('new-depth','3')]:
                    node=page.locator(f'[data-field="{name}"]');node.fill(value);node.press('Tab')
                page.get_by_role('button',name='Add room at view centre',exact=True).tap()
                result('Add room by dimensions',len(plan()['rooms'])==1)
            node=page.locator('[data-field="room-name"]');node.fill(f'{label.title()} room');node.press('Tab')
            result('Room name edit',plan()['rooms'][0]['name']==f'{label.title()} room')
            shot('inspector')
            page.get_by_role('button',name='Fit plan',exact=True).tap()
            shot('room')
            before=plan()
            page.get_by_role('button',name='Undo floor plan change',exact=True).tap()
            result('Touch undo',plan()['rooms'][0]['name']!=before['rooms'][0]['name'])
            page.get_by_role('button',name='Redo floor plan change',exact=True).tap()
            result('Touch redo',plan()==before)
            page.get_by_role('button',name='Preview in 3D',exact=True).tap()
            page.wait_for_timeout(600);shot('preview')
            result('Touch preview preserves pose',page.evaluate('window.directorStudio.snapshot().pose')==original_pose)
            page.locator('#mode-floorplan').tap()
            result('Return from preview',page.locator('.fp-svg').is_visible() and plan()==before)
            result('No application runtime errors',not [e for e in errors if 'dev-toolbar' not in e],errors)
        except Exception as error:
            shot('failure');results.append({'device':label,'check':'workflow exception','passed':False,'details':str(error)})
            print(json.dumps(results[-1]),flush=True)
        finally:context.close()
    browser.close()
(OUT/('responsive-results.json' if len(sys.argv)==1 else f'{sys.argv[1]}-viewport-results.json')).write_text(json.dumps(results,indent=2)+'\n')
