/* Keep the existing BORDER12 native tree rows alive across late initialization,
   save restoration and render-cache invalidation. No new placements or resources. */
(()=>{'use strict';const S=SH,V=S.V25,D=BORDER12_DATA,byPlan=new Map(D.plants.map(p=>[p.id,p]));let applied=false;
const stats={revision:14,visualScale:.6,expected:D.plants.length,restored:0,repaired:0};
function ensure(){if(!applied||!globalThis.Z21_READY)return;let changed=false;const allCols=new Set(S.cols),current=new Map();for(const t of S.trees)if(t.border12||byPlan.has(t.id))current.set(t.id,t);
 for(const p of D.plants){let t=current.get(p.id);if(!t){const r=p.s*.4,c={x0:p.x-r,x1:p.x+r,z0:p.y-r,z1:p.y+r,on:true,border12:p.id};t={id:p.id,x:p.x,y:p.y,s:p.s*.6,sp:'pine',dead:false,hp:1e9,giant:1,border12:1,_k:1,c};S.trees.push(t);S.cols.push(c);allCols.add(c);current.set(p.id,t);stats.restored++;changed=true}
  const r=p.s*.4;let repair=false;for(const[k,v]of Object.entries({x:p.x,y:p.y,s:p.s*.6,sp:'pine',dead:false,hp:1e9,giant:1,border12:1,_k:1}))if(t[k]!==v){t[k]=v;repair=true}
  if(!t.c)t.c={};const c=t.c;for(const[k,v]of Object.entries({x0:p.x-r,x1:p.x+r,z0:p.y-r,z1:p.y+r,on:true,border12:p.id}))if(c[k]!==v){c[k]=v;repair=true}
  if(!allCols.has(c)){S.cols.push(c);allCols.add(c);repair=true}if(S.WORLD.byId.t.get(p.id)!==t)S.WORLD.byId.t.set(p.id,t);
  if(repair){V.drop?.(t);stats.repaired++;changed=true}
 }
 // Remove only stale render records of these same border IDs; keep normal culling.
 for(const[t,rec]of V.T15.maps[0])if(byPlan.has(t.id)){if(current.get(t.id)!==t){V.drop(t);changed=true;continue}for(const k of ['c','s'])if(rec[k]&&!rec[k].parent)V.T15.scene.add(rec[k])}
 if(changed){S.colsDirty();V.treesDirty?.()}
 return current.size}
function apply(){if(applied)return;applied=true;ensure();addEventListener('load',ensure);setInterval(ensure,1000);const old=S.SAVE.apply;S.SAVE.apply=function(...args){try{return old.apply(this,args)}finally{ensure()}};console.info('[BORDER14] native boundary pines',stats.expected)}
globalThis.BORDER13={apply,ensure,stats};const boot=()=>{if(globalThis.URBAN_READY)apply()};addEventListener('load',boot);const bootTimer=setInterval(()=>{if(globalThis.URBAN_READY){clearInterval(bootTimer);apply()}},100);})();
