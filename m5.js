/* =====================================================================
   SAFE HAVEN V2 – MỤC 5: CHUYỂN BẢN LƯU v4 → v5 (bản thử)
   - Chạy khi người chơi bấm "Tiếp tục" (SAVE.apply), lúc thế giới v2 đã dựng xong (z21 đã dời cụm).
   - Đầu vào: bản lưu đã qua MIG[4] (đánh dấu m5.pending, toạ độ còn là toạ độ v4). Làm trên BẢN SAO; lỗi → từ chối, giữ nguyên.
   - Đã chuyển (m5.done) → trả nguyên vẹn (không dời lần hai).
   - Quy tắc toạ độ v4 (x,y):
       x > 300                         → nội thất: +INT_DX (cùng phòng, cùng lối ra)
       |(x, y-3)| < 22                 → căn cứ Nhà Gỗ: giữ nguyên
       trong bản đồ chính cũ (MB)      → cụm theo Z21.zoneOf (cùng luật mục 1): + phép dời của cụm
       ngoài MB (thế giới 5 km cũ)     → không có vật tương ứng: người → cửa Nhà Gỗ; vật → lưu trữ
   - Phần không ánh xạ được KHÔNG bị xóa: lưu trong world.ext.m5arch (được giữ qua các lần lưu sau).
   ===================================================================== */
(()=>{const SH=globalThis.SH,Z21=globalThis.Z21,W15=globalThis.W15;if(!SH||!Z21||!W15){console.warn('[M5] thiếu SH/Z21/W15');return}
const DX=globalThis.INT_DX||5600,IX=globalThis.INT_X0||5000,MB=[-308,-187,196,187],OLD_INT=300;
const isNum=v=>typeof v=='number'&&isFinite(v),r2=v=>Math.round(v*100)/100,clone=o=>JSON.parse(JSON.stringify(o));
function cls(x,y){if(!isNum(x)||!isNum(y))return{k:'bad'};if(x>OLD_INT)return{k:'int',t:[DX,0]};
 if(x<MB[0]||x>MB[2]||y<MB[1]||y>MB[3])return{k:'w5'};const z=Z21.zoneOf(x,y);if(!z)return{k:'base',t:[0,0]};const t=Z21.TT(z);return t?{k:'cl',t,z}:{k:'base',t:[0,0]}}
const mv=(x,y)=>{const c=cls(x,y);return c.t?{c,x:r2(x+c.t[0]),y:r2(y+c.t[1])}:{c}};
/* chỗ đứng hợp lệ: trong khung thế giới, không khu khóa/vùng đệm, không nước, không vật cản; nội thất: trong một phòng */
function roomAt(x,y){return SH.blds.find(b=>b.x0>=IX&&x>b.x0&&x<b.x1&&y>b.y0&&y<b.y1)||null}
function safeAt(x,y){if(!isNum(x)||!isNum(y))return false;if(x>IX)return!!roomAt(x,y)&&!SH.X.hitC(x,y,.45);const W=SH.WB;if(x<W.x0+2||x>W.x1-2||y<W.y0+2||y>W.y1-2)return false;
 if(W15.inLocked(x,y))return false;if(W15.water(x,y).d>0)return false;if(SH.inLk&&SH.inLk(x,y,0))return false;if(SH.X.hitC(x,y,.5))return false;return true}
function near(x,y,R){if(safeAt(x,y))return[x,y];for(let r=.5;r<=R;r+=.5)for(let a=0;a<6.283;a+=.35/Math.max(1,r/2)){const qx=x+Math.cos(a)*r,qy=y+Math.sin(a)*r;if(safeAt(qx,qy))return[r2(qx),r2(qy)]}return null}
const BASE=()=>{const b=(SH.F5&&SH.F5.BASE)||{x:0,y:5.5};return near(b.x,b.y,6)||[b.x,b.y]};
/* chỗ đặt thùng trong sân căn cứ (luật đặt thùng: ≤16 m quanh nhà gỗ, không vướng, cách thùng khác ≥1,2 m) */
function yardSlot(taken){for(let r=3;r<=15;r+=.9)for(let a=Math.PI/2,k=0;k<64;k++,a+=.39){const x=r2(Math.cos(a)*r),y=r2(5.5+Math.sin(a)*r*.7);if(Math.hypot(x,y)>16)continue;
  if(SH.X.hitC(x,y,.6)||W15.water(x,y).d>0||W15.inLocked(x,y))continue;if(taken.some(t=>Math.hypot(t[0]-x,t[1]-y)<1.3))continue;return[x,y]}return null}

function run(d0){
 if(!d0||typeof d0!='object')return{ok:false,why:'bản lưu không phải đối tượng'};
 if(d0.m5&&d0.m5.done)return{ok:true,d:d0,rep:(d0.m5&&d0.m5.rep)||{},noop:true};          // đã chuyển → không làm lại
 if(!(d0.m5&&d0.m5.pending))return{ok:false,why:'không phải bản lưu v4 chờ chuyển'};
 let d;try{d=clone(d0)}catch(e){return{ok:false,why:'không sao chép được bản lưu'}}
 const P=d.player,Wd=d.world;if(!P||typeof P!='object'||!P.pos||!P.S||typeof P.S!='object')return{ok:false,why:'thiếu dữ liệu nhân vật'};
 if(!Wd||typeof Wd!='object')return{ok:false,why:'thiếu dữ liệu thế giới'};
 const X=Wd.ext=Wd.ext&&typeof Wd.ext=='object'?Wd.ext:{};const A=X.m5arch&&typeof X.m5arch=='object'?X.m5arch:{};
 const rep={người:null,vậtPhẩm:{dời:0,giữ:0,nộiThất:0,khôngÁnhXạ:0},quái:{dời:0,giữ:0,nộiThất:0,khôngÁnhXạ:0},quáiChết:{dời:0,khôngÁnhXạ:0},
  cây:{giữ:0,lưuTrữ:0},mỏ:{đổi:0,lưuTrữ:0,trùng:0},nhàBot:[],bot:[],thùng:[],phóBản:'không có',w15:'không có',cảnhBáo:[]};
 try{
  // ---- 1) nhân vật ----
  {const x=P.pos.x,y=P.pos.y,c=cls(x,y);let to=null,why='';
   if(c.k==='w5'){to=BASE();why='thế giới 5 km cũ → cửa Nhà Gỗ'}
   else if(c.k==='bad'){to=BASE();why='toạ độ lỗi → cửa Nhà Gỗ';rep.cảnhBáo.push('vị trí nhân vật không hợp lệ')}
   else{const q=[r2(x+c.t[0]),r2(y+c.t[1])];if(safeAt(q[0],q[1])){to=q;why=c.k==='int'?'nội thất: cùng phòng':c.k==='cl'?'theo cụm '+c.z:'căn cứ'}
    else{const n=c.k==='int'?near(q[0],q[1],3):near(q[0],q[1],12);if(n){to=n;why=(c.k==='cl'?'theo cụm '+c.z:c.k)+' → chỗ trống gần nhất'}else{to=BASE();why=(c.k==='cl'?'cụm '+c.z:c.k)+': chỗ đến không hợp lệ (nước/vật cản/khu khóa) → cửa Nhà Gỗ'}}}
   if(!A.pos0)A.pos0=[x,y];P.pos={x:to[0],y:to[1]};rep.người={từ:[x,y],loại:c.k,tới:to,lýDo:why}}
  // ---- 2) vật phẩm, quái, quái chờ hồi sinh ----
  for(const a of Array.isArray(Wd.items)?Wd.items:[]){if(!Array.isArray(a))continue;const m=mv(a[1],a[2]);if(m.x!==undefined){a[1]=m.x;a[2]=m.y;rep.vậtPhẩm[m.c.k==='int'?'nộiThất':m.c.k==='base'?'giữ':'dời']++}else{const it=SH.WORLD.byId.i.get(a[0]);if(it){a[1]=r2(it.x);a[2]=r2(it.y)}else{a[1]=undefined;a[2]=undefined}rep.vậtPhẩm.khôngÁnhXạ++}}// không ánh xạ: về chỗ mặc định của v5, GIỮ trạng thái nhặt/hồi
  for(const a of Array.isArray(Wd.ens)?Wd.ens:[]){if(!Array.isArray(a))continue;const m=mv(a[1],a[2]);if(m.x!==undefined){a[1]=m.x;a[2]=m.y;rep.quái[m.c.k==='int'?'nộiThất':m.c.k==='base'?'giữ':'dời']++}else{a[1]=undefined;a[2]=undefined;rep.quái.khôngÁnhXạ++}}
  for(const a of Array.isArray(Wd.dead)?Wd.dead:[]){if(!Array.isArray(a)||!Array.isArray(a[3]))continue;const r=a[3],m=mv((r[0]+r[2])/2,(r[1]+r[3])/2);
   if(m.c.t){a[3]=[r2(r[0]+m.c.t[0]),r2(r[1]+m.c.t[1]),r2(r[2]+m.c.t[0]),r2(r[3]+m.c.t[1])];rep.quáiChết.dời++}else{(A.dead=A.dead||[]).push(clone(a));a[3]=null;rep.quáiChết.khôngÁnhXạ++}}
  if(Array.isArray(Wd.dead))Wd.dead=Wd.dead.filter(a=>!Array.isArray(a)||a[3]!==null);
  // ---- 3) cây đã chặt: ID cây bản đồ chính v5 = ID v4 (giữ theo toạ độ cũ) → chỉ giữ khi đúng cây đó tồn tại.
  //      Cây thế giới 5 km cũ ('w15_cI_J_tN') TRÙNG DẠNG ID với ô mới nhưng là cây KHÁC → luôn lưu trữ, không áp ----
  if(Array.isArray(Wd.felled)){const keep=[];for(const a of Wd.felled){if(Array.isArray(a)&&typeof a[0]=='string'&&!a[0].startsWith('w15')&&SH.WORLD.byId.t.has(a[0])&&isNum(a[1])){keep.push(a);rep.cây.giữ++}else{(A.felled=A.felled||[]).push(clone(a));rep.cây.lưuTrữ++}}Wd.felled=keep}
  // ---- 4) khóa mỏ đá (MINE): 'r'+x.toFixed(1)+y.toFixed(1) / 'm'+x.toFixed(1) theo toạ độ cũ → khóa theo toạ độ mới ----
  if(X.v25&&Array.isArray(X.v25.mine)){const{M}=Z21.mineMap(),out=new Map();for(const e of X.v25.mine){if(!Array.isArray(e))continue;const nk=M.get(e[0]);
    if(!nk){(A.mine=A.mine||[]).push(clone(e));rep.mỏ.lưuTrữ++;continue}if(out.has(nk)){(A.mine=A.mine||[]).push(clone(e));rep.mỏ.trùng++;continue}out.set(nk,e[1]);if(nk!==e[0])rep.mỏ.đổi++}
   X.v25.mine=[...out.entries()]}
  // ---- 5) thùng nước: trong sân căn cứ giữ nguyên; ở nơi khác → sân căn cứ (giữ id, lượng nước, sạch/bẩn) ----
  if(X.f5&&Array.isArray(X.f5.bar)){const taken=[],L=[];for(const b of X.f5.bar){let a=b;if(b&&typeof b=='object'&&!Array.isArray(b))a=[b.id,b.x,b.y,b.u,b.q];if(!Array.isArray(a))continue;L.push(a)}
   for(const a of L)if(isNum(a[1])&&isNum(a[2])&&Math.hypot(a[1],a[2])<=16&&!SH.X.hitC(a[1],a[2],.5))taken.push([a[1],a[2]]);
   for(const a of L){const ok=isNum(a[1])&&isNum(a[2])&&Math.hypot(a[1],a[2])<=16&&!SH.X.hitC(a[1],a[2],.5);if(ok){rep.thùng.push({id:a[0],giữ:[a[1],a[2]],nước:a[3],loại:a[4]});continue}
    const s=yardSlot(taken);if(!s){(A.bar=A.bar||[]).push(clone(a));rep.cảnhBáo.push('hết chỗ đặt thùng '+a[0]);continue}rep.thùng.push({id:a[0],từ:[a[1],a[2]],tới:s,nước:a[3],loại:a[4]});a[1]=s[0];a[2]=s[1];taken.push(s)}
   X.f5.bar=L.filter(a=>!(A.bar||[]).some(q=>q[0]===a[0]))}
  // ---- 6) nhà bot + bot: 5 nhà sang toạ độ v2 (giữ id, chủ, cấp, máu, kho); bot đứng ở thế giới cũ → về cửa nhà mới ----
  if(X.b16!==undefined){const B=X.b16;if(!B||!Array.isArray(B.houses)||B.houses.length!==5)return{ok:false,why:'dữ liệu nhà bot bất thường (không đủ 5 nhà) – giữ nguyên bản gốc'};
   const T=W15.M3&&W15.M3.houses||[];const H={};for(const h of B.houses){const t=T.find(q=>q.id===h.id);if(!t)return{ok:false,why:'nhà bot không rõ id '+h.id+' – giữ nguyên bản gốc'};
    const o={id:h.id,từ:[h.x,h.y]};h.x0=h.x;h.y0=h.y;h.reg0=h.reg;h.x=t.at[0];h.y=r2(t.at[1]+1.6);h.reg=t.n;o.tới=[h.x,h.y];o.chủ=h.owner;o.cấp=h.lv;o.máu=h.hp;o.kho=h.store;rep.nhàBot.push(o);H[h.id]=h}
   if(new Set(B.houses.map(h=>h.id)).size!==5)return{ok:false,why:'trùng id nhà bot – giữ nguyên bản gốc'};
   for(const b of Array.isArray(B.bots)?B.bots:[]){if(!b||typeof b!='object')continue;const h=H[b.home],door=h&&globalThis.B16?B16.hDoor(h):null;const o={id:b.id,từ:[b.x,b.y]};
    if(b.inside&&door){b.x=r2(door[0]);b.y=r2(door[1]-1);o.tới=[b.x,b.y];o.lýDo='đang trong nhà'}
    else{const m=mv(b.x,b.y);if(m.x!==undefined&&m.c.k!=='int'&&safeAt(m.x,m.y)){b.x=m.x;b.y=m.y;o.tới=[b.x,b.y];o.lýDo=m.c.k==='cl'?'theo cụm '+m.c.z:'căn cứ'}
     else if(door){b.x=r2(door[0]);b.y=r2(door[1]+.6);o.tới=[b.x,b.y];o.lýDo='thế giới cũ → cửa nhà mới'}else{o.lýDo='không có nhà → giữ';rep.cảnhBáo.push('bot '+b.id+' không có nhà')}}
    for(const k of['goal','path','route','mode','target'])delete b[k];rep.bot.push(o)}}
  // ---- 7) phó bản đang mở: dời theo khu (zn) nếu ánh xạ được & chỗ mới hợp lệ; không thì lưu trữ nguyên vẹn ----
  if(X.f4&&X.f4.dg&&X.f4.dg.cur){const c=X.f4.dg.cur,t=Z21.TT(c.zn),cc=cls(c.x,c.y);
   if(t&&cc.k==='cl'&&cc.z===c.zn&&safeAt(c.x+t[0],c.y+t[1])){c.x=r2(c.x+t[0]);c.y=r2(c.y+t[1]);for(const a of Array.isArray(c.alive)?c.alive:[]){if(isNum(a[2])&&isNum(a[3])){a[2]=r2(a[2]+t[0]);a[3]=r2(a[3]+t[1])}}rep.phóBản='dời theo '+c.zn+' (màn '+c.stage+', '+((c.alive||[]).length)+' quái)'}
   else{A.dg=clone(c);X.f4.dg.cur=null;rep.phóBản='KHÔNG ánh xạ được ('+(c.zn||'?')+') → lưu trữ nguyên vẹn, tắt phó bản; số phó bản đã qua giữ nguyên';rep.cảnhBáo.push('phó bản '+c.id+' được lưu trữ')}}
  // ---- 8) thế giới 5 km cũ (w15 dạng cũ): không có vật tương ứng trong thế giới mới → lưu trữ toàn bộ (kèm thời gian còn lại) ----
  if(X.w15&&!X.w15.v2){const f=Object.keys(X.w15.f||{}).length,z=Object.keys(X.w15.z||{}).length;A.w15old=clone(X.w15);X.w15={__v:X.w15.__v||1,v2:1,f:{},z:{}};rep.w15='lưu trữ '+f+' cây/đá đã khai thác, '+z+' quái chờ hồi sinh (thế giới cũ)'}
 }catch(e){return{ok:false,why:'lỗi khi chuyển: '+(e&&e.message||e)}}
 A.rep=rep;A.from=4;X.m5arch=A;d.m5={done:1,from:4,t:d0.t||0,rep};d.saveVersion=5;return{ok:true,d,rep}}
globalThis.M5={run,cls,safeAt,yardSlot};})();
