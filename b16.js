/* =====================================================================
   BƯỚC 16 – ĐIỀU KHIỂN MÁY TÍNH · BOT SINH TỒN THỬ NGHIỆM · 5 NHÀ AN TOÀN
   - PC: tự nhận chuột/bàn phím ↔ cảm ứng; ẩn joystick/nút chạy/nút đánh trên máy tính;
     nhân vật nhìn & đánh theo con trỏ (2D và 2.5D), WASD di chuyển.
   - Bot (testBot): dùng chung luật thế giới (cây, quái, nước, chết/mạng), hiển thị qua kênh
     "người chơi khác" (OTH) sẵn có → vẽ được ở 2D, 2.5D, minimap, bản đồ lớn.
   - Nhà an toàn của bot: tạo MỘT lần theo seed thế giới, lưu trong save, không nhân đôi.
   ===================================================================== */
(()=>{'use strict';
const SH=globalThis.SH;if(!SH||!SH.F5){console.warn('[B16] thiếu SH/F5');return}
const S=SH.S,pos=SH.pos,F5=SH.F5,W15=SH.W15||globalThis.W15,WORLD=SH.WORLD;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,hyp=Math.hypot;

/* =========================== 1) ĐIỀU KHIỂN MÁY TÍNH =========================== */
const PC={pc:false,mx:-1,my:-1,last:null,down:false};
const fine=matchMedia&&matchMedia('(hover: hover) and (pointer: fine)').matches;
function setPC(v){if(PC.pc===v)return;PC.pc=v;document.body.classList.toggle('pc16',v)}
{const st=document.createElement('style');st.textContent='body.pc16 #joy,body.pc16 #run,body.pc16 #atk{display:none!important}body.pc16 canvas#cv,body.pc16 canvas{cursor:crosshair}';document.head.appendChild(st)}
const coarse=matchMedia&&matchMedia('(pointer: coarse)').matches;setPC(!!fine&&!(navigator.maxTouchPoints>0&&(coarse||'ontouchstart' in window)));// máy lai (cảm ứng + chuột): bắt đầu ở chế độ cảm ứng, rê chuột thật → chuyển sang máy tính
addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){if(!PC.pc&&(Math.abs(e.movementX)+Math.abs(e.movementY)>2))setPC(true);PC.mx=e.clientX;PC.my=e.clientY;PC.tgt=e.target}},{passive:true});
addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.pointerType==='pen'){setPC(false);return}if(e.pointerType!=='mouse')return;setPC(true);PC.mx=e.clientX;PC.my=e.clientY;
 if(e.button!==0)return;if(!gameTarget(e.target))return;PC.down=true;tryAtk()},{passive:true});
addEventListener('pointerup',e=>{if(e.pointerType==='mouse'){if(e.button===0)PC.down=false;if(e.button===2)PC.rdown=false}},{passive:true});
/* BƯỚC 18: giữ chuột phải → đi theo hướng con trỏ (tốc độ, hoạt ảnh, va chạm dùng nguyên hệ thống di chuyển cũ); thả ra → dừng ngay */
addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===2&&gameTarget(e.target)){PC.rdown=true;e.preventDefault&&e.preventDefault()}});
addEventListener('pointermove',e=>{if(PC.rdown&&e.pointerType==='mouse'&&!(e.buttons&2))PC.rdown=false},{passive:true});// thả chuột ngoài cửa sổ
addEventListener('mouseup',e=>{if(e.button===2)PC.rdown=false});addEventListener('contextmenu',e=>{if(gameTarget(e.target))e.preventDefault()});
addEventListener('visibilitychange',()=>{PC.rdown=false});
addEventListener('blur',()=>{PC.down=false;PC.rdown=false});
addEventListener('touchstart',()=>setPC(false),{passive:true});
const UI='#inv,#craft,#shop,#stat,#pmenu,#wmap,#mini,.btn,button,input,select,textarea,a,[onclick]';
function gameTarget(t){if(!t||t.tagName!=='CANVAS'||t.id==='mini')return false;if(t.closest&&t.closest(UI))return false;
 for(const id of['inv','craft','shop','stat','pmenu','wmap']){const el=document.getElementById(id);if(el&&el.style.display&&el.style.display!=='none')return false}return true}
function tryAtk(){if(!PC.pc||!S.on||S.dead||S.pz)return;// giống nút 👊: đang cầm đồ ăn/nước… thì dùng món đó, còn lại đánh theo hướng con trỏ
 const h=F5.heldAct&&F5.heldAct();if(h&&(h.fn||!h.ok)){if(h.fn)h.fn();return}if(SH.doAttack)SH.doAttack()}
setInterval(()=>{if(PC.down&&PC.pc)tryAtk()},120);// giữ chuột trái = đánh liên tục theo nhịp hồi chiêu sẵn có
/* toạ độ chuột → thế giới (2D: theo camera & zoom; 2.5D: chiếu tia lên mặt đất) */
let RC=null,PL=null,V2=null;
function mouseWorld(){if(PC.mx<0)return null;const V=SH.V25;
 if(V&&V.on&&V.T15&&V.T15.cam){const T=V.T15.T;if(!RC){RC=new T.Raycaster();PL=new T.Plane(new T.Vector3(0,1,0),0);V2=new T.Vector2()}
  V2.set(PC.mx/innerWidth*2-1,-(PC.my/innerHeight)*2+1);RC.setFromCamera(V2,V.T15.cam);const p=new T.Vector3();if(!RC.ray.intersectPlane(PL,p))return null;return[p.x,p.z]}
 const Z=SH.Z,W=SH.W,H=SH.H;if(!Z)return null;return[(PC.mx-W/2)/Z+pos.x,(PC.my-H/2)/Z+pos.y]}
PC.aim=()=>{if(!PC.pc||!S.on||S.dead||SH.lying)return null;const w=mouseWorld();if(!w)return PC.last;const dx=w[0]-pos.x,dy=w[1]-pos.y,l=hyp(dx,dy);if(l<.35)return PC.last;// vùng chết quanh nhân vật: không xoay giật
 PC.last=[dx/l,dy/l];return PC.last};
PC.rmove=()=>{if(!PC.rdown||!PC.pc||!S.on||S.dead||S.pz)return null;const w=mouseWorld();if(!w)return null;const dx=w[0]-pos.x,dy=w[1]-pos.y,l=hyp(dx,dy);if(l<.4)return null;return[dx/l,dy/l]};
PC.world=mouseWorld;globalThis.PC16=SH.PC16=PC;

/* =========================== 2) NHÀ AN TOÀN CỦA BOT =========================== */
const CFG={on:true,n:5,max:49,nearR:140,farTick:1,showLog:false};
const HS={lv:[null,{k:'house1',w:8,mhp:200},{k:'house5',w:9,mhp:350},{k:'house2',w:10,mhp:550}],up:[null,{wood:20,stone:8},{wood:40,stone:20}],store:60};
let HOUSES=[];// {id,owner,x,y(chân nhà),lv,hp,mhp,store:{wood,stone,eat},col}
function hRect0(h,m=0){const w=HS.lv[Math.min(3,h.lv)].w/2;return[h.x-w-m,h.y-3.2-m,h.x+w+m,h.y+m]}// công thức cũ – CHỈ dùng cho vùng cấm sinh vật thể W15.RES (giữ thế giới y hệt)
function hRect(h,m=0){return globalThis.NHA?NHA.botRect(h,m):hRect0(h,m)}
const MHP=l=>globalThis.NHA?NHA.LV[l].mhp:HS.lv[l].mhp;
function hDoor(h){return globalThis.NHA?NHA.botDoor(h):[h.x,h.y+1.3]}
function hCol(h){if(h.col){const i=SH.cols.indexOf(h.col);if(i>=0)SH.cols.splice(i,1)}const r=hRect(h);h.col={x0:r[0],x1:r[2],z0:r[1],z1:r[3],b16:1};SH.cols.push(h.col);SH.colsDirty()}
function rs(seed){let s=seed|0;return()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const isDeep=(x,y)=>(W15&&W15.depthAt(x,y)>1.2)||(SH.deepAt&&SH.deepAt(x,y,.2));
const wet=(x,y,m)=>{for(const[a,b]of[[0,0],[m,0],[-m,0],[0,m],[0,-m]]){if(W15&&W15.depthAt(x+a,y+b)>0)return true;if(SH.inLk&&SH.inLk(x+a,y+b,0))return true}return false};
const hit=(x,y,m)=>W15?W15.colHit(x,y,m):false;
/* lưới va chạm riêng cho việc chọn chỗ đặt nhà: chỉ dùng vật cản của bản đồ gốc (bỏ vật cản phụ chỉ có ở 2.5D / chunk) → kết quả giống nhau ở 2D và 2.5D */
let SG=null;function sgBuild(){SG=new Map();for(const c of SH.cols){if(c.v25||c.w15||c.b16)continue;if(c.x1-c.x0>400||c.z1-c.z0>400)continue;for(let I=Math.floor(c.x0/8);I<=Math.floor(c.x1/8);I++)for(let J=Math.floor(c.z0/8);J<=Math.floor(c.z1/8);J++){const k=I*65536+J;let L=SG.get(k);if(!L)SG.set(k,L=[]);L.push(c)}}}
function sHit(x,y,m){const L=SG.get(Math.floor(x/8)*65536+Math.floor(y/8));if(!L)return false;for(const c of L)if(x>c.x0-m&&x<c.x1+m&&y>c.z0-m&&y<c.z1+m)return true;return false}
function v25Hit(x,y,w){const T=SH.V25&&SH.V25.T15;if(!T)return false;const R=[].concat(T.ROADS||[],T.PLAN||[],T.STORES||[],T.HOUSE2||[],T.GAS||[]);
 for(const q of R){const r=q.rect||q;if(r.x0==null)continue;if(x+w+3>r.x0&&x-w-3<r.x1&&y+5>r.y0&&y-4-3<r.y1)return true}return false}
function siteOK(x,y,lv=1){const w=HS.lv[lv].w/2+1;const W=SH.WB;if(x<W.x0+30||x>W.x1-10||y<W.y0+30||y>W.y1-30)return false;if(x>200)return false;
 if(hyp(x,y-7)<70)return false;// không lấn căn cứ người chơi (nhà gỗ + vòm bảo vệ + sân)
 for(let gx=x-w;gx<=x+w;gx+=1)for(let gy=y-4;gy<=y+2.5;gy+=1){if(sHit(gx,gy,.2))return false}
 if(wet(x,y-2,14))return false;if(SH.pathD&&SH.pathD(x,y-1.5,12)<w+3)return false;// không đè đường mòn quan trọng
 for(const b of SH.blds)if(x>b.x0-w-3&&x<b.x1+w+3&&y>b.y0-4&&y<b.y1+5)return false;
 if(v25Hit(x,y,w))return false;// công trình & đường phố chỉ hiện ở 2.5D: vẫn tránh ở cả 2 chế độ
 for(const z of SH.ZN)for(const l of z.loc||[])if(hyp(l.x-x,l.y-y)<14)return false;
 for(const t of SH.trees)if(t.giant&&hyp(t.x-x,t.y-y)<w+5)return false;
 if(SH.LAKES)for(const l of SH.LAKES)if(hyp(l.x-x,l.y-y)<l.r+12)return false;
 return true}
function siteWhy(x,y,lv=1){const w=HS.lv[lv].w/2+1;const W=SH.WB;if(x<W.x0+30||x>W.x1-10||y<W.y0+30||y>W.y1-30)return 'r1';if(x>200)return 'r2';
 if(hyp(x,y-7)<70)return 'r3';// không lấn căn cứ người chơi (nhà gỗ + vòm bảo vệ + sân)
 for(let gx=x-w;gx<=x+w;gx+=1)for(let gy=y-4;gy<=y+2.5;gy+=1){if(sHit(gx,gy,.2))return 'r4'}
 if(wet(x,y-2,14))return 'r5';if(SH.pathD&&SH.pathD(x,y-1.5,12)<w+3)return 'r6';// không đè đường mòn quan trọng
 for(const b of SH.blds)if(x>b.x0-w-3&&x<b.x1+w+3&&y>b.y0-4&&y<b.y1+5)return 'r7';
 if(v25Hit(x,y,w))return 'r7b';
 for(const z of SH.ZN)for(const l of z.loc||[])if(hyp(l.x-x,l.y-y)<14)return 'r8';
 for(const t of SH.trees)if(t.giant&&hyp(t.x-x,t.y-y)<w+5)return 'r9';
 if(SH.LAKES)for(const l of SH.LAKES)if(hyp(l.x-x,l.y-y)<l.r+12)return 'r10';
 return 'ok'}
function genHouses(){const L=W15&&W15.M3&&W15.M3.houses;if(L&&L.length===5)return{list:L.map(h=>({id:h.id,x:h.at[0],y:h.at[1]+1.6,reg:h.n})),tries:0,v2:true};// V2 mục 3: toạ độ cố định (tâm ô 14×14 m; y = chân nhà)
 sgBuild();GEN=true;try{return genH()}finally{GEN=false}}
function genH(){const seed=(+String(WORLD.seed||20261102).replace(/\D/g,'')||20261102)^0x5AFE16,R=rs(seed),Z=n=>SH.ZN.find(z=>z.n==n).r;
 const regs=[{n:'Làng Phong Dư',r:Z('Làng Phong Dư'),m:8,alt:{n:'Ven Làng Phong Dư (mở rộng, sát rìa tây làng)',r:[-470,-70,-322,60],m:4}},{n:'Hồ Ánh Nguyệt',r:Z('Hồ Ánh Nguyệt'),m:10,alt:{n:'Ven Hồ Ánh Nguyệt (mở rộng)',r:[-140,-330,120,-205],m:4}}];
 // hai khu không đủ chỗ cho 5 nhà cách nhau ≥300 m → mở rộng sang đất hợp lệ lân cận (vùng mới quanh hai khu), KHÔNG giảm khoảng cách
 const out=[],far=(x,y)=>out.every(h=>hyp(h.x-x,h.y-y)>=300);let tries=0;
 // mỗi khu lấy ngẫu nhiên các vị trí hợp lệ, rồi chọn ngẫu nhiên 1 cặp (Làng, Hồ) cách nhau ≥300 m
 const samp=g=>{const L=[];for(let k=0;k<20000&&L.length<80;k++){tries++;const x=g.r[0]+g.m+R()*(g.r[2]-g.r[0]-2*g.m),y=g.r[1]+g.m+4+R()*(g.r[3]-g.r[1]-2*g.m-4);if(siteOK(x,y))L.push({x,y,reg:g.n})}return L};
 const C=regs.map(g=>{const L=samp(g);return L.length?L:samp(g.alt)});// khu kín chỗ (vd Làng Phong Dư dày nhà & đường) → lấy đất trống sát rìa khu
 const pairs=[];for(const a of C[0])for(const b of C[1])if(hyp(a.x-b.x,a.y-b.y)>=300)pairs.push([a,b]);
 for(let k=0;k<pairs.length*2&&out.length<2;k++){const pr=pairs[(R()*pairs.length)|0];if(reach(pr[0].x,pr[0].y)&&reach(pr[1].x,pr[1].y)){out.push(pr[0],pr[1])}}
 if(out.length<2){for(const L of C)for(const q of L)if(out.length<2&&far(q.x,q.y)&&reach(q.x,q.y)){out.push(q);break}}
 let rad=420;while(out.length<5&&rad<1600){for(let k=0;k<4000&&out.length<5;k++){tries++;const a=R()*Math.PI*2,d=rad*(.55+R()*.45),cx=-170,cy=0,x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;
  if(W15&&!W15.inOld(x,y,-1)&&far(x,y)&&siteOK(x,y)&&reach(x,y))out.push({x,y,reg:'Vùng lân cận (mở rộng)'})}rad+=200}
 return{list:out.slice(0,5),tries}}
/* lối tiếp cận hợp lệ: từ cửa nhà tìm được đường đi (A*) ra xa ≥60 m */
function reach(x,y){const d=[x,y+1.3];if(sHit(d[0],d[1],.4))return false;const p=astar(d[0],d[1],d[0]+(x<-170?60:-60),d[1]+(y<0?40:-40),9000,true);return!!p}

/* =========================== 3) TÌM ĐƯỜNG A* (lưới 2 m, giới hạn vùng) =========================== */
const CELL=2;
let GEN=false;function blk(x,y){const W=SH.WB;if(x<W.x0+1||x>W.x1-1||y<W.y0+1||y>W.y1-1||x>INT_X0)return true;if(W15&&W15.inLocked&&W15.inLocked(x,y))return true;return(GEN?sHit(x,y,.45):hit(x,y,.45))||isDeep(x,y)}
function astar(sx,sy,gx,gy,maxN=60000,loose){const pad=50,x0=Math.min(sx,gx)-pad,y0=Math.min(sy,gy)-pad,x1=Math.max(sx,gx)+pad,y1=Math.max(sy,gy)+pad;
 const NX=Math.min(500,Math.ceil((x1-x0)/CELL)),NY=Math.min(500,Math.ceil((y1-y0)/CELL)),N=NX*NY;const ci=(x,y)=>{const i=Math.floor((x-x0)/CELL),j=Math.floor((y-y0)/CELL);return i<0||j<0||i>=NX||j>=NY?-1:j*NX+i};
 const B=new Int8Array(N).fill(-1),G=new Float32Array(N).fill(1e9),P=new Int32Array(N).fill(-1),C=new Uint8Array(N);const bk=i=>{if(B[i]<0){const x=x0+(i%NX+.5)*CELL,y=y0+((i/NX|0)+.5)*CELL;B[i]=blk(x,y)?1:0}return B[i]};
 let s=ci(sx,sy),g=ci(gx,gy);if(s<0||g<0)return null;if(bk(g)){let best=-1,bd=1e9;for(let r=1;r<6&&best<0;r++)for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++){const i=(g%NX)+a,j=(g/NX|0)+b;if(i<0||j<0||i>=NX||j>=NY)continue;const q=j*NX+i;if(!bk(q)){const dd=a*a+b*b;if(dd<bd){bd=dd;best=q}}}if(best<0)return null;g=best}
 B[s]=0;const H=[],hx=g%NX,hy=g/NX|0,h=i=>{const dx=Math.abs(i%NX-hx),dy=Math.abs((i/NX|0)-hy);return(dx+dy+(1.414-2)*Math.min(dx,dy))};
 const push=(i,f)=>{H.push([f,i]);let k=H.length-1;while(k>0){const p=(k-1)>>1;if(H[p][0]<=H[k][0])break;[H[p],H[k]]=[H[k],H[p]];k=p}},pop=()=>{const t=H[0],e=H.pop();if(H.length){H[0]=e;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<H.length&&H[l][0]<H[m][0])m=l;if(r<H.length&&H[r][0]<H[m][0])m=r;if(m===k)break;[H[m],H[k]]=[H[k],H[m]];k=m}}return t};
 G[s]=0;push(s,h(s));let n=0,ok=false;const D=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
 while(H.length&&n<maxN){const[,i]=pop();if(C[i])continue;C[i]=1;n++;if(i===g){ok=true;break}const ix=i%NX,iy=i/NX|0;
  for(const[dx,dy,c]of D){const jx=ix+dx,jy=iy+dy;if(jx<0||jy<0||jx>=NX||jy>=NY)continue;const j=jy*NX+jx;if(C[j]||bk(j))continue;if(dx&&dy&&(bk(iy*NX+jx)||bk(jy*NX+ix)))continue;const ng=G[i]+c;if(ng<G[j]){G[j]=ng;P[j]=i;push(j,ng+h(j))}}}
 ST.astar++;ST.nodes+=n;if(!ok)return loose&&n>=maxN?[]:null;const path=[];for(let i=g;i>=0&&i!==s;i=P[i])path.push([x0+(i%NX+.5)*CELL,y0+((i/NX|0)+.5)*CELL]);path.reverse();
 // rút gọn: bỏ điểm thẳng hàng
 const out=[];for(let k=0;k<path.length;k++){if(k>0&&k<path.length-1){const a=path[k-1],b=path[k],c=path[k+1];if(Math.abs((b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]))<1e-6)continue}out.push(path[k])}return out}
const ST={astar:0,nodes:0,ticks:0,near:0,far:0,ms:0};

/* =========================== 4) BOT SINH TỒN =========================== */
const PERS=[{n:'Thận trọng',ic:'🛡',flee:65,hunt:0,rest:55,explore:.15,build:.3},{n:'Hiếu chiến',ic:'⚔️',flee:25,hunt:22,rest:30,explore:.2,build:.2},{n:'Xây dựng',ic:'🔨',flee:45,hunt:0,rest:40,explore:.1,build:.7},
 {n:'Thám hiểm',ic:'🧭',flee:45,hunt:6,rest:40,explore:.6,build:.15},{n:'Thân thiện',ic:'🤝',flee:55,hunt:0,rest:45,explore:.25,build:.35}];
const NAMES=['An','Bình','Châu','Dũng','Giang','Hà','Khôi','Lam','Minh','Ngân','Phúc','Quân','Sơn','Thảo','Uyên','Vy','Xuân','Yến'];
let BOTS=[];
function mkBot(i){const h=HOUSES[i]||null,d=h?hDoor(h):[pos.x+8,pos.y+8];const ch=Object.keys(SH.SETS);
 return{id:'bot'+(i+1),testBot:true,n:'Bot '+NAMES[i%NAMES.length]+(i>=NAMES.length?' '+(i+1):''),p:i%5,c:ch[i%ch.length],x:d[0],y:d[1]+.4,hp:100,mhp:100,food:100,water:100,sta:100,lives:3,dead:0,
  inv:{wood:3,stone:0,eat:1,berry:0,botE:2,botD:0,botB:0},axe:false,pick:false,home:h?h.id:null,inside:false,mode:'idle',goal:null,path:null,pi:0,repath:0,cd:0,hurtBy:0,hurtT:-1e9,db:0,dbN:0,stuck:0,lx:0,ly:0,fx:1,tk:0,msg:''}}
const BOTH=b=>HOUSES.find(h=>h.id===b.home);
function say(b,m){b.msg=m;if(CFG.showLog)console.log('[bot]',b.n,m)}
function setGoal(b,mode,x,y,ref){b.mode=mode;b.goal={x,y,ref};b.path=null;b.pi=0;b.repath=0;b.route=null;b.rtried=0}
let RG=null;function rgBuild(){const M=W15&&W15.M3;if(!M)return null;const N=[],E=[],idx=new Map(),key=p=>Math.round(p[0])+','+Math.round(p[1]);
 const node=p=>{const k=key(p);let i=idx.get(k);if(i==null){i=N.length;N.push([p[0],p[1]]);idx.set(k,i);E.push([])}return i};
 for(const r of M.RD.map(r=>r.p).concat(M.links.map(l=>l.p))){let prev=node(r[0]);for(let s=1;s<r.length;s++){const a=r[s-1],b=r[s],L=hyp(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/90));
  for(let k=1;k<=n;k++){const j=node([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]),d=hyp(N[j][0]-N[prev][0],N[j][1]-N[prev][1]);E[prev].push([j,d]);E[j].push([prev,d]);prev=j}}}
 const C=new Int32Array(N.length).fill(-1);let nc=0;for(let i=0;i<N.length;i++){if(C[i]>=0)continue;const st=[i];C[i]=nc;while(st.length){const u=st.pop();for(const[v]of E[u])if(C[v]<0){C[v]=nc;st.push(v)}}nc++}
 return RG={N,E,C,nc}}
function roadRoute(sx,sy,gx,gy){const G=RG||rgBuild();if(!G||!G.N.length)return null;// đoạn thẳng giữa điểm đầu/cuối và nút đường không được cắt sông sâu / khu khóa (chỉ qua sông bằng cầu)
 const cross=(x0,y0,x1,y1)=>{const L=hyp(x1-x0,y1-y0),n=Math.ceil(L/4);for(let k=1;k<n;k++){const x=x0+(x1-x0)*k/n,y=y0+(y1-y0)*k/n;if((W15&&W15.depthAt(x,y)>1.2)||(W15&&W15.inLocked(x,y)))return true}return false};
 const near=(x,y,c)=>{const L=[];for(let i=0;i<G.N.length;i++)if(G.C[i]===c)L.push([i,hyp(G.N[i][0]-x,G.N[i][1]-y)]);L.sort((a,b)=>a[1]-b[1]);if(!L.length)return[-1,1e9];
  for(let k=0;k<Math.min(L.length,40);k++){const[i,d]=L[k];if(!cross(x,y,G.N[i][0],G.N[i][1]))return[i,d]}return[L[0][0],L[0][1]+5000]};
 let s=-1,g=-1,ds=0,dg=0;for(let c=0;c<G.nc;c++){const A=near(sx,sy,c),B=near(gx,gy,c);if(A[0]<0||B[0]<0)continue;if(s<0||A[1]+B[1]<ds+dg){s=A[0];ds=A[1];g=B[0];dg=B[1]}}// chọn cụm đường liền mạch gần cả 2 đầu nhất
 const direct=hyp(gx-sx,gy-sy);if(s<0||g<0||s===g||ds+dg>direct*.9)return null;
 const n=G.N.length,D=new Float64Array(n).fill(1e18),Pv=new Int32Array(n).fill(-1),done=new Uint8Array(n);D[s]=0;
 for(;;){let u=-1,bu=1e18;for(let i=0;i<n;i++)if(!done[i]&&D[i]<bu){bu=D[i];u=i}if(u<0||u===g)break;done[u]=1;for(const[v,w]of G.E[u])if(D[u]+w<D[v]){D[v]=D[u]+w;Pv[v]=u}}
 if(D[g]>=1e18)return null;const out=[];for(let v=g;v>=0;v=Pv[v])out.push(G.N[v].slice());out.reverse();out.push([gx,gy]);
 // chặng dài ngoài đường (từ điểm đầu tới nút đầu tiên, nút cuối tới đích) chia nhỏ ≤250 m → nằm trong khung A* của bot
 const R=[];let px=sx,py=sy;for(let qi=0;qi<out.length;qi++){const q=out[qi],L=hyp(q[0]-px,q[1]-py);if(L<1.5&&qi<out.length-1)continue;const n=Math.ceil(L/250);for(let k=1;k<n;k++)R.push([px+(q[0]-px)*k/n,py+(q[1]-py)*k/n]);R.push(q);px=q[0];py=q[1]}return R}
const nearest=(arr,b,f,maxD)=>{let best=null,bd=maxD*maxD;for(const o of arr){if(!f(o))continue;const x=o.x??o[1],y=o.y??o[2],d=(x-b.x)**2+(y-b.y)**2;if(d<bd){bd=d;best=o}}return best};
function waterSpot(b){// điểm nước nông gần nhất (bờ sông/hồ vùng mới hoặc hồ cũ)
 let best=null,bd=1e9;for(let r=6;r<=180&&!best;r+=12)for(let a=0;a<16;a++){const x=b.x+Math.cos(a/16*6.283)*r,y=b.y+Math.sin(a/16*6.283)*r;const d=W15?W15.depthAt(x,y):0;if((d>0&&d<=.9)||(SH.lkDist&&SH.lkDist(x,y)<1.5&&!isDeep(x,y))){if(!blk(x,y)){best=[x,y];break}}}return best}
function decide(b,dt){const P=PERS[b.p],H=BOTH(b),night=S.h>=22||S.h<6,zs=SH.ens;
 // bị người chơi đánh → phòng vệ theo tính cách (không bao giờ chủ động PvP)
 if(performance.now()-b.hurtT<20000&&b.hurtBy){if(b.p===1&&b.hp>40){if(b.mode!=='pvp'){b.mode='pvp';say(b,'⚔️ Phản công người chơi đã tấn công mình')}return}if(b.mode!=='flee'){const a=Math.atan2(b.y-pos.y,b.x-pos.x);setGoal(b,'flee',b.x+Math.cos(a)*40,b.y+Math.sin(a)*40);say(b,'🏃 Rút lui khỏi người chơi')}return}
 if(b.mode==='pvp')b.mode='idle';
 // quái gần
 const z=nearest(zs,b,e=>e.hp>0,P.hunt||5);if(z){const dz=hyp(z.x-b.x,z.y-b.y);if(b.hp<P.flee&&dz<8){if(b.mode!=='flee'){const a=Math.atan2(b.y-z.y,b.x-z.x);setGoal(b,'flee',b.x+Math.cos(a)*30,b.y+Math.sin(a)*30);say(b,'🏃 Né quái (máu thấp)')}return}
  if(b.mode!=='fight'){b.mode='fight';b.target=z;say(b,'⚔️ Đánh quái')}b.target=z;return}
 if(b.mode==='fight')b.mode='idle';if(b.mode==='flee'&&b.goal&&hyp(b.goal.x-b.x,b.goal.y-b.y)>3)return;
 if(b.inside){// trong nhà: nghỉ, cất đồ, sửa, nâng cấp, chế tạo, đun nước
  houseWork(b,H);if(b.hp>=b.mhp*.95&&b.sta>=95&&!(night&&b.p!==1)&&b.food>25&&b.water>25)leave(b);return}
 const goHome=H&&(b.hp<P.rest||b.sta<12||(night&&b.p!==1)||b.inv.wood+b.inv.stone>=18||(!b.axe&&b.inv.wood>=5)||(b.inv.botD>0&&b.inv.botB===0&&b.water<55&&b.inv.wood>=1));
 if(b.water<35){if(b.inv.botB>0){b.inv.botB--;b.inv.botE++;b.water=Math.min(100,b.water+50);say(b,'💧 Uống nước đun sôi')}else if(b.water<15&&b.inv.botD>0){b.inv.botD--;b.inv.botE++;b.water=Math.min(100,b.water+50);poison(b);say(b,'🤢 Khát quá, uống nước chưa đun')}
  else if(!goHome||b.inv.botD===0){if(b.mode!=='water'){const w=waterSpot(b);if(w){setGoal(b,'water',w[0],w[1]);say(b,'🚰 Đi lấy nước')}}return}}
 if(b.food<35){if(b.inv.eat>0){b.inv.eat--;b.food=Math.min(100,b.food+40);say(b,'🥫 Ăn đồ hộp')}else if(b.inv.berry>0){b.inv.berry--;b.food=Math.min(100,b.food+18);say(b,'🍎 Ăn quả')}
  else if(b.mode!=='food'){const it=nearest(SH.items,b,o=>o.on&&(o.t==='b'||o.t==='c'),260);if(it){setGoal(b,'food',it.x,it.y,it);say(b,'🍎 Đi tìm thức ăn')}}if(b.mode==='food')return}
 if(goHome){if(b.mode!=='home'){const d=hDoor(H);setGoal(b,'home',d[0],d[1]);say(b,'🏠 Về nhà')}return}
 if(b.mode!=='idle'&&b.goal)return;
 // săn quái (hiếu chiến)
 if(P.hunt>6){const zz=nearest(zs,b,e=>e.hp>0&&e.t!=='b',P.hunt*3);if(zz){setGoal(b,'hunt',zz.x,zz.y,zz);say(b,'🎯 Săn quái');return}}
 // thu thập
 if(b.axe&&Math.random()<.6+P.build*.4){const t=nearest(SH.trees,b,o=>!o.giant&&o.hp>0&&!o.dead,120);if(t){setGoal(b,'chop',t.x,t.y+.8,t);say(b,'🪓 Đi chặt cây');return}}
 const it=nearest(SH.items,b,o=>o.on&&(o.t==='w'||o.t==='s'||(o.t==='b'&&b.food<80)),b.axe?90:400);if(it){setGoal(b,'pick',it.x,it.y,it);say(b,'🪵 Nhặt '+({w:'gỗ',s:'đá',b:'quả'}[it.t]));return}
 // khám phá
 const R0=H?hDoor(H):[b.x,b.y],rr=60+P.explore*500,a=Math.random()*6.283;let tx=R0[0]+Math.cos(a)*rr,ty=R0[1]+Math.sin(a)*rr;const W=SH.WB;tx=clamp(tx,W.x0+20,W.x1-20);ty=clamp(ty,W.y0+20,W.y1-20);
 if(!blk(tx,ty)){setGoal(b,'explore',tx,ty);say(b,'🧭 Khám phá')}}
function poison(b){if(b.db>0)return;b.db=10;b.dbN=0}// cùng luật người chơi: 10 giây, mỗi giây −2 máu −5 thể lực
function leave(b){const H=BOTH(b),d=hDoor(H);b.inside=false;b.x=d[0];b.y=d[1]+.6;b.mode='idle';b.goal=null;say(b,'🚪 Ra khỏi nhà')}
function enter(b){b.inside=true;b.mode='rest';b.goal=null;b.path=null;say(b,'🏠 Vào nhà nghỉ ngơi')}
function houseWork(b,H){if(!H)return;const st=H.store,cap=HS.store;
 for(const k of['wood','stone']){const keep=k==='wood'?6:0,m=Math.max(0,b.inv[k]-keep),room=cap-st[k],n=Math.min(m,room);if(n>0){b.inv[k]-=n;st[k]+=n;say(b,'📦 Cất '+n+(k==='wood'?' gỗ':' đá'))}}
 const all=k=>st[k]+b.inv[k],take=(k,n)=>{const a=Math.min(n,st[k]);st[k]-=a;b.inv[k]-=n-a};
 if(!b.axe&&all('wood')>=5){take('wood',5);b.axe=true;say(b,'🪓 Chế tạo rìu (5 gỗ)')}
 if(b.inv.botD>0&&all('wood')>=1){const n=Math.min(b.inv.botD,all('wood'));take('wood',Math.ceil(n/2));b.inv.botD-=n;b.inv.botB+=n;say(b,'🔥 Đun sôi '+n+' chai nước')}
 if(H.hp<H.mhp&&all('wood')>=1){const need=Math.ceil((H.mhp-H.hp)/10),n=Math.min(need,all('wood'));take('wood',n);H.hp=Math.min(H.mhp,H.hp+n*10);say(b,'🔧 Sửa nhà +'+n*10+' HP ('+n+' gỗ)')}
 if(globalThis.NHA){const up=NHA.botCost(H);if(up&&PERS[b.p].build>.25&&all('wood')>=up.wood+3&&all('stone')>=up.stone){if(NHA.botTry(H,{have:all,take}))say(b,'⬆️ Nâng cấp nhà lên cấp '+H.lv);else if(!H.noSp){H.noSp=1;say(b,'⛔ Không đủ chỗ nâng cấp nhà')}}return}
 const up=HS.up[H.lv];if(up&&PERS[b.p].build>.25&&all('wood')>=up.wood+3&&all('stone')>=up.stone){take('wood',up.wood);take('stone',up.stone);H.lv++;H.mhp=HS.lv[H.lv].mhp;H.hp=H.mhp;hCol(H);say(b,'⬆️ Nâng cấp nhà lên cấp '+H.lv)}}
function step(b,dt,detail){// di chuyển theo đường A*, va chạm từng trục, tốc độ theo độ sâu nước
 if(!b.goal)return;if(!b.path&&b.repath<=0){if(ST.frameA){return}ST.frameA=1;
  if(!b.route&&!b.rtried&&hyp(b.goal.x-b.x,b.goal.y-b.y)>220){b.rtried=1;b.route=roadRoute(b.x,b.y,b.goal.x,b.goal.y)}// đi xa → theo mạng đường
  const tg=b.route&&b.route.length?b.route[0]:[b.goal.x,b.goal.y];
  if(hyp(tg[0]-b.x,tg[1]-b.y)<2.5){if(b.route&&b.route.length>1){b.route.shift();return}b.route=null;arrive(b);return}// điểm chặng trùng chỗ đang đứng → bỏ qua
  const p=astar(b.x,b.y,tg[0],tg[1],detail?60000:25000);if(!p||!p.length){b.repath=4;b.goal=null;b.mode='idle';b.route=null;b.rtried=0;return}if(b.route&&b.route.length)b.route.shift();b.path=p;b.pi=0}if(!b.path){b.repath-=dt;return}
 let wp=b.path[b.pi];if(!wp){if(b.route&&b.route.length){b.path=null;b.repath=0;return}arrive(b);return}let dx=wp[0]-b.x,dy=wp[1]-b.y,d=hyp(dx,dy);if(d<.6){b.pi++;wp=b.path[b.pi];if(!wp){if(b.route&&b.route.length){b.path=null;b.repath=0;return}arrive(b);return}dx=wp[0]-b.x;dy=wp[1]-b.y;d=hyp(dx,dy)}
 const run=b.mode==='flee'&&b.sta>5,dep=W15?W15.depthAt(b.x,b.y):0,k=dep>1.2?.5:dep>.5?.6:dep>.06?.85:1,sp=(run?6.5:4)*k,s=Math.min(d,sp*dt),ux=dx/d,uy=dy/d;
 const nx=b.x+ux*s,ny=b.y+uy*s;let moved=false;if(!blk(nx,b.y)){b.x=nx;moved=true}if(!blk(b.x,ny)){b.y=ny;moved=true}if(Math.abs(ux)>.2)b.fx=ux>0?1:-1;b.mv=moved;b.run=run;
 if(run)b.sta=Math.max(0,b.sta-24*dt);
 if(!moved){b.stuck+=dt;if(b.stuck>1.5){b.stuck=0;b.path=null;b.repath=0}}else b.stuck=0}
function arrive(b){const g=b.goal,m=b.mode;b.path=null;
 if(m==='home'){const H=BOTH(b);if(H&&hyp(b.x-hDoor(H)[0],b.y-hDoor(H)[1])<2.5){enter(b);return}}
 else if(m==='water'){const n=Math.min(b.inv.botE,3);b.inv.botE-=n;b.inv.botD+=n;b.water=Math.min(100,b.water+(b.water<20?35:0));if(b.water<55&&b.water>=20){}say(b,'🚰 Lấy '+n+' chai nước chưa đun'+(b.water>=20?'':' · uống tạm'));if(b.water<20)poison(b)}
 else if(m==='pick'||m==='food'){const it=g.ref;if(it&&it.on&&hyp(it.x-b.x,it.y-b.y)<2.2){takeItem(b,it)}}
 b.goal=null;b.mode='idle'}
/* nhặt vật phẩm thế giới theo đúng quy tắc hồi sinh của vật phẩm đó (người chơi cũng thấy vật phẩm biến mất) */
function takeItem(b,it){const t=it.t;if(t==='w'){b.inv.wood++;say(b,'🪵 +1 gỗ')}else if(t==='s'){b.inv.stone++;say(b,'🪨 +1 đá')}else if(t==='b'){b.inv.berry+=1;say(b,'🍎 +1 quả')}else if(t==='c'){b.inv.eat+=2;say(b,'🥫 +2 đồ hộp')}else return;
 it.on=false;it.pt=Date.now();const rs=it.rs||30000;clearTimeout(it._tm);it._tm=setTimeout(()=>{const r=it.reg;if(r){for(let k=0;k<30;k++){const x=r[0]+Math.random()*(r[2]-r[0]),y=r[1]+Math.random()*(r[3]-r[1]);if(!hit(x,y,.5)){it.x=x;it.y=y;break}}}it.on=true},rs);
 try{WORLD.emit('item.pick',{id:it.id,by:b.id,testBot:true})}catch(_){}}
function combat(b,dt){b.cd-=dt;const z=b.target;if(b.mode==='fight'&&z){if(!SH.ens.includes(z)||z.hp<=0){b.target=null;b.mode='idle';return}const d=hyp(z.x-b.x,z.y-b.y);
  if(d>1.6){if(!b.path||b.repath<=0){b.goal={x:z.x,y:z.y};b.path=[[z.x,z.y]];b.pi=0}}else{b.path=null;if(b.cd<=0){b.cd=.6;const dm=b.axe?12:7;z.hp-=dm;z.kb=.12;const l=d||1;z.kx=(z.x-b.x)/l;z.ky=(z.y-b.y)/l;if(z.hp<=0){const i=SH.ens.indexOf(z);if(i>=0)SH.ens.splice(i,1);if(z.t!=='n'&&!z.dg)WORLD.killed(z);b.kills=(b.kills||0)+1;b.target=null;b.mode='idle';say(b,'💀 Hạ được quái')}}}}
 if(b.mode==='pvp'){const d=hyp(pos.x-b.x,pos.y-b.y);if(d>1.4){b.goal={x:pos.x,y:pos.y};b.path=[[pos.x,pos.y]];b.pi=0}else if(b.cd<=0&&!S.dead){b.cd=1;const dm=6;S.hp-=dm;try{SH.FL.push({x:pos.x,y:pos.y,v:'-'+dm,c:'#ffb14a',t0:performance.now()})}catch(_){}}}
 // quái đánh bot (cùng sát thương như với người chơi; quái chỉ đánh khi chạm)
 for(const e of SH.ens){if(Math.abs(e.x-b.x)>2||Math.abs(e.y-b.y)>2)continue;const d=hyp(e.x-b.x,e.y-b.y);if(d<1.3&&e.cd<=0&&e.kb<=0){const dm=(e.t==='n'?50:e.t==='b'?18:8)*(SH.EM?SH.EM():1);b.hp-=dm;e.cd=1;say(b,'🩸 Bị quái đánh −'+Math.round(dm))}
  else if(d<5&&hyp(e.x-pos.x,e.y-pos.y)>6){e.wx=b.x;e.wy=b.y;e.wt=1}}}// quái ở gần bot (không bận đuổi người chơi) chuyển mục tiêu đi lang thang về phía bot
function survive(b,dt){const H=BOTH(b);b.food=Math.max(0,b.food-.3*dt);b.water=Math.max(0,b.water-.45*dt);
 if(b.food<=0||b.water<=0)b.hp-=1.5*dt;else if(b.food>40&&b.water>40)b.hp=Math.min(b.mhp,b.hp+(b.inside?1.6:.8)*dt);
 if(!b.run)b.sta=Math.min(100,b.sta+(b.inside?20:14)*dt);
 if(b.db>0){b.db=Math.max(0,b.db-dt);const n=Math.min(10,Math.floor(10-b.db+1e-6));while(b.dbN<n){b.dbN++;b.hp-=2;b.sta=Math.max(0,b.sta-5)}if(b.db<=0)b.dbN=0}
 // chặt cây khi đứng cạnh (cùng luật: cần rìu, cây không phải cổ thụ, hồi sau 168 giờ)
 if(b.mode==='chop'&&b.goal&&b.goal.ref){const t=b.goal.ref;if(t.hp<=0){b.mode='idle';b.goal=null}else if(hyp(t.x-b.x,t.y-b.y)<2.3){b.path=null;b.cd-=0;if((b.ct=(b.ct||0)-dt)<=0){b.ct=.55;t.hp-=1;if(t.hp<=0){t.c.on=false;t.t0=SH.GT;SH.felled.push(t);try{WORLD.emit('tree.fell',{id:t.id,by:b.id})}catch(_){}b.inv.wood+=2;b.mode='idle';b.goal=null;say(b,'🌲 Cây đổ +2 gỗ')}}}}
 if(b.hp<=0)die(b)}
function die(b){b.lives--;b.dead=1;b.inside=false;b.mode='dead';b.goal=null;b.path=null;b.deadT=performance.now();say(b,b.lives>0?'☠ Gục ngã – còn '+b.lives+' mạng':'☠ Hết mạng – nhân vật kết thúc');
 b.inv={wood:0,stone:0,eat:0,berry:0,botE:2,botD:0,botB:0}}
function revive(b){const H=BOTH(b);const d=H?hDoor(H):[b.x,b.y];Object.assign(b,{dead:0,hp:100,food:80,water:80,sta:100,x:d[0],y:d[1]+.5,mode:'idle',db:0});say(b,'✨ Hồi sinh tại nhà')}
/* người chơi tấn công bot → bot phòng vệ (chỉ khi bị đánh trước) */
{const o=F5.attack;F5.attack=(...a)=>{try{if(S.on&&!S.dead){const fx=SH.X.fvx,fy=SH.X.fvy,dmg=+(SH.X.hit&&SH.X.hit())||8;for(const b of BOTS){if(b.dead||b.inside)continue;const dx=b.x-pos.x,dy=b.y-pos.y,d=hyp(dx,dy)||1;if(d<2.4&&dx*fx+dy*fy>-.3*d){setTimeout(()=>{b.hp-=dmg;b.hurtBy='player';b.hurtT=performance.now();try{SH.FL.push({x:b.x,y:b.y,v:"-"+Math.round(dmg),c:"#ff6a6a",t0:performance.now()})}catch(_){}if(b.hp<=0)die(b)},180)}}}}catch(_){}return o?o(...a):false}}
/* vòng cập nhật: bot gần chạy chi tiết mỗi khung hình, bot xa mô phỏng 1 lần/giây */
let lastT=performance.now(),farAcc=0;
function tick(now){requestAnimationFrame(tick);const dt=Math.min(.25,(now-lastT)/1000);lastT=now;if(!CFG.on||!S.on||!created){hideAll();return}const t0=performance.now();ST.frameA=0;
 const OTH=SH.OTH;farAcc+=dt;const farStep=farAcc>=CFG.farTick;if(farStep)farAcc=0;let near=0,far=0;
 for(const b of BOTS.slice(0,CFG.n)){const nearP=hyp(b.x-pos.x,b.y-pos.y)<CFG.nearR;
  if(b.dead){if(b.lives>0&&now-b.deadT>30000)revive(b);putOTH(b);continue}
  if(nearP){near++;b.tk-=dt;if(b.tk<=0){b.tk=.5;decide(b,.5)}combat(b,dt);if(!b.inside)step(b,dt,true);survive(b,dt)}
  else if(farStep){far++;const d2=CFG.farTick;decide(b,d2);if(!b.inside){for(let k=0;k<4;k++)step(b,d2/4,false)}survive(b,d2)}
  putOTH(b)}
 for(let i=CFG.n;i<BOTS.length;i++)delete OTH[BOTS[i].id];
 ST.near=near;ST.far=far;ST.ms=ST.ms*.95+(performance.now()-t0)*.05}
function putOTH(b){const OTH=SH.OTH;let o=OTH[b.id];if(!o)o=OTH[b.id]={x:b.x,y:b.y,vx:0,vy:0};o.tx=b.x;o.ty=b.y;if(hyp(o.x-b.x,o.y-b.y)>6){o.x=b.x;o.y=b.y}
 o.n='🤖 '+b.n+' '+PERS[b.p].ic;o.c=b.c;o.fx=b.fx;o.m=!!b.mv&&!!b.goal;o.r=!!b.run;o.on=!b.dead&&!b.inside;o.testBot=true;o.bot=b.id}
function hideAll(){const OTH=SH.OTH;for(const b of BOTS)if(OTH[b.id])OTH[b.id].on=false}

/* =========================== 5) VẼ NHÀ BOT (2D + 2.5D) =========================== */
{const o=F5.draw2;F5.draw2=(L,Xf,Yf,cx,cy,vw,vh,t,g,Z)=>{o&&o(L,Xf,Yf,cx,cy,vw,vh,t,g,Z);if(!CFG.on)return;for(const h of HOUSES){const fy=globalThis.NHA?NHA.botVis(h).front:h.y;if(Math.abs(h.x-cx)>vw+8||fy<cy-vh-2||fy-12>cy+vh)continue;L.push([fy,()=>drawHouse(g,h,Xf,Yf,Z)])}}}
function drawHouse(g,h,X,Y,Z){const NV=globalThis.NHA?NHA.botVis(h):null,L=NV||HS.lv[h.lv],a=SH.AS[L.k];const w=L.w*Z,x=X(h.x),y=Y(NV?NV.front+.3:h.y);if(a&&a.i.complete&&a.i.naturalWidth){const hh=w*a.h/a.w;g.save();g.globalAlpha=.25;g.fillStyle='#000';g.beginPath();g.ellipse(x,y,w*.5,Z*.5,0,0,7);g.fill();g.globalAlpha=1;g.drawImage(a.i,x-w/2,y-hh,w,hh);g.restore()}
 else{g.fillStyle='#8a5a34';g.fillRect(x-w/2,y-Z*4,w,Z*4)}
 const b=BOTS.find(q=>q.id===h.owner);g.save();g.font='bold '+Math.round(Z*.32)+'px system-ui';g.textAlign='center';const s='🏠 Nhà của '+(b?b.n:h.owner)+' · cấp '+h.lv,tw=g.measureText(s).width+12;g.fillStyle='rgba(20,30,50,.78)';g.fillRect(x-tw/2,y+Z*.15,tw,Z*.46);g.fillStyle='#ffe6a8';g.fillText(s,x,y+Z*.5);
 const f=h.hp/h.mhp;g.fillStyle='rgba(0,0,0,.6)';g.fillRect(x-Z,y+Z*.68,Z*2,Z*.14);g.fillStyle=f>.5?'#4fd06a':f>.25?'#f0c030':'#e04040';g.fillRect(x-Z,y+Z*.68,Z*2*f,Z*.14);if(b&&b.inside){g.fillText('💤',x+w*.42,y-Z*1.2)}g.restore()}
const H3=new Map();
function upd3(){const V=SH.V25;if(!V||!V.on||!V.T15)return;if(globalThis.NHA&&NHA.bot3){for(const r of H3.values())r.m.parent&&r.m.parent.remove(r.m);H3.clear();return}/* N22: nhà bot 2.5D dựng 3D chung với nhà người chơi */const T=V.T15;for(const h of HOUSES){let r=H3.get(h.id);const NV=globalThis.NHA?NHA.botVis(h):null,k=NV?NV.k+'|'+NV.w.toFixed(2):HS.lv[h.lv].k;if(r&&r.k!==k){r.m.parent&&r.m.parent.remove(r.m);r=null}const near=CFG.on&&Math.abs(h.x-pos.x)<70&&Math.abs(h.y-pos.y)<60;
  if(!r&&near){const kk=NV?NV.k:k,tex=T.texK(kk);if(!tex)continue;const a=SH.AS[kk],w=NV?NV.w:HS.lv[h.lv].w;r={k,m:T.card(tex,w,w*a.h/a.w,h.x,NV?NV.front+.3:h.y,0)};H3.set(h.id,r)}if(r)r.m.visible=near}}
setInterval(upd3,250);

/* =========================== 6) BẬT/TẮT · SỐ LƯỢNG · LƯU =========================== */
function ensureBots(){while(BOTS.length<CFG.n)BOTS.push(mkBot(BOTS.length))}
function setupHouses(list){for(const h of HOUSES)if(h.col){const i=SH.cols.indexOf(h.col);if(i>=0)SH.cols.splice(i,1)}
 HOUSES=list.map((q,i)=>({id:q.id||'bh'+(i+1),owner:q.owner||'bot'+(i+1),x:q.x,y:q.y,reg:q.reg,lv:q.lv||1,ow:+q.ow||0,hp:q.hp??MHP(q.lv||1),mhp:MHP(q.lv||1),store:Object.assign({wood:0,stone:0,eat:0},q.store||{})}));
 for(const h of HOUSES)hCol(h);if(W15){{const keep=W15.RES.filter(r=>r.z21);W15.RES.length=0;W15.RES.push(...keep)}for(const h of HOUSES)W15.RES.push(hRect0(h,6))}SH.colsDirty()}
let created=false;
function init(){if(created)return;const g=genHouses();setupHouses(g.list);created=true;ensureBots();console.info('[B16] nhà bot',HOUSES.map(h=>h.reg+' '+h.x.toFixed(0)+','+h.y.toFixed(0)).join(' | '),'· thử',g.tries)}
SH.SAVE.register({id:'b16',scope:'world',version:1,defaults:()=>({}),
 get(){return{v:1,n22:1,on:CFG.on,n:CFG.n,houses:HOUSES.map(h=>({id:h.id,owner:h.owner,x:+h.x.toFixed(2),y:+h.y.toFixed(2),reg:h.reg,lv:h.lv,ow:h.ow||0,hp:Math.round(h.hp),store:h.store})),
  bots:BOTS.map(b=>({id:b.id,testBot:true,n:b.n,p:b.p,c:b.c,x:+b.x.toFixed(2),y:+b.y.toFixed(2),hp:Math.round(b.hp),food:Math.round(b.food),water:Math.round(b.water),sta:Math.round(b.sta),lives:b.lives,dead:b.dead,inv:b.inv,axe:b.axe,home:b.home,inside:b.inside,kills:b.kills||0}))}},
 set(d){if(!d||!Array.isArray(d.houses)||d.houses.length!==5){if(!created)init();return}// save cũ chưa có nhà bot → tạo đúng một lần
  CFG.on=d.on!==false;CFG.n=clamp(d.n|0||5,1,CFG.max);if(!d.n22)for(const q of d.houses)if(q&&q.lv>=3&&!q.ow)q.ow=HS.lv[3].w;// save cũ: nhà bot cấp 3 rộng 10 m > 9,6 m → giữ 10 m (không thu nhỏ)
  setupHouses(d.houses);created=true;BOTS=[];
  for(const q of d.bots||[]){if(!q||!/^bot\d+$/.test(q.id))continue;const b=mkBot(BOTS.length);Object.assign(b,q,{mode:'idle',goal:null,path:null});BOTS.push(b)}ensureBots()}});
// tạo nhà khi chưa có save (sau khi các mô-đun khác đã dựng xong collider)
{let t0=0;const w=()=>{if(created)return;if(S.on){if(!t0)t0=performance.now();if(performance.now()-t0>1200){init();return}}setTimeout(w,200)};w()}// đợi thế giới (2D/2.5D) dựng xong collider rồi mới chọn chỗ → cùng kết quả ở cả hai chế độ
/* menu ☰: bật/tắt bot thử nghiệm + số lượng */
const pm=document.getElementById('pmenu');if(pm)new MutationObserver(()=>{if(pm.style.display==='none'||pm.querySelector('#b16cfg'))return;const sp=pm.querySelector('.sp')||pm;const d=document.createElement('div');d.id='b16cfg';d.style.cssText='margin:8px 0;padding:8px;border:1px solid rgba(255,255,255,.25);border-radius:10px;font-size:13px';
 d.innerHTML='<b>🤖 Bot sinh tồn thử nghiệm (offline)</b><div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:6px"><button data-on="1">'+(CFG.on?'✅ Đang bật':'⬜ Đang tắt')+'</button>'+[5,10,20,49].map(n=>'<button data-n="'+n+'" style="'+(CFG.n===n?'outline:2px solid #ffd24a':'')+'">'+n+' bot</button>').join('')+'</div><small style="opacity:.75">Bot không phải người chơi thật · không chủ động tấn công bạn · 5 bot đầu có nhà riêng</small>';
 d.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;if(t.dataset.on){CFG.on=!CFG.on;if(!CFG.on)hideAll()}if(t.dataset.n){CFG.n=+t.dataset.n;ensureBots()}d.remove();pm.dispatchEvent(new Event('x'));try{SH.SAVE.save(true)}catch(_){}});
 sp.appendChild(d)}).observe(pm,{attributes:true,attributeFilter:['style'],childList:true});
/* =========================== 7) BƯỚC 17: QUÁI ĐI QUA CỬA (dùng chung mọi loại quái) ===========================
   Mục tiêu ở trong một toà nhà có tường + khoảng trống cửa (blds) mà quái đang ở ngoài (hoặc ngược lại)
   → đi tới điểm trước cửa, qua khoảng trống, rồi mới lao vào mục tiêu. Không xuyên tường, không đổi hitbox. */
const NAV17={via(e,p){const B=SH.blds;let bp=null,be=null;for(const b of B){if(!b.Wl||b.x0>INT_X0)continue;const ip=p.x>b.x0+.2&&p.x<b.x1-.2&&p.y>b.y0+.2&&p.y<b.y1-.2,ie=e.x>b.x0-.1&&e.x<b.x1+.1&&e.y>b.y0-.1&&e.y<b.y1+.1;if(ip&&!ie){bp=b;break}if(ie&&!ip){be=b;break}}
 const b=bp||be;if(!b)return p;const g=gate(b);if(!g)return p;const[o,i]=bp?[g.o,g.i]:[g.i,g.o];// vào: ngoài→trong · ra: trong→ngoài
 // đang ở trong làn cửa (giữa điểm ngoài và điểm trong, lệch tâm < nửa khe cửa) → đi tiếp vào trong
 const vx=i[0]-o[0],vy=i[1]-o[1],L2=vx*vx+vy*vy,t=((e.x-o[0])*vx+(e.y-o[1])*vy)/L2,px=o[0]+vx*clamp(t,0,1),py=o[1]+vy*clamp(t,0,1),lat=hyp(e.x-px,e.y-py);
 if((t>-.15&&lat<b.gw*.55)||hyp(e.x-o[0],e.y-o[1])<1.3)return t>.85?p:{x:i[0],y:i[1]};return around(b,e,o)},gate};// AI chỉ bước khi còn >0,9 m tới đích → tới gần điểm ngoài cửa là chuyển ngay sang điểm trong
/* đang ở sau/hông nhà: đường thẳng tới cửa cắt qua nhà → đi vòng qua góc nhà (tối đa 2 góc), không lách tường */
function segHit(r,x0,y0,x1,y1){let t0=0,t1=1;const dx=x1-x0,dy=y1-y0;for(const[p,q]of[[-dx,x0-r[0]],[dx,r[2]-x0],[-dy,y0-r[1]],[dy,r[3]-y0]]){if(p===0){if(q<0)return false;continue}const t=q/p;if(p<0){if(t>t1)return false;if(t>t0)t0=t}else{if(t<t0)return false;if(t<t1)t1=t}}return t1>t0+1e-6}
function around(b,e,o){const m=.75,R=[b.x0-m,b.y0-m,b.x1+m,b.y1+m];if(!segHit(R,e.x,e.y,o[0],o[1]))return{x:o[0],y:o[1]};const k=2.2,C=[[b.x0-k,b.y0-k],[b.x1+k,b.y0-k],[b.x1+k,b.y1+k],[b.x0-k,b.y1+k]];
 let best=null,bc=1e9;for(const c of C){if(segHit(R,e.x,e.y,c[0],c[1]))continue;let cost=hyp(c[0]-e.x,c[1]-e.y);if(!segHit(R,c[0],c[1],o[0],o[1]))cost+=hyp(o[0]-c[0],o[1]-c[1]);else{let b2=1e9;for(const c2 of C){if(c2===c||segHit(R,c[0],c[1],c2[0],c2[1])||segHit(R,c2[0],c2[1],o[0],o[1]))continue;b2=Math.min(b2,hyp(c2[0]-c[0],c2[1]-c[1])+hyp(o[0]-c2[0],o[1]-c2[1]))}cost+=b2}
  if(hyp(c[0]-e.x,c[1]-e.y)<1.05)continue;if(e._cn===c[0]*7+c[1])cost-=2.5;if(cost<bc){bc=cost;best=c}}if(best)e._cn=best[0]*7+best[1];return best?{x:best[0],y:best[1]}:{x:o[0],y:o[1]}}// giữ góc đang đi (trễ) → không giật qua lại
function gate(b){const gc=b.gc,s=b.side;if(s=='s')return{o:[gc,b.y1+1.2],i:[gc,b.y1-1.3]};if(s=='n')return{o:[gc,b.y0-1.2],i:[gc,b.y0+1.3]};if(s=='w')return{o:[b.x0-1.2,gc],i:[b.x0+1.3,gc]};if(s=='e')return{o:[b.x1+1.2,gc],i:[b.x1-1.3,gc]};return null}
globalThis.NAV17=SH.NAV17=NAV17;
const B16={roadRoute,rgBuild,siteWhy,siteOK,reach,sgBuild,CFG,PC,get HOUSES(){return HOUSES},get BOTS(){return BOTS},astar,blk,ST,PERS,init,genHouses,setupHouses,hDoor,step,decide,ensureBots};
globalThis.B16=SH.B16=B16;requestAnimationFrame(tick);
})();
