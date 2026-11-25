"""Bee next-round actual UI play; no product changes or remote saves."""
import json
import hashlib
from urllib.parse import urlparse
import sys
import traceback
from pathlib import Path
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright

OUT = Path(__file__).parent
config = json.loads(Path('/workspace/scratch/floorplan-test-env.json').read_text())
errors = []
events = []
assets = []
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    desktop = browser.new_context(viewport={'width':1440,'height':1000},device_scale_factor=1)
    mobile = browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
    for context in [desktop,mobile]:
        context.add_cookies([config['cookie']])
    page = desktop.new_page()
    touch = mobile.new_page()
    def asset_response(response):
        name=urlparse(response.url).path
        if '/director/floorplan-' not in name or not name.endswith(('.js','.css')):
            return
        try:
            assets.append({'path':name,'at':datetime.now(timezone.utc).isoformat(),'status':response.status,'sha256':hashlib.sha256(response.body()).hexdigest()})
        except Exception as e:
            assets.append({'path':name,'body_hash_error':type(e).__name__})
    for label, tab in [('desktop',page),('touch',touch)]:
        tab.on('pageerror',lambda e,label=label:errors.append({'surface':label,'error':str(e)}))
        tab.on('response',asset_response)
    touch.goto(config['url']+'/director',wait_until='domcontentloaded')
    touch.wait_for_function('window.directorStudio?.ready',timeout=60000)
    touch.locator('#mode-floorplan').tap()
    print(json.dumps({'ready':True,'url':config['url'],'touchTitle':touch.title(),'desktop':'inactive blank tab'}),flush=True)
    scope=globals()
    for line in sys.stdin:
        try:
            request=json.loads(line)
            if request.get('finish'):
                break
            events.append({'at':datetime.now(timezone.utc).isoformat(),'code':request['code']})
            exec(compile(request['code'],'bee-play-command','exec'),scope,scope)
            print(json.dumps({'done':True}),flush=True)
        except Exception as e:
            print(json.dumps({'error':type(e).__name__,'detail':str(e)[:1000]}),flush=True)
        (OUT/'session-actions.json').write_text(json.dumps(events,indent=2)+'\n')
        (OUT/'page-errors.json').write_text(json.dumps(errors,indent=2)+'\n')
        (OUT/'loaded-assets.json').write_text(json.dumps(assets,indent=2)+'\n')
    browser.close()
