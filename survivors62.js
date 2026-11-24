/* Eight additional persistent actors. Reuses B16 movement and AI21 decisions, not its legacy replacement loop. */
(()=>{'use strict';
const H=globalThis.SH,B=globalThis.B16,A=globalThis.BROWSER_AI21;if(!H||!B||!A)return;
const SPECS=[['city','An'],['city','Bình'],['industry','Chi'],['industry','Hải'],['forest','Lan'],['forest','Minh'],['snow','Nam'],['snow','Vy']].map(([zone,name],i)=>({id:'bot21_s62_'+(i+1),zone,name:'Bot '+name,i}));
const ids=new Set(SPECS.map(q=>q.id)),roster=new Map(),stats={ticks:0,thinks:0,paths:0,maxMs:0,lastMs:0,errors:[]};let started=false,cursor=0,last=performance.now(),indexAt=-1e9,saveAt=-1e9,marketAt=0,claimAt=0,grid=new Map();
const clone=x=>JSON.parse(JSON.stringify(x)),ownsID=id=>ids.has(id),owns=b=>!!b&&ownsID(b.id),netOK=()=>H.network62().mode==='offline',num=(v,d=0)=>Number.isFinite(v)?v:d;
const canAct=b=>owns(b)&&!b.dead&&!b.ai62?.waiting&&A.active&&H.S.on&&!H.S.dead&&!H.S.pz&&netOK();
function fresh(q){return{id:q.id,testBot:true,n:q.name,p:[0,2,3,4,2,0,3,4][q.i],c:Object.keys(H.SETS)[q.i%Object.keys(H.SETS).length],x:0,y:0,hp:100,mhp:100,food:100,water:100,sta:100,lives:3,dead:0,inv:{},axe:false,pick:false,home:null,inside:false,mode:'waiting-home',goal:null,path:null,pi:0,repath:0,cd:0,hurtBy:0,hurtT:-1e9,db:0,dbN:0,stuck:0,fx:1,kills:0,ai62:{version:1,zone:q.zone,waiting:true,terminal:false,nextThink:0,reviveAt:null,chDay:-1,chN:0,wet:0,dry:0,hypo:false,loss:0}}}
function get(id){return roster.get(id)||B.BOTS.find(b=>b.id===id)}
function reserved(h,b){return h.id===globalThis.CO?.site||globalThis.HOME24?.H.claims.has(h.id)||h.owner&&h.owner!==b.id||B.BOTS.some(o=>o!==b&&o.home===h.id&&(!o.dead||o.lives>0))}
function zoneOf(id){return /^na_tp/.test(id)?'city':/^na_k/.test(id)?'industry':/^na_r/.test(id)?'forest':/^na_nt/.test(id)?'snow':null}
function claim(b){if(b.ai62.terminal)return false;const safe=new Set((globalThis.XD15S?.SAFE||[]).map(q=>q[0]));
 const pool=NHA.EXTRA.filter(h=>safe.has(h.id)&&zoneOf(h.id)===b.ai62.zone&&h.st==='built'&&!reserved(h,b));
 // Keep an actor's legitimate existing ownership; never reassign another owner's home.
 pool.sort((x,y)=>(x.id===b.home?-1:y.id===b.home?1:0));
 for(const h of pool){const d=B.hDoor({id:h.id,x:h.cx,y:h.cy+1.6,lv:h.lv,ow:h.ow||0});if(!d.every(Number.isFinite)||B.blk(d[0],d[1]+.5))continue;
  h.owner=b.id;b.home=h.id;b.x=d[0];b.y=d[1]+.5;b.ai62.waiting=false;b.mode='idle';b.goal=b.path=b.target=null;A.meta(b);return true}
 b.home=null;b.ai62.waiting=true;b.inside=false;b.goal=b.path=null;b.mode='waiting-home';return false}
function attach(){if(!B.created||!globalThis.XD15S||!globalThis.NHA)return false;for(const q of SPECS){let b=roster.get(q.id),existing=B.BOTS.find(b=>b.id===q.id);if(existing&&existing!==b){if(b)Object.assign(existing,b);b=existing}if(!b)b=fresh(q);roster.set(q.id,b);A.meta(b);if(!B.BOTS.includes(b))B.BOTS.push(b)}started=true;return true}
const st=k=>k==='botB'?'botC':k==='berry'?'eat':k;
function used(b){let n=(b.axe?1:0)+(b.pick?1:0)+(A.meta(b).equipment.weapon?1:0);for(const[k,v]of Object.entries(b.inv))if(v>0)n+=Math.ceil(v/(H.X.STK[st(k)]||1));return n}
function room(b,k,n=1){if(!(n>0)||!Number.isInteger(n)||!Number.isFinite(n))return false;const cap=b.ai62?.cap||10,lim=H.X.STK[st(k)]||1,v=b.inv[k]||0;return used(b)-Math.ceil(v/lim)+Math.ceil((v+n)/lim)<=cap}
function fits(b,items,freed=0){let slots=used(b)-freed;const totals={...b.inv};for(const[k,n]of items){if(!Number.isInteger(n)||n<0)return false;const lim=H.X.STK[st(k)]||1;slots-=Math.ceil((totals[k]||0)/lim);totals[k]=(totals[k]||0)+n;slots+=Math.ceil(totals[k]/lim)}return slots<=(b.ai62.cap||10)}
function cancel(b,refund){const M=H.M19;for(const l of M.D.lst)if(l.own===b.id&&l.st==='open'){if(refund&&l.esc){const k=l.esc.k==='botC'?'botB':l.esc.k;b.inv[k]=(b.inv[k]||0)+l.esc.n}l.st='cancel';l.esc=null}if(M.TR.b===b)M.tradeCancel('Bot đã gục ngã')}
function die(b){if(!owns(b)||b.dead||b.ai62.terminal)return false;b.lives=H.GT<72?Math.max(0,b.lives-1):0;b.dead=1;b.hp=0;b.inside=false;b.goal=b.path=b.target=null;b.mode='dead';b.mv=b.run=false;cancel(b,b.lives>0);
 if(b.lives>0)b.ai62.reviveAt=H.GT+.1;else{b.ai62.terminal=true;b.ai62.reviveAt=null;const h=NHA.EXTRA.find(h=>h.id===b.home);if(h?.owner===b.id)h.owner='';b.home=null;b.inv={};A.meta(b).store={};b.axe=b.pick=false;A.meta(b).equipment={}}
 A.meta(b).replacementAt=null;B.putOTH(b);updateHUD();H.SAVE.save('survivor62-death',false,true);return true}
function cell(x,y){return Math.floor(x/32)+','+Math.floor(y/32)}
function rebuild(){grid=new Map();const add=(o,kind)=>{const x=o.x??o[1],y=o.y??o[2];if(!Number.isFinite(x)||!Number.isFinite(y))return;const k=cell(x,y);if(!grid.has(k))grid.set(k,[]);grid.get(k).push({o,kind,x,y})};
 for(const o of globalThis.R27?.RL||[])add(o,'resource');for(const o of H.trees)add(o,'tree');for(const o of H.ROCKS)add(o,'rock');for(const o of H.F4?.WC||[])add(o,'chest');for(const o of globalThis.KCN34?.actorSources62?.()||[])add(o,'industrial');indexAt=performance.now()}
function observe(b){if(performance.now()-indexAt>2000)rebuild();const m=A.meta(b),out={home:A.home(b),night:H.S.h>=22||H.S.h<6,toolCost:AI21_RECIPES().find(r=>r.eq==='t_axe')?.cost},best={};out.store=out.home?.store;
 const pick=(kind,o,x,y)=>{const d=(x-b.x)**2+(y-b.y)**2;if(d>48**2||d>=(best[kind]??Infinity)||W15.inLocked(x,y))return;best[kind]=d;out[kind]=o};
 for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++){const list=grid.get((Math.floor(b.x/32)+dx)+','+(Math.floor(b.y/32)+dy))||[];for(const{kind,o,x,y}of list){if(kind==='resource'&&o.on){if(o.t==='b')pick('food',o,x,y);else if(['w','s'].includes(o.t)&&room(b,o.t==='w'?'wood':'stone'))pick('item',o,x,y)}
 else if(kind==='tree'&&o.hp>0&&!o.dead&&!o.giant&&room(b,'wood',2))pick('tree',o,x,y);
 else if(kind==='rock'&&!o.gone&&/^(rock[123]|hrk[1-5])$/.test(o.hk||o[0])&&room(b,'stone',3))pick('rock',o,x,y);
 else if(kind==='chest'&&o.tk<0&&room(b,{B:'chB',S:'chS',G:'chG'}[o.tier]))pick('lootChest',o,x,y);
 else if(kind==='industrial'&&globalThis.KCN34?.actorReady62(o)&&used(b)<10)pick('lootIndustry',o,x,y)}}
 // Enemies remain in their native world/floor; no interior monsters can attack exterior bots.
 for(const e of H.ens){if(e.hp<=0||e.inside52||e.cityBoss53)continue;const d=Math.hypot(e.x-b.x,e.y-b.y);if(d<(b.p===1?15:9)&&(!out.threat||d<Math.hypot(out.threat.x-b.x,out.threat.y-b.y)))out.threat=e}
 if(!m.water62||m.water62.until<performance.now()||Math.hypot(b.x-m.water62.bx,b.y-m.water62.by)>8){let w=null;for(let r=2;r<=48&&!w;r+=4)for(let j=0;j<12;j++){const x=b.x+Math.cos(j/12*2*Math.PI)*r,y=b.y+Math.sin(j/12*2*Math.PI)*r;if(!B.blk(x,y)&&((W15.depthAt(x,y)>0&&W15.depthAt(x,y)<=.9)||(H.lkDist(x,y)<1.5&&!H.deepAt(x,y)))){w={x,y};break}}m.water62={w,bx:b.x,by:b.y,until:performance.now()+5000}}out.water=m.water62.w;
 const all=k=>(b.inv[k]||0)+(out.store?.[k]||0),cost=out.home&&NHA.botCost(out.home);out.rawReady=b.inv.botD>0&&m.stove;out.upgradeReady=!!cost&&Object.keys(cost).every(k=>all(k)>=cost[k]);return out}
function setGoal(b,mode,o){if(b.mode===mode&&b.goal?.ref===o)return;B.setGoal(b,mode,o.x??o[1],o.y??o[2],o)}
function think(b){const o=observe(b),m=b.ai62;stats.thinks++;m.nextThink=performance.now()+1300+SPECS.find(q=>q.id===b.id).i*70;
 // Existing chests are opened from the bot's own bag with native daily limits.
 for(const k of ['chB','chS','chG'])if(b.inv[k]>0&&H.F4.openForActor62(b,k))break;
 // Keep critical survival/fight/house decisions from Dung. Searching is a lower-priority action.
 for(const[k,n]of Object.entries(m.pending||{}))if(n>0&&room(b,k,n)){b.inv[k]=(b.inv[k]||0)+n;delete m.pending[k]}
 const d=AI_BRAIN21.decide(b,o);if(b.inside&&!o.threat&&((b.food<45&&!b.inv.eat&&!b.inv.berry&&!b.inv.bread&&!o.food)||(b.water<35&&!b.inv.wat&&!b.inv.botB&&!b.inv.botD&&!o.water))){B.leave(b);for(let k=0;k<8;k++){const ang=Math.random()*Math.PI*2,x=b.x+Math.cos(ang)*18,y=b.y+Math.sin(ang)*18;if(!B.blk(x,y)){B.setGoal(b,'explore',x,y);break}}return}if(!b.inside&&['explore','pick','chop','mine','food'].includes(d.type)&&!o.threat&&b.food>25&&b.water>25){const candidates=[['loot62-chest',o.lootChest],['loot62-industry',o.lootIndustry]].filter(q=>q[1]);candidates.sort((a,c)=>Math.hypot(a[1].x-b.x,a[1].y-b.y)-Math.hypot(c[1].x-b.x,c[1].y-b.y));const q=candidates[0];if(q&&(!b.goal||b.mode.startsWith('loot62'))){setGoal(b,q[0],q[1]);return}}
 if(b.mode.startsWith('loot62')&&b.goal&&!o.threat&&b.hp>45&&b.water>35&&b.food>35)return;
 if(d.type==='house'){house(b);return}if(d.type==='heal'){b.inv.med--;b.hp=Math.min(b.mhp,b.hp+45);return}
 A.decide(b,o);
 if(used(b)>=10&&!b.inside&&o.home&&!o.threat)B.setGoal(b,'home',...B.hDoor(o.home));
}
function house(b){const own=A.home(b);if(!own||own.owner!==b.id){b.inside=false;return}A.houseWork(b);if((H.S.h>=22||H.S.h<6)&&b.food>45&&b.water>40&&b.hp>45&&!b.inside)B.enter(b)}
function combat(b,dt){b.cd=Math.max(0,(b.cd||0)-dt);const target=b.target,meta=A.meta(b),def=10+(H.X.EQ[meta.equipment.armor]?.def||0);
 for(const e of H.ens){if(e.hp<=0||e.inside52||e.cityBoss53)continue;const d=Math.hypot(e.x-b.x,e.y-b.y);if(d>12)continue;const wall=H.F5.wallBetween?.(e.x,e.y,b.x,b.y);if(wall)continue;
  // Native enemy loop sleeps beyond 45m from player: advance only a nearby bot's eligible attacker once.
  if(Math.hypot(e.x-H.pos.x,e.y-H.pos.y)>45&&e._s62stamp!==stats.ticks){e._s62stamp=stats.ticks;e.cd=Math.max(0,num(e.cd)-dt);e.kb=Math.max(0,num(e.kb)-dt);if(d>1.25&&!b.inside){const sp=(H.enemy62(e.t)?.sp||2)*dt,x=e.x+(b.x-e.x)/d*sp,y=e.y+(b.y-e.y)/d*sp;if(!B.blk(x,e.y))e.x=x;if(!B.blk(e.x,y))e.y=y}}
  if(d<1.3&&e.cd<=0&&e.kb<=0){const dm=e.t==='n'?10:(H.enemy62(e.t)?.dm||8)*10/def*H.EM();b.hp-=dm;e.cd=1;b.hurtT=performance.now()}
 }
 if(b.mode==='fight'&&target){if(target.hp<=0||!H.ens.includes(target)){b.target=null;b.mode='idle';return}const d=Math.hypot(target.x-b.x,target.y-b.y);if(d>1.6){if(!b.goal||Math.hypot(b.goal.x-target.x,b.goal.y-target.y)>2)B.setGoal(b,'fight',target.x,target.y,target)}else if(b.cd<=0&&!H.F5.wallBetween?.(target.x,target.y,b.x,b.y)){b.cd=.6;target.hp-=A.damage(b);if(meta.equipment.weapon&&meta.weaponDur62!=null&&--meta.weaponDur62<=0)delete meta.equipment.weapon;if(target.hp<=0){const i=H.ens.indexOf(target);if(i>=0)H.ens.splice(i,1);if(target.t!=='n'&&!target.dg)H.X.WORLD.killed(target);b.kills++;meta.skill.combat++;b.target=null;b.goal=null;b.mode='idle'}}}
}
function survive(b,dt){b.food=Math.max(0,b.food-.3*dt);b.water=Math.max(0,b.water-.45*dt);if(b.food<=0||b.water<=0)b.hp-=1.5*dt;else if(b.food>40&&b.water>40)b.hp=Math.min(b.mhp,b.hp+.8*dt);if(!b.run)b.sta=Math.min(100,b.sta+(b.inside?20:14)*dt);
 if(b.db>0){b.db=Math.max(0,b.db-dt);const n=Math.min(10,Math.floor(10-b.db+1e-6));while(b.dbN<n){b.dbN++;b.hp-=2;b.sta=Math.max(0,b.sta-5)}if(b.db<=0)b.dbN=0}
 const t=b.mode==='chop'&&b.goal?.ref;if(t&&b.axe&&A.meta(b).durability.axe>0&&t.hp>0&&!t.giant&&Math.hypot(t.x-b.x,t.y-b.y)<2.3&&room(b,'wood',2)){b.path=null;b.ct=(b.ct||0)-dt;if(b.ct<=0){b.ct=.55;t.hp--;A.meta(b).durability.axe--;if(t.hp<=0){t.c.on=false;t.t0=H.GT;if(!H.felled.includes(t))H.felled.push(t);b.inv.wood=(b.inv.wood||0)+2;H.X.WORLD.emit('tree.fell',{id:t.id,by:b.id});b.goal=null;b.mode='idle'}if(A.meta(b).durability.axe<=0){b.axe=false;b.goal=null;b.mode='idle'}}}else if(t&&t.hp<=0){b.goal=null;b.mode='idle'}
 if(b.hp<=0)die(b)}
function defend(b,dt){const h=A.home(b);if(!h)return;const door=B.hDoor(h);for(const e of H.ens){if(e.hp<=0||e.inside52||e.cityBoss53||Math.hypot(e.x-door[0],e.y-door[1])>2.3)continue;
 if(Math.hypot(e.x-H.pos.x,e.y-H.pos.y)>45)e.cd=Math.max(0,num(e.cd)-dt);if(e.cd<=0){h.hp=Math.max(0,h.hp-10);e.cd=1}if(h.hp<h.mhp*.6||b.hp>65){B.leave(b);b.target=e;b.mode=b.hp<40?'flee':'fight';if(b.hp<40){const an=Math.atan2(b.y-e.y,b.x-e.x);B.setGoal(b,'flee',b.x+Math.cos(an)*10,b.y+Math.sin(an)*10)}break}}}
function advance(b,dt){if(b.ai62.waiting||b.ai62.terminal)return;if(b.dead){if(b.lives>0&&H.GT>=b.ai62.reviveAt){const h=A.home(b);if(!h){b.ai62.waiting=true;return}const p=B.hDoor(h);Object.assign(b,{dead:0,hp:60,food:Math.max(40,b.food),water:Math.max(40,b.water),sta:100,x:p[0],y:p[1]+.5,mode:'idle',db:0,dbN:0})}return}
 const home=A.home(b);if(!home||reserved(NHA.EXTRA.find(h=>h.id===b.home)||{},b)){b.ai62.waiting=true;b.inside=false;b.home=null;return}
 b.mv=b.run=false;if(b.inside){defend(b,dt)}else{combat(b,dt);if(b.hp<=0){die(b);return}const g=b.goal;if(g&&b.mode.startsWith('loot62')&&Math.hypot(b.x-g.x,b.y-g.y)<2.1){if(b.mode==='loot62-chest')H.F4.takeForActor62(b,g.ref);else globalThis.KCN34?.searchForActor62(b,g.ref);b.goal=b.path=null;b.mode='idle'}else if(g){if(b.mode==='mine'&&!room(b,'stone',3)||['pick','food'].includes(b.mode)&&!room(b,b.mode==='food'?'berry':g.ref?.t==='w'?'wood':'stone')){b.goal=b.path=null;b.mode='idle'}else{const had=B.ST.frameA;A.step(b,dt);if(!had&&B.ST.frameA)stats.paths++}}}
 survive(b,dt);B.putOTH(b)}
function craft(b,eq){if(!canAct(b)||!b.inside)return false;const r=AI21_RECIPES().find(r=>r.eq===eq||r.st===eq);if(!r||!['t_axe','t_pick','w1','med','botE'].includes(eq))return false;const m=A.meta(b),h=A.home(b);if(!h||h.owner!==b.id)return false;const all=k=>(b.inv[k]||0)+(h.store[k]||0)+(k==='eat'?(b.inv.berry||0):0);if(!Object.keys(r.cost).every(k=>all(k)>=r.cost[k]))return false;
 const projected={...b.inv};for(const[k,n]of Object.entries(r.cost)){let left=Math.max(0,n-(h.store[k]||0));const take=Math.min(left,projected[k]||0);projected[k]=(projected[k]||0)-take;left-=take;if(k==='eat')projected.berry=(projected.berry||0)-left;}const prev=b.inv;b.inv=projected;const fit=r.st?room(b,r.st):used(b)+1<=(b.ai62.cap||10);b.inv=prev;if(!fit)return false;
 for(const[k,n]of Object.entries(r.cost)){const v=Math.min(n,h.store[k]||0);h.store[k]=(h.store[k]||0)-v;const own=Math.min(n-v,b.inv[k]||0);b.inv[k]=(b.inv[k]||0)-own;if(k==='eat')b.inv.berry=(b.inv.berry||0)-(n-v-own)}
 if(eq==='t_axe'){b.axe=true;m.durability.axe=50}else if(eq==='t_pick'){b.pick=true;m.durability.pick=50}else if(r.eq){m.equipment.weapon=r.eq;m.weaponDur62=H.X.EQ[r.eq]?.dur||50}else b.inv[r.st]=(b.inv[r.st]||0)+1;return true}
function total(b,k){return H.M19.botHas(b,k)}
function reserve(b,k){return k==='bread'?3:k==='wat'||k==='botC'?3:k==='med'?2:k==='wood'?12:k==='stone'?10:k==='iron'?6:k==='part'?4:3}
function wanted(b){const h=A.home(b),cost=h&&NHA.botCost(h),need=[];if(b.water<65||total(b,'wat')+total(b,'botC')<2)need.push('wat','botC');if(b.food<65||total(b,'bread')<2)need.push('bread');if(b.hp<80&&total(b,'med')<2)need.push('med');if(cost)for(const k of Object.keys(cost))if(H.M19.TK.includes(k)&&total(b,k)<cost[k])need.push(k);return [...new Set(need)]}
function canTrade(id){const b=get(id);return !!b&&canAct(b)&&!b.ai62.terminal}
function market(b){if(!canAct(b))return false;const M=H.M19,need=wanted(b);for(const l of M.D.lst){if(l.st!=='open'||!l.esc||l.own===b.id||l.gk==='xu'||l.wk==='xu'||!need.includes(l.gk)||!M.TK.includes(l.wk)||l.esc.k!==l.gk||l.esc.n!==l.gn||!(l.gn>0&&l.wn>0))continue;if(ownsID(l.own)&&!canTrade(l.own))continue;
 if(total(b,l.wk)-reserve(b,l.wk)<l.wn||M.VAL[l.gk]*l.gn<M.VAL[l.wk]*l.wn*.8)continue;
 // Capacity after paying and receiving, using exact backpack/home source ordering from M19.
 const k=l.wk==='botC'?'botB':l.wk,old=b.inv[k]||0;b.inv[k]=Math.max(0,old-l.wn);const fit=room(b,l.gk==='botC'?'botB':l.gk,l.gn);b.inv[k]=old;if(!fit)continue;
 if(M.fulfill(l.id,b.id).ok)return true}
 const open=M.D.lst.filter(l=>l.own===b.id&&l.st==='open');if(open.length)return false;const want=need[0];if(!want)return false;
 const give=M.TK.find(k=>k!=='xu'&&k!==want&&!need.includes(k)&&total(b,k)>reserve(b,k)+2);if(!give)return false;const wn=1,gn=Math.ceil(M.VAL[want]/M.VAL[give]);if(total(b,give)-reserve(b,give)<gn)return false;
 if(!M.botTake(b,give,gn))return false;M.D.lst.push({id:'L'+M.D.seq++,own:b.id,name:b.n,bot:1,gk:give,gn,wk:want,wn,st:'open',t:Date.now(),esc:{k:give,n:gn}});M.render();return true}
function count(){const bots=B.BOTS.filter(b=>!b.dead&&b.lives>0&&(!owns(b)||!b.ai62?.waiting&&!b.ai62?.terminal)).length;let peers=0;for(const o of Object.values(H.OTH))if(!o.testBot&&!o.bot&&o.on)peers++;return{players:(H.S.on&&!H.S.dead?1:0)+peers,bots,total:(H.S.on&&!H.S.dead?1:0)+peers+bots,waiting:[...roster.values()].filter(b=>b.ai62.waiting&&!b.ai62.terminal).length}}
let hud=null,display='';function updateHUD(){if(!hud){const bag=document.getElementById('bag');if(!bag)return;hud=document.createElement('div');hud.id='survivors62';hud.style.cssText='font:600 14px system-ui;color:#d3f4db;text-shadow:0 1px 3px #000;margin-top:4px;pointer-events:none';bag.parentNode.insertBefore(hud,bag.nextSibling)}const c=count(),text='Người sống sót: '+c.total;if(display!==text){hud.textContent=text;display=text}hud.title=c.players+' người chơi · '+c.bots+' bot'+(c.waiting?' · '+c.waiting+' bot chờ nhà trống/mở khu':'');hud.style.display=H.S.on?'block':'none'}
function tick(){const now=performance.now(),dt=Math.min(1,Math.max(0,(now-last)/1000));last=now;updateHUD();if(!A.active||!H.S.on||H.S.dead||H.S.pz||!netOK())return;if(!attach())return;const t0=performance.now();stats.ticks++;B.ST.frameA=0;
 if(now>=claimAt){claimAt=now+5000;for(const b of roster.values())if(b.ai62.waiting&&!b.ai62.terminal)claim(b)}
 // One expensive perception/decision per scheduler tick, round-robin. All actors still consume survival time.
 const list=[...roster.values()];for(let i=0;i<list.length;i++){const b=list[cursor++%list.length];if(canAct(b)&&now>=b.ai62.nextThink){think(b);break}}
 for(const b of list)advance(b,dt);
 if(now>=marketAt){marketAt=now+3000;const b=list[Math.floor(now/3000)%list.length];market(b)}
 stats.lastMs=performance.now()-t0;stats.maxMs=Math.max(stats.maxMs,stats.lastMs);if(now-saveAt>15000){saveAt=now;H.SAVE.save('survivors62',false,true)}updateHUD()}
function serialize(){return{version:1,bots:SPECS.map(q=>{const b=get(q.id)||fresh(q);const fields=['id','n','p','c','x','y','hp','mhp','food','water','sta','lives','dead','inv','axe','pick','home','inside','fx','kills','db','dbN','ai21','ai62'];const data={};for(const k of fields)if(b[k]!==undefined)data[k]=b[k];return clone(data)})}}
function restore(d){roster.clear();for(const q of SPECS){const raw=(d.bots||[]).find(b=>b.id===q.id);let b=fresh(q);if(raw){Object.assign(b,clone(raw));b.id=q.id;b.ai62={...fresh(q).ai62,...raw.ai62,zone:q.zone};b.ai21=raw.ai21||null;if(b.ai21)delete b.ai21.water62;b.goal=b.path=b.target=b.route=null;b.mode=b.dead?'dead':b.inside?'rest':'idle';b.ai62.nextThink=0;if(b.ai62.terminal||b.lives<=0){b.dead=1;b.lives=0;b.ai62.terminal=true;b.ai62.reviveAt=null}}roster.set(q.id,b)}started=false;claimAt=0;indexAt=-1e9;attach();for(const b of roster.values()){if(b.ai62.terminal){cancel(b,false);const h=NHA.EXTRA.find(h=>h.id===b.home);if(h?.owner===b.id)h.owner='';b.home=null;B.putOTH(b);continue}const h=NHA.EXTRA.find(h=>h.id===b.home);if(!h||reserved(h,b)){b.home=null;b.ai62.waiting=true;b.inside=false}else{h.owner=b.id;b.ai62.waiting=false}}updateHUD()}
const API=globalThis.SURVIVORS62=H.SURVIVORS62={specs:SPECS,stats,owns,ownsID,canAct,canTrade,room,fits,used,claim,die,craft,market,count,tick,observe,advance,serialize,restore,get bots(){return SPECS.map(q=>get(q.id)).filter(Boolean)},get started(){return started}};
H.SAVE.register({id:'survivors62',scope:'world',version:1,defaults:()=>({version:1,bots:[]}),validate:d=>d?.version===1&&Array.isArray(d.bots),get:serialize,set:restore});
setInterval(()=>{try{tick()}catch(e){if(stats.errors.length<8){stats.errors.push(String(e.stack||e));console.warn('[survivors62]',e)}}},200);
})();
