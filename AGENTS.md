# SAFE HAVEN — crafting55 and authorized existing LIVE update

This is an existing buildless HTML/JavaScript game. Preserve the current game rather than replacing it. The user has now explicitly authorized publishing this complete release to the existing LIVE site and updating its ZIP download page. Preserve the existing Site identity, audience and LIVE storage region; do not create a new game or reset saves.

## Architecture

- `index.html` owns the existing game loop and exposes `SH` APIs. Existing script/cache query tags use build 51 in this handoff.
- `interior46.js` is the existing lazy interior coordinator. Stable building keys and original `HFL` records identify save positions, item source IDs and peer floor coordinates.
- `store49-2d.js` renders only convenience stores with Canvas2D. This pending change is retained from the preceding user request; no store-only 3D scene is loaded.
- `interior46-scene.js` is the existing Three.js interior engine. School and mall use the existing plans. Civic buildings use the same materials, mesh batches, swept movement, occlusion, disposal, player sprites and command integration.
- `civic50.js` supplies hospital/fire/police room plans and custom procedural models. It is loaded only when entering a civic building. Civic stairs use the existing U-stair algorithm with a leftward offset; other interiors retain offset zero.
- Hospital interiors expose 3 floors while retaining the old 4th-floor data for compatibility. Fourth-floor item source IDs remain finite and are represented on the third new floor. Existing NPC data on that old floor is not deleted or reassigned.

## Data constraints

- Do not change exterior building coordinates/sprites, existing enemy/BOSS definitions, original world records, browser storage prefixes or the existing save system. The new city-boss type q is specifically authorized in revision53.
- Item sources and `interior46` save claims are reused. Each source may grant at most one item per saved world. Do not reset claims, respawn stock or grant inventory for received remote commands.
- Civic search currently works offline. The existing backend has WebSockets disabled and no authoritative item claim transaction. Civic pickup is therefore rejected in a non-offline session to avoid granting duplicated items. Do not remove this guard merely on the basis of presence synchronization or a simulated test.
- `med`, `wat`, `plas`, `part`, `iron` are existing item kinds. No new medicine or pollution mechanic was added; an existing anti-contamination medicine was not found.
- Keep original inventory and save fields. `S.i46` and the existing save extension track interior position and claims; there is no new storage namespace.

## Validation

Reports, screenshots and diagnostic JSON are under `CIVIC50_REVIEW/` in the handoff ZIP. The test browser uses software SwiftShader with a two-core CPU quota; its FPS is not a physical-phone measurement. Multiplayer tests are simulations, not a 20-player live server certification.

## Content 52

- `content52.js` runs after `interior46.js`. It adds only interior zombie encounters and store/mall grocery loot. Use the existing `z` and `b` enemy types and native 90-second respawn; do not alter ET or night monsters.
- Encounter IDs are `inside52:<building-key>:<floor>:<type>:<slot>`. The `inside52` world SAVE extension restores initialized encounters and alive entities; the original WORLD dead queue owns respawn timers. Old interior zombie respawns are discarded only after that building has migrated. Original exterior entities are untouched.
- Collision spawn candidate grids are lazily cached per renderer in a WeakMap; never load all 3D interiors at boot.
- `milk52` and `sugar52` use STK/F5KEYS, existing finite interior46 claims, and a `groceries52` player SAVE extension. Icons are local SVG assets. No food-use effects or new recipes are authorized in this revision.
- The existing offline-only civic pickup guard and multiplayer implementation remain unchanged. No live-server certification has been performed.

## City bosses 53

- `city-boss53.js` loads after content52. It manages exactly five encounter slots in five distinct eligible city buildings, chosen from mall/hospital/school/police/fire only. Stores are excluded. Floors and reachable positions are randomized.
- One shared cycle is `Math.floor(SH.GT / 72)`: every three game days, respawn all five at full HP and select five buildings disjoint from the preceding cycle. Killed bosses stay dead until that cycle boundary; there is no daily or 90-second boss respawn.
- New type `q` uses existing combat/steering with base speed2.9, detection11; HP is fixed300 and base damage16. Defense mitigation remains native. Day-based enemy scaling does not apply to q; all old types keep their existing scaling.
- index.html has six targeted integration points: ET.q, emSync q guard, q damage multiplier guard, custom draw dispatch, kill lifecycle/message dispatch/native-respawn exclusion, and new module script tag. Existing enemy definitions and unrelated systems remain unchanged.
- `cityBoss53` marks these entities for the dedicated lifecycle. `boss` reuses the existing BOSS reward path. Stable IDs include cycle and slot. The cityboss53 world SAVE extension owns slots, remaining HP, dead state and positions. Never add these entities to WORLD's native 90-second dead queue.
- Boss positions are validated lazily against the active shared renderer's collision grid. Do not preload every interior. Normal zombie spawning and finite food loot remain in unchanged content52.js.
- `boss53/atlas.png` is a transparent eight-by-eight sprite sheet generated from the user reference, with four walking and four attack direction rows. atlas-data.js supplies the same image as a data URL for file launches; direct file navigation is blocked in the QA browser, so that load branch is tested via a routed HTTP harness. The existing51 sprite color handling applies unchanged.
- Local source handoff only. Backend/online/save storage regions are unchanged; no live multiplayer certification or LIVE deployment is implied.

## Shelter cleanup54

- The user explicitly retires na_r1 (261,-312), na_r5 (288,57), and Dũng's blocked private bh4 (foot313.65,204.75). Preserve all other shelters, terrain, trees, items, characters, city BOSS53 and interiors.
- safe54-config.js runs immediately after city4-data.js: extend the existing retired-site/retired-bot-house lists with only these IDs. xd15.js removes the two SAFE entries. Keep SAFE_STYLE54 at original values so deleting entries cannot change remaining shelters'2D/3D appearance.
- B16/n22 save setters have capture-only hooks. safe-home54.js captures the retired private house's store before native filtering, then transfers its owner's stash to the bot's existing AI store once. Existing saved owners are consulted before relocating a player whose canonical house was on a retired site. Native N22.sync restores its saved level; do not reset inventory or levels.
- Dũng uses BROWSER_AI21.claim to claim a vacant existing retained shelter with a passable door. Keep identity, inventory, HP, lives, memory and AI behavior. Clear only stale home routes/targets and update presence after relocation. Never generate a replacement private house or take a claimed/player-owned shelter.
- The safehome54 world SAVE extension is a migration marker, not a new storage namespace. Native saved bot/home state remains authoritative on reload.
- Fresh starts and old-save migration/reload were tested. Native AI and BOSS53 files remain byte-identical. This is still a local source handoff, not a LIVE deployment.

## Crafting55

- Presentation-only: craft55.js/css and craft55-icons.png. index.html adds a render delegate, a read-only CRAFT55_BRIDGE to native recipes/have/open/render functions, and the module tag. recipes(), doCraft() and every existing cost/unlock/output function remain unchanged.
- Six categories only: tools/weapons, equipment, construction/interior, survival/cooking (including water/medicine), materials/metallurgy, agriculture/husbandry.
- At runtime18 bench recipes exist: the base list plus F5/CK26/B28/weather additions. Never hard-code11 or omit module recipes. Each recipe appears once and retains its original native index/callback.
- Existing game items without bench recipes and proposed new items are separate inspect-only catalog entries. Do not add costs, items, recipes, unlocks, quantity batching, favorites persistence or actions for unapproved entries. Chai nhựa maps to native Chai nước; Chén maps to native Bát. Repeated Than củi is deduplicated in the requested catalog.
- UI state is in memory only; no new save fields/namespaces. Native single-craft behavior and capacity checks are retained.
- Managed Sites desktop infrastructure is unavailable (no cua_repl.js); no managed/published browser verification is claimed. Local pre-publication UI regression artifacts and static integrity checks are retained.

## Craft layout56

- Only craft56.css and one post-module stylesheet link in index.html change the UI. Keep all JavaScript, base craft55.css, recipes, filters, search, selected item actions, save and gameplay byte-identical.
- Desktop/tablet/phone landscape: vertical category rail left, portrait item cards center, details right. Phone portrait: vertical sticky left rail; item list and details in the right region with vertical scrolling for readability. Never restore the horizontal category strip on mobile.
- No quantity/favorites controls or other features from the reference are added. Six categories and18 existing recipes are retained. Browser verification is unavailable because cua_repl.js is absent; do not substitute another browser control path.


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


## Survival actors62 — eight additional actors only
- survivors62.js runs last. Stable IDs bot21_s62_1..8 are compatible with B16's existing save ID validation. Keep Dũng in the original AI21 loop; filter only these new IDs out of legacy replacement/chat/currency processing. New actor lifecycle dispatches through the existing death hook.
- Two actors per city/industry/forest/snow, restricted existing XD15S.SAFE IDs. Never generate houses, claim CO.site/HOME24 claims, or overwrite an owner. Missing built/passable/open-zone homes queue that actor; waiting actors have no active presence or player attack target. No house/map coordinates change.
- Reuse B16 A*/collision, AI_BRAIN21 survival decisions, AI21 house work/native recipe costs, existing finite R27 resources, F4 chest records/rolls/house-based daily caps, and KCN34 LS cooldowns. Actor chest overflow belongs to its own saved pending bag. Do not call player CMD inventory actions or temporarily swap the player's state/position.
- New actors start with no gifted resources, private10-slot backpacks and actual paid tool/crafting/repair/upgrade actions. Existing AI house construction means the paid stove and native house upgrades (max3); XD15 tower/cannon prototypes have no costs/gameplay and are not auto-spawned for bots.
- M19 escrow remains authoritative locally. New actors post/accept item barter only, preserve needed stock and reject currency, dead owners/buyers, repeated fulfillment. Dũng/player existing currency behavior stays unchanged. No new bot chat loop or PvP aggression.
- New actor protection/death matches native LIVES: three lives before GT72; death from GT72 ends the actor. Saved terminal flag and identity never replaced/revived. Do not use legacy AI21 replace/resetHome for new actors. Home upgrade/shape is retained when its owner dies.
- New survivors62 world SAVE extension stores actor inventories/stashes/equipment/durability/pending chest rewards/death state. B16 still owns base records. Rebind by stable ID after load, never duplicate records, validate home ownership again. Existing storage prefixes and all unrelated extensions stay unchanged.
- HUD counts local living player + active living peer presence + living bots (excluding waiting additions). Presence-only backend cannot provide an authoritative global population.
- The existing online transport has no world/market authority. Additional AI and its market/finite-loot writes are deliberately offline-only; do not remove the guard or claim shared online bots without an authorized server change. Existing online code is unchanged.
- One shared200ms scheduler; at most one expensive decision and one new A* per tick across these eight actors. Spatial perception cache rebuilds at most every2s, water perception cached5s. No interior model preloads and no actor timer per bot. Native Dũng loop remains separate.
- Validation under BOTS62_REVIEW: real A*/collision, native decisions/resource pickup/chest handlers/escrow functions plus simulated adapters. Browser/phone FPS and actual multiplayer not verified: managed cua_repl.js unavailable. Keep this distinction in handoff and publication reports.
