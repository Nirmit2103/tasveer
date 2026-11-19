/* ============================================================
   TASVEER — the darkroom · interaction engine
   Edit CONFIG + DATA below to update content. No build step.
   ============================================================ */

const CONFIG = {
  email: "tasveer@sc.iiitd.ac.in",
  instagram: "", // ← put the full Instagram URL here, e.g. "https://instagram.com/tasveer.iiitd"
  maxExposures: 36,
  traySize: 5,
};

/* ---------- DATA ---------- */
const TEAM = [
  { name:"Leelansh",   role:"Coordinator",         dept:"coordination", img:"leelansh.webp",
    back:{ type:"quote", text:"Reply on the group, not in my DMs.", tag:"the coordinator, allegedly" } },
  { name:"Gauranshi",  role:"Coordinator",         dept:"coordination", img:"gauranshi.webp", child:"gauranshi-child.webp",
    backCap:"mountains called early" },
  { name:"Arjun Koul", role:"Creative Lead",       dept:"creative",     img:"arjun.webp", child:"arjun-child.webp",
    backCap:"method acting, age five" },
  { name:"Ashnoor",    role:"Creative Lead",       dept:"creative",     img:"ashnoor.webp", child:"ashnoor-child.webp",
    backCap:"sunglasses: the original pair" },
  { name:"Shrey",      role:"Coverage Lead",       dept:"coverage",     img:"shrey.webp", child:"shrey-child.webp",
    backCap:"born with a camera in hand" },
  { name:"Ajay",       role:"Coverage Lead",       dept:"coverage",     img:"ajay.webp", child:"ajay-child.webp",
    backCap:"the beanie era" },
  { name:"Kinshuk",    role:"Videography Lead",    dept:"videography",  img:"kinshuk.webp", child:"kinshuk-child.webp",
    backCap:"toddler in a tracksuit, still fast" },
  { name:"Khushal",    role:"Videography Lead",    dept:"videography",  img:"khushal.webp", child:"khushal-child.webp",
    backCap:"flexing since day one" },
  { name:"Harshit",    role:"Post-Production Lead",dept:"post",         img:"harshit.webp", child:"harshit-child.webp",
    backCap:"first costume, final cut" },
  { name:"Rojleena",   role:"Events Lead",         dept:"events",       img:"rojleena.webp", child:"rojleena-child.webp",
    backCap:"already hosting the goats" },
  { name:"Daksha",     role:"Events Lead",         dept:"events",       img:"daksha.webp", child:"daksha-child.webp",
    backCap:"laugh track: pre-installed" },
  { name:"Hemant",     role:"PR Lead",             dept:"pr",           img:"hemant.webp", child:"hemant-child.webp",
    backCap:"steps before the spotlight" },
  { name:"Stanzin",    role:"PR Lead",             dept:"pr",           img:"stanzin.webp", child:"stanzin-child.webp",
    backCap:"first ride, zero license" },
  { name:"Ariv",       role:"Treasurer",           dept:"treasury",     img:"ariv.webp", child:"ariv-child.webp",
    backCap:"the treasurer, pre-finance" },
  { name:"Nirmit",     role:"Treasurer",           dept:"treasury",     img:null,
    back:{ type:"quote", text:"The budget balances. Eventually.", tag:"frame pending · send a photo" } },
  { name:"Mukul",      role:"Webdev Lead",         dept:"webdev",       img:"mukul.webp",
    back:{ type:"quote", text:"This website is my polaroid.", tag:"shot & developed by the webdev lead" } },
];

const DEPTS = [
  ["all","ALL"],["coordination","COORDINATION"],["creative","CREATIVE"],["coverage","COVERAGE"],
  ["videography","VIDEOGRAPHY"],["post","POST-PRODUCTION"],["events","EVENTS"],
  ["pr","PR"],["treasury","TREASURY"],["webdev","WEBDEV"],
];

const GALLERY = [
  { src:"assets/gallery/frame-01.webp", cap:"ROLL 001 · FR 01 — the auditorium, mid-soundcheck" },
  { src:"assets/gallery/frame-02.webp", cap:"ROLL 001 · FR 02 — red corridor, exit stage left" },
  { src:"assets/gallery/frame-03.webp", cap:"ROLL 001 · FR 03 — golden hour, location scout" },
  { src:"assets/gallery/frame-04.webp", cap:"ROLL 001 · FR 04 — arms wide, mountains calling" },
  { src:"assets/gallery/frame-05.webp", cap:"ROLL 001 · FR 05 — the old balcony, quiet frame" },
];

const CREDITS = [
  ["COVERAGE",      "the ones who never blink — every fest, every frame"],
  ["VIDEOGRAPHY",   "motion, memory, and the occasional 4K render at 3 AM"],
  ["CREATIVE",      "posters, identities, and ideas that refuse to be boring"],
  ["POST-PRODUCTION","where the footage becomes the story"],
  ["EVENTS",        "we make the moments worth shooting"],
  ["PR",            "the voice between the lens and the crowd"],
  ["TREASURY",      "keeping the rolls funded and the lights on"],
  ["WEBDEV",        "this website, obviously"],
];

const SHOOT_CAPTIONS = [
  "unrepeatable","the light was doing that thing","frame it before it's gone",
  "2 AM, worth it","no flash, all nerve","the decisive moment","shot on instinct",
  "grain is a feature","someone said 'one more'","this one's going in the zine",
  "focus locked","the campus, mid-breath",
];

/* ---------- utils ---------- */
const $  = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;
const hasGsap = typeof window.gsap !== "undefined";
const rand = (a,b) => a + Math.random()*(b-a);
const pick = arr => arr[Math.floor(Math.random()*arr.length)];

function toast(msg, ms=2600){
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(()=>t.classList.remove("show"), ms);
}

/* ---------- smooth scroll ---------- */
let lenis = null;
if (hasGsap && !reduced && typeof Lenis !== "undefined"){
  lenis = new Lenis({ lerp:.09, wheelMultiplier:1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
}
function scrollTo(target){
  if (lenis) lenis.scrollTo(target, { offset:0, duration:1.4 });
  else $(target)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
}

/* ---------- shutter sound (WebAudio, no assets) ---------- */
let audioCtx = null, soundOn = localStorage.getItem("tasveer_sound") !== "off";
function shutterSound(){
  if (!soundOn) return;
  try{
    audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
    const ctx = audioCtx, t = ctx.currentTime;
    // mirror slap: short filtered noise burst
    const buf = ctx.createBuffer(1, ctx.sampleRate*0.09, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i=0;i<d.length;i++) d[i] = (Math.random()*2-1) * Math.pow(1-i/d.length, 2.2);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=2600; bp.Q.value=.8;
    const g = ctx.createGain(); g.gain.setValueAtTime(.5, t); g.gain.exponentialRampToValueAtTime(.001, t+.09);
    src.connect(bp).connect(g).connect(ctx.destination); src.start(t);
    // curtain click
    const o = ctx.createOscillator(); o.type="square"; o.frequency.setValueAtTime(140, t+.05);
    const og = ctx.createGain(); og.gain.setValueAtTime(.12, t+.05); og.gain.exponentialRampToValueAtTime(.001, t+.1);
    o.connect(og).connect(ctx.destination); o.start(t+.05); o.stop(t+.11);
  }catch(e){}
}
const soundBtn = $("#soundToggle");
function paintSound(){ soundBtn.setAttribute("aria-pressed", String(soundOn)); }
soundBtn.addEventListener("click", ()=>{
  soundOn = !soundOn;
  localStorage.setItem("tasveer_sound", soundOn ? "on":"off");
  paintSound(); if (soundOn) shutterSound();
});
paintSound();

/* ---------- intro ---------- */
const intro = $("#intro");
function heroEntrance(){
  if (!hasGsap || reduced){ return; }
  gsap.fromTo(".hero-word .letter", { yPercent:120, rotate:6 },
    { yPercent:0, rotate:0, duration:1, stagger:.055, ease:"power4.out" });
  gsap.fromTo([".hero-sub",".hero-shoot",".hero-scroll",".hud-tl",".hud-tr",".hud-rec",".vf-corners span"],
    { opacity:0, y:14 }, { opacity:1, y:0, duration:.9, stagger:.05, ease:"power3.out", delay:.35 });
}
function splitHeroWord(){
  const w = $("#heroWord");
  w.innerHTML = [...w.textContent].map(ch=>`<span class="letter">${ch}</span>`).join("");
}
splitHeroWord();

function endIntro(){
  intro.classList.add("done");
  sessionStorage.setItem("tasveer_intro_seen","1");
  heroEntrance();
}
if (reduced || sessionStorage.getItem("tasveer_intro_seen") || !hasGsap){
  endIntro();
} else {
  let n = 3;
  const cnt = $("#introCount");
  const iv = setInterval(()=>{
    n--; if (n<=0){ clearInterval(iv); openShutter(); } else cnt.textContent = n;
  }, 380);
  function openShutter(){
    intro.classList.add("open");
    shutterSound();
    setTimeout(endIntro, 760);
  }
  const skip = ()=>{ clearInterval(iv); openShutter(); intro.removeEventListener("click", skip); };
  intro.addEventListener("click", skip);
  setTimeout(()=>{ if (!intro.classList.contains("done")){ clearInterval(iv); openShutter(); } }, 2600);
}

/* ---------- custom cursor ---------- */
if (finePointer && !reduced){
  document.body.classList.add("has-cursor");
  const cur = $(".cursor"), label = $(".cursor-label");
  let mx=innerWidth/2, my=innerHeight/2, cx=mx, cy=my;
  addEventListener("mousemove", e=>{ mx=e.clientX; my=e.clientY; });
  addEventListener("mousedown", ()=>cur.classList.add("is-down"));
  addEventListener("mouseup", ()=>cur.classList.remove("is-down"));
  if (hasGsap) gsap.ticker.add(()=>{
    cx += (mx-cx)*.2; cy += (my-cy)*.2;
    cur.style.transform = `translate3d(${cx}px,${cy}px,0)`;
  });
  document.addEventListener("mouseover", e=>{
    const t = e.target.closest("[data-cursor], a, button, .frame, .polaroid");
    if (t){
      cur.classList.add("is-active");
      label.textContent = t.dataset.cursor ||
        (t.classList.contains("polaroid") ? "FLIP" :
         t.classList.contains("frame") ? "OPEN" : "GO");
    } else if (e.target.closest(".hero")){
      cur.classList.add("is-active"); label.textContent = "SHOOT";
    } else {
      cur.classList.remove("is-active");
    }
  });
}

/* ---------- nav ---------- */
const nav = $("#nav");
let lastY = 0;
function onScrollY(y){
  nav.classList.toggle("scrolled", y > 40);
  if (y > 300 && y > lastY + 6) nav.classList.add("hidden");
  else if (y < lastY - 6 || y < 300) nav.classList.remove("hidden");
  lastY = y;
}
if (lenis) lenis.on("scroll", ({scroll}) => onScrollY(scroll));
else addEventListener("scroll", ()=>onScrollY(scrollY), {passive:true});

const burger = $("#burger"), menu = $("#mobileMenu");
function setMenu(open){
  burger.setAttribute("aria-expanded", String(open));
  menu.classList.toggle("open", open);
  menu.setAttribute("aria-hidden", String(!open));
  if (lenis) open ? lenis.stop() : lenis.start();
}
burger.addEventListener("click", ()=>setMenu(!menu.classList.contains("open")));
$$(".mobile-links a").forEach(a=>a.addEventListener("click", e=>{
  e.preventDefault(); setMenu(false); scrollTo(a.getAttribute("href"));
}));
$$(".nav-links a").forEach(a=>a.addEventListener("click", e=>{
  e.preventDefault(); scrollTo(a.getAttribute("href"));
}));

/* ---------- rail ---------- */
const railFrame = $("#railFrame"), railSection = $("#railSection");
$$("main section[data-frame]").forEach(sec=>{
  if (!hasGsap) return;
  ScrollTrigger.create({
    trigger:sec, start:"top 55%", end:"bottom 55%",
    onToggle(self){
      if (self.isActive){
        railFrame.textContent = sec.dataset.frame;
        railSection.textContent = sec.dataset.section;
      }
    }
  });
});

/* ---------- ticker ---------- */
const tickerItems = "35MM <i>·</i> ƒ/1.8 <i>·</i> ISO 400 <i>·</i> TASVEER <i>·</i> IIIT DELHI <i>·</i> SHOOT FIRST <i>·</i> DEVELOP LATER <i>·</i> ";
$("#tickerTrack").innerHTML = `<span>${tickerItems.repeat(4)}</span><span>${tickerItems.repeat(4)}</span>`;
if (hasGsap && !reduced){
  gsap.to("#tickerTrack", { xPercent:-50, duration:36, ease:"none", repeat:-1 });
}

/* ---------- hero: click to shoot ---------- */
const hero = $("#hero"), flash = $("#flash"), tray = $("#tray");
let exp = parseInt(sessionStorage.getItem("tasveer_exp")||"0",10);
let roll = parseInt(sessionStorage.getItem("tasveer_roll")||"1",10);
const expEl = $("#expCount"), rollEl = $("#rollCount");
function paintCounter(){
  expEl.textContent = String(exp).padStart(2,"0");
  rollEl.textContent = String(roll).padStart(3,"0");
  sessionStorage.setItem("tasveer_exp", exp);
  sessionStorage.setItem("tasveer_roll", roll);
}
paintCounter();

const shootPool = [
  ...GALLERY.map(g=>({ src:g.src, cap:g.cap })),
  ...TEAM.filter(t=>t.img).map(t=>({ src:`assets/team/${t.img}`, cap:`${t.name.toLowerCase()} — ${t.role.toLowerCase()}` })),
];

function ejectPolaroid(item){
  const fig = document.createElement("figure");
  fig.className = "tray-polaroid";
  fig.style.setProperty("--rot", `${rand(-6,6).toFixed(1)}deg`);
  fig.innerHTML = `<img src="${item.src}" alt="Your shot: ${item.cap}"><figcaption>${item.cap}</figcaption>`;
  fig.addEventListener("click", ev=>{ ev.stopPropagation(); openLightbox([item], 0); });
  tray.appendChild(fig);
  if (hasGsap && !reduced){
    gsap.fromTo(fig, { yPercent:150, y:0, rotate:rand(-14,14) },
      { yPercent:0, y:0, rotate:rand(-4,4), duration:.9, ease:"back.out(1.6)" });
  }
  while (tray.children.length > CONFIG.traySize){
    const old = tray.firstElementChild;
    if (hasGsap && !reduced){
      gsap.to(old, { yPercent:160, opacity:0, duration:.45, ease:"power2.in", onComplete:()=>old.remove() });
      // detach immediately so count stays bounded
      old.style.pointerEvents = "none";
      if (tray.children.length > CONFIG.traySize + 2) old.remove();
    } else old.remove();
  }
}

function shoot(){
  if (exp >= CONFIG.maxExposures){
    exp = 0; roll++;
    toast(`ROLL ${String(roll-1).padStart(3,"0")} COMPLETE — FRESH ROLL LOADED`);
  }
  exp++; paintCounter();
  shutterSound();
  if (hasGsap && !reduced){
    gsap.fromTo(flash, { opacity:.85 }, { opacity:0, duration:.4, ease:"power2.out" });
    gsap.fromTo(".hero-word", { scale:1.012 }, { scale:1, duration:.5, ease:"elastic.out(1,.5)" });
  }
  ejectPolaroid(pick(shootPool));
}
hero.addEventListener("click", e=>{
  if (e.target.closest("a, button, .tray-polaroid")) return;
  shoot();
});

/* ---------- manifesto + section reveals ----------
   Pattern: content is visible by default; entrance animations fire on
   scroll-enter. If a trigger is ever missed (instant jump, deep link),
   nothing stays hidden. */
function revealOnEnter(trigger, targets, fromVars, toVars){
  if (!hasGsap || reduced) return;
  ScrollTrigger.create({
    trigger, start:"top 82%", once:true,
    onEnter: () => gsap.fromTo(targets, fromVars, toVars),
    onRefresh: self => { if (self.progress > 0 && self.progress < 1) gsap.set(targets, {...toVars, opacity:1, y:0, yPercent:0, rotate:0, scale:1}); }
  });
}
revealOnEnter(".manifesto", ".manifesto .line > span",
  { yPercent:110 }, { yPercent:0, duration:1.1, stagger:.14, ease:"power4.out" });
revealOnEnter(".about-cols", ".about-body, .about-specs li",
  { opacity:0, y:24 }, { opacity:1, y:0, duration:.8, stagger:.07, ease:"power3.out" });
revealOnEnter(".join", ".join-title, .join-sub, .join-ctas, .join-mail",
  { opacity:0, y:36 }, { opacity:1, y:0, duration:.9, stagger:.1, ease:"power3.out" });

/* ---------- gallery ---------- */
const stripFrames = $("#stripFrames");
GALLERY.forEach((g,i)=>{
  const b = document.createElement("button");
  b.className = "frame"; b.dataset.index = i;
  b.setAttribute("aria-label", `Open frame ${i+1}: ${g.cap}`);
  b.innerHTML = `
    <div class="frame-img-wrap">
      <span class="frame-tag">UNDEVELOPED</span>
      <img src="${g.src}" alt="${g.cap}" loading="lazy">
      <span class="frame-num">FR ${String(i+1).padStart(2,"0")}</span>
    </div>
    <p class="frame-cap mono">${g.cap}</p>`;
  b.addEventListener("click", ()=>openLightbox(GALLERY, i));
  b.addEventListener("mouseenter", ()=>b.classList.add("developed"));
  stripFrames.appendChild(b);
});
for (let k=0;k<2;k++){
  const a = document.createElement("a");
  a.className = "frame frame-empty";
  a.href = `mailto:${CONFIG.email}?subject=My%20frame%20for%20the%20Tasveer%20roll`;
  a.innerHTML = `
    <div class="frame-img-wrap">
      <span class="plus">+</span>
      <span class="mono">AWAITING EXPOSURE<br>your shot here — write to us</span>
    </div>
    <p class="frame-cap mono">ROLL 001 · FR ${String(GALLERY.length+k+1).padStart(2,"0")} — PENDING</p>`;
  stripFrames.appendChild(a);
}

const strip = $("#strip"), stripViewport = $("#stripViewport");
function developVisibleFrames(){
  const mid = innerWidth/2;
  $$(".frame:not(.frame-empty)").forEach(f=>{
    const r = f.getBoundingClientRect();
    if (r.left < mid && r.right > mid*0.4) f.classList.add("developed");
  });
}
function nativeStrip(){
  stripViewport.style.overflowX = "auto";
  stripViewport.style.scrollSnapType = "x mandatory";
  $$(".frame").forEach(f=>f.style.scrollSnapAlign="center");
  const io = new IntersectionObserver(es=>es.forEach(en=>{
    if (en.isIntersecting) en.target.classList.add("developed");
  }), { root:stripViewport, threshold:.5 });
  $$(".frame:not(.frame-empty)").forEach(f=>io.observe(f));
  return () => io.disconnect();
}
if (hasGsap && !reduced){
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    const dist = () => Math.max(0, strip.scrollWidth - stripViewport.clientWidth);
    const tween = gsap.to(strip, {
      x: () => -dist(),
      ease:"none",
      scrollTrigger:{
        trigger:".gallery",
        start:"top top",
        end: () => "+=" + (dist() + innerHeight*.4),
        pin:true,
        scrub:.6,
        invalidateOnRefresh:true,
        onUpdate: developVisibleFrames,
      }
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); gsap.set(strip,{x:0}); };
  });
  mm.add("(max-width: 900px)", () => nativeStrip());
} else {
  nativeStrip();
}

/* ---------- lightbox ---------- */
const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
let lbItems = [], lbIndex = 0, lbLastFocus = null;
function openLightbox(items, index){
  lbItems = items; lbIndex = index; lbLastFocus = document.activeElement;
  paintLb();
  lb.hidden = false;
  requestAnimationFrame(()=>lb.classList.add("show"));
  if (lenis) lenis.stop();
  $("#lbClose").focus();
}
function paintLb(){
  const it = lbItems[lbIndex];
  lbImg.src = it.src; lbImg.alt = it.cap; lbCap.textContent = it.cap;
  $("#lbPrev").style.visibility = lbItems.length>1 ? "visible":"hidden";
  $("#lbNext").style.visibility = lbItems.length>1 ? "visible":"hidden";
}
function closeLightbox(){
  lb.classList.remove("show");
  setTimeout(()=>{ lb.hidden = true; }, 300);
  if (lenis) lenis.start();
  lbLastFocus?.focus?.();
}
$("#lbClose").addEventListener("click", closeLightbox);
$("#lbPrev").addEventListener("click", ()=>{ lbIndex=(lbIndex-1+lbItems.length)%lbItems.length; paintLb(); });
$("#lbNext").addEventListener("click", ()=>{ lbIndex=(lbIndex+1)%lbItems.length; paintLb(); });
lb.addEventListener("click", e=>{ if (e.target===lb) closeLightbox(); });
addEventListener("keydown", e=>{
  if (lb.hidden) return;
  if (e.key==="Escape") closeLightbox();
  if (e.key==="ArrowLeft") $("#lbPrev").click();
  if (e.key==="ArrowRight") $("#lbNext").click();
});

/* ---------- team wall ---------- */
const wall = $("#polaroidWall"), filters = $("#crewFilters");
DEPTS.forEach(([key,label],i)=>{
  const c = document.createElement("button");
  c.className = "chip" + (i===0 ? " active":"");
  c.textContent = label; c.dataset.dept = key;
  c.addEventListener("click", ()=>{
    $$(".chip").forEach(x=>x.classList.remove("active"));
    c.classList.add("active");
    $$(".polaroid").forEach(p=>{
      const show = key==="all" || p.dataset.dept===key;
      p.classList.toggle("filtered-out", !show);
      if (show && hasGsap && !reduced) gsap.fromTo(p, {opacity:0, y:18}, {opacity:1, y:0, duration:.5, ease:"power3.out"});
    });
  });
  filters.appendChild(c);
});

TEAM.forEach((t,i)=>{
  const b = document.createElement("button");
  b.className = "polaroid"; b.dataset.dept = t.dept;
  b.setAttribute("aria-pressed","false");
  b.setAttribute("aria-label", `${t.name}, ${t.role}. Activate to flip the polaroid.`);
  const rot = ((i*7)%9)-4, tapeRot = (i%2? -3:2);
  b.style.setProperty("--rot", `${rot}deg`);
  b.style.setProperty("--tape-rot", `${tapeRot}deg`);

  const frontPhoto = t.img
    ? `<img src="assets/team/${t.img}" alt="Portrait of ${t.name}" loading="lazy">`
    : `<div class="photo-pending"><span class="aperture-big">◉</span><span>FRAME PENDING</span></div>`;

  let back;
  if (t.child){
    back = `<div class="polaroid-face polaroid-back">
      <div class="polaroid-photo"><img src="assets/team/${t.child}" alt="${t.name} as a kid" loading="lazy"></div>
      <p class="polaroid-back-cap">${t.backCap || "frame zero — before Tasveer had a name"}<small>FRAME 00 · ${t.name}</small></p>
    </div>`;
  } else if (t.back?.type === "quote"){
    back = `<div class="polaroid-face polaroid-back"><div class="quote-back">
      <p>“${t.back.text}”</p><small>${t.back.tag}</small>
    </div></div>`;
  } else {
    back = `<div class="polaroid-face polaroid-back"><div class="quote-back">
      <p>“${t.name} — ${t.role}.”</p><small>frame pending</small>
    </div></div>`;
  }

  b.innerHTML = `<div class="polaroid-inner">
    <div class="polaroid-face polaroid-front">
      <div class="polaroid-photo">${frontPhoto}</div>
      <div class="polaroid-meta"><p class="polaroid-name">${t.name}</p><p class="polaroid-role">${t.role}</p></div>
    </div>${back}</div>`;

  b.addEventListener("click", ()=>{
    b.classList.toggle("flipped");
    b.setAttribute("aria-pressed", String(b.classList.contains("flipped")));
    if (soundOn) shutterSound();
  });
  wall.appendChild(b);
});

revealOnEnter(".polaroid-wall", ".polaroid",
  { opacity:0, y:40, rotate:()=>rand(-8,8) },
  { opacity:1, y:0, rotate:0, duration:.8, stagger:.05, ease:"power3.out" });

/* ---------- credits ---------- */
const creditsRoll = $("#creditsRoll");
const creditsFooter = $(".credits-footer");
CREDITS.forEach(([dept,desc])=>{
  const row = document.createElement("div");
  row.className = "credit-row";
  row.innerHTML = `<span class="credit-dept">${dept}</span><span class="credit-desc">${desc}</span>`;
  creditsRoll.insertBefore(row, creditsFooter);
});
revealOnEnter(".credits-roll", ".credit-row",
  { opacity:0, y:26 }, { opacity:1, y:0, duration:.7, stagger:.09, ease:"power3.out" });

/* ---------- magnetic join button ---------- */
const mag = $("#joinBtn");
if (finePointer && hasGsap && !reduced){
  mag.addEventListener("mousemove", e=>{
    const r = mag.getBoundingClientRect();
    gsap.to(mag, { x:(e.clientX-r.left-r.width/2)*.25, y:(e.clientY-r.top-r.height/2)*.35, duration:.4, ease:"power3.out" });
  });
  mag.addEventListener("mouseleave", ()=>gsap.to(mag, { x:0, y:0, duration:.6, ease:"elastic.out(1,.4)" }));
}

/* ---------- instagram config ---------- */
if (CONFIG.instagram){
  const ib = $("#instaBtn");
  ib.href = CONFIG.instagram; ib.hidden = false;
  ib.target = "_blank"; ib.rel = "noopener";
}

/* ---------- rewind ---------- */
$("#rewindBtn").addEventListener("click", ()=>{
  scrollTo("#hero");
  toast("◀◀ REWINDING…");
});

/* ---------- darkroom easter egg ---------- */
let logoClicks = 0, logoTimer = null;
$("#logoBtn").addEventListener("click", ()=>{
  logoClicks++;
  clearTimeout(logoTimer);
  logoTimer = setTimeout(()=>logoClicks=0, 1800);
  if (logoClicks >= 5){
    logoClicks = 0;
    document.body.classList.toggle("darkroom");
    toast(document.body.classList.contains("darkroom")
      ? "DARKROOM MODE — SAFELIGHT ON. HANDLE WITH CARE."
      : "LIGHTS ON. BACK TO THE VIEWFINDER.");
    shutterSound();
  } else if (logoClicks === 1){
    scrollTo("#hero");
  }
});

/* ---------- refresh on resize ---------- */
let rT;
addEventListener("resize", ()=>{
  clearTimeout(rT);
  rT = setTimeout(()=>{ if (hasGsap) ScrollTrigger.refresh(); }, 250);
});