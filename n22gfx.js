/* =====================================================================
   N22GFX — ĐỒ HỌA NHÀ 2D CẤP 1–5 DỰNG BẰNG CANVAS (CHỈ BẢN TEST V2)
   Không dùng ảnh mẫu: tường, mái, cửa, cửa sổ, chi tiết đều vẽ bằng lệnh canvas.
   Một bộ dựng chung cho mọi căn cứ (Nhà Gỗ, 5 nhà bot, 10 căn cứ sau này):
   facade(cấp, biến thể màu, rộng nhà, sâu nhà) → canvas, cache theo khoá.
   Toạ độ vẽ theo MÉT: gốc = giữa đáy ảnh (= mép trước nhà + 0,3 m), trục y hướng lên.
   Ảnh rộng đúng (rộng nhà × 1,06) như cách game vẽ sprite nhà → cửa vẽ ở x = 0 trùng cửa gameplay.
   ===================================================================== */
(function(){
const PPM=56;// điểm ảnh / mét trong ảnh dựng sẵn
const PAL=[// biến thể màu (khác màu nhỏ giữa các căn cứ, cùng cấu trúc)
 {wood:[118,84,52],woodOld:[112,100,86],roof:[150,92,58],metal:[128,146,168],trim:[86,58,34],banner:[176,40,36],accent:[240,190,90]},
 {wood:[128,90,56],woodOld:[118,104,88],roof:[120,84,60],metal:[136,150,160],trim:[90,62,40],banner:[40,90,160],accent:[236,200,110]},
 {wood:[110,80,54],woodOld:[106,98,90],roof:[142,104,66],metal:[118,138,150],trim:[80,56,36],banner:[44,120,70],accent:[244,186,80]},
 {wood:[124,88,60],woodOld:[116,102,92],roof:[132,78,70],metal:[140,140,156],trim:[92,60,44],banner:[150,60,140],accent:[238,196,96]}];
const rgb=(c,k=1,a=1)=>'rgba('+Math.round(Math.min(255,c[0]*k))+','+Math.round(Math.min(255,c[1]*k))+','+Math.round(Math.min(255,c[2]*k))+','+a+')';
function rng(s){let a=s|0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

function facade(lv,vi,hw,hd){
 const P=PAL[vi%PAL.length],R=rng(lv*7919+vi*104729+Math.round(hw*100));
 const Wc=hw*1.06,W=hw,top=[0,7.6,9.2,10.4,11.8,12.4][lv]+Math.max(0,hd-[0,6.4,7,7.6,8.2,8.8][lv])*.6;
 const cv=document.createElement('canvas');cv.width=Math.ceil(Wc*PPM);cv.height=Math.ceil(top*PPM);const g=cv.getContext('2d');
 const X=x=>(x+Wc/2)*PPM,Y=y=>cv.height-y*PPM,S=v=>v*PPM;
 const rect=(x0,y0,x1,y1,c)=>{g.fillStyle=c;g.fillRect(X(x0),Y(y1),S(x1-x0),S(y1-y0))};
 const line=(x0,y0,x1,y1,c,w)=>{g.strokeStyle=c;g.lineWidth=S(w);g.beginPath();g.moveTo(X(x0),Y(y0));g.lineTo(X(x1),Y(y1));g.stroke()};
 const poly=(pts,c)=>{g.fillStyle=c;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.closePath();g.fill()};
 const clip=(pts,fn)=>{g.save();g.beginPath();pts.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.closePath();g.clip();fn();g.restore()};
 const vgrad=(x0,y0,x1,y1,c0,c1)=>{const gr=g.createLinearGradient(0,Y(y1),0,Y(y0));gr.addColorStop(0,c0);gr.addColorStop(1,c1);g.fillStyle=gr;g.fillRect(X(x0),Y(y1),S(x1-x0),S(y1-y0))};
 const glow=(x,y,r,c,a)=>{const gr=g.createRadialGradient(X(x),Y(y),0,X(x),Y(y),S(r));gr.addColorStop(0,'rgba('+c+','+a+')');gr.addColorStop(1,'rgba('+c+',0)');g.fillStyle=gr;g.fillRect(X(x-r),Y(y+r),S(2*r),S(2*r))};
 const shade=(x0,y0,x1,y1,a)=>{const gr=g.createLinearGradient(X(x0),0,X(x1),0);gr.addColorStop(0,'rgba(0,0,0,'+a+')');gr.addColorStop(.18,'rgba(0,0,0,0)');gr.addColorStop(.82,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,'+a+')');g.fillStyle=gr;g.fillRect(X(x0),Y(y1),S(x1-x0),S(y1-y0))};
 /* ---- vật liệu ---- */
 function planksV(x0,y0,x1,y1,c,pw,old){rect(x0,y0,x1,y1,rgb(c,.55));for(let x=x0;x<x1-.01;x+=pw){const k=.85+R()*.3,xe=Math.min(x1,x+pw);const dy=old&&R()<.25?R()*.25:0;rect(x+.02,y0,xe-.02,y1-dy,rgb(c,k));
   for(let j=0;j<3;j++){const gx=x+.06+R()*(pw-.12);line(gx,y0+R()*.4,gx+(R()-.5)*.05,y1-R()*.6,rgb(c,k*.8,.6),.012)}
   if(old&&R()<.3){const ky=y0+.4+R()*(y1-y0-.8);g.fillStyle=rgb(c,.5,.7);g.beginPath();g.ellipse(X(x+pw/2),Y(ky),S(.05),S(.08),0,0,7);g.fill()}
   for(const ny of[y0+.25,y1-.25]){g.fillStyle='rgba(40,30,24,.8)';g.fillRect(X(x+pw/2)-1.5,Y(ny)-1.5,3,3)}}}
 function planksH(x0,y0,x1,y1,c,ph){rect(x0,y0,x1,y1,rgb(c,.5));let row=0;for(let y=y0;y<y1-.01;y+=ph,row++){const ye=Math.min(y1,y+ph);let x=x0-(row%2)*1.1;while(x<x1){const L=1.6+R()*1.4,xe=Math.min(x1,x+L),xs=Math.max(x0,x);if(xe>xs+.05){const k=.86+R()*.26;rect(xs,y+.025,xe-.03,ye-.01,rgb(c,k));line(xs,ye-.03,xe-.03,ye-.03,rgb(c,k*1.15,.6),.02);line(xs+.1,y+ph*.45,xe-.2,y+ph*.5,rgb(c,k*.82,.5),.01)}x+=L}}}
 function stones(x0,y0,x1,y1,c,bh){rect(x0,y0,x1,y1,rgb(c,.45));let row=0;for(let y=y0;y<y1-.01;y+=bh,row++){const ye=Math.min(y1,y+bh);let x=x0-(row%2)*.35;while(x<x1){const L=.55+R()*.35,xs=Math.max(x0,x),xe=Math.min(x1,x+L);if(xe>xs+.04){const k=.82+R()*.32;rect(xs+.025,y+.025,xe-.025,ye-.025,rgb(c,k));rect(xs+.025,ye-.08,xe-.025,ye-.025,rgb(c,k*1.18));rect(xs+.025,y+.025,xe-.025,y+.06,rgb(c,k*.7))}x+=L}}}
 function concrete(x0,y0,x1,y1,c,pw){vgrad(x0,y0,x1,y1,rgb(c,1.05),rgb(c,.86));for(let x=x0+pw;x<x1-.05;x+=pw)line(x,y0,x,y1,'rgba(30,30,34,.55)',.03);
   for(let y=y0+1.4;y<y1-.1;y+=1.4)line(x0,y,x1,y,'rgba(30,30,34,.4)',.025);
   for(let i=0;i<(x1-x0)*2;i++){const sx=x0+R()*(x1-x0),sy=y0+R()*(y1-y0);g.fillStyle='rgba(60,56,52,'+(.05+R()*.08)+')';g.fillRect(X(sx),Y(sy),S(.05+R()*.3),S(.3+R()*.9))}
   for(let x=x0+pw/2;x<x1;x+=pw)for(let y=y0+.7;y<y1;y+=1.4){g.fillStyle='rgba(20,20,22,.7)';g.beginPath();g.arc(X(x),Y(y),S(.03),0,7);g.fill()}}
 function shingles(pts,c,y0,y1,old){clip(pts,()=>{rect(-Wc,y0,Wc,y1+.5,rgb(c,.45));let row=0;for(let y=y1+.1;y>y0-.45;y-=.36,row++){let x=-Wc/2-(row%2)*.27-R()*.1;while(x<Wc/2){const w=.42+R()*.18,k=(old?.66:.82)+R()*.28;const miss=old&&R()<.035;
   if(miss){rect(x,y,x+w,y+.5,'rgba(36,26,20,.95)')}else{const x0=X(x+.025),x1=X(x+w-.025),yt=Y(y+.5),yb=Y(y);g.fillStyle=rgb(c,k);g.beginPath();g.moveTo(x0,yt);g.lineTo(x1,yt);g.lineTo(x1,yb-S(.05));g.quadraticCurveTo((x0+x1)/2,yb+S(.03),x0,yb-S(.05));g.closePath();g.fill();
    g.fillStyle=rgb(c,k*1.18,.8);g.fillRect(x0,yt,x1-x0,S(.05));g.fillStyle='rgba(20,12,6,.35)';g.fillRect(x0,yb-S(.09),x1-x0,S(.06));if(R()<.5)line(x+w*.35,y+.12,x+w*.4,y+.42,rgb(c,k*.75,.6),.015)}x+=w}}
  if(old)for(let i=0;i<Wc*.9;i++){g.fillStyle='rgba('+(70+R()*30|0)+','+(100+R()*30|0)+',50,'+(.25+R()*.3)+')';g.beginPath();g.ellipse(X(-Wc/2+R()*Wc),Y(y0+R()*(y1-y0)),S(.15+R()*.4),S(.08+R()*.15),0,0,7);g.fill()}
  const gr=g.createLinearGradient(0,Y(y1),0,Y(y0));gr.addColorStop(0,'rgba(255,240,210,.12)');gr.addColorStop(1,'rgba(0,0,0,.22)');g.fillStyle=gr;g.fillRect(0,Y(y1+.4),cv.width,S(y1-y0+.4))})}
 function metalRoof(pts,c,y0,y1,rust){clip(pts,()=>{vgrad(-Wc,y0,Wc,y1,rgb(c,.72),rgb(c,1.02));for(let x=-Wc/2;x<Wc/2;x+=.32){line(x,y0,x,y1+1,rgb(c,1.22,.55),.05);line(x+.14,y0,x+.14,y1+1,rgb(c,.62,.5),.04)}
   for(let i=0;i<rust*(Wc);i++){const rx=-Wc/2+R()*Wc,ry=y0+R()*(y1-y0);g.fillStyle='rgba('+(150+R()*40|0)+','+(80+R()*30|0)+',40,'+(.25+R()*.35)+')';g.beginPath();g.ellipse(X(rx),Y(ry),S(.08+R()*.25),S(.05+R()*.15),0,0,7);g.fill()}
   for(let y=y0+.9;y<y1;y+=1.2)line(-Wc/2,y,Wc/2,y,'rgba(30,34,40,.35)',.03)})}
 /* ---- chi tiết ---- */
 function window_(cx,y,w,h,o={}){const fr=o.fr||rgb(P.trim);rect(cx-w/2-.1,y-.1,cx+w/2+.1,y+h+.1,fr);
   if(o.lit){vgrad(cx-w/2,y,cx+w/2,y+h,'rgba(255,214,120,1)','rgba(255,160,50,1)');glow(cx,y+h/2,w*1.1,'255,180,70',.28)}else{vgrad(cx-w/2,y,cx+w/2,y+h,'rgba(40,52,64,1)','rgba(20,26,34,1)');line(cx-w/2+.1,y+h-.15,cx-w/2+.4,y+h-.45,'rgba(180,200,220,.35)',.04)}
   const mul=o.metal?'rgba(70,74,82,1)':fr;line(cx,y,cx,y+h,mul,.07);line(cx-w/2,y+h/2,cx+w/2,y+h/2,mul,.07);
   if(o.broken){poly([[cx+.05,y+h*.55],[cx+w/2,y+h*.95],[cx+w/2,y+h*.55]],'rgba(10,12,16,1)')}
   if(o.boards){for(const[a,b]of[[.2,.75],[.65,.15]]){g.save();g.translate(X(cx),Y(y+h*.5));g.rotate((a>b?-1:1)*.35);g.fillStyle=rgb(P.woodOld,.95);g.fillRect(-S(w/2+.15),-S(.09),S(w+.3),S(.18));g.restore()}}
   if(o.awning){poly([[cx-w/2-.3,y+h+.15],[cx+w/2+.3,y+h+.15],[cx+w/2+.2,y+h+.55],[cx-w/2-.2,y+h+.55]],o.awning)}
   rect(cx-w/2-.18,y-.2,cx+w/2+.18,y-.06,rgb(P.trim,.85));if(o.box){rect(cx-w/2,y-.55,cx+w/2,y-.2,rgb(P.wood,.8));for(let i=0;i<5;i++){g.fillStyle=['#d94a5a','#f2c84a','#e86a9a'][i%3];g.beginPath();g.arc(X(cx-w/2+.15+i*(w-.3)/4),Y(y-.12),S(.08),0,7);g.fill();g.fillStyle='#4f8a3c';g.fillRect(X(cx-w/2+.1+i*(w-.3)/4),Y(y-.22),S(.1),S(.06))}}
   if(o.shutter){rect(cx-w/2-.4,y-.05,cx-w/2-.12,y+h+.05,o.shutter);rect(cx+w/2+.12,y-.05,cx+w/2+.4,y+h+.05,o.shutter)}}
 function door(st,y,h){// cửa luôn ở x = 0, rộng 2 m = khe cửa gameplay (±1 m)
   const w=1.84;if(st==='steel'){rect(-1,y,1,y+h+.25,'#3a3e46');for(const s of[-1,1]){vgrad(s<0?-.9:0.02,y,s<0?-.02:.9,y+h,'#8a9098','#5a6068');for(let k=0;k<3;k++)line(s<0?-.85:.07,y+.4+k*.8,s<0?-.07:.85,y+.4+k*.8,'rgba(30,32,36,.6)',.04)}
     for(let k=0;k<8;k++){g.save();g.beginPath();g.rect(X(-1),Y(y+.35),S(2),S(.35));g.clip();g.fillStyle=k%2?'#f0c020':'#1a1a1a';g.beginPath();g.moveTo(X(-1+k*.3),Y(y));g.lineTo(X(-.8+k*.3),Y(y));g.lineTo(X(-.6+k*.3),Y(y+.35));g.lineTo(X(-.8+k*.3),Y(y+.35));g.fill();g.restore()}
     line(0,y,0,y+h,'#2a2c30',.05);return}
   const fr=rgb(P.trim,st==='old'?1.1:.95);rect(-w/2-.12,y,w/2+.12,y+h+.14,fr);
   if(st==='dbl'){for(const s of[-1,1])planksV(s<0?-w/2:0.03,y,s<0?-.03:w/2,y+h,P.wood,.3,false);line(0,y,0,y+h,'rgba(30,20,12,.9)',.05)}
   else planksV(-w/2,y,w/2,y+h,st==='old'?P.woodOld:P.wood,.3,st==='old');
   if(st==='old'){g.save();g.translate(X(0),Y(y+h*.5));g.rotate(-.75);g.fillStyle=rgb(P.woodOld,.8);g.fillRect(-S(1.15),-S(.08),S(2.3),S(.16));g.restore();rect(-w/2,y+h*.18,w/2,y+h*.26,rgb(P.woodOld,.8));rect(-w/2,y+h*.74,w/2,y+h*.82,rgb(P.woodOld,.8))}
   if(st==='iron'||st==='dbl'){for(const yy of[y+.35,y+h/2,y+h-.4]){rect(-w/2,yy-.06,w/2,yy+.06,'#55595f');for(let x=-w/2+.12;x<w/2;x+=.3){g.fillStyle='#9aa0a8';g.beginPath();g.arc(X(x),Y(yy),S(.03),0,7);g.fill()}}}
   if(st==='plain'||st==='iron'){rect(-w/2+.08,y+h*.7,-w/2+.5,y+h*.74,'#3a3a3a');rect(-w/2+.08,y+h*.25,-w/2+.5,y+h*.29,'#3a3a3a')}
   g.fillStyle='#c9a24a';g.beginPath();g.arc(X(st==='dbl'?.18:w/2-.2),Y(y+h*.47),S(.06),0,7);g.fill();if(st==='dbl'){g.beginPath();g.arc(X(-.18),Y(y+h*.47),S(.06),0,7);g.fill()}}
 function chimney(x,yb,h){vgrad(x-.22,yb,x+.22,yb+h,'#b4bac2','#7c828a');shade(x-.22,yb,x+.22,yb+h,.35);rect(x-.32,yb+h,x+.32,yb+h+.12,'#8a9098');poly([[x-.36,yb+h+.12],[x+.36,yb+h+.12],[x+.2,yb+h+.34],[x-.2,yb+h+.34]],'#9aa0a8');for(let i=0;i<3;i++){g.fillStyle='rgba(225,225,232,'+(.22-i*.06)+')';g.beginPath();g.arc(X(x+.15+i*.25),Y(yb+h+.6+i*.45),S(.22+i*.12),0,7);g.fill()}}
 function solar(cx,y,w,h){poly([[cx-w/2,y],[cx+w/2,y],[cx+w/2-.15,y+h],[cx-w/2+.15,y+h]],'#c8ccd2');poly([[cx-w/2+.08,y+.06],[cx+w/2-.08,y+.06],[cx+w/2-.2,y+h-.06],[cx-w/2+.2,y+h-.06]],'#1f3a78');
   for(let i=1;i<4;i++){const t=i/4;line(cx-w/2+.08+(w-.16)*t,y+.06,cx-w/2+.2+(w-.4)*t,y+h-.06,'rgba(170,200,240,.6)',.025)}line(cx-w/2+.14,y+h/2,cx+w/2-.14,y+h/2,'rgba(170,200,240,.6)',.025);line(cx-w/2+.3,y+h-.15,cx-w/2+.8,y+h-.15,'rgba(255,255,255,.45)',.04)}
 function lamp(x,y,c){rect(x-.08,y-.05,x+.08,y+.3,'#3a3a3a');rect(x-.14,y+.3,x+.14,y+.62,'#ffcf6a');rect(x-.18,y+.62,x+.18,y+.7,'#3a3a3a');glow(x,y+.46,1.1,c||'255,190,90',.45)}
 function grass(y){for(let x=-Wc/2;x<Wc/2;x+=.18){const h=.12+R()*.22;g.fillStyle=R()<.5?'#4f8a3c':'#3f7433';g.beginPath();g.moveTo(X(x),Y(y));g.lineTo(X(x+.05+(R()-.5)*.08),Y(y+h));g.lineTo(X(x+.1),Y(y));g.fill()}}
 function crate(x,y,s){rect(x-s/2,y,x+s/2,y+s,rgb(P.wood,.95));line(x-s/2,y,x+s/2,y+s,rgb(P.wood,.6),.05);line(x+s/2,y,x-s/2,y+s,rgb(P.wood,.6),.05);g.strokeStyle=rgb(P.trim,.8);g.lineWidth=S(.05);g.strokeRect(X(x-s/2),Y(y+s),S(s),S(s))}
 function barrel(x,y){vgrad(x-.3,y,x+.3,y+.8,rgb(P.wood,1.05),rgb(P.wood,.7));for(const yy of[y+.15,y+.62])rect(x-.31,yy,x+.31,yy+.06,'#55595f')}
 function gableRoof(eY,ridgeY,ov,draw){const pts=[[-W/2-ov,eY],[W/2+ov,eY],[W/2+ov-.25,ridgeY],[-W/2-ov+.25,ridgeY]];draw(pts);poly([[-W/2-ov+.25,ridgeY],[W/2+ov-.25,ridgeY],[W/2+ov-.35,ridgeY+.32],[-W/2-ov+.35,ridgeY+.32]],'rgba(40,28,20,.55)');
   rect(-W/2-ov+.2,ridgeY-.1,W/2+ov-.2,ridgeY+.08,rgb(P.trim,.9));rect(-W/2-ov,eY-.14,W/2+ov,eY+.04,rgb(P.trim,.75));g.fillStyle='rgba(0,0,0,.28)';g.fillRect(X(-W/2),Y(eY-.14),S(W),S(.3));return pts}
 const ov=Math.min(.24,(Wc-W)/2-.01),G=.3;// mép mái ló ra (trong khung ảnh); G = mặt đất ở đáy ảnh
 // nền đất + bóng
 g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(X(0),Y(.18),S(W*.55),S(.28),0,0,7);g.fill();
 if(lv===1){/* ===== CẤP 1 · NHÀ GỖ CŨ: ván dọc xám bạc màu, cửa sổ bịt ván, mái ngói gỗ sứt mẻ, không ống khói ===== */
  const wt=G+2.7,rY=wt+3.9;gableRoof(wt,rY,ov,p=>shingles(p,[P.woodOld[0]*.95+8,P.woodOld[1]*.9+4,P.woodOld[2]*.85],wt,rY,true));
  rect(-W/2,G,W/2,G+.25,rgb(P.woodOld,.5));planksV(-W/2,G+.18,W/2,wt,P.woodOld,.42,true);shade(-W/2,G,W/2,wt,.35);
  for(const x of[-W/2+.15,W/2-.15])rect(x-.13,G,x+.13,wt,rgb(P.woodOld,.62));
  window_(-2.75,G+1.05,1.1,1,{boards:true});window_(2.75,G+1.1,1,.95,{broken:true});door('old',G,2.15);
  rect(1.45,G+2.2,2.25,G+2.32,rgb(P.woodOld,.6));crate(W/2-.8,G,.6);grass(G-.05);
  for(let i=0;i<4;i++){g.fillStyle='rgba(70,110,50,.5)';g.beginPath();g.ellipse(X(-W/2+.4+R()*(W-.8)),Y(G+.05),S(.3+R()*.3),S(.12),0,0,7);g.fill()}}
 else if(lv===2){/* ===== CẤP 2 · NHÀ GỖ SỬA CHỮA: ván ngang ấm, cửa sổ sáng, hiên nhỏ trước cửa, ống khói kim loại ===== */
  const wt=G+2.8,rY=wt+4.3;gableRoof(wt,rY,ov,p=>shingles(p,[P.roof[0]*.9+10,P.roof[1]*.95+8,P.roof[2]*.9],wt,rY,false));chimney(W/2-1.6,rY-1.3,1.6);
  rect(-W/2,G,W/2,G+.3,rgb(P.trim,.8));planksH(-W/2,G+.25,W/2,wt,P.wood,.3);shade(-W/2,G,W/2,wt,.3);for(const x of[-W/2+.14,W/2-.14,-1.32,1.32])rect(x-.14,G,x+.14,wt,rgb(P.trim,1));
  window_(-2.9,G+1.05,1.2,1.1,{lit:true,box:true});window_(2.9,G+1.05,1.2,1.1,{lit:true});door('plain',G,2.2);
  poly([[-1.75,G+2.5],[1.75,G+2.5],[1.55,G+3.05],[-1.55,G+3.05]],rgb(P.roof,.75));for(let x=-1.7;x<1.7;x+=.35)line(x,G+2.5,x+.05,G+3.02,'rgba(40,24,14,.5)',.03);
  rect(-1.75,G+2.42,1.75,G+2.52,rgb(P.trim,.85));rect(-1.58,G,-1.42,G+2.45,rgb(P.trim,1.1));rect(1.42,G,1.58,G+2.45,rgb(P.trim,1.1));
  rect(-1.2,G-.02,1.2,G+.12,rgb(P.wood,.8));barrel(W/2-.75,G);grass(G-.05)}
 else if(lv===3){/* ===== CẤP 3 · NHÀ GỖ GIA CỐ: chân tường đá, khung gỗ có đai sắt, mái tôn, pin mặt trời, ống khói ===== */
  const wt=G+3,rY=wt+4.6;const pts=gableRoof(wt,rY,ov,p=>metalRoof(p,P.metal,wt,rY,1.2));solar(-1.6,wt+1.3,3.1,2.1);chimney(W/2-1.4,rY-1.5,1.8);
  stones(-W/2,G,W/2,G+1.05,[132,128,122],.35);planksH(-W/2,G+1.05,W/2,wt,P.wood,.3);shade(-W/2,G,W/2,wt,.3);
  for(const x of[-W/2+.16,W/2-.16,-1.35,1.35,-W/4-.6,W/4+.6])rect(x-.16,G+1.05,x+.16,wt,rgb(P.trim,1));
  for(const s of[-1,1]){line(s*1.35,G+1.15,s*(W/4+.6),G+1.95,rgb(P.trim,.85),.08)}
  rect(-W/2,G+1.95,W/2,G+2.07,'#5a5e64');rect(-W/2,wt-.18,W/2,wt-.06,'#5a5e64');
  window_(-3.15,G+1.35,1.15,1.05,{lit:true,awning:rgb(P.metal,.9)});window_(3.15,G+1.35,1.15,1.05,{lit:true,awning:rgb(P.metal,.9)});door('iron',G,2.3);
  lamp(-1.6,G+2.15);crate(W/2-.75,G,.55);barrel(-W/2+.8,G);grass(G-.05)}
 else if(lv===4){/* ===== CẤP 4 · NHÀ 2 TẦNG KIÊN CỐ: tầng dưới đá, tầng trên gỗ, ban công lan can, mái tôn 2 tấm pin, bồn nước ===== */
  const f1=G+2.8,wt=G+5.4,rY=wt+4.4;gableRoof(wt,rY,ov,p=>metalRoof(p,P.metal,wt,rY,1));solar(-2.4,wt+1.2,2.6,1.9);solar(.6,wt+1.2,2.6,1.9);chimney(W/2-1.2,rY-1.4,1.7);
  // bồn nước trên mái (bên phải)
  {const x=W/2-2.6,y=rY-.9;for(const dx of[-.55,.55])rect(x+dx-.06,y-1,x+dx+.06,y+.2,'#4a4e56');line(x-.55,y-.9,x+.55,y,'#4a4e56',.05);vgrad(x-.75,y+.15,x+.75,y+1.5,'#c4ccd4','#8a929a');shade(x-.75,y+.15,x+.75,y+1.5,.35);poly([[x-.82,y+1.5],[x+.82,y+1.5],[x,y+1.85]],'#9aa2aa');for(const yy of[y+.5,y+1.05])rect(x-.76,yy,x+.76,yy+.05,'#6a7078')}
  stones(-W/2,G,W/2,f1,[136,132,126],.38);planksH(-W/2,f1,W/2,wt,P.wood,.3);shade(-W/2,G,W/2,wt,.32);for(const x of[-W/2+.16,W/2-.16,-1.4,1.4])rect(x-.16,f1,x+.16,wt,rgb(P.trim,1));
  window_(-3.3,G+1.05,1.25,1.15,{lit:true,metal:true});window_(3.3,G+1.05,1.25,1.15,{lit:true,metal:true});
  for(const x of[-3.3,0,3.3])window_(x,f1+.75,1.15,1.1,{lit:x!==0,shutter:rgb(P.trim,1.15)});
  // ban công dọc mặt trước tầng 2
  rect(-W/2-.05,f1-.12,W/2+.05,f1+.12,rgb(P.trim,.8));for(let x=-W/2+.1;x<=W/2-.05;x+=.45)rect(x-.04,f1+.12,x+.04,f1+.95,rgb(P.trim,1.15));rect(-W/2,f1+.9,W/2,f1+1.02,rgb(P.trim,1.25));rect(-W/2,f1+.45,W/2,f1+.52,rgb(P.trim,1.05));
  door('dbl',G,2.35);lamp(-1.65,G+2.2);lamp(1.65,G+2.2);rect(-1.25,G-.02,1.25,G+.14,'#8a8a86');barrel(W/2-.7,G);crate(-W/2+.8,G,.6);grass(G-.05)}
 else{/* ===== CẤP 5 · TRỤ SỞ SINH TỒN: bê tông, tháp góc đèn vàng, cửa thép sọc cảnh báo, băng rôn, mái bằng có tường chắn, pin, ăng-ten, chảo vệ tinh ===== */
  const wt=G+4.9,roofTop=wt+3.2,cw=[150,152,158];
  // mặt mái bằng nhìn từ trên (phía sau tường chắn)
  vgrad(-W/2+.2,wt,W/2-.2,roofTop,'#7e8288','#9a9ea4');for(let x=-W/2+.6;x<W/2-.4;x+=1.1)line(x,wt+.2,x,roofTop-.1,'rgba(40,42,46,.35)',.03);
  solar(-1.2,wt+.9,3.6,2);{const x=-W/2+2.2,y=wt+.6;rect(x-.08,y,x+.08,y+1,'#5a5e66');g.fillStyle='#dfe3e8';g.beginPath();g.ellipse(X(x),Y(y+1.35),S(.85),S(.55),-.5,0,7);g.fill();g.strokeStyle='#9aa0a8';g.lineWidth=S(.06);g.stroke();line(x,y+1.35,x+.5,y+1.9,'#5a5e66',.05)}
  {const x=W/2-1.9,y=wt+.4;for(const dx of[-.35,.35])line(x+dx,y,x,y+4.3,'#2e3238',.07);for(let k=1;k<7;k++){const yy=y+k*.6,hw=.35*(1-k/7.5);line(x-hw,yy,x+hw,yy,'#2e3238',.04);line(x-hw,yy,x+hw*.6,yy+.6,'#2e3238',.03)}g.fillStyle='#ff3a2a';g.beginPath();g.arc(X(x),Y(y+4.35),S(.12),0,7);g.fill();glow(x,y+4.35,.6,'255,60,40',.6)}
  concrete(-W/2+1.05,G,W/2-1.05,wt,cw,1.6);
  // tường chắn mái + dải đèn vàng
  rect(-W/2+.2,wt-.1,W/2-.2,wt+.55,'#6e7278');rect(-W/2+.2,wt+.45,W/2-.2,wt+.6,'#8a8e94');for(let x=-W/2+1.4;x<W/2-1.2;x+=.75){rect(x,wt-.35,x+.3,wt-.22,'#ffd060');glow(x+.15,wt-.28,.35,'255,200,90',.5)}
  // tháp góc
  for(const s of[-1,1]){const x0=s<0?-W/2:W/2-1.15,x1=x0+1.15;concrete(x0,G,x1,wt+1.3,[140,142,148],1.15);shade(x0,G,x1,wt+1.3,.35);rect(x0-.06,wt+1.2,x1+.06,wt+1.45,'#5e6268');for(const yy of[G+1.6,G+3.4])window_((x0+x1)/2,yy,.45,.55,{lit:true,metal:true,fr:'#4a4e56'});lamp((x0+x1)/2,wt+1.45,'255,200,80')}
  // lối vào: bậc thang, khung thép, cửa thép, băng rôn
  rect(-1.5,G-.05,1.5,G+.12,'#9a9ea4');rect(-1.3,G+.12,1.3,G+.26,'#aeb2b8');rect(-1.32,G,1.32,G+3.05,'#4a4e56');door('steel',G+.26,2.45);
  for(const s of[-1,1]){rect(s*1.32-.2,G,s*1.32+.2,wt,'#7c8086');lamp(s*1.75,G+2.4,'255,200,80')}
  {const by=G+3.25,bh=1.45,c=P.banner;poly([[-.85,by+bh],[.85,by+bh],[.85,by+.35],[0,by],[-.85,by+.35]],rgb(c));rect(-.95,by+bh-.05,.95,by+bh+.08,'#c9a24a');
   g.fillStyle='#f4efe6';g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?.18:.42;g.lineTo(X(r*Math.cos(a)),Y(by+.85-r*Math.sin(a)))}g.closePath();g.fill()}
  for(const x of[-3.1,3.1]){window_(x,G+1.2,1.15,.95,{lit:true,metal:true,fr:'#4a4e56'});window_(x,G+3,1.15,.8,{lit:true,metal:true,fr:'#4a4e56'});for(let k=0;k<4;k++)line(x-.58,G+1.3+k*.22,x+.58,G+1.3+k*.22,'rgba(40,44,50,.55)',.04)}
  for(const x of[-2,2]){rect(x-.5,G,x+.5,G+.45,'#b8a878');rect(x-.38,G+.4,x+.38,G+.75,'#a89868')}grass(G-.05)}
 {const o=document.createElement('canvas');o.width=cv.width;o.height=cv.height;const q=o.getContext('2d');const id=g.getImageData(0,0,cv.width,cv.height),m=q.createImageData(cv.width,cv.height);
  for(let i=3;i<id.data.length;i+=4)if(id.data[i]>200){m.data[i-3]=22;m.data[i-2]=16;m.data[i-1]=12;m.data[i]=150}q.putImageData(m,0,0);// viền tối 2 px quanh phần đặc (không viền quầng sáng/khói)
  g.save();g.globalCompositeOperation='destination-over';for(const[dx,dy]of[[-2,0],[2,0],[0,-2],[0,2],[-1.5,-1.5],[1.5,1.5],[-1.5,1.5],[1.5,-1.5]])g.drawImage(o,dx,dy);g.restore()}
 cv.complete=true;cv.naturalWidth=cv.width;cv.naturalHeight=cv.height;// để spr()/drawHouse coi như ảnh đã tải
 return cv}
const CACHE=new Map();
function key(lv,vi,hw,hd){const k='nhaG'+lv+'_'+(vi%PAL.length)+'_'+Math.round(hw*100)+'_'+Math.round(hd*100);if(!CACHE.has(k)){const cv=facade(lv,vi,hw,hd);CACHE.set(k,cv);SH.AS[k]={i:cv,w:cv.width,h:cv.height,gen:1}}return k}
globalThis.N22GFX={facade,key,PAL,PPM,CACHE};

/* =====================================================================
   VẬT LIỆU 3D (texture canvas tự vẽ, lặp được) cho nhà 2.5D cấp 1–5 – không dùng ảnh mẫu
   tex3(loại) → canvas 256×256 (cache). Màu gốc trung tính; màu từng căn cứ nhân qua màu vật liệu.
   ===================================================================== */
const T3=new Map();
function tex3(kind){if(T3.has(kind))return T3.get(kind);const N=256,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d'),R=rng(kind.length*977+kind.charCodeAt(0)*31+kind.charCodeAt(kind.length-1));
 const f=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)},cc=(r,gg,b,a=1)=>'rgba('+(r|0)+','+(gg|0)+','+(b|0)+','+a+')';
 const grain=(x0,y0,w,h,vert,k)=>{for(let i=0;i<(vert?w:h)/5;i++){const t=R();g.strokeStyle=cc(0,0,0,.08+R()*.1*k);g.lineWidth=1;g.beginPath();if(vert){const x=x0+t*w;g.moveTo(x,y0);g.bezierCurveTo(x+R()*4-2,y0+h*.3,x+R()*4-2,y0+h*.7,x+R()*3-1.5,y0+h)}else{const y=y0+t*h;g.moveTo(x0,y);g.bezierCurveTo(x0+w*.3,y+R()*3-1.5,x0+w*.7,y+R()*3-1.5,x0+w,y+R()*2-1)}g.stroke()}};
 if(kind==='plankOld'||kind==='plankV'){const n=6,w=N/n;for(let i=0;i<n;i++){const k=.78+R()*.3,o=kind==='plankOld';const base=o?[150,140,126]:[176,128,82];f(cc(base[0]*k,base[1]*k,base[2]*k),i*w,0,w,N);grain(i*w,0,w,N,true,o?1.5:1);f(cc(30,22,16,.75),i*w,0,2,N);f(cc(255,255,255,.08),i*w+2,0,2,N);
   if(o){for(let j=0;j<2;j++){g.fillStyle=cc(60,50,40,.6);g.beginPath();g.ellipse(i*w+w/2,R()*N,3,5,0,0,7);g.fill()}if(R()<.4){f(cc(40,32,26,.85),i*w+4,R()*N*.6,w-8,6)}}
   for(const y of[N*.12,N*.88]){f(cc(40,30,22,.9),i*w+w/2-2,y-2,4,4)}}}
 else if(kind==='plankH'){const n=8,h=N/n;for(let r=0;r<n;r++){let x=-(r%2)*60;while(x<N){const L=90+R()*90,k=.82+R()*.26;f(cc(176*k,124*k,78*k),x,r*h,L,h);grain(x,r*h,L,h,false,1);f(cc(30,20,12,.8),x,r*h,2,h);x+=L}f(cc(30,20,12,.7),0,r*h+h-3,N,3);f(cc(255,230,190,.12),0,r*h,N,2)}}
 else if(kind==='stone'){f(cc(70,68,64),0,0,N,N);const rows=6,h=N/rows;for(let r=0;r<rows;r++){let x=-(r%2)*24;while(x<N){const L=36+R()*30,k=.75+R()*.35,c=[150*k,146*k,138*k];g.fillStyle=cc(...c);g.beginPath();g.roundRect?g.roundRect(x+2,r*h+2,L-4,h-4,4):g.rect(x+2,r*h+2,L-4,h-4);g.fill();f(cc(255,255,255,.12),x+3,r*h+3,L-6,3);f(cc(0,0,0,.18),x+3,r*h+h-6,L-6,3);if(x+L>N){g.beginPath();g.roundRect?g.roundRect(x+2-N,r*h+2,L-4,h-4,4):g.rect(x+2-N,r*h+2,L-4,h-4);g.fill()}x+=L}}}
 else if(kind==='concrete'){f(cc(158,160,164),0,0,N,N);for(let i=0;i<500;i++){f(cc(90+R()*80,90+R()*80,96+R()*80,.12),R()*N,R()*N,1+R()*3,1+R()*3)}f(cc(60,62,66,.7),0,0,N,3);f(cc(60,62,66,.7),0,0,3,N);f(cc(60,62,66,.45),0,N/2,N,2);
   for(const[x,y]of[[16,16],[N-16,16],[16,N-16],[N-16,N-16],[16,N/2+12],[N-16,N/2+12]]){g.fillStyle=cc(40,42,46);g.beginPath();g.arc(x,y,3,0,7);g.fill()}for(let i=0;i<4;i++)f(cc(90,84,76,.15),R()*N,R()*N*.5,4+R()*10,40+R()*80)}
 else if(kind==='shingle'||kind==='shingleOld'){const o=kind==='shingleOld';f(cc(40,28,20),0,0,N,N);const rows=8,h=N/rows;for(let r=0;r<rows;r++){let x=-(r%2)*16;while(x<N+20){const w=26+R()*12,k=(o?.62:.85)+R()*.25;const base=o?[150,138,120]:[150,108,78];if(o&&R()<.05){x+=w;continue}
    g.fillStyle=cc(base[0]*k,base[1]*k,base[2]*k);g.beginPath();g.moveTo(x+1,r*h);g.lineTo(x+w-1,r*h);g.lineTo(x+w-1,r*h+h+4);g.quadraticCurveTo(x+w/2,r*h+h+8,x+1,r*h+h+4);g.closePath();g.fill();f(cc(255,240,220,.15),x+1,r*h,w-2,2);x+=w}f(cc(0,0,0,.3),0,r*h,N,3)}
   if(o)for(let i=0;i<14;i++){g.fillStyle=cc(70+R()*30,100+R()*30,50,.35);g.beginPath();g.ellipse(R()*N,R()*N,6+R()*14,3+R()*6,0,0,7);g.fill()}}
 else if(kind==='metal'){const gr=g.createLinearGradient(0,0,32,0);gr.addColorStop(0,cc(120,136,156));gr.addColorStop(.35,cc(176,190,206));gr.addColorStop(.55,cc(138,152,170));gr.addColorStop(1,cc(110,124,142));for(let x=0;x<N;x+=32){g.save();g.translate(x,0);g.fillStyle=gr;g.fillRect(0,0,32,N);g.restore()}
   f(cc(40,46,54,.4),0,N/2,N,2);for(let i=0;i<10;i++){g.fillStyle=cc(150+R()*40,84+R()*30,40,.25+R()*.35);g.beginPath();g.ellipse(R()*N,R()*N,4+R()*16,3+R()*8,0,0,7);g.fill()}}
 else if(kind==='floor'){const n=6,w=N/n;for(let i=0;i<n;i++){const k=.8+R()*.25;f(cc(150*k,108*k,70*k),i*w,0,w,N);grain(i*w,0,w,N,true,1);f(cc(30,20,12,.6),i*w,0,2,N)}}
 else if(kind==='slab'){f(cc(132,134,138),0,0,N,N);for(let i=0;i<400;i++)f(cc(80+R()*90,80+R()*90,86+R()*90,.12),R()*N,R()*N,2,2);f(cc(70,72,76,.6),0,0,N,2);f(cc(70,72,76,.6),0,0,2,N)}
 else if(kind.startsWith('win')){f(cc(0,0,0,0),0,0,N,N);const lit=kind!=='winBoard'&&kind!=='winBroken',metal=kind==='winMetal';
   f(metal?cc(70,74,82):cc(92,64,40),10,10,N-20,N-20);const gx=26,gy=26,gw=N-52,gh=N-52;
   if(lit){const gr=g.createLinearGradient(0,gy,0,gy+gh);gr.addColorStop(0,cc(255,222,140));gr.addColorStop(1,cc(255,160,60));g.fillStyle=gr;g.fillRect(gx,gy,gw,gh)}else{f(cc(30,38,48),gx,gy,gw,gh);f(cc(170,190,210,.35),gx+12,gy+12,40,8)}
   f(metal?cc(60,64,72):cc(92,64,40),N/2-6,gy,12,gh);f(metal?cc(60,64,72):cc(92,64,40),gx,N/2-6,gw,12);
   if(kind==='winBroken'){g.fillStyle=cc(8,10,14);g.beginPath();g.moveTo(N/2+6,gy);g.lineTo(gx+gw,gy);g.lineTo(gx+gw,gy+80);g.lineTo(N/2+40,gy+40);g.closePath();g.fill()}
   if(kind==='winBoard'){for(const a of[-.55,.55]){g.save();g.translate(N/2,N/2);g.rotate(a);f(cc(130,118,100),-150,-16,300,32);f(cc(0,0,0,.25),-150,12,300,4);g.restore()}}
   if(metal)for(let y=gy+30;y<gy+gh;y+=36)f(cc(50,54,60,.55),gx,y,gw,5)}
 else if(kind.startsWith('door')){const st=kind.slice(4);if(st==='Steel'){const gr=g.createLinearGradient(0,0,N,0);gr.addColorStop(0,cc(110,116,124));gr.addColorStop(.5,cc(150,156,164));gr.addColorStop(1,cc(100,106,114));g.fillStyle=gr;g.fillRect(0,0,N,N);for(let y=40;y<N;y+=70)f(cc(50,54,60,.6),0,y,N,6);
    for(let i=-2;i<12;i++){g.save();g.beginPath();g.rect(0,N-46,N,46);g.clip();g.fillStyle=i%2?cc(240,190,30):cc(26,26,26);g.beginPath();g.moveTo(i*28,N);g.lineTo(i*28+28,N);g.lineTo(i*28+56,N-46);g.lineTo(i*28+28,N-46);g.fill();g.restore()}}
   else{const o=st==='Old',iron=st==='Iron';const n=5,w=N/n;for(let i=0;i<n;i++){const k=.8+R()*.25,b=o?[146,134,118]:[150,100,60];f(cc(b[0]*k,b[1]*k,b[2]*k),i*w,0,w,N);grain(i*w,0,w,N,true,o?1.5:1);f(cc(30,20,12,.7),i*w,0,2,N)}
    if(o){g.save();g.translate(N/2,N/2);g.rotate(-.8);f(cc(120,110,96),-190,-14,380,28);g.restore();f(cc(120,110,96),0,40,N,22);f(cc(120,110,96),0,N-62,N,22)}
    else{f(cc(30,20,12,.5),0,40,N,14);f(cc(30,20,12,.5),0,N-54,N,14)}
    if(iron)for(const y of[50,N/2,N-60]){f(cc(80,84,90),0,y-8,N,16);for(let x=12;x<N;x+=34){g.fillStyle=cc(170,176,184);g.beginPath();g.arc(x,y,4,0,7);g.fill()}}
    g.fillStyle=cc(200,162,74);g.beginPath();g.arc(N-30,N/2,7,0,7);g.fill()}}
 else if(kind.startsWith('banner')){const col=kind.slice(6).split(',').map(Number);f(cc(...col),0,0,N,N);f(cc(201,162,74),0,0,N,14);g.fillStyle=cc(244,239,230);g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?34:80;g.lineTo(N/2+r*Math.cos(a),N*.45+r*Math.sin(a))}g.closePath();g.fill()}
 T3.set(kind,cv);return cv}
globalThis.N22GFX.tex3=tex3;
})();
