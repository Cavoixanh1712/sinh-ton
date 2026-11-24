/* Portable decisions: no DOM, storage, timers, network or world mutation. */
(function(root){'use strict';
const personalities=[{n:'Thận trọng',fear:65,explore:.3},{n:'Hiếu chiến',fear:25,explore:.6},{n:'Xây dựng',fear:45,explore:.25},{n:'Thám hiểm',fear:45,explore:1},{n:'Thân thiện',fear:55,explore:.5}];
function decide(a,o){const p=personalities[a.p%personalities.length],i=a.inv;
 if(o.threat)return a.hp<p.fear||o.threat.t==='n'&&a.hp<80?{type:'flee',target:o.threat}:{type:'fight',target:o.threat};
 if(a.hp<50&&(i.med||0)>0)return{type:'heal'};
 if(a.water<40){if(i.wat>0||i.botB>0)return{type:'drink'};if(i.botD>0&&a.water<15)return{type:'dirty'};if(o.home&&i.botD>0)return{type:'home'};if(o.water)return{type:'water',target:o.water}}
 if(a.food<45){if(i.eat>0||i.berry>0||i.bread>0)return{type:'eat'};if(o.food)return{type:'food',target:o.food}}
 if(a.inside)return{type:'house'};
 const cost=o.toolCost;if(!a.axe&&cost&&Object.keys(cost).every(k=>(i[k]||0)+(o.store?.[k]||0)>=cost[k]))return{type:'home'};
 if(o.home&&(a.hp<45||a.sta<15||o.night||o.upgradeReady||o.rawReady||Object.values(i).filter(Number.isFinite).reduce((n,v)=>n+v,0)>35))return{type:'home'};
 if(o.food&&a.food<75)return{type:'food',target:o.food};
 if(a.pick&&o.rock&&((i.stone||0)<12||a.p===2))return{type:'mine',target:o.rock};
 if(a.axe&&o.tree&&((i.wood||0)<16||a.p===2))return{type:'chop',target:o.tree};
 if(o.item)return{type:'pick',target:o.item};return{type:'explore'};
}
function answer(text,knowledge){const t=String(text).toLocaleLowerCase('vi');if(/gỗ|chặt cây/.test(t))return knowledge.wood;if(/đá|cuốc|đào mỏ/.test(t))return knowledge.stone;if(/chế tạo|công cụ|làm rìu/.test(t))return knowledge.craft;if(/nâng cấp|nhà/.test(t))return knowledge.home;if(/hồi máu|thuốc/.test(t))return knowledge.heal;if(/thức ăn|đói/.test(t))return knowledge.food;if(/nước|khát/.test(t))return knowledge.water;if(/giao dịch|đổi|mua|bán|chợ/.test(t))return knowledge.trade;if(/boss|quái|chiến đấu/.test(t))return knowledge.combat;if(/chào|hello|^hi\b/.test(t))return'Chào bạn! Mình đang tìm vật tư. Bạn cần hỏi điều gì?';if(/\?|ở đâu|làm sao|thế nào/.test(t))return'Mình chưa biết chính xác. Mình không muốn chỉ sai cho bạn.';return null}
// Small offline conversation engine. Context comes from actual game state;
// returned memory is stored by the host, never by this portable module.
const fold=t=>String(t).toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9\s?]/g,' ').replace(/\s+/g,' ').trim();
function converse(text,context={},prior={}){
 const raw=String(text).trim().slice(0,160),t=fold(raw);
 const memory={...prior,turn:(prior.turn||0)+1,history:[...(prior.history||[])].slice(-10)};
 const choices=a=>a[(memory.turn+((context.personality||0)%5))%a.length];
 const addressed=memory.playerName?', '+memory.playerName:'';
 const end=(reply,topic=memory.topic)=>{memory.topic=topic;memory.history.push({you:raw,bot:reply});return{reply,memory}};
 const name=raw.match(/(?:^|[,.!\s])(?:tên\s+(?:tôi|tớ|mình|tao|t)|(?:tôi|tớ|mình|tao|t)\s+tên|cứ\s+gọi\s+(?:tôi|tớ|mình|tao|t))\s*(?:là\s+)?([\p{L}\p{N} _-]{1,24})(?=[,.!?]|$)/iu);
 if(name&&!/\b(ten (toi|to|minh|tao|t) la gi|nho ten|quen ten|dung nho ten|xoa ten)\b/.test(t)){memory.playerName=name[1].trim();return end('Ừ, mình gọi bạn là '+memory.playerName+' nhé. Mình nhớ rồi.','name')}
 if(/\b(quen ten|dung nho ten|xoa ten)\b/.test(t)){delete memory.playerName;return end('Ừ, mình bỏ tên bạn khỏi phần ghi nhớ cuộc trò chuyện rồi.','name')}
 if(/\b(ten (toi|to|minh|tao|t) la gi|nho ten|nho (toi|to|minh|tao|t) (khong|ko|k|hong)|biet ten (toi|to|minh|tao|t))\b/.test(t))return end(memory.playerName?'Nhớ chứ, bạn là '+memory.playerName+'.':'Bạn chưa nói tên với mình. Mình nên gọi bạn là gì?','name');
 if(/\b((ban|cau|may|m|bot) ten (la )?gi|ten gi|ai day|la ai)\b/.test(t))return end('Mình là '+(context.name||'bot')+'. Còn bạn tên gì?','name');
 if(/\b((ban|cau|may|m|bot) (o|dang o) dau|dang o dau|o khu nao|toa do)\b/.test(t))return end(context.zone?'Mình đang ở '+context.zone+(context.inside?', ở trong nhà.':'.'):'Mình chưa xác định được tên khu đang đứng.','location');
 if(/\b(dang lam gi|lam gi do|lam gi day|lam gi z|lam j|co ban khong|ranh khong|ranh ko)\b/.test(t))return end((context.activity||'Mình chưa có mục tiêu mới.')+' Mình vẫn nghe bạn nói được nè.','activity');
 if(/\b(khoe (khong|ko|k|hong)|on khong|sao roi|the nao roi)\b/.test(t)&&!/\b(lam sao|che tao)\b/.test(t))return end(context.hp<45?'Mình đang yếu, cần nghỉ một chút. Còn bạn ổn không?':context.water<35?'Mình hơi khát, đang cần tìm nước. Còn bạn thế nào?':context.food<35?'Mình đang đói một chút. Bạn có ăn uống đầy đủ chưa?':choices(['Mình vẫn ổn nè. Còn bạn?','Vẫn trụ được! Hôm nay bạn chơi thế nào rồi?']),'wellbeing');
 if(/\b(hoi nay|vua nay|luc nay|dang noi gi|noi den dau|nho gi ve)\b/.test(t)){
  const last=memory.history.at(-1);return end(last?'Nãy bạn nói: “'+last.you+'”. Mình đang nghe tiếp đây.':'Mình chưa có đoạn trò chuyện trước để nhắc lại.','recall')}
 if(/\b(buon|chan qua|chan ghe|chan lam|co don)\b/.test(t)){memory.mood='sad';return end(choices(['Có chuyện gì làm bạn buồn vậy? Muốn kể mình nghe không?','Ừ, có lúc cũng chán thật. Bạn muốn kể chuyện hay nghe một câu đùa?','Mình nghe nè'+addressed+'. Điều gì làm bạn thấy vậy?']),'mood')}
 if(/\b(met qua|met ghe|met roi|buon ngu)\b/.test(t)){memory.mood='tired';return end('Vậy nghỉ một chút đi'+addressed+'. Bạn muốn tám thêm hay để lúc khác nói tiếp?','mood')}
 if(/\b(vui qua|vui ghe|vui lam|vui roi|thang roi)\b/.test(t)){memory.mood='happy';return end(choices(['Nghe vui lây luôn. Có chuyện gì hay vậy?','Kể mình nghe với, chuyện gì làm bạn vui thế?']),'mood')}
 if(/\b(ke chuyen cuoi|ke chuyen vui|ke chuyen|ke di|cau dua|choc cuoi)\b/.test(t))return end(choices(['Sao cái cuốc không thích đi chơi? Vì nó sợ bị đào hỏi chuyện riêng. 😄','Mình hỏi cái cây có rảnh không. Nó bảo: đang bận mọc. 😄','Con đá bảo mình: cứ bình tĩnh, mọi thứ rồi sẽ… ổn định. 😄']),'joke');
 if(/\b(cam on|thank|thanks|thank you|da ta|iu|yeu ban)\b/.test(t))return end(choices(['Có gì đâu'+addressed+'.','Ừ nè, có gì cứ gọi mình.','Mình vui vì giúp được bạn.']),'thanks');
 if(/\b(xin loi|sorry)\b/.test(t))return end('Không sao đâu, mình nói tiếp nhé.','apology');
 if(/\b(tam biet|bai bai|bye|di day|di ngu day)\b/.test(t))return end(choices(['Ừ, hẹn gặp lại'+addressed+'!','Đi cẩn thận nhé. Lúc nào muốn tám thì gọi mình.']),'goodbye');
 if(/\b(tinh cach|thich lam gi)\b/.test(t))return end('Mình thuộc kiểu '+personalities[(context.personality||0)%5].n.toLocaleLowerCase('vi')+'. Còn bạn thích chơi kiểu nào?','personality');
 if(/\b(bot that|nguoi that|co phai ai|la ai bot|chatgpt)\b/.test(t))return end('Mình là bot của game, nói chuyện bằng hội thoại nội bộ. Mình không phải người thật hay ChatGPT nhé.','identity');
 if(/\b(di theo|di cung|cho (toi|to|minh|tao|t) (do|go|da|tien)|tang (toi|to|minh|tao|t))\b/.test(t))return end('Mình chưa nhận lệnh đi theo hay tặng đồ qua chat được. Nếu muốn đổi đồ thì dùng giao dịch nhé.','capability');
 if(/\b(chao|hello|helo|hi|hey|alo|co do (khong|ko|k|hong)|e bot|bot oi|ban oi|may oi)\b/.test(t)||t==='e')return end(choices(['Có mình đây'+addressed+'. Bạn đang làm gì đó?','Chào'+addressed+'! Hôm nay chơi ổn không?','Mình nghe nè. Có chuyện gì kể mình với?']),'greeting');
 if(/\b(noi chuyen|tam chuyen|noi gi di|noi chuyen binh thuong)\b/.test(t))return end('Được chứ. Hôm nay bạn thế nào? Mình nghe nè.','smalltalk');
 if(/^(haha+|hihi+|hehe+|kk+|lol|vui nhi|hay do|hay ghe)$/.test(t))return end(choices(['Thấy bạn cười là được rồi. 😄','Hehe, vậy là có người nghe mình tám rồi.']),'laugh');
 if(/^(u|uh|um|uk|ok|oke|oki|duoc|dung|dung roi|vang|ua|co|khong|ko|k|hong|sao|sao z|tai sao|vi sao|roi sao)( a| ne| vay| nhi)?$/.test(t)){
  if(memory.topic==='mood'&&memory.mood==='sad')return end('Bạn muốn kể điều gì làm bạn buồn, hay mình đổi sang chuyện nhẹ nhàng hơn?','mood');
  if(memory.topic==='joke')return end(choices(['Câu đùa hơi nhạt hả? 😄 Bạn kể một câu thử xem.','Bạn thích nghe thêm hay đổi chuyện khác?']),'joke');
  return end(choices(['Ừ nè. Bạn kể tiếp đi.','Mình nghe đây'+addressed+'.','Bạn muốn nói tiếp chuyện gì?']),'followup');
 }
 // Game help is still drawn from the current recipe/lifecycle systems.
 const guide=answer(raw,context.knowledge||{});
 if(guide&&!guide.startsWith('Mình chưa biết'))return end(guide,'game');
 if(/[?]|\b(ai|gi|sao|dau|khi nao|bao nhieu|the nao|biet|hieu|ban|may)\b/.test(t))return end(choices(['Câu này mình chưa hiểu rõ. Bạn nói thêm một chút được không?','Mình chưa biết trả lời sao cho đúng. Bạn đang hỏi chuyện trong game hay chuyện khác?']),'unknown');
 return end(choices(['Mình đang nghe'+addressed+'. Bạn kể tiếp đi.','Ý bạn là sao nhỉ? Nói rõ thêm cho mình với.','Ừ, rồi sao nữa?']),'smalltalk');
}
root.AI_BRAIN21={personalities,decide,answer,converse};
})(globalThis);
