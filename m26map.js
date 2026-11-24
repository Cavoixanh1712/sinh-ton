/* =====================================================================
   SAFE HAVEN V2 · BẢN THỬ 2.500 m · m26map.js
   - P(x,y): ánh xạ toạ độ thế giới w15 (giống hệt shrink_map.py: gắn công trình ≤25 m → dịch cứng; còn lại co 0,5 quanh tâm + dịch khu)
   - chunk(i,j): đối tượng chunk lấy từ BẢNG CỐ ĐỊNH (cây/đá/trang trí/trại/quái) — ID cây/quái giữ nguyên
   - f8(F8): rừng f8 theo bảng (đi nguyên khối với Hồ Sương)
   - run(d): chuyển save v5 → v6 trên BẢN SAO; lỗi → từ chối (index.html giữ nguyên bản gốc)
   ===================================================================== */
(()=>{const M=globalThis.MAP26;if(!M){console.warn('[M26] thiếu MAP26');return}
const IX=globalThis.INT_X0||5000,r1=v=>Math.round(v*10)/10,r2=v=>Math.round(v*100)/100,isNum=v=>typeof v=='number'&&isFinite(v);
const bbox=P=>{let a=1e9,b=1e9,c=-1e9,d=-1e9;for(const q of P){a=Math.min(a,q[0]);b=Math.min(b,q[1]);c=Math.max(c,q[0]);d=Math.max(d,q[1])}return[a,b,c,d]};
const pip=(x,y,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
const ATT=M.P.att.map(a=>({p:a[0],b:bbox(a[0]),d:[a[2][0]-a[1][0],a[2][1]-a[1][1]]})),ZN=M.P.zones.map(z=>({n:z[0],p:z[1],b:bbox(z[1]),o:z[2]}));
const C0=M.P.c,S=M.P.s;
function P(x,y){if(Array.isArray(x)){y=x[1];x=x[0]}if(!isNum(x)||!isNum(y)||x>=IX)return[x,y];
 for(const a of ATT)if(x>=a.b[0]&&x<=a.b[2]&&y>=a.b[1]&&y<=a.b[3]&&pip(x,y,a.p))return[r1(x+a.d[0]),r1(y+a.d[1])];
 let o=[0,0];for(const z of ZN)if(x>=z.b[0]&&x<=z.b[2]&&y>=z.b[1]&&y<=z.b[3]&&pip(x,y,z.p)){o=z.o;break}
 return[r1(C0[0]+(x-C0[0])*S+o[0]),r1(C0[1]+(y-C0[1])*S+o[1])]}
/* bảng chunk */
let B=null;const W=M.WB,cid=(x,y)=>'c'+Math.floor((x-W.x0)/100)+'_'+Math.floor((y-W.y0)/100);
function bucket(){B=new Map();const g=(x,y)=>{const k=cid(x,y);let o=B.get(k);if(!o)B.set(k,o={T:[],Rk:[],D:[],C:[],Z:[]});return o};
 for(const t of M.T)g(t[1],t[2]).T.push({x:t[1],y:t[2],s:t[3],dead:!!t[4],sp:t[5],id:t[0],vs:+t[6]||0,big:t[7]?1:0});/* LẦN 16d: t[6]=hệ số HÌNH (không đổi va chạm) · t[7]=1 cây cổ thụ không chặt được */
 for(const r of M.K)g(r[1],r[2]).Rk.push([r[0],r[1],r[2],r[3]]);
 for(const q of M.D)g(q[1],q[2]).D.push(q.length>4?[q[0],q[1],q[2],q[3],1]:[q[0],q[1],q[2],q[3]]);
 for(const c of M.C)g((c.x0+c.x1)/2,(c.z0+c.z1)/2).C.push(c);
 for(const z of M.Z)g(z[1],z[2]).Z.push([z[1],z[2],z[3],z[0]])}
function chunk(i,j){if(!B)bucket();const id='c'+i+'_'+j,o=B.get(id)||{T:[],Rk:[],D:[],C:[],Z:[]};
 const T=o.T.map(t=>Object.assign({},t)),Rk=o.Rk.map(r=>r.slice()),D=o.D.map(q=>q.slice()),C=o.C.map(c=>Object.assign({},c)),Z=o.Z.map(z=>[z[0],z[1],z[2].slice(),z[3]]);
 return{id,i,j,T,Rk,D,C,Z,n:T.length+Rk.length+D.length+C.length+Z.length}}
/* rừng f8 theo bảng (giữ thuộc tính cũ của từng cây, chỉ đổi vị trí) */
function f8(F8){/* dựng lại hoàn toàn từ bảng (không phụ thuộc bộ sinh f8 trên dữ liệu mới) */
 const by=new Map(),g=(x,y)=>{const k=cid(x,y);let o=by.get(k);if(!o)by.set(k,o={T:[],D:[]});return o};
 for(const f of M.F8){const m=/^w15_f8_(-?\d+)_(-?\d+)/.exec(f[0]);g(f[1],f[2]).T.push({x:f[1],y:f[2],s:f[3],sp:f[4],g:m?[+m[1],+m[2]]:null,id:f[0]})}
 for(const q of M.FD)g(q[1],q[2]).D.push(q.slice());
 F8.byC=by;F8.m26={miss:0,n:M.F8.length}}
/* chuyển save v5 → v6 */
const clone=o=>JSON.parse(JSON.stringify(o));
function v1map(x,y){/* nội dung bản đồ cũ (v1) đã được z21 dời theo cụm: tìm cụm z mà (x−CL_OLD[z]) thuộc z */
 const Z=globalThis.Z21X;if(!Z||!isNum(x)||!isNum(y)||x>=IX)return null;if(Math.hypot(x,y-3)<22)return[x,y];
 for(const n in Z.CL_OLD){const t=Z.CL_OLD[n],ox=x-t[0],oy=y-t[1];if(Z.zoneOf(ox,oy)===n)return[r2(ox+Z.CL[n][0]),r2(oy+Z.CL[n][1])]}
 {const t=Z.MALL_T_OLD,ox=x-t[0],oy=y-t[1];if(Z.zoneOf(ox,oy)==='__mall')return[r2(ox+Z.MALL_T[0]),r2(oy+Z.MALL_T[1])]}
 return null}
const PA=(x,y)=>v1map(x,y)||P(x,y);                 // đối tượng có thể thuộc bản đồ cũ (đồ vật, quái cũ, người chơi)
function run(d){try{if(!d||d.saveVersion!==6||!d.m26||!d.m26.pending)return{ok:false,why:'không phải save chờ chuyển v5→v6'};
 if(d.world&&d.world.ext&&d.world.ext.w15&&d.world.ext.w15.map6)return{ok:false,why:'đã ánh xạ (chặn áp 2 lần)'};
 const s=clone(d),rep={pos:0,cây:0,đá:0,mỏ:0,căn:0,nội:0},w=s.world,X=w.ext||(w.ext={});
 const pp=(o,kx,ky,f)=>{if(o&&isNum(o[kx])&&isNum(o[ky])){if(o[kx]>=IX){rep.nội++;return}const q=f(o[kx],o[ky]);o[kx]=q[0];o[ky]=q[1];rep.pos++}};
 const pl=s.player,p0=pl.pos?[pl.pos.x,pl.pos.y]:null;pp(pl.pos,'x','y',PA);if(pl.way&&typeof pl.way=='object')pp(pl.way,'x','y',PA);
 // chỉ kiểm chỗ đứng khi vị trí THỰC SỰ bị dời (đứng trong Nhà Gỗ/nội thất thì giữ nguyên)
 if(globalThis.M5&&pl.pos&&p0&&pl.pos.x<IX&&(pl.pos.x!==p0[0]||pl.pos.y!==p0[1])&&!M5.safeAt(pl.pos.x,pl.pos.y)){pl.pos.x=0;pl.pos.y=5.5;rep.vềCửa=1}
 for(const k of['items','ens','dead','felled'])for(const o of w[k]||[])if(Array.isArray(o)&&o.length>=3)pp(o,1,2,PA);
 for(const b of((X.n22||{}).bases||[]).concat((X.n22||{}).extra||[])){pp(b,'cx','cy',P);rep.căn++}
 for(const h of(X.b16||{}).houses||[]){if(isNum(h.x)&&isNum(h.y)){const q=P(h.x,h.y-1.6);h.x=q[0];h.y=r1(q[1]+1.6);rep.căn++}}
 for(const b of(X.f5||{}).bar||[]){if(Array.isArray(b))pp(b,1,2,P);else pp(b,'x','y',P)}
 if(X.f4&&X.f4.dg&&X.f4.dg.cur){const c=X.f4.dg.cur;pp(c,'x','y',PA);(c.alive||[]).forEach(a=>pp(a,2,3,PA))}
 if(X.v25&&Array.isArray(X.v25.mine)){const Z=globalThis.Z21X,RK={},MK={};
  if(Z){for(const[o,ox,oy]of Z.ORIG_R){const z=Z.zoneOf(ox,oy),t=z==='__mall'?Z.MALL_T_OLD:z?Z.CL_OLD[z]:[0,0];RK['r'+(ox+t[0]).toFixed(1)+(oy+t[1]).toFixed(1)]='r'+o[1].toFixed(1)+o[2].toFixed(1)}
   for(const[o,ox,oy]of Z.ORIG_M){const z=Z.zoneOf(ox,oy),t=z==='__mall'?Z.MALL_T_OLD:z?Z.CL_OLD[z]:[0,0];MK['m'+(ox+t[0]).toFixed(1)]='m'+o.x.toFixed(1)}}
  X.v25.mine.forEach(e=>{const k=e[0];if(M.rk[k]){e[0]=M.rk[k];rep.đá++}else if(RK[k]){e[0]=RK[k];rep.đá++}else if(MK[k]){e[0]=MK[k];rep.mỏ++}})}
 const W=X.w15||(X.w15={v2:1,fid:2,f:{},z:{}});const F8=new Map(M.F8.map(f=>[f[0],f]));
 W.f8p={};for(const k in W.f||{})if(k.startsWith('w15_f8_')&&F8.has(k)){const f=F8.get(k);W.f8p[k]=[f[1],f[2]];rep.cây++}else if(k.startsWith('w15_'))rep.cây++;
 const sig=globalThis.W15F8SIG?W15F8SIG():M.f8sig;if(sig!==M.f8sig)return{ok:false,why:'chữ ký rừng f8 không khớp bảng ('+sig+' ≠ '+M.f8sig+')'};
 W.f8sig=sig;W.map6=1;
 s.m26={done:1,from:5};s.mapSize=1250;return{ok:true,d:s,rep}}catch(e){return{ok:false,why:'lỗi '+(e&&e.message)}}}
/* Lần 6: tên hiển thị = 8 tên khu chính thức (ID/khóa nội bộ không đổi) */
const ZCOL={'Thành Phố Thiên Đường':['#f2d25a','#e02020'],'Rừng Suối Mây':['#4caf50','#8e44c8'],'Đỉnh Bạch Vân':['#5aa9f0','#2a6fc0'],'Hang Pha Lê':['#a46ae0','#6a3fa0'],
 'Khu Di Tích Cổ':['#f0a040','#e0b020'],'Cảng Hải Lam':['#3ab8e8','#1d8ac0'],'Khu Công Nghiệp Zeta':['#9a9aa8','#d8d8e0'],'Vực Dung Nham':['#e04030','#ffcc33']};
function dseg(x,y,P){let b=1e18;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[j],c=P[i],dx=c[0]-a[0],dy=c[1]-a[1],L=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/L)),ex=a[0]+t*dx-x,ey=a[1]+t*dy-y;b=Math.min(b,ex*ex+ey*ey)}return b}
function ZNAME(x,y){const W=globalThis.W15;if(!W||!W.V2)return'';const z=W.zoneAt2(x,y);if(z)return z.n;let best=null,bd=1e18;for(const q of W.V2.zones){const d=dseg(x,y,q.poly);if(d<bd){bd=d;best=q}}return best?best.n:''}
const ZDN=z=>z&&z.r?ZNAME((z.r[0]+z.r[2])/2,(z.r[1]+z.r[3])/2):'';
globalThis.M26={resetBuckets(){B=null},ZNAME,ZDN,ZCOL,P,chunk,f8,run,v1map,info:()=>({T:M.T.length,F8:M.F8.length,K:M.K.length,D:M.D.length,C:M.C.length,Z:M.Z.length,WB:M.WB,f8sig:M.f8sig})};
})();
