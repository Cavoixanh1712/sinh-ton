/* ===================== LẦN 27: TÀI NGUYÊN NGẪU NHIÊN Ở 2 KHU MỞ =====================
   Khu mở: Rừng Suối Mây + Thành Phố Thiên Đường. Bỏ đồ nhặt dưới đất cũ (rương 📦, đồ hộp, thuốc, gỗ/đá/quả cố định).
   Thay bằng: gỗ 100 · đá 100 · cây quả mọng 100 · cây gừng 100 · rau xanh 150 – vị trí ngẫu nhiên.
   Thu hoạch xong: gỗ/đá mọc lại sau 3 giờ game, cây (quả mọng, gừng, rau) sau 1 ngày game – ở chỗ ngẫu nhiên khác.
   R27S(seed): chọn chỗ ngẫu nhiên hợp lệ trong 2 khu mở (dùng cho 150 rương đồng/bạc giấu ngoài bản đồ). */
(()=>{'use strict';
const SH=globalThis.SH;if(!SH||!SH.X||!SH.F5||!globalThis.W15){console.warn('[R27] thiếu SH/W15');return}
const X=SH.X,S=SH.S,pos=SH.pos,F5=SH.F5,W=globalThis.W15,SAVE=X.SAVE,WORLD=X.WORLD;
const say=m=>{try{SH.say(m)}catch(_){}};const GT=()=>+SH.GT||0,IH=()=>!!(SH.IH&&SH.IH());
const OPEN=new Set(['Rừng Suối Mây','Thành Phố Thiên Đường']);
const CNT={w:100,s:100,b:100,g:100,v:150},RESP={w:24,s:24,b:24,g:24,v:24};/* L28: gỗ & đá cũng mọc lại sau 1 ngày */
const NM={w:'gỗ',s:'đá',b:'quả mọng',g:'củ gừng',v:'rau xanh'};
/* ---------- vùng 2 khu mở ---------- */
let BB=null;function bbox(){if(BB)return BB;let a=[1e9,1e9,-1e9,-1e9];for(const z of(W.ZV2||[]))if(OPEN.has(z.n)&&z.bb){a=[Math.min(a[0],z.bb[0]),Math.min(a[1],z.bb[1]),Math.max(a[2],z.bb[2]),Math.max(a[3],z.bb[3])]}if(a[0]>a[2])a=[-700,-1000,1700,1300];return BB=a}
function mrng(s){s=(s|0)||1;return()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const lots=()=>{const out=[];try{for(const B of(NHA.bases?NHA.bases():[]).concat(NHA.EXTRA||[]))if(B&&isFinite(B.cx))out.push(NHA.lotRect?NHA.lotRect(B):NHA.houseRect(B,5))}catch(_){}return out};
let LOTS=null,LOTT=0;
function okSpot(x,y,m){if(globalThis.BORDER_CLEAN28?.contains(x,y))return false;const z=W.zoneAt2(x,y);if(!z||!OPEN.has(z.n))return false;if(W.inLocked&&W.inLocked(x,y))return false;
 try{if(W.water&&W.water(x,y).d>0)return false}catch(_){}if(SH.inLk&&SH.inLk(x,y,1))return false;if(SH.deepAt&&SH.deepAt(x,y,.5))return false;
 try{if(W.M3&&W.M3.roadAt&&W.M3.roadAt(x,y,.6))return false}catch(_){}
 for(const b of SH.blds)if(b.x0<5000&&!b.hid20&&x>b.x0-1&&x<b.x1+1&&y>b.y0-1&&y<b.y1+1.5)return false;
 if(!LOTS||performance.now()-LOTT>5000){LOTS=lots();LOTT=performance.now()}for(const R of LOTS)if(x>R[0]-1&&x<R[2]+1&&y>R[1]-1&&y<R[3]+1)return false;
 if(X.hitC(x,y,m||.6))return false;return true}
function spot(R){const b=bbox();for(let k=0;k<900;k++){const x=b[0]+R()*(b[2]-b[0]),y=b[1]+R()*(b[3]-b[1]);if(okSpot(x,y))return[+x.toFixed(2),+y.toFixed(2)]}return null}
globalThis.R27S=seed=>spot(mrng(seed));
/* ---------- bỏ đồ nhặt dưới đất kiểu cũ ---------- */
function killLegacy(){let n=0;for(const it of SH.items){if(!it.k27){it.k27=1;n++}if(it.on){it.on=false}clearTimeout(it._tm);it._tm=0}return n}
killLegacy();
/* ---------- tài nguyên mới ---------- */
const RL=[];let seq=0;
function gen(t,R){const p=spot(R||Math.random);if(!p)return null;const r={id:'r'+t+(++seq),t,x:p[0],y:p[1],on:true,at:0,v:t==='b'?(Math.random()*10)|0:0};return r}
function fill(){const have={};for(const r of RL)have[r.t]=(have[r.t]||0)+1;for(const t in CNT)for(let i=have[t]||0;i<CNT[t];i++){const r=gen(t);if(r)RL.push(r)}}
const cover=(x,y)=>X.hitC(x,y,1.5)&&!X.hitC(x,y,.6);
/* L28: quả mọng ưu tiên mọc chỗ khuất (sát gốc cây, đá, tường) */
function hideNear(r){if(cover(r.x,r.y)){r.hid=1;return}for(let k=0;k<40;k++){const a=Math.random()*6.283,d=1+Math.random()*10,x=r.x+Math.cos(a)*d,y=r.y+Math.sin(a)*d;if(okSpot(x,y)&&cover(x,y)){r.x=+x.toFixed(2);r.y=+y.toFixed(2);break}}r.hid=1}
function respawn(r){let p=null;if(r.t==='b'){for(let k=0;k<25&&!p;k++){const q=spot(Math.random);if(q&&cover(q[0],q[1]))p=q}}if(!p)p=spot(Math.random);if(!p)return;r.x=p[0];r.y=p[1];r.on=true;r.at=0;r.hid=0;if(r.t==='b')r.v=(Math.random()*10)|0}
function reward(r,actor=null){const target=actor?actor.inv:S;const BB=actor?null:X.BB;if(r.t==='w'){if(!actor&&!X.room('wood'))return null;target.wood=(target.wood||0)+1;return'+1 gỗ'}
 if(r.t==='s'){if(!actor&&!X.room('stone'))return null;target.stone=(target.stone||0)+1;return'+1 đá'}
 if(r.t==='b'){if(!actor&&!X.room('eat'))return null;if(actor)target.berry=(target.berry||0)+1;else S.eat++;if(BB)BB[r.v]=(BB[r.v]||0)+1;return'+1 '+((SH.BN||[])[r.v]||'quả mọng')}
 if(r.t==='g'){if(actor){target.ck_ginger=(target.ck_ginger||0)+1;return'+1 củ gừng'}return X.give('ck_ginger',1)?'+1 củ gừng':null}if(r.t==='v'){if(actor){target.ck_veg=(target.ck_veg||0)+1;return'+1 rau xanh'}return X.give('ck_veg',1)?'+1 rau xanh':null}return null}
function pick(r,actor=null){if(!RL.includes(r)||!r.on||(actor?actor.dead:S.dead)||!S.on)return;const at=actor||pos;if(Math.hypot(at.x-r.x,at.y-r.y)>2.6)return;const m=reward(r,actor);if(!m)return say('🎒 Túi đầy! Mở túi 🎒 để vứt bớt đồ');r.on=false;r.at=GT()+RESP[r.t];
 if(!actor)say((r.t==='w'?'🪵 ':r.t==='s'?'🪨 ':r.t==='b'?'🍓 ':r.t==='g'?'🫚 ':'🥬 ')+m);WORLD.emit('r27.pick',{id:r.id,t:r.t,by:actor?actor.id:X.SID});try{if($('inv').style.display==='flex')X.renderInv()}catch(_){}return{ok:true}}
const $=id=>document.getElementById(id);
{const a0=F5.acts;F5.acts=c=>{a0&&a0(c);if(IH())return;for(const r of RL){if(!r.on)continue;const d=Math.hypot(pos.x-r.x,pos.y-r.y);if(d<1.8)c(d+.01,1.8,{w:'🪵<br>Nhặt gỗ',s:'🪨<br>Nhặt đá',b:'🍓<br>Hái quả',g:'🫚<br>Nhổ gừng',v:'🥬<br>Hái rau'}[r.t],()=>pick(r),r)}}}
/* ---------- vòng cập nhật: mọc lại + kiểm tra chỗ mọc khi khu rừng gần đó vừa tải ---------- */
let lastChk=0;
setInterval(()=>{try{const g=GT();for(const r of RL)if(!r.on&&r.at&&g>=r.at)respawn(r);for(const it of SH.items)if(it.on){it.on=false;clearTimeout(it._tm)}
 const now=performance.now();if(now-lastChk>2000){lastChk=now;for(const r of RL){if(!r.on||Math.abs(r.x-pos.x)>=45||Math.abs(r.y-pos.y)>=40)continue;if(X.hitC(r.x,r.y,.45)){respawn(r);continue}if(r.t==='b'&&!r.hid&&Math.hypot(r.x-pos.x,r.y-pos.y)>24)hideNear(r)}}}catch(e){if(!R27.err){R27.err=String(e&&e.stack||e);console.warn('[R27]',e)}}},500);
/* ---------- vẽ 2D ---------- */
const IMG={};for(const k of['ginger_plant','veg_plant'])(IMG[k]=new Image()).src='r27/'+k+'.png';
const okI=im=>im&&im.complete&&im.naturalWidth>0;
function drawR(g,r,x,y,Z){g.save();const sh=(w)=>{g.fillStyle='rgba(10,10,20,.22)';g.beginPath();g.ellipse(x,y,w,Math.max(2,Z*.12),0,0,7);g.fill()};
 if(r.t==='w'){sh(Z*.5);g.fillStyle='#8b5a2b';g.strokeStyle='#4a2c12';g.lineWidth=Math.max(1,Z*.04);for(const[dx,dy]of[[0,0],[.15,-.22]]){const xx=x-Z*.45+dx*Z,yy=y-Z*.3+dy*Z;g.beginPath();g.roundRect?g.roundRect(xx,yy,Z*.9,Z*.28,Z*.12):g.rect(xx,yy,Z*.9,Z*.28);g.fill();g.stroke();g.fillStyle='#c9a06a';g.beginPath();g.arc(xx+Z*.86,yy+Z*.14,Z*.12,0,7);g.fill();g.stroke();g.fillStyle='#8b5a2b'}}
 else if(r.t==='s'){sh(Z*.42);for(const[dx,dy,w,h,c]of[[-.12,-.18,.36,.2,'#8a8f98'],[.14,-.14,.26,.16,'#a9aeb8'],[0,-.3,.24,.14,'#9aa0aa']]){g.fillStyle=c;g.strokeStyle='#4a4e56';g.lineWidth=Math.max(1,Z*.03);g.beginPath();g.ellipse(x+dx*Z,y+dy*Z,w*Z,h*Z,0,0,7);g.fill();g.stroke()}}
 else{const a=r.t==='b'?(SH.AS&&SH.AS['bry'+r.v]):null,im=r.t==='g'?IMG.ginger_plant:r.t==='v'?IMG.veg_plant:a&&a.i,wt=r.t==='b'?1.15:r.t==='g'?1.4:1.05;
  if(im&&okI(im)){const w=Z*wt,h=w*im.naturalHeight/im.naturalWidth;sh(w*.36);g.drawImage(im,x-w/2,y-h+Z*.06,w,h)}else{sh(Z*.3);g.fillStyle=r.t==='b'?'#c02a5a':'#4caf3a';g.beginPath();g.arc(x,y-Z*.3,Z*.3,0,7);g.fill()}}
 g.restore()}
{const o=F5.draw2;F5.draw2=(L,Xf,Yf,cx,cy,vw,vh,t,g,Z)=>{o&&o(L,Xf,Yf,cx,cy,vw,vh,t,g,Z);if(IH())return;for(const r of RL)if(r.on&&Math.abs(r.x-cx)<vw+1&&Math.abs(r.y-cy)<vh+2)L.push([r.y,()=>drawR(g,r,Xf(r.x),Yf(r.y),Z)])}}
/* ---------- 2.5D: thẻ đứng ---------- */
const M3=new Map(),TEX=new Map();let geo=null;
function tex(r){const V=SH.V25,T=V.T15.T,k=r.t+(r.t==='b'?r.v:'');let tx=TEX.get(k);if(tx&&tx.ok)return tx;
 const c=document.createElement('canvas');c.width=96;c.height=128;const g=c.getContext('2d');drawR(g,r,48,122,64);const n=new T.CanvasTexture(c);
 n.ok=r.t==='w'||r.t==='s'||(r.t==='b'?!!(SH.AS['bry'+r.v]&&okI(SH.AS['bry'+r.v].i)):okI(r.t==='g'?IMG.ginger_plant:IMG.veg_plant));if(tx)tx.dispose&&tx.dispose();TEX.set(k,n);return n}
function upd3(){const V=SH.V25;if(!V||!V.on||!V.T15){for(const m of M3.values())m.visible=false;return}const T=V.T15.T,scene=V.T15.scene,ih=IH();if(!geo){geo=new T.PlaneGeometry(1,1);geo.translate(0,.5,0)}
 for(const r of RL){const near=!ih&&r.on&&Math.abs(r.x-pos.x)<55&&Math.abs(r.y-pos.y)<45;let m=M3.get(r);if(!near){if(m){scene.remove(m);M3.delete(r)}continue}
  const tx=tex(r);if(!m){m=new T.Mesh(geo,V.T15.cardMat(tx));scene.add(m);M3.set(r,m)}else if(m.material.map!==tx)m.material=V.T15.cardMat(tx);m.scale.set(1.5,2*V.T15.CARD,1);m.position.set(r.x,0,r.y+.04);m.visible=true}}
setInterval(()=>{try{upd3()}catch(e){if(!R27.e3){R27.e3=String(e&&e.stack||e);console.warn('[R27] 2.5D',e)}}},250);
/* ---------- lưu ---------- */
SAVE.register({id:'r27',scope:'world',version:1,defaults:()=>({seq:0,list:[]}),validate:d=>d&&Array.isArray(d.list),
 get:()=>({seq,list:RL.map(r=>[r.id,r.t,r.x,r.y,r.on?1:0,r.on?0:+Math.max(0,r.at-GT()).toFixed(3),r.v|0])}),
 set:d=>{for(const m of M3.values())m.parent&&m.parent.remove(m);M3.clear();RL.length=0;seq=Math.max(0,d.seq|0);const ids=new Set(),n={};
  for(const a of d.list){if(!Array.isArray(a)||!CNT[a[1]]||!isFinite(a[2])||!isFinite(a[3]))continue;const id=String(a[0]||'');if(ids.has(id))continue;n[a[1]]=(n[a[1]]||0)+1;if(n[a[1]]>CNT[a[1]])continue;ids.add(id);
   const r={id,t:a[1],x:+a[2],y:+a[3],on:!!a[4],at:0,v:Math.max(0,Math.min(9,a[6]|0))};if(!r.on)r.at=GT()+Math.max(0,Math.min(RESP[r.t],+a[5]||0));RL.push(r);const m=/^r[a-z](\d+)$/.exec(id);if(m)seq=Math.max(seq,+m[1])}
  fill();killLegacy()}});
fill();
const R27={cover,hideNear,RL,CNT,RESP,OPEN,spot:()=>spot(Math.random),okSpot,pick,pickForActor:(actor,r)=>pick(r,actor),respawn,killLegacy,bbox};globalThis.R27=R27;
})();
