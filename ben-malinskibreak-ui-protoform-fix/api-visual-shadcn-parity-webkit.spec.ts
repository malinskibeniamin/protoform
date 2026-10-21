import { devices, webkit as browserType } from 'playwright';
import { expect } from '@rstest/playwright';
import { test as base } from '../../../scripts/e2e-test';
import { matchScreenshot } from '../../../scripts/e2e-screenshots';
const device=devices['Desktop Safari'];
const test=base.extend({page:async ({},use)=>{const browser=await browserType.launch(); try{ if(browser.browserType().name()!=='webkit')throw new Error('Incorrect engine'); const context=await browser.newContext({viewport:device.viewport,userAgent:device.userAgent,deviceScaleFactor:device.deviceScaleFactor,hasTouch:device.hasTouch,isMobile:device.isMobile,baseURL:'http://127.0.0.1:55013',locale:'en-US',timezoneId:'UTC'});const page=await context.newPage();await use(page);} finally{await browser.close();}}});
async function screen(target,name){await matchScreenshot(target, `.context/shadcn-parity/parity.visual.spec.ts-snapshots/${name.slice(0,-4)}-webkit-darwin.png`,{update:process.env.PROTOFORM_UPDATE_SCREENSHOTS==='true',timeout:10000});}

const route='/docs/blume-examples/registry/base-nova/protoform/demo/ui/shadcn-parity';
for(const theme of ['light','dark'])for(const width of [320,1000])for(const name of ['Basics','Overlays','Layout','Messages','Recipes']){
 test(`${theme} ${width} ${name}`,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width,height:1000});
  await page.addInitScript(theme=>localStorage.setItem('blume-theme',theme),theme);
  await page.goto(route);
  await page.getByRole('tab',{name,exact:true}).click();
  await expect(page.getByRole('tabpanel',{name,exact:true})).toBeVisible();
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  await expect(page.getByTestId('parity-'+({Basics:'foundations',Overlays:'overlays',Layout:'layout',Messages:'messages',Recipes:'recipes'}[name]))).toBeVisible();
  if(name==='Layout') await expect(page.getByRole('img',{name:'Sample requests by day'}).locator('.recharts-surface')).toBeVisible();
  if(name==='Messages') { await page.getByText('Sample event 1: request validated.',{exact:true}).scrollIntoViewIfNeeded(); await expect(page.getByText('Sample event 1: request validated.',{exact:true})).toBeVisible(); }
  await screen(page.getByTestId('shadcn-parity-example'),`catalog-${name.toLowerCase()}-${theme}-${width}.png`);
 });
}
