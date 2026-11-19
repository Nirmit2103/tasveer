# TASVEER — the darkroom

The website of **Tasveer, the media society of IIIT Delhi**.
A camera you can walk into: click anywhere in the viewfinder to shoot polaroids,
watch frames develop on the film strip, and flip the crew's polaroids back to
their childhood photos.

**Live:** https://breaking-byts.github.io/tasveer

## Run it

No build step. Any static server works:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

Opening `index.html` directly also works (fonts/GSAP load from CDN).

## What's inside

| Path | What |
|---|---|
| `index.html` | All sections: viewfinder hero, manifesto, film-strip gallery, polaroid crew wall, credits, join |
| `css/style.css` | Design tokens + everything visual. Palette/type at the top in `:root` |
| `js/main.js` | Interaction engine. **All content lives in `CONFIG`, `TEAM`, `GALLERY`, `CREDITS`, `SHOOT_CAPTIONS` at the top of this file** |
| `assets/team/` | Optimized polaroid photos (`name.webp`, childhood `name-child.webp`) |
| `assets/gallery/` | Film-strip frames (`frame-01.webp` …) |
| `assets/og.jpg`, `assets/favicon.svg` | Social share image + aperture favicon |

Raw source photos live in `team /` (gitignored — 165 MB, not for the web).

## Common edits

**Add your shots to the roll** (the gallery currently seeds 5 frames):
1. Drop optimized images into `assets/gallery/` (≈1200px wide, webp, ~150–250 KB each).
   Convert with: `cwebp -q 84 -resize 1200 0 photo.jpg -o assets/gallery/frame-06.webp`
2. Add an entry to `GALLERY` in `js/main.js`:
   `{ src:"assets/gallery/frame-06.webp", cap:"ROLL 001 · FR 06 — your caption" }`
   Empty "awaiting exposure" slots after the last frame are automatic.

**Set the Instagram link:** fill `CONFIG.instagram` in `js/main.js` with the full
URL (e.g. `"https://instagram.com/tasveer.iiitd"`). The FOLLOW button appears in
the Join section automatically. Until then the verified email CTA is used:
`tasveer@sc.iiitd.ac.in`.

**Swap a team photo:** replace `assets/team/<name>.webp` (portrait, 4:5, ≈900px
wide). Childhood flip-side: `<name>-child.webp`. To add a member, append to
`TEAM` — `child` is optional; without it the back shows a quote card.

**Draft copy to review:** the quote backs for Leelansh, Nirmit and Mukul, the
manifesto text, and the shoot captions are placeholders written for launch —
edit them in `js/main.js` / `index.html` to match the society's voice.

## Interactions

- Click/tap the hero → shutter flash + synthesized shutter sound + polaroid ejects into the tray (36 exposures per roll, then a fresh roll loads)
- Focus-reticle cursor with contextual labels (desktop)
- Film strip: frames develop from B&W to color as they pass; click for lightbox (arrow keys / Esc)
- Crew wall: department filters, click to flip polaroids
- Click the aperture logo 5× → **darkroom mode** (safelight easter egg)
- Sound toggle in the nav; respects `prefers-reduced-motion`

## Stack

Vanilla HTML/CSS/JS · [GSAP 3.12.5 + ScrollTrigger](https://gsap.com) ·
[Lenis 1.1.14](https://lenis.darkroom.studio) smooth scroll ·
Google Fonts: Anton, Instrument Serif, Space Mono.
No tracking, no cookies, no build tools.

## Deploy

GitHub Pages serves `main` branch root. Push to update:

```sh
git add -A && git commit -m "update" && git push
```

---

Shot & developed by the crew. © 2026 Tasveer, IIIT Delhi.