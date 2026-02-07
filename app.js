console.log("%cValentine 2026 💗 | Music gate build", "color:#ff2e8a;font-weight:900;");

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function show(el){ el.classList.remove("hidden"); el.setAttribute("aria-hidden","false"); }
function hide(el){ el.classList.add("hidden"); el.setAttribute("aria-hidden","true"); }

const musicGate = $("#musicGate");
const gateOk = $("#gateOk");
const gateHint = $("#gateHint");
const music = $("#music");

let gateLocked = true;

function closeGate(){
  if(!musicGate) return;
  musicGate.style.display = "none";
  gateLocked = false;
}

gateOk?.addEventListener("click", async ()=>{
  try{
    gateHint.textContent = "Đang bật nhạc…";
    music.volume = 0.9;
    await music.play();
    closeGate();
  }catch(e){
    gateHint.textContent = "Không bật được. Thử bấm OK lại nhé.";
  }
});

document.addEventListener("pointerdown", (e)=>{
  if(!gateLocked) return;
  e.preventDefault();
  e.stopPropagation();
}, {capture:true});

const heartsCanvas = $("#hearts");
const hctx = heartsCanvas.getContext("2d");
let W=0,H=0;
let hearts = [];
let heartTone = 0;

function resizeHearts(){
  W = heartsCanvas.width = window.innerWidth;
  H = heartsCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeHearts);
resizeHearts();

function spawnHeart(){
  const size = 6 + Math.random()*14;
  hearts.push({
    x: Math.random()*W,
    y: H + 20,
    vy: 0.6 + Math.random()*1.4,
    vx: -0.35 + Math.random()*0.7,
    s: size,
    r: Math.random()*Math.PI,
    vr: -0.02 + Math.random()*0.04,
    a: 0.35 + Math.random()*0.55
  });
}

function drawHeart(ctx, x, y, s, rot, alpha, fill){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fill;

  ctx.beginPath();
  const t = s * 0.3;
  ctx.moveTo(0, t);
  ctx.bezierCurveTo(0, 0, -s/2, 0, -s/2, t);
  ctx.bezierCurveTo(-s/2, (s+t)/2, 0, (s+t)/2, 0, s);
  ctx.bezierCurveTo(0, (s+t)/2, s/2, (s+t)/2, s/2, t);
  ctx.bezierCurveTo(s/2, 0, 0, 0, 0, t);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function heartsLoop(){
  hctx.clearRect(0,0,W,H);
  if(hearts.length < 70 && Math.random() < 0.55) spawnHeart();

  const tones = [
    "rgba(255,46,138,0.95)",
    "rgba(255,99,178,0.95)",
    "rgba(255,61,141,0.95)"
  ];
  const fill = tones[heartTone % tones.length];

  for(const h of hearts){
    h.x += h.vx;
    h.y -= h.vy;
    h.r += h.vr;
    drawHeart(hctx, h.x, h.y, h.s, h.r, h.a, fill);
  }

  hearts = hearts.filter(h => h.y > -40 && h.x > -60 && h.x < W+60);
  requestAnimationFrame(heartsLoop);
}
heartsLoop();

const fx = $("#fx");
const fctx = fx.getContext("2d");
let fW=0, fH=0;

function fxResize(){
  fW = fx.width = window.innerWidth;
  fH = fx.height = window.innerHeight;
}
window.addEventListener("resize", fxResize);
fxResize();

const bursts = [];
function rand(a,b){ return a + Math.random()*(b-a); }

function heartBurst(x, y){
  const palette = [
    "rgba(255,46,138,1)",
    "rgba(255,99,178,1)",
    "rgba(255,61,141,1)",
    "rgba(255,255,255,0.95)"
  ];
  const count = 26 + Math.floor(Math.random()*12);

  for(let i=0;i<count;i++){
    const ang = Math.random()*Math.PI*2;
    const spd = rand(2.2, 6.8);
    bursts.push({
      x, y,
      vx: Math.cos(ang)*spd,
      vy: Math.sin(ang)*spd,
      g: 0.08,
      drag: 0.985,
      s: rand(5, 11),
      r: rand(0, Math.PI*2),
      vr: rand(-0.08, 0.08),
      a: 1,
      fade: rand(0.018, 0.032),
      fill: palette[Math.floor(Math.random()*palette.length)]
    });
  }
}

function fxLoop(){
  fctx.clearRect(0,0,fW,fH);

  for(let i=bursts.length-1;i>=0;i--){
    const p = bursts[i];
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.r += p.vr;
    p.a -= p.fade;

    if(p.a <= 0){
      bursts.splice(i,1);
      continue;
    }

    fctx.save();
    fctx.shadowColor = "rgba(255,46,138,0.30)";
    fctx.shadowBlur = 10;
    drawHeart(fctx, p.x, p.y, p.s, p.r, p.a, p.fill);
    fctx.restore();
  }

  requestAnimationFrame(fxLoop);
}
fxLoop();

document.addEventListener("pointerdown", (e)=>{
  if(gateLocked) return;
  const tag = (e.target.tagName || "").toLowerCase();
  if(tag === "button" || tag === "a") return;
  if(e.target.closest(".modal") || e.target.closest(".lightbox")) return;
  heartBurst(e.clientX, e.clientY);
});

const modalNotes   = $("#modalNotes");
const modalGallery = $("#modalGallery");

const noteWrap = document.getElementById("noteText");
const noteMuted = document.getElementById("noteMuted");
let noteTimer = null;
let noteOriginal = null;
let mutedOriginal = null;

function clearTypewriter(){
  if(noteTimer){
    clearTimeout(noteTimer);
    noteTimer = null;
  }
  const cur = document.querySelector(".tw-cursor");
  if(cur) cur.remove();

  if(noteWrap && noteOriginal !== null) noteWrap.innerHTML = noteOriginal;
  if(noteMuted && mutedOriginal !== null) noteMuted.textContent = mutedOriginal;
}

function typewrite(el, text, speed = 16){
  return new Promise((resolve)=>{
    let i = 0;
    el.textContent = "";
    const cursor = document.createElement("span");
    cursor.className = "tw-cursor";
    cursor.textContent = "|";
    el.appendChild(cursor);

    const tick = () => {
      if(i < text.length){
        cursor.insertAdjacentText("beforebegin", text[i]);
        i++;
        noteTimer = setTimeout(tick, speed);
      }else{
        noteTimer = setTimeout(()=>{
          cursor.remove();
          resolve();
        }, 500);
      }
    };
    tick();
  });
}

async function runNotesTypewriter(){
  if(!noteWrap) return;

  if(noteOriginal === null) noteOriginal = noteWrap.innerHTML;
  if(noteMuted && mutedOriginal === null) mutedOriginal = noteMuted.textContent;

  noteWrap.innerHTML = noteOriginal;
  if(noteMuted) noteMuted.textContent = "";

  const pMain = noteWrap.querySelector("p");
  if(!pMain) return;

  const mainText = pMain.textContent.trim();
  const mutedText = noteMuted ? mutedOriginal.trim() : "";

  await typewrite(pMain, mainText, 14);
  if(noteMuted && mutedText){
    await typewrite(noteMuted, mutedText, 18);
  }
}

$("#btnOpenNotes").addEventListener("click", ()=>{
  if(gateLocked) return;
  show(modalNotes);
  setTimeout(runNotesTypewriter, 80);
});

$("#btnOpenGallery").addEventListener("click", ()=>{
  if(gateLocked) return;
  show(modalGallery);
});

$$("[data-close]").forEach(btn=>{
  btn.addEventListener("click", (e)=>{
    const id = e.currentTarget.getAttribute("data-close");
    const el = document.getElementById(id);
    if(el){
      if(el.id === "modalNotes") clearTypewriter();
      hide(el);
    }
  });
});

[modalNotes, modalGallery].forEach(m=>{
  m.addEventListener("click", (e)=>{
    if(e.target === m){
      if(m.id === "modalNotes") clearTypewriter();
      hide(m);
    }
  });
});

const lightbox = $("#lightbox");
const lbImg = $("#lbImg");
const lbCaption = $("#lbCaption");
const lbClose = $("#lbClose");
const lbBackdrop = $("#lbBackdrop");
const lbPrev = $("#lbPrev");
const lbNext = $("#lbNext");

const galleryFigures = Array.from($$(".ph"));
const galleryItems = galleryFigures.map((fig, idx)=>{
  const img = fig.querySelector("img");
  const label = fig.getAttribute("data-label") || img?.alt || `Khoảnh khắc #${idx+1}`;
  const src = img?.getAttribute("src") || "";
  return { fig, img, label, src, idx };
});

let currentIndex = -1;

function isOpen(){ return !lightbox.classList.contains("hidden"); }

function openAt(index){
  if(gateLocked) return;
  const item = galleryItems[index];
  if(!item) return;
  if(item.fig.classList.contains("broken")) return;

  currentIndex = index;
  lbImg.src = item.img?.currentSrc || item.src;
  lbCaption.textContent = item.label;
  show(lightbox);
}

function closeLightbox(){
  hide(lightbox);
  lbImg.src = "";
  currentIndex = -1;
}

function step(dir){
  if(currentIndex < 0) return;

  let tries = 0;
  let i = currentIndex;

  do{
    i = (i + dir + galleryItems.length) % galleryItems.length;
    tries++;
    if(tries > galleryItems.length) return;
  }while(galleryItems[i].fig.classList.contains("broken"));

  openAt(i);
}

lbClose.addEventListener("click", closeLightbox);
lbBackdrop.addEventListener("click", closeLightbox);
lbPrev.addEventListener("click", ()=> step(-1));
lbNext.addEventListener("click", ()=> step(1));

document.addEventListener("keydown", (e)=>{
  if(!isOpen()) return;
  if(e.key === "Escape") closeLightbox();
  if(e.key === "ArrowLeft") step(-1);
  if(e.key === "ArrowRight") step(1);
});

galleryItems.forEach((item)=>{
  if(!item.img) return;

  item.img.addEventListener("error", ()=> item.fig.classList.add("broken"));
  item.img.addEventListener("load", ()=> item.fig.classList.remove("broken"));

  item.fig.addEventListener("click", ()=>{
    if(item.fig.classList.contains("broken")) return;
    openAt(item.idx);
  });
});

let touchX = null;
let touchY = null;

const lbCard = lightbox.querySelector(".lb-card");
lbCard.addEventListener("touchstart", (e)=>{
  if(!isOpen()) return;
  const t = e.touches[0];
  touchX = t.clientX;
  touchY = t.clientY;
}, {passive:true});

lbCard.addEventListener("touchend", (e)=>{
  if(!isOpen() || touchX === null || touchY === null) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchX;
  const dy = t.clientY - touchY;
  touchX = null;
  touchY = null;

  if(Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)*1.2){
    if(dx < 0) step(1);
    else step(-1);
  }
}, {passive:true});

$("#btnTheme").addEventListener("click", ()=>{
  if(gateLocked) return;
  heartTone = (heartTone + 1) % 3;
});
