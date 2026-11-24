/* Spatial planning and migration only. Combat, survival, inventory and facility logic stay in their original modules. */
(()=>{'use strict';
const D=globalThis.URBAN_DATA,extra=[],state={applied:false,gasMoved:0};
function inside(x,y,P){let hit=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit}return hit}
const contains=(x,y)=>inside(x,y,D.city);
function setBox(c,a){c.x0=Math.min(a[0],a[2]);c.x1=Math.max(a[0],a[2]);c.z0=Math.min(a[1],a[3]);c.z1=Math.max(a[1],a[3])}
function apply(){
 if(state.applied||!globalThis.SH)return;state.applied=true;
 const SH=globalThis.SH,V=SH.V25,Z=V&&V.Z21;
 if(Z){
  for(const[b,h]of Z.HRES){(h.urbanCols||[]).forEach((c,i)=>{const w=h.rb.Wl[i];if(w)setBox(c,[w[0],w[2],w[1],w[3]])})}
  for(const s of Z.STORES){const r=s.rect,gc=(r.x0+r.x1)/2,t=.4,gw=.8,segments=[[r.x0,r.y0,r.x1,r.y0+t],[r.x0,r.y0,r.x0+t,r.y1],[r.x1-t,r.y0,r.x1,r.y1],[r.x0,r.y1-t,gc-gw,r.y1],[gc+gw,r.y1-t,r.x1,r.y1]];(s.urbanCols||[]).forEach((c,i)=>setBox(c,segments[i]));if(s.fb)Object.assign(s.fb,{x0:r.x0,x1:r.x1,y1:r.y1,gc});s.dx=gc;s.dy=r.y1+.9}
  for(const h of Z.HOUSE2){const r=h.rect;(h.urbanCols||[]).forEach(c=>setBox(c,[r.x0,r.y0,r.x1,r.y1]))}
  Z.GAS.forEach((g,i)=>{
   const old=D.nativeFinal.gas[i],m=D.public.find(q=>q.gasIndex===i),a=m?m.new:[old.rect.x0,old.rect.y0,old.rect.x1,old.rect.y1];
   Object.assign(g.rect,{x0:a[0],y0:a[1],x1:a[2],y1:a[3]});
   const W=Math.min(14,a[2]-a[0]),cx=(a[0]+a[2])/2,x0=cx-W/2,y1=a[3],dz=W/14;g.W=W;
   g.pumps=[[x0+W*.257,y1-2*dz],[x0+W*.435,y1-2*dz]];g.barrel=[x0+W*.82,y1-1.9*dz];
   const shapes=[];for(const[x,z]of g.pumps)shapes.push([x-.5,z-.3,x+.5,z+.3]);
   for(const f of[.195,.373])shapes.push([x0+W*f-.22,y1-2.4*dz,x0+W*f+.22,y1-2*dz]);
   shapes.push([x0+W*.49,Math.max(a[1],y1-6.6*dz),x0+W*.965,y1-2.45*dz]);shapes.push([g.barrel[0]-.5,g.barrel[1]-.25,g.barrel[0]+.5,g.barrel[1]+.25]);
   (g.urbanCols||[]).forEach((c,j)=>setBox(c,shapes[j]));
   if(m){
    extra.push({id:'gas'+i,old:[old.rect.x0,old.rect.y0,old.rect.x1,old.rect.y1],new:a});
    old.pumps.forEach((p,j)=>extra.push({id:'gasPump'+i+'_'+j,old:[p[0]-1,p[1]-1,p[0]+1,p[1]+1],new:[g.pumps[j][0]-1,g.pumps[j][1]-1,g.pumps[j][0]+1,g.pumps[j][1]+1]}));state.gasMoved++;
   }
  });
  const cityGas=Z.GAS.filter(g=>!g.zeta&&!g.vil);Z.GAS_CITY.forEach((r,i)=>{if(cityGas[i])Object.assign(r,cityGas[i].rect)});
  // The existing fountain is retained at the planned central square.
  const p=Z.PLAZA,w=p.x1-p.x0,h=p.y1-p.y0,c=CITY17.plaza.c;
  extra.push({id:'nativeFountain',old:[p.x0,p.y0,p.x1,p.y1],new:[c[0]-w/2,c[1]-h/2,c[0]+w/2,c[1]+h/2]});
  p.x0=c[0]-w/2;p.x1=c[0]+w/2;p.y0=c[1]-h/2;p.y1=c[1]+h/2;p.fx=c[0];p.fy=c[1];if(V.urbanPlazaCol)setBox(V.urbanPlazaCol,[p.fx-2.4,p.fy-2.4,p.fx+2.4,p.fy+2.4]);
  V.urbanRefreshGas&&V.urbanRefreshGas();
 }
 for(const d of globalThis.F5DOORS||[]){const b=d.h?.b;if(!b)continue;d.x=b.gc;d.y=b.y1;if(d.c)setBox(d.c,[d.x-d.w-.05,d.y-.45,d.x+d.w+.05,d.y]);}
 // Small islands leave a traversable ring around each junction in both rendering modes.
 for(const r of D.roundabouts){const c={x0:r.x-r.island*.8,x1:r.x+r.island*.8,z0:r.y-r.island*.8,z1:r.y+r.island*.8,urbanJunction:r.id};SH.cols.push(c)}
 SH.colsDirty&&SH.colsDirty();
}
function rowAt(x,y){if(!Number.isFinite(x)||!Number.isFinite(y)||x>=5000)return null;const rows=[...D.changes,...extra];for(const pad of[0,.9]){const r=rows.find(q=>q.old&&x>=q.old[0]-pad&&x<=q.old[2]+pad&&y>=q.old[1]-pad&&y<=q.old[3]+pad);if(r)return r}return null}
function migrate(input){
 if(!input||!input.world||input.mapSize!==1250||(input.world.ext?.urbanPlan?.revision||0)>=3)return input;
 const d=JSON.parse(JSON.stringify(input)),w=d.world,e=w.ext||(w.ext={}),home=e.n22?.bases?.find(b=>b.id==='nhago'&&!b.none),fallback=home?{x:home.cx,y:home.cy+1}:{x:0,y:7};let moved=0;
 try{const key='safehaven_save_1250_before_urban3';if(!localStorage.getItem(key)){const raw=localStorage.getItem('safehaven_save_1250_v1');if(raw)localStorage.setItem(key,raw)}}catch(_){}
 function pt(o,kx='x',ky='y'){if(!o)return;const r=rowAt(o[kx],o[ky]);if(!r)return;if(r.new){o[kx]+=r.new[0]-r.old[0];o[ky]+=r.new[3]-r.old[3]}else{o[kx]=fallback.x;o[ky]=fallback.y}moved++}
 pt(d.player?.pos);
 const p=d.player?.pos,S=globalThis.SH;
 if(p&&S&&p.x>=5000){const f=S.HFL.find(f=>f.b&&f.xb?.hid20&&p.x>=f.b.x0&&p.x<=f.b.x1&&p.y>=f.b.y0&&p.y<=f.b.y1);if(f){p.x=fallback.x;p.y=fallback.y;moved++}}
 for(const k of['items','ens'])for(const a of w[k]||[])if(Array.isArray(a))pt(a,1,2);else pt(a);
 for(const a of e.f5?.bar||[])if(Array.isArray(a))pt(a,1,2);else pt(a);
 const dg=e.f4?.dg?.cur;if(dg){pt(dg);for(const a of dg.alive||[])pt(a,2,3)}
 for(const a of w.dead||[]){const r=a[3];if(Array.isArray(r)){const m=rowAt((r[0]+r[2])/2,(r[1]+r[3])/2);if(m?.new){const dx=m.new[0]-m.old[0],dy=m.new[3]-m.old[3];r[0]+=dx;r[2]+=dx;r[1]+=dy;r[3]+=dy}}}
 if(S&&w.sig===D.baselineSig)w.sig=S.WORLD.sig;
 e.urbanPlan={__v:1,revision:3,moved};return d;
}
function nearestFree(x,y){
 const S=globalThis.SH;if(!S)return{x,y};let best=null,dist=Infinity;
 for(const r of (globalThis.CITY5_DATA||globalThis.CITY4_DATA||D).roads.concat((globalThis.CITY5_DATA||globalThis.CITY4_DATA||D).walks))for(let i=1;i<r.p.length;i++){
  const a=r.p[i-1],b=r.p[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1))),px=a[0]+dx*t,py=a[1]+dy*t,d=(px-x)**2+(py-y)**2;
  if(d<dist&&!S.X.hitC(px,py,.32)){dist=d;best={x:px,y:py}}
 }
 return best||{x:0,y:7};
}
function sanitize(){
 const S=globalThis.SH;if(!S)return;
 const p=S.pos;if(p.x<5000&&contains(p.x,p.y)&&S.X.hitC(p.x,p.y,.3)){const q=nearestFree(p.x,p.y);p.x=q.x;p.y=q.y}
 // Existing saved outdoor entities retain their state, but cannot respawn inside moved walls.
 for(const a of S.items)if(a.on!==false&&a.x<5000&&contains(a.x,a.y)&&S.X.hitC(a.x,a.y,.2)){const q=nearestFree(a.x,a.y);a.x=q.x;a.y=q.y}
 for(const a of S.ens)if(a.x<5000&&contains(a.x,a.y)&&S.X.hitC(a.x,a.y,.3)){const q=nearestFree(a.x,a.y);a.x=a.wx=q.x;a.y=a.wy=q.y}
}
globalThis.URBAN_PLAN={contains,apply,migrate,sanitize,nearestFree,state,extra};
})();
