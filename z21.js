/* =====================================================================
   SAFE HAVEN – BẢN THỬ V2 · z21.js · MỤC 1: DỜI 14 CỤM NỘI DUNG CŨ
   Chạy SAU khi mọi module đã khởi tạo (nạp cuối cùng) và TRƯỚC khi v25
   vẽ khung hình đầu tiên (v25 chờ cờ Z21_READY).
   - ID cây & chữ ký thế giới đã được w15 chốt theo tọa độ cũ lúc tải →
     dời sau đó không đổi ID/chữ ký (được kiểm lại bằng Z21.audit()).
   - Mỗi đối tượng chỉ dời 1 lần (Set "done"); mỗi cụm tịnh tiến số mét nguyên.
   - K0 (căn cứ, bán kính 22 m quanh (0;3)) và nội thất (x ≥ INT_X0) không dời ở đây.
   ===================================================================== */
(()=>{
const SH=globalThis.SH,V=SH&&SH.V25,VZ=V&&V.Z21;
const T0=performance.now();
/* ---- bảng cụm (engine): tên khu cũ → dịch chuyển (dx,dy) ---- */
const CL_OLD={'Rừng Lục Ảnh':[-301,-634],'Tháp Hư Không':[1924,-977],'Hồ Ánh Nguyệt':[1657,401],'Thành Phố Trung Tâm':[239,-874],
 'Đại Học Astra':[2539,-308],'Di Tích Cổ':[2539,-308],'Vực Dung Nham':[2319,810],'Đỉnh Bạch Vân':[1556,-1307],'Hang Pha Lê':[2588,-1127],
 'Khu Công Nghiệp Zeta':[1609,826],'Cảng Hải Lam':[197,608],'Làng Phong Dư':[199,-491]};
const CL={"Rừng Lục Ảnh":[79.5,-146.75],"Tháp Hư Không":[667.5,-132.5],"Hồ Ánh Nguyệt":[451.0,103.0],"Thành Phố Trung Tâm":[-74.5,-213.75],"Đại Học Astra":[532.0,-133.25],"Di Tích Cổ":[532.0,-170.0],"Vực Dung Nham":[459.0,75.0],"Đỉnh Bạch Vân":[449.5,-215.0],"Hang Pha Lê":[563.0,-167.0],"Khu Công Nghiệp Zeta":[371.5,91.0],"Cảng Hải Lam":[161.0,61.75],"Làng Phong Dư":[204.5,-168.5]};// M26: phép dời mới (bản đồ 2.500 m)
const KID={'Rừng Lục Ảnh':'K1','Tháp Hư Không':'K2','Hồ Ánh Nguyệt':'K3','Thành Phố Trung Tâm':'K4','Đại Học Astra':'K5','Di Tích Cổ':'K6','Vực Dung Nham':'K7','Đỉnh Bạch Vân':'K8','Hang Pha Lê':'K9','Khu Công Nghiệp Zeta':'K10','Cảng Hải Lam':'K11','Làng Phong Dư':'K12'};
const MALL_T_OLD=[-598,-538];
const MALL_T=[-274.0,-181.5025];// K13 cửa hàng quần áo
const RECT={};for(const z of SH.ZN)RECT[z.n]=z.r.slice();
RECT['Cảng Hải Lam']=[-310,35.5,-44,189];// gồm dải biển phía tây
const OLDREG=[-340,-230,230,230];
/* MỤC 5: ghi toạ độ CŨ của đá & mỏ trước khi dời → bảng đổi khóa mỏ (MINE 'r'+x+y / 'm'+x) cho bản lưu v4 */
const ORIG_R=SH.ROCKS.filter(d=>!d.w15).map(d=>[d,d[1],d[2]]),ORIG_M=SH.MT.map(m=>[m,m.x,m.y]);// vùng bản đồ cũ (ngoài vùng này là w15/b16 → không dời)
const IX=globalThis.INT_X0||5000;
const mall=SH.blds.find(b=>b.spr==='mall'&&b.x0<IX);
const inR=(r,x,y,m=0)=>x>=r[0]-m&&x<=r[2]+m&&y>=r[1]-m&&y<=r[3]+m;
function zoneOf(x,y){
 if(!(x<IX))return null;
 if(Math.hypot(x,y-3)<22)return null;// K0
 if(x<OLDREG[0]||x>OLDREG[2]||y<OLDREG[1]||y>OLDREG[3])return null;
 if(mall&&inR([mall.x0,mall.y0,mall.x1,mall.y1],x,y,.6))return'__mall';
 // vùng chồng lấn gốc HAN∩Cảng (x −138..−44, y 36..115) là rừng + hồ nhỏ nằm trong vòng đường mòn Hồ Ánh Nguyệt → thuộc K3
 if(inR(RECT['Hồ Ánh Nguyệt'],x,y))return'Hồ Ánh Nguyệt';
 if(inR(RECT['Cảng Hải Lam'],x,y))return'Cảng Hải Lam';
 for(const n in CL)if(inR(RECT[n],x,y))return n;
 let best=null,bd=1e9;for(const n in CL){const r=RECT[n],dx=Math.max(r[0]-x,0,x-r[2]),dy=Math.max(r[1]-y,0,y-r[3]),d=Math.hypot(dx,dy);if(d<bd){bd=d;best=n}}
 return best}
const TT=z=>z==='__mall'?MALL_T:z?CL[z]:null;
globalThis.Z21M=(x,y,tag)=>{let z=zoneOf(x,y);if(tag==='v25city'&&x>=86&&x<IX)z='Thành Phố Trung Tâm';const t=TT(z);return t?[x+t[0],y+t[1]]:[x,y]};
/* ---- bộ đếm kiểm tra ---- */
const done=new Set(),cnt={},log=[];const inc=(k,z)=>{const key=k+'|'+(z==='__mall'?'K13':KID[z]||z);cnt[key]=(cnt[key]||0)+1};
let dbl=0;const once=o=>{if(done.has(o)){dbl++;return false}done.add(o);return true};
const mvXY=(o,t,kx='x',ky='y')=>{o[kx]+=t[0];o[ky]+=t[1]};
const mvRect=(r,t)=>{r.x0+=t[0];r.x1+=t[0];r.y0+=t[1];r.y1+=t[1]};
const mvArr4=(a,t)=>{a[0]+=t[0];a[2]+=t[0];a[1]+=t[1];a[3]+=t[1]};
/* ---- trước khi dời: ảnh chụp để kiểm ---- */
const before={ids:SH.trees.map(t=>t.id).join(','),sig:SH.WORLD&&SH.WORLD.sig,n:{blds:SH.blds.length,cols:SH.cols.length,trees:SH.trees.length,items:SH.items.length,ens:SH.ens.length,DEC:SH.DEC.length,ROCKS:SH.ROCKS.length,MT:SH.MT.length,LM:SH.LM.length,LAKES:SH.LAKES.length,props:SH.props.length}};
/* ---- 1) công trình + tường + nội thất 2D + va chạm thuộc công trình ---- */
const owner=new Map();
for(const b of SH.blds){if(!(b.x0<IX)||b.c17)continue;const z=b===mall?'__mall':zoneOf((b.x0+b.x1)/2,(b.y0+b.y1)/2);if(!z)continue;const t=TT(z);b._z21=z;
 for(const c of SH.cols)if(!owner.has(c)&&c.x0>=b.x0-.02&&c.x1<=b.x1+.02&&c.z0>=b.y0-.02&&c.z1<=b.y1+.02)owner.set(c,z);
 if(once(b)){b.x0+=t[0];b.x1+=t[0];b.gc+=t[0];b.y0+=t[1];b.y1+=t[1];(b.Wl||[]).forEach(w=>{w[0]+=t[0];w[1]+=t[0];w[2]+=t[1];w[3]+=t[1]});(b.fur||[]).forEach(f=>{f.x+=t[0];f.y+=t[1]});inc('blds',z)}
 const hr=VZ&&VZ.HRES.get(b);if(hr&&hr.rb&&once(hr.rb)){const r=hr.rb;r.x0+=t[0];r.x1+=t[0];r.y0+=t[1];r.y1+=t[1];if(r.gc!=null)r.gc+=t[0];(r.Wl||[]).forEach(w=>{w[0]+=t[0];w[1]+=t[0];w[2]+=t[1];w[3]+=t[1]});inc('v25.HRES',z)}}
/* ---- 2) va chạm (gồm va chạm của cây, đá, cửa, v25 EXTRA) ---- */
for(const c of SH.cols){if(c.c17||c.w15||c.b16||c.w15c||c.w15g||c.w15w||c.w15m||c.w15f||!(c.x0<IX))continue;/* MỤC 4: vật cản mới của thế giới v2 (vách, cổng, tường, trang trí thành phố) đã ở toạ độ mới → không dời */const z=owner.get(c)||zoneOf((c.x0+c.x1)/2,(c.z0+c.z1)/2);if(!z)continue;const t=TT(z);if(!once(c))continue;c.x0+=t[0];c.x1+=t[0];c.z0+=t[1];c.z1+=t[1];inc('cols',z)}
/* ---- 3) cây, vật phẩm, quái, trang trí ---- */
const regDone=new Set();const mvReg=(r,t)=>{if(!r||regDone.has(r)||!(r[0]<IX))return;regDone.add(r);mvArr4(r,t)};
for(const tr of SH.trees){if((tr.id||'').startsWith('w15'))continue;const z=zoneOf(tr.x,tr.y);if(!z)continue;const t=TT(z);if(!once(tr))continue;mvXY(tr,t);if(tr.c&&once(tr.c)){tr.c.x0+=t[0];tr.c.x1+=t[0];tr.c.z0+=t[1];tr.c.z1+=t[1]}inc('trees',z)}
for(const it of SH.items){const z=zoneOf(it.x,it.y);if(!z)continue;const t=TT(z);if(!once(it))continue;mvXY(it,t);mvReg(it.reg,t);inc('items',z)}
for(const e of SH.ens){if((e.id||'').startsWith('w15'))continue;const z=zoneOf(e.x,e.y);if(!z)continue;const t=TT(z);if(!once(e))continue;mvXY(e,t);if(isFinite(e.wx)){e.wx+=t[0];e.wy+=t[1]}mvReg(e.reg,t);inc('ens',z)}
const arrXY=(name,L,ix=1)=>{for(const d of L){if(d.w15)continue;const z=zoneOf(d[ix],d[ix+1]);if(!z)continue;const t=TT(z);if(!once(d))continue;d[ix]+=t[0];d[ix+1]+=t[1];if(d.col&&once(d.col)){d.col.x0+=t[0];d.col.x1+=t[0];d.col.z0+=t[1];d.col.z1+=t[1]}inc(name,z)}};
arrXY('DEC',SH.DEC);arrXY('ROCKS',SH.ROCKS);arrXY('LM',SH.LM);
for(const m of SH.MT){const z=zoneOf(m.x,m.y);if(!z)continue;const t=TT(z);if(once(m)){mvXY(m,t);inc('MT',z)}}
for(const l of SH.LAKES){const z=zoneOf(l.x,l.y);if(!z)continue;const t=TT(z);if(once(l)){mvXY(l,t);inc('LAKES',z)}}
for(const p of SH.props){const z=zoneOf((p[0]+p[2])/2,(p[1]+p[3])/2);if(!z)continue;const t=TT(z);if(once(p)){mvArr4(p,t);inc('props',z)}}
/* ---- 4) khu (ZN): khung + địa danh ---- */
for(const z of SH.ZN){const t=CL[z.n];if(!t)continue;if(once(z.r)){mvArr4(z.r,t);inc('ZN',z.n)}(z.loc||[]).forEach(l=>{if(once(l)){mvXY(l,t);inc('ZN.loc',z.n)}})}
/* ---- 5) Hồ Ánh Nguyệt: HOD (index), HO2 (f5), LK (v25) → toàn bộ theo K3 ---- */
{const z='Hồ Ánh Nguyệt',t=CL[z],H=SH.HOD,pt=p=>{if(once(p)){p[0]+=t[0];p[1]+=t[1]}};
 for(const p of H.paths||[])for(const q of p.pts)pt(q);
 if(H.creek&&H.creek.pts)for(const q of H.creek.pts)pt(q);
 for(const k of['mead','clear'])for(const o of H[k]||[])if(once(o)){mvXY(o,t);inc('HOD.'+k,z)}
 for(const k of['crocks','lotus','reeds','srocks','stones'])for(const a of H[k]||[])if(once(a)){if(Array.isArray(a)){a[0]+=t[0];a[1]+=t[1]}else mvXY(a,t);inc('HOD.'+k,z)}
 for(const k of['dock','boat','spring'])if(H[k]&&once(H[k])){mvXY(H[k],t);inc('HOD.'+k,z)}
 for(const a of H.locs||[])if(once(a)){a[2]+=t[0];a[3]+=t[1];inc('HOD.locs',z)}
 const O=SH.HO2;if(O){for(const k of['dec','cherry','lotus','rocks'])for(const a of O[k]||[])if(once(a)){a[1]+=t[0];a[2]+=t[1];if(a.col&&once(a.col)){a.col.x0+=t[0];a.col.x1+=t[0];a.col.z0+=t[1];a.col.z1+=t[1]}inc('HO2.'+k,z)}
  for(const a of O.uw||[])if(once(a)){a[0]+=t[0];a[1]+=t[1];inc('HO2.uw',z)}
  for(const a of O.casc||[])if(once(a)){mvXY(a,t);inc('HO2.casc',z)}
  if(O.fall&&once(O.fall)){mvXY(O.fall,t);inc('HO2.fall',z);const c=O.fall.col;if(c&&once(c)){c.x0+=t[0];c.x1+=t[0];c.z0+=t[1];c.z1+=t[1]}}}
 if(VZ){const L=VZ.LK;for(const k of['rocks','hides','melon','paths'])for(const o of L[k]||[])if(once(o)){if(Array.isArray(o.pts))o.pts.forEach(pt);else mvXY(o,t);inc('LK.'+k,z)}
  for(const r of L.rice||[])if(once(r)){mvXY(r,t);(r.parts||[]).forEach(p=>{if(once(p))mvXY(p,t)});inc('LK.rice',z)}}}
/* ---- 6) v25: phố, quy hoạch thành phố, cây xăng, cửa hàng, nhà phố ---- */
if(VZ){
 const rz=r=>zoneOf((r.x0+r.x1)/2,(r.y0+r.y1)/2);
 const city='Thành Phố Trung Tâm';
 for(const r of[...VZ.CITY_ST,...VZ.PLAN,VZ.PLAZA,VZ.PARK,VZ.CITY_STORE,...VZ.GAS_CITY]){const t=CL[city];if(once(r)){mvRect(r,t);if(r.fx!=null){r.fx+=t[0];r.fy+=t[1]}inc('v25.city',city)}}
 for(const c of VZ.CTREES)if(once(c)){const t=c[0]>=86?CL[city]:TT(zoneOf(c[0],c[1]));if(t){c[0]+=t[0];c[1]+=t[1];inc('v25.CTREES',city)}}
 // đường phố 2.5D: cắt theo khung cụm chiếm phần lớn; đoạn nằm giữa hai cụm thì bỏ
 const keep=[];let dropped=0,clipped=0;
 for(const r of VZ.ROADS){if(done.has(r)){keep.push(r);continue}
  let best=null,ba=0;for(const n in CL){const R=RECT[n],x0=Math.max(r.x0,R[0]),x1=Math.min(r.x1,R[2]),y0=Math.max(r.y0,R[1]),y1=Math.min(r.y1,R[3]),a=Math.max(0,x1-x0)*Math.max(0,y1-y0);if(a>ba){ba=a;best=n}}
  const A=(r.x1-r.x0)*(r.y1-r.y0);if(!best||ba<A*.3){dropped++;continue}
  const R=RECT[best];if(ba<A*.999){r.x0=Math.max(r.x0,R[0]);r.x1=Math.min(r.x1,R[2]);r.y0=Math.max(r.y0,R[1]);r.y1=Math.min(r.y1,R[3]);clipped++}
  once(r);mvRect(r,CL[best]);inc('v25.ROADS',best);keep.push(r)}
 VZ.ROADS.length=0;VZ.ROADS.push(...keep);log.push('đường phố 2.5D: giữ '+keep.length+', cắt '+clipped+', bỏ '+dropped);
 for(const g of VZ.GAS){const z=rz(g.rect);const t=TT(z);if(!t)continue;if(once(g.rect))mvRect(g.rect,t);(g.pumps||[]).forEach(p=>{if(once(p)){p[0]+=t[0];p[1]+=t[1]}});if(g.barrel&&once(g.barrel)){g.barrel[0]+=t[0];g.barrel[1]+=t[1]}inc('v25.GAS',z)}
 for(const s of VZ.STORES){const z=rz(s.rect);const t=TT(z);if(!t)continue;if(once(s.rect))mvRect(s.rect,t);if(s.fb&&once(s.fb)){/* đã dời ở bước công trình nếu nằm trong blds */}if(s.counter&&s.counter.x<IX&&once(s.counter))mvXY(s.counter,t);inc('v25.STORES',z)}
 for(const h of VZ.HOUSE2){const z=rz(h.rect);const t=TT(z);if(!t)continue;if(once(h.rect))mvRect(h.rect,t);inc('v25.HOUSE2',z)}}
/* ---- 7) cửa nhà (f5) & cửa hàng quần áo ---- */
for(const d of globalThis.F5DOORS||[]){const z=d.h&&d.h.b&&d.h.b._z21;const t=TT(z);if(!t||!once(d))continue;mvXY(d,t);if(d.c&&once(d.c)){d.c.x0+=t[0];d.c.x1+=t[0];d.c.z0+=t[1];d.c.z1+=t[1]}inc('f5.DOORS',z)}
{const S=globalThis.Z21H&&Z21H.SHOPC;if(S&&once(S)){S[0]+=MALL_T[0];S[1]+=MALL_T[1];inc('SHOPC','__mall')}}
/* ---- 8) làm mới bộ đệm ---- */
try{Z21H.reIdx()}catch(e){log.push('reIdx lỗi '+e)}
try{Z21H.resetHOV()}catch(e){log.push('resetHOV lỗi '+e)}
try{SH.colsDirty&&SH.colsDirty()}catch(e){}
// chỗ dành riêng cho w15 (không sinh cây/đá/quái chồng lên cụm đã dời)
if(globalThis.W15&&W15.RES){for(const n in CL){const r=SH.ZN.find(z=>z.n===n);if(!r)continue;const q=[r.r[0]-4,r.r[1]-4,r.r[2]+4,r.r[3]+4];q.z21=1;W15.RES.push(q)}
 if(mall){const q=[mall.x0-6,mall.y0-6,mall.x1+6,mall.y1+6];q.z21=1;W15.RES.push(q)}}
/* ---- 9) kiểm tra ---- */
const after={ids:SH.trees.map(t=>t.id).join(','),sig:SH.WORLD&&SH.WORLD.sig};
const Z21=globalThis.Z21={mineMap(){const M=new Map(),dup=[];const put=(o,n)=>{if(M.has(o)&&M.get(o)!==n)dup.push(o);M.set(o,n)};for(const[d,x,y]of ORIG_R)put('r'+x.toFixed(1)+y.toFixed(1),'r'+d[1].toFixed(1)+d[2].toFixed(1));for(const[m,x]of ORIG_M)put('m'+x.toFixed(1),'m'+m.x.toFixed(1));return{M,dup}},cnt,log,dbl,zoneOf,TT,CL,ms:+(performance.now()-T0).toFixed(1),before,
 audit(){const core=a=>a.filter(o=>!o.w15&&!o.b16);
  const n={blds:SH.blds.length,cols:SH.cols.filter(c=>!c.w15&&!c.b16).length,trees:core(SH.trees).length,items:core(SH.items).length,ens:core(SH.ens).length,DEC:SH.DEC.filter(r=>!r.w15).length,ROCKS:SH.ROCKS.filter(r=>!r.w15).length,MT:SH.MT.length,LM:SH.LM.length,LAKES:SH.LAKES.length,props:SH.props.length};
  const ids=core(SH.trees).map(t=>t.id).join(',');
  // ID cây là ID theo toạ độ CŨ: toạ độ trong ID + phép dời của cụm (theo vị trí cũ) phải ra đúng vị trí hiện tại
  let idOK=0,idBad=[],idOther=0;for(const t of core(SH.trees)){const m=/^t(-?\d+)_(-?\d+)/.exec(t.id||'');if(!m){idOther++;continue}const ox=+m[1]/10,oy=+m[2]/10,T=TT(zoneOf(ox,oy))||[0,0];
   if(Math.abs(t.x-ox-T[0])<.06&&Math.abs(t.y-oy-T[1])<.06)idOK++;else if(idBad.length<8)idBad.push([t.id,+t.x.toFixed(2),+t.y.toFixed(2)])}
  const live=SH.WORLD&&SH.WORLD.sig;
  return{countsSame:JSON.stringify(n)===JSON.stringify(before.n),n,nBefore:before.n,idsSame:ids===before.ids,idsAtLoad:after.ids===before.ids,idOK,idBad,idOther,sigSame:live===before.sig,sig:live,sigBefore:before.sig,doubleMoveAttemptsBlocked:dbl}}};
/* ---- MỤC 2: tiện ích cho các nét vẽ còn ghi cứng toạ độ cũ trong index + khung loại trừ cho w15 ---- */
globalThis.Z21P=(x,y)=>Z21M(x,y);
{const QM=new Map();globalThis.Z21Q=q=>{const k=q.join(',');if(QM.has(k))return QM.get(k);
 const r={x0:Math.min(q[0],q[2]),y0:Math.min(q[1],q[3]),x1:Math.max(q[0],q[2]),y1:Math.max(q[1],q[3])};let best=null,ba=0;
 for(const n in CL){const R=RECT[n],a=Math.max(0,Math.min(r.x1,R[2])-Math.max(r.x0,R[0]))*Math.max(0,Math.min(r.y1,R[3])-Math.max(r.y0,R[1]));if(a>ba){ba=a;best=n}}
 const A=Math.max(1e-6,(r.x1-r.x0)*(r.y1-r.y0));let out=null;
 if(best&&ba>=A*.3){const R=RECT[best],t=CL[best];out=[Math.max(r.x0,R[0])+t[0],Math.max(r.y0,R[1])+t[1],Math.min(r.x1,R[2])+t[0],Math.min(r.y1,R[3])+t[1],q[4]]}
 QM.set(k,out);return out}}
globalThis.Z21SIGN=[148+MALL_T[0],6+MALL_T[1]];
globalThis.Z21WB=SH.WB;
// khung các cụm (vị trí MỚI) – w15 không sinh địa hình/vật thể đè lên, không tính nước của w15 bên trong
const EXCL=[];for(const n in CL){const z=SH.ZN.find(q=>q.n===n);if(z)EXCL.push([z.r[0],z.r[1],z.r[2],z.r[3],n])}
{const z=SH.ZN.find(q=>q.n==='Cảng Hải Lam'),t=CL['Cảng Hải Lam'],R=RECT['Cảng Hải Lam'];EXCL.push([R[0]+t[0],R[1]+t[1],R[2]+t[0],R[3]+t[1],'Cảng Hải Lam (dải biển cũ)'])}
if(mall)EXCL.push([mall.x0-6,mall.y0-6,mall.x1+6,mall.y1+6,'Cửa hàng quần áo']);
if(globalThis.W15&&W15.setExcl)W15.setExcl(EXCL);
Z21.EXCL=EXCL;
globalThis.Z21X={CL_OLD,CL,MALL_T_OLD,MALL_T,zoneOf,ORIG_R,ORIG_M,IX};// M26
{const C=globalThis.CITY17;if(C&&C.hideLang)try{const DY=-60000;let n=0;
 const LR=C.langR,inLR=(x,y)=>LR&&x>LR[0]&&x<LR[2]&&y>LR[1]&&y<LR[3];
 for(const b of SH.blds){if(b.c17||b.hid20||!(b.x0<IX))continue;if(!((b._z21==='Làng Phong Dư'&&/^ab/.test(b.spr||''))||(C.hideLang>=2&&inLR((b.x0+b.x1)/2,(b.y0+b.y1)/2))))continue;const r={x0:b.x0,x1:b.x1,y0:b.y0,y1:b.y1};
  for(const c of SH.cols)if(!c.c17&&c.x0>=r.x0-.05&&c.x1<=r.x1+.05&&c.z0>=r.y0-.05&&c.z1<=r.y1+.05){c.z0+=DY;c.z1+=DY}
  const hr=VZ&&VZ.HRES.get(b);if(hr&&hr.rb){const rb=hr.rb;rb.y0+=DY;rb.y1+=DY;(rb.Wl||[]).forEach(w=>{w[2]+=DY;w[3]+=DY})}
  b.y0+=DY;b.y1+=DY;(b.Wl||[]).forEach(w=>{w[2]+=DY;w[3]+=DY});(b.fur||[]).forEach(f=>{f.y+=DY});b.hid20=1;n++}
 const SX=C.southX;let nS=0,nL=0,nC=0;if(SX){const inS=(x,y)=>x>SX[0]&&x<SX[2]&&y>SX[1]&&y<SX[3];
  for(const b of SH.blds){if(b.c17||b.hid20||!(b.x0<IX)||!/^ab/.test(b.spr||'')||!inS((b.x0+b.x1)/2,(b.y0+b.y1)/2))continue;const r={x0:b.x0,x1:b.x1,y0:b.y0,y1:b.y1};
   for(const c of SH.cols)if(!c.c17&&c.x0>=r.x0-.05&&c.x1<=r.x1+.05&&c.z0>=r.y0-.05&&c.z1<=r.y1+.05){c.z0+=DY;c.z1+=DY}const hr=VZ&&VZ.HRES.get(b);if(hr&&hr.rb){const rb=hr.rb;rb.y0+=DY;rb.y1+=DY;(rb.Wl||[]).forEach(w=>{w[2]+=DY;w[3]+=DY})}
   b.y0+=DY;b.y1+=DY;(b.Wl||[]).forEach(w=>{w[2]+=DY;w[3]+=DY});(b.fur||[]).forEach(f=>{f.y+=DY});b.hid20=1;nS++}
  for(let i=SH.LAKES.length;i--;){const l=SH.LAKES[i];if(l.t==='sea'&&inS(l.x,l.y)){SH.LAKES.splice(i,1);nL++}}}
 if(C.hideLang>=2&&LR){let nl=0;/* LẦN 25: dọn sạch khu Làng cũ (trạm xăng, cửa hàng, đường nội bộ, hồ nhỏ, trang trí, vật cản) */
  const VZ2=SH.V25&&SH.V25.Z21;if(VZ2){const rc=o=>o&&(o.rect||o.r||o);for(const k of['STORES','GAS','CITY_STORE','ROADS','CITY_ST','CTREES']){const A=VZ2[k];if(!Array.isArray(A))continue;for(let i=A.length;i--;){const o=A[i],r=rc(o);let x,y;if(Array.isArray(r)){x=(r[0]+r[2])/2;y=(r[1]+r[3])/2}else if(r&&isFinite(r.x0)){x=(r.x0+r.x1)/2;y=(r.y0+r.y1)/2}else if(r&&isFinite(r.x)){x=r.x;y=r.y}else continue;if(inLR(x,y)){A.splice(i,1);nl++}}}}
  for(let i=SH.DEC.length;i--;){const d=SH.DEC[i];if(d.c20||!(d[1]<IX)||!inLR(d[1],d[2]))continue;if(d.col)d.col.on=false;SH.DEC.splice(i,1);nl++}
  for(let i=SH.ROCKS.length;i--;){const d=SH.ROCKS[i];if(inLR(d[1],d[2])){SH.ROCKS.splice(i,1);nl++}}
  for(let i=SH.LAKES.length;i--;){const l=SH.LAKES[i];if(l.t!=='sea'&&inLR(l.x,l.y)){SH.LAKES.splice(i,1);nl++}}
  for(const c of SH.cols)if(!c.c17&&!c.c20&&!c.w15&&c.x0<IX&&inLR((c.x0+c.x1)/2,(c.z0+c.z1)/2)){c.z0-=60000;c.z1-=60000;nl++}
  for(const z of(globalThis.ZN||SH.ZN||[]))if(z.loc)z.loc=z.loc.filter(l=>!inLR(l.x,l.y));
  for(const it of SH.items)if(it.x<IX&&inLR(it.x,it.y)){it.y=LR[3]+3;nl++}
  for(const e of SH.ens)if(e.x<IX&&inLR(e.x,e.y)){e.y=LR[3]+4;if(isFinite(e.wy))e.wy=e.y}
  globalThis.C25_LANG=nl}
 const CC=C.cabinClear;if(CC){const inC=(x,y)=>x>CC[0]&&x<CC[2]&&y>CC[1]&&y<CC[3];for(let i=SH.DEC.length;i--;){const d=SH.DEC[i];if(d.c20||!(d[1]<IX)||!inC(d[1],d[2]))continue;if(/^(tree|bush|planter|flower|rock|plant|grass)/.test(d[0])){if(d.col)d.col.on=false;SH.DEC.splice(i,1);nC++}}
  for(let i=SH.ROCKS.length;i--;){const d=SH.ROCKS[i];if(inC(d[1],d[2])){if(d.col)d.col.on=false;SH.ROCKS.splice(i,1);nC++}}}
 const NB=SH.blds.filter(b=>b.c17&&b.x0<IX);const hit=(x,y,m)=>NB.find(b=>x>b.x0-m&&x<b.x1+m&&y>b.y0-m&&y<b.y1+m);
 let ne=0,ni=0,nd=0;for(const e of SH.ens){if(!(e.x<IX))continue;const b=hit(e.x,e.y,1);if(b){e.y=b.y1+3.2;if(isFinite(e.wy))e.wy=e.y;ne++}}
 for(const it of SH.items){if(!(it.x<IX))continue;const b=hit(it.x,it.y,.6);if(b){it.y=b.y1+2;ni++}}
 for(let i=SH.DEC.length;i--;){const d=SH.DEC[i];if(d.c20||d.w15||!(d[1]<IX))continue;if(hit(d[1],d[2],.8)){if(d.col)d.col.on=false;SH.DEC.splice(i,1);nd++}}
 /* LẦN 25: cửa (F5) của nhà đã ẩn cũng ẩn theo – trước đây còn sót lại thành 'cánh cửa đứng một mình' */
 let nD=0;for(const d of(globalThis.F5DOORS||[]))if(d.h&&d.h.b&&d.h.b.hid20&&!d.hid25){d.hid25=1;d.y+=DY;if(d.c){d.c.z0+=DY;d.c.z1+=DY}nD++}globalThis.C25_DOORS=nD;
 SH.colsDirty&&SH.colsDirty();globalThis.C20_HID={nhàCất:n,nhàCảng:nS,hồBiển:nL,dọnQuanhNhàGỗ:nC,quái:ne,vậtPhẩm:ni,trangTrí:nd}}catch(e){console.error('[L20 z21]',e)}}
globalThis.Z21_READY=true;
console.info('[Z21] dời cụm xong trong',Z21.ms,'ms',log.join(' · '));
})();
