/* Explicitly retired houses from the user's map. Keep all other geometry/data. */
(()=>{const d=globalThis.CITY4_DATA;if(!d)return;for(const id of ['na_r1','na_r5'])if(!d.removedSites.includes(id))d.removedSites.push(id);if(!d.removedBotHomes.includes('bh4'))d.removedBotHomes.push('bh4')})();
