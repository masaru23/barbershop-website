/* Edit services and prices here: the price list and the booking picker both read this array.
   p is the lowest price (null if unpriced); pl is the label shown to visitors. */
const SERVICES = [
  { g:"Haircuts",              n:"Haircut",         p:350,  pl:"from ₱350" },
  { g:"Haircuts",              n:"Premium cut",     p:350,  pl:"₱350" },
  { g:"Haircuts",              n:"Cuts for tots",   p:300,  pl:"₱300" },
  { g:"Shaves and beards",     n:"Shaves",          p:200,  pl:"₱200 to ₱350" },
  { g:"Shaves and beards",     n:"Beard grooming",  p:null, pl:"Ask in store" },
  { g:"Color and perms",       n:"Perms",           p:1950, pl:"₱1,950 to ₱2,200" },
  { g:"Color and perms",       n:"Color",           p:750,  pl:"₱750 to ₱1,800" },
  { g:"Color and perms",       n:"Highlights",      p:null, pl:"Ask in store" },
  { g:"Treatments and extras", n:"Threading",       p:250,  pl:"₱250" },
  { g:"Treatments and extras", n:"Hair art",        p:650,  pl:"₱650" },
  { g:"Treatments and extras", n:"Scalp care",      p:250,  pl:"₱250 to ₱900", note:"Price depends on hair length." },
  { g:"Treatments and extras", n:"Add-ons",         p:50,   pl:"₱50", book:false }   /* book:false keeps it out of the booking picker */
];
const BOOKABLE = SERVICES.filter(s => s.book !== false);
const HOURS = [10,11,12,13,14,15,16,17,18];   // start times, 24-hour
const pick = { s:0, d:null, t:null };

const $ = id => document.getElementById(id);
const peso = n => "₱" + n.toLocaleString("en-PH");
const clock = h => (h % 12 || 12) + ":00 " + (h < 12 ? "am" : "pm");

/* Price list */
const GROUPS = [...new Set(SERVICES.map(s => s.g))];   /* panels appear in the order groups first show up above */
$("menu").innerHTML = GROUPS.map(g => `<div class="group"><h3>${g}</h3><ul>` +
  SERVICES.filter(s => s.g === g).map(s =>
    `<li><span class="nm">${s.n}${s.note ? `<small>${s.note}</small>` : ""}</span><span class="pr">${s.pl}</span></li>`).join("") +
  `</ul></div>`).join("");

/* Next 7 days */
const days = Array.from({ length:7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });
const dayLabel = d => d.toLocaleDateString("en-PH", { weekday:"short", day:"numeric" });

/* Pretend some slots are already taken, so the demo feels real */
const taken = (di, h) => (di * 7 + h * 3) % 5 === 0;

function chip(label, pressed, disabled, onClick) {
  const b = document.createElement("button");
  b.type = "button"; b.className = "chip"; b.textContent = label; b.disabled = disabled;
  b.setAttribute("aria-pressed", String(pressed)); b.onclick = onClick; return b;
}

function render() {
  $("svc").replaceChildren(...BOOKABLE.map((s, i) => chip(s.n, pick.s === i, false, () => { pick.s = i; render(); })));
  $("days").replaceChildren(...days.map((d, i) => chip(dayLabel(d), pick.d === i, false, () => { pick.d = i; pick.t = null; render(); })));
  $("times").replaceChildren(...HOURS.map(h => {
    const off = pick.d === null || taken(pick.d, h);
    return chip(clock(h), pick.t === h, off, () => { pick.t = h; render(); });
  }));
  const ready = pick.d !== null && pick.t !== null;
  $("go").disabled = !ready;
  const s = BOOKABLE[pick.s];
  $("sum").textContent = ready
    ? `${s.n} on ${dayLabel(days[pick.d])} at ${clock(pick.t)}, ${s.p ? s.pl : "price confirmed in store"}`
    : (pick.d === null ? "Choose a day to see open times." : "Choose a time.");
}

/* In a real build this would post to your booking system or open Messenger with the details */
$("go").onclick = () => { $("sum").textContent = "Demo only: this is where the request would be sent to the shop."; };
/* Pomade showcase: edit products here (bundle prices are in the HTML above) */
const POMADES = [
  { id:"chico",      n:"Chico",      b:"Pañero",       d:"Strong hold, oil based, 50 g" },
  { id:"primo",      n:"Primo",      b:"Pañero",       d:"Medium grip, oil based, 50 g" },
  { id:"classico",   n:"Classico",   b:"Pañero",       d:"Styling hold, oil based, 50 g" },
  { id:"frostbite",  n:"Frost Bite", b:"Eight Wolves", d:"Hair pomade" },
  { id:"cherrybomb", n:"Cherry Bomb",b:"Eight Wolves", d:"Hair pomade" },
  { id:"crazyeight", n:"Crazy Eight",b:"Eight Wolves", d:"Hair pomade" },
  { id:"sourblue",   n:"Sour Blue",  b:"Eight Wolves", d:"Hair pomade" }
];
const IMG = {
  chico: "images/pomade-chico.webp",
  primo: "images/pomade-primo.webp",
  classico: "images/pomade-classico.webp",
  frostbite: "images/pomade-frost-bite.webp",
  cherrybomb: "images/pomade-cherry-bomb.webp",
  crazyeight: "images/pomade-crazy-eight.webp",
  sourblue: "images/pomade-sour-blue.webp"
};
$("shop").innerHTML = POMADES.map(p =>
  `<div class="prod"><img src="${IMG[p.id]}" width="130" height="130" alt="${p.b} ${p.n} pomade tin"><h3>${p.n}</h3><small>${p.b}<br>${p.d}</small></div>`
).join("");

render();

const burger = $("burger"), panel = $("menu-panel");
function setMenu(open) { burger.setAttribute("aria-expanded", String(open)); panel.hidden = !open; }
burger.onclick = e => { e.stopPropagation(); setMenu(panel.hidden); };
panel.onclick = e => { if (e.target.closest("a")) setMenu(false); };
document.addEventListener("click", e => { if (!panel.hidden && !panel.contains(e.target)) setMenu(false); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) { setMenu(false); burger.focus(); } });
