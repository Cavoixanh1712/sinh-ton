/* SAFE HAVEN V2 · bản thử 2.500 m · m26water.js (Lần 10) — CHỈ HIỂN THỊ: lớp phủ làm đẹp nước, vẽ NGAY SAU lớp nước gốc của W15.ground
   Dùng đúng hình học thật (W15.RV / LKS / FALLS) nên không lệch vùng va chạm. Không đổi tuyến, bề rộng, độ sâu, va chạm.
   gnd=true (nền 2.5D dựng sẵn) → chỉ vẽ phần tĩnh; phần chuyển động chỉ chạy ở 2D (2.5D đã có dải nước động riêng). */
(()=>{const T={};{const im=new Image();im.src='art9/rd_tuft.png';T.i=im}
const PT=new WeakMap(),hs=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v)};
const INL=new WeakMap();const WET=new WeakMap();function wet(W,r,i,side){let a=WET.get(r);if(!a){a=new Int8Array(r.N*2);WET.set(r,a)}const k=i*2+(side>0?0:1);if(a[k])return a[k]>0;
 const o=r.HW[i]+1.6,x=r.X[i]-r.TY[i]*o*side,y=r.Y[i]+r.TX[i]*o*side;const w=W.water(x,y).d>0||!!W.M3.BRG.find(b=>Math.hypot(b.x-x,b.y-y)<b.hl+3);a[k]=w?1:-1;return w}
function stat(g,X,Y,Z,cx,cy,vw,vh,YS,W,M0){
 let tp=null;if(T.i.complete&&T.i.naturalWidth){tp=PT.get(g);if(!tp){tp=g.createPattern(T.i,'repeat');PT.set(g,tp)}}
 const x0=cx-vw-10,x1=cx+vw+10,y0=cy-vh-10,y1=cy+vh+10,sc=3.4/96;
 for(const r of W.RV){const IL=inl(W,r);for(let i=0;i<r.N-1;i++){const x=r.X[i],y=r.Y[i];if(x<x0||x>x1||y<y0||y>y1||r.FD[i]>=2||IL[i]||IL[i+1])continue;const len=r.SS[i+1]-r.SS[i],hw=r.HW[i];
   g.setTransform(M0.multiply(new DOMMatrix([Z*r.TX[i],Z*YS*r.TY[i],-Z*r.TY[i],Z*YS*r.TX[i],X(x),Y(y)])));
   const e=Math.min(hw*.2,1.3);g.fillStyle='rgba(190,245,225,.20)';g.fillRect(-.2,hw-e,len+.4,e);g.fillRect(-.2,-hw,len+.4,e);
   g.fillStyle='rgba(150,230,225,.11)';g.fillRect(-.2,hw-2*e,len+.4,e);g.fillRect(-.2,-hw+e,len+.4,e);
   if(hw>2.5){g.fillStyle='rgba(6,34,84,.13)';g.fillRect(-.2,-hw*.32,len+.4,hw*.64)}
   if(tp)for(const sd of[1,-1]){if(wet(W,r,i,sd))continue;tp.setTransform(new DOMMatrix([sc,0,0,sc*sd,-r.SS[i],sd*hw]));g.fillStyle=tp;const a=hw+.95,b=1.5;if(sd>0)g.fillRect(-.2,a,len+.4,b);else g.fillRect(-.2,-a-b,len+.4,b)}}}
 g.setTransform(M0);
 for(const l of W.LKS){if(Math.abs(l.x-cx)>vw+l.r+5||Math.abs(l.y-cy)>vh+l.r+5||!l.k||!l.k.length)continue;g.lineCap='round';g.strokeStyle='rgba(215,248,240,.22)';g.lineWidth=Z*Math.min(1.6,l.r*.08);lpath(g,l,.975,X,Y);g.stroke()}
 for(const f of W.FALLS){if(Math.abs(f.x-cx)>vw+f.W+12||Math.abs(f.base-cy)>vh+20)continue;const w=f.W,bx=f.x,by=f.base;
  const gr=g.createLinearGradient(0,Y(by-.2),0,Y(by+1.7));gr.addColorStop(0,'rgba(255,255,255,.34)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(X(bx-w/2),Y(by-.2),w*Z,1.9*Z*YS)}}
function inl(W,r){let IL=INL.get(r);if(!IL){IL=new Uint8Array(r.N);for(let i=0;i<r.N;i++)for(const l of W.LKS){const dx=(r.X[i]-l.x)/(l.r*1.18),dy=(r.Y[i]-l.y)/(l.r*1.18*(l.ry||1));if(dx*dx+dy*dy<1){IL[i]=1;break}}INL.set(r,IL)}return IL}
function lpath(g,l,k,X,Y){g.beginPath();for(let i=0;i<=64;i++){const a=i/64*Math.PI*2,R=l.r*l.k[i%64]*k,px=X(l.x+Math.cos(a)*R),py=Y(l.y+Math.sin(a)*R*l.ry);i?g.lineTo(px,py):g.moveTo(px,py)}g.closePath()}
/* phần CHUYỂN ĐỘNG (2D: vẽ thẳng mỗi khung · 2.5D: vẽ vào tấm phủ trong suốt nằm sát mặt đất). Mọi pha là hàm liên tục của thời gian → không giật/nhấp nháy.
   Mật độ tự giảm khi tầm nhìn rộng (Z nhỏ): q = hệ số chất lượng 0..1 */
function anim(g,X,Y,Z,cx,cy,vw,vh,YS,tt,W,M0,only3){const x0=cx-vw-6,x1=cx+vw+6,y0=cy-vh-6,y1=cy+vh+6,q=Math.max(.35,Math.min(1,Z/22)),px=1/Z,step=q>.8?2:q>.55?3:5;let cnt=0;
 /* sông/suối: vệt sáng mảnh trôi theo đúng hướng dòng (tiếp tuyến), tốc độ theo VS, mờ dần ở hai đầu hành trình */
 for(const r of W.RV){const IL=inl(W,r);for(let i=0;i<r.N-1;i+=step){const x=r.X[i],y=r.Y[i];if(x<x0||x>x1||y<y0||y>y1||r.FD[i]>=2||IL[i])continue;const hw=r.HW[i],sp=r.VS[i]||1;
   for(let k=0;k<2;k++){const h=hs(i*2+k),ph=(tt*sp*.16+h*13)%1,al=Math.sin(Math.PI*ph);if(al<.08)continue;const lat=(hs(i*2+k+9)-.5)*hw*1.55,along=ph*sp*7,L=.5+hs(i+k+3)*.7;
    const wx=x+r.TX[i]*along-r.TY[i]*lat,wy=y+r.TY[i]*along+r.TX[i]*lat;g.setTransform(M0.multiply(new DOMMatrix([Z*r.TX[i],Z*YS*r.TY[i],-Z*r.TY[i],Z*YS*r.TX[i],X(wx),Y(wy)])));
    g.fillStyle='rgba(255,255,255,'+(al*.34).toFixed(3)+')';g.fillRect(0,0,L,Math.max(.08,1.4*px));g.fillStyle='rgba(215,245,255,'+(al*.16).toFixed(3)+')';g.fillRect(-L*.6,Math.max(.1,1.6*px)*1.4,L*1.5,Math.max(.06,px));cnt++}}}
 g.setTransform(M0);g.lineCap='round';
 /* hồ: không trôi — sóng vỗ bờ nhấp nhô chậm + vòng gợn lan rồi tan */
 for(const l of W.LKS){if(Math.abs(l.x-cx)>vw+l.r+5||Math.abs(l.y-cy)>vh+l.r+5||!l.k||!l.k.length)continue;
  for(let k=0;k<2;k++){const br=.5+.5*Math.sin(tt*.9+l.x+k*2.1);g.strokeStyle='rgba(255,255,255,'+(.10+.2*br).toFixed(3)+')';g.lineWidth=Math.max(Z*.2,1.3);g.setLineDash([Z*(1.1+k*.6),Z*(1.7+k*.9)]);g.lineDashOffset=k?Z*3.3:0;lpath(g,l,.988-.014*br-k*.03,X,Y);g.stroke()}g.setLineDash([]);
  if(l.sea||l.f)continue;const n=Math.round((l.r>18?5:2)*q+1);for(let k=0;k<n;k++){const T0=7+hs(k+l.x)*4,c=Math.floor(tt/T0+hs(k)),ph=(tt/T0+hs(k))%1,a=hs(c*7.3+k)*6.283,d=Math.sqrt(hs(c*3.1+k+5))*.78,rx=l.x+Math.cos(a)*l.r*d,ry=l.y+Math.sin(a)*l.r*l.ry*d;
   for(let j=0;j<2;j++){const p2=ph-j*.14;if(p2<=0)continue;g.strokeStyle='rgba(255,255,255,'+(.26*Math.sin(Math.PI*p2)*(1-p2)).toFixed(3)+')';g.lineWidth=Math.max(Z*.1,1.1);g.beginPath();g.ellipse(X(rx),Y(ry),Z*(.6+p2*4.5),Z*(.6+p2*4.5)*.62*YS,0,0,7);g.stroke();cnt++}}}
 /* thác: bọt trắng sôi ở chân thác, hạt nước bắn theo quỹ đạo cung, vòng sóng lan ra hồ chân thác */
 for(const f of W.FALLS){if(Math.abs(f.x-cx)>vw+f.W+12||Math.abs(f.base-cy)>vh+20)continue;const w=f.W,bx=f.x,by=f.base;
  const n=Math.max(6,Math.round(w*2.2*q));for(let k=0;k<n;k++){const u=(k+.5)/n,ph=(tt*(.55+hs(k)*.4)+hs(k+5))%1,x=bx+(u-.5)*w+(hs(k+2)-.5)*.6+Math.sin(tt*1.7+k)*.08,y=by+.2+ph*1.7,rr=(.26+hs(k+7)*.3)*(1+ph*.8),al=Math.sin(Math.PI*Math.min(1,ph*1.4+.15))*(1-ph)*.85;
   g.fillStyle='rgba(255,255,255,'+al.toFixed(3)+')';g.beginPath();g.ellipse(X(x),Y(y),rr*Z,rr*Z*.7*YS,0,0,7);g.fill();cnt++}
  const m=Math.round(14*q);for(let k=0;k<m;k++){const ph=(tt*(.8+hs(k+40)*.5)+hs(k+20))%1,dx=(hs(k+31)-.5),x=bx+dx*w*1.05+dx*ph*1.2,y=by+.3+ph*1.1-Math.sin(Math.PI*ph)*(1.2+hs(k+11)),s=Math.max(.13*Z,1.6);g.fillStyle='rgba(240,250,255,'+(.75*(1-ph)).toFixed(3)+')';g.fillRect(X(x)-s/2,Y(y)-s/2,s,s);cnt++}
  for(let k=0;k<3;k++){const ph=(tt*.22+k/3)%1,R=w*.4+ph*f.pool.r*.8;g.strokeStyle='rgba(255,255,255,'+(.34*Math.sin(Math.PI*ph)*(1-ph*.6)).toFixed(3)+')';g.lineWidth=Math.max(Z*.14,1.2);g.beginPath();g.ellipse(X(bx),Y(by+.7),R*Z,R*Z*.5*YS,0,0,Math.PI);g.stroke();cnt++}}
 g.setTransform(M0);return cnt}
function over(g,X,Y,Z,cx,cy,vw,vh,YS,t,gnd,W){const M0=g.getTransform();g.save();stat(g,X,Y,Z,cx,cy,vw,vh,YS,W,M0);g.setTransform(M0);if(!gnd)ST.n2=anim(g,X,Y,Z,cx,cy,vw,vh,YS,t/1000,W,M0);g.restore();g.setTransform(M0)}
/* 2.5D: một tấm phủ trong suốt (canvas 768×576) nằm sát mặt đất, chỉ vẽ phần chuyển động trong tầm nhìn; không có nước trong tầm nhìn → ẩn, không vẽ */
const CW=448,CH=336;const ST={n2:0,n3:0,ms3:0,on3:false,fr:0},O3={m:null,cv:null,g:null,tex:null};
function upd3(t,vx0,vx1,vy0,vy1){const V=SH.V25&&SH.V25.T15,W=globalThis.W15;if(!V||!W)return;const T3=V.T;
 const w=Math.min(96,vx1-vx0),h=Math.min(72,vy1-vy0),cx=(vx0+vx1)/2,cy=(vy0+vy1)/2,ax=cx-w/2,ay=cy-h/2;let any=false;
 for(const l of W.LKS)if(Math.abs(l.x-cx)<w/2+l.r&&Math.abs(l.y-cy)<h/2+l.r){any=true;break}
 if(!any)for(const r of W.RV){for(let i=0;i<r.N;i+=6)if(r.X[i]>ax&&r.X[i]<ax+w&&r.Y[i]>ay&&r.Y[i]<ay+h){any=true;break}if(any)break}
 if(!any){if(O3.m)O3.m.visible=false;ST.on3=false;return}
 if(!O3.m){O3.cv=document.createElement('canvas');O3.cv.width=CW;O3.cv.height=CH;O3.g=O3.cv.getContext('2d');O3.tex=new T3.CanvasTexture(O3.cv);O3.tex.minFilter=O3.tex.magFilter=T3.LinearFilter;O3.tex.generateMipmaps=false;
  O3.m=new T3.Mesh(new T3.PlaneGeometry(1,1),new T3.MeshBasicMaterial({map:O3.tex,transparent:true,depthWrite:false}));O3.m.rotation.x=-Math.PI/2;O3.m.renderOrder=-2;O3.m.frustumCulled=false;V.scene.add(O3.m)}
 if(O3.m.visible&&(ST.fr++&1))return;/* cập nhật 1/2 số khung (~30 lần/giây): đủ mượt, giảm một nửa chi phí nạp texture */
 const t0=performance.now(),g=O3.g,K=Math.min(CW/w,CH/h),X=x=>(x-ax)*K,Y=y=>(y-ay)*K;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,CW,CH);
 ST.n3=anim(g,X,Y,K,cx,cy,w/2,h/2,1,t/1000,W,new DOMMatrix(),true);O3.tex.needsUpdate=true;O3.m.visible=true;O3.m.scale.set(CW/K,CH/K,1);O3.m.position.set(ax+CW/2/K,.075,ay+CH/2/K);ST.ms3=ST.ms3*.9+(performance.now()-t0)*.1;ST.on3=true}
const hook=()=>{const W=globalThis.W15;if(!W||!W.upd3||W.upd3.m26)return;const u0=W.upd3;W.upd3=(t,a,b,c,d)=>{const r=u0(t,a,b,c,d);try{upd3(t,a,b,c,d)}catch(e){if(!ST.e){ST.e=1;console.warn('[M26W] 2.5D',e)}}return r};W.upd3.m26=1};
addEventListener('load',hook);setTimeout(hook,0);
globalThis.M26W={over,ST,hook};})();
