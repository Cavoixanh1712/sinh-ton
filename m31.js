/* ===================== LẦN 31: GIAO DIỆN HOLOGRAM + RƯƠNG ĐỒNG RA NGUYÊN LIỆU NẤU ĂN & HẠT GIỐNG =====================
   - Mọi bảng mở ra (túi đồ, chế tạo, nhân vật, nấu ăn, máy lọc, rương, cửa, thùng nước…) đổi sang kiểu hologram trong suốt,
     phát sáng xanh, có vạch quét – như được chiếu ra từ mắt. Chỉ đổi giao diện, không đổi chức năng.
   - Hạt giống: rau xanh, lúa, củ giống gừng (chưa trồng được – ô đất trồng trọt chưa lập trình).
   - Rương đồng: thêm nguyên liệu nấu ăn (thịt, gừng, rau, nấm, gạo) và hạt giống vào bảng rơi đồ. */
(()=>{'use strict';
const SH=globalThis.SH;if(!SH||!SH.X||!SH.F5){console.warn('[M31] thiếu SH');return}
const X=SH.X,S=SH.S,F5=SH.F5,STK=X.STK,F4=X.F4||SH.F4;
/* ---------- giao diện hologram ---------- */
const C='130,235,255';
const PANEL=['.m19w','.sp','.ckpan','.ckmenu','#xdpan','#xdbar','#chfx > div','div[style*="background:#1c1830"]','div[style*="#2a1d48"]','div[style*="rgba(14,30,58"]','div[style*="#24143a"]','div[style*="rgba(24, 20, 14"]','div[style*="rgba(24,20,14"]','div[style*="rgba(20, 40, 70"]','div[style*="rgba(20,40,70"]'].join(',');
const OVER=['#stat','#shop','#inv','#craft','#pmenu','#chfx','div[style*="inset: 0"][style*="rgba(6, 4, 16"]','div[style*="inset:0"][style*="rgba(6,4,16"]','div[style*="inset: 0"][style*="rgba(6, 4, 2"]','div[style*="inset: 0"][style*="rgba(5, 2, 10"]','div[style*="inset:0"][style*="rgba(5,2,10"]','div[style*="inset: 0"][style*="rgba(0, 0, 0, 0.45"]'].join(',');
const css=document.createElement('style');css.id='holo31';css.textContent=`
${OVER}{background:radial-gradient(ellipse at 50% 42%,rgba(20,70,110,.10),rgba(0,10,24,.34))!important}
${PANEL}{background:repeating-linear-gradient(0deg,rgba(${C},.055) 0 1px,transparent 1px 3px),linear-gradient(160deg,rgba(60,170,230,.20),rgba(10,40,80,.26) 55%,rgba(60,190,255,.12))!important;
 -webkit-backdrop-filter:blur(7px) saturate(150%);backdrop-filter:blur(7px) saturate(150%);border:1px solid rgba(${C},.7)!important;border-radius:14px!important;
 box-shadow:0 0 22px rgba(60,200,255,.38),0 0 2px rgba(${C},.9),inset 0 0 36px rgba(80,200,255,.14)!important;color:#e9fcff!important;text-shadow:0 0 6px rgba(${C},.35);
 animation:holo31in .42s cubic-bezier(.2,.9,.3,1.15) both,holo31fl 6s ease-in-out .5s infinite;transform-origin:50% 0%}
@keyframes holo31in{0%{opacity:0;rotate:x 28deg;scale:.35 .05;filter:brightness(2.4) blur(2px)}55%{opacity:.95;rotate:x 0deg;scale:1.03 1;filter:brightness(1.4)}100%{opacity:1;rotate:none;scale:none;filter:none}}
@keyframes holo31fl{0%,100%{box-shadow:0 0 22px rgba(60,200,255,.38),0 0 2px rgba(${C},.9),inset 0 0 36px rgba(80,200,255,.14)}50%{box-shadow:0 0 30px rgba(60,200,255,.5),0 0 3px rgba(${C},1),inset 0 0 44px rgba(80,200,255,.2)}}
/* L32: bảng trò chuyện, chợ (m19) */.m19w h3{background:linear-gradient(rgba(${C},.28),rgba(30,140,210,.18))!important;color:#f2feff!important;text-shadow:0 0 10px rgba(${C},.8)!important}.m19w .row,.m19w .tb button,.m19w .m19pv,.m19w input,.m19w textarea,.m19w select{background:rgba(${C},.08)!important;border-color:rgba(${C},.4)!important;color:#e9fcff!important}.m19w .tb button.on,.m19w button.go{background:linear-gradient(rgba(150,245,255,.45),rgba(40,170,230,.38))!important;color:#fff!important}.m19w .x{background:rgba(${C},.2)!important;border-color:rgba(${C},.8)!important}.m19w .row .nm{color:#bff7ff!important}
.sp h2,.ckhd{color:#f2feff!important;text-shadow:0 0 10px rgba(${C},.8)!important;letter-spacing:.04em}
.sp h3,.ckt{color:#8fe9ff!important;border-color:rgba(${C},.35)!important}
.sp h2 em,.sp h3 em{color:#ffe9a0!important}
.ic,.sl,.bi,.cr,.ckslot,.ckbox,.cklist button,.ckneed div,.sr{background:rgba(${C},.07)!important;border-color:rgba(${C},.38)!important;box-shadow:inset 0 0 10px rgba(${C},.08)}
.ic.on,.cklist button.on{border-color:#9ff4ff!important;box-shadow:0 0 10px rgba(${C},.75),inset 0 0 12px rgba(${C},.25)!important}
.ic.e{background:rgba(${C},.03)!important}
.sp button,.ckpan button,.ckmenu button,#xdpan button,#chfx button,div[style*="background:#1c1830"] button{background:linear-gradient(rgba(${C},.22),rgba(30,140,210,.18))!important;border:1px solid rgba(${C},.75)!important;color:#f2feff!important;text-shadow:0 0 6px rgba(${C},.6);box-shadow:0 0 8px rgba(${C},.25)}
.sp button:disabled,.ckpan button:disabled,.ckmenu button:disabled{opacity:.35!important;box-shadow:none}
.ckgo,.cr button:not(:disabled),.ckmenu button.hi{background:linear-gradient(rgba(150,245,255,.45),rgba(40,170,230,.38))!important;color:#fff!important;font-weight:800}
.cktabs button.on{background:rgba(${C},.25)!important;border-color:#bff7ff!important;color:#fff!important;box-shadow:0 0 12px rgba(${C},.6)}
.ckbar{background:rgba(0,30,50,.5)!important;border-color:rgba(${C},.5)!important}.ckbar i{background:linear-gradient(90deg,#3ad0ff,#bff7ff)!important;box-shadow:0 0 8px rgba(${C},.8)}
.sp input{background:rgba(${C},.1)!important;border-color:rgba(${C},.6)!important}
.sp::-webkit-scrollbar,.ckpan::-webkit-scrollbar{width:6px}.sp::-webkit-scrollbar-thumb,.ckpan::-webkit-scrollbar-thumb{background:rgba(${C},.45);border-radius:3px}
`;document.head.appendChild(css);
/* hiệu ứng tự chạy lại mỗi lần bảng được mở (CSS animation khởi động lại khi phần tử hiện ra) */

/* ---------- hạt giống ---------- */
const SEED={sd_veg:['Hạt giống rau xanh','#4caf3a'],sd_rice:['Hạt giống lúa','#e8cf7a'],sd_ginger:['Củ giống gừng','#d9a95a']};
const ICON={};
for(const k in SEED){STK[k]=20;if(typeof S[k]!='number')S[k]=0;if(F4&&F4.names)F4.names[k]=SEED[k][0];if(Array.isArray(globalThis.F5KEYS)&&!F5KEYS.includes(k))F5KEYS.push(k);
 const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#e9dcc0';g.strokeStyle='#6a5434';g.lineWidth=3;g.beginPath();g.moveTo(14,10);g.lineTo(50,10);g.lineTo(52,56);g.lineTo(12,56);g.closePath();g.fill();g.stroke();
 g.fillStyle='#c9b48a';g.fillRect(14,10,36,8);g.fillStyle=SEED[k][1];g.beginPath();if(k==='sd_veg'){g.ellipse(26,36,8,12,-.5,0,7);g.ellipse(38,36,8,12,.5,0,7)}else if(k==='sd_rice'){for(let i=0;i<5;i++)g.ellipse(24+i*4,30+(i%2)*6,3,6,.3,0,7)}else{g.ellipse(32,38,13,8,0,0,7)}g.fill();g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1.5;g.stroke();
 g.fillStyle='#5a4a2a';for(let i=0;i<4;i++){g.beginPath();g.arc(22+i*7,50,1.6,0,7);g.fill()}ICON[k]=c.toDataURL()}
const imgH=(k,px)=>'<img src="'+ICON[k]+'" alt="" draggable="false" style="width:'+px+'px;height:'+px+'px;object-fit:contain;vertical-align:middle">';
{const ic0=F5.ic;F5.ic=x=>(x&&x.k&&ICON[x.k])?imgH(x.k,34):ic0(x)}
{const ic0=F5.icon;F5.icon=(k,px)=>ICON[k]?imgH(k,px||34):ic0(k,px)}
{const i0=F5.info;F5.info=k=>SEED[k]?SEED[k][0]+': dùng để gieo trồng (tính năng trồng trọt sẽ mở ở bản sau). Có trong rương đồng.':i0(k)}
if(F4&&F4.icon){const fi=F4.icon;F4.icon=(k,...a)=>ICON[k]?imgH(k,a[0]||30):fi(k,...a)}
/* ---------- rương đồng: thêm nguyên liệu nấu ăn + hạt giống ---------- */
const ADD=[['ck_meat',1,2,8],['ck_veg',1,3,8],['ck_ginger',1,2,6],['ck_mush',1,2,6],['ck_rice',1,3,6],['sd_veg',1,3,5],['sd_rice',1,3,4],['sd_ginger',1,2,3]];
if(F4&&F4.TBL&&Array.isArray(F4.TBL.B)){for(const a of ADD)if(!F4.TBL.B.some(x=>x[0]===a[0])&&STK[a[0]])F4.TBL.B.push(a)}
globalThis.M31={SEED,ADD,ICON};
})();
