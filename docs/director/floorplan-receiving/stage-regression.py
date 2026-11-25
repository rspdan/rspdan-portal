"""Stage/Trip regression receiving against a real exported floor-plan package."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).parent
config=json.loads(Path('/workspace/scratch/floorplan-test-env.json').read_text())
checks=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    context=browser.new_context(viewport={'width':1280,'height':900},device_scale_factor=1)
    context.route_web_socket('**',lambda websocket:None)
    context.add_cookies([config['cookie']]); page=context.new_page()
    def snap():return page.evaluate('window.directorStudio.snapshot()')
    def result(name,value):
        checks.append({'check':name,'passed':bool(value)});print(json.dumps(checks[-1]),flush=True)
        if not value:raise AssertionError(name)
    def field(selector,value):
        node=page.locator(selector);node.fill(str(value));node.press('Tab')
    try:
        page.goto(config['url']+'/director',wait_until='domcontentloaded')
        page.wait_for_function('window.directorStudio?.ready',timeout=60000)
        page.locator('#trip').click()
        pose=snap()['pose']; result('Trip look active',snap()['look']=='trip')
        page.locator('#mode-floorplan').click()
        page.locator('.fp-file-input').set_input_files(str(OUT/'ui-export.floorplan.json'))
        page.wait_for_function('window.directorStudio.snapshot().stage.design.floorplan?.rooms.length === 3')
        plan=snap()['stage']['design']['floorplan']
        page.locator('[data-action="preview"]').click()
        page.locator('#stage-type').select_option('box')
        page.locator('#add-stage-object').click()
        field('#stage-name','Receiving test desk block')
        field('#scene-pos-x',-1)
        field('#scene-pos-z',.5)
        field('#scene-scale-x',1.5)
        result('Generic Stage prop edits keep canonical plan',snap()['stage']['design']['floorplan']==plan)
        result('Generic Stage prop exists',any(o['name']=='Receiving test desk block' for o in snap()['stage']['design']['objects']))
        result('Trip pose unchanged after plan and prop work',snap()['pose']==pose)
        page.screenshot(path=str(OUT/'trip-stage-prop.png'),full_page=True)
        page.locator('#mode-floorplan').click()
        field('[data-field="plan-name"]','Trip floor plan regression')
        result('Floor plan edits keep generic Stage props',any(o['name']=='Receiving test desk block' for o in snap()['stage']['design']['objects']))
        result('Trip pose unchanged after return',snap()['pose']==pose)
        page.locator('[data-action="preview"]').click()
        # The engine frame counter proves rendering resumed after being paused overhead.
        first=page.evaluate('window.directorStudio.scene.getFrameId()')
        page.wait_for_function('initial => window.directorStudio.scene.getFrameId() > initial',arg=first,timeout=15000)
        second=page.evaluate('window.directorStudio.scene.getFrameId()')
        result('3D rendering resumes after overhead',second>first)
        page.screenshot(path=str(OUT/'trip-preview-resumed.png'),full_page=True)
    except Exception as error:
        checks.append({'check':'workflow exception','passed':False,'details':str(error)});print(json.dumps(checks[-1]),flush=True)
        page.screenshot(path=str(OUT/'trip-regression-failure.png'),full_page=True)
    finally:browser.close()
(OUT/'stage-regression-results.json').write_text(json.dumps(checks,indent=2)+'\n')
