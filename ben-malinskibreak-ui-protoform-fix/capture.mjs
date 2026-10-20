import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch();
const receipts = [];
const route = '/docs/blume-examples/registry/base-nova/protoform/demo/catalog/';
for (const [side,port,sha] of [['before',55117,'a5333a2'],['after',55120,'eb8c7c6']]) {
 const context = await browser.newContext({viewport:{width:1000,height:900},locale:'en-US',timezoneId:'UTC',deviceScaleFactor:1});
 await context.addInitScript(()=>{if(!localStorage.getItem('blume-theme'))localStorage.setItem('blume-theme','light')});
 const page = await context.newPage();
 const r = {side,sha,errors:[],measurements:[]};
 page.on('pageerror',e=>r.errors.push(e.message));
 const open = path=>page.goto(`http://127.0.0.1:${port}${path}`);
 const capture = async(name,locator=page)=>{
  await page.evaluate(()=>document.fonts.ready);
  await locator.screenshot({path:`.context/break-ui/pr-media/${name}-${side}.png`,animations:'disabled'});
 };
 await open(`${route}protobuf-dynamic-json-any`);
 const object = page.getByTestId('autoform-field-object-value-control').getByRole('textbox');
 await object.fill('{"theme":'); await page.getByRole('button',{name:'Submit',exact:true}).click();
 // Include submitted payload on base and the editor error on candidate, with unchanged full-page framing.
 await capture('invalid-json',page.locator('form'));
 r.invalid={draft:await object.inputValue(),ariaInvalid:await object.getAttribute('aria-invalid'),success:await page.getByRole('status').count()};
 await open(`${route}protobuf-dynamic-json-any`);
 const scalar=page.getByTestId('autoform-field-scalar-or-nested-value-control').getByRole('textbox');
 await scalar.fill('0'); await scalar.blur(); await expect(scalar).toHaveValue(side === 'before' ? '{}' : '0'); await page.getByRole('button',{name:'Submit',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('"case": "numberValue"');
 // Waiting for the submitted payload ensures the original debounce settled before capture.
 await capture('zero-value',page.locator('form'));
 r.zero={editor:await scalar.inputValue(),payload:await page.getByRole('status').innerText()};
 await open(`${route}protobuf-dynamic-json-any`);
 const any = page.getByTestId('autoform-field-any-value-control');
 await capture('structured-labels',any);
 r.labels=await any.locator('input').evaluateAll(inputs=>inputs.map(input=>({id:input.id,label:input.labels?.[0]?.textContent,aria:input.getAttribute('aria-label')})));
 for(const theme of ['light','dark']){
  await page.evaluate(theme=>localStorage.setItem('blume-theme',theme),theme); await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
  const copy=page.getByRole('button',{name:'Copy JSON',exact:true}).first();
  await copy.focus(); await capture(`copy-${theme}`,page.getByTestId('autoform-field-object-value-control'));
 }
 await page.evaluate(()=>localStorage.setItem('blume-theme','light'));
 for(const width of [320,390,720,1280]){
  await page.setViewportSize({width,height:900}); await open('/docs/deeply-nested');
  const cidr=page.locator('input[name="architecture.networks.0.subnets.0.routes.0.destinationCidr"]');
  await expect(cidr).toHaveValue('0.0.0.0/0'); await cidr.scrollIntoViewIfNeeded(); await capture(`nested-${width}`);
  r.measurements.push({width,cidr:await cidr.boundingBox(),key:await page.getByPlaceholder('Key',{exact:true}).first().boundingBox(),value:await page.getByPlaceholder('Value',{exact:true}).first().boundingBox()});
 }
 await page.setViewportSize({width:320,height:844});
 await open('/docs/server-error-form'); await page.getByRole('textbox',{name:'Display name'}).fill('A'.repeat(40));
 await page.getByRole('textbox',{name:/^Email/}).fill('audit@example.com'); await page.getByRole('button',{name:'Submit',exact:true}).click();
 await expect(page.getByRole('status')).toContainText(`profiles/${'a'.repeat(40)}`); await page.getByRole('status').scrollIntoViewIfNeeded();
 await capture('profile-success'); r.profileWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
 await open('/docs/complex-example'); await page.getByRole('textbox',{name:/^Project ID/}).fill('a'.repeat(30));
 for(let i=0;i<3;i++)await page.getByRole('button',{name:'Continue',exact:true}).click();
 await page.getByRole('button',{name:'Submit',exact:true}).click(); await expect(page.getByRole('status')).toContainText(`environments/${'a'.repeat(30)}`);
 await page.getByRole('status').scrollIntoViewIfNeeded(); await capture('environment-success');
 r.environmentWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
 for(const width of [320,1280]){
  await page.setViewportSize({width,height:900});await open(`${route}protobuf-maps`);
  const group=page.getByTestId('autoform-field-bool-keys'); await group.getByRole('button',{name:'Add Bool Keys',exact:true}).click();
  await group.getByRole('switch').click(); await group.getByRole('textbox').fill('enabled');
  await group.scrollIntoViewIfNeeded(); await capture(`maps-${width}`);
 }
 await page.setViewportSize({width:1000,height:900});await open(`${route}protovalidate-all-errors`);
 await page.getByRole('textbox',{name:/^Email/}).fill('audit@example.com');
 const labels=page.getByTestId('autoform-field-labels');await labels.getByRole('button',{name:'Add pair',exact:true}).click();
 await labels.getByPlaceholder('Key',{exact:true}).fill('team');await labels.getByPlaceholder('Value',{exact:true}).fill('forms');
 const tags=page.getByTestId('autoform-field-tags');for(const value of ['tag1','tag2','tag3']){await tags.getByRole('button',{name:'Add Tags',exact:true}).click();await tags.getByRole('textbox').last().fill(value);}
 await page.getByRole('button',{name:'Submit',exact:true}).click();await tags.scrollIntoViewIfNeeded();await capture('collection-error',tags);
 r.collection={text:await tags.innerText(),aria:await tags.getAttribute('aria-invalid')};
 receipts.push(r);await context.close();
}
await browser.close();await writeFile('.context/break-ui/pr-media/captures.json',JSON.stringify(receipts,null,2));
