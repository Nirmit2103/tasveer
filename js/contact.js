/* ============================================================
   TASVEER — CONTACT SHEET variant
   Renders plates, crew contact sheet, credits from js/data.js.
   Lightbox, frame flips, department index tabs, mobile index,
   restrained scroll reveals. No scroll hijacking.
   ============================================================ */
(function () {
  "use strict";

  var D = window.TASVEER_DATA;
  if (!D) return;

  document.documentElement.classList.add("js");

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* ---------- catalogue metadata (playful, per brief) ---------- */
  var PLATE_META = [
    "35mm · f/1.8 · Auditorium",
    "35mm · f/2.8 · Okhla",
    "Digital · f/4.0 · Golden hour",
    "Digital · f/5.6 · Off-campus",
    "35mm · f/1.8 · Old balcony"
  ];

  var PLATES = D.GALLERY.map(function (g, i) {
    var desc = g.cap.split("—")[1] || g.cap;
    return {
      src: g.src,
      cap: g.cap,
      meta: PLATE_META[i] || "35mm · f/1.8 · Okhla",
      alt: desc.trim().charAt(0).toUpperCase() + desc.trim().slice(1),
      landscape: /frame-04/.test(g.src)
    };
  });

  /* ---------- PLATES ---------- */
  var platesGrid = $("#plates-grid");
  PLATES.forEach(function (p, i) {
    var fig = document.createElement("figure");
    fig.className = "plate reveal" + (p.landscape ? " is-landscape" : "");
    fig.style.setProperty("--rd", (i % 2) * 90 + "ms");
    fig.innerHTML =
      '<button type="button" class="plate-btn" data-plate="' + i + '" aria-haspopup="dialog" ' +
        'aria-label="Open plate ' + pad(i + 1) + ' in the viewer — ' + esc(p.alt) + '">' +
        '<span class="frame"><img src="' + esc(p.src) + '" alt="' + esc(p.alt) + '" loading="lazy" decoding="async" width="1200" height="1500"></span>' +
      "</button>" +
      "<figcaption>" +
        '<span class="plate-no">Plate ' + pad(i + 1) + "</span>" +
        '<span class="plate-cap">' + esc(p.cap) + "</span>" +
        '<span class="plate-meta">' + esc(p.meta) + "</span>" +
      "</figcaption>";
    platesGrid.appendChild(fig);
  });

  /* Plate 06 — the empty frame */
  var empty = document.createElement("figure");
  empty.className = "plate plate-empty reveal";
  empty.innerHTML =
    '<a class="frame" href="mailto:' + esc(D.CONFIG.email) + '?subject=' + encodeURIComponent("Plate 06 — my shot") + '" ' +
      'aria-label="Plate 06, awaiting exposure — email us your shot">' +
      '<span class="plate-empty-inner">' +
        '<span class="plate-empty-title">Plate 06 — Awaiting Exposure</span>' +
        '<span class="plate-empty-sub">your shot here</span>' +
        '<span class="plate-empty-cta">Write to us →</span>' +
      "</span>" +
    "</a>" +
    '<figcaption><span class="plate-no">Plate 06</span><span class="plate-meta">Unexposed · reserved for you</span></figcaption>';
  platesGrid.appendChild(empty);

  /* ---------- CREW / CONTACT SHEET ---------- */
  var crewGrid = $("#crew-grid");
  var LENS_SVG =
    '<svg viewBox="0 0 40 40" fill="none" stroke-width="1.5" aria-hidden="true">' +
    '<circle cx="20" cy="20" r="15"/><circle cx="20" cy="20" r="6.5"/>' +
    '<path d="M20 2v6M20 32v6M2 20h6M32 20h6"/></svg>';

  D.TEAM.forEach(function (m, i) {
    var no = pad(i + 1) + "A";
    var li = document.createElement("li");
    li.className = "crew-item reveal";
    li.dataset.dept = m.dept;
    li.style.setProperty("--rd", (i % 4) * 70 + "ms");

    var frontMedia = m.img
      ? '<span class="crew-photo"><img src="assets/team/' + esc(m.img) + '" alt="Portrait of ' + esc(m.name) + ", " + esc(m.role) + '" loading="lazy" decoding="async" width="900" height="1125"></span>'
      : '<span class="crew-placeholder" role="img" aria-label="Photo pending for ' + esc(m.name) + '">' + LENS_SVG +
        '<span class="ph-label">Photo pending</span><span class="ph-sub">frame not yet exposed</span></span>';

    var backMedia, backCap;
    if (m.child) {
      backMedia = '<span class="crew-photo"><img src="assets/team/' + esc(m.child) + '" alt="Childhood photograph of ' + esc(m.name) + '" loading="lazy" decoding="async"></span>';
      backCap = '<span class="back-cap"><span>' + esc(m.backCap || "early print") + '</span><span class="frame-00">Frame 00</span></span>';
    } else if (m.back && m.back.type === "quote") {
      backMedia =
        '<span class="crew-quote"><span class="quote-mark" aria-hidden="true">“</span>' +
        "<blockquote>“" + esc(m.back.text) + "”</blockquote>" +
        '<span class="quote-tag">' + esc(m.back.tag || "") + "</span></span>";
      backCap = '<span class="back-cap"><span>No print on file</span><span class="frame-00">Quote card</span></span>';
    } else {
      backMedia = '<span class="crew-quote"><blockquote>No print on file.</blockquote></span>';
      backCap = '<span class="back-cap"><span>—</span><span class="frame-00">Frame 00</span></span>';
    }

    li.innerHTML =
      '<button type="button" class="crew-frame" aria-pressed="false" ' +
        'aria-label="Frame ' + no + " — " + esc(m.name) + ", " + esc(m.role) + '. Activate to flip the frame.">' +
        '<span class="crew-edge"><span class="edge-no">' + no + '</span><span>Tasveer 400</span></span>' +
        '<span class="crew-flip">' +
          '<span class="crew-face crew-front">' + frontMedia +
            '<span class="crew-id"><span class="crew-name">' + esc(m.name) + '</span><span class="crew-role">' + esc(m.role) + "</span></span>" +
          "</span>" +
          '<span class="crew-face crew-back" aria-hidden="true">' + backMedia + backCap + "</span>" +
        "</span>" +
      "</button>";
    crewGrid.appendChild(li);
  });

  /* flip behaviour */
  $$(".crew-frame").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var flipped = btn.classList.toggle("is-flipped");
      btn.setAttribute("aria-pressed", flipped ? "true" : "false");
      var back = $(".crew-back", btn);
      if (back) back.setAttribute("aria-hidden", flipped ? "false" : "true");
      var base = btn.getAttribute("aria-label").split(". Activate")[0];
      btn.setAttribute("aria-label", base + (flipped ? ". Activate to return to the portrait." : ". Activate to flip the frame."));
    });
  });

  /* ---------- DEPARTMENT INDEX TABS ---------- */
  var tabsWrap = $("#dept-tabs");
  var crewCount = $("#crew-count");
  D.DEPTS.forEach(function (d, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "dept-tab";
    b.dataset.dept = d[0];
    b.textContent = d[1];
    b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
    tabsWrap.appendChild(b);
  });

  function applyFilter(dept) {
    var shown = 0;
    $$(".crew-item").forEach(function (li) {
      var match = dept === "all" || li.dataset.dept === dept;
      li.hidden = !match;
      if (match) shown++;
    });
    var label = dept === "all" ? "the sheet" : dept.replace("-", " ");
    crewCount.textContent = shown + (shown === 1 ? " frame" : " frames") + " on " + label;
  }

  tabsWrap.addEventListener("click", function (e) {
    var btn = e.target.closest(".dept-tab");
    if (!btn) return;
    $$(".dept-tab", tabsWrap).forEach(function (b) {
      b.setAttribute("aria-pressed", b === btn ? "true" : "false");
    });
    applyFilter(btn.dataset.dept);
  });

  /* ---------- CREDITS ---------- */
  var creditsList = $("#credits-list");
  D.CREDITS.forEach(function (c, i) {
    var li = document.createElement("li");
    li.className = "credit-item reveal";
    li.style.setProperty("--rd", (i % 2) * 80 + "ms");
    li.innerHTML =
      '<span class="credit-no">' + pad(i + 1) + "</span>" +
      '<span class="credit-body"><span class="credit-dept">' + esc(c[0]) + "</span>" +
      '<span class="credit-desc">' + esc(c[1]) + "</span></span>";
    creditsList.appendChild(li);
  });

  /* ---------- JOIN / CONFIG ---------- */
  $("#meta-crew").textContent = String(D.TEAM.length);
  var joinMail = $("#join-mail");
  joinMail.href = "mailto:" + D.CONFIG.email + "?subject=" + encodeURIComponent("I want to join Tasveer");
  $("#join-email").textContent = D.CONFIG.email;
  if (D.CONFIG.instagram) {
    var ig = $("#join-ig");
    ig.href = D.CONFIG.instagram;
    ig.hidden = false;
    ig.target = "_blank";
    ig.rel = "noopener noreferrer";
  }

  /* ---------- shared: scroll lock + focus trap ---------- */
  var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
  function lockScroll(on) { document.body.style.overflow = on ? "hidden" : ""; }
  function trapTab(container, e) {
    if (e.key !== "Tab") return;
    var items = $$(FOCUSABLE, container).filter(function (el) { return el.offsetParent !== null; });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- LIGHTBOX ---------- */
  var lb = $("#lightbox"), lbImg = $("#lb-img"), lbCap = $("#lb-cap"),
      lbNo = $("#lb-no"), lbCount = $("#lb-count"),
      lbPrev = $("#lb-prev"), lbNext = $("#lb-next"), lbClose = $("#lb-close");
  var lbIndex = 0, lbOpener = null;

  function lbRender() {
    var p = PLATES[lbIndex];
    lbImg.src = p.src;
    lbImg.alt = p.alt;
    lbCap.textContent = p.cap + "  ·  " + p.meta;
    lbNo.textContent = "Plate " + pad(lbIndex + 1);
    lbCount.textContent = pad(lbIndex + 1) + " / " + pad(PLATES.length);
  }
  function lbOpen(i, opener) {
    lbIndex = i;
    lbOpener = opener || null;
    lbRender();
    lb.hidden = false;
    lockScroll(true);
    lbClose.focus();
  }
  function lbCloseFn() {
    lb.hidden = true;
    lockScroll(false);
    if (lbOpener) lbOpener.focus();
    lbOpener = null;
  }
  function lbStep(dir) {
    lbIndex = (lbIndex + dir + PLATES.length) % PLATES.length;
    lbRender();
  }

  platesGrid.addEventListener("click", function (e) {
    var btn = e.target.closest(".plate-btn");
    if (btn) lbOpen(Number(btn.dataset.plate), btn);
  });
  lbPrev.addEventListener("click", function () { lbStep(-1); });
  lbNext.addEventListener("click", function () { lbStep(1); });
  lbClose.addEventListener("click", lbCloseFn);
  $(".lightbox-backdrop").addEventListener("click", lbCloseFn);
  lb.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); lbCloseFn(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); lbStep(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); lbStep(1); }
    else trapTab($(".lightbox-card"), e);
  });

  /* ---------- MOBILE INDEX OVERLAY ---------- */
  var menuBtn = $("#menu-btn"), menu = $("#menu-overlay"), menuClose = $("#menu-close");
  function menuOpen() {
    menu.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
    lockScroll(true);
    menuClose.focus();
  }
  function menuCloseFn(restoreFocus) {
    menu.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
    lockScroll(false);
    if (restoreFocus !== false) menuBtn.focus();
  }
  menuBtn.addEventListener("click", menuOpen);
  menuClose.addEventListener("click", function () { menuCloseFn(); });
  $$(".menu-links a", menu).forEach(function (a) {
    a.addEventListener("click", function () { menuCloseFn(false); });
  });
  menu.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); menuCloseFn(); }
    else trapTab(menu, e);
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768 && !menu.hidden) menuCloseFn(false);
  });

  /* ---------- BACK TO TOP ---------- */
  $("#to-top").addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
    $(".brand").focus();
  });

  /* ---------- SCROLL REVEALS ---------- */
  var revealEls = $$(".reveal");
  function showAll() { revealEls.forEach(function (el) { el.classList.add("is-in"); }); }
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    reducedMotion.addEventListener("change", function (ev) { if (ev.matches) showAll(); });
  }
})();
