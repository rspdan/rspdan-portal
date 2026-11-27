from pathlib import Path
import json,time,hmac,hashlib,base64
from playwright.sync_api import sync_playwright
root=Path('/workspace/rspdan-portal');out=root/'docs/director/pass3/final-review'
env=json.loads(Path('/workspace/scratch/director-ui-test-env.json').read_text())
payload=json.dumps({'user':'dan','exp':int(time.time()*1000)+3600000},separators=(',',':'))
token=base64.urlsafe_b64encode(payload.encode()).decode().rstrip('=')+'.'+hmac.new(env['PSPT_SECRET'].encode(),payload.encode(),hashlib.sha256).hexdigest()
completed=False
r={'checks':[],'page_errors':[],'scope':'Local browser, injected quota and mocked delayed Save response; no durable writes or Crew messages.'}
def check(name,ok,detail=None):
 r['checks'].append({'name':name,'passed':bool(ok),'detail':detail});assert ok,name
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 try:
  c=b.new_context(viewport={'width':1000,'height':900});c.add_cookies([{'name':'pspt_session','value':token,'url':'http://127.0.0.1:5174','sameSite':'Strict'}]);page=c.new_page();page.on('pageerror',lambda e:r['page_errors'].append(str(e)))
  page.goto('http://127.0.0.1:5174/director',wait_until='domcontentloaded');page.wait_for_function('window.directorStudio?.ready || window.directorError',timeout=90000);check('startup',not page.evaluate('window.directorError||null'))
  page.click('#mode-stage')
  page.evaluate('''()=>{
    const originalSet=Storage.prototype.setItem, originalFetch=window.fetch;
    Storage.prototype.setItem=function(k,v){if(k.startsWith('nest.director'))throw new DOMException('Injected quota','QuotaExceededError');return originalSet.call(this,k,v)};
    window.fetch=function(url,options){
      if(url==='/api/director' && options?.method==='POST') {
        window.capturedSave=JSON.parse(options.body);
        return new Promise(resolve=>{window.releaseSave=()=>resolve(new Response(JSON.stringify({shared:false,saved:{id:'fixture-delayed-save'}}),{status:200,headers:{'content-type':'application/json'}}))});
      }
      return originalFetch.apply(this,arguments);
    };
  }''')
  state=lambda:page.evaluate('''()=>{const e=new Event('beforeunload',{cancelable:true});dispatchEvent(e);return{status:document.getElementById('status').textContent,label:document.getElementById('storage-label').textContent,objects:directorStudio.snapshot().stage.design.objects.length,keys:directorStudio.snapshot().keyframes.length,guard:e.defaultPrevented,saveEnabled:!document.getElementById('save').disabled,sendDisabled:document.getElementById('send').disabled}}''')
  page.click('#add-stage-object');page.click('#save');page.wait_for_function('typeof window.releaseSave === "function"');check('submitted version has one object',page.evaluate('capturedSave.take.stage.design.objects.length')==1)
  page.click('#add-stage-object');check('editing continues during pending save',state()['objects']==2)
  page.evaluate('releaseSave()');page.wait_for_function("document.getElementById('status').textContent.includes('submitted take was saved')")
  after=state();r['after_delayed_save']=after
  check('older save does not clear failed current draft',after['label']=='DRAFT NOT SAVED' and after['guard'] and after['keys']==0)
  check('newer unsaved edits remain explicit',after['saveEnabled'] and after['sendDisabled'] and 'Newer edits still need Save take.' in after['status'] and 'Browser draft unavailable.' in after['status'])
  page.evaluate('''()=>{window.fetch=function(url,options){if(url==='/api/director'&&options?.method==='POST')return Promise.resolve(new Response(JSON.stringify({error:'Injected authentication failure: sign in again.'}),{status:401,headers:{'content-type':'application/json'}}));return Promise.resolve(new Response(JSON.stringify({takes:[]}),{status:200,headers:{'content-type':'application/json'}}));};}''')
  page.click('#save');page.wait_for_function("document.getElementById('status').textContent.includes('Injected authentication failure')")
  error=state();check('actionable API error survives draft warning',error['guard'] and 'Browser draft unavailable.' in error['status'] and 'Injected authentication failure: sign in again.' in error['status'])
  completed=True
 finally:
  b.close();r['source_sha256']=hashlib.sha256((root/'public/director/director.js').read_bytes()).hexdigest();r['passed']=completed and bool(r['checks']) and all(x['passed'] for x in r['checks']) and not r['page_errors'];(out/'quota-concurrent-recheck.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({'passed':r['passed'],'checks':len(r['checks']),'page_errors':r['page_errors']}))
