import fs from 'node:fs';
const db=JSON.parse(fs.readFileSync('public/data/database.json','utf8'));
const json=value=>JSON.stringify(value).replace(/<\//g,'<\\/');
const {images,quiz,...data}=db;
let html=fs.readFileSync('dist/index.source.html','utf8');
html=html.replace('</body>',`<script id="data" type="application/json">${json(data)}</script><script id="images" type="application/json">${json(images)}</script></body>`);
fs.writeFileSync('dist/index.html',html);fs.unlinkSync('dist/index.source.html');
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sections=db.changelog.map(e=>`<section class="entry"><h2>${esc(e.title)}</h2><p class="date">${esc(e.date)}</p><ul>${e.entries.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></section>`).join('');
const log=`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>上漲谷｜更新紀錄</title><script>location.replace("./#changelog")</script></head><body><main>${sections}</main></body></html>`;
fs.writeFileSync('public/changelog.html',log);fs.writeFileSync('dist/changelog.html',log);
// GitHub Pages is configured to publish the main branch's root.
for(const file of fs.readdirSync('dist'))fs.cpSync(`dist/${file}`,file,{recursive:true});
console.log('Generated GitHub Pages files at repository root.');
