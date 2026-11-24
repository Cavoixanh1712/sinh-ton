/* RUNG29 (Lần 5 + Lần 6, 21/11): bố trí lại cây Rừng Suối Mây theo cụm tự nhiên + 5 cửa hang.
   - Không đụng: 2 hàng thông BORDER12, rừng F8 (Hồ Sương), địa hình, đường, nước, công trình, ranh giới.
   - Cây bảng (MAP26.T): giữ nguyên ID cũ, chỉ đổi vị trí/cỡ/hình; trạng thái đã chặt (DIFF.f theo ID) vẫn áp dụng.
   - Cây gốc trong rừng: gỡ khỏi thế giới SAU khi chữ ký thế giới đã chốt (save cũ vẫn khớp chữ ký).
   - Lỗi dữ liệu → không thay đổi gì (giữ nguyên rừng cũ). */
(()=>{'use strict';const D=globalThis.RUNG29_DATA,S=globalThis.SH,W=globalThis.W15,M=globalThis.MAP26;
const stats={revision:29,applied:false,error:null,table:0,nativeRemoved:0,decorRemoved:0,caves:0,hidden:0,sigBefore:null,sigAfter:null};
const ART={vine1:[320,318],vine2:[320,312],vine3:[320,309],vine4:[320,350],vine5:[320,321],vine6:[320,342],cave1:[440,232],cave2:[344,336],cave3:[400,280],cave4:[512,320],cave5:[296,184]};
function art(){for(const k in ART){if(!S.AS[k]){const a={u:'rung29/'+k+'.webp',w:ART[k][0],h:ART[k][1]};a.i=new Image();a.i.src=a.u;S.AS[k]=a}if(k.startsWith('vine'))S.SW[k]=2.6}}
const PLAN=new Set();
function apply(){if(stats.applied||!D||!S||!W||!M)return stats;
 try{art();const WD=S.WORLD;WD.ensureIds();stats.sigBefore=WD.sig;
  // 1) kiểm tra: mọi ID trong kế hoạch phải có trong bảng hiện tại
  const byId=new Map(M.T.map(t=>[t[0],t]));for(const r of D.trees)if(!byId.has(r[0]))throw Error('RUNG29: thiếu cây '+r[0]);
  const planned=new Set(D.trees.map(r=>r[0])),drop=new Set(D.dropTable);
  // 2) bảng cây: giữ dòng ngoài kế hoạch (nếu có), thay dòng trong kế hoạch
  const keep=M.T.filter(t=>!planned.has(t[0])&&!drop.has(t[0]));M.T.length=0;for(const t of keep)M.T.push(t);
  // Ô dành riêng của W15 (khu rừng gốc) không nhận cây bảng → cây ở đó thành cây gốc tĩnh (cùng ID, cùng thông số)
  const reserved=(x,y)=>W.inRes(x,y,1.5)||(globalThis.BORDER_CLEAN28&&BORDER_CLEAN28.blocked(x,y,''))||(globalThis.WORLD5&&WORLD5.blocked(x,y,.5)),statics=[];
  for(const r of D.trees){PLAN.add(r[0]);if(reserved(r[1],r[2]))statics.push(r);else M.T.push(r.slice())}stats.table=D.trees.length-statics.length;stats.static=statics.length;stats.keptOther=keep.length;
  // 3) cây gốc trong rừng
  const rm=new Set(D.removeNative),gone=[];for(const t of S.trees)if(!t.w15&&!t.border12&&rm.has(t.id))gone.push(t);
  const gs=new Set(gone),gc=new Set(gone.map(t=>t.c).filter(Boolean));
  const cut=(a,set)=>{let n=0;for(const o of a)if(!set.has(o))a[n++]=o;a.length=n};cut(S.trees,gs);cut(S.felled,gs);cut(S.cols,gc);
  for(const t of gone){if(t.c)t.c.on=false;WD.byId.t.delete(t.id);S.V25?.drop?.(t)}stats.nativeRemoved=gone.length;
  // LIVE fix: không trồng cây trong lòng suối/hồ. W15.water() bỏ qua vùng bản đồ cũ (inOld) nên trước đây 19 cây rơi xuống giữa Suối Mây/Suối Sương.
  const wetVis=(x,y,m)=>{for(const l of W.LKS||[]){if(!l.k||!l.k.length)continue;const dx=x-l.x,dy=(y-l.y)/(l.ry||1),d=Math.hypot(dx,dy);if(d>l.r*1.3)continue;let a=Math.atan2(dy,dx);if(a<0)a+=Math.PI*2;const f=a/(Math.PI*2)*64,i=Math.floor(f)%64,u=f-Math.floor(f);if(d<l.r*(l.k[i]*(1-u)+l.k[(i+1)%64]*u)-m)return true}
   for(const r of W.RV||[])for(let i=0;i<r.N-1;i++){const ax=r.X[i],ay=r.Y[i],bx=r.X[i+1],by=r.Y[i+1];if(x<Math.min(ax,bx)-15||x>Math.max(ax,bx)+15||y<Math.min(ay,by)-15||y>Math.max(ay,by)+15)continue;if(r.FD[i]==2&&r.FD[i+1]==2)continue;const sx=bx-ax,sy=by-ay,L2=sx*sx+sy*sy||1,t=Math.max(0,Math.min(1,((x-ax)*sx+(y-ay)*sy)/L2));if(Math.hypot(x-ax-sx*t,y-ay-sy*t)<r.HW[i]+(r.HW[i+1]-r.HW[i])*t-m)return true}return false};
  stats.skippedWet=[];
  for(const r of statics){if(wetVis(r[1],r[2],.2)){stats.skippedWet.push(r[0]);continue}const[id,x,y,s0,,sp,vs,big]=r,h=.4*s0,c={x0:x-h,x1:x+h,z0:y-h,z1:y+h,on:true};const t={x,y,s:vs?s0*vs:s0,dead:false,hp:big?1e9:3,sp,c,id,_k:1,r29n:1};if(big)t.giant=1;S.trees.push(t);S.cols.push(c);WD.byId.t.set(id,t)}
  // 4) đồ trang trí đè gốc cây mới / cửa hang
  const dk=new Set(D.dropDecor.map(q=>q[0]+'@'+q[1].toFixed(2)+','+q[2].toFixed(2)));const n0=M.D.length;
  const kd=M.D.filter(q=>!dk.has(q[0]+'@'+(+q[1]).toFixed(2)+','+(+q[2]).toFixed(2)));M.D.length=0;for(const q of kd)M.D.push(q);stats.decorRemoved=n0-M.D.length;
  // 5) cửa hang: hình + vật cản (để trống lối vào)
  for(const c of D.caves){const o=[c.k,c.x,c.y,c.w];o.r29=c.id;S.DEC.push(o);const L=c.mx-c.ow/2,Rr=c.mx+c.ow/2,x0=c.x-c.w/2+.35,x1=c.x+c.w/2-.35;
   // LIVE fix: vật cản sâu bằng khối đá trong ảnh (trước chỉ 2,2 m → đi từ phía bắc vào xuyên được nửa trên khối đá)
   const a=ART[c.k],zt=c.y-Math.max(2.2,a?c.w*a[1]/a[0]*.9:2.2);
   const cols=[{x0,x1:L,z0:zt,z1:c.y-.05},{x0:Rr,x1,z0:zt,z1:c.y-.05},{x0:L,x1:Rr,z0:zt,z1:c.y-.7}];for(const k of cols){k.on=true;k.r29=c.id;S.cols.push(k)}stats.caves++}
  for(const b of D.caveDecor){const o=b.slice();o.r29=1;S.DEC.push(o)}
  // 6) nạp lại chunk theo bảng mới
  W.reloadAll();W.CK.clear();globalThis.M26?.resetBuckets?.();S.colsDirty();S.V25?.treesDirty?.();globalThis.POI20?.invalidate?.();
  stats.sigAfter=WD.sig;stats.applied=true}
 catch(e){stats.error=String(e&&e.message||e);console.error('[RUNG29]',e)}return stats}
// Cây kế hoạch gắn trúng công trình người chơi đã xây (save cũ) → ẩn tạm (không tính là chặt, không lưu).
function guard(){if(!stats.applied)return;let changed=0;for(const t of S.trees){if(t._r29||!(t.w15||t.r29n)||!PLAN.has(t.id))continue;t._r29=1;if(!(t.hp>0)||!t.c)continue;const on=t.c.on;t.c.on=false;let hit=false;try{hit=S.X.hitC(t.x,t.y,.3)}catch(_){}t.c.on=on;if(hit){t.hp=0;t.c.on=false;t.r29hid=1;stats.hidden++;changed++}}if(changed)S.colsDirty()}
// Lần 7: bỏ cây tím (tree3) và hồng (tree2) khỏi rừng trang trí 2.5D quanh hồ → đổi sang cây xanh/vàng (giữ vị trí, kích thước, va chạm)
let recol=false;function recolor(){if(recol||!stats.applied)return;const F=S.V25&&S.V25.forest;if(!F||!F.trees)return;let n=0;for(const o of F.trees)if(o.sp==='tree2'||o.sp==='tree3'){o.sp=(Math.round(o.x*7+o.y*3)&1)?'tree1':'tree4';n++;S.V25?.drop?.(o)}const Z=W.ZV2&&W.ZV2.find(z=>z.n==='Rừng Suối Mây');let k=0;if(Z)for(const d of S.DEC.concat(S.HO2&&S.HO2.dec||[]))if(/^hsak/.test(d[0])&&W.zoneAt2(d[1],d[2])===Z){d[0]=(k++&1)?'tree4':'tree1'}stats.recolored=n;stats.sakuraDecor=k;recol=true}
// LIVE fix: bản lưu cũ đứng trong phần khối đá hang vừa được chặn → ra mép gần nhất còn trống
function unstick(){try{const st=S.S,p=S.pos;if(!st||!st.on||st.dead)return;for(const c of S.cols){if(!c.r29||c.on===false||!(p.x>c.x0&&p.x<c.x1&&p.y>c.z0&&p.y<c.z1))continue;
 const C=[[p.x,c.z1+.5],[p.x,c.z0-.5],[c.x0-.5,p.y],[c.x1+.5,p.y]].sort((a,b)=>Math.hypot(a[0]-p.x,a[1]-p.y)-Math.hypot(b[0]-p.x,b[1]-p.y));
 for(const q of C)if(!(S.X&&S.X.hitC&&S.X.hitC(q[0],q[1],.4))){p.x=q[0];p.y=q[1];stats.unstuck=(stats.unstuck||0)+1;return}}}catch(_){}}
setInterval(()=>{recolor();guard();unstick()},1200);
globalThis.RUNG29={apply,stats,guard,caves:()=>D.caves.map(c=>({id:c.id,x:c.x,y:c.y}))};apply();})();
