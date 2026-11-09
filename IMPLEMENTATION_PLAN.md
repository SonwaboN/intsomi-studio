# Intsomi Studio — hackathon PoC implementation plan

## Current progress

The initial browser prototype is the baseline. It already contains the core story-to-screen surfaces: project management, story/provenance records, character/world/production notes, storyboard scenes and panels, timed animatic playback, reader preview, local panel breakdown suggestions, and JSON backup.

This PoC update adds:

- IndexedDB image storage with project metadata retained in local storage; legacy data-URL uploads are migrated when the app opens.
- Four original fictional AI-assisted illustration drafts, labeled as drafts and gated behind explicit creator approval before they enter the project library.
- A small local Node server for static serving and an optional server-side Production Coordinator endpoint. The API key stays in the server environment. No-key mode keeps the local helper available.
- Explicit disclosure and consent before the live endpoint sends scene text and character/location context to OpenAI. Returned suggestions are editable and require a separate approval action before they become panels.
- Updated README and a short demo path.

Still outside this hackathon PoC: sign-in, cloud project storage, collaboration, production deployment, rights verification, marketplace/payments, full animation rendering, audio, and a validated cultural or translation workflow. No API key was supplied for this work, so the live provider round trip has not been exercised.

## Demo goal

Open the seeded fictional project → review its provenance and Bible → preview original AI-assisted draft art → approve selected art → reuse it in storyboard panels → play the animatic → show the private reader preview.

The demo project is original fictional material. It does not claim traditional, sacred, oral-history, or community provenance. The sample illustrations are visual drafts, not cultural evidence or research.

## PoC requirements

### Project workspace

- Create/edit/open/archive/restore projects in the browser.
- Keep project and story records editable, with source, permission, attribution, and adaptation notes distinct.
- Continue to support JSON export/import for portable backups.

### Assets

- Validate uploaded image types and 4 MB per-file limit.
- Store image bytes in IndexedDB, leaving metadata and project links in local storage.
- Migrate prior inline image data on first run.
- Keep demo art out of the project library until a creator explicitly approves it.
- After approval, allow manual reuse through the storyboard asset selector.

### Storyboard, animatic, and reader

- Maintain one scene/panel model for editing, playback, and reading preview.
- Support text/dialogue, scene and panel ordering, artwork links, durations, and missing-art states.
- Provide play, pause/resume, restart, previous, next, and reader preview.

### Production Coordinator

- Keep a browser-local rule-based helper available without an API key.
- Expose the live endpoint only when the server has a key.
- Disclose exactly which scene and context fields will be sent; require a click and checkbox before sending.
- Keep the key server-side; request structured, editable suggestions; never auto-apply them or generate cultural claims.
- If disabled or unavailable, preserve the manual workflow.

## Architecture

- `dist/index.html`: buildless HTML/CSS/JavaScript interface.
- Browser `localStorage`: project records, metadata, panel content, and references.
- Browser IndexedDB: image blobs; exports temporarily encode them as data URLs so backups remain portable.
- `server.mjs`: loopback-only static server and same-origin optional `/api/production-coordinator` endpoint.
- `dist/demo-drafts.json` and `dist/assets/`: original AI-assisted fictional draft illustrations and their display metadata.
- OpenAI Responses API: optional live structured panel suggestions; only invoked after explicit creator consent.

## Hackathon acceptance checklist

- [ ] Project create/edit/archive/restore/export/import/reopen after refresh.
- [ ] Multiple image uploads; invalid/oversized rejection; survive refresh and reuse in panels.
- [ ] Draft art remains pending until approval; approved art is reusable.
- [ ] Scene/panel edit, order, dialogue, and duration sync across storyboard, animatic, and reader.
- [ ] Play, pause/resume, restart, previous/next, and missing-art state.
- [ ] Local helper works without a key; endpoint reports disabled without a key.
- [ ] If a key is configured, live suggestions require disclosure/consent and explicit approval before adding panels.
- [ ] Desktop/mobile layout review and a 3–5 minute demo rehearsal.

## Production follow-up (not part of this PoC)

Only after the hackathon: assess identity and roles, project authorization, cloud object storage, encrypted backups, server-side upload validation, revisions/audit log, contributor consent, deletion/export controls, support and incident response, and community-led review for any language or cultural features. Do not treat this PoC as suitable for sensitive community knowledge or production assets.
