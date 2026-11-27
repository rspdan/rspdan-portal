from pathlib import Path
import json,time,hmac,hashlib,base64,traceback
from playwright.sync_api import sync_playwright
root=Path('/workspace/rspdan-portal');out=root/'docs/director/pass3/head-flare-controls'
env=json.loads(Path('/workspace/scratch/director-ui-test-env.json').read_text())
payload=json.dumps({'user':'dan','exp':int(time.time()*1000)+3600000},separators=(',',':'))
token=base64.urlsafe_b64encode(payload.encode()).decode().rstrip('=')+'.'+hmac.new(env['PSPT_SECRET'].encode(),payload.encode(),hashlib.sha256).hexdigest()
r={'scope':'Actual integrated local Director UI, browser draft, undo/redo and local durable save/reopen. Desktop and mobile viewport emulation; no physical ACHE, no live Crew sends. Rendering judged separately.','checks':[],'errors':[]}
def check(name,ok,detail=None):
 r['checks'].append({'name':name,'passed':bool(ok),'detail':detail});assert ok,name
def context(b,mobile=False):
 c=b.new_context(viewport={'width':390,'height':844} if mobile else {'width':1100,'height':900},device_scale_factor=3 if mobile else 1,is_mobile=mobile,has_touch=mobile)
 c.add_cookies([{'name':'pspt_session','value':token,'url':'http://127.0.0.1:5174','sameSite':'Strict'}]);return c
def ready(c,path='/director'):
 page=c.new_page();page.route_web_socket('**',lambda ws:None);page.on('pageerror',lambda e:r['errors'].append(str(e)))
 page.goto('http://127.0.0.1:5174'+path,wait_until='domcontentloaded');page.wait_for_function('window.directorStudio?.ready || window.directorError',timeout=90000)
 check('page startup '+path,not page.evaluate('window.directorError||null'));return page
def value(page,id,v):
 page.locator('#'+id).evaluate('(e,v)=>{e.focus();e.value=String(v);e.dispatchEvent(new Event("input",{bubbles:true}));e.dispatchEvent(new Event("change",{bubbles:true}));e.blur();}',v)
def state(page):return page.evaluate('directorStudio.snapshot()')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 try:
  for mobile in [False,True]:
   c=context(b,mobile);page=ready(c);prefix='mobile ' if mobile else 'desktop '
   page.click('#trip');page.get_by_text('Character appearance',exact=True).click()
   check(prefix+'head flare starts off and visible',state(page)['tripFlare']==0 and page.locator('#trip-flare').is_visible() and page.locator('#trip-flare-label').text_content()=='Off')
   value(page,'trip-glow',1)
   check(prefix+'full glow does not enable flare',state(page)['tripGlow']==1 and state(page)['tripFlare']==0)
   value(page,'trip-flare',.63);before=state(page)
   check(prefix+'flare independent of unchanged glow',before['tripFlare']==.63 and before['tripGlow']==1 and page.locator('#trip-flare-label').text_content()=='63%')
   page.click('#undo');check(prefix+'undo restores only flare edit',state(page)['tripFlare']==0 and state(page)['tripGlow']==1)
   page.click('#redo');check(prefix+'redo restores flare',state(page)['tripFlare']==.63)
   value(page,'trip-glow',0);check(prefix+'turning glow off preserves directed flare',state(page)['tripGlow']==0 and state(page)['tripFlare']==.63)
   page.click('#ouch');check(prefix+'Ouch hides control without discarding Trip choice',not page.locator('#trip-flare').is_visible() and state(page)['tripFlare']==.63)
   page.click('#trip');check(prefix+'Trip restores flare control value',page.locator('#trip-flare').input_value()=='0.63')
   draft=page.evaluate('()=>{const k=Object.keys(localStorage).find(k=>k.startsWith("nest.director.draft.v1."));return JSON.parse(localStorage[k]);}')
   check(prefix+'draft includes independent flare and glow',draft['tripFlare']==.63 and draft['tripGlow']==0)
   page.screenshot(path=str(out/(prefix.strip()+'-controls.png')))
   if not mobile:
    with page.expect_response(lambda x:'/api/director' in x.url and x.request.method=='POST',timeout=30000) as response:
     page.click('#save')
    result=response.value.json();r['local_save']={'status':response.value.status,'shared':result.get('shared'),'id':result.get('saved',{}).get('id')}
    check('actual save accepted',response.value.status==200 and result.get('shared') is False)
    savedId=result['saved']['id'];record=page.evaluate('async id => (await (await fetch("/api/director?id="+encodeURIComponent(id))).json())',savedId);saved=record.get('take') or record['saved']['take'];r['saved_appearance']={k:saved[k] for k in ['look','tripGlow','tripFlare','tripTemperature','outline']}
    check('durable saved payload retains flare',saved['tripFlare']==.63 and saved['tripGlow']==0)
    c2=context(b);reopen=ready(c2,'/director?take='+savedId);reopen.wait_for_function('document.getElementById("status").textContent.includes("Saved take reopened")')
    reopened=state(reopen);check('fresh browser reopens exact appearance',all(reopened[k]==saved[k] for k in r['saved_appearance']))
    c2.close()
   c.close()
 except Exception:r['exception']=traceback.format_exc();print(r['exception'])
 finally:
  b.close();r['source_sha256']={name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in ['public/director/director.js','src/pages/director/index.astro','src/lib/directorSchema.js']};r['passed']=not r.get('exception') and not r['errors'] and all(x['passed'] for x in r['checks']);(out/'receiving.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({'passed':r['passed'],'checks':len(r['checks']),'errors':r['errors']}))
assert r['passed']
