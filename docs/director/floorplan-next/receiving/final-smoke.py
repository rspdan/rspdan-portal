"""Final frozen-source phone layout receiving; no production writes."""
import hashlib,json,re
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).parent
ROOT=OUT.parents[3]
config=json.loads(Path('/workspace/scratch/floorplan-test-env.json').read_text())
checks=[]
files=['director.css','floorplan-editor.js','floorplan-editor.css','floorplan-overview.js','floorplan-overview.css']
def sha(data):return hashlib.sha256(data).hexdigest()
expected={name:sha((ROOT/'public/director'/name).read_bytes()) for name in files}
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    context=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,has_touch=True,is_mobile=True)
    context.add_cookies([config['cookie']]);context.route_web_socket('**',lambda websocket:None)
    page=context.new_page();page.set_default_timeout(20000);errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    served={}
    def capture(response):
        name=response.url.split('?')[0].rsplit('/',1)[-1]
        if name in files and '/director/' in response.url:served[name]=sha(response.body())
    page.on('response',capture)
    def record(name,value,details=None):
        item={'check':name,'passed':bool(value)}
        if details is not None:item['details']=details
        checks.append(item);print(json.dumps(item),flush=True)
        if not value:raise AssertionError(name)
    def plan():return page.evaluate('window.directorStudio.snapshot().stage.design.floorplan')
    def history():return int(re.search(r'(\d+) back',page.locator('[data-action="undo"]').get_attribute('title')).group(1))
    def tap(selector):page.locator(selector).tap()
    def accessible(selector):
        return page.locator(selector).evaluate('el=>{const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;const hit=document.elementFromPoint(x,y);return y>=0&&y<innerHeight&&x>=0&&x<innerWidth&&(hit===el||el.contains(hit));}')
    try:
        page.goto(config['url']+'/director',wait_until='domcontentloaded');page.wait_for_function('window.directorStudio?.ready',timeout=60000)
        record('Browser-loaded sources match frozen disk bytes',served==expected,served)
        tap('#trip');pose=page.evaluate('window.directorStudio.snapshot().pose');tap('#mode-floorplan')
        page.locator('.fp-file-input').set_input_files(str(OUT/'multi-level-fixture.json'))
        page.wait_for_function('window.directorStudio.snapshot().stage.design.floorplan?.levels.length===4')
        page.locator('[data-field="selection"]').select_option('connection-stair-long-name')
        tap('[data-field="connection-to"]');page.keyboard.press('Escape')
        record('Destination remains touch reachable below sticky inspector tabs',accessible('[data-field="connection-to"]') and accessible('[data-inspector-tab="level"]'))
        page.screenshot(path=str(OUT/'final-phone-destination.png'))
        tap('[data-inspector-tab="level"]')
        record('Level tab resets inspector scroll and reveals level name',accessible('[data-field="level-name"]') and page.locator('[data-inspector-tab="level"]').get_attribute('aria-selected')=='true')
        tap('[data-inspector-tab="selected"]');tap('[data-field="connection-name"]')
        page.locator('[data-field="connection-name"]').fill('Library stair — final nearby edit');page.locator('[data-field="connection-name"]').press('Tab')
        record('Name edit remains usable beside the drawn selected connection',plan()['connectors'][0]['name']=='Library stair — final nearby edit' and accessible('[data-inspector-tab="selected"]'))
        record('Phone scale omits duplicate long level label',not page.locator('.fp-scale-level').is_visible() and page.locator('.fp-scale-grid').is_visible())
        view=page.locator('.fp-svg').get_attribute('viewBox');selected=page.locator('[data-field="selection"]').input_value();before=plan();count=history()
        tap('[data-action="return-plan"]')
        record('Return to plan keeps drawing view, item, document and history',page.locator('.fp-svg').get_attribute('viewBox')==view and page.locator('[data-field="selection"]').input_value()==selected and plan()==before and history()==count)
        record('Return leaves inspector tabs and selected name reachable',accessible('[data-inspector-tab="selected"]') and accessible('[data-field="connection-name"]'))
        page.screenshot(path=str(OUT/'final-phone-selected.png'))
        tap('[data-action="view-building"]')
        record('Building view renders all four levels and all three connections',page.locator('[data-overview-level]').count()==4 and page.locator('.fp-overview-link').count()==3)
        page.screenshot(path=str(OUT/'final-phone-building.png'))
        tap('[data-action="view-plan"]')
        record('Plan and Building toggle remains view only',plan()==before and history()==count and page.locator('.fp-svg').get_attribute('viewBox')==view and page.locator('[data-field="selection"]').input_value()==selected)
        tap('[data-action="undo"]');record('Undo updates the local footer hint','Undid the last change.' in page.locator('.fp-hint-text').inner_text())
        tap('[data-action="redo"]');record('Redo restores the nearby edit and hint',plan()==before and 'Redid the last change.' in page.locator('.fp-hint-text').inner_text())
        record('Layout has no horizontal document overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
        record('Layout and view work preserve Trip pose',page.evaluate('window.directorStudio.snapshot().pose')==pose)
        after={name:sha(context.request.get(config['url']+'/director/'+name).body()) for name in files}
        record('All five frozen sources unchanged after receiving',after==expected==served,after)
        record('No application exceptions',not [e for e in errors if 'dev-toolbar' not in e],errors)
    except Exception as error:
        checks.append({'check':'workflow exception','passed':False,'details':str(error)});print(str(error),flush=True)
        page.screenshot(path=str(OUT/'final-smoke-failure.png'))
    finally:
        (OUT/'final-source-sha256.json').write_text(json.dumps({'expectedDisk':expected,'browserLoaded':served},indent=2)+'\n')
        (OUT/'final-smoke-results.json').write_text(json.dumps(checks,indent=2)+'\n')
        browser.close()
