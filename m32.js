/* ===================== LẦN 32: QUÀ KHỞI ĐẦU, NƯỚC TRONG NHÀ THÀNH PHỐ, BỐ CỤC NÚT =====================
   - Nhân vật mới nhận: 1 dụng cụ khai thác ngẫu nhiên (rìu hoặc cuốc chim) + (1 chai nước) hoặc (3 bánh mì + 1 chai nước).
   - Nhà thường trong Thành Phố Thiên Đường: 10% số nhà có 1 nước đóng chai, 15% số nhà có 1–2 chai nước bị ô nhiễm (chưa đun).
     Lục đồ trong nhà đó sẽ tìm thấy (mỗi nhà 1 lần, có lại sau 3 ngày game).
   - Dời cụm nút (túi đồ, nhân vật, menu, bản đồ, trò chuyện, cửa hàng, xây) sang bên trái màn hình. */
(()=>{'use strict';
const SH=globalThis.SH;if(!SH||!SH.X){console.warn('[M32] thiếu SH');return}
const X=SH.X,S=SH.S,SAVE=X.SAVE;const say=m=>{try{SH.say(m)}catch(_){}};const GT=()=>+SH.GT||0;
/* ---------- quà khởi đầu (chỉ nhân vật mới) ---------- */
function kit(){const tool=Math.random()<.5?'t_axe':'t_pick';if(!Array.isArray(S.bg))S.bg=[];S.bg.push(tool);const both=Math.random()<.5;
 S.wat=(S.wat|0)+1;if(both)S.bread=(S.bread|0)+3;try{globalThis.EQ30&&EQ30.durSync()}catch(_){}
 setTimeout(()=>say('🎁 Quà khởi đầu: '+(tool==='t_axe'?'🪓 Rìu':'⛏ Cuốc chim')+(both?' · 3 bánh mì':'')+' · 1 chai nước'),2600);return{tool,both}}
setInterval(()=>{try{if(!S.on||S.kit32)return;S.kit32=1;if(!globalThis.SAVE_LOADED)M32.last=(globalThis.M33?M33.giveKit():kit())}catch(e){console.warn('[M32] kit',e)}},300);
/* ---------- nước trong nhà thành phố ---------- */
const TAKEN={};let HMAP=null;
const hsh=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return((h>>>0)%100000)/100000};
function houseOf(u){if(!u)return null;if(!HMAP){HMAP=new Map();for(const h of(SH.HOUSES||[]))if(h&&h.f!=null&&!HMAP.has(h.f))HMAP.set(h.f,h)}return HMAP.get(u.f)||null}
function inCity(b){if(!b)return false;if(b.c17)return true;try{const z=globalThis.W15&&W15.zoneAt2((b.x0+b.x1)/2,(b.y0+b.y1)/2);return!!z&&z.n==='Thành Phố Thiên Đường'}catch(_){return false}}
const keyOf=h=>h.b&&(h.b.id||(Math.round(h.b.x0*10)+'_'+Math.round(h.b.y0*10)));
function kindOf(h){const k=keyOf(h);if(!k)return null;const r=hsh('w32:'+k);return r<.10?'wat':r<.25?'botD':null}
function water(u){const h=houseOf(u);if(!h||!inCity(h.b))return null;const kd=kindOf(h);if(!kd)return null;const k=keyOf(h);if(TAKEN[k]!=null&&GT()-TAKEN[k]<72)return null;
 const n=kd==='wat'?1:1+((Math.random()*2)|0);const a=X.give(kd,n);if(!a)return'🎒 Túi đầy – trong nhà này còn '+(kd==='wat'?'nước đóng chai':'chai nước bị ô nhiễm');TAKEN[k]=GT();
 return kd==='wat'?'🧴 Nhà này còn 1 nước đóng chai – đã lấy':'🫙 Tìm thấy '+a+' chai nước bị ô nhiễm (chưa đun – đun hoặc lọc trước khi uống)'}
SAVE.register({id:'m32',scope:'world',version:1,defaults:()=>({t:{}}),validate:d=>d&&typeof d.t==='object',get:()=>({t:Object.assign({},TAKEN)}),set:d=>{for(const k in TAKEN)delete TAKEN[k];for(const k in d.t)if(isFinite(d.t[k]))TAKEN[k]=+d.t[k]}});
/* ---------- bố cục nút: dời cụm nút sang trái ---------- */
const css=document.createElement('style');css.id='lay32';css.textContent=`
#ibtn,#sbtn,#pbtn,#mbtn,#m19bc,#m19bm{right:auto!important;left:calc(14px + env(safe-area-inset-left,0px))!important;width:44px!important;height:44px!important}
#ibtn,#sbtn{top:calc(50% - 110px)!important}#pbtn,#mbtn{top:calc(50% - 58px)!important}#m19bc,#m19bm{top:calc(50% - 6px)!important}
#sbtn,#mbtn,#m19bm{left:calc(66px + env(safe-area-inset-left,0px))!important}
#xdbtn{right:auto!important;left:calc(14px + env(safe-area-inset-left,0px))!important;top:calc(50% + 46px)!important;transform:none!important}
@media (max-height:520px){#ibtn,#sbtn,#pbtn,#mbtn,#m19bc,#m19bm{top:calc(50% - 70px)!important;width:38px!important;height:38px!important;font-size:17px!important}
 #ibtn{left:calc(10px + env(safe-area-inset-left,0px))!important}#sbtn{left:calc(52px + env(safe-area-inset-left,0px))!important}#pbtn{left:calc(94px + env(safe-area-inset-left,0px))!important}
 #mbtn{left:calc(136px + env(safe-area-inset-left,0px))!important}#m19bc{left:calc(178px + env(safe-area-inset-left,0px))!important}#m19bm{left:calc(220px + env(safe-area-inset-left,0px))!important}
 #xdbtn{top:calc(50% - 26px)!important;left:calc(10px + env(safe-area-inset-left,0px))!important}}
`;document.head.appendChild(css);
const M32={kit,water,kindOf,houseOf,TAKEN,last:null};globalThis.M32=M32;
})();
