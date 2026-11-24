/* ===================== LẦN 28: NHÀ CẤP 2 – HÀNG RÀO, CỔNG, MÁY LỌC NƯỚC, RƯƠNG CHỨA ĐỒ + UỐNG NƯỚC SUỐI =====================
   Mở khóa chế tạo ở nhà an toàn cấp 2. Chỉ đặt trong sân / trong nhà an toàn của chính nhân vật.
   - Hàng rào gỗ (dài 2 m) & cổng gỗ (2,4 m, mở/đóng bằng E) – xoay ngang/dọc bằng R.
   - Máy lọc nước đơn sơ: đổ chai nước bẩn → tự lọc thành nước sạch. Nâng cấp 3 cấp (sức chứa, tốc độ).
   - Rương chứa đồ: cất / lấy đồ. Nâng cấp 3 cấp (10 → 20 → 30 ô).
   - Suối / sông ở bản đồ mới: uống trực tiếp (nước chưa đun: +35 khát, bị nước bẩn trừ máu & thể lực như cũ) và lấy nước vào chai. */
(()=>{'use strict';
const SH=globalThis.SH;if(!SH||!SH.X||!SH.F5){console.warn('[B28] thiếu SH');return}
const X=SH.X,S=SH.S,pos=SH.pos,F5=SH.F5,STK=X.STK,F4=X.F4,SAVE=X.SAVE,WORLD=X.WORLD,CMD=X.CMD,W=globalThis.W15;
const say=m=>{try{SH.say(m)}catch(_){}};const GT=()=>+SH.GT||0,IH=()=>!!(SH.IH&&SH.IH()),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),$=id=>document.getElementById(id);
const lv=()=>{try{if(globalThis.CO&&CO.none)return 0;return(globalThis.NHA&&NHA.PB&&NHA.PB.lv)|0}catch(_){return 0}};
const have=k=>S[k]|0;const NMC={wood:'Gỗ',stone:'Đá',iron:'Sắt',plas:'Nhựa',cu:'Đồng',ck_coal:'Than củi'};
const costTxt=c=>Object.keys(c).map(k=>'<span style="color:'+(have(k)>=c[k]?'#7de29c':'#ff7a7a')+'">'+(NMC[k]||k)+' '+have(k)+'/'+c[k]+'</span>').join(' · ');
const canPay=c=>Object.keys(c).every(k=>have(k)>=c[k]),pay=c=>{for(const k in c)S[k]-=c[k]};

/* ---------- loại công trình ---------- */
const T={fence:{n:'Hàng rào gỗ',k:'b28_fence',st:20,L:2,D:.3,cost:{wood:3}},gate:{n:'Cổng gỗ',k:'b28_gate',st:5,L:2.4,D:.3,cost:{wood:6,iron:1}},
 filter:{n:'Máy lọc nước đơn sơ',k:'b28_filter',st:1,L:1.3,D:.8,cost:{wood:6,stone:4,ck_coal:4}},storage:{n:'Rương chứa đồ',k:'b28_storage',st:1,L:1.2,D:.7,cost:{wood:8,stone:2}}};
/* L29: máy lọc chạy theo giờ trong game – cấp 1: 6 giờ/chai, cấp 2: 4 giờ/chai, cấp 3: 2,5 giờ/chai */const FLV=[null,{cap:4,h:6},{cap:8,h:4},{cap:14,h:2.5}],FUP={2:{wood:8,stone:6,ck_coal:6,iron:2},3:{wood:10,stone:8,ck_coal:10,iron:4}};
/* L31: máy lọc cần đồ hứng: chai rỗng đặt vào (tối đa 10) hoặc thùng nước (chứa 30 đơn vị nước sạch) */const BE_MAX=10,BU_MAX=30;
const hasRecv=d=>d.be>0||(d.bar&&d.bu<BU_MAX);
const SLV=[null,10,20,30],SUP={2:{wood:10,iron:2},3:{wood:12,iron:4,cu:2}};
const KT={};for(const t in T)KT[T[t].k]=t;
const INFO={b28_fence:'Hàng rào gỗ dài 2 m: đặt trong sân nhà an toàn của bạn, xoay ngang/dọc bằng R.',b28_gate:'Cổng gỗ 2,4 m: đặt trong sân nhà an toàn, nhấn E để mở/đóng.',
 b28_filter:'Máy lọc nước đơn sơ (than củi, sỏi, cát, vải): đổ chai nước bẩn vào, máy tự lọc thành nước sạch – cấp 1: 6 giờ game/chai. Nâng cấp được 3 cấp.',b28_storage:'Rương chứa đồ: cất đồ trong nhà/sân. Nâng cấp được 3 cấp (10/20/30 ô).'};
/* L29: than củi */STK.ck_coal=20;if(typeof S.ck_coal!='number')S.ck_coal=0;F4.names.ck_coal='Than củi';INFO.ck_coal='Than củi: đốt 3 gỗ ở bếp lửa đang cháy trong 20 giây được 2 than. Dùng chế tạo máy lọc nước.';if(Array.isArray(globalThis.F5KEYS)&&!F5KEYS.includes('ck_coal'))F5KEYS.push('ck_coal');
for(const t in T){const k=T[t].k;STK[k]=T[t].st;if(typeof S[k]!='number')S[k]=0;F4.names[k]=T[t].n;if(Array.isArray(globalThis.F5KEYS)&&!F5KEYS.includes(k))F5KEYS.push(k)}

/* ---------- vẽ (dùng chung 2D, 2.5D, biểu tượng) ---------- */
function plank(g,x,y,w,h,c,o){g.fillStyle=c;g.fillRect(x,y,w,h);g.strokeStyle=o||'#3a2410';g.lineWidth=Math.max(1,Math.min(w,h)*.12);g.strokeRect(x,y,w,h)}
function drawObj(g,o,x,y,Z,t){const L=T[o.t].L,rot=o.rot|0;g.save();
 const sh=(w,h)=>{g.fillStyle='rgba(10,10,20,.22)';g.beginPath();g.ellipse(x,y,w,h,0,0,7);g.fill()};
 if(o.t==='fence'||o.t==='gate'){const H=Z*(o.t==='gate'?1.15:1),pw=Z*.14;
  if(rot===0){const w=L*Z;sh(w*.5,Z*.12);const px=[-w/2,0,w/2];if(o.t==='gate')px.splice(1,1);
   if(o.t==='gate'){const op=!!o.open;if(!op){for(let i=0;i<6;i++)plank(g,x-w/2+pw/2+i*(w-pw)/6,y-H*.92,(w-pw)/6-1,H*.84,i%2?'#9a6a36':'#a8763c');plank(g,x-w/2+pw/2,y-H*.62,w-pw,H*.1,'#7a4a20');g.strokeStyle='#5a3414';g.lineWidth=Z*.06;g.beginPath();g.moveTo(x-w/2+pw,y-H*.3);g.lineTo(x+w/2-pw,y-H*.85);g.stroke()}
    else{for(let i=0;i<3;i++)plank(g,x-w/2+pw/2+i*Z*.22,y-H*.92+Z*.05,Z*.2,H*.84,'#a8763c')}}
   else{plank(g,x-w/2,y-H*.78,w,H*.12,'#9a6a36');plank(g,x-w/2,y-H*.42,w,H*.12,'#9a6a36')}
   for(const dx of px)plank(g,x+dx-pw/2,y-H,pw,H,'#7a4a20');if(o.t==='gate')g.fillStyle='#c9a04a'}
  else{const y0=y-L*Z/2,y1=y+L*Z/2;sh(Z*.2,L*Z*.5);const n=o.t==='gate'?0:3;
   if(o.t==='gate'&&!o.open){for(let i=0;i<6;i++){const yy=y0+(i+.5)*(y1-y0)/6;plank(g,x-pw*.6,yy-H*.9,pw*1.2,H*.86,i%2?'#9a6a36':'#a8763c')}}
   if(o.t!=='gate'){g.fillStyle='#9a6a36';g.strokeStyle='#3a2410';g.lineWidth=Math.max(1,Z*.03);for(const hh of[.78,.42]){g.beginPath();g.moveTo(x-pw*.3,y0-H*hh);g.lineTo(x+pw*.3,y0-H*hh);g.lineTo(x+pw*.3,y1-H*hh+H*.12);g.lineTo(x-pw*.3,y1-H*hh+H*.12);g.closePath();g.fill();g.stroke()}}
   for(const yy of(n?[y0,(y0+y1)/2,y1]:[y0,y1]))plank(g,x-pw/2,yy-H,pw,H,'#7a4a20')}}
 else if(o.t==='filter'&&okI(FIMG)){const lvv=o.lv||1,w=Z*1.75,h=w*FIMG.naturalHeight/FIMG.naturalWidth;sh(w*.42,Z*.16);g.drawImage(FIMG,x-w/2,y-h+Z*.05,w,h);const dd=o.d||{};if(dd.bar&&F5.barrelDraw)F5.barrelDraw(g,x+w*.42,y+Z*.06,Z*.5,dd.bu?Math.round(dd.bu/BU_MAX*100):0,'clean');if(dd.be||dd.out){g.fillStyle=dd.out?'rgba(150,215,255,.95)':'rgba(220,235,245,.8)';g.strokeStyle='#2a5a80';g.lineWidth=1;g.fillRect(x-w*.48,y-Z*.3,Z*.12,Z*.3);g.strokeRect(x-w*.48,y-Z*.3,Z*.12,Z*.3)}if(dd.q&&!hasRecv(dd)){g.font='bold '+Math.round(Z*.32)+'px system-ui';g.textAlign='center';g.fillStyle='#ffd24a';g.fillText('⚠',x,y-h-Z*.05)}for(let i=0;i<lvv;i++){g.fillStyle='#ffd84a';g.strokeStyle='#5a4410';g.lineWidth=1;g.beginPath();const sx=x-w*.36+i*Z*.2,sy=y-h+Z*.12;for(let k=0;k<10;k++){const r=k%2?Z*.04:Z*.09,a=-Math.PI/2+k*Math.PI/5;g.lineTo(sx+Math.cos(a)*r,sy+Math.sin(a)*r)}g.closePath();g.fill();g.stroke()}}
 else if(o.t==='filter'){const lvv=o.lv||1,w=Z*.8,h=Z*1.25;sh(w*.6,Z*.16);
  plank(g,x-w/2,y-h*.55,w,h*.55,'#7a8a96','#2c3640');g.fillStyle='#d8c08a';g.fillRect(x-w/2+2,y-h*.5,w-4,h*.1);g.fillStyle='#2a2a2a';g.fillRect(x-w/2+2,y-h*.38,w-4,h*.09);g.fillStyle='#b7a27a';g.fillRect(x-w/2+2,y-h*.27,w-4,h*.1);
  for(let i=0;i<lvv;i++){g.fillStyle='#c9ccd2';g.fillRect(x-w/2-1,y-h*.53+i*h*.16,w+2,Math.max(2,h*.035))}
  g.fillStyle='#5a6a74';g.beginPath();g.moveTo(x-w*.55,y-h*.55);g.lineTo(x+w*.55,y-h*.55);g.lineTo(x+w*.18,y-h*.82);g.lineTo(x-w*.18,y-h*.82);g.closePath();g.fill();g.strokeStyle='#2c3640';g.lineWidth=Math.max(1,Z*.03);g.stroke();
  plank(g,x-w*.12,y-h*.95,w*.24,h*.14,'#8a9aa6','#2c3640');plank(g,x+w*.42,y-h*.16,w*.22,h*.06,'#c9a04a','#5a4410');
  const q=o.d&&o.d.q|0,out=o.d&&o.d.out|0;if(q>0){const ph=((t||0)/600)%1;g.fillStyle='rgba(120,190,255,.9)';g.beginPath();g.arc(x+w*.6,y-h*.08+ph*h*.1,Math.max(1.5,Z*.04),0,7);g.fill()}
  if(out>0){plank(g,x+w*.5,y-h*.22,w*.18,h*.22,'rgba(160,220,255,.9)','#2a5a80')}}
 else if(o.t==='storage'){const lvv=o.lv||1,w=Z*1.1,h=Z*.75;sh(w*.55,Z*.14);plank(g,x-w/2,y-h*.62,w,h*.62,'#8a5a2a','#3a2410');plank(g,x-w/2,y-h,w,h*.4,'#9a6a36','#3a2410');
  for(let i=0;i<6;i++){g.strokeStyle='rgba(58,36,16,.6)';g.lineWidth=1;g.beginPath();g.moveTo(x-w/2,y-h*.62+i*h*.1);g.lineTo(x+w/2,y-h*.62+i*h*.1);g.stroke()}
  const band=lvv>=3?'#e2b84a':lvv>=2?'#9aa2ac':null;if(band){for(const bx of[-.36,.36])plank(g,x+bx*w-w*.05,y-h,w*.1,h,band,'#3a3a3a');plank(g,x-w/2,y-h*.64,w,h*.06,band,'#3a3a3a')}
  plank(g,x-w*.07,y-h*.7,w*.14,h*.18,lvv>=3?'#ffd84a':'#c9a04a','#5a4410')}
 g.restore()}
const FIMG=new Image();FIMG.src='b28/filter.png';const okI=im=>im&&im.complete&&im.naturalWidth>0;
const ICON={ck_coal:'b28/coal.png'};function mkIcons(){for(const t in T){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const o={t,rot:0,lv:1,open:false};const Z=t==='fence'?26:t==='gate'?22:t==='filter'?44:46;drawObj(g,o,32,58,Z,0);ICON[T[t].k]=c.toDataURL()}ICON.b28_filter='b28/filter.png'}mkIcons();
const imgH=(k,px)=>ICON[k]?'<img src="'+ICON[k]+'" alt="" draggable="false" style="width:'+px+'px;height:'+px+'px;object-fit:contain;vertical-align:middle">':'';
{const ic0=F5.ic;F5.ic=x=>(x&&x.k&&ICON[x.k])?imgH(x.k,34):ic0(x)}
{const ic0=F5.icon;F5.icon=(k,px)=>ICON[k]?imgH(k,px||34):ic0(k,px)}
{const i0=F5.info;F5.info=k=>INFO[k]||i0(k)}
{const b0=F5.btn0;F5.btn0=x=>KT[x.k]?'<button onclick="invUse()">Đặt</button>':b0(x)}
{const u0=F5.invUse;F5.invUse=x=>{if(KT[x.k]){try{if($('inv').style.display==='flex')globalThis.togInv()}catch(_){}startPlace(KT[x.k],null);return true}return u0(x)}}
{const r0=F5.recipes;F5.recipes=()=>r0().concat(Object.keys(T).map(t=>({n:T[t].n,ic:imgH(T[t].k,34),d:INFO[T[t].k]+' (mở khóa ở nhà cấp 2)',cost:T[t].cost,st:T[t].k,ok:()=>lv()>=2,no:'🔒 Nhà cấp 2'})))}

/* ---------- đối tượng & va chạm ---------- */
const OBJ=[];let seq=0;
function rectOf(o){const tp=T[o.t],r=o.rot|0,hw=(r?tp.D:tp.L)/2,hd=(r?tp.L:tp.D)/2;return[o.x-hw,o.y-hd,o.x+hw,o.y+hd]}
function colOf(o){const R=rectOf(o);return{x0:R[0],x1:R[2],z0:R[1],z1:R[3],b28:1,on:o.t==='gate'&&o.open?false:undefined}}
function addObj(o){o.c=colOf(o);SH.cols.push(o.c);OBJ.push(o)}
function delObj(o){const i=OBJ.indexOf(o);if(i>=0)OBJ.splice(i,1);const j=SH.cols.indexOf(o.c);if(j>=0){SH.cols.splice(j,1);if(SH.colsDirty)SH.colsDirty()}if(OPEN&&OPEN.o===o)closeAll()}
function resync(o){const j=SH.cols.indexOf(o.c);if(j>=0)SH.cols.splice(j,1);o.c=colOf(o);SH.cols.push(o.c);if(SH.colsDirty)SH.colsDirty()}
const inR=(R,x,y,m)=>x>R[0]-m&&x<R[2]+m&&y>R[1]-m&&y<R[3]+m;
function myLot(){try{if(!globalThis.NHA||!NHA.PB||(globalThis.CO&&CO.none))return null;return NHA.lotRect?NHA.lotRect(NHA.PB):NHA.houseRect(NHA.PB,5)}catch(_){return null}}
function canPlace(t,x,y,rot,self){if(IH())return'Chỉ đặt trong sân / nhà an toàn của bạn';const L=myLot();if(!L)return'Bạn chưa có nhà an toàn';
 const o={t,x,y,rot},R=rectOf(o);if(!(R[0]>=L[0]-.6&&R[2]<=L[2]+.6&&R[1]>=L[1]-.6&&R[3]<=L[3]+.6))return'Chỉ đặt trong sân nhà an toàn của bạn';
 if(pos.x>R[0]-.35&&pos.x<R[2]+.35&&pos.y>R[1]-.35&&pos.y<R[3]+.35)return'Đứng lùi lại một chút';
 let on;if(self&&self.c){on=self.c.on;self.c.on=false}let hit=false;try{const ix=Math.min(.15,(R[2]-R[0])/4),iy=Math.min(.12,(R[3]-R[1])/4);
  for(let xx=R[0]+ix;xx<=R[2]-ix+1e-6;xx+=Math.max(.3,(R[2]-R[0]-2*ix)/6))for(let yy=R[1]+iy;yy<=R[3]-iy+1e-6;yy+=Math.max(.2,(R[3]-R[1]-2*iy)/4))if(X.hitC(xx,yy,.04)){hit=true;break}}finally{if(self&&self.c)self.c.on=on}
 if(hit)return'Vướng vật cản';if(SH.inLk&&SH.inLk(x,y,.3))return'Không đặt trên mặt nước';return''}

/* ---------- đặt / dời ---------- */
let PL=null;const pbar=document.createElement('div');pbar.className='ckw';pbar.style.cssText='position:fixed;left:50%;bottom:118px;transform:translateX(-50%);z-index:70;display:none;padding:8px 10px;border-radius:12px;background:rgba(24,20,14,.92);border:2px solid #b8924a;text-align:center;font:13px system-ui;color:#f4ead0';document.body.appendChild(pbar);
pbar.addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(!b)return;e.preventDefault();e.stopPropagation();const a=b.dataset.a;if(a==='ok')confirmPlace();else if(a==='r'){if(PL){PL.rot=PL.rot?0:1;PL.key='';tickPlace()}}else stopPlace()});
function startPlace(t,o,r){if(!o&&!r&&!(S[T[t].k]>0))return;if(!myLot())return say('🏠 Bạn chưa có nhà an toàn');closeAll();PL={t,o,r:o?null:(r||null),rot:o?o.rot|0:(T[t].L>1.5?0:0),x:pos.x,y:pos.y,why:'',key:''};pbar.style.display='block';tickPlace()}
function stopPlace(){PL=null;pbar.style.display='none'}
function tickPlace(){if(!PL)return;if(PL.o&&!OBJ.includes(PL.o))return stopPlace();const l=Math.hypot(X.fvx,X.fvy)||1,tp=T[PL.t],fx=X.fvx/l,fy=X.fvy/l,hx=(PL.rot?tp.D:tp.L)/2,hy=(PL.rot?tp.L:tp.D)/2,off=Math.abs(fx)*hx+Math.abs(fy)*hy+.75,sn=v=>Math.round(v*2)/2;
 PL.x=sn(pos.x+X.fvx/l*off);PL.y=sn(pos.y+X.fvy/l*off);PL.why=canPlace(PL.t,PL.x,PL.y,PL.rot,PL.o);const key=PL.why+'|'+PL.rot;if(key===PL.key)return;PL.key=key;const ok=!PL.why;
 pbar.innerHTML=imgH(tp.k,22)+' <b>'+(PL.o?'Dời ':PL.r?'Đặt lại ':'Đặt ')+tp.n.toLowerCase()+(PL.r?' cấp '+PL.r.lv:'')+'</b> · '+(ok?'<span style="color:#7dff9a">đặt được</span>':'<span style="color:#ff9080">'+PL.why+'</span>')+
 '<br><button data-a="ok" style="margin:6px 4px 0;padding:9px 14px;border-radius:9px;border:0;background:'+(ok?'#2e8b47':'#555')+';color:#fff;font:bold 14px system-ui">Đặt (Enter)</button>'+(tp.L>1.5?'<button data-a="r" style="margin:6px 4px 0;padding:9px 14px;border-radius:9px;border:0;background:#5a4a2a;color:#fff;font:bold 14px system-ui">↻ '+(PL.rot?'Dọc':'Ngang')+' (R)</button>':'')+'<button data-a="no" style="margin:6px 4px 0;padding:9px 14px;border-radius:9px;border:0;background:#8b2e2e;color:#fff;font:bold 14px system-ui">✖ Hủy (Esc)</button>'}
function confirmPlace(){if(!PL)return;PL.key='';tickPlace();if(PL.why)return say('⛔ '+PL.why);const tp=T[PL.t];
 if(PL.o){const o=PL.o;o.x=PL.x;o.y=PL.y;o.rot=PL.rot;resync(o);say('✥ Đã dời '+tp.n.toLowerCase());stopPlace();return}
 /* SB6: đặt lại thiết bị đã nâng cấp từ gói chờ khôi phục (S.rs6) – không trừ/cộng vật phẩm; lấy bản ghi ra khỏi gói và đặt vào thế giới trong cùng một lượt (không thể nhân đôi) */
 if(PL.r){const rr=PL.r,q=Array.isArray(S.rs6)?S.rs6.indexOf(rr):-1;if(q<0)return stopPlace();const o=mkRestored(rr);if(!o){say('⛔ Dữ liệu thiết bị khôi phục lỗi');return stopPlace()}S.rs6.splice(q,1);addObj(o);say('🔨 Đã đặt lại '+tp.n.toLowerCase()+' cấp '+o.lv);WORLD.emit('b28.place',{id:o.id,t:o.t,restored:1});stopPlace();return}
 if(!(S[tp.k]>0))return stopPlace();S[tp.k]--;let id;do{id='bx'+(++seq)}while(OBJ.some(q=>q.id===id));const o={id,t:PL.t,x:PL.x,y:PL.y,rot:PL.rot,lv:1,open:false,d:PL.t==='filter'?{q:0,out:0,pr:0,be:0,bar:0,bu:0}:PL.t==='storage'?{it:{},eq:[]}:null};addObj(o);
 say('🔨 Đã đặt '+tp.n.toLowerCase()+(PL.t==='gate'?' – nhấn E để mở/đóng':''));WORLD.emit('b28.place',{id,t:o.t});
 if((PL.t==='fence'||PL.t==='gate')&&S[tp.k]>0){PL.key='';tickPlace();return}stopPlace()}
addEventListener('keydown',e=>{if(!PL&&!OPEN)return;const k=(e.key||'').toLowerCase(),tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA')return;
 if(PL){if(k==='enter'){e.preventDefault();e.stopPropagation();confirmPlace()}else if(k==='escape'){e.preventDefault();e.stopPropagation();stopPlace()}else if(k==='r'&&!e.repeat&&T[PL.t].L>1.5){e.preventDefault();e.stopPropagation();PL.rot=PL.rot?0:1;PL.key='';tickPlace()}return}
 if(k==='escape'){e.preventDefault();e.stopPropagation();closeAll()}},true);

/* ---------- tương tác E ---------- */
const nearD=o=>{const R=rectOf(o);const dx=Math.max(R[0]-pos.x,0,pos.x-R[2]),dy=Math.max(R[1]-pos.y,0,pos.y-R[3]);return Math.hypot(dx,dy)};
function waterNear(){if(!W||!W.water||IH())return 99;try{if(W.water(pos.x,pos.y).d>0)return 0;for(const r of[.8,1.5])for(let a=0;a<8;a++){const x=pos.x+Math.cos(a*.785)*r,y=pos.y+Math.sin(a*.785)*r;if(W.water(x,y).d>0)return r}}catch(_){}return 99}
{const a0=F5.acts;F5.acts=c=>{a0&&a0(c);if(PL)return;
 if(!IH()&&X.lkDist(pos.x,pos.y)>=2){const wd=waterNear();if(wd<2){/* L29: không uống trực tiếp – cần chai rỗng (lấy nước) hoặc bát (múc uống) */if(S.botE>0)c(wd+.01,2,'🫙<br>Lấy nước<br>vào chai',()=>CMD.exec('water.fill',{src:'lake'}));else if((S.ck_bowl|0)>0)c(wd+.02,2,'🥣<br>Múc bằng bát<br>uống (chưa đun)',()=>F5.drinkRaw&&F5.drinkRaw());else c(wd+.03,2,'💧<br>Cần chai rỗng<br>hoặc bát',()=>say('💧 Cần chai rỗng (lấy nước) hoặc bát (múc uống) – không uống trực tiếp được'))}}
 if(IH())return;for(const o of OBJ){const d=nearD(o);if(d>1.4)continue;const tp=T[o.t];
  const lab=o.t==='gate'?(o.open?'🚪<br>Đóng cổng':'🚪<br>Mở cổng'):o.t==='fence'?'🪵<br>Hàng rào':o.t==='filter'?'💧<br>Máy lọc nước<br>'+(o.d.q&&!hasRecv(o.d)?'⚠ thiếu đồ hứng':'cấp '+o.lv+' · '+((o.d.out|0)+(o.d.bu|0))+' nước sạch'):'📦<br>Rương chứa đồ<br>cấp '+o.lv;
  c(d+.03,1.4,lab,()=>o.t==='gate'?toggleGate(o):openPanel(o),o)}}}
function toggleGate(o){if(!o.open){o.open=true;resync(o)}else{const R=rectOf(o);if(pos.x>R[0]-.25&&pos.x<R[2]+.25&&pos.y>R[1]-.25&&pos.y<R[3]+.25)return say('Đứng ra khỏi lối cổng rồi đóng');o.open=false;resync(o)}}

/* ---------- bảng điều khiển ---------- */
let OPEN=null;const panEl=document.createElement('div');panEl.className='ckw';panEl.style.cssText='position:fixed;inset:0;z-index:58;display:none;align-items:center;justify-content:center;background:rgba(6,4,2,.45)';document.body.appendChild(panEl);
function closeAll(){OPEN=null;panEl.style.display='none'}
function openPanel(o){if(!OBJ.includes(o))return;closeAll();OPEN={o};panEl.style.display='flex';render()}
const bt=(a,t,on,cls)=>'<button class="ckbtn'+(cls?' '+cls:'')+'" data-a="'+a+'"'+(on?'':' disabled')+'>'+t+'</button>';
const storable=k=>k!=='eat'&&STK[k]&&!KT[k];
function used(o){let n=(o.d.eq||[]).length;for(const k in o.d.it)n+=Math.ceil(o.d.it[k]/(STK[k]||1));return n}
function render(){const o=OPEN&&OPEN.o;if(!o)return;const tp=T[o.t];let h='<div class="ckpan" style="width:min(640px,96vw)"><div class="ckhd">'+imgH(tp.k,30)+' '+tp.n+' <small style="font-size:13px;color:#ffd27a">cấp '+(o.lv||1)+'</small><button class="x" data-a="close">✕</button></div>';
 if(o.t==='fence'){h+='<div class="ckrow">'+bt('move','✥ Di chuyển',1)+bt('take','⬆ Thu hồi',1)+'</div>'}
 else if(o.t==='filter'){const L=FLV[o.lv],d=o.d,room=L.cap-d.q,run=d.q>0&&hasRecv(d);
  h+='<div class="ckbox" style="font-size:14px;line-height:1.7">🫙 Nước bẩn chờ lọc: <b>'+d.q+'/'+L.cap+'</b> · ⏱ <b>'+L.h+' giờ game</b>/chai (≈ '+Math.round(L.h*12.5)+' giây thật)'+
   '<br>🧺 Đồ hứng: '+(d.bar?'<b>🛢 Thùng nước</b> ('+d.bu+'/'+BU_MAX+' nước sạch)':'')+(d.bar&&d.be?' + ':'')+(d.be?'<b>'+d.be+' chai rỗng</b>':'')+(!d.bar&&!d.be?'<b style="color:#ff9a7a">chưa có</b>':'')+' · 💧 Chai nước sạch: <b>'+d.out+'</b>'+
   (d.q&&!hasRecv(d)?'<div style="color:#ff9a7a;font-weight:700">⚠ Chưa có đồ hứng (chai rỗng hoặc thùng nước) – máy không hoạt động</div>':run?'<div class="ckbar" style="margin-top:6px"><i id="b28pr" style="width:'+Math.round(d.pr/L.h*100)+'%"></i></div>':'')+'</div>'+
   '<div class="ckrow">'+bt('pour','⬇ Đổ nước bẩn ('+have('botD')+' chai)',have('botD')>0&&room>0,'ckgo')+bt('bein','🫙 Đặt chai rỗng ('+have('botE')+')',have('botE')>0&&d.be+d.out<BE_MAX)+bt('beout','Lấy chai rỗng ra ('+d.be+')',d.be>0)+'</div>'+
   '<div class="ckrow">'+bt('get','⬆ Lấy chai nước sạch ('+d.out+')',d.out>0)+(d.bar?bt('fill','🫙 Rót từ thùng vào chai ('+have('botE')+' chai rỗng)',d.bu>0&&have('botE')>0)+bt('barout','Tháo thùng',d.bu===0):bt('barin','🛢 Đặt thùng nước ('+have('barrel')+')',have('barrel')>0))+'</div>';
  if(o.lv<3)h+='<div class="ckbox" style="margin-top:8px;font-size:13px">⬆ Nâng cấp lên cấp '+(o.lv+1)+': chứa '+FLV[o.lv+1].cap+' chai nước bẩn, '+FLV[o.lv+1].h+' giờ game/chai<br>'+costTxt(FUP[o.lv+1])+'<div class="ckrow">'+bt('up','Nâng cấp',canPay(FUP[o.lv+1]))+'</div></div>';
  h+='<div class="ckrow">'+bt('move','✥ Di chuyển',1)+bt('take','⬆ Thu hồi'+(o.lv>1?' (chỉ cấp 1)':''),o.lv===1&&!d.q&&!d.out&&!d.be&&!d.bar)+'</div>'}
 else if(o.t==='storage'){const cap=SLV[o.lv],u=used(o),bag=Object.keys(STK).filter(k=>storable(k)&&have(k)>0),ins=Object.keys(o.d.it).filter(k=>o.d.it[k]>0);
  const nm=k=>F4.names[k]||({wood:'Gỗ',stone:'Đá',med:'Thuốc',bread:'Bánh mì',wat:'Nước đóng chai',gas:'Xăng',oil:'Dầu'}[k])||k;const ic=k=>(F5.icon&&F5.icon(k,26))||'';
  const row=(k,n,side)=>'<div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid #2e2418">'+ic(k)+'<span style="flex:1">'+nm(k)+'</span><b>×'+n+'</b>'+bt(side+'1:'+k,side==='in'?'→ 1':'← 1',1)+bt(side+'A:'+k,side==='in'?'→ hết':'← hết',1)+'</div>';
  const EQ=X.EQ||{},eqRow=(id,i,side)=>'<div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid #2e2418"><span style="font-size:20px">'+((EQ[id]||{}).ic||'⚔')+'</span><span style="flex:1">'+((EQ[id]||{}).n||id)+'</span>'+bt(side+'E:'+i,side==='in'?'→':'←',1)+'</div>';
  h+='<div style="text-align:center;font-size:13px;margin-bottom:6px">📦 Rương: <b>'+u+'/'+cap+'</b> ô · 🎒 Túi: <b>'+X.used()+'/'+S.cap+'</b> ô</div><div class="ckcols" style="grid-template-columns:1fr 1fr"><div class="ckbox" style="max-height:46vh;overflow:auto"><p class="ckt">🎒 Túi đồ → cất vào</p>'+(bag.map(k=>row(k,have(k),'in')).join('')+(S.bg||[]).map((id,i)=>eqRow(id,i,'in')).join('')||'<small>Túi trống</small>')+'</div>'+
   '<div class="ckbox" style="max-height:46vh;overflow:auto"><p class="ckt">📦 Trong rương → lấy ra</p>'+(ins.map(k=>row(k,o.d.it[k],'out')).join('')+(o.d.eq||[]).map((id,i)=>eqRow(id,i,'out')).join('')||'<small>Rương trống</small>')+'</div></div>';
  if(o.lv<3)h+='<div class="ckbox" style="margin-top:8px;font-size:13px">⬆ Nâng cấp lên cấp '+(o.lv+1)+': '+SLV[o.lv+1]+' ô<br>'+costTxt(SUP[o.lv+1])+'<div class="ckrow">'+bt('up','Nâng cấp',canPay(SUP[o.lv+1]))+'</div></div>';
  h+='<div class="ckrow">'+bt('move','✥ Di chuyển',1)+bt('take','⬆ Thu hồi'+(o.lv>1?' (chỉ cấp 1)':''),o.lv===1&&!u)+'</div>'}
 panEl.innerHTML=h+'</div>'}
function sIn(o,k,n){const cap=SLV[o.lv];let m=0;for(let i=0;i<n;i++){if(!(have(k)>0))break;const cur=o.d.it[k]|0,st=STK[k]||1;if(cur%st===0&&used(o)>=cap)break;S[k]--;o.d.it[k]=cur+1;m++}if(!m)say(have(k)>0?'📦 Rương đầy':'');return m}
function sOut(o,k,n){let m=0;for(let i=0;i<n;i++){if(!((o.d.it[k]|0)>0))break;if(X.give(k,1)!==1){say('🎒 Túi đầy');break}o.d.it[k]--;m++}if(!(o.d.it[k]>0))delete o.d.it[k];return m}
panEl.addEventListener('pointerdown',e=>{if(e.target===panEl){closeAll();return}const b=e.target.closest('button[data-a]');if(!b||b.disabled)return;e.preventDefault();const o=OPEN&&OPEN.o;if(!o)return closeAll();const a=b.dataset.a;
 if(a==='close')return closeAll();if(a==='move'){closeAll();return startPlace(o.t,o)}
 if(a==='take'){const k=T[o.t].k;if(o.lv>1)return;if(o.t==='storage'&&used(o))return say('Lấy hết đồ trong rương ra trước');if(o.t==='filter'&&(o.d.q||o.d.out||o.d.be||o.d.bar))return say('Lấy hết nước, chai và thùng trong máy ra trước');if(!X.room(k))return say('🎒 Túi đầy');S[k]++;delObj(o);say('⬆ Đã thu hồi '+T[o.t].n.toLowerCase());return}
 if(o.t==='filter'){const L=FLV[o.lv],d=o.d;
  if(a==='pour'){let n=0,kept=0;while(have('botD')>0&&d.q<L.cap){S.botD--;d.q++;n++;if(X.give('botE',1)!==1){if(d.be+d.out<BE_MAX){d.be++;kept++}else S.botE++}}say('🫙 Đổ '+n+' chai nước bẩn vào máy · chai rỗng trả lại túi'+(kept?' ('+kept+' chai giữ lại làm đồ hứng)':''))}
  else if(a==='bein'){let n=0;while(have('botE')>0&&d.be+d.out<BE_MAX){S.botE--;d.be++;n++}say('🫙 Đặt '+n+' chai rỗng làm đồ hứng')}
  else if(a==='beout'){let n=0;while(d.be>0&&X.give('botE',1)===1){d.be--;n++}say(n?'🫙 Lấy '+n+' chai rỗng ra':'🎒 Túi đầy')}
  else if(a==='get'){let n=0;while(d.out>0&&X.give('botC',1)===1){d.out--;n++}say(n?'💧 Lấy '+n+' chai nước sạch':'🎒 Túi đầy')}
  else if(a==='barin'&&have('barrel')>0&&!d.bar){S.barrel--;d.bar=1;d.bu=0;say('🛢 Đã đặt thùng nước dưới máy lọc')}
  else if(a==='barout'&&d.bar&&d.bu===0){if(!X.room('barrel'))return say('🎒 Túi đầy');S.barrel++;d.bar=0;say('🛢 Đã tháo thùng nước')}
  else if(a==='fill'){let n=0;while(d.bu>0&&have('botE')>0){S.botE--;if(X.give('botC',1)!==1){S.botE++;break}d.bu--;n++}say(n?'💧 Rót '+n+' chai nước sạch từ thùng':'🎒 Túi đầy')}
  else if(a==='up'&&o.lv<3&&canPay(FUP[o.lv+1])){pay(FUP[o.lv+1]);o.lv++;say('⬆ Máy lọc nước lên cấp '+o.lv)}}
 if(o.t==='storage'){if(a==='up'&&o.lv<3&&canPay(SUP[o.lv+1])){pay(SUP[o.lv+1]);o.lv++;say('⬆ Rương chứa đồ lên cấp '+o.lv+' ('+SLV[o.lv]+' ô)')}
  const m=/^(in|out)(1|A|E):(.+)$/.exec(a);if(m){const side=m[1],kind=m[2],k=m[3];
   if(kind==='E'){const i=+k;if(side==='in'){const id=S.bg[i];if(id&&used(o)<SLV[o.lv]){S.bg.splice(i,1);o.d.eq.push(id)}else say('📦 Rương đầy')}else{const id=o.d.eq[i];if(id){if(X.used()>=S.cap)say('🎒 Túi đầy');else{o.d.eq.splice(i,1);S.bg.push(id)}}}}
   else if(side==='in')sIn(o,k,kind==='A'?have(k):1);else sOut(o,k,kind==='A'?(o.d.it[k]|0):1)}}
 try{if($('inv').style.display==='flex')X.renderInv()}catch(_){}render()});
/* ---------- máy lọc: chạy theo thời gian chơi (dừng khi game tạm dừng) ---------- */
let lastG=null,lastN=0;
setInterval(()=>{try{const g=GT(),now=performance.now();const dG=lastG==null?0:g-lastG;lastG=g;const rs=dG>0&&dG<.6?Math.min(.5,(now-(lastN||now))/1000):0;lastN=now;
 if(dG>0&&dG<.6)for(const o of OBJ)if(o.t==='filter'&&o.d.q>0&&hasRecv(o.d)){const L=FLV[o.lv],d=o.d;d.pr+=dG;while(d.pr>=L.h&&d.q>0&&hasRecv(d)){d.pr-=L.h;d.q--;if(d.be>0){d.be--;d.out++}else d.bu++}if(!d.q)d.pr=0}
 if(OPEN){const o=OPEN.o;if(!OBJ.includes(o)||nearD(o)>3)closeAll();else if(o.t==='filter'){const k=o.d.q+'|'+o.d.out+'|'+o.d.be+'|'+o.d.bar+'|'+o.d.bu+'|'+S.botE+'|'+S.botD;if(k!==OPEN.k){OPEN.k=k;render()}else{const pr=$('b28pr');if(pr)pr.style.width=Math.round(o.d.pr/FLV[o.lv].h*100)+'%'}}}
 if(PL)tickPlace()}catch(e){if(!B28.err){B28.err=String(e&&e.stack||e);console.warn('[B28]',e)}}},200);
/* ---------- vẽ 2D ---------- */
{const o0=F5.draw2;F5.draw2=(L,Xf,Yf,cx,cy,vw,vh,t,g,Z)=>{o0&&o0(L,Xf,Yf,cx,cy,vw,vh,t,g,Z);if(IH())return;
 for(const o of OBJ)if(Math.abs(o.x-cx)<vw+3&&Math.abs(o.y-cy)<vh+4){const R=rectOf(o);L.push([o.rot?R[1]+.05:o.y,()=>drawObj(g,o,Xf(o.x),Yf(o.rot?o.y:o.y),Z,t)])}
 if(PL){const P=PL,R=rectOf(P);L.push([1e9,()=>{g.save();g.globalAlpha=.45;g.fillStyle=P.why?'#ff4040':'#35d06a';g.fillRect(Xf(R[0]),Yf(R[1]),(R[2]-R[0])*Z,(R[3]-R[1])*Z);g.globalAlpha=.6;drawObj(g,{t:P.t,rot:P.rot,lv:P.o?P.o.lv:P.r?P.r.lv:1,open:false,d:P.o?P.o.d:P.r?P.r.d:null},Xf(P.x),Yf(P.y),Z,t);g.restore()}])}}}
/* ---------- 2.5D ---------- */
const M3=new Map(),TEX=new Map();let geo=null,ghost=null;
function tex(o,key,draw,w,h){let tx=TEX.get(key);if(tx)return tx;const V=SH.V25,Tt=V.T15.T,c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'));tx=new Tt.CanvasTexture(c);TEX.set(key,tx);return tx}
function cardsFor(o){const out=[];const st=(o.t==='filter'?(o.d.q?'q':'')+(o.d.out||o.d.be?'o':'')+(o.d.bar?'B'+Math.round((o.d.bu|0)/6):'')+(o.d.q&&!hasRecv(o.d)?'!':''):'')+(o.open?'O':'');
 if((o.t==='fence'||o.t==='gate')&&o.rot){const L=T[o.t].L,n=o.t==='gate'?(o.open?2:7):5;for(let i=0;i<n;i++){const yy=o.y-L/2+(n===1?0:i*L/(n-1));const isP=o.t!=='gate'||i===0||i===n-1;
   out.push({key:o.t+'post'+(isP?'P':'D'),w:.3,h:1.2,x:o.x,z:yy,draw:g=>{const pw=12;g.fillStyle=isP?'#7a4a20':'#a8763c';g.fillRect(24-pw/2,8,pw,88);g.strokeStyle='#3a2410';g.lineWidth=2;g.strokeRect(24-pw/2,8,pw,88);if(!isP||o.t==='fence'){g.fillStyle='#9a6a36';g.fillRect(4,28,40,8);g.fillRect(4,58,40,8)}},cw:48,ch:96})}}
 else{const tp=T[o.t],w=o.rot?.9:o.t==='filter'?2.0:Math.max(1,tp.L+.4),h=o.t==='filter'?2.4:o.t==='storage'?1.1:1.4,cw=Math.round(w*64),ch=Math.round(h*64);
  out.push({key:o.t+'|'+o.lv+'|'+st+'|'+cw+(o.t==='filter'&&okI(FIMG)?'i':''),w,h,x:o.x,z:o.y,draw:g=>drawObj(g,{t:o.t,rot:0,lv:o.lv,open:o.open,d:o.d},cw/2,ch-4,64,0),cw,ch})}return out}
function upd3(){const V=SH.V25;if(!V||!V.on||!V.T15){for(const a of M3.values())for(const m of a.ms)m.visible=false;if(ghost)ghost.visible=false;return}const Tt=V.T15.T,scene=V.T15.scene,ih=IH();if(!geo){geo=new Tt.PlaneGeometry(1,1);geo.translate(0,.5,0)}
 for(const o of OBJ){const near=!ih&&Math.abs(o.x-pos.x)<55&&Math.abs(o.y-pos.y)<45;let r=M3.get(o);const sig=o.t+o.rot+o.lv+(o.open?1:0)+(o.t==='filter'&&okI(FIMG)?'i':'')+(o.t==='filter'?(o.d.q?'q':'')+(o.d.out||o.d.be?'o':'')+(o.d.bar?'B'+Math.round((o.d.bu|0)/6):'')+(o.d.q&&!hasRecv(o.d)?'!':''):'')+o.x+','+o.y;
  if(r&&(!near||r.sig!==sig)){for(const m of r.ms)scene.remove(m);M3.delete(o);r=null}if(!near)continue;
  if(!r){r={sig,ms:[]};for(const c of cardsFor(o)){const m=new Tt.Mesh(geo,V.T15.cardMat(tex(o,c.key,c.draw,c.cw,c.ch)));m.scale.set(c.w,c.h*V.T15.CARD,1);m.position.set(c.x,0,c.z+.02);scene.add(m);r.ms.push(m)}M3.set(o,r)}}
 for(const[o,r]of M3)if(!OBJ.includes(o)){for(const m of r.ms)scene.remove(m);M3.delete(o)}
 if(PL&&!ih){const R=rectOf(PL);if(!ghost){ghost=new Tt.Mesh(new Tt.PlaneGeometry(1,1),new Tt.MeshBasicMaterial({color:0x35d06a,transparent:true,opacity:.5,depthWrite:false}));ghost.rotation.x=-Math.PI/2;scene.add(ghost)}
  ghost.material.color.setHex(PL.why?0xff4040:0x35d06a);ghost.scale.set(R[2]-R[0],R[3]-R[1],1);ghost.position.set((R[0]+R[2])/2,.07,(R[1]+R[3])/2);ghost.visible=true}else if(ghost)ghost.visible=false}
setInterval(()=>{try{upd3()}catch(e){if(!B28.e3){B28.e3=String(e&&e.stack||e);console.warn('[B28] 2.5D',e)}}},150);
/* SB6: chuẩn hóa thiết bị khôi phục – cùng quy tắc với lúc tải save (set); cấp phải đúng 1..3, không đoán */
function normD(t,lv,dd){dd=dd||{};if(t==='filter'){const L=FLV[lv];const q=clamp(dd.q|0,0,L.cap),out=clamp(dd.out|0,0,BE_MAX),be=clamp(dd.be|0,0,BE_MAX-out),bar=dd.bar?1:0,bu=bar?clamp(dd.bu|0,0,BU_MAX):0;return{q,out,pr:clamp(+dd.pr||0,0,L.h),be,bar,bu}}
 if(t==='storage'){const it={};if(dd.it&&typeof dd.it==='object')for(const k in dd.it){const n=dd.it[k]|0;if(n>0&&STK[k]&&k!=='eat')it[k]=n}const EQ=X.EQ||{};return{it,eq:Array.isArray(dd.eq)?dd.eq.filter(id=>EQ[id]):[]}}return null}
function mkRestored(r){if(!r||(r.t!=='filter'&&r.t!=='storage')||!PL)return null;const lv=r.lv;if(lv!==1&&lv!==2&&lv!==3)return null;let id;do{id='bx'+(++seq)}while(OBJ.some(q=>q.id===id));return{id,t:r.t,x:PL.x,y:PL.y,rot:PL.rot,lv,open:false,d:normD(r.t,lv,r.d)}}
/* ---------- lưu ---------- */
SAVE.register({id:'b28',scope:'world',version:3,migrate:(d,v)=>{if(d&&Array.isArray(d.list))for(const a of d.list)if(Array.isArray(a)&&a[1]==='filter'&&a[7]){if(v<2)a[7].pr=0;if(v<3){a[7].be=Math.min(BE_MAX,a[7].q|0);a[7].bar=0;a[7].bu=0}}return d},/* L31: chai nước bẩn đã đổ vào máy bản cũ → thành chai hứng (không mất chai) */defaults:()=>({seq:0,list:[]}),validate:d=>d&&Array.isArray(d.list),
 get:()=>({seq,list:OBJ.map(o=>[o.id,o.t,+o.x.toFixed(2),+o.y.toFixed(2),o.rot|0,o.lv|0,o.open?1:0,o.d?JSON.parse(JSON.stringify(o.d)):null])}),
 set:d=>{closeAll();stopPlace();for(const o of OBJ.slice())delObj(o);seq=Math.max(0,d.seq|0);const ids=new Set();
  for(const a of d.list){if(!Array.isArray(a)||!T[a[1]]||!isFinite(a[2])||!isFinite(a[3]))continue;const id=String(a[0]||'');if(!/^bx\d+$/.test(id)||ids.has(id))continue;ids.add(id);seq=Math.max(seq,+id.slice(2));
   const t=a[1],o={id,t,x:+a[2],y:+a[3],rot:a[4]?1:0,lv:clamp(a[5]|0,1,3),open:!!a[6],d:null};const dd=a[7]||{};
   if(t==='filter'){const L=FLV[o.lv];const q=clamp(dd.q|0,0,L.cap),out=clamp(dd.out|0,0,BE_MAX),be=clamp(dd.be|0,0,BE_MAX-out),bar=dd.bar?1:0,bu=bar?clamp(dd.bu|0,0,BU_MAX):0;o.d={q,out,pr:clamp(+dd.pr||0,0,L.h),be,bar,bu}}
   else if(t==='storage'){const it={};if(dd.it&&typeof dd.it==='object')for(const k in dd.it){const n=dd.it[k]|0;if(n>0&&STK[k]&&k!=='eat')it[k]=n}const EQ=X.EQ||{};o.d={it,eq:Array.isArray(dd.eq)?dd.eq.filter(id=>EQ[id]):[]}}
   addObj(o)}}});
const B28={OBJ,T,FLV,SLV,BE_MAX,BU_MAX,normD,canPlace,startPlace,confirmPlace,stopPlace,openPanel,closeAll,toggleGate,rectOf,myLot,waterNear,sIn,sOut,used,get PL(){return PL},get OPEN(){return OPEN}};globalThis.B28=B28;
})();
