/* City/forest pine corridor only. Does not move or modify the boundary pines. */
(()=>{'use strict';
const P=[[186.3,-419.75],[186,-350.75],[185.85,-316.15],[184.5,-269.1],[183.2,-222.05],[181.95,-211.6],[174,-143.85],[174,-99.75],[172.25,-77.35],[158.05,30.7],[132.85,176.25]];
// The two planted rows are 3 m and 8 m inward. Extend 4 m beyond each.
function contains(x,y){if(!Number.isFinite(x)||!Number.isFinite(y)||y<P[0][1]-12||y>P[P.length-1][1]+12)return false;let best=Infinity,signed=Infinity;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy,t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/l)),ex=x-a[0]-t*dx,ey=y-a[1]-t*dy,d=Math.hypot(ex,ey);if(d<best){best=d;signed=(dy*(x-a[0])-dx*(y-a[1])>=0?1:-1)*d}}return signed>=-1-1e-7&&signed<=12+1e-7}
const pine=o=>!!o.border12||String(o.id||o[0]||'').startsWith('border12_');
const structural=/^(wallblk|stairs|bridge|sign|lamp|cone|sand)$/;
const removed=[],seen=new Set(),colliderKeys=new Set(),stats={revision:28,trees:0,rocks:0,decor:0,pickupsRelocated:0,colliders:0,passes:0};
const compact=(a,keep)=>{if(!Array.isArray(a))return;let n=0;for(const o of a)if(keep(o))a[n++]=o;a.length=n};
const sig=c=>[c.x0,c.x1,c.z0,c.z1].map(v=>Number(v).toFixed(4)).join(',');
function blocked(x,y,id){return !String(id||'').startsWith('border12_')&&contains(x,y)}
function blockedDecor(k,x,y){return !structural.test(k)&&contains(x,y)}
function apply(){const S=globalThis.SH,W=globalThis.W15,M=globalThis.MAP26,V=S?.V25;if(!S||!W||!M||!globalThis.Z21_READY)return;const cols=new Set(),gone=new Set();let changed=false,tableChanged=false;
 const note=(kind,k,x,y,id)=>{const key=kind+':'+(id||k+':'+x+','+y);if(!seen.has(key)){seen.add(key);removed.push({kind,key:k,x,y,id});stats[kind]++}};
 function remove(o,kind,k,x,y,id,table=false){if(pine(o)||!(kind==='trees'?contains(x,y):blockedDecor(k,x,y)))return false;
  note(kind,k,x,y,id);gone.add(o);changed=true;if(table)tableChanged=true;
  for(const c of[o.c,o.col,o.col5,o.col16])if(c)cols.add(c);
  if(kind==='trees'){if(!table)S.WORLD?.byId?.t?.delete(o.id)}else{const w=o[3];if(Number.isFinite(w))for(const c of S.cols.concat(M.C))if(!c.border12&&!c.c17&&!c.ft&&!c.w15g&&Math.abs((c.x0+c.x1)/2-x)<.0002&&Math.abs(c.x1-c.x0-w*(kind==='rocks'?.76:.8))<.025&&(Math.abs(c.z1-y)<.0002||Math.abs(c.z1-y-(c.z1-c.z0)*.25)<.0002))cols.add(c)}
  V.drop?.(o);return true;
 }
 compact(S.trees,t=>!remove(t,'trees',t.sp,t.x,t.y,t.id));
 compact(S.felled,t=>!blocked(t.x,t.y,t.id));
 for(const [a,kind]of[[S.ROCKS,'rocks'],[S.DEC,'decor']])compact(a,o=>!remove(o,kind,o.hk||o[0],o[1],o[2]));
 for(const [a,kind]of[[M.T,'trees'],[M.F8,'trees'],[M.K,'rocks'],[M.D,'decor'],[M.FD,'decor']])compact(a,o=>!remove(o,kind,o[0],o[1],o[2],kind==='trees'?o[0]:null,true));
 const F=V.forest;let overlayChanged=false;for(const [k,kind]of[['trees','trees'],['rocks','rocks'],['bush','decor'],['flow','decor']])if(F?.[k])compact(F[k],o=>{const no=remove(o,kind,o.sp||o.k||k,o.x,o.y,o.id);if(no)overlayChanged=true;return !no});
 if(overlayChanged&&F.meshes){for(const m of F.meshes){m.parent?.remove(m);m.geometry?.dispose?.()}F.meshes=null;F.anyVis=false}
 if(S.HO2?.dec)compact(S.HO2.dec,o=>!gone.has(o)&&!blockedDecor(o[0],o[1],o[2]));
 for(const c of cols){if(c.border12)continue;c.on=false;colliderKeys.add(sig(c))}stats.colliders=colliderKeys.size;
 compact(S.cols,c=>c.border12||!colliderKeys.has(sig(c)));compact(M.C,c=>!colliderKeys.has(sig(c)));
 for(const c of W.CK.values()){if(c.objs){for(const k of['t','d','r'])compact(c.objs[k],o=>!gone.has(o));compact(c.objs.c,o=>!colliderKeys.has(sig(o)))}if(c.data){compact(c.data.T,o=>!blocked(o.x,o.y,o.id));for(const k of['Rk','D'])compact(c.data[k],o=>!blockedDecor(o[0],o[1],o[2]));compact(c.data.C,o=>!colliderKeys.has(sig(o)))}}
 if(tableChanged){globalThis.M26?.resetBuckets();if(W.F8)globalThis.M26?.f8(W.F8);W.resetF8Cache5?.()}
 // Random resources retain identity, harvest state and remaining respawn time.
 const R=globalThis.R27;if(R)for(const r of R.RL)if(contains(r.x,r.y)){const q=R.spot();if(q){r.x=q[0];r.y=q[1];r.hid=0;stats.pickupsRelocated++}}
 if(changed){S.colsDirty();V.treesDirty?.();globalThis.POI20?.invalidate?.();if(globalThis.M26ART)M26ART.A.cvs={}}
 stats.passes++;
}
globalThis.BORDER_CLEAN28={contains,blocked,blockedDecor,colliderBlocked:c=>colliderKeys.has(sig(c)),apply,stats,removed,poly:P};
addEventListener('load',apply);setInterval(apply,500);
})();
