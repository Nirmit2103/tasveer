/* ============================================================
   TASVEER × DRIVE — interaction engine
   Inspired by drivecapital.com's editorial system; original code.
   Lessons applied: touch-gated Lenis, goTo (no scrollTo shadow),
   visible-by-default reveals, refresh wrapped in lenis stop/start,
   esc() everywhere, document-level menu Esc, no async while-removal.
   ============================================================ */
"use strict";
const D = window.TASVEER_DATA;
const { CONFIG, TEAM, DEPTS, GALLERY, CREDITS } = D;
const $ = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rand = (a,b) => a + Math.random()*(b-a);

function toast(msg, ms=2800){
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(()=>t.classList.remove("show"), ms);
}

/* ---------- drive-specific content ---------- */
const BEATS = [
  {code:"AUD", name:"AUDITORIUM",     phrase:"every stage, covered"},
  {code:"LWN", name:"LAWNS",          phrase:"the night, in frames"},
  {code:"LIB", name:"LIBRARY",        phrase:"quiet, documented"},
  {code:"CNT", name:"CANTEEN",        phrase:"overheard, archived"},
  {code:"SPC", name:"SPORTS COMPLEX", phrase:"finish lines, frozen"},
  {code:"AMP", name:"AMPHITHEATRE",   phrase:"open mic, open shutter"},
];
const A = "assets/drive/";
const ROLL = [
  {name:"ANNUAL FEST '26", code:"FST", count:24, note:"Three days, four stages, one sleep-deprived crew.",
   frames:[[A+"photo017.webp","headliner night, green light"],[A+"photo007.webp","split light, front rail"],[A+"photo045.webp","the full house, purple wash"],[A+"photo026.webp","battle of bands, red light"]]},
  {name:"MAADHYAM", code:"MDY", count:18, note:"The cultural fest — fire, flips, and the verse that silenced the lawn.",
   frames:[[A+"photo077.webp","the diya, held breath"],[A+"photo075.webp","mid-flip, red backdrop"],[A+"photo079.webp","the duet, purple hour"],[A+"photo019.webp","the verse nobody forgot"]]},
  {name:"CONVOCATION", code:"CNV", count:32, note:"Caps in the air, parents in the frame. We shoot the day everyone forgets to document.",
   frames:[[A+"campus-bldg.webp","the quad, morning of"],[A+"photo083.webp","the address, spotlight"],[A+"students.webp","waiting for names"],[A+"photo081.webp","the send-off, confetti"]]},
  {name:"ESYA TECH FEST", code:"ESY", count:12, note:"The tech fest — talks, builds, and the demo that almost didn't boot.",
   frames:[[A+"photo053.webp","the talk, day one"],[A+"laptops.webp","hour 22, still building"],[A+"students.webp","the whiteboard argument"],[A+"library2.webp","quiet floor, loud minds"]]},
  {name:"SPORTS MEET", code:"SPT", count:26, note:"Finish lines, frozen. The sports complex is our fastest shutter speed.",
   frames:[[A+"photo005.webp","the backflip, peak action"],[A+"photo062.webp","the pool final, dead focus"],[A+"crowd-hands.webp","the stands, last over"],[A+"event-crowd.webp","medal ceremony"]]},
  {name:"CAMPUS QUIET", code:"QUT", count:15, note:"Between events, the campus is still a story. These are the frames nobody asks for.",
   frames:[[A+"library.webp","the reading room"],[A+"camera-girl.webp","a shooter, shooting shooters"],[A+"vintage-cam.webp","the society's first camera"],[A+"film-camera.webp","glass and dials"]]},
];
const HERO_POSTER = A+"poster4.jpg";

/* ---------- smooth scroll: desktop wheel only ---------- */
let lenis = null;
const touchDevice = matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
if (hasGsap && !reduced && !touchDevice && typeof Lenis !== "undefined"){
  lenis = new Lenis({ lerp:.09 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
}
function goTo(target){
  if (lenis) lenis.scrollTo(target, {duration:1.3});
  else $(target)?.scrollIntoView({behavior: reduced ? "auto" : "smooth"});
}
function safeRefresh(){
  if (!hasGsap) return;
  if (lenis) lenis.stop();
  ScrollTrigger.refresh();
  if (lenis) lenis.start();
}

/* ---------- header hide/show ---------- */
const nav = $("#nav");
let lastY = 0;
function onScroll(){
  const y = window.scrollY;
  nav.classList.toggle("hidden-nav", y > lastY && y > innerHeight*.6 && !menu.classList.contains("open"));
  lastY = y;
  const max = document.documentElement.scrollHeight - innerHeight;
  $("#progressFill").style.transform = `scaleY(${max>0 ? y/max : 0})`;
}
addEventListener("scroll", onScroll, {passive:true});

/* ---------- menu ---------- */
const menu = $("#menu"), burger = $("#burger");
function setMenu(open){
  burger.setAttribute("aria-expanded", String(open));
  menu.classList.toggle("open", open);
  menu.setAttribute("aria-hidden", String(!open));
  document.body.style.overflow = open ? "hidden" : "";
  if (lenis) open ? lenis.stop() : lenis.start();
  if (open){
    const tryFocus=(n)=>{
      const a=$(".menu-links a", menu);
      if (a){ a.focus(); if (document.activeElement===a) return; }
      if (n<20) setTimeout(()=>tryFocus(n+1), 30);
    };
    setTimeout(()=>tryFocus(0), 30);
  }
}
burger.addEventListener("click", ()=>setMenu(!menu.classList.contains("open")));
$("#menuClose").addEventListener("click", ()=>{ setMenu(false); burger.focus(); });
document.addEventListener("keydown", e=>{
  if (e.key === "Escape" && menu.classList.contains("open")){ setMenu(false); burger.focus(); }
});
menu.addEventListener("keydown", e=>{
  if (e.key !== "Tab") return;
  const f = $$("a,button", menu).filter(el=>el.offsetParent !== null);
  const i = f.indexOf(document.activeElement);
  e.preventDefault();
  f[(e.shiftKey ? (i<=0 ? f.length-1 : i-1) : (i+1) % f.length)].focus();
});
$$(".menu-links a").forEach(a=>a.addEventListener("click", e=>{
  e.preventDefault();
  const href=a.getAttribute("href");
  setMenu(false);
  goTo(href);
  const target=$(href);
  if (target){ target.setAttribute("tabindex","-1"); target.focus({preventScroll:true}); }
}));

/* ---------- marquees: duration proportional to content ---------- */
function buildMarquee(el, itemsHTML, {invert=false, secPerItem=6, pauseHover=false}={}){
  const track = document.createElement("div");
  track.className = "marquee-track" + (invert ? " inverted" : "") + (pauseHover ? " pause-hover" : "");
  track.innerHTML = itemsHTML + itemsHTML; /* two copies → seamless -50% loop */
  track.style.setProperty("--dur", `${Math.max(20, secPerItem * itemsHTML.split("data-item").length - 1)}s`);
  el.appendChild(track);
  return track;
}
const heroItems = BEATS.map(b=>`<span class="item mono" data-item><span class="code">${esc(b.code)}</span><span>${esc(b.phrase)}</span><span class="sep">—</span></span>`).join("");
buildMarquee($("#heroMarquee"), heroItems, {secPerItem:6});
const beatItems = BEATS.map(b=>`<span class="item" data-item><span class="name">${esc(b.name)}</span><span class="code">${esc(b.code)}</span></span>`).join("");
buildMarquee($("#beatMarquee"), beatItems, {invert:true, secPerItem:9});

/* photo band: real society frames + the crew's best fest frames */
const bandImgs = [
  ...GALLERY.map(g=>[g.src, g.cap.replace(/^ROLL \d+ · FR \d+ — /,"")]),
  [A+"photo017.webp","green light"],[A+"photo026.webp","red light"],[A+"photo019.webp","the verse"],
  [A+"photo028.webp","duet"],[A+"photo020.webp","crowning"],[A+"photo007.webp","split light"],
  [A+"photo012.webp","amber"],[A+"photo014.webp","teal smile"],[A+"photo015.webp","bokeh"],
  [A+"photo005.webp","peak action"],[A+"photo034.webp","suited up"],[A+"photo038.webp","the crew, formal"],
  [A+"photo041.webp","the couple"],[A+"photo044.webp","pink saree"],[A+"photo045.webp","purple wash"],
  [A+"photo051.webp","string lights"],[A+"photo052.webp","kurtas"],[A+"photo057.webp","hands up"],
  [A+"photo053.webp","the talk, esya"],[A+"photo062.webp","dead focus"],
  [A+"photo074.webp","monochrome"],[A+"photo075.webp","mid-flip"],[A+"photo077.webp","the diya"],
  [A+"photo078.webp","the march"],[A+"photo079.webp","purple hour"],
  [A+"photo081.webp","confetti"],[A+"photo088.webp","red rim"],[A+"photo089.webp","chiaroscuro"],
  [A+"photo086.webp","yellow"],[A+"photo083.webp","spotlight"],
];
const tileCls = ["t-a","t-b","t-c"];
const bandHTML = bandImgs.map((im,i)=>`<figure class="photo-tile ${tileCls[i%3]}" data-item><img src="${esc(im[0])}" alt="" loading="lazy"><figcaption class="mono">${esc(im[1])}</figcaption></figure>`).join("");
buildMarquee($("#photoBand"), bandHTML, {invert:true, secPerItem:4, pauseHover:true});

/* ---------- hero: cinema video + parallax wordmark + stills ---------- */
const heroVideo = $("#heroVideo");
const heroWordWrap = $("#heroWordWrap");
const STILLS = [
  ["assets/drive/still1.jpg","the lawns, fest night — from above"],
  ["assets/drive/still2.jpg","the verse, amber light"],
  ["assets/drive/still3.jpg","a canopy of lights, okhla"],
];
$("#heroStills").innerHTML = STILLS.map(s=>`<figure data-cursor="VIEW"><div class="imgwrap"><img src="${esc(s[0])}" alt="${esc(s[1])}" loading="lazy"></div><figcaption class="mono">${esc(s[1])}</figcaption></figure>`).join("");
/* hero: living footage + scroll choreography (hybrid).
   Shot A (canopy aerial) plays and crossfades to Shot B (stage/crowd)
   mid-hero; the camera zooms out 1.18→1.0 while the wordmark counter-
   zooms from fully-fitted at rest to monumental bleed — so TASVEER is
   always readable as a whole on load, then pushes past the edges. */
const heroVideoB = $("#heroVideoB");
const heroWord = $(".hero-word");
let heroP = 0, wordFit = 1;
function measureWord(){
  if (heroWord) wordFit = Math.min(1, (innerWidth * 0.9) / heroWord.offsetWidth);
}
function heroChoreo(p){
  const s = (1.18 - 0.18 * p).toFixed(4);
  const t = `translateY(${(-3 * p).toFixed(2)}vh) scale(${s})`;
  if (heroVideo) heroVideo.style.transform = t;
  if (heroVideoB){
    heroVideoB.style.transform = t;
    const f = Math.min(1, Math.max(0, (p - 0.38) / 0.30));
    heroVideoB.style.opacity = (f * f * (3 - 2 * f)).toFixed(3);
  }
  if (heroWordWrap){
    const ws = wordFit + (1.06 - wordFit) * p;
    const y = window.scrollY * 0.12 - (1 - p) * 0.09 * innerHeight;
    heroWordWrap.style.transform = `translateY(${y.toFixed(1)}px) scale(${ws.toFixed(4)})`;
  }
}
function heroVideoState(){
  const play = motionOn && !reduced;
  if (heroVideo) play ? heroVideo.play().catch(()=>{}) : heroVideo.pause();
  if (heroVideoB) (play && !touchDevice) ? heroVideoB.play().catch(()=>{}) : heroVideoB.pause();
  if (!play){
    if (heroVideo) heroVideo.style.transform = "scale(1)";
    if (heroVideoB){ heroVideoB.style.transform = "scale(1)"; heroVideoB.style.opacity = 0; }
    if (heroWordWrap) heroWordWrap.style.transform = `translateY(${(-0.09 * innerHeight).toFixed(1)}px) scale(${wordFit.toFixed(4)})`;
  } else heroChoreo(heroP);
  syncInterlude();
}
measureWord();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(()=>{ measureWord(); heroChoreo(heroP); });
addEventListener("resize", ()=>{ measureWord(); heroChoreo(heroP); }, {passive:true});
/* interlude: living footage, plays on screen, scroll zoom-out */
const interludeVideo = $("#interludeVideo");
let interludeVisible = false, interludeP = 0;
function syncInterlude(){
  if (!interludeVideo) return;
  if (reduced || !motionOn || !interludeVisible) interludeVideo.pause();
  else interludeVideo.play().catch(()=>{});
}
if (interludeVideo && "IntersectionObserver" in window){
  new IntersectionObserver(es=>{
    interludeVisible = es[0].isIntersecting;
    syncInterlude();
  }, {threshold:.15}).observe($(".interlude"));
}
if (hasGsap && !reduced){
  ScrollTrigger.create({
    trigger:".hero", start:"top top", end:"bottom bottom", scrub:true,
    onUpdate:self=>{ heroP = self.progress; heroChoreo(self.progress); }
  });
  ScrollTrigger.create({
    trigger:".interlude", start:"top top", end:"bottom bottom", scrub:true,
    onUpdate:self=>{
      interludeP = self.progress;
      if (motionOn && interludeVideo) interludeVideo.style.transform = `scale(${(1.15 - 0.15 * self.progress).toFixed(4)})`;
    }
  });
  $$(".hero-stills figure").forEach((f,i)=>{
    gsap.fromTo(f, {y:70+i*36}, {y:-36-i*18, ease:"none",
      scrollTrigger:{trigger:".hero-stills", start:"top bottom", end:"bottom top", scrub:true}});
  });
}

/* ---------- reveals: visible by default, animate on enter ---------- */
function revealOnEnter(trigger, targets, fromVars, toVars){
  if (!hasGsap || reduced) return;
  const els = typeof targets === "string" ? $$(targets) : targets;
  if (!els.length) return;
  ScrollTrigger.create({
    trigger, start:"top 82%", once:true,
    onEnter: ()=>gsap.fromTo(els, fromVars, {...toVars, overwrite:"auto"}),
    onRefresh: self=>{ if (self.progress > 0) gsap.set(els, {clearProps:"transform,opacity"}); }
  });
}
$$(".hero-title .mask > span").forEach((sp,i)=>{
  if (!hasGsap || reduced) return;
  gsap.fromTo(sp, {yPercent:105}, {yPercent:0, duration:1.1, delay:.15+i*.12, ease:"power4.out"});
});
revealOnEnter(".story", ".story-left > *, .story-right > *", {opacity:0, y:50}, {opacity:1, y:0, duration:.9, stagger:.1, ease:"power3.out"});
revealOnEnter(".collage", ".collage figure", {opacity:0, y:70}, {opacity:1, y:0, duration:1.1, stagger:.18, ease:"power3.out"});
revealOnEnter(".roll-head", ".roll-head > *", {opacity:0, y:40}, {opacity:1, y:0, duration:.8, stagger:.1, ease:"power3.out"});
revealOnEnter(".crew-head", ".crew-head > *", {opacity:0, y:40}, {opacity:1, y:0, duration:.8, stagger:.12, ease:"power3.out"});
revealOnEnter(".open-call", ".open-call > *:not(.iso)", {opacity:0, y:50}, {opacity:1, y:0, duration:.9, stagger:.1, ease:"power3.out"});
revealOnEnter(".footer-panel", ".footer-statement, .footer-grid, .footer-whisper", {opacity:0, y:50}, {opacity:1, y:0, duration:.9, stagger:.12, ease:"power3.out"});
$$(".stretch").forEach(el=>{
  if (!hasGsap || reduced) return;
  gsap.fromTo(el, {scaleX:0}, {scaleX:1, duration:1.2, ease:"power3.inOut",
    scrollTrigger:{trigger:el, start:"top 88%", once:true}});
});

/* ---------- the roll: accordion ---------- */
const rollList = $("#rollList");
ROLL.forEach((beat,i)=>{
  const sec = document.createElement("div");
  sec.className = "beat";
  const panelId = `beat-panel-${i}`;
  sec.innerHTML = `
    <button class="beat-row" aria-expanded="false" aria-controls="${panelId}" data-cursor="OPEN">
      <span class="beat-name">${esc(beat.name)}</span>
      <span class="beat-code">${esc(beat.code)}</span>
      <span class="beat-count">${beat.count} FRAMES</span>
      <span class="beat-plus" aria-hidden="true">+</span>
    </button>
    <div class="beat-panel" id="${panelId}" role="region" aria-label="${esc(beat.name)} frames" aria-hidden="true">
      <div class="beat-panel-inner">
        <p class="beat-note">${esc(beat.note)}</p>
        <div class="beat-frames">
          ${beat.frames.map(f=>`<figure class="beat-frame" data-cursor="VIEW"><div class="imgwrap"><img src="${esc(f[0])}" alt="" loading="lazy"></div><figcaption class="mono">${esc(f[1])}</figcaption></figure>`).join("")}
        </div>
      </div>
    </div>`;
  const row = $(".beat-row", sec);
  row.addEventListener("click", ()=>{
    const open = sec.classList.toggle("open");
    row.setAttribute("aria-expanded", String(open));
    $(".beat-panel", sec).setAttribute("aria-hidden", String(!open));
    if (open && hasGsap && !reduced){
      gsap.fromTo($$(".beat-frame", sec), {opacity:0, y:24}, {opacity:1, y:0, duration:.6, stagger:.07, ease:"power3.out", delay:.15});
    }
    setTimeout(safeRefresh, 550);
  });
  rollList.appendChild(sec);
});
revealOnEnter(".roll", ".beat", {opacity:0, y:30}, {opacity:1, y:0, duration:.7, stagger:.08, ease:"power3.out"});

/* ---------- crew: warm-mono grid, childhood crossfade ---------- */
const crewGrid = $("#crewGrid"), crewFilters = $("#crewFilters");
TEAM.forEach(t=>{
  const b = document.createElement("button");
  b.className = "member"; b.dataset.dept = t.dept;
  b.setAttribute("aria-pressed","false");
  b.setAttribute("data-cursor","FLIP");
  const main = t.img
    ? `<img class="main" src="assets/team/${esc(t.img)}" alt="Portrait of ${esc(t.name)}" loading="lazy">`
    : `<span class="pending mono">◉<br>AWAITING<br>EXPOSURE</span>`;
  const child = t.child
    ? `<img class="child" src="assets/team/${esc(t.child)}" alt="" aria-hidden="true" loading="lazy"><span class="tag">FRAME 00 · ${esc(t.name)} · BEFORE TASVEER</span>`
    : "";
  b.innerHTML = `<span class="imgwrap">${main}${child}</span>
    <span class="member-meta"><span class="member-name">${esc(t.name)}</span><span class="member-role">${esc(t.role)}</span></span>`;
  b.setAttribute("aria-label", `${t.name}, ${t.role}${t.child ? ". Activate to see their childhood photo." : ""}`);
  if (t.child){
    b.addEventListener("click", ()=>{
      const flipped = b.classList.toggle("flipped");
      b.setAttribute("aria-pressed", String(flipped));
      $(".child", b).setAttribute("aria-hidden", String(!flipped));
      $(".main", b).setAttribute("aria-hidden", String(flipped));
    });
  } else {
    b.addEventListener("click", ()=>toast(t.img ? "NO CHILDHOOD FRAME ON FILE — YET." : `${t.name.toUpperCase()} — FRAME PENDING. SEND US ONE.`));
  }
  crewGrid.appendChild(b);
});
DEPTS.forEach(([key,label],i)=>{
  const c = document.createElement("button");
  c.textContent = label; c.dataset.dept = key;
  c.setAttribute("aria-pressed", String(i===0));
  c.addEventListener("click", ()=>{
    $$("#crewFilters button").forEach(x=>x.setAttribute("aria-pressed","false"));
    c.setAttribute("aria-pressed","true");
    $$(".member").forEach(m=>m.classList.toggle("filtered-out", key!=="all" && m.dataset.dept!==key));
    safeRefresh();
  });
  crewFilters.appendChild(c);
});
revealOnEnter(".crew-grid", ".member", {opacity:0, y:36}, {opacity:1, y:0, duration:.7, stagger:{each:.05, from:"start"}, ease:"power3.out"});

/* ---------- subscribe: honest mailto compose (no fake backend) ---------- */
$("#subscribeForm").addEventListener("submit", e=>{
  e.preventDefault();
  const email = $("#subscribeEmail").value.trim();
  const subject = encodeURIComponent("Subscribe me to The Roll");
  const body = encodeURIComponent(`Hi Tasveer — add me to The Roll.\n\nMy email: ${email || "(write yours here)"}\n`);
  location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
  toast("OPENING YOUR MAIL APP — HIT SEND AND YOU'RE ON THE ROLL.");
});

/* ---------- daylight egg: the blue pill ---------- */
let pillClicks = 0, pillTimer = null;
$("#progressPill").addEventListener("click", ()=>{
  pillClicks++;
  clearTimeout(pillTimer); pillTimer = setTimeout(()=>pillClicks=0, 1400);
  if (pillClicks >= 3){
    pillClicks = 0;
    const day = document.body.classList.toggle("daylight");
    toast(day ? "DAYLIGHT MODE — THE DARKROOM WAS NEVER THE ONLY ROOM." : "LIGHTS DOWN. BACK TO THE GRAIN.");
  } else if (pillClicks === 1){
    toast("THE BLUE PILL KEEPS A SECRET — THREE CLICKS.", 2600);
  }
});

/* ---------- motion toggle ---------- */
let motionOn = localStorage.getItem("tasveer_drive_motion") !== "off";
function applyMotion(){
  document.body.classList.toggle("calm", !motionOn);
  $$("[data-motion-toggle]").forEach(b=>{
    b.setAttribute("aria-pressed", String(motionOn));
    b.textContent = motionOn ? "MOTION ◉" : "MOTION ○";
  });
  heroVideoState();
}
$$("[data-motion-toggle]").forEach(b=>b.addEventListener("click", ()=>{
  motionOn = !motionOn;
  localStorage.setItem("tasveer_drive_motion", motionOn ? "on" : "off");
  applyMotion();
  toast(motionOn ? "MOTION ON." : "MOTION PAUSED — THE FRAMES STAY.");
}));
applyMotion();

/* ---------- cursor follower (fine pointer only) ---------- */
if (matchMedia("(pointer: fine)").matches && !reduced && hasGsap){
  const cur = $("#cursor"), label = $(".cursor-label", cur);
  let mx=innerWidth/2, my=innerHeight/2, cx=mx, cy=my;
  addEventListener("mousemove", e=>{ mx=e.clientX; my=e.clientY; cur.classList.add("on"); });
  document.addEventListener("mouseleave", ()=>cur.classList.remove("on"));
  gsap.ticker.add(()=>{
    cx += (mx-cx)*.22; cy += (my-cy)*.22;
    cur.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    cur.style.opacity = cx > innerWidth-90 ? 0 : "";
  });
  document.addEventListener("mouseover", e=>{
    const t = e.target.closest("[data-cursor],a,button");
    if (t){ label.textContent = t.dataset.cursor || (t.classList.contains("member") ? "FLIP" : "GO"); label.style.display="block"; }
    else label.style.display="none";
    cur.classList.toggle("view", !!t && t.dataset.cursor==="VIEW");
  });
}

/* ---------- polish: velocity marquees, intro, roll peek, magnetic pills ---------- */
/* marquees speed up with scroll velocity, decay back (Drive signature) */
if (hasGsap && !reduced){
  const tracks = $$(".marquee-track");
  const bandTiles = $$("#photoBand .photo-tile");
  let vel = 0, lastY = window.scrollY;
  gsap.ticker.add(()=>{
    const y = window.scrollY, dv = y - lastY; lastY = y;
    vel += (dv - vel) * 0.12;
    const rate = motionOn ? Math.min(4, 1 + Math.abs(vel) * 0.06) : 1;
    tracks.forEach(tr=>{
      const an = tr.getAnimations ? tr.getAnimations()[0] : null;
      if (an && an.playbackRate !== rate) an.playbackRate = rate;
    });
    /* photo band leans into scroll velocity, settles upright (tactile) */
    const skew = motionOn ? Math.max(-5, Math.min(5, vel * 0.1)) : 0;
    const st = `skewX(${(-skew).toFixed(2)}deg)`;
    bandTiles.forEach(t=>{ if (t.style.transform !== st) t.style.transform = st; });
  });
}
/* intro: film-leader preloader — frame counter, then aperture iris wipe */
const curtain = $("#introCurtain");
if (curtain){
  const kill = ()=>{ document.body.style.overflow = ""; if (curtain.parentNode) curtain.remove(); };
  if (reduced || !motionOn || !hasGsap) kill();
  else {
    document.body.style.overflow = "hidden";
    const num = $("#leaderNum"), fill = $("#leaderFill"), leader = $(".leader", curtain);
    const state = {n:0};
    curtain.style.clipPath = "circle(141% at 50% 50%)";
    const tl = gsap.timeline({onComplete:kill});
    tl.to(state, {n:100, duration:1.05, ease:"power2.inOut", onUpdate:()=>{
        const v = Math.round(state.n);
        if (num) num.textContent = String(v).padStart(3,"0");
        if (fill) fill.style.transform = `scaleX(${(state.n/100).toFixed(3)})`;
      }})
      .to(leader, {opacity:0, y:-12, duration:.3, ease:"power2.in"}, ">-0.05")
      .to(curtain, {clipPath:"circle(0% at 50% 50%)", duration:.65, ease:"power3.inOut"}, ">-0.12");
    setTimeout(kill, 3600);
  }
}
/* roll peek: first frame of each beat floats beside the cursor on hover */
const peek = $("#rollPeek");
if (peek && matchMedia("(pointer: fine)").matches && !reduced){
  const pimg = $("img", peek);
  ROLL.forEach(b=>{ const im = new Image(); im.src = b.frames[0][0]; });
  let px = innerWidth/2, py = innerHeight/2, tx = px, ty = py;
  $$(".beat-row").forEach((row,i)=>{
    row.addEventListener("mouseenter", ()=>{ pimg.src = ROLL[i].frames[0][0]; peek.classList.add("on"); });
    row.addEventListener("mouseleave", ()=>peek.classList.remove("on"));
  });
  addEventListener("mousemove", e=>{
    tx = Math.min(e.clientX + 150, innerWidth - 170);
    ty = Math.max(120, Math.min(e.clientY - 30, innerHeight - 120));
  }, {passive:true});
  if (hasGsap) gsap.ticker.add(()=>{
    px += (tx - px) * .14; py += (ty - py) * .14;
    peek.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) translate(-50%,-50%)`;
  });
}
/* magnetic pills: subtle pull toward the cursor */
if (matchMedia("(pointer: fine)").matches && !reduced){
  $$(".pill").forEach(p=>{
    p.addEventListener("mousemove", e=>{
      const r = p.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2)) * 0.18;
      const dy = (e.clientY - (r.top + r.height/2)) * 0.3;
      p.style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`;
    });
    p.addEventListener("mouseleave", ()=>{ p.style.transform = ""; });
  });
}

/* ---------- section titles: film-gate wipe (composes with parent fade) ---------- */
$$(".section-title").forEach(el=>{
  if (!hasGsap || reduced) return;
  ScrollTrigger.create({trigger:el, start:"top 88%", once:true,
    onEnter:()=>gsap.fromTo(el, {clipPath:"inset(0 100% 0 0)"}, {clipPath:"inset(0 0% 0 0)", duration:1.1, ease:"power4.inOut"}),
    onRefresh:self=>{ if (self.progress>0) gsap.set(el, {clearProps:"clipPath"}); }});
});
/* ---------- footer statement develops like a darkroom print ---------- */
const fstate = $(".footer-statement");
if (fstate && hasGsap && !reduced){
  fstate.classList.add("undeveloped");
  ScrollTrigger.create({trigger:fstate, start:"top 82%", once:true,
    onEnter:()=>fstate.classList.remove("undeveloped"),
    onRefresh:self=>{ if (self.progress>0) fstate.classList.remove("undeveloped"); }});
}

/* ---------- crew: tactile 3D tilt on the portrait (fine pointer) ---------- */
if (matchMedia("(pointer: fine)").matches && !reduced){
  $$(".member").forEach(m=>{
    const w = $(".imgwrap", m); if (!w) return;
    m.addEventListener("mousemove", e=>{
      const r = w.getBoundingClientRect();
      const px = (e.clientX - r.left)/r.width - 0.5, py = (e.clientY - r.top)/r.height - 0.5;
      w.style.transform = `perspective(700px) rotateY(${(px*7).toFixed(2)}deg) rotateX(${(-py*7).toFixed(2)}deg)`;
    });
    m.addEventListener("mouseleave", ()=>{ w.style.transform = ""; });
  });
}
/* ---------- collage: scroll-depth parallax (figures drift, hover zoom composes) ---------- */
if (hasGsap && !reduced){
  gsap.fromTo(".collage .c-small", {y:50}, {y:-50, ease:"none",
    scrollTrigger:{trigger:".collage", start:"top bottom", end:"bottom top", scrub:true}});
  gsap.fromTo(".collage .c-big", {y:-40}, {y:40, ease:"none",
    scrollTrigger:{trigger:".collage", start:"top bottom", end:"bottom top", scrub:true}});
}

/* ---------- scene pathfinder: highlight the current section ---------- */
const pf = $("#pathfinder");
if (pf && "IntersectionObserver" in window){
  const links = $$("a", pf);
  const setActive = id=>links.forEach(a=>a.classList.toggle("active", a.dataset.scene===id));
  const secs = ["top","story","roll","crew","open-call"].map(id=>document.getElementById(id)).filter(Boolean);
  const io = new IntersectionObserver(es=>{
    es.forEach(e=>{ if (e.isIntersecting) setActive(e.target.id); });
  }, {rootMargin:"-45% 0px -45% 0px", threshold:0});
  secs.forEach(s=>io.observe(s));
  setActive("top");
}

/* ---------- misc wiring ---------- */
$$("[data-goto]").forEach(el=>el.addEventListener("click", e=>{
  e.preventDefault(); goTo(el.dataset.goto);
}));
if (CONFIG.instagram){
  const ig = $("#instaLink"); ig.href = CONFIG.instagram; ig.hidden = false; ig.target="_blank"; ig.rel="noopener";
}
$("#year").textContent = new Date().getFullYear();
onScroll();