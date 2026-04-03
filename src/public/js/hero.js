(function () {
  const track = document.getElementById("heroTrack");
  if(!track) return;

  const slides = Array.from(track.querySelectorAll(".hero2__slide"));
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const dotsBox = document.getElementById("dots");
  const counter = document.getElementById("counter");
  const bar = document.getElementById("progressBar");

  let index = 0;
  let timer = null;
  let progress = 0;

  const intervalMs = 5200;
  const tickMs = 50;

  function renderDots(){
    if(!dotsBox) return;
    dotsBox.innerHTML = "";
    slides.forEach((_, i) => {
      const d = document.createElement("button");
      d.className = "dot" + (i === index ? " dot--active" : "");
      d.setAttribute("type","button");
      d.addEventListener("click", () => goTo(i));
      dotsBox.appendChild(d);
    });
  }

  function updateUI(){
    track.style.transform = `translateX(-${index * 100}%)`;
    if(counter) counter.textContent = `${index + 1} / ${slides.length}`;
    renderDots();
  }

  function goTo(i){
    index = (i + slides.length) % slides.length;
    progress = 0;
    if(bar) bar.style.width = "0%";
    updateUI();
  }
  function next(){ goTo(index + 1); }
  function prev(){ goTo(index - 1); }

  function start(){
    stop();
    timer = setInterval(() => {
      progress += (tickMs / intervalMs) * 100;
      if(bar) bar.style.width = `${Math.min(progress, 100)}%`;
      if(progress >= 100) next();
    }, tickMs);
  }
  function stop(){
    if(timer) clearInterval(timer);
    timer = null;
  }

  prevBtn?.addEventListener("click", () => { prev(); start(); });
  nextBtn?.addEventListener("click", () => { next(); start(); });

  // drag (simple)
  let startX = null;
  track.addEventListener("pointerdown", (e) => { startX = e.clientX; track.setPointerCapture(e.pointerId); });
  track.addEventListener("pointerup", (e) => {
    if(startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if(Math.abs(dx) < 40) return;
    if(dx < 0) next(); else prev();
    start();
  });

  updateUI();
  start();
})();
