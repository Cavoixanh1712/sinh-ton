/* SAFE HAVEN V2 · bản thử 2.500 m · m26road.js — CHỈ HIỂN THỊ đường đất/đường mòn (2D + nền 2.5D dùng chung)
   - mặt đường: texture đất cắt từ asset người dùng gửi; viền: bụi cỏ asset mọc lấn mép (không còn viền thẳng xám)
   - góc gấp được bo cong khi VẼ (cắt ≤6 m mỗi bên, lệch tối đa ~2 m); không bo trong 16 m quanh cầu/cổng/đầu mút
   - bề rộng, tuyến logic (roadAt), va chạm: KHÔNG đổi. Đường phố ('city') và lối vào nhà ('drive') giữ nguyên. */
(()=>{const I={};for(const k of['rd_dirt','rd_tuft']){const im=new Image();im.src='art9/'+k+'.png';I[k]=im}
const ok=()=>I.rd_dirt.complete&&I.rd_dirt.naturalWidth>0&&I.rd_tuft.complete&&I.rd_tuft.naturalWidth>0;
const PT=new WeakMap();const pats=g=>{let p=PT.get(g);if(!p){p={d:g.createPattern(I.rd_dirt,'repeat'),t:g.createPattern(I.rd_tuft,'repeat')};PT.set(g,p)}return p};
let FIX=null;const fixed=()=>{if(FIX)return FIX;const W=globalThis.W15;FIX=[];if(W&&W.M3){for(const b of W.M3.BRG)FIX.push([b.x,b.y]);for(const q of W.V2.gates.concat(W.V2.cgates||[]))FIX.push(q.at)}return FIX};
const near=p=>{for(const f of fixed())if(Math.abs(f[0]-p[0])<16&&Math.abs(f[1]-p[1])<16)return true;return false};
const CACHE=new WeakMap();
function curve(r){let c=CACHE.get(r);if(c)return c;const P=r.p,n=P.length;c=[['M',P[0]]];for(let i=1;i<n-1;i++){const a=P[i-1],b=P[i],d=P[i+1],la=Math.hypot(b[0]-a[0],b[1]-a[1]),lb=Math.hypot(d[0]-b[0],d[1]-b[1]);
  const k=Math.min(6,la*.45,lb*.45);if(k<1||near(b)){c.push(['L',b]);continue}c.push(['L',[b[0]+(a[0]-b[0])*k/la,b[1]+(a[1]-b[1])*k/la]],['Q',b,[b[0]+(d[0]-b[0])*k/lb,b[1]+(d[1]-b[1])*k/lb]])}
 c.push(['L',P[n-1]]);CACHE.set(r,c);return c}
function path(g,r,X,Y){g.beginPath();for(const s of curve(r)){if(s[0]=='M')g.moveTo(X(s[1][0]),Y(s[1][1]));else if(s[0]=='L')g.lineTo(X(s[1][0]),Y(s[1][1]));else g.quadraticCurveTo(X(s[1][0]),Y(s[1][1]),X(s[2][0]),Y(s[2][1]))}}
const soft=r=>r.kind!='city'&&r.kind!='drive';
function draw(g,vis,X,Y,Z,YS){const L=vis.filter(soft);if(!L.length)return;const p=pats(g),sd=4/128,st=3.4/96;
 p.d.setTransform(new DOMMatrix([Z*sd,0,0,Z*YS*sd,X(0),Y(0)]));p.t.setTransform(new DOMMatrix([Z*st,0,0,Z*YS*st,X(0),Y(0)]));
 for(const r of L){path(g,r,X,Y);g.strokeStyle='rgba(60,45,25,.28)';g.lineWidth=Z*(r.w+.7);g.stroke()}      // bóng mép mềm
 for(const r of L){path(g,r,X,Y);g.strokeStyle=p.d;g.lineWidth=Z*r.w;g.stroke()}                             // mặt đất (đúng bề rộng)
 for(const r of L){path(g,r,X,Y);g.strokeStyle=p.t;g.lineWidth=Z*(r.w+2);g.stroke()}                         // bụi cỏ lấn mép
 for(const r of L){path(g,r,X,Y);g.strokeStyle=p.d;g.lineWidth=Z*Math.max(1.2,r.w-1.5);g.stroke()}           // lòng đường sạch
 for(const r of L)if(r.w<6){path(g,r,X,Y);g.strokeStyle='rgba(70,50,25,.18)';g.lineWidth=Z*Math.max(.6,r.w*.28);g.stroke()}}// vệt mòn giữa đường mòn
globalThis.M26RD={ok,path,draw,soft,curve};})();
