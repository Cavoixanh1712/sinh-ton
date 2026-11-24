# Changes

## Sprite color correction 51 — local only

- Enemy/BOSS raster textures in 3D use sRGB and bypass scene tone mapping, matching the player correction and original 2D artwork. No enemy data, HP, damage, behavior, spawn rules or asset image files changed.


## Civic interiors 50 — local source handoff, not deployed

- Added genuine Three.js room plans for all 4 city hospitals (3 accessible floors), 4 fire stations (2 floors) and 7 police stations (2 floors).
- Reused the existing interior engine; civic floor slabs are rendered as a single mesh with a stair opening, and hidden lower-floor structures are culled. Added a left staircase offset for civic layouts without moving exterior buildings.
- Modeled beds, bedside cabinets, IV stands, monitors, surgery tables/lights, medical carts, medicine cabinets, bunks, kitchen units, rescue gear/hose racks, ladders, two detailed fire trucks, holding-room bars/open gate, command monitors and weapon storage props.
- Reused original finite source IDs and the existing inventory/claim command. Hospital stock prioritizes existing medical supplies, water, plastic and parts; fire stock uses iron/plastic/parts/water; police uses iron/parts/plastic.
- Retained the former 4th hospital floor records and NPC data. Existing source records are not created, deleted or renumbered; new interiors expose three hospital floors and can read older positions safely.
- Added a civic-only guard against pickup in unsupported online sessions. Presence/floor rendering remains compatible; real authoritative transactions and 20-player server load are not available in the current backend.
- Retained the preceding pending store-only Canvas2D conversion, using native raster furniture assets. Schools and malls stay 3D.
- Preserved save namespaces, original world and exterior data, enemy/BOSS definitions, death rules and prior player controls. No LIVE publication was performed.

### Known limits

- The current source has healing medicine, but no existing anti-contamination medicine/pollution meter was found. No substitute with a fake label or unrequested new mechanic was added.
- A live 20-player test and physical-phone FPS certification are not possible with the currently disabled multiplayer server and software-rendered test environment. Reports distinguish these from simulated checks.


## 52 — Zombie trong công trình và vật tư thực phẩm

- Áp dụng cho toàn bộ 31 công trình thành phố cùng loại; không sửa ngoại thất, quái đêm, BOSS hay chỉ số chiến đấu sẵn có.
- Mỗi cửa hàng tiện lợi: 4 zombie thường + 1 tinh anh.
- Mỗi TTTM: tầng 1 có 5 thường + 1 tinh anh, tầng 2 có 4 + 1, tầng 3 có 5 + 1.
- Mỗi bệnh viện: tầng 1 có 4 thường, tầng 2 có 4 + 1, tầng 3 có 3 + 1.
- Mỗi trường học: tầng 1 có 4 thường; tầng 2 có 4 + 1.
- Mỗi trạm cứu hỏa: tầng 1 có 3 + 1; tầng 2 có 3 thường.
- Mỗi đồn cảnh sát: tầng 1 có 4 + 1; tầng 2 có 3 + 1.
- Khởi tạo một lần khi vào công trình, thay thế số zombie nội thất cũ để không cộng trùng. Vị trí sinh được chọn trên lưới đi được, tránh cửa vào và khoảng thông tầng; giữ hồi sinh 90 giây và chiến đấu gốc.
- Thêm sữa tươi (5/ô) và đường (10/ô), biểu tượng SVG tự tạo theo mẫu. Chỉ phân bổ vào điểm vật tư chưa tìm của cửa hàng tiện lợi và khu thực phẩm TTTM; tầng điện tử TTTM giữ nguyên. Không tăng số điểm vật tư, không hồi lại hàng đã tìm.
- Tích hợp túi đồ, dung lượng, vứt đồ, tên/biểu tượng và lưu nhân vật. Chưa thêm công thức hay hiệu ứng sử dụng thực phẩm.
- Giữ sửa màu sprite 51 và các nội thất trước đó; không cập nhật LIVE.


## 53 — BOSS thành phố theo chu kỳ 3 ngày

- Thêm 5 BOSS mới, mỗi con ở một tòa nhà ngẫu nhiên khác nhau thuộc TTTM, bệnh viện, trường học, đồn cảnh sát hoặc trạm cứu hỏa. Không xuất hiện ở cửa hàng tiện lợi hoặc ngoài trời.
- Mỗi BOSS 300 máu, sát thương gốc16; giữ giảm sát thương bởi phòng thủ hiện có. Không tăng chỉ số BOSS theo ngày.
- Khi bị hạ, chờ đợt reset chung mỗi72 giờ game (3 ngày). Đến đợt reset, cả5 hồi đầy máu và chuyển sang5 tòa nhà khác với đợt trước; chọn lại tầng và vị trí đi được.
- Thêm hình đi/đánh bốn hướng theo mẫu; dùng combat, điều khiển, va chạm và đường thưởng BOSS hiện có.
- Lưu chu kỳ, vị trí, máu và trạng thái bị hạ qua SAVE world extension. Tải lại/ra vào không đổi vị trí hoặc hồi sinh sớm.
- Không thay đổi zombie thường/tinh anh, vật tư, nhân vật, ngoại thất, quái đêm, bản đồ, multiplayer hoặc vùng lưu. Chưa cập nhật LIVE.


## 54 — Xóa đúng ba nhà trong ảnh, chuyển BOT Dũng

- Xóa R1 và R5 đã khoanh tròn; xác nhận và xóa căn riêng bh4 ở vị trí BOT Dũng kẹt cạnh hàng cây. Loại khỏi khởi tạo, va chạm, bản đồ và khôi phục save.
- Chuyển Dũng sang nhà trống có sẵn bằng hệ thống nhận nhà hiện có, kiểm tra cửa đi được và quyền sở hữu. Giữ ID/tên, đồ trong túi, kho, chỉ số, số mạng và ký ức; bỏ đường đi/mục tiêu trỏ tới nhà cũ.
- Không tạo nhà riêng thay thế. Còn13 nhà SAFE có sẵn, không thay tọa độ hoặc biến thể đồ họa của các nhà giữ lại.
- Nếu save cũ đặt nhà người chơi tại R1/R5, chuyển căn nhà chuẩn sang vị trí trống được giữ lại, bảo toàn cấp nhà; không chiếm nhà có chủ.
- Giữ nguyên AI chơi game, quái/BOSS53, vật tư, cây, đường và nội thất. Chưa cập nhật LIVE.


## 55 — Bàn chế tạo6 danh mục

- Gộp theo yêu cầu mới: Công cụ & Vũ khí; Trang bị; Xây dựng & Nội thất; Sinh tồn & Nấu ăn; Nguyên liệu & Luyện kim; Nông nghiệp & Chăn nuôi.
- Phân loại đủ18 công thức hiện hành, gồm phần bổ sung của CK26/B28/weather; không đổi công thức, nguyên liệu, đầu ra hoặc điều kiện mở khóa.
- Tìm kiếm có/không dấu, lọc danh mục và đủ/thiếu/chưa mở khóa/túi đầy; thẻ biểu tượng, chi tiết nguyên liệu có/cần và trạng thái. Thiết kế tối màu, nhấn vàng; responsive điện thoại/máy tính.
- Đối chiếu các mục đã có trong game nhưng chưa có công thức và các đề xuất mới. Các mục chưa duyệt không có nguyên liệu tự đặt và không thể chế tạo. Bếp điện/công thức tủ lạnh cấp3 vẫn chỉ là đề xuất.
- Không thêm công thức, vật phẩm, nguyên liệu, chế tạo hàng loạt hoặc thay dữ liệu game. Tích hợp đầy đủ các sửa trước đến HOME54. Người dùng đã yêu cầu phát hành trên đúng LIVE và web tải ZIP hiện tại.


## 56 — Chỉ chỉnh bố cục bàn chế tạo

-6 danh mục xếp dọc bên trái ở cả máy tính và điện thoại, không còn thanh danh mục ngang trên điện thoại.
- Máy tính/điện thoại ngang: vật phẩm ở giữa và chi tiết/nguyên liệu bên phải theo ảnh mẫu. Thẻ vật phẩm dạng dọc,4 cột trên màn hình rộng.
- Điện thoại dọc: menu dọc cố định bên trái; danh sách và chi tiết trong vùng phải, cuộn riêng để đọc được.
- Chỉ thêm stylesheet có phạm vi #craft và thẻ nạp, giữ nguyên toàn bộ JS,18 công thức, giá/đầu ra, tìm kiếm/bộ lọc và chức năng game.


## Craft compact57
- Supersedes layout56: three fixed side-by-side columns on desktop and phone, never stack detail under cards. Small icons, five cards per row on desktop/four on phone. Category rail remains vertical.
- craft55.js changes selection presentation only: no automatic first selection, hide detail until a card is clicked, remove scrollIntoView, full-name title on compact cards. Recipe/cost/craft/save logic remains unchanged.
- craft57.css is #craft scoped. No new recipes, quantity/favorites or save changes. Browser QA unavailable in managed environment without cua_repl.js.


## Craft hologram58
- CSS-only floating translucent crafting panel, visible world margins, thin cyan projection border. Desktop86vw/76dvh (maximum1180x640), phone94vw/78dvh and short landscape86dvh. No fullscreen panel or global world blur.
- Keeps compact57 three columns, small4–5-column icons, click-only detail and every JavaScript/crafting/save function byte-identical. Only new #craft-scoped stylesheet and one index link.
- Managed browser preview unavailable: no screenshots or physical-device verification claimed.


## Inventory59 — authorized dropped-item lifetime and held-tool fix
- invUse routes held items directly to EQ30.toggle instead of lexical legacy equip (which removed tools from bag). Native armor equip remains unchanged.
- invDrop delegates to ground59.js via ITEM59_BRIDGE. One stack unit/equipment per drop, exact berry variant/chest provenance and per-copy durability preserved. Dropping the last held copy clears hand via EQ30.
- Separate ground59 world SAVE extension stores stable command IDs, positions, interior key/floor/height and absolute GT+3 expiry. No real-time timers; no native item respawns, source IDs, storage prefixes or map changes. Full bags reject pickup without removing the drop.
- Uses existing CMD for dropped records; received commands never grant local inventory. Existing network transport/backend is unchanged; no live server multiplayer certification.
- Existing 2D draw hook, store Canvas draw hook and disposed Three actor cards render dropped bags. ctxA prioritizes nearby dropped bags before native actions, limited to same interior/floor. Lazy module cache tags bump only modified modules.
- Node logic harness checks hold/unhold, drop/pick, duplicate pickup, exact3-hour expiry, save/load, full bag, berry variants, chest origin, durability, floor isolation, remote no inventory grant. Managed browser unavailable; no browser or physical-device verification claimed.


## Bạch Vân cabins60 — scoped mountain additions
- Adds exactly20 abandoned wooden cabins in Đỉnh Bạch Vân, each with one lazy Three.js interior and six finite item sources: water twice, bread, cloth, milk, wood. No new enemies/BOSS, safe houses, recipes or other zone edits.
- cabins60.js plans flat lots and passable approaches beside existing trails, excluding cliffs, lakes/springs, mine, safe lots and existing buildings. Only vegetation/loose rocks on the new footprints/approaches are cleared; terrain arrays and existing nature outside these plots remain unchanged. W15 guards prevent streamed nature reoccupying these plots; existing transport/save fields are preserved.
- V25 uses a cabin60-only exterior branch: detailed timber/snow roof/chimney geometry baked into four shared material batches. Classic2D has a scoped vector representation. No other building models change.
- I46.register60 supplies stable virtual floors and source IDs; cabin-only geometry is built by the existing renderer, with worn wooden floor, bedroom, kitchen, broken furniture, shelves, crates and firewood. Existing claims persist via interior46 SAVE extension; no source may be looted twice. Full bags keep source untouched. Reuses existing offline-only finite-claim safety guard for these new cabins; backend multiplayer is unchanged and not certified.
- Cloth (cloth60) is the only new item explicitly requested by the user. Registered in STK/F5KEYS, inventory icons and a player SAVE extension; no recipes or effects are added. Water/bread/milk/wood reuse existing item IDs.
- Validation uses actual height-generation code, Three.js geometry/colliders, room/search accessibility, coordinator entry/exit, finite search/full bag/claim reload and inventory59 regression. DOM/WebGL renderer are mocked in Node; no browser screenshot, real-device FPS or live multiplayer certification is claimed.


## Ecology61 — requested restock and forest plants only
- restock61.js:24 game hours after each search in Bach Van wooden cabins,72 after searches in city public interiors/ordinary-home search/fridge containers and native city interior loot. Existing industrial KCN34 already uses GT+24 and is byte-identical; loot tables, quotas and rewards are unchanged. Search timers persist in a world SAVE extension; older boolean I46 claims migrate once to a new deadline. Native city loot real-time respawn timers are suppressed only for these sources; positions are retained. Read/book coin actions and other zones keep their existing behavior.
- flora61.js adds35 tea plants in10 fixed clusters (five clusters of3/five of4),15 aloe and10 perilla across Rung Suoi May. Tea remains fixed with120-hour regrowth; aloe/perilla relocate by at least8 meters after full harvest and mature after72/48 hours. Young-growth sprites show the wait.
- Adds5 apples,5 pears,5 bananas on land in a narrow ring around Ho Suong (lsg), matching the user's circled map. Avoid water, paths, existing buildings/tree trunks and safe-house plots; no existing objects are removed. Fruit trees stay fixed and return to flowering after the last fruit; apples240h/pears288h/bananas360h. Yields follow images: apples/pears3–6, bananas4–8; tea/aloe2–4. Perilla uses2–4 leaves, with48h regrowth confirmed by user.
- Six new inventory item IDs (tea61,aloe61,perilla61,apple61,pear61,banana61), native stack/capacity/drop paths and player SAVE counts. Native food animation, inventory/hotbar and item.use accept only the three new fruits: apple/pear +30 food/+10 water; banana +40 food. Existing food effects unchanged. No recipes, seed planting, crafting ingredients or herbal effects are added.
- World SAVE keeps node IDs, positions, remaining stock, deadlines and cycles. Reloading does not refill growing plants or move tea. Partial/full bag behavior preserves remaining harvest; received harvest commands do not grant local inventory. Existing network transport/authority is unchanged; no new multiplayer certification.
-21 local SVG assets supply young/mature herbs, flowering/ripe fruit trees and six item icons through the existing2D/2.5D DEC renderer. Only new decorative objects/trunk colliders are added. Terrain, other buildings, quái/BOSS, ground59 and crafting UI remain unchanged.
- Validation: actual item.use/F5 inventory eating path, plant counts/grouping/forest/lake ring, growth deadlines/relocation/flowering, food effects/caps, partial/full bag, save/reload; cabin coordinator restock24h, city source/home/native72h, existing industrial24h, legacy claim migration; inventory59 regression and SVG/XML checks. Node harness uses real layout tables/Three geometry but mock DOM/WebGL; full streamed water/forest rendering and physical-device FPS are not browser-certified. cua_repl.js is unavailable.


## Revision62 — thêm8 bot sinh tồn và HUD người sống sót
- Thêm An/Bình (thành phố), Chi/Hải (công nghiệp), Lan/Minh (rừng), Nam/Vy (Bạch Vân). Mỗi bot nhận một nhà có sẵn còn trống ở đúng khu; chờ nếu không có nhà phù hợp, không chiếm nhà người chơi/Dũng.
- Túi/kho/trang bị và chỉ số riêng; dùng AI Dũng, đi theo va chạm, nhặt tài nguyên thật, khai thác, nhặt/mở rương với hạn mức gốc và lục nguồn công nghiệp với cooldown24 giờ game. Không tặng tài nguyên khởi đầu.
- Tự ăn/uống/thuốc, chế công cụ bằng công thức có sẵn, dựng bếp trả nguyên liệu, sửa và nâng nhà theo chi phí/giới hạn bot hiện có, phòng vệ/chạy trốn. Không bật tháp/pháo miễn phí của khung thử nghiệm XD15.
- Ký gửi dư thừa và chấp nhận giao dịch vật phẩm có ích từ người chơi/bot. Dùng escrow M19, không tiền và không nhận lại cùng bài hai lần.
- Chết theo quy tắc bảo hộ72 giờ của người chơi; hết mạng có dấu kết thúc lưu lại, không tạo bot thay thế. Dũng giữ nguyên vòng đời cũ.
- HUD Người sống sót cập nhật theo người chơi/peer còn sống và các bot còn sống. Chia lịch suy nghĩ/tìm đường, cache cảm nhận để giảm công việc AI.
- Giữ nguyên bản đồ, vị trí/hình dáng nhà, quái/BOSS, công thức, túi đồ người chơi, save prefix và transport online. Bot mới và giao dịch vật tư của chúng chỉ chạy offline vì backend hiện chỉ đồng bộ hiện diện; chưa bổ sung máy chủ đồng bộ bot.
- Kiểm tra logic/tích hợp Node đã qua; chưa có kiểm tra trình duyệt/điện thoại hay đo FPS thực tế.
