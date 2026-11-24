/* =====================================================================
   BƯỚC 19 – CHAT 3 KÊNH · TRAO ĐỔI TRỰC TIẾP · CHỢ TRAO ĐỔI TOÀN BẢN ĐỒ
   Bản offline: đối tác là các bot thử nghiệm (testBot, có ghi rõ 🤖). Không có người chơi online giả.
   Kiến trúc tách lớp để khi có máy chủ chỉ cần thay "MK.backend" (máy chủ quyết định kết quả).
   ===================================================================== */
(()=>{'use strict';
const SH=globalThis.SH;if(!SH||!SH.F5){console.warn('[M19] thiếu SH');return}
const S=SH.S,pos=SH.pos,F5=SH.F5,X=SH.X,B16=()=>SH.B16||globalThis.B16;
const hyp=Math.hypot,clamp=(v,a,b)=>v<a?a:v>b?b:v,esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ME=()=>(S.name||S.prof&&S.prof.name||(SH.SAVE&&SH.SAVE.account&&SH.SAVE.account.name)||'Bạn');
/* ---------- vật phẩm được phép trao đổi (bộ đếm trong túi; không gồm rương, bản vẽ, thẻ, đồ nhiệm vụ) ---------- */
const TK=['xu','wood','stone','bread','wat','botC','botD','botE','med','iron','cu','plas','part','pmat','rpart'];
const NM=Object.assign({xu:'Xu',wood:'Gỗ',stone:'Đá',bread:'Bánh mì',wat:'Nước đóng chai',botC:'Chai nước sạch',botD:'Chai nước chưa đun',botE:'Chai rỗng',med:'Thuốc'},(SH.F4&&SH.F4.names)||{});
const EMO={xu:'🪙',wood:'🪵',stone:'🪨',bread:'🥖',wat:'🧴',botC:'💧',botD:'🫙',botE:'🍶',med:'💊',iron:'⛓',cu:'🟠',plas:'🧪',part:'⚙️',pmat:'💎',rpart:'🔷'};
const VAL={xu:1,wood:1,stone:2,bread:5,wat:4,botC:4,botD:2,botE:1,med:8,iron:4,cu:5,plas:3,part:6,pmat:10,rpart:15};// chỉ dùng cho quyết định của BOT, không áp tỷ giá lên người chơi
const icon=k=>{try{const h=F5.ic&&F5.ic({k,ic:EMO[k]||'📦'});if(h)return h}catch(_){}return EMO[k]||'📦'};
const have=k=>Math.max(0,S[k]|0);
/* bot: túi đồ + kho nhà (nước sạch của bot lưu là botB) */
const bk=k=>k==='botC'?'botB':k;
function botHas(b,k){const h=globalThis.BROWSER_AI21?.active?BROWSER_AI21.home(b):(B16().HOUSES||[]).find(q=>q.id===b.home);return(b.inv[bk(k)]|0)+(h&&h.store&&h.store[k]|0)}
function botTake(b,k,n){const kk=bk(k);const a=Math.min(n,b.inv[kk]|0);b.inv[kk]=(b.inv[kk]|0)-a;let r=n-a;if(r>0){const h=globalThis.BROWSER_AI21?.active?BROWSER_AI21.home(b):(B16().HOUSES||[]).find(q=>q.id===b.home);if(h&&h.store){h.store[k]=(h.store[k]|0)-r;r=0}}return r===0}
function botGive(b,k,n){const kk=bk(k);b.inv[kk]=(b.inv[kk]|0)+n}

/* =========================== 1) DỮ LIỆU & LƯU =========================== */
const D={seq:1,chat:{near:[],area:[],region:[],sys:[]},lst:[],mail:[],hist:[]};
const now=()=>Date.now();
SH.SAVE.register({id:'m19',scope:'world',version:1,defaults:()=>({}),
 get(){return{seq:D.seq,chat:{near:D.chat.near.slice(-40),area:D.chat.area.slice(-60),region:(D.chat.region||[]).slice(-60),sys:D.chat.sys.slice(-60)},lst:D.lst.filter(l=>l.st==='open'||now()-l.t<864e5*3).slice(-120),mail:D.mail,hist:D.hist.slice(-80)}},
 set(d){if(!d||typeof d!=='object')return;D.seq=d.seq|0||1;D.chat=Object.assign({near:[],area:[],region:[],sys:[]},d.chat||{});D.lst=Array.isArray(d.lst)?d.lst:[];D.mail=Array.isArray(d.mail)?d.mail:[];D.hist=Array.isArray(d.hist)?d.hist:[];render()}});
const save=()=>{try{SH.SAVE.save(true)}catch(_){}};

/* =========================== 2) CHAT 3 KÊNH =========================== */
const NEAR_R=20;
function post(ch,from,txt,o={}){if(!D.chat[ch])return null;const m={z:o.z||null,ch,from,txt:String(txt).slice(0,ch==='sys'&&o.notice45?2048:o.bot?320:160),t:now(),bot:!!o.bot,x:o.x,y:o.y,id:o.id};if(ch==='sys'&&o.notice45)m.notice45=true;D.chat[ch].push(m);if(D.chat[ch].length>120)D.chat[ch].shift();if(UI.open&&UI.tab===ch)renderChat();badge(ch);return m}
function sys(txt,o={}){return post('sys','Hệ thống',txt,o)}
// Repair only this weather warning's old duplicate/truncated entries; preserve other chat.
function weatherWarning45(txt,create=true){const match=m=>m.from==='Hệ thống'&&typeof m.txt==='string'&&m.txt.startsWith('⚠️ Cảnh báo ngày 6:');const old=D.chat.sys.filter(match);let m=old[0];
 if(!m){if(!create)return null;return sys(txt,{notice45:true})}
 const text=String(txt).slice(0,2048);if(old.length===1&&m.txt===text&&m.notice45)return m;
 m.txt=text;m.notice45=true;D.chat.sys=D.chat.sys.filter(v=>v===m||!match(v));if(UI.open&&UI.tab==='sys')renderChat();return m}
/* chat hiện tại: chỉ người trong 20 m thấy · bong bóng trên đầu 5 giây */
const BUB=new Map();// id → {txt,t}
function sayNear(id,name,txt,x,y,bot){BUB.set(id,{txt,t:performance.now()});const d=hyp(x-pos.x,y-pos.y);if(id==='me'||d<=NEAR_R)post('near',name,txt,{bot,x,y,id})}
function sendChat(ch,txt){if(ch==='region')ch='area';txt=txt.trim();if(!txt)return;if(ch==='sys')return;// người chơi không gửi vào kênh hệ thống
 if(ch==='near'){sayNear('me',ME(),txt,pos.x,pos.y,false);botsHear(txt)}else post(ch==='region'?'region':'area',ME(),txt,{z:globalThis.W15?.zoneAt2(pos.x,pos.y)?.n});globalThis.BROWSER_AI21?.hear(ch,txt);save()}
// bong bóng (DOM, đúng vị trí ở cả 2D và 2.5D)
const bl=document.createElement('div');bl.id='m19bub';document.body.appendChild(bl);
function scr(x,y){const V=SH.V25;if(V&&V.on&&V.T15&&V.T15.cam){const T=V.T15.T,v=new T.Vector3(x,2.35*(V.T15.CARD||1.15),y).project(V.T15.cam);return[(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight]}
 const Z=SH.Z;return[(x-pos.x)*Z+SH.W/2,(y-pos.y)*Z+SH.H/2-Z*2.55]}
function bubbles(){const t=performance.now(),els={};for(const[id,b]of BUB){if(t-b.t>5000){BUB.delete(id);continue}let x,y;if(id==='me'){x=pos.x;y=pos.y}else{const o=SH.OTH[id];if(!o||!o.on){continue}x=o.x;y=o.y}
  if(hyp(x-pos.x,y-pos.y)>NEAR_R+5)continue;const p=scr(x,y);els[id]=[p,b]}
 for(const el of[...bl.children])if(!els[el.dataset.id])el.remove();
 for(const id in els){let el=bl.querySelector('[data-id="'+id+'"]');const[p,b]=els[id];if(!el){el=document.createElement('div');el.className='bub';el.dataset.id=id;bl.appendChild(el)}if(el._t!==b.txt){el.textContent=b.txt;el._t=b.txt}
  const age=(t-b.t)/1000;el.style.opacity=age>4.4?Math.max(0,(5-age)/.6):1;el.style.transform='translate('+(p[0]|0)+'px,'+(p[1]|0)+'px) translate(-50%,-100%)'}}
/* thông báo hệ thống: lấy từ các thông báo sự kiện có sẵn (zombie, cửa, quái đêm, giao dịch…) */
{const T=document.getElementById('toast');let last='';if(T)new MutationObserver(()=>{const s=T.textContent.trim();if(!s||s===last)return;last=s;if(D.chat.sys.some(m=>m.notice45&&m.txt===s&&now()-m.t<2000))return;if(/quái|zombie|Zombie|cửa|Cửa|đêm|Đêm|⚠|💥|☠|Hệ Thống|bảo vệ|Trời sáng|Phó bản|rương|Rương/.test(s))post('sys','Hệ thống',s)}).observe(T,{childList:true,characterData:true,subtree:true})}

/* =========================== 3) CHỢ TRAO ĐỔI TOÀN BẢN ĐỒ =========================== */
/* MK.backend: bản offline xử lý cục bộ. Khi có máy chủ: thay bằng gọi API, máy chủ giữ kho ký gửi & quyết định kết quả. */
const MK={backend:'offline-local'};
const fmt=(k,n)=>icon(k)+' '+esc(NM[k]||k)+' ×'+n;
const txtOf=(k,n)=>(NM[k]||k)+' ×'+n;
function addHist(o){D.hist.push(Object.assign({t:now()},o));if(D.hist.length>200)D.hist.shift()}
function deliver(k,n,from){if(k==='xu'){S.xu=(S.xu||0)+n;return n}// vào túi; túi đầy → hộp thư nhận hàng (không mất vật phẩm)
 const a=X.give?X.give(k,n):(S[k]=(S[k]|0)+n,n);const r=n-a;if(r>0){D.mail.push({id:D.seq++,k,n:r,from,t:now()});sys('📬 Túi đầy – '+txtOf(k,r)+' đã chuyển vào Hộp thư nhận hàng')}return a}
function claimMail(id){const m=D.mail.find(q=>q.id===id);if(!m)return;const a=X.give?X.give(m.k,m.n):m.n;m.n-=a;if(m.n<=0)D.mail=D.mail.filter(q=>q!==m);SH.say(a?'📬 Nhận '+txtOf(m.k,a):'🎒 Túi đầy, chưa nhận được');save();render()}
function validPost(gk,gn,wk,wn){if(!TK.includes(gk)||!TK.includes(wk))return'Vật phẩm không được phép trao đổi';if(gk===wk)return'Hai bên phải khác vật phẩm';
 if(!(gn>=1&&gn<=999&&wn>=1&&wn<=999)||gn%1||wn%1)return'Số lượng không hợp lệ';return''}
/* đăng bài: vật phẩm đưa chuyển vào KHO KÝ GỬI (không còn dùng được trong túi) */
function postListing(gk,gn,wk,wn){const e=validPost(gk,gn,wk,wn);if(e)return{ok:false,msg:e};if(have(gk)<gn)return{ok:false,msg:'Không đủ '+(NM[gk]||gk)};
 if(D.lst.filter(l=>l.own==='me'&&l.st==='open').length>=10)return{ok:false,msg:'Tối đa 10 bài đang đăng'};
 S[gk]-=gn;const l={id:'L'+(D.seq++),own:'me',name:ME(),gk,gn,wk,wn,st:'open',t:now(),esc:{k:gk,n:gn}};D.lst.push(l);addHist({type:'post',id:l.id,g:txtOf(gk,gn),w:txtOf(wk,wn)});
 sys('📢 Bạn đã đăng trao đổi '+txtOf(gk,gn)+' lấy '+txtOf(wk,wn)+'.');save();return{ok:true,l}}
function cancelListing(id){const l=D.lst.find(q=>q.id===id);if(!l||l.st!=='open'||l.own!=='me')return{ok:false,msg:'Bài không còn mở'};l.st='cancel';l.tc=now();const e=l.esc;l.esc=null;deliver(e.k,e.n,'Kho ký gửi');addHist({type:'cancel',id,g:txtOf(l.gk,l.gn)});
 sys('↩️ Bài trao đổi đã hủy. Vật phẩm đã được hoàn trả.');save();return{ok:true}}
/* hoàn tất NGUYÊN TỬ: kiểm tra hết → mới thay đổi; một bài chỉ hoàn tất được một lần */
function fulfill(id,by){const l=D.lst.find(q=>q.id===id);if(!l)return{ok:false,msg:'Không tìm thấy bài'};if(l.st!=='open'||!l.esc)return{ok:false,msg:'Bài đã hoàn tất hoặc đã hủy'};
 const a62=globalThis.SURVIVORS62;if(a62?.ownsID(l.own)||a62?.ownsID(by)){if(l.gk==='xu'||l.wk==='xu'||(a62.ownsID(l.own)&&!a62.canTrade(l.own))||(a62.ownsID(by)&&!a62.canTrade(by)))return{ok:false,msg:'Bot chỉ đổi vật phẩm khi còn sống'};}
 if(by==='me'){if(l.own==='me')return{ok:false,msg:'Không thể đổi bài của chính mình'};if(have(l.wk)<l.wn)return{ok:false,msg:'Bạn không đủ '+(NM[l.wk]||l.wk)+' ×'+l.wn}}
 else{const b=bot(by);if(!b)return{ok:false,msg:'bot?'};if(l.own===by)return{ok:false,msg:'tự đổi'};if(botHas(b,l.wk)<l.wn)return{ok:false,msg:'bot thiếu'}}
 l.st='lock';try{const e=l.esc;
  if(by==='me'){S[l.wk]-=l.wn;l.esc=null;deliver(e.k,e.n,l.name);const ob=bot(l.own);if(ob)botGive(ob,l.wk,l.wn)}
  else{const b=bot(by);if(!botTake(b,l.wk,l.wn))throw new Error('bot thiếu');l.esc=null;botGive(b,e.k,e.n);if(l.own==='me')deliver(l.wk,l.wn,b.n);else{const ob=bot(l.own);if(ob)botGive(ob,l.wk,l.wn)}}
  l.st='done';l.td=now();l.by=by;l.byName=by==='me'?ME():(bot(by)||{}).n;}catch(err){l.st='open';return{ok:false,msg:'Lỗi giao dịch – không thay đổi gì'}}
 addHist({type:'done',id,g:txtOf(l.gk,l.gn),w:txtOf(l.wk,l.wn),own:l.name,by:l.byName});
 if(by==='me')sys('✅ Trao đổi thành công! Bạn nhận được '+txtOf(l.gk,l.gn)+' (đưa '+txtOf(l.wk,l.wn)+' cho '+l.name+').');
 else if(l.own==='me'){sys('🔔 Người chơi '+l.byName+' đã đổi '+txtOf(l.wk,l.wn)+' lấy '+txtOf(l.gk,l.gn)+' của bạn.');sys('✅ Trao đổi thành công! Bạn nhận được '+txtOf(l.wk,l.wn)+'.');SH.say('🔔 '+l.byName+' đã đổi bài của bạn: nhận '+txtOf(l.wk,l.wn))}
 save();render();return{ok:true,l}}
const bot=id=>{const B=B16();return B&&B.BOTS.find(b=>b.id===id)};
/* ---------- bot dùng chợ (đăng bài từ đồ dư · đổi bài có lợi cho nhu cầu của mình) ---------- */
const BTK=['wood','stone','bread','wat','med','botE','botD','botC','xu'];
function botMarket(){if(globalThis.BROWSER_AI21?.active)return BROWSER_AI21.market();const B=B16();if(!B||!B.CFG.on)return;const bots=B.BOTS.slice(0,B.CFG.n).filter(b=>!b.dead);if(!bots.length)return;const b=bots[(Math.random()*bots.length)|0];
 // đổi bài của người khác (kể cả bài của bạn) nếu có đủ & có lợi
 for(const l of D.lst){if(l.st!=='open'||l.own===b.id)continue;if(!BTK.includes(l.wk))continue;const keep=l.wk==='wood'?6:0;if(botHas(b,l.wk)-keep<l.wn)continue;
  const gain=VAL[l.gk]*l.gn,cost=VAL[l.wk]*l.wn,need=(l.gk==='botC'&&b.water<60)||(l.gk==='stone'&&b.p===2)||(l.gk==='wood'&&!b.axe);if(gain>=cost*(need?.7:1.05)){const r=fulfill(l.id,b.id);if(r.ok){chatBot(b,'Mình vừa đổi '+txtOf(l.wk,l.wn)+' lấy '+txtOf(l.gk,l.gn)+' trên Chợ!','area');return}}}
 // đăng bài từ đồ dư (mỗi bot tối đa 1 bài mở)
 if(D.lst.some(l=>l.own===b.id&&l.st==='open'))return;const sur=BTK.filter(k=>b.inv[bk(k)]>=(k==='wood'?10:4));if(!sur.length)return;const gk=sur[(Math.random()*sur.length)|0];const want=BTK.filter(k=>k!==gk&&k!=='botE');const wk=want[(Math.random()*want.length)|0];
 const gn=Math.min(b.inv[bk(gk)]-(gk==='wood'?6:0),gk==='wood'?10:4);if(gn<1)return;const wn=Math.max(1,Math.round(gn*VAL[gk]/VAL[wk]*(.8+Math.random()*.3)));
 b.inv[bk(gk)]-=gn;const l={id:'L'+(D.seq++),own:b.id,name:b.n,bot:1,gk,gn,wk,wn,st:'open',t:now(),esc:{k:gk,n:gn}};D.lst.push(l);
 chatBot(b,'Tớ đăng lên Chợ rồi: '+txtOf(gk,gn)+' ⇄ '+txtOf(wk,wn)+'. Ai đổi không?',hyp(b.x-pos.x,b.y-pos.y)<NEAR_R?'near':'area');render()}
function chatBot(b,txt,ch){const nm='🤖 '+b.n;if(ch==='near')sayNear(b.id,nm,txt,b.x,b.y,true);else post('area',nm,txt,{bot:true})}
function botsHear(txt){if(globalThis.BROWSER_AI21?.active)return;const B=B16();if(!B)return;for(const b of B.BOTS.slice(0,B.CFG.n)){if(b.dead||b.inside||hyp(b.x-pos.x,b.y-pos.y)>NEAR_R)continue;
  setTimeout(()=>{const r=/đổi|trao|gỗ|đá|nước/i.test(txt)?'Mình có '+(b.inv.wood|0)+' gỗ, '+(b.inv.stone|0)+' đá. Lại gần bấm 🤝 để trao đổi nhé!':/chào|hi|hello/i.test(txt)?'Chào bạn! Mình là bot thử nghiệm.':null;if(r)chatBot(b,r,'near')},700+Math.random()*900);break}}
setInterval(()=>{if(S.on&&!S.dead)try{botMarket()}catch(e){console.warn('[M19] bot chợ',e)}},14000);
/* bài của bot đã đăng bị bot đó chết/hết mạng: vẫn giữ nguyên trong kho ký gửi (không mất đồ) */

/* =========================== 4) TRAO ĐỔI TRỰC TIẾP =========================== */
const TR={on:false,b:null,my:{},their:{},rMe:false,rThem:false};
function nearBot(){const B=B16();if(!B||!B.CFG.on)return null;let best=null,bd=3;for(const b of B.BOTS.slice(0,B.CFG.n)){if(b.dead||b.inside)continue;const d=hyp(b.x-pos.x,b.y-pos.y);if(d<bd){bd=d;best=b}}return best}
{const o=F5.acts;F5.acts=c=>{o&&o(c);if(SH.IH()||!S.on||S.dead)return;const b=nearBot();if(b)c(hyp(b.x-pos.x,b.y-pos.y)-.05,3,'🤝<br>'+esc(b.n.replace('Bot ','')),()=>menuFor(b),{x:b.x,y:b.y})}}
function menuFor(b){showPop('<b>🤖 '+esc(b.n)+'</b><small> · bot thử nghiệm</small><div class="r"><button data-a="tr">🤝 Mời trao đổi</button><button data-a="hi">💬 Chào</button><button data-a="x">✕</button></div>',a=>{if(a==='tr')invite(b);if(a==='hi'){sayNear('me',ME(),'Chào '+b.n+'!',pos.x,pos.y);botsHear('chào')}})}
function invite(b){const P=B16().PERS[b.p];const hostile=performance.now()-b.hurtT<20000;if(hostile||(b.mode==='fight'||b.mode==='flee')){sys('🤖 '+b.n+' từ chối trao đổi (đang bận/không tin bạn)');chatBot(b,'Bây giờ chưa tiện…','near');return}
 sys('🤝 '+b.n+' đã chấp nhận lời mời trao đổi.');chatBot(b,'Ok, trao đổi nhé!','near');TR.on=true;TR.b=b;TR.my={};TR.their={};TR.rMe=TR.rThem=false;renderTrade();TW.style.display='flex'}
function tradeVal(o){let v=0;for(const k in o)v+=(VAL[k]||1)*o[k];return v}
function tradeChange(side,k,d){if(!TR.on)return;const o=side==='me'?TR.my:TR.their,mx=side==='me'?have(k):botHas(TR.b,k);o[k]=clamp((o[k]|0)+d,0,mx);if(!o[k])delete o[k];TR.rMe=TR.rThem=false;renderTrade()}// đổi đề nghị → cả hai phải xác nhận lại
function tradeReady(){if(!TR.on)return;TR.rMe=true;const b=TR.b,give=tradeVal(TR.my),get=tradeVal(TR.their);const P=b.p;
 if(!Object.keys(TR.my).length&&!Object.keys(TR.their).length){TR.rMe=false;renderTrade();return}
 const ok=give>=get*(P===4?.7:P===1?1.1:.9)||get===0;TR.rThem=ok;if(!ok)chatBot(b,'Đề nghị này chưa hợp lý với mình, thêm chút nữa nhé.','near');renderTrade()}
function tradeConfirm(){if(!TR.on||!TR.rMe||!TR.rThem)return;const b=TR.b;if(hyp(b.x-pos.x,b.y-pos.y)>6||b.dead||b.inside)return tradeCancel('Đối tác đã rời đi – không chuyển vật phẩm');
 for(const k in TR.my)if(have(k)<TR.my[k])return tradeCancel('Bạn không còn đủ '+NM[k]);for(const k in TR.their)if(botHas(b,k)<TR.their[k])return tradeCancel(b.n+' không còn đủ '+NM[k]);
 // chuyển đồng thời
 for(const k in TR.my){S[k]-=TR.my[k];botGive(b,k,TR.my[k])}for(const k in TR.their){botTake(b,k,TR.their[k]);deliver(k,TR.their[k],b.n)}
 const g=Object.entries(TR.my).map(([k,n])=>txtOf(k,n)).join(', ')||'—',w=Object.entries(TR.their).map(([k,n])=>txtOf(k,n)).join(', ')||'—';addHist({type:'direct',with:b.n,g,w});
 sys('🤝 Trao đổi trực tiếp với '+b.n+' thành công: bạn đưa '+g+' · nhận '+w);chatBot(b,'Cảm ơn nhé!','near');TR.on=false;TW.style.display='none';save();render()}
function tradeCancel(why){if(!TR.on)return;TR.on=false;TW.style.display='none';sys('✖ Trao đổi trực tiếp đã hủy'+(why?': '+why:'')+' – không chuyển vật phẩm.')}
setInterval(()=>{if(TR.on&&(!TR.b||hyp(TR.b.x-pos.x,TR.b.y-pos.y)>6||TR.b.dead||S.dead))tradeCancel('mất kết nối / đi quá xa')},500);

/* =========================== 5) GIAO DIỆN =========================== */
const css=document.createElement('style');css.textContent=`
#m19bub{position:fixed;inset:0;pointer-events:none;z-index:8}#m19bub .bub{position:absolute;left:0;top:0;max-width:220px;background:#fff8fb;color:#4a2c3a;border:2px solid #e9a7c3;border-radius:14px;padding:5px 10px;font:600 13px system-ui;box-shadow:0 2px 6px rgba(0,0,0,.3);white-space:pre-wrap;word-break:break-word;text-align:center}
#m19bub .bub:after{content:'';position:absolute;left:50%;bottom:-8px;margin-left:-7px;border:7px solid transparent;border-top-color:#e9a7c3;border-bottom:0}
.m19btn{position:fixed;z-index:6}.m19btn i{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;border-radius:8px;background:#ff3b5c;color:#fff;font:700 10px/16px system-ui;font-style:normal;display:none}
.m19w{position:fixed;z-index:30;display:none;flex-direction:column;background:linear-gradient(#5a3a2a,#4a2e22);border:3px solid #c98a5a;border-radius:16px;box-shadow:0 0 0 2px #f2c6d8 inset,0 8px 24px rgba(0,0,0,.5);color:#fff3e6;font:13px system-ui}
.m19w h3{margin:0;padding:7px 36px 7px 12px;text-align:center;font:800 17px system-ui;color:#ffe3ef;background:linear-gradient(#8a5a7a,#6a3e5e);border-radius:12px 12px 0 0;text-shadow:0 1px 0 #000}
.m19w .x{position:absolute;right:6px;top:5px;width:28px;height:28px;border-radius:50%;border:2px solid #fff;background:#5a2a3a;color:#fff;font:700 14px system-ui}
.m19w .tb{display:flex;gap:4px;padding:6px}.m19w .tb button{flex:1;padding:6px 4px;border-radius:10px;border:1px solid #c98a5a;background:#3a2418;color:#f6dcc8;font:700 12px system-ui}.m19w .tb button.on{background:linear-gradient(#c9a0f0,#9a6ad0);color:#fff}
.m19w .bd{overflow:auto;padding:6px 8px;flex:1}.m19w .row{display:flex;align-items:center;gap:6px;background:#3a2418;border:1px solid #7a4a2a;border-radius:10px;padding:6px;margin-bottom:5px}
.m19w .row .nm{min-width:74px;font-weight:700;color:#ffd9ea}.m19w .row .it{flex:1;display:flex;align-items:center;gap:4px;flex-wrap:wrap}.m19w .row small{opacity:.7}
.m19w button.go{padding:6px 10px;border-radius:10px;border:0;background:linear-gradient(#c9a0f0,#8a5ac8);color:#fff;font:700 12px system-ui}.m19w button.y{background:linear-gradient(#ffd86a,#f0a830);color:#4a2c00}
.m19w img{width:22px;height:22px;vertical-align:middle}.m19w input,.m19w select{background:#2a1810;color:#fff;border:1px solid #9a6a4a;border-radius:8px;padding:5px}
.m19w .msg{padding:3px 2px;border-bottom:1px dashed rgba(255,255,255,.08)}.m19w .msg b{color:#ffcfe3}.m19w .msg.bt b{color:#9ad8ff}.m19w .msg.sy{color:#ffe7a0}
.m19w .ft{display:flex;gap:6px;padding:6px}.m19w .ft input{flex:1}
#m19chat{left:8px;bottom:96px;width:min(380px,94vw);height:min(300px,46vh)}#m19mk{left:50%;top:50%;transform:translate(-50%,-50%);width:min(620px,96vw);max-height:86vh}
#m19tr{right:8px;top:60px;width:min(460px,96vw)}#m19pop{position:fixed;z-index:31;left:50%;top:40%;transform:translate(-50%,-50%);background:#4a2e22;border:3px solid #c98a5a;border-radius:14px;padding:10px;color:#fff;font:13px system-ui;display:none;text-align:center}#m19pop .r{display:flex;gap:6px;margin-top:8px}#m19pop button{padding:7px 10px;border-radius:10px;border:0;background:#8a5ac8;color:#fff;font-weight:700}
.m19g{display:grid;grid-template-columns:1fr 34px 1fr;gap:6px;align-items:start}.m19g .col{background:#3a2418;border:1px solid #7a4a2a;border-radius:10px;padding:6px}.m19g .col h4{margin:0 0 4px;text-align:center;color:#ffd9ea}
.m19q{display:flex;align-items:center;gap:4px;margin:3px 0}.m19q span{flex:1}.m19q button{width:24px;height:24px;border-radius:6px;border:0;background:#6a4a3a;color:#fff;font-weight:800}.m19q b{min-width:22px;text-align:center}
.m19ok{color:#7aff9a;font-weight:800}.m19pv{background:#2a1810;border:1px dashed #c98a5a;border-radius:10px;padding:8px;margin:6px 0}
@media (max-width:520px){#m19chat{bottom:180px;height:min(260px,36vh)}.m19w .row .nm{min-width:56px}}`;document.head.appendChild(css);
const mk=(id,cls,html)=>{const e=document.createElement('div');e.id=id;e.className=cls;e.innerHTML=html;document.body.appendChild(e);return e};
const BC=document.createElement('button');BC.className='btn m19btn';BC.id='m19bc';BC.innerHTML='💬<i></i>';BC.style.cssText='right:66px;top:260px;width:44px;height:44px;font-size:20px;padding:0';document.body.appendChild(BC);
const BM=document.createElement('button');BM.className='btn m19btn';BM.id='m19bm';BM.innerHTML='🏪<i></i>';BM.title='Chợ trao đổi';BM.style.cssText='right:14px;top:260px;width:44px;height:44px;font-size:20px;padding:0';document.body.appendChild(BM);
const CW=mk('m19chat','m19w','<h3>💬 Chat · AI24</h3><button class="x">✕</button><div class="tb"><button data-c="near">💬 Hiện tại</button><button data-c="area">🌐 Thế giới<br><small>(offline)</small></button><button data-c="sys">🔔 Hệ thống</button></div><div class="bd"></div><div class="ft"><input maxlength="160" placeholder="Nhập tin nhắn..."><button class="go">➤</button></div>');
const MW=mk('m19mk','m19w','<h3>🏪 Chợ Trao Đổi</h3><button class="x">✕</button><div class="tb"><button data-t="find">Tìm trao đổi</button><button data-t="post">Đăng trao đổi</button><button data-t="mine">Trao đổi của tôi</button></div><div class="bd"></div>');
const TW=mk('m19tr','m19w','<h3>🤝 Trao Đổi Trực Tiếp</h3><button class="x">✕</button><div class="bd"></div>');
const POP=mk('m19pop','','');
const UI={open:false,tab:'near',mt:'find',q:'',flt:'all',page:0,post:{gk:'wood',gn:10,wk:'stone',wn:5},unread:{near:0,area:0,region:0,sys:0},mineTab:'open'};
const inUI=e=>e.stopPropagation();for(const w of[CW,MW,TW,POP]){w.addEventListener('pointerdown',inUI);w.addEventListener('keydown',e=>e.stopPropagation())}
function badge(ch){if(UI.open&&UI.tab===ch)return;UI.unread[ch]++;const n=UI.unread.near+UI.unread.area+UI.unread.region+UI.unread.sys,i=BC.querySelector('i');i.textContent=n>99?'99+':n;i.style.display=n?'block':'none'}
function showPop(html,cb){POP.innerHTML=html;POP.style.display='block';POP.onclick=e=>{const t=e.target.closest('button');if(!t)return;POP.style.display='none';if(t.dataset.a!=='x')cb(t.dataset.a)}}
BC.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();UI.open=!UI.open;CW.style.display=UI.open?'flex':'none';if(UI.open){UI.unread[UI.tab]=0;badge('');renderChat()}});
CW.querySelector('.x').onclick=()=>{UI.open=false;CW.style.display='none'};
CW.querySelector('.tb').onclick=e=>{const b=e.target.closest('button');if(!b)return;UI.tab=b.dataset.c==='region'?'area':b.dataset.c;UI.unread[UI.tab]=0;badge('');renderChat()};
const CI=CW.querySelector('input');const sendIt=()=>{sendChat(UI.tab,CI.value);CI.value='';renderChat()};CW.querySelector('.ft .go').onclick=sendIt;CI.addEventListener('keydown',e=>{if(e.key==='Enter')sendIt()});
function renderChat(){for(const b of CW.querySelectorAll('.tb button'))b.classList.toggle('on',b.dataset.c===UI.tab);const L=(UI.tab==='area'?[...D.chat.area,...D.chat.region].sort((a,b)=>a.t-b.t):(D.chat[UI.tab]||[])),bd=CW.querySelector('.bd');
 bd.innerHTML=L.slice(-60).map(m=>'<div class="msg'+(m.ch==='sys'?' sy':m.bot?' bt':'')+'">'+(m.ch==='sys'?'🔔 ':'')+'<b>'+(m.ch==='near'?'[Gần] ':m.ch==='area'||m.ch==='region'?'[Thế giới] ':'')+esc(m.from)+':</b> '+esc(m.txt)+'</div>').join('')||'<div class="msg" style="opacity:.6">'+(UI.tab==='near'?'Chỉ người đứng trong '+NEAR_R+' m mới thấy. Tin nhắn hiện trên đầu nhân vật 5 giây.':UI.tab==='area'?'Kênh chung toàn bản đồ – không giới hạn khoảng cách.':UI.tab==='region'?'Chỉ người và bot trong cùng khu vực nhận được tin. Nếu không có bot, chọn Thế giới để nói chuyện.':'Thông báo sự kiện, cảnh báo, giao dịch.')+'</div>';
 bd.scrollTop=1e9;const ft=CW.querySelector('.ft');ft.style.display=UI.tab==='sys'?'none':'flex'}
BM.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const v=MW.style.display==='flex';MW.style.display=v?'none':'flex';if(!v)render()});
MW.querySelector('.x').onclick=()=>{MW.style.display='none'};TW.querySelector('.x').onclick=()=>tradeCancel('bạn đã đóng cửa sổ');
MW.querySelector('.tb').onclick=e=>{const b=e.target.closest('button');if(!b)return;UI.mt=b.dataset.t;render()};
const PER=6;
function render(){if(MW.style.display!=='flex')return;for(const b of MW.querySelectorAll('.tb button'))b.classList.toggle('on',b.dataset.t===UI.mt);const bd=MW.querySelector('.bd');
 if(UI.mt==='find'){let L=D.lst.filter(l=>l.st==='open');const q=UI.q.trim().toLowerCase();if(q)L=L.filter(l=>(NM[l.gk]+' '+NM[l.wk]+' '+l.name).toLowerCase().includes(q));
  if(UI.flt==='can')L=L.filter(l=>have(l.wk)>=l.wn);if(UI.flt==='need')L=L.filter(l=>have(l.gk)<10);L.sort((a,b)=>b.t-a.t);const pg=Math.max(1,Math.ceil(L.length/PER));UI.page=clamp(UI.page,0,pg-1);
  bd.innerHTML='<div style="display:flex;gap:6px;margin-bottom:6px"><input class="q" placeholder="🔍 Tìm vật phẩm..." value="'+esc(UI.q)+'" style="flex:1"><select class="f"><option value="all">Tất cả</option><option value="can"'+(UI.flt==='can'?' selected':'')+'>Đồ mình có thể đổi</option><option value="need"'+(UI.flt==='need'?' selected':'')+'>Đồ mình đang thiếu</option></select><select disabled><option>Mới nhất</option></select></div>'+
   (L.slice(UI.page*PER,UI.page*PER+PER).map(l=>'<div class="row"><div class="nm">'+(l.bot?'🤖 ':'')+esc(l.name)+'</div><div class="it">'+fmt(l.gk,l.gn)+' <b>⇄</b> '+fmt(l.wk,l.wn)+' <small>'+ago(l.t)+'</small></div>'+(l.own==='me'?'<small>bài của bạn</small>':'<button class="go y" data-f="'+l.id+'">Đổi ngay</button>')+'</div>').join('')||'<div style="opacity:.7;padding:10px">Chưa có bài trao đổi nào đang mở.</div>')+
   '<div style="display:flex;justify-content:center;gap:8px;align-items:center"><button class="go" data-pg="-1">◀</button> '+(UI.page+1)+' / '+pg+' <button class="go" data-pg="1">▶</button></div><small style="opacity:.6">Bản offline: bài đăng của bạn & của bot thử nghiệm (🤖) trên cùng thế giới. Chưa có người chơi online thật.</small>';
  const qi=bd.querySelector('.q');qi.oninput=()=>{UI.q=qi.value;UI.page=0;const c=qi.selectionStart;render();const n=MW.querySelector('.q');n.focus();n.setSelectionRange(c,c)};bd.querySelector('.f').onchange=e=>{UI.flt=e.target.value;UI.page=0;render()}}
 else if(UI.mt==='post'){const P=UI.post,opt=(sel,src)=>src.map(k=>'<option value="'+k+'"'+(k===sel?' selected':'')+'>'+(EMO[k]||'')+' '+esc(NM[k]||k)+(src===TK&&sel!==undefined&&bd.dataset.g?'':'')+'</option>').join('');
  const mine=TK.filter(k=>have(k)>0);if(!mine.includes(P.gk))P.gk=mine[0]||'wood';P.gn=clamp(P.gn,1,Math.max(1,have(P.gk)));
  bd.innerHTML='<div class="m19g"><div class="col"><h4>Tôi đưa</h4><select class="gk" style="width:100%">'+(mine.length?mine.map(k=>'<option value="'+k+'"'+(k===P.gk?' selected':'')+'>'+(EMO[k]||'')+' '+esc(NM[k])+' (có '+have(k)+')</option>').join(''):'<option>Túi trống</option>')+'</select><div class="m19q"><span>Số lượng</span><button data-d="gn,-1">−</button><b>'+P.gn+'</b><button data-d="gn,1">+</button></div></div><div style="text-align:center;font-size:22px;padding-top:24px">⇄</div>'+
   '<div class="col"><h4>Tôi cần</h4><select class="wk" style="width:100%">'+TK.filter(k=>k!==P.gk).map(k=>'<option value="'+k+'"'+(k===P.wk?' selected':'')+'>'+(EMO[k]||'')+' '+esc(NM[k])+'</option>').join('')+'</select><div class="m19q"><span>Số lượng</span><button data-d="wn,-1">−</button><b>'+P.wn+'</b><button data-d="wn,1">+</button></div></div></div>'+
   '<div class="m19pv"><b>Xem trước bài đăng:</b><br>'+esc(ME())+' muốn trao đổi: Tôi đưa '+fmt(P.gk,P.gn)+' · Tôi cần '+fmt(P.wk,P.wn)+'<br><small>Vật phẩm đưa sẽ vào kho ký gửi (không dùng được) cho tới khi có người đổi hoặc bạn hủy bài.</small></div><div style="display:flex;gap:8px;justify-content:center"><button class="go y" data-post="1">Đăng trao đổi</button></div>';
  bd.querySelector('.gk').onchange=e=>{P.gk=e.target.value;if(P.wk===P.gk)P.wk=TK.find(k=>k!==P.gk);render()};bd.querySelector('.wk').onchange=e=>{P.wk=e.target.value;render()}}
 else{const tabs=[['open','Đang đăng'],['done','Đã hoàn tất'],['cancel','Đã hủy'],['hist','Lịch sử']],my=D.lst.filter(l=>l.own==='me'||l.by==='me');
  bd.innerHTML='<div class="tb" style="padding:0 0 6px">'+tabs.map(([k,n])=>'<button data-m="'+k+'" class="'+(UI.mineTab===k?'on':'')+'">'+n+(k==='open'?' ('+my.filter(l=>l.st==='open').length+')':'')+'</button>').join('')+'</div>'+
   (UI.mineTab==='hist'?D.hist.slice().reverse().slice(0,40).map(h=>'<div class="row"><div class="it">'+(h.type==='post'?'📢 Đăng: '+esc(h.g)+' ⇄ '+esc(h.w):h.type==='cancel'?'↩️ Hủy: '+esc(h.g):h.type==='direct'?'🤝 Trực tiếp với '+esc(h.with)+': đưa '+esc(h.g)+' · nhận '+esc(h.w):'✅ '+esc(h.own)+' ⇄ '+esc(h.by)+': '+esc(h.g)+' ⇄ '+esc(h.w))+' <small>'+ago(h.t)+'</small></div></div>').join('')||'<div style="opacity:.7">Chưa có lịch sử.</div>'
   :my.filter(l=>UI.mineTab==='open'?l.st==='open':UI.mineTab==='done'?l.st==='done':l.st==='cancel').sort((a,b)=>b.t-a.t).map(l=>'<div class="row"><div class="it">'+fmt(l.gk,l.gn)+' <b>⇄</b> '+fmt(l.wk,l.wn)+' <small>'+(l.st==='open'?'Đang chờ đổi · đăng '+ago(l.t):l.st==='done'?(l.own==='me'?'Đã đổi bởi '+esc(l.byName):'Bạn đã đổi bài của '+esc(l.name))+' · '+ago(l.td):'Đã hủy · '+ago(l.tc))+'</small></div>'+(l.st==='open'&&l.own==='me'?'<button class="go" data-c="'+l.id+'">Hủy đăng</button>':'')+'</div>').join('')||'<div style="opacity:.7">Trống.</div>')+
   (D.mail.length?'<div class="m19pv"><b>📬 Hộp thư nhận hàng</b>'+D.mail.map(m=>'<div class="row"><div class="it">'+fmt(m.k,m.n)+' <small>từ '+esc(m.from)+'</small></div><button class="go y" data-mail="'+m.id+'">Nhận</button></div>').join('')+'</div>':'')}
 const mb=BM.querySelector('i'),n=D.mail.length;mb.textContent=n;mb.style.display=n?'block':'none'}
MW.querySelector('.bd').addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;const P=UI.post;
 if(t.dataset.pg){UI.page+=+t.dataset.pg;render()}
 else if(t.dataset.f){const l=D.lst.find(q=>q.id===t.dataset.f);if(!l)return;showPop('Bạn đưa <b>'+esc(txtOf(l.wk,l.wn))+'</b> để nhận <b>'+esc(txtOf(l.gk,l.gn))+'</b> từ '+(l.bot?'🤖 ':'')+esc(l.name)+'?<div class="r"><button data-a="ok">✔ Xác nhận</button><button data-a="x">Hủy</button></div>',()=>{const r=fulfill(l.id,'me');if(!r.ok){SH.say('⚠️ '+r.msg);sys('⚠️ Không đổi được: '+r.msg)}render()})}
 else if(t.dataset.d){const[f,d]=t.dataset.d.split(',');P[f]=clamp(P[f]+(+d),1,f==='gn'?Math.max(1,have(P.gk)):999);render()}
 else if(t.dataset.post){const r=postListing(P.gk,P.gn,P.wk,P.wn);SH.say(r.ok?'📢 Bạn đã đăng trao đổi '+txtOf(P.gk,P.gn)+' lấy '+txtOf(P.wk,P.wn)+'.':'⚠️ '+r.msg);if(r.ok){UI.mt='mine';UI.mineTab='open'}render()}
 else if(t.dataset.c){const r=cancelListing(t.dataset.c);SH.say(r.ok?'↩️ Bài trao đổi đã hủy. Vật phẩm đã được hoàn trả.':'⚠️ '+r.msg);render()}
 else if(t.dataset.m){UI.mineTab=t.dataset.m;render()}
 else if(t.dataset.mail)claimMail(+t.dataset.mail)});
function ago(t){const s=(now()-t)/1000;return s<60?'vừa xong':s<3600?Math.floor(s/60)+' phút trước':s<86400?Math.floor(s/3600)+' giờ trước':Math.floor(s/86400)+' ngày trước'}
function renderTrade(){if(!TR.on)return;const b=TR.b,bd=TW.querySelector('.bd');const col=(side)=>{const o=side==='me'?TR.my:TR.their,src=side==='me'?TK.filter(k=>have(k)>0||o[k]):TK.filter(k=>botHas(b,k)>0||o[k]);
  return src.map(k=>'<div class="m19q"><span>'+icon(k)+' '+esc(NM[k])+' <small>('+(side==='me'?have(k):botHas(b,k))+')</small></span><button data-q="'+side+','+k+',-1">−</button><b>'+(o[k]|0)+'</b><button data-q="'+side+','+k+',1">+</button></div>').join('')||'<small style="opacity:.6">Không có vật phẩm</small>'};
 bd.innerHTML='<div class="m19g"><div class="col"><h4>'+esc(ME())+'<br><small>Bạn đưa</small></h4>'+col('me')+'<div style="text-align:center;margin-top:4px">'+(TR.rMe?'<span class="m19ok">✔ Đã sẵn sàng</span>':'<small>Chưa sẵn sàng</small>')+'</div></div><div style="text-align:center;font-size:22px;padding-top:30px">⇄</div>'+
  '<div class="col"><h4>🤖 '+esc(b.n)+'<br><small>Đối tác đưa</small></h4>'+col('them')+'<div style="text-align:center;margin-top:4px">'+(TR.rThem?'<span class="m19ok">✔ Đã sẵn sàng</span>':'<small>Chưa sẵn sàng</small>')+'</div></div></div>'+
  '<div style="display:flex;gap:6px;justify-content:center;margin-top:8px"><button class="go" data-tr="x">Hủy</button><button class="go" data-tr="r">Sẵn sàng</button><button class="go y" data-tr="ok"'+(TR.rMe&&TR.rThem?'':' disabled style="opacity:.45"')+'>Xác nhận trao đổi</button></div><small style="opacity:.65">Đổi đề nghị → cả hai phải xác nhận lại. Hủy hoặc đi xa quá 6 m → không chuyển vật phẩm.</small>'}
TW.querySelector('.bd').addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;if(t.dataset.q){const[s,k,d]=t.dataset.q.split(',');tradeChange(s,k,+d)}else if(t.dataset.tr==='x')tradeCancel('bạn đã hủy');else if(t.dataset.tr==='r')tradeReady();else if(t.dataset.tr==='ok')tradeConfirm()});
/* chặn đánh/di chuyển nhầm khi thao tác trên các cửa sổ này (máy tính) */
{const st=document.createElement('style');st.textContent='#m19chat,#m19mk,#m19tr,#m19pop{touch-action:auto}';document.head.appendChild(st)}
function loop(){requestAnimationFrame(loop);try{bubbles()}catch(_){}}requestAnimationFrame(loop);
const M19={D,MK,TK,NM,EMO,postListing,cancelListing,fulfill,sendChat,botHas,botTake,botGive,VAL,sayNear,post,sys,weatherWarning45,invite,tradeChange,tradeReady,tradeConfirm,tradeCancel,TR,botMarket,claimMail,render,renderChat,UI};
globalThis.M19=SH.M19=M19;
})();
