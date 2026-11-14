import fs from 'node:fs';
const db=JSON.parse(fs.readFileSync('public/data/database.json','utf8'));
const json=value=>JSON.stringify(value).replace(/<\//g,'<\\/');
const {images,quiz,...data}=db;
let html=fs.readFileSync('dist/index.source.html','utf8');
html=html.replace('</body>',`<script id="data" type="application/json">${json(data)}</script><script id="images" type="application/json">${json(images)}</script></body>`);
fs.writeFileSync('dist/index.html',html);fs.unlinkSync('dist/index.source.html');
// GitHub Pages is configured to publish the main branch's root.
for(const file of fs.readdirSync('dist'))fs.cpSync(`dist/${file}`,file,{recursive:true});
console.log('Generated GitHub Pages files at repository root.');
