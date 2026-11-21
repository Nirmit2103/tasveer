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
  const nodes=[...track.children], half=nodes.length/2;
  nodes.slice(half).forEach(n=>{
    n.setAttribute("aria-hidden","true");
    if (n.matches("[data-lb],a,button,[tabindex]")) n.setAttribute("tabindex","-1");
    $$("[data-lb],a,button,[tabindex]",n).forEach(x=>x.setAttribute("tabindex","-1"));
  });
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
const bandHTML = bandImgs.map((im,i)=>`<figure class="photo-tile ${tileCls[i%3]}" data-item data-cursor="VIEW"><img src="${esc(im[0])}" alt="" loading="lazy" decoding="async"><figcaption class="mono">${esc(im[1])}</figcaption></figure>`).join("");
buildMarquee($("#photoBand"), bandHTML, {invert:true, secPerItem:4, pauseHover:true});

/* ---------- hero: cinema video + parallax wordmark + stills ---------- */
const heroVideo = $("#heroVideo");
const heroWordWrap = $("#heroWordWrap");
const STILLS = [
  ["assets/drive/still1.jpg","the lawns, fest night — from above"],
  ["assets/drive/still2.jpg","the verse, amber light"],
  ["assets/drive/still3.jpg","a canopy of lights, okhla"],
];
$("#heroStills").innerHTML = STILLS.map(s=>`<figure data-cursor="VIEW"><div class="imgwrap"><img src="${esc(s[0])}" alt="${esc(s[1])}" loading="lazy" decoding="async"></div><figcaption class="mono">${esc(s[1])}</figcaption></figure>`).join("");
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
/* projector shutter: randomized vertical bars wipe Shot B in (signature) */
const SHUTTER_BARS = Array.from({length:9}, ()=>({off: Math.random()*0.45}));
const shutterOK = typeof CSS!=="undefined" && CSS.supports && CSS.supports("mask-image","linear-gradient(90deg,black,transparent)");
function shutterMask(local){
  const n=SHUTTER_BARS.length, st=[];
  for (let i=0;i<n;i++){
    const r=Math.min(1,Math.max(0,(local-SHUTTER_BARS[i].off)/0.55));
    const x0=i/n*100, x1=(i+1)/n*100, e=x0+(x1-x0)*r;
    st.push(`black ${x0.toFixed(2)}% ${e.toFixed(2)}%`, `transparent ${e.toFixed(2)}% ${x1.toFixed(2)}%`);
  }
  return `linear-gradient(90deg,${st.join(",")})`;
}
function heroChoreo(p){
  const s = (1.18 - 0.18 * p).toFixed(4);
  const t = `translateY(${(-3 * p).toFixed(2)}vh) scale(${s})`;
  if (heroVideo) heroVideo.style.transform = t;
  if (heroVideoB){
    heroVideoB.style.transform = t;
    if (touchDevice){ heroVideoB.style.opacity = 0; }
    else {
      const local = Math.min(1, Math.max(0, (p - 0.38) / 0.30));
      if (shutterOK){ /* callers gate motionOn && !reduced; calm/reduced hold static Shot A via heroVideoState */
        heroVideoB.style.opacity = local > 0 ? "1" : "0";
        const m = shutterMask(local);
        heroVideoB.style.maskImage = m; heroVideoB.style.webkitMaskImage = m;
      } else {
        heroVideoB.style.maskImage = ""; heroVideoB.style.webkitMaskImage = "";
        heroVideoB.style.opacity = (local*local*(3-2*local)).toFixed(3);
      }
    }
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
    if (heroVideoB){ heroVideoB.style.transform = "scale(1)"; heroVideoB.style.opacity = 0; heroVideoB.style.maskImage = ""; heroVideoB.style.webkitMaskImage = ""; }
    if (heroWordWrap) heroWordWrap.style.transform = `translateY(${(-0.09 * innerHeight).toFixed(1)}px) scale(${wordFit.toFixed(4)})`;
  } else heroChoreo(heroP);
  syncInterlude();
}
measureWord();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(()=>{ measureWord(); if (motionOn && !reduced) heroChoreo(heroP); else heroVideoState(); });
addEventListener("resize", ()=>{ measureWord(); if (motionOn && !reduced) heroChoreo(heroP); else heroVideoState(); }, {passive:true});
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
    onUpdate:self=>{ heroP = self.progress; if (motionOn) heroChoreo(self.progress); }
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
    onEnter: ()=>gsap.fromTo(els, fromVars, {...toVars, overwrite:"auto", onComplete:()=>gsap.set(els,{clearProps:"transform"})}),
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
      <span class="beat-idx mono">${String(i+1).padStart(2,"0")}</span>
      <span class="beat-name">${esc(beat.name)}</span>
      <span class="beat-code">${esc(beat.code)}</span>
      <span class="beat-count">${beat.count} FRAMES</span>
      <span class="beat-plus" aria-hidden="true">+</span>
    </button>
    <div class="beat-panel" id="${panelId}" role="region" aria-label="${esc(beat.name)} frames" aria-hidden="true">
      <div class="beat-panel-inner">
        <p class="beat-note">${esc(beat.note)}</p>
        <div class="beat-frames">
          ${beat.frames.map(f=>`<figure class="beat-frame" data-cursor="VIEW"><div class="imgwrap"><img src="${esc(f[0])}" alt="" loading="lazy" decoding="async"></div><figcaption class="mono">${esc(f[1])}</figcaption></figure>`).join("")}
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
    ? `<img class="child" src="assets/team/${esc(t.child)}" alt="" aria-hidden="true" loading="lazy" decoding="async"><span class="tag">FRAME 00 · ${esc(t.name)} · BEFORE TASVEER</span>`
    : (t.back && t.back.type==="quote"
      ? `<span class="quote-back" aria-hidden="true"><span class="quote-text">\u201C${esc(t.back.text)}\u201D</span><span class="tag mono">${esc(t.back.tag)}</span></span>`
      : "");
  b.innerHTML = `<span class="imgwrap">${main}${child}</span>
    <span class="member-meta"><span class="member-name">${esc(t.name)}</span><span class="member-role">${esc(t.role)}</span></span>`;
  b.setAttribute("aria-label", `${t.name}, ${t.role}${t.child ? ". Activate to see their childhood photo." : (t.back ? ". Activate to read their note." : "")}`);
  if (t.child || (t.back && t.back.type==="quote")){
    b.addEventListener("click", ()=>{
      const flipped = b.classList.toggle("flipped");
      b.setAttribute("aria-pressed", String(flipped));
      const backEl = $(".child", b) || $(".quote-back", b);
      if (backEl) backEl.setAttribute("aria-hidden", String(!flipped));
      const mainEl = $(".main", b); if (mainEl) mainEl.setAttribute("aria-hidden", String(flipped));
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
  $("#progressPill")?.setAttribute("data-easteregg","SECRET");
  let mx=innerWidth/2, my=innerHeight/2, cx=mx, cy=my;
  addEventListener("mousemove", e=>{
    mx=e.clientX; my=e.clientY; cur.classList.add("on");
    label.classList.toggle("flip-x", mx > innerWidth-180);
    label.classList.toggle("flip-y", my > innerHeight-70);
  });
  document.addEventListener("mouseleave", ()=>cur.classList.remove("on"));
  gsap.ticker.add(()=>{
    cx += (mx-cx)*.22; cy += (my-cy)*.22;
    cur.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    cur.style.opacity = cx > innerWidth-90 ? 0 : "";
  });
  document.addEventListener("mouseover", e=>{
    const t = e.target.closest("[data-cursor],a,button");
    if (t){ label.textContent = (t.dataset.easteregg && e.clientX > innerWidth/2) ? t.dataset.easteregg : (t.dataset.cursor || (t.classList.contains("member") ? "FLIP" : "GO")); label.style.display="block"; }
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
  let killed = false;
  const kill = ()=>{ if (killed) return; killed = true; try{ sessionStorage.setItem("tasveer_leader_shown","1"); }catch(_){} document.body.style.overflow = ""; if (curtain.parentNode) curtain.remove(); if (!reduced && motionOn) decodeText($(".hero-kicker")); };
  if (reduced || !motionOn || !hasGsap) kill();
  else {
    document.body.style.overflow = "hidden";
    const num = $("#leaderNum"), fill = $("#leaderFill"), leader = $(".leader", curtain);
    let seen = false; try{ seen = sessionStorage.getItem("tasveer_leader_shown")==="1"; }catch(_){}
    curtain.style.clipPath = "circle(141% at 50% 50%)";
    if (seen){
      leader.style.display = "none";
      gsap.to(curtain, {clipPath:"circle(0% at 50% 50%)", duration:.4, ease:"power3.inOut", onComplete:kill});
    } else {
      const state = {n:0};
      const tl = gsap.timeline({onComplete:kill});
      tl.to(state, {n:100, duration:1.05, ease:"power2.inOut", onUpdate:()=>{
          const v = Math.round(state.n);
          if (num) num.textContent = String(v).padStart(3,"0");
          if (fill) fill.style.transform = `scaleX(${(state.n/100).toFixed(3)})`;
        }})
        .to(leader, {opacity:0, y:-12, duration:.3, ease:"power2.in"}, ">-0.05")
        .to(curtain, {clipPath:"circle(0% at 50% 50%)", duration:.65, ease:"power3.inOut"}, ">-0.12");
    }
    const skip = ()=>kill();
    document.addEventListener("pointerdown", skip, {once:true});
    document.addEventListener("keydown", skip, {once:true});
    setTimeout(kill, 3600);
  }
}
/* roll peek: first frame of each beat floats beside the cursor on hover */
const peek = $("#rollPeek");
if (peek && matchMedia("(pointer: fine)").matches && !reduced){
  const pimg = $("img", peek);
  const ghosts = [["g1",.10],["g2",.07]].map(([cls,f])=>{
    const el = document.createElement("div"); el.className = "roll-peek ghost "+cls; el.setAttribute("aria-hidden","true");
    el.innerHTML = '<img alt="">'; document.body.appendChild(el);
    return {el, img:el.querySelector("img"), x:innerWidth/2, y:innerHeight/2, f};
  });
  ROLL.forEach(b=>{ const im = new Image(); im.src = b.frames[0][0]; });
  let px = innerWidth/2, py = innerHeight/2, tx = px, ty = py;
  $$(".beat-row").forEach((row,i)=>{
    row.addEventListener("mouseenter", ()=>{ const src=ROLL[i].frames[0][0]; pimg.src=src; peek.classList.add("on"); ghosts.forEach(g=>{ g.img.src=src; g.el.classList.add("on"); }); });
    row.addEventListener("mouseleave", ()=>{ peek.classList.remove("on"); ghosts.forEach(g=>g.el.classList.remove("on")); });
  });
  addEventListener("mousemove", e=>{
    tx = Math.min(e.clientX + 150, innerWidth - 170);
    ty = Math.max(120, Math.min(e.clientY - 30, innerHeight - 120));
  }, {passive:true});
  if (hasGsap) gsap.ticker.add(()=>{
    px += (tx - px) * .14; py += (ty - py) * .14;
    peek.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) translate(-50%,-50%)`;
    ghosts.forEach(g=>{
      g.x += (tx - g.x) * g.f; g.y += (ty - g.y) * g.f;
      g.el.style.transform = `translate3d(${g.x.toFixed(1)}px,${g.y.toFixed(1)}px,0) translate(-50%,-50%)`;
    });
  });
}
/* magnetic pills: subtle pull toward the cursor */
if (matchMedia("(pointer: fine)").matches && !reduced){
  $$(".pill").forEach(p=>{
    p.addEventListener("mousemove", e=>{
      const r = p.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2)) * 0.18;
      const dy = (e.clientY - (r.top + r.height/2)) * 0.3;
      p.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
    });
    p.addEventListener("mouseleave", ()=>{ p.style.translate = ""; });
  });
}
/* text-roll fill: wrap pill labels so the twin rolls up under a rising fill */
$$(".pill").forEach(p=>{
  if (p.querySelector(".pill-clip")) return;
  p.innerHTML = `<span class="pill-clip"><span class="pill-roll">${p.innerHTML}</span></span>`;
});

/* ---------- the contact sheet: pull-the-film horizontal strip ----------
   Film spacers let every frame sit centered in the gate; mouse drag carries
   momentum and settles with a snap + lock flash; touch rides native scroll. */
const SHEET = [
  ["photo017.webp","headliner, green light"],["photo007.webp","split light, front rail"],
  ["photo077.webp","the diya, held breath"],["photo045.webp","the full house"],
  ["photo075.webp","mid-flip, red backdrop"],["photo053.webp","the talk, esya"],
  ["photo005.webp","peak action"],["photo089.webp","chiaroscuro"],
  ["photo062.webp","the pool final"],["photo081.webp","the send-off"],
  ["photo026.webp","battle of bands"],["photo086.webp","yellow, studio"],
];
const sheetTrack = $("#sheetTrack");
let sheetSuppressUntil = 0;
if (sheetTrack){
  sheetTrack.innerHTML = SHEET.map((f,i)=>`<figure class="sheet-frame" data-cursor="VIEW"><div class="imgwrap"><img src="${esc(A+f[0])}" alt="${esc(f[1])}" loading="lazy" decoding="async" draggable="false"></div><figcaption class="mono"><span>FR ${String(i+1).padStart(2,"0")}</span><span>${esc(f[1])}</span></figcaption></figure>`).join("");
  const vp = $("#sheetViewport"), gc = $("#gateCount"), gate = $(".sheet-gate"), live = $("#sheetLive");
  const frames = $$(".sheet-frame", sheetTrack);
  let lastBest = -1, lastFlashed = -1, flashT = null;
  const nearest = ()=>{
    const center = vp.scrollLeft + vp.clientWidth/2;
    let best=0, bd=Infinity;
    frames.forEach((f,i)=>{ const c=f.offsetLeft+f.offsetWidth/2, d=Math.abs(c-center); if(d<bd){bd=d;best=i;} });
    return best;
  };
  const upd = (flash)=>{
    const best = nearest();
    if (gc) gc.textContent = `FR ${String(best+1).padStart(2,"0")} / ${String(frames.length).padStart(2,"0")}`;
    lastBest = best;
    if (flash && best !== lastFlashed){
      lastFlashed = best;
      if (live) live.textContent = `Frame ${best+1} of ${frames.length}`;
      if (!reduced && gate){
        gate.classList.remove("lock"); void gate.offsetWidth; gate.classList.add("lock");
        if (gc){ gc.classList.remove("tick"); void gc.offsetWidth; gc.classList.add("tick"); }
      }
    }
  };
  const snapNearest = (smooth)=>{
    const f = frames[nearest()];
    vp.scrollTo({left: f.offsetLeft + f.offsetWidth/2 - vp.clientWidth/2, behavior: (smooth && !reduced && motionOn) ? "smooth" : "auto"});
  };
  /* leading/trailing film spacers: any frame can reach the gate */
  const layoutSheet = (keepIdx)=>{
    const fw = frames[0].offsetWidth;
    const marginPx = parseFloat(getComputedStyle($(".sheet-head")).paddingLeft) || 0;
    const pad = Math.max(marginPx, vp.clientWidth/2 - fw/2);
    sheetTrack.style.paddingLeft = pad+"px"; sheetTrack.style.paddingRight = pad+"px";
    if (keepIdx >= 0){ const f = frames[keepIdx]; vp.scrollLeft = f.offsetLeft + f.offsetWidth/2 - vp.clientWidth/2; }
    else vp.scrollLeft = 0;
    upd(false);
  };
  layoutSheet(-1);
  let rzT = null;
  addEventListener("resize", ()=>{ clearTimeout(rzT); rzT = setTimeout(()=>layoutSheet(lastBest), 150); }, {passive:true});
  vp.addEventListener("scroll", ()=>{ upd(false); clearTimeout(flashT); flashT = setTimeout(()=>upd(true), 140); }, {passive:true});
  /* mouse drag with momentum — capture only once a real drag begins,
     so a plain click still targets its figure (lightbox) */
  let down=false, sx=0, sl=0, lastX=0, lastT=0, vx=0, moved=0, momRaf=null, captured=false, pid=null;
  const stopMom = ()=>{ if (momRaf){ cancelAnimationFrame(momRaf); momRaf=null; } };
  const momentum = ()=>{
    let last = performance.now();
    const step = (now)=>{
      const dt = Math.min(48, now-last); last = now;
      vp.scrollLeft -= vx*dt;
      vx *= Math.pow(0.94, dt/16.7);
      if (vp.scrollLeft<=0 || vp.scrollLeft>=vp.scrollWidth-vp.clientWidth) vx=0;
      if (Math.abs(vx)>0.04){ momRaf=requestAnimationFrame(step); }
      else { momRaf=null; vp.classList.remove("dragging"); snapNearest(true); }
    };
    momRaf = requestAnimationFrame(step);
  };
  vp.addEventListener("pointerdown", e=>{
    if (e.pointerType!=="mouse") return;
    stopMom(); down=true; captured=false; pid=e.pointerId;
    sx=lastX=e.clientX; sl=vp.scrollLeft; lastT=performance.now(); vx=0; moved=0;
    vp.classList.add("dragging");
  });
  vp.addEventListener("pointermove", e=>{
    if (!down) return;
    const now = performance.now(), dx = e.clientX-lastX, dt = Math.max(1, now-lastT);
    vp.scrollLeft = sl-(e.clientX-sx);
    moved += Math.abs(dx);
    if (!captured && moved>6){ try{ vp.setPointerCapture(pid); }catch(_){} captured=true; }
    vx = vx*0.7 + (dx/dt)*0.3;
    lastX = e.clientX; lastT = now;
  });
  const endDrag = ()=>{
    if (!down) return;
    down=false;
    if (moved>6) sheetSuppressUntil = performance.now()+400;
    if (moved>6 && Math.abs(vx)>0.08 && !reduced && motionOn){ momentum(); }
    else { vp.classList.remove("dragging"); if (moved>6) snapNearest(true); }
  };
  vp.addEventListener("pointerup", endDrag); vp.addEventListener("pointercancel", endDrag);
  addEventListener("pointerup", ()=>{ if (down && !captured) endDrag(); });
  addEventListener("pointercancel", ()=>{ if (down && !captured) endDrag(); });
  vp.addEventListener("wheel", ()=>{ const wasMom = !!momRaf; stopMom(); if (wasMom && !down){ vp.classList.remove("dragging"); snapNearest(true); } }, {passive:true});
  vp.addEventListener("keydown", e=>{
    const beh = (reduced || !motionOn) ? "auto" : "smooth";
    if (e.key==="ArrowRight"){ vp.scrollBy({left:vp.clientWidth*0.6, behavior:beh}); e.preventDefault(); }
    if (e.key==="ArrowLeft"){ vp.scrollBy({left:-vp.clientWidth*0.6, behavior:beh}); e.preventDefault(); }
    if (e.key==="Home"){ vp.scrollTo({left:0, behavior:beh}); e.preventDefault(); }
    if (e.key==="End"){ vp.scrollTo({left:vp.scrollWidth, behavior:beh}); e.preventDefault(); }
  });
}

/* ---------- lightbox: every VIEW frame opens full-screen ---------- */
const lb = $("#lightbox"), lbImg = $("#lbImg"), lbWrap = $("#lbWrap"),
      lbCount = $("#lbCount"), lbText = $("#lbText"), lbHint = $("#lbHint"),
      lbClose = $("#lbClose"), lbPrev = $("#lbPrev"), lbNext = $("#lbNext");
let lbItems = [], lbCur = 0, lbOpener = null, lbSwT = null, lbFocusT = null;
if (lb) lb.inert = true;
const pad2 = n => String(n).padStart(2,"0");
function lbGroupFor(fig){
  if (fig.closest("#photoBand")){
    const src = $("img",fig).getAttribute("src");
    const items = bandImgs.map(b=>({src:b[0], cap:b[1], alt:b[1]}));
    return {items, idx: Math.max(0, items.findIndex(i=>i.src===src))};
  }
  if (fig.closest(".sheet-track")){
    const figs = $$(".sheet-frame", sheetTrack);
    return {items: SHEET.map(s=>({src:A+s[0], cap:s[1], alt:s[1]})), idx: figs.indexOf(fig)};
  }
  if (fig.closest(".hero-stills")){
    const figs = $$(".hero-stills figure");
    return {items: STILLS.map(s=>({src:s[0], cap:s[1], alt:s[1]})), idx: figs.indexOf(fig)};
  }
  const cont = fig.closest(".beat-frames, .collage");
  if (cont){
    const figs = $$("figure", cont);
    const items = figs.map(f=>{ const im=$("img",f), c=$("figcaption",f);
      return {src: im.getAttribute("src"), cap: c ? c.textContent.trim() : (im.alt||""), alt: im.alt||""}; });
    return {items, idx: figs.indexOf(fig)};
  }
  return null;
}
function lbPreload(i){
  [ (i+1)%lbItems.length, (i-1+lbItems.length)%lbItems.length ].forEach(j=>{
    const im = new Image(); im.src = lbItems[j].src;
  });
}
function lbShow(i, instant){
  lbCur = i;
  const it = lbItems[i];
  const apply = ()=>{
    lbImg.src = it.src; lbImg.alt = it.alt || it.cap;
    lbText.textContent = it.cap;
    lbCount.textContent = `FR ${pad2(i+1)} / ${pad2(lbItems.length)}`;
    lbPreload(i);
  };
  if (instant || reduced || !motionOn){ clearTimeout(lbSwT); lbWrap.classList.remove("switching"); apply(); return; }
  lbWrap.classList.add("switching");
  clearTimeout(lbSwT);
  lbSwT = setTimeout(()=>{ apply(); lbWrap.classList.remove("switching"); }, 170);
}
function lbOpen(items, idx, opener){
  if (!items.length || idx<0) return;
  lbItems = items; lbOpener = opener;
  lbShow(idx, true);
  lb.inert = false;
  lb.classList.add("open"); lb.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden"; if (lenis) lenis.stop();
  lbHint.textContent = matchMedia("(pointer: coarse)").matches
    ? "SWIPE TO ADVANCE · TAP OUTSIDE TO CLOSE"
    : "← → TO ADVANCE · ESC TO CLOSE";
  clearTimeout(lbFocusT); lbFocusT = setTimeout(()=>lbClose.focus(), 60);
}
function lbCloseFn(){
  lb.classList.remove("open");
  document.body.style.overflow = ""; if (lenis) lenis.start();
  clearTimeout(lbSwT); clearTimeout(lbFocusT); lbWrap.classList.remove("switching");
  if (lbOpener) lbOpener.focus({preventScroll:true});
  lb.setAttribute("aria-hidden","true");
  lb.inert = true;
}
function lbActivate(fig){
  if (performance.now() < sheetSuppressUntil && fig.closest(".sheet-track")) return;
  const g = lbGroupFor(fig);
  if (g) lbOpen(g.items, g.idx, fig);
}
/* mark every viewable frame as a button */
$$(".hero-stills figure, .collage figure, .beat-frames figure, .sheet-frame, #photoBand .photo-tile").forEach(f=>{
  f.setAttribute("data-lb","");
  if (f.getAttribute("aria-hidden")==="true") return; /* clickable, but no tab stop / role / label */
  f.setAttribute("tabindex","0"); f.setAttribute("role","button");
  const im = $("img",f), c = $("figcaption",f);
  const cap = c ? (c.querySelector("span:last-child")||c).textContent.trim() : (im ? im.alt : "");
  f.setAttribute("aria-label", "View frame: " + cap);
});
document.addEventListener("click", e=>{
  const f = e.target.closest("[data-lb]");
  if (f) lbActivate(f);
});
lbClose.addEventListener("click", lbCloseFn);
lbPrev.addEventListener("click", ()=>lbShow((lbCur-1+lbItems.length)%lbItems.length));
lbNext.addEventListener("click", ()=>lbShow((lbCur+1)%lbItems.length));
lb.addEventListener("click", e=>{ if (e.target===lb) lbCloseFn(); });
document.addEventListener("keydown", e=>{
  if (lb.classList.contains("open")){
    if (e.key==="Escape"){ lbCloseFn(); e.preventDefault(); }
    else if (e.key==="ArrowRight"){ lbShow((lbCur+1)%lbItems.length); e.preventDefault(); }
    else if (e.key==="ArrowLeft"){ lbShow((lbCur-1+lbItems.length)%lbItems.length); e.preventDefault(); }
    else if (e.key==="Tab"){
      const f = [lbClose, lbPrev, lbNext], i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(e.shiftKey ? (i<=0 ? f.length-1 : i-1) : (i+1)%f.length)].focus();
    }
    return;
  }
  const f = e.target.closest && e.target.closest("[data-lb]");
  if (f && (e.key==="Enter" || e.key===" ")){ e.preventDefault(); lbActivate(f); }
});
/* touch swipe inside the viewer */
let lbTx=0, lbTy=0;
lb.addEventListener("pointerdown", e=>{ if (e.pointerType==="touch"){ lbTx=e.clientX; lbTy=e.clientY; } }, {passive:true});
lb.addEventListener("pointerup", e=>{
  if (e.pointerType!=="touch") return;
  const dx=e.clientX-lbTx, dy=e.clientY-lbTy;
  if (Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)) lbShow(dx<0 ? (lbCur+1)%lbItems.length : (lbCur-1+lbItems.length)%lbItems.length);
}, {passive:true});

/* ---------- micro-finish: kicker decode, interlude line reveal ---------- */
function decodeText(el, dur=1000){
  if (!el) return;
  const orig = el.textContent, glyphs = "▓▒░·—/\\|0123456789ABCDEF";
  const start = performance.now();
  const tick = (now)=>{
    const p = Math.min(1, (now-start)/dur);
    const lock = Math.floor(p*orig.length);
    el.textContent = orig.slice(0,lock) + [...orig.slice(lock)].map(c=>c===" "?" ":glyphs[(Math.random()*glyphs.length)|0]).join("");
    if (p<1) requestAnimationFrame(tick); else el.textContent = orig;
  };
  requestAnimationFrame(tick);
}
const interludeLine = $(".interlude-line");
if (interludeLine && hasGsap && !reduced){
  const lines = interludeLine.innerHTML.split(/<br\s*\/?>/i);
  interludeLine.innerHTML = lines.map(l=>`<span class="mask"><span>${l}</span></span>`).join("");
  gsap.fromTo($$(".mask > span", interludeLine), {yPercent:105},
    {yPercent:0, duration:1.1, stagger:.14, ease:"power4.out",
     scrollTrigger:{trigger:interludeLine, start:"top 82%", once:true}});
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
$$(".collage figure").forEach(f=>{
  const im = $("img",f); if (!im || $(".inner",f)) return;
  const w = document.createElement("span"); w.className = "inner";
  f.insertBefore(w,im); w.appendChild(im);
});
if (hasGsap && !reduced){
  gsap.fromTo(".collage .c-small", {y:50}, {y:-50, ease:"none",
    scrollTrigger:{trigger:".collage", start:"top bottom", end:"bottom top", scrub:true}});
  gsap.fromTo(".collage .c-big", {y:-40}, {y:40, ease:"none",
    scrollTrigger:{trigger:".collage", start:"top bottom", end:"bottom top", scrub:true}});
  /* inner-image drift inside each gate (counter-parallax depth) */
  gsap.fromTo(".collage .c-small img", {yPercent:-5}, {yPercent:5, ease:"none",
    scrollTrigger:{trigger:".collage", start:"top bottom", end:"bottom top", scrub:true}});
  gsap.fromTo(".collage .c-big img", {yPercent:5}, {yPercent:-5, ease:"none",
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
/* live on-set clock — Okhla time, the society's heartbeat */
const clocks = [$("#onSetClock"), $("#onSetClock2")].filter(Boolean);
if (clocks.length){
  const fmt = new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"});
  const tickClock = ()=>{ if (document.hidden) return; const s = "ON SET "+fmt.format(new Date())+" IST"; clocks.forEach(c=>c.textContent=s); };
  tickClock(); setInterval(tickClock, 1000);
}
onScroll();

/* a note for the curious who open the console */
console.log("%c◉ TASVEER — shot & developed in the darkroom by the webdev lead.", "color:#8B87FF;font-family:monospace;font-size:12px;padding:4px 0;");
console.log("%cEvery event ends. The frame doesn't. → tasveer@sc.iiitd.ac.in", "color:#9A9A94;font-family:monospace;");