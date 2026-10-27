# Project Git destination

When the user asks to commit and push, use this destination unless they explicitly request another:

- Repository: https://github.com/profzaid007/dsc.git
- Remote: origin
- Branch: dr-badr (exact spelling and lowercase)

Include the changes authorized by the user. Preserve existing remote work and integrate it before pushing when necessary. If working on a different branch, put the requested changes on dr-badr before pushing. Do not substitute the fork remote or another branch for this default.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
