/* =====================================================================
   LẦN 24 — NHÀ AN TOÀN NGẪU NHIÊN KHI TẠO NHÂN VẬT (bản TEST)
   - 16 nhà an toàn: Nhà Gỗ + 10 nhà mới (TP1–5, R1–R5) + 5 nhà bot. Mỗi người chỉ 1 nhà.
   - Tạo nhân vật mới: chọn ngẫu nhiên 1 nhà CHƯA CÓ CHỦ (không phải nhà bot, không phải nhà
     của người chơi khác), dời "Nhà mẫu" (tường rỗng, cửa, giường, bàn chế tạo, bếp, màn chắn)
     tới đó, cho nhân vật xuất hiện trên sàn trong nhà, gán chủ và lưu.
   - Tải save: KHÔNG chọn lại — giữ đúng nhà/vị trí trong save (save cũ = Nhà Gỗ).
   - Nhà người khác: biết qua (1) kho dữ liệu chung db (khi trang được cấp và người chơi có
     quyền ghi), (2) kênh online (người đang online phát mã nhà). Không có → chỉ biết trên máy này.
   - Hết nhà trống: xuất hiện ở Quảng trường, không chiếm nhà ai.
   ===================================================================== */
(function(){
const SH=globalThis.SH,NHA=globalThis.NHA,CO=globalThis.CO;
if(!SH||!NHA||!CO){console.warn('[HOME24] thiếu SH/NHA/CO');return}
const X=SH.X,S=SH.S,pos=SH.pos,say=m=>{try{SH.say(m)}catch(_){}},$=id=>document.getElementById(id);
const XS=()=>globalThis.XD15S,ME='player',FAR={x:4200,y:4200},PLAZA=[-52,-116];
const H={spawned:false,claims:new Map(),db:null,uid:null,dbState:'chưa thử',last:null,log:[]};
const rec=id=>NHA.EXTRA.find(b=>b.id===id)||null;
const lg=m=>{H.log.push(m);if(H.log.length>40)H.log.shift()};

/* ---------- dời Nhà mẫu (tường, cửa, giường, bàn chế tạo, bếp, màn chắn) ---------- */
function cabMove(nx,ny){const dx=nx-CO.x,dy=ny-CO.y;if(Math.abs(dx)<1e-9&&Math.abs(dy)<1e-9)return;const c=SH.cab,R=[c.x0,c.y0,c.x1,c.y1];
 for(const p of SH.props){if(p[0]>=R[0]-.01&&p[2]<=R[2]+.01&&p[1]>=R[1]-.01&&p[3]<=R[3]+.01){const col=SH.cols.find(q=>q.x0===p[0]&&q.x1===p[2]&&q.z0===p[1]&&q.z1===p[3]);p[0]+=dx;p[2]+=dx;p[1]+=dy;p[3]+=dy;if(col){col.x0=p[0];col.x1=p[2];col.z0=p[1];col.z1=p[3]}}}
 CO.x=nx;CO.y=ny;const U=SH.V25&&SH.V25.CABU;if(U){U.x+=dx;U.y+=dy}
 try{SH.colsDirty()}catch(_){}try{SH.V25.cabSync&&SH.V25.cabSync()}catch(_){}}
function place(site,cx,cy,none){const yw=globalThis.CITY4_DATA?.sites[site]?.yard||26;cabMove(cx,cy);CO.site=site;CO.none=!!none;NHA.PB.none=!!none;NHA.relocP(cx,cy,site,yw)}
/* gọi từ XD15.ensure cho từng nhà an toàn */
function fix(B){if(!CO.none&&B.id===CO.site){B.st='home';B.owner=ME;return}
 if(B.st==='home'){B.st='built';if(B.owner===ME)B.owner=''}
 const c=H.claims.get(B.id);if(c&&B.owner!==ME)B.owner='other';else if(!c&&B.owner==='other')B.owner=''}
function ensure(){try{globalThis.XD15&&XD15.ensure()}catch(e){}}
/* gọi từ N22 khi tải save: đặt Nhà mẫu đúng chỗ trong save, không chọn lại */
function restore(site,cx,cy,none){{const XD=XS();const q=XD&&XD.SAFE.find(r=>r[0]===site);if(q&&!none){cx=q[2];cy=q[3]}}if(none)place('',FAR.x,FAR.y,true);else place(site,cx,cy,false);H.spawned=true;lg('tải save: '+(none?'không nhà':site));if(!none)setTimeout(()=>clearHome().catch(()=>{}),50)}

/* ---------- ai đang giữ nhà nào ---------- */
function peersHomes(){const m=new Map();const O=SH.OTH||{};for(const k in O){const o=O[k],hm=o&&o.hm;if(typeof hm==='string'&&hm)m.set(hm,{src:'online',who:k})}return m}
function refresh(){const m=peersHomes();if(H.dbClaims)for(const[k,v]of H.dbClaims)if(!m.has(k))m.set(k,v);H.claims=m;ensure()}
setInterval(()=>{try{refresh()}catch(e){}},1500);
function candidates(){const XD=XS();if(!XD)return[];const out=[];for(const[id]of XD.SAFE){const B=rec(id);if(!B||B.st==='site')continue;if(H.claims.has(id))continue;if(B.owner&&B.owner!==ME)continue;out.push(id)}return out}

/* ---------- kho dữ liệu chung (db): mỗi nhà 1 tài liệu homes/<mã nhà> = {owner, at} ---------- */
const to=ms=>new Promise(r=>setTimeout(()=>r(null),ms));
H.ready=(async()=>{try{if(typeof claude==='undefined'||!claude||!claude.use){H.dbState='không có claude.use (trang chạy ngoài claude.ai)';return}
 const user=await Promise.race([claude.use('user'),to(10000)]),db=await Promise.race([claude.use('db'),to(10000)]);
 if(!db){H.dbState='trang chưa được cấp kho dữ liệu chung';return}if(!user){H.dbState='không đọc được người dùng';return}
 let can=null;try{can=await user.can('data.write')}catch(_){}if(can===false){H.dbState='người chơi không có quyền ghi (chỉ xem)';return}
 let uid=null;try{uid=await user.id()}catch(_){}if(!uid){H.dbState='chưa đăng nhập';return}
 H.db=db;H.uid=uid;H.dbState='đã kết nối';
 db.collection('homes').onSnapshot(q=>{const m=new Map();for(const d of q.docs){const v=d.data()||{};if(v.owner&&v.owner!==uid)m.set(d.id,{src:'db',who:v.owner,at:v.at||0})}H.dbClaims=m;refresh()},e=>{H.dbState='lỗi đọc: '+(e&&e.code)})}
 catch(e){H.dbState='lỗi: '+(e&&e.message||e)}})();
async function claimDb(id){const db=H.db;if(!db)return true;const ref=db.doc('homes/'+id);
 try{const a=await ref.acquire({holder:H.uid,ttlMs:5000});if(!a||!a.acquired)return false;
  const s=await ref.get(),v=s.exists?s.data():null;if(v&&v.owner&&v.owner!==H.uid)return false;
  await ref.set({owner:H.uid,at:Date.now()});return true}catch(e){lg('db lỗi '+(e&&e.code));return e&&e.code==='invalid_argument'?true:false}}
async function releaseDb(){const db=H.db;if(!db)return;try{const q=await db.collection('homes').where('owner','==',H.uid).get();for(const d of q.docs)await db.doc('homes/'+d.id).delete()}catch(_){}}

/* ---------- xuất hiện trong nhà ---------- */
function spawnInside(){const C=[[.3,1.7],[-1,1.6],[1.2,1.6],[0,.6],[-.8,.4],[1.5,.2],[0,-.4]];
 for(const[dx,dy]of C){const x=CO.x+dx,y=CO.y+dy;if(!X.hitC(x,y,.36)){pos.x=x;pos.y=y;return true}}pos.x=CO.x;pos.y=CO.y+1;return false}
function spawnPublic(){for(let r=0;r<20;r+=.5)for(let a=0;a<6.28;a+=.35){const x=PLAZA[0]+Math.cos(a)*r,y=PLAZA[1]+Math.sin(a)*r;if(!X.hitC(x,y,.5)){pos.x=x;pos.y=y;return}}pos.x=PLAZA[0];pos.y=PLAZA[1]}

async function clearHome(){/* chờ khu nhà tải xong, dọn cây còn sống dưới móng + lối vào (cây chuyển sang đã chặt, không mất ID) */
 const Hr=()=>{const r=NHA.houseRect(NHA.PB,5);return[r[0]-.4,r[1]-.4,r[2]+.4,r[3]+2.8]};/* giữ chỗ tới cấp 5 để nâng cấp được */let n=0;
 for(let i=0;i<24;i++){try{globalThis.XD15&&XD15.net()}catch(_){}const R=Hr();let live=0;
  for(const t of SH.trees){if(!(t.hp>0)||!t.c)continue;const h=.4*(t.s||1);if(t.x+h>R[0]&&t.x-h<R[2]&&t.y+h>R[1]&&t.y-h<R[3]){t.hp=0;t.c.on=false;t.t0=SH.GT;if(!SH.felled.includes(t))SH.felled.push(t);if(t.id&&X.WORLD)try{X.WORLD.emit('tree.fell',{id:t.id,by:'home24'})}catch(_){}live++;n++}}
  if(live)try{SH.colsDirty();SH.V25&&SH.V25.treesDirty&&SH.V25.treesDirty()}catch(_){}
  if(i>=4&&!live)break;await to(250)}return n}
async function newGame(){
 for(const B of NHA.EXTRA)if(B.owner===ME){B.owner='';if(B.st==='home')B.st='built'}  // nhân vật mới: bỏ quyền của nhân vật cũ
 if(typeof claude!=='undefined'&&claude&&claude.use){await Promise.race([H.ready,to(4000)]);await to(1200)}  // chờ kênh online/kho chung báo nhà đã có chủ
 refresh();if(H.db)await releaseDb();
 const ids=candidates();for(let i=ids.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[ids[i],ids[j]]=[ids[j],ids[i]]}
 for(const id of ids){if(!(await claimDb(id)))continue;refresh();if(H.claims.has(id))continue;const B=rec(id);if(!B)continue;
  place(id,B.cx,B.cy,false);ensure();pos.x=B.cx;pos.y=B.cy+1;await clearHome();spawnInside();H.last={site:id,name:B.name,at:[+pos.x.toFixed(2),+pos.y.toFixed(2)]};lg('nhân vật mới → '+id);
  setTimeout(()=>say('🏠 Bạn xuất hiện trong '+B.name+' – nhà an toàn của bạn'),900);try{globalThis.saveNow&&saveNow()}catch(_){}return H.last}
 place('',FAR.x,FAR.y,true);ensure();spawnPublic();H.last={site:null,at:[pos.x,pos.y]};lg('hết nhà trống → Quảng trường');
 setTimeout(()=>say('⚠ Tất cả nhà an toàn đều đã có chủ – bạn xuất hiện ở Quảng trường'),900);try{globalThis.saveNow&&saveNow()}catch(_){}return H.last}

/* ---------- móc nút Bắt đầu: chỉ chọn nhà khi TẠO NHÂN VẬT MỚI ---------- */
const ovb=$('ovb'),o0=ovb&&ovb.onclick;
if(ovb&&o0)ovb.onclick=function(){if(S.dead||S.on||H.spawned||globalThis.SAVE_LOADED)return o0.apply(this,arguments);
 H.spawned=true;ovb.disabled=true;const t0=ovb.textContent;ovb.textContent='🏠 Đang chọn nhà an toàn…';
 newGame().catch(e=>{console.warn('[HOME24]',e);place('na_tp1',CITY4_DATA.sites.na_tp1.at[0],CITY4_DATA.sites.na_tp1.at[1],false);ensure();spawnInside()}).finally(()=>{ovb.disabled=false;ovb.textContent=t0;o0.call(ovb)})};

globalThis.HOME24={H,fix,restore,newGame,place,candidates,refresh,spawnInside,get site(){return CO.none?null:CO.site}};
console.info('[HOME24] nhà an toàn ngẫu nhiên khi tạo nhân vật sẵn sàng');
})();

/* ===== LẦN 25: CHUYỂN SAVE CŨ THEO QUY HOẠCH V6 =====
   TP1, TP2 và nhà bot An/Bình/Châu/Giang được dời. Mọi thứ đã lưu nằm trong sân cũ của các nhà đó
   (người chơi, vật phẩm rơi, thùng nước, công trình đã xây, nhà & bot) được dời theo đúng độ lệch.
   Chạy 1 lần cho save chưa có dấu world.ext.mv25; save mới có dấu nên không chạy lại. */
(function(){
const MOVES=[[-114,-888,-129.1,-714.3,17],[288,-510,222.8,-469.7,17],[-484,107,-377.3,-38.3,15],[320,-169.6,5,-151,15],[-397,-790,-315.5,-644.7,15],[181,-874,79.9,-658.9,15]];
function mv(x,y){if(typeof x!=='number'||typeof y!=='number')return null;for(const[ox,oy,nx,ny,r]of MOVES)if(Math.abs(x-ox)<=r&&Math.abs(y-oy)<=r)return[x+nx-ox,y+ny-oy];return null}
function MV25(d){try{if(!d||!d.world)return d;const W=d.world,E=W.ext||(W.ext={});if(E.mv25)return d;const rep={n:0};const f=(o,kx='x',ky='y')=>{if(!o)return;const r=mv(o[kx],o[ky]);if(r){o[kx]=r[0];o[ky]=r[1];rep.n++}};
 if(d.player&&d.player.pos)f(d.player.pos);
 for(const it of(W.items||[]))if(Array.isArray(it)){const r=mv(it[1],it[2]);if(r){it[1]=r[0];it[2]=r[1];rep.n++}}else f(it);
 for(const e of(W.ens||[]))if(Array.isArray(e)){const r=mv(e[1],e[2]);if(r){e[1]=r[0];e[2]=r[1];rep.n++}}else{f(e);f(e,'wx','wy')}
 if(E.f5&&Array.isArray(E.f5.bar))for(const b of E.f5.bar)f(b);
 if(E.xd15&&Array.isArray(E.xd15.list))for(const q of E.xd15.list){const r=mv(q[2],q[3]);if(r){q[2]=r[0];q[3]=r[1];rep.n++}}
 if(E.b16){for(const h of(E.b16.houses||[])){const r=mv(h.x,h.y-1.6);if(r){h.x=r[0];h.y=r[1]+1.6;rep.n++}}for(const b of(E.b16.bots||[]))f(b)}
 if(E.n22){for(const b of(E.n22.bases||[]))f(b,'cx','cy');for(const b of(E.n22.extra||[]))f(b,'cx','cy')}
 E.mv25={__v:1,v:1,n:rep.n};globalThis.MV25_REP=rep}catch(e){console.warn('[MV25]',e)}return d}
globalThis.MV25=MV25;globalThis.MV25_MOVES=MOVES;
if(globalThis.SH&&SH.SAVE)SH.SAVE.register({id:'mv25',scope:'world',version:1,defaults:()=>({v:1}),get(){return{v:1}},set(){}});
})();

/* LẦN 25: an toàn sau khi tải – không kẹt trong vật cản; ra khỏi nhà đã ẩn (Làng cũ) thì về đường gần nhất */
setInterval(()=>{try{const S=SH.S,p=SH.pos;if(!S.on||S.dead)return;if(p.y<-30000){const L=(globalThis.CITY17||{}).langR||[-32,-342,29,-294];p.x=(L[0]+L[2])/2;p.y=L[3]+4;SH.say&&SH.say('Toà nhà cũ đã bị dỡ – bạn ra đường gần nhất')}}catch(e){}},1000);
