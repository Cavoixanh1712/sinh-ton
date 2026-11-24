/* KCN34 (22/11): KHU CÔNG NGHIỆP ZETA – mở khoá + quy hoạch khu công nghiệp bỏ hoang.
   - Dữ liệu tất định: kcn34-data.js (đường chính/nhánh/lối nội bộ, 5 nhà máy, 2 kho, xưởng cơ khí, trạm điện,
     bãi container, bãi phế liệu, nhà bảo vệ, khu nguy hiểm, hàng rào, đèn đường, cây dại, phế liệu, 3 nhà an toàn).
   - Chỉ thêm vào trong khu Zeta; không dời/xoá gì ở khu khác. Không ghi vào save (trạng thái lục đồ lưu riêng ở localStorage).
   - Thứ tự an toàn: chữ ký thế giới (WORLD.sig) đã chốt trước khi thêm quái → save cũ vẫn khớp.
   - Lỗi dữ liệu → không thêm gì (khu vẫn trống như cũ). */
(()=>{'use strict';const D=globalThis.KCN34_DATA,SH=globalThis.SH,W=globalThis.W15,M=globalThis.MAP26;
const ST={rev:36,applied:false,error:null,props:0,cols:0,walls:0,cleared:{D:0,K:0,C:0,Z:0,dec:0},loot:0,enemies:0,b3:0,mode3:false};
globalThis.KCN34={stats:ST};
if(!D||!SH||!W||!SH.X){ST.error='thiếu dữ liệu/SH/W15';console.warn('[KCN34]',ST.error);return}
const X=SH.X,S=SH.S,pos=SH.pos,AS=SH.AS,SW=SH.SW;
const say=m=>{try{SH.say(m)}catch(_){}},IH=()=>!!(SH.IH&&SH.IH()),GT=()=>+SH.GT||0;
const inR=(r,x,y,m=0)=>x>r[0]-m&&x<r[2]+m&&y>r[1]-m&&y<r[3]+m;
const ovl=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
const ZONE=()=>W.ZV2&&W.ZV2.find(z=>z.n==='Khu Công Nghiệp Zeta');
const ZB=[96,262,524,592];
function rng(s){s=(s|0)||1;return()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* ---------------- 1) hình ảnh ---------------- */
const KEYMAP={k_lamp:'lampk'};// đèn còn sáng: tên bắt đầu bằng "lamp" → ban đêm có quầng sáng như đèn phố có sẵn
function art(){for(const k in D.art){const q=D.art[k],kk=KEYMAP[k]||k;if(AS[kk])continue;const a={u:'kcn34/'+k+'.webp?rev=36',w:q[0],h:q[1]};a.i=new Image();a.i.src=a.u;AS[kk]=a;SW[kk]=q[2]}}

/* ---------------- 2) dọn đồ trang trí/đá bảng cũ nằm trên đường, lô, nhà, sân ---------------- */
function clearTables(){if(!M)return;const CL=D.clear,hit=(x,y)=>{if(!inR(ZB,x,y))return false;for(const r of CL)if(inR(r,x,y))return true;return false};
 const cut=(a,f,k)=>{if(!a)return;let n=0;const n0=a.length;for(const o of a)if(!f(o))a[n++]=o;a.length=n;ST.cleared[k]+=n0-n};
 cut(M.D,q=>hit(q[1],q[2]),'D');cut(M.K,q=>hit(q[1],q[2]),'K');cut(M.Z,q=>hit(q[1],q[2]),'Z');
 cut(M.C,c=>hit((c.x0+c.x1)/2,(c.z0+c.z1)/2),'C');if(M.FD)cut(M.FD,q=>hit(q[1],q[2]),'D')}

/* ---------------- 2b) biển tên công trình (vẽ chữ trên canvas) ---------------- */
function signs(){for(let i=0;i<(D.signs||[]).length;i++){const[t,x,y]=D.signs[i],key='kcns'+i;if(!AS[key]){const wm=Math.min(4.4,1.5+t.length*.085),hm=2.3,ppm=90,c=document.createElement('canvas');c.width=Math.round(wm*ppm);c.height=Math.round(hm*ppm);const g=c.getContext('2d'),W=c.width,H=c.height;
  g.fillStyle='#5a5a62';g.fillRect(W*.12,H*.35,W*.04,H*.65);g.fillRect(W*.84,H*.35,W*.04,H*.65);
  g.fillStyle='#24486e';g.fillRect(W*.03,H*.04,W*.94,H*.52);g.strokeStyle='#d8dde4';g.lineWidth=Math.max(2,H*.018);g.strokeRect(W*.06,H*.08,W*.88,H*.44);
  g.fillStyle='#f2efe6';g.textAlign='center';g.textBaseline='middle';let fs=H*.17;g.font='bold '+fs+'px system-ui,sans-serif';const words=t.split(' ');let lines=[t];if(g.measureText(t).width>W*.82){const mid=Math.ceil(words.length/2);lines=[words.slice(0,mid).join(' '),words.slice(mid).join(' ')];fs=H*.14;g.font='bold '+fs+'px system-ui,sans-serif'}
  lines.forEach((l,k)=>g.fillText(l,W/2,H*.3+(k-(lines.length-1)/2)*fs*1.1,W*.84));
  const R=rng(i*7+3);for(let k=0;k<40;k++){g.fillStyle='rgba('+(130+R()*30|0)+',70,36,'+(.15+R()*.3)+')';g.beginPath();g.ellipse(W*.03+R()*W*.94,H*.04+R()*H*.52,2+R()*5,1+R()*3,0,0,7);g.fill()}
  const a={u:c.toDataURL('image/png'),w:W,h:H};a.i=new Image();a.i.src=a.u;AS[key]=a;SW[key]=wm}
 const o=[key,x,y,SW[key]];o.kcn=1;SH.DEC.push(o);MINE.push(o)}}
function pois(){return D.zones.map((z,i)=>({x:z.x,y:z.y,k:'kcn:'+i,n:z.n,d:z.d,ic:z.ic,kcnIc:z.ic,kind:'kcn'}))}
globalThis.KCN34.pois=pois;

/* ---------------- 3) đồ vật + va chạm ---------------- */
const MINE=[],COLS=[],D3=[];// D3: thay bằng mô hình 3D ở chế độ 2.5D (bồn, ống khói, cẩu giàn)
function place(){for(const p of D.props){const[k,x,y,w,c,f]=p;if(k==='k_none'){}else{const o=[KEYMAP[k]||k,x,y,w];o.kcn=1;if(f===3||f===1){o.k3=k;D3.push(o)}SH.DEC.push(o);MINE.push(o);ST.props++}
  if(c){const q={x0:c[0],x1:c[2],z0:c[1],z1:c[3],on:true,kcn:1};SH.cols.push(q);COLS.push(q);ST.cols++}}
 for(const b of D.bld)for(const w of b.walls){const r=w.r,q={x0:r[0],x1:r[2],z0:r[1],z1:r[3],on:true,kcn:1,kw:1};SH.cols.push(q);COLS.push(q);ST.walls++}
 SH.colsDirty()}

/* ---------------- 4) mặt đất (vẽ chung cho 2D và nền 2.5D) ---------------- */
function cnv(n,f){const c=document.createElement('canvas');c.width=c.height=n;f(c.getContext('2d'),n);return c}
const TX={};
function mkTex(){const R=rng(3434);
 TX.asph=cnv(256,(g,n)=>{g.fillStyle='#3d3e43';g.fillRect(0,0,n,n);for(let i=0;i<2600;i++){const v=R();g.fillStyle=v<.5?'rgba(20,20,24,.35)':'rgba(140,138,132,.28)';g.fillRect(R()*n,R()*n,1+R()*2,1+R()*2)}for(let i=0;i<10;i++){g.fillStyle='rgba(60,58,54,.25)';g.beginPath();g.ellipse(R()*n,R()*n,10+R()*40,6+R()*20,R()*3,0,7);g.fill()}});
 TX.conc=cnv(256,(g,n)=>{g.fillStyle='#a6a398';g.fillRect(0,0,n,n);for(let i=0;i<1800;i++){g.fillStyle=R()<.5?'rgba(90,88,80,.18)':'rgba(220,218,210,.2)';g.fillRect(R()*n,R()*n,1+R()*2,1+R()*2)}g.strokeStyle='rgba(70,68,62,.55)';g.lineWidth=2;for(const v of[0,128]){g.beginPath();g.moveTo(v,0);g.lineTo(v,n);g.moveTo(0,v);g.lineTo(n,v);g.stroke()}for(let i=0;i<5;i++){g.fillStyle='rgba(80,70,55,.16)';g.beginPath();g.ellipse(R()*n,R()*n,8+R()*30,6+R()*18,R()*3,0,7);g.fill()}});
 TX.floor=cnv(256,(g,n)=>{g.fillStyle='#75726b';g.fillRect(0,0,n,n);for(let i=0;i<1600;i++){g.fillStyle=R()<.5?'rgba(40,38,36,.2)':'rgba(170,166,158,.16)';g.fillRect(R()*n,R()*n,1+R()*2,1+R()*2)}g.strokeStyle='rgba(40,38,34,.28)';g.lineWidth=2;for(const v of[0,128]){g.beginPath();g.moveTo(v,0);g.lineTo(v,n);g.moveTo(0,v);g.lineTo(n,v);g.stroke()}});
 TX.gravel=cnv(256,(g,n)=>{g.fillStyle='#8c8476';g.fillRect(0,0,n,n);for(let i=0;i<3200;i++){const c=R();g.fillStyle=c<.33?'rgba(70,66,60,.22)':c<.66?'rgba(170,164,150,.25)':'rgba(120,104,84,.22)';const s=1+R()*2;g.beginPath();g.ellipse(R()*n,R()*n,s,s*.7,R()*3,0,7);g.fill()}});
 TX.yard=cnv(256,(g,n)=>{g.fillStyle='#7f7b72';g.fillRect(0,0,n,n);for(let i=0;i<2400;i++){g.fillStyle=R()<.5?'rgba(50,48,44,.3)':'rgba(170,164,150,.25)';g.fillRect(R()*n,R()*n,1+R()*2,1+R()*2)}g.strokeStyle='rgba(230,200,60,.35)';g.lineWidth=3;g.beginPath();g.moveTo(0,n*.5);g.lineTo(n,n*.5);g.stroke()});
 TX.haz=cnv(256,(g,n)=>{g.fillStyle='#7f826e';g.fillRect(0,0,n,n);for(let i=0;i<2000;i++){g.fillStyle=R()<.5?'rgba(50,54,40,.25)':'rgba(180,190,130,.2)';g.fillRect(R()*n,R()*n,1+R()*2,1+R()*2)}g.strokeStyle='rgba(50,54,40,.3)';g.lineWidth=2;g.strokeRect(1,1,n-2,n-2)});
 TX.crack=cnv(256,(g,n)=>{g.fillStyle='#86857b';g.fillRect(0,0,n,n);for(let i=0;i<2200;i++){g.fillStyle=R()<.5?'rgba(60,58,50,.25)':'rgba(120,140,80,.22)';g.fillRect(R()*n,R()*n,1+R()*2,1+R()*2)}});
 TX.park=cnv(256,(g,n)=>{g.fillStyle='#4b4c51';g.fillRect(0,0,n,n);for(let i=0;i<2400;i++){const v=R();g.fillStyle=v<.5?'rgba(25,25,30,.3)':'rgba(150,148,140,.25)';g.fillRect(R()*n,R()*n,1+R()*2,1+R()*2)}for(let i=0;i<6;i++){g.fillStyle='rgba(30,28,30,.22)';g.beginPath();g.ellipse(R()*n,R()*n,12+R()*30,6+R()*14,R()*3,0,7);g.fill()}});
 TX.oldp=cnv(256,(g,n)=>{g.fillStyle='#55554f';g.fillRect(0,0,n,n);for(let i=0;i<2400;i++){const v=R();g.fillStyle=v<.4?'rgba(25,25,30,.28)':v<.75?'rgba(160,156,146,.25)':'rgba(96,120,60,.4)';g.fillRect(R()*n,R()*n,1+R()*2,1+R()*3)}g.strokeStyle='rgba(28,26,30,.4)';g.lineWidth=2;for(let i=0;i<5;i++){let x=R()*n,y=R()*n;g.beginPath();g.moveTo(x,y);for(let k=0;k<4;k++){x+=(R()-.5)*60;y+=(R()-.5)*60;g.lineTo(x,y)}g.stroke()}});
 TX.tile=cnv(256,(g,n)=>{for(let y=0;y<n;y+=32)for(let x=0;x<n;x+=32){const v=(R()-.5)*26;g.fillStyle='rgb('+[(168+v)|0,(104+v*.7)|0,(82+v*.6)|0]+')';g.fillRect(x+1,y+1,30,30);if(R()<.07){g.fillStyle='rgba(60,50,40,.55)';g.fillRect(x+1,y+1,30,30)}}g.fillStyle='rgba(70,52,40,.5)';for(let i=0;i<9;i++){g.fillRect(R()*n,R()*n,2,6+R()*10)}for(let i=0;i<500;i++){g.fillStyle='rgba(40,30,26,.2)';g.fillRect(R()*n,R()*n,1+R()*2,1+R()*2)}g.fillStyle='rgba(78,104,50,.55)';for(let i=0;i<60;i++){const v=R()<.5;g.fillRect(v?((R()*8|0)*32):R()*n,v?R()*n:((R()*8|0)*32),v?2:3+R()*8,v?3+R()*8:2)}g.fillStyle='rgba(30,26,22,.35)';for(let i=0;i<6;i++){const x=(R()*8|0)*32,y=(R()*8|0)*32;g.fillRect(x+1,y+1,30,30)}});
 TX.street=cnv(256,(g,n)=>{g.fillStyle='#7c7a74';g.fillRect(0,0,n,n);for(let y=0;y<n;y+=21)for(let x=(y/21%2)*16;x<n+32;x+=32){const v=(R()-.5)*24;g.fillStyle='rgb('+[(150+v)|0,(146+v)|0,(138+v)|0]+')';g.fillRect(x-31,y+1,30,19)}for(let i=0;i<1100;i++){g.fillStyle=R()<.5?'rgba(40,38,34,.25)':'rgba(86,112,52,.45)';g.fillRect(R()*n,R()*n,1+R()*2,1+R()*3)}for(let i=0;i<8;i++){g.fillStyle='rgba(60,54,44,.25)';g.beginPath();g.ellipse(R()*n,R()*n,10+R()*20,6+R()*12,R()*3,0,7);g.fill()}});
 TX.weed=cnv(256,(g,n)=>{g.fillStyle='#6f7d4a';g.fillRect(0,0,n,n);for(let i=0;i<3800;i++){const c=R();g.fillStyle=c<.4?'rgba(70,96,40,.6)':c<.75?'rgba(130,150,70,.5)':'rgba(110,96,70,.45)';g.fillRect(R()*n,R()*n,1+R()*2,2+R()*4)}});
}
const PC=new WeakMap();
function pat(g,key,m,X,Y,Z,YS){let o=PC.get(g);if(!o)PC.set(g,o={});let p=o[key];if(!p){p=g.createPattern(TX[key],'repeat');o[key]=p}if(!p)return null;const k=m/TX[key].width;try{p.setTransform(new DOMMatrix([Z*k,0,0,Z*YS*k,X(0),Y(0)]))}catch(_){}return p}
const PADM={park:['park',5],oldpark:['oldp',5],tile:['tile',4],street:['street',3],floor:['floor',4],conc:['conc',4],yard:['yard',5],gravel:['gravel',3],haz:['haz',4],crack:['crack',4]};
let BLOBS=null;
function blobs(){if(BLOBS)return BLOBS;BLOBS=[];const R=rng(91),Z=ZONE();const busy=[...D.pads.map(p=>p.r),...D.roads.map(r=>r.r),...D.drives.map(d=>d.r),...D.yards];
 for(let y=ZB[1];y<ZB[3];y+=6.5)for(let x=ZB[0];x<ZB[2];x+=6.5){const cx=x+R()*4,cy=y+R()*4;if(Z&&!W.zoneAt2(cx,cy))continue;if(Z&&W.zoneAt2(cx,cy)!==Z)continue;if(W.depthAt(cx,cy)>.01)continue;if(busy.some(r=>inR(r,cx,cy,1.4)))continue;
  const rr=2.4+R()*2.8,n=9,pts=[];for(let i=0;i<n;i++){const a=i/n*6.283,q=rr*(.65+R()*.5);pts.push([cx+Math.cos(a)*q,cy+Math.sin(a)*q*.85])}BLOBS.push({x:cx,y:cy,r:rr,pts,a:.35+R()*.4})}return BLOBS}
const ROADK={main:12,branch:8};
function paint(g,X,Y,Z,cx,cy,vw,vh,YS,t){const v=[cx-vw-8,cy-vh-8,cx+vw+8,cy+vh+14];if(!ovl(v,ZB))return;const vis=r=>ovl(v,r);
 const RX=r=>[X(r[0]),Y(r[1]),(r[2]-r[0])*Z,(r[3]-r[1])*Z*YS],fr=(r,f)=>{if(!vis(r))return;g.fillStyle=f;g.fillRect(...RX(r))};
 const on3=!!(SH.V25&&SH.V25.on);g.save();
 // 0) đất hoang cỏ dại
 {const p=pat(g,'weed',4,X,Y,Z,YS);if(p){g.fillStyle=p;for(const b of blobs()){if(b.x<v[0]-6||b.x>v[2]+6||b.y<v[1]-6||b.y>v[3]+6)continue;g.globalAlpha=b.a;g.beginPath();b.pts.forEach((q,i)=>i?g.lineTo(X(q[0]),Y(q[1])):g.moveTo(X(q[0]),Y(q[1])));g.closePath();g.fill()}g.globalAlpha=1}}
 // 1) nền lô
 for(const p of D.pads){if(!vis(p.r))continue;const m=PADM[p.k]||PADM.conc,pp=pat(g,m[0],m[1],X,Y,Z,YS);g.fillStyle=pp||'#8a8880';g.fillRect(...RX(p.r))}
 // ROAD41: regional road surfaces/markings use the current official boundary.
 g.save();{const zp=ZONE()?.poly;if(zp?.length){g.beginPath();zp.forEach((q,i)=>i?g.lineTo(X(q[0]),Y(q[1])):g.moveTo(X(q[0]),Y(q[1])));g.closePath();g.clip()}}
 // 2) lối nội bộ (bê tông)
 {const pp=pat(g,'conc',4,X,Y,Z,YS);for(const d of D.drives)fr(d.r,pp||'#a6a398')}
 // vạch sơn bãi đỗ (mờ)
 if(D.lines){g.strokeStyle='rgba(225,225,210,.32)';g.lineWidth=Math.max(1,.12*Z);g.beginPath();for(const l of D.lines){if(!vis([Math.min(l[0],l[2]),l[1]-1,Math.max(l[0],l[2]),l[3]+1]))continue;g.moveTo(X(l[0]),Y(l[1]));g.lineTo(X(l[2]),Y(l[3]))}g.stroke()}
 // 3) đường nhựa + bó vỉa + vạch sơn mờ
 const ap=pat(g,'asph',5,X,Y,Z,YS);
 for(const r of D.roads){if(!vis(r.r))continue;const q=r.r;if(r.kind==='main'){g.fillStyle='rgba(150,148,140,.9)';const h=q[2]-q[0]>q[3]-q[1];if(h){g.fillRect(X(q[0]),Y(q[1]-.35),(q[2]-q[0])*Z,.35*Z*YS);g.fillRect(X(q[0]),Y(q[3]),(q[2]-q[0])*Z,.35*Z*YS)}else{g.fillRect(X(q[0]-.35),Y(q[1]),.35*Z,(q[3]-q[1])*Z*YS);g.fillRect(X(q[2]),Y(q[1]),.35*Z,(q[3]-q[1])*Z*YS)}}g.fillStyle=ap||'#3d3e43';g.fillRect(...RX(q))}
 for(const r of D.roads){if(!vis(r.r))continue;const[a,b]=[r.a,r.b],h=a[1]===b[1],L=h?b[0]-a[0]:b[1]-a[1],hw=r.w/2;
  const seg=(o,col,w,dash)=>{g.strokeStyle=col;g.lineWidth=Math.max(1,w*Z);g.setLineDash(dash?[dash[0]*Z,dash[1]*Z]:[]);g.beginPath();if(h){g.moveTo(X(a[0]),Y(a[1]+o));g.lineTo(X(b[0]),Y(a[1]+o))}else{g.moveTo(X(a[0]+o),Y(a[1]));g.lineTo(X(a[0]+o),Y(b[1]))}g.stroke()};
  if(r.kind==='main'){seg(-.16,'rgba(214,170,40,.55)',.12);seg(.16,'rgba(214,170,40,.55)',.12);seg(-hw+.45,'rgba(225,225,215,.4)',.14);seg(hw-.45,'rgba(225,225,215,.4)',.14)}
  else seg(0,'rgba(225,225,215,.38)',.13,[2.2,2.6])}
 g.setLineDash([]);
 // nút giao: phủ nhựa lại + vạch qua đường
 for(const c of D.inters){const r=[c[0]-6,c[1]-6,c[0]+6,c[1]+6];if(!vis(r))continue;g.fillStyle=ap||'#3d3e43';g.fillRect(...RX(r));g.fillStyle='rgba(225,225,215,.33)';
  for(let i=-5;i<=5;i+=1.4){g.fillRect(X(c[0]+i-.3),Y(c[1]-7.6),.6*Z,1.4*Z*YS);g.fillRect(X(c[0]+i-.3),Y(c[1]+6.2),.6*Z,1.4*Z*YS);g.fillRect(X(c[0]-7.6),Y(c[1]+i-.3),1.4*Z,.6*Z*YS);g.fillRect(X(c[0]+6.2),Y(c[1]+i-.3),1.4*Z,.6*Z*YS)}}
 g.restore();/* ROAD41: other scenery retains its existing rendering. */
 // KCN36: rêu, đất, lá khô, vệt bẩn (phố ẩm thực bỏ hoang)
 if(D.grime){for(const q of D.grime){if(q[0]<v[0]-4||q[0]>v[2]+4||q[1]<v[1]-4||q[1]>v[3]+4)continue;const x=X(q[0]),y=Y(q[1]),rx=q[2]*Z,ry=q[3]*Z*YS;
   if(q[4]==='leaves'){const R=rng(q[0]*31+q[1]*7|0);for(let i=0;i<26;i++){g.fillStyle=['rgba(140,100,50,.75)','rgba(120,80,40,.7)','rgba(170,130,60,.7)','rgba(100,90,40,.7)'][i%4];g.beginPath();g.ellipse(x+(R()-.5)*rx*2,y+(R()-.5)*ry*2,.09*Z,.05*Z,R()*3,0,7);g.fill()}continue}
   const c={moss:'rgba(70,96,46,',dirt:'rgba(90,72,52,',stain:'rgba(30,26,24,'}[q[4]],a={moss:.42,dirt:.35,stain:.28}[q[4]],gr=g.createRadialGradient(x,y,0,x,y,Math.max(rx,1));gr.addColorStop(0,c+a+')');gr.addColorStop(1,c+'0)');g.fillStyle=gr;g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill()}}
 // 4) vết dầu, vết nứt
 for(const o of D.oil){if(o[0]<v[0]||o[0]>v[2]||o[1]<v[1]||o[1]>v[3])continue;const gr=g.createRadialGradient(X(o[0]),Y(o[1]),0,X(o[0]),Y(o[1]),o[2]*Z);gr.addColorStop(0,'rgba(18,16,20,.42)');gr.addColorStop(1,'rgba(18,16,20,0)');g.fillStyle=gr;g.beginPath();g.ellipse(X(o[0]),Y(o[1]),o[2]*Z,o[3]*Z*YS,0,0,7);g.fill()}
 g.strokeStyle='rgba(26,24,28,.32)';g.lineWidth=Math.max(1,.045*Z);g.lineJoin='round';
 for(const c of D.crack){const p0=c[0];if(p0[0]<v[0]||p0[0]>v[2]||p0[1]<v[1]||p0[1]>v[3])continue;g.beginPath();c.forEach((q,i)=>i?g.lineTo(X(q[0]),Y(q[1])):g.moveTo(X(q[0]),Y(q[1])));g.stroke()}
 // 5) vũng hoá chất (lung linh)
 for(const p of D.pud){if(p[0]<v[0]-4||p[0]>v[2]+4||p[1]<v[1]-4||p[1]>v[3]+4)continue;const a=.62+.1*Math.sin((t||performance.now())/420+p[0]),gr=g.createRadialGradient(X(p[0]),Y(p[1]),0,X(p[0]),Y(p[1]),p[2]*Z);gr.addColorStop(0,'rgba(170,255,90,'+a+')');gr.addColorStop(.7,'rgba(90,200,40,'+(a*.8)+')');gr.addColorStop(1,'rgba(60,120,30,0)');g.fillStyle=gr;g.beginPath();g.ellipse(X(p[0]),Y(p[1]),p[2]*Z,p[3]*Z*YS,0,0,7);g.fill()}
 // 6) tường (2D: khối nổi thấp; nền 2.5D: chỉ chân tường) + lưới rào dọc
 const WC={factory:['#8e8a84','#b6b2aa'],factory2:['#8a5844','#a86e56'],factory3:['#8a8c88','#b2b4ae'],factory4:['#5a7088','#7890a8'],ware:['#7a7e86','#a2a6ae'],shop:['#86584a','#a87262'],guard:['#b8b2a6','#d8d2c6'],small:['#9a968c','#c2beb4'],chem:['#7c8072','#a4a898']};
 const walls=[];for(const b of D.bld){if(!vis([b.r[0]-2,b.r[1]-4,b.r[2]+2,b.r[3]+2]))continue;for(const w of b.walls)walls.push([w,b.kind])}
 walls.sort((a,b)=>a[0].r[3]-b[0].r[3]);
 for(const[w,k]of walls){const r=w.r,c=WC[k]||WC.factory;if(on3){g.fillStyle='rgba(30,28,32,.75)';g.fillRect(...RX(r));continue}
  const hv=Math.min(2.2,w.h)*.62*Z,hz=(r[2]-r[0])>=(r[3]-r[1]);
  g.fillStyle='rgba(10,10,14,.22)';g.fillRect(X(r[0])+.25*Z,Y(r[1])+.25*Z*YS,(r[2]-r[0])*Z,(r[3]-r[1])*Z*YS);// bóng
  if(hz){g.fillStyle=c[0];g.fillRect(X(r[0]),Y(r[3])-hv,(r[2]-r[0])*Z,hv);g.fillStyle=c[1];g.fillRect(X(r[0]),Y(r[1])-hv,(r[2]-r[0])*Z,(r[3]-r[1])*Z*YS);g.fillStyle='rgba(20,18,22,.35)';g.fillRect(X(r[0]),Y(r[3])-hv*.18,(r[2]-r[0])*Z,hv*.18)}
  else{g.fillStyle=c[0];g.fillRect(X(r[0]),Y(r[1])-hv,(r[2]-r[0])*Z,(r[3]-r[1])*Z*YS+hv);g.fillStyle=c[1];g.fillRect(X(r[0]),Y(r[1])-hv,(r[2]-r[0])*Z,(r[3]-r[1])*Z*YS)}
  g.strokeStyle='rgba(30,26,34,.7)';g.lineWidth=Math.max(1,.05*Z);g.strokeRect(X(r[0]),Y(r[1])-hv,(r[2]-r[0])*Z,(r[3]-r[1])*Z*YS+(hz?hv:hv))}
 if(!on3){g.strokeStyle='rgba(170,170,184,.55)';g.lineWidth=Math.max(1,.05*Z);for(const f of VF){if(f.x<v[0]||f.x>v[2]||f.y1<v[1]||f.y0>v[3])continue;const h=1.15*Z;g.beginPath();for(let y=f.y0;y<f.y1;y+=.45){g.moveTo(X(f.x),Y(y)-h);g.lineTo(X(f.x),Y(y+.45))}g.stroke();g.beginPath();g.moveTo(X(f.x),Y(f.y0)-h);g.lineTo(X(f.x),Y(f.y1)-h);g.moveTo(X(f.x),Y(f.y0));g.lineTo(X(f.x),Y(f.y1));g.stroke()}}
 g.restore()}
const VF=[];// đoạn rào dọc gộp (x, y0..y1)
function mkVF(){const ps=D.props.filter(p=>p[0]==='k_fencev').map(p=>({x:p[1],y0:p[4][1],y1:p[4][3]})).sort((a,b)=>a.x-b.x||a.y0-b.y0);for(const p of ps){const l=VF[VF.length-1];if(l&&l.x===p.x&&Math.abs(l.y1-p.y0)<.05)l.y1=p.y1;else VF.push({...p})}}

/* ---------------- 5) 2.5D: tường, khung mái, bồn, ống khói, cẩu giàn, lưới rào ---------------- */
const G3=[];let b3done=false,VFM=null;
function tex3(T,f,rep){const c=cnv(256,f),t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;if(rep)t.repeat.set(rep,rep);return t}
function geoBoxes(T,boxes,sc){// gộp nhiều hộp thành 1 geometry, UV theo mét thật (sc m / ô)
 const P=[],N=[],U=[],I=[];let v=0;for(const[x0,y0,z0,x1,y1,z1]of boxes){const F=[[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1],'xy'],[[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[0,0,-1],'xy'],[[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[1,0,0],'zy'],[[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0],'zy'],[[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],[0,1,0],'xz'],[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[0,-1,0],'xz']];
  for(const[a,b,c,d,n,m]of F){for(const q of[a,b,c,d]){P.push(q[0],q[1],q[2]);N.push(n[0],n[1],n[2]);const u=m==='xy'?q[0]:m==='zy'?q[2]:q[0],w=m==='xz'?q[2]:q[1];U.push(u/sc,w/sc)}I.push(v,v+1,v+2,v,v+2,v+3);v+=4}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('normal',new T.Float32BufferAttribute(N,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));g.setIndex(I);g.computeBoundingSphere();return g}
function build3(){const V=SH.V25,T15=V&&V.T15;if(!T15||!T15.T||!T15.scene)return false;const T=T15.T,scene=T15.scene,R=rng(57);
 const L=(map,col)=>new T.MeshLambertMaterial({map,color:col||0xffffff});
 const conc=tex3(T,(g,n)=>{g.fillStyle='#9a968e';g.fillRect(0,0,n,n);for(let i=0;i<2200;i++){g.fillStyle=R()<.5?'rgba(60,58,54,.22)':'rgba(200,196,188,.2)';g.fillRect(R()*n,R()*n,1+R()*2,1+R()*2)}g.strokeStyle='rgba(60,58,54,.5)';g.lineWidth=2;for(const y of[0,128])g.strokeRect(-2,y,n+4,128);for(const x of[0,128]){g.beginPath();g.moveTo(x,0);g.lineTo(x,n);g.stroke()}for(let i=0;i<14;i++){g.fillStyle='rgba(70,50,36,.2)';const x=R()*n;g.fillRect(x,R()*n*.5,2+R()*3,40+R()*90)}});
 const brick=tex3(T,(g,n)=>{g.fillStyle='#7a4a3a';g.fillRect(0,0,n,n);for(let y=0;y<n;y+=16)for(let x=(y/16)%2*16;x<n+32;x+=32){g.fillStyle='rgb('+(150+R()*40|0)+','+(80+R()*24|0)+','+(60+R()*18|0)+')';g.fillRect(x-30,y+1,29,14)}for(let i=0;i<10;i++){g.fillStyle='rgba(40,30,28,.2)';g.fillRect(R()*n,0,3+R()*4,R()*n)}});
 const metal=(c1,c2)=>tex3(T,(g,n)=>{g.fillStyle=c1;g.fillRect(0,0,n,n);for(let x=0;x<n;x+=16){g.fillStyle=c2;g.fillRect(x,0,6,n)}for(let i=0;i<900;i++){g.fillStyle='rgba('+(130+R()*30|0)+',70,36,'+(.12+R()*.25)+')';g.beginPath();g.ellipse(R()*n,R()*n,1+R()*4,1+R()*3,0,0,7);g.fill()}for(let i=0;i<16;i++){g.fillStyle='rgba(110,60,34,.22)';g.fillRect(R()*n,R()*n*.4,2+R()*3,30+R()*110)}});
 const MAT={concrete:L(conc),brick:L(brick),metal:L(metal('#7e828a','#6a6e76')),blue:L(metal('#5a7690','#4a6680')),plaster:L(conc,0xe8e2d6),beam:new T.MeshLambertMaterial({color:0x4a4c54}),roof:L(metal('#8a8478','#746e64')),yellow:L(metal('#d2a234','#b88a26')),rust:L(metal('#9c9a94','#86847e')),green:L(metal('#7a8a7c','#68786a'))};
 for(const m of[MAT.roof])m.side=T.DoubleSide;
 const KM={factory:'concrete',factory2:'brick',factory3:'concrete',factory4:'blue',ware:'metal',shop:'brick',guard:'plaster',small:'plaster',chem:'concrete'};
 for(const b of D.bld){const grp=new T.Group(),mats=new Map(),add=(m,bx)=>{let a=mats.get(m);if(!a)mats.set(m,a=[]);a.push(bx)};
  const wm=KM[b.kind]||'concrete';
  for(const w of b.walls){const r=w.r,hz=(r[2]-r[0])>=(r[3]-r[1]),L0=hz?r[0]:r[1],L1=hz?r[2]:r[3];let s=L0;while(s<L1-.05){const e=Math.min(L1,s+2.2+R()*1.6);let h=w.h*(w.side==='S'?(.45+R()*.55):(R()<.12?.35+R()*.3:.72+R()*.28));
    if(hz)add(wm,[s,0,r[1],e,h,r[3]]);else add(wm,[r[0],0,s,r[2],h,e]);s=e}}
  const[x0,z0,x1,z1]=b.r,H=b.h,rt=b.roof&&b.roof.type;
  if(rt){// khung mái thép: dầm dọc + dầm ngang, vài tấm tôn còn sót phía bắc
   for(let x=x0+8;x<x1-1;x+=8)add('beam',[x-.15,H-.1,z0+.3,x+.15,H+.25,z1-.3]);
   if(rt==='saw'){const n=b.roof.n||6,st=(x1-x0)/n;for(let i=0;i<n;i++){const x=x0+st*(i+.92);add('beam',[x-.12,H+.25,z0+.3,x+.12,H+2.6,z0+.6]);add('beam',[x-.12,H+2.4,z0+.3,x+.12,H+2.6,z1-.3]);for(let z=z0+4;z<z1-2;z+=6)add('beam',[x-.1,H+.25,z,x+.1,H+2.4,z+.2])}}
   if(rt==='gable')for(let x=x0+6;x<x1-1;x+=6)add('beam',[x-.12,H+.25,(z0+z1)/2-.12,x+.12,H+2.2,(z0+z1)/2+.12]);
   for(let x=x0+.5;x<x1-1;x+=3.2)if(R()<.55)add('roof',[x,H+.3,z0+.2,x+3.1,H+.38,z0+.2+3+R()*5]);
  }
  for(const[m,bx]of mats){const me=new T.Mesh(geoBoxes(T,bx,m==='roof'?2:2.5),MAT[m]);if(m==='beam'||m==='roof')me.userData.roof=1;grp.add(me)}
  grp.userData={cx:(x0+x1)/2,cz:(z0+z1)/2,r:Math.hypot(x1-x0,z1-z0)/2,rect:b.r};grp.visible=false;scene.add(grp);G3.push(grp);ST.b3++}
 // bồn chứa, ống khói, cẩu giàn
 for(const o of D3){const k=o.k3,x=o[1],z=o[2];if(k!=='k_tank'&&k!=='k_chim'&&k!=='k_crane')continue;const grp=new T.Group();
  if(k==='k_tank'){const r=o[3]/2-.25,h=o[3]*1.35,cy=new T.Mesh(new T.CylinderGeometry(r,r,h,22,1),MAT[o[3]>5.5?'rust':'green']);cy.position.set(x,h/2,z-r);grp.add(cy);const top=new T.Mesh(new T.CylinderGeometry(r*.2,r,.8,22,1),MAT.rust);top.position.set(x,h+.4,z-r);grp.add(top)}
  else if(k==='k_chim'){const h=15.5,cy=new T.Mesh(new T.CylinderGeometry(.95,1.45,h,16,1),MAT.brick);cy.position.set(x,h/2,z-1.3);grp.add(cy);const bs=new T.Mesh(geoBoxes(T,[[x-1.7,0,z-3,x+1.7,1.2,z+.4]],2),MAT.brick);grp.add(bs)}
  else if(k==='k_crane'){const bx=[];for(const lx of[x-10.5,x+10.5]){bx.push([lx-.5,0,z-.8,lx+.5,10.2,z+.2]);bx.push([lx-.9,0,z-1.6,lx+.9,.4,z+1])}bx.push([x-11.2,10.2,z-.9,x+11.2,11.4,z+.3]);bx.push([x-1.5,9.0,z-1.0,x+1.5,10.2,z+.4]);bx.push([x-.06,5.2,z-.36,x+.06,9.0,z-.24]);bx.push([x-.8,4.6,z-.7,x+.8,5.2,z+.1]);grp.add(new T.Mesh(geoBoxes(T,bx,2),MAT.yellow))}
  grp.userData={cx:x,cz:z,r:12};grp.visible=false;scene.add(grp);G3.push(grp);ST.b3++}
 try{build3b(T,scene,MAT,L,R)}catch(e){ST.err3b=String(e&&e.stack||e);console.warn('[KCN35] 3D xe/phố ẩm thực',e)}
 // lưới rào dọc (mặt phẳng trong suốt, gộp 1 lưới)
 {const c=cnv(128,(g,n)=>{g.clearRect(0,0,n,n);g.strokeStyle='rgba(176,176,188,.85)';g.lineWidth=2;for(let i=-n;i<n*2;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i+n,n);g.moveTo(i+n,0);g.lineTo(i,n);g.stroke()}g.fillStyle='rgba(120,120,130,1)';g.fillRect(0,0,n,5)}),tx=new T.CanvasTexture(c);tx.wrapS=tx.wrapT=T.RepeatWrapping;
  const P=[],U=[],I=[];let v=0;for(const f of VF){const h=2.1;for(const q of[[f.x,0,f.y0],[f.x,0,f.y1],[f.x,h,f.y1],[f.x,h,f.y0]])P.push(...q);const L=(f.y1-f.y0)/1.4;U.push(0,0,L,0,L,1.5,0,1.5);I.push(v,v+1,v+2,v,v+2,v+3);v+=4}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();g.computeBoundingSphere();
  VFM=new T.Mesh(g,new T.MeshLambertMaterial({map:tx,transparent:true,alphaTest:.3,side:T.DoubleSide}));VFM.visible=false;scene.add(VFM)}
 b3done=true;return true}
/* ---------------- 5b) KCN35: xe con, xe tải & phố ẩm thực dựng 3D thật (2.5D) ---------------- */
const VEH={k_car1:['sedan',4.6,'#a83a2e'],k_car2:['sedan',4.6,'#2e5a8a'],k_car3:['sedan',4.6,'#3a7a4a'],k_car4:['hatch',4.0,'#c8962e'],k_car5:['hatch',4.0,'#d8d4c8'],k_car6:['pickup',5.3,'#6a6a72'],k_car7:['pickup',5.3,'#7a3a6a'],k_car8:['van',5.0,'#2a2a30'],
 k_semi1:['semi',15.2,'#c83a2a','#8a8c92'],k_semi2:['semi',15.2,'#2e5a8a','#b8b2a2'],k_semi3:['semi',15.2,'#d8d4c8','#5a7a5a'],k_boxt1:['box',8.6,'#2e6a8a','#d8d4c8'],k_boxt2:['box',8.6,'#c8962e','#a83a2e'],k_dump1:['dump',8.2,'#3a6a4a','#c8962e'],k_tank1:['tanker',11.8,'#c83a2a','#b8b6ae'],k_trail1:['trailer',12.4,'#555','#7a8a9a']};
const STALL={k_stall_pho:['PHỞ','#c0392b','#efe6d4'],k_stall_bun:['BÚN BÒ','#2e7d5b','#efe6d4'],k_stall_nuong:['ĐỒ NƯỚNG','#d35400','#3a3a3a'],k_stall_cafe:['CÀ PHÊ','#6d4c41','#d7ccc8'],k_stall_tra:['TRÀ SỮA','#8e44ad','#f3e5f5'],k_stall_bm:['BÁNH MÌ','#f39c12','#fff3d6'],k_stall_lau:['LẨU','#b71c1c','#ffcdd2']};
function oldCol(T,h,a=.25){const c=new T.Color(h),g=(c.r+c.g+c.b)/3;c.r+=(g-c.r)*a;c.g+=(g-c.g)*a;c.b+=(g-c.b)*a;return c}
function build3b(T,scene,MAT,L,R){
 // vật liệu
 const grime=tex3(T,(g,n)=>{g.fillStyle='#ffffff';g.fillRect(0,0,n,n);for(let i=0;i<260;i++){g.fillStyle='rgba('+(120+R()*40|0)+','+(70+R()*20|0)+',40,'+(.06+R()*.16)+')';g.beginPath();g.ellipse(R()*n,R()*n,1+R()*3,1+R()*2,0,0,7);g.fill()}for(let i=0;i<14;i++){g.fillStyle='rgba(90,60,40,.1)';g.fillRect(R()*n,R()*n*.5,2+R()*2,30+R()*60)}});
 const MC=new Map(),M=(key,f)=>{let m=MC.get(key);if(!m){m=f();MC.set(key,m)}return m};
 /* màu theo đỉnh: mọi phần không cần ảnh riêng gộp chung 1 vật liệu → ít lệnh vẽ (nhẹ máy) */
 const VCM=new T.MeshLambertMaterial({map:grime,vertexColors:true});
 const vc=c=>({isVC:1,c});
 const paint=h=>M('p'+h,()=>vc(oldCol(T,h)));
 const solid=(h,o)=>M('s'+h+(o?JSON.stringify(o):''),()=>{const c=new T.Color(h);if(o&&o.emissive){const e=new T.Color(o.emissive);c.r=Math.min(1,c.r+e.r*1.5);c.g=Math.min(1,c.g+e.g*1.5);c.b=Math.min(1,c.b+e.b*1.5)}return vc(c)});
 const glassM=vc(new T.Color(0x34424e));
 const txt=(t,bg,fg,w,h)=>M('t'+t+bg,()=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,w,h);g.strokeStyle='rgba(230,230,230,.8)';g.lineWidth=h*.05;g.strokeRect(h*.06,h*.06,w-h*.12,h*.88);g.fillStyle=fg;g.font='bold '+(h*.5)+'px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(t,w/2,h*.54,w*.9);for(let i=0;i<60;i++){g.fillStyle='rgba(130,70,36,'+(.1+R()*.3)+')';g.beginPath();g.ellipse(R()*w,R()*h,1+R()*4,1+R()*3,0,0,7);g.fill()}const tx=new T.CanvasTexture(c);return new T.MeshLambertMaterial({map:tx})});
 const stripe=(a,b)=>M('st'+a+b,()=>{const c=document.createElement('canvas');c.width=128;c.height=32;const g=c.getContext('2d');for(let i=0;i<8;i++){g.fillStyle=i%2?b:a;g.fillRect(i*16,0,16,32)}g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,0,128,32);for(let i=0;i<40;i++){g.fillStyle='rgba(90,70,50,.25)';g.fillRect(R()*128,R()*32,2,2+R()*6)}const tx=new T.CanvasTexture(c);return new T.MeshLambertMaterial({map:tx,side:T.DoubleSide})});
 const woodM=vc(new T.Color(0x8a6a4c)),metalM=solid('#5c5e66'),chromeM=solid('#a4a6ac'),tireM=solid('#1e1c22'),redL=solid('#b8392a',{emissive:0x3a0a06}),headL=solid('#e8d8a0',{emissive:0x2a2414}),darkM=solid('#1c1a20');
 const tileM=vc(new T.Color(0x9a4a32));
 // gom hình theo vật liệu rồi gộp
 const CL=new Map();
 const acc=(x,z)=>{const k=Math.floor(x/32)+','+Math.floor(z/32);let a=CL.get(k);if(!a)CL.set(k,a={m:new Map(),x0:1e9,x1:-1e9,z0:1e9,z1:-1e9,extra:[]});a.x0=Math.min(a.x0,x);a.x1=Math.max(a.x1,x);a.z0=Math.min(a.z0,z);a.z1=Math.max(a.z1,z);return a};
 const put=(A,mat,geo)=>{const g=geo.index?geo.toNonIndexed():geo;if(mat.isVC){const n=g.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=mat.c.r;a[i*3+1]=mat.c.g;a[i*3+2]=mat.c.b}g.setAttribute('color',new T.Float32BufferAttribute(a,3));mat=VCM}let l=A.m.get(mat);if(!l)A.m.set(mat,l=[]);l.push(g)};
 const bx=(A,mat,x0,y0,z0,x1,y1,z1)=>{const g=new T.BoxGeometry(Math.max(.01,x1-x0),Math.max(.01,y1-y0),Math.max(.01,z1-z0));g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);put(A,mat,g)};
 const cyl=(A,mat,r,len,ax,cx,cy,cz,seg=12,r2_)=>{const g=new T.CylinderGeometry(r2_==null?r:r2_,r,len,seg);if(ax==='x')g.rotateZ(Math.PI/2);else if(ax==='z')g.rotateX(Math.PI/2);g.translate(cx,cy,cz);put(A,mat,g)};
 const sph=(A,mat,r,cx,cy,cz)=>{const g=new T.SphereGeometry(r,7,5);g.translate(cx,cy,cz);put(A,mat,g)};
 // ---- xe: trục dọc theo x; d=+1 đầu xe hướng +x
 function car(A,k,x,y){const[kind,Lr,col]=VEH[k.replace(/L$/,'')],d=k.endsWith('L')?-1:1,L=Lr,W=1.76,zc=y-.9,z0=zc-W/2,z1=zc+W/2,P=paint(col),u=v=>x+v*d;
  const BX=(m,a,b,y0,y1,za,zb)=>bx(A,m,Math.min(u(a),u(b)),y0,za,Math.max(u(a),u(b)),y1,zb);
  if(kind==='van'){BX(P,-L/2+.05,L/2-.35,.3,2.0,z0,z1);BX(P,L/2-.35,L/2-.02,.3,1.05,z0+.05,z1-.05);BX(glassM,L/2-.95,L/2-.3,1.2,1.85,z0+.08,z1-.08);for(const a of[-1.9,-.6])BX(glassM,a,a+1.0,1.25,1.8,z0-.02,z1+.02)}
  else{BX(P,-L/2,L/2,.3,.86,z0,z1);BX(P,-L/2+.05,L/2-.05,.86,.92,z0+.04,z1-.04);
   const cab={sedan:[-1.25,1.2],hatch:[-1.88,1.15],pickup:[-.4,1.5]}[kind];
   BX(glassM,cab[0]+.12,cab[1]-.12,.92,1.42,z0+.12,z1-.12);BX(P,cab[0]+.4,cab[1]-.45,1.42,1.5,z0+.14,z1-.14);
   for(const a of[cab[0]+.12,(cab[0]+cab[1])/2,cab[1]-.18])BX(P,a,a+.08,.92,1.44,z0+.1,z1-.1);
   if(kind==='pickup'){BX(P,-L/2,cab[0],.86,1.12,z0,z0+.08);BX(P,-L/2,cab[0],.86,1.12,z1-.08,z1);BX(P,-L/2,-L/2+.08,.86,1.12,z0,z1);BX(woodM,-L/2+.4,cab[0]-.5,.9,1.2,z0+.3,z1-.3)}}
  BX(chromeM,L/2-.02,L/2+.1,.42,.58,z0+.1,z1-.1);BX(chromeM,-L/2-.1,-L/2+.02,.42,.58,z0+.1,z1-.1);
  BX(R()<.5?headL:darkM,L/2-.04,L/2+.03,.66,.8,z0+.15,z0+.45);BX(R()<.5?headL:darkM,L/2-.04,L/2+.03,.66,.8,z1-.45,z1-.15);BX(redL,-L/2-.03,-L/2+.04,.66,.8,z0+.12,z0+.38);BX(redL,-L/2-.03,-L/2+.04,.66,.8,z1-.38,z1-.12);
  const wx={sedan:[.85,3.75],hatch:[.75,3.25],pickup:[.95,4.35],van:[.85,4.15]}[kind];
  for(const w of wx){const fl=R()<.4,r=fl?.28:.34;cyl(A,tireM,r,W-.1,'z',u(-L/2+w),r,zc,8);cyl(A,chromeM,r*.55,W,'z',u(-L/2+w),r,zc,6)}}
 function truck(A,k,x,y){const[kind,L,col,cg]=VEH[k.replace(/L$/,'')],d=k.endsWith('L')?-1:1,W=2.44,zc=y-1.25,z0=zc-W/2,z1=zc+W/2,P=paint(col),CG=paint(cg||'#888'),u=v=>x+v*d;
  const BX=(m,a,b,y0,y1,za,zb)=>bx(A,m,Math.min(u(a),u(b)),y0,za,Math.max(u(a),u(b)),y1,zb);
  BX(darkM,-L/2+.3,L/2-.2,.6,.85,zc-.85,zc+.85);
  if(kind!=='trailer'){const c0=L/2-2.5;BX(P,c0,L/2,.75,3.25,z0,z1);BX(glassM,L/2-.05,L/2+.02,1.9,3.0,z0+.15,z1-.15);BX(glassM,c0+.3,c0+1.3,1.9,2.9,z0-.02,z1+.02);BX(chromeM,L/2-.02,L/2+.1,.95,1.6,z0+.3,z1-.3);BX(R()<.4?headL:darkM,L/2-.02,L/2+.08,1.62,1.78,z0+.15,z0+.5);BX(R()<.4?headL:darkM,L/2-.02,L/2+.08,1.62,1.78,z1-.5,z1-.15);BX(P,c0+.15,L/2-.15,3.25,3.4,z0+.1,z1-.1)}
  if(kind==='semi'||kind==='trailer'){const a=-L/2,b=a+12.2;BX(CG,a,b,1.0,4.1,z0+.03,z1-.03);BX(CG,a,b,4.1,4.2,z0+.08,z1-.08);if(kind==='trailer'){BX(metalM,b-1.8,b-1.65,0,1.0,z0+.3,z0+.45);BX(metalM,b-1.8,b-1.65,0,1.0,z1-.45,z1-.3)}}
  else if(kind==='box'){const a=-L/2;BX(CG,a,a+6.0,1.0,3.6,z0+.02,z1-.02);BX(darkM,a-.02,a+.02,1.15,3.4,z0+.2,zc)}
  else if(kind==='dump'){const a=-L/2,b=a+5.6,Y=paint('#c8962e');BX(Y,a,b,1.0,1.12,z0,z1);BX(Y,a,b,1.0,2.6,z0,z0+.1);BX(Y,a,b,1.0,2.6,z1-.1,z1);BX(Y,a,a+.1,1.0,2.6,z0,z1);BX(Y,b-.1,b,1.0,2.8,z0,z1);const st=solid('#7a7468');for(let i=0;i<9;i++)sph(A,st,.35+R()*.3,u(a+.6+R()*4.4),1.5+R()*.8,zc+(R()-.5)*1.4)}
  else if(kind==='tanker'){const a=-L/2+.3,b=-L/2+8.6;cyl(A,CG,1.1,b-a,'x',u((a+b)/2),2.1,zc,12);for(const q of[a+2.2,a+4.4,a+6.6])cyl(A,metalM,1.13,.12,'x',u(q),2.1,zc,12)}
  const wx=kind==='semi'?[1.2,2.4,9.8,13.6,14.6]:kind==='box'?[1.3,4.8,7.4]:kind==='dump'?[1.0,2.2,7.1]:kind==='tanker'?[1.2,2.4,7.2,10.6]:[1.2,2.4];
  for(const w of wx){const fl=R()<.35,r=fl?.42:.5;cyl(A,tireM,r,W-.3,'z',u(-L/2+w),r,zc,8)}}
 // ---- phố ẩm thực
 function food(A,k,x,y){
  if(STALL[k]){/* KCN36: tủ kính bỏ hoang – không mái che, thấy đồ ăn bên trong */const[t,c1]=STALL[k],P=paint(c1),kind=k.slice(8),fr=solid('#9a9aa0'),z0=y-.85,z1=y-.05;
   bx(A,P,x-1.95,0,z0,x+1.95,.85,z1);bx(A,solid('#5a5458'),x-1.9,.85,z0+.05,x+1.9,.88,z1-.05);bx(A,solid('#2e2a2e'),x-1.9,.88,z0,x+1.9,1.85,z0+.06);
   for(const sh of[.9,1.38]){bx(A,solid('#a8a4a0'),x-1.9,sh,z0+.06,x+1.9,sh+.04,z1-.06);for(let q=-1.6;q<1.65;q+=.5){if(R()<.18)continue;const fx=x+q+(R()-.5)*.1,fz=(z0+z1)/2+(R()-.5)*.3,fy=sh+.04;
     if(kind==='pho'||kind==='bun'){cyl(A,solid('#e2dccf'),.17,.1,'y',fx,fy+.05,fz,8,.2);cyl(A,solid(kind==='pho'?'#d8c8a0':'#b85a3a'),.17,.02,'y',fx,fy+.1,fz,8)}
     else if(kind==='nuong'){bx(A,solid('#6a3a22'),fx-.2,fy,fz-.04,fx+.2,fy+.07,fz+.04)}
     else if(kind==='cafe'||kind==='tra'){cyl(A,solid(kind==='cafe'?'#5a3a2a':'#c8a080'),.07,.2,'y',fx,fy+.1,fz,6,.09)}
     else if(kind==='bm'){bx(A,solid('#c88a3a'),fx-.24,fy,fz-.06,fx+.24,fy+.1,fz+.06)}
     else{cyl(A,solid('#8a8a90'),.17,.15,'y',fx,fy+.075,fz,8);cyl(A,solid('#b04030'),.16,.02,'y',fx,fy+.15,fz,8)}}}
   for(const q of[-1.95,0,1.95])for(const zz of[z0,z1])bx(A,fr,x+q-.04,.85,zz-.03,x+q+.04,1.88,zz+.03);for(const zz of[z0,z1])bx(A,fr,x-1.97,1.85,zz-.04,x+1.97,1.9,zz+.04);for(const q of[-1.95,0,1.95])bx(A,fr,x+q-.04,1.85,z0,x+q+.04,1.9,z1);
   bx(A,M('glass36',()=>new T.MeshLambertMaterial({color:0xc4d4da,transparent:true,opacity:.26,depthWrite:false})),x-1.92,.88,z0+.02,x+1.92,1.86,z1);
   for(const q of[-1.1,1.1])cyl(A,metalM,.03,.5,'y',x+q,2.1,z0+.2,6);bx(A,txt(t,'#3a2e2a','#e8d6b0',256,64),x-1.5,2.25,z0+.15,x+1.5,2.85,z0+.25);return}
  if(/^k_litter/.test(k)){const cs=['#e8e4d8','#d84a4a','#4a8ad8','#8a6a3a','#c8c0aa','#5ab85a'];for(let i=0;i<7;i++){const a=x+(R()-.5)*1.3,b=y-.2+(R()-.5)*.5;bx(A,solid(cs[R()*cs.length|0]),a-.08,0,b-.06,a+.08,.03+R()*.05,b+.06)}return}
  if(k==='k_umbx'){const g=new T.ConeGeometry(1.2,.5,10,1,true);g.rotateZ(1.25);g.translate(x,.5,y-.4);put(A,stripe('#a83a2e','#e8e0d0'),g);cyl(A,metalM,.035,2.2,'x',x+1.1,.1,y-.4,6);return}
  if(k==='k_lantx'){cyl(A,solid('#5a4a3a'),.06,4.0,'x',x,.08,y-.2,6);sph(A,solid('#8a3a2e'),.24,x+(R()-.5)*2,.24,y-.1);sph(A,solid('#8a3a2e'),.2,x+(R()-.5)*2,.2,y-.4);return}
  if(k==='k_table_r'||k==='k_table_g'||k==='k_table_n'||k==='k_tablex'){const sc=[solid('#b04030'),solid('#2a6aa0'),solid('#2a8a50')];
   if(k==='k_tablex'){const g=new T.CylinderGeometry(.75,.75,.05,16);g.rotateX(Math.PI/2.3);g.translate(x-.3,.45,y-.5);put(A,solid('#a8a49a'),g);cyl(A,metalM,.04,.9,'x',x+.4,.12,y-.3,6);bx(A,sc[R()*3|0],x+.6,0,y-.5,x+1.0,.35,y-.1);return}
   cyl(A,solid('#a8a49a'),.78,.05,'y',x,.72,y-.5,16);cyl(A,metalM,.05,.72,'y',x,.36,y-.5,6);for(const q of[-1.05,1.05])cyl(A,sc[R()*3|0],.18,.42,'y',x+q,.21,y-.5,10);
   if(k!=='k_table_n'){const c=k==='k_table_r'?'#c0392b':'#239b56';cyl(A,metalM,.035,2.4,'y',x,1.2,y-.5,6);const g=new T.ConeGeometry(1.3,.55,12,1,true);g.translate(x,2.62,y-.5);put(A,stripe(c,'#efe6d4'),g)}return}
  if(k==='k_pavil'){for(const q of[-6,-2.2,1.6,5.4])for(const zz of[y-.1,y-4.2])cyl(A,metalM,.12,3.5,'y',x+q,1.75,zz,8);bx(A,tileM,x-6.7,3.5,y-4.9,x+6.7,3.62,y+.6);bx(A,metalM,x-6.7,3.3,y-.2,x+6.7,3.5,y);bx(A,metalM,x-6.7,3.3,y-4.3,x+6.7,3.5,y-4.1);bx(A,txt('KHU ĂN UỐNG','#2a1e1c','#f6d27a',256,48),x-2.2,3.62,y+.45,x+2.2,4.2,y+.55);return}
  if(k==='k_fgate'){const red=paint('#b0402e');bx(A,red,x-4.9,0,y-.6,x-4.0,4.6,y+.1);bx(A,red,x+4.0,0,y-.6,x+4.9,4.6,y+.1);bx(A,solid('#6a2a1e'),x-5.4,4.4,y-.7,x+5.4,4.6,y+.2);bx(A,txt('PHỐ ẨM THỰC ZETA','#2a1e1c','#f6d27a',512,72),x-4.8,4.6,y-.45,x+4.8,5.9,y-.05);for(const q of[-4.3,-2.7,2.7,4.3])sph(A,redL,.3,x+q,3.9,y-.25);return}
  if(k==='k_lantern'){cyl(A,solid('#5a4a3a'),.06,4.0,'y',x,2.0,y-.1,6);sph(A,redL,.26,x,3.4,y-.1);if(R()<.6)sph(A,redL,.24,x,2.7,y-.1);return}
  if(k==='k_cart'){bx(A,paint('#3a7a9a'),x-.8,.35,y-.8,x+.8,1.1,y);bx(A,solid('#d8d0c0'),x-.8,1.1,y-.8,x+.8,1.16,y);bx(A,M('cartg',()=>new T.MeshLambertMaterial({color:0xcfe0e8,transparent:true,opacity:.35})),x-.65,1.16,y-.7,x+.65,1.8,y-.1);for(const q of[-.5,.5])cyl(A,tireM,.3,.12,'z',x+q,.3,y-.05,12);return}
  if(k==='k_cooler'){bx(A,paint('#c83a2a'),x-.5,0,y-.6,x+.5,1.9,y);bx(A,glassM,x-.4,.2,y-.02,x+.4,1.6,y+.02);return}
  if(k==='k_kbin'){cyl(A,paint('#3a6a4a'),.4,1.0,'y',x,.5,y-.4,12,.45);cyl(A,solid('#4a7a5a'),.47,.08,'y',x,1.04,y-.4,12);return}
  if(k==='k_gascyl'){cyl(A,paint('#c87a2a'),.22,.85,'y',x-.25,.43,y-.3,10);cyl(A,paint('#3a6aa8'),.22,.85,'y',x+.25,.43,y-.3,10)}}
 for(const o of D3){const k=o.k3,x=o[1],y=o[2];if(k==='k_tank'||k==='k_chim'||k==='k_crane')continue;const base=k.replace(/L$/,''),A=acc(x,y);
  if(VEH[base]){if(/^k_car/.test(base))car(A,k,x,y);else truck(A,k,x,y)}else food(A,k,x,y)}
 for(const A of CL.values()){const grp=new T.Group();for(const[mat,list]of A.m){const P=[],N=[],U=[],CC=[];for(const g of list){const p=g.attributes.position.array,n=g.attributes.normal.array,uv=g.attributes.uv?g.attributes.uv.array:null,cc=g.attributes.color?g.attributes.color.array:null;for(let i=0;i<p.length;i++)P.push(p[i]);for(let i=0;i<n.length;i++)N.push(n[i]);if(uv)for(let i=0;i<uv.length;i++)U.push(uv[i]);else for(let i=0;i<p.length/3*2;i++)U.push(0);if(cc)for(let i=0;i<cc.length;i++)CC.push(cc[i]);g.dispose()}
   const G=new T.BufferGeometry();G.setAttribute('position',new T.Float32BufferAttribute(P,3));G.setAttribute('normal',new T.Float32BufferAttribute(N,3));G.setAttribute('uv',new T.Float32BufferAttribute(U,2));if(CC.length===P.length)G.setAttribute('color',new T.Float32BufferAttribute(CC,3));G.computeBoundingSphere();grp.add(new T.Mesh(G,mat))}
  grp.userData={cx:(A.x0+A.x1)/2,cz:(A.z0+A.z1)/2,r:Math.max(A.x1-A.x0,A.z1-A.z0)/2+10,near:1};grp.visible=false;scene.add(grp);G3.push(grp);ST.b3++;ST.v3=(ST.v3||0)+1}}
function sync3(){const V=SH.V25,on=!!(V&&V.on);if(on!==ST.mode3){ST.mode3=on;// đổi chế độ: bồn/ống khói/cẩu → mô hình 3D (2.5D) hoặc hình 2D
  if(on){for(const o of D3){const i=SH.DEC.indexOf(o);if(i>=0)SH.DEC.splice(i,1);try{V.removeSelected10&&V.removeSelected10({buildings:[],mountains:[],landmarks:[],decor:[o]})}catch(_){}}}
  else{for(const o of D3)if(SH.DEC.indexOf(o)<0)SH.DEC.push(o)}}
 if(!on){for(const g of G3)g.visible=false;if(VFM)VFM.visible=false;return}
 if(!b3done){try{build3()}catch(e){ST.err3=String(e&&e.message||e);b3done=true;console.warn('[KCN34] 2.5D',e)}}
 const ih=IH();for(const g of G3){const u=g.userData;g.visible=!ih&&Math.abs(u.cx-pos.x)<u.r+(u.near?30:75)&&Math.abs(u.cz-pos.y)<u.r+(u.near?26:70);if(g.visible&&u.rect){const inside=inR(u.rect,pos.x,pos.y,1.5);if(inside!==u.in){u.in=inside;for(const m of g.children)if(m.userData.roof)m.visible=!inside}}}/* đứng trong nhà → ẩn khung mái để không che nhân vật */if(VFM)VFM.visible=!ih&&inR(ZB,pos.x,pos.y,80)}

/* ---------------- 6) lục đồ ---------------- */
const LT={fac:[['part',1,2,.65],['iron',1,3,.5],['cu',1,1,.3],['plas',1,2,.3],['rpart',1,1,.06]],line:[['part',1,3,.75],['cu',1,2,.35],['plas',1,1,.3],['rpart',1,1,.05]],
 ware:[['wood',2,4,.6],['iron',1,3,.45],['plas',1,2,.35],['chB',1,1,.15],['chS',1,1,.06],['pmat',1,1,.05],['rpart',1,1,.04]],rack:[['plas',1,2,.5],['wood',1,3,.5],['bread',1,1,.25],['wat',1,1,.25],['iron',1,2,.3],['chB',1,1,.08]],
 cont:[['wood',1,3,.5],['plas',1,2,.45],['bread',1,2,.3],['wat',1,1,.3],['iron',1,2,.3],['chB',1,1,.12],['chS',1,1,.05]],
 shop:[['part',1,3,.7],['iron',1,2,.5],['oil',1,1,.25],['gas',1,1,.2],['rpart',1,1,.08]],eng:[['part',2,3,.8],['iron',1,2,.5],['oil',1,1,.35],['rpart',1,1,.1]],
 pow:[['cu',1,3,.8],['part',1,1,.4],['iron',1,1,.3],['rpart',1,1,.07]],gen:[['gas',1,1,.45],['oil',1,1,.35],['part',1,2,.6],['cu',1,2,.4],['rpart',1,1,.08]],
 scrap:[['iron',2,4,.8],['cu',1,1,.3],['part',1,1,.3],['plas',1,1,.3]],car:[['iron',1,2,.6],['part',1,1,.35],['gas',1,1,.18],['oil',1,1,.15],['plas',1,1,.3],['med',1,1,.06]],
 guard:[['med',1,1,.35],['bread',1,2,.45],['wat',1,1,.45],['chB',1,1,.12]],desk:[['bread',1,1,.4],['wat',1,1,.4],['med',1,1,.2],['plas',1,1,.3],['chB',1,1,.06]],
 truck:[['iron',1,3,.55],['part',1,2,.45],['gas',1,1,.3],['oil',1,1,.25],['wood',1,3,.3],['plas',1,2,.3],['chB',1,1,.1],['rpart',1,1,.04]],food:[['eat',1,2,.45],['bread',1,2,.4],['wat',1,1,.4],['ck_rice',1,2,.25],['ck_coal',1,2,.25],['plas',1,1,.25]],drink:[['wat',1,3,.8],['botE',1,2,.4],['plas',1,1,.3]],
 haz:[['pmat',1,1,.28],['rpart',1,1,.2],['iron',1,2,.4],['part',1,2,.45],['chS',1,1,.12],['chG',1,1,.03]],rare:[['rpart',1,1,.45],['pmat',1,1,.4],['chS',1,1,.3],['chG',1,1,.06],['cu',1,2,.4]]};
const NM={eat:'đồ hộp',wood:'gỗ',stone:'đá',med:'thuốc',gas:'xăng',oil:'dầu',bread:'bánh mì',wat:'nước'};
const nm=k=>(SH.F4&&SH.F4.names&&SH.F4.names[k]||NM[k]||k).toLowerCase();
const LK='sh_kcn34_loot';let LS={};try{LS=JSON.parse(localStorage.getItem(LK)||'{}')||{}}catch(_){LS={}}
const saveLS=()=>{try{localStorage.setItem(LK,JSON.stringify(LS))}catch(_){}};
const LG=new Map();function lgrid(){if(LG.size)return;for(const l of D.loot){const k=Math.floor(l.x/8)+','+Math.floor(l.y/8);let a=LG.get(k);if(!a)LG.set(k,a=[]);a.push(l)}}
function ready(l){const at=LS[l.id];if(at==null)return true;const g=GT();if(at-g>48){delete LS[l.id];return true}return g>=at}
globalThis.KCN34.actorSources62=()=>D.loot;
globalThis.KCN34.actorReady62=ready;
globalThis.KCN34.searchForActor62=(a,l)=>{const A=globalThis.SURVIVORS62;if(!A?.canAct(a)||!D.loot.includes(l)||!ready(l)||Math.hypot(a.x-l.x,a.y-l.y)>2.4)return false;
 const T=LT[l.cat]||LT.scrap,got=[];for(const[k,lo,hi,p]of T){if(Math.random()>p)continue;const n=lo+Math.floor(Math.random()*(hi-lo+1));if(A.room(a,k,n))got.push([k,n])}if(!got.length&&A.room(a,T[0][0],T[0][1]))got.push([T[0][0],T[0][1]]);if(!got.length||!A.fits(a,got))return false;
 LS[l.id]=GT()+24;for(const[k,n]of got)a.inv[k]=(a.inv[k]||0)+n;saveLS();X.WORLD?.emit('kcn34.loot',{id:l.id,cat:l.cat,by:a.id});return true};
function search(l){if(!S.on||S.dead)return;if(Math.hypot(pos.x-l.x,pos.y-l.y)>2.4)return;if(!ready(l))return say('🕳 Đã lục rồi – quay lại sau 1 ngày');
 const T=LT[l.cat]||LT.scrap,got=[];let full=false;const R=Math.random;
 for(const[k,a,b,p]of T){if(R()>p)continue;const n=a+Math.floor(R()*(b-a+1));let g=0;try{g=X.give(k,n)|0}catch(_){g=0}if(g>0)got.push('+'+g+' '+nm(k));else full=true}
 if(!got.length&&!full){const[k,a]=T[0];let g=0;try{g=X.give(k,a)|0}catch(_){}if(g>0)got.push('+'+g+' '+nm(k));else full=true}
 if(!got.length)return say(full?'🎒 Túi đầy! Mở túi 🎒 để vứt bớt đồ':'🕳 Không còn gì dùng được');
 LS[l.id]=GT()+24;saveLS();say(l.lbl.split(' ')[0]+' '+got.join(', '));try{SH.FL.push({x:l.x,y:l.y-1,v:got[0],c:'#ffe28a',t0:performance.now()})}catch(_){}
 try{X.WORLD&&X.WORLD.emit('kcn34.loot',{id:l.id,cat:l.cat})}catch(_){}try{if(document.getElementById('inv').style.display==='flex')X.renderInv()}catch(_){}ST.loot++}
function hookActs(){const F5=SH.F5;if(!F5||F5.__kcn34)return;F5.__kcn34=1;const a0=F5.acts;F5.acts=c=>{a0&&a0(c);if(IH()||!inR(ZB,pos.x,pos.y))return;lgrid();const i0=Math.floor(pos.x/8),j0=Math.floor(pos.y/8);
  for(let i=i0-1;i<=i0+1;i++)for(let j=j0-1;j<=j0+1;j++)for(const l of LG.get(i+','+j)||[]){const d=Math.hypot(pos.x-l.x,pos.y-l.y);if(d<1.9&&ready(l)){const p=l.lbl.indexOf(' ');c(d+.02,1.9,l.lbl.slice(0,p)+'<br>'+l.lbl.slice(p+1),()=>search(l),l)}}}}

/* ---------------- 7) khu nguy hiểm, thông báo khu vực ---------------- */
let pudT=0,warnT=0,zoneSaid=new Map(),firstIn=false;
function tick(dt){if(!S.on||S.dead||IH())return;const x=pos.x,y=pos.y;if(!inR(ZB,x,y))return;
 if(!firstIn){const z=ZONE();if(z&&W.zoneAt2(x,y)===z){firstIn=true;say('🏭 Khu Công Nghiệp Zeta đã mở – cẩn thận quái vật & hoá chất!')}}
 const now=performance.now();for(const z of D.zones){if(inR(z.r,x,y)){const t=zoneSaid.get(z.n)||0;if(now-t>90000){zoneSaid.set(z.n,now);say(z.ic+' '+z.n+' – '+z.d)}}}
 let inP=false;for(const p of D.pud){const dx=(x-p[0])/(p[2]*.85),dy=(y-p[1])/(p[3]*.85);if(dx*dx+dy*dy<1){inP=true;break}}
 if(inP){pudT+=dt;const dm=3*dt;S.hp=Math.max(0,S.hp-dm);if(pudT>1){pudT=0;try{SH.FL.push({x,y,v:'-3 ☣️',c:'#9ad04a',t0:now})}catch(_){}}if(now-warnT>4000){warnT=now;say('☣️ Hoá chất độc! Rời khỏi vũng hoá chất ngay')}}else pudT=0}

/* ---------------- 8) quái vật (sau khi chữ ký thế giới đã chốt) ---------------- */
const same=(a,b)=>Array.isArray(a)&&a.length===4&&Math.abs(a[0]-b[0])<.01&&Math.abs(a[1]-b[1])<.01&&Math.abs(a[2]-b[2])<.01&&Math.abs(a[3]-b[3])<.01;
function ensureEnemies(){if(!SH.addE||!SH.ens)return;for(const sp of D.enemy){const live=SH.ens.filter(e=>e.t===sp.t&&same(e.reg,sp.r)).length;const k=sp.n-live;if(k>0){SH.addE(sp.t,k,sp.r.slice());ST.enemies+=k}}}

/* ---------------- áp dụng ---------------- */
function apply(){if(ST.applied)return;try{const z=ZONE();if(!z)throw Error('không tìm thấy khu Zeta');if(!z.open)z.open=true;
  try{SH.WORLD&&SH.WORLD.ensureIds()}catch(_){}ST.sig=SH.WORLD&&SH.WORLD.sig;
  art();mkTex();mkVF();clearTables();
  // dọn đồ trang trí đang gắn (chunk) trong vùng dọn – nạp lại theo bảng mới
  try{W.reloadAll();W.CK&&W.CK.clear&&W.CK.clear();globalThis.M26?.resetBuckets?.()}catch(e){console.warn('[KCN34] nạp lại chunk',e)}
  place();try{signs()}catch(e){console.warn('[KCN34] biển tên',e)}
  {const g0=W.ground;W.ground=(g,X,Y,Z,cx,cy,vw,vh,YS,t,gnd)=>{g0&&g0(g,X,Y,Z,cx,cy,vw,vh,YS,t,gnd);try{paint(g,X,Y,Z,cx,cy,vw,vh,YS||1,t)}catch(e){if(!ST.errP){ST.errP=String(e&&e.message||e);console.warn('[KCN34] vẽ nền',e)}}}}
  hookActs();SH.colsDirty();try{SH.V25&&SH.V25.treesDirty&&SH.V25.treesDirty()}catch(_){}
  ST.sigAfter=SH.WORLD&&SH.WORLD.sig;ST.applied=true}
 catch(e){ST.error=String(e&&e.message||e);console.error('[KCN34]',e)}}
apply();
let lastOn=false,last=performance.now();
setInterval(()=>{if(!ST.applied)return;const n=performance.now(),dt=Math.min(.5,(n-last)/1000);last=n;try{tick(dt)}catch(_){}try{sync3()}catch(e){if(!ST.err3){ST.err3=String(e);console.warn('[KCN34] 2.5D',e)}}
 if(S.on&&!lastOn){setTimeout(()=>{try{ensureEnemies()}catch(_){}},1500)}lastOn=!!S.on},250);
setTimeout(()=>{try{ensureEnemies()}catch(_){}},2500);
console.info('[KCN34] Khu Công Nghiệp Zeta: đã mở & dựng',ST);
})();
