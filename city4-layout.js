/* Revision 4: city geometry, four safe sites, removal of four explicitly selected bots, and one-time spatial migration. */
(()=>{'use strict';
const D=CITY4_DATA,oldRows=D.changes.concat(D.public.filter(q=>q.type==='gas')),state={applied:false};
const box=(c,a)=>Object.assign(c,{x0:a[0],z0:a[1],x1:a[2],z1:a[3]});
const inside=(r,x,y,p=0)=>x>=r[0]-p&&x<=r[2]+p&&y>=r[1]-p&&y<=r[3]+p;
function nearest(x,y){return globalThis.URBAN_PLAN?URBAN_PLAN.nearestFree(x,y):{x:-52,y:-151.5}}
function restore(){
 const S=globalThis.SH;if(!S)return;
 if(globalThis.XD15)XD15.ensure();
 const P=globalThis.NHA?.PB;if(P&&D.sites[P.site])P.yw=P.yd=D.sites[P.site].yard;
 S.colsDirty&&S.colsDirty();
}
function apply(){
 if(state.applied)return;state.applied=true;const S=SH,V=S.V25,Z=V?.Z21;
 // The previous geometry binding runs first; replace its old junction islands.
 for(let i=S.cols.length-1;i>=0;i--)if(S.cols[i].urbanJunction)S.cols.splice(i,1);
 for(const q of D.roundabouts)S.cols.push({x0:q.x-q.island*.8,x1:q.x+q.island*.8,z0:q.y-q.island*.8,z1:q.y+q.island*.8,urbanJunction:q.id});
 if(Z){for(const t of D.towers||[]){const q=Z.PLAN[t.towerIndex],a=t.new;Object.assign(q,{x0:a[0],y0:a[1],x1:a[2],y1:a[3]});(q.urbanCols||[]).forEach(c=>box(c,a))}for(const f of D.public.filter(f=>f.type==='gas')){
  const g=Z.GAS[f.gasIndex],a=f.new;if(!g)continue;Object.assign(g.rect,{x0:a[0],y0:a[1],x1:a[2],y1:a[3]});
  const W=Math.min(14,a[2]-a[0]),cx=(a[0]+a[2])/2,x0=cx-W/2,y=a[3],d=W/14;g.W=W;g.pumps=[[x0+W*.257,y-2*d],[x0+W*.435,y-2*d]];g.barrel=[x0+W*.82,y-1.9*d];
  const shapes=g.pumps.map(([x,z])=>[x-.5,z-.3,x+.5,z+.3]);for(const k of[.195,.373])shapes.push([x0+W*k-.22,y-2.4*d,x0+W*k+.22,y-2*d]);shapes.push([x0+W*.49,Math.max(a[1],y-6.6*d),x0+W*.965,y-2.45*d],[g.barrel[0]-.5,g.barrel[1]-.25,g.barrel[0]+.5,g.barrel[1]+.25]);(g.urbanCols||[]).forEach((c,i)=>box(c,shapes[i]));
 }const g=Z.GAS.filter(q=>!q.zeta&&!q.vil);Z.GAS_CITY.forEach((r,i)=>g[i]&&Object.assign(r,g[i].rect));V.urbanRefreshGas?.()}
 // The canonical old shape and furniture move together via the existing home system.
 if(globalThis.HOME24&&D.oldSites[CO.site]){const site=D.sites[CO.site]?CO.site:'na_tp1',a=D.sites[site].at;HOME24.place(site,a[0],a[1],false);if(Math.abs(S.pos.x)<16&&Math.abs(S.pos.y)<16){S.pos.x=a[0];S.pos.y=a[1]+5}}
 // Keep old vehicles as scenery, moving any that occupy the new carriageway into parking space.
 const M=globalThis.W15?.M3,parks=CITY17.parks.filter(q=>q.kind==='parking');
 for(const d of S.DEC){if(!['car1','amb','pcar','bus','wreck'].includes(d[0])||!URBAN_PLAN.contains(d[1],d[2])||!M?.roadAt(d[1],d[2],(d[3]||3)*.4+.5))continue;
  const half=(d[3]||S.SW[d[0]]||3)*.4,depth=d[0]==='bus'?1.1:.7;
  const c=S.cols.find(c=>Math.abs(c.x0-(d[1]-half))<.01&&Math.abs(c.x1-(d[1]+half))<.01&&Math.abs(c.z1-d[2])<.01);if(!c)continue;
  let dest=null;for(const p of parks){const xx=p.poly.map(q=>q[0]),yy=p.poly.map(q=>q[1]);for(let y=Math.min(...yy)+2;y<Math.max(...yy)-1&&!dest;y+=1.5)for(let x=Math.min(...xx)+half+1;x<Math.max(...xx)-half-1;x+=2){if(M.roadAt(x,y,half+1))continue;const a=[x-half-.3,y-depth-.3,x+half+.3,y+.3];if(S.cols.some(o=>o!==c&&o.on!==false&&o.x0<a[2]&&o.x1>a[0]&&o.z0<a[3]&&o.z1>a[1]))continue;dest=[x,y];break}if(dest)break}
  if(dest){const dx=dest[0]-d[1],dy=dest[1]-d[2];d[1]=dest[0];d[2]=dest[1];c.x0+=dx;c.x1+=dx;c.z0+=dy;c.z1+=dy}
 }
 restore();
}
function migrate(input){
 if(!input?.world||input.mapSize!==1250||(input.world.ext?.urbanPlan?.revision||0)>=4)return input;
 const d=JSON.parse(JSON.stringify(input)),w=d.world,e=w.ext||(w.ext={});
 try{const k='safehaven_save_1250_before_city4';if(!localStorage.getItem(k)){const raw=localStorage.getItem('safehaven_save_1250_v1');if(raw)localStorage.setItem(k,raw)}}catch(_){}
 const n=e.n22||(e.n22={}),pb=(n.bases||[]).find(b=>b.id==='nhago'),extras=n.extra||[],oldSite=pb?.site;
 const remap={na_go:'na_tp1',na_tp3:'na_tp2'};let unhomed=false;
 // A removed owned home can use a free retained site; never take a site owned by someone else.
 if(pb&&D.removedSites.includes(oldSite)){
  const free=Object.keys(D.sites).find(id=>!extras.some(b=>b.id===id&&b.owner&&b.owner!=='player'));
  if(free){remap[oldSite]=free;pb.site=free;pb.none=0}else{unhomed=true;pb.none=1;pb.site='';pb.cx=pb.cy=4200}
 }
 const siteFor=id=>D.sites[id]?id:remap[id];
 function safeAt(x,y){for(const[id,a]of Object.entries(D.oldSites))if(Math.abs(x-a[0])<=13.05&&Math.abs(y-a[1])<=13.05)return id;return null}
 function pt(o,kx='x',ky='y',forced=null){if(!o||!Number.isFinite(o[kx])||!Number.isFinite(o[ky])||o[kx]>=5000)return;const x=o[kx],y=o[ky],id=forced||safeAt(x,y);
  if(id===oldSite&&unhomed){const q=nearest(-52,-151.5);o[kx]=q.x;o[ky]=q.y;return}if(id&&D.oldSites[id]){const a=D.oldSites[id],target=D.sites[siteFor(id)];if(target){o[kx]+=target.at[0]-a[0];o[ky]+=target.at[1]-a[1]}return}
  const q=oldRows.find(q=>q.old&&q.new&&inside(q.old,x,y,.05));if(q){o[kx]+=q.new[0]-q.old[0];o[ky]+=q.new[3]-q.old[3]}
 }
 pt(d.player?.pos);for(const k of['items','ens'])for(const a of w[k]||[])Array.isArray(a)?pt(a,1,2):pt(a);
 for(const a of e.f5?.bar||[])Array.isArray(a)?pt(a,1,2):pt(a);
 const archive={buildings:[],homes:extras.filter(b=>D.removedSites.includes(b.id)&&b.owner&&b.owner!=='player')};
 if(e.xd15)e.xd15.list=(e.xd15.list||[]).filter(a=>{const id=a[4];if(unhomed&&id===oldSite){archive.buildings.push(a.slice());return false}if(D.oldSites[id]){pt(a,2,3,id);a[4]=siteFor(id)}return true});
 for(const a of n.bases||[])if(a.id==='nhago'&&!a.none&&D.sites[a.site]){const t=D.sites[a.site];a.cx=t.at[0];a.cy=t.at[1];a.yw=a.yd=t.yard}
 n.extra=extras.filter(b=>!D.removedSites.includes(b.id));for(const a of n.extra){const t=D.sites[a.id];if(t){a.cx=t.at[0];a.cy=t.at[1];a.yw=a.yd=t.yard}}
 // Preserve every surviving NPC and its home/state verbatim; remove only the named four.
 if(e.b16){e.b16.n=Math.max(1,(e.b16.n||5)-4);e.b16.houses=(e.b16.houses||[]).filter(h=>!D.removedBotHomes.includes(h.id));e.b16.bots=(e.b16.bots||[]).filter(b=>!D.removedBots.includes(b.id))}
 const dg=e.f4?.dg?.cur;if(dg){pt(dg);for(const a of dg.alive||[])pt(a,2,3)}
 for(const a of w.dead||[]){const r=a[3];if(!Array.isArray(r))continue;const q=oldRows.find(q=>q.old&&q.new&&inside(q.old,(r[0]+r[2])/2,(r[1]+r[3])/2));if(q){const dx=q.new[0]-q.old[0],dy=q.new[3]-q.old[3];r[0]+=dx;r[2]+=dx;r[1]+=dy;r[3]+=dy}}
 e.urbanPlan={...(e.urbanPlan||{}),revision:4};e.city4={revision:4,archive};return d;
}
globalThis.CITY4_PLAN={apply,restore,migrate,state};
})();
