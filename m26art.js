/* =====================================================================
   SAFE HAVEN V2 · BẢN THỬ 2.500 m · m26art.js (Lần 7) — CHỈ HIỂN THỊ BẢN ĐỒ
   - Vẽ một lớp cảnh quan dựng sẵn (dựng 1 lần khi mở bản đồ lần đầu), rồi chỉ drawImage → không tốn FPS khi chơi
   - 2 chế độ: 'dh' Địa hình (cảnh quan, ít nhãn) · 'kv' Khu vực (màu nhận diện, ranh giới, 8 tên, khóa/mở)
   - Nền và mặt nạ dùng đúng W15.ZV2 / zoneAt2 (cả vùng đệm và thứ tự ưu tiên)
   - Không đọc/ghi save, không đổi toạ độ/va chạm/ID/AI
   ===================================================================== */
(()=>{
const ZC={'Thành Phố Thiên Đường':['#e9cf6a','#e02020','🏙'],'Rừng Suối Mây':['#4f9a45','#8e44c8','🌲'],'Đỉnh Bạch Vân':['#8fb6dc','#2a6fc0','🏔'],
 'Hang Pha Lê':['#8a5fc4','#b07ef0','💎'],'Khu Di Tích Cổ':['#d9a75a','#e0b020','🏛'],'Cảng Hải Lam':['#e6d39a','#1d8ac0','⚓'],
 'Khu Công Nghiệp Zeta':['#8d8f96','#d8d8e0','🏭'],'Vực Dung Nham':['#7a2b1f','#ffb020','🌋']};
const NAT={'Thành Phố Thiên Đường':'#cdbf94','Rừng Suối Mây':'#4f8f45','Đỉnh Bạch Vân':'#9eacb8','Hang Pha Lê':'#7a6496','Khu Di Tích Cổ':'#c8a670','Cảng Hải Lam':'#d8c89a','Khu Công Nghiệp Zeta':'#8b8d91','Vực Dung Nham':'#5f2b22'};
const A={mode:'kv',cvs:{},cv:null,ms:0,dev:0,S:2,disp:null,bounds:null,lab:null};
if(globalThis.TERRAIN8)TERRAIN8.onInvalidate(()=>{A.cvs={};A.cv=null;A.disp=null;A.bounds=null;A.lab=null});      // S = mét / px của lớp cảnh quan
let rs=1;const R=()=>(rs=(rs*16807)%2147483647)/2147483647,seed=n=>{rs=(n%2147483646)+1};
const pip=(x,y,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
const dseg=(x,y,P)=>{let b=1e18;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[j],c=P[i],dx=c[0]-a[0],dy=c[1]-a[1],L=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/L)),ex=a[0]+t*dx-x,ey=a[1]+t*dy-y;b=Math.min(b,ex*ex+ey*ey)}return Math.sqrt(b)};
/* ranh giới mềm (chỉ để vẽ): chia đều 8 m → Chaikin 2 lần → gợn ±3 m theo pháp tuyến */
function soft(P,k){const Q=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/8));for(let j=0;j<n;j++)Q.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n])}
 let S=Q;for(let it=0;it<2;it++){const T=[];for(let i=0;i<S.length;i++){const a=S[i],b=S[(i+1)%S.length];T.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75])}S=T}
 const N=S.length;return S.map((p,i)=>{const a=S[(i-1+N)%N],b=S[(i+1)%N],tx=b[0]-a[0],ty=b[1]-a[1],L=Math.hypot(tx,ty)||1,w=Math.sin(i*.37+k)*1.8+Math.sin(i*.11+k*2)*1.2;return[p[0]-ty/L*w,p[1]+tx/L*w]})}
function path(g,P,X,Y){g.beginPath();P.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.closePath()}
function line(g,P,X,Y){g.beginPath();P.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])))}
/* điểm đặt nhãn: điểm trong khu xa ranh giới nhất, tránh căn cứ */
function labelAt(z,bases){const P=z.poly;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of P){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])}
 let best=null,bd=-1;for(let x=x0;x<=x1;x+=20)for(let y=y0;y<=y1;y+=20){if(!pip(x,y,P)||(globalThis.TERRAIN8&&TERRAIN8.zoneAt(x,y)!==z))continue;let d=dseg(x,y,P);for(const b of bases)d=Math.min(d,Math.hypot(x-b[0],y-b[1])-40);if(d>bd){bd=d;best=[x,y]}}return best}
function build(mode){globalThis.TERRAIN8?.sync();mode=mode||A.mode;const t0=performance.now(),W15=globalThis.W15,V=W15.V2,WB=SH.WB,S=A.S,N=Math.round(WB.w/S);
 const cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d');const X=x=>(x-WB.x0)/S,Y=y=>(y-WB.y0)/S;
 /* 1. nền hoang dã: xanh rừng sẫm + vân đốm */
 g.fillStyle='#2f6b30';g.fillRect(0,0,N,N);seed(7);for(let i=0;i<9000;i++){const x=R()*N,y=R()*N,r=2+R()*7;g.fillStyle=R()<.5?'rgba(70,130,60,.18)':'rgba(20,60,25,.2)';g.beginPath();g.arc(x,y,r,0,7);g.fill()}
 /* 2. khu: nền + họa tiết riêng, cắt theo ranh giới chuẩn */
 A.disp={};A.bounds={};for(const z of W15.ZV2){const P=z.poly;A.disp[z.n]=P}
 let dev=0;for(const z of W15.ZV2){const P=A.disp[z.n];for(let i=0;i<P.length;i+=3)dev=Math.max(dev,dseg(P[i][0],P[i][1],z.poly))}A.dev=dev;
 for(const z of W15.ZV2){const P=A.disp[z.n],c0=ZC[z.n]||['#557','#99a'],c=[mode==='kv'?c0[0]:(NAT[z.n]||c0[0]),c0[1]];let [x0,y0,x1,y1]=z.bb;A.bounds[z.n]=z.bb.slice();
  g.save();if(globalThis.TERRAIN8)TERRAIN8.clip(g,z,X,Y);else{path(g,P,X,Y);g.clip()}const cx=X((x0+x1)/2),cy=Y((y0+y1)/2),rr=Math.max(x1-x0,y1-y0)/S;
  const gr=g.createRadialGradient(cx,cy,rr*.05,cx,cy,rr*.75);gr.addColorStop(0,c[0]);gr.addColorStop(1,shade(c[0],-.18));g.fillStyle=gr;g.fillRect(X(x0)-2,Y(y0)-2,(x1-x0)/S+4,(y1-y0)/S+4);
  seed(z.n.length*131+7);const rnd=()=>[x0+R()*(x1-x0),y0+R()*(y1-y0)],inside=p=>globalThis.TERRAIN8?TERRAIN8.zoneAt(p[0],p[1])===z:pip(p[0],p[1],z.poly);
  motif(g,z.n,X,Y,S,rnd,inside,x0,y0,x1,y1);g.restore()}
 /* Region fills and motifs use exact canonical ownership; no displaced soft masks. */
 /* 4. cây thật (bảng toạ độ) chấm nhỏ → mật độ rừng đúng thực tế */
 const M=globalThis.MAP26;if(M){g.fillStyle='rgba(18,58,22,.55)';for(let i=0;i<M.T.length;i+=2){const t=M.T[i];g.fillRect(X(t[1])-.5,Y(t[2])-.5,1.2,1.2)}
  g.fillStyle='rgba(14,50,22,.6)';for(const f of M.F8)g.fillRect(X(f[1])-.5,Y(f[2])-.5,1.3,1.3)}
 /* 5. nước: hồ/biển có bãi cát + chuyển sâu */
 for(const l of W15.LKS){const pts=k=>{const Q=[];for(let i=0;i<64;i++){const a=i/64*Math.PI*2,r=l.r*l.k[i]*k;Q.push([l.x+Math.cos(a)*r,l.y+Math.sin(a)*r*l.ry])}return Q};
  g.fillStyle='rgba(226,206,150,.95)';path(g,pts(1)/*bãi*/,X,Y);g.lineWidth=Math.max(3,8/S);g.strokeStyle='rgba(226,206,150,.9)';g.stroke();
  g.fillStyle=l.sea?'#1f5e95':'#2b77b3';path(g,pts(1),X,Y);g.fill();g.fillStyle=l.sea?'#174a7a':'#225f97';path(g,pts(.7),X,Y);g.fill();
  g.strokeStyle='rgba(220,240,255,.35)';g.lineWidth=1;for(const k of [.92,.82]){path(g,pts(k),X,Y);g.stroke()}}
 /* 6. sông theo hình học thật (W15.RV): bờ cát → nước → dòng giữa sáng */
 g.lineCap=g.lineJoin='round';for(const [col,f,add] of [['rgba(214,196,140,.9)',1,6],['#1e6fc8',1,0],['rgba(110,190,255,.9)',.45,0]])for(const r of W15.RV){
  for(let i=0;i<r.N-1;i+=2){const j=Math.min(r.N-1,i+2),lw=(r.HW[i]*2*f+add)/S;if(f<1&&lw<1.6)continue;g.strokeStyle=col;g.lineWidth=Math.max(add?3.5:2.4,lw);g.beginPath();g.moveTo(X(r.X[i]),Y(r.Y[i]));g.lineTo(X(r.X[j]),Y(r.Y[j]));g.stroke()}}
 /* 6b. thác: vệt nước trắng đổ ngang dòng + bọt (đúng vị trí W15.FALLS) */
 for(const f of W15.FALLS){const x=X(f.x),y=Y(f.y),w=Math.max(4,(f.w||12)/S);g.fillStyle='rgba(255,255,255,.95)';g.fillRect(x-w/2,y-1.5,w,3);g.fillStyle='rgba(235,248,255,.8)';for(let k=-2;k<=2;k++){g.beginPath();g.arc(x+k*w/5,y+2.5,1.3,0,7);g.fill()}}
 /* 7. vách đá */
 for(const c of V.cliffs){g.strokeStyle='#4a3020';g.lineWidth=Math.max(2,5/S);line(g,c.p,X,Y);g.stroke();g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=1;line(g,c.p,X,Y);g.stroke()}
 /* 8. đường: chính (viền sẫm + mặt đất nện), mòn (nét đứt), phố (xám) */
 const rl=r=>{if(globalThis.M26RD)M26RD.path(g,r,X,Y);else line(g,r.p,X,Y)};for(const r of V.roads.concat(V.links)){const w=Math.max(1.6,r.w/S);g.strokeStyle='rgba(60,40,20,.55)';g.lineWidth=w+2;rl(r);g.stroke();g.strokeStyle=r.w>=6?'#d9b98a':'#c4a070';g.lineWidth=w;if(r.w<6)g.setLineDash([4,3]);rl(r);g.stroke();g.setLineDash([])}
 for(const r of V.streets){g.strokeStyle='#5f6168';g.lineWidth=Math.max(1.4,(r.w||8)/S+1);line(g,r.p,X,Y);g.stroke();g.strokeStyle='#d9d6cc';g.lineWidth=Math.max(.8,(r.w||8)/S*.6);line(g,r.p,X,Y);g.stroke()}
 for(const pc of V.cwall.pieces){g.strokeStyle='#7d6f62';g.lineWidth=2.4;line(g,pc,X,Y);g.stroke();g.strokeStyle='#d8cdb8';g.lineWidth=1;line(g,pc,X,Y);g.stroke()}
 /* 9. cầu */
 for(const b of W15.M3.BRG){g.save();g.translate(X(b.x),Y(b.y));g.rotate(Math.atan2(b.uy,b.ux));const L=Math.max(5,b.hl*2/S),Wd=Math.max(3,b.hw*2/S);g.fillStyle='#7a4f2a';g.fillRect(-L/2,-Wd/2,L,Wd);g.strokeStyle='#3a2410';g.lineWidth=1;g.strokeRect(-L/2,-Wd/2,L,Wd);g.restore()}
 A.cvs[mode]=cv;A.cv=cv;const bases=[[0,0]].concat(W15.M3.houses.map(h=>h.at));A.lab={};for(const z of W15.ZV2)A.lab[z.n]=labelAt(z,bases);A.ms=performance.now()-t0}
function shade(h,f){const n=parseInt(h.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const m=v=>Math.max(0,Math.min(255,Math.round(v+(f<0?v*f:(255-v)*f))));return'rgb('+m(r)+','+m(g)+','+m(b)+')'}
function hexA(h,a){const n=parseInt(h.slice(1),16);return'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')'}
function motif(g,n,X,Y,S,rnd,inside,x0,y0,x1,y1){const tri=(p,w,h,c1,c2,snow)=>{const x=X(p[0]),y=Y(p[1]);g.fillStyle=c1;g.beginPath();g.moveTo(x-w,y);g.lineTo(x,y-h);g.lineTo(x+w,y);g.fill();g.fillStyle=c2;g.beginPath();g.moveTo(x,y-h);g.lineTo(x+w,y);g.lineTo(x+w*.15,y);g.fill();if(snow){g.fillStyle='#f4f8ff';g.beginPath();g.moveTo(x-w*.35,y-h*.62);g.lineTo(x,y-h);g.lineTo(x+w*.38,y-h*.6);g.lineTo(x+w*.1,y-h*.66);g.fill()}};
 const each=(k,f)=>{for(let i=0,n=0;i<k*6&&n<k;i++){const p=rnd();if(!inside(p))continue;n++;f(p)}};
 if(n==='Rừng Suối Mây'){each(60,p=>{const r=12+R()*22;const gg=g.createRadialGradient(X(p[0]),Y(p[1]),1,X(p[0]),Y(p[1]),r);gg.addColorStop(0,'rgba(140,200,110,.35)');gg.addColorStop(1,'rgba(140,200,110,0)');g.fillStyle=gg;g.fillRect(X(p[0])-r,Y(p[1])-r,2*r,2*r)})}
 else if(n==='Đỉnh Bạch Vân'){g.fillStyle='rgba(255,255,255,.18)';each(80,p=>{g.beginPath();g.arc(X(p[0]),Y(p[1]),3+R()*6,0,7);g.fill()});const L=[];each(26,p=>L.push(p));L.sort((a,b)=>a[1]-b[1]).forEach(p=>tri(p,10+R()*10,14+R()*14,'#6f7f93','#56657a',true))}
 else if(n==='Hang Pha Lê'){each(70,p=>{const x=X(p[0]),y=Y(p[1]),h=4+R()*8,c=R()<.5?'rgba(200,160,255,.9)':'rgba(120,230,255,.8)';g.fillStyle=c;g.beginPath();g.moveTo(x-2,y);g.lineTo(x,y-h);g.lineTo(x+2,y);g.fill()});g.fillStyle='rgba(40,10,70,.25)';each(20,p=>{g.beginPath();g.arc(X(p[0]),Y(p[1]),5+R()*8,0,7);g.fill()})}
 else if(n==='Khu Di Tích Cổ'){g.fillStyle='rgba(150,100,40,.18)';each(50,p=>{g.beginPath();g.arc(X(p[0]),Y(p[1]),4+R()*9,0,7);g.fill()});each(40,p=>{const x=X(p[0]),y=Y(p[1]);g.fillStyle='#b9ac92';g.fillRect(x-1.5,y-6,3,6);g.fillStyle='#857a66';g.fillRect(x-2.5,y,5,1.5)});g.fillStyle='rgba(120,110,95,.7)';each(40,p=>g.fillRect(X(p[0]),Y(p[1]),3+R()*3,2))}
 else if(n==='Cảng Hải Lam'){g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;each(40,p=>{const x=X(p[0]),y=Y(p[1]);g.beginPath();g.moveTo(x-5,y);g.quadraticCurveTo(x-2,y-2,x,y);g.quadraticCurveTo(x+2,y+2,x+5,y);g.stroke()});g.fillStyle='rgba(190,160,100,.35)';each(40,p=>{g.beginPath();g.arc(X(p[0]),Y(p[1]),2+R()*4,0,7);g.fill()})}
 else if(n==='Khu Công Nghiệp Zeta'){g.strokeStyle='rgba(60,62,70,.35)';g.lineWidth=1;for(let x=Math.floor(x0/40)*40;x<x1;x+=40){g.beginPath();g.moveTo(X(x),Y(y0));g.lineTo(X(x),Y(y1));g.stroke()}for(let y=Math.floor(y0/40)*40;y<y1;y+=40){g.beginPath();g.moveTo(X(x0),Y(y));g.lineTo(X(x1),Y(y));g.stroke()}
  each(30,p=>{const x=X(p[0]),y=Y(p[1]),w=5+R()*8,h=4+R()*6;g.fillStyle='#6b6e76';g.fillRect(x,y,w,h);g.fillStyle='rgba(255,255,255,.15)';g.fillRect(x,y,w,1)});each(14,p=>{g.fillStyle='#a3a6ad';g.beginPath();g.arc(X(p[0]),Y(p[1]),3+R()*2,0,7);g.fill();g.strokeStyle='#5a5c63';g.stroke()})}
 else if(n==='Vực Dung Nham'){g.fillStyle='rgba(30,10,8,.35)';each(40,p=>{g.beginPath();g.arc(X(p[0]),Y(p[1]),4+R()*9,0,7);g.fill()});g.lineCap='round';each(22,p=>{let x=X(p[0]),y=Y(p[1]);g.strokeStyle='rgba(255,'+(110+R()*80|0)+',30,.9)';g.lineWidth=1.4;g.beginPath();g.moveTo(x,y);for(let k=0;k<4;k++){x+=(R()-.5)*14;y+=(R()-.5)*14;g.lineTo(x,y)}g.stroke()});
  const L=[];each(10,p=>L.push(p));L.sort((a,b)=>a[1]-b[1]).forEach(p=>{tri(p,9+R()*6,10+R()*8,'#3b1a14','#2a120e',false);g.fillStyle='rgba(255,140,30,.9)';g.beginPath();g.arc(X(p[0]),Y(p[1])-11,1.6,0,7);g.fill()})}
 else if(n==='Thành Phố Thiên Đường'){g.fillStyle='rgba(120,110,90,.18)';for(let x=Math.floor(x0/30)*30;x<x1;x+=30)for(let y=Math.floor(y0/30)*30;y<y1;y+=30)if(R()<.55)g.fillRect(X(x+4),Y(y+4),22/S,22/S)}}
/* vẽ vào bản đồ thế giới (thay W15.wmBase) */
function wmBase(g,X,Y,K,d){globalThis.TERRAIN8?.sync();if(!A.cvs[A.mode])build(A.mode);const cv=A.cvs[A.mode],WB=SH.WB,S=A.S;g.imageSmoothingEnabled=true;g.drawImage(cv,X(WB.x0),Y(WB.y0),cv.width*S*K,cv.height*S*K);
 const kv=A.mode==='kv';
 for(const z of W15.ZV2){const P=A.disp[z.n],c=ZC[z.n];if(!c)continue;g.save();if(globalThis.TERRAIN8)TERRAIN8.clip(g,z,X,Y);
  if(kv){path(g,P,X,Y);g.lineWidth=Math.max(2,3*d);g.strokeStyle=c[1];if(!z.open)g.setLineDash([9*d,5*d]);g.stroke();g.setLineDash([])}
  else{path(g,P,X,Y);g.lineWidth=Math.max(1,1.2*d);g.strokeStyle='rgba(255,255,255,.22)';g.stroke()}g.restore()}
 g.textAlign='center';g.textBaseline='middle';
 for(const z of W15.ZV2){const p=A.lab[z.n];if(!p)continue;const x=X(p[0]),y=Y(p[1]),c=ZC[z.n]||['#557','#99a','?'];
  if(kv){const t=(z.open?'':'🔒 ')+z.n;g.font='bold '+Math.round(12*d)+'px system-ui';const w=g.measureText(t).width+12*d,h=18*d;g.fillStyle='rgba(16,20,30,.72)';rr(g,x-w/2,y-h/2,w,h,7*d);g.fill();g.strokeStyle=c[1];g.lineWidth=1.5*d;g.stroke();g.fillStyle=z.open?'#fff':'#ffd9d0';g.fillText(t,x,y+.5*d)}
  else{g.font='600 '+Math.round(11*d)+'px system-ui';g.lineWidth=3*d;g.strokeStyle='rgba(0,0,0,.45)';g.strokeText(z.n,x,y);g.fillStyle='rgba(255,255,255,.82)';g.fillText(z.n,x,y)}}
 /* căn cứ: 6 vòng đỏ nhỏ, không che đường */
 const B=[[0,0,'1']].concat(W15.M3.houses.map((h,i)=>[h.at[0],h.at[1],String(i+2)]));for(const b of B){const x=X(b[0]),y=Y(b[1]);g.fillStyle='#e8141c';g.beginPath();g.arc(x,y,6*d,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=1.2*d;g.stroke();g.fillStyle='#fff';g.font='bold '+Math.round(8*d)+'px system-ui';g.fillText(b[2],x,y+.5*d)}}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
/* nút chuyển chế độ + chú thích (gắn vào khung bản đồ khi mở) */
function ui(p){let u=p.querySelector('#m26mm');if(!u){u=document.createElement('div');u.id='m26mm';u.style.cssText='position:absolute;left:10px;top:10px;z-index:5;display:flex;flex-direction:column;gap:6px;font:12px system-ui;color:#fff;pointer-events:auto';p.style.position=p.style.position||'fixed';p.appendChild(u)}
 const btn=(m,t)=>'<button data-m="'+m+'" style="padding:4px 9px;border-radius:8px;border:1px solid #888;background:'+(A.mode===m?'#f2c94c;color:#111':'rgba(20,20,30,.8);color:#fff')+';font:600 12px system-ui">'+t+'</button>';
 const leg=A.mode==='kv'?Object.entries(ZC).map(([n,c])=>'<div style="display:flex;align-items:center;gap:5px"><i style="width:11px;height:11px;border-radius:3px;background:'+c[0]+';border:2px solid '+c[1]+'"></i>'+n+'</div>').join('')+'<div>🔒 khu tạm khóa · viền liền: khu mở</div>'
  :'<div>━ đường chính · ┅ đường mòn</div><div style="color:#8fd0ff">━ sông / suối</div><div>▬ cầu · ▲ núi · ● căn cứ 1–6</div>';
 u.innerHTML='<div style="display:flex;gap:4px">'+btn('dh','🌄 Địa hình')+btn('kv','🗺 Khu vực')+'</div><div style="background:rgba(16,20,30,.72);border-radius:8px;padding:6px 8px;display:flex;flex-direction:column;gap:3px;max-width:200px">'+leg+'</div>';
 u.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();A.mode=b.dataset.m;ui(p);globalThis.M26_drawWM&&M26_drawWM()})}
globalThis.M26ART={A,build,wmBase,ui,soft,get mode(){return A.mode},set mode(m){A.mode=m}};
const hook=()=>{if(globalThis.W15&&W15.ZV2){W15.wmBase=wmBase;return true}return false};if(!hook())addEventListener('load',hook);
})();
