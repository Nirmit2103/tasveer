/* TASVEER — DARKROOM v2 · interaction engine
   Content lives in js/data.js (window.TASVEER_DATA). */
const D = window.TASVEER_DATA;
const CONFIG = D.CONFIG, TEAM = D.TEAM, DEPTS = D.DEPTS, GALLERY = D.GALLERY, CREDITS = D.CREDITS;

const $  = (s,c=document)=>c.querySelector(s);
const $$ = (s,c=document)=>[...c.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;
const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
const rand = (a,b)=>a+Math.random()*(b-a);
const pick = a=>a[Math.floor(Math.random()*a.length)];
const esc = s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function toast(msg,ms=2600){
  const t=$("#toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove("show"),ms);
}

/* smooth scroll */
let lenis=null;
if (hasGsap && !reduced && typeof Lenis!=="undefined"){
  lenis=new Lenis({lerp:.09});
  lenis.on("scroll",ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
}
function scrollTo(target){
  if (lenis) lenis.scrollTo(target,{duration:1.4});
  else $(target)?.scrollIntoView({behavior:reduced?"auto":"smooth"});
}

/* shutter sound */
let audioCtx=null, soundOn=localStorage.getItem("tasveer_sound")!=="off";
function shutterSound(){
  if(!soundOn) return;
  try{
    audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
    const ctx=audioCtx,t=ctx.currentTime;
    if(ctx.state==="suspended") ctx.resume();
    const buf=ctx.createBuffer(1,ctx.sampleRate*.09,ctx.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2.2);
    const src=ctx.createBufferSource(); src.buffer=buf;
    const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=2600; bp.Q.value=.8;
    const g=ctx.createGain(); g.gain.setValueAtTime(.5,t); g.gain.exponentialRampToValueAtTime(.001,t+.09);
    src.connect(bp).connect(g).connect(ctx.destination); src.start(t);
    const o=ctx.createOscillator(); o.type="square"; o.frequency.setValueAtTime(140,t+.05);
    const og=ctx.createGain(); og.gain.setValueAtTime(.12,t+.05); og.gain.exponentialRampToValueAtTime(.001,t+.1);
    o.connect(og).connect(ctx.destination); o.start(t+.05); o.stop(t+.11);
  }catch(e){}
}
const soundBtn=$("#soundToggle");
const paintSound=()=>soundBtn.setAttribute("aria-pressed",String(soundOn));
soundBtn.addEventListener("click",()=>{soundOn=!soundOn;localStorage.setItem("tasveer_sound",soundOn?"on":"off");paintSound();if(soundOn)shutterSound();});
paintSound();

/* ---------- academy leader intro ---------- */
const intro=$("#intro");
function splitHeroWord(){
  const w=$("#heroWord");
  w.innerHTML=[...w.textContent].map(ch=>`<span class="letter">${ch}</span>`).join("");
}
splitHeroWord();
function heroEntrance(){
  const w=$("#heroWord");
  const develop=()=>{ w.classList.add("developed"); gsap.set(".hero-word .letter",{clearProps:"transform"}); };
  if(!hasGsap||reduced){ w.classList.add("developed"); return; }
  gsap.fromTo(".hero-word .letter",{yPercent:120,rotate:6},
    {yPercent:0,rotate:0,duration:1,stagger:.055,ease:"power4.out",onComplete:develop});
  gsap.fromTo([".hero-sub",".hero-shoot",".hero-scroll",".hud-tl",".hud-meta",".hud-af",".hud-tr",".hud-rec",".vf-corners span"],
    {opacity:0,y:14},{opacity:1,y:0,duration:.9,stagger:.05,ease:"power3.out",delay:.35});
}
function endIntro(){
  intro.classList.add("done");
  sessionStorage.setItem("tasveer_intro_seen","1");
  heroEntrance();
}
if (reduced || sessionStorage.getItem("tasveer_intro_seen") || !hasGsap){
  endIntro();
} else {
  let n=3; const num=$("#leaderNum");
  const iv=setInterval(()=>{ n--; if(n<=0){clearInterval(iv);openLeader();} else num.textContent=n; },420);
  function openLeader(){
    if(intro.classList.contains("open")||intro.classList.contains("done")) return;
    intro.classList.add("open"); shutterSound();
    setTimeout(endIntro,520);
  }
  intro.addEventListener("click",()=>{clearInterval(iv);openLeader();},{once:true});
  setTimeout(()=>{ if(!intro.classList.contains("done")){clearInterval(iv);openLeader();} },2800);
}

/* ---------- cursor ---------- */
if (finePointer && !reduced){
  document.body.classList.add("has-cursor");
  const cur=$(".cursor"),label=$(".cursor-label");
  let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my;
  addEventListener("mousemove",e=>{mx=e.clientX;my=e.clientY;});
  if (hasGsap) gsap.ticker.add(()=>{cx+=(mx-cx)*.2;cy+=(my-cy)*.2;cur.style.transform=`translate3d(${cx}px,${cy}px,0)`;cur.classList.toggle("edge",cx>innerWidth-80);});
  document.addEventListener("mouseover",e=>{
    const t=e.target.closest("[data-cursor],a,button,.frame,.polaroid");
    if(t){cur.classList.add("is-active");label.textContent=t.dataset.cursor||(t.classList.contains("polaroid")?"FLIP":t.classList.contains("frame")?"OPEN":"GO");}
    else if(e.target.closest(".hero")){cur.classList.add("is-active");label.textContent="SHOOT";}
    else cur.classList.remove("is-active");
  });
}

/* ---------- nav ---------- */
const nav=$("#nav"); let lastY=0;
function onScrollY(y){
  nav.classList.toggle("scrolled",y>40);
  if(y>300&&y>lastY+6) nav.classList.add("hidden");
  else if(y<lastY-6||y<300) nav.classList.remove("hidden");
  lastY=y;
}
if(lenis) lenis.on("scroll",({scroll})=>onScrollY(scroll));
else addEventListener("scroll",()=>onScrollY(scrollY),{passive:true});
const burger=$("#burger"),menu=$("#mobileMenu");
function setMenu(open){
  burger.setAttribute("aria-expanded",String(open));
  menu.classList.toggle("open",open);
  menu.setAttribute("aria-hidden",String(!open));
  if(lenis) open?lenis.stop():lenis.start();
  else document.body.style.overflow=open?"hidden":"";
  if(open) requestAnimationFrame(()=>menu.querySelector("a")?.focus());
}
burger.addEventListener("click",()=>setMenu(!menu.classList.contains("open")));
menu.addEventListener("keydown",e=>{
  if(e.key==="Escape"){ setMenu(false); burger.focus(); }
  if(e.key==="Tab"){
    const links=$$(".mobile-links a",menu);
    const i=links.indexOf(document.activeElement);
    e.preventDefault();
    const n=e.shiftKey?(i<=0?links.length-1:i-1):(i+1)%links.length;
    links[n].focus();
  }
});
$$(".mobile-links a").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();setMenu(false);scrollTo(a.getAttribute("href"));}));
$$(".nav-links a").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();scrollTo(a.getAttribute("href"));}));

/* ---------- rail ---------- */
const railFrame=$("#railFrame"),railSection=$("#railSection");
$$("main section[data-frame]").forEach(sec=>{
  if(!hasGsap) return;
  ScrollTrigger.create({trigger:sec,start:"top 55%",end:"bottom 55%",
    onToggle(self){ if(self.isActive){railFrame.textContent=sec.dataset.frame;railSection.textContent=sec.dataset.section;} }});
});

/* ---------- ticker + edge print ---------- */
const tickerItems="35MM <i>·</i> ƒ/1.8 <i>·</i> ISO 400 <i>·</i> TASVEER <i>·</i> IIIT DELHI <i>·</i> SHOOT FIRST <i>·</i> DEVELOP LATER <i>·</i> ";
$("#tickerTrack").innerHTML=`<span>${tickerItems.repeat(4)}</span><span>${tickerItems.repeat(4)}</span>`;
let tickerTween=null;
if(hasGsap&&!reduced) tickerTween=gsap.to("#tickerTrack",{xPercent:-50,duration:36,ease:"none",repeat:-1});

/* ---------- ambient motion toggle (WCAG 2.2.2) ---------- */
let motionOn=localStorage.getItem("tasveer_motion")!=="off";
const motionBtn=$("#motionToggle");
function applyMotion(){
  document.body.classList.toggle("calm",!motionOn);
  motionBtn.setAttribute("aria-pressed",String(motionOn));
  if(tickerTween) motionOn?tickerTween.play():tickerTween.pause();
}
motionBtn.addEventListener("click",()=>{
  motionOn=!motionOn;
  localStorage.setItem("tasveer_motion",motionOn?"on":"off");
  applyMotion();
});
applyMotion();
const edge="TASVEER 400C ▸ COLOR ▸ PROCESS BEFORE 2027 ▸ ";
$$(".strip-edgeprint").forEach(el=>el.textContent=edge.repeat(8));

/* ---------- hero: click to shoot ---------- */
const hero=$("#hero"),flash=$("#flash"),tray=$("#tray");
let exp=parseInt(sessionStorage.getItem("tasveer_exp")||"0",10);
let roll=parseInt(sessionStorage.getItem("tasveer_roll")||"1",10);
const expEl=$("#expCount"),rollEl=$("#rollCount");
function paintCounter(){
  expEl.textContent=String(exp).padStart(2,"0");
  rollEl.textContent=String(roll).padStart(3,"0");
  sessionStorage.setItem("tasveer_exp",exp); sessionStorage.setItem("tasveer_roll",roll);
}
paintCounter();
const shootPool=[
  ...GALLERY.map(g=>({src:g.src,cap:g.cap})),
  ...TEAM.filter(t=>t.img).map(t=>({src:`assets/team/${t.img}`,cap:`${t.name.toLowerCase()} — ${t.role.toLowerCase()}`})),
];
function ejectPolaroid(item){
  const fig=document.createElement("figure");
  fig.className="tray-polaroid";
  fig.innerHTML=`<img src="${esc(item.src)}" alt="Your shot: ${esc(item.cap)}"><figcaption>${esc(item.cap)}</figcaption>`;
  fig.addEventListener("click",ev=>{ev.stopPropagation();openLightbox([item],0);});
  tray.appendChild(fig);
  if(hasGsap&&!reduced){
    gsap.fromTo(fig,{yPercent:150,y:0,rotate:rand(-14,14)},{yPercent:0,y:0,rotate:rand(-4,4),duration:.9,ease:"back.out(1.6)"});
  }
  // bound the tray WITHOUT async removal inside the loop (freeze bug):
  // mark leaving prints absolute (out of flex flow) and remove on animation end.
  const active=[...tray.children].filter(c=>!c.classList.contains("leaving"));
  while(active.length>CONFIG.traySize){
    const old=active.shift();
    old.classList.add("leaving");
    old.style.pointerEvents="none";
    if(hasGsap&&!reduced){
      old.style.position="absolute"; old.style.bottom="0";
      gsap.to(old,{yPercent:160,opacity:0,duration:.45,ease:"power2.in",onComplete:()=>old.remove()});
    } else old.remove();
  }
}
let lastFlash=0;
function shoot(){
  if(exp>=CONFIG.maxExposures){exp=0;roll++;toast(`ROLL ${String(roll-1).padStart(3,"0")} COMPLETE — FRESH ROLL LOADED`);}
  exp++; paintCounter(); shutterSound();
  const now=performance.now();
  if(hasGsap&&!reduced&&now-lastFlash>250){
    lastFlash=now;
    gsap.fromTo(flash,{opacity:.6},{opacity:0,duration:.4,ease:"power2.out"});
    gsap.fromTo(".hero-word",{scale:1.012},{scale:1,duration:.5,ease:"elastic.out(1,.5)"});
  }
  ejectPolaroid(pick(shootPool));
  if(exp===1 && !sessionStorage.getItem("tasveer_first_shot")){
    sessionStorage.setItem("tasveer_first_shot","1");
    setTimeout(()=>toast("NICE SHOT — IT LANDED IN YOUR TRAY ↓ TAP IT TO INSPECT.",3200),900);
  }
  if(exp===3 && !sessionStorage.getItem("tasveer_egg_hint")){
    sessionStorage.setItem("tasveer_egg_hint","1");
    setTimeout(()=>toast("THE APERTURE LOGO KEEPS A SECRET — FIVE CLICKS.",3400),1200);
  }
}
hero.addEventListener("click",e=>{ if(e.target.closest("a,button,.tray-polaroid")) return; shoot(); });

/* ---------- reveals (visible-by-default) ---------- */
function revealOnEnter(trigger,targets,fromVars,toVars){
  if(!hasGsap||reduced) return;
  ScrollTrigger.create({trigger,start:"top 82%",once:true,
    onEnter:()=>gsap.fromTo(targets,fromVars,toVars),
    onRefresh:self=>{ if(self.progress>0&&self.progress<1) gsap.set(targets,{...toVars,opacity:1,y:0,yPercent:0,rotate:0,scale:1}); }});
}
revealOnEnter(".manifesto",".manifesto .line > span",{yPercent:110},{yPercent:0,duration:1.1,stagger:.14,ease:"power4.out"});
revealOnEnter(".about-cols",".about-body,.about-specs li",{opacity:0,y:24},{opacity:1,y:0,duration:.8,stagger:.07,ease:"power3.out"});
revealOnEnter(".join",".join-title,.join-sub,.join-ctas,.join-mail",{opacity:0,y:36},{opacity:1,y:0,duration:.9,stagger:.1,ease:"power3.out"});

/* ---------- mini contact strip ---------- */
const mini=$("#miniStrip");
[GALLERY[1],GALLERY[2],GALLERY[4]].forEach(g=>{
  const d=document.createElement("div"); d.className="mini-frame";
  d.innerHTML=`<img src="${g.src}" alt="" loading="lazy">`;
  mini.appendChild(d);
});

/* ---------- gallery ---------- */
const stripFrames=$("#stripFrames");
GALLERY.forEach((g,i)=>{
  const b=document.createElement("button");
  b.className="frame"; b.dataset.index=i;
  b.setAttribute("aria-label",`Open frame ${i+1}: ${g.cap}`);
  b.innerHTML=`
    <div class="frame-img-wrap">
      <img src="${esc(g.src)}" alt="${esc(g.cap)}" loading="lazy">
      <div class="frame-fluid"></div>
      <span class="frame-tag">DEVELOPING 0:00</span>
      <span class="frame-num">FR ${String(i+1).padStart(2,"0")} ▸</span>
    </div>
    <p class="frame-cap mono">${esc(g.cap)}</p>`;
  b.addEventListener("click",()=>openLightbox(GALLERY,i));
  b.addEventListener("mouseenter",()=>developFrame(b));
  stripFrames.appendChild(b);
});
for(let k=0;k<2;k++){
  const a=document.createElement("a");
  a.className="frame frame-empty";
  a.href=`mailto:${CONFIG.email}?subject=My%20frame%20for%20the%20Tasveer%20roll`;
  a.innerHTML=`
    <div class="frame-img-wrap"><span class="plus">+</span><span class="mono">RESERVED FOR YOU<br>join the crew — shoot this frame</span></div>
    <p class="frame-cap mono">ROLL 001 · FR ${String(GALLERY.length+k+1).padStart(2,"0")} — PENDING</p>`;
  stripFrames.appendChild(a);
}
function developFrame(f){
  if(f.classList.contains("developed")||f.classList.contains("frame-empty")) return;
  f.classList.add("developed");
  const tag=f.querySelector(".frame-tag");
  let s=0;
  const iv=setInterval(()=>{
    s++;
    if(s>=7){clearInterval(iv);tag.textContent="FIXED ▸";setTimeout(()=>{tag.style.opacity=0;},900);}
    else tag.textContent=`DEVELOPING 0:0${s}`;
  },180);
}
const strip=$("#strip"),stripViewport=$("#stripViewport");
function developVisibleFrames(){
  const mid=innerWidth/2;
  $$(".frame:not(.frame-empty)").forEach(f=>{
    const r=f.getBoundingClientRect();
    if(r.left<mid&&r.right>mid*.4) developFrame(f);
  });
}
function nativeStrip(){
  stripViewport.style.overflowX="auto";
  stripViewport.style.scrollSnapType="x mandatory";
  $$(".frame").forEach(f=>f.style.scrollSnapAlign="center");
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting)developFrame(en.target);}),{root:stripViewport,threshold:.5});
  $$(".frame:not(.frame-empty)").forEach(f=>io.observe(f));
  return ()=>{
    io.disconnect();
    stripViewport.style.overflowX="";
    stripViewport.style.scrollSnapType="";
    $$(".frame").forEach(f=>f.style.scrollSnapAlign="");
  };
}
if(hasGsap&&!reduced){
  const mm=gsap.matchMedia();
  mm.add("(min-width: 901px)",()=>{
    const dist=()=>Math.max(0,strip.scrollWidth-stripViewport.clientWidth);
    const tween=gsap.to(strip,{x:()=>-dist(),ease:"none",
      scrollTrigger:{trigger:".gallery",start:"top top",end:()=>"+="+(dist()+innerHeight*.4),pin:true,scrub:.6,invalidateOnRefresh:true,onUpdate:developVisibleFrames}});
    const off=()=>lenis?.off("scroll",developVisibleFrames);
    lenis?.on("scroll",developVisibleFrames);
    return ()=>{off();tween.scrollTrigger?.kill();tween.kill();gsap.set(strip,{x:0});};
  });
  mm.add("(max-width: 900px)",()=>nativeStrip());
} else nativeStrip();

/* first-arrival swipe cue on touch */
if(hasGsap){
  ScrollTrigger.create({trigger:".gallery",start:"top 70%",once:true,onEnter:()=>{
    if(matchMedia("(pointer: coarse)").matches && !sessionStorage.getItem("tasveer_swipe_cue")){
      sessionStorage.setItem("tasveer_swipe_cue","1");
      toast("SWIPE THE ROLL → FRAMES DEVELOP AS THEY PASS.",3000);
    }
  }});
}

/* keyboard: bring focused frames into view (pinned strip + native strip) */
stripFrames.addEventListener("focusin",e=>{
  const f=e.target.closest(".frame"); if(!f) return;
  const r=f.getBoundingClientRect();
  if(r.left>=0 && r.right<=innerWidth) return;
  const st=hasGsap ? ScrollTrigger.getAll().find(t=>t.trigger===$(".gallery") && t.pin) : null;
  if(st && st.isActive){
    const frac=(f.offsetLeft + f.offsetWidth/2) / strip.scrollWidth;
    const target=st.start + frac*(st.end-st.start);
    if(lenis) lenis.scrollTo(target,{duration:.6}); else window.scrollTo(0,target);
  } else {
    stripViewport.scrollTo({left:Math.max(0,f.offsetLeft-60),behavior:reduced?"auto":"smooth"});
  }
});

/* ---------- lightbox ---------- */
const lb=$("#lightbox"),lbImg=$("#lbImg"),lbCap=$("#lbCap");
let lbItems=[],lbIndex=0,lbLastFocus=null,lbHideTimer=null;
function openLightbox(items,index){
  clearTimeout(lbHideTimer);
  lbItems=items;lbIndex=index;lbLastFocus=document.activeElement;
  paintLb(); lb.hidden=false;
  requestAnimationFrame(()=>lb.classList.add("show"));
  if(lenis)lenis.stop(); else document.body.style.overflow="hidden";
  $("#lbClose").focus();
}
function paintLb(){
  const it=lbItems[lbIndex];
  lbImg.src=it.src; lbImg.alt=it.cap; lbCap.textContent=it.cap;
  $("#lbPrev").style.visibility=lbItems.length>1?"visible":"hidden";
  $("#lbNext").style.visibility=lbItems.length>1?"visible":"hidden";
}
function closeLightbox(){
  lb.classList.remove("show");
  clearTimeout(lbHideTimer);
  lbHideTimer=setTimeout(()=>{lb.hidden=true;},300);
  if(lenis)lenis.start(); else document.body.style.overflow="";
  lbLastFocus?.focus?.();
}
$("#lbClose").addEventListener("click",closeLightbox);
$("#lbPrev").addEventListener("click",()=>{lbIndex=(lbIndex-1+lbItems.length)%lbItems.length;paintLb();});
$("#lbNext").addEventListener("click",()=>{lbIndex=(lbIndex+1)%lbItems.length;paintLb();});
lb.addEventListener("click",e=>{if(e.target===lb)closeLightbox();});
addEventListener("keydown",e=>{
  if(lb.hidden)return;
  if(e.key==="Escape")closeLightbox();
  if(e.key==="ArrowLeft")$("#lbPrev").click();
  if(e.key==="ArrowRight")$("#lbNext").click();
  if(e.key==="Tab"){
    const f=[$("#lbClose"),$("#lbPrev"),$("#lbNext")].filter(b=>b.style.visibility!=="hidden");
    const i=f.indexOf(document.activeElement);
    e.preventDefault();
    const n=e.shiftKey?(i<=0?f.length-1:i-1):(i+1)%f.length;
    f[n].focus();
  }
});

/* ---------- team wall ---------- */
const wall=$("#polaroidWall"),filters=$("#crewFilters");
DEPTS.forEach(([key,label],i)=>{
  const c=document.createElement("button");
  c.className="chip"+(i===0?" active":""); c.textContent=label; c.dataset.dept=key;
  c.setAttribute("aria-pressed",String(i===0));
  c.addEventListener("click",()=>{
    $$(".chip").forEach(x=>{x.classList.remove("active");x.setAttribute("aria-pressed","false");});
    c.classList.add("active"); c.setAttribute("aria-pressed","true");
    $$(".polaroid").forEach(p=>{
      const show=key==="all"||p.dataset.dept===key;
      p.classList.toggle("filtered-out",!show);
      if(show&&hasGsap&&!reduced)gsap.fromTo(p,{opacity:0,y:18},{opacity:1,y:0,duration:.5,ease:"power3.out"});
    });
    if(hasGsap) ScrollTrigger.refresh();
  });
  filters.appendChild(c);
});
TEAM.forEach((t,i)=>{
  const b=document.createElement("button");
  b.className="polaroid"; b.dataset.dept=t.dept;
  b.setAttribute("aria-pressed","false");
  b.setAttribute("aria-label",`${t.name}, ${t.role}. Activate to flip the polaroid.`);
  b.style.setProperty("--rot",`${((i*7)%9)-4}deg`);
  b.style.setProperty("--tape-rot",`${i%2?-3:2}deg`);
  const frontPhoto=t.img
    ?`<img src="assets/team/${esc(t.img)}" alt="Portrait of ${esc(t.name)}" loading="lazy">`
    :`<div class="photo-pending"><span class="aperture-big">◉</span><span>AWAITING EXPOSURE</span></div>`;
  let back;
  if(t.child){
    back=`<div class="polaroid-face polaroid-back">
      <div class="polaroid-photo"><img src="assets/team/${esc(t.child)}" alt="${esc(t.name)} as a kid" loading="lazy"></div>
      <p class="polaroid-back-cap">${esc(t.backCap||"frame zero — before Tasveer had a name")}<small>FRAME 00 · ${esc(t.name)} · 400C</small></p></div>`;
  } else if(t.back?.type==="quote"){
    back=`<div class="polaroid-face polaroid-back"><div class="quote-back"><p>“${esc(t.back.text)}”</p><small>${esc(t.back.tag)}</small></div></div>`;
  } else {
    back=`<div class="polaroid-face polaroid-back"><div class="quote-back"><p>“${esc(t.name)} — ${esc(t.role)}.”</p><small>frame pending</small></div></div>`;
  }
  b.innerHTML=`<div class="polaroid-inner">
    <div class="polaroid-face polaroid-front"><div class="polaroid-photo">${frontPhoto}</div>
    <div class="polaroid-meta"><p class="polaroid-name">${esc(t.name)}</p><p class="polaroid-role">${esc(t.role)}</p></div></div>${back}</div>`;
  b.addEventListener("click",()=>{
    b.classList.toggle("flipped");
    b.setAttribute("aria-pressed",String(b.classList.contains("flipped")));
    if(soundOn)shutterSound();
  });
  wall.appendChild(b);
});
revealOnEnter(".polaroid-wall",".polaroid",{opacity:0,y:40,rotate:()=>rand(-8,8)},{opacity:1,y:0,rotate:0,duration:.8,stagger:.05,ease:"power3.out"});

/* ---------- credits ---------- */
const creditsRoll=$("#creditsRoll"),creditsFooter=$(".credits-footer");
CREDITS.forEach(([dept,desc])=>{
  const row=document.createElement("div"); row.className="credit-row";
  row.innerHTML=`<span class="credit-dept">${dept}</span><span class="credit-desc">${desc}</span>`;
  creditsRoll.insertBefore(row,creditsFooter);
});
revealOnEnter(".credits-roll",".credit-row",{opacity:0,y:26},{opacity:1,y:0,duration:.7,stagger:.09,ease:"power3.out"});

/* ---------- magnetic button ---------- */
const mag=$("#joinBtn");
if(finePointer&&hasGsap&&!reduced){
  mag.addEventListener("mousemove",e=>{
    const r=mag.getBoundingClientRect();
    gsap.to(mag,{x:(e.clientX-r.left-r.width/2)*.25,y:(e.clientY-r.top-r.height/2)*.35,duration:.4,ease:"power3.out"});
  });
  mag.addEventListener("mouseleave",()=>gsap.to(mag,{x:0,y:0,duration:.6,ease:"elastic.out(1,.4)"}));
}
if(CONFIG.instagram){
  const ib=$("#instaBtn"); ib.href=CONFIG.instagram; ib.hidden=false; ib.target="_blank"; ib.rel="noopener";
}
$("#rewindBtn").addEventListener("click",()=>{scrollTo("#hero");toast("◀◀ REWINDING…");});

/* ---------- darkroom egg ---------- */
let logoClicks=0,logoTimer=null;
$("#logoBtn").addEventListener("click",()=>{
  logoClicks++; clearTimeout(logoTimer); logoTimer=setTimeout(()=>logoClicks=0,1800);
  if(logoClicks>=5){
    logoClicks=0;
    document.body.classList.toggle("darkroom");
    toast(document.body.classList.contains("darkroom")?"DARKROOM MODE — SAFELIGHT ON. HANDLE WITH CARE.":"LIGHTS ON. BACK TO THE VIEWFINDER.");
    shutterSound();
  } else if(logoClicks===1) scrollTo("#hero");
});

let rT;
addEventListener("resize",()=>{clearTimeout(rT);rT=setTimeout(()=>{if(hasGsap)ScrollTrigger.refresh();},250);});