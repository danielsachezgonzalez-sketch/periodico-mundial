// Busca fotos reales con licencia libre en Wikimedia Commons.
// Uso: node scripts/imagenes.mjs "Kyiv 2026 attack" "Gaza 2026" ...
// Devuelve, por cada búsqueda, candidatas listas para pegar en el campo "imagen" de edicion.json.
// Si este script no tiene red, usar WebFetch con la URL que imprime en "consulta".
const UA = "PeriodicoMundialBot/1.0 (+https://github.com; edicion diaria sin fines de lucro)";
const limpiar = s => String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

for (const q of process.argv.slice(2)) {
  const api = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=" +
    encodeURIComponent(q) + "&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=960&format=json";
  const salida = { busqueda: q, consulta: api, candidatas: [] };
  try {
    const r = await fetch(api, { headers: { "User-Agent": UA } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const d = await r.json();
    for (const p of Object.values(d.query?.pages || {})) {
      const ii = p.imageinfo?.[0]; if (!ii) continue;
      if (!/^image\//.test(ii.mime || "")) continue;
      const m = ii.extmetadata || {};
      salida.candidatas.push({
        url: (ii.thumburl || ii.url).replace(/\?utm_[^ ]*$/, ""),
        credito: limpiar(m.Artist?.value).slice(0, 90) + " / Wikimedia Commons",
        licencia: limpiar(m.LicenseShortName?.value),
        fecha_foto: limpiar(m.DateTimeOriginal?.value).slice(0, 25),
        descripcion: limpiar(m.ImageDescription?.value).slice(0, 200),
        fuente_url: ii.descriptionurl
      });
    }
  } catch (e) { salida.error = e.message; }
  console.log(JSON.stringify(salida, null, 2));
  await new Promise(r => setTimeout(r, 1200));
}
