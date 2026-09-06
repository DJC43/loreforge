# 2026-09-06 — nested cards in brainstorm context

**Bug:** `projectContext` (used by Brainstorm, Grok Fill, and Harvest) only sent NPC / nested-card **titles**. Robert Interior, Ava Quinn Backstory, etc. never reached the model — only the names.

**Fix:** `src/lib/context.ts` now sends each card’s entry text (`value`, then NPC fields, then description), with nested cards indented under the parent.

The zip (`loreforge-source.zip`) is the last full snapshot and still has the old file. Overlay this path on top of an unzip:

```bash
# after unzipping loreforge-source.zip
curl -fsSL -o src/lib/context.ts \
  https://raw.githubusercontent.com/DJC43/loreforge/main/src/lib/context.ts
```

Grok Build being down does not apply this to a published `*.grok.me` app. Rebuild locally with `npm install && npm run dev`, or drop this file into a Build project when that is back.
