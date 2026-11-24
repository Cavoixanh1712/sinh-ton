/* VACH30 (21/11): vách đá Rừng Suối Mây – vẽ lại cho đẹp (đá rêu, dây leo, dương xỉ) + LEO ĐƯỢC.
   - Không đổi vị trí/kích thước vách (địa hình giữ nguyên); chỉ thay hình (c.cv – cùng dùng cho 2D & 2.5D).
   - Leo: bỏ vật cản của mặt vách; khi đứng trên mặt vách → đi chậm (đang leo), không chạy được.
   - Tường thành phố (c.wall) không đụng. */
(()=>{'use strict';const S=globalThis.SH,W=globalThis.W15;if(!S||!W||!W.CLF)return;
const PXM=16,stats={revision:30,faces:0,climbOn:true,climbing:false,err:null};
const ZF=W.ZV2&&W.ZV2.find(z=>z.n==='Rừng Suối Mây');
const h32=n=>{n=Math.imul(n^0x9e3779b9,0x85ebca6b);n^=n>>>13;n=Math.imul(n,0xc2b2ae35);n^=n>>>16;return(n>>>0)/4294967296};
const hx=(a,b)=>h32(Math.imul(a|0,73856093)^Math.imul(b|0,19349663));
const ROCK=[[122,112,96],[104,98,88],[134,124,104],[96,90,80],[116,106,92],[110,108,100],[128,120,110]];
const col=(c,d)=>'rgb('+Math.max(0,Math.min(255,c[0]+d))+','+Math.max(0,Math.min(255,c[1]+d))+','+Math.max(0,Math.min(255,c[2]+d))+')';
function neighbours(c){let L=false,R=false;for(const o of W.CLF){if(o===c||o.wall)continue;if(Math.abs(o.yb-c.yb)>.6)continue;if(Math.abs(o.x1-c.x0)<.9&&o.x0<c.x0)L=true;if(Math.abs(o.x0-c.x1)<.9&&o.x1>c.x1)R=true}return[L,R]}
function paint(c){const Wm=c.x1-c.x0,Wp=Math.max(8,Math.round(Wm*PXM)),Hp=Math.max(16,Math.round(c.H*PXM)),cap=6,CH=Hp+cap;
 const cv=document.createElement('canvas');cv.width=Wp;cv.height=CH;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;
 const[nl,nr]=neighbours(c),wx=px=>c.x0+px/PXM;// world x of pixel
 // 1) hình khối: mép trên lượn sóng theo tọa độ thế giới (nối liền với đoạn kế bên), hai đầu bo tròn nếu là đầu mút
 const top=new Float32Array(Wp);for(let x=0;x<Wp;x++){const w=wx(x)*2.2;const a=Math.floor(w),f=w-a,n=hx(a,7)*(1-f)+hx(a+1,7)*f;top[x]=cap+1+n*5}
 const rr=Math.min(Wp*.34,22);
 const inside=(x,y)=>{if(y<top[x]||y>=CH)return false;if(!nl&&x<rr){const dx=rr-x,dy=Math.max(0,(top[x]+rr*1.1)-y);if(dx*dx+dy*dy>rr*rr)return false;if(y>CH-3&&x<rr*.25)return false}
  if(!nr&&x>Wp-1-rr){const dx=x-(Wp-1-rr),dy=Math.max(0,(top[x]+rr*1.1)-y);if(dx*dx+dy*dy>rr*rr)return false}return true};
 const mask=document.createElement('canvas');mask.width=Wp;mask.height=CH;{const m=mask.getContext('2d'),id=m.createImageData(Wp,CH);for(let y=0;y<CH;y++)for(let x=0;x<Wp;x++)if(inside(x,y))id.data[(y*Wp+x)*4+3]=255;m.putImageData(id,0,0)}
 // 2) nền đá + tảng đá (lưới gắn với thế giới → liền mạch)
 const gr=g.createLinearGradient(0,cap,0,CH);gr.addColorStop(0,'#827c70');gr.addColorStop(1,'#4f4b45');g.fillStyle=gr;g.fillRect(0,0,Wp,CH);
 const cell=14;for(let gy=-1;gy<=Math.ceil(CH/cell)+1;gy++){const i0=Math.floor((c.x0*PXM)/cell)-2,i1=Math.ceil((c.x1*PXM)/cell)+2;for(let i=i0;i<=i1;i++){const r1=hx(i,gy*31+3),r2=hx(i,gy*31+11),r3=hx(i,gy*31+19);
   const x=i*cell-c.x0*PXM+(r1-.5)*cell*.8+(gy&1)*cell*.5,y=cap+gy*cell*.85+(r2-.5)*cell*.6,rad=cell*(.5+r3*.5),C=ROCK[(hx(i,gy*7)*ROCK.length)|0],sh=Math.round((y/CH)*-18);
   g.fillStyle='rgb(46,42,38)';g.beginPath();g.ellipse(x+1,y+1,rad+1.2,rad*.82+1.2,0,0,7);g.fill();
   g.fillStyle=col(C,sh);g.beginPath();g.ellipse(x,y,rad,rad*.82,0,0,7);g.fill();
   g.fillStyle=col(C,sh+20);g.beginPath();g.ellipse(x-rad*.28,y-rad*.3,rad*.55,rad*.38,0,0,7);g.fill();
   g.fillStyle=col(C,sh-22);g.beginPath();g.ellipse(x+rad*.25,y+rad*.42,rad*.6,rad*.28,0,0,7);g.fill()}}
 for(let k=0;k<Math.round(Wm*2);k++){let x=hx(k,Math.round(c.x0*19))*Wp,y=cap+4+hx(k,23)*Hp*.8;g.strokeStyle='rgba(30,26,22,.55)';g.lineWidth=1;g.beginPath();g.moveTo(x,y);for(let s2=0;s2<4;s2++){x+=(hx(k,s2+50)-.5)*6;y+=2+hx(k,s2+60)*4;g.lineTo(x,y)}g.stroke()}
 // 3) rêu: viền trên + mảng rêu chảy xuống
 for(let x=0;x<Wp;x++){const t=top[x],n=hx(Math.floor(wx(x)*6),3),drip=5+n*5+(hx(Math.floor(wx(x)*2.5),5)>.7?7+n*10:0);
   g.fillStyle='#3e6526';g.fillRect(x,t-2,1,drip+4);g.fillStyle='#5f8f34';g.fillRect(x,t-2,1,Math.max(3,drip*.7));g.fillStyle='#7fb046';g.fillRect(x,t-2,1,Math.max(2,drip*.35));if(hx(Math.floor(wx(x)*8),9)>.55){g.fillStyle='#a6d064';g.fillRect(x,t-2,1,2)}}
 for(let k=0;k<Math.round(Wm*1.4);k++){const r=hx(Math.round(c.x0*10)+k,41),x=r*Wp,y=cap+6+hx(k,Math.round(c.yb*10))*Hp*.55,rad=2+hx(k,77)*4;
   g.fillStyle='#55803a';g.beginPath();g.ellipse(x,y,rad*1.5,rad*.7,0,0,7);g.fill();g.fillStyle='#7aa84a';g.fillRect(Math.round(x-rad*.6),Math.round(y-rad*.4),Math.max(1,Math.round(rad)),1)}
 // 4) dây leo rủ xuống
 const nv=Math.max(1,Math.round(Wm/1.6));for(let k=0;k<nv;k++){const x0=Math.round((k+.2+hx(k,Math.round(c.x0*13))*.6)*Wp/nv),L=Hp*(.25+hx(k,Math.round(c.yb*7))*.6);
   for(let y=0;y<L;y++){const x=x0+Math.round(Math.sin((y+k*5)/6)*1.3),yy=Math.round(top[Math.min(Wp-1,Math.max(0,x0))])+y;g.fillStyle='#3f6a2a';g.fillRect(x,yy,1,1);
    if(y%4===0){g.fillStyle=(y/4)&1?'#6fa443':'#88bb52';g.fillRect(x+((y/4)&1?1:-2),yy,2,2)}}}
 // 5) chân vách tối + cỏ, dương xỉ
 const sg=g.createLinearGradient(0,CH-10,0,CH);sg.addColorStop(0,'rgba(0,0,0,0)');sg.addColorStop(1,'rgba(20,16,12,.45)');g.fillStyle=sg;g.fillRect(0,CH-10,Wp,10);
 g.globalCompositeOperation='destination-in';g.drawImage(mask,0,0);g.globalCompositeOperation='source-over';
 for(let x=1;x<Wp-1;x+=2){if(!inside(x,Math.ceil(top[x])+1))continue;if(hx(Math.round(wx(x)*9),31)<.45)continue;const h=2+hx(Math.round(wx(x)*9),37)*4;g.fillStyle=hx(x,3)>.5?'#6fa443':'#8cc252';g.fillRect(x,Math.round(top[x]-h),1,Math.round(h))}
 for(let k=0;k<Math.round(Wm*3);k++){const x=hx(k,Math.round(c.x0*17))*Wp,h=4+hx(k,5)*8,lean=(hx(k,9)-.5)*5;g.strokeStyle=k%3?'#4d8a33':'#6aa842';g.lineWidth=1;
   for(let b=0;b<3;b++){g.beginPath();g.moveTo(x+b,CH);g.lineTo(x+b+lean+(b-1)*2,CH-h*(.7+b*.15));g.stroke()}}
 return cv}
const faces=[];
try{for(const c of W.CLF){if(c.wall)continue;if(ZF&&W.zoneAt2((c.x0+c.x1)/2,c.yb-c.H/2)!==ZF&&W.zoneAt2((c.x0+c.x1)/2,c.yb+.5)!==ZF)continue;c.cv=paint(c);c.r30=1;faces.push(c);if(c.col){c.col.on=false;c.col.r30=1}}stats.faces=faces.length;S.colsDirty()}catch(e){stats.err=String(e&&e.message||e);console.error('[VACH30]',e)}
// leo vách: đứng trong mặt vách → chậm, không chạy
const onFace=()=>{const x=S.pos.x,y=S.pos.y;for(const c of faces)if(x>c.x0+.2&&x<c.x1-.2&&y>c.yb-c.H&&y<c.yb-.2)return true;return false};
let climb=false,chip=null;
const sp0=W.spK,nr0=W.noRun;W.spK=()=>{const k=sp0.call(W);return climb?k*.45:k};W.noRun=()=>climb||nr0.call(W);
setInterval(()=>{const c=stats.climbOn&&faces.length&&onFace();if(c!==climb){climb=c;stats.climbing=c;if(c)S.say?.('🧗 Đang leo vách đá…')}},150);
globalThis.VACH30={stats,faces:()=>faces.length,onFace};})();
