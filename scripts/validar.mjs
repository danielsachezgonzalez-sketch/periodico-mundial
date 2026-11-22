// Valida edicion.json (o el archivo indicado) antes de publicar.
// Uso: node scripts/validar.mjs [ruta]   → sale con código 1 si hay errores.
import fs from "node:fs";

const ruta = process.argv[2] || "edicion.json";
const errores = [];
const aviso = [];
let ed;
try { ed = JSON.parse(fs.readFileSync(ruta, "utf8")); }
catch (e) { console.error("JSON inválido en " + ruta + ": " + e.message); process.exit(1); }

const esTexto = v => typeof v === "string" && v.trim().length > 0;
const esHttps = v => typeof v === "string" && /^https:\/\/\S+$/.test(v);
const TONOS = ["negativa", "positiva", "neutral", "mixta"];
const VERIF = ["confirmado", "parcial", "no_verificado"];

function revisarArticulo(a, donde) {
  if (!esTexto(a.titulo)) errores.push(donde + ": falta 'titulo'");
  if (!Array.isArray(a.cuerpo) || a.cuerpo.length === 0 || !a.cuerpo.every(esTexto)) errores.push(donde + ": 'cuerpo' debe ser una lista de párrafos");
  if (a.tono && !TONOS.includes(a.tono)) errores.push(donde + ": tono inválido '" + a.tono + "'");
  if (a.verificacion && !VERIF.includes(a.verificacion)) errores.push(donde + ": verificacion inválida '" + a.verificacion + "'");
  if (!Array.isArray(a.fuentes) || a.fuentes.length === 0) errores.push(donde + ": necesita al menos una fuente");
  (a.fuentes || []).forEach((f, i) => { if (!esTexto(f.nombre) || !esHttps(f.url)) errores.push(donde + ": fuente " + (i + 1) + " sin nombre o sin URL https"); });
  if (a.imagen) {
    if (!esHttps(a.imagen.url)) errores.push(donde + ": imagen.url debe ser https");
    if (!esTexto(a.imagen.pie)) errores.push(donde + ": imagen sin 'pie'");
    if (!esTexto(a.imagen.credito) || !esTexto(a.imagen.licencia)) errores.push(donde + ": imagen sin crédito o licencia");
  }
}

if (!/^\d{4}-\d{2}-\d{2}$/.test(ed.fecha || "")) errores.push("'fecha' debe ser AAAA-MM-DD");
if (!esTexto(ed.fecha_larga)) errores.push("falta 'fecha_larga'");
if (!Number.isInteger(ed.edicion_numero)) errores.push("'edicion_numero' debe ser entero");
if (!ed.portada) errores.push("falta 'portada'"); else revisarArticulo(ed.portada, "portada");
if (!Array.isArray(ed.lo_esencial) || ed.lo_esencial.length < 4) errores.push("'lo_esencial' necesita al menos 4 puntos");
if (!Array.isArray(ed.cifras) || ed.cifras.length < 3) errores.push("'cifras' necesita al menos 3 datos");
if (!Array.isArray(ed.termometro) || ed.termometro.length < 5) errores.push("'termometro' necesita al menos 5 focos");
(ed.termometro || []).forEach((t, i) => { if (!(t.nivel >= 1 && t.nivel <= 5)) errores.push("termometro " + (i + 1) + ": nivel debe ser 1–5"); });
if (!Array.isArray(ed.secciones) || ed.secciones.length < 5) errores.push("se esperan al menos 5 secciones");
let total = 0;
(ed.secciones || []).forEach((s, i) => {
  if (!esTexto(s.id) || !/^[a-z0-9-]+$/.test(s.id)) errores.push("sección " + (i + 1) + ": id inválido");
  if (!esTexto(s.nombre)) errores.push("sección " + (i + 1) + ": falta nombre");
  (s.articulos || []).forEach((a, j) => { total++; revisarArticulo(a, "sección '" + s.id + "' art. " + (j + 1)); });
});
if (total < 10) aviso.push("solo " + total + " artículos en secciones (se recomiendan 12 o más)");
if (!Array.isArray(ed.dos_caras) || ed.dos_caras.length < 2) errores.push("'dos_caras' necesita al menos 2 temas");
(ed.dos_caras || []).forEach((m, i) => { if (!esTexto(m.tema) || !m.lado_a?.parrafos?.length || !m.lado_b?.parrafos?.length) errores.push("dos_caras " + (i + 1) + ": incompleto"); });
if (!Array.isArray(ed.buenas_noticias) || ed.buenas_noticias.length < 2) errores.push("'buenas_noticias' necesita al menos 2");
if (!ed.colombia || !Array.isArray(ed.colombia.articulos) || ed.colombia.articulos.length < 2) errores.push("'colombia' necesita al menos 2 artículos");
(ed.colombia?.articulos || []).forEach((a, j) => revisarArticulo(a, "colombia art. " + (j + 1)));
if (!Array.isArray(ed.agenda) || ed.agenda.length < 3) errores.push("'agenda' necesita al menos 3 puntos");

const imgs = JSON.stringify(ed).match(/"url":\s*"https:\/\/[^"]*wikimedia[^"]*"/g) || [];
if (imgs.length < 5) aviso.push("pocas imágenes (" + imgs.length + "); se recomiendan 8 o más");

aviso.forEach(a => console.warn("AVISO: " + a));
if (errores.length) { console.error("ERRORES (" + errores.length + "):\n - " + errores.join("\n - ")); process.exit(1); }
console.log("OK: " + ruta + " válida · " + (ed.secciones || []).length + " secciones · " + total + " artículos · " + imgs.length + " imágenes");
