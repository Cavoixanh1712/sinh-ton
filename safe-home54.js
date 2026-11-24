/* Remove R1/R5 and Dung's blocked private bh4; reuse vacant existing shelters. */
(()=>{'use strict';const H=globalThis.SH,B=globalThis.B16,AI=globalThis.BROWSER_AI21;if(!H||!B||!AI)return;const removed=new Set(['na_r1','na_r5']),log=[];let pendingStore=null,pendingPlayer=null,lastBot=null;
const api=globalThis.SAFEHOME54={removed:['na_r1','na_r5','bh4'],log,capturePlayer(d){pendingPlayer=new Map((d?.extra||[]).map(h=>[h.id,h]))},capture(d){pendingStore=null;const old=d?.houses?.find(h=>h.id==='bh4');if(old)pendingStore={owner:old.owner||'bot4',store:{...old.store}}}};
// Existing saves can still refer to a retired player home. Move its existing
// canonical house (including level/furniture) to a vacant retained site.
const restore=HOME24.restore;HOME24.restore=function(site,cx,cy,none){if(removed.has(site)&&!none){const candidate=XD15S.SAFE.map(r=>NHA.EXTRA.find(h=>h.id===r[0])).find(h=>{const saved=pendingPlayer?.get(h?.id)||h;return h&&saved&&saved.st!=='site'&&(!saved.owner||saved.owner==='player')&&!HOME24.H.claims.has(h.id)});pendingPlayer=null;if(candidate){const near=Math.abs(H.pos.x-cx)<25&&Math.abs(H.pos.y-cy)<25;restore(candidate.id,candidate.cx,candidate.cy,false);if(near){H.pos.x=candidate.cx;H.pos.y=candidate.cy+1}log.push({type:'player-home-retired',from:site,to:candidate.id});return}log.push({type:'no-vacant-player-home',from:site});return restore('',4200,4200,true)}pendingPlayer=null;return restore(site,cx,cy,none)};
function migrate(){if(!B.created)return;const b=B.BOTS.find(b=>b.home==='bh4'||b.id==='bot4');if(!b)return;
 const m=AI.meta(b);if(pendingStore&&pendingStore.owner===b.id){m.store=m.store||{};for(const[k,v]of Object.entries(pendingStore.store))if(Number.isFinite(v)&&v>0)m.store[k]=(m.store[k]||0)+v;pendingStore=null}
 const h=AI.home(b);if(h&&!removed.has(b.home)&&b.home!=='bh4'&&h.owner===b.id){lastBot=b;return}
 if(b.home!=='bh4'&&b.home&&h)return;const old=b.home;
 b.home=null;b.inside=false;b.goal=null;b.path=null;b.route=null;b.target=null;b.stuck=0;b.repath=0;b.mode='idle';if(AI.claim(b)){lastBot=b;B.putOTH(b);log.push({type:'bot-relocated',bot:b.id,name:b.n,from:old,to:b.home});}else if(lastBot!==b){log.push({type:'no-vacant-bot-home',bot:b.id});lastBot=b}}
api.migrate=migrate;
H.SAVE.register({id:'safehome54',scope:'world',version:1,defaults:()=>({revision:54}),get:()=>({revision:54}),set:()=>{lastBot=null;migrate()}});
// Base B16 initializes lazily after the game begins; inspect without changing
// other bots' AI loop, inventory, combat, survival or house selection behavior.
let timer=setInterval(()=>{if(!H.S.on||!B.created)return;migrate()},300);
})();
