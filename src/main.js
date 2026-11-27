import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const sections = [document.querySelector('#inicio'), ...document.querySelectorAll('#declaration-content > section')];
const progress = document.querySelector('.reading-progress');
const progressFill = progress.firstElementChild;
const dialog = document.querySelector('#chapter-index');
const dialogs = [dialog];
const openIndex = document.querySelector('[data-open-index]');
const navigationLinks = [...document.querySelectorAll('[data-chapter-link]')];
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let lenis;
let cancelNativeNavigation;

// ---------- Light / dark mode ----------
const THEME_KEY = 'declaracion-tema';
const themeColors = { light: '#f3f5f9', dark: '#10141a' };
const modeToggle = document.querySelector('[data-mode-toggle]');
const modeLabel = modeToggle.querySelector('.mode-label');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const storedTheme = () => {
  try { return localStorage.getItem(THEME_KEY); } catch { return null; }
};

function applyTheme(theme, { persist = false, animate = false } = {}) {
  if (animate && !reducedMotionQuery.matches) {
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 450);
  }
  root.dataset.theme = theme;
  const isDark = theme === 'dark';
  modeLabel.textContent = isDark ? modeToggle.dataset.labelLight : modeToggle.dataset.labelDark;
  modeToggle.setAttribute('aria-label', isDark ? modeToggle.dataset.ariaLight : modeToggle.dataset.ariaDark);
  themeMeta.content = themeColors[theme];
  if (persist) {
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* storage unavailable */ }
  }
}

applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
modeToggle.hidden = false;
modeToggle.addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', { persist: true, animate: true }));
colorSchemeQuery.addEventListener('change', (event) => {
  if (!storedTheme()) applyTheme(event.matches ? 'dark' : 'light', { animate: true });
});

// ---------- Progress and current section ----------
ScrollTrigger.create({
  start: 0,
  end: 'max',
  onUpdate: (self) => {
    progressFill.style.transform = `scaleX(${self.progress})`;
    progress.setAttribute('aria-valuenow', String(Math.round(self.progress * 100)));
  },
});

let currentSection;
function setCurrent(section) {
  currentSection = section;
  navigationLinks.forEach((link) => {
    if (link.hash === `#${section.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

sections.forEach((section) => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top 45%',
    end: 'bottom 45%',
    onToggle: (self) => { if (self.isActive) setCurrent(section); },
  });
});

// ---------- Values carousel ----------
const valuesTrack = document.querySelector('#values-track');
const carouselButtons = [...document.querySelectorAll('[data-carousel-dir]')];
function updateCarouselButtons() {
  const max = valuesTrack.scrollWidth - valuesTrack.clientWidth - 2;
  carouselButtons.forEach((button) => {
    button.disabled = button.dataset.carouselDir === '-1' ? valuesTrack.scrollLeft <= 2 : valuesTrack.scrollLeft >= max;
  });
}
carouselButtons.forEach((button) => button.addEventListener('click', () => {
  const card = valuesTrack.querySelector('.value-card');
  const step = card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(valuesTrack).columnGap || 0) : valuesTrack.clientWidth * .8;
  valuesTrack.scrollBy({ left: Number(button.dataset.carouselDir) * step, behavior: reducedMotionQuery.matches ? 'instant' : 'smooth' });
}));
valuesTrack.addEventListener('scroll', updateCarouselButtons, { passive: true });
window.addEventListener('resize', updateCarouselButtons);
updateCarouselButtons();

// ---------- Motion ----------
const principles = document.querySelector('[data-principles]');
const principlesTrack = principles.querySelector('.principles-track');
let principlesTrigger;

// Equalize closed principle cards: min-height = tallest card with every <details> closed.
const principleCards = [...principles.querySelectorAll('.principle-card')];
function equalizePrincipleCards() {
  const opened = principleCards.flatMap((c) => [...c.querySelectorAll('details[open]')]);
  principleCards.forEach((c) => { c.style.minHeight = ''; });
  opened.forEach((d) => d.removeAttribute('open'));
  const h = Math.max(...principleCards.map((c) => c.offsetHeight));
  opened.forEach((d) => d.setAttribute('open', ''));
  principleCards.forEach((c) => { c.style.minHeight = `${h}px`; });
}
equalizePrincipleCards();
document.fonts?.ready.then(() => { equalizePrincipleCards(); ScrollTrigger.refresh(); });
window.addEventListener('resize', equalizePrincipleCards);

const motion = gsap.matchMedia();
motion.add('(prefers-reduced-motion: no-preference) and (pointer: fine)', () => {
  lenis = new Lenis({ lerp: .09, smoothWheel: true, syncTouch: false, allowNestedScroll: true });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  if (dialogs.some((d) => d.open)) lenis.stop();
  return () => {
    lenis.destroy();
    lenis = undefined;
    gsap.ticker.remove(tick);
  };
});

// Vertical scroll drives the principles track horizontally. Small screens and
// reduced motion keep a native horizontal scroll-snap carousel instead.
motion.add('(prefers-reduced-motion: no-preference) and (min-width: 900px)', () => {
  principles.classList.add('is-pinned');
  const distance = () => Math.max(0, principlesTrack.scrollWidth - window.innerWidth);
  const tween = gsap.to(principlesTrack, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: principles,
      pin: true,
      scrub: true,
      start: 'top top',
      end: () => `+=${distance()}`,
      invalidateOnRefresh: true,
      refreshPriority: 1,
    },
  });
  principlesTrigger = tween.scrollTrigger;
  ScrollTrigger.refresh();
  return () => {
    principlesTrigger = undefined;
    principles.classList.remove('is-pinned');
  };
});

// Keyboard focus inside the pinned track: scroll vertically to the card instead of letting the browser shift the clipped container.
principles.addEventListener('focusin', (event) => {
  const card = event.target.closest('.principle-card');
  principles.scrollLeft = 0;
  // Pointer focus (mousedown) must not move the page, or the click ends up outside the summary.
  if (!card || !principlesTrigger || !event.target.matches(':focus-visible')) return;
  const max = principlesTrack.scrollWidth - window.innerWidth;
  const x = Math.min(max, Math.max(0, card.offsetLeft - (window.innerWidth - card.offsetWidth) / 2));
  const y = principlesTrigger.start + (max ? x / max : 0) * (principlesTrigger.end - principlesTrigger.start);
  if (lenis) lenis.scrollTo(y, { immediate: true });
  else window.scrollTo({ top: y, behavior: 'instant' });
  ScrollTrigger.update();
});

motion.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.utils.toArray('.section .section-head, .steps li, .value-card, .commitment-grid li, .pair-bad, .pair-good, .closing-quote').forEach((element) => {
    gsap.fromTo(element, { y: 24, opacity: .85 }, {
      y: 0, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: element, start: 'top 98%', end: 'top 78%', scrub: true },
    });
  });
});

// ---------- Navigation ----------
function openDialog(target) {
  target.showModal();
  document.body.classList.add('menu-open');
  lenis?.stop();
}

function closeDialog() {
  const open = dialogs.find((d) => d.open);
  if (!open) return;
  open.close();
  // The dialog's close event is queued; scrolling must resume before navigation.
  document.body.classList.remove('menu-open');
  lenis?.start();
}

function navigateTo(target, { updateHistory = true, focus = true } = {}) {
  cancelNativeNavigation?.();
  if (updateHistory && location.hash !== `#${target.id}`) history.pushState(null, '', `#${target.id}`);
  const finish = () => {
    cancelNativeNavigation?.();
    const heading = target.matches('h1, h2, h3') ? target : target.querySelector('h1, h2, h3') ?? target;
    if (focus) {
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
    ScrollTrigger.update();
  };
  if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.15, onComplete: finish });
    return;
  }
  if (reducedMotionQuery.matches) {
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
    finish();
    return;
  }
  let destination;
  const onScrollEnd = () => {
    if (Math.abs(window.scrollY - destination) <= 2) finish();
  };
  const interrupt = () => cancelNativeNavigation?.();
  const interruptEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
  // Let modal layout settle before measuring the destination.
  const frame = requestAnimationFrame(() => {
    destination = Math.round(target.getBoundingClientRect().top + window.scrollY);
    if (Math.abs(window.scrollY - destination) <= 2) finish();
    else {
      window.addEventListener('scrollend', onScrollEnd);
      interruptEvents.forEach((name) => window.addEventListener(name, interrupt, { passive: true }));
      window.scrollTo({ top: destination, behavior: 'smooth' });
      if (!('onscrollend' in window)) finish();
    }
  });
  cancelNativeNavigation = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scrollend', onScrollEnd);
    interruptEvents.forEach((name) => window.removeEventListener(name, interrupt));
    cancelNativeNavigation = undefined;
  };
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
  if (!target) return;
  event.preventDefault();
  closeDialog();
  navigateTo(target);
});

openIndex.hidden = false;
openIndex.addEventListener('click', () => openDialog(dialog));
dialogs.forEach((d) => {
  d.querySelector('.close-index').addEventListener('click', closeDialog);
  d.addEventListener('click', (event) => {
    const bounds = d.getBoundingClientRect();
    if (event.target === d && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeDialog();
  });
  d.addEventListener('close', () => {
    document.body.classList.remove('menu-open');
    lenis?.start();
  });
});

window.addEventListener('popstate', () => {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)) || 'inicio');
  if (target) {
    closeDialog();
    navigateTo(target, { updateHistory: false });
  }
});

document.fonts.ready.then(() => {
  lenis?.resize();
  ScrollTrigger.refresh();
  updateCarouselButtons();
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) navigateTo(target, { updateHistory: false, focus: false });
});

setCurrent(sections[0]);

// ---------- Language ----------
// The choice is saved so the pre-paint redirect respects it; the counterpart of the current section is kept.
const LANG_KEY = 'declaracion-idioma';
const langMap = JSON.parse(document.querySelector('#lang-map').textContent);
document.querySelectorAll('.lang-switch a[data-lang]').forEach((link) => link.addEventListener('click', (event) => {
  try { localStorage.setItem(LANG_KEY, link.dataset.lang); } catch { /* storage unavailable */ }
  if (link.dataset.lang === root.lang) {
    event.preventDefault();
    return;
  }
  const id = currentSection && currentSection.id !== 'inicio' ? langMap.ids[currentSection.id] : '';
  link.href = langMap.href + (id ? `#${id}` : '');
}));
