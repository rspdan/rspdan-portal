"""Real pointer/touch receiving for toolbar placement; isolated local storage only."""
import json,re,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).parent
config=json.loads(Path('/workspace/scratch/floorplan-test-env.json').read_text())
records=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for device,touch in [('android-touch',True),('desktop-mouse',False)]:
        if len(sys.argv)>1 and sys.argv[1]!=device:continue
        context=browser.new_context(viewport={'width':390 if touch else 1280,'height':844 if touch else 900},device_scale_factor=1,has_touch=touch,is_mobile=touch)
        context.route_web_socket('**',lambda websocket:None);context.add_cookies([config['cookie']]);page=context.new_page()
        page.add_init_script("window.qaContextEvents=[];document.addEventListener('contextmenu',e=>queueMicrotask(()=>window.qaContextEvents.push({prevented:e.defaultPrevented})),true)")
        errors=[];page.on('pageerror',lambda error:errors.append(str(error)));cdp=context.new_cdp_session(page)
        def record(name,passed,details=None):
            item={'device':device,'check':name,'passed':bool(passed)}
            if details is not None:item['details']=details
            records.append(item);print(json.dumps(item),flush=True)
            if not passed:raise AssertionError(name)
        def snap():return page.evaluate('window.directorStudio.snapshot()')
        def plan():return snap()['stage']['design'].get('floorplan')
        def history():return int(re.search(r'(\d+) back',page.locator('[data-action="undo"]').get_attribute('title')).group(1))
        def tap(node):node.tap() if touch else node.click()
        def tool(name):return page.locator(f'button[data-tool="{name}"]')
        def act(name):
            target=page.locator(f'#floorplan-inspector-host [data-action="{name}"]') if name=='add-level' else page.locator(f'[data-action="{name}"]')
            tap(target)
        def field(name,value):
            node=page.locator(f'[data-field="{name}"]');node.fill(str(value));node.press('Tab')
        def world(x,z):return page.locator('.fp-svg').evaluate('(svg,p)=>{const v=svg.createSVGPoint();v.x=p[0];v.y=p[1];const q=v.matrixTransform(svg.getScreenCTM());return[q.x,q.y]}',[x,z])
        def center(node):
            b=node.bounding_box();return[b['x']+b['width']/2,b['y']+b['height']/2]
        def tap_world(x,z):
            q=world(x,z);page.touchscreen.tap(*q) if touch else page.mouse.click(*q)
        def shot(name):page.screenshot(path=str(OUT/f'{device}-{name}.png'))
        def drag(a,b,hold=0,cancel=False,preview=None):
            selection_before=page.evaluate('getSelection().toString()') if hold else None
            before_plan=plan() if preview else None
            def inspect_preview():
                # CDP touch moves can be delivered on the next compositor frame.
                page.locator('[data-placement-ghost][data-valid="true"]').wait_for(state='attached',timeout=3000)
                record(f'{preview}: valid ghost shown',page.locator('[data-placement-ghost][data-valid="true"]').count()==1)
                record(f'{preview}: hover does not commit',plan()==before_plan)
                shot(preview)
            if touch:
                cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':a[0],'y':a[1]}]})
                if hold:page.wait_for_timeout(hold)
                for i in range(1,11):cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':a[0]+(b[0]-a[0])*i/10,'y':a[1]+(b[1]-a[1])*i/10}]})
                if preview:inspect_preview()
                cdp.send('Input.dispatchTouchEvent',{'type':'touchCancel' if cancel else 'touchEnd','touchPoints':[]})
            else:
                page.mouse.move(*a);page.mouse.down()
                if hold:page.wait_for_timeout(hold)
                page.mouse.move(*b,steps=10)
                if preview:inspect_preview()
                if cancel:page.keyboard.press('Escape')
                page.mouse.up()
            if hold:
                selection_after=page.evaluate('getSelection().toString()')
                record(f'{preview}: no selection introduced',selection_before==selection_after=='',{'before':selection_before,'after':selection_after})
        def palette_drag(name,point=None,target=None,**kwargs):
            tool(name).scroll_into_view_if_needed()
            end=target() if target else world(*point)
            drag(center(tool(name)),end,**kwargs)
        def clean(label):
            info=page.evaluate('({selection:getSelection().toString(),menus:window.qaContextEvents.filter(e=>!e.prevented).length})')
            record(label,not info['selection'] and info['menus']==0,info)
        try:
            page.goto(config['url']+'/director',wait_until='domcontentloaded');page.wait_for_function('window.directorStudio?.ready',timeout=60000)
            tap(page.locator('#trip'));original_pose=snap()['pose']
            tap(page.locator('#mode-floorplan'));tap(tool('rectangle'));drag(world(0,0),world(4,3))
            record('Canvas room drawing still works',len(plan()['rooms'])==1)
            field('plan-name',f'Palette play {device}')
            base=plan();count=history()
            for name in ['stairs','elevator']:
                palette_drag(name,(2,1.5))
                record(f'{name}: one-level drag does not edit',plan()==base and history()==count)
                record(f'{name}: one-level setup explained','level' in page.locator('.fp-hint').inner_text().lower())
            shot('one-level-discovery')
            level_help=page.locator('.fp-hint [data-action="add-level"]')
            record('One-level guidance exposes visible Add level action',level_help.is_visible())
            tap(level_help);upper=plan()['activeLevelId'];ground=plan()['levels'][0]['id']
            field('level-elevation',0)
            page.locator('[data-field="level-select"]').select_option(ground)
            same_height=plan();count=history()
            palette_drag('stairs',(2,1.5))
            record('Same-elevation connector rejected',plan()==same_height and history()==count)
            page.locator('[data-field="level-select"]').select_option(upper);field('level-elevation',2.7)
            page.locator('[data-field="level-select"]').select_option(ground);act('fit')
            # Native input selection from filling the numeric elevation must not
            # be mistaken for selection introduced by a later toolbar gesture.
            tap(page.locator('.fp-hint-text'))
            positions={'door':(.75,0),'window':(4,1.5),'passage':(2.8,3),'stairs':(1,1.5),'elevator':(3,1.5)}
            moved={'door':(1.5,0),'window':(4,2),'passage':(1.8,3),'stairs':(1.5,1.5),'elevator':(3,2)}
            for name,point in positions.items():
                before=plan();count=history()
                palette_drag(name,point,hold=900,preview=f'{name}-drag-preview')
                after=plan()
                values=after['connectors'] if name in ['stairs','elevator'] else after['rooms'][0]['openings']
                record(f'{name}: toolbar drag places one item',len(values)==1 and values[0]['type']==name)
                record(f'{name}: one drag is one undo',history()==count+1)
                clean(f'{name}: longpress drag no selection/menu')
                drag(world(*point),world(*moved[name]))
                record(f'{name}: placed item moves',plan()!=after)
                record(f'{name}: one move is one undo',history()==count+2)
                act('undo');record(f'{name}: undo move restores exact item',plan()==after)
                act('undo');record(f'{name}: undo placement restores exact plan',plan()==before)
                act('redo');record(f'{name}: redo placement exact',plan()==after)
                act('undo')
                # A small tap remains tool selection, followed by plan placement.
                tap(tool(name));tap_world(*point)
                record(f'{name}: tap tool then tap plan',plan()!=before and history()==count+1)
                act('undo');record(f'{name}: tap placement undo exact',plan()==before)
                if name in ['door','window','passage']:
                    palette_drag(name,(2,1.5))
                    record(f'{name}: off-wall drop rejects without undo',plan()==before and history()==count)
                palette_drag(name,target=lambda:[page.locator('.fp-svg').bounding_box()['x']+10,page.locator('.fp-svg').bounding_box()['y']-15])
                record(f'{name}: outside drop rejects without undo',plan()==before and history()==count)
                palette_drag(name,target=lambda:center(page.locator('[data-action="fit"]')))
                record(f'{name}: overlay-control drop rejects without undo',plan()==before and history()==count)
                palette_drag(name,point,cancel=True)
                record(f'{name}: cancel preserves plan and history',plan()==before and history()==count)
                clean(f'{name}: cancellation leaves no selection/menu')

            # Play through the non-placement toolbar tools without injecting edits.
            before=plan();count=history();tap(tool('select'));tap_world(2,1.5)
            drag(world(2,1.5),world(2.25,1.5))
            record('Select: dragging room moves it once',plan()!=before and history()==count+1)
            act('undo');record('Select: undo returns exact room',plan()==before)
            tap(tool('pan'));old_view=page.locator('.fp-svg').get_attribute('viewBox');drag(world(2,1.5),world(2.5,1.5))
            record('Pan changes view only',page.locator('.fp-svg').get_attribute('viewBox')!=old_view and plan()==before and history()==count)
            act('fit')
            tap(tool('polygon'))
            for point in [(-.5,.5),(-.25,.5),(-.25,1),(-.5,1),(-.5,.5)]:tap_world(*point)
            record('Polygon: touch/click first point finishes room',len(plan()['rooms'])==2 and history()==count+1)
            act('undo');record('Polygon: one undo removes room',plan()==before)
            tap(tool('rectangle'));drag(world(-.5,1.5),world(-.25,2.25))
            record('Draw room remains canvas gesture',len(plan()['rooms'])==2 and history()==count+1)
            act('undo');record('Draw room one undo removes room',plan()==before)
            # Keep a useful result for preview and persistence receiving.
            for name,point in positions.items():palette_drag(name,point)
            final_plan=plan();record('All five placed items coexist',len(final_plan['rooms'][0]['openings'])==3 and len(final_plan['connectors'])==2)
            clean('Completed play has no text selection or unhandled menu');shot('complete-plan')
            act('preview');first=page.evaluate('window.directorStudio.scene.getFrameId()');page.wait_for_function('n=>window.directorStudio.scene.getFrameId()>n',arg=first,timeout=20000)
            record('Preview preserves edited plan and Trip pose',plan()==final_plan and snap()['pose']==original_pose)
            shot('preview');tap(page.locator('#mode-floorplan'))
            take_name=f'Palette receiving {device}'
            page.locator('#take-name').fill(take_name);page.locator('#take-name').press('Tab')
            with page.expect_response(lambda response:'/api/director' in response.url and response.request.method=='POST') as response_info:tap(page.locator('#save'))
            response=response_info.value;record('Save uses isolated local store',response.ok and response.json().get('shared') is False)
            page.reload(wait_until='domcontentloaded');page.wait_for_function('window.directorStudio?.ready',timeout=60000)
            record('Reload preserves plan and Trip pose',plan()==final_plan and snap()['pose']==original_pose)
            tap(page.locator('#mode-floorplan'));field('plan-name','Temporary play edit')
            tap(page.locator('#saved-takes button').filter(has_text=take_name).first)
            page.wait_for_function('name=>window.directorStudio.snapshot().stage.design.floorplan.name===name',arg=final_plan['name'])
            record('Saved take reopens exact plan and pose',plan()==final_plan and snap()['pose']==original_pose)
            record('No application exceptions',not [e for e in errors if 'dev-toolbar' not in e],errors)
        except Exception as error:
            item={'device':device,'check':'workflow exception','passed':False,'details':str(error)};records.append(item);print(json.dumps(item),flush=True)
            shot('failure')
        finally:context.close()
    browser.close()
suffix='all' if len(sys.argv)==1 else sys.argv[1]
(OUT/f'candidate-{suffix}-results.json').write_text(json.dumps(records,indent=2)+'\n')
