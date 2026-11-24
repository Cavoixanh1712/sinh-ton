/* Repair dry-land scenery and native ponds without removing objects, resource IDs or features. */
(()=>{'use strict';const S=SH,W=W15,D=NATURE7_DATA;const stats={trees:0,decor:0,ponds:0,paths:0,tableTrees:0,tableDecor:0,resourceRocks:0};let applied=false;const moves=new Map();
const open=(x,y)=>W.zoneAt2(x,y)?.open;
const wet=(x,y,r=0)=>S.inLk(x,y,r)||W.depthAt(x,y)>.025;
const landDecor=k=>/^(?:tree\d|pine|cypress|hsak|hbu|hfl|bush|rock[123]|hrk|m6_(?:phe_tich|bui_|hoa_|khuc_go|leu|lua_trai))/.test(k);
function shiftCol(c,dx,dy){if(!c)return;c.x0+=dx;c.x1+=dx;c.z0+=dy;c.z1+=dy}
function destination(x,y,r){const zn=W.zoneAt2(x,y);for(let d=2;d<=70;d+=1)for(let i=0;i<32;i++){const a=i*Math.PI/16,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;if(W.zoneAt2(px,py)!==zn||wet(px,py,r+.8)||WORLD5.blocked(px,py,r)||S.pathD(px,py,8)<r+.6||S.X.hitC(px,py,r+.15))continue;return[px,py]}throw Error('No dry bank for scenery at '+x+','+y)}
function move(o,x,y,r,col,set){const q=destination(x,y,r),dx=q[0]-x,dy=q[1]-y;set(q);shiftCol(col,dx,dy);S.colsDirty();return q}
function apply(){if(applied)return;applied=true;try{const k="safehaven_save_1250_before_city7",raw=localStorage.getItem("safehaven_save_1250_v1");if(raw&&!localStorage.getItem(k))localStorage.setItem(k,raw)}catch(_){}
 for(const p of D.pondMoves){const l=S.LAKES.find(l=>Math.abs(l.x-p.old[0])<.01&&Math.abs(l.y-p.old[1])<.01);if(l){const dx=p.new[0]-l.x,dy=p.new[1]-l.y;for(const q of S.HO2?.lotus||[])if(Math.hypot(q[1]-l.x,q[2]-l.y)<l.r){q[1]+=dx;q[2]+=dy}for(const z of S.ZN)for(const loc of z.loc||[])if(Math.hypot(loc.x-l.x,loc.y-l.y)<.1){loc.x+=dx;loc.y+=dy}l.x=p.new[0];l.y=p.new[1];stats.ponds++}}
 for(const p of S.HOD.paths)if(D.paths[p.id]){p.pts=D.paths[p.id].map(q=>q.slice());stats.paths++}Z21H.rebuildPaths7();

 // Relocate streamed table objects rather than dropping resource IDs at attach time.
 const M=MAP26;for(const t of M.T){if(!open(t[1],t[2])||!wet(t[1],t[2],.55))continue;const old=[t[1],t[2]],q=destination(t[1],t[2],Math.max(.5,t[3]*.4));t[1]=q[0];t[2]=q[1];moves.set(t[0],{old,new:q});WORLD5.treeMoves.set(t[0],{old,new:q});stats.tableTrees++}
 for(const d of M.D){if(!open(d[1],d[2])||!landDecor(d[0])||!wet(d[1],d[2],.25))continue;const q=destination(d[1],d[2],Math.min(.9,d[3]*.25));d[1]=q[0];d[2]=q[1];stats.tableDecor++}
 for(const r of M.K){if(!open(r[1],r[2])||!wet(r[1],r[2],.4))continue;const old='r'+r[1].toFixed(1)+r[2].toFixed(1),q=destination(r[1],r[2],Math.min(1.5,r[3]*.3));r[1]=q[0];r[2]=q[1];S.V25.rockLifecycle.remap(old,'r'+r[1].toFixed(1)+r[2].toFixed(1));stats.resourceRocks++}
 W.reloadAll();W.CK.clear();M26.resetBuckets();
 S.V25.syncForest5?.();const F=S.V25.forest;
 for(const t of S.trees){if(t.w15||!open(t.x,t.y)||!wet(t.x,t.y,.45))continue;const old=[t.x,t.y],q=move(t,t.x,t.y,Math.max(.45,t.s*.4),t.c,q=>{t.x=q[0];t.y=q[1]});moves.set(t.id,{old,new:q});WORLD5.treeMoves.set(t.id,{old,new:q});stats.trees++}
 if(F)for(const kind of ['trees','rocks','bush','flow'])for(const o of F[kind]){if(!open(o.x,o.y)||!wet(o.x,o.y,.35))continue;move(o,o.x,o.y,kind==='trees'?o.h:kind==='rocks'?o.s*.6:.35,o.col5,q=>{o.x=q[0];o.y=q[1]});stats.decor++}
 // Resolve exact decorative colliders; never move nearby unrelated walls or terrain.
 const buckets=new Map();for(const c of S.cols){const key=Math.round((c.x0+c.x1)*50)+','+Math.round(c.z1*100);if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(c)}
 const seen=new Set();for(const o of S.DEC.concat(S.HO2?.dec||[])){if(seen.has(o))continue;seen.add(o);if(o.w15||!landDecor(o[0])||!open(o[1],o[2])||!wet(o[1],o[2],.18))continue;const x=o[1],y=o[2],r=Math.min(.9,o[3]*.24),cols=new Set(o.col?[o.col]:buckets.get(Math.round(x*100)+','+Math.round(y*100))||[]);const q=destination(x,y,r);o[1]=q[0];o[2]=q[1];for(const c of cols)if(!c.c17&&!c.ft&&!c.v25&&!c.w15)shiftCol(c,q[0]-x,q[1]-y);stats.decor++}
 if(F){const arr=[...F.trees,...F.rocks,...F.bush,...F.flow];F.minX=Math.min(...arr.map(o=>o.x))-8;F.maxX=Math.max(...arr.map(o=>o.x))+8;F.minY=Math.min(...arr.map(o=>o.y))-6;F.maxY=Math.max(...arr.map(o=>o.y))+14}
 S.colsDirty();S.V25.treesDirty?.();S.V25.rockLifecycle?.refresh();globalThis.POI20?.invalidate?.();}
globalThis.NATURE7={apply,wet,stats,moves};})();
