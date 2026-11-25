# Ingeniería con criterio

Experiencia editorial one-page del **Manifiesto de Ingeniería de Software en la Era de la Inteligencia Artificial**. Construida con [Lenis de darkroom.engineering](https://github.com/darkroomengineering/lenis), GSAP y ScrollTrigger.

## Desarrollo

```sh
npm install
npm run dev
```

## Publicación

```sh
npm run build
npm run preview
```

La web se publica en GitHub Pages: <https://kilianjimenez.github.io/engineering-with-judgment/>. No necesita servidor de aplicaciones, servicios externos ni CDN. Las fuentes, dependencias y avatares se sirven localmente.

## Despliegue

`.github/workflows/deploy.yml` se ejecuta con cada `push` a `main`, a mano (`workflow_dispatch`) o llamado desde el workflow de firma (`workflow_call`): `npm ci` → lint → tests unitarios → `npm run build` → GitHub Pages (Settings → Pages → Source: GitHub Actions).

El sitio vive bajo la ruta `/engineering-with-judgment/`, definida en `scripts/site.mjs` (`BASE`, junto al repositorio `REPO`). La usan `vite.config.js` (`base`) y el generador para los enlaces de idioma y de descarga; `npm run dev` y `npm run preview` también sirven la web bajo esa ruta.

## Firmar el manifiesto

Cualquier persona con cuenta de GitHub puede adherirse con un pull request que añade `firmas/<usuario>.yml` (`github` obligatorio; `nombre`, `rol` y `fecha` opcionales). Formato e instrucciones manuales: [`firmas/README.md`](firmas/README.md).

- En la web, el botón **Firmar** de la barra superior y el de la portada abren un diálogo que explica el proceso y, con el usuario indicado, abre el editor de GitHub con el fichero ya rellenado (GitHub crea el fork y propone el PR). Sin JavaScript, los botones llevan a la sección `#firmas`, que explica lo mismo.
- `.github/workflows/firma.yml` (`pull_request_target`) valida el PR con `scripts/validate-signature.mjs` leyendo solo la API, **sin ejecutar código del PR**: un único fichero nuevo `firmas/<autor>.yml`, campo `github` igual al autor, solo claves permitidas, longitudes máximas, fecha `AAAA-MM-DD`, sin HTML ni URLs y sin firma previa. Si es válido lo integra (`squash`) y vuelve a desplegar la web; si no, comenta el motivo y el check queda en rojo.
- El generador lee `firmas/*.yml` y muestra, tras la Declaración final, la sección «Firmas» con el contador y los avatares (los 48 primeros por fecha y el botón «Ver todas»). Los avatares se descargan durante el build en `public/avatars/` (ignorado por git); si falla la descarga se muestran las iniciales.

Ajustes del repositorio: Pages con source «GitHub Actions» y, en Settings → Actions → General, permisos de escritura para `GITHUB_TOKEN`.

## Contenido

`manifiesto_ingenieria_software_era_ia.md` es la fuente de contenido y **no se modifica**; `manifesto_software_engineering_ai_era.md` es su traducción al inglés, con la misma estructura. `scripts/generate.mjs` las lee y genera `index.html` (español) y `en/index.html` (inglés), además de copias descargables idénticas en `public/`. Los textos de interfaz de cada idioma están en `languages` dentro del generador. El HTML contiene todo el texto, incluso sin JavaScript. No editar el HTML generado: la presentación está en `src/template.html`, `src/style.css` y `src/main.js`.

La página es única y vertical: portada → 01 Preámbulo → 02 Visión → 03 Valores (carrusel horizontal con scroll-snap y botones) → 04 Principios (pista horizontal anclada con ScrollTrigger en escritorio; carrusel nativo en móvil o con movimiento reducido) → 05 Compromisos → 06 Señales de alarma ↔ Ingeniería saludable (cada señal emparejada con su punto saludable) → Declaración final. Tipografía DM Sans, retícula técnica en la portada y acento índigo común.

Idioma: el selector ES/EN de la barra superior cambia de versión conservando la sección actual y resalta el idioma activo. Antes del primer pintado se elige la versión: la guardada en `localStorage`; si no hay, la del navegador (español → raíz, cualquier otro idioma → `en/`). El enlace de descarga del índice apunta al original del idioma activo.

Modo claro/oscuro: el botón superior derecho alterna el modo; el valor inicial sigue `prefers-color-scheme`, la elección se guarda en `localStorage` y se aplica antes del primer pintado. La portada y la declaración final (`data-contrast`) usan siempre el modo opuesto; los principios son siempre oscuros. Lenis suaviza el scroll en dispositivos de puntero preciso. Se respeta `prefers-reduced-motion`, también cuando cambia durante la visita.

Datos de principios: `src/data/principios-evidencia.json` permite añadir un dato verificable (valor, texto, fuente y URL opcional) a cada principio. Con `null` no se muestra nada.

## Comprobaciones

```sh
npm run lint
npm test          # tests unitarios (node:test) + build + Playwright
npm run test:unit # solo la validación de firmas
```

Los tests de Playwright comprueban integridad del contenido, descarga original, navegación, historial, progreso, pista de principios, carrusel de valores, emparejamiento alarma ↔ salud, modo claro/oscuro, vistas responsive, alternativa sin JavaScript, diálogo y sección de firmas, y accesibilidad automatizada con axe en ambos modos. Si Chromium no está instalado: `npx playwright install chromium`.
