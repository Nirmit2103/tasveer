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
   frames:[[A+"campus-bldg.webp","the quad, morning of"],[A+"presentation.webp","the address"],[A+"students.webp","waiting for names"],[A+"conference.webp","the full house"]]},
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
/* hero video: scroll-driven, not autoplay. Scroll advances the footage
   AND zooms out (1.28 → 1.0), scrubbed in sync with the wordmark. */
let heroP = 0, heroSeekT = -1;
function scrubHeroVideo(p){
  if (!heroVideo) return;
  if (reduced || !motionOn){ heroVideo.style.transform = "scale(1)"; return; }
  const d = heroVideo.duration;
  if (d && isFinite(d)){
    const t = p * Math.max(0, d - 0.08);
    if (Math.abs(heroSeekT - t) > 0.04){ heroSeekT = t; heroVideo.currentTime = t; }
  }
  heroVideo.style.transform = `scale(${(1.28 - 0.28 * p).toFixed(4)})`;
}
function heroVideoState(){
  if (heroVideo) heroVideo.pause();
  scrubHeroVideo(heroP);
  scrubInterludeVideo(interludeP);
}
if (heroVideo){
  heroVideo.removeAttribute("autoplay");
  heroVideo.pause();
  const initHero = ()=>scrubHeroVideo(heroP);
  if (heroVideo.readyState >= 1) initHero();
  else heroVideo.addEventListener("loadedmetadata", initHero, {once:true});
}
/* interlude video: same scroll-scrub + zoom-out treatment */
const interludeVideo = $("#interludeVideo");
let interludeP = 0, interSeekT = -1;
function scrubInterludeVideo(p){
  if (!interludeVideo) return;
  if (reduced || !motionOn){ interludeVideo.style.transform = "scale(1)"; return; }
  const d = interludeVideo.duration;
  if (d && isFinite(d)){
    const t = p * Math.max(0, d - 0.08);
    if (Math.abs(interSeekT - t) > 0.04){ interSeekT = t; interludeVideo.currentTime = t; }
  }
  interludeVideo.style.transform = `scale(${(1.22 - 0.22 * p).toFixed(4)})`;
}
if (interludeVideo){
  interludeVideo.pause();
  const initInt = ()=>scrubInterludeVideo(interludeP);
  if (interludeVideo.readyState >= 1) initInt();
  else interludeVideo.addEventListener("loadedmetadata", initInt, {once:true});
}
if (hasGsap && !reduced){
  ScrollTrigger.create({
    trigger:".hero", start:"top top", end:"bottom top", scrub:true,
    onUpdate:self=>{
      heroP = self.progress;
      const y = self.scroll()*0.12, sc = 1 + self.progress*0.06;
      heroWordWrap.style.transform = `translateY(${y}px) scale(${sc})`;
      scrubHeroVideo(self.progress);
    }
  });
  ScrollTrigger.create({
    trigger:".interlude", start:"top bottom", end:"bottom top", scrub:true,
    onUpdate:self=>{ interludeP = self.progress; scrubInterludeVideo(self.progress); }
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
  });
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