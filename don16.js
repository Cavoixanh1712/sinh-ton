/* DON16 — LẦN 16e (chỉ bản thử): gỡ các cây "gốc" (sinh bởi mã, không nằm trong bảng MAP26) ở 7 khu ngoài Rừng Suối Mây.
   Cây bảng của 7 khu đã được chuyển hẳn ra file lưu trữ ngoài bản chơi. Không ẩn hình giữ va chạm: gỡ khỏi danh sách cây, va chạm, sổ ID, danh sách chờ hồi sinh. */
(function(){const SH=globalThis.SH;if(!SH)return;const KEEP='Rừng Suối Mây',ST={n:0,ids:new Set()};
function gone(t){const W=globalThis.W15;if(!W||!W.zoneAt2)return false;const z=W.zoneAt2(t.x,t.y);return!z||z.n!==KEEP}
function drop(t){const i=SH.trees.indexOf(t);if(i>=0)SH.trees.splice(i,1);const j=SH.felled.indexOf(t);if(j>=0)SH.felled.splice(j,1);if(t.c){const k=SH.cols.indexOf(t.c);if(k>=0)SH.cols.splice(k,1)}
 try{const by=SH.X.WORLD.byId&&SH.X.WORLD.byId.t;if(by&&t.id&&by.get(t.id)===t)by.delete(t.id)}catch(_){}}
function sweep(now){if(globalThis.Z21_READY!==true||!globalThis.W15||!W15.zoneAt2||!W15.ZV2||W15.ZV2.length<8)return 0;/* chỉ dọn khi thế giới đã dựng xong (tọa độ + ranh khu đã chốt) */let ch=0;const late=[];for(const t of SH.trees){if(t.w15||t.f8||t._k)continue;if(!gone(t)){t._k=1;continue}
  if(!t._g){t._g=performance.now();t.hp=0;t.giant=0;if(t.c){t.c.on=false;t.c.x0=t.c.x1=t.c.z0=t.c.z1=1e5}if(t.id)ST.ids.add(t.id);ST.n++;ch++}
  if(now||performance.now()-t._g>1200)late.push(t)}
 for(const t of late)drop(t);if(ch||late.length){SH.colsDirty&&SH.colsDirty();const V=SH.V25;V&&V.treesDirty&&V.treesDirty()}return ch}
setInterval(()=>{try{sweep(false)}catch(e){if(!ST.e){ST.e=String(e);console.warn('[DON16]',e)}}},700);
globalThis.DON16=ST;ST.sweep=sweep;console.info('[DON16] dọn cây gốc 7 khu:',ST.n)})();
