# Intsomi Studio

**From story to screen. On the artist's terms.**

Intsomi Studio is a hackathon proof of concept for an artist-led storytelling workflow: project notes and provenance, a Production Bible, creator-controlled image assets, storyboard panels, a timed animatic, and a private reader preview.

## Run the demo

Requires Node.js 18 or newer. No package install or build step is needed.

```powershell
node server.mjs
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173). The seeded project, **The Keeper of the Sacred Forest**, is original fictional demonstration material. It is not presented as an authentic oral narrative or cultural source.

### Three-to-five-minute walkthrough

1. Start at Workspace. Open **Story & provenance** and review the explicit fictional origin and adaptation notes.
2. Open **Production Bible**. Review Nandi, Mkhulu, the fictional locations, and the visual continuity guide.
3. Open **Asset library**. Preview the four AI-assisted draft illustrations. They remain outside the project until you choose **Approve & add to library**. Approval only adds the file to this project's reusable asset list; it does not attach it to a panel.
4. In **Storyboard**, assign approved artwork to panels using the Artwork asset selectors. Review dialogue, camera notes, panel order, and duration.
5. Open **Animatic** and use play, pause, restart, previous, and next.
6. Open **Reader preview** to show the same sequence as a private reading layout.

## Implemented in this PoC

- Local project creation, editing, archive/restore, and reopen after refresh.
- Story, source, permission, attribution, adaptation, character, location, and production guide fields.
- Image upload validation (PNG, JPEG, WebP, GIF; maximum 4 MB per file), with image bytes in IndexedDB and project metadata in local storage.
- Four original, fictional, AI-assisted draft illustrations. Each requires an explicit creator approval click before it enters the project library.
- Reusable approved assets; scenes and panels with editable text, ordering, dialogue, timing, and artwork references.
- Scene-to-character links and an offline Continuity check for broken character, location, and asset references and invalid panel durations. Findings include record evidence and never edit project content.
- Asset deletion is disabled while panels reference the asset; the library shows the using scene and panel. Remove those panel links first.
- Timed animatic and a private reader preview derived from the same scene and panel records.
- JSON backup export/import with images included in the export and restored into IndexedDB on import. Import validates project structure and image types/sizes before committing records, remaps asset links, and rolls back staged images if saving fails. Imports are limited to 64 MB and each image to 4 MB.
- A local rule-based panel breakdown helper that works without a key or network access. Suggestions stay drafts until the creator approves them.
- Optional live Production Coordinator at `/api/production-coordinator`. It is shown only when the server reports an API key. Before sending, the UI discloses that scene text and character/location context will go to OpenAI and requires an explicit consent checkbox. The endpoint returns structured editable panel suggestions and never applies them automatically.

## Optional live coordinator

The demo works without an API key. To enable the optional live coordinator in PowerShell, set the key only in the server process environment, then start the server:

```powershell
$env:OPENAI_API_KEY = "your-key"
node server.mjs
```

The endpoint uses the Responses API with structured output, `store: false`, and model `gpt-5.4-mini` by default. You can set `OPENAI_MODEL` to another compatible model. The server listens on `127.0.0.1` only. Keep the key out of source control and do not expose this unauthenticated PoC endpoint to a public network. The live request is optional; the browser-local helper remains available when the key is absent.

## Data and limits

Project records are stored in this browser's local storage. Image bytes are kept in IndexedDB. They are not uploaded unless a creator explicitly approves a live coordinator request; that request sends only scene text and character/location context. Export a JSON backup before clearing browser data. Import and export are intended to move a project between browsers.

This is a single-user, single-browser PoC. It has no sign-in, cloud sync, collaboration, server-side project storage, access control, or production deployment. The local Node server is a demo helper, not a hardened hosting service. Permissions, attribution, and provenance fields record creator intent; they do not verify legal rights, cultural context, translation, or authenticity. The fictional sample art makes no traditional or cultural provenance claim.

## Hackathon scope versus production

The PoC demonstrates one reviewable path from a fictional story record to a storyboard, animatic, and reader preview. It does not include a multi-user database, identity/roles, private cloud object storage, revision history, backup service, moderation or rights verification, marketplace, payments, audio, rendered animation, validated translation, or a culturally validated content pipeline. Those require separate product, community, security, and operational work before production use.

## Structural continuity review

The Continuity check is deterministic and runs in the browser. It checks only explicit scene character/location links, panel artwork references, and panel durations. Character links are selected by the creator in the storyboard; the check does not search dialogue or descriptions to guess who appears. Findings cite the affected scene/panel and leave all edits to the creator. It does not validate story meaning, provenance, language, or cultural accuracy.

## Repository

Public source: [github.com/SonwaboN/intsomi-studio](https://github.com/SonwaboN/intsomi-studio).

## Story stewardship

Open Story stewardship to add creator-described materials and distinct variants. Set a creator-recorded use status, then link records to the project, characters, locations, assets, scenes or panels. Material links buttons open the same workspace over production screens. Review lists advisory attention items and links back to the material and its production uses.

Public credits are opt-in per record. Reader preview can open a separate HTML credit sheet; only selected credit lines are included. Use browser Print / Save as PDF, or download the sheet from the stewardship Credits tab. Internal notes, references and permission fields are excluded. Project JSON backups retain the complete private records.

The feature operates locally without AI. Existing projects need no migration. Copy existing story notes creates an unclassified draft which the creator must describe before saving.

Run all checks with `node --test tests/*.test.mjs`. The stewardship increment has automated coverage for variant/link validation, advisory review, public-credit isolation and import remapping. Desktop/mobile interaction still needs a browser verification pass.

## Comic page composer

Open **Comic pages** to create blank pages and arrange existing storyboard panels. Each page stores ordered panel references plus presentation settings (width, image fit and gutter); panel dialogue, narration and artwork remain shared with the storyboard and animatic. Panels not placed on a page stay in the tray. Removing a panel or scene clears its page placements while preserving all other panels.

The Reader preview renders composed pages when they exist and falls back to the scene sequence for older projects with no pages. Use **Review print view** in the composer, then **Print / Save as PDF** from Reader preview. Browser print settings control paper size and margins. Creator-entered dialogue and narration can have additional language versions linked to the source panel and field; versions are not translated automatically. JSON backups retain page layouts, language labels and text versions.

## Language experience

The interface-language selector is a browser preference separate from each project's content-language labels. English is the complete interface. The isiXhosa locale is an early draft for the composer, language settings and navigation; it is explicitly marked as unreviewed and has not been validated by fluent creators. The remaining studio interface is still in English. Do not treat this draft as validated language support.

Projects can record multiple creator-entered content language labels. Panel dialogue and narration can carry separately editable original, translated or adapted text versions, each associated with its source field. The creator selects which language appears in Reader preview. Unicode text is stored in project JSON. Intsomi Studio does not perform translation or assess language quality.

## Netlify PoC deployment

Netlify is configured as a static deploy with **publish directory `dist`** and no build command (`netlify.toml`). The optional coordinator and health routes are Netlify Functions under `netlify/functions`; set `OPENAI_API_KEY` in Netlify environment settings to enable the live coordinator. Without a key, the function reports it as unavailable and the browser-local draft helper continues to work. The local `server.mjs` remains for local development and is not deployed as a Netlify server.

The app's projects and image assets remain in the visitor's browser, so a static deployment does not add accounts, cloud persistence, or shared project access. Verify Functions behavior in a Netlify deploy preview before using a live key.
