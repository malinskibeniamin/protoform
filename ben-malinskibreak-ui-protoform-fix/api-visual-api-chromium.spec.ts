import { devices } from 'playwright';
import { expect } from '@rstest/playwright';
import { test as base } from '../../../scripts/e2e-test';
import { matchScreenshot } from '../../../scripts/e2e-screenshots';
const engine='chromium';
const device=devices['Desktop Chrome'];
const test=base.extend({browserName:'chromium',playwright:{browserName:'chromium',contextOptions:{baseURL:'http://127.0.0.1:55013',locale:'en-US',timezoneId:'UTC',viewport:device.viewport,userAgent:device.userAgent,deviceScaleFactor:device.deviceScaleFactor,hasTouch:device.hasTouch,isMobile:device.isMobile}}});
for(const theme of ['light','dark'])for(const width of [320,1000]){
 test(`${engine} ${theme} ${width} API composition`,async({page})=>{
  await page.setViewportSize({width,height:1000});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(theme=>localStorage.setItem('blume-theme',theme),theme);
  await page.goto('/docs/blume-examples/registry/base-nova/protoform/demo/ui/shadcn-api');
  await expect(page.getByRole('button',{name:'Rendered action',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Show details',exact:true}).click();
  await expect(page.getByText('Cancelable Base UI events are preserved.')).toBeVisible();
  const root=page.getByTestId('shadcn-api-example');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  await matchScreenshot(root,`.context/shadcn-api/visual/api-${engine}.spec.ts-snapshots/api-${theme}-${width}-open.png`,{update:process.env.PROTOFORM_UPDATE_SCREENSHOTS==='true',timeout:10000});
  await root.screenshot({path:`.context/shadcn-api/current-${engine}-${theme}-${width}.png`,animations:'disabled',caret:'hide',scale:'css'});
 });
}
