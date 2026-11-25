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

Publicar la carpeta `dist/` en cualquier alojamiento estático. No necesita servidor de aplicaciones, servicios externos ni CDN. Las fuentes y dependencias se sirven localmente.

## Contenido

`manifiesto_ingenieria_software_era_ia.md` es la fuente de contenido y **no se modifica**; `manifesto_software_engineering_ai_era.md` es su traducción al inglés, con la misma estructura. `scripts/generate.mjs` las lee y genera `index.html` (español) y `en/index.html` (inglés), además de copias descargables idénticas en `public/`. Los textos de interfaz de cada idioma están en `languages` dentro del generador. El HTML contiene todo el texto, incluso sin JavaScript. No editar el HTML generado: la presentación está en `src/template.html`, `src/style.css` y `src/main.js`.

La página es única y vertical: portada → 01 Preámbulo → 02 Visión → 03 Valores (carrusel horizontal con scroll-snap y botones) → 04 Principios (pista horizontal anclada con ScrollTrigger en escritorio; carrusel nativo en móvil o con movimiento reducido) → 05 Compromisos → 06 Señales de alarma ↔ Ingeniería saludable (cada señal emparejada con su punto saludable) → Declaración final. Tipografía DM Sans, retícula técnica en la portada y acento índigo común.

Idioma: el selector ES/EN de la barra superior cambia de versión conservando la sección actual y resalta el idioma activo. Antes del primer pintado se elige la versión: la guardada en `localStorage`; si no hay, la del navegador (español → `/`, cualquier otro idioma → `/en/`). El enlace de descarga del índice apunta al original del idioma activo.

Modo claro/oscuro: el botón superior derecho alterna el modo; el valor inicial sigue `prefers-color-scheme`, la elección se guarda en `localStorage` y se aplica antes del primer pintado. La portada y la declaración final (`data-contrast`) usan siempre el modo opuesto; los principios son siempre oscuros. Lenis suaviza el scroll en dispositivos de puntero preciso. Se respeta `prefers-reduced-motion`, también cuando cambia durante la visita.

Datos de principios: `src/data/principios-evidencia.json` permite añadir un dato verificable (valor, texto, fuente y URL opcional) a cada principio. Con `null` no se muestra nada.

## Comprobaciones

```sh
npm run lint
npm test
```

Los tests de Playwright comprueban integridad del contenido, descarga original, navegación, historial, progreso, pista de principios, carrusel de valores, emparejamiento alarma ↔ salud, modo claro/oscuro, vistas responsive, alternativa sin JavaScript y accesibilidad automatizada con axe en ambos modos. Si Chromium no está instalado: `npx playwright install chromium`.
