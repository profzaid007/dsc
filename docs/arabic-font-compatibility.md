# Arabic font compatibility investigation — 28 October 2026

Reported on MacBook Pro and MacBook Air using Chrome. The affected macOS/Chrome versions have not been reproduced directly.

The supplied TTF reports OS/2 weight 5 and Regular style, while CSS selects it as 700/Bold. Its PostScript name contains spaces, and parsing reports an out-of-range creation timestamp. It also contains legacy TrueType hinting programs. These findings are compatibility concerns, not proof of which item caused the reported missing strokes.

`tools/build-arabic-webfont.py` creates `public/fonts/mohammad-bold-art-web.woff` from the supplied font. It corrects the bold metadata and PostScript name, normalizes the timestamp and removes TrueType hinting. It verifies that all glyph outlines, the Unicode mapping, Arabic GSUB shaping and copyright entries remain unchanged. The original TTF is retained unchanged.

Noto Sans Arabic is now the standard Arabic font throughout the application, including the blog, events and registration pages. It is self-hosted through next/font and supports regular and bold text. The decorative font assets are retained for reference but are no longer selected by application styles. English text retains Geist. No OS detection or automatic visual-error detection is used.

TypeScript checks and local visual inspection do not establish macOS compatibility. The affected experts must verify the test deployment on their Macs before this can be declared fixed. Deployment and testing on the affected Macs must be verified separately.
