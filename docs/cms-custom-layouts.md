# Custom HTML/CSS layouts

CMS home pages, information pages and blog content share a **Custom HTML/CSS layout** editor mode. Paste a complete HTML document or an HTML fragment with `<style>` blocks. Full documents and style blocks are automatically detected when pasted into the HTML source editor. Existing rich text continues to use the visual editor.

The source is stored in the existing content field with a versioned comment marker. No database migration is needed. Opening the page again restores custom mode without sending the source through SunEditor. The custom source panel includes a live preview; CMS preview dialogs and public pages use the same renderer.

CSS variables, grid, flexbox, inline styles and media queries are preserved. The layout fills the existing CMS content area, retaining the site's header, navigation and footer. CSS is isolated in a sandboxed iframe. Its height follows the content, including collapsed margins. Very tall documents are capped at 30,000px and scroll within the frame.

JavaScript, forms, nested frames, external stylesheets and remote fonts are unsupported. Active markup and navigation metadata are removed; a restrictive CSP and a sandbox without script permission apply to the frame. HTTPS/HTTP images and normal links are supported. Existing rich-text sanitization is unchanged.

Converting a custom layout back to rich text requires confirmation because the rich-text sanitizer removes custom layout styling. Keep the original source if further layout editing is needed.

## Saving About Us and other home pages

Both language drafts are saved together; each editor's callbacks are bound to its language. The latest visible buffer overrides that language's draft. The editor reads the saved record again and checks both content fields before displaying **Changes saved and verified**. Failures retain the draft and show a visible error. Editing controls are disabled while saving. When a slug changes, the editor navigates to its saved URL.

Paste the original HTML again if an earlier editor version already stripped the CSS; removed styles cannot be reconstructed from plain formatted text.

## Validation

`npx tsx --test tests/cms-layout.test.ts tests/cms-layout-render.test.tsx tests/cms-save.test.ts`

Tests cover the supplied Arabic About Us document, exact source round-tripping, CSS preservation, sandbox/CSP restrictions, ordinary rich-text behavior, bilingual saves and read-back verification. A local in-memory browser harness also verified source retention after saving and remounting, two desktop columns, single-column mobile CSS at 375px, and automatic iframe height. The harness is removed before delivery and does not modify existing CMS records.
