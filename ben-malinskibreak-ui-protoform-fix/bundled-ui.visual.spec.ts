import { expect, test } from '@playwright/test';
const route='/docs/blume-examples/registry/base-nova/protoform/demo/ui/code-and-trace';
for (const theme of ['light','dark']) {
 for (const width of [320,1000]) {
  test(`${theme} ${width} bundled code and trace`, async ({page})=>{
   await page.setViewportSize({width,height:1000});
   await page.addInitScript(theme=>localStorage.setItem('blume-theme',theme),theme);
   await page.goto(route);
   const example=page.getByTestId('bundled-ui-example');
   await expect(example).toBeVisible();
   await expect(example).toHaveScreenshot(`bundled-${theme}-${width}-closed.png`);
   await page.getByRole('button',{name:'Wrap lines'}).click();
   await page.getByRole('button',{name:'CreateBook failed'}).click();
   await expect(page.getByLabel('Failure details')).toBeVisible();
   await expect(example).toHaveScreenshot(`bundled-${theme}-${width}-open.png`);
  });
 }
 test(`${theme} denied clipboard`,async ({page})=>{
  await page.setViewportSize({width:320,height:1000});
  await page.addInitScript(theme=>{localStorage.setItem('blume-theme',theme);Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('Denied'))}});},theme);
  await page.goto(route);await page.getByRole('button',{name:'Copy',exact:true}).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByTestId('bundled-ui-example')).toHaveScreenshot(`bundled-${theme}-clipboard-error.png`);
 });
}
