export type SkillBook={id:number;name:string;type:string;bookJobs?:string[];bookGroup?:string;bookSkills?:string[];bookKind?:string;bookGate?:number;bookSources?:{name:string;available:boolean;boss?:boolean}[]};
export function isSkillBook(i:SkillBook){return i.type==='技能書'||i.id>=2280000&&i.id<2300000}
export function bookAvailability(i:SkillBook){const s=i.bookSources||[];return s.some(x=>x.available)?'已開放來源':s.length?'僅未開放來源':'來源未標示'}
export function matchesBook(i:SkillBook,f:{q?:string;bookJob?:string;bookKind?:string;bookGate?:string;bookAvailability?:string}){
 const norm=(v:string)=>v.toLowerCase().replace(/\s+/g,'');
 return isSkillBook(i)&&(!f.q||norm([i.name,...i.bookSkills||[],...i.bookJobs||[],i.bookGroup||''].join(' ')).includes(norm(f.q)))&&(!f.bookJob||i.bookJobs?.includes(f.bookJob))&&(!f.bookKind||(i.bookKind||'其他技能書')===f.bookKind)&&(!f.bookGate||String(i.bookGate)===f.bookGate)&&(!f.bookAvailability||bookAvailability(i)===f.bookAvailability);
}
