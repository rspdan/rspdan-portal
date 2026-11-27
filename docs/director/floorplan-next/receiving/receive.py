"""Scoped independent receiving of inspector navigation and Building overview."""
import hashlib,json,re,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).parent
config=json.loads(Path('/workspace/scratch/floorplan-test-env.json').read_text())
fixture=json.loads((OUT/'multi-level-fixture.json').read_text())
checks=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for device,touch in [('phone',True),('desktop',False)]:
        if len(sys.argv)>1 and sys.argv[1]!=device:continue
        context=browser.new_context(viewport={'width':390 if touch else 1440,'height':844 if touch else 1000},device_scale_factor=1,has_touch=touch,is_mobile=touch)
        context.route_web_socket('**',lambda websocket:None);context.add_cookies([config['cookie']]);page=context.new_page();page.set_default_timeout(20000)
        cdp=context.new_cdp_session(page);errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
        def record(name,value,details=None):
            item={'device':device,'check':name,'passed':bool(value)}
            if details is not None:item['details']=details
            checks.append(item);print(json.dumps(item),flush=True)
            if not value:raise AssertionError(name)
        def snap():return page.evaluate('window.directorStudio.snapshot()')
        def plan():return snap()['stage']['design'].get('floorplan')
        def history():return int(re.search(r'(\d+) back',page.locator('[data-action="undo"]').get_attribute('title')).group(1))
        def tap(node):node.tap() if touch else node.click()
        def action(name):tap(page.locator(f'[data-action="{name}"]'))
        def tab(name):
            node=page.locator(f'[data-inspector-tab="{name}"]')
            if node.is_visible():tap(node)
        def field(name,value):
            node=page.locator(f'[data-field="{name}"]');tap(node);node.fill(str(value));node.press('Tab')
        def shot(name):page.screenshot(path=str(OUT/f'{device}-{name}.png'))
        def world(x,z):return page.locator('.fp-svg').evaluate('(svg,p)=>{const v=svg.createSVGPoint();v.x=p[0];v.y=p[1];const q=v.matrixTransform(svg.getScreenCTM());return[q.x,q.y]}',[x,z])
        def tap_world(x,z):
            q=world(x,z);page.touchscreen.tap(*q) if touch else page.mouse.click(*q)
        def center(node):
            b=node.bounding_box();return[b['x']+b['width']/2,b['y']+b['height']/2]
        def drag(a,b):
            if touch:
                cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':a[0],'y':a[1]}]})
                for i in range(1,11):cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':a[0]+(b[0]-a[0])*i/10,'y':a[1]+(b[1]-a[1])*i/10}]})
                cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
            else:page.mouse.move(*a);page.mouse.down();page.mouse.move(*b,steps=10);page.mouse.up()
        try:
            page.goto(config['url']+'/director',wait_until='domcontentloaded');page.wait_for_function('window.directorStudio?.ready',timeout=60000)
            tap(page.locator('#trip'));pose=snap()['pose'];tap(page.locator('#mode-floorplan'))
            initial=plan();count=history();action('view-building')
            record('Empty Building view has explicit no-room/no-connection guidance','No rooms drawn' in page.locator('.fp-building-overview').inner_text() and 'No connections yet' in page.locator('.fp-building-overview').inner_text())
            action('view-plan');record('Empty view toggle does not create plan/history',plan()==initial and history()==count)
            tab('plan');page.locator('.fp-file-input').set_input_files(str(OUT/'multi-level-fixture.json'))
            page.wait_for_function('window.directorStudio.snapshot().stage.design.floorplan?.levels.length===4')
            baseline=plan();count=history();action('view-building')
            cards=page.locator('[data-overview-level]').evaluate_all('nodes=>nodes.map(n=>n.dataset.overviewLevel)')
            record('Overview keeps all four IDs in descending elevation order',cards==['level-upper-id','level-ground-id','level-empty-same-name-id','level-below-id'],cards)
            groups=page.locator('.fp-overview-stack-row').evaluate_all('nodes=>nodes.map(n=>({elevation:Number(n.dataset.elevation),levels:[...n.querySelectorAll("[data-overview-select]")].map(b=>b.dataset.overviewSelect)}))')
            record('Equal elevations group without merging IDs',[g['elevation'] for g in groups]==[5.2,0,-3.2] and len(groups[1]['levels'])==2,groups)
            record('Empty duplicate-name level explicitly remains empty','No rooms drawn' in page.locator('[data-overview-level="level-empty-same-name-id"]').inner_text())
            links=page.locator('.fp-overview-link').evaluate_all('nodes=>nodes.map(n=>({id:n.dataset.overviewConnection,name:n.querySelector("strong").textContent,levels:[...n.querySelectorAll("[data-overview-select]")].map(b=>b.dataset.overviewSelect)}))')
            expected=[{'id':c['id'],'name':c['name'],'levels':[c['fromLevelId'],c['toLevelId']]} for c in baseline['connectors']]
            record('Named connections preserve duplicate names and ID endpoints',links==expected,links)
            record('Building sorting and inspection do not mutate document/history',plan()==baseline and history()==count)
            record('Long labels do not cause horizontal page overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
            shot('building-top')
            page.locator('[data-overview-level="level-empty-same-name-id"]').scroll_into_view_if_needed();shot('building-empty-level')
            # The duplicate visible name must still select this exact empty level ID.
            choose=page.locator('.fp-overview-stack [data-overview-select="level-empty-same-name-id"]');tap(choose)
            record('Choosing duplicate-name level edits active ID once',plan()['activeLevelId']=='level-empty-same-name-id' and history()==count+1)
            record('Choosing a level returns to editable Plan',page.locator('.fp-svg').is_visible())
            action('undo');record('Undo level choice restores exact plan and local hint',plan()==baseline and 'undid' in page.locator('.fp-hint-text').inner_text().lower())
            action('redo');record('Redo updates local hint and active ID','redid' in page.locator('.fp-hint-text').inner_text().lower() and plan()['activeLevelId']=='level-empty-same-name-id')
            action('undo')
            # Same-level navigation is a view action, not a new take edit.
            count=history();action('view-building');tap(page.locator('.fp-overview-stack [data-overview-select="level-ground-id"]'))
            record('Choosing current level adds no history',plan()==baseline and history()==count)
            labels=page.locator('[data-canvas-level] option').all_text_contents()
            record('Nearby level selector disambiguates identical names',len(labels)==4 and len(set(labels))==4,labels)
            if touch:
                tab('selected');page.locator('[data-inspector-tab="selected"]').focus();page.keyboard.press('ArrowRight')
                record('Keyboard arrow selects Level inspector tab',page.locator('[data-inspector-tab="level"]').get_attribute('aria-selected')=='true' and page.locator('[data-inspector-panel="level"]').is_visible())
                page.keyboard.press('End');record('Keyboard End selects Plan inspector tab',page.locator('[data-inspector-tab="plan"]').get_attribute('aria-selected')=='true')
                page.keyboard.press('Home');record('Keyboard Home returns Selected inspector tab',page.locator('[data-inspector-tab="selected"]').get_attribute('aria-selected')=='true')
            # View-only switching preserves a real selected item and a panned/zoomed view.
            tap_world(3,3.5);action('zoom-in');view=page.locator('.fp-svg').get_attribute('viewBox');selection=page.locator('[data-field="selection"]').input_value()
            count=history();before=plan();action('view-building');action('view-plan')
            record('Building round trip preserves viewport and selection',page.locator('.fp-svg').get_attribute('viewBox')==view and page.locator('[data-field="selection"]').input_value()==selection)
            record('Building round trip preserves plan/history/pose',plan()==before and history()==count and snap()['pose']==pose)
            action('fit');tab('selected');page.locator('[data-field="selection"]').select_option('connection-stair-long-name')
            field('connection-name','Library stair — renamed beside the plan')
            record('Selected connector name edit remains in Selected panel',next(c for c in plan()['connectors'] if c['id']=='connection-stair-long-name')['name']=='Library stair — renamed beside the plan' and (not touch or page.locator('[data-inspector-tab="selected"]').get_attribute('aria-selected')=='true'))
            record('Plan marker uses custom connection name','Library stair' in page.locator('.fp-svg').text_content())
            shot('selected-connection')
            if touch:
                view=page.locator('.fp-svg').get_attribute('viewBox');selected=page.locator('[data-field="selection"]').input_value();count=history()
                action('return-plan');record('Return-to-plan control preserves view/selection/history',page.locator('.fp-svg').get_attribute('viewBox')==view and page.locator('[data-field="selection"]').input_value()==selected and history()==count)
            page.locator('[data-canvas-level]').select_option('level-below-id');tab('selected');page.locator('[data-field="selection"]').select_option('connection-lift-second')
            destination=page.locator('[data-field="connection-to"]');tap(destination);page.keyboard.press('Escape');destination.select_option('level-empty-same-name-id')
            record('Nearby destination control chooses exact duplicate-name ID',next(c for c in plan()['connectors'] if c['id']=='connection-lift-second')['toLevelId']=='level-empty-same-name-id')
            shot('destination-edit')
            before=plan();count=history();action('view-building')
            routed=page.locator('.fp-overview-link[data-overview-connection="connection-lift-second"] [data-overview-select]').evaluate_all('nodes=>nodes.map(n=>n.dataset.overviewSelect)')
            record('Updated Building link follows ID, not duplicate label',routed==['level-below-id','level-empty-same-name-id'])
            record('Renamed connection appears fully in Building','Library stair — renamed beside the plan' in page.locator('.fp-overview-connections').inner_text())
            record('Viewing updated links makes no extra history',plan()==before and history()==count)
            # Keyboard activation of a level is the same real one-step edit.
            target=page.locator('.fp-overview-stack [data-overview-select="level-ground-id"]');target.focus();page.keyboard.press('Enter')
            record('Keyboard overview activation selects level once',plan()['activeLevelId']=='level-ground-id' and history()==count+1)
            action('fit')
            if touch:
                for kind,point in {'door':(0,1),'window':(6,2),'passage':(3,4),'stairs':(2,2),'elevator':(4,2)}.items():
                    button=page.locator(f'button[data-tool="{kind}"]');button.scroll_into_view_if_needed();before=plan();count=history();drag(center(button),world(*point))
                    record(f'Focused {kind} toolbar drag remains one edit',plan()!=before and history()==count+1)
                    action('undo');record(f'Focused {kind} undo restores plan and hint',plan()==before and 'undid' in page.locator('.fp-hint-text').inner_text().lower())
                tap(page.locator('button[data-tool="polygon"]'));before=plan();count=history()
                for point in [(2,.5),(3,.5),(3,1.25),(2,1.25),(2,.5)]:tap_world(*point)
                record('Focused touch polygon completion remains one edit',len(plan()['rooms'])==len(before['rooms'])+1 and history()==count+1)
                action('undo');record('Polygon undo exact',plan()==before)
            final_plan=plan();tab('plan')
            with page.expect_download() as download_info:action('export')
            export_path=OUT/f'{device}-export.floorplan.json';download_info.value.save_as(export_path)
            record('Export contains canonical plan without UI view state',json.loads(export_path.read_text())['plan']==final_plan)
            action('preview');first=page.evaluate('window.directorStudio.scene.getFrameId()');page.wait_for_function('n=>window.directorStudio.scene.getFrameId()>n',arg=first,timeout=20000)
            record('3D preview preserves plan and character pose',plan()==final_plan and snap()['pose']==pose)
            tap(page.locator('#mode-floorplan'));page.locator('#take-name').fill(f'Next receiving {device}');page.locator('#take-name').press('Tab')
            with page.expect_response(lambda response:'/api/director' in response.url and response.request.method=='POST') as response_info:tap(page.locator('#save'))
            response=response_info.value;record('Save uses isolated local store',response.ok and response.json().get('shared') is False)
            page.reload(wait_until='domcontentloaded');page.wait_for_function('window.directorStudio?.ready',timeout=60000)
            record('Reload preserves plan and character pose',plan()==final_plan and snap()['pose']==pose)
            tap(page.locator('#mode-floorplan'));action('view-building');shot('final-building')
            record('Reloaded overview retains all level IDs',page.locator('[data-overview-level]').count()==4)
            record('No application runtime exceptions',not [e for e in errors if 'dev-toolbar' not in e],errors)
        except Exception as error:
            item={'device':device,'check':'workflow exception','passed':False,'details':str(error)};checks.append(item);print(json.dumps(item),flush=True);shot('failure')
        finally:context.close()
    browser.close()
suffix='all' if len(sys.argv)==1 else sys.argv[1]
(OUT/f'{suffix}-results.json').write_text(json.dumps(checks,indent=2)+'\n')
