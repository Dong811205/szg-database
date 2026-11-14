export const STAT_NAMES=['力量','敏捷','智力','幸運','物攻','魔攻','命中','物防','魔防','迴避','生命','魔力','速度','跳躍'] as const;
export const GEAR_SLOTS=[
 ['weapon','武器'],['hat','帽子'],['top','上衣'],['bottom','褲裙'],['overall','套服'],
 ['gloves','手套'],['shoes','鞋子'],['cape','披風'],['earring','耳環'],['shield','盾牌'],
 ['face','臉飾'],['eye','眼飾'],['pendant','項鍊／墜飾'],['belt','腰帶'],['medal','勳章'],['collectibleGear','飾品']
] as const;
export type Side='a'|'b';
export type GearSelection={id:string;stats:Record<string,number>};
export type Loadout=Record<string,GearSelection>;
export type GearItem={id:number;name:string;type:string;target?:string;equipCategory?:string;job?:string;level?:number|null;detail?:string};
const weapons=new Set(['sword','twoSword','axe','twoAxe','mace','twoMace','dagger','wand','staff','spear','polearm','bow','crossbow','claw','knuckle','gun']);
export function zeros(){return Object.fromEntries(STAT_NAMES.map(k=>[k,0])) as Record<string,number>}
export function slotForItem(i:GearItem){if(weapons.has(i.target||'')||i.equipCategory?.startsWith('武器'))return 'weapon';return GEAR_SLOTS.some(([id])=>id===i.target)?i.target!:'collectibleGear'}
export function canUseJob(i:GearItem,job:string){const j=String(i.job||'');return /^(全職業|全職|所有職業|不限)$/.test(j)||j.split(/[／/、,，\s]+/).includes(job)}
export function optionsForSlot<T extends GearItem>(items:T[],slot:string,job:string){return items.filter(i=>i.type==='裝備'&&slotForItem(i)===slot&&canUseJob(i,job)).sort((a,b)=>(a.level??Infinity)-(b.level??Infinity)||a.name.localeCompare(b.name,'zh-Hant')||a.id-b.id)}
export function parseStats(i?:GearItem){const stats=zeros();if(i)for(const k of STAT_NAMES){const label=k==='生命'?'(?:生命|HP)':k==='魔力'?'(?:魔力|MP)':k;const m=(i.detail||'').match(new RegExp(label+'[：:]?\\s*([+-]?\\d+)'));if(m)stats[k]=Number(m[1])}return stats}
export function assignSlot(plan:Loadout,slot:string,selection:GearSelection):Loadout{const next={...plan};if(!selection.id){delete next[slot];return next}next[slot]=selection;if(slot==='overall'){delete next.top;delete next.bottom}else if(slot==='top'||slot==='bottom')delete next.overall;return next}
export function sumLoadout(plan:Loadout){const sums=zeros();for(const selection of Object.values(plan))for(const k of STAT_NAMES)sums[k]+=Number(selection.stats[k]||0);return sums}
export function pruneByJob(plan:Loadout,items:GearItem[],job:string){const map=new Map(items.map(i=>[String(i.id),i]));return Object.fromEntries(Object.entries(plan).filter(([,g])=>g.id==='custom'||(map.has(g.id)&&canUseJob(map.get(g.id)!,job)))) as Loadout}
/** Preserve the previous single-item selection and all hand-edited stats. */
export function migrateLoadouts<T extends {a:Record<string,number>;b:Record<string,number>;ida:string;idb:string;loadouts?:Record<Side,Loadout>;gearVersion?:number;job:string}>(saved:T,items:GearItem[]):T&{loadouts:Record<Side,Loadout>;gearVersion:number}{
 if(saved.gearVersion===1&&saved.loadouts)return saved as T&{loadouts:Record<Side,Loadout>;gearVersion:number};
 const next={...saved,gearVersion:1,loadouts:{a:{},b:{}} as Record<Side,Loadout>};
 for(const side of ['a','b'] as const){const id=saved[side==='a'?'ida':'idb'];const item=items.find(i=>String(i.id)===id);if(item&&canUseJob(item,saved.job)){next.loadouts[side][slotForItem(item)]={id,stats:{...zeros(),...saved[side]}};next[side]=zeros()}next[side==='a'?'ida':'idb']=''}
 return next;
}
