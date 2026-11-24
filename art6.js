/* SAFE HAVEN: display-only low-poly nature. Logical objects/colliders/saves are untouched. */
(()=>{'use strict';const SH=globalThis.SH,T=globalThis.THREE;if(!SH||!T)return;
const cache=new Map(),material=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
/* NUITUYET37: đá núi tuyết – nt_sr (đá phủ tuyết trang trí), nt_st (đá khai thác), nt_cu (quặng đồng), nt_fe (quặng sắt); số cuối = kiểu 0–11 */
const NT={ntsr:{snow:.9},ntst:{snow:.42},ntcu:{snow:.22,ore:'cu'},ntfe:{snow:.22,ore:'fe'}};
const kind=k=>{const m=/^nt_(st|cu|fe|sr)\d+$/.exec(k);if(m)return'nt'+m[1];return kind0(k)};
const kind0=k=>/^(?:rock[123]|hrk[1-5])$/.test(k)?'rock':/^(?:bush[1-5]|hbu[1-6]|m6_bui_hoa_(?:hong|tim))$/.test(k)?'bush':/^(?:hfl[0-4]|m6_hoa_vang)$/.test(k)?'flower':/^(?:hrd[1-3]|m6_co_lau)$/.test(k)?'reed':null;
function rng(seed){let s=seed>>>0;return()=>((s=Math.imul(s,1664525)+1013904223>>>0)/4294967296)}
function variant(k,x,z,m){let n=0;for(const c of String(k))n=(n*31+c.charCodeAt(0))>>>0;return (n+Math.abs(Math.floor(x*7+z*13)))%(m||6)}
/* ===== LIVE (22/11): ĐÁ 3D theo ảnh mẫu =====
   12 kiểu: 0–5 tảng tròn có mặt vỡ phẳng (ảnh 1) · 6–11 khối vuông vát góc / phiến xếp chồng (ảnh 2).
   Mỗi cụm: tảng lớn + 1–2 tảng nhỏ (có cụm to, cụm nhỏ). Tông nâu xám ấm, mặt trên sáng, viền cạnh sáng,
   vết nứt, rêu xanh vàng phủ một góc đỉnh rủ xuống, chân đá ngả xanh tối. Pháp tuyến "gấp" theo góc → mặt phẳng rõ, cạnh mềm. */
const ROCKN=new Map();
function rockMake(v,P,C,hh,vn,col,sty){sty=sty||{};const N=[],V=[];const Lx=-.45,Ly=.75,Lz=.5,Ll=Math.hypot(Lx,Ly,Lz);
 function stone(o){const s=o.seed,H=(a,b)=>hh(a,b,s*13|0),g0=o.block?new T.BoxGeometry(2,2,2,6,6,6):new T.IcosahedronGeometry(1,3),q=g0.toNonIndexed();g0.dispose();const ar=q.attributes.position.array,ca=Math.cos(o.rot),sa=Math.sin(o.rot);
  const cuts=[];
  if(o.block){/* khối hộp: vát 12 cạnh + 8 góc + vài vết sứt lớn → mặt phẳng gọn như đá đẽo */const r2=Math.SQRT2,r3=Math.sqrt(3);
   for(const[a,b]of[[0,1],[0,2],[1,2]])for(const u of[-1,1])for(const w of[-1,1]){const n=[0,0,0];n[a]=u/r2;n[b]=w/r2;cuts.push([...n,(1.22+H(a*3+b,u*2+w)*.12)])}
   for(const sx of[-1,1])for(const sy of[-1,1])for(const sz of[-1,1])cuts.push([sx/r3,sy/r3,sz/r3,1.38+H(sx+2,sy*3+sz)*.14]);
   for(let j=0;j<3;j++){const t=H(j,7)*6.283,p=(H(j,9)-.1)*1.3,n=[Math.cos(t)*Math.cos(p),Math.sin(p),Math.sin(t)*Math.cos(p)],sup=Math.abs(n[0])+Math.abs(n[1])+Math.abs(n[2]);cuts.push([...n,sup*(.78+H(j,11)*.12)])}}
  else for(let j=0;j<13;j++){const t=H(j,3)*6.283,p=(H(j,5)-.22)*1.75,n=[Math.cos(t)*Math.cos(p),Math.sin(p),Math.sin(t)*Math.cos(p)];cuts.push([...n,.64+H(j,13)*.16])}
  const cr=[];for(let j=0;j<(o.crack||0);j++){const t=H(j,21)*6.283,n=[Math.cos(t),.25*(H(j,23)-.5),Math.sin(t)],l=Math.hypot(...n);cr.push([n[0]/l,n[1]/l,n[2]/l,(H(j,25)-.5)*.35])}
  const tmp=[];let y0=1e9,y1=-1e9;
  for(let i=0;i<ar.length;i+=3){let x=ar[i],y=ar[i+1],z=ar[i+2];
   if(!o.block){const k=.92+.16*vn(x*1.3+s,y*1.3,z*1.3-s);x*=k;y*=k;z*=k}
   for(const c of cuts){const d=x*c[0]+y*c[1]+z*c[2]-c[3];if(d>0){x-=c[0]*d;y-=c[1]*d;z-=c[2]*d}}
   const nz=1+(o.block?.012:.03)*(vn(x*5+s,y*5,z*5)-.5);x*=nz;y*=nz;z*=nz;
   let cw=0;for(const c of cr){const d=Math.abs(x*c[0]+y*c[1]+z*c[2]-c[3]);if(d<.045&&y>-.55){const w=1-d/.045;if(w>cw)cw=w}}if(cw){const k=1-.05*cw;x*=k;z*=k}
   if(o.slope)y+=x*o.slope;
   x*=o.sx;y*=o.sy;z*=o.sz;const wx=o.x+x*ca-z*sa,wz=o.z+x*sa+z*ca;tmp.push([wx,y,wz,cw,x/o.sx,z/o.sz]);if(y<y0)y0=y;if(y>y1)y1=y}
  q.dispose();const hgt=y1-y0||1,bury=.05*o.sy;
  for(const t of tmp){let y=t[1]-y0-bury+(o.oy||0);if(!o.oy&&y<0)y=0;t[1]=y;t.push((t[1]-(o.oy||0))/hgt)}
  for(let i=0;i<tmp.length;i+=3){const a=tmp[i],b=tmp[i+1],c=tmp[i+2];if(!o.oy&&a[1]<.002&&b[1]<.002&&c[1]<.002)continue;/* đáy sát đất: bỏ */
   for(const p of[a,b,c])V.push({p:[p[0],p[1],p[2]],cw:p[3],lx:p[4],lz:p[5],h:Math.max(0,Math.min(1,p[6])),o})}}
 // ---------- bố cục cụm (mặt bằng ~ x ±.4, z ±.28 trong đơn vị bề rộng) ----------
 const S=(x,z,sx,sy,sz,rot,seed,ex)=>stone(Object.assign({x,z,sx,sy,sz,rot,seed},ex||{}));
 const MZ=(a,amt)=>({moss:amt==null?1:amt,mossA:a});
 switch(v){
  case 0:S(-.06,-.01,.27,.25,.21,.3,1,{...MZ(.6),crack:1});S(.22,.08,.14,.12,.12,1.2,2,MZ(-1,.3));break;
  case 1:S(-.06,0,.33,.15,.19,.15,3,{...MZ(.2),crack:1,slope:.12});S(.25,.03,.14,.13,.12,.9,4,MZ(1,.5));S(.1,.15,.08,.06,.07,2,5);break;
  case 2:S(.03,-.05,.17,.28,.16,.5,6,{...MZ(.8),crack:1});S(-.13,.11,.15,.12,.12,1.4,7);S(.16,.14,.08,.07,.07,.3,8);break;
  case 3:S(-.1,-.02,.22,.22,.2,.8,9,MZ(.4));S(.17,.07,.16,.14,.14,2.1,10,MZ(.9,.6));break;
  case 4:S(0,0,.17,.15,.15,1.1,11,MZ(.5,.7));S(.17,.1,.08,.06,.07,.6,12);break;/* cụm nhỏ */
  case 5:S(-.06,.05,.3,.11,.19,.2,13,MZ(2.2,.4));S(.07,-.07,.25,.11,.16,.6,14,{...MZ(.3,.5),oy:.08});break;/* phiến chồng */
  case 6:S(-.05,-.02,.24,.27,.2,.2,15,{block:1,...MZ(2.4),crack:2});S(.22,.09,.11,.12,.1,.5,16,{block:1,...MZ(.8,.4)});break;
  case 7:S(-.05,-.03,.33,.16,.18,.1,17,{block:1,...MZ(2.6),crack:1});S(.22,.1,.1,.11,.09,.3,18,{block:1,...MZ(1,.5)});S(.05,.15,.09,.08,.08,.8,19,{block:1});break;
  case 8:S(-.04,-.04,.16,.29,.15,.25,20,{block:1,...MZ(2.4),crack:1});S(.17,.09,.12,.13,.11,.6,21,{block:1,...MZ(.6,.6)});break;
  case 9:S(-.13,-.02,.17,.23,.16,.15,22,{block:1,...MZ(2.6),crack:1});S(.13,.05,.16,.18,.15,.4,23,{block:1,...MZ(.9,.5),crack:1});break;
  case 10:S(0,0,.16,.15,.15,.4,24,{block:1,...MZ(2.4,.7)});S(.17,.1,.07,.07,.07,.9,25,{block:1});break;/* cụm nhỏ vuông */
  default:S(-.04,.05,.32,.1,.2,.12,26,{block:1,...MZ(.4,.3),crack:1});S(.06,-.07,.25,.1,.16,.35,27,{block:1,...MZ(.5,.5),oy:.085,crack:1});break;/* phiến vuông chồng */
 }
 // ---------- pháp tuyến "gấp" (góc > ~42° giữ cạnh, nhỏ hơn thì làm mượt) ----------
 const FN=[];for(let i=0;i<V.length;i+=3){const a=V[i].p,b=V[i+1].p,c=V[i+2].p,ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;FN.push([nx/l,ny/l,nz/l,l])}
 const key=p=>Math.round(p[0]*2e4)+','+Math.round(p[1]*2e4)+','+Math.round(p[2]*2e4),at=new Map();
 for(let i=0;i<V.length;i++){const k=key(V[i].p);let L=at.get(k);if(!L)at.set(k,L=[]);L.push((i/3)|0)}
 for(let i=0;i<V.length;i++){const f=FN[(i/3)|0],L=at.get(key(V[i].p));let sx=0,sy=0,sz=0,mn=1;for(const j of L){const g=FN[j],d=f[0]*g[0]+f[1]*g[1]+f[2]*g[2];if(d<mn)mn=d;if(d>.9){sx+=g[0]*g[3];sy+=g[1]*g[3];sz+=g[2]*g[3]}}const l=Math.hypot(sx,sy,sz)||1;
  const n=[sx/l,sy/l,sz/l],q=V[i],p=q.p,o=q.o;N.push(...n);
  // ---------- màu ----------
  const PAL=sty.ore==='cu'?[0x5e4836,0x4f3c2d,0x6b543f]:sty.ore==='fe'?[0x414147,0x36363c,0x4c4c53]:sty.snow?[0x868a92,0x767a82,0x959aa2]:[0x8e7d6b,0x7b6c5d,0x9c8975];
  const t=vn(p[0]*6+o.seed,p[1]*6,p[2]*6),c=col(PAL[0]).lerp(col(t>.5?PAL[1]:PAL[2]),Math.abs(t-.5)*2);
  const sh=.5+.34*Math.max(0,n[1])+.3*Math.max(0,(n[0]*Lx+n[1]*Ly+n[2]*Lz)/Ll)-(n[1]<-.1?.1:0);c.multiplyScalar(sh);
  if(n[1]>.5)c.lerp(col(0xc9b292),.3*(n[1]-.5)/.5*(.4+.6*q.h));
  const cre=1-mn;if(cre>.08&&n[1]>-.15)c.lerp(col(0xe2cfae),Math.min(.45,cre*1.1)*(n[1]>.25?1:.6));/* viền cạnh sáng */
  if(q.cw)c.multiplyScalar(1-.62*q.cw);/* vết nứt */
  if(q.h<.3&&!o.oy)c.lerp(col(sty.snow?0x4d5059:0x5a5d3a),.5*(1-q.h/.3));/* chân đá ngả tối */
  if(sty.ore==='cu'){/* quặng đồng: mạch & mảng cam đồng sáng + đốm lục (malachit) */const om=vn(p[0]*8+o.seed,p[1]*8,p[2]*8),bd=Math.abs(Math.sin(p[0]*11+p[2]*8+p[1]*6+om*5));
   if(om>.56||bd<.2){const cc=col(0xd8742a).lerp(col(0xffb35a),vn(p[0]*20,p[1]*20,p[2]*20+o.seed));cc.multiplyScalar(.8+.4*Math.max(0,n[1]));c.lerp(cc,.95)}
   else if(vn(p[0]*14-o.seed,p[1]*14,p[2]*14)>.7)c.lerp(col(0x27b384),.85)}
  if(sty.ore==='fe'){/* quặng sắt: mảng gỉ đỏ nâu + ánh kim loại */const om=vn(p[0]*7+o.seed,p[1]*7,p[2]*7),bd=Math.abs(Math.sin(p[0]*9-p[2]*10+p[1]*7+om*5));
   if(om>.6||bd<.13){const cc=col(0x7a2a14).lerp(col(0xa8401f),vn(p[0]*18,p[1]*18,p[2]*18+o.seed));cc.multiplyScalar(.75+.35*Math.max(0,n[1]));c.lerp(cc,.88)}
   if(vn(p[0]*26,p[1]*26+o.seed,p[2]*26)>.74)c.lerp(col(0xd5dde6),.8)}
  if(sty.snow){/* tuyết phủ mặt trên */const sn=Math.min(1,Math.max(0,(n[1]-.42)/.22))*(.45+.55*q.h)*sty.snow*(vn(p[0]*9+o.seed,p[1]*9,p[2]*9)>.25?1:.5);if(sn>.02)c.lerp(col(0xf1f5fb).multiplyScalar(.9+.12*Math.max(0,n[1])),Math.min(.95,sn))}
  if(o.moss&&!sty.snow){/* rêu: phủ một góc đỉnh, rủ xuống theo vệt */const ang=Math.atan2(q.lz,q.lx);let ad=Math.abs(((ang-o.mossA)%6.283+9.425)%6.283-3.1416);const sp=.5+.4*o.moss,mn2=vn(p[0]*14+o.seed,p[1]*14,p[2]*14);let m=0;
   const rr=Math.min(1,Math.hypot(q.lx,q.lz)),edge=Math.min(1,Math.max(0,(rr-.3)/.4));/* dồn rêu ra mép góc đỉnh */
   if(n[1]>.2&&q.h>.62)m=Math.min(1,(q.h-.62)/.1)*Math.max(0,1-ad/sp)*(.35+.65*edge)*(.55+.9*mn2);
   else if(n[1]>-.4&&q.h>.4&&ad<sp*.75){const st=vn(p[0]*34+o.seed,0,p[2]*34);m=Math.max(0,(q.h-.4)/.25)*Math.max(0,1-ad/(sp*.75))*(st>.55?1.1:0)}
   m*=o.moss;const mk=m<.22?0:m<.34?(m-.22)/.12:1;/* viền rêu gọn, không loang mờ */
   if(mk>0){const nn=vn(p[0]*22,p[1]*22+o.seed,p[2]*22),mc=col(0x6c9426).lerp(col(0xa3c93f),nn);mc.multiplyScalar(.7+.38*Math.max(0,n[1]));if(mk<1)mc.lerp(col(0x4d6a1d),.5);c.lerp(mc,mk)}}
  P.push(...p);C.push(c.r,c.g,c.b)}
 ROCKN.set(v,N)}
function geometry(type,v){const id=type+v;if(cache.has(id))return cache.get(id);const R=rng(173+v*917),P=[],C=[];
const col=h=>new T.Color(h),green=[0x285f49,0x347b54,0x4c9362,0x6aa56e,0x84b477],stone=[0x6e7888,0x85909f,0x9ca6b2,0x616d7c];
function tri(a,b,c,h){const q=col(h);for(const p of[a,b,c]){P.push(...p);C.push(q.r,q.g,q.b)}}
function add(g,s,p,a,h){const q=g.index?g.toNonIndexed():g;const ar=q.attributes.position.array,ca=Math.cos(a),sa=Math.sin(a);for(let i=0;i<ar.length;i+=9){const vs=[];for(let j=0;j<9;j+=3){const x=ar[i+j]*s[0],y=ar[i+j+1]*s[1],z=ar[i+j+2]*s[2];vs.push([p[0]+x*ca-z*sa,p[1]+y,p[2]+x*sa+z*ca])}tri(...vs,h)}if(q!==g)q.dispose()}
// Curved leaves have a raised centre vein: real volume, readable from above and the side.
function leaf(x,y,z,a,len,wide,bend,h){const ca=Math.cos(a),sa=Math.sin(a),left=[],right=[],mid=[];for(let i=0;i<=4;i++){const t=i/4,ww=Math.sin(Math.PI*t)*wide,reach=bend*t*t,yy=len*(t-.24*t*t);const at=(u,r,d)=>[x+u*ca-r*sa,y+yy+d,z+u*sa+r*ca];left.push(at(-ww,reach,0));right.push(at(ww,reach,0));mid.push(at(0,reach,wide*.24*Math.sin(t*Math.PI)))}for(let i=0;i<4;i++){tri(left[i],left[i+1],mid[i+1],h);tri(left[i],mid[i+1],mid[i],h);tri(mid[i],mid[i+1],right[i+1],green[(green.indexOf(h)+1)%green.length]);tri(mid[i],right[i+1],right[i],h)}}
function flower(x,y,z,h,size){const petals=5;for(let j=0;j<petals;j++){const a=j/petals*Math.PI*2,dx=Math.cos(a),dz=Math.sin(a),tx=-dz,tz=dx;tri([x,y+.015,z],[x+dx*size*.65+tx*size*.4,y+.035,z+dz*size*.65+tz*size*.4],[x+dx*size,y+.01,z+dz*size],h);tri([x,y+.015,z],[x+dx*size,y+.01,z+dz*size],[x+dx*size*.65-tx*size*.4,y+.035,z+dz*size*.65-tz*size*.4],h)}const g=new T.IcosahedronGeometry(size*.19,0);add(g,[1,.55,1],[x,y+.04,z],0,0xf6ce69);g.dispose()}
if(type==='rock'||NT[type]){
 /* LIVE (22/11): tảng đá tự nhiên – khối cầu chia nhỏ, mặt lồi lõm theo nhiễu (không còn khối lăng trụ xanh nhợt),
    tông đá ấm hợp với cây vẽ tay, mặt trên sáng / đáy tối, rêu loang ở mặt trên. Không còn lá & hoa gắn chân đá. */
 const sd=v*131+7,hh=(a,b,c)=>{let n=Math.imul(a|0,73856093)^Math.imul(b|0,19349663)^Math.imul(c|0,83492791)^Math.imul(sd,2654435761);n=Math.imul(n^n>>>13,0x5bd1e995);return((n^n>>>15)>>>0)/4294967296};
 const vn=(x,y,z)=>{const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),fx=x-xi,fy=y-yi,fz=z-zi,u=fx*fx*(3-2*fx),w=fy*fy*(3-2*fy),q=fz*fz*(3-2*fz),L=(a,b,t)=>a+(b-a)*t;
  return L(L(L(hh(xi,yi,zi),hh(xi+1,yi,zi),u),L(hh(xi,yi+1,zi),hh(xi+1,yi+1,zi),u),w),L(L(hh(xi,yi,zi+1),hh(xi+1,yi,zi+1),u),L(hh(xi,yi+1,zi+1),hh(xi+1,yi+1,zi+1),u),w),q)};
 const BASE=[[0x958b7a,0x857c6c,0xa29785,0x786f61],[0x91877a,0x9e9381,0x81786a,0xaa9e8a],[0x8f8c82,0x807e75,0x9c998d,0x737169]][v%3];
 const MOSS=[0x56722f,0x4c6a2b,0x67833a];
 function boulder(cx,cz,rx,ry,rz,rot,seed,mossy){const g=new T.IcosahedronGeometry(1,3),q=g.toNonIndexed();g.dispose();const ar=q.attributes.position.array,ca=Math.cos(rot),sa=Math.sin(rot),cy=ry*.62,pts=[],ks=[];
  // các mặt cắt phẳng ngẫu nhiên → mặt vỡ góc cạnh như đá thật (không tròn như củ khoai)
  const CUT=[];for(let j=0;j<8;j++){const t=hh(j,seed*7|0,3)*6.283,p=(hh(j,seed*7|0,5)-.25)*1.9,n=[Math.cos(t)*Math.cos(p),Math.sin(p),Math.sin(t)*Math.cos(p)],l=Math.hypot(...n);CUT.push([n[0]/l,n[1]/l,n[2]/l,.62+hh(j,seed*7|0,9)*.22])}
  for(let i=0;i<ar.length;i+=3){let x=ar[i],y=ar[i+1],z=ar[i+2];const n1=vn(x*1.5+seed,y*1.5+seed*.7,z*1.5-seed),n2=vn(x*3.6-seed,y*3.6,z*3.6+seed*1.3),n3=vn(x*7+seed,y*7,z*7);let k=.86+.26*n1+.1*n2+.04*n3;
   x*=k;y*=k;z*=k;for(const c of CUT){const d=x*c[0]+y*c[1]+z*c[2]-c[3];if(d>0){x-=c[0]*d;y-=c[1]*d;z-=c[2]*d}}k=Math.hypot(x,y,z);
   x*=rx;y*=ry;z*=rz;if(y>0)y*=1-.16*vn(x*5+seed,0,z*5);/* đỉnh hơi bằng, vỡ cạnh */const wy=Math.max(0,y+cy);/* đáy phẳng, chôn nhẹ xuống đất */
   // màu theo từng ĐỈNH (pháp tuyến elipsoid mượt + vị trí) → màu chuyển dần, không lộ mặt tam giác
   const ex=ar[i]/rx,ey=ar[i+1]/ry,ez=ar[i+2]/rz,el=Math.hypot(ex,ey,ez)||1,ny=ey/el,nz=(ar[i]*sa+ar[i+2]*ca)/rz/el,wx=cx+x*ca-z*sa,wz=cz+x*sa+z*ca,h=Math.min(1,wy/(ry*1.7+.001));
   const bi=vn(wx*4+seed,wy*4,wz*4)*3.999,b0=col(BASE[bi|0]).lerp(col(BASE[Math.min(3,(bi|0)+1)]),bi-(bi|0));
   b0.multiplyScalar(.9+.18*h);/* sáng/tối theo hướng mặt tính sau, bằng pháp tuyến mượt thật */
   if(k<.86)b0.multiplyScalar(.76+.24*Math.max(0,(k-.66)/.2));/* chỗ lõm/khe tối hơn */
   const mo=vn(wx*6+seed,wy*6,wz*6);if(mossy&&ny>.65&&h>.55&&mo>.66)b0.lerp(col(MOSS[(mo*7|0)%3]),Math.min(.5,(mo-.66)*4));
   else{const wt=vn(wx*9-seed,wy*9,wz*9);if(ny>.3&&h>.5&&wt>.7)b0.lerp(col(0xc4bba6),Math.min(.3,(wt-.7)*3))}/* mặt trên phong hoá sáng */
   pts.push([wx,wy,wz,b0.r,b0.g,b0.b]);ks.push(k)}
  q.dispose();
  for(let i=0;i<pts.length;i+=3){const a=pts[i],b=pts[i+1],c=pts[i+2],ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];const nx=uy*vz-uz*vy,ny0=uz*vx-ux*vz,nz=ux*vy-uy*vx,ny=ny0/(Math.hypot(nx,ny0,nz)||1);
   if((a[1]+b[1]+c[1])/3<.004&&ny<-.5)continue;/* mặt đáy nằm dưới đất: bỏ */
   for(const p of[a,b,c]){P.push(p[0],p[1],p[2]);C.push(p[3],p[4],p[5])}}}
 void boulder;/* bản cũ giữ lại không dùng */
 rockMake(v,P,C,hh,vn,col,NT[type]);
}
else {const broad=type==='bush',n=broad?30:type==='reed'?22:18;for(let i=0;i<n;i++){const a=i*2.39996+R()*.3,r=(broad?.27:.16)*Math.sqrt(R()),x=Math.cos(a)*r,z=Math.sin(a)*r*.7,y=broad?(i%3)*.12:0;leaf(x,y,z,a,(broad?.21:.34)+R()*(broad?.27:.38),broad?.075+R()*.045:.018+R()*.025,(broad?.18:.2)+R()*.16,green[i%green.length])}
 const hues=type==='flower'&&v%3===0?0xffefb4:v%3===1?0xf3a9ce:v%3===2?0xb7b5f3:0xf6f3df;
 if(type==='reed'){for(let i=0;i<6;i++){const a=i*2.4,x=Math.cos(a)*.12,z=Math.sin(a)*.09;leaf(x,0,z,a,.86,.008,.1,green[2]);const g=new T.IcosahedronGeometry(1,0);add(g,[.035,.15,.03],[x-.06,.72+R()*.14,z],-.2,0xe9d8ae);g.dispose()}}
 else for(let i=0;i<(broad?7:5);i++){const a=i*2.4,r=i?.2:0;flower(Math.cos(a)*r,(broad?.38:.3)+R()*.12,Math.sin(a)*r*.66,hues,broad?.075:.06)}
}
const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('color',new T.Float32BufferAttribute(C,3));g.computeVertexNormals();
if((type==='rock'||NT[type])&&ROCKN.has(v)){/* LIVE: pháp tuyến "gấp" tính sẵn trong rockMake */g.setAttribute('normal',new T.Float32BufferAttribute(ROCKN.get(v),3));ROCKN.delete(v)}g.computeBoundingBox();g.computeBoundingSphere();cache.set(id,g);return g}
/* LIVE (22/11): bỏ bụi cây & hoa 3D – không dựng nữa (chỗ gọi tự dùng hình 2D hoặc bỏ qua). */
const OFF=new Set(['bush','flower']);
function create(k,w,x,z,forced){let type=forced||kind(k);if(!type||OFF.has(type)||!Number.isFinite(w)||w<=0)return null;
 /* NUITUYET37: đá bảng có sẵn nằm trong khu núi tuyết → phủ tuyết (vẫn khai thác như cũ) */if(type==='rock'&&SH.ART6&&SH.ART6.snowAt&&SH.ART6.snowAt(x,z))type='ntsr';
 const mm=/^nt_(?:st|cu|fe|sr)(\d+)$/.exec(k),v=mm?(+mm[1])%12:variant(k,x,z,type==='rock'||NT[type]?12:6),m=new T.Mesh(geometry(type,v),material);
 /* LIVE: đá có cụm to cụm nhỏ – lệch cỡ ±15% theo vị trí (hình thôi, va chạm giữ nguyên) */const sz=type==='rock'||type==='ntsr'&&!mm?.85+.3*((Math.abs(Math.floor(x*13.7+z*7.3))%97)/96):1;m.scale.setScalar(w*sz);
 /* camera 2.5D nhìn dốc → khối 3D trông lùn; kéo cao đá như các hình đứng khác trong game */if(type==='rock'||NT[type])m.scale.y*=1.45;m.position.set(x,.025,z);m.userData.art6={type,variant:v};return m}
// Forest undergrowth is instanced by shape/variant (at most 12 draw calls), not one draw per leaf.
function batch(items,type){if(OFF.has(type))return[];const bins=new Map();for(const o of items){const k=type+variant(o.k||type,o.x,o.y);if(!bins.has(k))bins.set(k,[]);bins.get(k).push(o)}const result=[],dummy=new T.Object3D();for(const[key,list]of bins){const v=+key.slice(-1),m=new T.InstancedMesh(geometry(type,v),material,list.length);for(let i=0;i<list.length;i++){const o=list[i];dummy.position.set(o.x,.025,o.y);dummy.scale.setScalar(o.w);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix)}m.instanceMatrix.needsUpdate=true;m.frustumCulled=false;m.userData.art6={type,instances:list.length};result.push(m)}return result}
SH.ART6={kind,create,batch,cache,material,version:8,rockGeo:v=>geometry('rock',v),geo:(type,v)=>geometry(type,v),snowAt:null};})();
