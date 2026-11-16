import fs from 'node:fs';import assert from 'node:assert/strict';import ts from 'typescript';
const code=ts.transpileModule(fs.readFileSync('src/lib/skill-books.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {isSkillBook,matchesBook,bookAvailability}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const db=JSON.parse(fs.readFileSync('public/data/database.json','utf8')),books=db.items.filter(isSkillBook),ids=new Set(db.items.map(i=>i.id));
assert.equal(ids.size,db.items.length);assert.equal(books.length,134);assert.equal(books.filter(i=>i.bookGate).length,129);
for(const [mob,item] of db.links){assert.ok(db.mobs[mob]);assert.ok(ids.has(item))}
assert.ok(books.some(i=>matchesBook(i,{q:'楓葉祝福',bookJob:'大魔導士（冰雷）',bookGate:'20'})));
const fire=books.find(i=>i.bookJobs?.length===1&&i.bookJobs[0]==='大魔導士（火毒）');assert.ok(fire);assert.equal(matchesBook(fire,{bookJob:'主教'}),false);
const pending=books.find(i=>i.bookSkills?.includes('楓葉祝福')&&i.bookGate===30);assert.equal(bookAvailability(pending),'僅未開放來源');assert.equal(matchesBook(pending,{bookAvailability:'已開放來源'}),false);
const maternal=books.find(i=>i.bookKind==='技能母書');assert.ok(maternal);assert.equal(matchesBook(maternal,{bookKind:'精通書'}),false);
assert.equal(matchesBook(db.items.find(i=>i.type==='裝備'),{}),false);
console.log(`驗證通過：${books.length} 本技能書；職業、種類、上限、來源狀態篩選與掉落關係。`);
