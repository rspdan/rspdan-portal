"""Halp's explicit local-only Director play session. Credentials are read privately."""
from pathlib import Path
from datetime import datetime,timezone
from urllib.parse import urlparse
import json,time,hmac,hashlib,base64,uuid
from playwright.sync_api import sync_playwright
ROOT=Path('/workspace/rspdan-portal');OUT=ROOT/'docs/director/pass3/halp'
config=json.loads(Path('/workspace/scratch/director-ui-test-env.json').read_text())
payload=json.dumps({'user':'dan','exp':int(time.time()*1000)+3600000},separators=(',',':'))
token=base64.urlsafe_b64encode(payload.encode()).decode().rstrip('=')+'.'+hmac.new(config['PSPT_SECRET'].encode(),payload.encode(),hashlib.sha256).hexdigest()
playwright=sync_playwright().start();browser=playwright.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
context=browser.new_context(viewport={'width':1440,'height':1000},device_scale_factor=1)
context.add_cookies([{'name':'pspt_session','value':token,'url':'http://127.0.0.1:5174','sameSite':'Strict'}])
page=context.new_page();events=[];errors=[]
page.on('pageerror',lambda e:errors.append(str(e)))
def log(action,detail=None):
 events.append({'execution_utc':datetime.now(timezone.utc).isoformat(),'action':action,'detail':detail});(OUT/'events.json').write_text(json.dumps(events,indent=2)+'\n')
def snap():return page.evaluate('window.directorStudio?.snapshot()')
def capture(name):
 page.screenshot(path=str(OUT/(name+'.png')),full_page=True)
 (OUT/(name+'.json')).write_text(json.dumps({'execution_utc':datetime.now(timezone.utc).isoformat(),'source_stamp_raw':'DPS112426 7:16pm','status':page.locator('#status').inner_text(),'take':snap()},indent=2)+'\n');log('screenshot',name)
def field(selector,value):
 page.locator(selector).fill(str(value));page.locator(selector).press('Tab')
page.goto('http://127.0.0.1:5174/director',wait_until='domcontentloaded')
page.wait_for_function('window.directorError || window.directorStudio?.ready',timeout=90000)
assert not page.evaluate('window.directorError||null')
log('Opened local Director in independent desktop Chromium context',{'viewport':[1440,1000],'device_scale_factor':1,'source_stamp_raw':'DPS112426 7:16pm','physical_device':False})
capture('01-arrival')
print('HALP_PLAY_READY',flush=True)
