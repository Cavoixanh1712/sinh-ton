/* Dropped inventory only. Native map loot and respawn are untouched. */
(()=>{'use strict';const H=globalThis.SH,B=globalThis.ITEM59_BRIDGE;if(!H||!B)return;let drops=[];
const alive=d=>d&&Number.isFinite(d.expires)&&H.GT<d.expires;
function prune(){drops=drops.filter(alive)}
function scope(){const p=globalThis.I46?.presence();return p?{key:p.key,floor:p.floor,h:p.h}:{key:'',floor:0,h:0}}
function list(key='',floor=0){prune();return drops.filter(d=>d.key===key&&d.floor===floor)}
function near(d){const p=scope();return alive(d)&&d.key===p.key&&d.floor===p.floor&&Math.hypot(H.pos.x-d.x,H.pos.y-d.y)<1.8}
function save(){H.SAVE.save('ground59',false,true)}
H.CMD.def('ground59.drop',{
 check(){return H.S.on&&!H.S.dead?true:{reason:'inactive'}},
 apply(p,c){if(c.mine){const item=B.take(p.cell);if(!item)return{ok:false,reason:'missing'};p.item=item;p.x=H.pos.x;p.y=H.pos.y;Object.assign(p,scope());p.expires=H.GT+3;delete p.cell}
 if(!B.valid(p.item)||![p.x,p.y,p.expires,p.h].every(Number.isFinite)||!Number.isInteger(p.floor)||typeof p.key!=='string')return{ok:false,reason:'invalid'};
 prune();if(drops.some(d=>d.id===c.cmd.id))return{ok:false,reason:'duplicate'};drops.push({id:c.cmd.id,item:{...p.item},x:p.x,y:p.y,key:p.key,floor:p.floor,h:p.h,expires:p.expires});if(c.mine)save();return{ok:true,inv:c.mine,msg:c.mine?'Đã vứt '+p.item.name+' — nhặt lại trong 3 giờ game':'',anim:false}}});
H.CMD.def('ground59.pick',{
 check(p){prune();const d=drops.find(d=>d.id===p.id);if(!d||!near(d))return{reason:'gone'};return B.space(d.item)?true:{reason:'full',msg:'Túi đầy — đồ vẫn nằm trên đất'}},
 apply(p,c){prune();const d=drops.find(d=>d.id===p.id);if(!d)return{ok:false,reason:'gone'};if(c.mine&&(!near(d)||!B.grant(d.item)))return{ok:false,reason:'full',msg:'Túi đầy — đồ vẫn nằm trên đất'};drops=drops.filter(x=>x.id!==d.id);if(c.mine)save();return{ok:true,inv:c.mine,msg:c.mine?'Nhặt lại '+d.item.name:'',anim:c.mine}}});
function action(){prune();if(!H.S.on||H.S.dead)return null;const d=drops.filter(near).sort((a,b)=>Math.hypot(a.x-H.pos.x,a.y-H.pos.y)-Math.hypot(b.x-H.pos.x,b.y-H.pos.y))[0];return d?{label:'📦<br>Nhặt '+d.item.name.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),fn:()=>H.CMD.exec('ground59.pick',{id:d.id}),t:d}:null}
function icon59(g,x,y,z){if(!g)return;g.save();g.fillStyle='#0007';g.beginPath();g.ellipse(x,y,z*.4,z*.14,0,0,7);g.fill();g.fillStyle='#a37a45';g.fillRect(x-z*.3,y-z*.5,z*.6,z*.45);g.strokeStyle='#e9c584';g.lineWidth=Math.max(1,z*.025);g.strokeRect(x-z*.3,y-z*.5,z*.6,z*.45);g.fillStyle='#ead49e';g.fillRect(x-z*.06,y-z*.5,z*.12,z*.45);g.restore()}
function draw2(g,z,X,Y,key='',floor=0){for(const d of list(key,floor))icon59(g,X(d.x),Y(d.y),z)}
const draw=H.F5.draw2;H.F5.draw2=function(L,X,Y,cx,cy,vw,vh,t,g,z){draw?.call(this,L,X,Y,cx,cy,vw,vh,t,g,z);if(globalThis.I46?.active)return;for(const d of list())if(Math.abs(d.x-cx)<vw&&Math.abs(d.y-cy)<vh)L.push([d.y,()=>icon59(g,X(d.x),Y(d.y),z)])};
H.SAVE.register({id:'ground59',scope:'world',version:1,defaults:()=>({drops:[]}),validate:v=>v&&Array.isArray(v.drops),get(){prune();return{drops:JSON.parse(JSON.stringify(drops))}},set(v){const seen=new Set();drops=(v.drops||[]).filter(d=>d&&typeof d.id==='string'&&!seen.has(d.id)&&B.valid(d.item)&&[d.x,d.y,d.expires,d.h].every(Number.isFinite)&&typeof d.key==='string'&&Number.isInteger(d.floor)&&alive(d)&&(seen.add(d.id),true)).map(d=>({...d,item:{...d.item}}))}});
globalThis.GROUND59={drop:cell=>H.CMD.exec('ground59.drop',{cell:{...cell}}),action,list,draw2,icon59};
})();
