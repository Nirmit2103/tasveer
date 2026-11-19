/* ============================================================
   TASVEER — CAMCORDER Y2K
   All machinery: OSD, menu, playback, memory card, setup, pair.
   Content comes from js/data.js (window.TASVEER_DATA).
   ============================================================ */
(function () {
  'use strict';

  var D = window.TASVEER_DATA;
  if (!D) { return; }

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var pad = function (n, w) { return String(n).padStart(w || 2, '0'); };

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reducedMotion = function () { return motionQuery.matches; };
  var finePointer = window.matchMedia('(pointer: fine)');

  /* rAF scroll tween — works everywhere (native smooth scroll can stall
     in some headless/software-rendered environments). Falls back to an
     instant jump if frames never arrive, and under reduced motion. */
  function animateScroll(target, to, duration, vertical) {
    var scroller = vertical ? document.documentElement : target;
    var prev = scroller.__tw;
    if (prev) {
      cancelAnimationFrame(prev.raf);
      clearTimeout(prev.guard);
      scroller.__tw = null;
    }
    var from = vertical ? window.scrollY : target.scrollLeft;
    var max = vertical
      ? Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      : Math.max(0, target.scrollWidth - target.clientWidth);
    to = Math.max(0, Math.min(to, max));
    var apply = function (v) {
      if (vertical) { window.scrollTo(0, v); } else { target.scrollLeft = v; }
    };
    var savedSnap = null;
    if (!vertical) {
      savedSnap = target.style.scrollSnapType;
      target.style.scrollSnapType = 'none'; /* don't fight the tween */
    }
    var done = function () {
      if (savedSnap !== null) { target.style.scrollSnapType = savedSnap; }
      scroller.__tw = null;
      apply(to);
    };
    if (reducedMotion() || Math.abs(to - from) < 2) { done(); return; }
    var t0 = performance.now();
    var state = {};
    scroller.__tw = state;
    var step = function (now) {
      if (scroller.__tw !== state) { return; }
      var t = Math.min(1, (now - t0) / duration);
      var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      apply(from + (to - from) * e);
      if (t < 1) { state.raf = requestAnimationFrame(step); } else { done(); }
    };
    state.raf = requestAnimationFrame(step);
    state.guard = setTimeout(function () {
      if (scroller.__tw === state) { cancelAnimationFrame(state.raf); done(); }
    }, duration + 350);
  }
  function scrollToSection(id) {
    var el = document.getElementById(id);
    if (!el) { return; }
    var top = el.getBoundingClientRect().top + window.scrollY - 10;
    animateScroll(window, top, 650, true);
  }

  /* ----------------------------------------------------------
     OSD: timestamp, timecode, battery, zoom rocker, focus box
  ---------------------------------------------------------- */
  var timestampEl = $('#timestamp');
  var timecodeEl = $('#hero-timecode');
  var batteryFill = $('#battery-fill');
  var batteryPct = $('#battery-pct');
  var zoomBlocks = $$('#zoom-blocks span');
  var toast = $('#low-battery-toast');
  var focusBox = $('#focus-box');
  var startedAt = Date.now();
  var lowBatteryShown = false;
  var toastTimer = null;

  function tickClock() {
    var now = new Date();
    var h = now.getHours();
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12; if (h12 === 0) { h12 = 12; }
    timestampEl.textContent =
      now.getFullYear() + '.' + pad(now.getMonth() + 1) + '.' + pad(now.getDate()) + ' ' +
      pad(h12) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()) + ' ' + ampm;

    var elapsed = Math.floor((Date.now() - startedAt) / 1000);
    timecodeEl.textContent =
      Math.floor(elapsed / 3600) + ':' + pad(Math.floor(elapsed / 60) % 60) + ':' + pad(elapsed % 60);
  }
  tickClock();
  setInterval(tickClock, 1000);

  function scrollProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) { return 0; }
    return Math.min(1, Math.max(0, window.scrollY / max));
  }

  function updateBattery() {
    var p = scrollProgress();
    var pct = Math.round(100 - 85 * p); /* 100% -> ~15% at the bottom */
    batteryPct.textContent = pct + '%';
    batteryFill.style.width = pct + '%';
    batteryFill.classList.toggle('warn', pct < 50 && pct >= 20);
    batteryFill.classList.toggle('low', pct < 20);

    var filled = Math.round(p * zoomBlocks.length);
    zoomBlocks.forEach(function (b, i) { b.classList.toggle('on', i < filled); });

    if (pct < 20 && !lowBatteryShown) {
      lowBatteryShown = true;
      toast.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.hidden = true; }, 4500);
    }
  }

  var scrollTicking = false;
  function onScroll() {
    if (scrollTicking) { return; }
    scrollTicking = true;
    requestAnimationFrame(function () { updateBattery(); checkSweeps(); scrollTicking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateBattery();

  /* focus box follows the mouse — desktop (pointer:fine) only */
  if (finePointer.matches) {
    window.addEventListener('mousemove', function (e) {
      focusBox.style.transform = 'translate(' + (e.clientX - 46) + 'px,' + (e.clientY - 46) + 'px)';
    }, { passive: true });
    document.addEventListener('mouseleave', function () {
      focusBox.style.transform = 'translate(-500px,-500px)';
    });
  }

  /* ----------------------------------------------------------
     Dialog helpers: focus trap + body scroll lock
  ---------------------------------------------------------- */
  function focusables(root) {
    return $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', root)
      .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
  }
  function trapTab(root, e) {
    if (e.key !== 'Tab') { return; }
    var list = focusables(root);
    if (!list.length) { return; }
    var first = list[0], last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function lockScroll(on) { document.body.style.overflow = on ? 'hidden' : ''; }

  /* ----------------------------------------------------------
     CAMCORDER MENU
  ---------------------------------------------------------- */
  var menu = $('#cam-menu');
  var menuBtn = $('#menu-btn');
  var menuItems = $$('.cam-menu-item', menu);
  var menuSelected = 0;
  var menuOpener = null;

  function paintMenuSelection() {
    menuItems.forEach(function (it, i) { it.classList.toggle('selected', i === menuSelected); });
  }
  function openMenu() {
    menuOpener = document.activeElement;
    menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    lockScroll(true);
    menuSelected = 0;
    paintMenuSelection();
    menuItems[0].focus();
  }
  function closeMenu(restoreFocus) {
    menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    lockScroll(false);
    if (restoreFocus !== false) { (menuOpener || menuBtn).focus(); }
  }
  function activateMenu(item) {
    closeMenu(false);
    menuBtn.focus();
    scrollToSection(item.dataset.target);
  }

  menuBtn.addEventListener('click', function () {
    if (menu.hidden) { openMenu(); } else { closeMenu(); }
  });
  menuItems.forEach(function (item, i) {
    item.addEventListener('click', function () { activateMenu(item); });
    item.addEventListener('focus', function () { menuSelected = i; paintMenuSelection(); });
    item.addEventListener('mouseenter', function () { menuSelected = i; paintMenuSelection(); });
  });
  menu.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      var dir = e.key === 'ArrowDown' ? 1 : -1;
      menuSelected = (menuSelected + dir + menuItems.length) % menuItems.length;
      paintMenuSelection();
      menuItems[menuSelected].focus();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      var idx = menuItems.indexOf(document.activeElement);
      activateMenu(menuItems[idx >= 0 ? idx : menuSelected]);
      return;
    }
    trapTab(menu, e);
  });

  /* ----------------------------------------------------------
     PLAYBACK: render frames, transport, scrubber, tracking
  ---------------------------------------------------------- */
  var strip = $('#strip');
  var scrubber = $('#scrubber');
  var btnRew = $('#btn-rew');
  var btnPlay = $('#btn-play');
  var btnFf = $('#btn-ff');
  var frames = [];
  var autoPlayTimer = null;

  function frameTimecode(i) {
    return '00:00:' + pad(12 + i * 7) + ':' + pad(4 + i * 5);
  }

  D.GALLERY.forEach(function (g, i) {
    var fig = document.createElement('button');
    fig.type = 'button';
    fig.className = 'frame tracking';
    fig.dataset.index = String(i);
    fig.setAttribute('aria-label', 'Pause on frame ' + (i + 1) + ': ' + g.cap);

    var wrap = document.createElement('span');
    wrap.className = 'frame-imgwrap';
    var img = document.createElement('img');
    img.src = g.src;
    img.alt = g.cap;
    img.loading = i === 0 ? 'eager' : 'lazy';
    img.decoding = 'async';
    wrap.appendChild(img);

    var tc = document.createElement('span');
    tc.className = 'frame-tc';
    tc.setAttribute('aria-hidden', 'true');
    tc.textContent = frameTimecode(i);
    wrap.appendChild(tc);

    var rec = document.createElement('span');
    rec.className = 'frame-rec';
    rec.setAttribute('aria-hidden', 'true');
    rec.textContent = '●';
    wrap.appendChild(rec);

    var tag = document.createElement('span');
    tag.className = 'track-tag';
    tag.setAttribute('aria-hidden', 'true');
    tag.textContent = 'TRACKING ADJUSTED';
    wrap.appendChild(tag);

    var cap = document.createElement('span');
    cap.className = 'frame-cap';
    cap.textContent = g.cap;

    fig.appendChild(wrap);
    fig.appendChild(cap);
    fig.addEventListener('click', function () { openLightbox(i, fig); });
    strip.appendChild(fig);
    frames.push(fig);
  });

  /* tracking cleans up when a frame enters view; glitch animations
     only run while the playback section is near the viewport.
     Rect-based check on scroll is the primary mechanism (robust even
     when IntersectionObserver delivery is delayed); IO is a backup. */
  var playbackSection = document.getElementById('playback');

  function adjustVisibleFrames() {
    var stripRect = strip.getBoundingClientRect();
    if (stripRect.top < window.innerHeight + 300 && stripRect.bottom > -300) {
      playbackSection.classList.add('tracking-live');
    }
    if (stripRect.bottom < 0 || stripRect.top > window.innerHeight) { return; }
    frames.forEach(function (f) {
      if (!f.classList.contains('tracking')) { return; }
      var r = f.getBoundingClientRect();
      var overlap = Math.min(r.right, stripRect.right) - Math.max(r.left, stripRect.left);
      if (overlap >= r.width * 0.35) {
        f.classList.remove('tracking');
        f.classList.add('adjusted');
      }
    });
  }
  strip.addEventListener('scroll', adjustVisibleFrames, { passive: true });
  window.addEventListener('scroll', adjustVisibleFrames, { passive: true });
  window.addEventListener('resize', adjustVisibleFrames);
  window.addEventListener('load', adjustVisibleFrames);
  adjustVisibleFrames();

  if ('IntersectionObserver' in window) {
    var liveIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          playbackSection.classList.add('tracking-live');
          liveIO.unobserve(en.target);
        }
      });
    }, { rootMargin: '300px 0px', threshold: 0 });
    liveIO.observe(playbackSection);

    var trackIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.remove('tracking');
          en.target.classList.add('adjusted');
          trackIO.unobserve(en.target);
        }
      });
    }, { threshold: 0.35 });
    frames.forEach(function (f) { trackIO.observe(f); });
  } else {
    playbackSection.classList.add('tracking-live');
    frames.forEach(function (f) { f.classList.remove('tracking'); f.classList.add('adjusted'); });
  }

  function stripMax() { return Math.max(0, strip.scrollWidth - strip.clientWidth); }
  function frameStep() {
    return frames.length ? frames[0].offsetWidth + 18 : 300;
  }
  function syncScrubber() {
    var max = stripMax();
    scrubber.value = max > 0 ? String(Math.round((strip.scrollLeft / max) * 1000)) : '0';
  }
  strip.addEventListener('scroll', syncScrubber, { passive: true });
  scrubber.addEventListener('input', function () {
    strip.scrollLeft = (Number(scrubber.value) / 1000) * stripMax();
  });

  btnRew.addEventListener('click', function () {
    stopAutoPlay();
    animateScroll(strip, strip.scrollLeft - frameStep(), 500, false);
  });
  btnFf.addEventListener('click', function () {
    stopAutoPlay();
    animateScroll(strip, strip.scrollLeft + frameStep(), 500, false);
  });

  function startAutoPlay() {
    if (reducedMotion() || autoPlayTimer) { return; }
    btnPlay.setAttribute('aria-pressed', 'true');
    btnPlay.textContent = '▮▮ PAUSE';
    autoPlayTimer = setInterval(function () {
      var next = strip.scrollLeft >= stripMax() - 8 ? 0 : strip.scrollLeft + frameStep();
      animateScroll(strip, next, 800, false);
    }, 2600);
  }
  function stopAutoPlay() {
    if (autoPlayTimer) { clearInterval(autoPlayTimer); autoPlayTimer = null; }
    btnPlay.setAttribute('aria-pressed', 'false');
    btnPlay.textContent = '▶ PLAY';
  }
  btnPlay.addEventListener('click', function () {
    if (autoPlayTimer) { stopAutoPlay(); } else { startAutoPlay(); }
  });
  if (reducedMotion()) {
    btnPlay.disabled = true;
    btnPlay.title = 'Auto-play is off while reduced motion is enabled';
  }
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', function () {
      if (reducedMotion()) { stopAutoPlay(); btnPlay.disabled = true; }
      else { btnPlay.disabled = false; }
    });
  }

  /* ----------------------------------------------------------
     LIGHTBOX / PAUSE SCREEN
  ---------------------------------------------------------- */
  var lightbox = $('#lightbox');
  var lbImg = $('#lb-img');
  var lbCap = $('#lb-cap');
  var lbCount = $('#lb-count');
  var lbPrev = $('#lb-prev');
  var lbNext = $('#lb-next');
  var lbClose = $('#lb-close');
  var lbIndex = 0;
  var lbOpener = null;

  function paintLightbox() {
    var g = D.GALLERY[lbIndex];
    lbImg.src = g.src;
    lbImg.alt = g.cap;
    lbCap.textContent = g.cap;
    lbCount.textContent = 'FR ' + pad(lbIndex + 1) + ' / ' + pad(D.GALLERY.length);
  }
  function openLightbox(i, opener) {
    lbIndex = i;
    lbOpener = opener || null;
    paintLightbox();
    lightbox.hidden = false;
    lockScroll(true);
    lbClose.focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    lockScroll(false);
    if (lbOpener) { lbOpener.focus(); }
  }
  function lbStep(dir) {
    lbIndex = (lbIndex + dir + D.GALLERY.length) % D.GALLERY.length;
    paintLightbox();
  }
  lbPrev.addEventListener('click', function () { lbStep(-1); });
  lbNext.addEventListener('click', function () { lbStep(1); });
  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) { closeLightbox(); } });
  lightbox.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); lbStep(-1); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); lbStep(1); return; }
    trapTab(lightbox, e);
  });

  /* ----------------------------------------------------------
     MEMORY CARD: crew files + department folder tabs
  ---------------------------------------------------------- */
  var crewGrid = $('#crew-grid');
  var deptTabs = $('#dept-tabs');
  var dcimCount = $('#dcim-count');
  var crewCards = [];

  function fileName(i) { return 'TAS_' + pad(i + 1, 4) + '.JPG'; }
  function fileSize(i) { return (1.4 + ((i * 37) % 23) / 10).toFixed(1) + ' MB'; }
  function fileDate(i) { return '2026.03.' + pad(10 + i); }

  function makeMeta(fname, info) {
    var meta = document.createElement('span');
    meta.className = 'face-meta';
    var fn = document.createElement('span');
    fn.className = 'fname';
    fn.textContent = fname;
    var fi = document.createElement('span');
    fi.className = 'finfo';
    fi.textContent = info;
    meta.appendChild(fn);
    meta.appendChild(fi);
    return meta;
  }

  D.TEAM.forEach(function (m, i) {
    var fname = fileName(i);
    var card = document.createElement('button');
    card.type = 'button';
    card.className = 'file-card';
    card.dataset.dept = m.dept;
    card.setAttribute('aria-expanded', 'false');
    card.setAttribute('aria-label',
      m.name + ', ' + m.role + '. File ' + fname + '. Activate to open the older file.');

    var inner = document.createElement('span');
    inner.className = 'card-inner';

    /* ---- front: the current file ---- */
    var front = document.createElement('span');
    front.className = 'face face-front';

    var tip = document.createElement('span');
    tip.className = 'tip';
    tip.setAttribute('aria-hidden', 'true');
    var tipName = document.createElement('b');
    tipName.textContent = m.name;
    tip.appendChild(tipName);
    tip.appendChild(document.createTextNode(m.role));
    front.appendChild(tip);

    var fImg = document.createElement('span');
    fImg.className = 'face-img';
    if (m.img) {
      var img = document.createElement('img');
      img.src = 'assets/team/' + m.img;
      img.alt = m.name + ' — ' + m.role;
      img.loading = 'lazy';
      img.decoding = 'async';
      fImg.appendChild(img);
    } else {
      var pend = document.createElement('span');
      pend.className = 'pending';
      var pendBig = document.createElement('span');
      pendBig.className = 'pending-big';
      pendBig.textContent = 'NO SIGNAL';
      var pendSmall = document.createElement('span');
      pendSmall.textContent = 'PHOTO PENDING';
      pend.appendChild(pendBig);
      pend.appendChild(pendSmall);
      fImg.appendChild(pend);
    }
    front.appendChild(fImg);
    front.appendChild(makeMeta(fname, fileSize(i) + ' · ' + fileDate(i)));

    /* ---- back: childhood / quote / corrupted ---- */
    var back = document.createElement('span');
    back.className = 'face face-back';
    back.setAttribute('aria-hidden', 'true');

    var base = fname.replace('.JPG', '');
    if (m.img && m.child) {
      var bImgWrap = document.createElement('span');
      bImgWrap.className = 'face-img';
      var bImg = document.createElement('img');
      bImg.src = 'assets/team/' + m.child;
      bImg.alt = m.name + ' as a child';
      bImg.loading = 'lazy';
      bImg.decoding = 'async';
      bImgWrap.appendChild(bImg);
      back.appendChild(bImgWrap);
      var bCap = document.createElement('span');
      bCap.className = 'back-cap';
      bCap.textContent = m.backCap || 'the early footage';
      back.appendChild(bCap);
      back.appendChild(makeMeta(base + '_OLD.JPG', 'ARCHIVE · ' + fileDate(i)));
    } else if (!m.img) {
      var corrupt = document.createElement('span');
      corrupt.className = 'corrupt-file';
      var cHead = document.createElement('span');
      cHead.className = 'c-head';
      cHead.textContent = 'FILE CORRUPTED';
      var cSub = document.createElement('span');
      cSub.className = 'c-sub';
      cSub.textContent = 'PHOTO PENDING';
      corrupt.appendChild(cHead);
      corrupt.appendChild(cSub);
      if (m.back && m.back.text) {
        var cQuote = document.createElement('span');
        cQuote.className = 'c-quote';
        cQuote.textContent = '“' + m.back.text + '”';
        corrupt.appendChild(cQuote);
      }
      back.appendChild(corrupt);
      back.appendChild(makeMeta(fname, 'RECOVERING…'));
    } else if (m.back && m.back.type === 'quote') {
      var qf = document.createElement('span');
      qf.className = 'quote-file';
      var qHead = document.createElement('span');
      qHead.className = 'q-head';
      qHead.textContent = 'C:\\TASVEER\\' + base + '.TXT';
      var qText = document.createElement('span');
      qText.className = 'q-text';
      qText.textContent = '“' + m.back.text + '”';
      var qTag = document.createElement('span');
      qTag.className = 'q-tag';
      qTag.textContent = '— ' + (m.back.tag || 'unsigned');
      qf.appendChild(qHead);
      qf.appendChild(qText);
      qf.appendChild(qTag);
      back.appendChild(qf);
      back.appendChild(makeMeta(base + '.TXT', fileSize(i) + ' · TEXT FILE'));
    }

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    card.addEventListener('click', function () {
      var flipped = card.classList.toggle('flipped');
      card.setAttribute('aria-expanded', flipped ? 'true' : 'false');
      front.setAttribute('aria-hidden', flipped ? 'true' : 'false');
      back.setAttribute('aria-hidden', flipped ? 'false' : 'true');
    });

    crewGrid.appendChild(card);
    crewCards.push(card);
  });

  /* folder tabs from DEPTS */
  function applyFilter(dept) {
    var visible = 0;
    crewCards.forEach(function (card) {
      var show = dept === 'all' || card.dataset.dept === dept;
      card.hidden = !show;
      if (show) { visible++; }
    });
    dcimCount.textContent = visible + ' FILE(S)';
  }
  D.DEPTS.forEach(function (d, i) {
    var tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'dept-tab';
    tab.textContent = d[1];
    tab.dataset.dept = d[0];
    tab.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    tab.addEventListener('click', function () {
      $$('.dept-tab', deptTabs).forEach(function (t) {
        t.setAttribute('aria-pressed', t === tab ? 'true' : 'false');
      });
      applyFilter(d[0]);
    });
    deptTabs.appendChild(tab);
  });
  applyFilter('all');

  /* ----------------------------------------------------------
     SETUP: credits as a blue-screen config list
  ---------------------------------------------------------- */
  var CREDIT_VALUES = {
    'COVERAGE': 'ALWAYS ON',
    'VIDEOGRAPHY': '4K/24FPS',
    'CREATIVE': 'IDEAS: UNFILTERED',
    'POST-PRODUCTION': 'FOOTAGE → STORY',
    'EVENTS': 'MOMENTS: LIVE',
    'PR': 'SIGNAL: STRONG',
    'TREASURY': 'FUNDS: OK',
    'WEBDEV': 'THIS SITE v1.0'
  };
  var creditsList = $('#credits-list');
  var creditItems = [];
  D.CREDITS.forEach(function (c, i) {
    var li = document.createElement('li');
    li.className = 'credit-item' + (i === 0 ? ' selected' : '');
    li.tabIndex = 0;
    var name = document.createElement('span');
    name.className = 'cname';
    name.textContent = c[0];
    var leader = document.createElement('span');
    leader.className = 'leader';
    leader.setAttribute('aria-hidden', 'true');
    leader.textContent = '.'.repeat(80);
    var val = document.createElement('span');
    val.className = 'cval';
    val.textContent = CREDIT_VALUES[c[0]] || 'ON';
    li.appendChild(name);
    li.appendChild(leader);
    li.appendChild(val);
    li.setAttribute('aria-label', c[0] + ': ' + val.textContent + '. ' + c[1]);
    function highlight() {
      creditItems.forEach(function (it) { it.classList.toggle('selected', it === li); });
    }
    li.addEventListener('mouseenter', highlight);
    li.addEventListener('focus', highlight);
    creditsList.appendChild(li);
    creditItems.push(li);
  });

  /* ----------------------------------------------------------
     CONNECT: pairing card
  ---------------------------------------------------------- */
  var email = (D.CONFIG && D.CONFIG.email) || 'tasveer@sc.iiitd.ac.in';
  $('#pair-email').textContent = email;
  $('#connect-btn').href = 'mailto:' + email + '?subject=' + encodeURIComponent('I want to join Tasveer');
  if (D.CONFIG && D.CONFIG.instagram) {
    var insta = $('#insta-btn');
    insta.href = D.CONFIG.instagram;
    insta.target = '_blank';
    insta.rel = 'noopener noreferrer';
    insta.hidden = false;
  }

  /* ----------------------------------------------------------
     Navigation buttons + section sweep transitions
  ---------------------------------------------------------- */
  $('#hero-play').addEventListener('click', function () {
    scrollToSection('playback');
  });
  $('#rewind-btn').addEventListener('click', function () {
    animateScroll(window, 0, 700, true);
  });

  var sweepTargets = $$('.section').concat([$('.hero')]);
  function checkSweeps() {
    sweepTargets.forEach(function (s) {
      if (s && !s.classList.contains('swept')) {
        var r = s.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.88 && r.bottom > 0) { s.classList.add('swept'); }
      }
    });
  }
  window.addEventListener('load', checkSweeps);
  checkSweeps();
  if ('IntersectionObserver' in window) {
    var sweepIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('swept'); /* once per section */
          sweepIO.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    sweepTargets.forEach(function (s) { if (s) { sweepIO.observe(s); } });
  }

  /* initial scrubber position once layout settles */
  window.addEventListener('load', syncScrubber);
  syncScrubber();
})();
