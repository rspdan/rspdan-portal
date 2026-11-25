"""Parent-authorized temporary runtime shadow-bias comparison; no product edits."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).parent
config=json.loads(Path('/workspace/scratch/floorplan-test-env.json').read_text())
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    context=browser.new_context(viewport={'width':1440,'height':1000},device_scale_factor=1)
    context.route_web_socket('**',lambda websocket:None)
    context.add_cookies([config['cookie']]);page=context.new_page()
    page.goto(config['url']+'/director',wait_until='domcontentloaded')
    page.wait_for_function('window.directorStudio?.ready',timeout=60000)
    page.locator('#mode-floorplan').click()
    page.locator('.fp-file-input').set_input_files(str(OUT/'ui-export.floorplan.json'))
    page.wait_for_function('window.directorStudio.snapshot().stage.design.floorplan?.rooms.length === 3')
    plan=page.evaluate('window.directorStudio.snapshot().stage.design.floorplan')
    page.locator('[data-field="level-select"]').select_option(plan['levels'][0]['id'])
    page.locator('[data-action="preview"]').click()
    page.wait_for_timeout(500)
    page.screenshot(path=str(OUT/'shadow-baseline.png'))
    for label,value,backfaces,receive in [('normal-bias-0.05',.05,False,True),('backfaces-only',0,True,True),('no-received-shadows',0,False,False)]:
        first=page.evaluate('window.directorStudio.scene.getFrameId()')
        state=page.evaluate('''value=>window.directorStudio.scene.lights.map(light=>{
            const shadow=light.getShadowGenerator?.();if(!shadow)return null;
            shadow.normalBias=value.normal;shadow.bias=.001;shadow.forceBackFacesOnly=value.backfaces;
            for(const mesh of window.directorStudio.scene.meshes)if(mesh.metadata?.directorFloorplan)mesh.receiveShadows=value.receive;
            return {id:light.id,bias:shadow.bias,normalBias:shadow.normalBias,backfaces:shadow.forceBackFacesOnly,receive:value.receive};
        }).filter(Boolean)''',{'normal':value,'backfaces':backfaces,'receive':receive})
        page.wait_for_function('initial=>window.directorStudio.scene.getFrameId()>initial',arg=first,timeout=15000)
        page.screenshot(path=str(OUT/f'shadow-{label}.png'))
        print(json.dumps(state),flush=True)
    browser.close()
