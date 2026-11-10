// The home page's script: entrances, the work index, the stub, the deck board and the email field.
// The page reads completely without it; every function here only adds to it.

const root = document.documentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Entrances: the parts of each [data-rise] block rise one after another, once.
document.querySelectorAll("[data-rise]").forEach((block) => {
  [...block.children].forEach((child, i) => child.style.setProperty("--i", String(i)));
});
const rise = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); rise.unobserve(e.target); }
}, { rootMargin: "0px 0px -12% 0px" });
document.querySelectorAll("[data-rise], .verb").forEach((el) => rise.observe(el));

// The interface behind each verb comes up to full strength while its panel is on screen.
const lit = new IntersectionObserver((entries) => {
  for (const e of entries) {
    const ui = e.target.querySelector(".ui");
    if (ui) ui.style.opacity = e.intersectionRatio > 0.35 ? "0.62" : "0.5";
  }
}, { threshold: [0, 0.35, 0.7] });
document.querySelectorAll(".verb").forEach((el) => lit.observe(el));

// My local time, in the hero and in the stub, so a team in another time zone sees when I am awake.
const clocks = document.querySelectorAll("[data-clock]");
const tick = () => {
  const t = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit", timeZoneName: "short" }).format(new Date());
  clocks.forEach((c) => { c.textContent = t; });
};
tick();
setInterval(tick, 30000);

// The running name: it drifts left and turns round when the reader scrolls back up.
const track = document.querySelector("[data-marquee]");
if (track && !reduce) {
  let x = 0, dir = 1, lastY = scrollY, lastT = performance.now();
  addEventListener("scroll", () => {
    if (scrollY !== lastY) dir = scrollY > lastY ? 1 : -1;
    lastY = scrollY;
  }, { passive: true });
  const step = (t) => {
    const half = track.scrollWidth / 3; // three copies of the name; one copy is the loop
    x -= dir * (t - lastT) * 0.06; // px per ms
    if (x <= -half) x += half;
    if (x > 0) x -= half;
    track.style.transform = `translate3d(${x}px, 0, 0)`;
    lastT = t;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// The stub: once the hero leaves the screen, the name, my time and the call button stay at the bottom right.
const stub = document.querySelector("[data-stub]");
const card = document.querySelector(".hero");
if (stub && card) {
  const button = stub.querySelector("a");
  let past = false;
  const blocking = new Set();
  const sync = () => {
    const on = past && blocking.size === 0;
    stub.classList.toggle("is-on", on);
    stub.setAttribute("aria-hidden", on ? "false" : "true");
    button.tabIndex = on ? 0 : -1;
  };
  new IntersectionObserver(([e]) => { past = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); }).observe(card);
  // it steps aside where the page has its own actions (the deck board, the contact field, the footer)
  const aside = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? blocking.add(e.target) : blocking.delete(e.target);
    sync();
  });
  document.querySelectorAll("[data-nostub]").forEach((el) => aside.observe(el));
}

// Work index: hover or focus a name to show its screen in the fixed frame.
const frame = document.querySelector("[data-frame]");
if (frame) {
  const pics = [...frame.querySelectorAll("img, video")];
  const rows = [...document.querySelectorAll("[data-index] .work__row")];
  // The Race Strategy Lab recording plays only while it is the picture on show and the frame is on screen.
  const video = frame.querySelector("video");
  let seen = false;
  const play = () => {
    if (!video || reduce) return;
    if (seen && video.classList.contains("is-on")) video.play().catch(() => {});
    else video.pause();
  };
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; play(); }).observe(frame);
  const show = (row) => {
    rows.forEach((r) => r.classList.toggle("is-on", r === row));
    pics.forEach((p, i) => p.classList.toggle("is-on", String(i) === row.dataset.pic));
    play();
  };
  rows.forEach((row) => {
    row.addEventListener("mouseenter", () => show(row));
    row.addEventListener("focus", () => show(row));
  });
}

// The deck board: burned decks leave the pool, the rest share what is left.
const board = document.querySelector("[data-board]");
if (board) {
  const decks = [...board.querySelectorAll(".deck")];
  const left = board.querySelector("[data-board-left]");
  const note = board.querySelector("[data-board-note]");
  const update = () => {
    const open = decks.filter((d) => d.getAttribute("aria-pressed") !== "true");
    const total = open.reduce((s, d) => s + Number(d.dataset.n), 0);
    let top = null;
    decks.forEach((d) => {
      const isOpen = open.includes(d);
      const pct = isOpen && total ? Math.round((Number(d.dataset.n) / total) * 100) : 0;
      d.querySelector(".deck__pct").textContent = isOpen ? pct + "%" : "burned";
      d.querySelector(".deck__meter i").style.setProperty("--w", pct + "%");
      if (isOpen && (!top || Number(d.dataset.n) > Number(top.dataset.n))) top = d;
    });
    decks.forEach((d) => d.classList.toggle("is-top", d === top && open.length < decks.length && open.length > 1));
    const burned = decks.length - open.length;
    left.textContent = open.length === 1 ? "1 deck left: no secrets now" : open.length + " decks still open";
    if (burned === 0) note.textContent = "Nothing burned yet: they open with Hog Rider almost half the time.";
    else if (open.length === 0) note.textContent = "Every deck is used. In a Bo5 that cannot happen before Game 5 ends.";
    else if (open.length === 1) note.textContent = "Only " + top.querySelector(".deck__name").textContent + " is left. Prepare for exactly that.";
    else note.textContent = "Most likely next: " + top.querySelector(".deck__name").textContent + ", " + top.querySelector(".deck__pct").textContent + " of what is left.";
  };
  decks.forEach((d) => d.addEventListener("click", () => {
    d.setAttribute("aria-pressed", d.getAttribute("aria-pressed") === "true" ? "false" : "true");
    update();
  }));
  board.querySelector("[data-board-reset]").addEventListener("click", () => {
    decks.forEach((d) => d.setAttribute("aria-pressed", "false"));
    update();
  });
}

// The email field: builds the message with proper spaces instead of the form's plus signs.
const mail = document.querySelector("[data-mail]");
if (mail) {
  mail.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const text = mail.querySelector("#team").value.trim();
    location.href = "mailto:to_jacob@me.com?subject=" + encodeURIComponent("Analyst for 2027") +
      "&body=" + encodeURIComponent("Team and game: " + text + "\n\n");
  });
}

if (reduce) root.classList.add("mo-safe");
