"""Final unchanged-runtime receiving after the scoped shadow fix."""
import hashlib
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).parent
ROOT=OUT.parents[2]
config=json.loads(Path('/workspace/scratch/floorplan-test-env.json').read_text())
checks=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    context=browser.new_context(viewport={'width':1440,'height':1000},device_scale_factor=1)
    context.route_web_socket('**',lambda websocket:None)
    context.add_cookies([config['cookie']]);page=context.new_page()
    errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
    def snap():return page.evaluate('window.directorStudio.snapshot()')
    def result(name,value,details=None):
        item={'check':name,'passed':bool(value)}
        if details is not None:item['details']=details
        checks.append(item);print(json.dumps(item),flush=True)
        if not value:raise AssertionError(name)
    try:
        page.goto(config['url']+'/director',wait_until='domcontentloaded')
        page.wait_for_function('window.directorStudio?.ready',timeout=60000)
        pose=snap()['pose']
        original_bias=page.evaluate('window.directorStudio.scene.lights.map(l=>l.getShadowGenerator?.()).filter(Boolean).map(s=>s.normalBias)')
        page.locator('#mode-floorplan').click()
        page.locator('.fp-file-input').set_input_files(str(OUT/'ui-export.floorplan.json'))
        page.wait_for_function('window.directorStudio.snapshot().stage.design.floorplan?.rooms.length === 3')
        plan=snap()['stage']['design']['floorplan']
        page.locator('[data-field="level-select"]').select_option(plan['levels'][0]['id'])
        plan=snap()['stage']['design']['floorplan']
        page.locator('[data-action="preview"]').click()
        first=page.evaluate('window.directorStudio.scene.getFrameId()')
        page.wait_for_function('initial=>window.directorStudio.scene.getFrameId()>initial',arg=first,timeout=15000)
        result('3D renders after imported plan',page.locator('#mode-stage').get_attribute('aria-pressed')=='true')
        shadows=page.evaluate('window.directorStudio.scene.lights.map(l=>l.getShadowGenerator?.()).filter(Boolean).map(s=>({bias:s.bias,normalBias:s.normalBias,backfaces:s.forceBackFacesOnly}))')
        result('Renderer uses scoped shadow adjustment',any(s['normalBias']>=.05 or s['backfaces'] for s in shadows),shadows)
        result('Preview preserves plan and pose',snap()['stage']['design']['floorplan']==plan and snap()['pose']==pose)
        page.screenshot(path=str(OUT/'final-3d-preview.png'))
        page.locator('#mode-floorplan').click()
        result('Return to overhead remains editable',page.locator('.fp-svg').is_visible())
        page.screenshot(path=str(OUT/'final-overhead.png'))
        for _ in range(5):
            if not snap()['stage']['design'].get('floorplan'):break
            page.locator('[data-action="undo"]').click()
        result('Undo import clears generated plan',not snap()['stage']['design'].get('floorplan'))
        restored_bias=page.evaluate('window.directorStudio.scene.lights.map(l=>l.getShadowGenerator?.()).filter(Boolean).map(s=>s.normalBias)')
        result('Clearing plan restores original shadow bias',restored_bias==original_bias,{'original':original_bias,'restored':restored_bias})
        result('No application runtime errors',not [e for e in errors if 'dev-toolbar' not in e],errors)
    except Exception as error:
        checks.append({'check':'workflow exception','passed':False,'details':str(error)});print(json.dumps(checks[-1]),flush=True)
    finally:browser.close()
(OUT/'final-smoke-results.json').write_text(json.dumps(checks,indent=2)+'\n')
sources=['public/director/floorplan-model.js','public/director/floorplan-editor.js','public/director/floorplan-editor.css','public/director/floorplan-renderer.js','public/director/director.js','public/director/director.css','public/director/stage.js','public/director/odk_floorplan_import.py','src/pages/director/index.astro']
(OUT/'tested-source-sha256.json').write_text(json.dumps({s:hashlib.sha256((ROOT/s).read_bytes()).hexdigest() for s in sources},indent=2)+'\n')
