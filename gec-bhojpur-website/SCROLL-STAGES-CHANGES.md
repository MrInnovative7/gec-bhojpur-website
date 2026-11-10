# GEC Bhojpur: Two-stage sticky scroll effect — change report

Files changed: `index.html`, `css/style.css`, `js/main.js`. Every change is **additive**: 0 existing lines were removed or edited in any file.

## 1. What I found in the project (before changing anything)

| Finding | Consequence |
|---|---|
| DOM order inside `<main>`: `.hero` → `.notice-board` → `.about-principal` → Campus News → Academic Units → Startups → `.campus` (stats photo) → **Media Glance** (`.sec.alt`) → `.campus-footer-image`. Header and footer are injected by `main.js` into `#site-header` / `#site-footer`, outside `<main>`. | Both stages need wrappers; the header never takes part in the layout. |
| The photo to be revealed is **`.campus-footer-image` / `assets/images/campus2.png`**, directly below Media Glance. `.campus` / `.campus-background` is a different section (the stats band) that is *above* Media Glance. | The existing campus parallax acts on a different element, so it cannot conflict with the reveal. |
| Home header: `position:absolute` at the top, switched to `position:fixed` + `.is-scrolled` by `main.js` when `scrollY > 20`. Scrolled height measured: **66px** (62px at 768, 56px on phones). | Hero pins at `top:0` (same place it already is); Media Glance must pin below the 66px bar. |
| No `overflow` on `html`, `body`, `main` or `.sec`. | `position: sticky` works without touching any global overflow. |
| `.hero` is defined twice (line ~323 and ~2582; the later one wins: `height:100vh`). | I did **not** edit either. The new rules are scoped to `.hero-stage > .hero`, so other pages that may use `.hero` are untouched. |
| Media Glance is **999px tall at 1920×1080, 895px at 1366×768, 878px at 1280×720**: taller than the visible area (viewport minus header) on every laptop size. | A plain `sticky; top: header` would cut off the bottom of the gallery, so the pin position is measured and adapted (section 4). |
| `campus2.png` has `width="1873" height="840"` and **no `height:auto`**, so it is squashed at any width other than 1873px (e.g. 1366px wide × 840px tall; 768px × 840px). | Pre-existing bug. In the reveal layer I add `width:100%; height:auto` so the photo keeps its true proportions. |

## 2. New wrapper elements

| Wrapper | Contains | Purpose |
|---|---|---|
| `<div class="hero-stage">` | `.hero`, `.notice-board`, `.about-principal` | Containing block for the sticky hero. The hero stays pinned exactly as long as these two sections take to scroll over it, then is released. Without this wrapper a sticky hero would stay pinned for the whole page. |
| `<div class="glance-stage">` | Media Glance `.sec.alt`, `.campus-footer-image` | Containing block for the pinned gallery. The photo is the next block in the flow, so it rises at exactly scroll speed over the stationary gallery. |

## 3. Exact HTML changes (`index.html`, 4 edits)

**Edit 1: open Stage 1 around the hero**
```html
<!-- OLD -->
<section class="hero" aria-label="Welcome">
<!-- NEW -->
<div class="hero-stage">
<section class="hero" aria-label="Welcome">
```

**Edit 2: close Stage 1 after About/Principal**
```html
<!-- OLD -->

<section class="sec alt campus-news-section">
<!-- NEW -->

</div><!-- /.hero-stage -->

<section class="sec alt campus-news-section">
```

**Edit 3: open Stage 2 around Media Glance**
```html
<!-- OLD -->
<section class="sec alt">
  <div class="container media-glance">
<!-- NEW -->
<div class="glance-stage">
<section class="sec alt">
  <div class="container media-glance">
```

**Edit 4: close Stage 2 after the campus photo**
```html
<!-- OLD -->
</section>

</main>
<!-- NEW -->
</section>
</div><!-- /.glance-stage -->

</main>
```
All IDs, links, image sources and visible text are unchanged (verified by script).

## 4. CSS (`css/style.css`): one block appended at the end

Old code: none (nothing existing was modified). New code, appended after the last existing rule:

```css

/* ==========================================================
   SCROLL STAGES (home page)
   Two independent sticky stages. Both are pure CSS; the only
   script is the small measuring helper at the end of main.js,
   which sets --stage-header-h, --glance-pin-top and
   --glance-cut on .glance-stage.

   Stage 1  .hero-stage   the hero video stays pinned while the
                          Notice board and About sections scroll
                          up over it, then it is released.
   Stage 2  .glance-stage Media Glance stays pinned while the
                          campus photograph rises over it.

   Everything is inside prefers-reduced-motion: no-preference,
   so reduced-motion visitors get the original static page.
   Stage 2 is limited to screens wider than 760px; phones keep
   the normal flow for the gallery.
   ========================================================== */

.glance-stage {
  --stage-header-h: 66px;                       /* height of the scrolled header; refined by main.js */
  --glance-pin-top: var(--stage-header-h);      /* where Media Glance pins; refined by main.js */
  --glance-cut: 0px;                            /* bottom padding that may be cropped while pinned */
}

@media (prefers-reduced-motion: no-preference) {

  /* Stage 1: .hero-stage is the hero's containing block, so the sticky
     hero is released when the stage ends and is never pinned for the
     whole page. The sections after it are opaque and sit above it. */
  .hero-stage > .hero {
    position: sticky;
    top: 0;
    z-index: 0;
  }

  .hero-stage > .sec {
    position: relative;
    z-index: 1;
  }
}

@media (prefers-reduced-motion: no-preference) and (min-width: 761px) {

  /* Stage 2, pinned layer: Media Glance. It is at least as tall as the
     space between the header and the bottom of the screen, so the
     photograph below it always starts rising from the screen edge. */
  .glance-stage > .sec.alt {
    position: sticky;
    top: var(--glance-pin-top);
    z-index: 0;
    min-height: calc(100vh - var(--glance-pin-top));
  }

  /* Stage 2, reveal layer: the existing campus photograph. It is as tall
     as the screen (plus any cropped padding), so when the stage ends it
     fully covers the gallery. The image keeps its own proportions and is
     anchored to the bottom, so the page background shows above it exactly
     as before. */
  .glance-stage > .campus-footer-image {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-end;
    min-height: calc(100vh + var(--glance-cut));
    background: var(--bg);
  }

  .glance-stage > .campus-footer-image img {
    width: 100%;
    height: auto;
  }
}
```

How it works:
- **Stage 1.** `.hero-stage > .hero` is `sticky; top:0`. The two following sections are `relative; z-index:1` and opaque, so they slide over it. The hero is released when `.hero-stage` ends, at which point it is already completely hidden, so there is no jump or gap.
- **Stage 2.** Media Glance is `sticky` at `--glance-pin-top`. The photo layer comes next in the flow with a higher `z-index`, so it rises over the stationary gallery. It is at least one screen tall, so when the stage ends it fully covers the gallery. The photo is anchored to the bottom of the layer with its own proportions and the page background above it, exactly as it looked before.
- **Accessibility / phones.** Everything sits inside `prefers-reduced-motion: no-preference`; Stage 2 is further limited to `min-width: 761px`. Phones keep Stage 1 and the normal flow for the gallery; reduced-motion visitors get the original page.

## 5. JavaScript (`js/main.js`): one IIFE appended at the end

Old code: none (the existing script is untouched). New code:

```js

/* Scroll stages: measuring helper for the pinned Media Glance stage (home page).
   The stages themselves are CSS (see "SCROLL STAGES" in style.css). This only
   measures two things CSS cannot know and publishes them as custom properties:
   the real height of the scrolled header, and where Media Glance should pin so
   that its gallery stays fully visible. No scroll listener: it reacts to size
   changes only (ResizeObserver + resize), batched with requestAnimationFrame. */
(function () {
  "use strict";
  var stage = document.querySelector(".glance-stage");
  var media = stage && stage.querySelector(".sec.alt");
  var inner = media && media.querySelector(".container.media-glance");
  if (!inner) return;
  var header = document.querySelector(".site-header");
  var headerH = 66;               /* matches the CSS fallback until the header is first measured */
  var queued = false;

  function update() {
    queued = false;
    /* The header is only a fixed bar once the page is scrolled; ignore its taller transparent state. */
    if (header && header.classList.contains("is-scrolled") && header.offsetHeight > 0) headerH = header.offsetHeight;
    var cs = getComputedStyle(media);
    var padB = parseFloat(cs.paddingBottom) || 0;
    var natural = inner.offsetHeight + (parseFloat(cs.paddingTop) || 0) + padB;
    var vh = window.innerHeight;
    /* Fits below the header: pin just under it. Too tall: align the bottom of the
       gallery with the bottom of the screen (only the empty bottom padding is cropped). */
    var pin = Math.min(headerH, vh - natural + padB);
    var cut = Math.max(0, pin + natural - vh);
    stage.style.setProperty("--stage-header-h", headerH + "px");
    stage.style.setProperty("--glance-pin-top", pin.toFixed(1) + "px");
    stage.style.setProperty("--glance-cut", cut.toFixed(1) + "px");
  }
  function request() { if (!queued) { queued = true; requestAnimationFrame(update); } }

  if ("ResizeObserver" in window) {
    var ro = new ResizeObserver(request);
    ro.observe(inner);
    if (header) ro.observe(header);
  }
  window.addEventListener("resize", request, { passive: true });
  request();
})();
```

Why it exists: CSS cannot know the real scrolled-header height or the gallery height. The script publishes `--stage-header-h`, `--glance-pin-top` and `--glance-cut`. If the gallery fits below the header it pins just under it; if it is too tall, it pins with the gallery's bottom at the screen bottom (only the empty bottom padding is cropped). It has **no scroll listener** (ResizeObserver + resize only, batched with `requestAnimationFrame`). Without JavaScript, CSS fallbacks (66px) still give a working effect.

## 6. Run and test locally (VS Code + Live Server)

1. Replace `index.html`, `css/style.css` and `js/main.js` in your project with these three files (keep your `assets/` and `js/data.js`).
2. In VS Code open the project folder, right-click `index.html` → **Open with Live Server**.
3. Hard-refresh (Ctrl+Shift+R) so the new CSS/JS load.
4. Scroll slowly from the top and check, in order:
   - Hero video stays in place while Notice/Events/Academic Notices and About/Know Us slide up over it, then normal scrolling resumes.
   - Scroll on normally to Media Glance. When it reaches the header it stops moving; the gallery stays still.
   - The campus photograph rises from the bottom over the gallery until it covers it, then the footer scrolls in normally.
5. Test other sizes in Chrome DevTools (Ctrl+Shift+M): 1920, 1366, 1280, 768, 430, 375. To test reduced motion: DevTools → ⋮ → More tools → Rendering → *Emulate CSS prefers-reduced-motion: reduce*.

## 7. What I tested and what I could not

Tested in headless Chromium by sweeping the scroll position and measuring element positions, plus screenshots at 1920×1080, 1366×768, 1280×720, ~1745×830, 768×1024, 430×932 and 375×667:
- Hero stays at `top:0` through its stage and is released only after it is covered; the video keeps playing (currentTime advances, not paused).
- Media Glance pins; the photo starts at the bottom edge and rises 1:1; at release it covers the visible stage; the footer follows with no gap.
- Header still toggles `is-scrolled` and stays `fixed` at `z-index:1000`; campus parallax still runs; gallery clicks open the lightbox while pinned; no horizontal overflow introduced.

**Not tested:** your real `assets/` (images and video were not uploaded, so I used placeholders of the same dimensions); Safari, Firefox and real phones.

**Known limits**
- Viewports shorter than about 740px (e.g. 1280×720): the gallery is slightly taller than the space under the header, so up to ~18px of the top of the big tile sits under the header while pinned.
- The photo layer is one screen tall but the photo keeps its proportions, so a band of page background sits above the photo's own white fade as it rises. If you would rather have the photo fill the whole screen (cropping about 15% off the sides), add inside the `min-width: 761px` block: `.glance-stage > .campus-footer-image img { height: 100%; object-fit: cover; object-position: center bottom; }`
- Pre-existing and untouched: the header overflows horizontally on phones (page width 477px at 430px/375px viewports), and `campus2.png` is still squashed at ≤760px.
