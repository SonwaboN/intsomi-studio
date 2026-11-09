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
- Timed animatic and a private reader preview derived from the same scene and panel records.
- JSON backup export/import with images included in the export and restored into IndexedDB on import.
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

## Repository

Public source: [github.com/SonwaboN/intsomi-studio](https://github.com/SonwaboN/intsomi-studio).
