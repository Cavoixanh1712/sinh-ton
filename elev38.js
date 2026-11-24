/* ELEV38 (22/11): HỆ ĐỘ CAO THẬT cho thế giới 2.5D.
   Trước bản này mặt đất 2.5D là các ô phẳng ở y=0, mọi vật đặt ở y≈0 → không có tầng địa hình.
   ELEV38 thêm:
   - Trường độ cao dạng lưới (ô 0,5 m, nội suy song tuyến): G = mặt đất (có cả khe núi khoét sâu), O = độ cao chỗ đứng (cầu bắc qua khe giữ độ cao mặt cầu).
   - Ô nền 2.5D trong vùng có độ cao được dựng thành lưới 3D thật (đỉnh lưới = độ cao), mặt dốc đứng tô đá, có ghi chiều sâu → vật ở sau vách bị che thật.
   - Mọi vật trong vùng (cây, đá, quặng, nhân vật, quái, người chơi khác, cầu…) được nâng đúng độ cao chỗ đứng ngay trước khi vẽ rồi trả lại → không đụng logic game.
   - Camera dâng theo độ cao người chơi (mượt); nhãn/thanh máu trên đầu được chỉnh theo độ cao.
   - Va chạm: ô có độ dốc lớn (vách) được gộp thành hình chữ nhật chặn trong SH.cols → không đi xuyên vách; đường đèo (dốc thoải) đi được.
   - 2D cổ điển: vẽ mặt vách đá ở mép tầng (chế độ 2D vốn nhìn thẳng từ trên xuống, không có trục cao).
   Khu dùng: hiện chỉ Núi Tuyết (NUITUYET38 gọi ELEV38.set). Ngoài vùng: độ cao 0 → mọi thứ như cũ. */
(()=>{'use strict';
const E={on:false,ch:0,F:null,ver:0,L:[],stats:{tiles:0,geoMs:0,lifted:0}};
globalThis.ELEV38=E;
/* Visual material only: the elevation grids, geometry and collision routines stay unchanged. */
const cliff40Image=new Image();let cliff40Texture=null;
cliff40Image.onload=()=>{if(cliff40Texture)cliff40Texture.needsUpdate=true;E.stats.cliffMaterialReady=true};
if(globalThis.BACHVAN40_TEXTURE)cliff40Image.src=BACHVAN40_TEXTURE;
function cliff40Map(T){if(!cliff40Texture){cliff40Texture=new T.Texture(cliff40Image);cliff40Texture.minFilter=T.LinearFilter;cliff40Texture.magFilter=T.LinearFilter;cliff40Texture.generateMipmaps=false;if(cliff40Image.complete&&cliff40Image.naturalWidth)cliff40Texture.needsUpdate=true}return cliff40Texture}
const SN=Math.sin(Math.PI/3),CS=Math.cos(Math.PI/3);
/* F = {x0,y0,res,nx,ny,G,O,B,bb:[x0,y0,x1,y1],maxH} */
E.set=F=>{E.F=F;E.on=true;E.ver++;GEO.clear();E.ch=0};
function samp(A,x,y){const F=E.F;const fx=(x-F.x0)/F.res,fy=(y-F.y0)/F.res;if(!(fx>=0&&fy>=0&&fx<F.nx-1&&fy<F.ny-1))return 0;const i=fx|0,j=fy|0,u=fx-i,v=fy-j,k=j*F.nx+i,n=F.nx;const a=A[k],b=A[k+1],c=A[k+n],d=A[k+n+1];return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
E.h=(x,y)=>E.F?samp(E.F.G,x,y):0;
E.hObj=(x,y)=>E.F?samp(E.F.O,x,y):0;
E.cell=(x,y)=>{const F=E.F;if(!F)return -1;const i=Math.round((x-F.x0)/F.res),j=Math.round((y-F.y0)/F.res);if(i<0||j<0||i>=F.nx||j>=F.ny)return -1;return j*F.nx+i};
E.blocked=(x,y)=>{const k=E.cell(x,y);return k>=0&&!!E.F.B[k]};
const inBB=(x,y,m)=>{const b=E.F.bb;return x>b[0]-m&&x<b[2]+m&&y>b[1]-m&&y<b[3]+m};
E.near=(x,y,m)=>!!E.F&&inBB(x,y,m||0);
/* camera: độ cao đích = chỗ người chơi đứng; dịch chuyển xa (dịch chuyển tức thời) → nhảy luôn */
E.camH=(dt,px,py,ih)=>{if(!E.F||ih){E.ch=0;return 0}const t=E.hObj(px,py);if(globalThis.W15?.zoneAt2(px,py)?.n==='Đỉnh Bạch Vân'){E.ch=t;return t}if(Math.abs(t-E.ch)>9)E.ch=t;else E.ch+=(t-E.ch)*(1-Math.exp(-(dt||.016)*7));if(Math.abs(E.ch)<1e-3)E.ch=0;return E.ch};
/* WALK41: only snow mountain walking. Sweep along the requested move instead of
   pushing a penetrated cliff to an unrelated side. Keep every existing collider. */
E.walk41=(p,ox,oy,hit,r)=>{
 const W=globalThis.W15;if(!E.F||!W||W.zoneAt2(ox,oy)?.n!=='Đỉnh Bạch Vân'||W.P.fallA)return false;
 const dx=p.x-ox,dy=p.y-oy,dist=Math.hypot(dx,dy);if(dist>3||hit(ox,oy,r))return false;
 const steps=Math.max(1,Math.ceil(dist/.10)),sx=dx/steps,sy=dy/steps;
 let x=ox,y=oy;
 const clear=(a,b)=>!hit(a,b,r)&&!E.blocked(a,b)&&Math.abs(E.hObj(a,b)-E.hObj(x,y))<=Math.hypot(a-x,b-y)*.9+.035;
 for(let i=0;i<steps;i++){
  if(clear(x+sx,y+sy)){x+=sx;y+=sy;continue}
  if(Math.abs(sx)>=Math.abs(sy)){if(sx&&clear(x+sx,y))x+=sx;if(sy&&clear(x,y+sy))y+=sy}
  else{if(sy&&clear(x,y+sy))y+=sy;if(sx&&clear(x+sx,y))x+=sx}
 }
 p.x=x;p.y=y;return true;
};
/* phần mở rộng vùng nhìn (m theo trục bắc–nam) để không cắt mất vật/ô nền ở tầng cao hơn/thấp hơn */
E.pad=(cx,cy)=>E.F&&inBB(cx,cy,90)?E.F.maxH*CS/SN+2:0;

/* ---------- ô nền 2.5D dạng lưới độ cao ---------- */
const GEO=new Map();
E.tile=(i,j,TS)=>{const F=E.F;if(!F)return null;const key=i+','+j+','+TS;if(GEO.has(key))return GEO.get(key);
 const x0=i*TS,y0=j*TS,b=F.bb;let g=null;
 if(x0+TS>b[0]&&x0<b[2]&&y0+TS>b[1]&&y0<b[3]){const t0=performance.now(),N=Math.round(TS/F.res),cx=x0+TS/2,cz=y0+TS/2;let mx=0;
  const P=new Float32Array((N+1)*(N+1)*3),NR=new Float32Array((N+1)*(N+1)*3),UV=new Float32Array((N+1)*(N+1)*2),TP=new Float32Array((N+1)*(N+1));
  for(let r=0;r<=N;r++)for(let c=0;c<=N;c++){const x=x0+c*F.res,z=y0+r*F.res,h=E.h(x,z),q=r*(N+1)+c;if(h>mx)mx=h;
   P[q*3]=x-cx;P[q*3+1]=h;P[q*3+2]=z-cz;UV[q*2]=c/N;UV[q*2+1]=1-r/N;TP[q]=E.topAt(x,z,h);
   const e=F.res,hx=(E.h(x+e,z)-E.h(x-e,z))/(2*e),hz=(E.h(x,z+e)-E.h(x,z-e))/(2*e),l=Math.hypot(hx,1,hz);NR[q*3]=-hx/l;NR[q*3+1]=1/l;NR[q*3+2]=-hz/l}
  if(mx>.02){const T=globalThis.THREE,ix=new(((N+1)*(N+1))>65535?Uint32Array:Uint16Array)(N*N*6);let n=0;
   for(let r=0;r<N;r++)for(let c=0;c<N;c++){const a=r*(N+1)+c,b2=a+1,d=a+N+1,e2=d+1;ix[n++]=a;ix[n++]=d;ix[n++]=b2;ix[n++]=b2;ix[n++]=d;ix[n++]=e2}
   g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(P,3));g.setAttribute('normal',new T.BufferAttribute(NR,3));g.setAttribute('uv',new T.BufferAttribute(UV,2));g.setAttribute('aTop',new T.BufferAttribute(TP,1));g.setIndex(new T.BufferAttribute(ix,1));g.computeBoundingSphere();g.computeBoundingBox();
   E.stats.tiles++;E.stats.geoMs=+(performance.now()-t0).toFixed(1)}}
 GEO.set(key,g);return g};
/* độ cao mép trên vách gần điểm (để vẽ mũ tuyết & nhũ băng rủ từ mép trên) */
E.topAt=(x,z,h)=>{let m=h;for(let dz=-1.5;dz<=1.5;dz+=.5)for(let dx=-1.5;dx<=1.5;dx+=.5){const v=E.h(x+dx,z+dz);if(v>m)m=v}return m};
/* vật liệu: giữ nguyên màu ô nền (MeshBasic như cũ) + tô đá ở mặt dốc + đổ bóng theo hướng mặt; đẩy chiều sâu lùi ~1 m để chân sprite không bị cắt */
const VS_HEAD='attribute float aTop;\nvarying float vTop;\nvarying vec3 vWP;\nvarying vec3 vNW;\n';
const FS_HEAD=`uniform sampler2D cliff40Map;
varying float vTop;
varying vec3 vWP;
varying vec3 vNW;
float e38h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float e38n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(e38h(i),e38h(i+vec2(1.0,0.0)),f.x),mix(e38h(i+vec2(0.0,1.0)),e38h(i+vec2(1.0)),f.x),f.y);}
`;
/* mặt vách kiểu cột đá xám (khe nứt dọc, gờ sáng, tuyết đọng trên gờ) – giống ảnh mẫu */
const FS_MAIN=`#include <map_fragment>
{vec3 n=normalize(vNW);float st=1.0-smoothstep(0.38,0.72,n.y);
 if(st>0.002){vec3 p=vWP;float u=abs(n.z)>=abs(n.x)?p.x:p.z+0.37;float dTop=max(vTop-p.y,0.0);
  /* Painted vertical stone columns, projected in world coordinates on both wall orientations. */
  vec2 uvX=fract(vec2(p.x*0.115,p.y*0.115));
  vec2 uvZ=fract(vec2(p.z*0.115,p.y*0.115));
  float facing=pow(abs(n.z),4.0)/(pow(abs(n.x),4.0)+pow(abs(n.z),4.0)+0.0001);
  vec3 rock=mix(texture2D(cliff40Map,uvZ).rgb,texture2D(cliff40Map,uvX).rgb,facing);
  rock*=0.94+0.12*e38n(vec2(u*0.29,p.y*0.22));
  /* nhũ băng rủ từ mép trên + mũ tuyết */
  float ic=u*2.4;float ici=floor(ic),icf=fract(ic);float len=0.35+2.25*e38h(vec2(ici,5.3))*e38h(vec2(ici,8.1)+0.5);
  float k=clamp(1.0-dTop/len,0.0,1.0);float icm=(1.0-smoothstep(0.42*k-0.04,0.42*k,abs(icf-0.5)))*step(dTop,len);
  rock=mix(rock,mix(vec3(0.66,0.84,0.96),vec3(0.97,0.99,1.0),k),icm*0.95);
  rock=mix(rock,vec3(0.95,0.97,0.99),1.0-smoothstep(0.18+0.10*e38n(vec2(u*2.1,5.0)),0.48+0.14*e38n(vec2(u*1.3,9.0)),dTop));
  rock=mix(rock,vec3(0.93,0.95,0.98),smoothstep(0.3,0.38,n.y)*0.6);
  diffuseColor.rgb=mix(diffuseColor.rgb,rock,st);}
 vec3 L=normalize(vec3(0.35,1.0,0.62));diffuseColor.rgb*=(0.73+0.45*max(dot(n,L),0.0))/1.0967;}`;
E.mat=tx=>{const T=globalThis.THREE;const m=new T.MeshBasicMaterial({map:tx,side:T.FrontSide,depthWrite:true});
 m.onBeforeCompile=s=>{s.uniforms.cliff40Map={value:cliff40Map(T)};s.vertexShader=VS_HEAD+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=(modelMatrix*vec4(position,1.0)).xyz;vNW=normal;vTop=aTop;').replace('#include <project_vertex>','#include <project_vertex>\ngl_Position.z+=0.0024*gl_Position.w;');
  s.fragmentShader=FS_HEAD+s.fragmentShader.replace('#include <map_fragment>',FS_MAIN)};
 m.customProgramCacheKey=()=>'elev38-bachvan40';return m};

/* ---------- nâng vật thể ngay trước khi vẽ, trả lại ngay sau khi vẽ ---------- */
function lift(o){const p=o.position;if(!inBB(p.x,p.z,1))return;const L=E.hObj(p.x,p.z);if(L>.01){p.y+=L;E.L.push(o,L)}}
E.pre=scene=>{E.L.length=0;if(!E.F)return;for(const o of scene.children){if(!o.visible||o.userData.ev38skip)continue;const p=o.position;
  if(p.x===0&&p.z===0){for(const c of o.children){const q=c.position;if(c.visible&&!(q.x===0&&q.z===0))lift(c)}continue}
  lift(o)}E.stats.lifted=E.L.length/2};
E.post=()=>{const L=E.L;for(let i=0;i<L.length;i+=2)L[i].position.y-=L[i+1];L.length=0};

/* ---------- va chạm từ độ dốc: gộp ô chặn thành hình chữ nhật ---------- */
E.rects=()=>{const F=E.F,B=F.B,nx=F.nx,ny=F.ny,r=F.res,out=[];let open=new Map();
 for(let j=0;j<=ny;j++){const runs=new Map();if(j<ny){let i=0;while(i<nx){if(!B[j*nx+i]){i++;continue}let k=i;while(k<nx&&B[j*nx+k])k++;runs.set(i+':'+k,[i,k]);i=k}}
  const nopen=new Map();for(const[key,rc]of open){if(runs.has(key)){rc.j1=j+1;nopen.set(key,rc);runs.delete(key)}else out.push(rc)}
  for(const[key,[i,k]]of runs)nopen.set(key,{i0:i,i1:k,j0:j,j1:j+1});open=nopen}
 return out.map(q=>[F.x0+(q.i0-.5)*r,F.y0+(q.j0-.5)*r,F.x0+(q.i1-.5)*r,F.y0+(q.j1-.5)*r])};

/* ---------- 2D cổ điển: mặt vách ở mép tầng ---------- */
const hsh=(i,j)=>{let n=Math.imul(i,73856093)^Math.imul(j,19349663);n=Math.imul(n^n>>>13,0x5bd1e995);return((n^n>>>15)>>>0)/4294967296};
E.faces2D=(g,Xf,Yf,Z,VB)=>{const F=E.F;if(!F)return;const G=F.G,nx=F.nx,r=F.res;
 const i0=Math.max(1,Math.floor((VB[0]-F.x0)/r)),i1=Math.min(nx-2,Math.ceil((VB[2]-F.x0)/r)),j0=Math.max(1,Math.floor((VB[1]-F.maxH*.5-F.y0)/r)),j1=Math.min(F.ny-2,Math.ceil((VB[3]-F.y0)/r));if(i1<i0||j1<j0)return;
 const cw=r*Z+.8;g.save();
 // mỗi cột 0,5 m: gom dải dốc liên tiếp thành MỘT mặt vách (không vẽ từng ô → không vỡ khối)
 for(let i=i0;i<=i1;i++){const x=F.x0+i*r,X=Xf(x-r/2),ph=x*1.9+Math.sin(x*.37)*3,sd=Math.cos(ph),fr=Math.abs(((ph/6.2832)%1+1)%1-.5);
  const base=.62+.2*Math.max(0,Math.min(1,.55+.45*sd)),crev=fr<.06;
  let j=j0;while(j<=j1){const k=j*nx+i,d=G[k]-G[k+nx];
   if(d>.3){let e=j;while(e<j1+40&&e<F.ny-2&&G[e*nx+i]-G[(e+1)*nx+i]>.3)e++;const drop=G[k]-G[(e)*nx+i];
    if(drop>1.5){const ye=F.y0+j*r,L=Math.min(drop*.3,6),Y0=Yf(ye),Y1=Yf(ye+L),Hh=Y1-Y0,c=v=>Math.round(v*base)|0;
     const gr=g.createLinearGradient(0,Y0,0,Y1);gr.addColorStop(0,'rgb('+c(150)+','+c(155)+','+c(166)+')');gr.addColorStop(.75,'rgb('+c(118)+','+c(124)+','+c(136)+')');gr.addColorStop(1,'rgb('+c(76)+','+c(82)+','+c(94)+')');
     g.fillStyle=gr;g.fillRect(X,Y0,cw,Hh);
     if(cliff40Image.complete&&cliff40Image.naturalWidth){const tw=cliff40Image.naturalWidth,th=cliff40Image.naturalHeight,sx=((x*.115)%1+1)%1*tw,sw=Math.min(tw-sx,r*.115*tw);if(sw>0)g.drawImage(cliff40Image,sx,0,sw,th,X,Y0,cw,Hh)}
     if(crev){g.fillStyle='rgba(22,26,34,.55)';g.fillRect(X,Y0,cw,Hh)}
     const v=hsh(i>>1,j>>2);if(v>.72){g.fillStyle='rgba(238,244,251,.85)';g.fillRect(X,Y0+Hh*(.3+.4*hsh(i>>2,j)),cw,Math.max(1,Z*.1))}
     g.fillStyle='rgba(242,246,252,.97)';g.fillRect(X,Y0-1,cw,Math.max(2,Z*.20));
     const ice=(.15+.9*hsh(i,7)*hsh(i,13))*Z;g.fillStyle='rgba(183,222,246,.94)';g.beginPath();g.moveTo(X,Y0);g.lineTo(X+cw,Y0);g.lineTo(X+cw*.5,Y0+Math.min(Hh*.6,ice));g.closePath();g.fill();}
    else if(drop<-1.5){}
    j=e+1;continue}
   if(d<-.3){let e=j;while(e<j1+40&&e<F.ny-2&&G[(e+1)*nx+i]-G[e*nx+i]>.3)e++;if(G[(e+1)*nx+i]-G[k]>1.5){g.fillStyle='rgba(40,48,62,.5)';g.fillRect(X,Yf(F.y0+(e+.5)*r)-1,cw,Math.max(1.5,Z*.16))}j=e+1;continue}
   j++}}
 // mép vách quay đông/tây: một đường tối cho cả dải
 for(let j=j0;j<=j1;j++){const y=F.y0+j*r;let i=i0;while(i<=i1){const k=j*nx+i,d=G[k]-G[k+1];if(Math.abs(d)>.3){let e=i;while(e<i1+20&&Math.abs(G[j*nx+e]-G[j*nx+e+1])>.3&&Math.sign(G[j*nx+e]-G[j*nx+e+1])===Math.sign(d))e++;const tot=G[k]-G[j*nx+e];
    if(Math.abs(tot)>1.5){const xe=F.x0+(tot>0?e:i)*r;g.fillStyle=tot>0?'rgba(52,60,74,.6)':'rgba(96,104,120,.55)';g.fillRect(Xf(xe)-Math.max(1,Z*.08),Yf(y-r/2),Math.max(2,Z*.16),r*Z+.8)}i=e+1;continue}i++}}
 g.restore()};
})();
