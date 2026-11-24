/* LẦN 33: rương khởi đầu · chợ trao đổi mọi vật tư · thanh công cụ thu gọn */
(()=>{const SH=globalThis.SH,X=SH.X,S=SH.S,F4=X.F4,F5=globalThis.F5,STK=X.STK;
const say=m=>{try{SH.say(m)}catch(_){}};
/* ---------- Rương khởi đầu (chK) ---------- */
STK.chK=1;if(typeof S.chK!='number')S.chK=0;if(F4&&F4.names)F4.names.chK='Rương khởi đầu';
if(Array.isArray(globalThis.F5KEYS)&&!F5KEYS.includes('chK'))F5KEYS.push('chK');
const kIcon=px=>{let h='';try{h=F4.icon('chB')||''}catch(_){}return'<span style="position:relative;display:inline-block">'+(h||'<span style="font-size:'+Math.round((px||34)*.7)+'px">🧰</span>')+'<span style="position:absolute;right:-4px;bottom:-4px;font-size:13px">🎁</span></span>'};
{const ic0=F5.ic;F5.ic=x=>x&&(x.k==='chK'||x.id==='chK')?kIcon(34):ic0(x)}
{const ic0=F5.icon;F5.icon=(k,px)=>k==='chK'?kIcon(px):ic0(k,px)}
{const i0=F5.info;F5.info=k=>k==='chK'?'Rương khởi đầu: mở ra nhận 1 dụng cụ khai thác ngẫu nhiên (rìu hoặc cuốc chim) + 1 chai nước, hoặc 3 bánh mì + 1 chai nước. Không tính vào giới hạn mở rương mỗi ngày.':i0(k)}
{const b0=F5.btn0;F5.btn0=x=>x&&x.k==='chK'?'<button onclick="invUse()">Mở</button>':b0(x)}
{const u0=F5.invUse;F5.invUse=x=>{if(x&&x.k==='chK'){openKit();return true}return u0(x)}}
function giveKit(){S.chK=(S.chK|0)+1;setTimeout(()=>say('🎁 Bạn nhận được 1 Rương khởi đầu — mở trong túi đồ 🎒'),2600);return{chest:1}}
function freeSlots(){try{return S.cap-X.used()}catch(_){return 9}}
function openKit(force){if((S.chK|0)<1)return null;const tool=force?force.tool:(Math.random()<.5?(Math.random()<.5?'t_axe':'t_pick'):null);
 if(!Array.isArray(S.bg))S.bg=[];
 // chai nước (+ bánh mì) có thể cần 1-2 ô; dụng cụ cần 1 ô. Rương mở ra giải phóng 1 ô.
 const need=(tool?1:0)+((S.wat|0)%(STK.wat||1)===0?1:0)+(!tool&&((S.bread|0)%(STK.bread||1)===0||(S.bread|0)%(STK.bread||1)+3>(STK.bread||1))?1:0);
 if(freeSlots()+1<need){say('🎒 Túi đầy — cần trống thêm ô để mở Rương khởi đầu');return null}
 S.chK--;S.wat=(S.wat|0)+1;let msg;
 if(tool){S.bg.push(tool);try{globalThis.EQ30&&EQ30.durSync()}catch(_){}msg=(tool==='t_axe'?'🪓 Rìu':'⛏ Cuốc chim')+' (độ bền 50) · 🧴 1 chai nước'}
 else{S.bread=(S.bread|0)+3;msg='🥖 3 bánh mì · 🧴 1 chai nước'}
 say('🎁 Rương khởi đầu: '+msg);try{X.renderInv&&X.renderInv()}catch(_){}try{X.SAVE&&X.SAVE.save&&X.SAVE.save('kit33',false)}catch(_){}
 M33.last={tool,bread:tool?0:3,wat:1};return M33.last}
/* ---------- Chợ trao đổi: mọi vật tư xếp chồng ---------- */
const EMO2={med:'💊',gas:'⛽',oil:'🛢',chB:'🟫',chS:'⬜',chG:'🟨',chK:'🎁',bpCloth:'📘',bpArmor:'📘',bpWeap:'📘',bpDef:'📘',bpH4:'📘',bpH5:'📘',cardFarm:'🃏',cardTp:'🃏',barrel:'🛢',
 ck_fire:'🔥',ck_pot:'🍲',ck_bowl:'🥣',ck_meat:'🥩',ck_ginger:'🫚',ck_veg:'🥬',ck_mush:'🍄',ck_rice:'🌾',ck_coal:'⚫',b28_fence:'🚧',b28_gate:'🚪',b28_filter:'🚰',b28_storage:'🧳',sd_veg:'🌱',sd_rice:'🌱',sd_ginger:'🌱'};
const NM2={med:'Thuốc',gas:'Xăng',oil:'Dầu'};
function mkSync(){const M=globalThis.M19;if(!M||!M.TK)return;for(const k of Object.keys(STK)){if(k==='eat')continue;if(!M.TK.includes(k))M.TK.push(k);
  if(!M.NM[k])M.NM[k]=(F4&&F4.names&&F4.names[k])||NM2[k]||k;if(M.EMO&&!M.EMO[k])M.EMO[k]=EMO2[k]||(/^ck_d/.test(k)?'🥣':'📦')}}
mkSync();setTimeout(mkSync,1500);
/* ---------- Thanh công cụ: chat + cửa hàng bên trái, còn lại về bên phải, nút ◀▶ thu gọn ---------- */
{const l=document.getElementById('lay32');if(l)l.textContent=`
#m19bc,#m19bm{right:auto!important;left:calc(14px + env(safe-area-inset-left,0px))!important;width:44px!important;height:44px!important;top:calc(50% - 6px)!important}
#m19bm{left:calc(66px + env(safe-area-inset-left,0px))!important}
@media (max-height:520px){#m19bc,#m19bm{top:calc(50% + 34px)!important;width:38px!important;height:38px!important;font-size:17px!important}#m19bc{left:calc(10px + env(safe-area-inset-left,0px))!important}#m19bm{left:calc(52px + env(safe-area-inset-left,0px))!important}}`}
const RG=['ibtn','sbtn','pbtn','mbtn','xdbtn'];
const st=document.createElement('style');st.id='tb33';st.textContent=`
#tb33b{position:fixed;z-index:7;width:18px;height:34px;border-radius:8px 0 0 8px;border:0;background:rgba(0,0,0,.22);color:rgba(255,255,255,.6);font:600 11px system-ui;padding:0;cursor:pointer;box-shadow:none;opacity:.75}
#tb33b:hover{opacity:1}
/* L33b: chữ trong các bảng rõ hơn (nền tối hơn, chữ đậm + viền tối) */
.m19w,.sp,.ckpan,.ckmenu,#xdpan,#chfx > div{background-color:rgba(4,16,34,.78)!important;-webkit-backdrop-filter:blur(10px) saturate(120%)!important;backdrop-filter:blur(10px) saturate(120%)!important}
.m19w,.m19w *,.sp,.sp *,.ckpan,.ckpan *,.ckmenu,.ckmenu *,#xdpan,#xdpan *{text-shadow:0 1px 2px rgba(0,0,0,.95),0 0 1px #000!important}
.m19w,.sp,.ckpan,.ckmenu,#xdpan{font-weight:600}
.hud,.hud *,.hud33{text-shadow:0 0 2px #000,0 1px 2px #000,0 0 5px rgba(0,0,0,.85)!important;font-weight:600}
.m19w small,.sp small,.ckpan small,#xdpan small{color:#d8f6ff!important;opacity:1!important}
body.tb33off #ibtn,body.tb33off #sbtn,body.tb33off #pbtn,body.tb33off #mbtn,body.tb33off #xdbtn{display:none!important}`;document.head.appendChild(st);
const B=document.createElement('button');B.id='tb33b';B.title='Thu gọn / hiện thanh công cụ (phím Tab)';document.body.appendChild(B);
let off=false;try{off=localStorage.getItem('sh_tb33')==='1'}catch(_){}
function place(){const rs=RG.map(id=>document.getElementById(id)).filter(e=>e&&getComputedStyle(e).display!=='none').map(e=>e.getBoundingClientRect()).filter(r=>r.width>0);
 if(!off&&rs.length){const L=Math.min(...rs.map(r=>r.left)),T=Math.min(...rs.map(r=>r.top)),Bt=Math.max(...rs.map(r=>r.bottom));B.style.left=(L-22)+'px';B.style.right='auto';B.style.top=((T+Bt)/2-17)+'px'}
 else if(off){B.style.left='auto';B.style.right='0px';B.style.top=(B._t||innerHeight/2-17)+'px'}
 if(!off&&rs.length)B._t=parseFloat(B.style.top)}
function apply(){document.body.classList.toggle('tb33off',off);B.textContent=off?'‹':'›';B.style.display=S.on?'block':'none';place()}
function toggle(){off=!off;try{localStorage.setItem('sh_tb33',off?'1':'0')}catch(_){}apply()}
B.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();toggle()});
addEventListener('keydown',e=>{if(e.key!=='Tab'||!S.on)return;const t=e.target&&e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT')return;e.preventDefault();toggle()});
addEventListener('resize',()=>setTimeout(place,50));setInterval(()=>{const v=S.on?'block':'none';if(B.style.display!==v)apply();else if(!off)place()},700);apply();
{let hc=null;setInterval(()=>{if(hc&&hc.isConnected)return;hc=[...document.querySelectorAll('div')].find(e=>e.children.length===0&&/^🏠 /.test(e.textContent||''));if(hc)hc.classList.add('hud33')},1500)}
/* ---------- L33c: bản đồ thế giới — lưu sẵn lớp nền (trước đây vẽ lại toàn bộ 4 lần/giây) ---------- */
function mapCache(){const W=globalThis.W15;if(!W||typeof W.wmBase!=='function'||W.wmBase.__c33)return;const base=W.wmBase;let off=null,key='';
 const f=function(g,X,Y,K,d){try{const c=g.canvas,A=globalThis.M26ART&&M26ART.A,hs=(W.M3&&W.M3.houses||[]).length;
   const k=c.width+'x'+c.height+'|'+(A?A.mode:'')+'|'+X(0).toFixed(2)+','+Y(0).toFixed(2)+'|'+K.toFixed(4)+'|'+hs+'|'+(globalThis.TERRAIN8?TERRAIN8.signature:'');
   if(k!==key||!off){off=off||document.createElement('canvas');off.width=c.width;off.height=c.height;const o=off.getContext('2d');o.setTransform(1,0,0,1,0,0);o.clearRect(0,0,off.width,off.height);base.call(this,o,X,Y,K,d);key=k;M33.mapBuilds++}
   const tf=g.getTransform();g.save();g.setTransform(1,0,0,1,0,0);g.drawImage(off,0,0);g.restore();g.setTransform(tf);return}catch(e){key='';return base.call(this,g,X,Y,K,d)}};
 f.__c33=1;W.wmBase=f}
mapCache();setTimeout(mapCache,2000);
const M33={mapBuilds:0,giveKit,openKit,toggle,mkSync,get off(){return off},last:null};globalThis.M33=M33;
})();
