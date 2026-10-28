"""Build the supplied Arabic design as an unhinted WOFF; requires fonttools.
Run: python tools/build-arabic-webfont.py
The original TTF is retained unchanged. Copyright/name ownership is preserved.
"""
from pathlib import Path
import hashlib
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/fonts/mohammad-bold-art-1.ttf"
OUTPUT = ROOT / "public/fonts/mohammad-bold-art-web.woff"

def outlines(font):
    glyf = font["glyf"]
    result = {}
    for name in font.getGlyphOrder():
        coords, ends, flags = glyf[name].getCoordinates(glyf)
        result[name] = (list(coords), list(ends), list(flags))
    return result

font = TTFont(SOURCE, recalcTimestamp=False)
original_outlines = outlines(font)
original_cmap = font.getBestCmap().copy()
original_shaping = font.getTableData("GSUB")
original_copyright = [n.toUnicode() for n in font["name"].names if n.nameID == 0]
font["OS/2"].usWeightClass = 700
font["OS/2"].fsSelection = (font["OS/2"].fsSelection | (1 << 5)) & ~(1 << 6)
font["head"].macStyle |= 1
# The old timestamp contains nonzero upper bits; retain its lower 32-bit value.
font["head"].created &= 0xFFFFFFFF
for item in font["name"].names:
    replacement = {2: "Bold", 5: "Version 1.001; DSC web compatibility build", 6: "MohammadBoldArt-Web"}.get(item.nameID)
    if replacement:
        item.string = replacement.encode(item.getEncoding())
for glyph in font["glyf"].glyphs.values():
    glyph.expand(font["glyf"])
    glyph.removeHinting()
for tag in ("fpgm", "prep", "cvt "):
    if tag in font:
        del font[tag]
font.flavor = "woff"
font.save(OUTPUT)
verified = TTFont(OUTPUT)
assert outlines(verified) == original_outlines, "Letter outlines changed"
assert verified.getBestCmap() == original_cmap, "Character mapping changed"
assert verified.getTableData("GSUB") == original_shaping, "Arabic shaping changed"
assert [n.toUnicode() for n in verified["name"].names if n.nameID == 0] == original_copyright
assert verified["OS/2"].usWeightClass == 700
assert all(tag not in verified for tag in ("fpgm", "prep", "cvt "))
print("Verified: glyph outlines, Arabic shaping, character mapping and copyright unchanged.")
print("Corrected bold metadata and PostScript name; removed TrueType hinting.")
print(OUTPUT.name, OUTPUT.stat().st_size, "bytes", hashlib.sha256(OUTPUT.read_bytes()).hexdigest())
