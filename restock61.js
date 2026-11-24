/* Requested search restock only: snow cabins24 GT hours, city interiors72. */
(()=>{'use strict';const H=globalThis.SH,A=globalThis.I46;if(!H||!A)return;let next={};const now=()=>+H.GT||0,city=b=>!!b&&globalThis.W15?.zoneAt2(b.gc??(b.x0+b.x1)/2,b.y1)?.n==='Thành Phố Thiên Đường';
const idOf=(prefix,id)=>prefix+id;function period(it,id){if(id?.startsWith('bachvan60-'))return 24;const d=A.buildings.find(d=>id?.startsWith(d.key+'/'));return d&&city(d.b)?72:0}
function remember(key,h){next[key]=now()+h;queueMicrotask(()=>H.SAVE.save('restock61',false,true))}
function interiorReady(it,id){if(!it)return false;const h=period(it,id);if(!h)return null;const k=idOf('int:',id);if(next[k]===undefined&&A.claimed[id])next[k]=now()+h;return next[k]===undefined?!!it.on||!!it.k27:now()>=next[k]}
const available=A.available;A.available=(it,id)=>interiorReady(it,id)??available(it,id);
const floorCache=new WeakMap();function cityFloor(it){if(!it)return null;const last=floorCache.get(it);if(last&&last.x===it.x&&last.y===it.y)return last.f;const f=H.HFL.find(f=>city(f.xb)&&it.x>=f.b.x0&&it.x<=f.b.x1&&it.y>=f.b.y0&&it.y<=f.b.y1)||null;floorCache.set(it,{x:it.x,y:it.y,f});return f}
function nativePeriod(it){return !it?.cabin60&&cityFloor(it)?72:0}
function homeKey(u,kind){if(!u?.f||!['search','fridge'].includes(kind))return null;const b=u.f.xb||H.HOUSES.find(h=>h.f===u.f)?.b;if(!city(b))return null;return'home:'+(b.c17||[b.x0,b.y1].join(','))+':'+u.k+':'+u.x+':'+u.y}
function homeReady(u,kind){const k=homeKey(u,kind);if(!k)return null;return next[k]===undefined||now()>=next[k]}
function prime(){for(const id of Object.keys(A.claimed)){const k='int:'+id;if(next[k]===undefined){const h=period(null,id);if(h)next[k]=now()+h}}}
function tick(){if(!H.S.on)return;H.WORLD?.ensureIds?.();prime();for(const it of H.items){const h=nativePeriod(it);if(!h)continue;const k='item:'+it.id;if(!it.on&&next[k]===undefined)next[k]=now()+h;if(next[k]!==undefined){clearTimeout(it._tm);it._tm=null;it.on=now()>=next[k]}}}
const API=globalThis.REFILL61={period,interiorReady,homeReady,markHome(u,kind){const k=homeKey(u,kind);if(k)remember(k,72)},claim(id,it){const h=period(it,id);if(h)remember('int:'+id,h)},nativeCheck(it){const h=nativePeriod(it);if(!h)return true;const k='item:'+it.id;return next[k]===undefined||now()>=next[k]},nativeClaim(it){const h=nativePeriod(it);if(!h)return false;remember('item:'+it.id,h);clearTimeout(it._tm);it._tm=null;return true},tick,get schedule(){return{...next}}};
H.SAVE.register({id:'restock61',scope:'world',version:1,defaults:()=>({next:{}}),validate:v=>v&&v.next&&typeof v.next==='object',get(){prime();return{next:{...next}}},set(v){next={};for(const[k,t]of Object.entries(v.next||{}))if(k.length<250&&Number.isFinite(t)&&t>=0)next[k]=t}});setInterval(tick,500);
})();
