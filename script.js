const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EMAIL = 'mhuda223303@bscse.uiu.ac.bd';
const CV_URL = 'MD-Nurul-Huda-CV.pdf';

// Analytics helper (Google Analytics is loaded in <head>)
function track(name, params) {
  if (typeof gtag === 'function') gtag('event', name, params);
}

function savePref(key, value) {
  try { localStorage.setItem(key, value); } catch (e) {}
}


// Navigation
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

function onScroll() {
  nav.classList.toggle('is-scrolled', window.scrollY > 12);
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

function closeMenu() {
  navLinks.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open menu');
}

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', open);
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

// Highlight the nav link of the section in view
const navAnchors = Array.from(navLinks.querySelectorAll('a'));
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.dataset.nav || entry.target.id;
    navAnchors.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });

document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));

// Theme toggle (follows system preference until the visitor picks one)
const themeToggle = document.getElementById('themeToggle');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function currentTheme() {
  return root.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  savePref('theme', next);
  track('preference', { theme: next });
});

// View (2D / 3D)
const viewToggle = document.getElementById('viewToggle');

function setView(next) {
  root.setAttribute('data-view', next);
  savePref('view', next);
  window.scrollTo(0, 0);
}

viewToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-view') === '3d' ? '2d' : '3d';
  setView(next);
  track('preference', { view: next });
});

// Dhaka local time (12-hour)
const clock = document.getElementById('clock');

const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' });

function updateClock() {
  clock.textContent = `Dhaka ${timeFormat.format(new Date())}`;
}

updateClock();
setInterval(updateClock, 15000);

// Quotes
const quoteBody = document.getElementById('quoteBody');
const quoteCat = document.getElementById('quoteCat');
const quoteOrig = document.getElementById('quoteOrig');
const quoteTrans = document.getElementById('quoteTrans');
const quoteSrc = document.getElementById('quoteSrc');
const quoteBar = document.getElementById('quoteBar');
const QUOTE_TIME = 9000;
const QUOTE_CATEGORIES = { quran: 'Al-Quran', hadith: 'Hadith', poet: 'Poet', literature: 'Literature', philosophy: 'Philosophy' };
let quoteIndex = Math.floor(Math.random() * window.QUOTES.length);

function renderQuote(animate = true) {
  const q = window.QUOTES[quoteIndex];
  const fill = () => {
    quoteCat.textContent = QUOTE_CATEGORIES[q.cat];
    quoteOrig.textContent = q.orig.text;
    quoteOrig.lang = q.orig.lang;
    quoteOrig.dir = q.orig.lang === 'ar' ? 'rtl' : 'ltr';
    quoteTrans.textContent = q.trans ? q.trans.text : '';
    quoteTrans.lang = q.trans ? q.trans.lang : '';
    quoteSrc.textContent = q.src;
    quoteSrc.lang = /[\u0980-\u09FF]/.test(q.src) ? 'bn' : 'en';
    quoteBody.classList.remove('is-changing');
  };
  if (animate && !reduceMotion) {
    quoteBody.classList.add('is-changing');
    setTimeout(fill, 300);
  } else {
    fill();
  }
  restartQuoteTimer();
}

function restartQuoteTimer() {
  if (reduceMotion) return;
  quoteBar.classList.remove('is-running');
  void quoteBar.offsetWidth;
  quoteBar.style.setProperty('--quote-time', `${QUOTE_TIME}ms`);
  quoteBar.classList.add('is-running');
}

function stepQuote(dir) {
  quoteIndex = (quoteIndex + dir + window.QUOTES.length) % window.QUOTES.length;
  renderQuote();
}

// The progress bar drives rotation, so hovering the card (which pauses the bar) pauses the quotes too
quoteBar.addEventListener('animationend', () => stepQuote(1));
document.getElementById('quotePrev').addEventListener('click', () => stepQuote(-1));
document.getElementById('quoteNext').addEventListener('click', () => stepQuote(1));

// Reveal on scroll
const revealTargets = document.querySelectorAll('.section-head, .about-grid, .xp-item, .award, .project, .skill-card, .console, .contact-grid, .stats');

if (!reduceMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  revealTargets.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
}

// Project filters
const filterButtons = document.querySelectorAll('.filters .chip');
const projects = document.querySelectorAll('.project');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(b => b.classList.toggle('is-active', b === button));
    projects.forEach(project => {
      const show = filter === 'all' || project.dataset.tags.split(' ').includes(filter);
      project.classList.toggle('is-hidden', !show);
      if (show) project.classList.add('is-visible');
    });
    projectList.scrollTo({ left: 0 });
    updateCarousel();
    track('project_filter', { filter });
  });
});

// Projects carousel (desktop): one screen tall, scroll sideways
const projectList = document.querySelector('.projects');
const projPrev = document.getElementById('projPrev');
const projNext = document.getElementById('projNext');

function updateCarousel() {
  const max = projectList.scrollWidth - projectList.clientWidth;
  projPrev.disabled = projectList.scrollLeft <= 4;
  projNext.disabled = projectList.scrollLeft >= max - 4;
}

function stepCarousel(dir) {
  const card = projectList.querySelector('.project:not(.is-hidden)');
  const gap = parseFloat(getComputedStyle(projectList).columnGap) || 16;
  projectList.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: reduceMotion ? 'auto' : 'smooth' });
}

projPrev.addEventListener('click', () => stepCarousel(-1));
projNext.addEventListener('click', () => stepCarousel(1));
projectList.addEventListener('scroll', updateCarousel, { passive: true });
window.addEventListener('resize', updateCarousel);
updateCarousel();

// Terminal
const terminalBody = document.getElementById('terminalBody');
const terminalOutput = document.getElementById('terminalOutput');
const terminalInput = document.getElementById('terminalInput');

const commands = {
  help: () => [
    { text: 'Available commands:', class: 'info' },
    { text: '  about        who I am' },
    { text: '  education    degrees and results' },
    { text: '  experience   roles and leadership' },
    { text: '  projects     selected work' },
    { text: '  awards       achievements' },
    { text: '  skills       languages and tools' },
    { text: '  contact      how to reach me' },
    { text: '  quote        a random quote' },
    { text: '  cv           open my CV (PDF)' },
    { text: '  github       open my GitHub' },
    { text: '  linkedin     open my LinkedIn' },
    { text: '  email        copy my email' },
    { text: '  theme        toggle light/dark' },
    { text: '  3d / 2d      open the 3D book / back to the page' },
    { text: '  clear        clear the screen' },
  ],

  about: () => [
    { text: 'MD. Nurul Huda (Arosh)', class: 'title' },
    { text: 'B.Sc. in CSE, United International University, Dhaka' },
    { text: 'CSE graduate (2026) · Senior Executive, UIU Robotics Club' },
    { text: 'Full stack web, IoT and LLM agents.', class: 'dim' },
  ],

  education: () => [
    { text: 'United International University', class: 'title' },
    { text: '  B.Sc. in CSE · CGPA 3.81 (provisional) · Completed Oct 2026' },
    { text: 'Mosjid Mission Academy School and College', class: 'title' },
    { text: '  H.S.C. (Science) · GPA 5.00 · 2021' },
  ],

  experience: () => [
    { text: '2025-26  Senior Executive, UIU Robotics Club (Event Mgmt & Logistics)' },
    { text: 'Su 2025  Undergraduate TA, Advanced OOP, UIU' },
    { text: '2025     Volunteer, UIU CSE Fest 2025' },
    { text: '2025     Team Leader, SPAK (6-member IoT rover team)' },
    { text: '2025     Team Leader, UniHub' },
    { text: '2023     Team Leader, Self Management System' },
  ],

  projects: () => [
    { text: 'Agentic Trade       self-correcting LLM trading agent', class: 'title' },
    { text: 'Aegis               emergency response platform  [Champion]' },
    { text: 'Green Code Bench    energy efficiency of AI code' },
    { text: 'SPAK                ESP32 precision-agriculture rover' },
    { text: 'UniHub              university social platform' },
    { text: 'Hisab Nikash Pro    offline-first finance PWA' },
    { text: 'Self Management     JavaFX app  [3rd Runner-Up]' },
    { text: 'IPTV Player         Tauri + React desktop app' },
    { text: 'CLI Download Mgr    Python Textual TUI' },
  ],

  awards: () => [
    { text: 'Champion       Aegis · CSE Project Show, Summer 2025', class: 'info' },
    { text: '3rd Runner-Up  Self Management System · CSE Project Show, Fall 2023' },
  ],

  skills: () => [
    { text: 'Languages  C, C++, Python, JavaScript, TypeScript, Java, SQL' },
    { text: 'Web        HTML, CSS, Tailwind, React, Node.js, Express.js, Django' },
    { text: 'Database   MySQL, PostgreSQL, MongoDB, SQLite' },
    { text: 'IoT        ESP32, Arduino, Raspberry Pi, Modbus RTU' },
    { text: 'Tools      Git, Docker, VS Code, LaTeX, Tauri' },
    { text: 'OS         Linux (Fedora, Ubuntu, Arch)' },
  ],

  contact: () => [
    { text: `Email     ${EMAIL}` },
    { text: 'Phone     +880 1580-518992' },
    { text: 'LinkedIn  linkedin.com/in/nurulhudaarosh' },
    { text: 'GitHub    github.com/nurulhudaarosh' },
  ],

  quote: () => {
    const q = window.QUOTES[Math.floor(Math.random() * window.QUOTES.length)];
    const lines = [{ text: q.orig.text.replace(/\n/g, ' '), class: 'title' }];
    if (q.trans) lines.push({ text: q.trans.text });
    lines.push({ text: `  — ${q.src}`, class: 'dim' });
    return lines;
  },

  cv: () => {
    window.open(CV_URL, '_blank');
    track('cv_download', { link_url: CV_URL, source: 'terminal' });
    return [{ text: 'Opening CV...', class: 'success' }];
  },

  github: () => {
    window.open('https://github.com/nurulhudaarosh', '_blank');
    return [{ text: 'Opening GitHub...', class: 'success' }];
  },

  linkedin: () => {
    window.open('https://www.linkedin.com/in/nurulhudaarosh/', '_blank');
    return [{ text: 'Opening LinkedIn...', class: 'success' }];
  },

  email: () => {
    if (!navigator.clipboard) return [{ text: EMAIL }];
    navigator.clipboard.writeText(EMAIL).then(
      () => print([{ text: 'Email copied to clipboard.', class: 'success' }]),
      () => print([{ text: EMAIL }])
    );
    return [];
  },

  theme: () => {
    themeToggle.click();
    return [{ text: `Switched to ${currentTheme()} mode.`, class: 'success' }];
  },

  '3d': () => {
    setView('3d');
    return [{ text: 'Opening the 3D book...', class: 'success' }];
  },

  '2d': () => {
    setView('2d');
    return [{ text: 'Switched to 2D view.', class: 'success' }];
  },

  whoami: () => [{ text: 'a curious visitor :)' }],

  clear: () => {
    terminalOutput.innerHTML = '';
    return [];
  },
};

function print(lines) {
  lines.forEach(line => {
    const p = document.createElement('p');
    p.className = `t-line ${line.class || ''}`;
    p.textContent = line.text;
    terminalOutput.appendChild(p);
  });
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function echo(cmd) {
  const p = document.createElement('p');
  p.className = 't-line';
  const prompt = document.createElement('span');
  prompt.className = 't-prompt';
  prompt.textContent = '~ $';
  p.append(prompt, cmd);
  terminalOutput.appendChild(p);
}

function run(input) {
  const cmd = input.trim().toLowerCase();
  echo(input);
  if (!cmd) return;
  track('terminal_command', { command: cmd.slice(0, 30) });
  if (Object.prototype.hasOwnProperty.call(commands, cmd)) {
    print(commands[cmd]());
  } else {
    print([
      { text: `command not found: ${cmd}`, class: 'error' },
      { text: 'Type "help" to see available commands.', class: 'dim' },
    ]);
  }
}

const history = [];
let historyIndex = 0;

terminalInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const value = terminalInput.value;
    if (value.trim()) history.push(value);
    historyIndex = history.length;
    run(value);
    terminalInput.value = '';
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex > 0) terminalInput.value = history[--historyIndex];
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    historyIndex = Math.min(historyIndex + 1, history.length);
    terminalInput.value = history[historyIndex] || '';
  } else if (e.key === 'Tab') {
    const partial = terminalInput.value.trim().toLowerCase();
    const matches = Object.keys(commands).filter(c => c.startsWith(partial));
    if (partial && matches.length) {
      e.preventDefault();
      if (matches.length === 1) {
        terminalInput.value = matches[0];
      } else {
        echo(terminalInput.value);
        print([{ text: matches.join('  '), class: 'dim' }]);
      }
    }
  }
});

terminalBody.addEventListener('click', () => {
  if (!window.getSelection().toString()) terminalInput.focus();
});

// Contact form (no backend: opens a prefilled email draft)
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  if (!name || !email || !message) return;

  const subject = `Portfolio contact from ${name}`;
  const body = `${message}\n\n— ${name} (${email})`;
  track('contact_form_submit', {});
  window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  contactForm.reset();
});

// Analytics: CV, contact and outbound clicks
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  const label = link.textContent.trim().replace(/\s+/g, ' ') || href;
  const project = link.closest('.project')?.querySelector('h3')?.textContent.trim();

  if (href.endsWith('.pdf')) track('cv_download', { link_url: href });
  else if (href.startsWith('mailto:') || href.startsWith('tel:')) track('contact_click', { method: href.split(':')[0], link_text: label });
  else if (/^https?:/.test(href)) track('outbound_click', { link_url: href, link_text: label, project: project || '' });
});

// Initial render
renderQuote(false);
document.getElementById('year').textContent = new Date().getFullYear();
