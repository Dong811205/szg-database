/** Compatibility adapter; preserve source IDs, fields and TMS version metadata. */
export function normalizeData(source:any){
 const data={...source,items:source.items.map((i:any)=>({...i,gender:i.gender==='女角色'?'女限定':i.gender==='男角色'?'男限定':i.gender,equipCategory:i.equipCategory?.replace(/^武器[：:]\s*/, '武器 · ')}))};
 data.meta={...source.meta,equips:data.items.filter((i:any)=>i.type==='裝備').length,scrolls:data.items.filter((i:any)=>i.type==='卷軸'||i.id>=2040000&&i.id<2050000).length,relations:data.links.length};
 return data;
}
export function parseChangelog(html:string){
 const text=(s:string)=>s.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
 return [...html.matchAll(/<section\b[^>]*class="entry"[^>]*>([\s\S]*?)<\/section>/g)].map(m=>{const body=m[1];return {title:text(body.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1]||'資料更新'),date:text(body.match(/<p[^>]*class="date"[^>]*>([\s\S]*?)<\/p>/)?.[1]||''),entries:[...body.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map(x=>text(x[1]))}});
}

/** Sort all update cards together; accept slash, dot, dash and Chinese dates. */
export function sortChangelog<T extends {date:string}>(entries:T[]):T[]{
 const day=(value:string)=>{const m=value.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);return m?Number(m[1])*10000+Number(m[2])*100+Number(m[3]):0};
 return [...entries].sort((a,b)=>day(b.date)-day(a.date));
}
