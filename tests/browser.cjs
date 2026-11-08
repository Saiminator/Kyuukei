const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const origin=process.env.SITE_URL||'http://127.0.0.1:4120';
const output=process.env.TEST_ARTIFACTS||'/tmp/kyuukei-release-checks';
const report={checks:0,audits:[],errors:[],requests:[],externalAssets:'Original S3 icon requests are fulfilled with the animated test fixture; production URLs remain unchanged.'};
function check(value,message){assert.ok(value,message);report.checks++}
async function audit(page,label){
  await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  const violations=await page.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})));
  report.audits.push({label,violations});assert.deepEqual(violations,[],label);
}
async function shot(page,name,fullPage=true){
  if(fullPage)await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0)});
  await page.screenshot({path:path.join(output,name+'.png'),fullPage});
}
function watch(page){
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('requestfailed',r=>report.errors.push('Failed: '+r.url()));
  page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+': '+r.url())});
  page.on('request',r=>report.requests.push(r.url()));
}
async function noDot(page){
  const state=await page.locator('.site-nav a[aria-current]').evaluate(el=>({content:getComputedStyle(el,'::after').content,current:getComputedStyle(el).color,other:getComputedStyle(el.closest('ul').querySelector('a:not([aria-current])')).color}));
  check(['none','normal'].includes(state.content),'Current tab has no dot pseudo-element');
  check(state.current!==state.other,'Current-tab text highlight remains');
}
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await context.route('https://kyuukei.s3.us-east-2.amazonaws.com/icon/*',route=>route.fulfill({contentType:'image/gif',body:fs.readFileSync(path.join(__dirname,'fixtures/animated-cursor.gif'))}));
  const page=await context.newPage();watch(page);
  for(const width of [320,390,768,1024,1440,1920]){
    await page.setViewportSize({width,height:1000});
    for(const route of ['/','/story/','/news/','/volumes/volume-1/','/volumes/volume-2/','/privacy/']){
      await page.goto(origin+route);await page.evaluate(()=>document.fonts.ready);
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' '+route+' has no overflow');
      check(await page.locator('h1').count()===1,'One main heading');
      if(route!='/privacy/')await noDot(page);
      if(route==='/')check(await page.locator('.opening-feature').getAttribute('data-featured-volume')==='1','Upcoming Volume 1 remains featured');
      if(route==='/volumes/volume-2/')check(await page.locator('.registry-section,.public-synopsis,dialog').count()===0,'Planned page has no description or cast');
      if(route==='/story/'&&width<=768){
        await page.getByRole('button',{name:'Menu'}).click();await noDot(page);
        check(await page.locator('.site-nav').isVisible(),'Mobile navigation opens');
        await page.getByRole('button',{name:'Menu'}).press('Escape');
        check(await page.getByRole('button',{name:'Menu'}).getAttribute('aria-expanded')==='false','Mobile menu closes with Escape');
      }
    }
  }
  await page.setViewportSize({width:1440,height:1000});await page.goto(origin+'/');
  check(await page.locator('meta[name=robots]').count()===0,'Production pages are indexable');
  check(await page.locator('link[rel=canonical]').getAttribute('href')==='https://kyuukei.com/','Production canonical host');
  await page.mouse.move(450,145);
  await page.waitForFunction(()=>document.documentElement.classList.contains('custom-cursor-active'));
  check(await page.locator('#customCursor [data-cursor-image=default]').getAttribute('src').then(src=>src.endsWith('Kyuu_01_Pointer.png')),'Reduced motion uses the static Kyuu pointer');
  const explore=page.getByRole('link',{name:'Explore the series'});await explore.hover();
  await page.waitForFunction(()=>document.documentElement.dataset.cursorState==='select');
  check(await page.locator('#customCursor [data-cursor-image=select]').getAttribute('src').then(src=>src.endsWith('Kyuu_13_Select.png')),'Reduced motion uses the static Kyuu select cursor');
  check(await page.locator('#customCursor').getAttribute('aria-hidden')==='true','Cursor is decorative and hidden from assistive technology');
  check(await page.locator('link[rel=icon]').getAttribute('href')==='https://kyuukei.s3.us-east-2.amazonaws.com/icon/comfavicon.gif','Original favicon restored');
  for(const file of ['Kyuu_01_Pointer.cur','Kyuu_13_Select.cur','Kyuu_01_Pointer.png','Kyuu_13_Select.png'])check((await page.request.get(origin+'/assets/'+file)).status()===200,'Cursor asset '+file);
  await audit(page,'Production home');await shot(page,'home-desktop');
  await page.goto(origin+'/story/');await audit(page,'Production catalog');await shot(page,'story-desktop');
  assert.deepEqual(await page.locator('.volume-copy h2 a').allTextContents(),['Volume 1','Volume 2','Volume 3','Volume 4']);report.checks++;
  await page.goto(origin+'/news/');
  check(await page.locator('.news-row').count()===9,'Nine real news posts replace the two design examples');
  const posts=await page.locator('.news-row').evaluateAll(links=>links.map(a=>a.getAttribute('href')));
  check(await page.getByRole('button',{name:'Subscribe',exact:true}).isDisabled(),'Unconfigured Kit signup is clearly unavailable');
  check(await page.getByText('Newsletter opening soon.',{exact:true}).isVisible(),'Honest signup status');
  check(await page.locator('form').count()===0,'No inactive form collects an email');
  await audit(page,'Production News');await shot(page,'news-desktop');
  for(const route of posts){await page.goto(origin+route);check(await page.locator('.post-content').innerText()!=='','Real news body renders');check(await page.locator('.post-content').innerText().then(t=>!t.includes('Sample announcement')),'No fictional news copy');await noDot(page)}
  await page.goto(origin+'/volumes/volume-1/');
  const opener=page.getByRole('button',{name:'Open profile for Kyuu'});await opener.click();
  check(await page.getByRole('dialog',{name:'Kyuu',exact:true}).isVisible(),'Profile dialog opens');
  check(await page.locator('dialog .character-profile-prose p').count()===3,'Volume-specific Markdown biography renders');
  await page.getByRole('button',{name:'Close character profile'}).hover();
  await page.waitForFunction(()=>document.documentElement.dataset.cursorState==='select'&&document.querySelector('#customCursor').matches(':popover-open'));
  check(await page.locator('#customCursor').evaluate(el=>el.matches(':popover-open')),'Cursor remains in the top layer over the dialog');
  await audit(page,'Production profile');await shot(page,'profile-desktop',false);
  await page.keyboard.press('Shift+Tab');check(await page.locator('.profile-dialog-content').evaluate(el=>el===document.activeElement),'Dialog traps reverse Tab');
  await page.keyboard.press('Escape');check(await opener.evaluate(el=>el===document.activeElement),'Dialog restores focus');
  await page.goto(origin+'/privacy/');await audit(page,'Production privacy');
  check(await page.getByText('Original cursor design: FungiWizard.',{exact:true}).count()===1,'Cursor attribution retained in Privacy Policy');
  for(const route of ['/about/','/questions/','/characters/','/stories/']){await page.goto(origin+route);await page.waitForURL(route==='/characters/'||route==='/stories/'?origin+'/story/':origin+'/');check(true,'Retired top-level page redirects')}
  const mobile=await browser.newContext({viewport:{width:320,height:740},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:'reduce'});
  await mobile.route('https://kyuukei.s3.us-east-2.amazonaws.com/icon/*',route=>route.fulfill({contentType:'image/gif',body:fs.readFileSync(path.join(__dirname,'fixtures/animated-cursor.gif'))}));
  const phone=await mobile.newPage();watch(phone);await phone.goto(origin+'/story/');await phone.getByRole('button',{name:'Menu'}).tap();await noDot(phone);
  check(await phone.locator('body').evaluate(el=>!getComputedStyle(el).cursor.includes('Kyuu_')),'Touch devices keep their native pointer behavior');
  await audit(phone,'320px mobile menu');await shot(phone,'mobile-menu-320',false);
  await phone.getByRole('button',{name:'Menu'}).tap();await phone.goto(origin+'/');await shot(phone,'home-mobile');
  check(report.requests.every(url=>url.startsWith(origin)||url.startsWith('data:')||url.startsWith('https://kyuukei.s3.us-east-2.amazonaws.com/icon/')),'Only site assets and the original Kyuukei image bucket load');
  assert.deepEqual(report.errors,[],'Browser errors and failed resources');
  await browser.close();fs.writeFileSync(path.join(output,'browser-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({checks:report.checks,audits:report.audits.length,errors:report.errors,artifacts:output}));
})().catch(error=>{console.error(error);fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'browser-failure.json'),JSON.stringify({error:error.message,report},null,2));process.exit(1)});
