document.getElementById("app").textContent = "script is running";
const KEY = "squishy-shelf-v1";
let items = load();
let editingId = null;
const q = { search: "", brand: "", color: "", sort: "new" };
const app = document.getElementById("app");

function load() {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : []; }
  catch (e) { return []; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
}
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function h(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, "");
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c);
  return e;
}

const NAMED = {
  rainbow: "linear-gradient(135deg,#ff6fb1,#ffd23f,#3ecf8e,#3b82f6)",
  red: "#e5484d", pink: "#ff6fb1", orange: "#ff8a3d", yellow: "#ffd23f",
  green: "#3ecf8e", mint: "#6ee7c8", blue: "#3385ff", teal: "#14b8a6",
  purple: "#9b6cf6", lavender: "#c3adff", white: "#f3f0ff", black: "#8a82a6",
  clear: "#cfe9ff", glow: "#cdff99", gold: "#ddbb55", silver: "#c0c6d4"
};
function swatch(v) {
  const s = (v || "").toLowerCase();
  if (!s) return "#d9cffc";
  for (const k in NAMED) if (s.includes(k)) return NAMED[k];
  let n = 0;
  for (const ch of s) n = (n * 31 + ch.charCodeAt(0)) % 360;
  return "hsl(" + n + " 75% 66%)";
}
function colorToHex(text) {
  const t = text.trim().toLowerCase();
  const named = NAMED[t];
  if (named && named.startsWith("#")) return named;
  const el = document.createElement("div");
  el.style.color = t;
  if (!el.style.color) return null;
  document.body.append(el);
  const m = getComputedStyle(el).color.match(/\d+/g);
  el.remove();
  return "#" + m.slice(0, 3).map(n => (+n).toString(16).padStart(2, "0")).join("");
}

function blobStyle(i) {
  const bg = /^#[0-9a-f]{6}$/i.test(i.color || "") ? i.color : swatch(i.variant);
  const n = bg.startsWith("#") ? parseInt(bg.slice(1), 16) : -1;
  const light = n < 0 || (((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000) >= 140;
  return "background:" + bg + ";color:" + (light ? "#2a1a4a" : "#ffffff");
}
const fmt = d => new Date(d + "T00:00").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

function view() {
  const s = q.search.toLowerCase();
  const list = items.filter(i =>
    (!s || i.name.toLowerCase().includes(s)) &&
    (!q.brand || i.brand === q.brand) &&
    (!q.color || i.variant.toLowerCase() === q.color));
  list.sort((a, b) =>
    q.sort === "az" ? a.name.localeCompare(b.name) :
    q.sort === "za" ? b.name.localeCompare(a.name) :
    q.sort === "old" ? (a.date || "~").localeCompare(b.date || "~") :
    (b.date || "").localeCompare(a.date || ""));
  return list;
}

function card(i) {
  return h("article", { class: "card" },
    h("div", { class: "blob", style: blobStyle(i) }, (i.name[0] || "?").toUpperCase()),
    h("div", { class: "body" },
      h("h3", {}, i.name),
      i.brand && h("span", { class: "chip" }, i.brand),
      i.variant && h("p", { class: "variant" }, i.variant),
      i.date && h("p", { class: "meta" }, "Acquired " + fmt(i.date)),
      i.notes && h("p", { class: "notes" }, i.notes)),
    h("div", { class: "actions" },
      h("button", { class: "btn small ghost", "aria-label": "Edit " + i.name, onclick: () => { editingId = i.id; location.hash = "edit"; } }, "Edit"),
      h("button", { class: "btn small ghost danger", "aria-label": "Delete " + i.name, onclick: () => { items = items.filter(x => x.id !== i.id); save(); renderHome(); } }, "Delete")));
}

function renderHome() {
  const brands = [...new Set(items.map(i => i.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const colors = new Map();
  items.forEach(i => { const k = i.variant.toLowerCase(); if (k && !colors.has(k)) colors.set(k, i.variant); });
  if (q.brand && !brands.includes(q.brand)) q.brand = "";
  if (q.color && !colors.has(q.color)) q.color = "";

  const grid = h("div", { class: "grid" });
  const count = h("p", { class: "count", "aria-live": "polite" });
  const addBtn = h("a", { class: "btn", href: "#add" }, "Add a squishy");

  const draw = () => {
    const list = view();
    const filtered = q.search || q.brand || q.color;
    count.textContent = filtered ? "Showing " + list.length + " of " + items.length : "";
    grid.replaceChildren();
    if (!items.length) {
      grid.append(h("div", { class: "empty" }, h("h2", {}, "Your shelf is empty"),
        h("p", {}, "Add your first squishy and it will show up here."),
        h("a", { class: "btn", href: "#add" }, "Add a squishy")));
    } else if (!list.length) {
      grid.append(h("div", { class: "empty" }, h("h2", {}, "No squishies found"),
        h("p", {}, "Nothing matches your search and filters."),
        h("button", { class: "btn ghost", onclick: () => { q.search = ""; q.brand = ""; q.color = ""; renderHome(); } }, "Clear search and filters")));
    } else list.forEach(i => grid.append(card(i)));
  };

  const sel = (key, label, opts) => h("select", { "aria-label": label, onchange: e => { q[key] = e.target.value; draw(); } },
    opts.map(([v, t]) => h("option", { value: v, selected: q[key] === v }, t)));

  const toolbar = h("div", { class: "toolbar" },
    h("input", { type: "search", class: "search", placeholder: "Search by name", "aria-label": "Search by name", value: q.search, oninput: e => { q.search = e.target.value; draw(); } }),
    sel("brand", "Filter by brand", [["", "All brands"], ...brands.map(b => [b, b])]),
    sel("color", "Filter by color", [["", "All colors"], ...[...colors].map(([k, t]) => [k, t])]),
    sel("sort", "Sort by", [["new", "Newest acquired"], ["old", "Oldest acquired"], ["az", "Name A to Z"], ["za", "Name Z to A"]]));

  app.replaceChildren(
    h("div", { class: "top" }, h("h1", {}, "Nee Doh Shelf"),
      h("span", { class: "pill" }, items.length + (items.length === 1 ? " squishy" : " squishies")), addBtn),
    items.length ? toolbar : "", count, grid);
  draw();
}

function renderForm() {
  const it = editingId ? items.find(i => i.id === editingId) : null;
  if (editingId && !it) { location.hash = ""; return; }
  const v = it || { name: "", brand: "", variant: "", date: "", notes: "", color: "" };
  const brands = [...new Set(["Nee Doh", ...items.map(i => i.brand).filter(Boolean)])];
  const nameInput = h("input", { name: "name", required: true, maxlength: "60", value: v.name, autocomplete: "off" });

  let chosen = /^#[0-9a-f]{6}$/i.test(v.color || "") ? v.color : "";
  const preview = h("span", { class: "color-preview", "aria-hidden": "true" });
  const hint = h("span", { class: "hint", "aria-live": "polite" });
  const picker = h("input", { type: "color", "aria-label": "Pick a color", value: chosen || "#ff6fb1" });
  const colorText = h("input", { placeholder: "Type a color name or #hex", "aria-label": "Color name", value: chosen, autocomplete: "off" });
  const showColor = () => { preview.style.background = chosen || "transparent"; };
  colorText.addEventListener("input", () => {
    const t = colorText.value.trim();
    if (!t) { chosen = ""; hint.textContent = ""; }
    else {
      const hex = colorToHex(t);
      if (hex) { chosen = hex; picker.value = hex; hint.textContent = hex; }
      else { chosen = ""; hint.textContent = "Not a color I know. Try a name like teal, or use the picker."; }
    }
    showColor();
  });
  picker.addEventListener("input", () => {
    chosen = picker.value;
    colorText.value = picker.value;
    hint.textContent = "";
    showColor();
  });
  showColor();

  const form = h("form", {
    class: "form",
    onsubmit: e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      const rec = { name: d.name.trim(), brand: d.brand.trim(), variant: d.variant.trim(), color: chosen, date: d.date, notes: d.notes.trim() };
      if (!rec.name) return;
      if (it) Object.assign(it, rec); else items.push({ id: uid(), ...rec });
      save();
      location.hash = "";
    }
  },
    h("label", {}, "Name", nameInput),
    h("label", {}, "Brand or line", h("input", { name: "brand", list: "brands", value: v.brand, placeholder: "Nee Doh, or another brand", autocomplete: "off" })),
    h("datalist", { id: "brands" }, brands.map(b => h("option", { value: b }))),
    h("label", {}, "Variant", h("input", { name: "variant", value: v.variant, placeholder: "Glow, clear, rainbow…", autocomplete: "off" })),
    h("div", { class: "color-field" },
      h("span", { class: "label" }, "Color"),
      h("div", { class: "color-row" }, preview, colorText, picker),
      hint),
    h("label", {}, "Date acquired", h("input", { type: "date", name: "date", value: v.date })),
    h("label", {}, "Squish and texture notes", h("textarea", { name: "notes", placeholder: "Slow rebound, extra gooey, a little sticky…" }, v.notes)),
    h("div", { class: "row" }, h("button", { class: "btn", type: "submit" }, "Save squishy"), h("a", { class: "btn ghost", href: "#" }, "Back to shelf")));
  app.replaceChildren(h("h1", {}, it ? "Edit squishy" : "Add a squishy"), h("div", { style: "height:1.2rem" }), form);
  nameInput.focus();
}

function route() {
  const r = location.hash.slice(1);
  if (r === "add") { editingId = null; renderForm(); }
  else if (r === "edit" && editingId) renderForm();
  else { editingId = null; renderHome(); }
  window.scrollTo(0, 0);
}
addEventListener("hashchange", route);
route();
