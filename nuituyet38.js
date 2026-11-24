/* NUITUYET38 (22/11): NÚI TUYẾT (Đỉnh Bạch Vân) – 5 TẦNG ĐỊA HÌNH THẬT (thay NUITUYET37 bản phẳng).
   Dùng ELEV38 (elev38.js): mặt đất có độ cao thật, vách đá là mặt dốc đứng của lưới địa hình, vật/nhân vật đứng đúng độ cao, va chạm sinh từ độ dốc.
   Tầng (độ cao chỗ đứng):
     1 · Chân núi   0 m  – rừng thông phủ tuyết dày, Suối Mây/Suối Sương giữ nguyên ở mặt đất
     2 · Thung lũng 5 m  – hồ băng, suối nước nóng, nhà gỗ, thông thưa
     3 · Sườn núi  10 m  – vách đá, đường đèo, khe núi khoét sâu + cầu gỗ
     4 · Hang Băng 15 m  – cửa hang lớn nằm trong vách khối núi đá (27 m, không leo được)
     5 · Đỉnh núi  20 m  – bãi khai thác: đá thường / quặng đồng / quặng sắt = 60% / 20% / 20%
   Lên đỉnh: cửa vào (tầng 1) → cầu Suối Mây → đèo 1 → thung lũng → đèo 2 → sườn → cầu khe → đèo 3 → bậc hang → đèo 4 → đỉnh.
   Giữ: mục lưu 'nt37' (trạng thái điểm khai thác), quái trong khu (chỉ dời điểm sinh nào rơi vào vách), không thêm BOSS, không đụng khu khác. */
(()=>{'use strict';
const SH=globalThis.SH,W=globalThis.W15,M=globalThis.MAP26,EV=globalThis.ELEV38;
const ST={rev:38,applied:false,error:null,nodes:{st:0,cu:0,fe:0},mined:{st:0,cu:0,fe:0},cleared:{K:0,D:0,C:0,dec:0},trees:0,rocks:0,props:0,cols:0,cliffCols:0,sizes:{},bridges:0,sprites:0,tiles:0,tileMs:0,spawnMoved:0,unstuck:0,buildMs:0};
const API={stats:ST};globalThis.NUITUYET38=API;globalThis.NUITUYET37=API;
if(!SH||!W||!SH.X||!M||!W.ZV2||!EV){ST.error='thiếu SH/W15/MAP26/ELEV38';console.warn('[NT38]',ST.error);return}
const X=SH.X,S=SH.S,pos=SH.pos,AS=SH.AS,SW=SH.SW||{};
const say=m=>{try{SH.say(m)}catch(_){}},IH=()=>!!(SH.IH&&SH.IH()),GT=()=>+SH.GT||0,V25on=()=>!!(SH.V25&&SH.V25.on);
const ZN='Đỉnh Bạch Vân',ZONE=()=>W.ZV2.find(z=>z.n===ZN);
function rng(s){s=(s|0)||1;return()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const h32=n=>{n=Math.imul(n^0x9e3779b9,0x85ebca6b);n^=n>>>13;n=Math.imul(n,0xc2b2ae35);n^=n>>>16;return(n>>>0)/4294967296};
const hh=(a,b,c)=>h32(Math.imul(a|0,73856093)^Math.imul(b|0,19349663)^Math.imul((c|0)+7,83492791));
const vn=(x,y,s)=>{const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,u=fx*fx*(3-2*fx),w=fy*fy*(3-2*fy);const a=hh(xi,yi,s),b=hh(xi+1,yi,s),c=hh(xi,yi+1,s),d=hh(xi+1,yi+1,s);return(a+(b-a)*u)+((c+(d-c)*u)-(a+(b-a)*u))*w};
const fbm=(x,y,s)=>vn(x,y,s)*.6+vn(x*2.1,y*2.1,s+11)*.28+vn(x*4.3,y*4.3,s+23)*.12;
const sstep=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const dSeg=(x,y,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/L));return Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t)};
const dPoly=(x,y,P)=>{let d=1e9;for(let i=0;i<P.length-1;i++){const q=dSeg(x,y,P[i],P[i+1]);if(q<d)d=q}return d};

/* ================= 1) QUY HOẠCH 5 TẦNG (toạ độ thế giới, y âm = phía bắc) ================= */
// đa giác tầng (đường viền thật được làm gồ ghề tự nhiên bằng nhiễu, không có cạnh thẳng/chữ nhật); h = max các tầng chứa điểm
const TIERS=[
 {k:'valley',lv:1,h:7,seed:21,p:[[128,-534],[146,-500],[172,-472],[205,-458],[245,-452],[290,-450],[318,-456],[338,-466],[356,-478],[372,-490],[386,-503],[412,-505],[414,-560],[410,-600],[402,-634],[300,-600],[200,-563]]},
 {k:'slope',lv:2,h:14,seed:33,p:[[396,-506],[420,-497],[452,-492],[490,-494],[525,-490],[560,-493],[600,-490],[640,-494],[672,-496],[700,-499],[728,-494],[756,-499],[768,-516],[778,-533],[760,-560],[700,-575],[640,-582],[560,-580],[480,-582],[400,-580],[394,-545]]},
 {k:'cave',lv:3,h:21,seed:45,p:[[668,-514],[700,-512],[730,-510],[756,-514],[772,-530],[770,-541],[740,-562],[712,-566],[668,-566],[664,-540]]},
 {k:'peak',lv:4,h:28,seed:57,p:[[394,-574],[430,-571],[470,-576],[510,-571],[550,-575],[590,-571],[630,-576],[660,-562],[700,-562],[706,-574],[712,-586],[684,-604],[662,-614],[641,-628],[615,-639],[560,-652],[408,-652],[398,-636],[392,-610]]},
 {k:'massif',lv:5,h:40,seed:69,solid:1,ea:[2.2,1.6,.5,.5,1.6,2],p:[[708,-561],[745,-556],[778,-541],[740,-567],[712,-586.5],[705,-574]]}];
// sống núi đá phủ tuyết dọc mép ngoài khu (không leo được) – tạo dáng núi như ảnh mẫu, che chỗ địa hình hạ xuống ở biên
function rim(A,B,in0,in1,h,seed){const dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L,p=[];
 p.push([A[0]+nx*in0,A[1]+ny*in0],[B[0]+nx*in0,B[1]+ny*in0]);const n=Math.ceil(L/6);for(let i=n;i>=0;i--){const t=i/n,w=in1*(.55+.9*vn(t*L/14,seed,3));p.push([A[0]+dx*t+nx*w,A[1]+dy*t+ny*w])}
 return{k:'rim',lv:5,h,seed,solid:1,a:2.4,ea:[.4,2.4],p}}
TIERS.push(rim([111,-536],[330,-616.4],1,10,19,81),rim([326,-615],[408,-645],1,12,38,83),rim([615,-645],[664,-622],1,12,38,85),rim([660,-624.8],[712,-588.7],1,12,38,87));
const HT=7;// chênh độ cao mỗi tầng (m)
const LV=[{k:'foot',n:'Tầng 1 · Chân núi – Rừng thông tuyết'},{k:'valley',n:'Tầng 2 · Thung lũng Băng'},{k:'slope',n:'Tầng 3 · Sườn núi – Đường đèo'},{k:'cave',n:'Tầng 4 · Hang Băng'},{k:'peak',n:'Tầng 5 · Đỉnh núi – Bãi khai thác'}];
// đường đèo (dốc thoải ≤ ~25%, rộng 5 m, hai bên là vách) – nối tầng dưới lên tầng trên
const RAMPS=[
 {k:'r1',h0:0,h1:7,w:7,p:[[309,-431],[302,-449],[294,-470]]},
 {k:'r2',h0:7,h1:14,w:7,p:[[362,-532],[384,-536],[404,-539],[422,-542]]},
 {k:'r3',h0:14,h1:21,w:7,p:[[630,-527],[652,-531],[672,-534],[692,-537]]},
 {k:'r4',h0:21,h1:28,w:7,p:[[705,-538],[700,-552],[694,-566],[684,-586]]}];
const RAVINE=[[593,-486],[592,-499],[588,-512],[589,-528],[586,-543],[588,-556],[590,-568]],RAV_W=5,RAV_D=6;
const LAKE={x:243,y:-512,rx:20,ry:12};
const SPRING={x:300,y:-516,rx:4.6,ry:3.1};
const CABIN={x:232,y:-481};
const CAVE={x:737,y:-549,w:19};// y chỉnh theo chân vách thật khi dựng
const FIELD={r:[406,-640,652,-588]};// bãi khai thác (tầng 5)
const TRAILS=[
 {k:'entry',w:3.4,p:[[316.7,-391],[318.3,-400],[322,-410],[321,-420],[316,-428],[310,-433],[309,-431]]},
 {k:'forest',w:3,p:[[322,-410],[350,-424],[390,-444],[440,-458],[500,-456],[560,-454],[610,-468],[648,-480]]},
 {k:'r1',w:4,p:RAMPS[0].p},
 {k:'valley',w:3,p:[[295,-467],[270,-467],[250,-468],[232,-470],[214,-473]]},
 {k:'lake',w:2.4,p:[[250,-468],[251,-482],[250,-498]]},
 {k:'spring',w:2.4,p:[[295,-467],[297,-485],[300,-507]]},
 {k:'up2',w:3,p:[[300,-507],[325,-522],[348,-530],[366,-533]]},
 {k:'r2',w:4,p:RAMPS[1].p},
 {k:'pass',w:3.2,p:[[418,-541],[440,-538],[465,-533],[492,-529],[520,-526],[548,-523],[572,-521],[588.6,-521],[606,-523],[622,-526],[634,-528]]},
 {k:'r3',w:4,p:RAMPS[2].p},
 {k:'cave',w:2.8,p:[[690,-536],[704,-540],[720,-546],[735,-547.5]]},
 {k:'r4',w:4,p:RAMPS[3].p},
 {k:'summit',w:3,p:[[686,-582],[668,-592],[646,-598]]},
 {k:'f1',w:3,soft:1,p:[[406,-600],[440,-600],[492,-600],[540,-602],[590,-600],[646,-598]]},
 {k:'f2',w:2.8,soft:1,p:[[431,-588],[431,-604],[429,-632]]},
 {k:'f3',w:2.8,soft:1,p:[[492,-600],[493,-620],[491,-638]]},
 {k:'f4',w:2.8,soft:1,p:[[552,-588],[551,-603],[553,-634]]},
 {k:'f5',w:2.8,soft:1,p:[[606,-588],[607,-600],[605,-626]]}];
// 3 lô nhà an toàn mới (khai báo trong xd15.js: na_nt1..3), sân 26×26 m – giữ nền phẳng, không đặt cây/đá lên
const SAFE_LOTS=[{id:'na_nt1',x:470,y:-425},{id:'na_nt2',x:185,y:-520},{id:'na_nt3',x:470,y:-511}];
// nhà gỗ bỏ hoang rải rác
const HUTS=[['nt_cabin',590,-437,6.5],['nt_shed',660,-476,4.2],['nt_cabin',412,-470,6],['nt_shed',722,-522,4.2],['nt_shed',635,-590,4.6],['nt_cabin',330,-560,6.2]];
const BRIDGES=[{id:'NT1',at:[588.6,-521]}];// + cầu qua Suối Mây (tự tìm chỗ giao của đường vào với suối)

/* ================= 2) DỰNG TRƯỜNG ĐỘ CAO ================= */
const RES=.5,GB=[100,-652,795,-340];let F=null,LVL=null,DT=null;
function jitterPoly(T){const P=T.p,out=[];let s=0;const A0=T.a!=null?T.a:2.2;
 for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,n=Math.max(1,Math.ceil(L/2)),nx=-(b[1]-a[1])/L,ny=(b[0]-a[0])/L,A=T.ea&&T.ea[i]!=null?T.ea[i]:A0;
  for(let k=0;k<n;k++){const u=k/n,ss=s+L*u,d=(fbm(ss/15,T.seed*1.7,T.seed)-.5)*2*A+(vn(ss/3.4,T.seed+3,5)-.5)*Math.min(1.1,A*.5);out.push([a[0]+(b[0]-a[0])*u+nx*d,a[1]+(b[1]-a[1])*u+ny*d])}s+=L}
 return out}
function fillPoly(P,nx,ny,f){for(let j=0;j<ny;j++){const y=GB[1]+j*RES,xs=[];for(let i=0,k=P.length-1;i<P.length;k=i++){const a=P[i],b=P[k];if((a[1]>y)!==(b[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]))}
  xs.sort((p,q)=>p-q);for(let q=0;q+1<xs.length;q+=2){const i0=Math.max(0,Math.ceil((xs[q]-GB[0])/RES)),i1=Math.min(nx-1,Math.floor((xs[q+1]-GB[0])/RES));for(let i=i0;i<=i1;i++)f(j*nx+i)}}}
function projPoly(x,y,P){let best=1e9,tb=0,acc=0,tot=0;const Ls=[];for(let i=0;i<P.length-1;i++){const L=Math.hypot(P[i+1][0]-P[i][0],P[i+1][1]-P[i][1]);Ls.push(L);tot+=L}
 for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/L2)),d=Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t);if(d<best){best=d;tb=(acc+t*Ls[i])/tot}acc+=Ls[i]}return[best,tb]}
const BR=[];
function buildHeights(){const t0=performance.now(),nx=Math.round((GB[2]-GB[0])/RES)+1,ny=Math.round((GB[3]-GB[1])/RES)+1,N=nx*ny,G=new Float32Array(N),L=new Uint8Array(N),RV=new Uint8Array(N),RP=new Uint8Array(N);
 const cx=i=>GB[0]+i*RES,cy=j=>GB[1]+j*RES;
 // mỗi tầng: tô trong/ngoài rồi tính khoảng cách tới đường viền ở dải ±1,2 m → mép vách mượt theo đường cong (không răng cưa theo ô lưới)
 const IN=new Uint8Array(N),DS=new Float32Array(N);
 for(const T of TIERS){const P=jitterPoly(T);T.jp=P;IN.fill(0);DS.fill(9);fillPoly(P,nx,ny,k=>{IN[k]=1});
  for(let s=0;s<P.length;s++){const a=P[s],b=P[(s+1)%P.length],i0=Math.max(0,Math.floor((Math.min(a[0],b[0])-1.3-GB[0])/RES)),i1=Math.min(nx-1,Math.ceil((Math.max(a[0],b[0])+1.3-GB[0])/RES)),j0=Math.max(0,Math.floor((Math.min(a[1],b[1])-1.3-GB[1])/RES)),j1=Math.min(ny-1,Math.ceil((Math.max(a[1],b[1])+1.3-GB[1])/RES));
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=j*nx+i,d=dSeg(cx(i),cy(j),a,b);if(d<DS[k])DS[k]=d}}
  for(let k=0;k<N;k++){const sd=IN[k]?DS[k]:-DS[k];if(sd<=-.6)continue;const t=Math.min(1,(sd+.6)/1.2),v=T.h*t*t*(3-2*t);if(v>G[k]){G[k]=v;if(t>.5)L[k]=T.lv}}}
 // mặt tầng gợn nhẹ (±0,3 m) – hồ, suối nóng, nền nhà giữ phẳng; khối núi đá gồ ghề mạnh
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const k=j*nx+i;if(G[k]<=0)continue;const x=cx(i),y=cy(j);
  if(L[k]===5){G[k]+=(fbm(x/8,y/8,71)-.5)*5;continue}
  let fl=1;const le=((x-LAKE.x)/(LAKE.rx+4))**2+((y-LAKE.y)/(LAKE.ry+4))**2,se=((x-SPRING.x)/(SPRING.rx+4))**2+((y-SPRING.y)/(SPRING.ry+4))**2,cb=Math.max(Math.abs(x-CABIN.x+4)/16,Math.abs(y-CABIN.y)/9);
  let lf=1;for(const s of SAFE_LOTS){const q=Math.max(Math.abs(x-s.x),Math.abs(y-s.y));lf=Math.min(lf,sstep(14,17,q))}
  fl=Math.min(sstep(.75,1.2,le),sstep(.75,1.2,se),sstep(.8,1.2,cb),lf);G[k]+=(fbm(x/23,y/23,61)-.5)*.6*fl}
 // VÁCH BAO RANH GIỚI: dải vách đá khối to dọc mép khu, che khu bên ngoài; chừa lối vào (đường T2) và chỗ suối chảy ra
 {const Z=Zpoly(),ZI=new Uint8Array(N),ED=new Float32Array(N).fill(99),EI=new Int16Array(N).fill(-1);fillPoly(Z,nx,ny,k=>{ZI[k]=1});
  const NIN=Z.map((a,s)=>{const b=Z[(s+1)%Z.length],L2=Math.hypot(b[0]-a[0],b[1]-a[1])||1;let nx2=-(b[1]-a[1])/L2,ny2=(b[0]-a[0])/L2;const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;if(!inPoly(mx+nx2*2,my+ny2*2,Z)){nx2=-nx2;ny2=-ny2}return[nx2,ny2]});
  for(let s=0;s<Z.length;s++){const a=Z[s],b=Z[(s+1)%Z.length],i0=Math.max(0,Math.floor((Math.min(a[0],b[0])-13-GB[0])/RES)),i1=Math.min(nx-1,Math.ceil((Math.max(a[0],b[0])+13-GB[0])/RES)),j0=Math.max(0,Math.floor((Math.min(a[1],b[1])-13-GB[1])/RES)),j1=Math.min(ny-1,Math.ceil((Math.max(a[1],b[1])+13-GB[1])/RES));
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=j*nx+i;if(!ZI[k])continue;const d=dSeg(cx(i),cy(j),a,b);if(d<ED[k]){ED[k]=d;EI[k]=s}}}
  const RS=[];for(const r of W.RV||[])for(let i=0;i<r.N-1;i++){if(r.X[i]>GB[0]-20&&r.X[i]<GB[2]+20&&r.Y[i]>GB[1]-20&&r.Y[i]<GB[3]+20)RS.push([r.X[i],r.Y[i],r.X[i+1],r.Y[i+1],r.HW[i]])}
  const rvD=(x,y)=>{let d=1e9;for(const q of RS){if(Math.abs(q[0]-x)>25||Math.abs(q[1]-y)>25)continue;const e=dSeg(x,y,[q[0],q[1]],[q[2],q[3]])-q[4];if(e<d)d=e}return d};
  let wc=0;for(let k=0;k<N;k++){if(ED[k]>12)continue;const i=k%nx,j=(k/nx)|0,x=cx(i),y=cy(j),nin=NIN[EI[k]],south=nin[1]<-.45;
   const bw=(south?4.5:7)+3.5*fbm(x/20,y/20,91);if(ED[k]>bw+1.4)continue;
   let gf=sstep(5,9,dPoly(x,y,TRAILS[0].p));if(gf<=0)continue;gf*=sstep(2,4.5,rvD(x,y));if(gf<=0)continue;
   const t=sstep(bw+1.4,bw,ED[k])*gf,base=G[k],top=base+(south?6:13)+(fbm(x/7,y/7,93)-.5)*6+(fbm(x/2.5,y/2.5,95)-.5)*1.6,v=base+(top-base)*t;
   if(v>G[k]+.05){G[k]=v;if(t>.5){L[k]=5;wc++}}}ST.wallCells=wc}
 // đường đèo
 for(const R of RAMPS){const bx=R.p.reduce((a,p)=>[Math.min(a[0],p[0]),Math.min(a[1],p[1]),Math.max(a[2],p[0]),Math.max(a[3],p[1])],[1e9,1e9,-1e9,-1e9]);
  for(let j=Math.max(0,Math.floor((bx[1]-R.w-GB[1])/RES));j<=Math.min(ny-1,Math.ceil((bx[3]+R.w-GB[1])/RES));j++)for(let i=Math.max(0,Math.floor((bx[0]-R.w-GB[0])/RES));i<=Math.min(nx-1,Math.ceil((bx[2]+R.w-GB[0])/RES));i++){
   const[d,t]=projPoly(cx(i),cy(j),R.p);if(d<R.w/2+.5){const k=j*nx+i,v=R.h0+(R.h1-R.h0)*sstep(0,1,t),m=sstep(R.w/2+.5,R.w/2-.5,d);G[k]=G[k]+(v-G[k])*m;if(m>.5)RP[k]=1}}}
 const O=G.slice();// độ cao chỗ đứng (cầu giữ mặt cầu)
 // khe núi khoét sâu trong tầng 3
 for(let j=0;j<ny;j++){const y=cy(j);if(y<-575||y>-480)continue;for(let i=0;i<nx;i++){const x=cx(i);if(x<578||x>602)continue;const k=j*nx+i;if(L[k]!==2||RP[k])continue;const d=dPoly(x,y,RAVINE);if(d<RAV_W/2){G[k]-=d<RAV_W/2-.5?RAV_D:RAV_D*(RAV_W/2-d)/.5;RV[k]=1}}}
 // ô chặn: vách (chênh > 0,45 m giữa 2 ô kề), khối núi đá, lòng khe; nới 1 ô; chừa mặt cầu
 const B0=new Uint8Array(N);for(let j=1;j<ny-1;j++)for(let i=1;i<nx-1;i++){const k=j*nx+i,h=G[k];if(L[k]===5||RV[k]||Math.abs(h-G[k-1])>.45||Math.abs(h-G[k+1])>.45||Math.abs(h-G[k-nx])>.45||Math.abs(h-G[k+nx])>.45)B0[k]=1}
 const B=new Uint8Array(N);for(let j=1;j<ny-1;j++)for(let i=1;i<nx-1;i++){const k=j*nx+i;if(B0[k]||B0[k-1]||B0[k+1]||B0[k-nx]||B0[k+nx]||B0[k-nx-1]||B0[k-nx+1]||B0[k+nx-1]||B0[k+nx+1])B[k]=1}
 for(const b of BR)if(b.ravine){for(let j=0;j<ny;j++){const y=cy(j);if(Math.abs(y-b.y)>b.hl+b.hw)continue;for(let i=0;i<nx;i++){const x=cx(i);if(Math.abs(x-b.x)>b.hl+b.hw)continue;const dx=x-b.x,dy=y-b.y,a=dx*b.ux+dy*b.uy,c=-dx*b.uy+dy*b.ux;if(Math.abs(a)<b.hl&&Math.abs(c)<b.hw-.35)B[j*nx+i]=0}}}
 // khoảng cách (m) tới ô chặn gần nhất – để đặt cây/đá/quặng tránh vách
 const D=new Float32Array(N);for(let k=0;k<N;k++)D[k]=B[k]?0:1e6;const s2=Math.SQRT2;
 for(let j=1;j<ny;j++)for(let i=1;i<nx-1;i++){const k=j*nx+i;D[k]=Math.min(D[k],D[k-1]+1,D[k-nx]+1,D[k-nx-1]+s2,D[k-nx+1]+s2)}
 for(let j=ny-2;j>=0;j--)for(let i=nx-2;i>0;i--){const k=j*nx+i;D[k]=Math.min(D[k],D[k+1]+1,D[k+nx]+1,D[k+nx+1]+s2,D[k+nx-1]+s2)}
 for(let k=0;k<N;k++)D[k]*=RES;
 F={x0:GB[0],y0:GB[1],res:RES,nx,ny,G,O,B,bb:[GB[0],GB[1],GB[2],GB[3]],maxH:28};LVL=L;DT=D;ST.buildMs=+(performance.now()-t0).toFixed(0);
 // thống kê diện tích từng tầng (m²)
 const area=[0,0,0,0,0,0];for(let k=0;k<N;k++)if(G[k]>0||inZc(k))area[L[k]]+=RES*RES;ST.area=area.map(a=>Math.round(a));
 EV.set(F)}
const inZc=k=>{if(!F)return false;const i=k%F.nx,j=(k/F.nx)|0;return inZ(GB[0]+i*RES,GB[1]+j*RES)};
const kOf=(x,y)=>{if(!F)return -1;const i=Math.round((x-GB[0])/RES),j=Math.round((y-GB[1])/RES);return i<0||j<0||i>=F.nx||j>=F.ny?-1:j*F.nx+i};
const dtAt=(x,y)=>{const k=kOf(x,y);return k<0?1e6:DT[k]};
const lvAt=(x,y)=>{const k=kOf(x,y);return k<0?0:LVL[k]};
const tierAt=(x,y)=>{const o=EV.hObj(x,y);if(lvAt(x,y)===5)return 5;return Math.max(0,Math.min(4,Math.round(o/HT)))};

/* ================= 3) HÌNH (asset) – giữ bộ hình NT37 ================= */
const cnv=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c};
function setAS(k,c){const a={u:c.toDataURL('image/png'),w:c.width,h:c.height};a.i=new Image();a.i.src=a.u;AS[k]=a;ST.sprites++;return a}
function snowPine(k,src,amt,seed){const im=src&&src.i;if(!im||!im.complete||!im.naturalWidth)return false;const sc=3,w=im.naturalWidth*sc,h=im.naturalHeight*sc;
 const c=cnv(w,h,(g)=>{g.imageSmoothingEnabled=true;g.drawImage(im,0,0,w,h);const id=g.getImageData(0,0,w,h),d=id.data,A=(x,y)=>x<0||y<0||x>=w||y>=h?0:d[(y*w+x)*4+3];
  {let top0=0;for(let y=0;y<h*.25;y++){let n=0;for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>60)n++;if(n>w*.04){top0=y;break}}for(let y=0;y<top0;y++)for(let x=0;x<w;x++)d[(y*w+x)*4+3]=0;
   for(let y=top0;y<Math.min(h,top0+h*.06);y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]>0&&Math.abs(x-w/2)>w*.18)d[i+3]=0}}
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]<60)continue;const top=A(x,y-4*sc/3|0)<40||A(x,y-2)<40,ny=y/h;let s=0;
   if(top&&ny<.86)s=1;else{const n=vn(x/(5*sc),y/(4*sc),seed);if(n>.62-amt*.12&&ny<.8&&(d[i]+d[i+1]+d[i+2])/3>55)s=.75*amt}
   if(s>0){const sh=.86+.14*vn(x/3,y/3,seed+5);d[i]=d[i]+(242*sh-d[i])*s;d[i+1]=d[i+1]+(246*sh-d[i+1])*s;d[i+2]=d[i+2]+(252*sh-d[i+2])*s}}
  g.putImageData(id,0,0);g.fillStyle='rgba(238,243,250,.95)';g.beginPath();g.ellipse(w/2,h-2,w*.22,h*.035,0,Math.PI,0);g.fill()});
 setAS(k,c);SW[k]=SW.pine||3;return true}
function snowify(k,srcK){const a=AS[srcK];if(!a||!a.i||!a.i.complete||!a.i.naturalWidth)return false;const im=a.i,w=im.naturalWidth,h=im.naturalHeight;
 setAS(k,cnv(w,h,g=>{g.drawImage(im,0,0);const id=g.getImageData(0,0,w,h),d=id.data;for(let i=0;i<d.length;i+=4){if(d[i+3]<20)continue;const r=d[i],gg=d[i+1],b=d[i+2],l=(r+gg+b)/3;
  if(gg>r+6&&gg>b){const s=.84+.16*(l/255);d[i]=236*s;d[i+1]=242*s;d[i+2]=250*s}else{d[i]=r*.9+l*.1;d[i+1]=gg*.9+l*.1;d[i+2]=b*.9+l*.1+6}}g.putImageData(id,0,0)}));SW[k]=SW[srcK]||2;return true}
function cabinSprite(k,big){const W0=big?340:230,H0=big?290:200;return setAS(k,cnv(W0,H0,(g,w,h)=>{const R=rng(big?77:78),wy=h*.42,wh=h*.52,x0=w*.1,x1=w*.9;
 const logs=(xa,xb,ya,yb,dark)=>{for(let y=ya;y<yb;y+=h*.045){const c=dark?[82,58,40]:[112,80,52],v=(R()-.5)*16;g.fillStyle='rgb('+(c[0]+v)+','+(c[1]+v*.8)+','+(c[2]+v*.6)+')';g.fillRect(xa,y,xb-xa,h*.042);g.fillStyle='rgba(30,18,10,.45)';g.fillRect(xa,y+h*.036,xb-xa,h*.008);g.fillStyle='rgba(255,220,170,.12)';g.fillRect(xa,y,xb-xa,h*.006)}};
 logs(x0,x1,wy,wy+wh);g.fillStyle='rgba(20,12,6,.25)';g.fillRect(x1-w*.08,wy,w*.08,wh);
 for(const xx of[x0-2,x1-6]){g.fillStyle='#5b3e27';g.fillRect(xx,wy-4,8,wh+4)}
 const dx=w*.42,dw=w*.16;g.fillStyle='#24170e';g.fillRect(dx,wy+wh*.32,dw,wh*.68);g.save();g.translate(dx+dw,wy+wh*.32);g.rotate(.18);g.fillStyle='#6d4b30';g.fillRect(-dw*.15,0,dw*.5,wh*.68);g.restore();
 const wx=w*.18,ww=w*.14,wyy=wy+wh*.28;g.fillStyle='#2a3440';g.fillRect(wx,wyy,ww,wh*.26);g.strokeStyle='#7a5636';g.lineWidth=h*.03;g.beginPath();g.moveTo(wx,wyy);g.lineTo(wx+ww,wyy+wh*.26);g.moveTo(wx+ww,wyy);g.lineTo(wx,wyy+wh*.26);g.stroke();
 if(big){const wx2=w*.66;g.fillStyle='#2a3440';g.fillRect(wx2,wyy,ww,wh*.26);g.fillStyle='#7a5636';g.fillRect(wx2,wyy+wh*.08,ww,h*.03);g.fillRect(wx2+ww*.1,wyy+wh*.17,ww*.8,h*.03)}
 g.fillStyle='#5a3d26';g.beginPath();g.moveTo(x0-w*.06,wy+2);g.lineTo(w/2,h*.08);g.lineTo(x1+w*.06,wy+2);g.closePath();g.fill();
 g.fillStyle='#3f2a1a';g.beginPath();g.moveTo(x0+w*.04,wy);g.lineTo(w/2,h*.16);g.lineTo(x1-w*.04,wy);g.closePath();g.fill();
 logs(x0+w*.08,x1-w*.08,h*.2,wy-2,true);
 g.fillStyle='#eef3fa';g.beginPath();g.moveTo(x0-w*.09,wy+6);g.lineTo(w/2,h*.04);g.lineTo(x1+w*.09,wy+6);g.lineTo(x1+w*.05,wy+14);g.lineTo(w/2,h*.13);g.lineTo(x0-w*.05,wy+14);g.closePath();g.fill();
 g.fillStyle='rgba(160,180,205,.55)';g.beginPath();g.moveTo(x0-w*.05,wy+14);g.lineTo(w/2,h*.13);g.lineTo(x1+w*.05,wy+14);g.lineTo(x1+w*.03,wy+18);g.lineTo(w/2,h*.16);g.lineTo(x0-w*.03,wy+18);g.closePath();g.fill();
 for(let i=0;i<14;i++){const t=i/13,xx=x0-w*.05+(x1-x0+w*.1)*t,yy=wy+14,L=4+R()*14;g.fillStyle='rgba(220,236,250,.9)';g.beginPath();g.moveTo(xx-2,yy);g.lineTo(xx+2,yy);g.lineTo(xx,yy+L);g.closePath();g.fill()}
 if(big){g.fillStyle='#5c5550';g.fillRect(w*.68,h*.06,w*.07,h*.2);g.fillStyle='#eef3fa';g.fillRect(w*.67,h*.05,w*.09,h*.03)}
 g.fillStyle='rgba(236,242,250,.97)';for(let i=0;i<6;i++){const xx=x0+(x1-x0)*(i/5),r=w*.08+R()*w*.05;g.beginPath();g.ellipse(xx,h-2,r,h*.06,0,Math.PI,0);g.fill()}}))}
function iceCave(k){const a=AS.cave1;if(!a||!a.i.complete||!a.i.naturalWidth)return false;const im=a.i,w=im.naturalWidth,h=im.naturalHeight;
 const c=cnv(w,h,(g)=>{g.drawImage(im,0,0);const id=g.getImageData(0,0,w,h),d=id.data,MK=new Uint8Array(w*h);let mx0=w,mx1=0,my0=h,my1=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]<20)continue;const r=d[i],gg=d[i+1],b=d[i+2],l=(r+gg+b)/3;
   if(gg>r+10&&gg>b+4){const s=.82+.18*(l/255);d[i]=235*s;d[i+1]=241*s;d[i+2]=250*s}
   else if(l<48&&y>h*.3){MK[y*w+x]=1;if(x<mx0)mx0=x;if(x>mx1)mx1=x;if(y<my0)my0=y;if(y>my1)my1=y}
   else{d[i]=l*.86+12;d[i+1]=l*.92+16;d[i+2]=l*1.02+26}}
  {const cx=(mx0+mx1)/2,cy=my1-(my1-my0)*.3,rr=Math.max(8,(mx1-mx0)*.62);for(let y=my0;y<=my1;y++)for(let x=mx0;x<=mx1;x++){const i=(y*w+x)*4;if(!MK[y*w+x])continue;const k=Math.max(0,1-Math.hypot((x-cx)/rr,(y-cy)/(rr*.7)));d[i]=20+120*k*k;d[i+1]=50+180*k;d[i+2]=110+145*k}}
  g.putImageData(id,0,0);
  if(mx1>mx0){
   const R=rng(9);for(let i=0;i<16;i++){const xx=mx0+(mx1-mx0)*(i+.5)/16+(R()-.5)*4,L=6+R()*(my1-my0)*.35,wd=2+R()*3;const gr2=g.createLinearGradient(0,my0,0,my0+L);gr2.addColorStop(0,'rgba(245,252,255,.98)');gr2.addColorStop(1,'rgba(170,220,255,.5)');g.fillStyle=gr2;g.beginPath();g.moveTo(xx-wd,my0+2);g.lineTo(xx+wd,my0+2);g.lineTo(xx,my0+2+L);g.closePath();g.fill()}
   for(const[xx,s]of[[mx0+6,1],[mx1-6,-1]]){for(let j=0;j<4;j++){const bx=xx+s*j*7,hh2=14+R()*22,ww=5+R()*4;g.fillStyle='rgba(150,225,255,.92)';g.beginPath();g.moveTo(bx-ww,my1);g.lineTo(bx-ww*.6,my1-hh2*.8);g.lineTo(bx,my1-hh2);g.lineTo(bx+ww*.6,my1-hh2*.8);g.lineTo(bx+ww,my1);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.7)';g.fillRect(bx-1,my1-hh2*.9,2,hh2*.7)}}}});
 setAS(k,c);return true}
function crystalSprite(k,seed){return setAS(k,cnv(130,120,(g,w,h)=>{const R=rng(seed);g.fillStyle='rgba(230,240,250,.95)';g.beginPath();g.ellipse(w/2,h-6,w*.42,9,0,Math.PI,0);g.fill();
 const sh=[[0,1,.2],[-.22,.7,-.35],[.22,.75,.3],[-.38,.45,-.5],[.38,.5,.55],[.1,.55,.1]];for(const[o,s,t]of sh){const bx=w/2+o*w,H=h*.78*s*(.85+R()*.3),ww=w*.08*(.8+R()*.4);g.save();g.translate(bx,h-8);g.rotate(t*.6);
  const gr=g.createLinearGradient(-ww,0,ww,0);gr.addColorStop(0,'#7fd3ff');gr.addColorStop(.5,'#d8f6ff');gr.addColorStop(1,'#4aa8e6');g.fillStyle=gr;g.beginPath();g.moveTo(-ww,0);g.lineTo(-ww,-H*.75);g.lineTo(0,-H);g.lineTo(ww,-H*.75);g.lineTo(ww,0);g.closePath();g.fill();
  g.fillStyle='rgba(255,255,255,.75)';g.fillRect(-ww*.35,-H*.8,ww*.25,H*.7);g.restore()}}))}
function signSprite(k,txt){return setAS(k,cnv(260,180,(g,w,h)=>{g.fillStyle='#5a3c22';g.fillRect(w*.47,h*.35,w*.06,h*.65);g.fillStyle='#8a6038';g.fillRect(w*.06,h*.08,w*.88,h*.36);g.strokeStyle='#4a2f19';g.lineWidth=4;g.strokeRect(w*.06,h*.08,w*.88,h*.36);
 g.fillStyle='#f3ead8';g.font='bold '+Math.round(h*.14)+'px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,w/2,h*.26,w*.82);
 g.fillStyle='#f2f6fc';g.beginPath();g.ellipse(w/2,h*.08,w*.46,h*.05,0,Math.PI,0);g.fill();g.beginPath();g.ellipse(w/2,h-3,w*.18,h*.05,0,Math.PI,0);g.fill()}))}
function frameSprite(k){return setAS(k,cnv(220,260,(g,w,h)=>{g.strokeStyle='#6b4a2c';g.lineWidth=12;g.beginPath();g.moveTo(w*.15,h);g.lineTo(w*.45,h*.12);g.lineTo(w*.75,h);g.moveTo(w*.5,h);g.lineTo(w*.45,h*.12);g.stroke();
 g.lineWidth=8;g.beginPath();g.moveTo(w*.25,h*.7);g.lineTo(w*.68,h*.7);g.stroke();g.fillStyle='#4a3220';g.beginPath();g.arc(w*.45,h*.14,14,0,7);g.fill();g.strokeStyle='#2b2018';g.lineWidth=2;g.beginPath();g.moveTo(w*.45,h*.14);g.lineTo(w*.62,h*.55);g.stroke();
 g.fillStyle='#5b4632';g.fillRect(w*.56,h*.55,w*.13,h*.1);g.fillStyle='#f0f5fb';g.fillRect(w*.38,h*.1,w*.14,6);g.beginPath();g.ellipse(w*.5,h-3,w*.42,10,0,Math.PI,0);g.fill()}))}
function cartSprite(k){return setAS(k,cnv(220,150,(g,w,h)=>{g.fillStyle='#3a3633';g.fillRect(0,h-12,w,5);g.fillRect(0,h-26,w,4);
 g.fillStyle='#6d4b2e';g.beginPath();g.moveTo(w*.15,h*.35);g.lineTo(w*.85,h*.35);g.lineTo(w*.78,h*.8);g.lineTo(w*.22,h*.8);g.closePath();g.fill();g.fillStyle='#4f3520';for(let i=0;i<4;i++)g.fillRect(w*.18,h*(.42+i*.1),w*.64,3);
 const R=rng(31);for(let i=0;i<10;i++){const x=w*(.25+R()*.5),y=h*(.28+R()*.08),r=8+R()*9;g.fillStyle=i%3===0?'#c9782d':i%3===1?'#9a4a26':'#7a7e86';g.beginPath();g.ellipse(x,y,r,r*.75,R(),0,7);g.fill();g.fillStyle='rgba(255,230,190,.35)';g.fillRect(x-r*.3,y-r*.4,r*.4,2)}
 g.fillStyle='#222';for(const x of[w*.3,w*.7]){g.beginPath();g.arc(x,h*.83,10,0,7);g.fill()}}))}
// hàng rào gỗ phủ tuyết, cọc rào, tháp nước, cối xoay gió, lều khai thác (theo ảnh mẫu)
const wood=(g,x,y,w,h,c)=>{g.fillStyle=c||'#6e4c2e';g.fillRect(x,y,w,h);g.fillStyle='rgba(255,220,170,.18)';g.fillRect(x,y,w,Math.max(1,h*.18));g.fillStyle='rgba(20,10,4,.3)';g.fillRect(x,y+h*.8,w,h*.2)};
const snowCap=(g,x,y,w,h)=>{g.fillStyle='#f1f5fb';g.beginPath();g.ellipse(x+w/2,y,w/2+2,h,0,Math.PI,0);g.fill();g.fillRect(x-2,y-1,w+4,h*.6)};
function fenceSprite(k){return setAS(k,cnv(240,110,(g,w,h)=>{for(const x of[10,112,214]){wood(g,x,22,16,h-24,'#5e3f25');snowCap(g,x,22,16,6)}
 for(const y of[40,70]){wood(g,4,y,w-8,11,'#7a5434');g.fillStyle='#eef3f9';g.fillRect(6,y-3,w-12,4)}g.fillStyle='rgba(236,242,250,.95)';g.beginPath();g.ellipse(w/2,h-2,w*.48,6,0,Math.PI,0);g.fill()}))}
function postSprite(k){return setAS(k,cnv(40,120,(g,w,h)=>{wood(g,12,16,16,h-18,'#5e3f25');snowCap(g,12,16,16,6);g.fillStyle='rgba(236,242,250,.95)';g.beginPath();g.ellipse(w/2,h-2,16,5,0,Math.PI,0);g.fill()}))}
function towerSprite(k){return setAS(k,cnv(200,320,(g,w,h)=>{g.strokeStyle='#4d3320';g.lineWidth=9;g.beginPath();g.moveTo(52,h);g.lineTo(70,150);g.moveTo(148,h);g.lineTo(130,150);g.moveTo(84,h);g.lineTo(88,150);g.moveTo(116,h);g.lineTo(112,150);g.stroke();
 g.lineWidth=4;g.beginPath();for(const y of[190,240,290]){g.moveTo(58,y);g.lineTo(142,y)}g.moveTo(60,290);g.lineTo(138,190);g.moveTo(140,290);g.lineTo(62,190);g.stroke();
 for(let i=0;i<9;i++){g.fillStyle=i%2?'#8a5e38':'#7a5232';g.fillRect(44+i*12.4,70,12.4,84)}g.fillStyle='#3e2a1a';g.fillRect(40,78,120,6);g.fillRect(40,136,120,6);
 g.fillStyle='#5a3d26';g.beginPath();g.moveTo(34,74);g.lineTo(100,22);g.lineTo(166,74);g.closePath();g.fill();g.fillStyle='#eef3fa';g.beginPath();g.moveTo(30,76);g.lineTo(100,16);g.lineTo(170,76);g.lineTo(160,80);g.lineTo(100,32);g.lineTo(40,80);g.closePath();g.fill();
 g.fillStyle='rgba(236,242,250,.97)';g.beginPath();g.ellipse(w/2,h-3,w*.42,9,0,Math.PI,0);g.fill()}))}
function millSprite(k){return setAS(k,cnv(240,380,(g,w,h)=>{g.strokeStyle='#5a3b22';g.lineWidth=10;g.beginPath();g.moveTo(70,h);g.lineTo(112,110);g.moveTo(170,h);g.lineTo(128,110);g.stroke();g.lineWidth=4;g.beginPath();for(let y=150;y<h;y+=46){const a=(y-110)/(h-110),l=112-42*a,r=128+42*a;g.moveTo(l,y);g.lineTo(r,y)}g.moveTo(80,h-20);g.lineTo(124,150);g.moveTo(160,h-20);g.lineTo(116,150);g.stroke();
 const cx=120,cy=96;for(let i=0;i<12;i++){const a=i/12*Math.PI*2;g.save();g.translate(cx,cy);g.rotate(a);g.fillStyle=i%2?'#8a6a4a':'#a07a52';g.beginPath();g.moveTo(4,-5);g.lineTo(78,-11);g.lineTo(78,11);g.lineTo(4,5);g.closePath();g.fill();g.restore()}
 g.fillStyle='#3e2a1a';g.beginPath();g.arc(cx,cy,10,0,7);g.fill();g.fillStyle='#6a4a2e';g.fillRect(cx+6,cy-4,64,6);g.beginPath();g.moveTo(cx+66,cy-24);g.lineTo(cx+96,cy-18);g.lineTo(cx+96,cy+14);g.lineTo(cx+66,cy+8);g.closePath();g.fill();
 g.fillStyle='rgba(236,242,250,.97)';g.beginPath();g.ellipse(w/2,h-3,w*.34,9,0,Math.PI,0);g.fill()}))}
function tentSprite(k){return setAS(k,cnv(280,210,(g,w,h)=>{for(const x of[30,236])wood(g,x,70,14,h-74,'#4f3420');for(const x of[60,206])wood(g,x,88,12,h-92,'#4f3420');
 g.fillStyle='#6d4b2e';g.beginPath();g.moveTo(10,86);g.lineTo(140,36);g.lineTo(270,86);g.lineTo(262,100);g.lineTo(140,54);g.lineTo(18,100);g.closePath();g.fill();
 g.fillStyle='#eef3fa';g.beginPath();g.moveTo(6,84);g.lineTo(140,30);g.lineTo(274,84);g.lineTo(266,90);g.lineTo(140,44);g.lineTo(14,90);g.closePath();g.fill();
 const R=rng(44);for(let i=0;i<5;i++){const x=80+i*26,y=h-30;g.fillStyle=['#7a5232','#8a6038','#6a4628'][i%3];g.fillRect(x,y-18-R()*14,24,30);g.fillStyle='#f0f5fb';g.fillRect(x,y-20-R()*4,24,4)}
 g.fillStyle='rgba(236,242,250,.97)';g.beginPath();g.ellipse(w/2,h-3,w*.46,9,0,Math.PI,0);g.fill()}))}
let RND=null;
function rockSprite(type,v){const key='nt_'+type.slice(2)+v;if(AS[key])return true;const T=globalThis.THREE;if(!T||!SH.ART6||!SH.ART6.geo)return false;
 try{if(!RND){const r=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});r.setPixelRatio(1);r.setSize(200,240);r.setClearColor(0x000000,0);
   const sc=new T.Scene();sc.add(new T.AmbientLight(0xfdfdfe,.73));const dl=new T.DirectionalLight(0xfff1dc,.62);dl.position.set(.35,1,.62);sc.add(dl);
   const cam=new T.OrthographicCamera(-.5,.5,.72,-.48,.01,20);cam.position.set(0,Math.sin(Math.PI/3)*5,Math.cos(Math.PI/3)*5);cam.lookAt(0,0,0);RND={r,sc,cam,mesh:null}}
  const g=SH.ART6.geo(type,v);if(RND.mesh)RND.sc.remove(RND.mesh);RND.mesh=new T.Mesh(g,SH.ART6.material);RND.mesh.scale.set(1,1.45,1);RND.sc.add(RND.mesh);RND.r.render(RND.sc,RND.cam);
  const src=RND.r.domElement,W0=src.width,H0=src.height,tmp=cnv(W0,H0,q=>q.drawImage(src,0,0)),q=tmp.getContext('2d'),d=q.getImageData(0,0,W0,H0).data;let y0=H0,y1=0;
  for(let y=0;y<H0;y++)for(let x=0;x<W0;x+=2)if(d[(y*W0+x)*4+3]>12){if(y<y0)y0=y;if(y>y1)y1=y}
  if(y1<=y0)return false;const out=cnv(W0,y1-y0+1,o=>o.drawImage(tmp,0,y0,W0,y1-y0+1,0,0,W0,y1-y0+1));setAS(key,out);return true}catch(e){ST.errS=String(e&&e.message||e);return false}}

/* ================= 4) VÙNG CẤM ĐẶT VẬT ================= */
const Zpoly=()=>ZONE().poly;
function inPoly(x,y,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
function edgeDist(x,y,P){let d=1e9;for(let i=0,j=P.length-1;i<P.length;j=i++){const q=dSeg(x,y,P[j],P[i]);if(q<d)d=q}return d}
let ZP=null;const inZ=(x,y,m=0)=>{const P=ZP||(ZP=Zpoly());return inPoly(x,y,P)&&(m<=0||edgeDist(x,y,P)>m)};
const inEll=(x,y,e,m=0)=>((x-e.x)/(e.rx+m))**2+((y-e.y)/(e.ry+m))**2<1;
function riverD(x,y){let d=1e9;for(const r of W.RV||[])for(let i=0;i<r.N-1;i+=1){const ax=r.X[i],ay=r.Y[i];if(Math.abs(ax-x)>40||Math.abs(ay-y)>40)continue;const q=dSeg(x,y,[ax,ay],[r.X[i+1],r.Y[i+1]])-r.HW[i];if(q<d)d=q}return d}
function busy(x,y,m){// true = không đặt vật ở đây
 for(const t of TRAILS)if(dPoly(x,y,t.p)<t.w/2+m)return true;
 if(inEll(x,y,LAKE,m+2)||inEll(x,y,SPRING,m+2.5))return true;
 if(Math.abs(x-CABIN.x+4)<16+m&&y>CABIN.y-6-m&&y<CABIN.y+6+m)return true;
 if(Math.abs(x-CAVE.x)<CAVE.w/2+4+m&&y>CAVE.y-9-m&&y<CAVE.y+5+m)return true;
 if(dPoly(x,y,RAVINE)<RAV_W/2+1.5+m)return true;
 if(dtAt(x,y)<1.6+m)return true;// mép vách / khối đá
 for(const s of SAFE_LOTS)if(Math.abs(x-s.x)<14.5+m&&Math.abs(y-s.y)<14.5+m)return true;// sân nhà an toàn
 if(lvAt(x,y)===5)return true;
 if(riverD(x,y)<2+m)return true;
 return false}
const inField=(x,y)=>x>FIELD.r[0]&&x<FIELD.r[2]&&y>FIELD.r[1]&&y<FIELD.r[3];

/* ================= 5) DỌN BẢNG CŨ (trên đường, đèo, vách, khối đá, bãi khai thác) ================= */
function clearTables(){const hit=(x,y)=>inZ(x,y,-3)&&(inField(x,y)||busy(x,y,1.2));
 const cut=(a,f,k)=>{if(!a)return;let n=0;const n0=a.length;for(const o of a)if(!f(o))a[n++]=o;a.length=n;ST.cleared[k]+=n0-n};
 cut(M.K,q=>hit(q[1],q[2]),'K');cut(M.D,q=>hit(q[1],q[2]),'D');if(M.FD)cut(M.FD,q=>hit(q[1],q[2]),'D');cut(M.C,c=>hit((c.x0+c.x1)/2,(c.z0+c.z1)/2),'C');
 // đồ đô thị cũ (xe, rào chắn, bao cát…) nằm trên các tầng núi → bỏ; giữ cây/đá tự nhiên
 const nat=k=>/pine|tree|rock|stone|boulder|bush|log|stump|frost|grass|n_/i.test(String(k));cut(M.D,q=>inZ(q[1],q[2])&&EV.hObj(q[1],q[2])>1&&!nat(q[0]),'D');if(M.FD)cut(M.FD,q=>inZ(q[1],q[2])&&EV.hObj(q[1],q[2])>1&&!nat(q[0]),'D');
 for(const q of M.D)if((q[0]==='pine2'||q[0]==='pine')&&inZ(q[1],q[2]))q[0]='nt_pine'+(1+((q[1]*7+q[2]*3)&1?1:0)+(q[0]==='pine'?1:0))}
function clearDecBand(){// đồ trang trí của module khác (viền rừng…) nằm đúng mép vách / trong khối đá → bỏ
 const a=SH.DEC;let n=0;const n0=a.length;for(const o of a){const x=o[1],y=o[2];if(!o.nt37&&x>GB[0]&&x<GB[2]&&y>GB[1]&&y<GB[3]&&inZ(x,y,-3)&&(dtAt(x,y)<1.2||lvAt(x,y)===5))continue;a[n++]=o}a.length=n;ST.cleared.dec+=n0-n}

/* ================= 6) ĐẶT VẬT THEO TẦNG ================= */
const DEC=[],COLS=[];
function dec(k,x,y,w,extra){const o=[k,+x.toFixed(2),+y.toFixed(2),w];o.nt37=1;if(extra)Object.assign(o,extra);SH.DEC.push(o);DEC.push(o);return o}
function col(x0,z0,x1,z1,tag){const c={x0,x1,z0,z1,on:true,nt37:tag||1};SH.cols.push(c);COLS.push(c);ST.cols++;return c}
function poisson(R,box,minD,N,ok){const out=[];for(let i=0;i<N;i++){const x=box[0]+R()*(box[2]-box[0]),y=box[1]+R()*(box[3]-box[1]);if(!ok(x,y))continue;let f=true;for(const p of out)if(Math.abs(p[0]-x)<minD&&Math.abs(p[1]-y)<minD&&Math.hypot(p[0]-x,p[1]-y)<minD){f=false;break}if(f)out.push([x,y])}return out}
function placeNature(){const R=rng(3838);
 // thông phủ tuyết: dày ở chân núi, thưa dần lên cao
 const zones=[[0,[140,-510,775,-366],3.6,5600],[1,[110,-640,415,-448],9,1300],[2,[390,-585,780,-488],11,1100],[3,[660,-570,780,-505],13,260],[4,[390,-650,712,-560],16,700]];
 for(const[tv,box,md,n]of zones)for(const[x,y]of poisson(R,box,md,n,(x,y)=>tierAt(x,y)===tv&&inZ(x,y,2.5)&&!busy(x,y,1.6)&&!inField(x,y))){
  const v=1+((R()*3)|0),w=tv===0?2.6+R()*1.6:2.2+R()*1.4;dec('nt_pine'+v,x,y,w);col(x-.3,y-.35,x+.3,y-.02,'tree');ST.trees++}
 // đá phủ tuyết trang trí: nhỏ ở chân núi, to dần lên cao
 for(const[x,y]of poisson(R,[110,-648,775,-366],8,1500,(x,y)=>inZ(x,y,3)&&!busy(x,y,2.4)&&!inField(x,y))){const tv=tierAt(x,y);if(tv>4)continue;const big=tv>=3||tv===2&&R()<.4;
  const w=big?1.2+R()*1.6:.5+R()*.7;if(R()<(tv===0?.5:.8)){const v=(R()*12)|0;dec('nt_sr'+v,x,y,w/RK,{ntRock:1});col(x-w*.42,y-w*.34,x+w*.42,y+w*.22,'rock');ST.rocks++}}
 // cây sương giá & khúc gỗ
 for(const[x,y]of poisson(R,[110,-600,775,-366],6,700,(x,y)=>inZ(x,y,2)&&!busy(x,y,1)&&!inField(x,y)&&tierAt(x,y)<=2)){const f=R()<.85;dec(f?'decor9_frost':'nt_log',x,y,f?1+R()*.6:1.8)}}
function placeFeatures(){const R=rng(9118);
 // tầng 2: nhà gỗ + nhà kho + củi + hàng rào gãy
 dec('nt_cabin',CABIN.x,CABIN.y,7);col(CABIN.x-3.1,CABIN.y-2.6,CABIN.x+3.1,CABIN.y-.1,'bld');
 dec('nt_shed',CABIN.x-9,CABIN.y+1.5,4.2);col(CABIN.x-10.8,CABIN.y-.2,CABIN.x-7.2,CABIN.y+1.4,'bld');
 dec('nt_log',CABIN.x+5,CABIN.y+1,2);dec('nt_stump',CABIN.x+6.5,CABIN.y+3,1.2);
 for(let i=0;i<5;i++){if(i===2)continue;dec('m8fence',CABIN.x-6+i*3.2,CABIN.y+4.6,3)}
 // suối nước nóng: không lội vào lòng suối; viền đá
 {const s=SPRING;col(s.x-s.rx*.95,s.y-s.ry*.5,s.x+s.rx*.95,s.y+s.ry*.5,'spring');col(s.x-s.rx*.68,s.y-s.ry*.95,s.x+s.rx*.68,s.y-s.ry*.5,'spring');col(s.x-s.rx*.68,s.y+s.ry*.5,s.x+s.rx*.68,s.y+s.ry*.92,'spring')}
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2,x=SPRING.x+Math.cos(a)*(SPRING.rx+.7),y=SPRING.y+Math.sin(a)*(SPRING.ry+.6);dec('nt_sr'+(i%12),x,y,.9+R()*.5,{ntRock:1})}
 // tầng 4: cửa hang lớn đặt sát chân vách khối núi đá (vách cao 12 m sau lưng) + pha lê
 dec('nt_icecave',CAVE.x,CAVE.y,CAVE.w);
 {const L=CAVE.x-CAVE.w/2+.4,Rr=CAVE.x+CAVE.w/2-.4,mx=CAVE.x,ow=2.6,zt=CAVE.y-3.2;col(L,zt,mx-ow/2,CAVE.y-.05,'cave');col(mx+ow/2,zt,Rr,CAVE.y-.05,'cave');col(mx-ow/2,zt,mx+ow/2,CAVE.y-.8,'cave')}
 for(const[dx,dy,w]of[[-7.5,1.2,1.6],[7.2,.8,1.8],[-4.5,2.6,1],[5,2.8,1.1],[9.5,1.6,1.3],[-9.6,1.4,1.2]]){const x=CAVE.x+dx*CAVE.w/12,y=CAVE.y+dy;if(dtAt(x,y)<.8)continue;dec('nt_icecry'+(1+((dx>0)?1:0)),x,y,w);col(x-w*.3,y-w*.2,x+w*.3,y,'cry')}
 // biển chỉ đường
 dec('nt_sign0',313.2,-401,2.2);dec('nt_sign1',314,-438,2.2);dec('nt_sign2',628,-533,2.2);dec('nt_sign3',676,-592,2.2);
 // trại khai thác ở cửa bãi (tầng 5)
 dec('nt_frame',656,-606,3.4);col(654.6,-606.5,657.4,-606,'prop');dec('nt_mcart',520,-607,2.6);col(518.8,-607.5,521.2,-606.6,'prop');PROPS.push([656,-606,2.5],[520,-607,2.5]);
 for(const[k,x,y,w]of[['nt_tent',446,-614,7],['nt_tent',628,-617,6.5],['nt_frame',470,-636,3.4],['nt_frame',600,-637,3.4]]){if(tierAt(x,y)!==4||dtAt(x,y)<3)continue;dec(k,x,y,w);PROPS.push([x,y,w*.6+1]);col(x-w*.4,y-.8,x+w*.4,y,'prop')}
 // tầng 2: tháp nước cạnh hồ, cối xoay gió cạnh nhà gỗ
 dec('nt_tower',272,-491,4.2);col(270.6,-491.6,273.4,-491,'prop');dec('nt_mill',204,-487,5);col(203,-487.6,205,-487,'prop');
 // nhà gỗ bỏ hoang rải rác các tầng
 ST.huts=0;for(const[k,x,y,w]of HUTS){if(dtAt(x,y)<3.2||busy(x,y,2)||lvAt(x,y)===5)continue;dec(k,x,y,w);col(x-w*.44,y-w*.36,x+w*.44,y-.1,'bld');if(k==='nt_cabin'){dec('nt_log',x+w*.7,y+1,1.8);dec('nt_stump',x-w*.75,y+1.6,1.1)}ST.huts++}
 placeFences();placeRoadRocks();ST.props=DEC.length}
// đá viền 3D thưa dọc mép đường (cho mép đường gồ ghề như ảnh mẫu) – không chặn đường
function placeRoadRocks(){let n=0;const R=rng(5151);for(const r of ROADS||[]){const c=r.c;for(let i=4;i<c.length-4;i+=7+((R()*6)|0)){const[x,y,nx,ny,hw]=c[i],sd=R()<.5?1:-1,o=hw+.35+R()*.25,qx=x+nx*o*sd,qy=y+ny*o*sd;
  if(dtAt(qx,qy)<.9||Math.abs(EV.hObj(qx,qy)-EV.hObj(x,y))>.5||BR.some(b=>Math.hypot(qx-b.x,qy-b.y)<b.hl+1.5)||inField(qx,qy))continue;if(TRAILS.some(o2=>o2!==r.t&&dPoly(qx,qy,o2.p)<o2.w/2+.4))continue;
  dec('nt_sr'+((R()*12)|0),qx,qy,(.45+R()*.4)/RK,{ntRock:1});n++}}ST.roadRocks=n}
// tảng đá to lổn nhổn dưới chân / trên mép vách (dáng vách gồ ghề như ảnh mẫu)
function placeBoulders(){let n=0;const R=rng(7272);for(const[x,y]of poisson(R,[110,-648,785,-366],6,4200,(x,y)=>{const d=dtAt(x,y);return d>1.7&&d<3.4&&inZ(x,y,3)&&lvAt(x,y)!==5&&!inField(x,y)&&!TRAILS.some(t=>dPoly(x,y,t.p)<t.w/2+1.6)&&!SAFE_LOTS.some(s=>Math.abs(x-s.x)<15&&Math.abs(y-s.y)<15)&&!inEll(x,y,LAKE,3)&&riverD(x,y)>2.5})){
  if(R()<.35)continue;const w=1.5+R()*2.6,v=(R()*12)|0;dec('nt_sr'+v,x,y,w/RK,{ntRock:1});col(x-w*.42,y-w*.34,x+w*.42,y+w*.22,'rock');n++}ST.boulders=n}
const PROPS=[];
function placeFences(){// hàng rào gỗ dọc đường đèo/đường mòn chỗ sát mép vách (như ảnh mẫu)
 let n=0;for(const t of TRAILS){if(!/^(pass|cave|summit|up2|valley|r1|r2|r3|r4|entry)$/.test(t.k))continue;const isR=/^r\d$/.test(t.k);
  for(let i=0;i<t.p.length-1;i++){const a=t.p[i],b=t.p[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uy=(b[1]-a[1])/L,ew=Math.abs(ux)>Math.abs(uy)*1.3;
   for(let s=1.2;s<L-.8;s+=ew?2.6:2.1){const px=a[0]+ux*s,py=a[1]+uy*s,hp=EV.hObj(px,py);for(const sd of[1,-1]){const off=isR?2.7:t.w/2+.9,qx=px-uy*off*sd,qy=py+ux*off*sd,dq=dtAt(qx,qy);
    if(dq<.25||dq>2.6||Math.abs(EV.hObj(qx,qy)-hp)>.6)continue;if(TRAILS.some(o=>o!==t&&o.k!==t.k&&dPoly(qx,qy,o.p)<o.w/2+.5))continue;if(BR.some(b2=>Math.hypot(qx-b2.x,qy-b2.y)<b2.hl+1))continue;
    dec(ew?'nt_fence':'nt_post',qx,qy,ew?2.5:.42);n++}}}}ST.fences=n}
/* thác nước chảy theo khe núi: từ vách tầng 5 đổ xuống khe, dòng chảy dưới đáy khe, đổ tiếp qua vách tầng 3 xuống chân núi */
const FALLS=[];
function planFalls(){FALLS.length=0;
 let y=-566;while(y>-592&&EV.h(590,y-.5)<EV.h(590,-566)+4)y-=.5;FALLS.push({x:590,y:y+.4,y0:EV.h(590,y+1.5),y1:EV.h(590,y-2.5),w:3.4});
 let y2=-476;while(y2>-500&&EV.h(593,y2-.5)<.8)y2-=.5;FALLS.push({x:593,y:y2+.4,y0:0,y1:EV.h(593,y2-3.5),w:3})}
let FL3=null;
function falls3(dt){const V=SH.V25,T15=V&&V.T15;if(!T15||!T15.T||!FALLS.length)return;const T=T15.T,near=V.on&&Math.abs(pos.x-591)<80&&Math.abs(pos.y+528)<80;
 if(!FL3){if(!near)return;const tc=cnv(64,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'rgba(120,190,230,.55)');gr.addColorStop(.5,'rgba(190,232,252,.92)');gr.addColorStop(1,'rgba(120,190,230,.55)');g.fillStyle=gr;g.fillRect(0,0,w,h);const R=rng(5);for(let i=0;i<70;i++){const x=R()*w,y=R()*h,l=20+R()*60;g.fillStyle='rgba(255,255,255,'+(.35+R()*.5)+')';g.fillRect(x,y,1+R()*2.5,l);if(y+l>h)g.fillRect(x,y-h,1+R()*2.5,l)}});
  const tex=new T.CanvasTexture(tc);tex.wrapS=tex.wrapT=T.RepeatWrapping;const mat=new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:T.DoubleSide});const ms=[];
  for(const f of FALLS){const H=Math.max(1,f.y1-f.y0),g=new T.PlaneGeometry(f.w,H);g.translate(0,H/2,0);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,uv.getY(i)*H/5);const m=new T.Mesh(g,mat);m.position.set(f.x,f.y0,f.y);m.userData.ev38skip=1;m.renderOrder=2;T15.scene.add(m);ms.push(m);
   const fm=new T.Mesh(new T.CircleGeometry(1,20),new T.MeshBasicMaterial({color:0xf4f9ff,transparent:true,opacity:.85,depthWrite:false}));fm.rotation.x=-Math.PI/2;fm.scale.set(f.w*.75,f.w*.4,1);fm.position.set(f.x,f.y0+.12,f.y+.9);fm.userData.ev38skip=1;fm.renderOrder=2;T15.scene.add(fm);ms.push(fm)}
  {const P=[],U=[],I=[];let s=0,prev=null;const pts=[];for(let i=0;i<RAVINE.length-1;i++){const a=RAVINE[i],b=RAVINE[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let d=0;d<L;d+=.8)pts.push([a[0]+(b[0]-a[0])*d/L,a[1]+(b[1]-a[1])*d/L])}pts.push(RAVINE[RAVINE.length-1]);
   pts.forEach((p,i)=>{const q=pts[Math.min(pts.length-1,i+1)],o=pts[Math.max(0,i-1)],dx=q[0]-o[0],dy=q[1]-o[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;if(prev)s+=Math.hypot(p[0]-prev[0],p[1]-prev[1]);prev=p;const h=Math.min(EV.h(p[0],p[1]),14)+.1;
    P.push(p[0]+nx*1.15,h,p[1]+ny*1.15,p[0]-nx*1.15,h,p[1]-ny*1.15);U.push(0,s/4,1,s/4);if(i){const k=i*2;I.push(k-2,k-1,k,k-1,k+1,k)}});
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));g.setIndex(I);const m=new T.Mesh(g,mat);m.userData.ev38skip=1;m.renderOrder=1;m.frustumCulled=false;T15.scene.add(m);ms.push(m)}
  ms.forEach(m=>m.onBeforeRender=()=>{tex.offset.y=(performance.now()/1000)*.9%1000});FL3={ms,tex}}
 for(const m of FL3.ms)m.visible=near}

/* ================= 7) BÃI KHAI THÁC (tầng 5) ================= */
const NODES=[];
const NODE_CFG={st:{uses:3,resp:24,lb:'Đào đá',item:'stone',min:2,max:4,ic:'🪨',nm:'đá'},cu:{uses:2,resp:36,lb:'Đào quặng đồng',item:'cu',min:1,max:2,ic:'🟠',nm:'đồng'},fe:{uses:2,resp:36,lb:'Đào quặng sắt',item:'iron',min:1,max:2,ic:'⚙️',nm:'sắt'}};
// cỡ đá/quặng: w = bề ngang (m); nhân vật ≈ 1,6 m → cỡ 'x1' bằng nhân vật
// w = bề ngang NHÌN THẤY (m). Mô hình đá ART6 hiện ≈ 0,39 × kích thước khai báo → khai báo = w / 0,39
const SIZES=[{k:'x4',w:6.2,u:14,n:7,big:1},{k:'x3',w:4.7,u:10,n:10,big:1},{k:'x2',w:3.2,u:7,n:18},{k:'x1',w:1.7,u:4,n:24},{k:'nho',w:.95,u:2,n:20}];const RK=.39;
function boxOf(x,y,w){return[x-w*.44,y-w*.36,x+w*.44,y+w*.26]}
function boxGap(a,b){const dx=Math.max(a[0]-b[2],b[0]-a[2],0),dy=Math.max(a[1]-b[3],b[1]-a[3],0);return Math.hypot(dx,dy)}
function buildField(){const R=rng(60202),P=Zpoly(),cand=[],clusters=[];
 const okBox=(bx)=>{for(const[x,y]of[[bx[0],bx[1]],[bx[2],bx[1]],[bx[0],bx[3]],[bx[2],bx[3]]])if(!inPoly(x,y,P)||edgeDist(x,y,P)<3||tierAt(x,y)!==4||dtAt(x,y)<2.2)return false;
  const cx=(bx[0]+bx[2])/2,cy=(bx[1]+bx[3])/2,rr=Math.max(bx[2]-bx[0],bx[3]-bx[1])/2;for(const t of TRAILS)if(dPoly(cx,cy,t.p)<t.w/2+rr+1.3)return false;for(const q of PROPS)if(Math.hypot(cx-q[0],cy-q[1])<q[2]+rr+1)return false;return inField(cx,cy)};
 void clusters;
 // 5 cỡ: to gấp 4 / 3 / 2 lần nhân vật, cỡ bằng nhân vật, loại nhỏ – cỡ càng to đào được càng nhiều lần; đặt từ cỡ to xuống nhỏ
 for(const S5 of SIZES){let put=0;for(let k=0;k<S5.n*90&&put<S5.n;k++){const x=FIELD.r[0]+R()*(FIELD.r[2]-FIELD.r[0]),y=FIELD.r[1]+R()*(FIELD.r[3]-FIELD.r[1]),w=S5.w*(.92+R()*.16),bx=boxOf(x,y,w);
   if(!okBox(bx))continue;let f=true;for(const o of cand)if(boxGap(o.bx,bx)<(S5.big||o.s.big?2.2:1.5)){f=false;break}if(!f)continue;cand.push({x,y,w,bx,s:S5});put++}}
 // tỉ lệ 60/20/20 giữ đúng trong từng cỡ
 for(const S5 of SIZES){const L=cand.filter(o=>o.s===S5).sort((a,b)=>hh(Math.round(a.x*10),Math.round(a.y*10),9)-hh(Math.round(b.x*10),Math.round(b.y*10),9)),nc=Math.round(L.length*.2),nf=Math.round(L.length*.2);L.forEach((o,i)=>o.t=i<nc?'cu':i<nc+nf?'fe':'st')}
 cand.forEach((o,i)=>{const v=(hh(Math.round(o.x*10),Math.round(o.y*10),5)*12)|0,id='n8_'+i,mu=o.s.u;
  const n={id,t:o.t,x:+o.x.toFixed(2),y:+o.y.toFixed(2),w:+o.w.toFixed(2),v,mu,sz:o.s.k,uses:mu,at:0,d:null,c:null};NODES.push(n);ST.nodes[o.t]++;ST.sizes[o.s.k]=(ST.sizes[o.s.k]||0)+1});
 for(const n of NODES)showNode(n)}
function showNode(n){if(!n.d){n.d=[('nt_'+n.t)+n.v,n.x,n.y,+(n.w/RK).toFixed(2)];n.d.nt37=1;n.d.ntNode=n.id;SH.DEC.push(n.d)}if(!n.c){const b=boxOf(n.x,n.y,n.w);n.c={x0:b[0],x1:b[2],z0:b[1],z1:b[3],on:true,nt37:'node'};SH.cols.push(n.c)}else n.c.on=true}
function hideNode(n){if(n.d){const i=SH.DEC.indexOf(n.d);if(i>=0)SH.DEC.splice(i,1);n.d=null}if(n.c){n.c.on=false;const i=SH.cols.indexOf(n.c);if(i>=0)SH.cols.splice(i,1);n.c=null}try{SH.colsDirty()}catch(_){}}
const FXL=[];
function fx(n,done){FXL.push({x:n.x,y:n.y,t0:performance.now(),c:n.t==='cu'?'#e0893a':n.t==='fe'?'#b5582e':'#a9adb5',big:done})}
function mine(n){const cfg=NODE_CFG[n.t];if(!S.on||S.dead||n.uses<=0)return;if(Math.hypot(pos.x-n.x,pos.y-n.y)>2.4+n.w*.45)return;
 if(!S.pick)return say('⛏ Cần cuốc chim – chế tạo ở 🔨 bàn chế tạo trong nhà gỗ');try{SH.F5&&SH.F5.tool&&SH.F5.tool('mine')}catch(_){}
 const want=cfg.min+Math.floor(Math.random()*(cfg.max-cfg.min+1)),got=X.give(cfg.item,want);if(!got)return say('🎒 Túi đầy! Mở túi 🎒 để vứt bớt đồ');
 n.uses--;ST.mined[n.t]+=got;say('⛏ '+cfg.ic+' Đào được '+got+' '+cfg.nm+(n.uses>0?'':' – điểm này đã cạn, mọc lại sau ~'+cfg.resp+' giờ'));fx(n,n.uses<=0);
 if(n.uses<=0){n.at=GT()+cfg.resp;hideNode(n)}try{X.WORLD&&X.WORLD.emit('nt37.mine',{id:n.id,t:n.t,left:n.uses})}catch(_){}try{if(document.getElementById('inv').style.display==='flex')X.renderInv()}catch(_){}}
function hookActs(){const F5=SH.F5;if(!F5||F5.__nt37)return;F5.__nt37=1;const a0=F5.acts;F5.acts=c=>{a0&&a0(c);if(IH()||!inField(pos.x,pos.y))return;
 for(const n of NODES){if(n.uses<=0)continue;const d=Math.hypot(pos.x-n.x,pos.y-n.y),rr=1.9+n.w*.45;if(d<rr)c(d,rr,S.pick?'⛏<br>'+NODE_CFG[n.t].lb:'⛏<br>Cần cuốc',()=>mine(n),{x:n.x,y:n.y})}}}

/* ================= 8) NỀN ĐẤT (ô 64 m, 8 px/m) – dùng chung 2D & 2.5D; tuyết dày dần theo độ cao thật ================= */
const TS=64,PPM=8,TP=TS*PPM,TILES=new Map();const ZB=GB;
const ovl=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
function tile(i,j){const key=i+','+j;let t=TILES.get(key);if(t){t.u=performance.now();return t.c}const t0=performance.now(),x0=i*TS,y0=j*TS,P=Zpoly(),c=document.createElement('canvas');c.width=c.height=TP;const g=c.getContext('2d');
 const PAD=16,TQ=TP+2*PAD,id=g.createImageData(TQ,TQ),d=id.data,B=4;
 for(let py=0;py<TQ;py+=B)for(let px=0;px<TQ;px+=B){const x=x0+(px-PAD+B/2)/PPM,y=y0+(py-PAD+B/2)/PPM;if(!inPoly(x,y,P))continue;const e=Math.min(1,edgeDist(x,y,P)/5);if(e<=0)continue;
  const ho=EV.hObj(x,y),lv=Math.max(0,Math.min(1.1,.18+ho/30+.1*(fbm(x/60,y/60,7)-.5)));
  const nr=fbm(x/16,y/16,3),nd=fbm(x/9,y/9,17),ng=fbm(x/12,y/12,29),fine=vn(x*1.7,y*1.7,41);let r=0,gg=0,b=0,al=0;
  const rock=sstep(.5+lv*.06,.66+lv*.06,nr)*(.8-.25*sstep(.6,1,lv));if(rock>0){const sh=.85+.3*fine;r=112*sh;gg=117*sh;b=126*sh;al=rock*.8}
  const grass=sstep(.56,.72,ng)*(1-sstep(.22,.42,lv));if(grass>al*.5&&grass>0){const sh=.85+.25*fine;r=104*sh;gg=112*sh;b=92*sh;al=Math.max(al,grass*.62)}
  const drift=sstep(.52-lv*.12,.7-lv*.1,nd)*(.35+lv*.55);if(drift>0){const m=drift;r=r*(1-m)+244*m;gg=gg*(1-m)+247*m;b=b*(1-m)+252*m;al=Math.max(al,m*.85)}
  {const fd=Math.min(x-FIELD.r[0],FIELD.r[2]-x,y-FIELD.r[1],FIELD.r[3]-y)+(fbm(x/7,y/7,51)-.5)*14,fw=sstep(-3,7,fd)*(ho>24?1:0);if(fw>0){const gv=fine>.55?1:0,m2=(.45+.2*gv)*fw;r=r*(1-m2)+(gv?138:116)*m2;gg=gg*(1-m2)+(gv?133:114)*m2;b=b*(1-m2)+(gv?126:112)*m2;al=Math.max(al,.55*fw)}}
  if(al<=0)continue;al*=e;for(let yy=0;yy<B;yy++)for(let xx=0;xx<B;xx++){const q=((py+yy)*TQ+px+xx)*4;d[q]=r;d[q+1]=gg;d[q+2]=b;d[q+3]=al*255}}
 {const big=cnv(TQ,TQ,q=>q.putImageData(id,0,0));g.clearRect(0,0,TP,TP);g.filter='blur(5px)';g.drawImage(big,-PAD,-PAD);g.filter='none'}
 g.setTransform(PPM,0,0,PPM,-x0*PPM,-y0*PPM);
 holes(g,x0,y0);g.globalCompositeOperation='source-over';g.setTransform(1,0,0,1,0,0);
 TILES.set(key,{c,u:performance.now()});ST.tiles++;ST.tileMs=+(performance.now()-t0).toFixed(1);
 if(TILES.size>36){let old=null;for(const[k,v]of TILES)if(!old||v.u<old[1].u)old=[k,v];TILES.delete(old[0])}return c}
/* ĐƯỜNG MÒN TỰ NHIÊN: tâm đường uốn mềm (Catmull-Rom), bề rộng thay đổi; vẽ nền đất → đá lát → tuyết phủ (dày ở mép, mỏng ở vệt đi giữa) → đá viền phủ tuyết */
let ROADS=null;
function crPts(p,step){const out=[];for(let i=0;i<p.length-1;i++){const p0=p[Math.max(0,i-1)],p1=p[i],p2=p[i+1],p3=p[Math.min(p.length-1,i+2)],L=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]),n=Math.max(1,Math.ceil(L/step));
  for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;out.push([0,1].map(c=>.5*(2*p1[c]+(-p0[c]+p2[c])*t+(2*p0[c]-5*p1[c]+4*p2[c]-p3[c])*t2+(-p0[c]+3*p1[c]-3*p2[c]+p3[c])*t3)))}}out.push(p[p.length-1].slice());return out}
function buildRoads(){ROADS=[];for(const t of TRAILS){const R=rng(t.k.split('').reduce((a,ch)=>(a*31+ch.charCodeAt(0))|0,7)),c=crPts(t.p,.5),n=c.length,Lf=[],Rt=[],deco={fl:[],ed:[],sn:[],gr:[]},isR=/^r\d$/.test(t.k),W0=isR?3.8:t.w;let s=0;
  for(let i=0;i<n;i++){const a=c[Math.max(0,i-1)],b=c[Math.min(n-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;if(i)s+=Math.hypot(c[i][0]-c[i-1][0],c[i][1]-c[i-1][1]);
   const hw=W0/2*(1+.28*(vn(s/3.1,t.k.length,77)-.5));const p=c[i];Lf.push([p[0]+nx*hw,p[1]+ny*hw]);Rt.push([p[0]-nx*hw,p[1]-ny*hw]);p.push(nx,ny,hw,s)}
  for(let i=0;i<n;i++){const[x,y,nx,ny,hw]=c[i];
   if(i%2===0)for(const sd of[1,-1])if(R()<.85){const o=hw+(R()-.4)*.22;deco.ed.push([x+nx*o*sd,y+ny*o*sd,.15+R()*.2,R()*3])}
   if(i%2===1&&R()<.6){const o=(R()-.5)*hw*1.3;deco.fl.push([x+nx*o,y+ny*o,.2+R()*.24,R()*3])}
   for(const sd of[1,-1])if(R()<.75){const o=hw-R()*hw*.5;deco.sn.push([x+nx*o*sd,y+ny*o*sd,.24+R()*.5,.6+R()*.35])}
   if(R()<.3){const o=(R()-.5)*hw*1.2;deco.sn.push([x+nx*o,y+ny*o,.15+R()*.32,.35+R()*.3])}
   if(R()<.6){const o=(R()-.5)*hw*1.7;deco.gr.push([x+nx*o,y+ny*o,.05+R()*.08])}}
  const poly=Lf.concat(Rt.reverse()),bb=poly.reduce((a,p)=>[Math.min(a[0],p[0]),Math.min(a[1],p[1]),Math.max(a[2],p[0]),Math.max(a[3],p[1])],[1e9,1e9,-1e9,-1e9]);
  ROADS.push({t,c,poly,bb,deco,soft:t.soft,w:W0})}}
function drawRoads(g,VB){if(!ROADS)return;const inV=(x,y)=>x>VB[0]-1&&x<VB[2]+1&&y>VB[1]-1&&y<VB[3]+1,P=poly=>{g.beginPath();poly.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath()};
 const vis=ROADS.filter(r=>ovl([r.bb[0]-2,r.bb[1]-2,r.bb[2]+2,r.bb[3]+2],VB));if(!vis.length)return;g.save();g.lineCap='round';g.lineJoin='round';
 // 1) nền đất (mọi đường trước → chỗ giao nhau liền mạch)
 for(const r of vis){P(r.poly);g.fillStyle=r.soft?'#97805f':'#86644a';g.fill()}
 // 2) vệt đất sáng giữa, sỏi, đá lát
 for(const r of vis){g.save();P(r.poly);g.clip();g.strokeStyle=r.soft?'rgba(184,163,132,.6)':'rgba(170,132,94,.6)';g.lineWidth=r.w*.5;g.beginPath();r.c.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();
  g.fillStyle='rgba(62,46,32,.42)';for(const q of r.deco.gr)if(inV(q[0],q[1])){g.beginPath();g.arc(q[0],q[1],q[2],0,7);g.fill()}
  for(const q of r.deco.fl)if(inV(q[0],q[1])){g.fillStyle='rgba(56,42,30,.45)';g.beginPath();g.ellipse(q[0]+.03,q[1]+.05,q[2]*1.06,q[2]*.8,q[3],0,7);g.fill();g.fillStyle='#c2b29a';g.beginPath();g.ellipse(q[0],q[1],q[2],q[2]*.74,q[3],0,7);g.fill();g.fillStyle='rgba(255,248,236,.35)';g.beginPath();g.ellipse(q[0]-q[2]*.2,q[1]-q[2]*.2,q[2]*.5,q[2]*.32,q[3],0,7);g.fill()}
  g.restore()}
 // 3) tuyết phủ mặt đường: lớp mỏng toàn mặt + đụn dày ở mép, vệt đi giữa ít tuyết
 for(const r of vis){g.save();P(r.poly);g.clip();g.fillStyle='rgba(240,245,251,.24)';g.fill();for(const q of r.deco.sn)if(inV(q[0],q[1])){g.fillStyle='rgba(243,247,252,'+q[3].toFixed(2)+')';g.beginPath();g.ellipse(q[0],q[1],q[2],q[2]*.72,0,0,7);g.fill()}g.restore()}
 for(const r of vis){P(r.poly);g.strokeStyle='rgba(240,245,251,.85)';g.lineWidth=.42;g.stroke()}
 // 4) đá viền mép đường, mũ tuyết
 for(const r of vis)for(const q of r.deco.ed)if(inV(q[0],q[1])){const R0=q[2];g.fillStyle='rgba(30,32,40,.38)';g.beginPath();g.ellipse(q[0]+.04,q[1]+.08,R0*1.1,R0*.8,0,0,7);g.fill();g.fillStyle='#6c6f78';g.beginPath();g.ellipse(q[0],q[1],R0,R0*.8,q[3],0,7);g.fill();g.fillStyle='#8f929b';g.beginPath();g.ellipse(q[0]-R0*.15,q[1]-R0*.1,R0*.6,R0*.45,q[3],0,7);g.fill();g.fillStyle='rgba(246,249,253,.96)';g.beginPath();g.ellipse(q[0]-R0*.05,q[1]-R0*.34,R0*.85,R0*.46,0,0,7);g.fill()}
 g.restore()}
/* ROAD41: keep the existing entry connected, using forest dirt on the forest side. */
function entryRoad41(g,VB){
 const forest=W.ZV2.find(z=>z.n==='Rừng Suối Mây'),r=ROADS?.find(o=>o.t.k==='entry');
 if(!forest||!r||!ovl(r.bb,VB))return;
 g.save();g.beginPath();g.rect(r.bb[0]-3,r.bb[1]-3,r.bb[2]-r.bb[0]+6,r.bb[3]-r.bb[1]+6);Zpoly().forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.clip('evenodd');
 if(globalThis.M26RD?.ok())M26RD.draw(g,[{p:r.c.map(q=>[q[0],q[1]]),w:r.w,kind:'trail',curved5:true}],x=>x,y=>y,1,1);
 else{g.beginPath();r.c.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.lineCap='round';g.lineJoin='round';g.strokeStyle='#92764f';g.lineWidth=r.w;g.stroke()}
 g.restore();
}
/* lớp vector (đường, đèo, hồ, suối nóng, khe, ánh hang) */
function vec(g,VB,P,two){const path=(P2)=>{g.beginPath();P2.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]))};
 g.save();g.beginPath();P.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.clip();/* ROAD41: snow road style stops at its official zone; keep the connecting route. */
 g.beginPath();g.rect(VB[0]-50,VB[1]-50,VB[2]-VB[0]+100,VB[3]-VB[1]+100);for(const b of BR){if(b.ravine)continue;const ca=b.ux,sa=b.uy,L=b.hl+.4,Wd=b.hw+.5,pt=(a,c)=>[b.x+ca*a-sa*c,b.y+sa*a+ca*c],q=[pt(-L,-Wd),pt(L,-Wd),pt(L,Wd),pt(-L,Wd)];g.moveTo(...q[0]);g.lineTo(...q[1]);g.lineTo(...q[2]);g.lineTo(...q[3]);g.closePath()}g.clip('evenodd');
 // hồ băng
 if(ovl([LAKE.x-LAKE.rx-3,LAKE.y-LAKE.ry-3,LAKE.x+LAKE.rx+3,LAKE.y+LAKE.ry+3],VB)){
  g.fillStyle='rgba(236,242,250,.95)';g.beginPath();g.ellipse(LAKE.x,LAKE.y,LAKE.rx+1.6,LAKE.ry+1.3,0,0,7);g.fill();
  const gr=g.createRadialGradient(LAKE.x-4,LAKE.y-3,1,LAKE.x,LAKE.y,LAKE.rx);gr.addColorStop(0,'#bfe7fb');gr.addColorStop(.6,'#8fcdf0');gr.addColorStop(1,'#6eb4e2');g.fillStyle=gr;g.beginPath();g.ellipse(LAKE.x,LAKE.y,LAKE.rx,LAKE.ry,0,0,7);g.fill();
  g.save();g.beginPath();g.ellipse(LAKE.x,LAKE.y,LAKE.rx,LAKE.ry,0,0,7);g.clip();const R=rng(55);g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=.12;for(let i=0;i<34;i++){let x=LAKE.x+(R()-.5)*LAKE.rx*2,y=LAKE.y+(R()-.5)*LAKE.ry*2;g.beginPath();g.moveTo(x,y);for(let s=0;s<5;s++){x+=(R()-.5)*7;y+=(R()-.5)*4;g.lineTo(x,y)}g.stroke()}
   g.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<10;i++){g.beginPath();g.ellipse(LAKE.x+(R()-.5)*LAKE.rx*1.6,LAKE.y+(R()-.5)*LAKE.ry*1.5,1.5+R()*4,.6+R()*1.4,R(),0,7);g.fill()}g.restore();
  g.strokeStyle='rgba(120,170,210,.6)';g.lineWidth=.25;g.beginPath();g.ellipse(LAKE.x,LAKE.y,LAKE.rx,LAKE.ry,0,0,7);g.stroke()}
 // cầu tàu gỗ trên hồ băng
 if(ovl([244,-510,256,-496],VB)){g.fillStyle='#5a3c22';g.fillRect(248.4,-507.4,3.2,8.2);g.fillStyle='#8a6240';for(let y=-507.2;y<-499.4;y+=.55)g.fillRect(248.55,y,2.9,.42);g.fillStyle='#eef3f9';g.fillRect(248.4,-507.4,3.2,.35);g.fillStyle='#3e2a1a';for(const[x,y]of[[248.5,-507.3],[251.5,-507.3],[248.5,-503.5],[251.5,-503.5]]){g.beginPath();g.arc(x,y,.22,0,7);g.fill()}}
 // vũng nước dưới chân thác
 for(const f of FALLS)if(ovl([f.x-5,f.y-2,f.x+5,f.y+5],VB)){g.fillStyle='rgba(236,242,250,.95)';g.beginPath();g.ellipse(f.x,f.y+1.6,f.w*.95,1.7,0,0,7);g.fill();g.fillStyle='#86c8ea';g.beginPath();g.ellipse(f.x,f.y+1.5,f.w*.75,1.25,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(f.x,f.y+.9,f.w*.45,.5,0,0,7);g.fill()}
 // suối nước nóng
 if(ovl([SPRING.x-8,SPRING.y-8,SPRING.x+8,SPRING.y+8],VB)){g.fillStyle='rgba(120,118,112,.9)';g.beginPath();g.ellipse(SPRING.x,SPRING.y,SPRING.rx+.9,SPRING.ry+.8,0,0,7);g.fill();
  const gr=g.createRadialGradient(SPRING.x,SPRING.y,.3,SPRING.x,SPRING.y,SPRING.rx);gr.addColorStop(0,'#9ff1e8');gr.addColorStop(.6,'#46c3c6');gr.addColorStop(1,'#2a8fa6');g.fillStyle=gr;g.beginPath();g.ellipse(SPRING.x,SPRING.y,SPRING.rx,SPRING.ry,0,0,7);g.fill();
  g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=.12;for(let i=1;i<4;i++){g.beginPath();g.ellipse(SPRING.x,SPRING.y,SPRING.rx*i/4,SPRING.ry*i/4,0,0,7);g.stroke()}}
 // ánh băng trước cửa hang
 if(ovl([CAVE.x-14,CAVE.y-6,CAVE.x+14,CAVE.y+12],VB)){const gr=g.createRadialGradient(CAVE.x,CAVE.y+1,.5,CAVE.x,CAVE.y+2,9);gr.addColorStop(0,'rgba(150,220,255,.55)');gr.addColorStop(1,'rgba(150,220,255,0)');g.fillStyle=gr;g.fillRect(CAVE.x-12,CAVE.y-6,24,18)}
 // đường mòn & đèo
 drawRoads(g,VB);
 // khe núi: đáy khe tối (độ sâu thật do lưới địa hình), băng đọng ở đáy
 if(ovl([570,-575,612,-480],VB)){g.lineCap='round';g.lineJoin='round';path(RAVINE);g.strokeStyle='#4a525e';g.lineWidth=RAV_W-.6;g.stroke();path(RAVINE);g.strokeStyle='#2b323d';g.lineWidth=RAV_W*.5;g.stroke();path(RAVINE);g.strokeStyle=two?'#7cc0e6':'rgba(170,210,235,.55)';g.lineWidth=two?1.9:.5;g.stroke();if(two){path(RAVINE);g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=.35;g.setLineDash([.8,1.2]);g.lineDashOffset=-performance.now()/400;g.stroke();g.setLineDash([])}}
 // 2D: mặt cầu khe (ở 2.5D là cầu 3D thật bắc ngang khe)
 if(two)for(const b of BR)if(b.ravine&&ovl([b.x-8,b.y-8,b.x+8,b.y+8],VB)){g.save();g.translate(b.x,b.y);g.rotate(Math.atan2(b.uy,b.ux));g.fillStyle='#6d4a2a';g.fillRect(-b.hl,-b.hw,2*b.hl,2*b.hw);g.fillStyle='#8d6440';for(let a=-b.hl+.15;a<b.hl;a+=.42)g.fillRect(a,-b.hw+.12,.32,2*b.hw-.24);g.fillStyle='#4a301a';g.fillRect(-b.hl,-b.hw,2*b.hl,.18);g.fillRect(-b.hl,b.hw-.18,2*b.hl,.18);g.restore()}
 g.restore()}
function holes(g,x0,y0){g.globalCompositeOperation='destination-out';for(const r of W.RV||[]){let any=false;for(let i=0;i<r.N;i+=4)if(r.X[i]>x0-10&&r.X[i]<x0+TS+10&&r.Y[i]>y0-10&&r.Y[i]<y0+TS+10){any=true;break}if(!any)continue;
  for(let i=0;i<r.N-1;i++){if(r.X[i]<x0-10||r.X[i]>x0+TS+10||r.Y[i]<y0-10||r.Y[i]>y0+TS+10)continue;if(r.FD[i]==2&&r.FD[i+1]==2)continue;g.beginPath();g.moveTo(r.X[i],r.Y[i]);g.lineTo(r.X[i+1],r.Y[i+1]);g.lineWidth=r.HW[i]*2+.6;g.strokeStyle='#000';g.stroke()}}
 for(const b of BR){if(b.ravine)continue;g.save();g.translate(b.x,b.y);g.rotate(Math.atan2(b.uy,b.ux));g.fillStyle='#000';g.fillRect(-b.hl-.5,-b.hw-.6,2*b.hl+1,2*b.hw+1.2);g.restore()}}
function paint(g,Xf,Yf,Z,cx,cy,vw,vh,YS){const v=[cx-vw-4,cy-vh-6,cx+vw+4,cy+vh+8];if(!ovl(v,ZB))return;const two=!V25on();
 const i0=Math.floor(v[0]/TS),i1=Math.floor(v[2]/TS),j0=Math.floor(v[1]/TS),j1=Math.floor(v[3]/TS);g.save();g.imageSmoothingEnabled=true;
 for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const tb=[i*TS,j*TS,(i+1)*TS,(j+1)*TS];if(!ovl(tb,ZB))continue;const c=tile(i,j);const dx=Xf(tb[0]),dy=Yf(tb[1]);g.drawImage(c,dx,dy,TS*Z,TS*Z*(YS||1))}
 const ax=Xf(0),sx=Xf(1)-ax,ay=Yf(0),sy=Yf(1)-ay;g.save();g.transform(sx,0,0,sy,ax,ay);entryRoad41(g,v);vec(g,v,Zpoly(),two);g.restore();
 if(two)EV.faces2D(g,Xf,Yf,Z,v);// 2D nhìn thẳng từ trên: thể hiện mặt vách ở mép tầng
 g.restore()}

/* ================= 9) CẦU ================= */
function addBridges(){const BRG=W.M3&&W.M3.BRG;
 // cầu khe (tầng 3): không thuộc W15 (không qua nước) – dựng cầu 3D riêng ở 2.5D
 for(const b of BRIDGES){const t=TRAILS.find(q=>q.k==='pass');let best=null;for(let i=0;i<t.p.length-1;i++){const a=t.p[i],c=t.p[i+1];const d=dSeg(b.at[0],b.at[1],a,c);if(!best||d<best.d)best={d,a,c}}
  const L=Math.hypot(best.c[0]-best.a[0],best.c[1]-best.a[1]),o={id:b.id,n:'Cầu khe Bạch Vân',x:b.at[0],y:b.at[1],ux:(best.c[0]-best.a[0])/L,uy:(best.c[1]-best.a[1])/L,hl:RAV_W/2+2.6,hw:1.9,roadW:3.2,nt37:1,ravine:1};BR.push(o);ST.bridges++}
 // cầu qua Suối Mây (tầng 1, đường vào)
 const vt=TRAILS.find(q=>q.k==='entry'),rv=(W.RV||[]).find(r=>r.n==='Suối Mây');if(BRG&&vt&&rv){let best=null;for(let i=0;i<vt.p.length-1;i++){const a=vt.p[i],c=vt.p[i+1],L=Math.hypot(c[0]-a[0],c[1]-a[1]);for(let s=0;s<=L;s+=.25){const x=a[0]+(c[0]-a[0])*s/L,y=a[1]+(c[1]-a[1])*s/L;let dmin=1e9,hw=0,k=0;for(let j=0;j<rv.N-1;j++){if(Math.abs(rv.X[j]-x)>20||Math.abs(rv.Y[j]-y)>20)continue;const q=dSeg(x,y,[rv.X[j],rv.Y[j]],[rv.X[j+1],rv.Y[j+1]]);if(q<dmin){dmin=q;hw=rv.HW[j];k=j}}if(!best||dmin<best.d)best={d:dmin,x,y,hw,k}}}
  if(best&&best.d<1.5){const tx=rv.TX[best.k],ty=rv.TY[best.k],o={id:'NT2',n:'Cầu gỗ Suối Mây',x:best.x,y:best.y,ux:-ty,uy:tx,hl:best.hw+2.6,hw:1.9,roadW:3,nt37:1};BRG.push(o);BR.push(o);ST.bridges++}}}
let DECK=null;
function deck3(){const V=SH.V25,T15=V&&V.T15;if(!T15||!T15.T)return;const T=T15.T,b=BR.find(q=>q.ravine);if(!b)return;const near=V.on&&Math.abs(pos.x-b.x)<70&&Math.abs(pos.y-b.y)<60;
 if(!DECK){if(!near)return;const g=new T.Group(),mp=new T.MeshLambertMaterial({color:0x8d6440}),md=new T.MeshLambertMaterial({color:0x5a3a20}),C=T15.CARD||2;
  for(let a=-b.hl+.2;a<b.hl;a+=.44){const m=new T.Mesh(new T.BoxGeometry(.38,.12,2*b.hw),mp);m.position.set(a,-.06,0);g.add(m)}
  for(const sd of[1,-1]){const be=new T.Mesh(new T.BoxGeometry(2*b.hl,.34,.22),md);be.position.set(0,-.24,sd*(b.hw-.25));g.add(be);
   for(let a=-b.hl+.3;a<=b.hl-.3+1e-6;a+=1.5){const p=new T.Mesh(new T.BoxGeometry(.2,1.0*C,.2),md);p.position.set(a,.5*C,sd*(b.hw-.12));g.add(p)}
   for(const hy of[.98*C,.55*C]){const r=new T.Mesh(new T.BoxGeometry(2*b.hl,.12,.14),mp);r.position.set(0,hy,sd*(b.hw-.12));g.add(r)}}
  g.position.set(b.x,0,b.y);g.rotation.y=-Math.atan2(b.uy,b.ux);T15.scene.add(g);DECK=g}
 DECK.visible=near}

/* ================= 10) VA CHẠM TỪ ĐỘ DỐC ================= */
function addCliffCols(){const R=EV.rects();for(const q of R){col(q[0],q[1],q[2],q[3],'cliff');ST.cliffCols++}}
function freeNear(x,y,rMax,minD){if(dtAt(x,y)>=minD&&lvAt(x,y)!==5)return null;for(let r=1;r<=rMax;r+=1)for(let a=0;a<16;a++){const q=a/16*Math.PI*2,px=x+Math.cos(q)*r,py=y+Math.sin(q)*r;if(dtAt(px,py)>=minD&&lvAt(px,py)!==5&&inZ(px,py,2))return[px,py]}return null}
function fixSpawns(){for(const q of M.Z||[]){const x=q[1],y=q[2];if(!(x>GB[0]&&x<GB[2]&&y>GB[1]&&y<GB[3])||!inZ(x,y))continue;const p=freeNear(x,y,40,2.5);if(p){q[1]=+p[0].toFixed(2);q[2]=+p[1].toFixed(2);ST.spawnMoved++}}}
const blockedR=(x,y,r)=>{for(const[dx,dy]of[[0,0],[r,0],[-r,0],[0,r],[0,-r]])if(EV.blocked(x+dx,y+dy))return true;return false};

/* ================= 11) HƠI NƯỚC + HIỆU ỨNG ĐÀO (2D) · hơi nước 2.5D ================= */
function draw2Hook(){const F5=SH.F5;if(!F5||F5.__nt37d)return;F5.__nt37d=1;const o=F5.draw2;F5.draw2=(L,Xf,Yf,cx,cy,vw,vh,t,g,Z)=>{o&&o(L,Xf,Yf,cx,cy,vw,vh,t,g,Z);if(IH())return;
 if(Math.abs(SPRING.x-cx)<vw+6&&Math.abs(SPRING.y-cy)<vh+8)L.push([SPRING.y+SPRING.ry,()=>{const tt=t/1000;g.save();for(let i=0;i<9;i++){const ph=(tt*.25+i/9)%1,x=SPRING.x+Math.sin(i*2.3+tt*.6)*SPRING.rx*.6,y=SPRING.y-ph*3.2,r=(.6+ph*1.6)*Z;g.globalAlpha=(1-ph)*.45;g.fillStyle='#f4f8fb';g.beginPath();g.ellipse(Xf(x),Yf(y)-ph*Z*1.2,r,r*.7,0,0,7);g.fill()}g.restore()}]);
 for(const f of FALLS){if(Math.abs(f.x-cx)>vw+4||f.y<cy-vh-16||f.y>cy+vh+4)continue;L.push([f.y+.2,()=>{const x0=Xf(f.x-f.w/2),x1=Xf(f.x+f.w/2),y0=Yf(f.y)-2,y1=Yf(f.y+Math.min((f.y1-f.y0)*.3,6)),tt=t/1000;g.save();const gr=g.createLinearGradient(x0,0,x1,0);gr.addColorStop(0,'rgba(120,190,230,.75)');gr.addColorStop(.5,'rgba(200,236,252,.95)');gr.addColorStop(1,'rgba(120,190,230,.75)');g.fillStyle=gr;g.fillRect(x0,y0,x1-x0,y1-y0);g.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<10;i++){const xx=x0+(x1-x0)*((i*.37)%1),ph=((tt*.9+i*.29)%1);g.fillRect(xx,y0+(y1-y0)*ph-6,2,12)}g.restore()}])}
 const now=performance.now();for(let i=FXL.length-1;i>=0;i--){const f=FXL[i],k=(now-f.t0)/600;if(k>1){FXL.splice(i,1);continue}if(Math.abs(f.x-cx)>vw+2||Math.abs(f.y-cy)>vh+3)continue;L.push([f.y+.1,()=>{g.save();for(let j=0;j<(f.big?14:8);j++){const a=j*2.4,d=k*(f.big?2.2:1.4);g.globalAlpha=1-k;g.fillStyle=f.c;g.fillRect(Xf(f.x+Math.cos(a)*d)-2,Yf(f.y-.6+Math.sin(a)*d*.5-k*.4)-2,4,4)}g.restore()}])}}}
const STEAM=[];let steamTex=null;
function steam3(){const V=SH.V25,T15=V&&V.T15;if(!T15||!T15.T)return;const T=T15.T;const near=V.on&&Math.abs(pos.x-SPRING.x)<40&&Math.abs(pos.y-SPRING.y)<35;
 if(!STEAM.length){if(!near)return;steamTex=new T.CanvasTexture(cnv(64,64,(g)=>{const gr=g.createRadialGradient(32,32,2,32,32,30);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64)}));
  for(let i=0;i<7;i++){const m=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:steamTex,transparent:true,depthWrite:false,opacity:.4}));T15.scene.add(m);STEAM.push(m)}}
 const tt=performance.now()/1000;STEAM.forEach((m,i)=>{m.visible=near;if(!near)return;const ph=(tt*.25+i/7)%1;m.position.set(SPRING.x+Math.sin(i*2.3+tt*.6)*SPRING.rx*.5,.4+ph*3.4,SPRING.y+.2);const s=1.4+ph*3.2;m.scale.set(s,s,1);m.material.opacity=(1-ph)*.75})}

/* ================= 12) LƯU (giữ mục 'nt37') ================= */
function regSave(){const SAVE=X.SAVE;if(!SAVE||!SAVE.register)return;
 SAVE.register({id:'nt37',scope:'world',version:1,defaults:()=>({v:1,m:{}}),validate:d=>d&&typeof d.m==='object',
  get:()=>{const m={};for(const n of NODES){const max=n.mu;if(n.uses<max)m[n.id]=[n.uses,n.uses>0?0:+Math.max(0,n.at-GT()).toFixed(2)]}return{v:1,m}},
  set:d=>{const m=(d&&d.m)||{};for(const n of NODES){const q=m[n.id],max=n.mu;if(Array.isArray(q)){n.uses=Math.max(0,Math.min(max,q[0]|0));if(n.uses<=0){n.at=GT()+Math.max(0,Math.min(NODE_CFG[n.t].resp,+q[1]||0));hideNode(n)}else{n.at=0;showNode(n)}}else{n.uses=max;n.at=0;showNode(n)}}}})}

/* ================= 13) ÁP DỤNG ================= */
let lastArea=null;
function areaAt(x,y){if(!inZ(x,y))return null;const t=tierAt(x,y);return LV[Math.min(4,t===5?3:t)]}
function tick(){if(!ST.applied)return;const g=GT();for(const n of NODES)if(n.uses<=0&&n.at&&g>=n.at){n.uses=n.mu;n.at=0;showNode(n);try{SH.colsDirty()}catch(_){}}
 if(S.on&&!S.dead&&!IH()){const a=areaAt(pos.x,pos.y),k=a?a.k:null;if(k!==lastArea){lastArea=k;if(a)say('🏔 '+a.n)}
  // an toàn: nếu save cũ/dịch chuyển đặt người chơi đúng vào mép vách → đưa ra chỗ đứng gần nhất
  if(pos.x>GB[0]&&pos.x<GB[2]&&pos.y>GB[1]&&pos.y<GB[3]&&blockedR(pos.x,pos.y,.35)){const p=freeNear(pos.x,pos.y,12,1.2);if(p){pos.x=p[0];pos.y=p[1];ST.unstuck++}}}
 for(const e of SH.ens||[]){if(e.x>GB[0]&&e.x<GB[2]&&e.y>GB[1]&&e.y<GB[3]&&EV.blocked(e.x,e.y)){const p=freeNear(e.x,e.y,10,1.2);if(p){e.x=p[0];e.y=p[1];ST.unstuck++}}}
 try{steam3();deck3();falls3()}catch(_){}
 if(pos.x>ZB[0]-64&&pos.x<ZB[2]+64&&pos.y>ZB[1]-64&&pos.y<ZB[3]+64){const ci=Math.floor(pos.x/TS),cj=Math.floor(pos.y/TS);outer:for(let r=0;r<=1;r++)for(let di=-r;di<=r;di++)for(let dj=-r;dj<=r;dj++){const i=ci+di,j=cj+dj;if(TILES.has(i+','+j))continue;if(!ovl([i*TS,j*TS,(i+1)*TS,(j+1)*TS],ZB))continue;tile(i,j);break outer}}}
function sprites(){const pine=AS.pine||AS.pine2;let ok=true;
 if(!AS.nt_pine1)ok=snowPine('nt_pine1',AS.pine2||pine,.6,11)&&ok;if(!AS.nt_pine2)ok=snowPine('nt_pine2',pine,.8,12)&&ok;if(!AS.nt_pine3)ok=snowPine('nt_pine3',pine,1,13)&&ok;
 if(!AS.nt_icecave)ok=iceCave('nt_icecave')&&ok;if(!AS.nt_cabin)cabinSprite('nt_cabin',true);if(!AS.nt_shed)cabinSprite('nt_shed',false);
 if(!AS.nt_icecry1)crystalSprite('nt_icecry1',5);if(!AS.nt_icecry2)crystalSprite('nt_icecry2',6);
 ['Đỉnh Bạch Vân ⛰','Thung lũng Băng ↑','Hang Băng →','⛏ Bãi khai thác'].forEach((t,i)=>{if(!AS['nt_sign'+i])signSprite('nt_sign'+i,t)});
 if(!AS.nt_frame)frameSprite('nt_frame');if(!AS.nt_mcart)cartSprite('nt_mcart');
 if(!AS.nt_fence)fenceSprite('nt_fence');if(!AS.nt_post)postSprite('nt_post');if(!AS.nt_tower)towerSprite('nt_tower');if(!AS.nt_mill)millSprite('nt_mill');if(!AS.nt_tent)tentSprite('nt_tent');
 if(!AS.nt_log)ok=snowify('nt_log','n_log')&&ok;if(!AS.nt_stump)ok=snowify('nt_stump','n_stump')&&ok;return ok}
const RQ=[];['ntst','ntcu','ntfe','ntsr'].forEach(t=>{for(let v=0;v<12;v++)RQ.push([t,v])});
function spriteStep(){let n=0;while(RQ.length&&n<4){const[t,v]=RQ[0];if(rockSprite(t,v)||ST.errS)RQ.shift();else break;n++}if(!RQ.length&&RND){try{RND.r.dispose();RND.r.forceContextLoss&&RND.r.forceContextLoss()}catch(_){}RND=null}}
function placeCave(){// cửa hang đặt đúng chân vách khối núi đá (vách thật cao 12 m)
 let y=-526;while(y>-575&&!(lvAt(CAVE.x,y-1.2)===5||EV.blocked(CAVE.x,y-.6)))y-=.5;CAVE.y=+(y+.2).toFixed(2);const t=TRAILS.find(q=>q.k==='cave');t.p[t.p.length-1]=[CAVE.x,CAVE.y+2.2]}
function apply(){if(ST.applied)return;try{const z=ZONE();if(!z)throw Error('không tìm thấy khu '+ZN);
  try{SH.WORLD&&SH.WORLD.ensureIds()}catch(_){}ST.sig=SH.WORLD&&SH.WORLD.sig;
  z.open=true;ZP=null;
  {const GA=W.M3&&W.M3.GATES;if(GA)for(let i=GA.length-1;i>=0;i--)if(GA[i].z===ZN){for(const c of GA[i].cols||[])c.on=false;for(const d of GA[i].dec||[]){const j=SH.DEC.indexOf(d);if(j>=0)SH.DEC.splice(j,1)}GA.splice(i,1);ST.gate=1}}
  SH.ART6&&(SH.ART6.snowAt=(x,y)=>x>ZB[0]&&x<ZB[2]&&y>ZB[1]&&y<ZB[3]&&inZ(x,y));
  addBridges();buildHeights();placeCave();buildRoads();planFalls();
  clearTables();clearDecBand();try{W.reloadAll();W.CK&&W.CK.clear&&W.CK.clear();globalThis.M26?.resetBuckets?.()}catch(e){console.warn('[NT38] nạp lại chunk',e)}
  clearDecBand();addCliffCols();placeFeatures();placeBoulders();placeNature();globalThis.CABIN60?.plan({EV,inZ,dtAt,lvAt,busy,inField,TRAILS,SAFE_LOTS});buildField();fixSpawns();hookActs();draw2Hook();regSave();
  {const g0=W.ground;W.ground=(g,Xf,Yf,Z,cx,cy,vw,vh,YS,t,gnd)=>{g0&&g0(g,Xf,Yf,Z,cx,cy,vw,vh,YS,t,gnd);try{paint(g,Xf,Yf,Z,cx,cy,vw,vh,YS||1)}catch(e){if(!ST.errP){ST.errP=String(e&&e.stack||e);console.warn('[NT38] vẽ nền',e)}}}}
  try{SH.colsDirty();W.invalidateCols&&W.invalidateCols();SH.V25&&SH.V25.treesDirty&&SH.V25.treesDirty();SH.V25&&SH.V25.gtRedraw&&SH.V25.gtRedraw(ZB[0],ZB[1],ZB[2],ZB[3])}catch(_){}
  ST.sigAfter=SH.WORLD&&SH.WORLD.sig;ST.applied=true;console.info('[NT38] Núi Tuyết 5 tầng: đã dựng',JSON.stringify(ST.nodes),'cây',ST.trees,'đá',ST.rocks,'va chạm vách',ST.cliffCols,'cầu',ST.bridges,'ms',ST.buildMs)}
 catch(e){ST.error=String(e&&e.stack||e);console.error('[NT38]',e)}}
sprites();
const boot=()=>{if(ST.applied)return;if(!globalThis.URBAN_READY||!globalThis.Z21_READY)return;apply()};
const bt=setInterval(()=>{const ok=sprites();boot();if(ST.applied&&ok)clearInterval(bt)},300);addEventListener('load',()=>{sprites();boot()});
setInterval(()=>{try{spriteStep()}catch(_){}},60);
setInterval(()=>{try{tick()}catch(e){if(!ST.errT){ST.errT=String(e);console.warn('[NT38]',e)}}},500);

/* ================= 14) ẢNH TỔNG QUAN ================= */
const OB=[100,-650,795,-352];
// (a) bản đồ nhìn thẳng từ trên (có mặt vách & tô màu theo tầng)
function overview(Sc,opt){opt=opt||{};const Bx=opt.box||OB,w=Math.round((Bx[2]-Bx[0])*Sc),h=Math.round((Bx[3]-Bx[1])*Sc),P=Zpoly(),c=cnv(w,h,()=>{}),g=c.getContext('2d');
 g.fillStyle='#55704a';g.fillRect(0,0,w,h);g.save();g.scale(Sc,Sc);g.translate(-Bx[0],-Bx[1]);g.beginPath();P.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle='#c5cdd9';g.fill();g.restore();
 for(let i=Math.floor(Bx[0]/TS);i<=Math.floor(Bx[2]/TS);i++)for(let j=Math.floor(Bx[1]/TS);j<=Math.floor(Bx[3]/TS);j++)g.drawImage(tile(i,j),(i*TS-Bx[0])*Sc,(j*TS-Bx[1])*Sc,TS*Sc,TS*Sc);
 if(opt.tint!==false){const id=g.getImageData(0,0,w,h),d=id.data;for(let py=0;py<h;py++)for(let px=0;px<w;px++){const x=Bx[0]+px/Sc,y=Bx[1]+py/Sc,o=EV.hObj(x,y);if(o<.5)continue;const q=(py*w+px)*4,k=1+o/120;d[q]=Math.min(255,d[q]*k);d[q+1]=Math.min(255,d[q+1]*k);d[q+2]=Math.min(255,d[q+2]*k)}g.putImageData(id,0,0)}
 g.save();g.scale(Sc,Sc);g.translate(-Bx[0],-Bx[1]);
 for(const r of W.RV||[]){g.beginPath();for(let i=0;i<r.N;i++)i?g.lineTo(r.X[i],r.Y[i]):g.moveTo(r.X[i],r.Y[i]);g.strokeStyle='#4f9fd8';g.lineWidth=3.4;g.stroke()}
 vec(g,Bx,P,true);
 for(const b of BR)if(!b.ravine){g.save();g.translate(b.x,b.y);g.rotate(Math.atan2(b.uy,b.ux));g.fillStyle='#8d6440';g.fillRect(-b.hl,-b.hw,2*b.hl,2*b.hw);g.restore()}
 g.restore();
 if(opt.faces!==false)EV.faces2D(g,x=>(x-Bx[0])*Sc,y=>(y-Bx[1])*Sc,Sc,Bx);
 g.save();g.scale(Sc,Sc);g.translate(-Bx[0],-Bx[1]);
 const dot=(x,y,r,f,s)=>{g.beginPath();g.arc(x,y,r,0,7);g.fillStyle=f;g.fill();if(s){g.strokeStyle=s;g.lineWidth=.25;g.stroke()}};
 for(const d of DEC){const k=d[0];if(/^nt_pine/.test(k))dot(d[1],d[2],d[3]*.42,'#2f5a46','#e9f0f6');else if(/^nt_sr/.test(k))dot(d[1],d[2],d[3]*.38,'#8c919a','#e9eef5');else if(k==='nt_cabin'||k==='nt_shed'){g.fillStyle='#6b4a2e';g.fillRect(d[1]-d[3]*.45,d[2]-2.2,d[3]*.9,2.4);g.fillStyle='#f2f6fb';g.fillRect(d[1]-d[3]*.45,d[2]-2.2,d[3]*.9,.8)}
  else if(k==='nt_icecave'){g.fillStyle='#7f8b98';g.beginPath();g.ellipse(d[1],d[2]-3,6,3.6,0,Math.PI,0);g.fill();g.fillStyle='#3f9be0';g.beginPath();g.ellipse(d[1],d[2]-.6,1.8,1.4,0,Math.PI,0);g.fill()}else if(/^nt_icecry/.test(k))dot(d[1],d[2],.7,'#8fe0ff')}
 for(const n of NODES){if(n.uses<=0)continue;dot(n.x,n.y,n.w*.4,n.t==='cu'?'#d9822b':n.t==='fe'?'#8e3f22':'#9da2aa',n.t==='st'?'#e8edf3':'#20160f')}
 if(opt.labels!==false){g.font='bold 7px system-ui,sans-serif';g.textAlign='center';for(const[a,x,y]of[['1 · Chân núi (0 m)',470,-420],['2 · Thung lũng (7 m)',220,-545],['3 · Sườn núi (14 m)',500,-555],['4 · Hang Băng (21 m)',728,-525],['5 · Đỉnh (28 m)',520,-646+5.5]]){g.lineWidth=2;g.strokeStyle='rgba(20,28,40,.75)';g.strokeText(a,x,y);g.fillStyle='#fff';g.fillText(a,x,y)}}
 g.restore();return c}
// (b) toàn cảnh 3D thật: lưới độ cao + nền + cây/đá/quặng/nhà/hang dựng đứng như 2.5D trong game, cùng góc nhìn 60°
function overview3D(opt){opt=opt||{};const T=globalThis.THREE;if(!T)return null;const PX=opt.px||3.2,Bx=opt.box||OB,Wm=Bx[2]-Bx[0],Hm=Bx[3]-Bx[1];
 const texC=overview(opt.box?8:4,{labels:false,faces:false,tint:false,box:Bx});const tex=new T.CanvasTexture(texC);tex.minFilter=T.LinearFilter;tex.generateMipmaps=false;
 const st=opt.box?.5:1,NX=Math.round(Wm/st),NY=Math.round(Hm/st),P=new Float32Array((NX+1)*(NY+1)*3),NR=new Float32Array((NX+1)*(NY+1)*3),UV=new Float32Array((NX+1)*(NY+1)*2),TPa=new Float32Array((NX+1)*(NY+1));
 for(let r=0;r<=NY;r++)for(let c=0;c<=NX;c++){const x=Bx[0]+c*st,z=Bx[1]+r*st,q=r*(NX+1)+c,h=EV.h(x,z);P[q*3]=x;P[q*3+1]=h;P[q*3+2]=z;UV[q*2]=c/NX;UV[q*2+1]=1-r/NY;TPa[q]=EV.topAt(x,z,h);const hx=(EV.h(x+.5,z)-EV.h(x-.5,z)),hz=(EV.h(x,z+.5)-EV.h(x,z-.5)),l=Math.hypot(hx,1,hz);NR[q*3]=-hx/l;NR[q*3+1]=1/l;NR[q*3+2]=-hz/l}
 const ix=new Uint32Array(NX*NY*6);let n=0;for(let r=0;r<NY;r++)for(let c=0;c<NX;c++){const a=r*(NX+1)+c,b=a+1,d=a+NX+1,e=d+1;ix[n++]=a;ix[n++]=d;ix[n++]=b;ix[n++]=b;ix[n++]=d;ix[n++]=e}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(P,3));geo.setAttribute('normal',new T.BufferAttribute(NR,3));geo.setAttribute('uv',new T.BufferAttribute(UV,2));geo.setAttribute('aTop',new T.BufferAttribute(TPa,1));geo.setIndex(new T.BufferAttribute(ix,1));
 const sc=new T.Scene();sc.add(new T.Mesh(geo,EV.mat(tex)));sc.add(new T.AmbientLight(0xffffff,.78));const dl=new T.DirectionalLight(0xfff1dc,.45);dl.position.set(.35,1,.62);sc.add(dl);
 const C=2,cg=new T.PlaneGeometry(1,1);cg.translate(0,.5,0);const MT=new Map(),mat=k=>{if(MT.has(k))return MT.get(k);const a=AS[k];let m=null;if(a&&a.i&&a.i.complete&&a.i.naturalWidth){const t=new T.Texture(a.i);t.needsUpdate=true;t.minFilter=T.LinearFilter;t.generateMipmaps=false;m=new T.MeshLambertMaterial({map:t,transparent:true,alphaTest:.1,side:T.DoubleSide})}MT.set(k,m);return m};
 const put=(k,x,y,w)=>{const m=mat(k);if(!m)return;const a=AS[k],hgt=w*a.i.naturalHeight/a.i.naturalWidth,me=new T.Mesh(cg,m);me.scale.set(w,hgt*C,1);me.position.set(x,EV.hObj(x,y),y);sc.add(me)};
 const all=SH.DEC.filter(d=>d[1]>Bx[0]-4&&d[1]<Bx[2]+4&&d[2]>Bx[1]-4&&d[2]<Bx[3]+8&&inZ(d[1],d[2],-2));for(const d of all)put(d[0],d[1],d[2],d[3]);
 for(const b of BR)if(b.ravine){const g=new T.Mesh(new T.BoxGeometry(2*b.hl,.3,2*b.hw),new T.MeshLambertMaterial({color:0x8d6440}));g.position.set(b.x,EV.hObj(b.x,b.y),b.y);g.rotation.y=-Math.atan2(b.uy,b.ux);sc.add(g)}
 const SNv=Math.sin(Math.PI/3),CSv=Math.cos(Math.PI/3),cx=(Bx[0]+Bx[2])/2,cz=(Bx[1]+Bx[3])/2,hw=Wm/2+4,hh=(Hm*SNv+40*CSv)/2+14;
 const cam=new T.OrthographicCamera(-hw,hw,hh,-hh,1,3000);cam.position.set(cx,SNv*1000+8,cz+CSv*1000);cam.lookAt(cx,8,cz);cam.updateProjectionMatrix();cam.updateMatrixWorld();
 const Wp=Math.round(2*hw*PX),Hp=Math.round(2*hh*PX),r=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setPixelRatio(1);r.setSize(Wp,Hp);r.setClearColor(0x2e4a26);r.render(sc,cam);
 const out=cnv(Wp,Hp,g=>g.drawImage(r.domElement,0,0)),g=out.getContext('2d');
 if(opt.labels!==false){const LB=opt.lb||[['TẦNG 1 · Chân núi · 0 m',470,-418],['TẦNG 2 · Thung lũng Băng · 7 m',215,-530],['TẦNG 3 · Sườn núi · 14 m',505,-550],['TẦNG 4 · Hang Băng · 21 m',722,-530],['TẦNG 5 · Đỉnh núi · 28 m',520,-618]];g.textAlign='center';g.font='bold '+Math.round(PX*(opt.fs||6.2))+'px system-ui,sans-serif';for(const[a,x,y]of LB){if(x<Bx[0]||x>Bx[2]||y<Bx[1]||y>Bx[3])continue;const v=new T.Vector3(x,EV.hObj(x,y)+1,y).project(cam),sx=(v.x+1)/2*Wp,sy=(1-v.y)/2*Hp;g.lineWidth=PX*1.6;g.strokeStyle='rgba(15,22,34,.85)';g.strokeText(a,sx,sy);g.fillStyle='#fff';g.fillText(a,sx,sy)}}
 try{r.dispose();r.forceContextLoss&&r.forceContextLoss()}catch(_){}geo.dispose();tex.dispose();return out}
Object.assign(API,{NODES,TIERS,RAMPS,TRAILS,FIELD,CAVE,LAKE,SPRING,CABIN,BR,DEC,tile,areaAt,tierAt,dtAt,lvAt,overview,overview3D,get F(){return F}});
})();
