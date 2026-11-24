/* =====================================================================
   N22 — HỆ THỐNG NHÀ & ĐẤT CẤP 1–5 (CHỈ BẢN TEST V2)
   Một hệ thống chung cho mọi căn cứ: Nhà Gỗ của người chơi + nhà bot (b16)
   + căn cứ đăng ký thêm sau này (NHA.add). Không sửa LIVE, không ghi save thật.
   LẦN 15: SÂN CỐ ĐỊNH (không nở theo cấp) – chỉ NHÀ nở đều 4 hướng quanh tâm · kiểm tra chỗ trống,
   lối vào trước khi nâng · thiếu chỗ/thiếu nguyên liệu → từ chối, KHÔNG trừ.
   ===================================================================== */
(function(){
const SH=globalThis.SH,S=SH.S,pos=SH.pos,X=SH.X;
const LV=[null,
 {n:'Nhà gỗ cũ',          hw:8.4, hd:6.4, lw:10,  ld:10,  mhp:200},
 {n:'Nhà gỗ sửa chữa',    hw:9,   hd:7,   lw:11.5,ld:11.5,mhp:350},
 {n:'Nhà gỗ gia cố',      hw:9.6, hd:7.6, lw:13,  ld:13,  mhp:550},
 {n:'Nhà 2 tầng kiên cố', hw:10.2,hd:8.2, lw:14.5,ld:14.5,mhp:750},
 {n:'Trụ sở sinh tồn',    hw:10.8,hd:8.8, lw:16,  ld:16,  mhp:1000}];
const COST=[null,null,{wood:15,stone:8},{wood:40,stone:20},{wood:60,stone:40,iron:10,bpH4:1},{wood:80,stone:60,iron:20,pmat:10,bpH5:1}];
const NMK={wood:'gỗ',stone:'đá',iron:'sắt',pmat:'vật liệu cao cấp',bpH4:'bản thiết kế nhà kiên cố',bpH5:'bản thiết kế trụ sở',eat:'thức ăn',plas:'nhựa'};
const BOT_MAX=3; // bot tự nâng tối đa cấp 3 (chỉ dùng gỗ + đá như trước)
const MIN_YARD=.75,MIN_FRONT=1.75;
/* LẦN 15: SÂN CỐ ĐỊNH – không còn nở theo cấp nhà. 6 căn cứ cũ: 16×16 m (= mức tối đa cơ chế cũ từng cho); nhà mới: yw/yd riêng (26 m). */
const YARD_OLD=16;const yW=B=>+(B.yw||(B.h&&B.h.yw))||YARD_OLD,yD=B=>+(B.yd||(B.h&&B.h.yd))||YARD_OLD;// sân tối thiểu mỗi bên / phía cửa (m)

/* ---------- ảnh 2D mặt trước theo cấp (AS dùng chung với 2D & 2.5D) ---------- */
// ảnh nhà 2D dựng bằng canvas (n22gfx.js) – không dùng ảnh mẫu
const GK=(B,lv,vi)=>globalThis.N22GFX?N22GFX.key(lv,vi,hW(B,lv),LV[lv].hd):'house1';

/* ---------- sổ căn cứ ---------- */
// kind 'p' = nhà người chơi (tường rỗng, có cửa, vào được) · 'b' = nhà bot (khối đặc, b16)
const PB={id:'nhago',kind:'p',name:'Nhà Gỗ',owner:'player',cx:0,cy:0,lv:1,hp:LV[1].mhp,ow:0,site:'na_go'};
const EXTRA=[];// căn cứ đăng ký thêm (10 căn cứ mới sẽ dùng đúng hệ thống này)
const B16H=()=>(globalThis.B16&&B16.HOUSES)||[];
const ofBot=h=>({id:h.id,kind:'b',name:h.reg||h.owner,owner:h.owner,cx:h.x,cy:h.y-1.6,get lv(){return h.lv},hp:h.hp,ow:h.ow||0,h});
function bases(){return[PB,...B16H().map(ofBot),...EXTRA.filter(b=>b.st!=='home')]}
function get(id){if(id==='nhago')return PB;const h=B16H().find(q=>q.id===id);if(h)return ofBot(h);return EXTRA.find(q=>q.id===id)||null}
const hW=(B,lv)=>Math.max(LV[lv].hw,B.ow&&lv===B.lv?B.ow:0);
function houseRect(B,lv){const w=hW(B,lv)/2,d=LV[lv].hd/2;return[B.cx-w,B.cy-d,B.cx+w,B.cy+d]}
function lotRect(B,lv){const w=Math.max(yW(B),hW(B,B.lv)+2*MIN_YARD)/2,d=yD(B)/2;return[B.cx-w,B.cy-d,B.cx+w,B.cy+d]}// sân cố định: tham số lv giữ cho tương thích, KHÔNG còn ảnh hưởng
const ovl=(a,b,m=0)=>a[0]<b[2]+m&&a[2]>b[0]-m&&a[1]<b[3]+m&&a[3]>b[1]-m;
const inR=(r,x,y,m=0)=>x>r[0]-m&&x<r[2]+m&&y>r[1]-m&&y<r[3]+m;
const f1=v=>(Math.round(v*100)/100).toString().replace('.',',');

/* ---------- KIỂM TRA CHỖ TRỐNG + LỐI VÀO ---------- */
function water(x,y){const W=globalThis.W15;if(W&&W.depthAt(x,y)>.06)return true;return!!(SH.deepAt&&SH.deepAt(x,y,0))}
function road(x,y,B){const M=globalThis.W15&&W15.M3;const s=M&&M.roadAt(x,y,0);if(!s)return 0;return B&&s.r&&s.r.n==='Lối vào nhà '+B.name?2:1}// 2 = lối vào riêng của chính căn cứ này (được phép)
function bridge(x,y){const M=globalThis.W15&&W15.M3;return!!(M&&M.deckAt(x,y,0))}
function obst(x,y,m){if(X.hitC(x,y,m))return'vật cản';const W=globalThis.W15;if(W&&W.colHit&&W.colHit(x,y,m))return'vật cản';
 for(const t of SH.trees)if(t.hp>0&&Math.abs(t.x-x)<.6+m&&Math.abs(t.y-y)<.6+m)return'cây';return null}
function check(id,lv){
 const B=get(id),why=[];if(!B)return{ok:false,why:[['base','Không có căn cứ '+id]]};
 if(!(lv>=1&&lv<=5))return{ok:false,why:[['lv','Cấp không hợp lệ']]};
 const H=houseRect(B,lv),L=lotRect(B,lv),H0=houseRect(B,B.lv),add=(k,m)=>{if(!why.some(w=>w[0]===k))why.push([k,m])};
 // nhà mục tiêu nhỏ hơn nhà hiện có → không thu nhỏ
 if(H[2]-H[0]<H0[2]-H0[0]-1e-6||H[3]-H[1]<H0[3]-H0[1]-1e-6)add('nho','Nhà mục tiêu nhỏ hơn nhà hiện tại – không thu nhỏ');
 const W=SH.WB;if(H[0]<W.x0||H[2]>W.x1||H[1]<W.y0||H[3]>W.y1)add('bien','Nhà vượt ra ngoài bản đồ');
 for(const o of bases())if(o.id!==id){if(o.kind==='x'&&o.st!=='built')continue;if(ovl(H,houseRect(o,o.lv),.2))add('nha:'+o.id,'Chạm nhà của '+o.name)}
 for(const b of SH.blds){if(b===SH.cab&&id==='nhago')continue;if(ovl(H,[b.x0,b.y0,b.x1,b.y1]))add('toa:'+(b.spr||b.x0),'Nhà chồng lên công trình khác ('+(b.spr||'nhà')+')')}
 // lấy mẫu đất 0,5 m: nước · đường · cầu
 let nw=0,nr=0,nb=0,nown=0;for(let x=H[0]+.25;x<H[2];x+=.5)for(let y=H[1]+.25;y<H[3];y+=.5){if(inR(H0,x,y,.12))continue;if(bridge(x,y))nb++;else if(water(x,y))nw++;const rd=road(x,y,B);if(rd===1)nr++;else if(rd===2)nown++}
 if(nw)add('nuoc','Nhà lấn sông/suối/hồ ('+nw+' ô 0,5 m)');if(nr)add('duong','Nhà lấn đường ('+nr+' ô 0,5 m)');if(nb)add('cau','Nhà lấn cầu ('+nb+' ô)');
 if(globalThis.XD15)for(const q of XD15.LIST){const R=XD15.rectOf(q.t,q.x,q.y);if(ovl(H,R)&&!ovl(H0,R,-.05)){add('ctr','Phần nhà mở rộng vướng công trình đã xây');break}}
 // phần nhà nở thêm (vành giữa nhà cũ và nhà mới) phải trống
 let no=0,firstO=null;for(let x=H[0]+.17;x<H[2];x+=.33)for(let y=H[1]+.17;y<H[3];y+=.33){if(inR(H0,x,y,.12))continue;const o=obst(x,y,.05);if(o){no++;firstO=firstO||o}}
 if(no)add('vatcan','Phần nhà mở rộng vướng '+firstO+' ('+no+' điểm)');
 if(globalThis.F5&&F5.barrels)for(const b of F5.barrels)if(inR(H,b.x,b.y,.45)&&!inR(H0,b.x,b.y,-.1))add('thung','Thùng nước nằm trong phần nhà mở rộng – hãy dời đi');
 // sân tối thiểu + lối vào cửa (rộng 2,4 m, dài 2,5 m trước cửa)
 const yx=Math.min(H[0]-L[0],L[2]-H[2]),yf=L[3]-H[3];if(yx<MIN_YARD-1e-6||yf<MIN_FRONT-1e-6)add('san','Không còn sân sử dụng được');
 let nd=0;for(let x=B.cx-1.2;x<=B.cx+1.21;x+=.4)for(let y=H[3]+.35;y<=H[3]+2.5;y+=.4){if(water(x,y)||obst(x,y,.05))nd++;for(const o of bases())if(o.id!==id&&inR(lotRect(o,o.lv),x,y)){nd++;break}}
 if(nd)add('loivao','Lối vào cửa bị chặn ('+nd+' điểm)');
 return{ok:!why.length,why,H,L,H0,ownRoad:nown,yard:{x:+yx.toFixed(2),front:+yf.toFixed(2),back:+(H[1]-L[1]).toFixed(2)}}}

/* ---------- đẩy người/quái/vật phẩm ra khỏi phần nhà mới (không kẹt) ---------- */
function free(x,y){return!X.hitC(x,y,.32)&&!water(x,y)}
function pushOut(o,R,m=.65){const c=[[R[0]-m,o.y],[R[2]+m,o.y],[o.x,R[1]-m],[o.x,R[3]+m]].map(p=>[p,Math.hypot(p[0]-o.x,p[1]-o.y)]).sort((a,b)=>a[1]-b[1]);
 for(const[p]of c)if(free(p[0],p[1])){o.x=p[0];o.y=p[1];return true}
 for(let r=1;r<8;r+=.5)for(let a=0;a<6.28;a+=.35){const x=(R[0]+R[2])/2+Math.cos(a)*((R[2]-R[0])/2+r),y=(R[1]+R[3])/2+Math.sin(a)*((R[3]-R[1])/2+r);if(free(x,y)&&!inR(R,x,y,.3)){o.x=x;o.y=y;return true}}return false}
function clearRing(B,H,H0){const moved=[],solid=B.kind!=='p';
 const hit=(x,y)=>solid?inR(H,x,y,.35):(inR(H,x,y,.35)&&!inR(H0,x,y,-.45));// nhà rỗng: chỉ vành mới + dải tường mới
 const wallBand=(x,y)=>!solid&&inR(H,x,y,.35)&&!inR(H,x,y,-.5);// dải tường mới của nhà rỗng
 const doIt=(o,k)=>{if(hit(o.x,o.y)||wallBand(o.x,o.y)){const bx=o.x,by=o.y;pushOut(o,H);moved.push([k,+bx.toFixed(2),+by.toFixed(2),+o.x.toFixed(2),+o.y.toFixed(2)])}};
 doIt(pos,'người chơi');for(const e of SH.ens)if(!e.dead&&e.hp>0)doIt(e,'quái');for(const b of(globalThis.B16?B16.BOTS:[]))if(!b.inside&&!b.dead)doIt(b,'bot '+b.n);
 for(const it of SH.items)if(it&&typeof it.x=='number')doIt(it,'vật phẩm');return moved}

/* ---------- áp dụng kích thước: nhà người chơi (tường rỗng) ---------- */
function setCab(lv){const c=SH.cab,R=houseRect(PB,lv),[x0,y0,x1,y1]=R;c.gc=PB.cx;
 for(const w of c.Wl){const i=SH.cols.findIndex(q=>q.x0===w[0]&&q.x1===w[1]&&q.z0===w[2]&&q.z1===w[3]);if(i>=0)SH.cols.splice(i,1)}
 const t=.4,gc=c.gc,gw=c.gw,Wl=[],seg=(a,b,p,q)=>{if(b-a>.05&&q-p>.05){Wl.push([a,b,p,q]);SH.cols.push({x0:a,x1:b,z0:p,z1:q})}};
 seg(x0,x1,y0,y0+t);seg(x0,gc-gw,y1-t,y1);seg(gc+gw,x1,y1-t,y1);seg(x0,x0+t,y0,y1);seg(x1-t,x1,y0,y1);
 c.x0=x0;c.y0=y0;c.x1=x1;c.y1=y1;c.Wl=Wl;c.spr=GK(PB,lv,0);c.n22=lv;const dc=SH.dc;dc.x0=gc-gw;dc.x1=gc+gw;dc.z0=y1-t;dc.z1=y1;
 SH.colsDirty();rebuild3(c)}
function rebuild3(b){const V=SH.V25;if(!V||!V.Z21)return;const M=V.Z21.BREC,r=M.get(b);if(!r)return;r.g.parent&&r.g.parent.remove(r.g);r.g.traverse(o=>{if(o.geometry&&o.geometry.dispose&&!o.geometry.__shared)o.geometry.dispose()});M.delete(b)}
/* ---------- áp dụng: nhà bot (khối đặc) ---------- */
function setBotCol(h){if(h.col){const i=SH.cols.indexOf(h.col);if(i>=0)SH.cols.splice(i,1)}const r=houseRect(ofBot(h),h.lv);h.col={x0:r[0],x1:r[2],z0:r[1],z1:r[3],b16:1};SH.cols.push(h.col);SH.colsDirty()}

function applyLv(id,lv,o={}){const B=get(id);const H0=houseRect(B,B.lv),H=houseRect(B,lv);let moved=[];const same=H.every((v,i)=>Math.abs(v-H0[i])<1e-9);const CR=(a,b,c)=>o.load||same?[]:clearRing(a,b,c);
 if(B.kind==='p'){PB.lv=lv;PB.mhp=LV[lv].mhp;if(!o.keepHp)PB.hp=LV[lv].mhp;moved=CR(B,H,H0);setCab(lv);S.hl=lv}
 else if(B.h){const h=B.h;if(lv!==h.lv&&!o.keepOw)h.ow=0;h.lv=lv;h.mhp=LV[lv].mhp;if(!o.keepHp)h.hp=h.mhp;moved=CR(B,H,H0);setBotCol(h)}
 else{B.lv=lv;B.hp=LV[lv].mhp;moved=CR(B,H,H0)}
 LOG.push({t:Date.now(),id,lv,moved});if(LOG.length>40)LOG.shift();lotDirty=1;return moved}

/* ---------- NÂNG CẤP NGUYÊN TỬ: kiểm tra chỗ → kiểm tra nguyên liệu → trừ → áp dụng ---------- */
const have=k=>k==='eat'?S.eat:(S[k]|0);
function costTxt(c){return Object.keys(c).map(k=>c[k]+' '+(NMK[k]||k)).join(' + ')}
function upgrade(id,o={}){const B=get(id),say=m=>{if(o.say!==false&&SH.say)SH.say(m)};
 if(!B)return{ok:false,code:'base'};const lv=B.lv;if(lv>=5){say('🏠 Nhà đã ở cấp tối đa (5)');return{ok:false,code:'max'}}
 const c=check(id,lv+1);if(!c.ok){say('⛔ Không đủ chỗ để nâng cấp: '+c.why[0][1]+(c.why.length>1?' (+'+(c.why.length-1)+' lý do)':''));return{ok:false,code:'space',why:c.why}}
 const cost=COST[lv+1],pay=o.pay||{have,take:(k,n)=>{if(k==='eat')S.eat-=n;else S[k]-=n}};
 const miss=Object.keys(cost).filter(k=>pay.have(k)<cost[k]);if(miss.length){say('⛔ Thiếu nguyên liệu: '+miss.map(k=>(NMK[k]||k)+' '+pay.have(k)+'/'+cost[k]).join(', '));return{ok:false,code:'cost',miss}}
 for(const k in cost)pay.take(k,cost[k]);const moved=applyLv(id,lv+1);
 say('🏠 Đã nâng cấp lên cấp '+(lv+1)+' · '+LV[lv+1].n+' · nhà '+f1(LV[lv+1].hw)+'×'+f1(LV[lv+1].hd)+' m · sân giữ nguyên '+f1(yW(B))+'×'+f1(yD(B))+' m');
 return{ok:true,lv:lv+1,moved}}
function recipe(){const lv=PB.lv,n=lv+1;if(lv>=5)return{n:'Nhà đã đạt cấp tối đa',ic:'🏰',d:LV[5].n+' · nhà 10,8×8,8 m · sân cố định '+f1(yW(PB))+'×'+f1(yD(PB))+' m',cost:{},ok:()=>false,no:'Cấp 5',run:()=>upgrade('nhago')};
 const L=LV[n];return{n:'Nâng cấp nhà lên cấp '+n+' · '+L.n,ic:'🏠',d:'Nhà '+f1(L.hw)+'×'+f1(L.hd)+' m · sân cố định '+f1(yW(PB))+'×'+f1(yD(PB))+' m (không mở rộng) · độ bền '+L.mhp+(n===2?' · mở khóa bếp nấu ăn':'')+' · kiểm tra chỗ trống trước khi trừ nguyên liệu',cost:COST[n],ok:()=>PB.lv<5,no:'Cấp tối đa',run:()=>upgrade('nhago')}}

/* ---------- API cho b16 (nhà bot dùng chung hệ thống) ---------- */
const botRect=(h,m=0)=>{const r=houseRect(ofBot(h),h.lv);return[r[0]-m,r[1]-m,r[2]+m,r[3]+m]};
const botDoor=h=>{const r=houseRect(ofBot(h),h.lv);return[h.x,r[3]+1.3]};
const botVis=h=>{const B=ofBot(h),r=houseRect(B,h.lv);return{k:GK(B,h.lv,1+B16H().indexOf(h)),w:(r[2]-r[0])*1.06,front:r[3]}};
const botCost=h=>h.lv<BOT_MAX?COST[h.lv+1]:null;
function botTry(h,pay){if(h.lv>=BOT_MAX)return false;const r=upgrade(h.id,{say:false,pay});return r.ok}

/* ---------- vẽ ranh giới đất (2D) ---------- */
let lotDirty=1;
{const o=globalThis.F5&&F5.draw2;if(globalThis.F5)F5.draw2=(L,Xf,Yf,cx,cy,vw,vh,t,g,Z)=>{o&&o(L,Xf,Yf,cx,cy,vw,vh,t,g,Z);if(SH.IH())return;
 for(const B of bases()){const R=lotRect(B,B.lv);if(R[2]<cx-vw-2||R[0]>cx+vw+2||R[3]<cy-vh-2||R[1]>cy+vh+2)continue;L.push([-1e9,()=>drawLot(g,B,R,Xf,Yf,Z)])}}}
function drawLot(g,B,R,X,Y,Z){g.save();g.strokeStyle='rgba(255,236,170,.55)';g.lineWidth=Math.max(1,Z*.06);g.setLineDash([Z*.35,Z*.25]);g.strokeRect(X(R[0]),Y(R[1]),(R[2]-R[0])*Z,(R[3]-R[1])*Z);g.setLineDash([]);
 g.fillStyle='#6a4a2a';for(const[x,y]of[[R[0],R[1]],[R[2],R[1]],[R[0],R[3]],[R[2],R[3]]]){g.fillRect(X(x)-Z*.09,Y(y)-Z*.45,Z*.18,Z*.5);g.fillStyle='#d8c070';g.fillRect(X(x)-Z*.09,Y(y)-Z*.45,Z*.18,Z*.1);g.fillStyle='#6a4a2a'}g.restore()}

/* ---------- 2.5D: ranh giới đất + chi tiết theo cấp cho nhà người chơi ---------- */
const LOT3=new Map();
function upd3(){const V=SH.V25;if(!V||!V.on||!V.T15)return;const T=V.T15.T,scene=V.T15.scene;
 for(const B of bases()){const R=lotRect(B,B.lv),near=Math.abs(B.cx-pos.x)<60&&Math.abs(B.cy-pos.y)<50,key=R.join(',');let r=LOT3.get(B.id);
  if(r&&r.key!==key){scene.remove(r.g);r.g.traverse(o=>{o.geometry&&o.geometry.dispose()});LOT3.delete(B.id);r=null}
  if(!r&&near){const g=new T.Group();const pts=[[R[0],R[1]],[R[2],R[1]],[R[2],R[3]],[R[0],R[3]],[R[0],R[1]]].map(p=>new T.Vector3(p[0],.05,p[1]));
   const ln=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineDashedMaterial({color:0xffecaa,dashSize:.35,gapSize:.25,transparent:true,opacity:.7}));ln.computeLineDistances();g.add(ln);
   const pm=new T.MeshLambertMaterial({color:0x6a4a2a}),cm=new T.MeshLambertMaterial({color:0xd8c070});for(const[x,z]of[[R[0],R[1]],[R[2],R[1]],[R[0],R[3]],[R[2],R[3]]]){const p=new T.Mesh(new T.BoxGeometry(.16,.55,.16),pm);p.position.set(x,.275,z);g.add(p);const c=new T.Mesh(new T.BoxGeometry(.17,.1,.17),cm);c.position.set(x,.5,z);g.add(c)}
   scene.add(g);r={g,key};LOT3.set(B.id,r)}
  if(r)r.g.visible=near&&!SH.IH()}}

/* ---------- 2.5D: nhà bot dựng bằng CÙNG bộ dựng nhà theo cấp của nhà người chơi (v25 buildB, nhánh cabin) ---------- */
const BOT3=new Map();// id -> {b (khung nhà giả, không nằm trong SH.blds), key}
function botFrame(h){const r=houseRect(ofBot(h),h.lv),[x0,y0,x1,y1]=r,t=.4,gc=h.x,gw=1,Wl=[];const seg=(a,b,p,q)=>{if(b-a>.05&&q-p>.05)Wl.push([a,b,p,q])};
 seg(x0,x1,y0,y0+t);seg(x0,gc-gw,y1-t,y1);seg(gc+gw,x1,y1-t,y1);seg(x0,x0+t,y0,y1);seg(x1-t,x1,y0,y1);
 return{x0,y0,x1,y1,Wl,side:'s',gc,gw,cabin:1,botH:h,a:1,roof:'#7a3b2a',fl:'#7a5a38'}}
function bot3(){const V=SH.V25;if(!V||!V.on||!V.buildB||!V.Z21)return;const M=V.Z21.BREC;
 for(const h of B16H()){const near=Math.abs(h.x-pos.x)<70&&Math.abs(h.y-pos.y)<60,key=h.lv+'|'+(h.ow||0)+'|'+h.x+'|'+h.y;let r=BOT3.get(h.id);
  if(r&&(r.key!==key||!M.has(r.b))){const q=M.get(r.b);if(q){q.g.parent&&q.g.parent.remove(q.g);M.delete(r.b)}BOT3.delete(h.id);r=null}
  if(!r&&near){const b=botFrame(h);V.buildB(b);r={b,key};BOT3.set(h.id,r)}
  if(r){const q=M.get(r.b);if(q)q.g.visible=near}}}
/* ---------- lối đi lát nối cửa tới đầu lối vào riêng (nhà An, Bình) – chỉ hình, không va chạm ---------- */
function drive(B){const M=globalThis.W15&&W15.M3;if(!M||!M.RSG)return null;for(const s of M.RSG){if(!s.r||s.r.n!=='Lối vào nhà '+B.name)continue;const e=[s.a,s.b].sort((p,q)=>Math.hypot(p[0]-B.cx,p[1]-B.cy)-Math.hypot(q[0]-B.cx,q[1]-B.cy))[0];return{x:e[0],y:e[1],hw:s.r.hw}}return null}
function walk(B){const d=drive(B);if(!d)return null;const H=houseRect(B,B.lv),y0=H[3],y1=d.y-d.hw+.35;if(y1-y0<.05)return null;return[B.cx-1.1,y0,B.cx+1.1,y1]}
{const o=globalThis.F5&&F5.draw2;if(globalThis.F5)F5.draw2=(L,Xf,Yf,cx,cy,vw,vh,t,g,Z)=>{o&&o(L,Xf,Yf,cx,cy,vw,vh,t,g,Z);if(SH.IH())return;
 for(const B of bases()){if(Math.abs(B.cx-cx)>vw+10||Math.abs(B.cy-cy)>vh+12)continue;const w=walk(B);if(!w)continue;L.push([-1e9+1,()=>{g.save();g.fillStyle='#9a8466';g.fillRect(Xf(w[0]),Yf(w[1]),(w[2]-w[0])*Z,(w[3]-w[1])*Z);g.fillStyle='rgba(60,40,20,.35)';for(let y=w[1]+.45;y<w[3];y+=.6)g.fillRect(Xf(w[0]),Yf(y),(w[2]-w[0])*Z,Math.max(1,Z*.05));g.restore()}])}}}
const WALK3=new Map();
function walk3(){const V=SH.V25;if(!V||!V.on||!V.T15)return;const T=V.T15.T,scene=V.T15.scene;
 for(const B of bases()){const w=walk(B),key=w?w.join(','):'',near=Math.abs(B.cx-pos.x)<60&&Math.abs(B.cy-pos.y)<50;let r=WALK3.get(B.id);
  if(r&&r.key!==key){scene.remove(r.m);r.m.geometry.dispose();WALK3.delete(B.id);r=null}
  if(!r&&w&&near){const g=new T.PlaneGeometry(w[2]-w[0],w[3]-w[1]);g.rotateX(-Math.PI/2);const m=new T.Mesh(g,new T.MeshLambertMaterial({color:0x9a8466}));m.position.set((w[0]+w[2])/2,.03,(w[1]+w[3])/2);m.renderOrder=-3;scene.add(m);r={m,key};WALK3.set(B.id,r)}
  if(r)r.m.visible=near&&!SH.IH()}}
setInterval(()=>{try{upd3();bot3();walk3()}catch(e){if(!upd3.e){upd3.e=1;console.warn('[N22] 2.5D',e)}}},300);

/* chi tiết 3D theo cấp – gọi từ v25 buildB (nhánh cabin); không thêm va chạm */
function lvOf3(b){return b.botH?b.botH.lv:b===SH.cab?PB.lv:1}
function deco3(b,g,rec,K){const lv=lvOf3(b);const{T,B,lam,kitM,H}=K,x0=b.x0,x1=b.x1,z0=b.y0,z1=b.y1,cx=(x0+x1)/2,W=x1-x0,D=z1-z0,RX=rec.roofX||(rec.roofX=[]);
 if(b.botH){// nhà bot: khối đặc → cửa 2 cánh đóng ở đúng khe cửa gameplay (giữa tường trước)
  const dm=kitM('door');B(g,b.gw,2.5,.12,dm,b.gc-b.gw/2,0,z1-.2);B(g,b.gw,2.5,.12,dm,b.gc+b.gw/2,0,z1-.2)}
 if(lv<=1)return;
 const top=H+.25,hr=2.2;// mái: từ H+.25 lên +2.2 ở sống mái (chiều z)
 const roofY=(z)=>top+hr*(1-Math.abs(z-(z0+z1)/2)/(D/2+.5));
 const glow=lam('#ffcf6a',{emissive:0xffa030,emissiveIntensity:.9});
 const stone=lam('#77736d',{map:K.TX.plaster});
 if(lv>=2&&lv<=4){// ống khói kim loại
  const q=new T.Group();const ch=new T.Mesh(new T.CylinderGeometry(.22,.24,1.6,12),lam('#9aa0a8'));ch.position.set(x1-1.3,roofY(z0+D*.3)+.5,z0+D*.3);q.add(ch);const cap=new T.Mesh(new T.CylinderGeometry(.34,.28,.18,12),lam('#7a8088'));cap.position.set(x1-1.3,roofY(z0+D*.3)+1.36,z0+D*.3);q.add(cap);g.add(q);RX.push(q)}
 if(lv>=2){// mái hiên trước cửa (trên đầu, không chặn đường) + đèn cửa sổ ấm
  const aw=new T.Group();const rm=lv>=3?lam('#93a2b8',{map:K.TX.roof}):kitM('roof');const p=new T.Mesh(new T.BoxGeometry(3.4,.12,1.1),rm);p.position.set(b.gc+.0,2.75,z1+.45);p.rotation.x=.28;aw.add(p);
  for(const sx of[-1,1]){const br=B(aw,.12,.12,.9,kitM('post'),b.gc+sx*1.55,2.45,z1+.45);br.rotation.x=-.5}g.add(aw);
  for(const w of rec.win){if(w.material){w.material=w.material.clone();w.material.emissive=new T.Color(lv>=5?0xffb040:0xff9a30);w.material.emissiveIntensity=.55}}}
 if(lv>=3){// chân tường đá + tấm pin mặt trời + mái tôn xanh xám
  const sm=stone;for(const[a,bq,c,d]of b.Wl){const m=new T.Mesh(new T.BoxGeometry(bq-a+.12,.95,d-c+.12),sm);m.position.set((a+bq)/2,.475,(c+d)/2);g.add(m)}
  if(rec.roof&&lv<5){rec.roof.material=lam('#93a2b8',{map:K.TX.roof,side:T.DoubleSide});rec.roofOwn=0}// mái tôn xanh xám (theo mẫu cấp 3–4)
  const sp=new T.Group();const pz=z0+D*.28,py=roofY(pz)+.08;const pan=new T.Mesh(new T.BoxGeometry(2.6,.08,1.5),lam('#24407a',{emissive:0x0a1a40}));pan.position.set(cx-.6,py,pz);pan.rotation.x=-.62;sp.add(pan);
  for(let i=-2;i<=2;i++){const l=new T.Mesh(new T.BoxGeometry(.03,.09,1.5),lam('#c8d0dc'));l.position.set(cx-.6+i*.5,py+.01,pz);l.rotation.x=-.62;sp.add(l)}g.add(sp);RX.push(sp)}
 if(lv>=4){// tầng 2: dải ban công + lan can phía trước; bồn nước trên mái
  if(lv===4){const bal=new T.Group(),wm=kitM('post');B(bal,W*.55,.18,1.0,wm,x0+W*.3,2.95,z1+.45);B(bal,W*.55,.08,.08,wm,x0+W*.3,3.85,z1+.92);for(let i=0;i<=8;i++)B(bal,.07,.85,.07,wm,x0+W*.3-W*.275+i*W*.55/8,3.05,z1+.92);g.add(bal);}
  for(const w of rec.win)if(w.position.y<3){const w2=w.clone();w2.position.y+=2.6;g.add(w2)}
  if(lv===4){const tw=new T.Group();const tk=new T.Mesh(new T.CylinderGeometry(.75,.75,1.3,16),lam('#a8b0b8'));const tz=z0+D*.22;tk.position.set(x1-.9,roofY(tz)+1.2,tz);tw.add(tk);const tc=new T.Mesh(new T.ConeGeometry(.8,.35,16),lam('#8a9098'));tc.position.set(x1-.9,roofY(tz)+2.02,tz);tw.add(tc);
  for(const[a,c]of[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]]){const l=new T.Mesh(new T.BoxGeometry(.08,.9,.08),lam('#4a4e56'));l.position.set(x1-.9+a,roofY(tz)+.2,tz+c);tw.add(l)}g.add(tw);RX.push(tw)}}
 if(lv>=5){// trụ sở: tường bê tông (đặt ở v25), mái bằng có tường chắn, tháp góc, băng rôn, đèn vàng, ăng-ten, chảo vệ tinh
  if(rec.roof){rec.roof.geometry=new T.BoxGeometry(W+.6,.35,D+.6);rec.roof.position.set(cx,H+.17,(z0+z1)/2);rec.roof.material=lam('#6e7178',{map:K.TX.plaster});rec.roofOwn=0}
  if(rec.ridge){g.remove(rec.ridge);const i=RX.indexOf(rec.ridge);if(i>=0)RX.splice(i,1)}
  const top5=new T.Group(),cm=lam('#7c7f86',{map:K.TX.plaster});B(top5,W+.6,.5,.25,cm,cx,H+.35,z0-.17);B(top5,W+.6,.5,.25,cm,cx,H+.35,z1+.17);B(top5,.25,.5,D+.6,cm,x0-.17,H+.35,(z0+z1)/2);B(top5,.25,.5,D+.6,cm,x1+.17,H+.35,(z0+z1)/2);
  for(const[x,z]of[[x0+.15,z0+.15],[x1-.15,z0+.15],[x0+.15,z1-.15],[x1-.15,z1-.15]]){B(g,.75,H+1.1,.75,cm,x,0,z);const l=B(top5,.22,.16,.22,glow,x,H+1.12,z)}
  for(let i=0;i<6;i++)B(top5,.18,.14,.08,glow,x0+.8+i*(W-1.6)/5,H-.25,z1+.47);
  const pz=(z0+z1)/2-1;const pan=new T.Mesh(new T.BoxGeometry(3.2,.08,1.8),lam('#24407a',{emissive:0x0a1a40}));pan.position.set(cx-1,H+.75,pz);pan.rotation.x=-.5;top5.add(pan);
  const ant=new T.Group();ant.position.set(x1-1.2,H+.35,z0+1.2);for(const[a,c]of[[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]]){const l=new T.Mesh(new T.CylinderGeometry(.04,.09,5.2,6),lam('#3a3e46'));l.position.set(a*(1),2.6,c);l.rotation.z=-a*.1;l.rotation.x=c*.1;ant.add(l)}
  for(let k=1;k<6;k++){const r=new T.Mesh(new T.BoxGeometry(.6-k*.08,.05,.05),lam('#3a3e46'));r.position.set(0,k*.9,0);ant.add(r)}const bl=new T.Mesh(new T.SphereGeometry(.12,8,6),lam('#ff4a3a',{emissive:0xff2010}));bl.position.set(0,5.25,0);ant.add(bl);top5.add(ant);
  const dish=new T.Mesh(new T.SphereGeometry(.85,16,8,0,Math.PI*2,0,Math.PI*.32),lam('#d8dce2',{side:T.DoubleSide}));dish.position.set(x0+1.6,H+1.5,z0+1.3);dish.rotation.x=-1.0;dish.rotation.z=.4;top5.add(dish);B(top5,.12,.9,.12,'#5a5e66',x0+1.6,H+.35,z0+1.3);
  g.add(top5);RX.push(top5);
  const ban=new T.Mesh(new T.PlaneGeometry(1.5,2.0),lam('#c0302a',{side:T.DoubleSide}));ban.position.set(b.gc,H-1.25,z1+.03);g.add(ban);const st=new T.Mesh(new T.CircleGeometry(.42,5),lam('#f4f0e8'));st.position.set(b.gc,H-1.15,z1+.04);g.add(st)}
}

/* =====================================================================
   2.5D: BỘ DỰNG NHÀ 3D CẤP 1–5 – DÙNG CHUNG cho Nhà Gỗ, 5 nhà bot và căn cứ sau này.
   Hình khối + vật liệu canvas tự vẽ (N22GFX.tex3), không dùng ảnh mẫu. Không thêm va chạm:
   tường 3D đặt đúng các đoạn tường gameplay (b.Wl); khe cửa = gc ± gw như gameplay.
   ===================================================================== */
const M3C=new Map();
function mat3(T,kind,col,o={}){const k=kind+'|'+col+'|'+(o.rep||'')+'|'+(o.em||'')+'|'+(o.side?1:0)+'|'+(o.tr?1:0);let m=M3C.get(k);if(m)return m;let map=null;
 if(kind){map=new T.CanvasTexture(N22GFX.tex3(kind));if(!o.once)map.wrapS=map.wrapT=T.RepeatWrapping;if(o.rep)map.repeat.set(o.rep,o.rep)}
 const p={color:col};if(map)p.map=map;if(o.side)p.side=T.DoubleSide;if(o.tr){p.transparent=true;p.alphaTest=.1}if(o.em){p.emissive=new T.Color(o.em);p.emissiveIntensity=o.ei||1}
 m=new T.MeshLambertMaterial(p);M3C.set(k,m);return m}
const hex=c=>'#'+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
function build3(b,g,rec,K){const{T,boxUV,roofGeo}=K,lv=lvOf3(b),vi=b.botH?(b.botH.vi!=null?b.botH.vi:1+B16H().indexOf(b.botH)):0,PAL=N22GFX.PAL[vi%N22GFX.PAL.length];
 const x0=b.x0,x1=b.x1,z0=b.y0,z1=b.y1,cx=(x0+x1)/2,cz=(z0+z1)/2,W=x1-x0,D=z1-z0,gc=b.gc,gw=b.gw;
 const RX=rec.roofX=[];rec.walls=rec.walls||[];rec.win=rec.win||[];
 const box=(w,h,d,m,x,y,z,tile,par)=>{const geo=boxUV(new T.BoxGeometry(w,h,d),w,h,d,tile||2);const me=new T.Mesh(geo,m);me.position.set(x,y+h/2,z);(par||g).add(me);return me};
 const fadeReg=(me,m,xa,xb,za,zb)=>rec.walls.push({m:me,mat:m,x0:xa,x1:xb,z0:za,z1:zb,hz:(xb-xa)>=(zb-za)});
 const wood=hex(PAL.wood.map(v=>v*1.25)),woodOld='#d6cec2',trimC=hex(PAL.trim.map(v=>v*1.35)),roofC=hex(PAL.roof.map(v=>v*.75+70)),metalC=hex(PAL.metal.map(v=>v*1.25));
 const L={1:{H:2.7,hr:1.9},2:{H:2.9,hr:2.1},3:{H:3.1,hr:2.2},4:{H:5.6,hr:2.3},5:{H:5.0,hr:0}}[lv],H=L.H;
 // ---- tường theo tầng ----
 const ST=lv===1?[[0,H,mat3(T,'plankOld',woodOld),2]]:lv===2?[[0,H,mat3(T,'plankH',wood),2]]:lv===3?[[0,1.1,mat3(T,'stone','#e0dcd6'),1.6],[1.1,H,mat3(T,'plankH',wood),2]]
  :lv===4?[[0,2.8,mat3(T,'stone','#e0dcd6'),1.6],[2.8,H,mat3(T,'plankH',wood),2]]:[[0,H,mat3(T,'concrete','#e8e8ea'),2.5]];
 for(const w of b.Wl){const ww=w[1]-w[0],dd=w[3]-w[2];if(ww<.02||dd<.02)continue;for(const[y0,y1,m,t]of ST){const me=box(ww,y1-y0,dd,m,(w[0]+w[1])/2,y0,(w[2]+w[3])/2,t);fadeReg(me,m,w[0],w[1],w[2],w[3])}}
 for(const[y0,y1,m,t]of ST){const a=Math.max(2.55,y0);if(y1<=a)continue;const me=box(2*gw,y1-a,.4,m,gc,a,z1-.2,t);fadeReg(me,m,gc-gw,gc+gw,z1-.4,z1)}// tường trên khe cửa
 // ---- sàn ----
 {const fg=new T.PlaneGeometry(W-.4,D-.4);fg.rotateX(-Math.PI/2);const u=fg.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,u.getX(i)*(W-.4)/2.4,u.getY(i)*(D-.4)/2.4);const fl=new T.Mesh(fg,mat3(T,lv>=5?'slab':'floor','#ffffff'));fl.position.set(cx,.012,cz);fl.renderOrder=-4;g.add(fl)}
 // ---- trụ góc / tháp góc ----
 const postM=lv>=5?mat3(T,'concrete','#d4d6da'):mat3(T,'plankV',trimC);const PW=lv>=5?1.3:.34,PH=lv>=5?H+1.5:H+.12;
 for(const[px,pz]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]]){const xx=px===x0?x0+PW/2-.02:x1-PW/2+.02,zz=pz===z0?z0+PW/2-.02:z1-PW/2+.02;const me=box(PW,PH,PW,postM,xx,0,zz,lv>=5?2.5:2);if(pz===z1)fadeReg(me,postM,xx-PW/2,xx+PW/2,zz-PW/2,zz+PW/2)}
 if(lv>=3&&lv<=4)for(const y of lv===3?[1.08,2.3]:[2.78]){const m=lv===3?mat3(T,'','#4a4e56'):mat3(T,'plankV',trimC);const me=box(W+.04,.14,.06,m,cx,y,z1+.03);fadeReg(me,m,x0,x1,z1-.1,z1+.06)}// đai sắt / dầm sàn tầng 2
 // ---- khung cửa ----
 {const fm=lv>=5?mat3(T,'','#5a5e66'):mat3(T,'plankV',trimC);for(const sx of[-1,1]){const me=box(.16,2.62,.12,fm,gc+sx*(gw+.06),0,z1+.04);fadeReg(me,fm,gc+sx*(gw+.06)-.08,gc+sx*(gw+.06)+.08,z1-.1,z1+.1)}const li=box(2*gw+.44,.16,.14,fm,gc,2.55,z1+.05);fadeReg(li,fm,gc-gw-.22,gc+gw+.22,z1-.1,z1+.12)}
 // cánh cửa: nhà bot (khối đặc) có 2 cánh đóng; nhà người chơi dùng 2 cánh cửa động có sẵn (đổi vật liệu theo cấp)
 const dk=['','doorOld','doorWood','doorIron','doorIron','doorSteel'][lv],dm=mat3(T,dk,'#ffffff',{once:1});
 if(b.botH)for(const sx of[-1,1])box(gw,2.5,.12,dm,gc+sx*gw/2,0,z1-.2);
 else{const V=SH.V25,dd=V&&V.cabinDoors&&V.cabinDoors();if(dd)for(const q of dd)q.traverse(o=>{if(o.isMesh)o.material=dm})}
 // ---- cửa sổ (mặt phẳng tự vẽ, sát mặt tường ngoài) ----
 const wk1=lv===1?['winBoard','winBroken']:lv>=5?['winMetal','winMetal']:['winLit','winLit'];
 const winAt=(kind,x,y,z,ry,w,h)=>{const m=mat3(T,kind,'#ffffff',{once:1,tr:1,side:1}).clone();const p=new T.Mesh(new T.PlaneGeometry(w||1.3,h||1.2),m);p.position.set(x,y,z);p.rotation.y=ry;g.add(p);rec.win.push(p);return p};
 const fx=Math.min(W/2-1.25,Math.max(2.4,W*.3));
 for(const[i,s]of[[0,-1],[1,1]]){winAt(wk1[i],gc+s*fx,1.75,z1+.03,0);if(lv>=4)winAt(lv>=5?'winMetal':'winLit',gc+s*fx,lv>=5?3.75:4.25,z1+.03,0)}
 if(lv===4)winAt('winLit',gc,4.25,z1+.03,0,1.2,1.1);
 for(const[s,xx]of[[-1,x0-.03],[1,x1+.03]]){winAt(wk1[s<0?0:1],xx,1.75,cz,s*Math.PI/2);if(lv>=4)winAt(lv>=5?'winMetal':'winLit',xx,lv>=5?3.75:4.25,cz,s*Math.PI/2)}
 // ---- mái ----
 const ov=.38;if(lv<=4){const rm=lv===1?mat3(T,'shingleOld','#e6ddd0',{side:1,rep:.55}):lv===2?mat3(T,'shingle',roofC,{side:1,rep:.55}):mat3(T,'metal',metalC,{side:1,rep:.7});
  const r=new T.Mesh(roofGeo(x0-ov,x1+ov,z0-ov,z1+ov,L.hr),rm);r.position.y=H;g.add(r);rec.roof=r;
  const rc=box(W+2*ov+.1,.18,.3,mat3(T,'plankV',trimC),cx,H+L.hr-.08,cz);RX.push(rc);
  const rY=z=>H+L.hr*(1-Math.abs(z-cz)/(D/2+ov));// cao độ mặt mái theo z
  const ang=Math.atan2(L.hr,D/2+ov);const onRoof=(w,d,m,x,z,lift)=>{const q=new T.Mesh(new T.BoxGeometry(w,.08,d),m);q.position.set(x,rY(z)+(lift||.06),z);q.rotation.x=z>cz?ang:-ang;g.add(q);RX.push(q);return q};
  if(lv===1){for(let i=0;i<5;i++){const z=cz+.6+((i*.37)%1)*D*.35,x=x0+1+((i*2.3)%(W-2));onRoof(.5,.35,mat3(T,'','#2a1e16'),x,z,.03)}onRoof(1.8,1.3,mat3(T,'','#5a6a78'),x0+W*.68,cz+D*.25,.05)}// ngói vỡ + tấm bạt vá
  if(lv>=2){const chx=x1-1.3,chz=cz-D*.2;const ch=new T.Group();const c1=new T.Mesh(new T.CylinderGeometry(.22,.24,1.7,12),mat3(T,'','#aeb4bc'));c1.position.set(chx,rY(chz)+.6,chz);ch.add(c1);const c2=new T.Mesh(new T.ConeGeometry(.42,.3,12),mat3(T,'','#8a9098'));c2.position.set(chx,rY(chz)+1.6,chz);ch.add(c2);g.add(ch);RX.push(ch)}
  if(lv>=3){const sp=lv===3?[[cx-1.2,3.2]]:[[cx-2.4,2.8],[cx+.9,2.8]];for(const[sx,sw]of sp){const pz=cz+D*.28;const fr=onRoof(sw+.16,1.86,mat3(T,'','#c8ccd2'),sx,pz,.08);const pn=onRoof(sw,1.7,mat3(T,'','#1f3a78',{em:0x0a1a40}),sx,pz,.1);for(let i=1;i<4;i++){const l=onRoof(.03,1.7,mat3(T,'','#9ab8e8'),sx-sw/2+i*sw/4,pz,.12)}}}
  if(lv===4){const tx=x1-1.6,tz=cz-D*.25,ty=rY(tz);const tw=new T.Group();for(const[a,c]of[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]]){const l=new T.Mesh(new T.BoxGeometry(.08,1.1,.08),mat3(T,'','#4a4e56'));l.position.set(tx+a,ty+.45,tz+c);tw.add(l)}
   const tk=new T.Mesh(new T.CylinderGeometry(.8,.8,1.4,16),mat3(T,'metal','#d0d6dc'));tk.position.set(tx,ty+1.7,tz);tw.add(tk);const tc=new T.Mesh(new T.ConeGeometry(.86,.4,16),mat3(T,'','#9aa2aa'));tc.position.set(tx,ty+2.6,tz);tw.add(tc);g.add(tw);RX.push(tw)}}
 else{// cấp 5: mái bằng bê tông + tường chắn + đèn + thiết bị trên mái
  const sl=box(W+.2,.3,D+.2,mat3(T,'slab','#ffffff'),cx,H-.05,cz,3);rec.roof=sl;
  const cm=mat3(T,'concrete','#cfd1d6'),top=new T.Group();for(const[w,d,x,z]of[[W+.3,.3,cx,z0-.0],[W+.3,.3,cx,z1],[.3,D+.3,x0,cz],[.3,D+.3,x1,cz]])box(w,.7,d,cm,x,H+.2,z,2.5,top);
  const gl=mat3(T,'','#ffd060',{em:0xffb030});for(let i=0;i<7;i++){const me=box(.32,.12,.06,gl,x0+1.7+i*(W-3.4)/6,H-.35,z1+.04);fadeReg(me,gl,me.position.x-.16,me.position.x+.16,z1-.1,z1+.1)}
  for(const[px,pz]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]]){const xx=px===x0?x0+.63:x1-.63,zz=pz===z0?z0+.63:z1-.63;box(.3,.3,.3,gl,xx,H+1.5,zz,1,top)}
  const pz=cz-.6;const pf=box(3.6,.08,2,mat3(T,'','#c8ccd2'),cx-.8,H+.75,pz,1,top);pf.rotation.x=-.45;const pn=box(3.4,.08,1.84,mat3(T,'','#1f3a78',{em:0x0a1a40}),cx-.8,H+.79,pz,1,top);pn.rotation.x=-.45;
  {const dx=x0+2.2,dz=z0+1.8;box(.14,1,.14,mat3(T,'','#5a5e66'),dx,H+.15,dz,1,top);const ds=new T.Mesh(new T.SphereGeometry(.9,16,8,0,Math.PI*2,0,Math.PI*.32),mat3(T,'','#e2e6ea',{side:1}));ds.position.set(dx,H+1.5,dz);ds.rotation.x=-1.0;ds.rotation.z=.5;top.add(ds)}
  {const ax=x1-1.9,az=z0+1.6,lm=mat3(T,'','#30343a');for(const[a,c]of[[-.35,-.35],[.35,-.35],[-.35,.35],[.35,.35]]){const l=new T.Mesh(new T.CylinderGeometry(.04,.07,5,6),lm);l.position.set(ax+a*.55,H+2.6,az+c*.55);l.rotation.z=-a*.12;l.rotation.x=c*.12;top.add(l)}for(let k=1;k<7;k++)box(.7-k*.07,.05,.05,lm,ax,H+.2+k*.7,az,1,top);const bl=new T.Mesh(new T.SphereGeometry(.14,8,6),mat3(T,'','#ff4a3a',{em:0xff2010}));bl.position.set(ax,H+5.2,az);top.add(bl)}
  for(let i=0;i<3;i++)box(.5,.4,.5,mat3(T,'','#8a8e94'),x0+3+i*1.2,H+.1,z0+1.3,1,top);
  g.add(top);RX.push(top);
  const bn=new T.Mesh(new T.PlaneGeometry(1.6,1.6),mat3(T,'banner'+PAL.banner.join(','),'#ffffff',{once:1,side:1}));bn.position.set(gc,3.55,z1+.06);g.add(bn);
  for(const[i,h]of[[0,.12],[1,.24]]){const st=box(2*gw+.6-i*.3,.12,.5-i*.2,mat3(T,'concrete','#e0e2e6'),gc,h-.12,z1+.25-i*.05,2.5)}}
 // ---- chi tiết theo cấp ở mặt trước (không chạm đất, không va chạm) ----
 if(lv===2||lv===3){// mái hiên trước cửa
  const am=lv===2?mat3(T,'shingle',roofC,{side:1}):mat3(T,'metal',metalC,{side:1});const aw=box(2*gw+1.4,.1,1.1,am,gc,2.75,z1+.5,1.6);aw.rotation.x=.3;fadeReg(aw,am,gc-gw-.7,gc+gw+.7,z1,z1+1.1);
  for(const sx of[-1,1]){const br=box(.1,.1,.9,mat3(T,'plankV',trimC),gc+sx*(gw+.55),2.45,z1+.4);br.rotation.x=-.55;fadeReg(br,br.material,gc+sx*(gw+.55)-.05,gc+sx*(gw+.55)+.05,z1,z1+.9)}}
 if(lv===2){const fb=box(1.4,.25,.25,mat3(T,'plankV',trimC),gc-fx,.95,z1+.15);fadeReg(fb,fb.material,gc-fx-.7,gc-fx+.7,z1,z1+.3);for(let i=0;i<5;i++){const fl=new T.Mesh(new T.SphereGeometry(.09,6,4),mat3(T,'',['#d94a5a','#f2c84a','#e86a9a'][i%3]));fl.position.set(gc-fx-.55+i*.27,1.25,z1+.15);g.add(fl)}}
 if(lv>=3){const lm=mat3(T,'','#ffcf6a',{em:0xffa030});for(const sx of lv>=4?[-1,1]:[-1]){const l=box(.2,.32,.16,lm,gc+sx*(gw+.45),2.2,z1+.08);fadeReg(l,lm,l.position.x-.1,l.position.x+.1,z1,z1+.16)}}
 if(lv===3)for(const s of[-1,1]){const m=mat3(T,'metal',metalC);const a=box(1.6,.06,.5,m,gc+s*fx,2.48,z1+.25,1.6);a.rotation.x=.35;fadeReg(a,m,gc+s*fx-.8,gc+s*fx+.8,z1,z1+.5)}
 if(lv===4){// ban công tầng 2 chạy dọc mặt trước
  const bm=mat3(T,'plankV',trimC),deck=box(W-.3,.16,1.05,bm,cx,2.78,z1+.52,2);fadeReg(deck,bm,x0,x1,z1,z1+1.05);
  const rail=box(W-.3,.1,.1,bm,cx,3.8,z1+1.0,2);fadeReg(rail,bm,x0,x1,z1+.9,z1+1.1);const rail2=box(W-.3,.08,.08,bm,cx,3.35,z1+1.0,2);fadeReg(rail2,bm,x0,x1,z1+.9,z1+1.1);
  for(let x=x0+.3;x<=x1-.25;x+=.55){const p=box(.08,.9,.08,bm,x,2.94,z1+1.0,2);fadeReg(p,bm,x-.04,x+.04,z1+.9,z1+1.1)}}
}

/* ---------- LƯU / TẢI (thế giới; chỉ localStorage của TEST V2) ---------- */
const LOG=[];
const SAVE=X.SAVE;
SAVE.register({id:'n22',scope:'world',version:1,defaults:()=>({}),
 get(){return{v:1,yard:1,bases:[{id:PB.id,owner:PB.owner,cx:PB.cx,cy:PB.cy,site:PB.site,none:PB.none?1:0,lv:PB.lv,hp:Math.round(PB.hp),yw:yW(PB),yd:yD(PB)}],extra:EXTRA.map(b=>({id:b.id,kind:b.kind,name:b.name,owner:b.owner,cx:b.cx,cy:b.cy,lv:b.lv,hp:b.hp,yw:yW(b),yd:yD(b),st:b.st||null}))}},
 set(d){if(!d||typeof d!=='object')return;globalThis.SAFEHOME54?.capturePlayer(d);const p=(d.bases||[]).find(q=>q&&q.id==='nhago');if(p){const lv=Math.max(1,Math.min(5,p.lv|0||1));PEND={lv,hp:+p.hp||LV[lv].mhp};const okN=v=>typeof v==='number'&&isFinite(v);if(okN(p.cx)&&okN(p.cy)&&typeof p.site==='string'&&globalThis.HOME24)HOME24.restore(p.site,p.cx,p.cy,!!p.none)}
  EXTRA.length=0;for(const b of d.extra||[])if(b&&b.id)EXTRA.push(Object.assign({kind:'x',ow:0},b));if(globalThis.XD15)try{XD15.ensure()}catch(_){}}});
let PEND=null;
// đồng bộ cấp nhà người chơi với S.hl (trường có sẵn trong save người chơi): khi tải save → dựng đúng kích thước, không kiểm tra/không trừ
function sync(){const want=Math.max(1,Math.min(5,(PEND&&PEND.lv)||S.hl||1));if(PEND){S.hl=want}
 if(want!==PB.lv||SH.cab.n22!==want){applyLv('nhago',want,{keepHp:!!PEND,load:true});if(PEND)PB.hp=Math.min(LV[want].mhp,PEND.hp)}PEND=null}
setInterval(()=>{try{sync()}catch(e){console.warn('[N22] sync',e)}},250);

function relocP(nx,ny,site,yw){PB.cx=nx;PB.cy=ny;PB.site=site;PB.yw=PB.yd=yw;setCab(PB.lv)}
const NHA={relocP,YARD_OLD,yardW:yW,yardD:yD,botFrame,GK,build3,bot3:true,BOT3,walk,drive,LV,COST,BOT_MAX,PB,EXTRA,bases,get,houseRect,lotRect,check,upgrade,applyLv,recipe,botRect,botDoor,botVis,botCost,botTry,setBotCol,deco3,lvOf3,sync,LOG,
 add(o){// đăng ký căn cứ mới (dùng cho 10 căn cứ sau này) – chưa dùng trong bước này
  if(!o||!o.id||get(o.id))return false;EXTRA.push(Object.assign({kind:'x',name:o.id,owner:'?',lv:1,hp:LV[1].mhp,ow:0},o));return true},
 info(id){const B=get(id);if(!B)return null;return{id:B.id,kind:B.kind,lv:B.lv,name:LV[B.lv].n,house:houseRect(B,B.lv),lot:lotRect(B,B.lv),center:[B.cx,B.cy],hp:B.kind==='p'?PB.hp:B.h?B.h.hp:B.hp}}};
globalThis.NHA=SH.NHA=NHA;
console.info('[N22] hệ thống nhà & đất cấp 1–5 sẵn sàng');
})();
