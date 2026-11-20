# TASVEER — every story is in our backyard

The website of **Tasveer, the media society of IIIT Delhi**.
A premium editorial canvas inspired by drivecapital.com — black grain,
giant photo-filled condensed type, scrolling marquees, warm-monochrome
frames — re-voiced for a campus media society: THE ROLL (six event beats
that expand into photo essays), THE CREW (tap a portrait, everyone was a
kid once), and a blue pill that keeps a secret.

**Live:** https://breaking-byts.github.io/tasveer

Chosen and refined by a four-seat review council — art director, frontend
engineer, first-time visitor, accessibility — to unanimous approval
(pixel-measured contrast, trusted-input keyboard/touch audits, WCAG A/AA,
full `prefers-reduced-motion` fallback, zero console errors even with all
vendor libraries blocked). The earlier darkroom build lives on as
`v-darkroom.html`; `v-contact.html` / `v-camcorder.html` are archived variants.

## Run it

No build step. Any static server works:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

GSAP, ScrollTrigger and Lenis are self-hosted in `js/vendor/` — the site
degrades gracefully without them (content visible by default, native scroll).

## What's inside

| Path | What |
|---|---|
| `index.html` | The site: hero wordmark, photo band, story, THE ROLL, location marquee, THE CREW, open call, footer |
| `js/data.js` | **Shared content** — `CONFIG`, `TEAM`, `DEPTS`, `GALLERY`, `CREDITS` |
| `js/drive.js` | Drive build engine + `BEATS` (the six roll events) + `bandImgs` |
| `css/drive.css` | Design tokens + everything visual. Palette/type at the top in `:root` |
| `js/vendor/` | Self-hosted GSAP 3.12.5, ScrollTrigger, Lenis 1.1.14 |
| `assets/team/` | Crew portraits (`name.webp`, childhood `name-child.webp`) |
| `assets/drive/` | Hero aerials + placeholder frames (warm-mono treatment unifies them with real shots) |
| `assets/gallery/` | Society frames used in the photo band + roll |
| `assets/og.jpg`, `assets/favicon.svg` | Social share image + favicon |
| `v-drive.html` | Alias of the promoted build (identical to `index.html`) |
| `v-darkroom.html` | The previous council-approved darkroom build |
| `v-contact.html`, `v-camcorder.html` | Archived exploration variants |

Raw source photos live in `team /` (gitignored — 165 MB, not for the web).

## Common edits

**Add your shots:** drop optimized webp into `assets/gallery/` (≈1200px wide,
~150–250 KB) and add `{ src, cap }` to `GALLERY` in `js/data.js` — they flow
into the photo band automatically. Roll event frames are in `BEATS`
(`js/drive.js`); placeholder frames there are meant to be replaced with the
society's own photos.

**Set the Instagram link:** fill `CONFIG.instagram` in `js/data.js` — the
INSTAGRAM footer link appears automatically. Until then the verified email
CTA is used: `tasveer@sc.iiitd.ac.in`.

**Swap a crew photo:** replace `assets/team/<name>.webp` (portrait 4:5,
≈900px wide). Childhood flip-side: `<name>-child.webp`. Without one, the
portrait goes color on tap and a toast says no childhood frame is on file —
yet. Nirmit shows AWAITING EXPOSURE until a frame arrives.

**Daylight mode:** the whole palette swaps via `body.daylight` tokens at the
top of `css/drive.css` — edit there, not per-component.

## Interactions

- Hero TASVEER wordmark: photo-filled letters, three aerials crossfading,
  sliced by the fold, bleeding off both edges
- THE ROLL: six beats expand into captioned photo essays (+ rotates to ×)
- THE CREW: department filters; tap/click flips to childhood photos
  (FRAME 00 · BEFORE TASVEER); missing frames handled with voice, not silence
- The blue right-edge pill fills with scroll progress — click it 3× for
  **daylight mode** (the footer whispers the hint)
- Subscribe + OPEN CALL are honest mailto composes — no fake backend
- MOTION toggle (menu + footer) pauses all ambient motion; persists
- Full keyboard support: skip link, focus-trapped menu, Esc everywhere,
  focus lands on target sections; reduced-motion users get a static,
  fully operable site

## Stack

Vanilla HTML/CSS/JS · GSAP 3.12.5 + ScrollTrigger + Lenis 1.1.14 (self-hosted) ·
Google Fonts: Archivo (variable width/weight), Space Mono.
No tracking, no cookies, no build tools.

## Deploy

GitHub Pages serves `main` branch root. Push to update:

```sh
git add -A && git commit -m "update" && git push
```

---

Shot & developed by the crew. © 2026 Tasveer, IIIT Delhi.
