/* ===================== LẦN 26: NẤU ĂN SINH TỒN + THANH THÂN NHIỆT =====================
   - Bếp lửa (5 đá + 3 củi, mở khóa ở nhà cấp 2): đặt có bóng xem trước xanh/đỏ, nhóm lửa, thêm củi, tắt lửa,
     di chuyển, thu hồi. Lửa sưởi ấm, đốt củi theo giờ trong game.
   - Nồi & bát (tìm được khi lục đồ hoặc chế tạo ở nhà cấp 2). Đặt nồi lên bếp, E vào nồi → giao diện nấu.
   - Nấu tự do (kéo/thả hoặc chạm), tự nhận diện món, Sổ công thức (chỉ hiện đủ món đã khám phá).
   - 6 món: canh thịt gừng, cháo thịt, súp nấm, canh rau, thịt hầm, nước gừng. Múc từng khẩu phần ra bát.
   - Thanh thân nhiệt 4 mức × 4 vạch. Nước gừng +1 mức (tối đa Ấm), giữ 8 giờ trong game.
   - Lưu: bếp, củi, nồi, nguyên liệu, món đang nấu, khẩu phần (thế giới); công thức đã khám phá, hiệu ứng gừng (nhân vật).
   1 giờ trong game = 10 giây thật (theo đồng hồ sẵn có của game). */
(()=>{'use strict';
const SH=globalThis.SH;if(!SH||!SH.X||!SH.F5){console.warn('[CK26] thiếu SH');return}
const X=SH.X,S=SH.S,pos=SH.pos,F5=SH.F5,STK=X.STK,F4=X.F4,SAVE=X.SAVE,WORLD=X.WORLD;
const say=m=>{try{SH.say(m)}catch(_){}};
const GT=()=>+SH.GT||0,IH=()=>!!(SH.IH&&SH.IH()),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const $=id=>document.getElementById(id);
const FUEL_H=2,FUEL_MAX=16,POR_MAX=8,ING_MAX=12,HEAT_R=4.5,HEAT_MAX=8;  // 1 củi = 2 giờ game (20 giây thật)
const lv=()=>{try{if(globalThis.CO&&CO.none)return 0;if(globalThis.NHA&&NHA.PB)return NHA.PB.lv|0;return S.hl||1}catch(_){return 1}};

/* ---------- hình ---------- */
const SP={};for(const k of['pot_lid','pot_empty','pot_stew','pot_boil','bowl_e','bowl_f','bowlw_e','bowlw_f']){const im=new Image();im.src='ck26/'+k+'.png';SP[k]=im}
const okI=im=>im&&im.complete&&im.naturalWidth>0;
function grid(rows,pal){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
 rows.forEach((r,j)=>{for(let i=0;i<16;i++){const ch=r[i];if(!ch||ch==='.')continue;const col=pal[ch];if(!col)continue;g.fillStyle=col;g.fillRect(i*4,j*4,4,4)}});return c.toDataURL()}
const PX={
 ck_meat:[['................','................','....kkkkkkk.....','..kkrrrrrrrkk...','.krrrrdrrrrrrk..','.krwwwwrrrdrrrk.','krrrrrwwwrrrrrk.','krrdrrrrwwrrrrk.','krrrrrrrrrwwrrk.','krrrrdrrrrrrwwk.','.krrrrrrrdrrrk..','.kkrrrrrrrrrk...','...kkkkkkkkk....'],{k:'#4a1a14',r:'#d2483e',d:'#a8322b',w:'#f4dccd'}],
 ck_ginger:[['................','................','.........kk.....','....kk..kllk....','...kllk.klyk.kk.','...klyyk.kyykllk','....kyyykkyyyyk.','..kkkyyyyyyyyk..','.kllyyyyysyyyk..','.klyyysyyyyyyyk.','..kyyyyyyyysyyk.','...kkyyyyyyyykk.','.....kkkkkkkk...'],{k:'#5a3a1a',y:'#d9a95a',l:'#f0cc85',s:'#b07a35'}],
 ck_veg:[['.......kk.......','.....kkGGkk.....','....kGGgGGGk....','...kGgGkGgGGk...','..kGGgGkGgGGGk..','..kgGgGkGgGgGk..','..kgGvGkGvGgGk..','...kgvGkGvGgk...','...kkwwkwwwkk...','....kwwwwwwk....','....kwwwwwwk....','....kwwwwwwk....','.....kwwwwk.....','......kkkk......'],{k:'#1f4a1a',g:'#4caf3a',G:'#7ad65a',w:'#eef6dc',v:'#2e7d2a'}],
 ck_mush:[['................','................','.....kkkkkk.....','...kkCCCCCCkk...','..kCCdCCCCdCCk..','.kCCCCCCdCCCCCk.','.kCcCCdCCCCCcCk.','.kcccccccccccck.','..kkkkssssskkk..','.....kssSsk.....','.....kssSsk.....','.....kssSsk.....','....kssssSsk....','....kkkkkkkk....'],{k:'#3a1e10',c:'#b0482a',C:'#d8683e',d:'#f6e6c8',s:'#efe2c6',S:'#cdbb98'}],
 ck_rice:[['................','......k..k......','.....kbkkbk.....','......kttk......','.....kbbbbk.....','....kbwwwwbk....','...kbwwwwwwbk...','..kbbwwwwwwbbk..','..kbbbbbbbbbbk..','.kbbbBbbbbBbbbk.','.kbbbbbbbbbbbbk.','.kbBbbbbbbbbBbk.','.kbbbbbbBbbbbbk.','..kbbbbbbbbbbk..','...kkkkkkkkkk...'],{k:'#4a3a22',b:'#c9a66b',B:'#a8844a',w:'#fbf6ea',t:'#8a6a3a'}],
 ck_fire:[['................','.......f........','......fof.......','.....foof.......','.....forof......','....forrrof.....','....forrrof.....','...lLfrrrfLl....','..LllLooolLlL...','..kLlLLlLLLlk...','.kssSkssSkssSk..','.ksSsssSsssSsk..','..kkkkkkkkkkk...'],{k:'#2a2a2a',s:'#a0a0a0',S:'#6e6e6e',l:'#9a6430',L:'#5e3a1a',f:'#ffd84a',o:'#ff8a1e',r:'#e24a1a'}]};
const ICON={};for(const k in PX)ICON[k]=grid(PX[k][0],PX[k][1]);
ICON.ck_pot='ck26/pot_lid.png';ICON.ck_ginger='r27/ginger_root.png';ICON.ck_veg='r27/veg_bunch.png';ICON.ck_bowl='ck26/bowlw_e.png';ICON.water='icons/botC.png';

/* ---------- món ăn ---------- */
const RC=[
 {id:'d1',n:'Canh thịt gừng',ing:{ck_meat:1,ck_ginger:1,ck_veg:1,water:2},por:2,h:3,fx:{food:30,water:15,sta:10},liq:null},
 {id:'d2',n:'Cháo thịt',ing:{ck_rice:1,ck_meat:1,water:2},por:2,h:4,fx:{food:35,water:10,sta:5},liq:['#efe4c8','#e2b8a8','#d9cbb0']},
 {id:'d3',n:'Súp nấm',ing:{ck_mush:2,water:2},por:2,h:2.5,fx:{food:20,water:15,sta:10},liq:['#c99a62','#7a4a26','#e8d2a8']},
 {id:'d4',n:'Canh rau',ing:{ck_veg:2,water:2},por:2,h:2,fx:{food:15,water:20,sta:5},liq:['#cfe0a0','#4caf3a','#7ad65a']},
 {id:'d5',n:'Thịt hầm',ing:{ck_meat:2,ck_veg:1,ck_mush:1,water:1},por:2,h:5,fx:{food:45,water:5,sta:15},liq:null},
 {id:'d6',n:'Nước gừng',ing:{water:2,ck_ginger:1},por:2,h:1.5,fx:{water:25,sta:20},liq:['#e8b040','#f6d27a','#c98a2a'],ginger:1}];
const RCI={};for(const r of RC)RCI[r.id]=r;
const DISH={};for(const r of RC)DISH['ck_'+r.id]={r};
const INGK=['ck_meat','ck_ginger','ck_veg','ck_mush','ck_rice','water'];
const NMI={ck_meat:'Thịt',ck_ginger:'Gừng',ck_veg:'Rau xanh',ck_mush:'Nấm',ck_rice:'Gạo',water:'Nước sạch'};
function dishIcon(r){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.imageSmoothingEnabled=true;
 const full=!r.liq,im=full?SP.bowlw_f:SP.bowlw_e;if(!okI(im))return null;const w=60,h=w*im.naturalHeight/im.naturalWidth;const y0=64-h;g.drawImage(im,2,y0,w,h);
 if(!full){const bh=SP.bowlw_e.naturalHeight,bw=SP.bowlw_e.naturalWidth,sx=w/bw;const cx=2+48*sx,cy=y0+17*sx,rx=37*sx,ry=10*sx;
  g.fillStyle=r.liq[0];g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.ellipse(cx-rx*.3,cy-ry*.35,rx*.35,ry*.25,0,0,7);g.fill();
  const bits=r.id==='d6'?[[-.35,.1],[.25,-.15],[.05,.3]]:[[-.45,0],[-.15,.3],[.2,-.2],[.4,.15],[0,-.35]];
  bits.forEach(([a,b],i)=>{g.fillStyle=r.liq[1+(i%2)];g.beginPath();g.ellipse(cx+a*rx,cy+b*ry,rx*.12,ry*.32,0,0,7);g.fill()})}
 return c.toDataURL()}
function mkDishIcons(){let ok=true;for(const r of RC){const u=dishIcon(r);if(u)ICON['ck_'+r.id]=u;else ok=false}return ok}
{let n=0;const t=setInterval(()=>{if(mkDishIcons()||++n>60)clearInterval(t)},250)}
const imgH=(k,px)=>{const s=ICON[k]||(DISH[k]?'ck26/bowlw_f.png':null);return s?'<img src="'+s+'" alt="" draggable="false" style="width:'+px+'px;height:'+px+'px;object-fit:contain;vertical-align:middle;image-rendering:'+(PX[k]&&String(ICON[k]).startsWith('data:')?'pixelated':'auto')+'">':''};

/* ---------- vật phẩm ---------- */
const ITM={ck_fire:['Bếp lửa',1,'Bếp lửa: đặt ngoài trời hoặc trong nhà an toàn của bạn (có bóng xem trước). Nhóm lửa bằng củi để sưởi ấm, đun nước, nấu ăn. Có thể di chuyển, thu hồi.'],
 ck_pot:['Nồi',1,'Nồi: đặt lên bếp lửa rồi nhấn E vào nồi để nấu. Nồi chứa nhiều khẩu phần, múc ra bát để ăn.'],
 ck_bowl:['Bát',5,'Bát rỗng: dùng để múc món đã nấu trong nồi, mỗi bát 1 khẩu phần.'],
 ck_meat:['Thịt',10,'Thịt sống: nguyên liệu nấu ăn.'],ck_ginger:['Củ gừng',10,'Củ gừng: nấu nước gừng giữ ấm, hoặc canh thịt gừng.'],
 ck_veg:['Rau xanh',10,'Rau xanh: nguyên liệu nấu ăn.'],ck_mush:['Nấm',10,'Nấm: nguyên liệu nấu súp và thịt hầm.'],ck_rice:['Gạo',10,'Gạo: nấu cháo.']};
const fxTxt=fx=>[fx.food?'🍖+'+fx.food+' đói':'',fx.water?'💧+'+fx.water+' khát':'',fx.sta?'⚡+'+fx.sta+' thể lực':''].filter(Boolean).join(' · ');
for(const r of RC)ITM['ck_'+r.id]=['Bát '+r.n.charAt(0).toLowerCase()+r.n.slice(1),5,r.n+': '+fxTxt(r.fx)+(r.ginger?' · tăng 1 bậc thân nhiệt (tối đa Ấm, giữ 8 giờ)':'')+'. Ăn xong còn lại bát rỗng.'];
const KEYS=Object.keys(ITM);for(const k of KEYS){STK[k]=ITM[k][1];if(typeof S[k]!='number')S[k]=0;F4.names[k]=ITM[k][0]}
if(Array.isArray(globalThis.F5KEYS))for(const k of KEYS)if(!F5KEYS.includes(k))F5KEYS.push(k);
{const ic0=F5.ic;F5.ic=x=>(x&&x.k&&(ICON[x.k]||DISH[x.k]))?imgH(x.k,34):ic0(x)}
{const ic0=F5.icon;F5.icon=(k,px)=>(ICON[k]||DISH[k])&&k!=='water'?imgH(k,px||34):ic0(k,px)}
{const i0=F5.info;F5.info=k=>ITM[k]?ITM[k][2]:i0(k)}
{const b0=F5.btn0;F5.btn0=x=>{const k=x.k;if(k==='ck_fire')return'<button onclick="invUse()">Đặt</button>';if(DISH[k])return'<button onclick="invUse()">'+(DISH[k].r.ginger?'Uống':'Ăn')+'</button>';return b0(x)}}
{const u0=F5.invUse;F5.invUse=x=>{const k=x.k;if(k==='ck_fire'){closeInv();startPlace(null);return true}if(DISH[k]){eatDish(k);return true}return u0(x)}}
const closeInv=()=>{try{if($('inv')&&$('inv').style.display==='flex')globalThis.togInv()}catch(_){}};

/* ---------- chế tạo (mở khóa ở nhà cấp 2) ---------- */
{const r0=F5.recipes;F5.recipes=()=>r0().concat([
 {n:'Bếp lửa',ic:imgH('ck_fire',34),d:'Đặt ngoài trời hoặc trong nhà an toàn của bạn: nhóm lửa sưởi ấm, đun nước, nấu ăn (mở khóa ở nhà cấp 2)',cost:{stone:5,wood:3},st:'ck_fire',ok:()=>lv()>=2,no:'🔒 Nhà cấp 2'},
 {n:'Nồi',ic:imgH('ck_pot',34),d:'Đặt lên bếp lửa để nấu, chứa nhiều khẩu phần (mở khóa ở nhà cấp 2)',cost:{iron:2,wood:2},st:'ck_pot',ok:()=>lv()>=2,no:'🔒 Nhà cấp 2'},
 {n:'Bát',ic:imgH('ck_bowl',34),d:'Múc 1 khẩu phần món ăn từ nồi (mở khóa ở nhà cấp 2)',cost:{wood:2},st:'ck_bowl',ok:()=>lv()>=2,no:'🔒 Nhà cấp 2'}])}

/* ---------- nguồn nguyên liệu: lục đồ trong nhà + hái quả ngoài trời ---------- */
const give1=(k,n)=>X.give(k,n||1);
function loot(){if(Math.random()>.65)return null;const T=[['ck_meat',18],['ck_ginger',18],['ck_veg',18],['ck_mush',14],['ck_rice',14],['ck_bowl',10],['ck_pot',4]];let r=Math.random()*T.reduce((a,b)=>a+b[1],0),k=T[0][0];for(const q of T){if((r-=q[1])<0){k=q[0];break}}
 const n=(k==='ck_veg'||k==='ck_rice')&&Math.random()<.4?2:1,a=give1(k,n);return a?'🧺 Tìm thấy '+a+' '+ITM[k][0].toLowerCase():'🎒 Túi đầy'}
/* L27: bỏ thưởng 30% khi hái quả – gừng & rau xanh mọc thành cây riêng (r27.js) */

/* ---------- bếp lửa ---------- */
const FIRES=[];let seq=0;
const fireCol=f=>({x0:f.x-.42,x1:f.x+.42,z0:f.y-.32,z1:f.y+.26,ck26:1});
function addFire(f){f.c=fireCol(f);SH.cols.push(f.c);FIRES.push(f)}
function delFire(f){const i=FIRES.indexOf(f);if(i>=0)FIRES.splice(i,1);const j=SH.cols.indexOf(f.c);if(j>=0){SH.cols.splice(j,1);if(SH.colsDirty)SH.colsDirty()}if(OPEN&&OPEN.f===f)closeAll()}
function moveFire(f,x,y){const j=SH.cols.indexOf(f.c);if(j>=0)SH.cols.splice(j,1);f.x=x;f.y=y;f.c=fireCol(f);SH.cols.push(f.c);if(SH.colsDirty)SH.colsDirty()}
const newPot=()=>({ing:{},st:'idle',rid:null,m:0,left:0,tot:0,por:0});
const ingN=p=>Object.values(p.ing).reduce((a,b)=>a+b,0);
const fmtS=h=>{const s=Math.max(0,Math.round(h*10));return s>=60?Math.floor(s/60)+':'+String(s%60).padStart(2,'0'):s+'s'};
const inR=(R,x,y,m)=>x>R[0]-m&&x<R[2]+m&&y>R[1]-m&&y<R[3]+m;
function homeRect(){try{if(!globalThis.NHA||!NHA.PB||(globalThis.CO&&CO.none))return null;return NHA.houseRect(NHA.PB,NHA.PB.lv)}catch(_){return null}}
function otherHouse(x,y){try{const L=(NHA.bases?NHA.bases():[]).concat(NHA.EXTRA||[]);for(const B of L){if(!B||!isFinite(B.cx))continue;if(globalThis.CO&&Math.abs(B.cx-CO.x)<.2&&Math.abs(B.cy-CO.y)<.2)continue;if(B.st&&B.st!=='built'&&B.st!=='home')continue;const R=NHA.houseRect(B,B.lv||1);if(R&&inR(R,x,y,.3))return true}}catch(_){}return false}
function canPlace(x,y,self){if(IH())return'Chỉ đặt bếp trong nhà an toàn của bạn hoặc ngoài trời';
 const hr=homeRect();if(!(hr&&inR(hr,x,y,.3))&&otherHouse(x,y))return'Không đặt trong nhà của người khác';
 let on;if(self&&self.c){on=self.c.on;self.c.on=false}let hit=false;try{hit=X.hitC(x,y,.55)}finally{if(self&&self.c)self.c.on=on}
 if(hit)return'Vướng vật cản';
 if((SH.inLk&&SH.inLk(x,y,.4))||(SH.deepAt&&SH.deepAt(x,y,.3)))return'Không đặt trên mặt nước';
 for(const f of FIRES)if(f!==self&&Math.hypot(f.x-x,f.y-y)<1.6)return'Quá gần bếp khác';
 for(const b of(F5.barrels||[]))if(Math.hypot(b.x-x,b.y-y)<1.3)return'Quá gần thùng nước';
 if(Math.hypot(x-pos.x,y-pos.y)<.75)return'Đứng lùi lại một chút';return''}
function ignite(f){if(f.lit)return;if(f.fuel<=0){if(!(S.wood>0))return say('🪵 Cần 1 củi (gỗ) để nhóm lửa');S.wood--;f.fuel+=FUEL_H}f.lit=true;say('🔥 Đã nhóm lửa · cháy '+fmtS(f.fuel));WORLD.emit('ck26.fire.lit',{id:f.id})}
function addWood(f){if(!(S.wood>0))return say('🪵 Không còn củi (gỗ)');if(f.fuel>FUEL_MAX-FUEL_H+1e-6)return say('🔥 Bếp đã đầy củi');S.wood--;f.fuel+=FUEL_H;say('🪵 Thêm 1 củi · còn cháy '+fmtS(f.fuel))}
function douse(f){if(!f.lit)return;f.lit=false;say('💨 Đã tắt lửa · còn '+fmtS(f.fuel)+' củi chưa cháy')}
function putPot(f){if(f.pot)return;if(!(S.ck_pot>0))return say('🍲 Cần 1 nồi (tìm khi lục đồ hoặc chế tạo)');S.ck_pot--;f.pot=newPot();say('🍲 Đã đặt nồi lên bếp – nhấn E vào nồi để nấu')}
function takePot(f){const p=f.pot;if(!p)return;if(p.st==='cook')return say('⏳ Đang nấu – chưa tháo nồi được');if(p.por>0)return say('🥣 Nồi còn '+p.por+' khẩu phần – múc ra bát trước');if(ingN(p)>0)return say('Lấy nguyên liệu ra khỏi nồi trước');
 if(!X.room('ck_pot'))return say('🎒 Túi đầy');f.pot=null;S.ck_pot++;say('🍲 Đã tháo nồi cất vào túi')}
/* L29: đốt than củi – 3 gỗ, 20 giây (lửa phải cháy), được 2 than */
const COAL_W=3,COAL_N=2,COAL_U=2;
function coalStart(f){if(f.coal)return say(f.coal.left>0?'⚫ Đang đốt than':'⚫ Nhận than củi trước');if(!f.lit)return say('🔥 Nhóm lửa trước khi đốt than');if((S.wood|0)<COAL_W)return say('🪵 Cần '+COAL_W+' gỗ để đốt than');S.wood-=COAL_W;f.coal={left:COAL_U,tot:COAL_U,n:COAL_N};say('⚫ Bắt đầu đốt than · 20 giây');WORLD.emit('ck26.coal.start',{id:f.id})}
function coalTake(f){const c=f.coal;if(!c||c.left>0)return;let got=0;while(c.n>0&&X.give('ck_coal',1)===1){c.n--;got++}if(c.n<=0)f.coal=null;say(got?'⚫ Nhận '+got+' than củi'+(c.n>0?' · túi đầy, còn '+c.n:''):'🎒 Túi đầy')}
function recover(f){if(f.lit)return say('💨 Tắt lửa trước khi thu hồi');if(f.coal)return say('⚫ Nhận than củi trước khi thu hồi');if(f.pot)return say('🍲 Tháo nồi trước khi thu hồi');const w=Math.floor(f.fuel/FUEL_H+1e-6);
 if(!X.room('ck_fire'))return say('🎒 Túi đầy');S.ck_fire++;const got=w?X.give('wood',w):0;if(got<w){S.wood-=got;S.ck_fire--;return say('🎒 Túi đầy – cần chỗ cho bếp và '+w+' củi còn lại')}
 delFire(f);say('🔥 Đã thu hồi bếp lửa'+(w?' (+'+w+' củi)':''))}

/* ---------- nồi ---------- */
const haveI=k=>k==='water'?(S.botC|0)+(S.wat|0):(S[k]|0);
function addIng(f,k){const p=f&&f.pot;if(!p)return;if(p.st!=='idle'||p.por>0)return say(p.st==='cook'?'⏳ Đang nấu':'🥣 Múc hết món trong nồi trước');if(ingN(p)>=ING_MAX)return say('🍲 Nồi đã đầy nguyên liệu');if(!(haveI(k)>0))return;
 if(k==='water'){const src=S.botC>0?'botC':'wat';S[src]--;if(!X.room('botE')){S[src]++;return say('🎒 Túi đầy – không có chỗ cất chai rỗng')}S.botE++}else S[k]--;
 p.ing[k]=(p.ing[k]||0)+1;return true}
function remIng(f,k){const p=f&&f.pot;if(!p||p.st!=='idle'||!(p.ing[k]>0))return;
 if(k==='water'){if(!(S.botE>0))return say('🫙 Cần 1 chai rỗng để lấy nước ra');S.botE--;if(!X.room('botC')){S.botE++;return say('🎒 Túi đầy')}S.botC++}
 else{if(!X.room(k))return say('🎒 Túi đầy');S[k]++}
 p.ing[k]--;if(p.ing[k]<=0)delete p.ing[k];return true}
function match(ing){const ks=Object.keys(ing).filter(k=>ing[k]>0);if(!ks.length)return null;
 for(const r of RC){const rk=Object.keys(r.ing);if(rk.length!==ks.length||!rk.every(k=>ing[k]>0))continue;const m=ing[rk[0]]/r.ing[rk[0]];if(m<1||m!==Math.floor(m))continue;if(rk.every(k=>ing[k]===r.ing[k]*m))return{r,m,big:m*r.por>POR_MAX}}return null}
function closest(ing){let best=null;for(const r of RC){const ks=Object.keys(ing).filter(k=>ing[k]>0);if(!ks.every(k=>r.ing[k]&&ing[k]<=r.ing[k]))continue;const miss=Object.keys(r.ing).filter(k=>(ing[k]||0)<r.ing[k]).map(k=>(r.ing[k]-(ing[k]||0))+' '+NMI[k].toLowerCase());if(!best||miss.length<best.miss.length)best={r,miss}}return best}
const cookH=(r,m)=>r.h*(1+.35*(m-1));
function startCook(f){const p=f&&f.pot;if(!p||p.st!=='idle'||p.por>0)return;const mt=match(p.ing);if(!mt)return say('❓ Chưa thành món – thử kết hợp nguyên liệu khác');if(mt.big)return say('🍲 Quá nhiều – nồi chứa tối đa '+POR_MAX+' khẩu phần');
 if(!f.lit)return say('🔥 Nhóm lửa trước khi nấu');p.st='cook';p.rid=mt.r.id;p.m=mt.m;p.tot=p.left=cookH(mt.r,mt.m);p.ing={};say('🍲 Bắt đầu nấu '+mt.r.n+' · '+fmtS(p.tot));WORLD.emit('ck26.cook.start',{id:f.id,r:mt.r.id,m:mt.m})}
function serve(f,all){const p=f&&f.pot;if(!p||p.st!=='done'||p.por<=0)return;let n=0;const k='ck_'+p.rid;
 while(p.por>0&&S.ck_bowl>0){S.ck_bowl--;if(!X.room(k)){S.ck_bowl++;break}S[k]++;p.por--;n++;if(!all)break}
 const nm=RCI[p.rid]?RCI[p.rid].n:'';if(p.por<=0){p.st='idle';p.rid=null;p.m=0}
 say(n?'🥣 Đã múc '+n+' bát '+nm.toLowerCase()+(p.por?' · nồi còn '+p.por:''):S.ck_bowl>0?'🎒 Túi đầy':'🥣 Cần bát rỗng để múc');return n}
function recipeCook(f,r,m){const p=f&&f.pot;if(!p)return;if(p.st!=='idle'||p.por>0)return say('🍲 Nồi đang bận');if(ingN(p)>0)return say('Lấy nguyên liệu đang có trong nồi ra trước');
 if(!f.lit)return say('🔥 Nhóm lửa trước khi nấu');if(m*r.por>POR_MAX)return;for(const k in r.ing)if(haveI(k)<r.ing[k]*m)return say('Thiếu nguyên liệu');
 for(const k in r.ing)for(let i=0;i<r.ing[k]*m;i++){if(!addIng(f,k)){for(const q of Object.keys(p.ing))while(p.ing[q]>0&&remIng(f,q));return}}startCook(f)}

/* ---------- ăn / uống ---------- */
const G={g:0,until:0};
function eatDish(k){const D=DISH[k];if(!D||!(S[k]>0))return;if(S.dead||!S.on)return;const r=D.r;S[k]--;if(!X.room('ck_bowl')){S[k]++;return say('🎒 Túi đầy – không có chỗ cất bát rỗng')}S.ck_bowl++;
 const fx=r.fx;if(fx.food)S.food=Math.min(100,S.food+fx.food);if(fx.water)S.water=Math.min(100,S.water+fx.water);if(fx.sta)S.sta=Math.min(100,S.sta+fx.sta);
 let extra='';if(r.ginger){extra=gingerDrink()?' · 🔥 ấm lên 1 bậc ('+LVN[dispL(envState())]+')':' · thân nhiệt đã ở mức Ấm'}
 try{SH.FL&&SH.FL.push({x:pos.x,y:pos.y,v:'+'+(fx.food||fx.water),c:'#ffd27a',t0:performance.now()})}catch(_){}
 say((r.ginger?'🍵 Uống ':'🥣 Ăn ')+r.n.toLowerCase()+' · '+fxTxt(fx)+extra);WORLD.emit('ck26.eat',{r:r.id});try{X.renderInv&&$('inv').style.display==='flex'&&X.renderInv()}catch(_){}}

/* ---------- thân nhiệt ---------- */
const LVN=['Lạnh','Bình thường','Ấm','Nóng'],LVC=['#3a9df0','#5ccf3a','#f2a52a','#f0473a'],LVI=['❄️','🍃','♨️','🔥'],RANGE=[[0,15],[15,26],[26,33],[33,42]];
const lvlOf=t=>t<15?0:t<26?1:t<33?2:3;
const cellsOf=(t,L)=>{const[a,b]=RANGE[L];return clamp(Math.ceil((t-a)/(b-a)*4),1,4)};
function nearFire(){let best=null;if(IH())return null;for(const f of FIRES){if(!f.lit)continue;const d=Math.hypot(pos.x-f.x,pos.y-f.y);if(d<HEAT_R&&(!best||d<best.d))best={f,d}}return best}
function chkG(){if(G.g&&GT()>=G.until){G.g=0;G.until=0;say('🍵 Hiệu ứng giữ ấm của nước gừng đã hết')}}
function envState(){let amb=F5.temp?F5.temp():20;if(amb==null||!isFinite(amb))amb=20;const nf=nearFire(),heat=nf?HEAT_MAX*clamp((HEAT_R-nf.d)/(HEAT_R-1.2),0,1):0,rainCold=!!globalThis.WEATHER43?.state.hypo;let t=amb+heat-(rainCold?12:0),L=lvlOf(t),c=cellsOf(t,L);
 const rainLoss=rainCold?(globalThis.WEATHER43.state.loss||0):0;
 if(rainLoss){const idx=Math.max(0,L*4+c-1-rainLoss);L=Math.floor(idx/4);c=idx%4+1;const r=RANGE[L];t=r[0]+(c-.5)*(r[1]-r[0])/4}
 return{amb,heat,t,L,c,cold:rainCold||lvlOf(amb)===0,fire:!!nf,rainCold,rainLoss}}
const dispL=e=>Math.min(e.L+G.g,Math.max(e.L,2));
function gingerDrink(){chkG();const e=envState(),cur=dispL(e);if(cur<2&&e.L<2){G.g=Math.min(2,G.g+1);G.until=GT()+8;return true}return false}
function drainOf(e){if(!e.cold)return 0;const d=dispL(e);const base=d===0?10:d===1?5:2;return e.fire?base*.8:base}
const TS={e:null,d:0,L:1,c:1,drain:0};

/* ---------- vòng cập nhật (theo giờ trong game – tự dừng khi game tạm dừng) ---------- */
let lastG=null,lastN=0;
setInterval(()=>{try{const g=GT(),now=performance.now();let dG=lastG==null?0:g-lastG;lastG=g;if(!(dG>0)||dG>.6)dG=0;
 /* bếp, nấu, hao thể lực tính theo giây chơi thật (đơn vị lưu: 1 = 10 giây), chỉ chạy khi game không tạm dừng */const rs=dG>0?Math.min(.5,(now-(lastN||now))/1000):0;lastN=now;const dU=rs/10;
 if(dU>0)for(const f of FIRES.slice()){if(f.lit){f.fuel-=dU;const near=Math.hypot(pos.x-f.x,pos.y-f.y)<12;if(f.fuel<=0){f.fuel=0;f.lit=false;if(near)say('🔥 Bếp lửa đã tắt – hết củi')}
   if(f.lit&&f.coal&&f.coal.left>0){f.coal.left-=dU;if(f.coal.left<=0){f.coal.left=0;if(near)say('⚫ Than củi đã xong – nhấn E vào bếp để nhận');WORLD.emit('ck26.coal.done',{id:f.id})}}
   const p=f.pot;if(p&&p.st==='cook'&&(f.lit||f.fuel>=0)){p.left-=dU;if(p.left<=0){const r=RCI[p.rid];p.left=0;p.st='done';p.por=r?r.por*p.m:0;if(r)DISC.add(r.id);if(near)say('✅ '+(r?r.n:'Món')+' đã chín · '+p.por+' khẩu phần – múc ra bát');WORLD.emit('ck26.cook.done',{id:f.id,r:p.rid,por:p.por})}}}}
 if(seeIng()&&OPEN&&OPEN.kind==='cook'&&UI.tab==='book')renderCook();chkG();const e=envState(),d=dispL(e);TS.e=e;TS.d=d;TS.drain=drainOf(e);
 if(rs>0&&S.on&&!S.dead&&TS.drain>0)S.sta=Math.max(0,S.sta-TS.drain*rs);
 hud();if(OPEN&&OPEN.f&&Math.hypot(pos.x-OPEN.f.x,pos.y-OPEN.f.y)>3.2)closeAll();if(OPEN)liveUpd();if(PL)tickPlace()}catch(e){if(!CK.err){CK.err=String(e&&e.stack||e);console.warn('[CK26]',e)}}},200);

/* ---------- HUD thân nhiệt ---------- */
const css=document.createElement('style');css.textContent=`
#ckT{cursor:pointer;pointer-events:auto}
#ckTb{display:flex;gap:1px;width:110px;height:9px}#ckTb s{flex:1;border-radius:2px;background:rgba(255,255,255,.14);text-decoration:none}#ckTb s.g{margin-right:2px}
#ckTl{font-style:normal;font-size:11px;font-weight:700;white-space:nowrap;text-shadow:0 1px 2px #000}
.ckw{font-family:system-ui;color:#f4ead0}
.ckpan{width:min(780px,96vw);max-height:94vh;overflow:auto;background:linear-gradient(#2b2219,#1b150f);border:2px solid #b8924a;border-radius:12px;box-shadow:inset 0 0 0 2px #3a2c1a,0 10px 40px #000b;padding:10px 12px}
.ckhd{display:flex;align-items:center;gap:8px;font-size:19px;font-weight:800;margin-bottom:8px}.ckhd .x{margin-left:auto;width:34px;height:34px;border-radius:8px;border:2px solid #6a5434;background:#2a2118;color:#e8d8b0;font:bold 18px system-ui;cursor:pointer}
.cktabs{display:flex;gap:8px;margin-bottom:10px}.cktabs button{flex:1;padding:9px;border-radius:9px;border:2px solid #4a3a26;background:#211a12;color:#d8c8a0;font:bold 15px system-ui;cursor:pointer}.cktabs button.on{border-color:#e8b84a;background:#4a3518;color:#ffe6a8}
.ckbox{background:rgba(0,0,0,.28);border:1px solid #4a3a26;border-radius:10px;padding:8px}
.ckcols{display:grid;grid-template-columns:1fr 168px 1fr;gap:10px;align-items:start}
.ckt{font-size:12px;color:#d8c08a;margin:0 0 6px;font-weight:700}
.ckgrid{display:grid;grid-template-columns:repeat(3,58px);gap:6px;justify-content:center}
.ckslot{width:58px;height:58px;border:2px solid #4a3a26;background:#15110c;border-radius:9px;position:relative;display:flex;align-items:center;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none;cursor:pointer}
.ckslot em{position:absolute;right:4px;bottom:1px;font-style:normal;font-weight:800;font-size:13px;text-shadow:0 1px 2px #000}
.ckslot.dis{opacity:.32;cursor:default}.ckslot.emp{cursor:default;color:#5a4a36;font-size:22px}
.ckslot .rm{position:absolute;right:-7px;top:-7px;width:20px;height:20px;border-radius:50%;background:#2a2118;border:1px solid #b8a070;color:#fff;font:bold 11px/18px system-ui;text-align:center}
#ckDrop.hov{outline:2px dashed #ffd27a;outline-offset:3px}
.ckbtn{padding:9px 14px;border-radius:9px;border:2px solid #6a5434;background:#2e2418;color:#f4ead0;font:bold 14px system-ui;cursor:pointer}.ckbtn:disabled{opacity:.4;cursor:default}
.ckgo{background:linear-gradient(#e0ae48,#a8761f);border-color:#f6d68a;color:#2a1806;font-size:17px;padding:10px 28px}
.ckpred{display:flex;align-items:center;gap:10px;min-height:60px}
.ckbar{height:12px;border-radius:6px;background:#15110c;border:1px solid #4a3a26;overflow:hidden}.ckbar i{display:block;height:100%;background:linear-gradient(90deg,#f6a23a,#ffd27a)}
.ckrow{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:8px}
.cklist button{display:flex;align-items:center;gap:8px;width:100%;margin:0 0 6px;padding:6px 8px;border-radius:9px;border:2px solid #3a2e20;background:#1d1711;color:#f4ead0;font:bold 14px system-ui;cursor:pointer;text-align:left}.cklist button.on{border-color:#e8b84a;background:#3a2a14}
.ckneed div{display:flex;align-items:center;gap:8px;padding:3px 0;border-bottom:1px solid #2e2418;font-size:14px}.ckneed b{margin-left:auto}
.ckmenu{position:fixed;z-index:58;right:16px;top:50%;transform:translateY(-50%);min-width:210px;background:linear-gradient(#2b2219,#1b150f);border:2px solid #b8924a;border-radius:12px;padding:8px}
.ckmenu button{display:flex;align-items:center;gap:8px;width:100%;margin:4px 0;padding:9px 10px;border-radius:8px;border:2px solid #3a2e20;background:#1d1711;color:#f4ead0;font:bold 14px system-ui;cursor:pointer;text-align:left}.ckmenu button:disabled{opacity:.38;cursor:default}.ckmenu button.hi{border-color:#e8b84a;background:#3a2a14}
.ckbig{display:flex;align-items:center;gap:6px;background:#0d0a07;border:2px solid #b8924a;border-radius:10px;padding:8px}.ckbig .th{font-size:26px}.ckbig .ckcl{display:flex;gap:3px;flex:1 1 auto;min-width:200px}.ckbig .ckcl i{display:block;flex:1 1 0;min-width:6px;height:22px;border-radius:4px}.ckbig .ckcl i.g{margin-right:8px}
.cklg{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}.cklg div{border:2px solid #333;border-radius:9px;padding:6px;text-align:center;font-weight:800;font-size:13px;background:#120e0a}.cklg p{display:flex;gap:3px;margin:6px 0 0}.cklg i{flex:1;height:12px;border-radius:3px;background:rgba(255,255,255,.1)}
@media (max-width:640px){.ckcols{grid-template-columns:1fr 1fr}.ckcols .potc{grid-column:1/3;order:-1}.ckgrid{grid-template-columns:repeat(3,52px)}.ckslot{width:52px;height:52px}.ckmenu{right:8px;left:auto}}
`;document.head.appendChild(css);
let hudOk=false;const hudC=[];
function mkHud(){if(hudOk)return;const b4=$('b4');if(!b4)return;const row=b4.closest('.r');if(!row)return;const d=document.createElement('div');d.className='r';d.id='ckT';d.title='Thân nhiệt – chạm để xem chi tiết';
 d.innerHTML='<span style="font-size:9px;line-height:9px">Thân<br>nhiệt</span><i id="ckTb"></i><em id="ckTl"></em>';row.parentNode.insertBefore(d,row.nextSibling);const bar=d.querySelector('#ckTb');
 for(let i=0;i<16;i++){const s=document.createElement('s');if(i%4===3&&i<15)s.className='g';bar.appendChild(s);hudC.push(s)}d.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();openTemp()});hudOk=true}
let hudKey='';
function hud(){mkHud();if(!hudOk||!TS.e)return;const L=TS.d,c=TS.e.c,idx=L*4+c-1,key=idx+'|'+G.g+'|'+(TS.drain>0);if(key===hudKey)return;hudKey=key;
 hudC.forEach((s,i)=>{const gL=(i/4)|0;s.style.background=i<=idx?LVC[gL]:'rgba(255,255,255,.14)';s.style.boxShadow=i===idx?'0 0 4px '+LVC[gL]:''});
 const l=$('ckTl');l.style.color=LVC[L];l.textContent=LVI[L]+' '+LVN[L]+(G.g?' 🍵':'')+(TS.drain>0?' ↓':'');if(TEMP_OPEN)renderTemp()}
let TEMP_OPEN=false,tempEl=null;
function openTemp(){TEMP_OPEN=true;if(!tempEl){tempEl=document.createElement('div');tempEl.className='ckw';tempEl.style.cssText='position:fixed;inset:0;z-index:57;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45)';tempEl.addEventListener('pointerdown',e=>{if(e.target===tempEl||e.target.closest('[data-cl]')){TEMP_OPEN=false;tempEl.style.display='none'}});document.body.appendChild(tempEl)}tempEl.style.display='flex';renderTemp()}
function renderTemp(){if(!tempEl||!TS.e)return;const e=TS.e,L=TS.d,idx=L*4+e.c-1;let cl='';for(let i=0;i<16;i++){const gL=(i/4)|0;cl+='<i class="'+(i%4===3&&i<15?'g':'')+'" style="background:'+(i<=idx?LVC[gL]:'rgba(255,255,255,.08)')+(i===idx?';box-shadow:0 0 8px '+LVC[gL]:'')+'"></i>'}
 const lg=LVN.map((n,k)=>{let p='';for(let i=0;i<4;i++)p+='<i style="background:'+(k<L||(k===L&&i<e.c)?LVC[k]:'rgba(255,255,255,.1)')+'"></i>';return'<div style="border-color:'+(k===L?LVC[k]:'#333')+';color:'+LVC[k]+'">'+LVI[k]+' '+n+'<p>'+p+'</p></div>'}).join('');
 const rem=G.g?Math.max(0,G.until-GT()):0;
 tempEl.innerHTML='<div class="ckpan" style="width:min(560px,94vw)"><div class="ckhd">🌡 Thân nhiệt<button class="x" data-cl>✕</button></div><div class="ckbig"><span class="th">🌡️</span><div class="ckcl">'+cl+'</div></div><div class="cklg">'+lg+'</div>'+
 '<div class="ckbox" style="margin-top:10px;font-size:14px;line-height:1.7">🌤 Nhiệt độ môi trường: <b>'+Math.round(e.amb)+'°C</b>'+(e.heat>0?' · 🔥 bếp lửa sưởi <b>+'+e.heat.toFixed(1)+'°C</b>':'')+
 '<br>🍵 Nước gừng: '+(G.g?'<b>+'+G.g+' bậc</b> · còn <b>'+Math.floor(Math.round(rem*60)/60)+' giờ '+(Math.round(rem*60)%60)+' phút</b> (giờ trong game)':'không có')+
 '<br>⚡ Hao thể lực do lạnh: <b>'+(TS.drain>0?TS.drain.toFixed(1)+'/giây':'không')+'</b>'+(e.cold&&e.fire?' (đã giảm nhờ bếp lửa)':'')+
 '<br><small style="color:#bba">Mỗi mức có 4 vạch, mỗi vạch = 25% của mức. Nước gừng tăng 1 bậc (tối đa Ấm), giữ 8 giờ trong game; không đẩy lên Nóng.</small></div></div>'}

/* ---------- chế độ đặt / dời bếp (bóng xem trước xanh/đỏ) ---------- */
let PL=null;const pbar=document.createElement('div');pbar.className='ckw';pbar.style.cssText='position:fixed;left:50%;bottom:118px;transform:translateX(-50%);z-index:70;display:none;padding:8px 10px;border-radius:12px;background:rgba(24,20,14,.92);border:2px solid #b8924a;text-align:center;font:13px system-ui';document.body.appendChild(pbar);
pbar.addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(!b)return;e.preventDefault();e.stopPropagation();const a=b.dataset.a;if(a==='ok')confirmPlace();else if(a==='r'){if(PL){PL.r=((PL.r||0)+1)%4;tickPlace()}}else stopPlace()});
function startPlace(f){if(IH())return say('🔥 Chỉ đặt bếp lửa trong nhà an toàn của bạn hoặc ngoài trời');if(!f&&!(S.ck_fire>0))return;closeAll();PL={f,x:pos.x,y:pos.y,why:'',r:f?(f.r||0):0,key:''};pbar.style.display='block';tickPlace()}
function stopPlace(){PL=null;pbar.style.display='none'}
function tickPlace(){if(!PL)return;if(PL.f&&!FIRES.includes(PL.f))return stopPlace();const l=Math.hypot(X.fvx,X.fvy)||1,sn=v=>Math.round(v*4)/4;PL.x=sn(pos.x+X.fvx/l*1.5);PL.y=sn(pos.y+X.fvy/l*1.5);PL.why=canPlace(PL.x,PL.y,PL.f);
 const key=PL.why+'|'+(PL.f?1:0);if(key===PL.key)return;PL.key=key;const ok=!PL.why;
 pbar.innerHTML=imgH('ck_fire',22)+' <b>'+(PL.f?'Dời bếp lửa':'Đặt bếp lửa')+'</b> · '+(ok?'<span style="color:#7dff9a">đặt được</span>':'<span style="color:#ff9080">'+PL.why+'</span>')+
  '<br><button data-a="ok" style="margin:6px 4px 0;padding:9px 14px;border-radius:9px;border:0;background:'+(ok?'#2e8b47':'#555')+';color:#fff;font:bold 14px system-ui">🖱 Đặt (Enter)</button><button data-a="r" style="margin:6px 4px 0;padding:9px 14px;border-radius:9px;border:0;background:#5a4a2a;color:#fff;font:bold 14px system-ui">↻ Xoay (R)</button><button data-a="no" style="margin:6px 4px 0;padding:9px 14px;border-radius:9px;border:0;background:#8b2e2e;color:#fff;font:bold 14px system-ui">✖ Hủy (Esc)</button>'}
function confirmPlace(){if(!PL)return;PL.key='';tickPlace();if(PL.why)return say('⛔ '+PL.why);
 if(PL.f){moveFire(PL.f,PL.x,PL.y);PL.f.r=PL.r;say('🔥 Đã dời bếp lửa');WORLD.emit('ck26.fire.move',{id:PL.f.id})}
 else{if(!(S.ck_fire>0))return stopPlace();S.ck_fire--;let id;do{id='cf'+(++seq)}while(FIRES.some(q=>q.id===id));addFire({id,x:PL.x,y:PL.y,r:PL.r,lit:false,fuel:0,pot:null});say('🔥 Đã đặt bếp lửa – nhấn E để nhóm lửa');WORLD.emit('ck26.fire.place',{id})}stopPlace()}
addEventListener('keydown',e=>{const k=(e.key||'').toLowerCase();const tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA')return;
 if(PL){if(k==='enter'){e.preventDefault();e.stopPropagation();confirmPlace()}else if(k==='escape'){e.preventDefault();e.stopPropagation();stopPlace()}else if(k==='r'&&!e.repeat){e.preventDefault();e.stopPropagation();PL.r=((PL.r||0)+1)%4;PL.key='';tickPlace()}return}
 if(k==='escape'&&(OPEN||TEMP_OPEN)){e.preventDefault();e.stopPropagation();closeAll();if(TEMP_OPEN){TEMP_OPEN=false;tempEl.style.display='none'}}},true);

/* ---------- tương tác E (2D & 2.5D) ---------- */
{const a0=F5.acts;F5.acts=c=>{a0&&a0(c);if(IH()||PL)return;for(const f of FIRES){const d=Math.hypot(pos.x-f.x,pos.y-f.y);if(d>=1.9)continue;const p=f.pot;
  const lab=p?'🍲<br>Nồi nấu ăn<br>'+(p.st==='cook'?'đang nấu '+fmtS(p.left):p.st==='done'?p.por+' khẩu phần':(f.lit?'lửa đang cháy':'lửa tắt')):'🔥<br>Bếp lửa<br>'+(f.coal&&f.coal.left<=0?'than củi xong':f.lit?'đang cháy '+fmtS(f.fuel):'chưa nhóm lửa');
  c(d-.02,1.9,lab,()=>p&&f.pot?openCook(f):openMenu(f),f)}}}

/* ---------- bảng chọn bếp lửa (khi chưa có nồi) ---------- */
let OPEN=null;const menuEl=document.createElement('div');menuEl.className='ckmenu ckw';menuEl.style.display='none';document.body.appendChild(menuEl);
const panEl=document.createElement('div');panEl.className='ckw';panEl.style.cssText='position:fixed;inset:0;z-index:58;display:none;align-items:center;justify-content:center;background:rgba(6,4,2,.5)';document.body.appendChild(panEl);
function closeAll(){OPEN=null;menuEl.style.display='none';panEl.style.display='none';stopAnim()}
function openMenu(f){if(!FIRES.includes(f))return;closeAll();OPEN={f,kind:'menu'};menuEl.style.display='block';renderMenu()}
function renderMenu(){const f=OPEN&&OPEN.f;if(!f)return;const b=(a,ic,t,on,hi)=>'<button data-a="'+a+'"'+(on?'':' disabled')+(hi?' class="hi"':'')+'>'+ic+' '+t+'</button>';
 menuEl.innerHTML='<div style="font:bold 15px system-ui;color:#ffe6a8;margin:2px 4px 6px">[E] Bếp lửa '+(f.lit?'<span style="color:#ffb35a">🔥 '+fmtS(f.fuel)+'</span>':'<span style="color:#aaa">· tắt</span>')+'</div>'+
  (f.lit?b('douse','💨','Tắt lửa',1):b('lit','🔥','Nhóm lửa'+(f.fuel>0?'':' (1 củi)'),f.fuel>0||S.wood>0,1))+b('wood','🪵','Thêm củi ('+(S.wood|0)+')',S.wood>0&&f.fuel<=FUEL_MAX-FUEL_H)+
  b('pot',imgH('ck_pot',20),'Đặt nồi ('+(S.ck_pot|0)+')',S.ck_pot>0)+b('boil','💧','Đun nước ('+(S.botD|0)+' chai)',f.lit&&S.botD>0)+
  (f.coal?(f.coal.left>0?'<div style="font-size:13px;margin:4px 2px">⚫ Đang đốt than · còn <b id="ckCoalT">'+fmtS(f.coal.left)+'</b>'+(f.lit?'':' <span style="color:#ff9a7a">(lửa tắt)</span>')+'<div class="ckbar" style="margin-top:4px"><i id="ckCoalB" style="width:'+Math.round((1-f.coal.left/f.coal.tot)*100)+'%"></i></div></div>':b('coaltake','⚫','Nhận '+f.coal.n+' than củi',1,1)):b('coal','⚫','Đốt than (3 gỗ → 2 than)',f.lit&&S.wood>=3))+b('move','✥','Di chuyển',!f.lit)+b('take','⬆','Thu hồi',!f.lit&&!f.coal)+b('close','✖','Đóng',1)}
menuEl.addEventListener('pointerdown',e=>{const bt=e.target.closest('button');if(!bt||bt.disabled)return;e.preventDefault();e.stopPropagation();const f=OPEN&&OPEN.f;if(!f)return closeAll();const a=bt.dataset.a;
 if(a==='close')return closeAll();if(a==='lit')ignite(f);else if(a==='douse')douse(f);else if(a==='wood')addWood(f);else if(a==='boil'){if(F5.boil)F5.boil()}
 else if(a==='coal')coalStart(f);else if(a==='coaltake')coalTake(f);else if(a==='move'){closeAll();return startPlace(f)}else if(a==='take'){recover(f);if(!FIRES.includes(f))return closeAll()}
 else if(a==='pot'){putPot(f);if(f.pot)return openCook(f)}renderMenu()});

/* ---------- giao diện nấu ăn ---------- */
const UI={tab:'free',sel:'d1',m:1};
function openCook(f){if(!FIRES.includes(f)||!f.pot)return openMenu(f);closeAll();OPEN={f,kind:'cook'};UI.tab='free';panEl.style.display='flex';renderCook();startAnim()}
const potSt=p=>!p?'none':p.st==='cook'?'cook':p.st==='done'?'done':ingN(p)>0?'ing':'empty';
function predHtml(p){if(p.st==='cook'){const r=RCI[p.rid];return'<div class="ckpred">'+imgH('ck_'+p.rid,52)+'<div style="flex:1"><b style="font-size:16px">Đang nấu: '+r.n+'</b> ×'+p.m+'<div class="ckbar" style="margin:6px 0"><i id="ckProg" style="width:'+Math.round((1-p.left/p.tot)*100)+'%"></i></div><small id="ckLeft">còn '+fmtS(p.left)+'</small>'+(OPEN.f.lit?'':' <small style="color:#ff9a7a">· lửa tắt – tạm dừng</small>')+'</div></div>'}
 if(p.st==='done'){const r=RCI[p.rid];return'<div class="ckpred">'+imgH('ck_'+p.rid,52)+'<div style="flex:1"><b style="font-size:16px">✅ '+r.n+' đã chín</b><br><small>Nồi còn <b>'+p.por+'</b> khẩu phần · bạn có <b>'+(S.ck_bowl|0)+'</b> bát rỗng · '+fxTxt(r.fx)+'</small></div></div>'}
 const mt=match(p.ing);if(!ingN(p))return'<div class="ckpred"><span style="font-size:34px">🍲</span><small>Kéo hoặc chạm nguyên liệu bên trái để bỏ vào nồi. Game tự nhận diện món.</small></div>';
 if(mt){const r=mt.r,isNew=!DISC.has(r.id);return'<div class="ckpred">'+imgH('ck_'+r.id,52)+'<div style="flex:1"><b style="font-size:16px">'+r.n+'</b>'+(mt.m>1?' ×'+mt.m:'')+(isNew?' <span style="color:#7dff9a;font-size:12px">✨ Món mới</span>':'')+'<br><small>'+fxTxt(r.fx)+(r.ginger?' · 🔥 +1 bậc thân nhiệt':'')+' · ⏳ '+fmtS(cookH(r,mt.m))+' · 🥣 '+r.por*mt.m+' khẩu phần'+(mt.big?' <span style="color:#ff9a7a">(vượt sức chứa '+POR_MAX+')</span>':'')+'</small></div></div>'}
 const c=closest(p.ing);return'<div class="ckpred"><span style="font-size:34px">❓</span><small>Chưa thành món.'+(c?(known(c.r)?' Gần giống <b>'+c.r.n+'</b> – thiếu '+c.miss.join(', ')+'.':' Có vẻ sắp thành một món – thử thêm nguyên liệu.'):' Thử kết hợp khác.')+'</small></div>'}
function fireRow(f,p){const b=(a,t,on)=>'<button class="ckbtn" data-a="'+a+'"'+(on?'':' disabled')+'>'+t+'</button>';
 return'<div class="ckrow">'+(f.lit?b('douse','💨 Tắt lửa',1):b('lit','🔥 Nhóm lửa',f.fuel>0||S.wood>0))+b('wood','🪵 Thêm củi ('+(S.wood|0)+')',S.wood>0&&f.fuel<=FUEL_MAX-FUEL_H)+b('boil','💧 Đun nước ('+(S.botD|0)+')',f.lit&&S.botD>0)+
  (f.coal?(f.coal.left>0?b('coalx','⚫ Than '+fmtS(f.coal.left),0):b('coaltake','⚫ Nhận '+f.coal.n+' than',1)):b('coal','⚫ Đốt than (3 gỗ)',f.lit&&S.wood>=3))+b('serve','🥣 Lấy thành phẩm',p.st==='done'&&p.por>0&&S.ck_bowl>0)+b('unpot','⬆ Tháo nồi',p.st!=='cook'&&!p.por&&!ingN(p))+'</div>'}
function renderCook(){const f=OPEN&&OPEN.f;if(!f||!f.pot)return closeAll();const p=f.pot,lock=p.st!=='idle'||p.por>0;
 let h='<div class="ckpan"><div class="ckhd">'+imgH('ck_pot',30)+' Nấu ăn <small style="font-size:13px;color:'+(f.lit?'#ffb35a':'#aaa')+'" id="ckFire">'+(f.lit?'🔥 lửa '+fmtS(f.fuel):'lửa tắt')+'</small><button class="x" data-a="close">✕</button></div>'+
  '<div class="cktabs"><button data-tab="free" class="'+(UI.tab==='free'?'on':'')+'">🥄 Nấu tự do</button><button data-tab="book" class="'+(UI.tab==='book'?'on':'')+'">📖 Sổ công thức</button></div>';
 if(UI.tab==='free'){
  const bag=INGK.map(k=>{const n=haveI(k);return'<div class="ckslot'+(n&&!lock?'':' dis')+'" data-ing="'+k+'" title="'+NMI[k]+'">'+imgH(k,38)+'<em>'+n+'</em></div>'}).join('');
  const ks=Object.keys(p.ing);let pot='';for(let i=0;i<6;i++){const k=ks[i];pot+=k?'<div class="ckslot" data-rm="'+k+'" title="Lấy 1 '+NMI[k].toLowerCase()+' ra">'+imgH(k,38)+'<em>'+p.ing[k]+'</em>'+(lock?'':'<span class="rm">✕</span>')+'</div>':'<div class="ckslot emp">+</div>'}
  h+='<div class="ckcols"><div class="ckbox"><p class="ckt">🎒 Nguyên liệu trong túi</p><div class="ckgrid">'+bag+'</div></div>'+
   '<div class="ckbox potc" style="text-align:center"><canvas id="ckCv" width="168" height="150" style="width:100%;max-width:168px"></canvas><small style="color:#bba">'+ingN(p)+'/'+ING_MAX+' nguyên liệu</small></div>'+
   '<div class="ckbox" id="ckDrop"><p class="ckt">🍲 Trong nồi</p><div class="ckgrid">'+pot+'</div></div></div>'+
   '<div class="ckbox" style="margin-top:10px"><p class="ckt">✨ Dự đoán món ăn</p>'+predHtml(p)+'</div>';
  const mt=match(p.ing),can=p.st==='idle'&&!p.por&&mt&&!mt.big&&f.lit;
  h+='<div class="ckrow">'+(p.st==='done'?'<button class="ckbtn ckgo" data-a="serve1"'+(S.ck_bowl>0?'':' disabled')+'>🥣 Múc 1 bát</button><button class="ckbtn" data-a="serveAll"'+(S.ck_bowl>0?'':' disabled')+'>Múc hết ('+Math.min(p.por,S.ck_bowl|0)+' bát)</button>':
   p.st==='cook'?'<button class="ckbtn ckgo" disabled>⏳ Đang nấu…</button>':'<button class="ckbtn ckgo" data-a="cook"'+(can?'':' disabled')+'>Bắt đầu nấu</button>')+'</div>'+
   (p.st==='idle'&&mt&&!f.lit?'<div style="text-align:center;color:#ff9a7a;font-size:13px;margin-top:4px">🔥 Nhóm lửa trước khi nấu</div>':'')}
 else{const r=RCI[UI.sel]||RC[0],kn=known(r);
  const list=RC.map(q=>{const nk=Object.keys(q.ing).length,ns=Object.keys(q.ing).filter(k=>SEEN.has(k)).length;return'<button data-sel="'+q.id+'" class="'+(q.id===r.id?'on':'')+'">'+(known(q)?imgH('ck_'+q.id,34)+' '+q.n:'<span style="font-size:24px;width:34px;text-align:center">❓</span> ??? <small style="margin-left:auto;color:#bba;font-weight:400">'+ns+'/'+nk+'</small>')+'</button>'}).join('');
  let det;if(!kn){const lines=Object.keys(r.ing).map(k=>SEEN.has(k)?'<div>'+imgH(k,26)+NMI[k]+'<b>×'+r.ing[k]+'</b></div>':'<div><span style="font-size:20px;width:26px;text-align:center">❓</span>???<b>?</b></div>').join('');det='<div style="text-align:center;padding:8px 6px"><div style="font-size:40px">❓</div><b>Món chưa khám phá</b><p style="font-size:12px;color:#cbb;margin:4px 0">Nguyên liệu sẽ hiện ra khi bạn có được chúng lần đầu. Biết đủ nguyên liệu thì món được mở khóa.</p></div><p class="ckt">✚ Nguyên liệu cần</p><div class="ckneed">'+lines+'</div>'}
  else{const mx=Math.max(1,Math.floor(POR_MAX/r.por));UI.m=clamp(UI.m,1,mx);const m=UI.m;let all=true;
   const need=Object.keys(r.ing).map(k=>{const n=r.ing[k]*m,hv=haveI(k),ok=hv>=n;if(!ok)all=false;return'<div>'+imgH(k,26)+NMI[k]+'<b style="color:'+(ok?'#7de29c':'#ff7a7a')+'">'+Math.min(hv,n)+'/'+n+' '+(ok?'✔':'✘')+'</b></div>'}).join('');
   const can=all&&p.st==='idle'&&!p.por&&!ingN(p)&&f.lit;
   det='<div style="display:flex;gap:10px;align-items:center">'+imgH('ck_'+r.id,64)+'<div><b style="font-size:18px">'+r.n+'</b><br><small>'+fxTxt(r.fx)+(r.ginger?' · 🔥 +1 bậc thân nhiệt (tối đa Ấm, 8 giờ)':'')+'<br>⏳ '+fmtS(cookH(r,m))+' · 🥣 '+r.por*m+' khẩu phần</small></div></div>'+
    '<p class="ckt" style="margin-top:8px">✚ Nguyên liệu cần</p><div class="ckneed">'+need+'</div>'+
    '<div class="ckrow"><button class="ckbtn" data-a="m-">−</button><b style="font-size:18px;min-width:30px;text-align:center;align-self:center">'+m+'</b><button class="ckbtn" data-a="m+"'+(m<mx?'':' disabled')+'>+</button></div>'+
    '<div class="ckrow"><button class="ckbtn ckgo" data-a="bookcook"'+(can?'':' disabled')+'>Bắt đầu nấu</button></div>'+
    (can?'':'<div style="text-align:center;font-size:12px;color:#ff9a7a">'+(!f.lit?'🔥 Nhóm lửa trước':p.st!=='idle'||p.por?'🍲 Nồi đang bận':ingN(p)?'Lấy nguyên liệu đang có trong nồi ra trước':'Thiếu nguyên liệu')+'</div>')}
  h+='<div class="ckcols" style="grid-template-columns:200px 1fr"><div class="cklist">'+list+'</div><div class="ckbox">'+det+'</div></div>'}
 h+=fireRow(f,p)+'</div>';panEl.innerHTML=h;ANIM.cv=$('ckCv')}
let liveKey='';function liveUpd(){const f=OPEN&&OPEN.f;if(!f)return;if(OPEN.kind==='menu'){const ce=$('ckCoalT');if(ce&&f.coal){ce.textContent=fmtS(f.coal.left);const cb=$('ckCoalB');if(cb)cb.style.width=Math.round((1-f.coal.left/f.coal.tot)*100)+'%'}const k=f.lit+'|'+Math.round(f.fuel*10)+'|'+S.wood+'|'+S.botD+'|'+(f.coal?(f.coal.left>0?1:2):0);if(k!==liveKey){liveKey=k;renderMenu()}return}
 const p=f.pot;if(!p)return closeAll();const k=p.st+'|'+p.por+'|'+f.lit+'|'+S.wood+'|'+S.ck_bowl+'|'+S.botD+'|'+ingN(p)+'|'+(f.coal?(f.coal.left>0?Math.ceil(f.coal.left*10):'d'):0);if(k!==liveKey){liveKey=k;if(!DR)renderCook();return}
 const pr=$('ckProg');if(pr&&p.tot)pr.style.width=Math.round((1-p.left/p.tot)*100)+'%';const lf=$('ckLeft');if(lf)lf.textContent='còn '+fmtS(p.left);const fe=$('ckFire');if(fe)fe.textContent=f.lit?'🔥 lửa '+fmtS(f.fuel):'lửa tắt'}
/* kéo / thả hoặc chạm */
let DR=null;
panEl.addEventListener('pointerdown',e=>{const f=OPEN&&OPEN.f;if(!f)return;if(e.target===panEl){closeAll();return}
 const ing=e.target.closest('[data-ing]');if(ing){if(ing.classList.contains('dis'))return;e.preventDefault();DR={k:ing.dataset.ing,x0:e.clientX,y0:e.clientY,id:e.pointerId,el:null};return}
 const rm=e.target.closest('[data-rm]');if(rm){e.preventDefault();remIng(f,rm.dataset.rm);renderCook();return}
 const tb=e.target.closest('[data-tab]');if(tb){UI.tab=tb.dataset.tab;renderCook();return}
 const sl=e.target.closest('[data-sel]');if(sl){UI.sel=sl.dataset.sel;UI.m=1;renderCook();return}
 const bt=e.target.closest('button[data-a]');if(!bt||bt.disabled)return;e.preventDefault();const a=bt.dataset.a,p=f.pot;
 if(a==='close')return closeAll();if(a==='cook')startCook(f);else if(a==='serve1'||a==='serve')serve(f,false);else if(a==='serveAll')serve(f,true);
 else if(a==='lit')ignite(f);else if(a==='douse')douse(f);else if(a==='wood')addWood(f);else if(a==='boil'){if(F5.boil)F5.boil()}else if(a==='coal')coalStart(f);else if(a==='coaltake')coalTake(f);
 else if(a==='unpot'){takePot(f);if(!f.pot)return openMenu(f)}else if(a==='m-')UI.m=Math.max(1,UI.m-1);else if(a==='m+')UI.m++;else if(a==='bookcook'){recipeCook(f,RCI[UI.sel],UI.m);UI.tab='free'}
 liveKey='';renderCook()});
addEventListener('pointermove',e=>{if(!DR||e.pointerId!==DR.id)return;if(!DR.el&&Math.hypot(e.clientX-DR.x0,e.clientY-DR.y0)>8){DR.el=document.createElement('div');DR.el.style.cssText='position:fixed;z-index:90;pointer-events:none;transform:translate(-50%,-50%)';DR.el.innerHTML=imgH(DR.k,44);document.body.appendChild(DR.el)}
 if(DR.el){DR.el.style.left=e.clientX+'px';DR.el.style.top=e.clientY+'px';const t=document.elementFromPoint(e.clientX,e.clientY),d=$('ckDrop');if(d)d.classList.toggle('hov',!!(t&&(t.closest('#ckDrop')||t.closest('#ckCv'))))}});
const endDrag=e=>{if(!DR||(e&&e.pointerId!==DR.id))return;const d=DR;DR=null;const f=OPEN&&OPEN.f;if(d.el){d.el.remove();const t=e&&document.elementFromPoint(e.clientX,e.clientY);if(f&&t&&(t.closest('#ckDrop')||t.closest('#ckCv')))addIng(f,d.k)}else if(f&&e&&e.type==='pointerup')addIng(f,d.k);liveKey='';if(OPEN&&OPEN.kind==='cook')renderCook()};
addEventListener('pointerup',endDrag);addEventListener('pointercancel',endDrag);

/* ---------- vẽ bếp lửa (dùng chung 2D & 2.5D) ---------- */
function drawFire(g,x,y,s,t,f,ghost){const lit=f&&f.lit,rot=((f&&f.r)||0)*Math.PI/4;g.save();
 if(lit&&!ghost){const gr=g.createRadialGradient(x,y-s*.3,s*.1,x,y-s*.3,s*1.9);gr.addColorStop(0,'rgba(255,170,60,.38)');gr.addColorStop(1,'rgba(255,120,30,0)');g.fillStyle=gr;g.beginPath();g.ellipse(x,y-s*.2,s*1.9,s*1.2,0,0,7);g.fill()}
 g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x,y,s*.62,s*.26,0,0,7);g.fill();
 g.fillStyle=lit?'#2a1a10':'#3a3530';g.beginPath();g.ellipse(x,y-s*.04,s*.42,s*.17,0,0,7);g.fill();
 // củi
 for(let i=0;i<3;i++){const a=rot+i*Math.PI/3,dx=Math.cos(a)*s*.42,dy=Math.sin(a)*s*.16;g.strokeStyle='#3a220e';g.lineWidth=s*.16;g.lineCap='round';g.beginPath();g.moveTo(x-dx,y-s*.08-dy);g.lineTo(x+dx,y-s*.08+dy);g.stroke();g.strokeStyle=lit?'#7a4420':'#8a5a2b';g.lineWidth=s*.1;g.beginPath();g.moveTo(x-dx,y-s*.09-dy);g.lineTo(x+dx,y-s*.09+dy);g.stroke()}
 // đá vòng
 for(let i=0;i<10;i++){const a=i/10*Math.PI*2,sx=x+Math.cos(a)*s*.52,sy=y-s*.05+Math.sin(a)*s*.22;g.fillStyle=i%3?'#8e8e8e':'#a8a8a0';g.strokeStyle='#3a3a3a';g.lineWidth=Math.max(1,s*.025);g.beginPath();g.ellipse(sx,sy,s*.13,s*.09,0,0,7);g.fill();g.stroke()}
 if(lit){const T=t/1000;for(let k=0;k<3;k++){const hh=s*(.75-k*.17)*(1+.12*Math.sin(T*9+k*2)),ww=s*(.3-k*.07),ox=Math.sin(T*6+k)*s*.04;g.fillStyle=['#e24a1a','#ff8a1e','#ffd84a'][k];g.beginPath();g.moveTo(x-ww+ox,y-s*.1);g.quadraticCurveTo(x-ww*.8+ox,y-s*.1-hh*.6,x+ox*2,y-s*.1-hh);g.quadraticCurveTo(x+ww*.8+ox,y-s*.1-hh*.6,x+ww+ox,y-s*.1);g.closePath();g.fill()}
  for(let k=0;k<4;k++){const ph=(T*1.3+k*.27)%1;g.fillStyle='rgba(255,210,90,'+(1-ph)+')';g.fillRect(x+Math.sin(k*3+T*4)*s*.2,y-s*.3-ph*s*1.1,Math.max(1,s*.04),Math.max(1,s*.04))}}
 if(f&&f.coal){for(const[dx,dy]of[[-.22,.02],[.18,.04],[0,-.04]]){g.fillStyle=f.coal.left>0&&f.lit?'#3a1a10':'#1c1c1c';g.strokeStyle=f.coal.left>0&&f.lit?'#ff7a2a':'#000';g.lineWidth=Math.max(1,s*.03);g.beginPath();g.ellipse(x+dx*s,y-s*.12+dy*s,s*.13,s*.07,0,0,7);g.fill();g.stroke()}}
 const p=f&&f.pot;if(p){const st=potSt(p),im=SP[st==='cook'?'pot_boil':st==='done'?'pot_stew':st==='ing'?'pot_empty':'pot_lid'];
  g.strokeStyle='#3a2414';g.lineWidth=Math.max(1.5,s*.06);g.lineCap='round';const ax=x,ay=y-s*1.55;for(const[dx,dy]of[[-.62,.05],[.62,.05],[.1,-.12]]){g.beginPath();g.moveTo(x+dx*s,y+dy*s);g.lineTo(ax,ay);g.stroke()}
  g.strokeStyle='#555';g.lineWidth=Math.max(1,s*.025);g.beginPath();g.moveTo(ax,ay);g.lineTo(ax,y-s*1.02);g.stroke();
  if(okI(im)){const w=s*.95,h=w*im.naturalHeight/im.naturalWidth;g.drawImage(im,x-w/2,y-s*.3-h,w,h)}
  if(st==='cook'||st==='done'){const T=t/1000;for(let k=0;k<3;k++){const ph=(T*.5+k/3)%1;g.fillStyle='rgba(235,235,235,'+(.45*(1-ph))+')';g.beginPath();g.arc(x+Math.sin(T*2+k*2)*s*.18,y-s*1.05-ph*s*.9,s*(.09+ph*.12),0,7);g.fill()}}}
 if(ghost){g.globalAlpha=1}g.restore()}
F5.ck26Draw=drawFire;
{const o=F5.draw2;F5.draw2=(L,Xf,Yf,cx,cy,vw,vh,t,g,Z)=>{o&&o(L,Xf,Yf,cx,cy,vw,vh,t,g,Z);if(IH())return;
 for(const f of FIRES)if(Math.abs(f.x-cx)<vw+3&&Math.abs(f.y-cy)<vh+4)L.push([f.y,()=>drawFire(g,Xf(f.x),Yf(f.y),Z*1.05,t,f)]);
 if(PL){const P=PL,ok=!P.why;L.push([1e9,()=>{g.save();g.globalAlpha=.5;g.fillStyle=ok?'#35d06a':'#ff4040';g.beginPath();g.ellipse(Xf(P.x),Yf(P.y),Z*.75,Z*.42,0,0,7);g.fill();g.globalAlpha=1;g.strokeStyle=ok?'#0a7a30':'#a00000';g.lineWidth=2;g.stroke();g.globalAlpha=.6;drawFire(g,Xf(P.x),Yf(P.y),Z*1.05,t,{r:P.r,lit:false,pot:null},true);g.restore()}])}}}

/* ---------- 2.5D: thẻ đứng có hoạt ảnh (4 khung) + bóng xem trước ---------- */
const M3=new Map(),TEX=new Map();let geo=null,ghost3=null;
function tex3(f,fr){const V=SH.V25,T=V.T15.T,st=f.pot?potSt(f.pot):'none',key=(f.lit?'L'+fr:'o')+'|'+st+'|'+((f.r||0)%4)+(f.pot&&!okI(SP.pot_lid)?'n':'');let tx=TEX.get(key);
 if(!tx){const c=document.createElement('canvas');c.width=128;c.height=192;const g=c.getContext('2d');drawFire(g,64,180,72,fr*190,{lit:f.lit,r:f.r,pot:f.pot?{st:f.pot.st,ing:f.pot.ing,por:f.pot.por}:null},true);tx=new T.CanvasTexture(c);TEX.set(key,tx)}return tx}
function upd3(){const V=SH.V25;if(!V||!V.on||!V.T15){for(const m of M3.values())m.visible=false;if(ghost3)ghost3.visible=false;return}const T=V.T15.T,scene=V.T15.scene,ih=IH(),fr=((performance.now()/170)|0)%4;
 if(!geo){geo=new T.PlaneGeometry(1,1);geo.translate(0,.5,0)}const seen=new Set();
 for(const f of FIRES){const near=!ih&&Math.abs(f.x-pos.x)<60&&Math.abs(f.y-pos.y)<50;let m=M3.get(f);if(!near){if(m)m.visible=false;continue}seen.add(f);
  if(!m){m=new T.Mesh(geo,V.T15.cardMat(tex3(f,fr),true));scene.add(m);M3.set(f,m)}m.material=V.T15.cardMat(tex3(f,fr),true);m.scale.set(1.6,2.4*V.T15.CARD,1);m.position.set(f.x,0,f.y+.06);m.visible=true}
 for(const[f,m]of M3)if(!FIRES.includes(f)){scene.remove(m);M3.delete(f)}
 if(PL&&!ih){if(!ghost3){const g=new T.CircleGeometry(.7,24);g.rotateX(-Math.PI/2);ghost3=new T.Mesh(g,new T.MeshBasicMaterial({color:0x35d06a,transparent:true,opacity:.5,depthWrite:false}));scene.add(ghost3)}
  ghost3.material.color.setHex(PL.why?0xff4040:0x35d06a);ghost3.position.set(PL.x,.07,PL.y);ghost3.visible=true}else if(ghost3)ghost3.visible=false}
setInterval(()=>{try{upd3()}catch(e){if(!CK.e3){CK.e3=String(e&&e.stack||e);console.warn('[CK26] 2.5D',e)}}},120);

/* ---------- hoạt ảnh nồi trong giao diện ---------- */
const ANIM={raf:0,cv:null};
function startAnim(){stopAnim();const step=t=>{ANIM.raf=requestAnimationFrame(step);const cv=ANIM.cv;if(!cv||!cv.isConnected||!OPEN||!OPEN.f)return;const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);const f=OPEN.f;
  drawFire(g,84,140,92,t,f);const p=f.pot;if(p&&p.st==='cook'&&f.lit){const T=t/1000;for(let k=0;k<5;k++){const ph=(T*1.6+k/5)%1;g.fillStyle='rgba(255,240,200,'+(.7*(1-ph))+')';g.beginPath();g.arc(84+Math.sin(k*2.1)*22,40-ph*14+20,2+ph*3,0,7);g.fill()}}};ANIM.raf=requestAnimationFrame(step)}
function stopAnim(){if(ANIM.raf)cancelAnimationFrame(ANIM.raf);ANIM.raf=0}

/* ---------- lưu ---------- */
const DISC=new Set(),SEEN=new Set();
const known=r=>DISC.has(r.id)||Object.keys(r.ing).every(k=>SEEN.has(k));
function seeIng(){let ch=false;for(const k of INGK)if(!SEEN.has(k)&&haveI(k)>0){SEEN.add(k);ch=true}return ch}
const potSave=p=>({ing:Object.assign({},p.ing),st:p.st,rid:p.rid,m:p.m,left:+(+p.left).toFixed(3),tot:+(+p.tot).toFixed(3),por:p.por|0});
function potLoad(o){if(!o||typeof o!=='object')return null;const p=newPot();if(o.ing&&typeof o.ing==='object')for(const k of INGK){const n=o.ing[k]|0;if(n>0)p.ing[k]=Math.min(ING_MAX,n)}
 if(o.st==='cook'&&RCI[o.rid]){p.st='cook';p.rid=o.rid;p.m=clamp(o.m|0,1,4);p.tot=Math.max(.01,+o.tot||cookH(RCI[o.rid],p.m));p.left=clamp(+o.left||0,0,p.tot);p.ing={}}
 else if(o.st==='done'&&RCI[o.rid]&&(o.por|0)>0){p.st='done';p.rid=o.rid;p.m=clamp(o.m|0,1,4);p.por=clamp(o.por|0,1,POR_MAX);p.ing={}}return p}
SAVE.register({id:'ck26',scope:'world',version:1,defaults:()=>({seq:0,fires:[]}),validate:d=>d&&Array.isArray(d.fires),
 get:()=>({seq,fires:FIRES.map(f=>[f.id,+f.x.toFixed(2),+f.y.toFixed(2),f.r|0,f.lit?1:0,+(+f.fuel).toFixed(3),f.pot?potSave(f.pot):null,f.coal?{left:+f.coal.left.toFixed(3),tot:f.coal.tot,n:f.coal.n|0}:null])}),
 set:d=>{closeAll();stopPlace();for(const f of FIRES.slice())delFire(f);seq=Math.max(0,d.seq|0);const ids=new Set();
  for(const a of d.fires){if(!Array.isArray(a)||!isFinite(a[1])||!isFinite(a[2]))continue;const id=String(a[0]||'');if(!/^cf\d+$/.test(id)||ids.has(id))continue;ids.add(id);seq=Math.max(seq,+id.slice(2));
   const co=a[7]&&typeof a[7]==='object'&&(a[7].n|0)>0?{left:clamp(+a[7].left||0,0,COAL_U),tot:COAL_U,n:clamp(a[7].n|0,1,COAL_N)}:null;addFire({id,x:+a[1],y:+a[2],r:(a[3]|0)%4,lit:!!a[4],fuel:clamp(+a[5]||0,0,FUEL_MAX),pot:potLoad(a[6]),coal:co})}lastG=null}});
SAVE.register({id:'ck26p',scope:'player',version:1,defaults:()=>({disc:[],seen:[],g:0,rem:0}),validate:d=>d&&Array.isArray(d.disc),
 get:()=>({disc:[...DISC],seen:[...SEEN],g:G.g,rem:G.g?+Math.max(0,G.until-GT()).toFixed(3):0}),
 set:d=>{DISC.clear();for(const id of d.disc)if(RCI[id])DISC.add(id);SEEN.clear();if(Array.isArray(d.seen))for(const k of d.seen)if(INGK.includes(k))SEEN.add(k);seeIng();G.g=clamp(d.g|0,0,2);const rem=clamp(+d.rem||0,0,8);G.until=G.g&&rem>0?GT()+rem:0;if(!G.until)G.g=0;hudKey=''}});

/* ---------- API kiểm thử / gỡ lỗi ---------- */
const CK={coalStart,coalTake,homeRect,otherHouse,FIRES,RC,DISC,SEEN,known,G,TS,UI,ITM,addFire,delFire,canPlace,ignite,addWood,douse,putPot,takePot,recover,addIng,remIng,match,startCook,serve,eatDish,recipeCook,
 openCook,openMenu,closeAll,startPlace,confirmPlace,stopPlace,envState,dispL,gingerDrink,loot,get PL(){return PL},get OPEN(){return OPEN},lv,haveI,FUEL_H,ICON};
globalThis.CK26=SH.CK26=CK;
})();
