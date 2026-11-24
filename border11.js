/* BORDER11: two staggered ornamental pine rows, forest-side boundary only.
   Explicit plan relocates obstructing resources with IDs/state retained. */
(()=>{'use strict';let applied=false;const D=BORDER11_DATA,S=SH,W=W15,M=MAP26,stats={...D.stats,removedColliders:0};
const near=(a,b)=>Math.abs(a-b)<.0002,key=(x,y)=>'r'+x.toFixed(1)+y.toFixed(1),shift=(c,dx,dy)=>{c.x0+=dx;c.x1+=dx;c.z0+=dy;c.z1+=dy};
function compact(a,keep){let w=0;for(const o of a)if(keep(o))a[w++]=o;a.length=w}
function apply(){if(applied)return;
 // LIVE fix: BORDER11's rows are superseded by BORDER12 (689/694 plants within 3 m of a BORDER12 pine, kept alive by BORDER13)
 // and ~90% of its move/remove targets no longer exist in the current 1250 m map. Applying it would double the pine rows.
 applied=true;stats.superseded='BORDER12';console.info('[BORDER11] bỏ qua – đã được BORDER12/BORDER13 thay thế');return;
 S.WORLD.ensureIds();
 // Validate all targeted source records before changing any world arrays.
 const ops=D.moves.map(m=>{const rows=m.src==='nativeTree'?S.trees:m.src==='tableTree'?M.T:m.src==='f8Tree'?M.F8:m.src==='nativeRock'?S.ROCKS:M.K;const tree=m.src.endsWith('Tree'),native=m.src==='nativeTree';const o=rows.find(o=>native?o.id===m.id&&near(o.x,m.old[0])&&near(o.y,m.old[1]):tree?o[0]===m.id&&near(o[1],m.old[0])&&near(o[2],m.old[1]):near(o[1],m.old[0])&&near(o[2],m.old[1])&&(o.hk||o[0])===m.id.split('@')[0]);if(!o)throw Error('BORDER11 source mismatch '+m.id);return{m,o,tree,native}});
 const removals=[];for(const r of D.remove){const arr=r.src==='D'?M.D:r.src==='FD'?M.FD:r.src==='native'?S.DEC:S.V25.forest[r.kind];const o=arr.find(o=>r.src==='overlay'?o.id===r.id:o[0]===r.k&&near(o[1],r.x)&&near(o[2],r.y));if(!o)throw Error('BORDER11 decor mismatch '+r.src+' '+r.x+','+r.y);removals.push({r,o,arr})}
 try{const k='safehaven_save_1250_before_border11',raw=localStorage.getItem('safehaven_save_1250_v1');if(raw&&!localStorage.getItem(k))localStorage.setItem(k,raw)}catch(_){}
 applied=true;W.reloadAll();W.CK.clear();
 const resourceCols=new Set();for(const t of S.trees)if(t.c)resourceCols.add(t.c);for(const r of S.ROCKS)if(r.col)resourceCols.add(r.col);
 for(const {m,o,tree,native}of ops){const dx=m.new[0]-m.old[0],dy=m.new[1]-m.old[1];if(native){o.x=m.new[0];o.y=m.new[1];if(o.c)shift(o.c,dx,dy);S.V25.drop?.(o)}else{if(m.src==='nativeRock'){const cols=new Set(o.col?[o.col]:[]);for(const c of S.cols)if(!c.c17&&!c.ft&&near((c.x0+c.x1)/2,m.old[0])&&near(c.z1,m.old[1])&&c.x1-c.x0<=o[3]*2.1&&c.z1-c.z0<=o[3]*2.1)cols.add(c);for(const c of cols){resourceCols.add(c);shift(c,dx,dy)}S.V25.drop?.(o)}o[1]=m.new[0];o[2]=m.new[1]}
 if(tree)WORLD5.treeMoves.set(m.id,{old:m.old.slice(),new:m.new.slice()});else S.V25.rockLifecycle.remap(key(...m.old),key(...m.new));}
 const gone=new Set(removals.map(r=>r.o)),colliders=new Set();for(const {r,o}of removals){if(r.src==='native'||r.src==='D'||r.src==='FD'){for(const c of S.cols.concat(M.C))if(!resourceCols.has(c)&&!c.c17&&!c.ft&&!c.w15&&near((c.x0+c.x1)/2,r.x)&&near(c.z1,r.y)&&c.x1-c.x0<=r.w*2.1&&c.z1-c.z0<=r.w*2.1)colliders.add(c);if(o.col)colliders.add(o.col);if(o.c)colliders.add(o.c);S.V25.drop?.(o)}else if(o.col5)colliders.add(o.col5)}
 for(const a of [M.D,M.FD,S.DEC,S.HO2?.dec,...Object.values(S.V25.forest||{}).filter(Array.isArray)])if(Array.isArray(a))compact(a,o=>!gone.has(o));for(const c of colliders)c.on=false;compact(S.cols,c=>!colliders.has(c));compact(M.C,c=>!colliders.has(c));stats.removedColliders=colliders.size;
 for(const p of D.plants){const o=['pine',p.x,p.y,p.w];o.border11=p.id;M.D.push(o)}
 M26.resetBuckets();M26.f8(W.F8);W.resetF8Cache5?.();S.colsDirty();S.V25.treesDirty?.();S.V25.rockLifecycle.refresh();globalThis.POI20?.invalidate?.();}
 globalThis.BORDER11={apply,stats,plan:D,get applied(){return applied}};
})();
