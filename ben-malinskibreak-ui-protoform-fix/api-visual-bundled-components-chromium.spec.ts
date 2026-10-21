import { devices } from 'playwright';
import { expect } from '@rstest/playwright';
import { test as base } from '../../../scripts/e2e-test';
import { matchScreenshot } from '../../../scripts/e2e-screenshots';
const device=devices['Desktop Chrome'];
const test=base.extend({browserName:'chromium',playwright:{browserName:'chromium',contextOptions:{baseURL:'http://127.0.0.1:55013',locale:'en-US',timezoneId:'UTC',viewport:device.viewport,userAgent:device.userAgent,deviceScaleFactor:device.deviceScaleFactor,hasTouch:device.hasTouch,isMobile:device.isMobile}}});
async function screen(target,name){await matchScreenshot(target, `.context/bundled-components/bundled-ui.visual.spec.ts-snapshots/${name.slice(0,-4)}-chromium-darwin.png`,{update:process.env.PROTOFORM_UPDATE_SCREENSHOTS==='true',timeout:10000});}

const route='/docs/blume-examples/registry/base-nova/protoform/demo/ui/code-and-trace';
for (const theme of ['light','dark']) {
 for (const width of [320,1000]) {
  test(`${theme} ${width} bundled code and trace`, async ({page})=>{
   await page.setViewportSize({width,height:1000});
   await page.addInitScript(theme=>localStorage.setItem('blume-theme',theme),theme);
   await page.goto(route);
   const example=page.getByTestId('bundled-ui-example');
   await expect(example).toBeVisible();
   await screen(example,`bundled-${theme}-${width}-closed.png`);
   await page.getByRole('button',{name:'Wrap lines'}).click();
   await page.getByRole('button',{name:'CreateBook failed'}).click();
   await expect(page.getByLabel('Failure details')).toBeVisible();
   await screen(example,`bundled-${theme}-${width}-open.png`);
  });
 }
 test(`${theme} denied clipboard`,async ({page})=>{
  await page.setViewportSize({width:320,height:1000});
  await page.addInitScript(theme=>{localStorage.setItem('blume-theme',theme);Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('Denied'))}});},theme);
  await page.goto(route);await page.getByRole('button',{name:'Copy',exact:true}).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await screen(page.getByTestId('bundled-ui-example'),`bundled-${theme}-clipboard-error.png`);
 });
}
