/* ===================== LẦN 30: CẦM TRÊN TAY + ĐỘ BỀN DỤNG CỤ / VŨ KHÍ =====================
   - Rìu, cuốc chim, vũ khí là món trong ba lô. Chọn "Cầm" (túi đồ / thanh nhanh / bảng nhân vật) để cầm trên tay;
     chỉ món đang cầm mới có tác dụng (vũ khí cộng ATK khi cầm, rìu chặt cây, cuốc đào đá).
   - Ô trang bị "Vũ khí" đổi thành "Trang sức" (chưa có món trang sức).
   - Độ bền theo độ hiếm: trắng 50 · lục 80 · lam 120 · tím 180 · vàng 250. Mỗi lần dùng −1; hết là hỏng (mất khỏi ba lô). */
(()=>{'use strict';
const SH=globalThis.SH;if(!SH||!SH.X||!SH.F5){console.warn('[EQ30] thiếu SH');return}
const X=SH.X,S=SH.S,F5=SH.F5,EQ=X.EQ,CMD=X.CMD;const say0=SH.say;const say=m=>{try{say0(m)}catch(_){}};
EQ.t_axe={n:'Rìu',s:'t',ic:'🪓',r:0,tool:'axe'};EQ.t_pick={n:'Cuốc chim',s:'t',ic:'⛏',r:0,tool:'pick'};
const DMAX=[50,80,120,180,250],dmax=id=>DMAX[Math.max(0,Math.min(4,(EQ[id]||{}).r|0))];
const HELD=id=>!!EQ[id]&&(EQ[id].s==='w'||EQ[id].s==='t');
const AXE_IMG='eq30/axe.png';
/* ---------- tay cầm ---------- */
function apply(){const h=S.hand&&EQ[S.hand]?S.hand:'';const w=h&&EQ[h].s==='w'?h:null;if(!S.eqp||typeof S.eqp!=='object')S.eqp={w:null,h:null,a:null,b:null};
 if(S.eqp.w!==w){S.eqp.w=w;try{X.renderInv&&0}catch(_){}}S.axe=h==='t_axe'||!!(w&&EQ[w].axe);S.pick=h==='t_pick'?1:0}
function setHand(id,quiet){if(id&&!S.bg.includes(id))return;S.hand=id||'';apply();if(!quiet)say(id?'✋ Đang cầm '+EQ[id].ic+' '+EQ[id].n+' ('+durOf(id)+'/'+dmax(id)+')':'✋ Tay không');try{SH.syncM&&SH.syncM()}catch(_){}refreshUI()}
function toggle(id){setHand(S.hand===id?'':id)}
function refreshUI(){try{const inv=document.getElementById('inv');if(inv&&inv.style.display==='flex')X.renderInv()}catch(_){}try{const st=document.getElementById('stat');if(st&&st.style.display==='flex'&&globalThis.renderStat)renderStat()}catch(_){}}
/* ---------- độ bền: S.dur[id] = danh sách độ bền từng món cùng loại trong ba lô (món [0] là món được dùng) ---------- */
function durSync(){if(!S.dur||typeof S.dur!=='object'||Array.isArray(S.dur))S.dur={};const cnt={};for(const id of S.bg)if(HELD(id))cnt[id]=(cnt[id]||0)+1;
 for(const id in S.dur)if(!cnt[id])delete S.dur[id];for(const id in cnt){let L=S.dur[id];if(!Array.isArray(L))L=S.dur[id]=[];for(let i=0;i<L.length;i++)L[i]=Math.max(1,Math.min(dmax(id),L[i]|0));while(L.length<cnt[id])L.push(dmax(id));while(L.length>cnt[id])L.pop()}}
const durOf=id=>{durSync();const L=S.dur[id];return L&&L.length?L[0]:dmax(id)};
const lastUse={};
function durUse(id,gap){if(!id||!HELD(id)||!S.bg.includes(id))return;const now=performance.now();if(gap&&now-(lastUse[id]||0)<gap)return;lastUse[id]=now;durSync();const L=S.dur[id];if(!L||!L.length)return;L[0]--;
 if(L[0]<=0){L.shift();const i=S.bg.indexOf(id);if(i>=0)S.bg.splice(i,1);say('💥 '+EQ[id].ic+' '+EQ[id].n+' đã hỏng!'+(S.bg.includes(id)?' – chuyển sang cái khác':''));if(S.hand===id&&!S.bg.includes(id))setHand('',true);apply();refreshUI()}
 else if(L[0]===10||L[0]===5)say('⚠ '+EQ[id].n+' sắp hỏng – còn '+L[0]+'/'+dmax(id))}
/* ---------- chuyển save cũ: vũ khí đang mặc + rìu/cuốc (cờ cũ) → món trong ba lô ---------- */
function migrate(){if(S.eq30)return;S.eq30=1;if(!Array.isArray(S.bg))S.bg=[];let h='';
 if(S.eqp&&S.eqp.w&&EQ[S.eqp.w]){if(!S.bg.includes(S.eqp.w))S.bg.push(S.eqp.w);h=S.eqp.w}
 if(S.axe&&!S.bg.includes('t_axe')){S.bg.push('t_axe');if(!h)h='t_axe'}if(S.pick&&!S.bg.includes('t_pick'))S.bg.push('t_pick');
 if(Array.isArray(S.hb))S.hb=S.hb.map(x=>x&&x.t==='tool'?{t:'eq',id:x.id==='axeT'?'t_axe':'t_pick',v:0}:x);S.hand=h;apply();durSync()}
/* ---------- giữ nhất quán mỗi nhịp ---------- */
let lastSig='';
setInterval(()=>{try{if(!S.on)return;if(!S.eq30)migrate();if(typeof S.hand!=='string')S.hand='';
 if(S.eqp&&S.eqp.w&&S.eqp.w!==S.hand){const w=S.eqp.w;if(!S.bg.includes(w))S.bg.push(w);S.hand=w} // món bị mặc bằng đường cũ → đưa về ba lô, cầm trên tay
 if(S.hand&&!S.bg.includes(S.hand))S.hand='';apply();durSync();
 if(Array.isArray(S.hb)&&S.hb.some(x=>x&&x.t==='tool'))S.hb=S.hb.map(x=>x&&x.t==='tool'?{t:'eq',id:x.id==='axeT'?'t_axe':'t_pick',v:0}:x)}catch(e){if(!EQ30.err){EQ30.err=String(e&&e.stack||e);console.warn('[EQ30]',e)}}},250);
/* ---------- chặn đường "mặc" vũ khí/dụng cụ vào ô ---------- */
{const e0=X.equip;X.equip=i=>{const id=S.bg[i];if(HELD(id))return setHand(id);return e0(i)}}
if(typeof globalThis.equip==='function'){const e1=globalThis.equip;globalThis.equip=i=>{const id=S.bg[i];if(HELD(id))return toggle(id);return e1(i)}}
/* ---------- tiêu hao độ bền ---------- */
{const x0=CMD.exec;CMD.exec=(type,p,o)=>{const r=x0(type,p,o);try{if(r&&r.ok){if(type==='tree.chop'){if(S.hand==='t_axe')durUse('t_axe',200);else if(S.eqp.w&&EQ[S.eqp.w].axe)durUse(S.eqp.w,200)}
  else if(type==='enemy.hit'&&S.eqp.w&&S.eqp.w!=='w7')durUse(S.eqp.w,300)}}catch(_){}return r}}
{const a0=F5.attack;if(a0)F5.attack=(...a)=>{const r=a0(...a);try{if(r&&S.eqp.w==='w7')durUse('w7',200)}catch(_){}return r}}
SH.say=m=>{try{if(typeof m==='string'&&/^⛏ Đào được/.test(m)&&S.hand==='t_pick')durUse('t_pick',150)}catch(_){}return say0(m)};
/* ---------- hiển thị: biểu tượng, vạch độ bền, dấu ✋ ---------- */
const durBar=id=>{const d=durOf(id),m=dmax(id),p=d/m;return'<s style="position:absolute;left:4px;right:4px;bottom:2px;height:3px;border-radius:2px;background:rgba(0,0,0,.5);text-decoration:none"><s style="display:block;height:100%;width:'+Math.round(p*100)+'%;border-radius:2px;text-decoration:none;background:'+(p>.5?'#6fd08c':p>.2?'#f2b33a':'#e05a4a')+'"></s></s>'};
{const ic0=F5.ic;F5.ic=x=>{if(x&&x.eq&&HELD(x.eq)){const base=x.eq==='t_axe'?'<img src="'+AXE_IMG+'" alt="" draggable="false" style="width:30px;height:30px;object-fit:contain">':ic0(x);const first=S.bg.indexOf(x.eq)===x.i;return'<span style="position:relative;display:inline-block;line-height:0;padding-bottom:5px">'+base+(S.hand===x.eq&&first?'<b style="position:absolute;left:-6px;top:-4px;font-size:12px;line-height:1">✋</b>':'')+(first?durBar(x.eq).replace('left:4px;right:4px;bottom:2px','left:0;right:0;bottom:0'):'')+'</span>'}return ic0(x)}}
{const ic0=F5.icon;F5.icon=(k,px)=>k==='t_axe'?'<img src="'+AXE_IMG+'" alt="" draggable="false" style="width:'+(px||34)+'px;height:'+(px||34)+'px;object-fit:contain;vertical-align:middle">':ic0(k,px)}
const css=document.createElement('style');css.textContent='#inv .ic{position:relative}';document.head.appendChild(css);
const durTxt=id=>HELD(id)?' · độ bền '+durOf(id)+'/'+dmax(id)+(S.hand===id?' · ✋ đang cầm':''):'';
const EQ30={setHand,toggle,durUse,durOf,dmax,durSync,durTxt,migrate,HELD,DMAX,apply};globalThis.EQ30=EQ30;
})();
