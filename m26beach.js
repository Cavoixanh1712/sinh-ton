/* SAFE HAVEN V2 · bản thử 2.500 m · m26beach.js (Lần 13) — CHỈ HIỂN THỊ: bãi cát quanh bờ BIỂN THẬT (W15.LKS có sea)
   Hình bãi cát bám đúng đường bờ thật (l.r·l.k), rộng 14–36 m uốn lượn, mép ngoài loang dần + cỏ mọc lấn. Không va chạm, không đổi dữ liệu. */
(()=>{const I={};for(const k of['sand','rd_tuft']){const im=new Image();im.src='art9/'+k+'.png';I[k]=im}
const PT=new WeakMap();let B=null;
function init(W){const l=W.LKS.find(q=>q.sea);if(!l)return B={none:1};const N=384,inn=[],out=[],WB=SH.WB;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
 for(let i=0;i<N;i++){const a=i/N*Math.PI*2,f=i/N*64,i0=Math.floor(f)%64,i1=(i0+1)%64,kk=l.k[i0]*(1-(f-Math.floor(f)))+l.k[i1]*(f-Math.floor(f)),R=l.r*kk,w=24+9*Math.sin(a*41+1.3)+5*Math.sin(a*97+.4)+3*Math.sin(a*211);
  const c=Math.cos(a),s=Math.sin(a)*(l.ry||1);inn.push([l.x+c*R,l.y+s*R]);const o=[l.x+c*(R+w),l.y+s*(R+w)];out.push(o);
  if(o[0]>WB.x0-40&&o[0]<WB.x1+40&&o[1]>WB.y0-40&&o[1]<WB.y1+40){x0=Math.min(x0,o[0]);y0=Math.min(y0,o[1]);x1=Math.max(x1,o[0]);y1=Math.max(y1,o[1])}}
 return B={l,inn,out,bb:[Math.min(x0,WB.x0)-12,y0-12,x1+12,Math.max(y1,WB.y1)+12],none:x0>x1}}
const pth=(g,P,X,Y)=>{g.beginPath();P.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.closePath()};
function draw(g,X,Y,Z,cx,cy,vw,vh,YS){const W=globalThis.W15;if(!W||!W.LKS)return;if(!B)init(W);if(B.none)return;const b=B.bb;if(cx+vw<b[0]||cx-vw>b[2]||cy+vh<b[1]||cy-vh>b[3])return;
 if(!(I.sand.complete&&I.sand.naturalWidth))return;let p=PT.get(g);if(!p){p={s:g.createPattern(I.sand,'repeat'),t:I.rd_tuft.complete&&I.rd_tuft.naturalWidth?g.createPattern(I.rd_tuft,'repeat'):null};PT.set(g,p)}
 const ss=5/128,st=3.4/96;p.s.setTransform(new DOMMatrix([Z*ss,0,0,Z*YS*ss,X(0),Y(0)]));if(p.t)p.t.setTransform(new DOMMatrix([Z*st,0,0,Z*YS*st,X(0),Y(0)]));
 g.save();g.lineJoin='round';pth(g,B.out,X,Y);
 g.strokeStyle='rgba(226,208,156,.22)';g.lineWidth=Z*16;g.stroke();g.strokeStyle='rgba(226,208,156,.4)';g.lineWidth=Z*8;g.stroke();   // loang cát → cỏ
 g.fillStyle=p.s;g.fill();
 if(p.t){g.strokeStyle=p.t;g.lineWidth=Z*7;g.globalAlpha=.9;g.stroke();g.globalAlpha=1}                                                // cỏ mọc lấn mép cát
 pth(g,B.inn,X,Y);g.strokeStyle='rgba(140,112,70,.06)';for(const w of[18,15,12,9.5,7.5,5.5,4,2.5]){g.lineWidth=Z*w;g.stroke()} // cát ướt sát mép nước
 g.restore()}
globalThis.M26B={draw,get B(){return B}};})();
