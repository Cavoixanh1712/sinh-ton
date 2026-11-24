/* =====================================================================
   SAVE-BRIDGE V6 → 1250 (chỉ cho bản TEST 1.250 m)
   - Nhập save bản đồ 2.500 m (safehaven_save_v6, lấy từ file xuất) hoặc save 1.250 m 1.250 m đã xuất.
   - KHÔNG đọc/ghi/xóa khóa safehaven_save_v6 hay bất kỳ khóa của bản cũ. Chỉ đọc nội dung FILE người chơi chọn.
   - Chỉ chuyển khi người chơi bấm "Chuyển save" và xác nhận. Không tự chạy khi mở game.
   - Trước khi chuyển: sao lưu save + tài khoản TEST hiện có (khóa mới, ghi một lần), lưu nguyên văn file nguồn.
   - Trong lúc chuyển: chặn mọi lần tự lưu (SAVE.hold). Lỗi/thiếu/trùng → hủy, không ghi save mới.
   - Đồ đặt trong thế giới 2.500 m → chỉ hoàn VẬT PHẨM CÓ THẬT về 📬 Hộp chờ nhận (S.pend); trang bị trong rương chứa → ba lô.
   - V4: máy lọc / rương chứa cấp 1–3 → giữ nguyên loại + cấp + đồ bên trong trong 🧰 Gói chờ khôi phục (S.rs6), đặt lại từ 🎒.
   - KHÔNG tự sinh vật phẩm: không quy nước ra chai, không tự nấu xong món/tạo bát, không tự tạo than,
     không hoàn nguyên liệu đã tiêu hao. Phần không chuyển chính xác được → liệt kê, người chơi phải xác nhận.
   ===================================================================== */
(()=>{'use strict';
const ENABLED=true;                    // công tắc tắt nhanh: false = ẩn nút nhập/xuất, không làm gì
const SH=globalThis.SH,SAVE=SH&&SH.SAVE,S=SH&&SH.S,X=SH&&SH.X;
if(!SH||!SAVE||!SAVE.importPlayer||!SAVE.hold){console.warn('[SB6] thiếu SAVE.importPlayer/hold – không bật');return}
const KEY=SAVE.KEYS.KEY,AKEY='safehaven_account_v1',LOGK=KEY+'_import_log',MAXB=3*1024*1024;
const $=id=>document.getElementById(id),say=m=>{try{SH.say(m)}catch(_){}};
const ls={get(k){try{return localStorage.getItem(k)}catch(_){return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch(_){return false}}};

/* ---------- bảng quy đổi (khớp mã nguồn b28.js / ck26.js / f5.js) ---------- */
const B28K={fence:'b28_fence',gate:'b28_gate',filter:'b28_filter',storage:'b28_storage'};
const FUEL_H=2;                                                                         // ck26.js FUEL_H: 1 khúc củi = 2 giờ cháy
const WORLD_KNOWN=new Set(['f4','v25','f6','f5','w15_f8bak','w15','n22','b16','xd15','m19','mv25','ck26','r27','b28','m32','urbanPlan','browserAI21']);
const BAD_KEYS=new Set(['__proto__','constructor','prototype']);

/* ---------- tiện ích ---------- */
function fnv(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h.toString(16).padStart(8,'0')+'-'+s.length.toString(36)}
function hasBadKey(o,d=0){if(d>40)return true;if(!o||typeof o!=='object')return false;for(const k of Object.keys(o)){if(BAD_KEYS.has(k))return true;if(hasBadKey(o[k],d+1))return true}return false}
const int=v=>Number.isFinite(+v)?Math.max(0,Math.floor(+v)):0;
const add=(m,k,n)=>{n=int(n);if(n>0)m[k]=(m[k]||0)+n};
const typ=v=>Array.isArray(v)?'array':v===null?'null':typeof v;
function diffD(t,a,b){const o=[];// so dữ liệu gốc với dữ liệu sau chuẩn hóa của bản TEST → phần nào bị cắt
 if(t==='filter'){const L={q:'nước chưa lọc',out:'chai nước sạch',be:'chai rỗng hứng',bu:'nước sạch trong thùng hứng',pr:'tiến độ lọc'};for(const k in L){const x=+a[k]||0,y=+b[k]||0;if(Math.abs(x-y)>1e-9)o.push(L[k]+' '+x+' → '+y)}if(!!a.bar!==!!b.bar)o.push('thùng hứng')}
 else{const ai=a.it||{},bi=b.it||{};for(const k in ai)if((ai[k]|0)!==(bi[k]|0)||+ai[k]!==(ai[k]|0))o.push(k+' '+ai[k]+' → '+(bi[k]|0));const ea=count(a.eq||[]),eb=count(b.eq||[]);for(const k in ea)if(ea[k]!==eb[k])o.push('trang bị '+k)}
 return o}
function logList(){try{const a=JSON.parse(ls.get(LOGK)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}}

/* ---------- 1) đọc & kiểm tra file nhập ---------- */
function parseImport(text){
 if(typeof text!=='string'||!text.trim())return{ok:false,why:'File trống'};
 if(text.length>MAXB)return{ok:false,why:'File quá lớn ('+Math.round(text.length/1024)+' KB, tối đa '+(MAXB>>10)+' KB)'};
 let o;try{o=JSON.parse(text)}catch(_){return{ok:false,why:'File không phải JSON hợp lệ'}}
 if(hasBadKey(o))return{ok:false,why:'File chứa khóa không an toàn (__proto__/constructor) – từ chối'};
 let save=o,src='raw';if(o&&o.format==='safehaven-export'){if(o.v!==1)return{ok:false,why:'Định dạng xuất không hỗ trợ (v'+o.v+')'};save=o.save;src='export'}
 if(!save||typeof save!=='object'||Array.isArray(save))return{ok:false,why:'Không thấy dữ liệu save'};
 if(save.saveVersion!==6)return{ok:false,why:'Chỉ nhận save phiên bản 6 (file là phiên bản '+(save.saveVersion??'?')+'). Save cũ hơn: mở bản cũ để lên v6 trước'};
 const p=save.player,w=save.world;
 if(!p||typeof p!=='object'||!p.S||typeof p.S!=='object'||Array.isArray(p.S))return{ok:false,why:'Thiếu dữ liệu nhân vật (player.S)'};
 if(!p.pos||!Number.isFinite(p.pos.x)||!Number.isFinite(p.pos.y))return{ok:false,why:'Vị trí nhân vật lỗi'};
 if(!w||typeof w!=='object'||!Number.isFinite(w.GT)||w.GT<0)return{ok:false,why:'Thời gian thế giới lỗi'};
 if(!(p.lives>=1&&p.lives<=3))return{ok:false,why:'Số mạng lỗi'};
 for(const k of['hp','mhp','food','water','sta','xu'])if(k in p.S&&!(typeof p.S[k]==='number'&&Number.isFinite(p.S[k])))return{ok:false,why:'Chỉ số '+k+' lỗi'};
 if(p.S.bg!=null&&(!Array.isArray(p.S.bg)||p.S.bg.length>500))return{ok:false,why:'Ba lô trang bị lỗi'};
 let kind;if(save.mapSize===1250)kind='test-1250';else if(save.mapSize==null)kind='live-2500';else return{ok:false,why:'Kích thước bản đồ lạ: '+save.mapSize};
 const raw=JSON.stringify(save);return{ok:true,kind,src,save,raw,hash:fnv(raw)}}

/* ---------- 2) chuyển đổi save 2.500 m → gói nhập 1.250 m (hàm thuần: không đụng game/bộ nhớ) ---------- */
function convert(save,ctx){
 const STK=ctx.STK,EQ=ctx.EQ,curS=ctx.curS;const rep={refund:{},eqRefund:[],restore:[],dropped:[],notes:[],kept:[],lost:[],houseLv:1,errors:[]};// lost = tài sản KHÔNG chuyển được chính xác → phải được người chơi xác nhận
 const d=JSON.parse(JSON.stringify(save)),p=d.player,W=d.world||{},E=W.ext||{};
 // 2a. nhân vật: chỉ giữ trường có cùng kiểu với bản TEST (hoặc trường đơn giản chưa có)
 const S2={};for(const k of Object.keys(p.S)){if(k==='on'||k==='pz'||k==='dead')continue;const v=p.S[k];
  if(k in curS){const a=typ(curS[k]),b=typ(v);if(a===b||(a==='null')||(b==='null'&&a==='object')){S2[k]=v;continue}rep.dropped.push('S.'+k+' (khác kiểu: '+b+'≠'+a+')');continue}
  if(typ(v)==='number'&&!Number.isFinite(v)){rep.dropped.push('S.'+k+' (số lỗi)');continue}S2[k]=v}  // trường bản TEST chưa tạo sẵn (vd. dur, vis) vẫn giữ nguyên
 if(!Array.isArray(S2.bg))S2.bg=[];const badEq=S2.bg.filter(id=>!EQ[id]);if(badEq.length)rep.errors.push('Trang bị không có trong bản TEST: '+[...new Set(badEq)].join(', '));
 const pend=(S2.pend&&typeof S2.pend==='object'&&!Array.isArray(S2.pend))?Object.assign({},S2.pend):{};
 for(const k in pend){if(!(STK[k]&&Number.isFinite(pend[k])&&pend[k]>=0))rep.errors.push('Hộp chờ có vật phẩm lạ: '+k)}
 // 2b. ext thế giới: kiểm tra phần lạ trước
 for(const id of Object.keys(E))if(!WORLD_KNOWN.has(id))rep.errors.push('Dữ liệu thế giới lạ "'+id+'" – không chuyển để tránh mất đồ');
 const R=rep.refund;let xuR=0;
 // b28: hàng rào, cổng, máy lọc, rương chứa (+ nâng cấp đã trả, + đồ bên trong)
 const b28=(E.b28&&Array.isArray(E.b28.list))?E.b28.list:[];let nB=0;
 for(const a of b28){if(!Array.isArray(a)||!B28K[a[1]]){rep.errors.push('Công trình b28 lạ: '+JSON.stringify(a).slice(0,60));continue}
  const t=a[1],rawLv=a[5]==null?1:a[5],dd=a[7]||{};const nm={filter:'Máy lọc',storage:'Rương chứa'}[t];
  if((t==='filter'||t==='storage')&&rawLv!==1&&rawLv!==2&&rawLv!==3){rep.errors.push((nm||t)+': cấp lạ ('+JSON.stringify(rawLv)+') – không đoán cấp');continue}const lv=(t==='filter'||t==='storage')?rawLv:1;
  // V4: máy lọc / rương chứa CẤP 1–3 → giữ nguyên loại + cấp + đồ bên trong trong gói chờ khôi phục (S.rs6); không hạ cấp, không hoàn nguyên liệu nâng cấp, không tách đồ ra 📬
  if(t==='filter'||t==='storage'){const src=JSON.parse(JSON.stringify(dd));
   if(t==='storage'&&src.it&&typeof src.it==='object'){for(const k in src.it){if(k==='xu'&&!STK.xu){xuR+=int(src.it[k]);delete src.it[k];rep.notes.push('Rương chứa cấp '+lv+': '+int(dd.it[k])+' xu bên trong → cộng vào ví');continue}if(!STK[k]||k==='eat')rep.errors.push('Rương chứa có vật phẩm lạ: '+k)}
    if(Array.isArray(src.eq))for(const id of src.eq)if(!EQ[id])rep.errors.push('Rương chứa có trang bị lạ: '+id)}
   if(typeof ctx.normD!=='function'){rep.errors.push('Bản TEST thiếu chức năng khôi phục thiết bị (b28)');continue}
   const nd=ctx.normD(t,lv,src);const diff=diffD(t,src,nd);
   for(const x of diff)rep.lost.push(nm+' cấp '+lv+': '+x+' – bản 1.250 m không chứa được đúng như cũ');
   rep.restore.push({t,lv,d:nd});continue}
  add(R,B28K[t],1);nB++;}                                                    // hàng rào, cổng → vật phẩm
 if(nB)rep.notes.push(nB+' công trình (hàng rào/cổng) → vật phẩm');
 if(rep.restore.length)rep.notes.push(rep.restore.length+' máy lọc/rương chứa → 🧰 Gói chờ khôi phục (giữ nguyên cấp và đồ bên trong)');
 // ck26: bếp lửa (+ củi chưa cháy, than, nồi, nguyên liệu, món)
 const fires=(E.ck26&&Array.isArray(E.ck26.fires))?E.ck26.fires:[];
 const RNM={d1:'Canh thịt gừng',d2:'Cháo thịt',d3:'Súp nấm',d4:'Canh rau',d5:'Thịt hầm',d6:'Nước gừng'};
 for(const f of fires){if(!Array.isArray(f)){rep.errors.push('Bếp lửa lỗi');continue}add(R,'ck_fire',1);
  add(R,'wood',Math.floor((+f[5]||0)/FUEL_H+1e-6));                              // củi còn nguyên khúc – đúng cách game trả khi thu hồi bếp
  const c=f[7];if(c&&typeof c==='object'&&int(c.n)){if(!(+c.left>0))add(R,'ck_coal',int(c.n)); // than ĐÃ đốt xong, chờ nhận: vật phẩm có thật
   else rep.lost.push('Bếp lửa: mẻ than đang đốt dở ('+int(c.n)+' than chưa thành, 3 gỗ đã dùng) – không chuyển')}
  const pt=f[6];if(pt&&typeof pt==='object'){add(R,'ck_pot',1);
   if(pt.ing&&typeof pt.ing==='object')for(const k in pt.ing){const n=int(pt.ing[k]);if(!n)continue;if(k==='water'){rep.lost.push('Nồi: '+n+' đơn vị nước (không có chai đựng) – không chuyển');continue}if(STK[k])add(R,k,n);else rep.errors.push('Nồi có nguyên liệu lạ: '+k)}
   if(pt.st==='cook')rep.lost.push('Nồi đang nấu '+(RNM[pt.rid]||pt.rid||'món')+' – nguyên liệu đã dùng, món chưa xong – không chuyển');
   if(pt.st==='done'&&int(pt.por))rep.lost.push('Nồi còn '+int(pt.por)+' khẩu phần '+(RNM[pt.rid]||pt.rid||'món')+' chưa múc ra bát – không chuyển (không tự tạo bát/món)')}}
 if(fires.length)rep.notes.push(fires.length+' bếp lửa → bếp + nồi + củi còn nguyên khúc + than đã xong + nguyên liệu chưa nấu');
 // f5: thùng nước (+ nước bên trong → chai)
 const bars=(E.f5&&Array.isArray(E.f5.bar))?E.f5.bar:[];
 for(const b of bars){if(!Array.isArray(b)){rep.errors.push('Thùng nước lỗi');continue}add(R,'barrel',1);if(int(b[3]))rep.lost.push('Thùng nước: '+int(b[3])+' đơn vị nước '+(b[4]==='dirty'?'chưa đun':'sạch')+' – không chuyển (nhận lại thùng rỗng)')}
 if(bars.length)rep.notes.push(bars.length+' thùng nước → thùng (rỗng)');
 // m19: đồ ký gửi chợ đang mở + hộp thư nhận hàng
 const M=E.m19||{};let nL=0;
 for(const l of(Array.isArray(M.lst)?M.lst:[]))if(l&&l.own==='me'&&l.st==='open'&&l.esc&&l.esc.k){if(l.esc.k==='xu')xuR+=int(l.esc.n);else if(STK[l.esc.k])add(R,l.esc.k,l.esc.n);else rep.errors.push('Đồ ký gửi lạ: '+l.esc.k);nL++}
 for(const m of(Array.isArray(M.mail)?M.mail:[]))if(m&&m.k){if(m.k==='xu')xuR+=int(m.n);else if(STK[m.k])add(R,m.k,m.n);else rep.errors.push('Hộp thư có vật phẩm lạ: '+m.k);nL++}
 if(nL)rep.notes.push(nL+' mục chợ (đồ ký gửi + hộp thư) → hoàn trả');
 // b16: kho của nhà thuộc người chơi (nếu có)
 for(const h of((E.b16&&E.b16.houses)||[]))if(h&&h.owner==='player'&&h.store&&typeof h.store==='object')for(const k in h.store){if(k==='xu')xuR+=int(h.store[k]);else if(STK[k])add(R,k,h.store[k])}
 // xd15: công trình xây (hiện miễn phí – không có gì để hoàn)
 const xd=(E.xd15&&Array.isArray(E.xd15.list))?E.xd15.list.length:0;if(xd)rep.notes.push(xd+' công trình xây (ô đất/tháp/pháo) không chuyển – bản hiện tại xây miễn phí nên không có vật liệu để hoàn');
 // n22: cấp nhà
 const base=((E.n22&&E.n22.bases)||[]).find(b=>b&&b.id==='nhago');const lv=Math.max(1,Math.min(5,(base&&base.lv)|0||(S2.hl|0)||1));rep.houseLv=lv;S2.hl=lv;rep.houseHp=base&&Number.isFinite(+base.hp)?+base.hp:null;
 const extraMine=((E.n22&&E.n22.extra)||[]).filter(b=>b&&b.owner==='player'&&!(base&&b.id===base.site)).length;if(extraMine)rep.notes.push(extraMine+' nhà phụ của bạn ở bản đồ cũ không chuyển (vị trí riêng của bản đồ 2.500 m)');
 for(const k of Object.keys(R))if(!STK[k])rep.errors.push('Vật phẩm hoàn trả không có trong bản TEST: '+k);
 // 2c. dựng gói: hoàn trả vào hộp chờ; xu cộng thẳng; trang bị vào ba lô
 const pend2=Object.assign({},pend);for(const k in R)pend2[k]=(pend2[k]||0)+R[k];S2.pend=pend2;
 S2.rs6=(Array.isArray(S2.rs6)?S2.rs6:[]).concat(rep.restore.map(r=>({t:r.t,lv:r.lv,d:r.d,src:'import'})));rep.rs6=JSON.parse(JSON.stringify(S2.rs6));
 S2.xu=int(S2.xu)+xuR;S2.bg=S2.bg.concat(rep.eqRefund);S2.kit32=1;S2._gift=1;
 const expected={};for(const k of new Set([...Object.keys(STK),...Object.keys(pend2)])){const n=(typeof S2[k]==='number'?S2[k]:0)+(pend2[k]||0);if(n)expected[k]=n}
 rep.xu={src:int(p.S.xu),refund:xuR,total:S2.xu};rep.expected=expected;rep.bg=S2.bg.slice();rep.lives=p.lives;rep.GT=W.GT;
 rep.dropped.push('Vị trí nhân vật & điểm đến (bản đồ cũ) – xuất hiện trong nhà an toàn mới');
 rep.dropped.push('Trạng thái thế giới 2.500 m: cây đã chặt, tài nguyên, quái, bot, cửa, trạm xăng – thế giới 1.250 m bắt đầu mới');
 for(const k in R)rep.kept.push(k);
 const pkg={account:d.account&&typeof d.account==='object'?d.account:{},player:{ch:p.ch,prof:p.prof,lives:p.lives,S:S2,BB:Array.isArray(p.BB)?p.BB:[],ext:p.ext&&typeof p.ext==='object'?p.ext:{},way:null},GT:W.GT};
 rep.lostCount=rep.lost.length;return{ok:!rep.errors.length,pkg,rep}}

/* ---------- 3) kiểm tra sau khi áp ---------- */
function count(arr){const m={};for(const x of arr||[])m[x]=(m[x]||0)+1;return m}
function verify(rep){const bad=[];const pend=S.pend||{};
 for(const k in rep.expected){if(k==='xu')continue;const n=(typeof S[k]==='number'?S[k]:0)+(pend[k]||0);if(n!==rep.expected[k])bad.push(k+': '+n+' ≠ '+rep.expected[k])}
 for(const k in pend)if(!(k in rep.expected)&&pend[k]>0)bad.push('hộp chờ thừa '+k+' ×'+pend[k]);
 if((S.xu|0)!==rep.xu.total)bad.push('xu: '+S.xu+' ≠ '+rep.xu.total);
 const a=count(S.bg),b=count(rep.bg);for(const k of new Set([...Object.keys(a),...Object.keys(b)]))if(a[k]!==b[k])bad.push('trang bị '+k+': '+(a[k]|0)+' ≠ '+(b[k]|0));
 if(JSON.stringify(Array.isArray(S.rs6)?S.rs6:[])!==JSON.stringify(rep.rs6||[]))bad.push('gói chờ khôi phục thiết bị không khớp');
 if(S.lives!==rep.lives)bad.push('mạng: '+S.lives+' ≠ '+rep.lives);
 if((S.hl|0)!==rep.houseLv)bad.push('cấp nhà: '+S.hl+' ≠ '+rep.houseLv);if(globalThis.NHA&&NHA.PB&&!NHA.PB.none&&NHA.PB.lv!==rep.houseLv)bad.push('nhà đang dựng cấp '+NHA.PB.lv+' ≠ '+rep.houseLv);
 const wb=SH.WB;if(wb&&!(SH.pos.x>wb.x0&&SH.pos.x<wb.x1&&SH.pos.y>wb.y0&&SH.pos.y<wb.y1))bad.push('vị trí ngoài bản đồ 1.250 m');
 if(X&&X.hitC&&X.hitC(SH.pos.x,SH.pos.y,.3))bad.push('vị trí kẹt vật cản');
 return bad}

/* ---------- 4) thực hiện nhập ---------- */
let busy=false;const ST={last:null};
function backups(ts,srcRaw,hash){// tất cả là KHÓA MỚI; trả false nếu ghi không được → hủy trước khi đổi gì
 const cur=ls.get(KEY),acc=ls.get(AKEY);const w=[];
 if(cur){if(!ls.set(KEY+'_pre_import_'+ts,cur))return{ok:false,why:'Không ghi được bản sao lưu save 1.250 m (bộ nhớ đầy?)'};w.push(KEY+'_pre_import_'+ts)}
 if(acc){if(!ls.set(AKEY+'_pre_import_'+ts,acc))return{ok:false,why:'Không ghi được bản sao lưu tài khoản'};w.push(AKEY+'_pre_import_'+ts)}
 const sk=KEY+'_src_'+hash;if(!ls.get(sk)){if(!ls.set(sk,srcRaw))return{ok:false,why:'Không lưu được bản gốc file nhập'};w.push(sk)}
 return{ok:true,keys:w}}
function fail(msg,detail){SAVE.hold(true);busy=false;ST.last={ok:false,msg,detail};render();console.warn('[SB6] hủy:',msg,detail||'')}
async function runImport(P,ackLost){if(busy)return;if(S.on){return fail('Chỉ nhập được ở màn hình bắt đầu')}busy=true;
 const ts=Date.now();SAVE.hold(true);                                   // từ đây không có lần ghi save nào
 try{
  if(P.kind==='test-1250'){const b=backups(ts,P.raw,P.hash);if(!b.ok)return fail(b.why);
   if(!ls.set(KEY,P.raw))return fail('Không ghi được save');appendLog({t:ts,hash:P.hash,kind:P.kind,backups:b.keys});
   ST.last={ok:true,msg:'Đã khôi phục save 1.250 m từ file. Trang sẽ tải lại – bấm Tiếp tục.'};render();setTimeout(()=>location.reload(),900);return}
  const C=convert(P.save,ctx());if(!C.ok)return fail('Dữ liệu không chuyển an toàn được',C.rep.errors);
  if(C.rep.lost.length&&ackLost!==C.rep.lost.length)return fail('Chưa xác nhận các mục không chuyển được',C.rep.lost);
  const b=backups(ts,P.raw,P.hash);if(!b.ok)return fail(b.why);
  try{SAVE.hideBox&&SAVE.hideBox()}catch(_){}
  const H=globalThis.HOME24;if(!H||!H.newGame)return fail('Thiếu module nhà an toàn (HOME24)');
  H.H.spawned=true;await H.newGame();                                     // cấp nhà an toàn mới + vị trí trong nhà (không lưu vì đang hold)
  if(!SAVE.importPlayer(C.pkg))return fail('Không áp được dữ liệu nhân vật');
  try{const m=SAVE.mod('n22');if(m){const cur=m.get();if(cur&&cur.bases&&cur.bases[0]&&!cur.bases[0].none){cur.bases[0].lv=C.rep.houseLv;if(C.rep.houseHp!=null)cur.bases[0].hp=C.rep.houseHp;m.set(cur)}}}catch(e){return fail('Không đặt được cấp nhà',[String(e)])}
  for(let i=0;i<40&&globalThis.NHA&&NHA.PB&&!NHA.PB.none&&NHA.PB.lv!==C.rep.houseLv;i++)await new Promise(r=>setTimeout(r,125)); // chờ N22 dựng nhà đúng cấp (để save ghi đúng cấp nhà)
  try{X.renderInv&&X.renderInv()}catch(_){}
  let bad=verify(C.rep);if(bad.length)return fail('Kiểm tra sau khi chuyển không khớp',bad);
  globalThis.SAVE_LOADED=1;$('ovb').onclick();                           // vào game (HOME24 thấy spawned → không chọn nhà lần nữa)
  // kiểm tra lần 2 + ghi save NGAY trong cùng lượt chạy (chưa có khung hình nào chạy → chưa có thay đổi do chơi, vd. +10 xu khám phá)
  bad=verify(C.rep);if(bad.length)return fail('Kiểm tra sau khi vào game không khớp',bad);
  SAVE.hold(false);if(!SAVE.save('import',true,true)){SAVE.hold(true);return fail('Không ghi được save mới')}
  appendLog({t:ts,hash:P.hash,kind:P.kind,backups:b.keys,lost:C.rep.lost,refund:C.rep.refund,eq:C.rep.eqRefund,xu:C.rep.xu,houseLv:C.rep.houseLv});
  busy=false;ST.last={ok:true,msg:'Đã chuyển save. Đồ đặt ở bản đồ cũ nằm trong 📬 Hộp chờ nhận (mở 🎒).'+(C.rep.restore.length?' Máy lọc/rương chứa nằm trong 🧰 Gói chờ khôi phục (mở 🎒 → Đặt lại).':''),rep:C.rep};render();
  say('✅ Đã chuyển save sang bản đồ 1.250 m');}
 catch(e){fail('Lỗi khi chuyển',[String(e&&e.message||e)])}}
function appendLog(o){const a=logList();a.push(o);if(!ls.set(LOGK,JSON.stringify(a.slice(-50))))console.warn('[SB6] không ghi được nhật ký nhập')}
function ctx(){const STK=Object.assign({},X.STK);return{STK,EQ:X.EQ||{},curS:JSON.parse(JSON.stringify(S)),normD:globalThis.B28&&B28.normD}}
function preview(text){const P=parseImport(text);if(!P.ok)return{P,err:P.why};
 const dup=logList().filter(l=>l.hash===P.hash);
 if(P.kind==='test-1250')return{P,dup,info:'Save 1.250 m 1.250 m – sẽ khôi phục nguyên trạng (save 1.250 m hiện tại được sao lưu trước).'};
 const C=convert(P.save,ctx());return{P,C,dup}}

/* ---------- 5) xuất save 1.250 m ---------- */
function exportTest(){const raw=SAVE.raw;if(!raw)return say('Chưa có save 1.250 m để xuất');let d;try{d=JSON.parse(raw)}catch(_){return say('Save 1.250 m lỗi, không xuất được')}
 const out={format:'safehaven-export',v:1,kind:'test-1250',exportedAt:new Date().toISOString(),save:d},data=JSON.stringify(out),name='safehaven_1250_'+new Date().toISOString().slice(0,10)+'.json';
 // trên claude.ai: tải file qua capability downloads (có hộp xác nhận); mở file trên máy: tải trực tiếp
 const direct=()=>{const blob=new Blob([data],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)};
 const viaClaude=async()=>{const dl=await claude.use('downloads');if(!dl)return direct();try{await dl.save({filename:name,data});say('📤 Đã xuất save 1.250 m')}catch(e){const c=e&&e.code;say(c==='declined'?'Đã hủy xuất file':'Không xuất được file ('+(c||'lỗi')+') – dùng nút Sao chép')}};
 if(typeof claude!=='undefined'&&claude&&claude.use)viaClaude();else direct()}
function saveFile(name,data){const direct=()=>{const blob=new Blob([data],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)};
 const viaClaude=async()=>{let dl=null;try{dl=await claude.use('downloads')}catch(_){}if(!dl)return direct();try{await dl.save({filename:name,data});say('📤 Đã xuất '+name+' – save gốc không thay đổi')}catch(e){const c=e&&e.code;say(c==='declined'?'Đã hủy xuất file':'Không xuất được file ('+(c||'lỗi')+')')}};
 if(typeof claude!=='undefined'&&claude&&claude.use)viaClaude();else direct()}
function copyTest(){const raw=SAVE.raw;if(!raw)return say('Chưa có save 1.250 m');let d;try{d=JSON.parse(raw)}catch(_){return say('Save 1.250 m lỗi')}const txt=JSON.stringify({format:'safehaven-export',v:1,kind:'test-1250',exportedAt:new Date().toISOString(),save:d});
 (navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>say('📋 Đã sao chép save 1.250 m – dán vào ô nhập ở máy/bản khác'),()=>say('Không sao chép được'))}

/* ---------- 6) giao diện ---------- */
const NM=k=>(X.F4&&X.F4.names&&X.F4.names[k])||({wood:'Gỗ',stone:'Đá',bread:'Bánh mì',wat:'Nước đóng chai',botC:'Chai nước sạch',botD:'Chai nước bẩn',botE:'Chai rỗng',barrel:'Thùng nước',med:'Thuốc'}[k])||k;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const css=document.createElement('style');css.textContent=`#sb6b{margin:6px auto 0;display:block;padding:8px 14px;border-radius:10px;border:1px solid #6fb7c9;background:#16323c;color:#dff;font:600 13px system-ui;cursor:pointer}
#sb6p{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.6)}
#sb6p .w{width:min(560px,94vw);max-height:88vh;overflow:auto;background:#151a24;color:#eef;border:1px solid #4a6a7a;border-radius:14px;padding:14px;font:14px/1.5 system-ui}
#sb6p h3{margin:0 0 8px}#sb6p textarea{width:100%;height:70px;box-sizing:border-box;background:#0d1118;color:#cde;border:1px solid #345;border-radius:8px}
#sb6p button{padding:8px 12px;border-radius:9px;border:1px solid #4a6a7a;background:#233041;color:#eef;font-weight:700;cursor:pointer;margin:4px 4px 0 0}
#sb6p button:disabled{opacity:.45;cursor:default}#sb6p .ok{color:#8fe39a}#sb6p .er{color:#ff9a8a}#sb6p .wa{color:#ffd27a}#sb6p ul{margin:4px 0 8px 18px;padding:0}`;document.head.appendChild(css);
const pan=document.createElement('div');pan.id='sb6p';pan.innerHTML='<div class="w"></div>';document.body.appendChild(pan);
let PV=null;
const FALLBACK='Dự phòng: nếu còn file save đã xuất từ bản 2.500 m (📤 Xuất save), bấm 📥 Nhập / 📤 Xuất save rồi chọn file đó. Đừng bắt đầu chơi mới nếu bạn muốn giữ tài sản cũ.';
/* ---------- save 2.500 m cũ trên CÙNG trình duyệt (chỉ đọc, qua SH_LEGACY_READ) ---------- */
const LEGK='safehaven_save_v6';
function LEG(){try{return typeof globalThis.SH_LEGACY_READ==='function'?globalThis.SH_LEGACY_READ(LEGK):null}catch(_){return null}}
function legStatus(){try{if(typeof globalThis.SH_LEGACY_STATUS==='function')return globalThis.SH_LEGACY_STATUS(LEGK)}catch(e){return{ok:false,err:String(e)}}const raw=LEG();return{ok:true,raw}}
function legInfo(){const st=legStatus();if(!st.ok)return{raw:null,ok:false,readErr:true,why:'trình duyệt không cho đọc bộ nhớ ('+st.err+')'};const raw=st.raw;if(!raw)return null;const P=parseImport(raw);if(!P.ok)return{raw,ok:false,why:P.why};let done=null;try{const L=logList().filter(x=>x.hash===P.hash);if(L.length)done=L[L.length-1].t}catch(_){}return{raw,ok:true,P,done}}
function exportLegacy(){const raw=LEG();if(!raw)return say('Không có save 2.500 m cũ trên trình duyệt này');let d;try{d=JSON.parse(raw)}catch(_){return say('Save 2.500 m cũ bị hỏng, không xuất được')}
 const now=new Date(),two=n=>String(n).padStart(2,'0'),stamp=now.getFullYear()+'-'+two(now.getMonth()+1)+'-'+two(now.getDate())+'_'+two(now.getHours())+'-'+two(now.getMinutes())+'-'+two(now.getSeconds());
 const head=JSON.stringify({format:'safehaven-export',v:1,kind:'live-2500',exportedAt:now.toISOString(),source:'local:'+LEGK}),data=head.slice(0,-1)+',"save":'+raw+'}',name='safehaven_save_LIVE_'+stamp+'.json';
 saveFile(name,data)}
function render(){const w=pan.querySelector('.w');let h='<h3>📥 Nhập / 📤 Xuất save</h3>';
 if(ST.last){h+='<div class="'+(ST.last.ok?'ok':'er')+'"><b>'+(ST.last.ok?'✅ ':'⛔ ')+esc(ST.last.msg)+'</b></div>';if(ST.last.detail&&ST.last.detail.length)h+='<ul class="er">'+ST.last.detail.slice(0,12).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
  if(!ST.last.ok)h+='<div class="wa">Không có save mới nào được ghi. Save 1.250 m cũ và file của bạn vẫn nguyên. Tự lưu đang tạm khóa – tải lại trang để tiếp tục.</div><button id="sb6r">↻ Tải lại trang để thử lại</button>';
  if(ST.last.ok&&ST.last.rep)h+=repHtml(ST.last.rep,true);h+='<div><button id="sb6x">Đóng</button></div>';w.innerHTML=h;bind();return}
 const LI=legInfo();if(LI&&LI.readErr){h+='<div class="er" style="margin-bottom:8px">⛔ Không đọc được save 2.500 m cũ: '+esc(LI.why)+'. Save cũ không bị đụng tới.<br>'+esc(FALLBACK)+'</div>'}else if(!LI){h+='<div style="opacity:.8;margin-bottom:6px">Không thấy save 2.500 m cũ trên trình duyệt này. '+esc(FALLBACK)+'</div>'}else{h+='<div style="border:1px solid #c9a24a;background:rgba(242,169,59,.12);border-radius:10px;padding:8px;margin-bottom:8px"><b>📦 Trình duyệt này có save bản đồ 2.500 m cũ</b><br><small>Chỉ đọc – save cũ được giữ nguyên, không bị đổi tên, ghi đè hay xóa.</small>'+(LI.ok?'<div>'+(LI.done?'✅ Save cũ này đã được chuyển lúc '+esc(new Date(LI.done).toLocaleString())+'. Chuyển lại sẽ THAY save 1.250 m hiện tại (có sao lưu), không cộng dồn đồ.':'Bấm <b>🔁 Xem & chuyển save cũ</b> để xem báo cáo trước khi xác nhận.')+'</div><button id="sb6L">🔁 Xem & chuyển save cũ</button>':'<div class="er">⛔ Save cũ không đọc được: '+esc(LI.why)+'. Không chuyển gì.</div>')+'<button id="sb6X">📤 Xuất save cũ ra file</button></div>'}
 h+='<div>Hoặc chọn file save đã xuất (.json) / dán nội dung vào ô dưới. Game chỉ đọc file bạn chọn'+(LI?' và save 2.500 m cũ ở trên (chỉ đọc)':'')+'.</div>';
 h+='<input type="file" id="sb6f" accept=".json,application/json"> <div style="margin-top:6px"><textarea id="sb6t" placeholder="…hoặc dán nội dung save tại đây"></textarea></div><button id="sb6c">Kiểm tra</button>';
 if(PV){if(PV.err)h+='<div class="er">⛔ '+esc(PV.err)+'</div>';else{const P=PV.P;h+='<div>Loại: <b>'+(P.kind==='live-2500'?'Save bản đồ 2.500 m (LIVE)':'Save 1.250 m 1.250 m')+'</b> · mã '+esc(P.hash)+'</div>';
  if(PV.dup&&PV.dup.length)h+='<div class="wa">⚠ Save này đã được nhập lúc '+new Date(PV.dup[PV.dup.length-1].t).toLocaleString()+'. Nhập lại sẽ THAY save 1.250 m hiện tại (có sao lưu), không cộng dồn đồ.</div>';
  if(PV.info)h+='<div>'+esc(PV.info)+'</div>';
  if(PV.C){if(!PV.C.ok)h+='<div class="er">⛔ Không chuyển được:</div><ul class="er">'+PV.C.rep.errors.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';else h+=repHtml(PV.C.rep,false)}
  const can=PV.P&&(!PV.C||PV.C.ok);if(can){h+='<label style="display:block;margin-top:6px"><input type="checkbox" id="sb6k"> Tôi hiểu: save 1.250 m hiện tại (nếu có) sẽ được sao lưu rồi thay bằng save này. Save bản cũ không bị đụng tới.</label>';
   if(PV.C&&PV.C.rep.lost.length)h+='<label style="display:block;margin-top:4px" class="wa"><input type="checkbox" id="sb6l"> Tôi đồng ý: '+PV.C.rep.lost.length+' mục ở danh sách ⚠ bên trên KHÔNG được chuyển (vẫn nằm nguyên trong bản sao file gốc).</label>';
   h+='<button id="sb6g" disabled>🔁 Chuyển save</button>'}}}
 h+='<hr style="border-color:#2a3a48"><div>📤 Xuất save 1.250 m hiện tại ra file để giữ hoặc thử lại.</div><button id="sb6e">📤 Xuất save 1.250 m</button> <button id="sb6y">📋 Sao chép</button> <button id="sb6x">Đóng</button>';w.innerHTML=h;bind()}
function lostHtml(r){return r.lost.length?'<div class="wa" style="margin-top:6px"><b>⚠ Không chuyển được chính xác (cần bạn xác nhận)</b></div><ul class="wa">'+r.lost.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':''}
function repHtml(r,done){const it=Object.entries(r.refund).sort((a,b)=>b[1]-a[1]);let h='<div style="margin-top:6px"><b>'+(done?'Đã chuyển':'Sẽ chuyển')+'</b>: nhân vật, túi đồ, trang bị + độ bền, '+r.xu.total+' xu'+(r.xu.refund?' (gồm '+r.xu.refund+' xu hoàn trả)':'')+', '+r.lives+' mạng, nhà cấp '+r.houseLv+', công thức đã mở, Ngày '+(Math.floor(r.GT/24)+1)+', thành tích/tài khoản.</div>';
 h+='<div><b>📬 Hoàn về Hộp chờ nhận</b>'+(it.length?'':' : không có')+'</div>'+(it.length?'<ul>'+it.map(([k,n])=>'<li>'+esc(NM(k))+' ×'+n+'</li>').join('')+(r.eqRefund.length?'<li>Trang bị trong rương chứa → ba lô: '+esc(r.eqRefund.join(', '))+'</li>':'')+'</ul>':'');
 if(r.restore&&r.restore.length)h+='<div><b>🧰 Gói chờ khôi phục</b> (giữ nguyên cấp, đặt lại từ 🎒 Túi đồ):</div><ul>'+r.restore.map(x=>'<li>'+esc(rsTxt(x))+'</li>').join('')+'</ul>';
 if(r.notes.length)h+='<div>'+r.notes.map(esc).join('<br>')+'</div>';h+=lostHtml(r);h+='<div style="opacity:.8"><b>Không chuyển</b>:<ul>'+r.dropped.slice(0,8).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div>';return h}
function bind(){const q=s=>pan.querySelector(s);
 q('#sb6x')&&(q('#sb6x').onclick=()=>{pan.style.display='none';if(ST.last&&ST.last.ok)ST.last=null});
 q('#sb6r')&&(q('#sb6r').onclick=()=>location.reload());
 q('#sb6e')&&(q('#sb6e').onclick=exportTest);q('#sb6y')&&(q('#sb6y').onclick=copyTest);
 const chk=t=>{PV=preview(t);render()};
 q('#sb6f')&&(q('#sb6f').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;if(f.size>MAXB){PV={err:'File quá lớn'};return render()}const rd=new FileReader();rd.onload=()=>chk(String(rd.result||''));rd.onerror=()=>{PV={err:'Không đọc được file'};render()};rd.readAsText(f)});
 q('#sb6c')&&(q('#sb6c').onclick=()=>chk(q('#sb6t').value));
 q('#sb6L')&&(q('#sb6L').onclick=()=>{const r=LEG();if(r)chk(r)});q('#sb6X')&&(q('#sb6X').onclick=exportLegacy);
 const okBtn=()=>{const a=q('#sb6k'),l=q('#sb6l');q('#sb6g').disabled=!(a&&a.checked&&(!l||l.checked))};
 q('#sb6k')&&(q('#sb6k').onchange=okBtn);q('#sb6l')&&(q('#sb6l').onchange=okBtn);
 q('#sb6g')&&(q('#sb6g').onclick=()=>{if(!PV||!PV.P||!q('#sb6k').checked||(q('#sb6l')&&!q('#sb6l').checked))return;q('#sb6g').disabled=true;q('#sb6g').textContent='Đang chuyển…';runImport(PV.P,PV.C?PV.C.rep.lost.length:0)})}
function mount(){if(!ENABLED)return;if($('sb6b'))return;const ob=$('ovb');if(!ob)return;const b=document.createElement('button');b.id='sb6b';b.textContent='📥 Nhập / 📤 Xuất save';b.onclick=e=>{e.preventDefault();PV=null;if(!busy&&ST.last&&ST.last.ok)ST.last=null;render();pan.style.display='flex'};ob.parentNode.appendChild(b)}
/* ---------- chuyển nhanh: tự hiện khi có save 2.500 m cũ và CHƯA có save 1.250 m ---------- */
const qp=document.createElement('div');qp.id='sb6Q';qp.style.cssText='position:fixed;inset:0;z-index:10001;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);padding:10px';qp.innerHTML='<div class="w" style="background:#151c26;color:#e8eef5;border:1px solid #c9a24a;border-radius:14px;max-width:560px;width:100%;max-height:92vh;overflow:auto;padding:14px;font:13px/1.45 system-ui"></div>';document.body.appendChild(qp);
let quickShown=false,QPV=null;
function quickRender(LI){const w=qp.querySelector('.w');let h='<h3 style="margin:0 0 6px">📦 Tìm thấy save bản đồ 2.500 m của bạn</h3>';
 if(!LI.ok){h+='<div class="er" style="color:#ff9a8a">⛔ Không chuyển được: '+esc(LI.why)+'. Save cũ không bị đụng tới, không có gì được ghi.</div><div style="margin-top:6px">'+esc(FALLBACK)+'</div><div style="margin-top:8px"><button id="sb6Qc">Đóng</button></div>';w.innerHTML=h;bindQ();return}
 QPV=preview(LI.raw);
 if(QPV.err||!QPV.C||!QPV.C.ok){const errs=QPV.err?[QPV.err]:(QPV.C?QPV.C.rep.errors:['không rõ']);h+='<div style="color:#ff9a8a">⛔ Save cũ chưa chuyển tự động được:</div><ul style="color:#ff9a8a">'+errs.slice(0,8).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><div>Save cũ không bị đụng tới, không có gì được ghi. '+esc(FALLBACK)+'</div><div style="margin-top:8px"><button id="sb6QX">📤 Xuất save cũ ra file</button> <button id="sb6Qc">Đóng</button></div>';w.innerHTML=h;bindQ();return}
 const lost=QPV.C.rep.lost.length;
 h+='<div>Game đã đọc save cũ (chỉ đọc) và chuẩn bị bản chuyển sang bản đồ 1.250 m. <b>Save cũ được giữ nguyên.</b></div>'+repHtml(QPV.C.rep,false);
 h+='<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px"><button id="sb6Qg" style="padding:10px 14px;border-radius:10px;border:0;background:#f2a93b;color:#1a1204;font-weight:800;font-size:14px;min-height:44px">🔁 '+(lost?'Đồng ý các mục ⚠ và chuyển save':'Chuyển save')+' → vào game</button><button id="sb6QX">📤 Xuất save cũ (dự phòng)</button><button id="sb6Qc">Để sau</button></div><div style="opacity:.75;margin-top:4px">Bấm một lần. Game sao lưu, chuyển, kiểm tra lại từng món rồi mới ghi save 1.250 m.</div>';
 w.innerHTML=h;bindQ()}
function bindQ(){const q=s=>qp.querySelector(s);q('#sb6Qc')&&(q('#sb6Qc').onclick=()=>{qp.style.display='none'});q('#sb6QX')&&(q('#sb6QX').onclick=exportLegacy);
 q('#sb6Qg')&&(q('#sb6Qg').onclick=()=>{if(!QPV||!QPV.P||!QPV.C||!QPV.C.ok||busy)return;q('#sb6Qg').disabled=true;q('#sb6Qg').textContent='Đang chuyển…';qp.style.display='none';PV=QPV;render();pan.style.display='flex';runImport(QPV.P,QPV.C.rep.lost.length)})}
function quickOpen(){const LI=legInfo();if(!LI)return false;quickRender(LI);qp.style.display='flex';return true}
function quickAuto(){if(quickShown||!globalThis.Z21_READY||S.on||S.dead||busy||ST.last)return;quickShown=true;if(SAVE.raw)return;const LI=legInfo();if(!LI||LI.done)return;quickOpen()}
let legHint=null;function hint(){const b=$('sb6b');if(!b)return;if(!legHint){legHint=document.createElement('div');legHint.id='sb6H';legHint.style.cssText='margin:6px auto 0;max-width:340px;font-size:12px;line-height:1.4;padding:6px 8px;border-radius:9px;border:1px solid #c9a24a;background:rgba(242,169,59,.12)';b.parentNode.insertBefore(legHint,b.nextSibling)}
 const LI=(S.on||S.dead)?null:legInfo();if(!LI){legHint.style.display='none';return}legHint.style.display='';legHint.innerHTML=!LI.ok?'📦 Không đọc được save 2.500 m cũ ('+esc(LI.why)+'). Save cũ vẫn được giữ nguyên. '+esc(FALLBACK):LI.done?'✅ Save 2.500 m cũ đã chuyển sang bản đồ mới. Save cũ vẫn được giữ nguyên.':(SAVE.raw?'📦 Còn save 2.500 m chưa chuyển. Bạn đang có save 1.250 m nên game không tự chuyển đè. Muốn chuyển: 📥 Nhập / 📤 Xuất save → 🔁 Xem & chuyển save cũ (save 1.250 m hiện tại được sao lưu).':'📦 Phát hiện save bản đồ 2.500 m cũ. <button id="sb6Hq" style="margin-left:4px">🔁 Xem & chuyển</button> Save cũ được giữ nguyên.');const hq=$('sb6Hq');if(hq)hq.onclick=e=>{e.preventDefault();quickOpen()}}
let hintAt=0;setInterval(()=>{const b=$('sb6b');if(!b)return mount();b.style.display=(S.on||S.dead)?'none':'';const t=Date.now();if(S.on){if(legHint)legHint.style.display='none';return}if(t-hintAt>3000){hintAt=t;hint()}quickAuto()},500);mount();
/* ---------- 7) 🧰 gói chờ khôi phục thiết bị đã nâng cấp (S.rs6) ---------- */
function rsTxt(r){const d=r.d||{};if(r.t==='filter'){const a=[];if(d.q)a.push(d.q+' nước chưa lọc');if(d.out)a.push(d.out+' chai sạch');if(d.be)a.push(d.be+' chai rỗng hứng');if(d.bar)a.push('thùng hứng ('+(d.bu|0)+' nước sạch)');return 'Máy lọc nước cấp '+r.lv+(a.length?' – trong máy: '+a.join(', '):' – trống')}
 const it=Object.entries(d.it||{}).map(([k,n])=>NM(k)+' ×'+n),eq=(d.eq||[]).length;return 'Rương chứa đồ cấp '+r.lv+((it.length||eq)?' – bên trong: '+it.concat(eq?[eq+' trang bị']:[]).join(', '):' – trống')}
const RS={list:()=>Array.isArray(S.rs6)?S.rs6:[],
 place(i){const r=RS.list()[i];if(!r)return false;const B=globalThis.B28;if(!B||!B.startPlace)return say('Thiếu chức năng đặt thiết bị'),false;
  try{const inv=$('inv');if(inv&&inv.style.display==='flex'&&globalThis.togInv)togInv()}catch(_){}B.startPlace(r.t,null,r);return !!(B.PL&&B.PL.r===r)},
 html(){const L=RS.list();if(!L.length)return'';return '<div style="font-size:12px;background:rgba(120,200,255,.12);border:1px solid #6fb7c9;border-radius:8px;padding:5px 8px;margin:4px 0">🧰 <b>Gói chờ khôi phục</b> (thiết bị chuyển từ save cũ, giữ nguyên cấp):'+L.map((r,i)=>'<div style="margin-top:3px">'+esc(rsTxt(r))+' <button onclick="SB6R.place('+i+')" style="margin-left:6px">🔨 Đặt lại</button></div>').join('')+'<div style="opacity:.8">Cần đứng trong khu nhà an toàn của bạn. Hủy đặt thì thiết bị vẫn nằm trong gói.</div></div>'}};
{const F4=X&&X.F4||SH.F4;if(F4&&typeof F4.invHtml==='function'){const o=F4.invHtml;F4.invHtml=function(){let a='';try{a=o.apply(this,arguments)}catch(e){throw e}let b='';try{b=RS.html()}catch(_){}return a+b}}else console.warn('[SB6] không gắn được 🧰 vào túi đồ')}
globalThis.SB6R=RS;
globalThis.SB6={LEG,legInfo,legStatus,exportLegacy,quickOpen,parseImport,convert,verify,preview,runImport,exportTest,copyTest,ctx,logList,get state(){return ST},ENABLED};
console.info('[SB6] nhập/xuất save sẵn sàng');
})();
