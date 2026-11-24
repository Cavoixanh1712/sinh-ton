/* Interior encounters and finite grocery loot. Reuses native enemy combat/respawn,
   inventory, commands and SAVE registry; never changes exterior encounters. */
(()=>{'use strict';const H=globalThis.SH,A=globalThis.I46;if(!H||!A)return;
const X=H.X,S=H.S,W=H.WORLD,PREFIX='inside52:',done=new Set();
const quotas={store:[[4,1]],mall:[[5,1],[4,1],[5,1]],hospital:[[4,0],[4,1],[3,1]],school:[[4,0],[4,1]],fire:[[3,1],[3,0]],police:[[4,1],[3,1]]};
const defs={milk52:['Sữa tươi',5],sugar52:['Đường',10]};
for(const[k,[name,stack]]of Object.entries(defs)){X.STK[k]=stack;H.F4.names[k]=name;if(!Number.isFinite(S[k]))S[k]=0;if(!globalThis.F5KEYS.includes(k))globalThis.F5KEYS.push(k)}
H.SAVE.register({id:'groceries52',scope:'player',version:1,defaults:()=>({milk52:0,sugar52:0}),get:()=>({milk52:S.milk52,sugar52:S.sugar52}),set:v=>{for(const k in defs)S[k]=Number.isFinite(v[k])?Math.max(0,Math.floor(v[k])):0}});
const oldIcon=H.F5.icon;H.F5.icon=(k,px)=>defs[k]?'<img src="icons/'+k+'.svg" alt="'+defs[k][0]+'" draggable="false" style="width:'+(px||34)+'px;height:'+(px||34)+'px;vertical-align:middle">':oldIcon(k,px);
const oldCell=H.F5.ic;H.F5.ic=x=>defs[x.k]?H.F5.icon(x.k,34):oldCell(x);
const oldFoodInfo=H.F5.info;H.F5.info=k=>defs[k]?'Vật tư thực phẩm tìm thấy trong cửa hàng tiện lợi và trung tâm thương mại.':oldFoodInfo(k);
const oldInfo=H.F4.info;H.F4.info=k=>defs[k]?'Vật tư thực phẩm tìm thấy trong cửa hàng tiện lợi và trung tâm thương mại.':oldInfo(k);
const oldKind=A.kind;A.kind=(type,l,it)=>{if(type==='store'||type==='mall'&&l!==1){const n=Number(String(it.id).replace(/\D/g,''))||0;const k=n%5;if(k===0)return'milk52';if(k===1)return'sugar52'}return oldKind(type,l,it)};
const inside=(e,f)=>e.x>=f.b.x0&&e.x<=f.b.x1&&e.y>=f.b.y0&&e.y<=f.b.y1;
function legacy(e,d){return (e.t==='z'||e.t==='b')&&!String(e.id).startsWith(PREFIX)&&d.floors.some(f=>inside(e,f)||(Array.isArray(e.reg)&&e.reg[0]>=f.b.x0&&e.reg[2]<=f.b.x1&&e.reg[1]>=f.b.y0&&e.reg[3]<=f.b.y1))}
function remove(e){const i=H.ens.indexOf(e);if(i>=0)H.ens.splice(i,1);W.byId.e.delete(e.id)}
function specs(d){const a=[];quotas[d.type].forEach(([z,b],l)=>{const f=d.floors[l];if(!f)return;for(const[t,n]of[['z',z],['b',b]])for(let i=0;i<n;i++)a.push({id:PREFIX+d.key+':'+l+':'+t+':'+i,t,l,reg:[f.b.x0+.6,f.b.y0+.6,f.b.x1-.6,f.b.y1-.6]})});return a}
function hash(s){let v=2166136261;for(const c of s)v=Math.imul(v^c.charCodeAt(0),16777619);return v>>>0}
const grids=new WeakMap();
function points(scene,l){let cache=grids.get(scene);if(!cache){cache=new Map();grids.set(scene,cache)}if(cache.has(l))return cache.get(l);const q=[[40,35]],seen=new Set(['40,35']),out=[];for(let i=0;i<q.length;i++){const[u,v]=q[i],x=u*.5,z=v*.5;if(scene.walkable(x,z,l,.7)&&Math.hypot(x-20,z-17.5)>5)out.push({x,z});for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const j=u+a,k=v+b,key=j+','+k;if(j<2||j>78||k<2||k>38||seen.has(key)||!scene.walkable(j*.5,k*.5,l,.36))continue;seen.add(key);q.push([j,k])}}cache.set(l,out);return out}
function locate(e,d,scene,used){const l=specs(d).find(s=>s.id===e.id)?.l;if(l===undefined)return;const f=d.floors[l].b,ps=points(scene,l);let p=null,start=hash(e.id)%Math.max(1,ps.length);for(let i=0;i<ps.length;i++){const c=ps[(start+i*37)%ps.length];if(!used.some(u=>u.l===l&&Math.hypot(u.x-c.x,u.z-c.z)<2.4)){p=c;break}}if(!p)p=ps[start];if(p){e.x=f.x0+p.x;e.y=f.y0+p.z;e.wx=e.x;e.wy=e.y;used.push({...p,l})}}
function spawn(s,p){const e=X.mkE(s.t,s.reg);e.id=s.id;e.h2=true;if(p&&[p[1],p[2],p[3]].every(Number.isFinite)){e.x=p[1];e.y=p[2];e.wx=e.x;e.wy=e.y;e.hp=Math.max(1,Math.min(e.mhp,p[3]))}H.ens.push(e);W.byId.e.set(e.id,e);return e}
function balance(d,scene){if(!quotas[d.type])return;W.ensureIds();for(const e of H.ens.slice())if(legacy(e,d))remove(e);const used=[];
 if(!done.has(d.key)){done.add(d.key);for(const s of specs(d)){const e=spawn(s);locate(e,d,scene,used)}}else for(const e of H.ens)if(String(e.id).startsWith(PREFIX+d.key+':')){const s=specs(d).find(s=>s.id===e.id);if(!s)continue;const f=d.floors[s.l].b;if(!scene.walkable(e.x-f.x0,e.y-f.y0,s.l,.6))locate(e,d,scene,used)}
}
const enter=A.enter;A.enter=async function(...args){const ok=await enter(...args);if(ok&&A.scene){balance(A.scene.descriptor,A.scene);H.SAVE.save('inside52-enter',false)}return ok};
W.on(ev=>{if(ev.type!=='enemy.respawn')return;const e=W.byId.e.get(ev.data?.id);if(!e)return;for(const d of A.buildings)if(done.has(d.key)&&legacy(e,d)){remove(e);return}if(A.scene&&String(e.id).startsWith(PREFIX+A.scene.descriptor.key+':'))locate(e,A.scene.descriptor,A.scene,[])});
H.SAVE.register({id:'inside52',scope:'world',version:1,defaults:()=>({buildings:[]}),validate:v=>v&&Array.isArray(v.buildings),
 get:()=>({buildings:A.buildings.filter(d=>done.has(d.key)).map(d=>({key:d.key,alive:H.ens.filter(e=>String(e.id).startsWith(PREFIX+d.key+':')).map(e=>[e.id,e.x,e.y,e.hp])}))}),
 set:v=>{for(const e of H.ens.slice())if(String(e.id).startsWith(PREFIX))remove(e);done.clear();for(const row of v.buildings){const d=A.buildings.find(d=>d.key===row.key);if(!d||!d.floors.length||!Array.isArray(row.alive))continue;done.add(d.key);for(const e of H.ens.slice())if(legacy(e,d))remove(e);const ss=specs(d),ids=new Set();for(const p of row.alive){if(!Array.isArray(p)||ids.has(p[0]))continue;const s=ss.find(s=>s.id===p[0]);if(!s||![p[1],p[2],p[3]].every(Number.isFinite)||p[3]<=0||p[1]<s.reg[0]-.6||p[1]>s.reg[2]+.6||p[2]<s.reg[1]-.6||p[2]>s.reg[3]+.6)continue;ids.add(p[0]);spawn(s,p)}}}});
globalThis.CONTENT52={revision:52,quotas,get initialized(){return[...done]},specs};
})();
