/* Shared 2D/2.5D ground decoration for the planned walking lanes and roundabout islands. */
(()=>{'use strict';const S=globalThis.SH,W=globalThis.W15,D=globalThis.CITY5_DATA||globalThis.CITY4_DATA||globalThis.URBAN_DATA;if(!S||!W||!D)return;
const ground=W.ground;
W.ground=function(g,X,Y,Z,cx,cy,vw,vh,YS,t,gnd){ground.call(this,g,X,Y,Z,cx,cy,vw,vh,YS,t,gnd);g.save();
 g.lineCap='butt';g.lineJoin='round';
 for(const r of D.roundabouts){if(Math.abs(r.x-cx)>vw+6||Math.abs(r.y-cy)>vh+6)continue;
  g.beginPath();g.ellipse(X(r.x),Y(r.y),r.island*Z,r.island*Z*YS,0,0,Math.PI*2);g.fillStyle='#719d43';g.fill();g.lineWidth=.18*Z;g.strokeStyle='#d1c9a5';g.stroke()}
 g.restore()};
S.SAVE.register({id:'urbanPlan',scope:'world',version:1,defaults:()=>({revision:5}),get:()=>({revision:5})});
S.colsDirty&&S.colsDirty();globalThis.URBAN_READY=true;
try{S.V25.gtRedraw&&S.V25.gtRedraw(S.WB.x0,S.WB.y0,S.WB.x1,S.WB.y1)}catch(_){}
})();
