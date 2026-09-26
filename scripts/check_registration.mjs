import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);

// The pilot contact must work without JavaScript and never load the retired form service.
export async function checkRegistration(browser) {
  for (const width of [390,1440]) {
    for (const javaScriptEnabled of [false,true]) {
      const context=await browser.newContext({viewport:{width,height:900},javaScriptEnabled});
      const external=[];
      await context.route('**/*',async route=>{
        const url=new URL(route.request().url());
        if(url.hostname!=='psoydo.com') { external.push(url.hostname); return route.abort(); }
        const path=url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;
        return route.fulfill({path:fileURLToPath(new URL(path.slice(1),root))});
      });
      const page=await context.newPage();
      await page.goto('https://psoydo.com/de/');
      if(javaScriptEnabled)await page.locator('#consent-decline').click();
      const contact=page.locator('#pilot-email');
      await contact.scrollIntoViewIfNeeded();
      assert.equal(await contact.isVisible(),true);
      assert.equal(await contact.getAttribute('href'),'mailto:info@wescaleit.com?subject=Psoydo%20Pilotanfrage');
      assert.equal(await page.locator('#pilot-contact iframe').count(),0);
      assert.equal(await page.locator('script[src*="typeform"]').count(),0);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      assert.deepEqual(external,[],'Pilot contact must not request external forms or measurement after denial');
      await page.screenshot({path:`/tmp/psoydo-browser-qa/pilot-email-${width}-${javaScriptEnabled}.png`});
      await context.close();
    }
    console.log('Pilot email contact passed:',width);
  }
}
