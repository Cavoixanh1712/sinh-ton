/* DON31 (21/11): dọn theo yêu cầu
   1) Xóa toàn bộ đồ trang trí "công viên/quảng trường" cũ (Lần 17/20, đánh dấu c20) đang nằm trên đường, vỉa hè, bãi đỗ xe Thành Phố Thiên Đường – kể cả vật cản của chúng.
   2) Rừng Suối Mây: xóa đồ trang trí/cây nằm dưới nước (suối, hồ); tài nguyên ngẫu nhiên nằm dưới nước được chuyển lên bờ trong rừng.
   3) Quả mọng, gừng, rau xanh chỉ mọc trong Rừng Suối Mây (đang ở thành phố → chuyển vào rừng; mọc lại cũng vào rừng). Gỗ/đá nhặt đất giữ nguyên. */
(()=>{'use strict';const S=globalThis.SH,W=globalThis.W15,M=globalThis.MAP26;if(!S||!W||!M)return;
const stats={revision:31,cityProps:0,cityCols:0,wetTable:0,wetDecor:0,wetTrees:0,plantsMoved:0,wetRes:0,err:null};
const ZF=W.ZV2&&W.ZV2.find(z=>z.n==='Rừng Suối Mây'),ZC=W.ZV2&&W.ZV2.find(z=>z.n==='Thành Phố Thiên Đường');
const inF=(x,y)=>!!ZF&&W.zoneAt2(x,y)===ZF,inC=(x,y)=>!!ZC&&W.zoneAt2(x,y)===ZC;
const wet=(x,y)=>{try{return W.water(x,y).d>0||S.inLk(x,y,0)||W.depthAt(x,y)>.025}catch(_){return false}};
const compact=(a,keep)=>{if(!Array.isArray(a))return 0;let n=0,r=0;for(const o of a)if(keep(o))a[n++]=o;else r++;a.length=n;return r};
try{
 // 1) đồ trang trí công viên cũ trong thành phố
 const gone=new Set(),cols=new Set();for(const d of S.DEC)if(d.c20){gone.add(d);if(d.col){d.col.on=false;cols.add(d.col)}}
 stats.cityProps=compact(S.DEC,d=>!gone.has(d));if(S.HO2&&S.HO2.dec)compact(S.HO2.dec,d=>!gone.has(d));stats.cityCols=compact(S.cols,c=>!cols.has(c));for(const d of gone)S.V25?.drop?.(d);
 // 2) rừng: đồ dưới nước
 stats.wetTable=compact(M.D,q=>!(inF(q[1],q[2])&&wet(q[1],q[2])))+compact(M.FD,q=>!(inF(q[1],q[2])&&wet(q[1],q[2])));
 const wd=new Set();const seen=new Set();for(const d of S.DEC.concat(S.HO2&&S.HO2.dec||[])){if(seen.has(d)||d.w15)continue;seen.add(d);if(inF(d[1],d[2])&&wet(d[1],d[2])){wd.add(d);if(d.col){d.col.on=false;cols.add(d.col)}}}
 stats.wetDecor=compact(S.DEC,d=>!wd.has(d));if(S.HO2&&S.HO2.dec)compact(S.HO2.dec,d=>!wd.has(d));compact(S.cols,c=>!cols.has(c));for(const d of wd)S.V25?.drop?.(d);
 stats.wetTrees=compact(M.T,t=>!(inF(t[1],t[2])&&wet(t[1],t[2])));
 const F=S.V25&&S.V25.forest;if(F)for(const k of['trees','rocks','bush','flow'])if(Array.isArray(F[k])){const rm=F[k].filter(o=>inF(o.x,o.y)&&wet(o.x,o.y));for(const o of rm){if(o.col5)o.col5.on=false;S.V25?.drop?.(o)}stats.wetDecor+=compact(F[k],o=>!rm.includes(o))}
 W.reloadAll();W.CK.clear();globalThis.M26?.resetBuckets?.();S.colsDirty();S.V25?.treesDirty?.();
}catch(e){stats.err=String(e&&e.message||e);console.error('[DON31]',e)}
// 3) cây thu hoạch chỉ trong rừng + không nằm dưới nước
const PLANT=new Set(['b','g','v']);
function forestSpot(){for(let k=0;k<80;k++){const q=globalThis.R27S&&R27S((Math.random()*2147483647)|0);if(q&&inF(q[0],q[1])&&!wet(q[0],q[1]))return q}return null}
function fix(){const R=globalThis.R27;if(!R||!R.RL)return;for(const r of R.RL){if(!r.on)continue;const bad=(PLANT.has(r.t)&&!inF(r.x,r.y))||(inF(r.x,r.y)&&wet(r.x,r.y));if(!bad)continue;const q=forestSpot();if(!q)continue;const wasWet=wet(r.x,r.y);r.x=q[0];r.y=q[1];r.hid=0;if(wasWet)stats.wetRes++;else stats.plantsMoved++}}
fix();setInterval(()=>{try{fix()}catch(_){}},1500);
globalThis.DON31={stats,fix};})();
/* 4) Tầm nhìn ban đêm ở chế độ 2.5D: phủ tối cả màn hình, chỉ sáng vùng 10 m quanh nhân vật (giống 2D). Không đổi ánh sáng 3D gốc. */
(()=>{const S=globalThis.SH;if(!S||!S.V25)return;let cv=null,g=null;const T=()=>S.V25.T15&&S.V25.T15.T;
function ensure(){if(cv)return true;const R=S.V25.Z21&&S.V25.Z21.R;if(!R||!R.domElement||!R.domElement.parentNode)return false;const d=R.domElement,st=getComputedStyle(d);cv=document.createElement('canvas');cv.id='nv31';cv.style.cssText='position:'+(st.position==='static'?'fixed':st.position)+';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:'+(st.zIndex==='auto'?0:st.zIndex);d.parentNode.insertBefore(cv,d.nextSibling);g=cv.getContext('2d');return true}
const v3=()=>new (T().Vector3)();let A=null,B=null,C=null;
function frame(){requestAnimationFrame(frame);try{const on=S.V25.on&&S.S&&S.S.on;const d=.5+.5*Math.cos((S.S.h-13)/12*Math.PI),a=on?Math.min(.95,Math.max(0,(.62-d)*1.5)*1.22):0;
 if(!a||a<.01){if(cv&&cv.style.display!=='none')cv.style.display='none';return}if(!ensure()||!T())return;cv.style.display='';
 const R=S.V25.Z21.R,dom=R.domElement,W=dom.clientWidth||innerWidth,H=dom.clientHeight||innerHeight;if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
 const cam=S.V25.T15.cam;if(!A){A=v3();B=v3();C=v3()}const p=S.pos;A.set(p.x,1,p.y).project(cam);B.set(p.x+10,1,p.y).project(cam);C.set(p.x,1,p.y+10).project(cam);
 const sx=(A.x+1)/2*W,sy=(1-A.y)/2*H,rx=Math.abs(B.x-A.x)/2*W,ry=Math.max(Math.abs(C.y-A.y)/2*H,rx*.4);
 g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);g.fillStyle='rgba(4,6,18,'+a+')';g.fillRect(0,0,W,H);
 g.globalCompositeOperation='destination-out';g.setTransform(1,0,0,ry/rx,sx,sy);const gr=g.createRadialGradient(0,0,0,0,0,rx);gr.addColorStop(0,'rgba(0,0,0,.88)');gr.addColorStop(.6,'rgba(0,0,0,.8)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,rx,0,7);g.fill();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over'}catch(e){}}
requestAnimationFrame(frame)})();
