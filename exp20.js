/* =====================================================================
   Step 20d – XUẤT BẢN HTML CHẠY ĐỘC LẬP (giống hệt bản đang chạy)
   Vì sao cần: game gồm index.html + v25.js (dựng 3D/2.5D: nhà gỗ 3D,
   cây, đường phố…) + f5/w15/b16/m19.js + ảnh trong ho/ icons/ w15/.
   Nút "Tải xuống" của claude.ai chỉ tải index.html, nên khi mở file đó
   các file .js và ảnh bị thiếu → chỉ còn phần 2D cũ.
   Nút ở đây gom TẤT CẢ (code, three.js r128, ảnh, dữ liệu lưu hiện tại)
   vào MỘT file .html. Không đổi gì trong game hay dữ liệu đang lưu.
   ===================================================================== */
(()=>{if(window.__SH_STANDALONE)return;
const JS=['v25.js','f5.js','w15.js','b16.js','m19.js'];
const THREE_SRC='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',THREE_FILE='three.r128.min.js';
const ASSETS=["portal.jpg", "ho/bu1.webp", "ho/bu2.webp", "ho/bu3.webp", "ho/bu4.webp", "ho/bu5.webp", "ho/bu6.webp", "ho/fl0.webp", "ho/fl1.webp", "ho/fl2.webp", "ho/fl3.webp", "ho/fl4.webp", "ho/lo1.webp", "ho/lo2.webp", "ho/lo3.webp", "ho/lo4.webp", "ho/lo5.webp", "ho/lo6.webp", "ho/petal.webp", "ho/rd1.webp", "ho/rd2.webp", "ho/rd3.webp", "ho/rk1.webp", "ho/rk2.webp", "ho/rk3.webp", "ho/rk4.webp", "ho/rk5.webp", "ho/sak1.webp", "ho/sak2.webp", "ho/sak3.webp", "ho/sak4.webp", "ho/sak5.webp", "ho/sakb1.webp", "ho/sakb2.webp", "icons/barrel.png", "icons/botC.png", "icons/botD.png", "icons/botE.png", "icons/bpArmor.png", "icons/bpCloth.png", "icons/bpDef.png", "icons/bpH4.png", "icons/bpH5.png", "icons/bpWeap.png", "icons/bread.png", "icons/cardFarm.png", "icons/cardTp.png", "icons/cu.png", "icons/iron.png", "icons/part.png", "icons/plas.png", "icons/pmat.png", "icons/portal.jpg", "icons/rpart.png", "icons/stone.png", "icons/wat.png", "icons/wood.png", "w15/bk1L.png", "w15/bk1R.png", "w15/bk2L.png", "w15/bk2R.png", "w15/bk3L.png", "w15/bk3R.png", "w15/bk4L.png", "w15/bk4R.png", "w15/dg1.png", "w15/dg2.png", "w15/dg3.png", "w15/dr1.png", "w15/dr2.png", "w15/dr3.png", "w15/fs1.png", "w15/fs2.png", "w15/fs3.png", "w15/sp1.png", "w15/sp2.png", "w15/sp3.png", "w15/th1_1.png", "w15/th1_2.png", "w15/th1_3.png", "w15/th2_1.png", "w15/th2_2.png", "w15/th2_3.png", "w15/th3_1.png", "w15/th3_2.png", "w15/th3_3.png", "w15/th4_1.png", "w15/th4_2.png", "w15/th4_3.png", "w15/vd1.png", "w15/vd2.png", "w15/vd3.png", "w15/vd4.png", "w15/w_dp.png", "w15/w_fl.png", "w15/w_md.png", "w15/w_peb.png", "w15/w_sh.png", "w15/w_wh.png"];
const esc=s=>s.replace(/<\/script/gi,'<\\/script').replace(/<!--/g,'<\\!--');
const b64=buf=>{const u=new Uint8Array(buf);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)};
const MIME={png:'image/png',webp:'image/webp',jpg:'image/jpeg',jpeg:'image/jpeg'};
async function txt(u){const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw new Error(u+' '+r.status);return r.text()}
const BOOT=(A,S)=>`<script>/*SAFE HAVEN – bản độc lập: ảnh nhúng sẵn + chép dữ liệu lưu*/window.__SH_STANDALONE=1;(function(){var A=${A},S=${S};
try{var L=localStorage;if(S&&!L.getItem('safehaven_save_v2')&&!L.getItem('safehaven_save_v1')&&!L.getItem('safehaven_account_v1')){for(var k in S)if(L.getItem(k)==null)L.setItem(k,S[k])}}catch(e){}
function M(u){if(typeof u!=='string')return u;var k=u.replace(/^\\.\\//,'');return A[k]||u}window.__SH_ASSET=M;
var P=HTMLImageElement.prototype,d=Object.getOwnPropertyDescriptor(P,'src');Object.defineProperty(P,'src',{get:d.get,set:function(v){d.set.call(this,M(v))},configurable:true});
var sa=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if((n==='src'||n==='href')&&typeof v==='string')v=M(v);return sa.call(this,n,v)};
var rx=/(src=["'])([^"']+)(["'])/g,fx=function(h){return typeof h==='string'&&h.indexOf('src=')>=0?h.replace(rx,function(m,a,b,c){return a+M(b)+c}):h};
var ih=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');Object.defineProperty(Element.prototype,'innerHTML',{get:ih.get,set:function(v){ih.set.call(this,fx(v))},configurable:true});
var ia=Element.prototype.insertAdjacentHTML;Element.prototype.insertAdjacentHTML=function(p,h){return ia.call(this,p,fx(h))};
var F=window.fetch;if(F)window.fetch=function(u,o){return F.call(this,M(u),o)};})();<\/script>`;
async function build(say){
 say('Đang đọc index.html…');let html=await txt('index.html');
 const code={};for(const f of JS){say('Đang đọc '+f+'…');code[f]=await txt(f)}
 say('Đang đọc three.js…');const three=await txt(THREE_FILE);
 const seen=new Set(ASSETS);try{for(const e of performance.getEntriesByType('resource')){const u=new URL(e.name,location.href);if(u.origin!==location.origin)continue;const p=u.pathname.replace(/^\/+/,'');const m=p.match(/((?:ho|icons|w15)\/[^/]+\.(?:png|webp|jpe?g)|portal\.jpg)$/);if(m)seen.add(m[1])}}catch(e){}
 const A={};let n=0;for(const p of seen){try{const r=await fetch(p);if(!r.ok)continue;const ext=p.split('.').pop().toLowerCase();A[p]='data:'+(MIME[ext]||'application/octet-stream')+';base64,'+b64(await r.arrayBuffer());if(++n%10==0)say('Đang nhúng ảnh '+n+'/'+seen.size+'…')}catch(e){}}
 const S={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);S[k]=localStorage.getItem(k)}}catch(e){}
 const J=o=>JSON.stringify(o).replace(/<\//g,'<\\/').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 // 1) script khởi động ngay đầu <head>
 const boot=BOOT(J(A),J(S));html=/<head[^>]*>/i.test(html)?html.replace(/<head[^>]*>/i,m=>m+boot):boot+html;
 // 2) nhúng three.js và các file .js thay cho <script src>
 const rep=(src,body)=>{let i=html.indexOf('src="'+src+'"');if(i<0)i=html.indexOf("src='"+src+"'");if(i<0)throw new Error('không thấy thẻ script '+src);const a=html.lastIndexOf('<script',i),e=html.indexOf('</script>',i);if(a<0||e<0)throw new Error('thẻ script lỗi '+src);html=html.slice(0,a)+'<script>'+esc(body)+'\n</script>'+html.slice(e+9)};
 rep(THREE_SRC,three);for(const f of JS)rep(f,code[f]);
 {const i=html.indexOf('src="exp20.js"');if(i>=0){const a=html.lastIndexOf('<script',i),e=html.indexOf('</script>',i);html=html.slice(0,a)+html.slice(e+9)}}
 const left=[...html.matchAll(/<script[^>]*\ssrc=["']([^"']+)["']/gi)].map(m=>m[1]);if(left.length)throw new Error('còn script ngoài: '+left.join(', '));
 return {html,n,keys:Object.keys(S).length}}
window.SHEXP={build};
async function go(btn,out){btn.disabled=true;const say=s=>{out.textContent=s};
 try{const r=await build(say);const dl=window.claude&&claude.use?await claude.use('downloads'):null;
  const name='SAFE_HAVEN_2D_doc_lap.html',blob=new Blob([r.html],{type:'text/html'});say('Xong: '+(blob.size/1048576).toFixed(1)+' MB, '+r.n+' ảnh, '+r.keys+' mục dữ liệu lưu.');
  if(dl){try{await dl.save({filename:name,data:blob});say('Đã tải: '+name+' – mở file này bằng trình duyệt là chơi được, không cần mạng.')}catch(e){say(e&&e.code==='declined'?'Bạn đã huỷ tải.':'Không tải được ('+(e&&e.code||e)+').')}}
  else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000)}}
 catch(e){say('Lỗi xuất: '+(e&&e.message||e))}btn.disabled=false}
function ui(){const card=document.querySelector('#ov .card');if(!card||document.getElementById('expb'))return;const w=document.createElement('div');w.style.cssText='margin-top:10px;text-align:center';
 w.innerHTML='<button id="expb" style="font-size:13px;padding:6px 12px;border-radius:10px;border:1px solid #8aa;background:#1e2a36;color:#dfe;cursor:pointer">⬇️ Tải bản HTML chạy độc lập</button><div id="expo" style="font-size:12px;color:#cde;margin-top:6px;min-height:15px"></div>';
 card.appendChild(w);const b=w.querySelector('#expb'),o=w.querySelector('#expo');b.onclick=()=>go(b,o)}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',ui);else ui();
})();
