"""Halp's isolated, local UI play session; credentials remain outside this folder."""
from pathlib import Path
from datetime import datetime, timezone
import json
from playwright.sync_api import sync_playwright

OUT = Path(__file__).parent
settings = json.loads(Path('/workspace/scratch/floorplan-test-env.json').read_text())
p = sync_playwright().start()
browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
context = browser.new_context(viewport={'width':1440, 'height':1000}, accept_downloads=True)
context.add_cookies([settings['cookie']])
page = context.new_page()
errors = []
mutations = []
page.on('pageerror', lambda e: errors.append(str(e)))
page.on('request', lambda r: mutations.append({'method':r.method,'path':r.url.split('?')[0].replace(settings['url'],'')}) if r.method not in ('GET','HEAD','OPTIONS') else None)
page.goto(settings['url']+'/director', wait_until='domcontentloaded')
page.wait_for_function('window.directorStudio?.ready || window.directorError', timeout=90000)
def snap(name):
    page.screenshot(path=str(OUT/name), full_page=True)
def state():
    return page.evaluate('directorStudio.snapshot().stage.design.floorplan')
def visible():
    print(page.locator('body').inner_text()[:14000])
print('Local Director session ready. Credentials are not printed or saved here.')
snap('01-entry.png')
visible()
