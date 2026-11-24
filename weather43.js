/* Weather 43: game-time storm, rain exposure and existing thermal/crafting integration. */
(()=>{'use strict';
const H=globalThis.SH;if(!H)return;
const S=H.S,X=H.X;
const fresh=()=>({wet:0,dry:0,hypo:false,loss:0,warned:false,started:false,ended:false});
let state=fresh();
const stormAt=g=>g>=168&&g<240;
function sheltered(){
 if(H.IH())return true;
 const N=globalThis.NHA;if(!N)return false;
 const bases=(N.bases?N.bases():[]).concat(N.EXTRA||[],N.PB?[N.PB]:[]);
 return bases.some(b=>{if(!b||(b===N.PB&&globalThis.CO&&CO.none)||(b.st&&b.st!=='built'&&b.st!=='home'))return false;
 const r=N.houseRect(b,b.lv||1),p=H.pos;return r&&p.x>=r[0]&&p.x<=r[2]&&p.y>=r[1]&&p.y<=r[3]});
}
const coated=()=>S.eqp?.a==='raincoat43';
function announce(t){H.M19?.sys(t,{notice45:true});H.say(t)}
function maybeWarning45(){
 const N=H.F5.weatherNotice45;if(!N||!S.on||S.dead||document.body.classList.contains('intro'))return;
 H.M19?.weatherWarning45(N.text,false);
 if(S.pz||H.F5.SYS.active)return;
 const st=N.state,g=H.GT;if(st.st===2)return;
 if(st.st!==1&&!(g>=120&&g<168))return;
 if(N.open(st.st===1)){state.warned=true;H.M19?.weatherWarning45(N.text);try{H.SAVE.save('weather-notice45',false)}catch(e){}}
}
setInterval(maybeWarning45,500);
function step(hours){
 if(!S.on||S.dead||S.pz||!Number.isFinite(hours)||hours<=0)return;
 const g=H.GT,active=stormAt(g),safe=sheltered()||coated();
 maybeWarning45();
 if(active&&!state.started){state.started=true;announce('⛈ Mưa bão bắt đầu, kéo dài đến hết ngày 10. Trú trong nhà hoặc mặc áo mưa; nước gừng và lửa giúp giữ ấm.');}
 if(g>=240&&state.started&&!state.ended){state.ended=true;announce('🌤 Mưa bão đã kết thúc.');}
 if(active&&!safe){state.wet+=Math.min(hours,Math.max(0,g-168));state.dry=0;
 if(state.wet+1e-9>=3&&!state.hypo){state.hypo=true;announce('🥶 Hạ thân nhiệt: đã dầm mưa 3 giờ. Hãy trú mưa, mặc áo mưa và giữ ấm.');}
 const loss=Math.min(15,Math.max(0,Math.floor((state.wet-3+1e-9)/2)));
 if(state.hypo&&loss>state.loss){state.loss=loss;announce('🥶 Vẫn dầm mưa: giảm thêm 1 ô thân nhiệt sau mỗi 2 giờ. Hãy tìm chỗ trú mưa.');}}
 else{state.wet=0;if(state.hypo){state.dry+=hours;if(state.dry>=1){state.hypo=false;state.loss=0;state.dry=0;announce('🌡 Bạn đã hồi phục sau khi giữ khô 1 giờ.');}}}
}
X.EQ.raincoat43={n:'Áo mưa',s:'a',ic:'🧥',r:0};
const oldRecipes=H.F5.recipes;
H.F5.recipes=function(){return oldRecipes.apply(this,arguments).concat({n:'Áo mưa · chống dầm mưa (mặc ở ô Giáp)',cost:{plas:6,wood:2},eq:'raincoat43'});};
const style=document.createElement('style');style.textContent=`
body.lowhp43 #cv,body.lowhp43 #cv3{filter:blur(1.7px)}
#weather43{position:fixed;inset:0;pointer-events:none;z-index:2;display:none;background:rgba(21,35,55,.15);overflow:hidden}
#weather43:before{content:'';position:absolute;inset:-100%;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='160'%3E%3Cpath d='M20 0L5 40M90 65L75 105M135 125L122 159' stroke='%23d3e9ff' stroke-opacity='.45' stroke-width='1.5'/%3E%3C/svg%3E");animation:rain43 .65s linear infinite;transform:rotate(5deg)}
@keyframes rain43{to{translate:-60px 160px}}
#health43{position:fixed;inset:0;z-index:3;pointer-events:none;display:none;box-shadow:inset 0 0 90px 20px #b0000066}
#status43{position:fixed;top:48px;left:50%;transform:translateX(-50%);z-index:31;pointer-events:none;color:#fff;background:#112338cc;border-radius:8px;padding:5px 9px;font-size:12px;text-align:center;max-width:75vw}
`;document.head.append(style);
const rain=document.createElement('div');rain.id='weather43';const health=document.createElement('div');health.id='health43';const status=document.createElement('div');status.id='status43';document.body.append(rain,health,status);
function render(){const playing=S.on&&!S.dead,low=playing&&S.hp<S.mhp*.2,active=playing&&stormAt(H.GT);document.body.classList.toggle('lowhp43',low);health.style.display=low?'block':'none';rain.style.display=active&&!sheltered()?'block':'none';const msg=[low?'⚠ Máu dưới 20%':null,active?'⛈ Mưa bão · ngày 8–10':null,state.hypo&&playing?'🥶 Hạ thân nhiệt'+(state.loss?' · giảm thêm '+state.loss+' ô':''):null,active&&coated()?'🧥 Đang mặc áo mưa':null].filter(Boolean).join(' · ');status.textContent=msg;status.style.display=msg?'block':'none';}
const api=globalThis.WEATHER43={step,stormAt,sheltered,coated,render,get state(){return state}};
H.SAVE.register({id:'weather43',scope:'player',version:1,defaults:fresh,validate:d=>d&&typeof d==='object',get:()=>({...state}),set:d=>{state={wet:Math.max(0,Math.min(72,+d.wet||0)),dry:Math.max(0,Math.min(1,+d.dry||0)),hypo:!!d.hypo,loss:d.hypo?Math.max(0,Math.min(15,Math.floor(+d.loss||0))):0,warned:!!d.warned,started:!!d.started,ended:!!d.ended};render()}});
setInterval(render,200);render();
})();
