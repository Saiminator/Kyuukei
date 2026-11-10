const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const origin=process.env.SITE_URL||'http://127.0.0.1:4120';
const fixture=fs.readFileSync(path.join(__dirname,'fixtures/animated-cursor.gif'));
const report={checks:0,errors:[],assetRequests:[],remoteAssets:'Original S3 assets are simulated with a two-frame GIF because the cloud policy blocks that bucket.'};
function check(value,message){assert.ok(value,message);report.checks++}
async function ready(page,state='default'){
  await page.waitForFunction(s=>document.documentElement.dataset.cursorState===s&&document.querySelector('#customCursor').matches(':popover-open')&&document.documentElement.classList.contains('custom-cursor-active'),state);
}
async function noMotion(context){
  await context.addInitScript(()=>{
    // Deliberately suppress automatic entry/move events on the destination. The
    // new page must restore the cursor before any physical pointer movement.
    if(location.pathname==='/story/'){
      window.cursorMoves=0;
      for(const type of ['pointermove','pointerover','pointerenter'])document.addEventListener(type,event=>{if(type==='pointermove')window.cursorMoves++;event.stopImmediatePropagation()},true);
    }
  });
}
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  const castFixture=require('./returning-cast.cjs')();
  await context.route(origin+'/__test__/returning-cast/',route=>route.fulfill({contentType:'text/html',body:castFixture}));
  await noMotion(context);
  await context.route('https://kyuukei.s3.us-east-2.amazonaws.com/icon/*',async route=>{report.assetRequests.push(route.request().url());await route.fulfill({contentType:'image/gif',body:fixture})});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(origin+'/');await page.mouse.move(500,150);await ready(page);
  await page.waitForFunction(()=>document.querySelector('[data-cursor-image=default]').getAttribute('src').endsWith('/cursor.gif'));
  check(await page.locator('link[rel=icon]').getAttribute('href')==='https://kyuukei.s3.us-east-2.amazonaws.com/icon/comfavicon.gif','Original favicon URL');
  const first=await page.locator('#customCursor').screenshot();let changed=false;
  for(let i=0;i<6&&!changed;i++){await page.waitForTimeout(140);changed=!(await page.locator('#customCursor').screenshot()).equals(first)}
  check(changed,'GIF frames animate while the pointer stays still');
  await page.waitForTimeout(100);
  await page.evaluate(()=>{window.cursorMutations=0;new MutationObserver(records=>window.cursorMutations+=records.length).observe(document.querySelector('#customCursor'),{attributes:true,attributeFilter:['style']})});
  await page.waitForTimeout(500);check(await page.evaluate(()=>window.cursorMutations===0),'No continuous cursor-position animation loop when idle');
  const story=page.locator('.site-nav').getByRole('link',{name:'Story',exact:true});
  await story.hover();await ready(page,'select');
  await page.waitForFunction(()=>document.querySelector('[data-cursor-image=select]').getAttribute('src').endsWith('/cursor_select.gif'));
  const point=await story.boundingBox();const expected={x:point.x+point.width/2-4,y:point.y+point.height/2-4};
  await story.click();await page.waitForURL(origin+'/story/');await ready(page,'select');
  const restored=await page.locator('#customCursor').boundingBox();
  check(Math.abs(restored.x-expected.x)<2&&Math.abs(restored.y-expected.y)<2,'Position and link cursor restored after click navigation');
  check(await page.evaluate(()=>window.cursorMoves===0),'Restoration required no pointermove on the new page');
  check(await page.evaluate(()=>window.KyuukeiCursorBoot.saved?.inside===true),'New page starts with a validated saved position');
  await page.reload();await ready(page,'select');
  const reloaded=await page.locator('#customCursor').boundingBox();
  check(Math.abs(reloaded.x-expected.x)<2&&Math.abs(reloaded.y-expected.y)<2,'Position survives reload without moving the mouse');
  await page.goBack();await page.waitForURL(origin+'/');await ready(page,'select');
  check(await page.locator('#customCursor').isVisible(),'History navigation restores the custom cursor');
  await page.mouse.move(500,150);await ready(page);
  await page.goto(origin+'/__test__/returning-cast/');await page.locator('.registry-gate summary').click();await page.getByRole('button',{name:'Open profile for Kyuu'}).click();
  const close=page.getByRole('button',{name:'Close character profile'});await close.hover();await ready(page,'select');
  check(await page.locator('#customCursor').evaluate(el=>el.matches(':popover-open')),'Cursor stays above the modal top layer');
  await close.click();check(await page.locator('dialog[open]').count()===0,'Cursor does not intercept modal controls');
  await page.evaluate(()=>{const input=document.createElement('input');input.type='text';input.id='cursor-test-input';input.style.cssText='position:fixed;top:200px;left:200px;z-index:10';document.body.append(input)});
  await page.locator('#cursor-test-input').hover();await ready(page,'text');
  await page.waitForFunction(()=>document.querySelector('[data-cursor-image=text]').getAttribute('src').endsWith('/cursor_text.gif'));
  check(await page.locator('#customCursor').isVisible(),'Original animated text cursor is supported');
  await page.emulateMedia({reducedMotion:'reduce'});await page.mouse.move(600,160);await ready(page);
  check(await page.locator('[data-cursor-image=default]').getAttribute('src').then(src=>src.endsWith('.png')),'Reduced motion uses the static frame');
  await page.mouse.move(1439,999);await ready(page);
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight===document.body.scrollHeight),'Cursor at the edge does not add horizontal scrolling');
  // Broken/blocked GIFs must retain the local custom art, never an invisible cursor.
  const fallback=await browser.newContext({viewport:{width:1200,height:900},reducedMotion:'no-preference'});
  await fallback.route('https://kyuukei.s3.us-east-2.amazonaws.com/icon/*',route=>route.abort());
  const fallbackPage=await fallback.newPage();await fallbackPage.goto(origin+'/');await fallbackPage.mouse.move(450,150);await ready(fallbackPage);
  check(await fallbackPage.locator('[data-cursor-image=default]').getAttribute('src').then(src=>src.endsWith('.png')),'Unavailable GIFs retain local cursor art');
  await fallback.close();
  const noStorage=await browser.newContext({viewport:{width:1200,height:900}});
  await noStorage.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('Storage disabled','SecurityError')}}));
  await noStorage.route('https://kyuukei.s3.us-east-2.amazonaws.com/icon/*',route=>route.fulfill({contentType:'image/gif',body:fixture}));
  const locked=await noStorage.newPage();locked.on('pageerror',e=>report.errors.push(e.message));await locked.goto(origin+'/');await locked.mouse.move(450,150);await ready(locked);
  check(await locked.locator('#customCursor').isVisible(),'Storage restrictions do not break cursor rendering');await noStorage.close();
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const mobileRequests=[];
  await mobile.route('https://kyuukei.s3.us-east-2.amazonaws.com/icon/*',route=>{mobileRequests.push(route.request().url());return route.fulfill({contentType:'image/gif',body:fixture})});
  const phone=await mobile.newPage();await phone.goto(origin+'/');await phone.getByRole('button',{name:'Menu'}).tap();
  check(await phone.locator('#customCursor').isHidden()&&!await phone.evaluate(()=>document.documentElement.classList.contains('custom-cursor-active')),'Touch devices never show a cursor overlay');
  check(mobileRequests.every(url=>url.endsWith('/comfavicon.gif')),'Touch devices do not preload animated cursor assets');
  assert.deepEqual(report.errors,[],'No controller errors');await browser.close();
  const destination=process.env.TEST_ARTIFACTS||'/tmp/kyuukei-release-checks';fs.mkdirSync(destination,{recursive:true});fs.writeFileSync(path.join(destination,'cursor-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);process.exit(1)});
