/* SAFE HAVEN – Bước 5: vũ khí & hoạt ảnh tay, nước uống (sạch/đã đun/chưa đun), cầm đồ ăn/chai,
   chai & thùng nước, luật bảo vệ 3 ngày, biểu tượng vật phẩm mới. Chạy sau index + v25.js. */
(()=>{const SH=globalThis.SH;if(!SH||!SH.X||!SH.F4){console.warn('[F5] thiếu cầu nối SH.X');return}
const X=SH.X,S=SH.S,pos=SH.pos,CMD=X.CMD,WORLD=X.WORLD,F4=X.F4,STK=X.STK,EQ=X.EQ,say=SH.say,$=id=>document.getElementById(id);
const F5={};const PROT_H=72,prot=()=>SH.GT<PROT_H,lerp=(a,b,k)=>a+(b-a)*k,ease=k=>k<0?0:k>1?1:k*k*(3-2*k);
/* ---------- vật phẩm mới ---------- */
const NEWK={plas:['Nhựa',20],botE:['Chai rỗng',5],botC:['Chai nước sạch',5],botD:['Chai nước chưa đun',5],barrel:['Thùng nước',1]};
for(const k in NEWK){STK[k]=NEWK[k][1];if(typeof S[k]!='number')S[k]=0;F4.names[k]=NEWK[k][0]}
F4.names.wat='Nước đóng chai';globalThis.F5KEYS=['botE','botC','botD','barrel'];
if(typeof S.dbW!='number')S.dbW=0;if(typeof S.dbD!='number')S.dbD=0;if(typeof S.hold!='string')S.hold='';
const INFO={plas:'Nhựa: nguyên liệu chế chai nước và thùng nước.',botE:'Chai rỗng: lấy nước ở hồ/suối hoặc từ thùng nước.',botC:'Nước sạch (đã đun): uống an toàn, hồi 50 khát.',
 botD:'Nước chưa đun: hồi 50 khát nhưng bị nước bẩn 10 giây (tổng -2 máu, -5 thể lực). Đun ở bếp để thành nước sạch.',barrel:'Thùng nước: đặt trong căn cứ (gần nhà gỗ), chứa tối đa 100 đơn vị nước.'};
/* ---------- biểu tượng ---------- */
const ICK=new Set(['bread','wood','stone','iron','cu','part','pmat','rpart','bpCloth','bpArmor','bpWeap','wat','plas','botC','botD','barrel','botE','bpDef','bpH4','bpH5','cardFarm','cardTp']);
const RARE={pmat:1,rpart:1,bpCloth:1,bpArmor:1,bpWeap:1,bpDef:1,bpH4:1,bpH5:2,cardFarm:1,cardTp:1,chG:2,chS:1};
for(const k of ICK){const im=new Image();im.src='icons/'+k+'.png'} // nạp trước
const icon=(k,px)=>ICK.has(k)?'<img src="icons/'+k+'.png" alt="" draggable="false" style="width:'+(px||34)+'px;height:'+(px||34)+'px;vertical-align:middle">':null;
/* ---------- vũ khí ---------- */
const WP={w1:{k:'club'},w2:{k:'dag'},w3:{k:'sword'},w4:{k:'axe'},w5:{k:'spear',reach:2.9,cd:.65},w6:{k:'ham',reach:2.4,cd:.9},w7:{k:'bow',cd:.8}};
const wid=()=>S.eqp&&S.eqp.w&&WP[S.eqp.w]?S.eqp.w:null;
const wKind=()=>{const w=wid();if(w)return WP[w].k;return S.axe?'axeT':null};
function drawWeapon(g,kind,L,pull){g.lineCap='round';g.lineJoin='round';const ol='#2a1a10';
 const shaft=(y0,y1,w,c)=>{g.strokeStyle=ol;g.lineWidth=w+2;g.beginPath();g.moveTo(0,y0);g.lineTo(0,y1);g.stroke();g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(0,y0);g.lineTo(0,y1);g.stroke()};
 const poly=(pts,fill,lw)=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0]*L,p[1]*L):g.moveTo(p[0]*L,p[1]*L));g.closePath();g.fillStyle=fill;g.fill();g.strokeStyle=ol;g.lineWidth=lw||1.4;g.stroke()};
 if(kind==='club'){g.strokeStyle=ol;g.lineWidth=L*.2;g.beginPath();g.moveTo(0,L*.2);g.lineTo(0,-L*.72);g.stroke();g.strokeStyle='#8a5a2b';g.lineWidth=L*.15;g.beginPath();g.moveTo(0,L*.18);g.lineTo(0,-L*.7);g.stroke();g.fillStyle='#a8743c';g.beginPath();g.arc(0,-L*.7,L*.1,0,7);g.fill()}
 else if(kind==='dag'){shaft(L*.2,-L*.02,L*.1,'#4a3020');poly([[-.13,-.02],[.13,-.02],[.13,-.07],[-.13,-.07]],'#c9a24a');poly([[-.055,-.07],[.055,-.07],[0,-.52]],'#dfe5ee')}
 else if(kind==='sword'){shaft(L*.24,-L*.02,L*.1,'#3a2a52');poly([[-.2,-.02],[.2,-.02],[.2,-.09],[-.2,-.09]],'#d8b24a');poly([[-.065,-.09],[.065,-.09],[.05,-.9],[0,-1.0],[-.05,-.9]],'#e8eef6');g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1;g.beginPath();g.moveTo(-L*.02,-L*.12);g.lineTo(-L*.02,-L*.86);g.stroke()}
 else if(kind==='pick'){shaft(L*.08,-L*.9,L*.08,'#7a4a1f');poly([[-.42,-.8],[-.05,-.95],[.05,-.95],[.42,-.8],[.05,-.86],[-.05,-.86]],'#9aa3ae',1.6);g.fillStyle='#5a3a1a';g.fillRect(-L*.06,-L*.98,L*.12,L*.14)}
 else if(kind==='axe'||kind==='axeT'){shaft(L*.08,-L*.9,L*.09,'#7a4a1f');const big=kind==='axe';poly(big?[[0,-.72],[.36,-.88],[.42,-.6],[.36,-.34],[0,-.5]]:[[0,-.74],[.3,-.82],[.27,-.5],[0,-.56]],big?'#b9c2cf':'#c9ced6',1.6);if(big)poly([[0,-.68],[-.16,-.74],[-.16,-.54],[0,-.56]],'#9aa3ae')}
 else if(kind==='spear'){shaft(L*.45,-L*1.12,L*.08,'#8a6a3a');poly([[0,-1.08],[.13,-1.22],[0,-1.52],[-.13,-1.22]],'#e8eef6',1.6);g.strokeStyle='rgba(120,130,145,.9)';g.lineWidth=1;g.beginPath();g.moveTo(0,-L*1.1);g.lineTo(0,-L*1.48);g.stroke();g.fillStyle='#c0392b';g.fillRect(-L*.06,-L*1.12,L*.12,L*.07);g.fillStyle='#5a3a1a';g.fillRect(-L*.05,L*.38,L*.1,L*.08)}
 else if(kind==='ham'){shaft(L*.28,-L*.72,L*.1,'#6a4424');poly([[-.26,-.66],[.26,-.66],[.26,-.92],[-.26,-.92]],'#8b939e',1.8);poly([[-.26,-.66],[-.32,-.7],[-.32,-.88],[-.26,-.92]],'#6d747e')}
 else if(kind==='bow'){const pl=(pull||0)*.38;g.strokeStyle=ol;g.lineWidth=L*.11;g.beginPath();g.moveTo(-L*.02,-L*.78);g.quadraticCurveTo(L*.42,0,-L*.02,L*.78);g.stroke();g.strokeStyle='#8a5a2b';g.lineWidth=L*.08;g.stroke();
  g.strokeStyle='#eee';g.lineWidth=1.2;g.beginPath();g.moveTo(-L*.02,-L*.78);g.lineTo(-L*(.02+pl),0);g.lineTo(-L*.02,L*.78);g.stroke();
  if(pull>0){g.strokeStyle='#5a3a1a';g.lineWidth=L*.045;g.beginPath();g.moveTo(-L*(.02+pl),0);g.lineTo(L*.62,0);g.stroke();g.fillStyle='#dfe5ee';g.beginPath();g.moveTo(L*.62,-L*.06);g.lineTo(L*.78,0);g.lineTo(L*.62,L*.06);g.fill()}}}
// biểu tượng vũ khí (cùng nét vẽ với vũ khí trên tay)
const WIC={};function wIcon(id,px){const w=WP[id];if(!w)return null;if(!WIC[id]){const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,96);gr.addColorStop(0,'#2a4070');gr.addColorStop(1,'#1c2a4e');g.fillStyle=gr;g.beginPath();g.roundRect(2,2,92,92,14);g.fill();
  const rc=['#8aa0c0','#6fd08c','#6aa8ff','#c58cff'][EQ[id].r||0];g.strokeStyle=rc;g.lineWidth=3;g.stroke();
  g.save();g.translate(w.k==='bow'?44:48,w.k==='spear'?70:62);g.rotate(w.k==='bow'?0:.75);drawWeapon(g,w.k,w.k==='spear'?40:w.k==='bow'?46:52,0);g.restore();WIC[id]=c.toDataURL()}
 return'<img src="'+WIC[id]+'" alt="" style="width:'+(px||34)+'px;height:'+(px||34)+'px;vertical-align:middle">'}
/* ---------- điểm bàn tay: dò từ ảnh khung hình nhân vật (theo từng khung, đi theo cử động thật) ---------- */
const HC=new WeakMap();
function handOf(f){const im=f.i;let r=HC.get(im);if(r)return r;const nw=im.naturalWidth,nh=im.naturalHeight;if(!nw)return null;
 const sc=Math.min(1,140/Math.max(nw,nh)),w=Math.max(8,Math.round(nw*sc)),h=Math.max(8,Math.round(nh*sc)),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(im,0,0,w,h);
 let d=null;try{d=g.getImageData(0,0,w,h).data}catch(e){}
 if(!d){r={x:.7,y:.52,s:1};HC.set(im,r);return r}
 const ax=(f.ax!=null?f.ax:f.w/2)/f.w*w,y0=Math.floor(h*.5),y1=Math.floor(h*.8);let best=null;
 for(const s of[1]){let ext=-1,ys=0,n=0;for(let y=y0;y<y1;y++){let x=s>0?w-1:0;for(;s>0?x>=0:x<w;x-=s)if(d[(y*w+x)*4+3]>70)break;if(s>0?x<0:x>=w)continue;const dd=(x-ax)*s;if(dd>ext+1){ext=dd;ys=y;n=1}else if(dd>=ext-1){ys+=y;n++}}
  if(n&&(!best||ext>best.e))best={e:ext,s,x:(ax+s*ext)/w,y:ys/n/h}}
 r=best?{x:best.x-best.s*.035,y:best.y,s:best.s}:{x:.7,y:.52,s:1};HC.set(im,r);return r}
/* ---------- trạng thái hoạt ảnh ---------- */
let act=false,anim='idle',useA=null,slash=0;const ARW=[];
/* ---------- CẤU HÌNH GẮN VŨ KHÍ (dễ chỉnh, thêm vũ khí mới chỉ cần thêm 1 dòng) ----------
 Góc θ tính bằng radian: 0 = chĩa lên, + = nghiêng về phía nhân vật đang nhìn (hướng phải gốc của sprite; sprite tự lật khi quay trái).
 Gốc vẽ vũ khí = ĐIỂM NẮM (grip) ở chuôi/cán; vũ khí xoay quanh điểm này, không xoay quanh tâm ảnh.
 rest: tư thế cầm theo hướng R(trái/phải) D(xuống) U(lên) · atk: [góc giơ, góc bổ] · kind: 'arc' bổ/chém, 'stab' đâm, 'bow' kéo dây
 len: hệ số dài · off: lệch thêm so với bàn tay (×Z) · back: hướng vẽ SAU thân (bị thân che) */
const WCFG={
 axe:  {len:1.0, tip:.9,  rest:{R:2.6,D:2.6,U:.3},  atk:{R:[-1.9,2.4],D:[-.3,2.9],U:[2.7,.1]}, kind:'arc', trail:1, back:{U:1}, off:{R:[0,0],D:[0,0],U:[0,0]}},
 axeT: {len:.9,  tip:.9,  rest:{R:2.6,D:2.6,U:.3},  atk:{R:[-1.9,2.4],D:[-.3,2.9],U:[2.7,.1]}, kind:'arc', trail:1, back:{U:1}, off:{R:[0,0],D:[0,0],U:[0,0]}},
 pick: {len:.95, tip:.95, rest:{R:2.6,D:2.6,U:.3},  atk:{R:[-2.1,2.1],D:[-.4,2.8],U:[2.8,.2]}, kind:'arc', trail:0, back:{U:1}, off:{R:[0,0],D:[0,0],U:[0,0]}},
 sword:{len:1.0, tip:1.0, rest:{R:2.45,D:2.5,U:.3}, atk:{R:[-1.2,2.3],D:[-.2,2.8],U:[2.6,.2]}, kind:'arc', trail:1, back:{U:1}, off:{R:[0,0],D:[0,0],U:[0,0]}},
 dag:  {len:.85, tip:.52, rest:{R:2.0,D:2.3,U:.5},  atk:{R:[1.57,1.57],D:[3.0,3.0],U:[.1,.1]},  kind:'stab', reach:.38, back:{U:1}, off:{R:[-.03,0],D:[0,0],U:[0,0]}},
 club: {len:1.0, tip:.72, rest:{R:2.45,D:2.5,U:.3}, atk:{R:[-1.4,2.3],D:[-.2,2.8],U:[2.6,.2]}, kind:'arc', trail:1, back:{U:1}, off:{R:[0,0],D:[0,0],U:[0,0]}},
 ham:  {len:1.0, tip:.92, rest:{R:2.6,D:2.6,U:.3},  atk:{R:[-2.0,2.4],D:[-.3,2.9],U:[2.8,.1]}, kind:'arc', trail:1, back:{U:1}, off:{R:[0,0],D:[0,0],U:[0,0]}},
 spear:{len:1.0, tip:1.52,rest:{R:1.15,D:2.4,U:.35}, atk:{R:[1.5,1.5],D:[3.0,3.0],U:[.05,.05]}, kind:'stab', reach:.6, aim:1, back:{U:1}, off:{R:[0,0],D:[0,0],U:[0,0]}},
 bow:  {len:1.0, tip:.78, aim:1, rest:{R:0,D:0,U:0},       atk:{R:[0,0],D:[0,0],U:[0,0]},             kind:'bow', back:{U:1}, off:{R:[.05,0],D:[0,0],U:[0,0]}}};
const dirNow=()=>{const vx=X.fvx,vy=X.fvy;return Math.abs(vy)>Math.abs(vx)*1.1?(vy>0?'D':'U'):'R'};
function curKind(){const ct=X.chopT,k=X.chopK;if(!(ct>0)&&(S.hold==='axeT'||S.hand==='t_axe'))return'axeT';if(!(ct>0)&&(S.hold==='pickT'||S.hand==='t_pick'))return'pick';if(ct>0&&k==='chop')return wid()==='w4'?'axe':S.axe?'axeT':wKind();if(ct>0&&k==='mine')return'pick';return wKind()}
// góc tính theo hướng nhìn gốc của sprite (+x = phía trước); khi quay trái cả nhân vật lẫn vũ khí được lật cùng nhau
function pose(){const ct=X.chopT,p=ct>0?1-ct/.5:-1,kind=curKind();if(!kind)return{kind:null};const C=WCFG[kind]||WCFG.sword,d=dirNow();
 const rest=C.rest[d];let th=rest+(X.mvNow?Math.sin(X.anT*9)*.1:Math.sin(X.anT*2.2)*.03),fw=0,pull=0,tr=0;
 if(p>=0){const a0=C.atk[d][0],a1=C.atk[d][1];
  const am=C.aim&&AIM.t>performance.now()?AIM:null,nx=am?Math.abs(am.x):0,ny=am?am.y:0; // hướng ngắm trong hệ sprite (đã lật)
  if(C.kind==='stab'){th=am?Math.atan2(nx,-ny):a0;const q=Math.min(1,p/.55);fw=Math.sin(q*Math.PI)*(C.reach||.4)}
  else if(C.kind==='bow'){th=am?Math.atan2(ny,nx):0;pull=p<.5?ease(p/.5):0}
  else{th=p<.32?lerp(rest,a0,ease(p/.32)):p<.56?lerp(a0,a1,ease((p-.32)/.24)):lerp(a1,rest,ease((p-.56)/.44));tr=C.trail&&p>.32&&p<.64?1-Math.abs((p-.48)/.16):0}}
 return{kind,C,d,th,fw,pull,tr,p,back:!!(C.back&&C.back[d]),am:C.aim&&p>=0&&AIM.t>performance.now()?AIM:null}}
F5.WCFG=WCFG;let DBG=false;
addEventListener('keydown',e=>{if(e.key==='F9'){DBG=!DBG;say(DBG?'🔧 Debug vũ khí: BẬT (chấm đỏ = bàn tay, xanh = điểm nắm, vàng = đầu vũ khí)':'🔧 Debug vũ khí: TẮT')}});
F5.debug=v=>{DBG=v===undefined?!DBG:!!v;return DBG};
function heldDraw(g,k,L,tilt){g.save();g.rotate(tilt||0);const ol='#3a2414';g.lineWidth=1.4;g.strokeStyle=ol;
 if(k==='bread'){g.fillStyle='#d99a4a';g.beginPath();g.ellipse(0,-L*.08,L*.26,L*.13,-.5,0,7);g.fill();g.stroke();g.strokeStyle='#f6d39a';g.lineWidth=1.5;for(const q of[-.1,0,.1]){g.beginPath();g.moveTo(L*(q-.04),-L*(.16+q*.5));g.lineTo(L*(q+.05),-L*(.06+q*.5));g.stroke()}}
 else if(k==='eat'){g.fillStyle='#c9ccd2';g.fillRect(-L*.11,-L*.3,L*.22,L*.28);g.strokeRect(-L*.11,-L*.3,L*.22,L*.28);g.fillStyle='#d8282e';g.fillRect(-L*.11,-L*.22,L*.22,L*.1)}
 else{const col={wat:'rgba(90,170,255,.9)',botC:'rgba(150,215,255,.9)',botD:'rgba(150,110,60,.92)',botE:'rgba(230,240,250,.35)'}[k]||'rgba(90,170,255,.9)';
  g.fillStyle='rgba(235,245,255,.55)';g.beginPath();g.roundRect(-L*.1,-L*.42,L*.2,L*.42,L*.05);g.fill();g.stroke();g.fillStyle=col;g.fillRect(-L*.085,-L*.3,L*.17,L*.28);
  g.fillStyle=k==='botD'?'#5a3a1a':'#2a7ae0';g.fillRect(-L*.055,-L*.52,L*.11,L*.1);g.strokeRect(-L*.055,-L*.52,L*.11,L*.1)}
 g.restore()}
F5.pre=(pv,n)=>{act=!pv;anim=n};F5.post=()=>{act=false};
F5.hand=(g,f,k,name,Z,layer)=>{if(!act||name==='die'||S.dead)return;const h=f.grip42||handOf(f);if(!h)return;
 const x0=-(f.ax!=null?f.ax:f.w/2)*k,y0=-(f.fy||f.h)*k+Z*.05,hx=x0+h.x*f.w*k,hy=y0+h.y*f.h*k,L=Z*.95;
 const it=useA?useA.k:(S.hold==='axeT'||S.hold==='pickT'?'':S.hold);
 if(it){if(layer)return;let mx=0,my=0,tilt=0;g.save();g.translate(hx,hy);if(useA){const p=Math.min(1,(performance.now()-useA.t0)/(useA.dur*1000)),up=p<.3?ease(p/.3):p<.75?1:1-ease((p-.75)/.25);
   const fx=x0+((f.ax!=null?f.ax:f.w/2)+.1*f.w)*k-hx,fy=y0+.3*f.h*k-hy;mx=fx*up;my=fy*up+(p>.3&&p<.75&&useA.kind==='eat'?Math.sin(p*60)*Z*.03:0);tilt=useA.kind==='drink'?-1.7*up:-.3*up}
  g.translate(mx,my);heldDraw(g,it,L,tilt);g.restore();return}
 const ps=pose();if(!ps.kind)return;if(!!layer!==ps.back)return; // vẽ trước hoặc sau thân theo hướng
 const C=ps.C,o=C.off[ps.d]||[0,0];let fwx=ps.d==='R'?1:0,fwy=ps.d==='D'?1:ps.d==='U'?-1:0;if(ps.am){fwx=Math.abs(ps.am.x);fwy=ps.am.y}
 g.save();g.translate(hx+o[0]*Z+ps.fw*L*fwx,hy+o[1]*Z+ps.fw*L*fwy*.5);
 if(ps.tr>0){g.save();g.globalAlpha=.55*ps.tr;g.strokeStyle='#eaf6ff';g.lineWidth=Z*.12;const a=-Math.PI/2+ps.th,dirS=ps.C.atk[ps.d][1]>=ps.C.atk[ps.d][0]?1:-1;g.beginPath();g.arc(0,0,L*.85*C.len,a-1.1*dirS,a,dirS<0);g.stroke();g.restore()}
 g.rotate(ps.th);g.scale(C.len,C.len);drawWeapon(g,ps.kind,L,ps.pull);
 if(DBG){g.fillStyle='#00e5ff';g.beginPath();g.arc(0,0,3/C.len,0,7);g.fill();g.fillStyle='#ffd400';g.beginPath();g.arc(0,-L*C.tip,3/C.len,0,7);g.fill()}
 g.restore();
 if(DBG){g.save();g.fillStyle='#ff2a2a';g.beginPath();g.arc(hx,hy,3.5,0,7);g.fill();const fl=g.getTransform().a<0;g.translate(hx,hy);if(fl)g.scale(-1,1);g.font='10px monospace';g.fillStyle='#fff';g.fillText(ps.kind+' '+ps.d+(ps.back?' sau':' trước'),6,-6);g.restore()}};
F5.tool=(k)=>{if(k==='mine'&&S.pick){X.chopK='mine';X.chopT=.5}};
/* ---------- tấn công: tầm, hồi chiêu, cung tên ---------- */
F5.armed=()=>!useA&&!!(X.chopK==='chop'?(wid()||S.axe):X.chopK==='mine'?S.pick:wid());
F5.cd=()=>{const w=wid();return w&&WP[w].cd||.55};
F5.reach=()=>{const w=wid();return w&&WP[w].reach||2.3};
/* ngắm mục tiêu: kẻ địch gần nhất trong tầm & trong hình nón phía trước; không có thì bắn/đâm theo hướng điều khiển */
const AIM={x:1,y:0,t:0};
function faceDir(){const l=Math.hypot(X.fvx,X.fvy)||1;return{x:X.fvx/l,y:X.fvy/l}}
function pickTarget(range,cone){const f=faceDir();let best=null,bs=1e9;for(const e of SH.ens){const dx=e.x-pos.x,dy=e.y-pos.y,d=Math.hypot(dx,dy);if(d>range||d<.05)continue;const c=(dx*f.x+dy*f.y)/d;if(c<cone)continue;const sc=d*(1.6-c);if(sc<bs){bs=sc;best=e}}return best}
function setAim(x,y,ms){const l=Math.hypot(x,y)||1;AIM.x=x/l;AIM.y=y/l;AIM.t=performance.now()+ms;X.fvx=AIM.x;X.fvy=AIM.y;if(Math.abs(AIM.x)>.08)X.fxs=AIM.x>0?1:-1}
const ASPD=18,AR=.62; // tốc độ mũi tên (ô/giây), bán kính va chạm thân quái
function leadAim(e,ox,oy){const dx=e.x-ox,dy=e.y-oy,vx=e._vx||0,vy=e._vy||0,a=vx*vx+vy*vy-ASPD*ASPD,b=2*(dx*vx+dy*vy),c=dx*dx+dy*dy;let tt=0;
 if(Math.abs(a)<1e-6)tt=b<0?-c/b:0;else{const D=b*b-4*a*c;if(D>=0){const r1=(-b-Math.sqrt(D))/(2*a),r2=(-b+Math.sqrt(D))/(2*a);tt=Math.min(...[r1,r2].filter(v=>v>0),9)}if(!(tt>0&&tt<1.2))tt=Math.hypot(dx,dy)/ASPD}
 return{x:dx+vx*tt,y:dy+vy*tt}}
const blockedTree=()=>{let en=false,tn=false;for(const e of SH.ens)if(Math.hypot(e.x-pos.x,e.y-pos.y)<2.6)en=true;for(const tr of SH.trees)if(!tr.giant&&tr.hp>0&&Math.hypot(tr.x-pos.x,tr.y-pos.y)<2.3)tn=true;return tn&&!en&&X.hasAxe()};
F5.attack=()=>{if(SH.lying)return true; // đang ngủ: không chiến đấu
 if(useA)useA=null;S.hold='';const w=wid();if(w!=='w7'&&w!=='w5')return false;if(blockedTree())return false; // chặt cây vẫn dùng rìu
 if(w==='w7'){X.atkCd=.8;X.chopT=.5;X.chopK='atk';let tg=pickTarget(10,.25);if(tg){const v=leadAim(tg,pos.x,pos.y);setAim(v.x,v.y,600)}else{const f=faceDir();setAim(f.x,f.y,600)}
  setTimeout(()=>{if(S.dead||!S.on)return;let dx=AIM.x,dy=AIM.y;if(tg&&SH.ens.includes(tg)){const v=leadAim(tg,pos.x+dx*.55,pos.y+dy*.55);const l=Math.hypot(v.x,v.y)||1;dx=v.x/l;dy=v.y/l;setAim(dx,dy,350)}
   ARW.push({x:pos.x+dx*.55,y:pos.y+dy*.55,dx,dy,d:0,dmg:X.hit(),hit:false})},250);return true}
 // giáo: đâm thẳng theo hướng ngắm; vùng sát thương = đoạn thẳng đầu giáo quét qua
 X.atkCd=.65;X.chopT=.5;X.chopK='atk';const tg=pickTarget(3.4,-.1);if(tg)setAim(tg.x-pos.x,tg.y-pos.y,600);else{const f=faceDir();setAim(f.x,f.y,600)}
 const dmg=X.hit(),ax=AIM.x,ay=AIM.y,done=new Set();
 setTimeout(()=>{if(S.dead||!S.on)return;for(const e of SH.ens.slice()){if(done.has(e))continue;const dx=e.x-pos.x,dy=e.y-pos.y,al=dx*ax+dy*ay,pr=Math.abs(dx*ay-dy*ax);
   if(al>.2&&al<SPR+AR&&pr<.55+AR*.5){done.add(e);CMD.exec('enemy.hit',{id:e.id,dmg,kx:ax,ky:ay,rng:1},{ref:e})}}},150);return true};
const SPR=2.9; // tầm với của đầu giáo (ô)
F5.spearReach=SPR;
/* mũi tên: va chạm theo đoạn quét (không xuyên qua quái khi khung hình giật), chỉ trúng 1 lần */
function stepArrows(dt){for(let i=ARW.length;i--;){const a=ARW[i];let rem=ASPD*dt,gone=false;
 while(rem>0&&!gone){const st=Math.min(.35,rem);rem-=st;const x0=a.x,y0=a.y,x1=x0+a.dx*st,y1=y0+a.dy*st;let hit=null,ht=2;
  for(const e of SH.ens){const ex=e.x-x0,ey=e.y-y0,tt=Math.max(0,Math.min(1,(ex*a.dx+ey*a.dy)/st)),cx=ex-a.dx*st*tt,cy=ey-a.dy*st*tt;if(cx*cx+cy*cy<AR*AR&&tt<ht){ht=tt;hit=e}}
  if(hit){const r=CMD.exec('enemy.hit',{id:hit.id,dmg:a.dmg,kx:a.dx,ky:a.dy,rng:1},{ref:hit});a.hit=true;a.x=x0+a.dx*st*ht;a.y=y0+a.dy*st*ht;gone=true;if(F5.onArrow)F5.onArrow(a,hit,r);break}
  a.x=x1;a.y=y1;a.d+=st;if(a.d>10||(a.d>.7&&X.hitC(a.x,a.y,.02)))gone=true}
 if(gone)ARW.splice(i,1)}}
/* hiệu ứng trúng đòn trên quái (vẽ cùng quái ở cả 2D & 2.5D) */
F5.enFx=(g,e,x,y,Z)=>{if(!(e.kb>0))return;const a=Math.min(1,e.kb/.25),cy=y-Z*1.05,r=Z*(.35+(1-a)*.5);g.save();g.globalCompositeOperation='lighter';
 g.fillStyle='rgba(255,240,180,'+.55*a+')';g.beginPath();g.arc(x,cy,r*.45,0,7);g.fill();g.strokeStyle='rgba(255,255,220,'+a+')';g.lineWidth=Math.max(1.5,Z*.06);
 for(let i=0;i<8;i++){const t=i*.785+e.p;g.beginPath();g.moveTo(x+Math.cos(t)*r*.4,cy+Math.sin(t)*r*.4);g.lineTo(x+Math.cos(t)*r,cy+Math.sin(t)*r);g.stroke()}g.restore()};
/* ---------- dùng đồ: hoạt ảnh đưa lên miệng; chỉ tiêu hao khi xong ---------- */
const FOOD={eat:1,bread:1,apple61:1,pear61:1,banana61:1},DRINK={wat:1,botC:1,botD:1};
const holdCount=k=>k==='eat'?(S.eat|0):k==='axeT'?(S.axe?1:0):k==='pickT'?(S.pick?1:0):(S[k]|0);
F5.use=(k,v)=>{if(!S.on||S.dead)return;if(useA){if(performance.now()-useA.st<2500)return;useA=null} /* đang ăn dở thì bỏ qua lần bấm trùng */const n=k==='eat'?(S.eat>0||S.bread>0):S[k]>0;
 if(!n){say(k==='eat'?'Hết đồ ăn. Hãy hái quả hoặc tìm đồ hộp!':'Không còn '+(F4.names[k]||k));return}
 if(DRINK[k]&&S.water>=100){say('Bạn không khát');return}
 const hk=k==='eat'&&S.eat<1?'bread':k;useA={k:hk,kk:k,v,kind:DRINK[k]?'drink':'eat',t0:performance.now(),st:performance.now(),dur:.9};
 if($('inv').style.display=='flex')globalThis.togInv()};
function finishUse(){const u=useA;useA=null;if(!u||S.dead)return;try{
 if(DRINK[u.kk])CMD.exec('water.drink',{k:u.kk});else CMD.exec('item.use',u.kk==='eat'?(u.v==null||u.v<-1?{k:'eat'}:{k:'eat',v:u.v}):{k:u.kk});
 }catch(e){console.warn('[F5] dùng đồ',e)}if(S.hold&&!holdCount(S.hold))S.hold=''}
/* ---------- nước ---------- */
let dbLast=Date.now();
function dbTick(){const now=Date.now(),el=Math.min(2000,Math.max(0,now-dbLast))/1000;dbLast=now;if(!(S.dbW>0))return;if(S.dead||!S.on){if(S.dead){S.dbW=0;S.dbD=0}return}
 S.dbW=Math.max(0,S.dbW-el);const n=Math.min(DB_N,Math.floor(DB_N-S.dbW+1e-6));while((S.dbD|0)<n){S.dbD=(S.dbD|0)+1;S.hp-=DB_HP;S.sta=Math.max(0,S.sta-DB_ST);try{SH.FL.push({x:SH.pos.x,y:SH.pos.y,v:'-'+DB_HP+' 🤢',c:'#9ad04a',t0:performance.now()})}catch(_){}}
 if(S.dbW<=0){S.dbW=0;S.dbD=0;S.dbS=0;say('✅ Hết nhiễm độc nước bẩn')}}
setInterval(dbTick,200);
const DB_HP=2,DB_ST=5,DB_N=10; // BƯỚC 16: nước chưa đun → nhiễm độc 10 giây thực tế, MỖI GIÂY −2 máu −5 thể lực (tối đa −20/−50)
function poison(){if(S.dbW>0)return' (đang bị nước bẩn – không cộng dồn)';S.dbW=DB_N;S.dbD=0;S.dbS=0;dbLast=Date.now();return' · 🤢 Nhiễm độc 10 giây (mỗi giây −2 máu, −5 thể lực)'}
CMD.def('water.drink',{check(p){if(!DRINK[p.k])return{reason:'bad'};if(!(S[p.k]>=1))return{reason:'empty',msg:'Không còn '+F4.names[p.k]};return true},
 apply(p,c){if(!c.mine)return{ok:true};S[p.k]--;S.water=Math.min(100,S.water+50);let m=p.k==='botD'?'🤢 Uống nước chưa đun: +50 khát'+poison():'💧 '+(p.k==='wat'?'Uống nước đóng chai':'Uống nước sạch')+': +50 khát';
  if(!X.give('botE',1))m+=' (túi đầy, bỏ lại chai rỗng)';else m+=' · còn chai rỗng';return{msg:m,anim:true,inv:true}}});
CMD.def('water.raw',{check(){return S.water<100||{reason:'full',msg:'Bạn không khát'}},apply(p,c){if(!c.mine)return{ok:true};S.water=Math.min(100,S.water+35);return{msg:'💧 Uống nước chưa đun: +35 khát'+poison(),anim:true}}});
F5.drinkRaw=()=>CMD.exec('water.raw',{src:'lake'});
CMD.def('water.fill',{check(p){if(!(S.botE>=1))return{reason:'empty',msg:'Cần chai rỗng (chế ở 🔨 bàn chế tạo: 2 nhựa + 1 gỗ)'};if(p.src==='barrel'){const b=BAR.find(q=>q.id===p.id);if(!b||b.u<1)return{reason:'empty',msg:'Thùng đã hết nước'}}return true},
 apply(p,c){if(!c.mine)return{ok:true};let n=0;const b=p.src==='barrel'?BAR.find(q=>q.id===p.id):null,to=b?(b.q==='clean'?'botC':'botD'):'botD';
  while(S.botE>0&&(!b||b.u>=1)){S.botE--;if(!X.give(to,1)){S.botE++;break}n++;if(b){b.u--;if(b.u<=0){b.u=0;b.q='clean'}}}
  return{msg:n?'🫙 Đã lấy '+n+' chai '+(to==='botC'?'nước sạch':'nước chưa đun')+(b?' từ thùng':' ở nguồn nước'):'🎒 Túi đầy',inv:true,anim:!!n}}});
F5.boil=()=>{if(!(S.botD>0))return false;const n=S.botD;S.botD=0;S.botC+=n;WORLD.emit('water.boil',{n});say('🔥 Đã đun sôi '+n+' chai → nước sạch');return true};
/* ---------- thùng nước (đặt trong căn cứ) ---------- */
const BAR=[];let barSeq=0;const BCAP=100;
const barCol=b=>({x0:b.x-.42,x1:b.x+.42,z0:b.y-.32,z1:b.y+.3,on:false,f5:1});
function addBar(b){b.c=barCol(b);SH.cols.push(b.c);BAR.push(b)}
function delBar(b){const i=BAR.indexOf(b);if(i>=0)BAR.splice(i,1);const j=SH.cols.indexOf(b.c);if(j>=0){SH.cols.splice(j,1);if(SH.colsDirty)SH.colsDirty()}}
CMD.def('barrel.place',{check(p){if(!(S.barrel>=1))return{reason:'empty'};if(SH.IH())return{reason:'inside',msg:'Đặt thùng ở sân căn cứ (ngoài trời)'};
  if(Math.hypot(p.x-(globalThis.CO||{x:0}).x,p.y-(globalThis.CO||{y:0}).y)>16)return{reason:'far',msg:'Chỉ đặt thùng nước trong căn cứ (gần nhà gỗ)'};if(X.hitC(p.x,p.y,.55)||BAR.some(b=>Math.hypot(b.x-p.x,b.y-p.y)<1.2))return{reason:'blocked',msg:'Chỗ này vướng – đứng chỗ trống rồi đặt lại'};return true},
 apply(p,c){S.barrel=Math.max(0,S.barrel-(c.mine?1:0));const b={id:'bw'+(++barSeq),x:+p.x.toFixed(2),y:+p.y.toFixed(2),u:0,q:'clean'};addBar(b);WORLD.emit('barrel.place',{id:b.id});return{msg:'🛢 Đã đặt thùng nước (0/'+BCAP+')',inv:true}}});
CMD.def('barrel.pour',{check(p){const b=BAR.find(q=>q.id===p.id);if(!b)return{reason:'gone'};if(!(S.botC+S.botD+S.wat>0))return{reason:'empty',msg:'Không có chai nước để đổ'};if(b.u>=BCAP)return{reason:'full',msg:'Thùng đã đầy'};return true},
 apply(p,c){const b=BAR.find(q=>q.id===p.id);if(!b)return{ok:false};let n=0,dirty=false;
  for(const k of['botD','botC','wat'])while(S[k]>0&&b.u<BCAP){S[k]--;b.u++;n++;if(k==='botD')dirty=true;X.give('botE',1)}
  if(dirty)b.q='dirty';WORLD.emit('barrel.pour',{id:b.id,n,q:b.q});return{msg:'🛢 Đổ '+n+' đơn vị vào thùng ('+b.u+'/'+BCAP+(b.q==='dirty'?', nước chưa đun':', nước sạch')+')',inv:true}}});
CMD.def('barrel.take',{check(p){const b=BAR.find(q=>q.id===p.id);if(!b)return{reason:'gone'};if(b.u>0)return{reason:'notempty',msg:'Chỉ thu hồi được thùng rỗng'};if(!X.room('barrel'))return{reason:'full',msg:'🎒 Túi đầy'};return true},
 apply(p,c){const b=BAR.find(q=>q.id===p.id);if(!b)return{ok:false};delBar(b);if(c.mine)S.barrel++;return{msg:'🛢 Đã thu hồi thùng nước',inv:true}}});
let barUI=null,barOpen=null,barPz=false;
function barPanel(b){if(!barUI){barUI=document.createElement('div');barUI.style.cssText='position:fixed;inset:0;z-index:55;display:none;align-items:center;justify-content:center;background:rgba(6,4,16,.6);font-family:system-ui;color:#fff';document.body.appendChild(barUI)}
 barOpen=b;if(barUI.style.display!=='flex'){barPz=S.pz;S.pz=true}barUI.style.display='flex';
 const pct=b.u/BCAP*100,qc=b.u?b.q==='clean'?'#5ad0ff':'#c8a060':'#888',btn=(t,f,on)=>'<button '+(on?'':'disabled ')+'onclick="F5bar(\''+f+'\')" style="display:block;width:100%;margin:6px 0;padding:9px;border-radius:10px;border:0;background:'+(on?'#3a7ad0':'#444')+';color:#fff;font-weight:600">'+t+'</button>';
 barUI.innerHTML='<div style="background:#1c1830;border:2px solid #6a8ac8;border-radius:16px;padding:14px 18px;width:min(320px,86vw);text-align:center">'+icon('barrel',56)+'<h3 style="margin:6px 0">Thùng nước</h3>'+
  '<div style="background:#0c0a18;border-radius:8px;height:16px;overflow:hidden;margin:6px 0"><div style="height:100%;width:'+pct+'%;background:'+qc+'"></div></div><div style="font-size:13px">'+b.u+' / '+BCAP+' đơn vị · '+(b.u?(b.q==='clean'?'💧 nước sạch':'⚠️ nước chưa đun (đun ở bếp sau khi lấy ra)'):'trống')+'</div>'+
  btn('⬇ Đổ nước vào ('+(S.botC+S.botD+S.wat)+' chai)','pour',S.botC+S.botD+S.wat>0&&b.u<BCAP)+btn('⬆ Lấy nước ra chai ('+S.botE+' chai rỗng)','fill',S.botE>0&&b.u>0)+btn('🧺 Thu hồi thùng','take',b.u===0)+btn('Đóng','close',1)+'</div>'}
globalThis.F5bar=a=>{const b=barOpen;if(a==='close'||!b){barUI.style.display='none';S.pz=barPz;barOpen=null;return}
 if(a==='pour')CMD.exec('barrel.pour',{id:b.id});else if(a==='fill')CMD.exec('water.fill',{src:'barrel',id:b.id});else if(a==='take'){CMD.exec('barrel.take',{id:b.id});barUI.style.display='none';S.pz=barPz;barOpen=null;return}
 if(BAR.includes(b))barPanel(b)};
/* ---------- tương tác (2D & 2.5D) ---------- */
F5.acts=c=>{if(SH.IH())return;for(const b of BAR){const d=Math.hypot(pos.x-b.x,pos.y-b.y);if(d<1.6)c(d,1.6,'🛢<br>Thùng nước<br><small>'+b.u+'/'+BCAP+'</small>',()=>barPanel(b),b)}
 const ld=X.lkDist(pos.x,pos.y);if(ld<2&&S.botE>0)c(ld-.01,2,'🫙<br>Lấy nước<br>vào chai',()=>CMD.exec('water.fill',{src:'lake'}))};
/* ---------- túi đồ ---------- */
F5.ic=x=>{if(x.eq)return wIcon(x.eq,34)||x.ic;if(x.k&&ICK.has(x.k))return icon(x.k,34);return x.ic};
F5.icon=(k,px)=>icon(k,px)||(WP[k]?wIcon(k,px):null);F5.rare=k=>!!RARE[k];
F5.info=k=>INFO[k]||'';
F5.btn=x=>F5.btn0(x)+(F5.hbBtn?F5.hbBtn(x):'');F5.btn0=x=>{const k=x.k;if(k==='bread'||globalThis.FLORA61?.isFruit(k))return'<button onclick="invUse()">Ăn</button>';if(DRINK[k])return'<button onclick="invUse()">Uống</button>';if(k==='barrel')return'<button onclick="invUse()">Đặt</button>';return''};
F5.invUse=x=>{const k=x.k;if(k==='eat'){F5.use('eat',x.v);return true}if(k==='bread'||DRINK[k]||globalThis.FLORA61?.isFruit(k)){F5.use(k);return true}
 if(k==='barrel'){const l=Math.hypot(X.fvx,X.fvy)||1,px=pos.x+X.fvx/l*1.3,py=pos.y+X.fvy/l*1.3;CMD.exec('barrel.place',{x:px,y:py});return true}return false};
F5.sel=x=>{const k=x&&x.k;S.hold=(k&&(FOOD[k]||DRINK[k]||k==='botE'))?(k==='eat'&&!(S.eat>0)?'bread':k):''};
/* ---------- luật bảo vệ 3 ngày ---------- */
F5.prot=prot;
F5.lifeHud=()=>{if(!prot()){const m=SH.EM?SH.EM():1;return'<span style="color:#ff9a9a">☠ Hết bảo vệ – chết là kết thúc'+(m>1.001?' · 👹 Quái +'+Math.round((m-1)*100)+'%':'')+'</span>'}const rem=PROT_H-SH.GT,dd=Math.floor(rem/24),hh=Math.floor(rem%24),L=Math.max(0,Math.min(3,S.lives|0));
 return'<span style="color:#ff5a7a">'+'♥'.repeat(L)+'</span><span style="opacity:.3">'+'♥'.repeat(3-L)+'</span> <span style="color:#9fe0ff">🛡 '+(dd?dd+'n ':'')+hh+'g</span>'};
const ripples=[];F5.ripples=ripples;F5.domeHit=e=>{const now=performance.now();if(e._rp&&now-e._rp<500)return;e._rp=now;ripples.push({x:e.x,y:e.y,t0:now});if(ripples.length>4)ripples.shift()};
/* ---------- HUD trạng thái ---------- */
const chip=document.createElement('div');chip.style.cssText='position:fixed;left:12px;top:150px;z-index:7;background:rgba(90,60,20,.88);border:1px solid #e0b060;color:#fff;padding:4px 10px;border-radius:10px;font:600 12px system-ui;display:none;pointer-events:none';document.body.appendChild(chip);
const pk=document.createElement('div');pk.style.cssText='position:fixed;left:50%;bottom:120px;transform:translateX(-50%);z-index:8;display:flex;gap:6px;pointer-events:none';document.body.appendChild(pk);
function pickChip(k,n,name){const ic=icon(k,30)||(F4.icon&&F4.icon(k))||'';if(!ic)return;const d=document.createElement('div');d.style.cssText='background:rgba(20,24,44,.88);border:1px solid #7a9ad0;border-radius:12px;padding:4px 10px 4px 4px;color:#fff;font:600 13px system-ui;display:flex;align-items:center;gap:6px;transition:opacity .4s,transform .4s';
 d.innerHTML=ic+'<span>+'+n+' '+name+'</span>';pk.appendChild(d);setTimeout(()=>{d.style.opacity=0;d.style.transform='translateY(-10px)'},1400);setTimeout(()=>d.remove(),1900)}
WORLD.on(ev=>{try{const me=ev.data&&ev.data.by===X.SID;if(ev.type==='item.pick'&&me){const m={w:['wood','Gỗ'],s:['stone','Đá']}[ev.data.t];if(m)pickChip(m[0],1,m[1])}else if(ev.type==='chest.take'&&me){}}catch(_){}});

/* ================= KHOẢNG CÁCH CHUẨN · CỬA NHÀ · DỊCH CHUYỂN VỀ CĂN CỨ · AI ZOMBIE =================
 Hệ tọa độ thế giới: mặt đất là mặt phẳng X–Y của game (2.5D hiển thị Y thành trục Z). 1 đơn vị = 1 mét
 (nhân vật cao ~2 đơn vị, cửa nhà rộng 2,6 đơn vị). Mọi khoảng cách tính Euclid trên mặt đất, không theo pixel, không phụ thuộc zoom. */
const M_PER_UNIT=1,distM=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by)*M_PER_UNIT;
const RANGE={zombieDay:5,door:2,mine:2,homeTp:5000};
F5.distM=distM;F5.RANGE=RANGE;F5.M_PER_UNIT=M_PER_UNIT;
/* né vật cản: thử lệch hướng khi phía trước bị chặn; không đi xuyên tường/cửa */
const blk=(x,y)=>X.hitC(x,y,.3)||(!!SH.deepAt&&!!SH.deepAt(x,y,.2)); // vật cản + nước sâu (quái không lội qua hồ sâu)
F5.steer=(e,ux,uy)=>{const L=.75;if(!blk(e.x+ux*L,e.y+uy*L)){e._st=0;return[ux,uy]}
 const sd=e._sd||(Math.random()<.5?1:-1);for(const a of[.6,1.1,1.6,2.2]){for(const s of[sd,-sd]){const c=Math.cos(a*s),n=Math.sin(a*s),vx=ux*c-uy*n,vy=ux*n+uy*c;if(!blk(e.x+vx*L,e.y+vy*L)){e._sd=s;return[vx,vy]}}}return[ux*.2,uy*.2]};
/* có vật cản giữa hai điểm → không đánh xuyên tường, cửa */
F5.wallBetween=(x0,y0,x1,y1)=>{for(const k of[.3,.5,.7]){if(X.hitC(x0+(x1-x0)*k,y0+(y1-y0)*k,0))return true}return false};
/* ---------- CỬA GỖ CHO NHÀ THÔNG THƯỜNG ---------- */
const DOOR_MAX=200,DOOR_HIT=10,DOOR_CD=1,DOOR_BASE={wood:3}; // chi phí cơ bản = công thức sửa cửa sẵn có của game (3 gỗ)
const DOORS=[];
function doorCol(d){return{x0:d.x-d.w-.05,x1:d.x+d.w+.05,z0:d.y-.45,z1:d.y,f6:1}}
function doorSync(d){const want=d.st==='closed';const i=SH.cols.indexOf(d.c);if(want&&i<0)SH.cols.push(d.c);if(!want&&i>=0){SH.cols.splice(i,1);if(SH.colsDirty)SH.colsDirty()}}
function initDoors(){if(DOORS.length)return;(SH.HOUSES||[]).forEach((h,i)=>{const b=h.b;if(!b||!/^(house|ab)/.test(b.spr||'')||b.x0>INT_X0)return;
 const d={id:'hd'+i,h,x:b.gc,y:b.y1,w:b.gw,hp:DOOR_MAX,rep:0,st:'closed'};d.c=doorCol(d);DOORS.push(d);doorSync(d)})}
initDoors();globalThis.F5DOORS=DOORS;
const repCost=d=>{const m=Math.pow(2,d.rep);return{wood:DOOR_BASE.wood*m}}; // lần sửa thứ n = cơ bản × 2^(n−1)
const hasCost=c=>Object.keys(c).every(k=>(S[k]|0)>=c[k]);
CMD.def('door.toggle',{check(p){const d=DOORS.find(q=>q.id===p.id);if(!d||d.st==='broken')return{reason:'gone'};if(distM(pos.x,pos.y,d.x,d.y)>RANGE.door+.01)return{reason:'far',msg:'Đứng gần cửa hơn (≤ 2 m)'};return true},
 apply(p){const d=DOORS.find(q=>q.id===p.id);d.st=d.st==='closed'?'open':'closed';doorSync(d);WORLD.emit('door.toggle',{id:d.id,st:d.st});return{}/* L32: không thông báo mở/đóng cửa */}});
CMD.def('door.repair',{check(p){const d=DOORS.find(q=>q.id===p.id);if(!d||d.st==='broken')return{reason:'gone'};if(distM(pos.x,pos.y,d.x,d.y)>RANGE.door+.01)return{reason:'far',msg:'Đứng gần cửa hơn (≤ 2 m)'};
  if(d.hp>=DOOR_MAX)return{reason:'full',msg:'Cửa còn nguyên, không cần sửa'};const c=repCost(d);if(!hasCost(c))return{reason:'cost',msg:'Thiếu vật liệu: cần '+c.wood+' gỗ (đang có '+(S.wood|0)+')'};return true},
 apply(p){const d=DOORS.find(q=>q.id===p.id),c=repCost(d);for(const k in c)S[k]-=c[k];d.hp=DOOR_MAX;d.rep++;WORLD.emit('door.repair',{id:d.id,rep:d.rep});return{msg:'🔧 Đã sửa cửa (lần '+d.rep+', -'+c.wood+' gỗ) · lần sau cần '+repCost(d).wood+' gỗ',inv:true}}});
CMD.def('door.rebuild',{check(p){const d=DOORS.find(q=>q.id===p.id);if(!d||d.st!=='broken')return{reason:'bad'};if(distM(pos.x,pos.y,d.x,d.y)>RANGE.door+.01)return{reason:'far',msg:'Đứng gần cửa hơn (≤ 2 m)'};
  if(!hasCost(DOOR_BASE))return{reason:'cost',msg:'Thiếu vật liệu: cần '+DOOR_BASE.wood+' gỗ để làm cửa mới'};return true},
 apply(p){const d=DOORS.find(q=>q.id===p.id);for(const k in DOOR_BASE)S[k]-=DOOR_BASE[k];d.st='closed';d.hp=DOOR_MAX;d.rep=0;doorSync(d);WORLD.emit('door.rebuild',{id:d.id});return{msg:'🚪 Đã lắp cửa mới (200/200) · bộ đếm sửa bắt đầu lại',inv:true}}});
let dUI=null,dOpen=null,dPz=false;
function doorPanel(d){if(!dUI){dUI=document.createElement('div');dUI.style.cssText='position:fixed;inset:0;z-index:55;display:none;align-items:center;justify-content:center;background:rgba(6,4,16,.55);font-family:system-ui;color:#fff';document.body.appendChild(dUI)}
 dOpen=d;if(dUI.style.display!=='flex'){dPz=S.pz;S.pz=true}dUI.style.display='flex';const c=repCost(d),ok=hasCost(c),bt=(t,a,on)=>'<button '+(on?'':'disabled ')+'onclick="F5door(\''+a+'\')" style="display:block;width:100%;margin:6px 0;padding:9px;border-radius:10px;border:0;background:'+(on?'#3a7ad0':'#444')+';color:#fff;font-weight:600">'+t+'</button>';
 dUI.innerHTML='<div style="background:#1c1830;border:2px solid #b08a5a;border-radius:16px;padding:14px 18px;width:min(320px,86vw);text-align:center"><div style="font-size:34px">🚪</div><h3 style="margin:4px 0">Cửa gỗ</h3>'+
  (d.st==='broken'?'<div style="color:#ff8a8a">Cửa đã bị phá hoàn toàn</div>'+bt('🔨 Làm cửa mới ('+DOOR_BASE.wood+' gỗ · có '+(S.wood|0)+')','rebuild',hasCost(DOOR_BASE)):
  '<div style="background:#0c0a18;border-radius:8px;height:14px;overflow:hidden;margin:6px 0"><div style="height:100%;width:'+(d.hp/DOOR_MAX*100)+'%;background:'+(d.hp>100?'#6fd08c':d.hp>50?'#f2b33a':'#e05a4a')+'"></div></div><div style="font-size:13px">'+Math.ceil(d.hp)+' / '+DOOR_MAX+' HP · đang '+(d.st==='closed'?'đóng':'mở')+' · đã sửa '+d.rep+' lần</div>'+
  bt(d.st==='closed'?'🔓 Mở cửa':'🔒 Đóng cửa','toggle',1)+bt('🔧 Sửa đầy (lần '+(d.rep+1)+': '+c.wood+' gỗ · có '+(S.wood|0)+')','repair',ok&&d.hp<DOOR_MAX))+bt('Đóng bảng','close',1)+'</div>'}
globalThis.F5door=a=>{const d=dOpen;if(a==='close'||!d){dUI.style.display='none';S.pz=dPz;dOpen=null;return}CMD.exec('door.'+a,{id:d.id});if(a==='toggle'){dUI.style.display='none';S.pz=dPz;dOpen=null;return}doorPanel(d)};
F5.doors=DOORS;
// zombie ngoài nhà khi người chơi ở trong: cào cửa đóng (10 HP/đòn, hồi 1 giây); cửa mở/bị phá → vào theo
let lastIn=null;
function doorAI(dt){const ih=SH.IH();let inH=null;if(ih){const f=SH.curFl&&SH.curFl();inH=DOORS.find(d=>d.h.f===f)||null}
 if(inH&&lastIn!==inH&&inH.st==='open'){inH.st='closed';doorSync(inH)} // vào nhà thì cửa tự khép lại sau lưng
 lastIn=inH;if(!inH)return;const d=inH;
 for(const e of SH.ens){if(e.x>INT_X0||e.t==='b'&&false)continue;const dd=distM(e.x,e.y,d.x,d.y+.8);if(dd>10)continue;
  const sp=e.t==='n'?NIGHT_SPD:e.t==='b'?2.9:2.1;
  if(d.st==='closed'){if(dd>.9){const ux=(d.x-e.x)/dd,uy=(d.y+.8-e.y)/dd,s=F5.steer(e,ux,uy);e.x+=s[0]*sp*dt;e.y+=s[1]*sp*dt}
   else{e._dc=(e._dc||0)-dt;if(e._dc<=0){e._dc=DOOR_CD;d.hp=Math.max(0,d.hp-DOOR_HIT);if(d.hp<=0){d.st='broken';doorSync(d);WORLD.emit('door.broken',{id:d.id});say('💥 Cửa nhà đã bị phá! Zombie đang vào…')}else if(d.hp%50===0)say('🚪 Zombie đang cào cửa! Cửa còn '+d.hp+'/'+DOOR_MAX)}}}
  else{if(dd>1.2){const ux=(d.x-e.x)/dd,uy=(d.y+.8-e.y)/dd;e.x+=ux*sp*dt;e.y+=uy*sp*dt}else{const en=d.h.ent;e.x=en[0]+(Math.random()-.5);e.y=en[1]-.5;e.wx=e.x;e.wy=e.y;e.cd=Math.max(e.cd||0,1)}}}}
const NIGHT_SPD=8; // = 2 × tốc độ đi bộ gốc của nhân vật lúc bắt đầu (4 m/s), không theo điểm/trang bị
F5.NIGHT_SPD=NIGHT_SPD;
// tương tác cửa (≤ 2 m)
/* L30: nhà thường – nhấn E là mở cửa và vào luôn (không hiện bảng) */function doorGo(d){if(d.st==='broken')return doorPanel(d);if(d.st==='closed'){const r=CMD.exec('door.toggle',{id:d.id});if(!r||!r.ok)return}const en=d.h&&d.h.ent;if(en&&isFinite(en[0])){pos.x=en[0];pos.y=en[1]-.5}}F5.doorGo=doorGo;
const actsPrev=F5.acts;F5.acts=c=>{actsPrev(c);if(SH.IH())return;for(const d of DOORS){const dd=distM(pos.x,pos.y,d.x,d.y);if(dd<=RANGE.door)c(dd-.02,RANGE.door,d.st==='broken'?'🔨<br>Làm cửa mới':'🚪<br>Vào nhà',()=>doorGo(d),{x:d.x,y:d.y})}};
// lưu trạng thái cửa
X.SAVE.register({id:'f6',scope:'world',version:1,defaults:()=>({d:{}}),validate:d=>d&&typeof d.d=='object',
 get:()=>({d:Object.fromEntries(DOORS.map(d=>[d.id,[Math.round(d.hp),d.rep,d.st]]))}),
 set:s=>{initDoors();for(const d of DOORS){const v=s.d[d.id];if(Array.isArray(v)){d.hp=Math.max(0,Math.min(DOOR_MAX,+v[0]||0));d.rep=Math.max(0,v[1]|0);d.st=/^(closed|open|broken)$/.test(v[2])?v[2]:'closed';if(d.hp<=0)d.st='broken'}else{d.hp=DOOR_MAX;d.rep=0;d.st='closed'}doorSync(d)}}});
/* ---------- DỊCH CHUYỂN VỀ CĂN CỨ ---------- */
const BASE={get x(){return (globalThis.CO||{x:0}).x},get y(){return (globalThis.CO||{y:0}).y+5.5}}; // trước cửa nhà gỗ – căn cứ chính
const tpB=document.createElement('button');tpB.style.cssText='position:fixed;right:14px;top:260px;z-index:9;display:none;padding:8px 12px;border-radius:12px;border:1px solid #9fe0ff;background:rgba(20,40,70,.9);color:#fff;font:600 13px system-ui';document.body.appendChild(tpB);
const homeChip=document.createElement('div');homeChip.style.cssText='position:fixed;left:12px;top:176px;z-index:7;color:#cfe4ff;font:600 12px system-ui;text-shadow:0 1px 2px #000;pointer-events:none';document.body.appendChild(homeChip);
const fmtD=m=>m>=1000?(m/1000).toFixed(m>=10000?0:1).replace('.',',')+' km':Math.round(m)+' m';
function safeHome(){for(let r=0;r<6;r+=.5)for(let a=0;a<6.28;a+=.4){const x=BASE.x+Math.cos(a)*r,y=BASE.y+Math.sin(a)*r;if(!X.hitC(x,y,.5))return{x,y}}return BASE}
tpB.onclick=()=>{if(SH.IH()||distM(pos.x,pos.y,BASE.x,BASE.y)<=RANGE.homeTp)return;const p=safeHome();pos.x=p.x;pos.y=p.y;WORLD.emit('player.homeTp',{});say('🏠 Đã dịch chuyển về căn cứ')};
setInterval(()=>{const ih=SH.IH(),m=ih?null:distM(pos.x,pos.y,BASE.x,BASE.y);const nh=(globalThis.CO||{}).none;homeChip.textContent=S.on&&!ih?(nh?'🏠 Chưa có nhà an toàn':'🏠 Nhà của bạn: '+fmtD(m)):'';tpB.style.display=S.on&&!S.dead&&!ih&&!nh&&m>RANGE.homeTp?'block':'none';if(m>RANGE.homeTp)tpB.textContent='🏠 Dịch chuyển về căn cứ ('+fmtD(m)+')'},300);
F5.BASE=BASE;
/* ---------- vòng cập nhật (thời gian thực, chống giật) ---------- */
let last=performance.now();
function loop(now){const dt=Math.min(.25,(now-last)/1000);last=now;requestAnimationFrame(loop);
 const live=S.on&&!S.dead&&!S.pz&&document.visibilityState==='visible';
 if(useA){const age=now-useA.st;if(S.dead||!S.on||age>6000)useA=null; /* chốt an toàn: không bao giờ kẹt quá 6 giây */
  else if(SH.hurtT>.3&&age>60){useA=null;say('⚠️ Bị tấn công – ngừng ăn/uống (không mất đồ)')}
  else if(live&&now-useA.t0>=useA.dur*1000)finishUse();else if(!live)useA.t0+=dt*1000}
 if(live)doorAI(dt);
 if(live){for(const e of SH.ens){if(e._px!=null&&dt>0){const vx=(e.x-e._px)/dt,vy=(e.y-e._py)/dt;e._vx=(e._vx||0)*.7+vx*.3;e._vy=(e._vy||0)*.7+vy*.3}e._px=e.x;e._py=e.y}stepArrows(dt)}
 // đau bụng: tổng đúng 20 máu trong 10 giây, trừ theo từng giây đã trôi qua, không cộng dồn
 if(S.dead&&S.dbW>0){S.dbW=0;S.dbD=0}

 const s=S.dbW>0?'🤢 Nhiễm độc · '+Math.ceil(S.dbW)+'s · −2❤ −5⚡/giây':SH.lying?'💤 Đang ngủ · +2❤ +5⚡ mỗi phút':'';chip.textContent=s;chip.style.display=s&&S.on?'block':'none'}
requestAnimationFrame(loop);
/* ---------- vẽ 2D: mũi tên, thùng nước, mái vòm, cổng phó bản ---------- */
const PIMG=new Image();PIMG.src='portal.jpg';F5.portalImg=PIMG;
function barrelDraw(g,x,y,s,u,q){g.save();g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x,y,s*.7,s*.2,0,0,7);g.fill();
 g.fillStyle='#8a5a2b';g.strokeStyle='#3a2414';g.lineWidth=Math.max(1.2,s*.06);g.beginPath();g.moveTo(x-s*.55,y-s*.05);g.quadraticCurveTo(x-s*.68,y-s*.6,x-s*.55,y-s*1.15);g.lineTo(x+s*.55,y-s*1.15);g.quadraticCurveTo(x+s*.68,y-s*.6,x+s*.55,y-s*.05);g.closePath();g.fill();g.stroke();
 g.strokeStyle='#6d747e';g.lineWidth=s*.09;for(const t of[.25,.85]){g.beginPath();g.moveTo(x-s*.62,y-s*t);g.lineTo(x+s*.62,y-s*t);g.stroke()}
 g.fillStyle=u?(q==='clean'?'#5ab0ff':'#a08050'):'#2a1a10';g.beginPath();g.ellipse(x,y-s*1.15,s*.52,s*.16,0,0,7);g.fill();g.strokeStyle='#3a2414';g.lineWidth=s*.05;g.stroke();g.restore()}
F5.barrelDraw=barrelDraw;
F5.draw2=(L,Xf,Yf,cx,cy,vw,vh,t,g,Z)=>{for(const b of BAR)if(Math.abs(b.x-cx)<vw&&Math.abs(b.y-cy)<vh)L.push([b.y,()=>barrelDraw(g,Xf(b.x),Yf(b.y),Z*.9,b.u,b.q)]);
 for(const a of ARW)L.push([a.y,()=>{const x=Xf(a.x),y=Yf(a.y)-Z*.8;g.save();g.translate(x,y);g.rotate(Math.atan2(a.dy,a.dx));g.strokeStyle='#5a3a1a';g.lineWidth=Math.max(1.5,Z*.05);g.beginPath();g.moveTo(-Z*.4,0);g.lineTo(Z*.25,0);g.stroke();g.fillStyle='#dfe5ee';g.beginPath();g.moveTo(Z*.25,-Z*.07);g.lineTo(Z*.4,0);g.lineTo(Z*.25,Z*.07);g.fill();g.restore()}]);
 const dc=F4.DG&&F4.DG.cur;if(dc&&PIMG.complete&&PIMG.naturalWidth&&Math.abs(dc.x-cx)<vw+2&&Math.abs(dc.y-cy)<vh+2)L.push([dc.y-.99,()=>{const x=Xf(dc.x),y=Yf(dc.y),r=Z*1.7;g.save();g.globalCompositeOperation='lighter';g.translate(x,y);g.scale(1,.5);g.rotate(performance.now()/1500);g.globalAlpha=dc.stage>0?.6:.95;g.drawImage(PIMG,-r,-r,r*2,r*2);g.restore()}]);
 const CO_=globalThis.CO||{x:0,y:0};if(prot()&&!CO_.none&&Math.abs(cx-CO_.x)<vw+8&&Math.abs(cy-CO_.y)<vh+8)L.push([CO_.y+7.9,()=>{const x=Xf(CO_.x),y=Yf(CO_.y+.5),R=7.5*Z,T=performance.now()/1000;g.save();g.globalAlpha=.85;
   const gr=g.createRadialGradient(x,y,R*.6,x,y,R);gr.addColorStop(0,'rgba(90,180,255,0)');gr.addColorStop(1,'rgba(120,210,255,.28)');g.fillStyle=gr;g.beginPath();g.ellipse(x,y,R,R*.75,0,0,7);g.fill();
   g.strokeStyle='rgba(150,225,255,.22)';g.lineWidth=1;const hs=Z*1.1;for(let yy=-R;yy<R;yy+=hs*1.5)for(let xx=-R;xx<R;xx+=hs*1.73){const ox=xx+((Math.round(yy/(hs*1.5))&1)?hs*.87:0);if(Math.hypot(ox/R,yy/(R*.75))>.97)continue;g.beginPath();for(let i=0;i<6;i++){const a=i*1.047+.52;g.lineTo(x+ox+Math.cos(a)*hs*.5,y+yy*.75+Math.sin(a)*hs*.5*.75)}g.closePath();g.stroke()}
   g.strokeStyle='rgba(170,235,255,'+(.55+.2*Math.sin(T*2))+')';g.lineWidth=2;g.beginPath();g.ellipse(x,y,R,R*.75,0,0,7);g.stroke();
   for(const r of ripples){const k=(performance.now()-r.t0)/700;if(k>1)continue;g.strokeStyle='rgba(200,245,255,'+(1-k)+')';g.lineWidth=3;g.beginPath();g.arc(Xf(r.x),Yf(r.y),Z*(.4+k*2.2),0,7);g.stroke()}g.restore()}])};
F5.arrows=ARW;F5.barrels=BAR;F5.BCAP=BCAP;
/* ---------- chế tạo ---------- */
F5.recipes=()=>[{n:'Chai nước',ic:icon('botE',34),d:'Chai rỗng – đựng tối đa 1 đơn vị nước. Lấy nước ở hồ/suối, đun ở bếp để thành nước sạch.',cost:{plas:2,wood:1},st:'botE'},
 {n:'Thùng nước',ic:icon('barrel',34),d:'Đặt trong căn cứ, chứa tối đa 100 đơn vị nước. Đổ nước từ chai vào / lấy ra chai.',cost:{wood:10,iron:4,plas:2},st:'barrel'}];
/* ---------- lưu: thùng nước (thế giới) ---------- */
X.SAVE.register({id:'f5',scope:'world',version:1,defaults:()=>({bar:[],seq:0}),validate:d=>d&&Array.isArray(d.bar),
 get:()=>({seq:barSeq,bar:BAR.map(b=>[b.id,b.x,b.y,b.u,b.q])}),
 set:d=>{for(const b of BAR.slice())delBar(b);barSeq=Math.max(0,d.seq|0);for(const a of d.bar){if(!Array.isArray(a)||!isFinite(a[1])||!isFinite(a[2]))continue;addBar({id:String(a[0]),x:+a[1],y:+a[2],u:Math.max(0,Math.min(BCAP,a[3]|0)),q:a[4]==='dirty'?'dirty':'clean'})}}});
/* chuẩn hóa dữ liệu người chơi sau khi tải */
setInterval(()=>{for(const k in NEWK)if(!(typeof S[k]=='number'&&isFinite(S[k])&&S[k]>=0))S[k]=0;if(!(S.dbW>=0&&S.dbW<=10))S.dbW=0;if(!(S.dbD>=0&&S.dbD<=20))S.dbD=0;if(!(S.dbS>=0&&S.dbS<=5))S.dbS=0;if(typeof S.hold!='string')S.hold='';if(S.hold&&!holdCount(S.hold))S.hold=''},1000);
// thêm keyframes cho bảng phần thưởng
const st=document.createElement('style');st.textContent='@keyframes chIn{from{opacity:0;transform:translateY(8px) scale(.9)}to{opacity:1;transform:none}}';document.head.appendChild(st);

/* ================= THANH VẬT PHẨM NHANH (HOTBAR) =================
 Chỉ là lối tắt tới túi đồ: mỗi ô lưu "loại vật phẩm" (không lưu số lượng, không tách đồ ra khỏi túi).
 Số lượng luôn đọc trực tiếp từ túi đồ → dùng/vứt/bán/chế tạo đều cập nhật ngay, không thể nhân đôi. */
const HB_N=7;
function hbNorm(){if(!Array.isArray(S.hb))S.hb=[];S.hb=S.hb.slice(0,HB_N).map(x=>x&&typeof x=='object'&&typeof x.id=='string'&&/^(k|eq|tool)$/.test(x.t)?{t:x.t,id:x.id,v:x.v|0}:null);while(S.hb.length<HB_N)S.hb.push(null);if(!(S.hbSel>=-1&&S.hbSel<HB_N))S.hbSel=-1}
hbNorm();
const owns=id=>S.bg.includes(id)||Object.values(S.eqp||{}).includes(id);
function berries(){return(X.BB||[]).reduce((a,b)=>a+b,0)}
function hbCount(x){if(!x)return 0;if(x.t==='eq')return owns(x.id)?1:0;if(x.t==='tool')return x.id==='axeT'?(S.axe?1:0):(S.pick?1:0);
 if(x.id==='eat'){const bb=X.BB||[];return x.v>=0?(bb[x.v]|0):Math.max(0,(S.eat|0)-berries())}return S[x.id]|0}
function hbIcon(x){if(!x)return'';if(x.t==='eq')return wIcon(x.id,30)||(EQ[x.id]?'<span style="font-size:22px">'+EQ[x.id].ic+'</span>':'');if(x.t==='tool')return'<span style="font-size:22px">'+(x.id==='axeT'?'🪓':'⛏')+'</span>';
 if(x.id==='eat')return'<span style="font-size:22px">'+(x.v>=0?'🫐':'🥫')+'</span>';if(x.id==='chB'||x.id==='chS'||x.id==='chG')return F4.icon(x.id)||'';return icon(x.id,30)||'<span style="font-size:20px">'+({med:'💊',gas:'⛽',oil:'🛢'}[x.id]||'📦')+'</span>'}
const hbName=x=>!x?'':x.t==='eq'?(EQ[x.id]||{}).n:x.t==='tool'?(x.id==='axeT'?'Rìu':'Cuốc chim'):x.id==='eat'?(x.v>=0?((SH.BN||[])[x.v]||'Quả'):'Đồ hộp'):(F4.names[x.id]||({med:'Thuốc',gas:'Xăng',oil:'Dầu',wood:'Gỗ',stone:'Đá'}[x.id])||x.id);
function cellToHb(c){if(!c)return null;if(c.eq)return{t:'eq',id:c.eq,v:0};if(c.k==='eat')return{t:'k',id:'eat',v:c.v==null?-1:c.v};return{t:'k',id:c.k,v:0}}
const same=(a,b)=>a&&b&&a.t===b.t&&a.id===b.id&&(a.v|0)===(b.v|0);
function hbAssign(x,slot){hbNorm();if(!x)return;const old=S.hb.findIndex(y=>same(y,x));if(slot==null||slot<0){slot=old>=0?old:S.hb.findIndex(y=>!y);if(slot<0)slot=HB_N-1}
 if(old>=0&&old!==slot)S.hb[old]=S.hb[slot]; // đổi chỗ nếu đã có ở ô khác (không nhân đôi)
 S.hb[slot]=x;hbRender();say('📌 Đã gán '+hbName(x)+' vào ô '+(slot+1))}
function hbClear(i){hbNorm();if(S.hb[i]){const n=hbName(S.hb[i]);S.hb[i]=null;if(S.hbSel===i){S.hbSel=-1;S.hold=''}hbRender();say('🗑 Đã xóa '+n+' khỏi ô '+(i+1))}}
// chọn ô: cầm / trang bị vật phẩm đó (dùng hệ thống trang bị & túi đồ sẵn có)
function hbSelect(i){hbNorm();if(!S.on||S.dead)return;const x=S.hb[i];if(!x){S.hbSel=i;S.hold='';hbRender();return}
 if(!hbCount(x)){say('❌ Hết '+hbName(x)+' trong túi');S.hbSel=i;hbRender();return}
 S.hbSel=i;S.hold='';
 if(x.t==='eq'){const s=(EQ[x.id]||{}).s;if(s&&S.eqp[s]!==x.id){const bi=S.bg.indexOf(x.id);if(bi>=0)X.equip(bi)}}
 else if(x.t==='tool')S.hold=x.id;
 else if(FOOD[x.id]||DRINK[x.id]||x.id==='botE')S.hold=x.id==='eat'&&!(S.eat>0)?'bread':x.id;
 if(x.id==='eat')HB_V=x.v;hbRender()}
let HB_V=-1;
// nút hành động theo món đang cầm
function heldAct(){const i=S.hbSel,x=i>=0?S.hb[i]:null;const h=S.hold;
 if(h&&FOOD[h])return{lb:'🍞<br>ĂN',k:'eat',fn:()=>F5.use(h,h==='eat'?HB_V:undefined),ok:holdCount(h)>0};
 if(h&&DRINK[h])return{lb:'💧<br>UỐNG',k:'drink',fn:()=>F5.use(h),ok:holdCount(h)>0};
 if(h==='botE')return{lb:'🫙<br>LẤY NƯỚC',k:'fill',fn:()=>{if(X.lkDist(pos.x,pos.y)<2)CMD.exec('water.fill',{src:'lake'});else say('Đứng sát hồ/suối để lấy nước')},ok:S.botE>0};
 if(h==='axeT')return{lb:'🪓<br>CHẶT',k:'atk',fn:null,ok:!!S.axe};
 if(h==='pickT')return{lb:'⛏<br>ĐÀO',k:'mine',fn:()=>{const c=SH.cur;if(c&&c.label&&/Đào|đá/.test(c.label))c.fn();else say('⛏ Đứng sát tảng đá hoặc chân núi để đào')},ok:!!S.pick};
 if(x&&!hbCount(x))return{lb:'—',k:'none',fn:()=>say('❌ Hết '+hbName(x)+' – bấm ô khác'),ok:false};
 if(wid())return{lb:'⚔<br>TẤN CÔNG',k:'atk',fn:null,ok:true};
 if(x&&x.t==='k')return{lb:'—',k:'none',fn:()=>say(hbName(x)+' không dùng trực tiếp được'),ok:false};
 return{lb:'👊<br>Đánh',k:'atk',fn:null,ok:true}} // tay không vẫn đấm được
F5.heldAct=heldAct;
const atkB=$('atk');let lastLb='';
if(atkB)atkB.addEventListener('pointerdown',e=>{const a=heldAct();if(a.fn||!a.ok){e.preventDefault();e.stopImmediatePropagation();if(a.ok&&a.fn)a.fn();else if(a.fn)a.fn()}},true);
// thanh hotbar
const hbEl=document.createElement('div');hbEl.id='hotbar';
const hbCss=document.createElement('style');hbCss.textContent='#hotbar{position:fixed;left:50%;bottom:8px;transform:translateX(-50%);z-index:9;display:flex;gap:4px;padding:4px;background:rgba(10,14,28,.55);border:1px solid rgba(255,255,255,.18);border-radius:12px;touch-action:none;user-select:none;-webkit-user-select:none}'+
 '#hotbar .hs{position:relative;width:44px;height:44px;border-radius:9px;background:rgba(30,38,64,.85);border:2px solid rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;color:#fff;font:600 11px system-ui}'+
 '#hotbar .hs.sel{border-color:#ffd24a;box-shadow:0 0 10px rgba(255,210,74,.75)}#hotbar .hs.out{opacity:.45;filter:grayscale(1)}#hotbar .hs.drop{border-color:#5ad0ff}'+
 '#hotbar .hs i{position:absolute;left:3px;top:1px;font-style:normal;font-size:9px;opacity:.7}#hotbar .hs em{position:absolute;right:3px;bottom:1px;font-style:normal;font-size:11px;text-shadow:0 0 3px #000}#hotbar .hs img{pointer-events:none}'+
 '@media (max-width:760px),(max-height:430px){#hotbar .hs{width:38px;height:38px}#hotbar img{width:26px!important;height:26px!important}}'+
 '#hbTip{position:fixed;z-index:61;pointer-events:none;display:none}';
document.head.appendChild(hbCss);document.body.appendChild(hbEl);
let hbSig='';
function hbRender(force){hbNorm();const inv=$('inv')&&$('inv').style.display=='flex';const show=S.on&&!S.dead&&(inv||!S.pz);
 hbEl.style.display=show?'flex':'none';hbEl.style.zIndex=inv?'40':'9';if(!show)return;
 const sig=JSON.stringify([S.hb,S.hbSel,S.hb.map(hbCount),inv]);if(sig===hbSig&&!force)return;hbSig=sig;
 hbEl.innerHTML=S.hb.map((x,i)=>{const n=hbCount(x);return'<div class="hs'+(i===S.hbSel?' sel':'')+(x&&!n?' out':'')+'" data-i="'+i+'"><i>'+(i+1)+'</i>'+hbIcon(x)+(x&&!n?'<em style="color:#ff8a8a">hết</em>':x&&x.t==='k'?'<em>'+n+'</em>':'')+'</div>'}).join('')}
F5.hbRender=hbRender;
// nút hành động tự đổi chữ theo món đang cầm
setInterval(()=>{hbRender();if(!atkB)return;const a=heldAct(),lb=a.lb+(a.ok?'':'');if(lb!==lastLb){lastLb=lb;atkB.innerHTML=lb}atkB.style.opacity=a.ok?'1':'.45'},150);
// thao tác: chạm = chọn · giữ 0,5s = xóa ô · kéo ô sang ô khác = đổi chỗ · kéo ra ngoài = xóa · kéo đồ từ túi vào ô = gán
let drag=null;const tip=document.createElement('div');tip.id='hbTip';document.body.appendChild(tip);
const slotAt=(x,y)=>{const el=document.elementFromPoint(x,y);const s=el&&el.closest&&el.closest('#hotbar .hs');return s?+s.dataset.i:-1};
function dragStart(e,item,from){drag={item,from,x0:e.clientX,y0:e.clientY,moved:false,t0:performance.now(),lp:null};tip.innerHTML=hbIcon(item);
 if(from>=0)drag.lp=setTimeout(()=>{if(drag&&!drag.moved){const f=drag.from;drag=null;tip.style.display='none';hbClear(f)}},550)}
hbEl.addEventListener('pointerdown',e=>{const s=e.target.closest('.hs');if(!s)return;e.preventDefault();e.stopPropagation();const i=+s.dataset.i;dragStart(e,S.hb[i],i)});
hbEl.addEventListener('contextmenu',e=>{e.preventDefault();const s=e.target.closest('.hs');if(s)hbClear(+s.dataset.i)});
const invEl=$('inv');
if(invEl)invEl.addEventListener('pointerdown',e=>{const c=e.target.closest&&e.target.closest('.ic');if(!c||c.classList.contains('e'))return;const m=/selInv\((\d+)\)/.exec(c.getAttribute('onclick')||'');if(!m)return;const cell=X.invCells()[+m[1]];if(cell)dragStart(e,cellToHb(cell),-1)},true);
addEventListener('pointermove',e=>{if(!drag)return;if(!drag.moved&&Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)>8){drag.moved=true;clearTimeout(drag.lp);if(drag.item){tip.style.display='block'}}
 if(drag.moved){tip.style.left=(e.clientX-18)+'px';tip.style.top=(e.clientY-18)+'px';for(const s of hbEl.children)s.classList.toggle('drop',+s.dataset.i===slotAt(e.clientX,e.clientY))}},{passive:true});
addEventListener('pointerup',e=>{if(!drag)return;const d=drag;drag=null;clearTimeout(d.lp);tip.style.display='none';for(const s of hbEl.children)s.classList.remove('drop');
 const to=slotAt(e.clientX,e.clientY);
 if(!d.moved){if(d.from>=0)hbSelect(d.from);return} // chạm
 if(d.from>=0){if(to>=0&&to!==d.from){const a=S.hb[d.from];S.hb[d.from]=S.hb[to];S.hb[to]=a;if(S.hbSel===d.from)S.hbSel=to;else if(S.hbSel===to)S.hbSel=d.from;hbRender(true)}else if(to<0)hbClear(d.from);return}
 if(to>=0&&d.item)hbAssign(d.item,to)});
// nút "Gán vào thanh nhanh" trong bảng chi tiết của túi đồ
F5.hbBtn=x=>x&&(x.k||x.eq)?'<button onclick="F5hbAdd()">📌 Thanh nhanh</button>':'';
globalThis.F5hbAdd=()=>{const c=X.invCells()[X.invSel];if(c)hbAssign(cellToHb(c),-1)};
// phím 1..7 (1–9, 0 nếu sau này tăng HB_N lên 10)
addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='INPUT'||e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key;if(!/^[0-9]$/.test(k))return;const i=k==='0'?9:+k-1;if(i<HB_N){e.preventDefault();hbSelect(i)}});
// đổi vũ khí trong túi (Mặc) → bỏ cầm đồ ăn để nút hành động đổi theo
F5.hbSelect=hbSelect;F5.hbAssign=hbAssign;F5.hbClear=hbClear;F5.hbCount=hbCount;F5.HB_N=HB_N;
// vẽ cửa ở 2D
const draw2Prev=F5.draw2;F5.draw2=(L,Xf,Yf,cx,cy,vw,vh,t,g,Z)=>{draw2Prev(L,Xf,Yf,cx,cy,vw,vh,t,g,Z);for(const d of DOORS){if(d.st==='broken'||Math.abs(d.x-cx)>vw+3||Math.abs(d.y-cy)>vh+3)continue;
 L.push([d.y+.01,()=>{const x=Xf(d.x),y=Yf(d.y),w=d.w*Z;g.save();if(d.st==='closed'){g.fillStyle='#7a4e26';g.fillRect(x-w,y-Z*2.1,w*2,Z*2.1);g.strokeStyle='#3a2414';g.lineWidth=2;g.strokeRect(x-w,y-Z*2.1,w*2,Z*2.1);for(let i=1;i<4;i++){g.beginPath();g.moveTo(x-w+i*w/2,y-Z*2.1);g.lineTo(x-w+i*w/2,y);g.stroke()}g.fillStyle='#d8b24a';g.beginPath();g.arc(x+w*.7,y-Z*1,Z*.08,0,7);g.fill()}
  else{g.fillStyle='#6a4220';g.fillRect(x-w-Z*.12,y-Z*2.1,Z*.24,Z*2.1)}
  if(d.hp<DOOR_MAX&&distM(pos.x,pos.y,d.x,d.y)<6){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(x-w,y-Z*2.4,w*2,Z*.16);g.fillStyle=d.hp>100?'#6fd08c':d.hp>50?'#f2b33a':'#e05a4a';g.fillRect(x-w,y-Z*2.4,w*2*d.hp/DOOR_MAX,Z*.16)}g.restore()}])}};
/* ================= BƯỚC 12: HỆ THỐNG – sự kiện kết thúc 3 ngày bảo vệ tân thủ =================
   - Cuối ngày 3 (từ 20:00, GT ≥ 68) nhân vật HỆ THỐNG xuất hiện 1 lần, game tạm dừng trong lúc nói.
   - Giọng đọc: dùng giọng tiếng Việt có sẵn trên thiết bị (Web Speech API) nếu có; không có thì chỉ hiện phụ đề.
   - Tiến trình hội thoại lưu trong nhân vật (S.sysE) → thoát giữa chừng, vào lại sẽ nói tiếp.
   - Nhật ký Hệ Thống: đọc lại trong menu ☰.
   - Kết thúc bảo vệ, chết vĩnh viễn: dùng đúng cơ chế đã có (theo GT ≥ 72, lưu cùng bản lưu → không tự bật lại). */
const SYSL=[[['Xin chào, người sống sót. Ta là '],['Hệ Thống',2],[', người giám sát thế giới này.']],
 [['Cảnh báo!',1],[' Thời gian bảo vệ tân thủ 3 ngày của ngươi sắp kết thúc.']],
 [['Khi ngày thứ 4 bắt đầu, '],['vòng bảo vệ quanh ngôi nhà của ngươi sẽ hoàn toàn biến mất',1],['. Quái vật có thể tiếp cận và tấn công ngôi nhà.']],
 [['Từ đêm ngày thứ 4, '],['Boss sẽ trở nên mạnh hơn',1],['. Quái vật và Boss tiếp tục '],['tăng 10% máu và sát thương sau mỗi 3 ngày',1],[' sinh tồn.']],
 [['Hệ Thống khuyến cáo ngươi nhanh chóng '],['nâng cấp ngôi nhà lên cấp 2',2],[', chuẩn bị vũ khí, thức ăn và xây dựng công trình phòng thủ.']],
 [['Đặc biệt lưu ý! ',1],['Sau khi thời gian tân thủ kết thúc, '],['cái chết sẽ là vĩnh viễn',1],['. Nếu ngươi chết, cuộc hành trình sinh tồn của ngươi sẽ chấm dứt.']],
 [['Thời gian bảo vệ đang đếm ngược. Hãy chuẩn bị thật tốt. Hệ Thống chúc ngươi sống sót.']]];
const WEATHER_LINES45=[
 [['Cảnh báo thiên tai!',1],[' Sau khi sống sót đủ 7 ngày, mưa bão sẽ kéo dài 3 ngày, từ '],['ngày 8 đến hết ngày 10',1],['.']],
 [['Hệ Thống khuyến cáo ngươi chuẩn bị '],['thức ăn, nước uống và củi',2],['. Hãy tìm nơi trú mưa an toàn trước khi bão tới.']],
 [['Chuẩn bị '],['nước gừng',2],[' để giữ ấm. Chế tạo '],['áo mưa tại bàn chế tạo bằng 6 nhựa và 2 gỗ',2],[', sau đó mặc vào ô Giáp.']],
 [['Dầm mưa liên tục đủ 3 giờ sẽ hạ thân nhiệt.',1],[' Nếu tiếp tục dầm mưa, '],['mỗi 2 giờ tiếp theo giảm thêm 1 ô thân nhiệt',1],['. Các mốc được tính theo giờ trong game.']],
 [['Trú trong nhà hoặc mặc áo mưa',2],[' để ngắt chuỗi dầm mưa. Giữ khô liên tục 1 giờ trong game để hồi phục. Hãy chuẩn bị trước khi thiên tai ập tới.']]];
const SYS_AT=PROT_H-4; // 20:00 ngày 3
const sysTxt=L=>L.map(p=>p[0]).join('');
const sysHtml=(L,n)=>{let o='',k=n==null?1e9:n;for(const p of L){const t=p[0].slice(0,Math.max(0,k));k-=p[0].length;if(!t)break;const e=t.replace(/&/g,'&amp;').replace(/</g,'&lt;');o+=p[1]==1?'<b class="sr">'+e+'</b>':p[1]==2?'<b class="sb">'+e+'</b>':e}return o};
const SYSV={on:true,voice:null,ok:false,u:null};
function sysVoices(){try{const vs=speechSynthesis.getVoices()||[];SYSV.voice=vs.find(v=>/^vi(-|_|$)/i.test(v.lang))||vs.find(v=>/viet/i.test(v.name))||null;SYSV.ok=!!SYSV.voice}catch(e){SYSV.ok=false}}
try{if('speechSynthesis'in window){sysVoices();speechSynthesis.addEventListener('voiceschanged',sysVoices)}}catch(e){}
F5.tts={get voice(){return SYSV.voice},get ok(){return SYSV.ok},get on(){return SYSV.on},refresh:sysVoices}; // BƯỚC 17: phần mở đầu dùng chung giọng đọc này
let SAC=null;function sysBeep(){try{SAC=SAC||new(window.AudioContext||window.webkitAudioContext)();if(SAC.state==='suspended')SAC.resume();const t0=SAC.currentTime;
 [[0,880],[.18,660],[.36,880],[.54,660]].forEach(([d,f])=>{const o=SAC.createOscillator(),g=SAC.createGain();o.type='square';o.frequency.value=f;g.gain.setValueAtTime(0,t0+d);g.gain.linearRampToValueAtTime(.06,t0+d+.02);g.gain.linearRampToValueAtTime(0,t0+d+.15);o.connect(g).connect(SAC.destination);o.start(t0+d);o.stop(t0+d+.17)});
 const o=SAC.createOscillator(),g=SAC.createGain();o.type='sine';o.frequency.setValueAtTime(220,t0+.8);o.frequency.linearRampToValueAtTime(520,t0+1.4);g.gain.setValueAtTime(0,t0+.8);g.gain.linearRampToValueAtTime(.05,t0+.9);g.gain.linearRampToValueAtTime(0,t0+1.5);o.connect(g).connect(SAC.destination);o.start(t0+.8);o.stop(t0+1.55)}catch(e){}}
const SYU=document.createElement('div');SYU.id='sysAI';SYU.innerHTML=`<style>
#sysAI{position:fixed;inset:0;z-index:48;display:none;pointer-events:none;font-family:system-ui,sans-serif}
#sysAI .bx{pointer-events:auto;position:absolute;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translate(-50%,24px) scale(.96);opacity:0;transition:opacity .45s,transform .45s;
 width:min(94vw,660px);box-sizing:border-box;display:flex;gap:14px;padding:14px 16px 12px;border-radius:16px;color:#e4f6ff;
 background:linear-gradient(160deg,rgba(14,30,58,.93),rgba(8,16,36,.95));border:1.5px solid rgba(120,210,255,.85);box-shadow:0 0 26px rgba(90,190,255,.5),inset 0 0 22px rgba(90,190,255,.16)}
#sysAI.on .bx{opacity:1;transform:translate(-50%,0) scale(1)}
#sysAI .av{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:6px}
#sysAI canvas{width:84px;height:84px}
#sysAI .nm{font-size:12px;font-weight:800;letter-spacing:.16em;color:#bfeaff;border:1px solid rgba(120,210,255,.7);border-radius:7px;padding:3px 8px;background:rgba(60,140,220,.18);text-shadow:0 0 6px #6fd0ff}
#sysAI .mn{flex:1;min-width:0;display:flex;flex-direction:column}
#sysAI .tt{font-weight:800;font-size:15px;color:#ff6a6a;text-shadow:0 0 8px rgba(255,60,60,.6);margin-bottom:6px}
#sysAI .tx{font-size:16px;line-height:1.55;min-height:74px}
#sysAI .tx i{display:inline-block;width:7px;height:15px;background:#bff0ff;vertical-align:-2px;margin-left:2px;animation:syb .8s infinite}
#sysAI .sr{color:#ff6262;text-shadow:0 0 6px rgba(255,60,60,.55)}#sysAI .sb{color:#8fe3ff}
#sysAI[data-notice45="weather"] .tx b.sr{display:inline;background:none;border:0;margin:0;padding:0;box-shadow:none;width:auto;min-height:0;line-height:inherit}
#sysAI .ft{display:flex;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap}#sysAI .pg{font-size:11px;opacity:.7;margin-right:auto}
#sysAI button{padding:7px 13px;border-radius:9px;border:1px solid rgba(140,220,255,.8);background:rgba(90,190,255,.2);color:#eafaff;font-weight:700;font-size:13px;cursor:pointer}
#sysAI button.g{background:transparent;border-color:rgba(140,220,255,.4);font-weight:500;color:#b8e6f6}
#sysAI .nv{font-size:11px;opacity:.65;margin-top:4px}
@keyframes syb{50%{opacity:.2}}
#sysLog{position:fixed;inset:0;z-index:49;display:none;align-items:center;justify-content:center;background:rgba(4,8,18,.7);font-family:system-ui,sans-serif}
#sysLog .pn{width:min(94vw,620px);max-height:78vh;overflow:auto;box-sizing:border-box;padding:16px 18px;border-radius:16px;color:#e4f6ff;background:linear-gradient(160deg,rgba(14,30,58,.96),rgba(8,16,36,.97));border:1.5px solid rgba(120,210,255,.85);box-shadow:0 0 26px rgba(90,190,255,.45)}
#sysLog h3{margin:0 0 8px;color:#9fe6ff;letter-spacing:.08em}#sysLog .it{border-top:1px solid rgba(120,210,255,.25);padding:8px 0}#sysLog .it small{opacity:.65}#sysLog p{margin:5px 0;line-height:1.5}
#sysLog .sr{color:#ff6262}#sysLog .sb{color:#8fe3ff}#sysLog button{padding:7px 13px;border-radius:9px;border:1px solid rgba(140,220,255,.8);background:rgba(90,190,255,.2);color:#eafaff;font-weight:700;margin-top:8px;margin-right:6px}
</style><div class="bx"><div class="av"><canvas width="168" height="168"></canvas><div class="nm">HỆ THỐNG</div></div>
<div class="mn"><div class="tt">⚠ Thời gian tân thủ sắp kết thúc!</div><div class="tx"></div><div class="nv"></div>
<div class="ft"><span class="pg"></span><button class="g vo">🔇 Bỏ qua giọng nói</button><button class="g cl">✕ Đóng</button><button class="nx">Tiếp tục ▶</button></div></div></div>`;
document.body.appendChild(SYU);
const sq=s=>SYU.querySelector(s),SAV=sq('canvas'),STX=sq('.tx'),SPG=sq('.pg'),SNV=sq('.nv'),SNX=sq('.nx'),SVO=sq('.vo');
const SY={active:false,i:0,typed:0,t0:0,last:0,speaking:false,raf:0,pz0:false,log:false};
const sysLines=()=>SY.kind==='weather45'?WEATHER_LINES45:SYSL;
const sysSt=(kind=SY.kind)=>{const k=kind==='weather45'?'sysWeather45':'sysE';if(!S[k]||typeof S[k]!='object')S[k]={st:0,i:0};return S[k]};
function sysAvatar(t){const g=SAV.getContext('2d'),W=168,c=W/2,talk=SY.speaking||SY.typed<sysTxt(sysLines()[SY.i]||[[''] ]).length,p=.5+.5*Math.sin(t/(talk?120:600));g.clearRect(0,0,W,W);
 const gr=g.createRadialGradient(c,c,8,c,c,80);gr.addColorStop(0,'rgba(120,210,255,'+(.35+.25*p)+')');gr.addColorStop(1,'rgba(40,120,220,0)');g.fillStyle=gr;g.fillRect(0,0,W,W);
 g.save();g.translate(c,c);for(let k=0;k<2;k++){g.save();g.rotate(t/(k?2600:-1900));g.scale(1,.32);g.strokeStyle='rgba(140,220,255,'+(.55+.3*p)+')';g.lineWidth=2.4;g.beginPath();g.arc(0,0,58+k*10,0,Math.PI*1.7);g.stroke();g.restore()}
 const h=48+3*p,w=30,ry=Math.sin(t/900)*.25;g.rotate(ry*.2);const F=[[0,-h],[w,0],[0,h],[-w,0]];
 const cg=g.createLinearGradient(-w,-h,w,h);cg.addColorStop(0,'#e8fbff');cg.addColorStop(.45,'#6fd0ff');cg.addColorStop(1,'#1f6fd0');g.fillStyle=cg;g.shadowColor='#7fe0ff';g.shadowBlur=18+10*p;
 g.beginPath();F.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fill();g.shadowBlur=0;
 g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.moveTo(0,-h);g.lineTo(w*(.2+ry),0);g.lineTo(0,h*.2);g.closePath();g.fill();g.strokeStyle='rgba(230,250,255,.85)';g.lineWidth=1.4;g.beginPath();g.moveTo(-w,0);g.lineTo(w,0);g.moveTo(0,-h);g.lineTo(0,h);g.stroke();
 g.fillStyle='#fff';g.globalAlpha=.6+.4*p;g.beginPath();g.arc(0,0,4+2*p,0,7);g.fill();g.restore()}
function sysSpeak(){try{speechSynthesis.cancel()}catch(e){}SY.speaking=false;if(!SYSV.on||!SYSV.ok)return;try{const u=new SpeechSynthesisUtterance(sysTxt(sysLines()[SY.i]));u.voice=SYSV.voice;u.lang=SYSV.voice.lang;u.rate=.95;u.pitch=.75;
 u.onboundary=e=>{if(SY.u!==u)return;SY.typed=Math.max(SY.typed,e.charIndex+(e.charLength||1))};u.onend=u.onerror=()=>{if(SY.u!==u)return;SY.speaking=false;SY.typed=1e9};SY.u=u;SY.speaking=true;speechSynthesis.speak(u)}catch(e){SY.speaking=false}}
function sysShowLine(){const st=sysSt();st.i=SY.i;SY.typed=0;SY.t0=performance.now();SPG.textContent='Lời thoại '+(SY.i+1)+'/'+sysLines().length;SNX.textContent=SY.i>=sysLines().length-1?'✔ Xác nhận':'Tiếp tục ▶';sysSpeak()}
function sysLoop(t){if(!SY.active)return;const L=sysLines()[SY.i],n=sysTxt(L).length,dt=Math.min(.1,(t-(SY.last||t))/1000);SY.last=t;
 if(SY.typed<n)SY.typed+=dt*(SY.speaking?13:32);STX.innerHTML=sysHtml(L,Math.floor(SY.typed))+(SY.typed<n?'<i></i>':'');sysAvatar(t);SY.raf=requestAnimationFrame(sysLoop)}
function sysOpen(resume,kind='prot'){if(SY.active)return false;SY.kind=kind;const st=sysSt();st.st=1;SY.i=Math.min(sysLines().length-1,resume?st.i|0:0);SY.active=true;SY.pz0=!!S.pz;S.pz=true;SY.last=0;
 SYU.dataset.notice45=kind==='weather45'?'weather':'';sq('.tt').textContent=kind==='weather45'?'⚠ Cảnh báo thiên tai: Mưa bão!':'⚠ Thời gian tân thủ sắp kết thúc!';SYU.style.display='block';requestAnimationFrame(()=>SYU.classList.add('on'));sysBeep();SNV.textContent=SYSV.ok?'':'ℹ Thiết bị này không có giọng đọc tiếng Việt – Hệ Thống chỉ hiển thị phụ đề.';SVO.style.display=SYSV.ok?'':'none';SVO.textContent=SYSV.on?'🔇 Bỏ qua giọng nói':'🔊 Bật giọng nói';
 sysShowLine();SY.raf=requestAnimationFrame(sysLoop);try{X.SAVE.save('sys',false)}catch(e){}return true}
function sysClose(){if(!SY.active)return;const st=sysSt();st.st=2;st.i=sysLines().length-1;SY.active=false;cancelAnimationFrame(SY.raf);try{speechSynthesis.cancel()}catch(e){}SY.u=null;SY.speaking=false;
 SYU.classList.remove('on');setTimeout(()=>{if(!SY.active)SYU.style.display='none'},450);S.pz=SY.pz0;
 if(SY.kind==='weather45'){try{X.SAVE.save('weather-notice45',false)}catch(e){}return}
 if(!Array.isArray(S.sysLog))S.sysLog=[];if(!S.sysLog.some(e=>e.k==='prot'))S.sysLog.push({k:'prot',GT:+SH.GT.toFixed(2)});
 WORLD.emit('system.warn',{k:'prot'});say('📜 Đã lưu vào Nhật ký Hệ Thống (☰ Menu)');try{X.SAVE.save('sys',false)}catch(e){}}
function sysNext(){if(!SY.active)return;const n=sysTxt(sysLines()[SY.i]).length;if(SY.typed<n){SY.typed=n;try{speechSynthesis.cancel()}catch(e){}SY.u=null;SY.speaking=false;return}
 if(SY.i>=sysLines().length-1)return sysClose();SY.i++;sysShowLine();try{X.SAVE.save('sys',false)}catch(e){}}
SNX.addEventListener('pointerdown',e=>{e.preventDefault();sysNext()});sq('.cl').addEventListener('pointerdown',e=>{e.preventDefault();sysClose()});
SVO.addEventListener('pointerdown',e=>{e.preventDefault();SYSV.on=!SYSV.on;SVO.textContent=SYSV.on?'🔇 Bỏ qua giọng nói':'🔊 Bật giọng nói';if(!SYSV.on){try{speechSynthesis.cancel()}catch(_){}SY.u=null;SY.speaking=false}else sysSpeak()});
addEventListener('keydown',e=>{if(!SY.active)return;e.stopImmediatePropagation();e.preventDefault();const k=(e.key||'').toLowerCase();if(k==='escape')sysClose();else if(k==='enter'||k===' '||k==='e')sysNext()},true);
// kích hoạt: lần đầu vào cuối ngày 3; hoặc nói tiếp nếu lần trước thoát giữa chừng
setInterval(()=>{if(SY.active||!S.on||S.dead||document.body.classList.contains('intro'))return;const st=sysSt('prot');if(st.st===2)return;if($('ov')&&$('ov').style.display==='flex')return;
 if(st.st===1){if(!S.pz)sysOpen(true);return}if(SH.GT>=SYS_AT&&SH.GT<PROT_H&&!S.pz)sysOpen(false)},500);
// Nhật ký Hệ Thống
const SLG=document.createElement('div');SLG.id='sysLog';document.body.appendChild(SLG);
function sysLogOpen(){const L=Array.isArray(S.sysLog)?S.sysLog:[];const two=n=>String(Math.floor(n)).padStart(2,'0');
 SLG.innerHTML='<div class="pn"><h3>🔷 NHẬT KÝ HỆ THỐNG</h3>'+(L.length?L.map(e=>{const d=Math.floor(e.GT/24)+1,h=e.GT%24;return'<div class="it"><small>Ngày '+d+', '+two(h)+':'+two(h%1*60)+' · Cảnh báo kết thúc thời gian tân thủ</small>'+SYSL.map(l=>'<p>'+sysHtml(l)+'</p>').join('')+'</div>'}).join(''):'<p style="opacity:.7">Chưa có thông báo nào.</p>')+
  '<button class="cx">Đóng</button>'+(L.length?'<button class="rp">▶ Nghe lại</button>':'')+'</div>';SLG.style.display='flex';
 SLG.querySelector('.cx').onclick=()=>{SLG.style.display='none'};const rp=SLG.querySelector('.rp');if(rp)rp.onclick=()=>{SLG.style.display='none';const pm=$('pmenu');if(pm)pm.style.display='none';S.pz=false;sysSt('prot').st=1;sysSt('prot').i=0;sysOpen(true)}}
F5.sysLogOpen=sysLogOpen;F5.sysOpen=sysOpen;F5.SYS=SY;
F5.weatherNotice45={open:resume=>sysOpen(!!resume,'weather45'),get state(){if(!S.sysWeather45||typeof S.sysWeather45!=='object')S.sysWeather45={st:0,i:0};return S.sysWeather45},get active(){return SY.active&&SY.kind==='weather45'},text:'⚠️ Cảnh báo ngày 6:\n'+WEATHER_LINES45.map(sysTxt).join('\n')};
{const pm0=$('pmenu');if(pm0)new MutationObserver(()=>{const pm=$('pmenu');if(!pm||pm.style.display!=='flex'||pm.querySelector('.sysLB'))return;const sp=pm.querySelector('.sp')||pm;const b=document.createElement('button');b.className='sysLB';b.textContent='🔷 Nhật ký Hệ Thống';
 b.style.cssText='display:block;margin:8px auto;padding:9px 14px;border-radius:10px;border:1px solid #7fd0ff;background:rgba(60,140,220,.25);color:#e6f8ff;font-weight:700';b.onclick=e=>{e.stopPropagation();sysLogOpen()};sp.appendChild(b)}).observe(pm0,{attributes:true,attributeFilter:['style'],childList:true})}

/* ================= BƯỚC 13: CẢNH QUAN HỒ ÁNH NGUYỆT (asset tách từ ảnh người chơi gửi) =================
   Chỉ thêm/thay hình ảnh trong khu Hồ Ánh Nguyệt; không đổi đường mòn, ranh giới, cơ chế đào đá hay dữ liệu lưu. */
const HOA={sak1:[320,251,6.6],sak2:[260,253,5.2],sak3:[220,248,4.4],sak4:[220,177,4.6],sak5:[210,197,4.0],sakb1:[190,126,2.6],sakb2:[170,107,2.2],petal:[32,25,.22],
 rk1:[150,87,1.5],rk2:[200,146,2.3],rk3:[260,181,3.4],rk4:[260,178,3.3],rk5:[250,159,3.0],bu1:[160,115,1.7],bu2:[160,113,1.7],bu3:[160,110,1.7],bu4:[160,114,1.7],bu5:[160,118,1.7],bu6:[160,117,1.8],
 rd1:[130,120,1.25],rd2:[130,119,1.3],rd3:[130,93,1.1],fl0:[120,71,1.0],fl1:[110,74,.9],fl2:[110,80,.9],fl3:[110,76,.9],fl4:[110,74,.9],lo1:[170,97,2.2],lo2:[170,105,2.2],lo3:[180,93,2.4],lo4:[150,98,1.9],lo5:[110,81,1.3],lo6:[190,113,2.4]};
{const AS=SH.AS,SW=SH.SW;for(const k in HOA){const a=HOA[k],o={u:'ho/'+k+'.webp',w:a[0],h:a[1],tw:a[2],i:new Image()};o.i.src=o.u;AS['h'+k]=o;SW['h'+k]=a[2]}
 const z=document.createElement('canvas');z.width=z.height=2;const o={u:z.toDataURL(),w:2,h:2,tw:.01,i:new Image()};o.i.src=o.u;AS.hgone=o;SW.hgone=.01}
const HO2={dec:[],lotus:[],uw:[],cherry:[],fall:null,casc:[],rocks:[]};SH.HO2=HO2;
(()=>{const H=SH.HOD,Z=SH.ZN.find(z=>z.n=='Hồ Ánh Nguyệt');if(!H||!Z||!H.creek)return;const R0=Z.r,L0=SH.LAKES.find(l=>l.main),cols=SH.cols,hitC=X.hitC,inLk=SH.inLk,pD=(x,y)=>SH.pathD(x,y,6);
 let s=91317;const Rn=()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296},pick=a=>a[(Rn()*a.length)|0];
 const inZ=(x,y,m=1)=>x>R0[0]+m&&x<R0[2]-m&&y>R0[1]+m&&y<R0[3]-m;
 const D=H.dock,nearDock=(x,y,m)=>D&&Math.hypot(x-(D.x+D.ux*D.len/2),y-(D.y+D.uy*D.len/2))<D.len/2+m;
 const clr=(x,y)=>H.clear.some(c=>Math.hypot(x-c.x,y-c.y)<c.r);
 const near=(x,y,r)=>HO2.dec.some(d=>Math.abs(d[1]-x)<r&&Math.abs(d[2]-y)<r&&Math.hypot(d[1]-x,d[2]-y)<r*(d.big?1.6:1));
 const F=SH.V25&&SH.V25.forest;const trNear=(x,y,r)=>SH.trees.some(t=>t.hp>0&&Math.abs(t.x-x)<r&&Math.abs(t.y-y)<r)||(F&&F.trees.some(t=>Math.abs(t.x-x)<r&&Math.abs(t.y-y)<r));
 const ok=(x,y,o,w0=0)=>inZ(x,y)&&pD(x,y)>Math.max(o.p||.7,w0*.55)&&(o.water||!inLk(x,y,o.wm||.15))&&!SH.deepAt(x,y,.3)&&!nearDock(x,y,1.2)&&Math.hypot(x,y-.5)>9.5&&!clr(x,y)&&!hitC(x,y,o.c||.2)&&!near(x,y,o.sp||.75);
 const add=(k,x,y,sc,o={})=>{if(!ok(x,y,o,HOA[k][2]*sc))return false;const d=['h'+k,x,y,HOA[k][2]*sc];if(o.big)d.big=1;HO2.dec.push(d);return true};
 const BU=['bu1','bu1','bu2','bu3','bu4','bu5','bu6'],FL=['fl0','fl1','fl2','fl3','fl4'],RD=['rd1','rd1','rd3','rd2'];
 // 1) đá khai thác trong khu Hồ → 4–5 biến thể mới (giữ toạ độ = giữ trạng thái đào trong bản lưu)
 const RV=[['hrk1',1.5],['hrk2',2.3],['hrk3',3.4],['hrk5',3.0],['hrk4',3.2]];let ri=0;
 for(const r of SH.ROCKS){if(!(r[1]>R0[0]&&r[1]<R0[2]&&r[2]>R0[1]&&r[2]<R0[3]))continue;const w0=r[3],c=cols.find(c=>Math.abs(c.x0-(r[1]-w0*.38))<1e-6&&Math.abs(c.z1-r[2])<1e-6&&Math.abs(c.z0-(r[2]-1.1))<1e-6);
  const v=RV[ri++%RV.length];r[0]=v[0];r[3]=v[1];r.hk=v[0];r.ho=1;if(c){c.x0=r[1]-v[1]*.34;c.x1=r[1]+v[1]*.34;c.z0=r[2]-Math.min(1,v[1]*.27);c.z1=r[2];r.col=c}HO2.rocks.push(r)}
 // 2) thác nước nhiều tầng ở đầu nguồn suối (vách đá phía bắc mạch nước)
 const SP=H.spring,pool=SH.LAKES.find(l=>l.pool),fx=pool?pool.x:SP.x,base=(pool?pool.y-pool.r:SP.y-2.2)+.1;
 HO2.fall={x:fx,y:base,w:5.2,h1:2.7,h2:1.7,cw:13};const fc={x0:fx-6.6,x1:fx+6.6,z0:base-2.6,z1:base-.35,ho2:1};cols.push(fc);SH.colsDirty&&SH.colsDirty();HO2.fall.col=fc;
 // tầng phụ (bậc thác nhỏ) trên lòng suối: chọn đoạn suối chảy gần hướng nam
 const cp=H.creek.pts,cw=H.creek.hw;for(const f of[.28,.56]){let best=-1,bv=0;for(let i=Math.floor(cp.length*f)-6;i<Math.floor(cp.length*f)+6;i++){const a=cp[i-1],b=cp[i+1];if(!a||!b)continue;const dx=b[0]-a[0],dy=b[1]-a[1],v=Math.abs(dy)/(Math.hypot(dx,dy)||1);if(v>bv){bv=v;best=i}}
  if(best>0&&bv>.7&&pD(cp[best][0],cp[best][1])>2)HO2.casc.push({x:cp[best][0],y:cp[best][1],w:cw[best]*2+.5})}
 // 3) cây anh đào điểm nhấn quanh hồ
 for(let k=0,n=0;k<400&&n<7;k++){const a=Rn()*Math.PI*2,o=6+Rn()*12,R=SH.lkR(L0,a)+o,x=L0.x+Math.cos(a)*R,y=L0.y+Math.sin(a)*R;if(Math.abs(a+1.3)<.5)continue;
  const kk=pick(['sak1','sak2','sak3','sak4','sak5','sak2','sak3']);if(pD(x,y)<3||trNear(x,y,2.6)||HO2.cherry.some(c=>Math.hypot(c[1]-x,c[2]-y)<9))continue;
  if(!add(kk,x,y,.9+Rn()*.25,{c:1.3,sp:3,big:1}))continue;const c={x0:x-.38,x1:x+.38,z0:y-.35,z1:y,ho2:1};cols.push(c);HO2.dec[HO2.dec.length-1].col=c;HO2.cherry.push(HO2.dec[HO2.dec.length-1]);n++}
 // 4) bờ hồ: từng cụm cỏ lau / đá rêu / hoa, mật độ không đều
 const shore=(l,step,big)=>{for(let a=Rn();a<Math.PI*2;a+=step*(.5+Rn()*1.4)){if(l.main&&(Math.abs(Math.atan2(Math.sin(a-(Math.PI/2-.35)),Math.cos(a-(Math.PI/2-.35))))<.45||Math.abs(Math.atan2(Math.sin(a+1.3),Math.cos(a+1.3)))<.3))continue;
  const R=SH.lkR(l,a),at=o=>[l.x+Math.cos(a)*(R+o),l.y+Math.sin(a)*(R+o)],t=Rn();
  if(t<.38){for(let j=0,m=1+(Rn()*3|0);j<m;j++){const q=at(-.5+Rn()*.9);add(pick(RD),q[0]+(Rn()-.5)*.8,q[1]+(Rn()-.5)*.5,.75+Rn()*.45,{water:1,sp:.55})}}
  else if(t<.62){const q=at(.15+Rn()*.7);add(Rn()<.6?'rk2':'rk1',q[0],q[1],.45+Rn()*.35,{water:1,sp:.9});if(Rn()<.6){const q2=at(.6+Rn()*.6);add('rk1',q2[0]+.7,q2[1],.3+Rn()*.25,{sp:.5})}}
  else if(t<.85){for(let j=0,m=2+(Rn()*3|0);j<m;j++){const q=at(1+Rn()*1.8);add(pick(FL),q[0]+(Rn()-.5)*1.4,q[1]+(Rn()-.5)*.9,.7+Rn()*.4,{sp:.6})}}
  else if(big){const q=at(2+Rn()*1.5);add(Rn()<.5?'sakb1':pick(BU),q[0],q[1],.8+Rn()*.3,{sp:1.4})}}};
 shore(L0,.32,1);for(const l of SH.LAKES)if(l.t=='w'&&!l.main&&!l.pool&&l.r<9&&inZ(l.x,l.y,0))shore(l,.55,0);
 // 5) hai bờ suối: đất ẩm, đá, cỏ lau, hoa – thành từng cụm
 for(let i=5;i<cp.length-6;){const s0=cp[i],q=cp[i+1],dx=q[0]-s0[0],dy=q[1]-s0[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,sd=Rn()<.5?-1:1,w=cw[i],t=Rn(),P=o=>[s0[0]+nx*sd*(w+o),s0[1]+ny*sd*(w+o)];
  if(t<.35){for(let j=0,m=2+(Rn()*3|0);j<m;j++){const p=P(-.1+Rn()*.6);add(pick(RD),p[0]+(Rn()-.5)*1.2,p[1]+(Rn()-.5)*1.2,.7+Rn()*.4,{water:1,sp:.5})}}
  else if(t<.6){const p=P(.3+Rn()*.8);add(Rn()<.5?'rk2':'rk5',p[0],p[1],.35+Rn()*.3,{water:1,sp:1});const p2=P(.2);add('rk1',p2[0]+(Rn()-.5),p2[1]+(Rn()-.5),.25+Rn()*.2,{water:1,sp:.4})}
  else if(t<.85){for(let j=0,m=2+(Rn()*3|0);j<m;j++){const p=P(1+Rn()*1.6);add(pick(FL),p[0]+(Rn()-.5)*1.5,p[1]+(Rn()-.5)*1.5,.7+Rn()*.4,{sp:.6})}}
  else{const p=P(2+Rn()*1.4);add(pick(BU),p[0],p[1],.75+Rn()*.35,{sp:1.2})}
  i+=3+(Rn()*7|0)}
 for(const r of H.crocks)HO2.dec.push(['hrk1',r[0],r[1]+.15,r[2]*3.2]); // đá giữa dòng suối
 // 6) hai bên đường mòn: bụi rậm, hoa dại, cỏ; sỏi & cỏ thưa ở khúc cua (không chạm mép đường)
 for(const p of H.paths){const P=p.pts;let acc=0,next=4+Rn()*10;for(let i=2;i<P.length-2;i++){acc+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);
   const a=P[i-2],b=P[i+2],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
   const ax=P[i][0]-a[0],ay=P[i][1]-a[1],bx=b[0]-P[i][0],by=b[1]-P[i][1],turn=Math.abs(Math.atan2(ax*by-ay*bx,ax*bx+ay*by));
   if(turn>.35&&Rn()<.35){const sd=(ax*by-ay*bx)>0?-1:1,o=p.w/2+.45+Rn()*.5;add('rk1',P[i][0]+nx*sd*o,P[i][1]+ny*sd*o,.22+Rn()*.18,{p:.35,sp:.5});add('rd3',P[i][0]+nx*sd*(o+.5),P[i][1]+ny*sd*(o+.5)+.2,.55+Rn()*.3,{p:.4,sp:.5})}
   if(acc<next)continue;acc=0;next=9+Rn()*16;const sd=Rn()<.5?-1:1,o=p.w/2+1.1+Rn()*1.6,cx=P[i][0]+nx*sd*o,cy=P[i][1]+ny*sd*o,t=Rn();
   if(t<.3){add(pick(BU),cx,cy,.95+Rn()*.45,{sp:1.3,big:1});if(Rn()<.7)add(pick(FL),cx+(Rn()-.5)*2.2,cy+.6+Rn()*.6,.7+Rn()*.3,{sp:.6})}
   else if(t<.65){for(let j=0,m=2+(Rn()*4|0);j<m;j++)add(pick(FL),cx+(Rn()-.5)*2.6,cy+(Rn()-.5)*1.6,.65+Rn()*.45,{sp:.55})}
   else if(t<.85){add(pick(['rd2','rd3','rd3']),cx,cy,.8+Rn()*.4,{sp:.7});add(pick(FL),cx+(Rn()-.5)*1.6,cy+(Rn()-.5),.7,{sp:.5})}
   else{add(Rn()<.5?'sakb2':pick(BU),cx,cy,.85+Rn()*.3,{sp:1.2});add('rk1',cx+(Rn()<.5?-1:1)*(.9+Rn()*.4),cy+.3,.35+Rn()*.2,{sp:.5})}}}
 // 7) sen thật (ảnh) trên mặt hồ + đá/rong dưới nước vùng nông
 for(let k=0,n=0;k<300&&n<12;k++){const a=Rn()*Math.PI*2;if(Math.abs(a-(Math.PI/2-.35))<.5||Math.abs(a+1.3)<.4)continue;const R=SH.lkR(L0,a)-1.6-Rn()*3,x=L0.x+Math.cos(a)*R,y=L0.y+Math.sin(a)*R;if(HO2.lotus.some(o=>Math.hypot(o[1]-x,o[2]-y)<3.4)||nearDock(x,y,2.5))continue;HO2.lotus.push([pick(['lo1','lo2','lo3','lo4','lo6','lo5']),x,y,(1.7+Rn()*.8)*(n%4==3?.6:1),Rn()*.5-.25]);n++}
 for(const l of SH.LAKES)if(l.t=='w'&&!l.main&&!l.pool&&l.r>=4&&l.r<9&&inZ(l.x,l.y,0)&&Rn()<.8){const a=Rn()*7,R=l.r*.45;HO2.lotus.push([pick(['lo4','lo5','lo1']),l.x+Math.cos(a)*R,l.y+Math.sin(a)*R,1.5+Rn()*.5,0])}
 for(let a=0;a<Math.PI*2;a+=.18+Rn()*.3){const R=SH.lkR(L0,a)-.5-Rn()*2.4;HO2.uw.push([L0.x+Math.cos(a)*R,L0.y+Math.sin(a)*R,.4+Rn()*.8,Rn()<.55?0:1,Rn()*7])}
 for(let i=3;i<cp.length-4;i+=2+(Rn()*3|0)){const o=(Rn()-.5)*cw[i];const q=cp[i+1],dx=q[0]-cp[i][0],dy=q[1]-cp[i][1],l=Math.hypot(dx,dy)||1;HO2.uw.push([cp[i][0]-dy/l*o,cp[i][1]+dx/l*o,.3+Rn()*.4,Rn()<.7?0:1,Math.atan2(dy,dx)])}
 // bỏ bản vẽ cũ (đá/cỏ lau/sen vẽ bằng hình đơn giản) → thay bằng asset ở trên
 H.srocks.length=0;H.reeds.length=0;H.lotus.length=0;H.stones.length=0;
 for(const d of HO2.dec)SH.DEC.push(d);
})();
/* ---- đá khai thác: hiệu ứng va đập + biến mất khi đào hết (hiện lại sau 24 giờ trong game) ---- */
F5.rockGone=(r,gone)=>{if(!r)return;gone=!!gone;const changed=!!r.gone!==gone;r.gone=gone;if(r.ho)r[0]=gone?'hgone':r.hk;if(r.col){if(gone){if(!r.colGone7){r.colOn7=r.col.on;r.colGone7=1}r.col.on=false}else if(r.colGone7){r.col.on=r.colOn7;delete r.colGone7;delete r.colOn7}}if(changed)SH.colsDirty?.()};
/* ---- HUD: ngày sống sót | giờ | nhiệt độ ---- */
const TMP={v:null,t:0};
function tempTarget(){const h=S.h,base=21+6*Math.cos((h-15)/24*Math.PI*2);if(SH.IH())return 22+(base-21)*.3;const z=SH.ZN.find(z=>pos.x>=z.r[0]&&pos.x<=z.r[2]&&pos.y>=z.r[1]&&pos.y<=z.r[3]);
 let t=base+({snow:-14,lava:16,crys:-3,void:-4,water:-1,city:1.5,ruin:.5,farm:.5,glow:-1}[z&&z.dec]||0);const ld=SH.lkDist(pos.x,pos.y);if(ld<14)t-=1.6*(1-ld/14);const f=HO2.fall;if(f){const d=Math.hypot(pos.x-f.x,pos.y-f.y);if(d<32)t-=2.6*(1-d/32)}return t}
{const clk=$('clk');const el=document.createElement('div');el.id='clk2';el.className='hud';el.style.cssText='right:14px;top:10px;font-size:14px;font-weight:700;white-space:nowrap;background:rgba(10,14,24,.55);padding:3px 9px;border-radius:10px';
 if(clk){clk.style.display='none';clk.parentNode.insertBefore(el,clk)}else document.body.appendChild(el);
 setInterval(()=>{const tg=tempTarget(),now=performance.now(),dt=Math.min(2,(now-(TMP.t||now))/1000);TMP.t=now;if(TMP.v==null||!S.on)TMP.v=tg;else TMP.v+=Math.max(-.25*dt,Math.min(.25*dt,tg-TMP.v));
  const h=S.h,two=n=>String(Math.floor(n)).padStart(2,'0'),day=Math.floor(SH.GT/24)+1,c=Math.round(TMP.v),cc=c<=5?'#9fd8ff':c>=32?'#ff9a6a':'#fff';
  el.innerHTML=(h>=18||h<6?'🌙':'☀️')+' Ngày '+day+' <span style="opacity:.5">|</span> '+'<span style="color:'+((h>=18||h<6)?'#ff6868':'inherit')+'">'+two(h)+':'+two(h%1*60)+'</span>'+' <span style="opacity:.5">|</span> <span style="color:'+cc+'">🌡 '+c+'°C</span>'},250)}
F5.temp=()=>TMP.v;
/* ---- 2D: sen (phẳng), đá & rong dưới nước, thác nước + vách đá, bậc thác, cánh hoa rơi ---- */
const PET=[];
{const d2=F5.draw2;F5.draw2=(L,Xf,Yf,cx,cy,vw,vh,t,g,Z)=>{d2(L,Xf,Yf,cx,cy,vw,vh,t,g,Z);if(SH.IH())return;const AS=SH.AS,vis=(x,y,m)=>Math.abs(x-cx)<vw+m&&Math.abs(y-cy)<vh+m,im=k=>{const a=AS[k];return a&&a.i&&a.i.complete&&a.i.naturalWidth?a:null};
 L.push([-9e8,()=>{for(const u of HO2.uw){if(!vis(u[0],u[1],1))continue;const x=Xf(u[0]),y=Yf(u[1]),s=Z*u[2];g.save();g.globalAlpha=.32;if(u[3]){g.strokeStyle='#2f6a3a';g.lineWidth=Math.max(1,Z*.05);g.beginPath();for(let k=0;k<4;k++){g.moveTo(x+(k-1.5)*s*.3,y);g.quadraticCurveTo(x+(k-1.5)*s*.3+Math.sin(t/700+k+u[4])*s*.3,y-s*.5,x+(k-1.5)*s*.35,y-s)}g.stroke()}
   else{g.fillStyle='#5d6f74';for(let k=0;k<4;k++){g.beginPath();g.ellipse(x+Math.cos(u[4]+k*1.7)*s*.5,y+Math.sin(u[4]+k*1.7)*s*.3,s*(.2+k%2*.1),s*.13,0,0,7);g.fill()}}g.restore()}
  for(const q of HO2.lotus){if(!vis(q[1],q[2],2))continue;const a=im('h'+q[0]);if(!a)continue;const w=Z*q[3],h=w*a.h/a.w;g.drawImage(a.i,Xf(q[1])-w/2,Yf(q[2])-h/2,w,h)}}]);
 const f=HO2.fall;if(f&&vis(f.x,f.y-3,14)){const x=Xf(f.x),y=Yf(f.y),W=Z*f.w,Ht=Z*(f.h1+f.h2),T=t/1000,rk=k=>im(k);
  L.push([f.y-3.6,()=>{for(const [k,dx,dy,s] of [['hrk3',-4.6,-2.3,1.25],['hrk4',4.4,-2.4,1.3],['hrk3',0,-2.9,1.5],['hrk5',-2.6,-2.0,1.0],['hrk5',2.8,-2.0,1.0]]){const a=rk(k);if(!a)continue;const w=Z*HOA[k.slice(1)][2]*s,h=w*a.h/a.w;g.drawImage(a.i,x+dx*Z-w/2,y+dy*Z-h+Z*.6,w,h)}
   // nước đổ: 2 tầng, mép gợn, vệt trắng chảy xuống
   const fall=(fx0,fw,top,hh,sp)=>{const gr=g.createLinearGradient(0,top,0,top+hh);gr.addColorStop(0,'rgba(170,230,245,.95)');gr.addColorStop(1,'rgba(225,248,255,.96)');g.fillStyle=gr;g.beginPath();
     for(let i=0;i<=8;i++){const yy=top+hh*i/8;g.lineTo(fx0-fw/2+Math.sin(T*3+i*1.3)*fw*.04,yy)}for(let i=8;i>=0;i--){const yy=top+hh*i/8;g.lineTo(fx0+fw/2+Math.sin(T*2.6+i*1.7)*fw*.04,yy)}g.closePath();g.fill();
     g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=Math.max(1,Z*.06);g.save();g.clip();g.setLineDash([Z*.5,Z*.35]);for(let k=0;k<7;k++){g.lineDashOffset=-(T*sp*Z*2.4+k*13);const xx=fx0-fw/2+fw*(k+.5)/7;g.beginPath();g.moveTo(xx,top);g.lineTo(xx+Math.sin(k)*2,top+hh);g.stroke()}g.restore();g.setLineDash([])};
   fall(x,W*.7,y-Ht-Z*.2,Z*f.h1+Z*.3,1);fall(x,W,y-Z*f.h2,Z*f.h2,1.3);fall(x-W*.78,W*.22,y-Z*f.h2*1.5,Z*f.h2*1.5,1.1);fall(x+W*.8,W*.2,y-Z*f.h2*1.3,Z*f.h2*1.3,1.2);
   for(const [k,dx,dy,s] of [['hrk2',-3.2,-1.7,.9],['hrk2',3.3,-1.6,.85],['hrk1',-1.4,-1.75,.8],['hrk1',1.6,-1.8,.7]]){const a=rk(k);if(!a)continue;const w=Z*HOA[k.slice(1)][2]*s,h=w*a.h/a.w;g.drawImage(a.i,x+dx*Z-w/2,y+dy*Z-h+Z*.45,w,h)}
   for(let k=0;k<9;k++){const u=(T*.5+k/9)%1,a=k*2.4;g.fillStyle='rgba(255,255,255,'+(.55*(1-u))+')';g.beginPath();g.ellipse(x+Math.cos(a)*W*.42,y+Z*.2+Math.sin(a)*Z*.25-u*Z*.6,Z*(.35+u*.5),Z*(.2+u*.25),0,0,7);g.fill()}}])}
 for(const c of HO2.casc)if(vis(c.x,c.y,3))L.push([c.y+.01,()=>{const x=Xf(c.x),y=Yf(c.y),T=t/1000,a=im('hrk1');if(a)for(let k=-1;k<=1;k+=2){const w=Z*.9,h=w*a.h/a.w;g.drawImage(a.i,x+k*Z*c.w*.5-w/2,y-h*.7,w,h)}
   g.fillStyle='rgba(235,250,255,.85)';for(let k=0;k<6;k++){const u=(T*.9+k/6)%1;g.globalAlpha=.9*(1-u);g.beginPath();g.ellipse(x+(k-2.5)/2.5*Z*c.w*.38,y+u*Z*.7,Z*.28,Z*.12,0,0,7);g.fill()}g.globalAlpha=1}]);
 const pa=im('hpetal');if(pa)for(const p of PET)if(vis(p.x,p.y,2))L.push([p.y+5,()=>{const w=Z*.22,h=w*.78;g.save();g.translate(Xf(p.x),Yf(p.y)-p.z*Z);g.rotate(p.r);g.globalAlpha=Math.min(1,p.z*2+.3);g.drawImage(pa.i,-w/2,-h/2,w,h);g.restore()}])}}
// cánh hoa anh đào rơi (ít hạt, chỉ quanh cây gần người chơi)
setInterval(()=>{if(!S.on||S.pz||SH.IH())return;const near=HO2.cherry.filter(c=>Math.abs(c[1]-pos.x)<24&&Math.abs(c[2]-pos.y)<16);
 for(let i=PET.length;i--;){const p=PET[i];p.z-=.035;p.x+=.03+Math.sin(p.r*3)*.02;p.y+=.012;p.r+=.08;if(p.z<=0)PET.splice(i,1)}
 if(near.length&&PET.length<18&&Math.random()<.5){const c=near[(Math.random()*near.length)|0],s=c[3];PET.push({x:c[1]+(Math.random()-.5)*s*.8,y:c[2]+(Math.random()-.5)*1.2,z:1.5+Math.random()*s*.35,r:Math.random()*6})}},50);
F5.petals=PET;

globalThis.F5=SH.F5=F5;})();
