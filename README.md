# TASVEER — the darkroom

The website of **Tasveer, the media society of IIIT Delhi**.
A camera you can walk into: click anywhere in the viewfinder to shoot polaroids,
watch frames develop on the film strip, swipe the roll on your phone, and flip
the crew's polaroids back to their childhood photos.

**Live:** https://breaking-byts.github.io/tasveer

Chosen from three explored aesthetics (darkroom / contact sheet / camcorder Y2K)
by a four-seat review council — art director, frontend engineer, first-time
visitor, accessibility — refined over four rounds to unanimous approval.
The two archived variants remain in the repo as `v-contact.html` / `v-camcorder.html`.

## Run it

No build step. Any static server works:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

GSAP, ScrollTrigger and Lenis are self-hosted in `js/vendor/` — the site works
offline except for Google Fonts (and degrades gracefully without them).

## What's inside

| Path | What |
|---|---|
| `index.html` | The site: viewfinder hero, manifesto, film-strip gallery, polaroid crew wall, credits, join |
| `js/data.js` | **All content lives here** — `CONFIG`, `TEAM`, `DEPTS`, `GALLERY`, `CREDITS`, `SHOOT_CAPTIONS` |
| `css/darkroom.css` | Design tokens + everything visual. Palette/type at the top in `:root` |
| `js/darkroom.js` | Interaction engine (shoot/tray, develop strip, flips, lightbox, easter egg) |
| `js/vendor/` | Self-hosted GSAP 3.12.5, ScrollTrigger, Lenis 1.1.14 |
| `assets/team/` | Optimized polaroid photos (`name.webp`, childhood `name-child.webp`) |
| `assets/gallery/` | Film-strip frames (`frame-01.webp` …) |
| `assets/og.jpg`, `assets/favicon.svg` | Social share image + aperture favicon |
| `v-darkroom.html` | Alias of the promoted build (identical to `index.html`) |
| `v-contact.html`, `v-camcorder.html` | Archived council variants (own css/js files) |

Raw source photos live in `team /` (gitignored — 165 MB, not for the web).

## Common edits

**Add your shots to the roll** (the gallery currently seeds 5 frames):
1. Drop optimized images into `assets/gallery/` (≈1200px wide, webp, ~150–250 KB each).
   Convert with: `cwebp -q 84 -resize 1200 0 photo.jpg -o assets/gallery/frame-06.webp`
2. Add an entry to `GALLERY` in `js/data.js`:
   `{ src:"assets/gallery/frame-06.webp", cap:"ROLL 001 · FR 06 — your caption" }`
   The two "RESERVED FOR YOU" recruitment frames after the last shot are automatic.

**Set the Instagram link:** fill `CONFIG.instagram` in `js/data.js` with the full
URL (e.g. `"https://instagram.com/tasveer.iiitd"`). The FOLLOW button appears in
the Join section automatically. Until then the verified email CTA is used:
`tasveer@sc.iiitd.ac.in`.

**Swap a team photo:** replace `assets/team/<name>.webp` (portrait, 4:5, ≈900px
wide). Childhood flip-side: `<name>-child.webp`. To add a member, append to
`TEAM` — `child` is optional; without it the back shows a quote card.

**Draft copy to review:** the quote backs for Leelansh, Nirmit and Mukul, the
manifesto text, and the shoot captions are placeholders written for launch —
edit them in `js/data.js` / `index.html` to match the society's voice.

## Interactions

- Click/tap the hero (or the SHOOT ⏎ button) → shutter flash + synthesized
  shutter sound + polaroid ejects into the tray (36 exposures per roll, then a
  fresh roll loads; tray holds 5 on desktop, 3 on phones)
- Tray polaroids are keyboard-operable; click/Enter opens the inspector
- Film strip: frames develop from B&W to color as they pass (7s develop timer);
  pinned horizontal scrub on desktop, native swipe + snap on touch; click for
  lightbox (arrow keys / swipe / Esc, FR counter)
- Crew wall: department filters, click to flip polaroids to childhood photos
- Click the aperture logo 5× → **darkroom mode** (safelight easter egg — the
  footer whispers the hint)
- Nav toggles: SND (shutter sound) and MOT (pause ambient motion); both persist
- Focus-reticle cursor with contextual labels (desktop)
- Full `prefers-reduced-motion` fallback; WCAG A/AA audited by the council

## Stack

Vanilla HTML/CSS/JS · GSAP 3.12.5 + ScrollTrigger + Lenis 1.1.14 (self-hosted) ·
Google Fonts: Anton, Instrument Serif, Space Mono.
No tracking, no cookies, no build tools.

## Deploy

GitHub Pages serves `main` branch root. Push to update:

```sh
git add -A && git commit -m "update" && git push
```

---

Shot & developed by the crew. © 2026 Tasveer, IIIT Delhi.