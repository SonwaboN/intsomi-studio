# AGENTS.md

## 1. Project Mission

Intsomi Studio is an artist-first creative production platform for Southern African graphic storytelling, comics and animation.

Its purpose is to help creators take original stories from concept to production through one connected workflow:

**Story → Production Bible → Asset Library → Storyboard → Animatic → Publication**

Build creative infrastructure, not another generic AI storytelling application.

## 2. Core Principles

- **Artist-first:** The creator remains the author and decision-maker.
- **AI-optional:** All essential workflows must function without AI.
- **Ownership:** Never claim ownership of creator content or use it for model training.
- **Cultural integrity:** Never invent cultural facts, folklore origins, customs, genealogies or translations.
- **Provenance:** Distinguish documented sources, oral variants, historical references and original creative interpretations.
- **Continuity:** Reuse approved characters, locations and assets across production stages.
- **Transparency:** Never present simulated functionality as a working integration.

## 3. Implementation Priorities

Prioritise these in order:

1. Application foundation and creator dashboard.
2. Project creation and persistence.
3. Story documentation and provenance.
4. Character, World and Production Bibles.
5. Asset Library and uploads.
6. Storyboard editor.
7. Timed animatic playback.
8. Optional AI agents.
9. Comic and publication preview.
10. Final polish, testing and documentation.

The Production Bible, Asset Library, Storyboard and Animatic must operate as one integrated workflow.

Do not sacrifice core functionality to add superficial features.

## 4. Engineering Standards

- Inspect the existing repository before making changes.
- Preserve working architecture and reusable components.
- Follow the existing framework, conventions and package manager.
- Use TypeScript and strong typing where applicable.
- Keep components modular and reusable.
- Separate UI, business logic, persistence and AI integrations.
- Validate inputs and API responses.
- Handle loading, empty, success and error states.
- Keep secrets in environment variables.
- Never hardcode API keys or credentials.
- Avoid unnecessary dependencies and abstractions.
- Keep the application runnable after every major implementation phase.

## 5. Data and Persistence

- Use persistent storage for project data.
- Do not rely on temporary browser state for permanent records.
- Maintain relationships between projects, characters, locations, assets, scenes and panels.
- Validate project ownership and access.
- Prevent orphaned records and accidental asset deletion.
- Ensure storyboard changes are reflected in animatic playback.
- Preserve creator content and approved versions.
- Make export and future portability possible.

## 6. AI Agent Rules

AI is an optional assistant, never the creative authority.

The three planned agents are:

- **Story Steward:** Organises research, provenance and attribution; flags unsupported claims.
- **Production Coordinator:** Converts approved creative material into draft production structures.
- **Continuity Inspector:** Identifies possible inconsistencies against approved project references.

Agents must use scoped operations and structured outputs.

All consequential changes require creator review and approval.

Never silently rewrite stories, overwrite assets or automatically approve AI-generated suggestions.

Clearly distinguish live AI functionality from deterministic demo behaviour.

## 7. UX and Design

The interface must feel like a professional creative studio.

- Use a restrained, editorial and cinematic design language.
- Prioritise visual clarity and creative workflows.
- Use warm neutrals and restrained terracotta accents.
- Avoid generic AI dashboard aesthetics and stereotypical cultural decoration.
- Make navigation and project context obvious.
- Provide responsive layouts, prioritising desktop production workflows.
- Ensure essential interactions are accessible and functional.

## 8. Cultural and Creative Responsibility

- Never label fictional material as authentic traditional folklore without evidence.
- Preserve source attribution and permission records where relevant.
- Respect multiple oral-story variants.
- Do not expose restricted or sensitive cultural knowledge.
- Do not claim language support without validation.
- Treat community knowledge and contributions with care.

## 9. Testing and Quality

Test meaningful workflows, not just individual screens.

Verify:

- Project creation and persistence.
- Character and world documentation.
- Asset upload and retrieval.
- Storyboard creation and ordering.
- Animatic timing and playback.
- AI-disabled functionality.
- Reader preview.
- Error and empty states.

Run relevant tests after significant changes. Never claim unverified functionality is complete.

## 10. Codex Working Protocol

Before implementation:

1. Inspect the repository and existing documentation.
2. Identify reusable functionality and technical constraints.
3. Present a prioritised implementation plan.
4. Identify risks and dependencies.

During implementation:

- Work in small, verifiable phases.
- Explain significant architectural decisions.
- Avoid unnecessary rewrites.
- Keep documentation updated.
- Prioritise a complete working workflow over isolated mockups.

At completion, report what works, what was tested, known limitations and the next priorities.

## 11. Definition of Success

A creator must be able to document a story, build its production bible, upload and organise artwork, create a storyboard, play it as a timed animatic and preview it as a comic.

**Guiding principle: An artist must be able to create an entire world in Intsomi Studio without ever having to ask AI to create it for them.**
