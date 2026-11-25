"""Local isolated browser receiving test. Never print authentication settings."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).parent
config = json.loads(Path('/workspace/scratch/floorplan-test-env.json').read_text())
checks, errors = [], []

def report(name, passed, details=None):
    record = {'check': name, 'passed': bool(passed)}
    if details is not None:
        record['details'] = details
    checks.append(record)
    print(json.dumps(record), flush=True)
    if not passed:
        raise AssertionError(name)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    context = browser.new_context(viewport={'width':1440, 'height':1000}, device_scale_factor=1)
    # Avoid development hot-reload navigation while other agents edit source.
    context.route_web_socket('**', lambda websocket: None)
    context.add_cookies([config['cookie']])
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    def snap():
        return page.evaluate('window.directorStudio.snapshot()')
    def plan():
        return snap()['stage']['design'].get('floorplan')
    def field(name, value):
        node = page.locator(f'[data-field="{name}"]')
        node.fill(str(value)); node.press('Tab')
    def action(name):
        page.locator(f'[data-action="{name}"]').click()
    def tool(name):
        page.locator(f'button[data-tool="{name}"]').click()
    def point(x, z):
        return page.locator('.fp-svg').evaluate('''(svg, p) => {
          const v = svg.createSVGPoint(); v.x=p[0]; v.y=p[1];
          const q = v.matrixTransform(svg.getScreenCTM()); return [q.x,q.y];
        }''', [x,z])
    def click_world(x, z):
        page.mouse.click(*point(x,z))
    def drag_world(a,b):
        page.mouse.move(*point(*a)); page.mouse.down()
        page.mouse.move(*point(*b), steps=12); page.mouse.up()
    def screenshot(name):
        page.screenshot(path=str(OUT / name), full_page=True)
    try:
        page.goto(config['url'] + '/director', wait_until='domcontentloaded')
        page.wait_for_function('window.directorStudio?.ready', timeout=60000)
        original_pose = snap()['pose']
        page.locator('#take-name').fill('Floor plan receiving test')
        page.locator('#take-name').press('Tab')
        page.locator('#mode-floorplan').click()
        field('plan-name', 'Receiving courtyard')
        page.locator('[data-field="units"]').select_option('m')
        tool('rectangle'); drag_world((-4,-2),(0,2))
        report('Draw first room by pointer', len(plan()['rooms']) == 1)
        field('room-name','Library')
        first_id = plan()['rooms'][0]['id']
        tool('rectangle'); drag_world((0,-2),(4,2))
        report('Draw adjacent room by pointer', len(plan()['rooms']) == 2)
        field('room-name','Theater')
        second_id = plan()['rooms'][1]['id']
        tool('door'); click_world(0,0)
        report('Shared wall door stored once', sum(len(r['openings']) for r in plan()['rooms']) == 1)
        tool('window'); click_world(2,-2)
        report('Window placement', sum(o['type']=='window' for r in plan()['rooms'] for o in r['openings']) == 1)
        screenshot('desktop-adjacent-rooms.png')

        tool('select'); click_world(-2,0)
        page.get_by_text('Corner coordinates', exact=True).click()
        vertex = page.locator('[data-field="vertex"][data-index="0"][data-axis="0"]')
        vertex.fill('-4.5'); vertex.press('Tab')
        report('Numeric vertex edit', plan()['rooms'][0]['points'][0][0] == -4.5)
        action('undo')
        report('Undo vertex', plan()['rooms'][0]['points'][0][0] == -4)
        action('redo')
        report('Redo vertex', plan()['rooms'][0]['points'][0][0] == -4.5)
        # Keyboard history is intentionally scoped to the drawing surface.
        page.locator('.fp-surface').focus(); page.keyboard.press('Control+z')
        report('Keyboard undo', plan()['rooms'][0]['points'][0][0] == -4)
        page.keyboard.press('Control+Shift+z')
        report('Keyboard redo', plan()['rooms'][0]['points'][0][0] == -4.5)
        # Drag a visible vertex and inspect the resulting canonical coordinate.
        action('fit')
        drag_world((-4.5,-2),(-4.75,-2))
        report('Drag vertex', plan()['rooms'][0]['points'][0][0] == -4.75)

        ground = plan()['activeLevelId']
        action('add-level'); field('level-name','Control room')
        upper = plan()['activeLevelId']
        report('Second level', len(plan()['levels']) == 2 and upper != ground)
        tool('rectangle'); drag_world((-2,-1),(2,2))
        field('room-name','Control')
        tool('stairs'); click_world(1,1)
        report('Stair level connection', len(plan()['connectors']) == 1 and plan()['connectors'][0]['toLevelId'] == ground)
        field('connection-name','Library stair')
        field('connection-rotation','90')
        report('Connection inspector edit', plan()['connectors'][0]['rotation'] == 90)
        tool('elevator'); click_world(-1,0)
        report('Elevator connection', len(plan()['connectors']) == 2 and plan()['connectors'][1]['type'] == 'elevator')
        screenshot('desktop-upper-level.png')

        with page.expect_download() as download_info:
            action('export')
        download = download_info.value
        exported_path = OUT / 'ui-export.floorplan.json'
        download.save_as(exported_path)
        exported = json.loads(exported_path.read_text())
        report('Portable package export', exported['schema'] == 'nest-floorplan-package/v1' and exported['plan'] == plan() and bool(exported['geometry']['walls']))
        before_import = plan()
        field('plan-name','Temporary overwrite')
        page.locator('.fp-file-input').set_input_files(str(exported_path))
        page.wait_for_function("window.directorStudio.snapshot().stage.design.floorplan.name === 'Receiving courtyard'")
        report('Package import round trip', plan() == before_import)
        page.locator('.fp-file-input').set_input_files({'name':'malformed.json','mimeType':'application/json','buffer':b'{"schema":"nest-floorplan/v1","levels":[]}'})
        page.wait_for_function("document.querySelector('.fp-hint').textContent.includes('not imported')")
        report('Invalid import preserves plan', plan() == before_import)
        screenshot('desktop-invalid-import.png')

        page.locator('[data-field="level-select"]').select_option(ground)
        before_preview = plan()
        action('preview')
        page.wait_for_function("document.querySelector('#mode-stage').getAttribute('aria-pressed') === 'true'")
        page.wait_for_timeout(800)
        screenshot('desktop-3d-preview.png')
        report('3D preview retains plan and character pose', plan() == before_preview and snap()['pose'] == original_pose)
        page.locator('#mode-floorplan').click()
        report('Return to overhead', page.locator('.fp-svg').is_visible() and plan() == before_preview)
        screenshot('desktop-complete-plan.png')
        page.reload(wait_until='networkidle')
        page.wait_for_function('window.directorStudio?.ready', timeout=60000)
        report('Reload draft persistence', plan() == before_preview)
        report('Reload pose preserved', snap()['pose'] == original_pose)
        page.locator('#mode-floorplan').click()
        with page.expect_response(lambda response: '/api/director' in response.url and response.request.method == 'POST') as response_info:
            page.locator('#save').click()
        response = response_info.value
        save_result = response.json()
        report('Save take isolated local storage', response.ok and save_result.get('shared') is False, {'status':response.status,'shared':save_result.get('shared')})
        page.wait_for_function("document.querySelector('#storage-label').textContent === 'LOCAL WORKSPACE'")
        field('plan-name','Edited after saved take')
        page.locator('#saved-takes button').filter(has_text='Floor plan receiving test').first.click()
        page.wait_for_function("window.directorStudio.snapshot().stage.design.floorplan.name === 'Receiving courtyard'")
        report('Reopen saved take', plan() == before_preview and snap()['pose'] == original_pose)
        screenshot('desktop-saved-reopened.png')
        # Audit every visible input for a real accessible label, using DOM labels.
        unlabeled = page.locator('#floorplan-inspector-host input,#floorplan-inspector-host select').evaluate_all('''nodes=>nodes.filter(n=>!n.labels?.length&&!n.getAttribute('aria-label')&&!n.getAttribute('aria-labelledby')).map(n=>n.dataset.field||n.className)''')
        report('Inspector fields accessible labels', not unlabeled, unlabeled)
        report('No application runtime errors', not [e for e in errors if 'dev-toolbar' not in e], errors)
    except Exception as error:
        screenshot('failure-desktop.png')
        checks.append({'check':'workflow exception','passed':False,'details':str(error)})
        print(json.dumps(checks[-1]), flush=True)
    finally:
        (OUT / 'desktop-results.json').write_text(json.dumps({'checks':checks,'pageErrors':errors},indent=2)+'\n')
        browser.close()
