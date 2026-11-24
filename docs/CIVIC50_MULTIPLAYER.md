# Multiplayer handoff notes

## What is preserved

The existing NET/PROTO and peer presence fields remain in use. Civic buildings are added to the existing interior registry. The optional `i46` presence field continues to carry the building key, zero-based floor, local x/z and elevation h. Original world coordinates remain tied to the existing HFL floor records, so peers in other buildings/floors are filtered before rendering.

The current source has `WS_ENABLED=false`. Offline mode reports no authoritative command capability. Room presence by itself is not an authoritative inventory transaction.

## Current behavior

- Offline civic searching uses the existing `interior46.search` command, original item source IDs and existing saved claim list.
- One source grants one existing item. A repeated or already-claimed source grants nothing.
- Applying a received remote claim hides that source and marks it claimed; it never grants inventory to the receiving player.
- A civic pickup request made while NET is not offline is rejected. This guard is deliberate: with the current non-authoritative backend, two independent clients could otherwise award inventory before hearing about the competing claim.
- Existing stores/schools/malls and the transport implementation are not changed by this civic-only guard.

## Before enabling civic collection online

The existing server integration must reserve/claim a source transactionally and award inventory only after acceptance. Use a unique world/source key and an idempotent command ID. Validate the actor, building, floor, distance, item kind and inventory capacity on the server. Broadcast the committed claim to other clients. A client-side presence message or serial mock must not be used as proof of an atomic multi-client claim.

No new server or endpoint is implemented or deployed in this handoff. The simulated 20-peer rendering and serial command tests establish client behavior only. They do not certify 20-player live networking, latency, authority or concurrent transactions.
