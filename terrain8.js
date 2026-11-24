/* Terrain display only. Official ownership/order/buffers: W15.ZV2 + W15.zoneAt2.
   SH.ZN still owns legacy gameplay/landmarks; never rewrite it or move world objects. */
(()=>{'use strict';const STYLE={
 'Thành Phố Thiên Đường':{type:'city',color:'#cdbf94',texture:'stone'},
 'Rừng Suối Mây':{type:'forest',color:'#5a8a3f',texture:'grass'},
 'Đỉnh Bạch Vân':{type:'snow',color:'#aab6cc'},
 'Hang Pha Lê':{type:'crystal',color:'#665780'},
 'Khu Di Tích Cổ':{type:'ruins',color:'#b6a17d'},
 'Cảng Hải Lam':{type:'port',color:'#c8b98c'},
 'Khu Công Nghiệp Zeta':{type:'industrial',color:'#898c94'},
 'Vực Dung Nham':{type:'lava',color:'#5f2b22'}};
const DEFAULT={type:'wilderness',color:'#5a8a3f',texture:'grass'},listeners=new Set();let raw='',sig='',generation=0;
const regions=()=>globalThis.W15?.ZV2||[];
function sync(){const next=JSON.stringify([STYLE,SH.WB,regions().map(z=>[z.n,z.poly,z.buf||null,z.bb,z.open])]);if(raw===next)return sig;raw=next;let h=2166136261;for(let i=0;i<raw.length;i++)h=Math.imul(h^raw.charCodeAt(i),16777619)>>>0;sig='terrain8-'+h.toString(16);generation++;for(const fn of listeners)fn(sig);return sig}
const zoneAt=(x,y)=>globalThis.W15?.zoneAt2(x,y)||null;
const styleFor=z=>z?(STYLE[z.n]||DEFAULT):DEFAULT;
const styleAt=(x,y)=>styleFor(zoneAt(x,y));
function append(g,P,X,Y,positive=false){if(!P?.length)return;let p=P;if(positive){let area=0;for(let i=0,j=P.length-1;i<P.length;j=i++)area+=P[j][0]*P[i][1]-P[i][0]*P[j][1];if(area<0)p=P.slice().reverse()}p.forEach((q,i)=>i?g.lineTo(X(q[0]),Y(q[1])):g.moveTo(X(q[0]),Y(q[1])));g.closePath()}
const shapes=z=>z.buf?[z.poly,z.buf]:[z.poly];
// Union the owner's polygon/buffer, then subtract all higher-priority regions.
// Sequential subtraction avoids XOR holes where a polygon and its buffer overlap.
function clip(g,z,X,Y){g.beginPath();for(const P of shapes(z))append(g,P,X,Y,true);g.clip('nonzero');const index=regions().indexOf(z),b=SH.WB;for(let i=0;i<index;i++)for(const P of shapes(regions()[i])){g.beginPath();g.rect(X(b.x0-2000),Y(b.y0-2000),X(b.x1+2000)-X(b.x0-2000),Y(b.y1+2000)-Y(b.y0-2000));append(g,P,X,Y);g.clip('evenodd')}}
const visible=(z,v)=>!z.bb||!(z.bb[2]<v[0]||z.bb[0]>v[2]||z.bb[3]<v[1]||z.bb[1]>v[3]);
function paintBase(g,X,Y,Z,cx,cy,vw,vh,texture){sync();const view=[cx-vw-2,cy-vh-2,cx+vw+2,cy+vh+2];for(const z of regions()){if(!visible(z,view))continue;g.save();clip(g,z,X,Y);const st=styleFor(z);g.fillStyle=st.color;g.fillRect(X(view[0]),Y(view[1]),X(view[2])-X(view[0]),Y(view[3])-Y(view[1]));if(st.texture&&texture)texture(st,z,view);g.restore()}}
const noise=(x,y)=>{const n=Math.sin(x*12.9898+y*78.233)*43758.5453;return n-Math.floor(n)};
function motifs(g,X,Y,Z,cx,cy,vw,vh,t){const view=[cx-vw-2,cy-vh-2,cx+vw+2,cy+vh+2];for(const z of regions()){if(!visible(z,view))continue;const st=styleFor(z);g.save();clip(g,z,X,Y);for(let gx=Math.floor(Math.max(view[0],z.bb[0]));gx<Math.min(view[2],z.bb[2]);gx++)for(let gy=Math.floor(Math.max(view[1],z.bb[1]));gy<Math.min(view[3],z.bb[3]);gy++){if(zoneAt(gx+.5,gy+.5)!==z)continue;const q=noise(gx,gy),x=X(gx+.5),y=Y(gy+.5);
 if(st.type==='snow'){if(q>.72){g.fillStyle='rgba(255,255,255,.75)';g.fillRect(x+q*.6*Z,y,Z*.14,Z*.14)}else if(q<.06){g.fillStyle='rgba(120,140,170,.35)';g.beginPath();g.moveTo(x,y);g.lineTo(x+Z*.4,y);g.lineTo(x+Z*.2,y-Z*.5);g.fill()}}
 else if(st.type==='crystal'){if(q>.93){const h=Z*(.45+.4*(q*9%1));g.fillStyle='rgba(150,120,255,.85)';g.beginPath();g.moveTo(x,y);g.lineTo(x+Z*.28,y);g.lineTo(x+Z*.14,y-h);g.fill()}else if(q<.08){g.fillStyle='rgba(180,160,255,.35)';g.fillRect(x,y,Z*.1,Z*.1)}}
 else if(st.type==='ruins'){if(q>.95){g.fillStyle='#8a8294';g.fillRect(x,y-Z*.5,Z*.35,Z*.5);g.fillStyle='#a39cb0';g.fillRect(x,y-Z*.5,Z*.35,Z*.15)}else if(q>.9){g.fillStyle='#756d80';g.fillRect(x,y-Z*.2,Z*.5,Z*.2)}}
 else if(st.type==='lava'){if(q>.55){g.strokeStyle='rgba(255,'+(90+60*Math.sin(t/300+q*20)|0)+',30,.9)';g.lineWidth=2;g.beginPath();g.moveTo(x,y);g.lineTo(x+Z*.5*(q*7%1),y+Z*.4*(q*3%1));g.lineTo(x+Z*.8*(q*5%1),y+Z*.1);g.stroke()}else if(q<.1){g.fillStyle='rgba(255,110,40,.25)';g.beginPath();g.arc(x,y,Z*.3,0,7);g.fill()}}
 else if(st.type==='city'||st.type==='industrial'){if((gx*7+gy*3)%9===0){g.fillStyle='rgba(255,255,255,.07)';g.fillRect(x-Z*.5,y-Z*.5,Z,Z)}}
 else if(st.type==='port'){if(q>.8){g.fillStyle='rgba(110,89,58,.16)';g.fillRect(x,y,Z*.22,Z*.08)}}
 }g.restore()}}
globalThis.TERRAIN8={regions,zoneAt,styleAt,styleFor,shapes,append,clip,paintBase,motifs,sync,get signature(){return sync()},get generation(){return generation},onInvalidate(fn){listeners.add(fn);return()=>listeners.delete(fn)},style:STYLE,defaultStyle:DEFAULT};
})();
