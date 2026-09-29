import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
const slug=process.argv[2];
if(!/^[a-z-]+$/.test(slug||'')) throw Error('Pass a module slug');
const profile=await mkdtemp(path.join(tmpdir(),'leilany-module-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-sandbox','--disable-gpu','--hide-scrollbars','--disable-component-update','--disable-background-networking','--remote-debugging-port=9342',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let socket;
try {
 let tabs;for(let i=0;i<50;i++){try{tabs=await(await fetch('http://127.0.0.1:9342/json')).json();break;}catch{await delay(100);}}
 socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise(r=>socket.addEventListener('open',r,{once:true}));
 let id=0;const pending=new Map(),errors=[],checks=[];
 socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);});
 const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;};
 const check=async(name,expression)=>{const passed=!!await evaluate(expression);checks.push({name,passed});if(!passed)throw Error(name);};
 await send('Page.enable');await send('Runtime.enable');
 await send('Page.navigate',{url:`http://localhost:3000/lab/${slug}`});
 for(let i=0;i<120;i++){if(await evaluate("!!document.querySelector('main input')"))break;await delay(250);}
 await delay(500);
 if(slug==='battery-lab') await check('default battery runtime',"document.querySelector('[data-testid=runtime]').textContent==='6.14'");
 if(slug==='furniture-budget'){
  await check('furniture default cost',"document.querySelector('[data-testid=build-cost]').textContent.includes('9,141')");
  await evaluate("[...document.querySelectorAll('main button')].find(b=>b.textContent.includes('Add part')).click()");await delay(100);
  await check('furniture adds part',"document.querySelectorAll('fieldset').length===5");
  await evaluate("document.querySelector('button[aria-label=\"Remove part 5\"]').click()");await delay(100);
  await check('furniture removes part',"document.querySelectorAll('fieldset').length===4");
 }
 if(slug==='quote-generator'){
  await check('incomplete quote cannot print',"[...document.querySelectorAll('main button')].find(b=>b.textContent.includes('Save as PDF')).disabled");
  await evaluate("[...document.querySelectorAll('main button')].find(b=>b.textContent.includes('Add item')).click()");await delay(100);
  await check('quote adds item',"document.querySelectorAll('fieldset').length===2");
  await evaluate("document.querySelector('button[aria-label=\"Remove item 2\"]').click()");await delay(100);
  await check('quote removes item',"document.querySelectorAll('fieldset').length===1 && document.querySelector('[data-testid=quote-total]').textContent.includes('5,000')");
  for(const [selector,text] of [['#business','Example Studio'],['#client','Example Client'],['input[placeholder]','Design service']]){
   await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);await send('Input.insertText',{text});await delay(80);
  }
  await check('completed quote can print',"![...document.querySelectorAll('main button')].find(b=>b.textContent.includes('Save as PDF')).disabled");
  await send('Emulation.setEmulatedMedia',{media:'print'});
  await check('print hides editor and retains document',"getComputedStyle(document.getElementById('business').closest('section')).display==='none' && document.body.innerText.includes('Design service')");
  await send('Emulation.setEmulatedMedia',{media:'screen'});
 }
 if(slug==='finance-calculator'){
  await check('first twelve payments',"document.querySelectorAll('tbody tr').length===12");
  await evaluate("[...document.querySelectorAll('main button')].find(b=>b.textContent.includes('full schedule')).click()");await delay(100);
  await check('full amortization table',"document.querySelectorAll('tbody tr').length===36");
  await evaluate("[...document.querySelectorAll('main button')].find(b=>b.textContent.includes('first 12')).click()");
 }
 if(slug==='climate-ac-calculator'){
  await check('climate default capacity',"document.querySelector('[data-testid=cooling]').textContent.includes('6,000')");
  await evaluate("document.querySelector('main input[type=checkbox]').click()");await delay(100);
  await check('kitchen adjustment',"document.querySelector('[data-testid=cooling]').textContent.includes('10,000')");
  await evaluate("document.querySelector('main input[type=checkbox]').click()");
 }
 if(slug==='paint-calculator'){
  await check('paint default liters',"document.querySelector('[data-testid=liters]').textContent.includes('10.21')");
  await evaluate("document.querySelector('main input[type=checkbox]').click()");await delay(100);
  await check('ceiling adds paint',"document.querySelector('[data-testid=liters]').textContent.includes('14.61')");
  await evaluate("document.querySelector('main input[type=checkbox]').click();document.querySelectorAll('main button[aria-pressed]')[1].click()");await delay(100);
  await check('color selection does not alter estimate',"document.querySelector('[data-testid=liters]').textContent.includes('10.21') && document.querySelectorAll('main button[aria-pressed]')[1].getAttribute('aria-pressed')==='true'");
 }
 if(slug==='construction-materials'){
  await evaluate("document.querySelectorAll('main button[aria-pressed]')[1].click()");await delay(100);
  await check('wall mode and block quantity',"!!document.getElementById('blockLength') && document.querySelector('[data-testid=quantity]').textContent.includes('165')");
  await evaluate("document.querySelectorAll('main button[aria-pressed]')[0].click()");await delay(100);
  await check('slab mode restored',"!!document.getElementById('thickness') && !document.getElementById('blockLength')");
 }
 for(const width of [1440,1024,390]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
  for(const language of ['en','es'])for(const theme of ['light','dark']){
   await evaluate(`if(document.documentElement.lang!=='${language}')document.querySelector('.preference-controls button').click();if(document.documentElement.dataset.theme!=='${theme}')document.querySelectorAll('.preference-controls button')[1].click()`);
   await delay(90);
   await check(`${width} ${language} ${theme} no overflow`,"document.documentElement.scrollWidth <= innerWidth");
   await check(`${width} ${language} ${theme} renders`,"!!document.querySelector('h1') && !document.body.innerText.includes('NaN') && !document.body.innerText.includes('Infinity')");
   if(width!==1024 && language==='es' && theme==='dark'){
    const m=await send('Page.getLayoutMetrics');const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:m.cssContentSize.height,scale:1}});
    await writeFile(`qa/${slug}-${width}.png`,Buffer.from(shot.data,'base64'));
   }
  }
 }
 await check('numeric inputs have labels',"[...document.querySelectorAll('main input[type=number]')].every(e=>e.labels?.length)");
 const numeric=await evaluate("document.querySelector('main input[type=number]')?.id");
 if(numeric){
  await evaluate(`document.getElementById(${JSON.stringify(numeric)}).focus()`);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});await delay(100);
  await check('blank input marked invalid',`document.getElementById(${JSON.stringify(numeric)}).getAttribute('aria-invalid')==='true'`);
 }
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await check('reduced motion renders',"document.documentElement.scrollWidth <= innerWidth");
 await send('Page.navigate',{url:'http://localhost:3000/'});await delay(650);
 await check('Home links to module',`!!document.querySelector('a[href="/lab/${slug}"]')`);
 await send('Page.navigate',{url:'http://localhost:3000/lab'});await delay(650);
 await check('Lab links to module',`!!document.querySelector('a[href="/lab/${slug}"]')`);
 const result={slug,checks,errors};await writeFile(`qa/${slug}-review.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 if(errors.length)process.exitCode=1;
 await send('Browser.close');
} finally{socket?.close();chrome.kill();await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:300});}
