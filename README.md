# El Centinela Global

Diario digital con estética de periódico impreso sobre los conflictos del mundo (guerras, tensiones, comunidades musulmanas perseguidas) con un suplemento sobre el Gobierno de Colombia.

- **Página pública:** GitHub Pages de este repositorio.
- **Actualización:** un agente de Claude en la nube reescribe `edicion.json` todos los días a las 8:00 a. m. (hora de Colombia) siguiendo [`INSTRUCCIONES_EDITOR.md`](INSTRUCCIONES_EDITOR.md).
- **Archivo:** cada edición queda en `archivo/AAAA-MM-DD.json`; se consulta con `?fecha=AAAA-MM-DD`.
- **Imágenes:** Wikimedia Commons, con licencia libre y crédito.

Estructura: `index.html` (diseño y renderizado), `edicion.json` (contenido del día), `scripts/validar.mjs` (validación), `scripts/imagenes.mjs` (búsqueda de fotos), `.github/workflows/publicar.yml` (publica ediciones subidas a ramas `claude/**`).
