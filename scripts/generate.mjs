import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { BASE } from './site.mjs';

const root = new URL('../', import.meta.url);
const evidence = JSON.parse(await readFile(new URL('src/data/principios-evidencia.json', root), 'utf8')).principios;
const template = await readFile(new URL('src/template.html', root), 'utf8');
const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const slug = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const pad = (n) => String(n).padStart(2, '0');
const parse = (list) => marked.parser(list);
const inline = (text) => marked.parseInline(text);
const byH3 = (list) => {
  const groups = [];
  for (const token of list) {
    if (token.type === 'heading' && token.depth === 3) groups.push({ heading: token, tokens: [] });
    else groups.at(-1)?.tokens.push(token);
  }
  return groups;
};
const listOf = (list) => list.find((token) => token.type === 'list');

// Each language: Markdown source, output page, chapter headings (in page order) and interface texts.
const languages = {
  es: {
    source: 'declaracion_ingenieria_software_era_ia.md',
    output: 'index.html',
    href: BASE,
    chapters: ['Preámbulo', 'Nuestra visión', 'Nuestros valores', 'Principios', 'Compromisos de ingeniería', 'Señales de alarma', 'Cómo reconoceremos una ingeniería saludable', 'Declaración final'],
    versus: 'sobre',
    stancePrefix: 'No ',
    t: {
      description: 'La inteligencia artificial genera posibilidades. La ingeniería genera garantías. Una declaración sobre evidencia, responsabilidad humana y software digno de confianza.',
      skip: 'Saltar a la declaración', progress: 'Progreso de lectura', language: 'Idioma', index: 'Índice',
      dark: 'Oscuro', light: 'Claro', toDark: 'Cambiar a modo oscuro', toLight: 'Cambiar a modo claro',
      heroHeading: 'La IA genera <em>posibilidades</em>.<br />La ingeniería genera <mark>garantías</mark>.',
      heroDescription: 'No se trata de generar más software. Se trata de construir software digno de confianza.',
      sections: 'Secciones de la declaración', eyebrow: 'La declaración', close: 'Cerrar', closeIndex: 'Cerrar índice',
      indexNav: 'Índice de secciones', download: 'Descargar el documento original',
      pullQuote: 'Cita destacada', prevValue: 'Valor anterior', nextValue: 'Valor siguiente', valuesRegion: 'Valores. Desplazamiento horizontal',
      newTab: 'abre una nueva pestaña', evidence: 'Dato que respalda el principio', source: 'Fuente',
      fundamentals: 'fundamentos.', hintPinned: 'Sigue desplazándote: avanzan en horizontal.', hintSwipe: 'Desliza para recorrerlos.',
      readMore: 'Leer el principio completo', versusLabel: 'sobre', healthy: 'Ingeniería saludable',
    },
  },
  en: {
    source: 'declaration_software_engineering_ai_era.md',
    output: 'en/index.html',
    href: `${BASE}en/`,
    chapters: ['Preamble', 'Our vision', 'Our values', 'Principles', 'Engineering commitments', 'Warning signs', 'How we will recognize healthy engineering', 'Final declaration'],
    versus: 'over',
    stancePrefix: 'We do not ',
    t: {
      description: 'Artificial intelligence generates possibilities. Engineering generates guarantees. A declaration on evidence, human accountability and trustworthy software.',
      skip: 'Skip to the declaration', progress: 'Reading progress', language: 'Language', index: 'Index',
      dark: 'Dark', light: 'Light', toDark: 'Switch to dark mode', toLight: 'Switch to light mode',
      heroHeading: 'AI generates <em>possibilities</em>.<br />Engineering generates <mark>guarantees</mark>.',
      heroDescription: 'It is not about generating more software. It is about building trustworthy software.',
      sections: 'Declaration sections', eyebrow: 'The declaration', close: 'Close', closeIndex: 'Close index',
      indexNav: 'Section index', download: 'Download the original document',
      pullQuote: 'Highlighted quote', prevValue: 'Previous value', nextValue: 'Next value', valuesRegion: 'Values. Horizontal scrolling',
      newTab: 'opens in a new tab', evidence: 'Data supporting the principle', source: 'Source',
      fundamentals: 'fundamentals.', hintPinned: 'Keep scrolling: they move horizontally.', hintSwipe: 'Swipe to browse them.',
      readMore: 'Read the full principle', versusLabel: 'over', healthy: 'Healthy engineering',
    },
  },
};
const switcher = (current) => Object.entries({ es: 'Español', en: 'English' }).map(([code, name]) =>
  `<a href="${languages[code].href}" hreflang="${code}" lang="${code}" data-lang="${code}"${code === current ? ' aria-current="true"' : ''}><span aria-hidden="true">${code.toUpperCase()}</span><span class="sr-only">${name}</span></a>`).join('');

// Stroke icons (24×24) shared by every section.
const P = {
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  brain: '<path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3h1V3H9Zm6 0a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3h-1V3h1Z"/>',
  check: '<path d="M4 12.5 9 17.5 20 6.5"/>',
  shield: '<path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
  radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12 19 5"/>',
  sprout: '<path d="M12 21v-9"/><path d="M12 12C12 7 8 4 3 4c0 5 4 8 9 8Zm0 0c0-4 3-7 9-7 0 5-4 7-9 7Z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  split: '<path d="M6 3v6a6 6 0 0 0 6 6h0a6 6 0 0 1 6 6M18 3v6a6 6 0 0 1-6 6"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9m-3 3 3 3"/>',
  gauge: '<path d="M3 15a9 9 0 0 1 18 0"/><path d="m12 15 5-5"/>',
  log: '<path d="M5 3h10l4 4v14H5Z"/><path d="M9 11h6M9 15h6M9 7h3"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z"/>',
  loop: '<path d="M17 2l4 4-4 4"/><path d="M3 12V10a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 12v2a4 4 0 0 1-4 4H3"/>',
  flask: '<path d="M9 3h6M10 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-10V3"/><path d="M7 15h10"/>',
  alert: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17v.5"/>',
  file: '<path d="M6 2h9l5 5v15H6Z"/><path d="M14 2v6h6"/>',
  pr: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 7v10M18 17V9a3 3 0 0 0-3-3h-4"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
};
const icon = (name, className = 'icon') => `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name]}</svg>`;
const valorIcons = ['eye', 'user', 'brain', 'check', 'shield', 'radar', 'sprout'];
const principioIcons = ['user', 'flask', 'file', 'shield', 'check', 'gauge', 'eye', 'chart', 'radar', 'bulb', 'split', 'loop'];
const compromisoIcons = ['target', 'user', 'lock', 'split', 'key', 'gauge', 'log', 'chart', 'undo', 'bulb', 'loop', 'compass'];
const alarmaIcons = ['pr', 'flask', 'shield', 'chart', 'brain', 'file', 'key', 'eye', 'alert', 'gauge'];

async function render(code) {
  const lang = languages[code];
  const { t } = lang;
  const markdown = await readFile(new URL(lang.source, root), 'utf8');
  const tokens = marked.lexer(markdown);
  const title = tokens.find((token) => token.type === 'heading' && token.depth === 1).text;
  const chapters = {};
  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === 2) chapters[token.text] = { title: token.text, id: slug(token.text), tokens: [] };
    else if (Object.keys(chapters).length && token.type !== 'hr') Object.values(chapters).at(-1).tokens.push(token);
  }
  const chapter = (name) => {
    if (!chapters[name]) throw new Error(`Falta la sección «${name}» en ${lang.source}`);
    return chapters[name];
  };
  const sectionHead = (tag, ch, extra = '') => `<header class="section-head"><span class="section-tag">${tag}</span><h2 id="${ch.id}-title" tabindex="-1">${escape(ch.title)}</h2>${extra}</header>`;

  const [preambulo, vision, valores, principios, compromisos, alarmas, saludable, final] = lang.chapters.map(chapter);

  const preambuloHTML = `<section class="section preamble" id="${preambulo.id}" aria-labelledby="${preambulo.id}-title">
    ${sectionHead('01', preambulo)}
    <div class="preamble-layout">
      <div class="prose-columns">${parse(preambulo.tokens.filter((t) => t.type !== 'blockquote'))}</div>
      <aside class="pull-quote" aria-label="${t.pullQuote}">${parse(preambulo.tokens.filter((t) => t.type === 'blockquote'))}</aside>
    </div>
  </section>`;

  const visionHTML = `<section class="section vision" id="${vision.id}" aria-labelledby="${vision.id}-title">
    ${sectionHead('02', vision)}
    <ol class="steps">${vision.tokens.filter((t) => t.type === 'paragraph').map((t, i) => `<li data-step="${pad(i + 1)}">${inline(t.text)}</li>`).join('')}</ol>
  </section>`;

  const valoresHTML = `<section class="section values" id="${valores.id}" aria-labelledby="${valores.id}-title">
    ${sectionHead('03', valores, `<div class="carousel-nav"><button type="button" class="carousel-button" data-carousel-dir="-1" aria-label="${t.prevValue}" aria-controls="values-track"><span aria-hidden="true">←</span></button><button type="button" class="carousel-button" data-carousel-dir="1" aria-label="${t.nextValue}" aria-controls="values-track"><span aria-hidden="true">→</span></button></div>`)}
    <div class="values-track" id="values-track" role="region" aria-label="${t.valuesRegion}" tabindex="0">${byH3(valores.tokens).map(({ heading, tokens: body }, i) => {
      const [win, lose] = heading.text.split(` ${lang.versus} `);
      return `<article class="value-card" aria-labelledby="valor-${i + 1}">
        <span class="icon-box">${icon(valorIcons[i])}</span>
        <h3 class="versus" id="valor-${i + 1}"><strong>${escape(win)}</strong> <span class="versus-label"><span class="sr-only">${lang.versus}</span><span aria-hidden="true">${t.versusLabel}</span></span> <em>${escape(lose)}</em></h3>
        ${parse(body)}
      </article>`;
    }).join('')}</div>
  </section>`;

  const renderEvidence = (n) => {
    const data = evidence?.[n];
    if (!data?.valor || !data?.texto || !data?.fuente) return '';
    const source = data.url ? `<a href="${escape(data.url)}" target="_blank" rel="noopener noreferrer">${escape(data.fuente)}<span class="sr-only"> (${t.newTab})</span></a>` : escape(data.fuente);
    return `<aside class="principle-evidence" aria-label="${t.evidence}"><b>${escape(data.valor)}</b><span>${escape(data.texto)}</span><small>${t.source}: ${source}</small></aside>`;
  };
  const principleGroups = byH3(principios.tokens);
  const principiosHTML = `<section class="principles" id="${principios.id}" aria-labelledby="${principios.id}-title" data-principles>
    <div class="principles-track">
      <div class="principles-intro">${sectionHead('04', principios)}<div class="principles-hint">${principleGroups.length} ${t.fundamentals} <span class="hint-pinned">${t.hintPinned}</span><span class="hint-swipe">${t.hintSwipe}</span></div></div>
      ${principleGroups.map(({ heading, tokens: body }, i) => {
        const [, n, text] = heading.text.match(/^(\d+)\.\s*(.*)$/);
        const firstParagraph = body.findIndex((t) => t.type === 'paragraph');
        const quote = body.find((t) => t.type === 'blockquote');
        const rest = body.filter((t, index) => index !== firstParagraph && t !== quote && t.type !== 'space');
        const id = slug(heading.text);
        return `<article class="principle-card" id="${id}" aria-labelledby="${id}-title">
          <span class="principle-number" data-number="${pad(n)}" aria-hidden="true"></span>
          ${icon(principioIcons[i], 'icon icon-mid')}
          <h3 id="${id}-title"><span class="sr-only">${n}. </span>${escape(text)}</h3>
          ${quote ? parse([quote]) : ''}
          ${parse([body[firstParagraph]])}
          ${renderEvidence(n)}
          ${rest.length ? `<details><summary>${t.readMore}</summary>${parse(rest)}</details>` : ''}
        </article>`;
      }).join('')}
    </div>
  </section>`;

  const compromisosHTML = `<section class="section commitments" id="${compromisos.id}" aria-labelledby="${compromisos.id}-title">
    ${sectionHead('05', compromisos)}
    ${parse(compromisos.tokens.filter((t) => t.type === 'paragraph')).replace('<p>', '<p class="lede">')}
    <ol class="commitment-grid">${listOf(compromisos.tokens).items.map((item, i) => {
      const [, strong, rest] = item.text.match(/^\*\*(.+?)\*\*\s*(.*)$/s);
      return `<li>${icon(compromisoIcons[i], 'icon icon-mid')}<strong class="commitment-title">${inline(strong)}</strong> <span>${inline(rest)}</span></li>`;
    }).join('')}</ol>
  </section>`;

  const alarmItems = listOf(alarmas.tokens).items;
  const healthyItems = listOf(saludable.tokens).items;
  if (alarmItems.length !== healthyItems.length) throw new Error(`${lang.source}: «${alarmas.title}» y «${saludable.title}» deben tener el mismo número de puntos`);
  const intro = (ch) => parse(ch.tokens.filter((t) => t.type === 'paragraph'));
  const pairsHTML = `<section class="section pairs" id="${alarmas.id}" aria-labelledby="${alarmas.id}-title ${saludable.id}-title">
    <header class="section-head"><span class="section-tag">06</span><span class="section-title" aria-hidden="true">${escape(alarmas.title)} <span class="pairs-arrow">↔</span> ${t.healthy}</span></header>
    <div class="pairs-intro"><div class="bad-text">${intro(alarmas)}</div><div class="good-text">${intro(saludable)}</div></div>
    <div class="pairs-head">
      <h2 class="bad-text" id="${alarmas.id}-title" tabindex="-1">${icon('alert')}${escape(alarmas.title)}</h2>
      <h2 class="good-text" id="${saludable.id}" tabindex="-1">${icon('check')}<span>${escape(saludable.title)}</span></h2>
    </div>
    <div class="pairs-grid">
      <ul class="pair-list pair-list-bad" aria-labelledby="${alarmas.id}-title">${alarmItems.map((item, i) => `<li class="pair-bad" style="--row: ${i + 1}">${icon(alarmaIcons[i])}<span>${inline(item.text)}</span></li>`).join('')}</ul>
      ${alarmItems.map((_, i) => `<span class="pair-arrow" style="--row: ${i + 1}" aria-hidden="true">→</span>`).join('')}
      <ul class="pair-list pair-list-good" aria-labelledby="${saludable.id}">${healthyItems.map((item, i) => `<li class="pair-good" style="--row: ${i + 1}">${icon('check')}<span>${inline(item.text)}</span></li>`).join('')}</ul>
    </div>
  </section>`;

  // "No …" paragraphs become a list of stances; the remaining paragraphs close the section.
  const finalParagraphs = final.tokens.filter((t) => t.type === 'paragraph');
  const stances = finalParagraphs.filter((t) => t.text.startsWith(lang.stancePrefix));
  const finalOutro = finalParagraphs.filter((t) => !stances.includes(t));
  const finalHTML = `<section class="section closing" id="${final.id}" aria-labelledby="${final.id}-title">
    ${sectionHead('07', final)}
    <ul class="closing-stances">${stances.map((t) => {
      const [, negation, affirmation] = t.text.match(/^(.+?\.)\s+(.+)$/s) ?? [t.text, t.text, ''];
      return `<li><span class="stance-no">${inline(negation)}</span>${affirmation ? ` <strong class="stance-yes">${inline(affirmation)}</strong>` : ''}</li>`;
    }).join('')}</ul>
    <div class="closing-outro">${parse(finalOutro)}</div>
  </section>
  <div class="closing-quote" data-contrast>${parse(final.tokens.filter((t) => t.type === 'blockquote'))}</div>`;

  const navItems = [
    [preambulo.id, preambulo.title], [vision.id, vision.title], [valores.id, valores.title], [principios.id, principios.title],
    [compromisos.id, compromisos.title], [alarmas.id, `${alarmas.title} ↔ ${t.healthy}`], [final.id, final.title],
  ];
  const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" stroke="currentColor" stroke-width="1.5"/></svg>';
  const html = template
    .replace(/\{\{T\.(\w+)\}\}/g, (_, key) => (key.startsWith('hero') ? t[key] : escape(t[key])))
    .replaceAll('{{BASE}}', BASE)
    .replaceAll('{{LANG}}', code)
    .replaceAll('{{SOURCE}}', lang.source)
    .replaceAll('{{FIRST_ID}}', preambulo.id)
    .replace('{{LANG_SWITCH}}', switcher(code))
    .replaceAll('{{TITLE}}', escape(title))
    .replace('{{SECTIONS}}', [preambuloHTML, visionHTML, valoresHTML, principiosHTML, compromisosHTML, pairsHTML, finalHTML].join('\n'))
    .replace('{{TOC}}', navItems.map(([id, text], i) => `<a href="#${id}" data-chapter-link="${id}"><span>${pad(i + 1)}</span> ${escape(text)}</a>`).join(''))
    .replace('{{INDEX}}', navItems.map(([id, text], i) => `<a href="#${id}" data-chapter-link="${id}"><span class="index-number">${pad(i + 1)}</span><span>${escape(text)}</span>${arrow}</a>`).join('\n'));
  // Ids in page order, so a section or principle can be matched with its counterpart in the other language.
  const ids = ['inicio', ...[preambulo, vision, valores, principios, compromisos, alarmas, saludable, final].map((ch) => ch.id), ...principleGroups.map(({ heading }) => slug(heading.text))];
  return { code, html, ids, sections: navItems.length };
}

const pages = await Promise.all(Object.keys(languages).map(render));
await mkdir(new URL('public/', root), { recursive: true });
for (const page of pages) {
  const lang = languages[page.code];
  const other = pages.find((candidate) => candidate !== page);
  const map = { href: languages[other.code].href, ids: Object.fromEntries(page.ids.map((id, i) => [id, other.ids[i]])) };
  const output = new URL(lang.output, root);
  await mkdir(new URL('./', output), { recursive: true });
  await writeFile(output, page.html.replace('{{LANG_MAP}}', JSON.stringify(map)));
  await copyFile(new URL(lang.source, root), new URL(`public/${lang.source}`, root));
  console.log(`HTML estático generado (${page.code}): ${page.sections} secciones + portada. Fuente intacta: ${fileURLToPath(new URL(lang.source, root))}`);
}
