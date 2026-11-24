/* NUITUYET37 (22/11): MỞ KHOÁ & THIẾT KẾ LẠI KHU NÚI TUYẾT (Đỉnh Bạch Vân).
   5 khu: (1) Chân núi – rừng thông phủ tuyết, đường mòn, đá, tuyết mỏng · (2) Thung lũng – hồ băng, suối nước nóng, thông thưa, chòi gỗ bỏ hoang
          (3) Sườn núi – đường đèo quanh co, vách đá, khe núi, cầu gỗ · (4) Hang băng – hang đá phủ tuyết, nhũ băng, pha lê
          (5) Đỉnh núi – tuyết dày, đá to, bãi khai thác: đá thường / quặng đồng / quặng sắt = 60% / 20% / 20%.
   - Chỉ thêm vào trong khu Đỉnh Bạch Vân; không dời/xoá gì ở khu khác. Quái trong khu giữ nguyên, không thêm BOSS.
   - Bố cục tất định (seed cố định) → mọi máy/người chơi thấy giống nhau. Trạng thái đào lưu trong save (mục 'nt37', world).
   - Khai thác theo cơ chế hiện có: cần cuốc chim, nút "⛏ Đào", mỗi điểm đào vài lần rồi hết, mọc lại sau một thời gian.
   - Hình: đá/quặng 3D (ART6) ở 2.5D, sprite dựng từ chính mô hình đó ở 2D; vách tuyết (VACH35), cầu (W15 BRG). */
(()=>{'use strict';
const SH=globalThis.SH,W=globalThis.W15,M=globalThis.MAP26;
const ST={rev:37,applied:false,error:null,nodes:{st:0,cu:0,fe:0},mined:{st:0,cu:0,fe:0},cleared:{K:0,D:0,C:0,dec:0},trees:0,rocks:0,props:0,cliffs:0,cols:0,bridges:0,sprites:0,tiles:0,tileMs:0};
globalThis.NUITUYET37={stats:ST};
if(!SH||!W||!SH.X||!M||!W.ZV2){ST.error='thiếu SH/W15/MAP26';console.warn('[NT37]',ST.error);return}
const X=SH.X,S=SH.S,pos=SH.pos,AS=SH.AS,SW=SH.SW||{};
const say=m=>{try{SH.say(m)}catch(_){}},IH=()=>!!(SH.IH&&SH.IH()),GT=()=>+SH.GT||0;
const ZN='Đỉnh Bạch Vân',ZONE=()=>W.ZV2.find(z=>z.n===ZN);
function rng(s){s=(s|0)||1;return()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const h32=n=>{n=Math.imul(n^0x9e3779b9,0x85ebca6b);n^=n>>>13;n=Math.imul(n,0xc2b2ae35);n^=n>>>16;return(n>>>0)/4294967296};
const hh=(a,b,c)=>h32(Math.imul(a|0,73856093)^Math.imul(b|0,19349663)^Math.imul((c|0)+7,83492791));
const vn=(x,y,s)=>{const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,u=fx*fx*(3-2*fx),w=fy*fy*(3-2*fy);const a=hh(xi,yi,s),b=hh(xi+1,yi,s),c=hh(xi,yi+1,s),d=hh(xi+1,yi+1,s);return(a+(b-a)*u)+((c+(d-c)*u)-(a+(b-a)*u))*w};
const fbm=(x,y,s)=>vn(x,y,s)*.6+vn(x*2.1,y*2.1,s+11)*.28+vn(x*4.3,y*4.3,s+23)*.12;
const sstep=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const dSeg=(x,y,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/L));return Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t)};
const dPoly=(x,y,P)=>{let d=1e9;for(let i=0;i<P.length-1;i++){const q=dSeg(x,y,P[i],P[i+1]);if(q<d)d=q}return d};

/* ================= 1) QUY HOẠCH (toạ độ thế giới, y âm = phía bắc) ================= */
const AREAS=[// thứ tự ưu tiên khi xét khu đang đứng
 {k:'cave',n:'Hang Băng',r:[664,-548,770,-468]},
 {k:'peak',n:'Đỉnh núi · Bãi khai thác',r:[300,-650,700,-566]},
 {k:'valley',n:'Thung lũng Băng',r:[100,-566,420,-452]},
 {k:'slope',n:'Sườn núi',r:[420,-566,770,-490]},
 {k:'foot',n:'Chân núi',r:[100,-490,790,-340]}];
const areaAt=(x,y)=>{for(const a of AREAS)if(x>=a.r[0]&&x<a.r[2]&&y>=a.r[1]&&y<a.r[3])return a;return null};
const TRAILS=[
 {k:'main',w:3.4,p:[[316.7,-391],[318.3,-400],[330,-410.5],[348,-420],[368,-436],[382,-446],[410,-456],[440,-460],[470,-457],[500,-451],[530,-449],[560,-452],[590,-459],[615,-467],[630,-477],[634,-490],[633,-502]]},
 {k:'pass',w:3.2,p:[[633,-502],[620,-514],[600,-520],[578,-522],[555,-526],[530,-533],[505,-541],[485,-548],[471,-556],[468,-566],[470,-578],[480,-592],[492,-600]]},
 {k:'cave',w:2.8,p:[[633,-502],[655,-503],[680,-500],[701,-499]]},
 {k:'valley',w:3,p:[[382,-446],[362,-459],[338,-469],[312,-476],[285,-480],[262,-483]]},
 {k:'spring',w:2.4,p:[[312,-476],[306,-490],[302,-505]]},
 {k:'lake',w:2.4,p:[[262,-483],[256,-493],[252,-499]]},
 {k:'f1',w:3,soft:1,p:[[402,-603],[440,-600],[492,-600],[540,-602],[590,-600],[630,-598]]},
 {k:'f2',w:2.8,soft:1,p:[[430,-578],[431,-604],[429,-632]]},
 {k:'f3',w:2.8,soft:1,p:[[492,-600],[493,-620],[491,-640]]},
 {k:'f4',w:2.8,soft:1,p:[[552,-577],[551,-603],[553,-636]]},
 {k:'f5',w:2.8,soft:1,p:[[606,-576],[607,-600],[605,-626]]}];
const LAKE={x:243,y:-512,rx:20,ry:12};
const SPRING={x:300,y:-516,rx:4.6,ry:3.1};
const CABIN={x:236,y:-470};
const CAVE={x:706,y:-506,w:12};
const RAVINE=[[592,-499],[588,-512],[589,-528],[586,-543],[588,-556]];const RAV_W=4.4;
const BRIDGES=[{id:'NT1',ravine:1,at:[588.6,-521]}];// + cầu qua Suối Mây (tự tìm chỗ giao của đường thung lũng với suối)
const CLIFFS=[// [điểm…], H, tên
 {n:'Vách Sườn Bạch Vân',H:5,p:[[428,-492],[470,-489],[510,-494],[560,-490],[600,-495],[624,-492]]},
 {n:'Vách Sườn Bạch Vân',H:5,p:[[643,-493],[672,-490],[700,-494],[722,-491]]},
 {n:'Vách Đỉnh Bạch Vân',H:6,p:[[372,-562],[420,-560],[456,-563]]},
 {n:'Vách Đỉnh Bạch Vân',H:6,p:[[482,-563],[520,-559],[560,-562],[600,-560],[640,-563],[662,-561]]}];
const FIELD={r:[398,-640,642,-571]};// bãi khai thác (Đỉnh núi)

/* ================= 2) HÌNH (asset) ================= */
const cnv=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c};
function setAS(k,c){const a={u:c.toDataURL('image/png'),w:c.width,h:c.height};a.i=new Image();a.i.src=a.u;AS[k]=a;ST.sprites++;return a}
// thông phủ tuyết (từ thông có sẵn)
function snowPine(k,src,amt,seed){const im=src.i;if(!im||!im.complete||!im.naturalWidth)return false;const sc=3,w=im.naturalWidth*sc,h=im.naturalHeight*sc;
 const c=cnv(w,h,(g)=>{g.imageSmoothingEnabled=true;g.drawImage(im,0,0,w,h);const id=g.getImageData(0,0,w,h),d=id.data,A=(x,y)=>x<0||y<0||x>=w||y>=h?0:d[(y*w+x)*4+3];
  // bỏ điểm ảnh lạc ở mép trên ảnh gốc (hàng chấm nâu phía trên ngọn)
  {let top0=0;for(let y=0;y<h*.25;y++){let n=0;for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>60)n++;if(n>w*.04){top0=y;break}}for(let y=0;y<top0;y++)for(let x=0;x<w;x++)d[(y*w+x)*4+3]=0;
   for(let y=top0;y<Math.min(h,top0+h*.06);y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]>0&&Math.abs(x-w/2)>w*.18)d[i+3]=0}}
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]<60)continue;const top=A(x,y-4*sc/3|0)<40||A(x,y-2)<40,ny=y/h;let s=0;
   if(top&&ny<.86)s=1;else{const n=vn(x/(5*sc),y/(4*sc),seed);if(n>.62-amt*.12&&ny<.8&&(d[i]+d[i+1]+d[i+2])/3>55)s=.75*amt}
   if(s>0){const sh=.86+.14*vn(x/3,y/3,seed+5);d[i]=d[i]+(242*sh-d[i])*s;d[i+1]=d[i+1]+(246*sh-d[i+1])*s;d[i+2]=d[i+2]+(252*sh-d[i+2])*s}}
  g.putImageData(id,0,0);g.fillStyle='rgba(238,243,250,.95)';g.beginPath();g.ellipse(w/2,h-2,w*.22,h*.035,0,Math.PI,0);g.fill()});
 setAS(k,c);SW[k]=SW.pine||3;return true}
// khúc gỗ / gốc cây phủ tuyết (từ ảnh có sẵn: rêu xanh → tuyết)
function snowify(k,srcK){const a=AS[srcK];if(!a||!a.i||!a.i.complete||!a.i.naturalWidth)return false;const im=a.i,w=im.naturalWidth,h=im.naturalHeight;
 setAS(k,cnv(w,h,g=>{g.drawImage(im,0,0);const id=g.getImageData(0,0,w,h),d=id.data;for(let i=0;i<d.length;i+=4){if(d[i+3]<20)continue;const r=d[i],gg=d[i+1],b=d[i+2],l=(r+gg+b)/3;
  if(gg>r+6&&gg>b){const s=.84+.16*(l/255);d[i]=236*s;d[i+1]=242*s;d[i+2]=250*s}else{d[i]=r*.9+l*.1;d[i+1]=gg*.9+l*.1;d[i+2]=b*.9+l*.1+6}}g.putImageData(id,0,0)}));SW[k]=SW[srcK]||2;return true}
// chòi gỗ bỏ hoang (mặt trước, mái tuyết, cửa sổ đóng ván)
function cabinSprite(k,big){const W0=big?340:230,H0=big?290:200;return setAS(k,cnv(W0,H0,(g,w,h)=>{const R=rng(big?77:78),wy=h*.42,wh=h*.52,x0=w*.1,x1=w*.9;
 const logs=(xa,xb,ya,yb,dark)=>{for(let y=ya;y<yb;y+=h*.045){const c=dark?[82,58,40]:[112,80,52],v=(R()-.5)*16;g.fillStyle='rgb('+(c[0]+v)+','+(c[1]+v*.8)+','+(c[2]+v*.6)+')';g.fillRect(xa,y,xb-xa,h*.042);g.fillStyle='rgba(30,18,10,.45)';g.fillRect(xa,y+h*.036,xb-xa,h*.008);g.fillStyle='rgba(255,220,170,.12)';g.fillRect(xa,y,xb-xa,h*.006)}};
 logs(x0,x1,wy,wy+wh);g.fillStyle='rgba(20,12,6,.25)';g.fillRect(x1-w*.08,wy,w*.08,wh);
 for(const xx of[x0-2,x1-6]){g.fillStyle='#5b3e27';g.fillRect(xx,wy-4,8,wh+4)}
 // cửa lệch, tối
 const dx=w*.42,dw=w*.16;g.fillStyle='#24170e';g.fillRect(dx,wy+wh*.32,dw,wh*.68);g.save();g.translate(dx+dw,wy+wh*.32);g.rotate(.18);g.fillStyle='#6d4b30';g.fillRect(-dw*.15,0,dw*.5,wh*.68);g.restore();
 // cửa sổ đóng ván chéo
 const wx=w*.18,ww=w*.14,wyy=wy+wh*.28;g.fillStyle='#2a3440';g.fillRect(wx,wyy,ww,wh*.26);g.strokeStyle='#7a5636';g.lineWidth=h*.03;g.beginPath();g.moveTo(wx,wyy);g.lineTo(wx+ww,wyy+wh*.26);g.moveTo(wx+ww,wyy);g.lineTo(wx,wyy+wh*.26);g.stroke();
 if(big){const wx2=w*.66;g.fillStyle='#2a3440';g.fillRect(wx2,wyy,ww,wh*.26);g.fillStyle='#7a5636';g.fillRect(wx2,wyy+wh*.08,ww,h*.03);g.fillRect(wx2+ww*.1,wyy+wh*.17,ww*.8,h*.03)}
 // mái: tam giác đầu hồi + mái phủ tuyết dày
 g.fillStyle='#5a3d26';g.beginPath();g.moveTo(x0-w*.06,wy+2);g.lineTo(w/2,h*.08);g.lineTo(x1+w*.06,wy+2);g.closePath();g.fill();
 g.fillStyle='#3f2a1a';g.beginPath();g.moveTo(x0+w*.04,wy);g.lineTo(w/2,h*.16);g.lineTo(x1-w*.04,wy);g.closePath();g.fill();
 logs(x0+w*.08,x1-w*.08,h*.2,wy-2,true);
 g.fillStyle='#eef3fa';g.beginPath();g.moveTo(x0-w*.09,wy+6);g.lineTo(w/2,h*.04);g.lineTo(x1+w*.09,wy+6);g.lineTo(x1+w*.05,wy+14);g.lineTo(w/2,h*.13);g.lineTo(x0-w*.05,wy+14);g.closePath();g.fill();
 g.fillStyle='rgba(160,180,205,.55)';g.beginPath();g.moveTo(x0-w*.05,wy+14);g.lineTo(w/2,h*.13);g.lineTo(x1+w*.05,wy+14);g.lineTo(x1+w*.03,wy+18);g.lineTo(w/2,h*.16);g.lineTo(x0-w*.03,wy+18);g.closePath();g.fill();
 for(let i=0;i<14;i++){const t=i/13,xx=x0-w*.05+(x1-x0+w*.1)*t,yy=wy+14,L=4+R()*14;g.fillStyle='rgba(220,236,250,.9)';g.beginPath();g.moveTo(xx-2,yy);g.lineTo(xx+2,yy);g.lineTo(xx,yy+L);g.closePath();g.fill()}
 if(big){g.fillStyle='#5c5550';g.fillRect(w*.68,h*.06,w*.07,h*.2);g.fillStyle='#eef3fa';g.fillRect(w*.67,h*.05,w*.09,h*.03)}
 // tuyết dồn chân tường
 g.fillStyle='rgba(236,242,250,.97)';for(let i=0;i<6;i++){const xx=x0+(x1-x0)*(i/5),r=w*.08+R()*w*.05;g.beginPath();g.ellipse(xx,h-2,r,h*.06,0,Math.PI,0);g.fill()}}))}
// hang băng (từ cửa hang có sẵn: rêu → tuyết, đá → xám lạnh, lòng hang phát sáng xanh, nhũ băng)
function iceCave(k){const a=AS.cave1;if(!a||!a.i.complete||!a.i.naturalWidth)return false;const im=a.i,w=im.naturalWidth,h=im.naturalHeight;
 const c=cnv(w,h,(g)=>{g.drawImage(im,0,0);const id=g.getImageData(0,0,w,h),d=id.data,MK=new Uint8Array(w*h);let mx0=w,mx1=0,my0=h,my1=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]<20)continue;const r=d[i],gg=d[i+1],b=d[i+2],l=(r+gg+b)/3;
   if(gg>r+10&&gg>b+4){const s=.82+.18*(l/255);d[i]=235*s;d[i+1]=241*s;d[i+2]=250*s}
   else if(l<48&&y>h*.3){MK[y*w+x]=1;if(x<mx0)mx0=x;if(x>mx1)mx1=x;if(y<my0)my0=y;if(y>my1)my1=y}
   else{d[i]=l*.86+12;d[i+1]=l*.92+16;d[i+2]=l*1.02+26}}
  // lòng hang: chỉ tô đúng điểm ảnh tối (đánh dấu -1→0), sáng xanh từ giữa ra
  {const cx=(mx0+mx1)/2,cy=my1-(my1-my0)*.3,rr=Math.max(8,(mx1-mx0)*.62);for(let y=my0;y<=my1;y++)for(let x=mx0;x<=mx1;x++){const i=(y*w+x)*4;if(!MK[y*w+x])continue;const k=Math.max(0,1-Math.hypot((x-cx)/rr,(y-cy)/(rr*.7)));d[i]=20+120*k*k;d[i+1]=50+180*k;d[i+2]=110+145*k}}
  g.putImageData(id,0,0);
  if(mx1>mx0){
   const R=rng(9);for(let i=0;i<16;i++){const xx=mx0+(mx1-mx0)*(i+.5)/16+(R()-.5)*4,L=6+R()*(my1-my0)*.35,wd=2+R()*3;const gr2=g.createLinearGradient(0,my0,0,my0+L);gr2.addColorStop(0,'rgba(245,252,255,.98)');gr2.addColorStop(1,'rgba(170,220,255,.5)');g.fillStyle=gr2;g.beginPath();g.moveTo(xx-wd,my0+2);g.lineTo(xx+wd,my0+2);g.lineTo(xx,my0+2+L);g.closePath();g.fill()}
   for(const[xx,s]of[[mx0+6,1],[mx1-6,-1]]){for(let j=0;j<4;j++){const bx=xx+s*j*7,hh2=14+R()*22,ww=5+R()*4;g.fillStyle='rgba(150,225,255,.92)';g.beginPath();g.moveTo(bx-ww,my1);g.lineTo(bx-ww*.6,my1-hh2*.8);g.lineTo(bx,my1-hh2);g.lineTo(bx+ww*.6,my1-hh2*.8);g.lineTo(bx+ww,my1);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.7)';g.fillRect(bx-1,my1-hh2*.9,2,hh2*.7)}}}});
 setAS(k,c);return true}
// cụm pha lê băng
function crystalSprite(k,seed){return setAS(k,cnv(130,120,(g,w,h)=>{const R=rng(seed);g.fillStyle='rgba(230,240,250,.95)';g.beginPath();g.ellipse(w/2,h-6,w*.42,9,0,Math.PI,0);g.fill();
 const sh=[[0,1,.2],[-.22,.7,-.35],[.22,.75,.3],[-.38,.45,-.5],[.38,.5,.55],[.1,.55,.1]];for(const[o,s,t]of sh){const bx=w/2+o*w,H=h*.78*s*(.85+R()*.3),ww=w*.08*(.8+R()*.4);g.save();g.translate(bx,h-8);g.rotate(t*.6);
  const gr=g.createLinearGradient(-ww,0,ww,0);gr.addColorStop(0,'#7fd3ff');gr.addColorStop(.5,'#d8f6ff');gr.addColorStop(1,'#4aa8e6');g.fillStyle=gr;g.beginPath();g.moveTo(-ww,0);g.lineTo(-ww,-H*.75);g.lineTo(0,-H);g.lineTo(ww,-H*.75);g.lineTo(ww,0);g.closePath();g.fill();
  g.fillStyle='rgba(255,255,255,.75)';g.fillRect(-ww*.35,-H*.8,ww*.25,H*.7);g.restore()}}))}
// biển gỗ có chữ
function signSprite(k,txt){return setAS(k,cnv(260,180,(g,w,h)=>{g.fillStyle='#5a3c22';g.fillRect(w*.47,h*.35,w*.06,h*.65);g.fillStyle='#8a6038';g.fillRect(w*.06,h*.08,w*.88,h*.36);g.strokeStyle='#4a2f19';g.lineWidth=4;g.strokeRect(w*.06,h*.08,w*.88,h*.36);
 g.fillStyle='#f3ead8';g.font='bold '+Math.round(h*.14)+'px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,w/2,h*.26,w*.82);
 g.fillStyle='#f2f6fc';g.beginPath();g.ellipse(w/2,h*.08,w*.46,h*.05,0,Math.PI,0);g.fill();g.beginPath();g.ellipse(w/2,h-3,w*.18,h*.05,0,Math.PI,0);g.fill()}))}
// tời gỗ (giá khai thác) + xe goòng chở quặng
function frameSprite(k){return setAS(k,cnv(220,260,(g,w,h)=>{g.strokeStyle='#6b4a2c';g.lineWidth=12;g.beginPath();g.moveTo(w*.15,h);g.lineTo(w*.45,h*.12);g.lineTo(w*.75,h);g.moveTo(w*.5,h);g.lineTo(w*.45,h*.12);g.stroke();
 g.lineWidth=8;g.beginPath();g.moveTo(w*.25,h*.7);g.lineTo(w*.68,h*.7);g.stroke();g.fillStyle='#4a3220';g.beginPath();g.arc(w*.45,h*.14,14,0,7);g.fill();g.strokeStyle='#2b2018';g.lineWidth=2;g.beginPath();g.moveTo(w*.45,h*.14);g.lineTo(w*.62,h*.55);g.stroke();
 g.fillStyle='#5b4632';g.fillRect(w*.56,h*.55,w*.13,h*.1);g.fillStyle='#f0f5fb';g.fillRect(w*.38,h*.1,w*.14,6);g.beginPath();g.ellipse(w*.5,h-3,w*.42,10,0,Math.PI,0);g.fill()}))}
function cartSprite(k){return setAS(k,cnv(220,150,(g,w,h)=>{g.fillStyle='#3a3633';g.fillRect(0,h-12,w,5);g.fillRect(0,h-26,w,4);
 g.fillStyle='#6d4b2e';g.beginPath();g.moveTo(w*.15,h*.35);g.lineTo(w*.85,h*.35);g.lineTo(w*.78,h*.8);g.lineTo(w*.22,h*.8);g.closePath();g.fill();g.fillStyle='#4f3520';for(let i=0;i<4;i++)g.fillRect(w*.18,h*(.42+i*.1),w*.64,3);
 const R=rng(31);for(let i=0;i<10;i++){const x=w*(.25+R()*.5),y=h*(.28+R()*.08),r=8+R()*9;g.fillStyle=i%3===0?'#c9782d':i%3===1?'#9a4a26':'#7a7e86';g.beginPath();g.ellipse(x,y,r,r*.75,R(),0,7);g.fill();g.fillStyle='rgba(255,230,190,.35)';g.fillRect(x-r*.3,y-r*.4,r*.4,2)}
 g.fillStyle='#222';for(const x of[w*.3,w*.7]){g.beginPath();g.arc(x,h*.83,10,0,7);g.fill()}}))}
// đá & quặng: dựng sprite 2D từ chính mô hình 3D (cùng góc camera 2.5D: nhìn xuống 60°)
let RND=null;
function rockSprite(type,v){const key='nt_'+type.slice(2)+v;if(AS[key])return true;const T=globalThis.THREE;if(!T||!SH.ART6||!SH.ART6.geo)return false;
 try{if(!RND){const r=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});r.setPixelRatio(1);r.setSize(200,240);r.setClearColor(0x000000,0);
   const sc=new T.Scene();sc.add(new T.AmbientLight(0xfdfdfe,.73));const dl=new T.DirectionalLight(0xfff1dc,.62);dl.position.set(.35,1,.62);sc.add(dl);
   const cam=new T.OrthographicCamera(-.5,.5,.72,-.48,.01,20);cam.position.set(0,Math.sin(Math.PI/3)*5,Math.cos(Math.PI/3)*5);cam.lookAt(0,0,0);RND={r,sc,cam,mesh:null}}
  const g=SH.ART6.geo(type,v);if(RND.mesh)RND.sc.remove(RND.mesh);RND.mesh=new T.Mesh(g,SH.ART6.material);RND.mesh.scale.set(1,1.45,1);RND.sc.add(RND.mesh);RND.r.render(RND.sc,RND.cam);
  const src=RND.r.domElement,W0=src.width,H0=src.height,tmp=cnv(W0,H0,q=>q.drawImage(src,0,0)),q=tmp.getContext('2d'),d=q.getImageData(0,0,W0,H0).data;let y0=H0,y1=0;
  for(let y=0;y<H0;y++)for(let x=0;x<W0;x+=2)if(d[(y*W0+x)*4+3]>12){if(y<y0)y0=y;if(y>y1)y1=y}
  if(y1<=y0)return false;const out=cnv(W0,y1-y0+1,o=>o.drawImage(tmp,0,y0,W0,y1-y0+1,0,0,W0,y1-y0+1));setAS(key,out);return true}catch(e){ST.errS=String(e&&e.message||e);return false}}

/* ================= 3) VÙNG CẤM ĐẶT VẬT (đường, hồ, công trình…) ================= */
const Zpoly=()=>ZONE().poly;
function inPoly(x,y,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
function edgeDist(x,y,P){let d=1e9;for(let i=0,j=P.length-1;i<P.length;j=i++){const q=dSeg(x,y,P[j],P[i]);if(q<d)d=q}return d}
const inZ=(x,y,m=0)=>{const P=Zpoly();return inPoly(x,y,P)&&(m<=0||edgeDist(x,y,P)>m)};
const inEll=(x,y,e,m=0)=>((x-e.x)/(e.rx+m))**2+((y-e.y)/(e.ry+m))**2<1;
function riverD(x,y){let d=1e9;for(const r of W.RV||[])for(let i=0;i<r.N-1;i+=1){const ax=r.X[i],ay=r.Y[i];if(Math.abs(ax-x)>40||Math.abs(ay-y)>40)continue;const q=dSeg(x,y,[ax,ay],[r.X[i+1],r.Y[i+1]])-r.HW[i];if(q<d)d=q}return d}
function cliffD(x,y){let d=1e9;for(const c of CLIFFS){for(let i=0;i<c.p.length-1;i++){const a=c.p[i],b=c.p[i+1];if(x<Math.min(a[0],b[0])-2||x>Math.max(a[0],b[0])+2)continue;const yb=a[1]+(b[1]-a[1])*Math.max(0,Math.min(1,(x-a[0])/((b[0]-a[0])||1)));const dz=y>yb?y-yb:(y<yb-c.H?yb-c.H-y:0);if(dz<d)d=dz}}return d}
function busy(x,y,m){// true = không đặt vật ở đây (m = khoảng chừa thêm)
 for(const t of TRAILS)if(dPoly(x,y,t.p)<t.w/2+m)return true;
 if(inEll(x,y,LAKE,m+2)||inEll(x,y,SPRING,m+2.5))return true;
 if(Math.abs(x-CABIN.x)<12+m&&y>CABIN.y-6-m&&y<CABIN.y+5+m)return true;
 if(Math.abs(x-CAVE.x)<CAVE.w/2+4+m&&y>CAVE.y-9-m&&y<CAVE.y+5+m)return true;
 if(dPoly(x,y,RAVINE)<RAV_W/2+1.5+m)return true;
 if(cliffD(x,y)<1.5+m)return true;
 if(riverD(x,y)<2+m)return true;
 return false}
const inField=(x,y)=>x>FIELD.r[0]&&x<FIELD.r[2]&&y>FIELD.r[1]&&y<FIELD.r[3];

/* ================= 4) DỌN BẢNG CŨ trên đường/công trình/bãi khai thác ================= */
function clearTables(){const hit=(x,y)=>inZ(x,y,-3)&&(inField(x,y)||busy(x,y,1.2));
 const cut=(a,f,k)=>{if(!a)return;let n=0;const n0=a.length;for(const o of a)if(!f(o))a[n++]=o;a.length=n;ST.cleared[k]+=n0-n};
 cut(M.K,q=>hit(q[1],q[2]),'K');cut(M.D,q=>hit(q[1],q[2]),'D');if(M.FD)cut(M.FD,q=>hit(q[1],q[2]),'D');cut(M.C,c=>hit((c.x0+c.x1)/2,(c.z0+c.z1)/2),'C');
 // thông có sẵn trong khu → thông phủ tuyết (giữ vị trí, cỡ)
 for(const q of M.D)if((q[0]==='pine2'||q[0]==='pine')&&inZ(q[1],q[2]))q[0]='nt_pine'+(1+((q[1]*7+q[2]*3)&1?1:0)+(q[0]==='pine'?1:0))}

/* ================= 5) ĐẶT VẬT ================= */
const DEC=[],COLS=[];
function dec(k,x,y,w,extra){const o=[k,+x.toFixed(2),+y.toFixed(2),w];o.nt37=1;if(extra)Object.assign(o,extra);SH.DEC.push(o);DEC.push(o);return o}
function col(x0,z0,x1,z1,tag){const c={x0,x1,z0,z1,on:true,nt37:tag||1};SH.cols.push(c);COLS.push(c);ST.cols++;return c}
function poisson(R,box,minD,N,ok){const out=[];for(let i=0;i<N;i++){const x=box[0]+R()*(box[2]-box[0]),y=box[1]+R()*(box[3]-box[1]);if(!ok(x,y))continue;let f=true;for(const p of out)if(Math.abs(p[0]-x)<minD&&Math.abs(p[1]-y)<minD&&Math.hypot(p[0]-x,p[1]-y)<minD){f=false;break}if(f)out.push([x,y])}return out}
function placeNature(){const R=rng(3737);
 // rừng thông phủ tuyết: dày ở chân núi, thưa ở thung lũng & sườn, rải rác ven đỉnh
 const zones=[['foot',[150,-488,700,-366],3.6,5200],['valley',[110,-562,420,-452],9,900],['slope',[420,-560,760,-497],10,900],['peak',[300,-648,700,-570],15,700]];
 for(const[ak,box,md,n]of zones)for(const[x,y]of poisson(R,box,md,n,(x,y)=>{const a=areaAt(x,y);return a&&a.k===ak&&inZ(x,y,2.5)&&!busy(x,y,1.6)&&!inField(x,y)})){
  const v=1+((R()*3)|0),w=ak==='foot'?2.6+R()*1.6:2.2+R()*1.4;dec('nt_pine'+v,x,y,w);col(x-.3,y-.35,x+.3,y-.02,'tree');ST.trees++}
 // đá phủ tuyết (trang trí): sỏi & tảng vừa ở chân núi/sườn, tảng lớn quanh đỉnh
 for(const[x,y]of poisson(R,[110,-648,770,-366],8,1400,(x,y)=>inZ(x,y,3)&&!busy(x,y,2.4)&&!inField(x,y))){const a=areaAt(x,y);if(!a)continue;const big=a.k==='peak'||a.k==='slope'&&R()<.35;
  const w=big?2.6+R()*2.8:1.1+R()*1.4;if(R()<(a.k==='foot'?.55:.8)){const v=(R()*12)|0;dec('nt_sr'+v,x,y,w,{ntRock:1});col(x-w*.36,y-w*.25,x+w*.36,y+w*.1,'rock');ST.rocks++}}
 // cây sương giá & khúc gỗ lác đác
 for(const[x,y]of poisson(R,[110,-600,770,-366],6,700,(x,y)=>inZ(x,y,2)&&!busy(x,y,1)&&!inField(x,y))){const f=R()<.85;dec(f?'decor9_frost':'nt_log',x,y,f?1+R()*.6:1.8)}}
function placeFeatures(){const R=rng(911);
 // thung lũng: chòi gỗ bỏ hoang + nhà kho + củi + hàng rào gãy
 dec('nt_cabin',CABIN.x,CABIN.y,7);col(CABIN.x-3.1,CABIN.y-2.6,CABIN.x+3.1,CABIN.y-.1,'bld');
 dec('nt_shed',CABIN.x-9,CABIN.y+1.5,4.2);col(CABIN.x-10.8,CABIN.y-.2,CABIN.x-7.2,CABIN.y+1.4,'bld');
 dec('nt_log',CABIN.x+5,CABIN.y+1,2);dec('nt_stump',CABIN.x+6.5,CABIN.y+3,1.2);
 // suối nóng: không đi vào lòng suối
 {const s=SPRING;col(s.x-s.rx*.95,s.y-s.ry*.5,s.x+s.rx*.95,s.y+s.ry*.5,'spring');col(s.x-s.rx*.68,s.y-s.ry*.95,s.x+s.rx*.68,s.y-s.ry*.5,'spring');col(s.x-s.rx*.68,s.y+s.ry*.5,s.x+s.rx*.68,s.y+s.ry*.92,'spring')}
 for(let i=0;i<5;i++){if(i===2)continue;dec('m8fence',CABIN.x-6+i*3.2,CABIN.y+4.6,3)}
 // suối nước nóng: viền đá quanh hồ
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2,x=SPRING.x+Math.cos(a)*(SPRING.rx+.7),y=SPRING.y+Math.sin(a)*(SPRING.ry+.6);dec('nt_sr'+(i%12),x,y,.9+R()*.5,{ntRock:1})}
 // hang băng + pha lê
 dec('nt_icecave',CAVE.x,CAVE.y,CAVE.w);
 {const L=CAVE.x-CAVE.w/2+.4,Rr=CAVE.x+CAVE.w/2-.4,mx=CAVE.x,ow=2.6,zt=CAVE.y-CAVE.w*232/440*.9;col(L,zt,mx-ow/2,CAVE.y-.05,'cave');col(mx+ow/2,zt,Rr,CAVE.y-.05,'cave');col(mx-ow/2,zt,mx+ow/2,CAVE.y-.8,'cave')}
 for(const[dx,dy,w]of[[-7.5,1.2,1.6],[7.2,.8,1.8],[-4.5,2.6,1],[5,2.8,1.1],[9.5,-1,1.3],[-9.6,-.6,1.2]]){const x=CAVE.x+dx,y=CAVE.y+dy;dec('nt_icecry'+(1+((dx>0)?1:0)),x,y,w);col(x-w*.3,y-w*.2,x+w*.3,y,'cry')}
 // biển chỉ đường
 dec('nt_sign0',313.2,-401,2.2);dec('nt_sign1',378,-441,2.2);dec('nt_sign2',640,-506,2.2);dec('nt_sign3',474,-572,2.2);
 // trại khai thác ở cửa bãi
 dec('nt_frame',462,-582,3.4);col(460.6,-582.5,463.4,-582,'prop');dec('nt_mcart',500,-594,2.6);col(498.8,-594.5,501.2,-593.6,'prop');
 ST.props=DEC.length}

/* ================= 6) BÃI KHAI THÁC (đỉnh núi) ================= */
const NODES=[];
const NODE_CFG={st:{uses:3,resp:24,lb:'Đào đá',item:'stone',min:2,max:4,ic:'🪨',nm:'đá'},cu:{uses:2,resp:36,lb:'Đào quặng đồng',item:'cu',min:1,max:2,ic:'🟠',nm:'đồng'},fe:{uses:2,resp:36,lb:'Đào quặng sắt',item:'iron',min:1,max:2,ic:'⚙️',nm:'sắt'}};
function boxOf(x,y,w){return[x-w*.37,y-w*.27,x+w*.37,y+w*.13]}
function boxGap(a,b){const dx=Math.max(a[0]-b[2],b[0]-a[2],0),dy=Math.max(a[1]-b[3],b[1]-a[3],0);return Math.hypot(dx,dy)}
function buildField(){const R=rng(60202),P=Zpoly(),cand=[],clusters=[];
 const okBox=(bx)=>{for(const[x,y]of[[bx[0],bx[1]],[bx[2],bx[1]],[bx[0],bx[3]],[bx[2],bx[3]]])if(!inPoly(x,y,P)||edgeDist(x,y,P)<3)return false;
  const cx=(bx[0]+bx[2])/2,cy=(bx[1]+bx[3])/2,rr=Math.max(bx[2]-bx[0],bx[3]-bx[1])/2;for(const t of TRAILS)if(dPoly(cx,cy,t.p)<t.w/2+rr+1.3)return false;if(cliffD(cx,cy)<rr+2)return false;return inField(cx,cy)};
 // tâm cụm: lưới lệch ngẫu nhiên ~15 m
 for(let gx=FIELD.r[0]+6;gx<FIELD.r[2]-4;gx+=15)for(let gy=FIELD.r[1]+5;gy<FIELD.r[3]-3;gy+=14){const x=gx+(R()-.5)*9,y=gy+(R()-.5)*8;if(!inZ(x,y,6))continue;clusters.push({x,y,r:3.5+R()*3.2,ore:null})}
 // mỗi cụm 3–8 tảng to nhỏ khác nhau, không chồng nhau, chừa lối ≥1,5 m
 for(const c of clusters){const n=3+((R()*6)|0);for(let k=0;k<n*6&&c.n!==n;k++){const a=R()*6.283,d=Math.sqrt(R())*c.r,x=c.x+Math.cos(a)*d,y=c.y+Math.sin(a)*d*.8,s=R(),w=s<.25?2.4+R()*1:s<.7?1.7+R()*.7:1.2+R()*.5,bx=boxOf(x,y,w);
   if(!okBox(bx))continue;let f=true;for(const o of cand)if(boxGap(o.bx,bx)<1.5){f=false;break}if(!f)continue;cand.push({x,y,w,bx,c,d});c.n=(c.n||0)+1}}
 // tỉ lệ 60/20/20: quặng gom theo cụm (lõi cụm ưu tiên), phần còn lại là đá thường
 const N=cand.length,nCu=Math.round(N*.2),nFe=Math.round(N*.2);clusters.forEach((c,i)=>{c.ore=['cu','fe',null,'cu','fe',null,null][i%7]});
 const pick=(ore,n)=>{const pool=cand.filter(o=>!o.t).sort((a,b)=>((b.c.ore===ore)-(a.c.ore===ore))||(a.d-b.d)||(a.w-b.w));for(let i=0;i<n&&i<pool.length;i++)pool[i].t=ore};
 pick('cu',nCu);pick('fe',nFe);for(const o of cand)if(!o.t)o.t='st';
 cand.forEach((o,i)=>{const v=(hh(Math.round(o.x*10),Math.round(o.y*10),5)*12)|0,w=o.t==='st'?o.w:o.w*.92,id='nt'+i;
  const n={id,t:o.t,x:+o.x.toFixed(2),y:+o.y.toFixed(2),w:+w.toFixed(2),v,uses:NODE_CFG[o.t].uses,at:0,d:null,c:null};NODES.push(n);ST.nodes[o.t]++});
 for(const n of NODES)showNode(n)}
function showNode(n){if(!n.d){n.d=[('nt_'+n.t)+n.v,n.x,n.y,n.w];n.d.nt37=1;n.d.ntNode=n.id;SH.DEC.push(n.d)}if(!n.c){const b=boxOf(n.x,n.y,n.w);n.c={x0:b[0],x1:b[2],z0:b[1],z1:b[3],on:true,nt37:'node'};SH.cols.push(n.c)}else n.c.on=true}
function hideNode(n){if(n.d){const i=SH.DEC.indexOf(n.d);if(i>=0)SH.DEC.splice(i,1);n.d=null}if(n.c){n.c.on=false;const i=SH.cols.indexOf(n.c);if(i>=0)SH.cols.splice(i,1);n.c=null}try{SH.colsDirty()}catch(_){}}
function fx(n,done){try{const sp=SH.F5&&SH.F5.ripples;void sp}catch(_){}FXL.push({x:n.x,y:n.y,t0:performance.now(),c:n.t==='cu'?'#e0893a':n.t==='fe'?'#b5582e':'#a9adb5',big:done})}
const FXL=[];
function mine(n){const cfg=NODE_CFG[n.t];if(!S.on||S.dead||n.uses<=0)return;if(Math.hypot(pos.x-n.x,pos.y-n.y)>2.4+n.w*.45)return;
 if(!S.pick)return say('⛏ Cần cuốc chim – chế tạo ở 🔨 bàn chế tạo trong nhà gỗ');try{SH.F5&&SH.F5.tool&&SH.F5.tool('mine')}catch(_){}
 const want=cfg.min+Math.floor(Math.random()*(cfg.max-cfg.min+1)),got=X.give(cfg.item,want);if(!got)return say('🎒 Túi đầy! Mở túi 🎒 để vứt bớt đồ');
 n.uses--;ST.mined[n.t]+=got;say('⛏ '+cfg.ic+' Đào được '+got+' '+cfg.nm+(n.uses>0?'':' – điểm này đã cạn, mọc lại sau ~'+cfg.resp+' giờ'));fx(n,n.uses<=0);
 if(n.uses<=0){n.at=GT()+cfg.resp;hideNode(n)}try{X.WORLD&&X.WORLD.emit('nt37.mine',{id:n.id,t:n.t,left:n.uses})}catch(_){}try{if(document.getElementById('inv').style.display==='flex')X.renderInv()}catch(_){}}
function hookActs(){const F5=SH.F5;if(!F5||F5.__nt37)return;F5.__nt37=1;const a0=F5.acts;F5.acts=c=>{a0&&a0(c);if(IH()||!inField(pos.x,pos.y))return;
 for(const n of NODES){if(n.uses<=0)continue;const d=Math.hypot(pos.x-n.x,pos.y-n.y),rr=1.9+n.w*.45;if(d<rr)c(d,rr,S.pick?'⛏<br>'+NODE_CFG[n.t].lb:'⛏<br>Cần cuốc',()=>mine(n),{x:n.x,y:n.y})}}}

/* ================= 7) NỀN ĐẤT (vẽ theo ô 64 m, 8 px/m, cache) – dùng chung 2D & nền 2.5D ================= */
const TS=64,PPM=8,TP=TS*PPM,TILES=new Map();const ZB=[100,-650,795,-340];
const ovl=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
function tile(i,j){const key=i+','+j;let t=TILES.get(key);if(t){t.u=performance.now();return t.c}const t0=performance.now(),x0=i*TS,y0=j*TS,P=Zpoly(),c=document.createElement('canvas');c.width=c.height=TP;const g=c.getContext('2d');
 // (a) mảng đá xám lộ, tuyết dày, cỏ khô lộ ở chân núi – theo nhiễu; mềm dần ở biên khu
 const PAD=16,TQ=TP+2*PAD,id=g.createImageData(TQ,TQ),d=id.data,B=4;
 for(let py=0;py<TQ;py+=B)for(let px=0;px<TQ;px+=B){const x=x0+(px-PAD+B/2)/PPM,y=y0+(py-PAD+B/2)/PPM;if(!inPoly(x,y,P))continue;const e=Math.min(1,edgeDist(x,y,P)/5);if(e<=0)continue;
  // độ cao/độ dày tuyết chuyển dần theo hướng bắc (không theo ranh hình chữ nhật của khu)
  const lv=.2+.32*sstep(438,486,-y)+.48*sstep(552,592,-y)+.1*(fbm(x/60,y/60,7)-.5);
  const nr=fbm(x/16,y/16,3),nd=fbm(x/9,y/9,17),ng=fbm(x/12,y/12,29),fine=vn(x*1.7,y*1.7,41);let r=0,gg=0,b=0,al=0;
  const rock=sstep(.5+lv*.06,.66+lv*.06,nr)*(.8-.25*sstep(.6,1,lv));if(rock>0){const sh=.85+.3*fine;r=112*sh;gg=117*sh;b=126*sh;al=rock*.8}
  const grass=sstep(.56,.72,ng)*(1-sstep(.22,.42,lv));if(grass>al*.5&&grass>0){const sh=.85+.25*fine;r=104*sh;gg=112*sh;b=92*sh;al=Math.max(al,grass*.62)}
  const drift=sstep(.52-lv*.12,.7-lv*.1,nd)*(.35+lv*.55);if(drift>0){const m=drift;r=r*(1-m)+244*m;gg=gg*(1-m)+247*m;b=b*(1-m)+252*m;al=Math.max(al,m*.85)}
  {const fd=Math.min(x-FIELD.r[0],FIELD.r[2]-x,y-FIELD.r[1],FIELD.r[3]-y)+(fbm(x/7,y/7,51)-.5)*14,fw=sstep(-3,7,fd);if(fw>0){const gv=fine>.55?1:0,m2=(.45+.2*gv)*fw;r=r*(1-m2)+(gv?138:116)*m2;gg=gg*(1-m2)+(gv?133:114)*m2;b=b*(1-m2)+(gv?126:112)*m2;al=Math.max(al,.55*fw)}}
  if(al<=0)continue;al*=e;for(let yy=0;yy<B;yy++)for(let xx=0;xx<B;xx++){const q=((py+yy)*TQ+px+xx)*4;d[q]=r;d[q+1]=gg;d[q+2]=b;d[q+3]=al*255}}
 // làm mềm (hết ô vuông khi phóng to) – tạo rộng hơn ô rồi cắt → không lộ đường nối giữa các ô
 {const big=cnv(TQ,TQ,q=>q.putImageData(id,0,0));g.clearRect(0,0,TP,TP);g.filter='blur(5px)';g.drawImage(big,-PAD,-PAD);g.filter='none'}
 g.setTransform(PPM,0,0,PPM,-x0*PPM,-y0*PPM);
 holes(g,x0,y0);g.globalCompositeOperation='source-over';g.setTransform(1,0,0,1,0,0);
 TILES.set(key,{c,u:performance.now()});ST.tiles++;ST.tileMs=+(performance.now()-t0).toFixed(1);
 if(TILES.size>36){let old=null;for(const[k,v]of TILES)if(!old||v.u<old[1].u)old=[k,v];TILES.delete(old[0])}return c}
/* lớp vector (đường, hồ, suối nóng, khe, ánh hang) – vẽ trực tiếp ở độ phân giải màn hình → luôn nét */
function vec(g,VB,P){const x0=VB[0],y0=VB[1],TS_=0;void TS_;
 const path=(P2)=>{g.beginPath();P2.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]))};
 // chỉ vẽ trong khu (+ một vòng nhỏ ở cửa vào để đường nối liền cuối đường T2), chừa mặt cầu
 g.save();g.beginPath();P.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.moveTo(316.7+13,-395);g.arc(316.7,-395,13,0,7);g.clip('nonzero');
 g.beginPath();g.rect(VB[0]-50,VB[1]-50,VB[2]-VB[0]+100,VB[3]-VB[1]+100);for(const b of BR){const ca=b.ux,sa=b.uy,L=b.hl+.4,Wd=b.hw+.5,pt=(a,c)=>[b.x+ca*a-sa*c,b.y+sa*a+ca*c],q=[pt(-L,-Wd),pt(L,-Wd),pt(L,Wd),pt(-L,Wd)];g.moveTo(...q[0]);g.lineTo(...q[1]);g.lineTo(...q[2]);g.lineTo(...q[3]);g.closePath()}g.clip('evenodd');
 // (b) hồ băng: băng xanh, vết nứt, viền tuyết
 if(ovl([LAKE.x-LAKE.rx-3,LAKE.y-LAKE.ry-3,LAKE.x+LAKE.rx+3,LAKE.y+LAKE.ry+3],VB)){
  g.fillStyle='rgba(236,242,250,.95)';g.beginPath();g.ellipse(LAKE.x,LAKE.y,LAKE.rx+1.6,LAKE.ry+1.3,0,0,7);g.fill();
  const gr=g.createRadialGradient(LAKE.x-4,LAKE.y-3,1,LAKE.x,LAKE.y,LAKE.rx);gr.addColorStop(0,'#bfe7fb');gr.addColorStop(.6,'#8fcdf0');gr.addColorStop(1,'#6eb4e2');g.fillStyle=gr;g.beginPath();g.ellipse(LAKE.x,LAKE.y,LAKE.rx,LAKE.ry,0,0,7);g.fill();
  g.save();g.beginPath();g.ellipse(LAKE.x,LAKE.y,LAKE.rx,LAKE.ry,0,0,7);g.clip();const R=rng(55);g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=.12;for(let i=0;i<34;i++){let x=LAKE.x+(R()-.5)*LAKE.rx*2,y=LAKE.y+(R()-.5)*LAKE.ry*2;g.beginPath();g.moveTo(x,y);for(let s=0;s<5;s++){x+=(R()-.5)*7;y+=(R()-.5)*4;g.lineTo(x,y)}g.stroke()}
   g.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<10;i++){g.beginPath();g.ellipse(LAKE.x+(R()-.5)*LAKE.rx*1.6,LAKE.y+(R()-.5)*LAKE.ry*1.5,1.5+R()*4,.6+R()*1.4,R(),0,7);g.fill()}g.restore();
  g.strokeStyle='rgba(120,170,210,.6)';g.lineWidth=.25;g.beginPath();g.ellipse(LAKE.x,LAKE.y,LAKE.rx,LAKE.ry,0,0,7);g.stroke()}
 // (c) suối nước nóng
 if(ovl([SPRING.x-8,SPRING.y-8,SPRING.x+8,SPRING.y+8],VB)){g.fillStyle='rgba(120,118,112,.9)';g.beginPath();g.ellipse(SPRING.x,SPRING.y,SPRING.rx+.9,SPRING.ry+.8,0,0,7);g.fill();
  const gr=g.createRadialGradient(SPRING.x,SPRING.y,.3,SPRING.x,SPRING.y,SPRING.rx);gr.addColorStop(0,'#9ff1e8');gr.addColorStop(.6,'#46c3c6');gr.addColorStop(1,'#2a8fa6');g.fillStyle=gr;g.beginPath();g.ellipse(SPRING.x,SPRING.y,SPRING.rx,SPRING.ry,0,0,7);g.fill();
  g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=.12;for(let i=1;i<4;i++){g.beginPath();g.ellipse(SPRING.x,SPRING.y,SPRING.rx*i/4,SPRING.ry*i/4,0,0,7);g.stroke()}}
 // (d) khe núi
 if(ovl([570,-562,610,-494],VB)){g.lineCap='round';g.lineJoin='round';path(RAVINE);g.strokeStyle='rgba(235,241,249,.95)';g.lineWidth=RAV_W+1.4;g.stroke();path(RAVINE);g.strokeStyle='#5d6672';g.lineWidth=RAV_W;g.stroke();path(RAVINE);g.strokeStyle='#323a46';g.lineWidth=RAV_W*.62;g.stroke();path(RAVINE);g.strokeStyle='#161b24';g.lineWidth=RAV_W*.28;g.stroke()}
 // (e) ánh băng trước cửa hang
 if(ovl([CAVE.x-14,CAVE.y-6,CAVE.x+14,CAVE.y+12],VB)){const gr=g.createRadialGradient(CAVE.x,CAVE.y+1,.5,CAVE.x,CAVE.y+2,9);gr.addColorStop(0,'rgba(150,220,255,.55)');gr.addColorStop(1,'rgba(150,220,255,0)');g.fillStyle=gr;g.fillRect(CAVE.x-12,CAVE.y-6,24,18)}
 // (f) đường mòn: đất nâu nhạt nén, mép tuyết; lối trong bãi khai thác nhạt hơn
 g.lineCap='round';g.lineJoin='round';for(const t of TRAILS){const bb=t.p.reduce((a,p)=>[Math.min(a[0],p[0]),Math.min(a[1],p[1]),Math.max(a[2],p[0]),Math.max(a[3],p[1])],[1e9,1e9,-1e9,-1e9]);if(!ovl([bb[0]-4,bb[1]-4,bb[2]+4,bb[3]+4],VB))continue;
  path(t.p);g.strokeStyle='rgba(236,242,250,.9)';g.lineWidth=t.w+1.1;g.stroke();path(t.p);g.strokeStyle=t.soft?'#c3b49d':'#b49673';g.lineWidth=t.w;g.stroke();path(t.p);g.strokeStyle=t.soft?'rgba(214,204,186,.7)':'rgba(206,184,150,.65)';g.lineWidth=t.w*.45;g.stroke();
  // sỏi/đá vụn rải trên đường
  {const R=rng(t.k.length*131+7);g.fillStyle='rgba(110,92,72,.35)';for(let i=0;i<t.p.length-1;i++){const a=t.p[i],b=t.p[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let s=0;s<L;s+=1.3){const x=a[0]+(b[0]-a[0])*s/L+(R()-.5)*t.w*.8,y=a[1]+(b[1]-a[1])*s/L+(R()-.5)*t.w*.8;if(x<VB[0]-2||x>VB[2]+2||y<VB[1]-2||y>VB[3]+2)continue;g.beginPath();g.ellipse(x,y,.08+R()*.1,.06+R()*.07,0,0,7);g.fill()}}}}
 // (g) bóng chân vách (phía nam vách)
 for(const c of CLIFFS){path(c.p);g.strokeStyle='rgba(60,70,86,.28)';g.lineWidth=1.6;g.stroke()}
 g.restore()}
/* (h) giữ nước suối & mặt cầu (vẽ ở lớp dưới) – xoá lớp phủ nhiễu chỗ đó */
function holes(g,x0,y0){const TSx=TS;
 g.globalCompositeOperation='destination-out';for(const r of W.RV||[]){let any=false;for(let i=0;i<r.N;i+=4)if(r.X[i]>x0-10&&r.X[i]<x0+TS+10&&r.Y[i]>y0-10&&r.Y[i]<y0+TS+10){any=true;break}if(!any)continue;
  for(let i=0;i<r.N-1;i++){if(r.X[i]<x0-10||r.X[i]>x0+TS+10||r.Y[i]<y0-10||r.Y[i]>y0+TS+10)continue;if(r.FD[i]==2&&r.FD[i+1]==2)continue;g.beginPath();g.moveTo(r.X[i],r.Y[i]);g.lineTo(r.X[i+1],r.Y[i+1]);g.lineWidth=r.HW[i]*2+.6;g.strokeStyle='#000';g.stroke()}}
 for(const b of BR){g.save();g.translate(b.x,b.y);g.rotate(Math.atan2(b.uy,b.ux));g.fillStyle='#000';g.fillRect(-b.hl-.5,-b.hw-.6,2*b.hl+1,2*b.hw+1.2);g.restore()}
 void TSx}
function paint(g,Xf,Yf,Z,cx,cy,vw,vh,YS){const v=[cx-vw-4,cy-vh-6,cx+vw+4,cy+vh+8];if(!ovl(v,ZB))return;
 const i0=Math.floor(v[0]/TS),i1=Math.floor(v[2]/TS),j0=Math.floor(v[1]/TS),j1=Math.floor(v[3]/TS);g.save();g.imageSmoothingEnabled=true;
 for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const tb=[i*TS,j*TS,(i+1)*TS,(j+1)*TS];if(!ovl(tb,ZB))continue;const c=tile(i,j);const dx=Xf(tb[0]),dy=Yf(tb[1]);g.drawImage(c,dx,dy,TS*Z,TS*Z*(YS||1))}
 const ax=Xf(0),sx=Xf(1)-ax,ay=Yf(0),sy=Yf(1)-ay;g.transform(sx,0,0,sy,ax,ay);vec(g,v,Zpoly());g.restore()}

/* ================= 8) VÁCH TUYẾT, KHE NÚI, CẦU ================= */
const BR=[];
function addCliffs(){if(!globalThis.VACH35||!VACH35.paintRock)return;const segs=[];
 for(const c of CLIFFS){for(let s=0;s<c.p.length-1;s++){const a=c.p[s],b=c.p[s+1],dx=b[0]-a[0],dy=b[1]-a[1],n=Math.max(1,Math.ceil(Math.max(Math.abs(dx)/6,Math.abs(dy)/Math.min(4,c.H*.7))));
  for(let k=0;k<n;k++){const ax=a[0]+dx*k/n,ay=a[1]+dy*k/n,bx=a[0]+dx*(k+1)/n,by=a[1]+dy*(k+1)/n;let x0=Math.min(ax,bx)-.6,x1=Math.max(ax,bx)+.6;if(x1-x0<2.6){const m=(x0+x1)/2;x0=m-1.3;x1=m+1.3}
   segs.push({id:'nt37c'+segs.length,n:c.n,x0,x1,yb:Math.max(ay,by),H:c.H,k:W.CLF.length+segs.length,nt37:1,grp:c})}}}
 for(const p of segs){const sameL=segs.some(o=>o!==p&&o.grp===p.grp&&o.x1>=p.x0-.9&&o.x0<p.x0),sameR=segs.some(o=>o!==p&&o.grp===p.grp&&o.x0<=p.x1+.9&&o.x1>p.x1);
  const nbL=segs.some(o=>o!==p&&o.x1>=p.x0-.9&&o.x0<p.x0&&Math.abs(o.yb-p.yb)<.6),nbR=segs.some(o=>o!==p&&o.x0<=p.x1+.9&&o.x1>p.x1&&Math.abs(o.yb-p.yb)<.6);
  p.cv=VACH35.paintRock(p.x1-p.x0,p.H,{wx0:p.x0,seed:1777,snow:true,endL:!sameL,endR:!sameR,cutL:sameL&&!nbL,cutR:sameR&&!nbR});delete p.grp;W.CLF.push(p);ST.cliffs++}}
function addRavineCols(){// chặn khe núi, chừa đúng chỗ cầu
 for(let i=0;i<RAVINE.length-1;i++){const a=RAVINE[i],b=RAVINE[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let s=0;s<L;s+=1.2){const x=a[0]+(b[0]-a[0])*s/L,y=a[1]+(b[1]-a[1])*s/L;if(BR.some(br=>Math.abs(y-br.y)<br.hw+.2&&Math.abs(x-br.x)<br.hl))continue;col(x-RAV_W/2,y-.7,x+RAV_W/2,y+.7,'rav')}}}
function addBridges(){const BRG=W.M3&&W.M3.BRG;if(!BRG)return;
 // cầu qua khe núi (theo hướng đường đèo)
 for(const b of BRIDGES){const t=TRAILS.find(q=>q.k==='pass');let best=null;for(let i=0;i<t.p.length-1;i++){const a=t.p[i],c=t.p[i+1];const d=dSeg(b.at[0],b.at[1],a,c);if(!best||d<best.d)best={d,a,c}}
  const L=Math.hypot(best.c[0]-best.a[0],best.c[1]-best.a[1]),o={id:b.id,n:'Cầu khe Bạch Vân',x:b.at[0],y:b.at[1],ux:(best.c[0]-best.a[0])/L,uy:(best.c[1]-best.a[1])/L,hl:RAV_W/2+2.4,hw:1.9,roadW:3.2,nt37:1};BRG.push(o);BR.push(o);ST.bridges++}
 // cầu qua Suối Mây ở đường thung lũng (tìm chỗ giao)
 const vt=TRAILS.find(q=>q.k==='valley'),rv=(W.RV||[]).find(r=>r.n==='Suối Mây');if(vt&&rv){let best=null;for(let i=0;i<vt.p.length-1;i++){const a=vt.p[i],c=vt.p[i+1],L=Math.hypot(c[0]-a[0],c[1]-a[1]);for(let s=0;s<=L;s+=.25){const x=a[0]+(c[0]-a[0])*s/L,y=a[1]+(c[1]-a[1])*s/L;let dmin=1e9,hw=0,k=0;for(let j=0;j<rv.N-1;j++){if(Math.abs(rv.X[j]-x)>20||Math.abs(rv.Y[j]-y)>20)continue;const q=dSeg(x,y,[rv.X[j],rv.Y[j]],[rv.X[j+1],rv.Y[j+1]]);if(q<dmin){dmin=q;hw=rv.HW[j];k=j}}if(!best||dmin<best.d)best={d:dmin,x,y,hw,k}}}
  if(best&&best.d<1.5){const tx=rv.TX[best.k],ty=rv.TY[best.k],o={id:'NT2',n:'Cầu gỗ Thung lũng',x:best.x,y:best.y,ux:-ty,uy:tx,hl:best.hw+2.6,hw:1.9,roadW:3,nt37:1};BRG.push(o);BR.push(o);ST.bridges++}}}

/* ================= 9) HƠI NƯỚC SUỐI NÓNG + HIỆU ỨNG ĐÀO (2D) · 2.5D hơi nước ================= */
function draw2Hook(){const F5=SH.F5;if(!F5||F5.__nt37d)return;F5.__nt37d=1;const o=F5.draw2;F5.draw2=(L,Xf,Yf,cx,cy,vw,vh,t,g,Z)=>{o&&o(L,Xf,Yf,cx,cy,vw,vh,t,g,Z);if(IH())return;
 if(Math.abs(SPRING.x-cx)<vw+6&&Math.abs(SPRING.y-cy)<vh+8)L.push([SPRING.y+SPRING.ry,()=>{const tt=t/1000;g.save();for(let i=0;i<9;i++){const ph=(tt*.25+i/9)%1,x=SPRING.x+Math.sin(i*2.3+tt*.6)*SPRING.rx*.6,y=SPRING.y-ph*3.2,r=(.6+ph*1.6)*Z;g.globalAlpha=(1-ph)*.45;g.fillStyle='#f4f8fb';g.beginPath();g.ellipse(Xf(x),Yf(y)-ph*Z*1.2,r,r*.7,0,0,7);g.fill()}g.restore()}]);
 const now=performance.now();for(let i=FXL.length-1;i>=0;i--){const f=FXL[i],k=(now-f.t0)/600;if(k>1){FXL.splice(i,1);continue}if(Math.abs(f.x-cx)>vw+2||Math.abs(f.y-cy)>vh+3)continue;L.push([f.y+.1,()=>{g.save();for(let j=0;j<(f.big?14:8);j++){const a=j*2.4,d=k*(f.big?2.2:1.4);g.globalAlpha=1-k;g.fillStyle=f.c;g.fillRect(Xf(f.x+Math.cos(a)*d)-2,Yf(f.y-.6+Math.sin(a)*d*.5-k*.4)-2,4,4)}g.restore()}])}}}
const STEAM=[];let steamTex=null;
function steam3(){const V=SH.V25,T15=V&&V.T15;if(!T15||!T15.T)return;const T=T15.T;const near=V.on&&Math.abs(pos.x-SPRING.x)<40&&Math.abs(pos.y-SPRING.y)<35;
 if(!STEAM.length){if(!near)return;steamTex=new T.CanvasTexture(cnv(64,64,(g)=>{const gr=g.createRadialGradient(32,32,2,32,32,30);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64)}));
  for(let i=0;i<7;i++){const m=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:steamTex,transparent:true,depthWrite:false,opacity:.4}));T15.scene.add(m);STEAM.push(m)}}
 const tt=performance.now()/1000;STEAM.forEach((m,i)=>{m.visible=near;if(!near)return;const ph=(tt*.25+i/7)%1;m.position.set(SPRING.x+Math.sin(i*2.3+tt*.6)*SPRING.rx*.5,.4+ph*3.4,SPRING.y+.2);const s=1.4+ph*3.2;m.scale.set(s,s,1);m.material.opacity=(1-ph)*.75})}

/* ================= 10) LƯU (mục 'nt37' trong save – chỉ trạng thái điểm khai thác) ================= */
function regSave(){const SAVE=X.SAVE;if(!SAVE||!SAVE.register)return;
 SAVE.register({id:'nt37',scope:'world',version:1,defaults:()=>({v:1,m:{}}),validate:d=>d&&typeof d.m==='object',
  get:()=>{const m={};for(const n of NODES){const max=NODE_CFG[n.t].uses;if(n.uses<max)m[n.id]=[n.uses,n.uses>0?0:+Math.max(0,n.at-GT()).toFixed(2)]}return{v:1,m}},
  set:d=>{const m=(d&&d.m)||{};for(const n of NODES){const q=m[n.id],max=NODE_CFG[n.t].uses;if(Array.isArray(q)){n.uses=Math.max(0,Math.min(max,q[0]|0));if(n.uses<=0){n.at=GT()+Math.max(0,Math.min(NODE_CFG[n.t].resp,+q[1]||0));hideNode(n)}else{n.at=0;showNode(n)}}else{n.uses=max;n.at=0;showNode(n)}}}})}

/* ================= 11) ÁP DỤNG ================= */
let lastArea=null;
function tick(){if(!ST.applied)return;const g=GT();for(const n of NODES)if(n.uses<=0&&n.at&&g>=n.at){n.uses=NODE_CFG[n.t].uses;n.at=0;showNode(n);try{SH.colsDirty()}catch(_){}}
 if(S.on&&!S.dead&&!IH()){const a=inZ(pos.x,pos.y)?areaAt(pos.x,pos.y):null,k=a?a.k:null;if(k!==lastArea){lastArea=k;if(a)say('🏔 '+a.n)}}
 try{steam3()}catch(_){}
 // tạo sẵn ô nền quanh nhân vật (mỗi lần 1 ô) → không giật khi đi vào ô mới
 if(pos.x>ZB[0]-64&&pos.x<ZB[2]+64&&pos.y>ZB[1]-64&&pos.y<ZB[3]+64){const ci=Math.floor(pos.x/TS),cj=Math.floor(pos.y/TS);outer:for(let r=0;r<=1;r++)for(let di=-r;di<=r;di++)for(let dj=-r;dj<=r;dj++){const i=ci+di,j=cj+dj;if(TILES.has(i+','+j))continue;if(!ovl([i*TS,j*TS,(i+1)*TS,(j+1)*TS],ZB))continue;tile(i,j);break outer}}}
function sprites(){// sprite 2D: thông tuyết, chòi, hang băng, pha lê, biển, trại; đá/quặng render dần (không giật)
 const pine=AS.pine||AS.pine2;let ok=true;
 if(!AS.nt_pine1)ok=snowPine('nt_pine1',AS.pine2||pine,.6,11)&&ok;if(!AS.nt_pine2)ok=snowPine('nt_pine2',pine,.8,12)&&ok;if(!AS.nt_pine3)ok=snowPine('nt_pine3',pine,1,13)&&ok;
 if(!AS.nt_icecave)ok=iceCave('nt_icecave')&&ok;if(!AS.nt_cabin)cabinSprite('nt_cabin',true);if(!AS.nt_shed)cabinSprite('nt_shed',false);
 if(!AS.nt_icecry1)crystalSprite('nt_icecry1',5);if(!AS.nt_icecry2)crystalSprite('nt_icecry2',6);
 ['Đỉnh Bạch Vân ⛰','Thung lũng Băng ↙','Hang Băng →','⛏ Bãi khai thác'].forEach((t,i)=>{if(!AS['nt_sign'+i])signSprite('nt_sign'+i,t)});
 if(!AS.nt_frame)frameSprite('nt_frame');if(!AS.nt_mcart)cartSprite('nt_mcart');
 if(!AS.nt_log)ok=snowify('nt_log','n_log')&&ok;if(!AS.nt_stump)ok=snowify('nt_stump','n_stump')&&ok;return ok}
const RQ=[];['ntst','ntcu','ntfe','ntsr'].forEach(t=>{for(let v=0;v<12;v++)RQ.push([t,v])});
function spriteStep(){let n=0;while(RQ.length&&n<4){const[t,v]=RQ[0];if(rockSprite(t,v)||ST.errS)RQ.shift();else break;n++}if(!RQ.length&&RND){try{RND.r.dispose();RND.r.forceContextLoss&&RND.r.forceContextLoss()}catch(_){}RND=null}}
function apply(){if(ST.applied)return;try{const z=ZONE();if(!z)throw Error('không tìm thấy khu '+ZN);
  try{SH.WORLD&&SH.WORLD.ensureIds()}catch(_){}ST.sig=SH.WORLD&&SH.WORLD.sig;
  z.open=true;
  // gỡ cổng "đang phát triển" của khu (vạch chắn/biển/va chạm còn sót) – giống cách khu Zeta đã mở
  {const GA=W.M3&&W.M3.GATES;if(GA)for(let i=GA.length-1;i>=0;i--)if(GA[i].z===ZN){for(const c of GA[i].cols||[])c.on=false;for(const d of GA[i].dec||[]){const j=SH.DEC.indexOf(d);if(j>=0)SH.DEC.splice(j,1)}GA.splice(i,1);ST.gate=1}}
  SH.ART6&&(SH.ART6.snowAt=(x,y)=>x>ZB[0]&&x<ZB[2]&&y>ZB[1]&&y<ZB[3]&&inZ(x,y));
  clearTables();try{W.reloadAll();W.CK&&W.CK.clear&&W.CK.clear();globalThis.M26?.resetBuckets?.()}catch(e){console.warn('[NT37] nạp lại chunk',e)}
  addBridges();addCliffs();addRavineCols();placeFeatures();placeNature();buildField();hookActs();draw2Hook();regSave();
  {const g0=W.ground;W.ground=(g,Xf,Yf,Z,cx,cy,vw,vh,YS,t,gnd)=>{g0&&g0(g,Xf,Yf,Z,cx,cy,vw,vh,YS,t,gnd);try{paint(g,Xf,Yf,Z,cx,cy,vw,vh,YS||1)}catch(e){if(!ST.errP){ST.errP=String(e&&e.stack||e);console.warn('[NT37] vẽ nền',e)}}}}
  try{SH.colsDirty();W.invalidateCols&&W.invalidateCols();SH.V25&&SH.V25.treesDirty&&SH.V25.treesDirty();const WB=SH.WB;SH.V25&&SH.V25.gtRedraw&&SH.V25.gtRedraw(ZB[0],ZB[1],ZB[2],ZB[3])}catch(_){}
  ST.sigAfter=SH.WORLD&&SH.WORLD.sig;ST.applied=true;console.info('[NT37] Núi Tuyết (Đỉnh Bạch Vân): đã mở & dựng',JSON.stringify(ST.nodes),'cây',ST.trees,'đá',ST.rocks,'vách',ST.cliffs,'cầu',ST.bridges)}
 catch(e){ST.error=String(e&&e.stack||e);console.error('[NT37]',e)}}
sprites();
const boot=()=>{if(ST.applied)return;if(!globalThis.URBAN_READY||!globalThis.Z21_READY)return;apply()};
const bt=setInterval(()=>{const ok=sprites();boot();if(ST.applied&&ok)clearInterval(bt)},300);addEventListener('load',()=>{sprites();boot()});
setInterval(()=>{try{spriteStep()}catch(_){}},60);
setInterval(()=>{try{tick()}catch(e){if(!ST.errT){ST.errT=String(e);console.warn('[NT37]',e)}}},500);
/* ảnh tổng quan (nhìn thẳng từ trên xuống) – dùng cho báo cáo/kiểm tra */
function overview(S,opt){opt=opt||{};const Bx=[100,-650,795,-352],w=Math.round((Bx[2]-Bx[0])*S),h=Math.round((Bx[3]-Bx[1])*S),P=Zpoly(),c=cnv(w,h,()=>{}),g=c.getContext('2d');
 g.fillStyle='#55704a';g.fillRect(0,0,w,h);g.save();g.scale(S,S);g.translate(-Bx[0],-Bx[1]);g.beginPath();P.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle='#c5cdd9';g.fill();g.restore();
 for(let i=Math.floor(Bx[0]/TS);i<=Math.floor(Bx[2]/TS);i++)for(let j=Math.floor(Bx[1]/TS);j<=Math.floor(Bx[3]/TS);j++)g.drawImage(tile(i,j),(i*TS-Bx[0])*S,(j*TS-Bx[1])*S,TS*S,TS*S);
 g.save();g.scale(S,S);g.translate(-Bx[0],-Bx[1]);
 for(const r of W.RV||[]){g.beginPath();for(let i=0;i<r.N;i++)i?g.lineTo(r.X[i],r.Y[i]):g.moveTo(r.X[i],r.Y[i]);g.strokeStyle='#4f9fd8';g.lineWidth=3.4;g.stroke()}
 vec(g,Bx,P);
 for(const b of BR){g.save();g.translate(b.x,b.y);g.rotate(Math.atan2(b.uy,b.ux));g.fillStyle='#8d6440';g.fillRect(-b.hl,-b.hw,2*b.hl,2*b.hw);g.restore()}
 for(const cl of W.CLF)if(cl.nt37){g.fillStyle='#596273';g.fillRect(cl.x0,cl.yb-cl.H*.55,cl.x1-cl.x0,cl.H*.55);g.fillStyle='#eef3f9';g.fillRect(cl.x0,cl.yb-cl.H*.55,cl.x1-cl.x0,.7)}
 const dot=(x,y,r,f,s)=>{g.beginPath();g.arc(x,y,r,0,7);g.fillStyle=f;g.fill();if(s){g.strokeStyle=s;g.lineWidth=.25;g.stroke()}};
 for(const d of DEC){const k=d[0];if(/^nt_pine/.test(k))dot(d[1],d[2],d[3]*.42,'#2f5a46','#e9f0f6');else if(/^nt_sr/.test(k))dot(d[1],d[2],d[3]*.38,'#8c919a','#e9eef5');else if(k==='nt_cabin'||k==='nt_shed'){g.fillStyle='#6b4a2e';g.fillRect(d[1]-d[3]*.45,d[2]-2.2,d[3]*.9,2.4);g.fillStyle='#f2f6fb';g.fillRect(d[1]-d[3]*.45,d[2]-2.2,d[3]*.9,.8)}
  else if(k==='nt_icecave'){g.fillStyle='#7f8b98';g.beginPath();g.ellipse(d[1],d[2]-3,6,3.6,0,Math.PI,0);g.fill();g.fillStyle='#3f9be0';g.beginPath();g.ellipse(d[1],d[2]-.6,1.8,1.4,0,Math.PI,0);g.fill()}else if(/^nt_icecry/.test(k))dot(d[1],d[2],.7,'#8fe0ff')}
 for(const n of NODES){if(n.uses<=0)continue;dot(n.x,n.y,n.w*.4,n.t==='cu'?'#d9822b':n.t==='fe'?'#8e3f22':'#9da2aa',n.t==='st'?'#e8edf3':'#20160f')}
 if(opt.labels!==false){g.font='bold 7px system-ui,sans-serif';g.textAlign='center';for(const[a,x,y]of[['Chân núi',300,-415],['Thung lũng Băng',205,-540],['Sườn núi',560,-535],['Hang Băng',712,-522],['Đỉnh núi · Bãi khai thác',520,-646+5.5]]){g.lineWidth=2;g.strokeStyle='rgba(20,28,40,.75)';g.strokeText(a,x,y);g.fillStyle='#fff';g.fillText(a,x,y)}}
 g.restore();return c}
globalThis.NUITUYET37={stats:ST,NODES,AREAS,TRAILS,FIELD,tile,areaAt,DEC,BR,overview};
})();
