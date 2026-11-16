"""Merge user-exported bootstrap and drops into the shared website snapshot."""
import argparse, collections, json
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('bootstrap');p.add_argument('drops');p.add_argument('--date',required=True);a=p.parse_args()
b=json.loads(Path(a.bootstrap).read_text());d=json.loads(Path(a.drops).read_text());path=Path('public/data/database.json');db=json.loads(path.read_text());before=json.loads(path.read_text());items={i['id']:i for i in db['items']}
labels={'incSTR':'力量','incDEX':'敏捷','incINT':'智力','incLUK':'幸運','incPAD':'物攻','incMAD':'魔攻','incACC':'命中','incPDD':'物防','incMDD':'魔防','incEVA':'迴避','incMHP':'生命','incMMP':'魔力','incSpeed':'速度','incJump':'跳躍'}
positions=dict(hat='帽子',top='上衣',bottom='褲裙',overall='套服',gloves='手套',shoes='鞋子',cape='披風',earring='耳環',shield='盾牌',face='臉飾',eye='眼飾',pendant='項鍊',belt='腰帶',medal='勳章',collectibleGear='飾品')
weapons=dict(sword='單手劍',twoSword='雙手劍',axe='單手斧',twoAxe='雙手斧',mace='單手棍',twoMace='雙手棍',dagger='短刀',wand='短杖',staff='長杖',spear='槍',polearm='矛',bow='弓',crossbow='弩',claw='拳套',knuckle='指虎',gun='火槍')
def image(x):
 u=x.get('icon') or x.get('img');return 'https://play.szg08.com'+u if u and u.startswith('/') else u
def detail(stats):return '、'.join(f'{label}{stats[key]:+g}' for key,label in labels.items() if isinstance(stats.get(key),(int,float)) and stats[key])
def base(x,kind):
 i=x['id'];return {**items.get(i,{}),'id':i,'name':x['name'],'type':kind,'description':x.get('description',''),'image':image(x) or items.get(i,{}).get('image'),'source':x.get('source','')}
for x in b['items'].values():
 if not isinstance(x.get('id'),int) or 2040000<=x['id']<2050000:continue
 i=x['id'];row=base(x,'技能書' if 2280000<=i<2300000 or x.get('type')=='技能書' else '道具');row.update(level=x.get('level'),slots=None,rate=None,target='',detail=detail(x.get('stats',{})));items[i]=row
# Canonical drop entries occur after starter aliases and win for shared numeric IDs.
for x in b['equipment'].values():
 i=x['id'];m=x.get('meta',{});t=x['equipmentType'];j=m.get('reqJob',0);job='全職業' if j==0 else '初心者' if j==-1 else '／'.join(name for bit,name in [(1,'劍士'),(2,'法師'),(4,'弓箭手'),(8,'盜賊'),(16,'海盜')] if j&bit)
 gender={0:'男角色',1:'女角色'}.get(i//1000%10,'男女通用')
 row=base(x,'裝備');row.update(level=m.get('reqLevel'),slots=m.get('tuc'),rate=None,target=t,detail=detail(m),job=job,gender=gender,equipCategory='武器：'+weapons[t] if t in weapons else positions.get(t,t),requirements={k:m[k] for k in ['reqLevel','reqJob','reqSTR','reqDEX','reqINT','reqLUK'] if k in m},stats={k:m[k] for k in labels if k in m});items[i]=row
for x in b['scrolls'].values():
 row=base(x,'卷軸');row.update(level=None,slots=None,rate=x.get('rate'),target=x.get('target',''),detail=detail(x.get('stats',{})));items[x['id']]=row
maps={x['id']:x for x in b['maps']};mobs=dict(db['mobs'])
for x in b['mobs']:
 mid=str(x.get('msId') or str(x['id']).removeprefix('gms'));prev=db['mobs'].get(mid,{})
 names=[m['name'] for m in b['maps'] if x['id'] in m.get('mobIds',[])]
 mobs[mid]={**prev,'name':x['name'],'level':x['lv'],'maps':names,'image':image(x),'hp':x.get('hp'),'xp':x.get('xp')}
links={tuple(r) for r in db['links']} if not d.get('drops') and d.get('deferredDropData') else set()
def add(mid,rows,place):
 mid=str(mid).removeprefix('gms')
 if mid not in mobs:raise ValueError('Unknown mob '+mid)
 for r in rows:
  iid=r['itemId']
  if iid not in items:raise ValueError('Unknown drop item '+str(iid))
  links.add((mid,iid,place))
for mid,rows in d['drops'].items():add(mid,rows,'')
for mapid,entries in d['mapDrops'].items():
 place=maps.get(mapid,{}).get('name')
 if not place:raise ValueError('Unknown map '+mapid)
 for mid,rows in entries.items():add(mid,rows,place)

fourth=b.get('fourth',{});skills={x['id']:x for x in b['skills']};jobs=b['jobs']
canonical_book_ids={b['items'][key]['id'] for key in fourth.get('books',{})}
links={r for r in links if r[1] not in canonical_book_ids}
for key,book in fourth.get('books',{}).items():
 x=b['items'][key];i=x['id'];row=items[i]
 jobkeys=list(dict.fromkeys(skills[sk]['job'] for sk in book.get('skills',[]) if sk in skills))
 names=[jobs[j]['name'] for j in jobkeys if j in jobs]
 families=[]
 for j in jobkeys:
  while j in jobs and jobs[j].get('tier',0)>1:j=jobs[j].get('parent','')
  if j in jobs and jobs[j]['name'] not in families:families.append(jobs[j]['name'])
 sources=[]
 for name in book.get('sources',[]):
  info=fourth.get('sources',{}).get(name,{})
  sources.append({'name':info.get('name',name),'available':info.get('available',False),'boss':info.get('boss',False)})
 row.update(type='技能書',name=x['name'],image=image(x),description=x.get('description',''),job='全職業' if set(families)=={'劍士','法師','弓箭手','盜賊','海盜'} else '／'.join(families),bookJobs=names,bookGroup=x['name'].split(']')[0].lstrip('['),bookGate=book.get('gate'),bookRate=book.get('rate'),bookSkills=[skills[k]['name'] for k in book.get('skills',[]) if k in skills],bookSources=sources,bookKind='技能母書' if book.get('gate')==10 else '精通書',detail=f"技能等級上限 {book['gate']}；成功率 {book['rate']}%")
for mid,group in fourth.get('bookDrops',{}).items():
 for key in group['keys']:
  if key not in b['items']:raise ValueError('Unknown skill book '+key)
  add(mid,[{'itemId':b['items'][key]['id']}],'')
for row in items.values():
 if row['type']=='技能書' and row['id'] not in canonical_book_ids:
  row['bookKind']='其他技能書';row['bookSources']=[]

db['items']=sorted(items.values(),key=lambda i:i['id']);db['mobs']=mobs;db['links']=sorted(links,key=lambda r:(r[0],r[1],r[2]))
counts={'equips':sum(i['type']=='裝備' for i in items.values()),'scrolls':sum(i['type']=='卷軸' for i in items.values()),'relations':len(links)}
db['meta'].update(counts,lastUpdated=a.date,version=b['version'],note=a.date+' 使用者匯出遊戲資料；掉落來源依遊戲資料保留，非台版 v113 正服核驗。')
old={i['id']:i for i in before['items']};new=[i for i in db['items'] if i['id'] not in old];changed=[i for i in db['items'] if i['id'] in old and any(i.get(k)!=old[i['id']].get(k) for k in ['name','level','slots','detail','job','gender','target','rate'])]
newgear=[i for i in new if i['type']=='裝備'];oldlinks={tuple(x)for x in before['links']}
report={'items':len(items),**counts,'mobs':len(mobs),'addedGear':[(i['id'],i['name']) for i in newgear],'changedGear':[(i['id'],i['name'])for i in changed if i['type']=='裝備'],'addedItems':len(new),'changedItems':len(changed),'addedLinks':len(links-oldlinks),'removedLinks':len(oldlinks-links)}
book_count=sum(i['type']=='技能書' for i in items.values())
db['meta'].update(skillBooks=book_count,generalDropsUpdated=False,generalDropsDate=before['meta'].get('generalDropsDate',before['meta']['lastUpdated']),skillBooksDate=a.date)
db['changelog']=[e for e in db['changelog'] if e['title']!=a.date.replace('-','/')+' 遊戲資料與技能書搜尋更新']
db['changelog'].insert(0,{'title':a.date.replace('-','/')+' 遊戲資料與技能書搜尋更新','date':a.date.replace('-','/'),'entries':[f"匯入新版遊戲資料：{counts['equips']} 件裝備、{book_count} 本技能書、{len(mobs)} 種怪物。",f"新增 {len(newgear)} 件裝備、{len(new)} 種物品；更新既有能力與說明。",'新增獨立技能書搜尋，可依名稱、技能、職業、書籍種類、技能上限與取得來源狀態篩選。','依本次四轉技能書設定更新成功率、適用四轉職業與專屬掉落；尚未開放來源另行標示。','本次匯出檔未含完整一般掉落表，一般掉落沿用先前快照；保留題庫、配裝設定及全站背景音樂。']})
report['skillBooks']=book_count
path.write_text(json.dumps(db,ensure_ascii=False,separators=(',',':'))+'\n');print(json.dumps(report,ensure_ascii=False,indent=2))
