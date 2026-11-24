/* =====================================================================
   XD15 — LẦN 15 (CHỈ BẢN THỬ test2500 · không sửa LIVE, không ghi save thật)
   A) Công trình người chơi đặt trong SÂN CỐ ĐỊNH của nhà an toàn:
      ô đất trồng trọt 2×2 m · tháp tên 3×3 m · pháo phòng thủ 3×3 m.
      (Mới có: đặt / tháo / va chạm / lưu–tải / chặn cây hồi sinh.
       CHƯA lập trình: trồng trọt, tháp bắn, pháo bắn, giá xây.)
   B) 10 nhà an toàn mới (TP1–TP5, R1–R5): sân 26×26 m, CHƯA CÓ CHỦ.
      Nhà nào còn cây sống dưới móng → ở trạng thái "khu đất" cho tới khi
      người chơi tự chặt hết cây dưới móng + lối vào rồi bấm dựng nhà.
   Cây: không dời, không xóa, giữ nguyên ID. Cây đã chặt nằm dưới công trình /
   nhà thì hoãn hồi sinh (XD15B) cho tới khi chỗ đó trống lại.
   ===================================================================== */
(function(){
const SH=globalThis.SH,NHA=globalThis.NHA,F5=globalThis.F5;if(!SH||!NHA||!F5){console.warn('[XD15] thiếu SH/NHA/F5');return}
const S=SH.S,pos=SH.pos,X=SH.X,W=()=>globalThis.W15;
const TYPES={plot:{n:'Ô đất trồng trọt',ic:'🟫',w:2,d:2,solid:0},tower:{n:'Tháp tên',ic:'🏹',w:3,d:3,solid:1},cannon:{n:'Pháo phòng thủ',ic:'💣',w:3,d:3,solid:1}};
const COST={plot:{},tower:{},cannon:{}};          // CHƯA có giá xây – chờ duyệt (hiện miễn phí trong bản thử)
const YARD_NEW=26,PATH_W=3,REACH=9;               // sân nhà mới · lối vào tối thiểu · tầm đặt tính từ người chơi (m)
const SAFE=[["na_tp1","TP1",-45,-430],["na_tp2","TP2",90,-85],["na_tp4","TP4",-203,-180],["na_tp5","TP5",-235,63],["na_r2","R2",399.0,-246.0],["na_r3","R3",633.0,-132.0],["na_r4","R4",528.0,87.0],["na_k1","KCN1",292.0,300.0],["na_k2","KCN2",478.0,396.0],["na_k3","KCN3",172.0,540.0],["na_nt1","NT1",470.0,-425.0],["na_nt2","NT2",185.0,-520.0],["na_nt3","NT3",470.0,-511.0]];/* NT38: 3 nhà an toàn Núi Tuyết (tầng 1/2/3) *//* KCN34: 3 nhà an toàn Khu Công Nghiệp Zeta */
const SAFE_ID=new Map(SAFE.map(q=>[q[0],q]));
const SAFE_STYLE54={"na_tp1":1,"na_tp2":2,"na_tp4":3,"na_tp5":4,"na_r2":1,"na_r3":2,"na_r4":3,"na_k1":5,"na_k2":1,"na_k3":2,"na_nt1":3,"na_nt2":4,"na_nt3":5};const safeVariant54=id=>SAFE_STYLE54[id]||1;
const LIST=[];let seq=0,ver=0;
const ME='player';// LẦN 16: định danh chủ nhà. Game hiện chỉ có 1 người chơi cục bộ (NET ngoại tuyến, SID đổi mỗi phiên) → quyền sở hữu gắn với bản lưu này, CHƯA được bảo vệ giữa nhiều người chơi thật.
const r2=v=>Math.round(v*100)/100,f1=v=>(Math.round(v*10)/10).toString().replace('.',',');
const ovl=(a,b,m=0)=>a[0]<b[2]+m-1e-6&&a[2]>b[0]-m+1e-6&&a[1]<b[3]+m-1e-6&&a[3]>b[1]-m+1e-6;
const inside=(o,i)=>i[0]>=o[0]-1e-6&&i[1]>=o[1]-1e-6&&i[2]<=o[2]+1e-6&&i[3]<=o[3]+1e-6;
const inR=(r,x,y,m=0)=>x>r[0]-m&&x<r[2]+m&&y>r[1]-m&&y<r[3]+m;
const rectOf=(t,x,y)=>{const T=TYPES[t];return[x-T.w/2,y-T.d/2,x+T.w/2,y+T.d/2]};
const sRect=s=>rectOf(s.t,s.x,s.y);
const say=m=>{if(SH.say)SH.say(m)};

/* ---------- 10 nhà an toàn: đăng ký vào sổ căn cứ chung của N22 ---------- */
const TPOS=new Map();function tpos(id){if(!TPOS.size&&globalThis.MAP26){for(const t of MAP26.T)TPOS.set(t[0],t);for(const f of MAP26.F8)TPOS.set(f[0],f)}return TPOS.get(id)}
let TGRID=null;function tgrid(){if(TGRID)return TGRID;TGRID=new Map();if(!globalThis.MAP26)return TGRID;const put=t=>{const k=Math.floor(t[1]/32)+','+Math.floor(t[2]/32);let a=TGRID.get(k);if(!a)TGRID.set(k,a=[]);a.push(t)};for(const t of MAP26.T)put(t);for(const f of MAP26.F8)put(f);return TGRID}
function staticTrees(R,pad){const G=tgrid(),o=[];for(let I=Math.floor((R[0]-2)/32);I<=Math.floor((R[2]+2)/32);I++)for(let J=Math.floor((R[1]-2)/32);J<=Math.floor((R[3]+2)/32);J++)for(const t of G.get(I+','+J)||[]){const h=.4*t[3]+(pad||0);if(t[1]+h>R[0]&&t[1]-h<R[2]&&t[2]+h>R[1]&&t[2]-h<R[3]){const w=W();if(w&&w.inRes&&w.inRes(t[1],t[2],1.5))continue;o.push(t)}}return o}
// vùng phải sạch cây trước khi dựng nhà: móng nhà cấp 1 + 0,3 m, và lối vào rộng 3 m dài 2,5 m trước cửa
function siteRects(B){const H=NHA.houseRect(B,1);return[[H[0]-.3,H[1]-.3,H[2]+.3,H[3]+.3],[B.cx-PATH_W/2,H[3],B.cx+PATH_W/2,H[3]+2.5]]}
function siteStatic(B){const m=new Map();for(const R of siteRects(B))for(const t of staticTrees(R,0))m.set(t[0],t);return[...m.values()]}
function ensure(){if(globalThis.CITY4_DATA)for(let i=NHA.EXTRA.length-1;i>=0;i--)if(CITY4_DATA.removedSites.includes(NHA.EXTRA[i].id))NHA.EXTRA.splice(i,1);let ch=0;for(const[id,nm,cx,cy]of SAFE){let B=NHA.EXTRA.find(q=>q.id===id);
  if(!B){B={id,kind:'x',name:'Nhà an toàn '+nm,tag:nm,owner:'',cx,cy,lv:1,hp:NHA.LV[1].mhp,ow:0,yw:YARD_NEW,yd:YARD_NEW,st:null};NHA.EXTRA.push(B);ch=1}
  B.kind='x';B.name='Nhà an toàn '+nm;if(Math.hypot(B.cx-cx,B.cy-cy)>.5){B.cx=cx;B.cy=cy;ch=1}B.tag=nm;B.cx=cx;B.cy=cy;B.yw=B.yd=(globalThis.CITY4_DATA?.sites[B.id]?.yard||YARD_NEW);if(!(B.lv>=1&&B.lv<=5))B.lv=1;if(typeof B.owner!=='string')B.owner='';
  if(B.st!=='built'&&B.st!=='site'&&B.st!=='home'){if(!globalThis.MAP26||!W())continue;B.st=siteStatic(B).length?'site':'built';ch=1}if(B.st==='site'&&/^na_(r[2-5]|nt[1-3])$/.test(id)){B.st='built';ch=1}if(globalThis.HOME24)HOME24.fix(B)}
 if(ch)ver++;try{syncHouses()}catch(_){}}
const safeBases=()=>NHA.EXTRA.filter(b=>SAFE_ID.has(b.id)&&b.st!=='home');
const builtX=B=>B.kind!=='x'||B.st==='built';

/* ---------- CHẶN CÂY HỒI SINH dưới công trình / nhà ---------- */
let OCC=null,OCCt=0;const XBC=new Map();
function occ(){const now=performance.now();if(OCC&&now-OCCt<400)return OCC;const o=[];for(const s of LIST)o.push([sRect(s),0,1]);
 for(const B of NHA.bases()){if(!builtX(B))continue;o.push([NHA.houseRect(B,B.lv),B.kind==='x'?0:1,0])}// [rect, kiểu so (0: hộp va chạm cây chạm rect · 1: tâm cây trong rect), là công trình]
 const k=o.map(q=>q[0].join(',')).join('|');if(!OCC||OCC.k!==k)XBC.clear();o.k=k;OCC=o;OCCt=now;return o}
function blkXY(x,y,s){const h=.4*(s||1);for(const[R,mode]of occ()){if(mode?inR(R,x,y,.1):(x+h>R[0]&&x-h<R[2]&&y+h>R[1]&&y-h<R[3]))return true}return false}
function XB(id,x,y,s){if(x==null){const c=XBC.get(id);occ();if(c!==undefined&&XBC.has(id))return c;const t=tpos(id);if(!t){const tr=X.WORLD&&X.WORLD.byId&&X.WORLD.byId.t.get(id);if(!tr)return false;return blkXY(tr.x,tr.y,tr.s)}const v=blkXY(t[1],t[2],t[3]);XBC.set(id,v);return v}return blkXY(x,y,s)}
globalThis.XD15B=(id,x,y,s)=>{try{return XB(id,x,y,s)}catch(e){return false}};
// lưới an toàn: cây sống lọt vào dưới công trình / nhà mới (vd. save cũ, cây không có ID) → cho về trạng thái đã chặt, không tạo vật phẩm
function net(){let n=0;const R=[];for(const s of LIST)if(Math.abs(s.x-pos.x)<160&&Math.abs(s.y-pos.y)<160)R.push(sRect(s));for(const B of safeBases())if(B.st==='built'&&Math.abs(B.cx-pos.x)<160&&Math.abs(B.cy-pos.y)<160){R.push(NHA.houseRect(B,5));R.push(siteRects(B)[1])}{const CO=globalThis.CO;if(CO&&!CO.none&&Math.abs(CO.x-pos.x)<160&&Math.abs(CO.y-pos.y)<160&&CO.site!=='na_go'){const H=NHA.houseRect(NHA.PB,5);R.push([H[0]-.3,H[1]-.3,H[2]+.3,H[3]+.3],[CO.x-PATH_W/2,H[3],CO.x+PATH_W/2,H[3]+2.5])}}if(!R.length)return 0;
 for(const t of SH.trees){if(!(t.hp>0)||!t.c||t.giant)continue;const h=.4*(t.s||1);for(const q of R)if(t.x+h>q[0]&&t.x-h<q[2]&&t.y+h>q[1]&&t.y-h<q[3]){t.hp=0;t.c.on=false;t.t0=SH.GT;if(!SH.felled.includes(t))SH.felled.push(t);if(t.id&&X.WORLD)try{X.WORLD.emit('tree.fell',{id:t.id,by:'xd15'})}catch(_){}n++;break}}
 if(n){SH.colsDirty&&SH.colsDirty();const V=SH.V25;V&&V.treesDirty&&V.treesDirty();NET.n+=n}return n}
const NET={n:0};

/* ---------- KIỂM TRA CHỖ ĐẶT ---------- */
function water(x,y){const w=W();if(w&&w.depthAt(x,y)>.06)return true;return!!(SH.deepAt&&SH.deepAt(x,y,0))}
function terr(R){const w=W(),M=w&&w.M3;for(let x=R[0]+.25;x<R[2];x+=.5)for(let y=R[1]+.25;y<R[3];y+=.5){if(M&&M.deckAt(x,y,0))return['cau','Không xây đè lên cầu'];if(water(x,y))return['nuoc','Không xây đè lên nước'];if(M&&M.roadAt(x,y,0))return['duong','Không xây đè lên đường'];if(w&&w.inLocked&&w.inLocked(x,y))return['khoa','Không xây trong vùng khóa']}return null}
function baseAt(R){for(const B of NHA.bases())if(inside(NHA.lotRect(B),R))return B;return null}
function mayBuild(B){if(!B)return false;if(B.kind==='x')return B.st==='built'&&B.owner===ME;return B.owner===ME}
const mine=B=>!!B&&B.owner===ME;
/* ---------- LẦN 16: NHẬN NHÀ AN TOÀN (miễn phí · mỗi người tối đa 1 trong 10 nhà mới · 1 nhà 1 chủ) ---------- */
const myNew=()=>NHA.EXTRA.find(b=>SAFE_ID.has(b.id)&&b.owner===ME)||null;
function canClaim(id){const B=NHA.get(id);if(!B||!SAFE_ID.has(id))return{ok:false,code:'base',why:'Không phải nhà an toàn mới'};if(B.owner===ME)return{ok:false,code:'cuaban',why:'Nhà này đã là của bạn'};if(B.owner)return{ok:false,code:'cochu',why:'Nhà này đã có chủ'};const m=myNew();if(m)return{ok:false,code:'da1',why:'Bạn đã nhận '+m.name+' – mỗi người chỉ 1 nhà mới'};return{ok:true,B}}
function claim(id,o={}){const c=canClaim(id);if(!c.ok){if(!o.quiet)say('⛔ '+c.why);return c}if(!o.far&&!inR(NHA.lotRect(c.B),pos.x,pos.y,3)){if(!o.quiet)say('⛔ Đến tận nơi để nhận nhà');return{ok:false,code:'xa',why:'Đến tận nơi để nhận nhà'}}
 c.B.owner=ME;ver++;if(!o.quiet)say('🏠 Đã nhận '+c.B.name+' (miễn phí)'+(c.B.st==='site'?' · hãy chặt cây khoanh đỏ rồi dựng nhà':''));try{globalThis.saveNow&&saveNow()}catch(_){}return{ok:true,id}}
function reserved(B){const H5=NHA.houseRect(B,5),H1=NHA.houseRect(B,1),Y=NHA.lotRect(B);return{house:[H5[0]-.3,H5[1]-.3,H5[2]+.3,H5[3]+.3],path:[B.cx-PATH_W/2,H1[3],B.cx+PATH_W/2,Y[3]]}}
function liveTreeIn(R){for(const t of SH.trees){if(!(t.hp>0))continue;const h=.4*(t.s||1);if(t.x+h>R[0]&&t.x-h<R[2]&&t.y+h>R[1]&&t.y-h<R[3])return t}return null}
/* khả năng đi lại: lưới 0,5 m phủ sân + 1,5 m; xuất phát trước cửa; phải ra được ngoài sân và chạm được từng công trình */
function reach(B,extra,extraSolid){const Y=NHA.lotRect(B),m=1.5,x0=Y[0]-m,y0=Y[1]-m,nx=Math.ceil((Y[2]-Y[0]+2*m)/.5),ny=Math.ceil((Y[3]-Y[1]+2*m)/.5),H=NHA.houseRect(B,B.lv);
 const blk=new Uint8Array(nx*ny),seen=new Uint8Array(nx*ny),cx=i=>x0+(i+.5)*.5,cy=j=>y0+(j+.5)*.5,ex=extra&&extraSolid?[extra[0]-.3,extra[1]-.3,extra[2]+.3,extra[3]+.3]:null;
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const x=cx(i),y=cy(j);if((ex&&inR(ex,x,y))||X.hitC(x,y,.3)||water(x,y)||(builtX(B)&&inR(H,x,y,.3)))blk[j*nx+i]=1}
 const si=Math.floor((B.cx-x0)/.5),sj=Math.floor((H[3]+.8-y0)/.5);let q=[];for(const[a,b]of[[si,sj],[si-1,sj],[si+1,sj],[si,sj+1]]){const k=b*nx+a;if(a>=0&&b>=0&&a<nx&&b<ny&&!blk[k]&&!seen[k]){seen[k]=1;q.push(k)}}
 let exit=false;while(q.length){const k=q.pop(),i=k%nx,j=(k-i)/nx;if(!inR(Y,cx(i),cy(j)))exit=true;for(const[a,b]of[[i+1,j],[i-1,j],[i,j+1],[i,j-1]]){if(a<0||b<0||a>=nx||b>=ny)continue;const n=b*nx+a;if(blk[n]||seen[n])continue;seen[n]=1;q.push(n)}}
 const touch=R=>{for(let j=Math.max(0,Math.floor((R[1]-.9-y0)/.5));j<=Math.min(ny-1,Math.floor((R[3]+.9-y0)/.5));j++)for(let i=Math.max(0,Math.floor((R[0]-.9-x0)/.5));i<=Math.min(nx-1,Math.floor((R[2]+.9-x0)/.5));i++)if(seen[j*nx+i])return true;return false};
 const bad=[];for(const s of LIST)if(s.b===B.id&&!touch(sRect(s)))bad.push(s.id);return{exit,bad,extra:extra?touch(extra):true,start:q!==null&&seen.some(v=>v)}}
function can(t,x,y,o={}){const T=TYPES[t];if(!T)return{ok:false,code:'loai',why:'Loại công trình không hợp lệ'};x=r2(x);y=r2(y);const R=rectOf(t,x,y),no=(code,why,extra)=>Object.assign({ok:false,code,why,R},extra||{});
 if(SH.IH&&SH.IH()&&!o.far)return no('trong','Ra sân (ngoài trời) rồi mới xây');
 const B=baseAt(R);if(!B)return no('ngoaisan','Chỉ xây trọn trong sân của nhà an toàn');
 if(B.kind==='x'&&B.st!=='built')return no('chuadung','Khu đất này chưa dựng nhà');
 if(!mayBuild(B))return no('chu',B.owner?'Sân này thuộc về người khác':'Sân này chưa có chủ – hãy nhận nhà trước');
 if(!o.far&&Math.hypot(x-pos.x,y-pos.y)>REACH)return no('xa','Đứng gần hơn để xây');
 const rs=reserved(B);if(ovl(R,rs.house))return no('nha','Chỗ này dành cho nhà chính (tính đến cấp 5)');if(ovl(R,rs.path))return no('loivao','Không chặn lối vào nhà (rộng '+PATH_W+' m)');
 for(const s of LIST)if(ovl(R,sRect(s)))return no('chong','Chồng lên '+TYPES[s.t].n.toLowerCase()+' đã có',{hit:s.id});
 for(const o2 of NHA.bases())if(o2.id!==B.id&&(ovl(R,NHA.lotRect(o2))||(builtX(o2)&&ovl(R,NHA.houseRect(o2,o2.lv),.2))))return no('nhakhac','Chạm đất/nhà của '+o2.name);
 for(const b of SH.blds)if(b.x0<5000&&ovl(R,[b.x0,b.y0,b.x1,b.y1]))return no('toa','Chồng lên công trình có sẵn');
 const te=terr(R);if(te)return no(te[0],te[1]);
 const tr=liveTreeIn(R);if(tr)return tr.giant?no('cothu','Cây cổ thụ không chặt được – chọn chỗ khác',{tree:tr.id}):no('cay','Còn cây sống ở đây – chặt cây trước',{tree:tr.id});
 if(globalThis.F5&&F5.barrels)for(const b of F5.barrels)if(inR(R,b.x,b.y,.45))return no('thung','Vướng thùng nước – dời thùng đi');
 for(let px=R[0]+.25;px<R[2];px+=.5)for(let py=R[1]+.25;py<R[3];py+=.5)if(X.hitC(px,py,.05))return no('vatcan','Chỗ này vướng vật cản');
 if(T.solid){if(inR(R,pos.x,pos.y,.4)&&!(SH.IH&&SH.IH()))return no('nguoi','Bạn đang đứng trong chỗ đặt – lùi ra');
  for(const e of SH.ens)if(!e.dead&&e.hp>0&&inR(R,e.x,e.y,.3))return no('quai','Có quái trong chỗ đặt');
  for(const b of(globalThis.B16?B16.BOTS:[]))if(!b.inside&&!b.dead&&inR(R,b.x,b.y,.3))return no('bot','Có người đứng trong chỗ đặt')}
 const r0=reach(B,null,false),r1=reach(B,R,!!T.solid);
 if(r0.exit&&!r1.exit)return no('bitloi','Sẽ chặn hoàn toàn lối ra vào nhà');
 if(!r1.extra)return no('khongtoi','Không có lối đi tới công trình này');
 const lost=r1.bad.filter(id=>!r0.bad.includes(id));if(lost.length)return no('chanctr','Sẽ bịt lối tới công trình khác',{lost});
 return{ok:true,B,R,x,y}}
function addCol(s){if(!TYPES[s.t].solid)return;const R=sRect(s);s.c={x0:R[0],x1:R[2],z0:R[1],z1:R[3],xd15:1};SH.cols.push(s.c);SH.colsDirty&&SH.colsDirty()}
function delCol(s){if(!s.c)return;const i=SH.cols.indexOf(s.c);if(i>=0)SH.cols.splice(i,1);s.c=null;SH.colsDirty&&SH.colsDirty()}
const have=k=>k==='eat'?S.eat:(S[k]|0);
function place(t,x,y,o={}){const c=can(t,x,y,o);if(!c.ok){if(!o.quiet)say('⛔ '+c.why);return c}
 const cost=COST[t]||{},miss=Object.keys(cost).filter(k=>have(k)<cost[k]);if(miss.length){if(!o.quiet)say('⛔ Thiếu nguyên liệu');return{ok:false,code:'cost',why:'Thiếu nguyên liệu',miss}}
 for(const k in cost){if(k==='eat')S.eat-=cost[k];else S[k]-=cost[k]}
 let id;do{id='xd'+(++seq)}while(LIST.some(q=>q.id===id));const s={id,t,x:c.x,y:c.y,b:c.B.id};LIST.push(s);addCol(s);ver++;OCC=null;
 if(!o.quiet)say('🔨 Đã xây '+TYPES[t].n.toLowerCase()+' · '+count(c.B.id,t)+' trong sân '+c.B.name);return{ok:true,id,s}}
function remove(id,o={}){const i=LIST.findIndex(q=>q.id===id);if(i<0)return{ok:false,code:'gone'};const s=LIST[i];const B=NHA.get(s.b);if(!o.force&&!mayBuild(B))return{ok:false,code:'chu',why:'Không phải công trình của bạn'};
 delCol(s);LIST.splice(i,1);ver++;OCC=null;if(!o.quiet)say('🧹 Đã tháo '+TYPES[s.t].n.toLowerCase());return{ok:true}}
const count=(b,t)=>LIST.filter(s=>s.b===b&&(!t||s.t===t)).length;

/* ---------- DỰNG NHÀ trên khu đất (sau khi người chơi tự chặt cây dưới móng) ---------- */
function need(B){if(typeof B==='string')B=NHA.get(B);if(!B)return[];const o=new Map();for(const R of siteRects(B))for(const t of SH.trees){if(!(t.hp>0))continue;const h=.4*(t.s||1);if(t.x+h>R[0]&&t.x-h<R[2]&&t.y+h>R[1]&&t.y-h<R[3])o.set(t,1)}return[...o.keys()]}
function loaded(B){const st=siteStatic(B);if(!st.length)return true;const by=X.WORLD&&X.WORLD.byId&&X.WORLD.byId.t;return!!by&&st.every(t=>by.get(t[0]))}
function buildHouse(id,o={}){const B=NHA.get(id);if(!B||B.kind!=='x')return{ok:false,code:'base'};if(B.st==='built')return{ok:false,code:'built'};
 const no=(code,why,e)=>{if(!o.quiet)say('⛔ '+why);return Object.assign({ok:false,code,why},e||{})};
 if(B.owner!==ME)return no('chu',B.owner?'Khu đất này thuộc về người khác':'Hãy nhận khu đất này trước khi dựng nhà');
 if(!o.far&&Math.hypot(B.cx-pos.x,B.cy-pos.y)>22)return no('xa','Đến khu đất rồi mới dựng nhà');
 if(!loaded(B))return no('chuatai','Khu đất chưa tải xong – đợi một chút');
 const n=need(B);if(n.length)return no('cay','Còn '+n.length+' cây sống dưới móng / lối vào – chặt hết trước',{n:n.length});
 const H=NHA.houseRect(B,1);for(let x=H[0]+.2;x<H[2];x+=.4)for(let y=H[1]+.2;y<H[3];y+=.4)if(X.hitC(x,y,.05))return no('vatcan','Móng nhà vướng vật cản');
 for(const s of LIST)if(ovl(H,sRect(s)))return no('ctr','Móng nhà vướng công trình');
 for(const e of SH.ens)if(!e.dead&&e.hp>0&&inR(H,e.x,e.y,.3))return no('quai','Có quái trong khu móng');
 for(const b of(globalThis.B16?B16.BOTS:[]))if(!b.inside&&!b.dead&&inR(H,b.x,b.y,.3))return no('bot','Có người đứng trong khu móng');
 if(inR(H,pos.x,pos.y,.5)){pos.x=B.cx;pos.y=H[3]+1.3}
 B.st='built';B.lv=1;B.hp=NHA.LV[1].mhp;ver++;OCC=null;syncHouses();if(!o.quiet)say('🏠 Đã dựng '+B.name+' (cấp 1 · sân cố định '+YARD_NEW+'×'+YARD_NEW+' m)');return{ok:true}}
/* va chạm khối đặc cho nhà mới đã dựng (giống nhà bot) */
const HC=new Map();
function syncHouses(){for(const B of NHA.EXTRA.filter(b=>SAFE_ID.has(b.id))){const want=B.st==='built',R=NHA.houseRect(B,B.lv),key=R.join(','),c=HC.get(B.id);
  if(c&&(!want||c.key!==key||!SH.cols.includes(c.c))){const i=SH.cols.indexOf(c.c);if(i>=0)SH.cols.splice(i,1);HC.delete(B.id);SH.colsDirty&&SH.colsDirty()}
  if(want&&!HC.has(B.id)){const col={x0:R[0],x1:R[2],z0:R[1],z1:R[3],xd15h:1};SH.cols.push(col);HC.set(B.id,{c:col,key});SH.colsDirty&&SH.colsDirty()}}}

/* ---------- LƯU / TẢI (chỉ localStorage bản thử) ---------- */
X.SAVE.register({id:'xd15',scope:'world',version:1,defaults:()=>({}),
 get(){return{v:1,seq,list:LIST.map(s=>[s.id,s.t,s.x,s.y,s.b])}},
 set(d){for(const s of LIST)delCol(s);LIST.length=0;seq=0;const ids=new Set();if(d&&Array.isArray(d.list))for(const q of d.list){if(!Array.isArray(q)||!TYPES[q[1]]||typeof q[2]!=='number'||typeof q[3]!=='number')continue;let id=String(q[0]||'');const m=/^xd(\d+)$/.exec(id);if(!m||ids.has(id))continue;ids.add(id);seq=Math.max(seq,+m[1]);const s={id,t:q[1],x:q[2],y:q[3],b:String(q[4]||'')};LIST.push(s);addCol(s)}
  if(d&&d.seq>seq)seq=d.seq|0;ver++;OCC=null}});

/* ---------- VẼ 2D ---------- */
function plot2(g,R,X2,Y2,Z,a){const x=X2(R[0]),y=Y2(R[1]),w=(R[2]-R[0])*Z,h=(R[3]-R[1])*Z;g.save();g.globalAlpha=a||1;g.fillStyle='#6b4423';g.fillRect(x,y,w,h);g.fillStyle='#4e3018';for(let i=0;i<5;i++)g.fillRect(x+w*.06,y+h*(.12+i*.18),w*.88,h*.07);g.strokeStyle='#3a2410';g.lineWidth=Math.max(1,Z*.06);g.strokeRect(x,y,w,h);g.restore()}
function tower2(g,R,X2,Y2,Z,a){const x=X2(R[0]),y=Y2(R[1]),w=(R[2]-R[0])*Z,h=(R[3]-R[1])*Z,up=Z*3.2;g.save();g.globalAlpha=a||1;g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x,y,w,h);
 g.fillStyle='#6e5234';for(const[a2,b]of[[.05,.05],[.83,.05],[.05,.83],[.83,.83]])g.fillRect(x+w*a2,y+h*b-up,w*.12,h*.12+up);
 g.fillStyle='#8a6a44';g.fillRect(x-w*.04,y+h*.45-up,w*1.08,h*.6);g.fillStyle='#5a4028';g.fillRect(x-w*.04,y+h*.95-up,w*1.08,h*.1);
 g.fillStyle='#7a3b2a';g.beginPath();g.moveTo(x-w*.12,y+h*.45-up);g.lineTo(x+w/2,y-up-h*.35);g.lineTo(x+w*1.12,y+h*.45-up);g.closePath();g.fill();g.restore()}
function cannon2(g,R,X2,Y2,Z,a){const x=X2(R[0]),y=Y2(R[1]),w=(R[2]-R[0])*Z,h=(R[3]-R[1])*Z,up=Z*.9;g.save();g.globalAlpha=a||1;g.fillStyle='#55585e';g.fillRect(x,y+h*.15,w,h*.85);g.fillStyle='#777b83';g.fillRect(x,y+h*.15-up,w,h*.85);g.fillStyle='#55585e';g.fillRect(x,y+h-up,w,up);
 g.fillStyle='#2c2e33';g.beginPath();g.arc(x+w/2,y+h*.55-up,w*.3,0,7);g.fill();g.fillStyle='#1c1d21';g.fillRect(x+w*.4,y+h*.5-up-Z*.1,w*.2,h*.75);g.fillStyle='#b0282d';g.fillRect(x+w*.38,y+h*1.2-up-Z*.1,w*.24,h*.08);g.restore()}
const DRAW2={plot:plot2,tower:tower2,cannon:cannon2};
function house2(g,B,Xf,Yf,Z){const R=NHA.houseRect(B,B.lv),k=NHA.GK?NHA.GK(B,B.lv,safeVariant54(B.id)):null,a=k&&SH.AS[k],w=(R[2]-R[0])*1.06*Z,x=Xf(B.cx),y=Yf(R[3]+.3);
 if(a&&a.i&&a.i.complete&&a.i.naturalWidth){const hh=w*a.h/a.w;g.save();g.globalAlpha=.25;g.fillStyle='#000';g.beginPath();g.ellipse(x,y,w*.5,Z*.5,0,0,7);g.fill();g.globalAlpha=1;g.drawImage(a.i,x-w/2,y-hh,w,hh);g.restore()}else{g.fillStyle='#8a5a34';g.fillRect(x-w/2,y-Z*4,w,Z*4)}
 g.save();g.font='bold '+Math.round(Z*.32)+'px system-ui';g.textAlign='center';const s='🏠 '+B.name+' · cấp '+B.lv+(B.owner===ME?' · của bạn':B.owner?' · đã có chủ':' · chưa có chủ'),tw=g.measureText(s).width+12;g.fillStyle='rgba(20,30,50,.78)';g.fillRect(x-tw/2,y+Z*.15,tw,Z*.46);g.fillStyle='#ffe6a8';g.fillText(s,x,y+Z*.5);g.restore()}
function site2(g,B,Xf,Yf,Z){const[H,P]=siteRects(B);g.save();g.fillStyle='rgba(255,170,60,.13)';g.strokeStyle='rgba(255,170,60,.95)';g.lineWidth=Math.max(1.5,Z*.08);g.setLineDash([Z*.4,Z*.25]);for(const R of[H,P]){g.fillRect(Xf(R[0]),Yf(R[1]),(R[2]-R[0])*Z,(R[3]-R[1])*Z);g.strokeRect(Xf(R[0]),Yf(R[1]),(R[2]-R[0])*Z,(R[3]-R[1])*Z)}g.setLineDash([]);
 const n=need(B);g.strokeStyle='#ff3b30';g.lineWidth=Math.max(2,Z*.1);for(const t of n){g.beginPath();g.arc(Xf(t.x),Yf(t.y),Z*.7,0,7);g.stroke()}
 g.restore()}
function site2lab(g,B,Xf,Yf,Z){const P=siteRects(B)[1],n=need(B);g.save();g.font='bold '+Math.round(Z*.34)+'px system-ui';g.textAlign='center';const s='📐 Khu đất '+B.name+(B.owner===ME?' · của bạn':B.owner?' · đã có chủ':' · chưa có chủ')+(B.owner!==ME?'':n.length?' · chặt '+n.length+' cây khoanh đỏ để dựng nhà':' · đã sạch cây – bấm dựng nhà'),tw=g.measureText(s).width+14,x=Xf(B.cx),y=Yf(P[3]+.9);g.fillStyle='rgba(20,30,50,.82)';g.fillRect(x-tw/2,y-Z*.36,tw,Z*.5);g.fillStyle='#ffd9a0';g.fillText(s,x,y);g.restore()}
let GHOST=null;// {t,x,y,ok,why}
{const o=F5.draw2;F5.draw2=(L,Xf,Yf,cx,cy,vw,vh,t,g,Z)=>{o&&o(L,Xf,Yf,cx,cy,vw,vh,t,g,Z);if(SH.IH&&SH.IH())return;
 for(const s of LIST){if(Math.abs(s.x-cx)>vw+4||Math.abs(s.y-cy)>vh+8)continue;const R=sRect(s);L.push([s.t==='plot'?-1e9+3:R[3],()=>DRAW2[s.t](g,R,Xf,Yf,Z)])}
 for(const B of safeBases()){if(Math.abs(B.cx-cx)>vw+16||Math.abs(B.cy-cy)>vh+18)continue;if(B.st==='built'){const R=NHA.houseRect(B,B.lv);L.push([R[3],()=>house2(g,B,Xf,Yf,Z)])}else if(B.st==='site'){L.push([-1e9+2,()=>site2(g,B,Xf,Yf,Z)]);L.push([1e9-1,()=>site2lab(g,B,Xf,Yf,Z)])}}
 if(GHOST){const G=GHOST,R=rectOf(G.t,G.x,G.y);L.push([1e9,()=>{g.save();g.globalAlpha=.55;g.fillStyle=G.ok?'#35d06a':'#ff4040';g.fillRect(Xf(R[0]),Yf(R[1]),(R[2]-R[0])*Z,(R[3]-R[1])*Z);g.globalAlpha=1;g.strokeStyle=G.ok?'#0a7a30':'#a00000';g.lineWidth=2;g.strokeRect(Xf(R[0]),Yf(R[1]),(R[2]-R[0])*Z,(R[3]-R[1])*Z);g.restore()}])}}}

/* ---------- 2.5D ---------- */
const M3=new Map(),HB3=new Map(),SITE3=new Map();let GH3=null;
function mesh3(T,s){const g=new T.Group(),lam=c=>new T.MeshLambertMaterial({color:c}),box=(w,h,d,c,x,y,z)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),lam(c));m.position.set(x,y+h/2,z);g.add(m);return m};
 if(s.t==='plot'){box(2,.08,2,0x6b4423,0,0,0);for(let i=0;i<5;i++)box(1.8,.1,.16,0x4e3018,0,.05,-.72+i*.36)}
 else if(s.t==='tower'){for(const[a,b]of[[-1.3,-1.3],[1.3,-1.3],[-1.3,1.3],[1.3,1.3]])box(.3,4.2,.3,0x6e5234,a,0,b);box(3.1,.2,3.1,0x8a6a44,0,2.9,0);for(const[w,d,a,b]of[[3.1,.12,0,-1.5],[3.1,.12,0,1.5],[.12,3.1,-1.5,0],[.12,3.1,1.5,0]])box(w,.9,d,0x7a5a38,a,3.1,b);const r=new T.Mesh(new T.ConeGeometry(2.5,1.5,4),lam(0x7a3b2a));r.position.set(0,4.95,0);r.rotation.y=Math.PI/4;g.add(r);box(2.6,.25,.25,0x5a4028,0,1.5,-1.3);box(2.6,.25,.25,0x5a4028,0,1.5,1.3)}
 else{box(3,.9,3,0x777b83,0,0,0);box(2.2,.3,2.2,0x55585e,0,.9,0);const b=new T.Mesh(new T.CylinderGeometry(.32,.4,2.6,12),lam(0x1c1d21));b.rotation.x=Math.PI/2-.25;b.position.set(0,1.75,.7);g.add(b);const c=new T.Mesh(new T.SphereGeometry(.75,12,8),lam(0x2c2e33));c.position.set(0,1.45,0);g.add(c)}
 g.position.set(s.x,0,s.y);return g}
const drop=(scene,g)=>{scene.remove(g);g.traverse(o=>{o.geometry&&o.geometry.dispose&&o.geometry.dispose()})};
function frame3(B){const h=B._h||(B._h={});h.id=B.id;h.x=B.cx;h.y=B.cy+1.6;h.lv=B.lv;h.ow=0;h.vi=safeVariant54(B.id);return NHA.botFrame(h)}
function upd3(){const V=SH.V25;if(!V||!V.on||!V.T15)return;const T=V.T15.T,scene=V.T15.scene,ih=SH.IH&&SH.IH();
 const live=new Set();for(const s of LIST){const near=Math.abs(s.x-pos.x)<70&&Math.abs(s.y-pos.y)<60;live.add(s.id);let r=M3.get(s.id);if(!r&&near){r=mesh3(T,s);scene.add(r);M3.set(s.id,r)}if(r)r.visible=near&&!ih}
 for(const[id,g]of M3)if(!live.has(id)){drop(scene,g);M3.delete(id)}
 if(V.buildB&&V.Z21&&NHA.botFrame){const M=V.Z21.BREC;for(const B of NHA.EXTRA.filter(b=>SAFE_ID.has(b.id))){const near=Math.abs(B.cx-pos.x)<70&&Math.abs(B.cy-pos.y)<60,key=B.st+'|'+B.lv+'|'+B.cx+'|'+B.cy+'|'+B.owner;let r=HB3.get(B.id);
   if(r&&(r.key!==key||!M.has(r.b))){const q=M.get(r.b);if(q){q.g.parent&&q.g.parent.remove(q.g);M.delete(r.b)}HB3.delete(B.id);r=null}
   if(!r&&near&&B.st==='built'){const b=frame3(B);V.buildB(b);r={b,key};HB3.set(B.id,r)}
   if(r){const q=M.get(r.b);if(q)q.g.visible=near}}}
 for(const B of safeBases()){const near=B.st==='site'&&Math.abs(B.cx-pos.x)<60&&Math.abs(B.cy-pos.y)<50,n=near?need(B):[],key=n.map(t=>t.id||(t.x+','+t.y)).join('|');let r=SITE3.get(B.id);
  if(r&&(!near||r.key!==key)){drop(scene,r.g);SITE3.delete(B.id);r=null}
  if(!r&&near){const g=new T.Group();for(const R of siteRects(B)){const pts=[[R[0],R[1]],[R[2],R[1]],[R[2],R[3]],[R[0],R[3]],[R[0],R[1]]].map(p=>new T.Vector3(p[0],.08,p[1]));const ln=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:0xffaa3c}));g.add(ln);
     const pl=new T.Mesh(new T.PlaneGeometry(R[2]-R[0],R[3]-R[1]),new T.MeshBasicMaterial({color:0xffaa3c,transparent:true,opacity:.14,depthWrite:false}));pl.rotation.x=-Math.PI/2;pl.position.set((R[0]+R[2])/2,.06,(R[1]+R[3])/2);g.add(pl)}
    for(const t of n){const rg=new T.Mesh(new T.RingGeometry(.75,.95,20),new T.MeshBasicMaterial({color:0xff3b30,side:T.DoubleSide,depthWrite:false}));rg.rotation.x=-Math.PI/2;rg.position.set(t.x,.1,t.y);g.add(rg)}
    const H=NHA.houseRect(B,1);for(const[x,z]of[[H[0],H[1]],[H[2],H[1]],[H[0],H[3]],[H[2],H[3]]]){const p=new T.Mesh(new T.BoxGeometry(.18,1.1,.18),new T.MeshLambertMaterial({color:0xd8902a}));p.position.set(x,.55,z);g.add(p)}
    scene.add(g);r={g,key};SITE3.set(B.id,r)}
  if(r)r.g.visible=!ih}
 if(GH3&&(!GHOST||GH3.t!==GHOST.t)){drop(scene,GH3.m);GH3=null}
 if(GHOST){if(!GH3){const TT=TYPES[GHOST.t],m=new T.Mesh(new T.BoxGeometry(TT.w,.5,TT.d),new T.MeshBasicMaterial({color:0x35d06a,transparent:true,opacity:.5,depthWrite:false}));scene.add(m);GH3={m,t:GHOST.t}}GH3.m.position.set(GHOST.x,.3,GHOST.y);GH3.m.material.color.setHex(GHOST.ok?0x35d06a:0xff4040)}}

/* ---------- GIAO DIỆN: nút 🔨 Xây (phím N) · chế độ đặt (Enter đặt · Esc hủy) ---------- */
const el=(tag,css,html)=>{const e=document.createElement(tag);e.style.cssText=css;if(html!=null)e.innerHTML=html;document.body.appendChild(e);return e};
const BTN=el('button','position:fixed;right:12px;top:42%;z-index:60;display:none;padding:9px 12px;border-radius:12px;border:2px solid #d8c070;background:rgba(40,30,18,.88);color:#ffe6a8;font:bold 14px system-ui;','🔨 Xây<br><small>N</small>');BTN.id='xdbtn';
const PAN=el('div','position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:80;display:none;min-width:290px;max-width:92vw;padding:14px;border-radius:14px;border:2px solid #d8c070;background:rgba(24,20,14,.95);color:#f4ead0;font:14px system-ui;');PAN.id='xdpan';
const BAR=el('div','position:fixed;left:50%;bottom:118px;transform:translateX(-50%);z-index:70;display:none;padding:8px 10px;border-radius:12px;background:rgba(24,20,14,.9);color:#f4ead0;font:13px system-ui;text-align:center;');BAR.id='xdbar';
let mode=null,dir=[0,1],lp=[pos.x,pos.y],pz0=false;
function curBase(){for(const B of NHA.bases())if(inR(NHA.lotRect(B),pos.x,pos.y))return B;return null}
function nearSite(){for(const B of safeBases())if(B.st==='site'&&inR(NHA.lotRect(B),pos.x,pos.y,2))return B;return null}
function nearSafe(){for(const B of safeBases())if(inR(NHA.lotRect(B),pos.x,pos.y,2))return B;return null}
function nearStruct(){let b=null,bd=3.2;for(const s of LIST){const d=Math.hypot(s.x-pos.x,s.y-pos.y);if(d<bd){bd=d;b=s}}return b}
function panel(){const B=curBase(),site=nearSite();pz0=S.pz;S.pz=true;let h='<b style="font-size:16px">🔨 Xây dựng trong sân</b><br>';
 const bt=(lab,act,dis)=>'<button data-a="'+act+'" '+(dis?'disabled ':'')+'style="display:block;width:100%;margin:6px 0;padding:9px;border-radius:9px;border:1px solid #8a7a50;background:'+(dis?'#3a342a':'#5a4526')+';color:'+(dis?'#998':'#ffe6a8')+';font:14px system-ui;text-align:left">'+lab+'</button>';
 const claimBt=X2=>{const c=canClaim(X2.id);return c.ok?bt('🏠 Nhận '+X2.name+' · MIỄN PHÍ<br><small>Mỗi người chỉ nhận 1 trong 10 nhà mới</small>','claim:'+X2.id):(X2.owner===ME?'':'<div style="margin:8px 0;color:#ffb070">'+c.why+'</div>')};
 if(site){const n=need(site).length;h+='<small>'+site.name+' · khu đất chưa dựng nhà'+(site.owner===ME?' · của bạn':'')+'</small>'+claimBt(site);if(site.owner===ME)h+=bt('🏠 Dựng '+site.name+(n?' · còn '+n+' cây phải chặt':''),'house',n>0)}
 else if(B){const Y=NHA.lotRect(B);h+='<small>'+B.name+' · sân cố định '+f1(Y[2]-Y[0])+'×'+f1(Y[3]-Y[1])+' m (không đổi khi nâng cấp)</small>';
  if(mayBuild(B)){for(const t in TYPES){const T=TYPES[t];h+=bt(T.ic+' '+T.n+' · '+T.w+'×'+T.d+' m · đã có '+count(B.id,t),'t:'+t)}const s=nearStruct();if(s)h+=bt('🧹 Tháo '+TYPES[s.t].n.toLowerCase()+' gần nhất','rm:'+s.id)}
  else if(SAFE_ID.has(B.id))h+=claimBt(B);else h+='<div style="margin:8px 0;color:#ffb070">Sân này thuộc về '+B.name+'.</div>'}
 else h+='<div style="margin:8px 0">Hãy đứng trong sân của một nhà an toàn.</div>';
 h+='<small style="color:#bba">Chưa có (chờ duyệt): giá xây · trồng trọt · tháp/pháo bắn.</small>'+bt('✖ Đóng','x');PAN.innerHTML=h;PAN.style.display='block'}
function closePan(){PAN.style.display='none';S.pz=pz0}
PAN.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const a=b.dataset.a;closePan();
 if(a==='house'){const s=nearSite();if(s)buildHouse(s.id)}else if(a.startsWith('t:'))start(a.slice(2));else if(a.startsWith('rm:'))remove(a.slice(3));else if(a.startsWith('claim:')){claim(a.slice(6));panel()}});
function start(t){mode=t;BAR.style.display='block';tickGhost()}
function stop(){mode=null;GHOST=null;BAR.style.display='none'}
function tickGhost(){if(!mode)return;const T=TYPES[mode],sn=v=>Math.round(v*2)/2;const x=sn(pos.x+dir[0]*(T.w/2+1.4)),y=sn(pos.y+dir[1]*(T.d/2+1.4));const c=can(mode,x,y);GHOST={t:mode,x,y,ok:c.ok,why:c.why||''};
 BAR.innerHTML=T.ic+' <b>'+T.n+'</b> · '+(c.ok?'<span style="color:#7dff9a">đặt được</span>':'<span style="color:#ff9080">'+c.why+'</span>')+'<br><button data-a="ok" style="margin:6px 4px 0;padding:8px 14px;border-radius:9px;border:0;background:'+(c.ok?'#2e8b47':'#555')+';color:#fff;font:bold 14px system-ui">✅ Đặt (Enter)</button><button data-a="no" style="margin:6px 4px 0;padding:8px 14px;border-radius:9px;border:0;background:#8b2e2e;color:#fff;font:bold 14px system-ui">✖ Xong (Esc)</button>'}
function confirm(){if(!mode||!GHOST)return;const r=place(mode,GHOST.x,GHOST.y);tickGhost();return r}
BAR.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.a==='ok')confirm();else stop()});
BTN.addEventListener('click',()=>{if(mode)stop();else panel()});
addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='INPUT')return;const k=e.key.length===1?e.key.toLowerCase():e.key;
 if(mode){if(k==='Enter'){e.stopImmediatePropagation();e.preventDefault();confirm()}else if(k==='Escape'){e.stopImmediatePropagation();e.preventDefault();stop()}return}
 if(PAN.style.display==='block'){if(k==='Escape'||k==='n'){e.stopImmediatePropagation();e.preventDefault();closePan()}return}
 if(k==='n'&&S.on&&!S.dead&&!S.pz&&BTN.style.display!=='none'){e.stopImmediatePropagation();panel()}},true);
/* hành động ngữ cảnh: dựng nhà tại khu đất */
{const o=F5.acts;F5.acts=c=>{o&&o(c);if(SH.IH&&SH.IH())return;for(const B of safeBases()){const H=NHA.houseRect(B,1),d=Math.hypot(pos.x-B.cx,pos.y-(H[3]+1.5));if(d>=3)continue;
  if(!B.owner){if(!myNew())c(d+1.2,4.2,'🏠<br>Nhận nhà<br><small>'+B.tag+' · miễn phí</small>',()=>panel(),B)}
  else if(B.owner===ME&&B.st==='site'){const n=need(B).length;c(d+1.2,4.2,n?'📐<br>Khu đất '+B.tag+'<br><small>chặt '+n+' cây</small>':'🏠<br>Dựng nhà<br><small>'+B.tag+'</small>',()=>buildHouse(B.id),B)}}}}

setInterval(()=>{try{ensure();syncHouses();const dx=pos.x-lp[0],dy=pos.y-lp[1],l=Math.hypot(dx,dy);if(l>.04&&l<3)dir=[dx/l,dy/l];lp=[pos.x,pos.y];
 const ih=SH.IH&&SH.IH(),show=S.on&&!S.dead&&!ih&&(!!curBase()||!!nearSafe());BTN.style.display=show?'block':'none';if(mode){if(!show)stop();else tickGhost()}}catch(e){if(!XD.e1){XD.e1=String(e);console.warn('[XD15] tick',e)}}},150);
setInterval(()=>{try{net()}catch(e){}},2000);
setInterval(()=>{try{upd3()}catch(e){if(!XD.e3){XD.e3=String(e&&e.stack||e);console.warn('[XD15] 2.5D',e)}}},250);

const XD={ME,TYPES,COST,SAFE,LIST,YARD_NEW,PATH_W,can,place,remove,count,reach,reserved,need,siteRects,siteStatic,buildHouse,claim,canClaim,myNew,ensure,syncHouses,net,NET,blk:XB,mayBuild,baseAt,rectOf,panel,start,stop,confirm,
get ghost(){return GHOST},get mode(){return mode},get ver(){return ver},get seq(){return seq},safeBases};
globalThis.XD15=SH.XD15=XD;try{ensure()}catch(e){}
globalThis.XD15S={SAFE,SAFE_ID,safeBases,siteRects,ME};console.info('[XD15] xây dựng trong sân cố định + 10 nhà an toàn (bản thử) sẵn sàng');
})();
