const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const $ = (id) => document.getElementById(id);
let estado = (typeof ESTADO !== "undefined" && ESTADO) ? ESTADO : { modo: "auto", mensaje: "" };
let db = null, isOwner = false, myId = null, lastKey = "";
let eventosLive = null, noticiasLive = null, semanaLive = null;
const fmt = (m) => { m = m % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function madridNow() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  const wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get("weekday")];
  return { day: wd, min: (parseInt(get("hour"), 10) % 24) * 60 + parseInt(get("minute"), 10) };
}

function renderStatus() {
  const { day, min } = madridNow();
  $("clock").textContent = fmt(min);
  const today = HORARIO[day], prev = HORARIO[(day + 6) % 7];
  let open = false, title = "", hint = "";
  if (prev && prev.close > 1440 && min < prev.close - 1440) {
    open = true; title = "Abiertos ahora"; hint = "Cerramos a las " + fmt(prev.close) + ".";
  } else if (today && min >= today.open && min < today.close) {
    open = true; title = "Abiertos ahora"; hint = "Cerramos a las " + fmt(today.close) + ".";
  } else if (today && min < today.open) {
    title = "Abrimos hoy"; hint = "Las puertas se abren a las " + fmt(today.open) + ".";
  } else {
    let d = (day + 1) % 7, add = 1;
    while (!HORARIO[d] && add < 7) { d = (d + 1) % 7; add++; }
    title = "Cerrado"; hint = "Volvemos el " + DIAS[d].toLowerCase() + " a las " + fmt(HORARIO[d].open) + ".";
  }
  if (estado.modo === "open") { open = true; title = "Abiertos ahora"; hint = estado.mensaje || "Pasa, la noche acaba de empezar."; }
  else if (estado.modo === "closed") { open = false; title = "Cerrado"; hint = estado.mensaje || "Hoy no abrimos."; }
  else if (estado.mensaje) { hint = estado.mensaje + " · " + hint; }
  $("pill").className = "pill " + (open ? "open" : "closed");
  $("pillText").textContent = open ? "Abierto" : "Cerrado";
  $("statusTitle").textContent = title;
  $("statusHint").textContent = hint;
  renderSched(day);
}

function renderSched(today) {
  const order = [1, 2, 3, 4, 5, 6, 0];
  $("sched").innerHTML = order.map((d) => {
    const h = HORARIO[d];
    const cells = h ? "<td>" + fmt(h.open) + "</td><td>" + fmt(h.close) + (h.nota ? " · " + esc(h.nota) : "") + "</td>" : '<td colspan="2">Cerrado</td>';
    return '<tr class="' + (d === today ? "today" : "") + '"><td>' + DIAS[d] + (d === today ? " (hoy)" : "") + "</td>" + cells + "</tr>";
  }).join("");
}

function renderNews() {
  const NS = noticiasLive || NOTICIAS;
  $("weekLabel").textContent = semanaLive || SEMANA;
  if (!NS.length) { $("news").innerHTML = '<p class="empty">Esta semana no hay noticias todavía.</p>'; return; }
  const [first, ...rest] = NS;
  const post = (n, big) => '<article class="post' + (big ? " big" : "") + '"><div class="meta"><span class="tag">' + esc(n.tag) + "</span><span>" + esc(n.fecha) + "</span></div><h3>" + esc(n.titulo) + "</h3><p>" + esc(n.texto) + "</p></article>";
  $("news").innerHTML = post(first, true) + '<div class="news-side">' + rest.map((n) => post(n, false)).join("") + "</div>";
}

let filtro = "todos";
function renderEvents() {
  const chips = [["todos", "Todos"]].concat([2, 3, 4, 5, 6, 0].map((d) => [String(d), DIAS[d]]));
  $("chips").innerHTML = chips.map(([k, l]) => '<button type="button" class="chip" data-k="' + k + '" aria-pressed="' + (filtro === k) + '">' + l + "</button>").join("");
  const orden = [1, 2, 3, 4, 5, 6, 0];
  const list = (eventosLive || EVENTOS).filter((e) => filtro === "todos" || String(e.dia) === filtro).sort((a, b) => (orden.indexOf(a.dia) - orden.indexOf(b.dia)) || String(a.hora).localeCompare(String(b.hora)));
  $("events").innerHTML = list.length ? list.map((e) => '<article class="event"><span class="day">' + esc(e.dnombre) + '</span><h3>' + esc(e.titulo) + '</h3><p>' + esc(e.texto) + '</p><span class="when">' + esc(e.hora) + " h</span></article>").join("") : '<p class="empty">Ese día no hay evento programado.</p>';
}
$("chips").addEventListener("click", (ev) => {
  const b = ev.target.closest(".chip");
  if (!b) return;
  filtro = b.dataset.k;
  renderEvents();
});

/* carnet */
let tier = CARNETS[0];
function renderTiers() {
  $("tiers").innerHTML = CARNETS.map((c, i) => '<label class="tier"><input type="radio" name="tier" value="' + c.id + '"' + (i === 0 ? " checked" : "") + '><span><strong>' + c.nombre + '</strong><span class="perks">' + c.perks + '</span></span><span class="price">' + c.precio.toLocaleString("es-ES") + " $</span></label>").join("");
}
function numeroCarnet(nombre, tel) {
  let h = 0;
  const s = nombre + tel + tier.id;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9000;
  return "VU-" + String(h + 1000);
}
function updateCard() {
  const nombre = $("nombre").value.trim() || "Nombre del personaje";
  $("cardName").textContent = nombre;
  $("cardTier").textContent = "Carnet " + tier.nombre;
  $("cardNum").textContent = "Nº " + numeroCarnet($("nombre").value.trim(), $("tel").value.trim());
  $("cardVip").className = "card-vip " + tier.clase;
}
$("tiers").addEventListener("change", (ev) => {
  tier = CARNETS.find((c) => c.id === ev.target.value) || CARNETS[0];
  updateCard();
});
$("nombre").addEventListener("input", updateCard);
$("tel").addEventListener("input", updateCard);

function toast(msg) {
  const t = $("toast");
  t.textContent = msg; t.hidden = false;
  clearTimeout(toast.id);
  toast.id = setTimeout(() => { t.hidden = true; }, 2200);
}
$("buy").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const nombre = $("nombre").value.trim(), tel = $("tel").value.trim();
  if (!nombre || !tel) { toast("Rellena nombre y teléfono del personaje."); return; }
  const txt = "Pedido de carnet VIP · Vanilla Unicorn\nCarnet: " + tier.nombre + " (" + tier.precio.toLocaleString("es-ES") + " $)\nPersonaje: " + nombre + "\nTeléfono IC: " + tel + "\nNúmero de carnet: " + numeroCarnet(nombre, tel) + "\nForma de pago: " + $("pago").value;
  $("orderText").textContent = txt;
  $("order").hidden = false;
  $("order").scrollIntoView({ block: "nearest", behavior: "smooth" });
  enviarPedido(txt);
});
$("copy").addEventListener("click", () => {
  const txt = $("orderText").textContent;
  const fallback = () => {
    const r = document.createRange(); r.selectNodeContents($("orderText"));
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    toast("Selecciona y copia el texto.");
  };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(() => toast("Pedido copiado"), fallback);
  else fallback();
});

function renderTeam() {
  $("team").innerHTML = EQUIPO.map((m) => '<div class="member"><span>' + esc(m.r) + "</span><b>" + esc(m.n) + "</b><small>Conectado " + esc(m.h) + " (hora de España)</small></div>").join("");
}

renderNews(); renderEvents(); renderTiers(); renderTeam(); updateCard(); renderStatus();
setInterval(renderStatus, 30000);


/* Si hay un webhook de Discord en contenido.js, el pedido llega solo al canal del club. */
async function enviarPedido(txt) {
  const note = $("saveNote");
  if (txt === lastKey) return;
  if (typeof DISCORD_WEBHOOK === "undefined" || !DISCORD_WEBHOOK) { note.textContent = "Copia el pedido y pégalo en el ticket de Discord del club."; return; }
  note.textContent = "Enviando pedido al club…";
  try {
    const r = await fetch(DISCORD_WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: "Web Vanilla Unicorn", allowed_mentions: { parse: [] }, content: "**Nuevo pedido de carnet**\n" + txt }) });
    if (!r.ok) throw new Error("http " + r.status);
    lastKey = txt;
    note.textContent = "Pedido enviado al club. Te atenderán en el juego.";
  } catch (e) {
    note.textContent = "No se pudo enviar. Copia el pedido y pégalo en el ticket de Discord del club.";
  }
}
