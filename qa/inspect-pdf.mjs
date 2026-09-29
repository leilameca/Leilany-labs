// End-to-end downloads against a local production server or deployed URL.
// Requires Windows Chrome and MuPDF; override CHROME_PATH and MUTOOL_PATH.
import {spawn,execFileSync} from 'node:child_process';
import {mkdtemp,mkdir,readdir,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
const base=process.argv[2]||'http://localhost:3001';
const output=path.resolve('tmp/pdfs',new URL(base).hostname);
await mkdir(output,{recursive:true});
const profile=await mkdtemp(path.join(tmpdir(),'leilany-pdf-'));
const chrome=spawn(process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-sandbox','--disable-gpu','--disable-background-networking','--remote-debugging-port=9345',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const cases=[['solarcalc','solarcalc-estimate','consumption','1800','Panels','Paneles'],['electricity-consumption','electricity-consumption-estimate','input[type=number]','2','Monthly consumption','Consumo mensual'],['battery-lab','battery-lab-estimate','load','600','Backup time','Tiempo de respaldo'],['construction-materials','construction-materials-estimate','length','10','Net surface','Superficie neta'],['paint-calculator','paint-calculator-estimate','length','10','Paintable area','Área a pintar'],['climate-ac-calculator','climate-ac-estimate','length','6','Total capacity','Capacidad total'],['finance-calculator','finance-estimate','months','600','Full amortization','Amortización completa'],['quote-generator','quote','price-1','4321','Quotation','Cotización'],['furniture-budget','furniture-budget-estimate','hours','10','Build cost','Costo de fabricación'],['work-benefits-rd','work-benefits-rd-estimate','average','40000','Selected work benefits','Prestaciones laborales seleccionadas']];
let socket;const checks=[],errors=[];
try {
 let tabs;for(let n=0;n<100;n++){try{tabs=await(await fetch('http://127.0.0.1:9345/json')).json();break;}catch{await delay(100);}}
 assert(tabs,'Chrome did not start');socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise(r=>socket.addEventListener('open',r,{once:true}));let id=0;const pending=new Map();
 socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);});
 const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const wait=async expression=>{for(let n=0;n<160;n++){if(await evaluate(expression))return;await delay(100);}throw Error('Timeout: '+expression);};
 const set=async(selector,value)=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);await send('Input.dispatchKeyEvent',{type:'keyDown',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});if(value)await send('Input.insertText',{text:value});else{await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});}await delay(150);};
 await send('Page.enable');await send('Runtime.enable');
 await send('Page.navigate',{url:base});await wait("!!document.querySelector('.preference-controls button')");await delay(300);
 assert.equal(await evaluate("new Set([...document.querySelectorAll('a[href^=\"/lab/\"]')].map(a=>a.getAttribute('href'))).size"),10,'Home links to every tool');
 for(const [slug,filename,field,value,en,es] of cases){
  await send('Page.navigate',{url:base+'/lab/'+slug});await wait("!!document.querySelector('[data-testid=pdf-export]')");await delay(350);
  if(slug==='quote-generator'){
   assert(await evaluate("document.querySelector('[data-testid=pdf-export]').disabled"),'Incomplete quote blocked');
   await set('#business','Leilany Morán');await set('#client','Cliente de prueba');await set('input[placeholder]','Diseño e instalación');
   await set('textarea',('Condiciones: instalación y revisión, válida por 30 días. ').repeat(60));
  }
  const selector=field.includes('[')?field:'#'+field;
  if(slug==='work-benefits-rd'){
   await evaluate("document.getElementById('work-scope').value='other';document.getElementById('work-scope').dispatchEvent(new Event('change',{bubbles:true}))");await delay(100);
   assert(await evaluate("document.querySelector('[data-testid=pdf-export]').disabled"),'Unsupported work scenario blocked');
   await evaluate("document.getElementById('work-scope').value='ordinary';document.getElementById('work-scope').dispatchEvent(new Event('change',{bubbles:true}))");await delay(100);
  }
  const original=await evaluate(`document.querySelector(${JSON.stringify(selector)}).value`);
  await set(selector,'');assert(await evaluate("!document.querySelector('[data-testid=pdf-export]') || document.querySelector('[data-testid=pdf-export]').disabled"),slug+' invalid blocked');
  await set(selector,value);await wait("!!document.querySelector('[data-testid=pdf-export]') && !document.querySelector('[data-testid=pdf-export]').disabled");
  if(slug==='finance-calculator')assert.equal(await evaluate("document.querySelectorAll('tbody tr').length"),12);
  for(const language of ['es','en']){
   await evaluate(`if(document.documentElement.lang!=='${language}')document.querySelector('.preference-controls button').click()`);await delay(100);
   for(const theme of ['dark','light']){
    await evaluate(`if(document.documentElement.dataset.theme!=='${theme}')document.querySelectorAll('.preference-controls button')[1].click()`);
    await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
    assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),slug+' mobile overflow');
   }
   const dir=path.join(output,slug,language);await mkdir(dir,{recursive:true});
   // A separate directory per run prevents a previous download from passing.
   const downloadDir=await mkdtemp(path.join(dir,'run-'));
   await send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloadDir});
   await evaluate("document.querySelector('[data-testid=pdf-export]').click()");
   let file;for(let n=0;n<200;n++){const names=await readdir(downloadDir);file=names.find(name=>name.endsWith('.pdf'));if(file)break;await delay(100);}
   assert(file,slug+' download missing');assert.equal(file,filename+'.pdf');
   const full=path.join(downloadDir,file);assert((await readFile(full)).subarray(0,5).toString()==='%PDF-');
   const extracted=execFileSync(process.env.MUTOOL_PATH||'C:/Program Files/FileOptimizer/Plugins64/mutool.exe',['draw','-F','txt',full],{encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']});
   assert(extracted.includes(language==='es'?es:en),slug+' localized result missing');
   assert(extracted.includes('LEILANY LABS'),slug+' footer missing');
   assert(!/NaN|Infinity|undefined/.test(extracted),slug+' invalid value in report');
   if(slug==='finance-calculator')assert(/600\s+(?:RD\$|DOP)\s*2,506\.40\s+(?:RD\$|DOP)\s*24\.82\s+(?:RD\$|DOP)\s*2,481\.58\s+(?:RD\$|DOP)\s*0\.00/.test(extracted),'Final payment and zero balance');
   const expected={solarcalc:'21','electricity-consumption':'264','battery-lab':'3.07','construction-materials':'5.28','paint-calculator':'16.37','climate-ac-calculator':'7,000','quote-generator':'4,321.00','furniture-budget':'10,021','work-benefits-rd':'187,998.32'};
   if(expected[slug])assert(extracted.includes(expected[slug]),slug+' changed calculation missing');
   if(slug==='quote-generator'){assert(extracted.includes('Leilany Morán'));assert(extracted.includes('Diseño e instalación'));assert(extracted.includes('Condiciones:'));}
   await writeFile(path.join(dir,'extracted.txt'),extracted);
   if(language==='es'){
    await evaluate("document.querySelector('[data-testid=pdf-export]').scrollIntoView({block:'center'})");await delay(100);
    const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(dir,'mobile.png'),Buffer.from(shot.data,'base64'));
   }
   checks.push({slug,language,passed:true,pdf:full});console.log('PASS',slug,language);
  }
  await set(selector,original);
 }
 assert.deepEqual(errors,[],'Runtime exceptions');
 await writeFile(path.join(output,'report.json'),JSON.stringify({base,checkedAt:new Date().toISOString(),checks,errors},null,2));
 console.log(`PASS: ${checks.length} PDF downloads; 10 validation guards; 40 mobile/theme checks; Home links`);
} finally {socket?.close();chrome.kill();}
