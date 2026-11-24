/* Rain ambience only: generated locally, unlocked by user input, no audio downloads. */
(()=>{'use strict';const H=globalThis.SH;if(!H)return;
let ctx=null,gain=null,source=null,failed=false;
const volume=()=>H.S.on&&!H.S.dead&&!H.S.pz&&!document.hidden&&globalThis.WEATHER43?.stormAt(H.GT)?(WEATHER43.sheltered()?.012:.065):0;
function sync(){if(!ctx||!gain)return;const v=volume();gain.gain.setTargetAtTime(v,ctx.currentTime,.18)}
async function unlock(){if(failed)return;try{if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C){failed=true;return}ctx=new C();const len=Math.floor(ctx.sampleRate*4),buf=ctx.createBuffer(2,len,ctx.sampleRate);let seed=440044;
 for(let ch=0;ch<2;ch++){const a=buf.getChannelData(ch);let brown=0;for(let i=0;i<len;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const white=seed/2147483648-1;brown=(brown+.025*white)/1.025;a[i]=white*.7+brown*1.8}}
 source=ctx.createBufferSource();source.buffer=buf;source.loop=true;const high=ctx.createBiquadFilter(),low=ctx.createBiquadFilter();high.type='highpass';high.frequency.value=250;low.type='lowpass';low.frequency.value=6500;gain=ctx.createGain();gain.gain.value=0;source.connect(high).connect(low).connect(gain).connect(ctx.destination);source.start();}
 if(ctx.state==='suspended')await ctx.resume();sync();}catch(e){failed=true;console.warn('[RAIN44] Không bật được âm thanh mưa:',e.name)}}
document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock,{passive:true});document.addEventListener('visibilitychange',sync);setInterval(sync,200);
globalThis.RAIN44={sync,get available(){return !failed&&!!(window.AudioContext||window.webkitAudioContext)},get contextState(){return ctx?.state||'locked'},get targetVolume(){return volume()},get currentVolume(){return gain?.gain.value||0}};
})();
