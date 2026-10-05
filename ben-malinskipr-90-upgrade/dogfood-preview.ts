import { readFile, readdir } from 'node:fs/promises';
const cssFiles = (await readdir('dist/_astro')).filter(file => file.endsWith('.css'));
const styleLinks = cssFiles.map(file => `<link rel="stylesheet" href="/docs/_astro/${file}">`).join('');
const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">${styleLinks}</head><body><div id="app"></div><script type="module" src="/fixture.js"></script></body></html>`;
const server = Bun.serve({hostname:'127.0.0.1',port:55190,async fetch(request){
 const url = new URL(request.url);
 if(url.pathname === '/tabs') return new Response(html,{headers:{'Content-Type':'text/html'}});
 if(url.pathname === '/fixture.js') return new Response(await readFile('.context/tabs-browser/tabs-dogfood-fixture.js'),{headers:{'Content-Type':'application/javascript'}});
 const path=url.pathname.replace(/^\/docs\/?/,'');
 const candidates = [`dist${url.pathname}`, `dist${url.pathname}/index.html`, `dist/${path}`, `dist/${path}/index.html`];
 for(const path of candidates){
  try {
   const file = Bun.file(path);
   if(await file.exists()) return new Response(file);
  } catch (error) { console.error(error); }
 }
 return new Response('Not found',{status:404});
}});
console.log(`Dogfood preview: http://${server.hostname}:${server.port}`);
