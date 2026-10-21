import { expect,test } from '@playwright/test';
const route='/docs/blume-examples/registry/base-nova/protoform/demo/ui/shadcn-parity';
for(const theme of ['light','dark'])for(const width of [320,1000])for(const name of ['Basics','Overlays','Layout','Messages','Recipes']){
 test(`${theme} ${width} ${name}`,async({page})=>{
  await page.setViewportSize({width,height:1000});
  await page.addInitScript(theme=>localStorage.setItem('blume-theme',theme),theme);
  await page.goto(route);
  await page.getByRole('tab',{name,exact:true}).click();
  await expect(page.getByRole('tabpanel',{name,exact:true})).toBeVisible();
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  await expect(page.getByTestId('parity-'+({Basics:'foundations',Overlays:'overlays',Layout:'layout',Messages:'messages',Recipes:'recipes'}[name]))).toBeVisible();
  if(name==='Layout') await expect(page.getByRole('img',{name:'Sample requests by day'}).locator('.recharts-surface')).toBeVisible();
  if(name==='Messages') { await page.getByText('Sample event 1: request validated.',{exact:true}).scrollIntoViewIfNeeded(); await expect(page.getByText('Sample event 1: request validated.',{exact:true})).toBeVisible(); }
  await expect(page.getByTestId('shadcn-parity-example')).toHaveScreenshot(`catalog-${name.toLowerCase()}-${theme}-${width}.png`);
 });
}
