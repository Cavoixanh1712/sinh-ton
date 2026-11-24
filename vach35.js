/* VACH35 (22/11): vẽ lại TẤT CẢ vách đá + thác ở Rừng Suối Mây cho đẹp và đồng bộ một kiểu,
   và vách đá CHẶN người chơi (thay VACH30 – bỏ "leo vách").
   - Không đổi vị trí/kích thước vách, thác, hồ chân thác (địa hình giữ nguyên).
   - Hình vẽ thủ tục ở 32 px/m (gấp đôi mật độ cũ); w15.js đọc tỉ lệ qua canvas.s.
     Vách thường và vách hai bên thác dùng chung một bộ vẽ: mép cỏ trên đỉnh, đá xếp lớp có sáng/tối,
     khe nứt, rêu, dây leo, bóng chân vách. Thác: màn nước liền, gờ nước tràn, vệt sáng, bọt chân thác.
   - Va chạm: bật lại collider mặt vách (w15 dựng sẵn, VACH30 đã tắt); đoạn lấn vào lòng đường được cắt bớt;
     ai (bản lưu cũ) đang đứng trong mặt vách được đẩy ra mép gần nhất. */
(()=>{'use strict';const S=globalThis.SH,W=globalThis.W15;if(!S||!W||!W.CLF)return;
const PXM=32,SC=2,stats={revision:35,faces:0,falls:0,cols:0,trimmed:0,unstuck:0,err:null};
const h32=n=>{n=Math.imul(n^0x9e3779b9,0x85ebca6b);n^=n>>>13;n=Math.imul(n,0xc2b2ae35);n^=n>>>16;return(n>>>0)/4294967296};
const hx=(a,b)=>h32(Math.imul(a|0,73856093)^Math.imul(b|0,19349663));
const hs=s=>{let h=2166136261;s=String(s);for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0};
const sm=(x,seed)=>{const a=Math.floor(x),f=x-a,u=f*f*(3-2*f);return hx(a,seed)*(1-u)+hx(a+1,seed)*u};
const rgb=(c,d,a)=>'rgba('+[0,1,2].map(i=>Math.max(0,Math.min(255,Math.round(c[i]+d)))).join(',')+','+(a==null?1:a)+')';
const ROCK=[[140,132,118],[126,119,108],[148,139,124],[118,113,104],[134,127,112],[122,116,101],[131,128,120]];
const MOSS=['#3f6a2a','#4f7d32','#5f8f3a','#6f9f44'];

/* ---------- bộ vẽ mặt vách: Wm × Hm mét, wx0 = toạ độ thế giới của mép trái (để lưới đá liền giữa các đoạn) ---------- */
function paintRock(Wm,Hm,o){o=o||{};const capM=o.cap==null?.55:o.cap,Wp=Math.max(8,Math.round(Wm*PXM)),Hp=Math.max(16,Math.round(Hm*PXM)),cap=Math.round(capM*PXM),CH=Hp+cap,wx0=o.wx0||0,seed=o.seed||1;
 const cv=document.createElement('canvas');cv.width=Wp;cv.height=CH;cv.s=SC;const g=cv.getContext('2d');
 /* NUITUYET37: o.snow → vách núi tuyết (đá xám lạnh, mép tuyết dày rủ xuống, tuyết đọng gờ, không rêu/dây leo) */
 const SNOW=!!o.snow,RK=SNOW?[[128,133,142],[112,117,126],[140,145,153],[104,108,116],[122,126,134],[96,101,110]]:ROCK;
 const wx=px=>wx0+px/PXM;
 // 1) đường đỉnh: lượn theo toạ độ thế giới; đầu mút bo tròn xuống gần mặt đất
 const top=new Float32Array(Wp+1),R=Math.min(Wp*.42,1.8*PXM);
 for(let x=0;x<=Wp;x++){const w=wx(x);let t=cap+(sm(w*1.1,seed)*.22+sm(w*3.3,seed+7)*.1)*PXM;
  const end=(d)=>{if(d>=R)return 0;const u=1-d/R;return(1-Math.sqrt(Math.max(0,1-u*u)))*Hp*.88};
  if(o.endL)t=Math.max(t,cap+end(x));if(o.endR)t=Math.max(t,cap+end(Wp-x));top[x]=Math.min(t,CH-4)}
 // mép hở (đầu bậc vách chéo): cạnh đá lởm chởm thay cho đường thẳng
 const eg=(y,s)=>(sm(y/PXM*2.6,seed+s)*.75+sm(y/PXM*7,seed+s+5)*.25)*.26*PXM,EL=y=>o.cutL?eg(y,61):0,ER=y=>o.cutR?Wp-eg(y,67):Wp;
 const path=()=>{g.beginPath();g.moveTo(EL(CH),CH);for(let y=CH;y>top[0];y-=3)g.lineTo(EL(y),y);for(let x=0;x<=Wp;x++)g.lineTo(Math.min(Math.max(x,EL(top[x])),ER(top[x])),top[x]);for(let y=top[Wp];y<=CH;y+=3)g.lineTo(ER(y),y);g.lineTo(ER(CH),CH);g.closePath()};
 g.save();path();g.clip();
 // 2) nền khe (tối) + các phiến đá xếp lớp
 g.fillStyle='#34302b';g.fillRect(0,0,Wp,CH);
 // khối đá dạng cột không đều: bề rộng theo toạ độ thế giới (liền giữa các đoạn), mỗi cột chia 1–3 khối, mép xiên, góc vát
 const CW=1.15,i0=Math.floor(wx0/CW)-2,i1=Math.ceil((wx0+Wm)/CW)+2,bx=i=>((i+(hx(i,seed+3)-.5)*.7)*CW-wx0)*PXM;
 const poly=(P,fill)=>{g.beginPath();P.forEach((p,k)=>k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle=fill;g.fill()};
 for(let i=i0;i<=i1;i++){const xa=bx(i)+1.2,xb=bx(i+1)-1.2;if(xb<-4||xa>Wp+4||xb-xa<4)continue;const cw=xb-xa;
  const n=1+((hx(i,seed+5)*2.6)|0),cuts=[cap-8];for(let k=1;k<n;k++)cuts.push(cap+Hp*(k/n+(hx(i,seed+7+k)-.5)*.22));cuts.push(CH+6);
  for(let k=0;k<n;k++){const C=RK[(hx(i,seed+k*13+17)*RK.length)|0],sl=(hx(i,seed+k+31)-.5)*cw*.35,sl2=(hx(i,seed+k+37)-.5)*cw*.35,
    ya=cuts[k]+1.2,yb=cuts[k+1]-1.2,ch=Math.min(7,cw*.22,(yb-ya)*.2),tA=ya-sl/2,tB=ya+sl/2,bA=yb-sl2/2,bB=yb+sl2/2,
    jl=(hx(i,seed+k+41)-.5)*3,jr=(hx(i,seed+k+43)-.5)*3;
   const P=[[xa+ch,tA],[xb-ch,tB],[xb+jr,tB+ch],[xb-jr*.5,(tB+bB)/2],[xb,bB-ch],[xb-ch,bB],[xa+ch,bA],[xa+jl,bA-ch],[xa-jl*.5,(tA+bA)/2],[xa,tA+ch]];
   const dk=-((ya-cap)/Hp)*14,gr=g.createLinearGradient(xa,ya,xb,yb);gr.addColorStop(0,rgb(C,dk+26));gr.addColorStop(.45,rgb(C,dk+4));gr.addColorStop(1,rgb(C,dk-30));poly(P,gr);
   // mặt vát sáng (trên-trái) và mặt khuất tối (phải)
   const fw=Math.min(cw*.3,7);poly([[xb-fw,tB+fw*.4],[xb,tB+ch],[xb-jr*.5,(tB+bB)/2],[xb,bB-ch],[xb-ch,bB],[xb-fw,bB-fw*.3]],'rgba(15,12,10,.28)');
   poly([[xa+ch,tA],[xb-ch,tB],[xb-ch-2,tB+3.5],[xa+ch+1,tA+3.5]],'rgba(255,248,228,.30)');
   poly([[xa,tA+ch],[xa+ch,tA],[xa+ch+3,tA+3],[xa+3,tA+ch+3],[xa+3,bA-ch],[xa+jl,bA-ch]],'rgba(255,248,228,.16)');
   // vân nứt nhỏ trong khối
   if(cw>20&&hx(i,seed+k+51)>.4){g.strokeStyle='rgba(30,25,20,.45)';g.lineWidth=1.1;let x=xa+cw*(.25+hx(i,seed+k+53)*.5),yy=ya+4;g.beginPath();g.moveTo(x,yy);const L=(yb-ya)*(.3+hx(i,seed+k+57)*.5);for(let s=0;s<4;s++){x+=(hx(i,seed+k*5+s+61)-.5)*6;yy+=L/4;g.lineTo(x,yy)}g.stroke()}}}
 // 3) hạt li ti
 const N=Math.round(Wp*CH/45);for(let k=0;k<N;k++){const a=hx(k,seed+101),b=hx(k,seed+103),l=hx(k,seed+107)>.5;g.fillStyle=l?'rgba(255,250,235,.13)':'rgba(15,12,10,.16)';g.fillRect(Math.floor(a*Wp),Math.floor(cap+b*Hp),1+(k%3==0),1)}
 // 4) khe nứt dọc
 const nc=Math.max(1,Math.round(Wm*.45));for(let k=0;k<nc;k++){let x=hx(k,seed+201)*Wp,yy=cap+(.15+hx(k,seed+203)*.4)*Hp;const L=(.25+hx(k,seed+205)*.45)*Hp;
  g.lineWidth=1.6;g.strokeStyle='rgba(28,24,20,.75)';g.beginPath();g.moveTo(x,yy);const pts=[[x,yy]];for(let s=0;s<6;s++){x+=(hx(k,s+seed+300)-.5)*7;yy+=L/6;pts.push([x,yy]);g.lineTo(x,yy)}g.stroke();
  g.lineWidth=1;g.strokeStyle='rgba(255,245,225,.16)';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0]+1.5,p[1]):g.moveTo(p[0]+1.5,p[1]));g.stroke()}
 // 5) đổ bóng: tối dần xuống chân + bóng dưới mép cỏ
 {const gr=g.createLinearGradient(0,cap,0,CH);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.6,'rgba(18,14,10,.12)');gr.addColorStop(1,'rgba(18,14,10,.42)');g.fillStyle=gr;g.fillRect(0,0,Wp,CH)}
 for(let x=0;x<Wp;x+=2){const t=top[x],gr=g.createLinearGradient(0,t,0,t+.45*PXM);gr.addColorStop(0,'rgba(10,8,6,.45)');gr.addColorStop(1,'rgba(10,8,6,0)');g.fillStyle=gr;g.fillRect(x,t,2,.45*PXM)}
 // mặt bên khuất bóng ở mép hở
 for(const[on,sx,d]of[[o.cutL,0,1],[o.cutR,Wp,-1]]){if(!on)continue;const w=.4*PXM,gr=g.createLinearGradient(sx,0,sx+d*w,0);gr.addColorStop(0,'rgba(12,10,8,.55)');gr.addColorStop(1,'rgba(12,10,8,0)');g.fillStyle=gr;g.fillRect(d>0?0:Wp-w,0,w,CH)}
 // 6) rêu: đốm rêu lấm tấm gần đỉnh (cụm chấm nhỏ, không phải mảng tròn) + rêu rủ
 if(SNOW){/* tuyết đọng trên gờ đá + vệt tuyết rủ từ mép */const ns=Math.round(Wm*2.4);for(let k=0;k<ns;k++){const x=hx(k,seed+451)*Wp,yy=cap+Math.pow(hx(k,seed+453),1.3)*Hp*.8,rw=(.12+hx(k,seed+455)*.3)*PXM;g.fillStyle='rgba(236,242,250,.9)';g.beginPath();g.ellipse(x,yy,rw,rw*.28,0,Math.PI,0);g.fill();g.fillStyle='rgba(150,170,195,.35)';g.fillRect(Math.round(x-rw*.8),Math.round(yy),Math.round(rw*1.6),1)}
  for(let x=0;x<Wp;x++){const n=sm(wx(x)*4,seed+9),d=(.12+n*.3+(sm(wx(x)*1.3,seed+13)>.62?.3+n*.5:0))*PXM;const gr=g.createLinearGradient(0,top[x],0,top[x]+d);gr.addColorStop(0,'#f4f8fd');gr.addColorStop(.75,'#dfe8f3');gr.addColorStop(1,'rgba(200,214,232,0)');g.fillStyle=gr;g.fillRect(x,top[x],1,d)}}
 const nm=SNOW?0:Math.round(Wm*1.3);for(let k=0;k<nm;k++){const x=hx(k,seed+401)*Wp,t=top[Math.min(Wp,Math.max(0,Math.round(x)))],yy=t+4+Math.pow(hx(k,seed+403),1.8)*Hp*.5,rw=(.1+hx(k,seed+405)*.2)*PXM;
  for(let q=0;q<14;q++){const a=hx(k*17+q,seed+409)*6.283,d=Math.sqrt(hx(k*17+q,seed+411))*rw;g.fillStyle=MOSS[(k+q)%4];g.globalAlpha=.5+hx(k*17+q,seed+413)*.4;g.fillRect(Math.round(x+Math.cos(a)*d),Math.round(yy+Math.sin(a)*d*.55),2,2)}g.globalAlpha=1}
 if(!SNOW)for(let x=0;x<Wp;x++){const n=sm(wx(x)*5,seed+9),d=(.08+n*.22+(sm(wx(x)*1.7,seed+13)>.68?.25+n*.4:0))*PXM;g.fillStyle='#3d6828';g.fillRect(x,top[x],1,d);g.fillStyle='#5a8a35';g.fillRect(x,top[x],1,d*.55)}
 // 7) dây leo
 const nv=SNOW?0:Math.max(1,Math.round(Wm/2.4));for(let k=0;k<nv;k++){const x0=Math.round((k+.15+hx(k,seed+501)*.7)*Wp/nv),L=Hp*(.2+hx(k,seed+503)*.5),t=top[Math.min(Wp,x0)];
  for(let yy=0;yy<L;yy+=1){const x=x0+Math.sin((yy+k*9)/9)*2.2;g.fillStyle='#355e24';g.fillRect(Math.round(x),Math.round(t+yy),2,1);if(yy%7===0){g.fillStyle=(yy/7)&1?'#6fa443':'#89bd52';g.beginPath();g.ellipse(x+((yy/7)&1?3:-2),t+yy,3,1.8,(yy/7)&1?.5:-.5,0,7);g.fill()}}}
 g.restore();
 // 8) mép cỏ trên đỉnh (nhô ra ngoài đường đỉnh) + cỏ ở chân vách
 if(SNOW){/* mép tuyết dày, gợn, hơi nhô ra ngoài */for(let x=0;x<Wp;x++){const t=top[x],th=(.1+sm(wx(x)*3,seed+19)*.16)*PXM;g.fillStyle='#c9d6e6';g.fillRect(x,t-th,1,th+4);g.fillStyle='#f6f9fd';g.fillRect(x,t-th,1,th+1);if(sm(wx(x)*11,seed+17)>.7){g.fillStyle='#ffffff';g.fillRect(x,t-th,1,2)}}}
 else for(let x=0;x<Wp;x++){const t=top[x];g.fillStyle='#4b7a2e';g.fillRect(x,t-3,1,6);g.fillStyle='#6da040';g.fillRect(x,t-3,1,3);if(sm(wx(x)*9,seed+17)>.6){g.fillStyle='#9ccc5c';g.fillRect(x,t-3,1,1)}}
 if(!SNOW)for(let x=1;x<Wp-1;x+=2){const n=hx(Math.round(wx(x)*16),seed+21);if(n<.35)continue;const h=(.08+n*.32)*PXM,lean=(hx(Math.round(wx(x)*16),seed+23)-.5)*6,t=top[x];g.strokeStyle=n>.7?'#8cc252':n>.5?'#6fa443':'#4f8434';g.lineWidth=1.3;g.beginPath();g.moveTo(x,t);g.quadraticCurveTo(x+lean*.3,t-h*.6,x+lean,t-h);g.stroke()}
 if(o.foot!==false){const sg=g.createLinearGradient(0,CH-.35*PXM,0,CH);sg.addColorStop(0,'rgba(20,16,12,0)');sg.addColorStop(1,'rgba(20,16,12,.5)');g.save();path();g.clip();g.fillStyle=sg;g.fillRect(0,CH-.35*PXM,Wp,.35*PXM);g.restore();
  if(SNOW){/* ụ tuyết dồn chân vách */for(let k=0;k<Math.round(Wm*1.6);k++){const x=hx(k,seed+651)*Wp,rw=(.3+hx(k,seed+653)*.6)*PXM,rh=rw*(.25+hx(k,seed+655)*.2);g.fillStyle='rgba(232,239,248,.95)';g.beginPath();g.ellipse(x,CH,rw,rh,0,Math.PI,0);g.fill();g.fillStyle='rgba(170,188,212,.5)';g.beginPath();g.ellipse(x+rw*.15,CH,rw*.8,rh*.4,0,Math.PI,0);g.fill()}}
  const nt=SNOW?0:Math.round(Wm*3);for(let k=0;k<nt;k++){const x=hx(k,seed+601)*Wp,h=(.12+hx(k,seed+603)*.3)*PXM,lean=(hx(k,seed+605)-.5)*8;if(top[Math.min(Wp,Math.max(0,Math.round(x)))]>CH-h)continue;
   for(let b=0;b<4;b++){g.strokeStyle=(k+b)%3?'#4d8a33':'#72ad46';g.lineWidth=1.2;g.beginPath();g.moveTo(x+b*1.5,CH);g.quadraticCurveTo(x+b*1.5+lean*.4,CH-h*.6,x+b*1.5+lean+(b-1.5)*2.5,CH-h*(.75+b*.08));g.stroke()}}
  const np=Math.round(Wm*1.2);for(let k=0;k<np;k++){const x=hx(k,seed+701)*Wp,rw=(.05+hx(k,seed+703)*.09)*PXM,C=RK[k%RK.length];if(top[Math.min(Wp,Math.max(0,Math.round(x)))]>CH-rw*2)continue;g.fillStyle='rgba(20,16,12,.4)';g.beginPath();g.ellipse(x+1,CH-rw*.4,rw*1.1,rw*.5,0,0,7);g.fill();g.fillStyle=rgb(C,-8);g.beginPath();g.ellipse(x,CH-rw*.7,rw,rw*.7,0,0,7);g.fill();g.fillStyle=rgb(C,24);g.fillRect(Math.round(x-rw*.4),Math.round(CH-rw*1.1),Math.max(1,Math.round(rw*.6)),1)}}
 return cv}

/* ---------- vách hai bên thác (bên trái; w15 tự lật gương cho bên phải) ---------- */
function side(f){try{const Hm=f.t=='multi'?f.Hv*.85:f.Hv,xl=f.x-f.W/2-f.side,xr=f.x+f.W/2+f.side;
 // đầu ngoài nối tiếp một đoạn vách cùng hàng → không bo tròn (tránh khe lõm chỗ nối)
 const joined=W.CLF.some(o=>!o.wall&&Math.abs(o.yb-f.base)<1&&((o.x1>=xl-.9&&o.x0<xl)||(o.x0<=xr+.9&&o.x1>xr)));
 const c=paintRock(f.side,Hm,{wx0:xl,seed:hs('fs'+f.id),endL:!joined});stats.falls++;return c}catch(e){stats.err=String(e&&e.message||e);console.error('[VACH35] side',e);return null}}

/* ---------- thác: hai cột đá + màn nước ---------- */
function fall(f){try{if(f.t=='multi')return null;const Hp=Math.round(f.Hv*PXM),Wp=Math.round(f.W*PXM),sw=Math.round(2.6*PXM),CW=Wp+2*sw;
 const c=document.createElement('canvas');c.width=CW;c.height=Hp;c.s=SC;const g=c.getContext('2d'),seed=hs('fw'+f.id);
 const rl=paintRock(2.6,f.Hv,{wx0:f.x-f.W/2-2.6,seed:hs('fs'+f.id)+3,cap:0,foot:false}),rr=paintRock(2.6,f.Hv,{wx0:f.x+f.W/2,seed:hs('fs'+f.id)+5,cap:0,foot:false});
 // chỉ giữ viền đá ướt hẹp sát mép nước (mép ngoài lởm chởm); phần còn lại do vách bên thác phủ tới (c.ov)
 const rim=Math.round(.5*PXM),jag=y=>(sm(y/PXM*3,seed+71)*.6+.2)*rim*.6;
 for(const[img,x0,d]of[[rl,sw-rim,-1],[rr,sw+Wp,1]]){g.save();g.beginPath();if(d<0){g.moveTo(sw,0);for(let y=0;y<=Hp;y+=3)g.lineTo(x0+jag(y),y);g.lineTo(sw,Hp)}else{g.moveTo(x0,0);for(let y=0;y<=Hp;y+=3)g.lineTo(x0+rim-jag(y+40),y);g.lineTo(x0,Hp)}g.closePath();g.clip();g.drawImage(img,d<0?0:sw+Wp,0,sw,Hp);g.restore()}
 // mép đá ướt cạnh nước
 for(const[x,d]of[[sw,-1],[sw+Wp,1]]){const gr=g.createLinearGradient(x,0,x+d*10,0);gr.addColorStop(0,'rgba(10,30,50,.55)');gr.addColorStop(1,'rgba(10,30,50,0)');g.fillStyle=gr;g.fillRect(d<0?x-10:x,0,10,Hp)}
 // màn nước: mép hai bên hơi lượn, gờ tràn phía trên
 const ed=y=>(sm(y/PXM*2.2,seed)-.5)*5;const lipH=Math.round(.32*PXM);
 g.save();g.beginPath();g.moveTo(sw-2+ed(0),0);for(let y=0;y<=Hp;y+=4)g.lineTo(sw-3+ed(y),y);for(let y=Hp;y>=0;y-=4)g.lineTo(sw+Wp+3-ed(y+50),y);g.closePath();g.clip();
 const gr=g.createLinearGradient(0,0,0,Hp);gr.addColorStop(0,'#d6f5ff');gr.addColorStop(.1,'#93d6f6');gr.addColorStop(.45,'#4fa9e0');gr.addColorStop(.82,'#3a8fd0');gr.addColorStop(1,'#cfeefc');g.fillStyle=gr;g.fillRect(0,0,CW,Hp);
 // vệt sáng/tối chảy dọc
 const ns=Math.round(Wp/2.2);for(let k=0;k<ns;k++){const x=sw+hx(k,seed+11)*Wp,y0=lipH*.6+hx(k,seed+13)*Hp*.7,L=(.5+hx(k,seed+17)*2)*PXM,lw=1+((hx(k,seed+19)*3)|0),lt=hx(k,seed+23)>.32;
  const sg=g.createLinearGradient(0,y0,0,y0+L);const a=lt?.35+hx(k,seed+29)*.45:.22;const col=lt?'235,250,255':'22,88,150';sg.addColorStop(0,'rgba('+col+',0)');sg.addColorStop(.3,'rgba('+col+','+a+')');sg.addColorStop(1,'rgba('+col+',0)');g.fillStyle=sg;g.fillRect(Math.round(x),y0,lw,L)}
 // gờ nước tràn (cong, sáng)
 {const lg=g.createLinearGradient(0,0,0,lipH*1.6);lg.addColorStop(0,'rgba(255,255,255,.95)');lg.addColorStop(.5,'rgba(200,240,255,.7)');lg.addColorStop(1,'rgba(200,240,255,0)');g.fillStyle=lg;g.beginPath();g.moveTo(sw-4,0);g.lineTo(sw+Wp+4,0);g.lineTo(sw+Wp+4,lipH*.6);g.quadraticCurveTo(sw+Wp/2,lipH*1.7,sw-4,lipH*.6);g.closePath();g.fill()}
 // bọt chân thác
 {const fh=Math.min(Hp*.35,.8*PXM),fg=g.createLinearGradient(0,Hp-fh,0,Hp);fg.addColorStop(0,'rgba(255,255,255,0)');fg.addColorStop(.6,'rgba(240,250,255,.65)');fg.addColorStop(1,'rgba(255,255,255,.95)');g.fillStyle=fg;g.fillRect(0,Hp-fh,CW,fh);
  const nb=Math.round(Wp/3);for(let k=0;k<nb;k++){const x=sw+hx(k,seed+41)*Wp,y=Hp-hx(k,seed+43)*fh,rb=1.5+hx(k,seed+47)*4;g.fillStyle='rgba(255,255,255,'+(.5+hx(k,seed+53)*.45)+')';g.beginPath();g.arc(x,y,rb,0,7);g.fill()}}
 g.restore();
 // tia nước bắn ở hai mép
 g.fillStyle='rgba(235,250,255,.75)';for(let k=0;k<Math.round(Hp/6);k++){for(const x of[sw-2,sw+Wp+2]){const y=hx(k,seed+61+x)*Hp;g.fillRect(Math.round(x+(hx(k,seed+67+x)-.5)*6),Math.round(y),2,2)}}
 c.wx0=sw;c.wx1=sw+Wp;c.ov=(sw-rim+2)/sw;stats.falls++;return c}catch(e){stats.err=String(e&&e.message||e);console.error('[VACH35] fall',e);return null}}

globalThis.VACH35={stats,fall,side,paintRock};

/* ---------- vẽ lại mọi mặt vách (bỏ hình cũ & thẻ 2.5D đã dựng) ---------- */
try{W.artReset&&W.artReset();
 // đầu đoạn không nối với đoạn cùng hàng: đầu mút cả dải → bo tròn; đầu bậc (còn đoạn khác hàng kề bên) → cạnh đá lởm chởm
 const FS=(W.FALLS||[]).flatMap(f=>[{x0:f.x-f.W/2-f.side,x1:f.x-f.W/2,yb:f.base},{x0:f.x+f.W/2,x1:f.x+f.W/2+f.side,yb:f.base}]);
 const nb=c=>{let L=0,R=0;for(const o of FS){if(Math.abs(o.yb-c.yb)>1)continue;if(o.x1>=c.x0-.9&&o.x0<c.x0)L=2;if(o.x0<=c.x1+.9&&o.x1>c.x1)R=2}
  for(const o of W.CLF){if(o===c||o.wall||o.n!==c.n)continue;const same=Math.abs(o.yb-c.yb)<.6;if(o.x1>=c.x0-.9&&o.x0<c.x0)L=Math.max(L,same?2:1);if(o.x0<=c.x1+.9&&o.x1>c.x1)R=Math.max(R,same?2:1)}return[L,R]};
 for(const c of W.CLF){if(c.wall)continue;const[L,R]=nb(c);c.cv=paintRock(c.x1-c.x0,c.H,{wx0:c.x0,seed:hs(c.n),endL:!L,endR:!R,cutL:L===1,cutR:R===1});c.r35=1;stats.faces++}}
catch(e){stats.err=String(e&&e.message||e);console.error('[VACH35]',e)}

/* ---------- va chạm: mặt vách chặn người chơi ---------- */
function enforce(){const roads=(W.V2&&W.V2.roads)||[];let changed=false;
 for(const c of W.CLF){if(c.wall)continue;let col=c.col;if(!col)col=c.col={x0:c.x0,x1:c.x1,z0:c.yb-c.H,z1:c.yb-.3,w15c:1};
  if(!col.v35){col.v35=1;col.x0=c.x0;col.x1=c.x1;col.on=true;delete col.r30;
   // không chặn lòng đường: cắt đoạn collider lấn vào đường (vd. sát Dốc T2)
   for(const r of roads){const P=r.p,hw=(r.w||4)/2+.35;if(!P)continue;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let s=0;s<=L;s+=.25){const x=a[0]+(b[0]-a[0])*s/L,y=a[1]+(b[1]-a[1])*s/L;
    if(y<col.z0-.35||y>col.z1+.35||x<col.x0-hw||x>col.x1+hw)continue;const mid=(col.x0+col.x1)/2;if(x>=mid)col.x1=Math.min(col.x1,x-hw);else col.x0=Math.max(col.x0,x+hw);col.trim35=1}}}
   if(col.trim35)stats.trimmed++;if(col.x1-col.x0<.3)col.on=false;changed=true}
  if(col.on!==false&&!S.cols.includes(col)){S.cols.push(col);changed=true}}
 stats.cols=W.CLF.filter(c=>!c.wall&&c.col&&c.col.on!==false).length;
 if(changed){try{S.colsDirty()}catch(_){}try{W.invalidateCols&&W.invalidateCols()}catch(_){}}}
enforce();
/* người chơi đang ở trong mặt vách (bản lưu cũ khi còn leo vách) → ra mép gần nhất còn trống */
function unstick(){try{const st=S.S,p=S.pos;if(!st||!st.on||st.dead)return;for(const c of W.CLF){const col=c.col;if(c.wall||!col||col.on===false)continue;if(!(p.x>col.x0&&p.x<col.x1&&p.y>col.z0&&p.y<col.z1))continue;
  const C=[[p.x,col.z1+.5],[p.x,col.z0-.5],[col.x0-.5,p.y],[col.x1+.5,p.y]].sort((a,b)=>Math.hypot(a[0]-p.x,a[1]-p.y)-Math.hypot(b[0]-p.x,b[1]-p.y));
  for(let d=0;d<6;d+=.5)for(const q of C){const y=q[1]+(q[1]>p.y?d:q[1]<p.y?-d:0);if(!W.colHit(q[0],y,.4)){p.x=q[0];p.y=y;stats.unstuck++;S.say&&S.say('⛰️ Vách đá không đi xuyên được – bạn được đưa ra mép vách');return}}}}catch(e){}}
setInterval(()=>{enforce();unstick()},1000);
console.info('[VACH35] vách',stats.faces,'· va chạm',stats.cols,'· cắt lấn đường',stats.trimmed);
})();
