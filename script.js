const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
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
    navAnchors.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
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
  document.querySelectorAll('.tilt').forEach(el => {
    el.style.removeProperty('--rx');
    el.style.removeProperty('--ry');
  });
  if (next === '3d') startSphere(); else stopSphere();
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
const quoteAr = document.getElementById('quoteAr');
const quoteText = document.getElementById('quoteText');
const quoteSrc = document.getElementById('quoteSrc');
const quoteBar = document.getElementById('quoteBar');
const QUOTE_TIME = 9000;
const QUOTE_CATEGORIES = { quran: 'Al-Quran', hadith: 'Hadith', poet: 'Poet', literature: 'Literature', philosophy: 'Philosophy' };
let quoteIndex = Math.floor(Math.random() * window.QUOTES.length);

function renderQuote(animate = true) {
  const q = window.QUOTES[quoteIndex];
  const fill = () => {
    quoteCat.textContent = QUOTE_CATEGORIES[q.cat];
    quoteAr.textContent = q.ar || '';
    quoteText.textContent = q.en;
    quoteSrc.textContent = q.src;
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
const revealTargets = document.querySelectorAll('.section-head, .about-grid, .xp-item, .award, .project, .skill-row, .console, .contact-grid, .stats');

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

// 3D tilt (mouse / trackpad only)
if (finePointer && !reduceMotion) {
  document.querySelectorAll('.tilt').forEach(el => {
    const max = el.classList.contains('project') || el.classList.contains('award') ? 10 : 7;
    el.addEventListener('pointermove', (e) => {
      if (root.getAttribute('data-view') !== '3d') return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', `${(x - 0.5) * max * 2}deg`);
      el.style.setProperty('--rx', `${(0.5 - y) * max * 2}deg`);
      el.style.setProperty('--mx', `${x * 100}%`);
      el.style.setProperty('--my', `${y * 100}%`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.removeProperty('--rx');
      el.style.removeProperty('--ry');
    });
  });
}

// Skills sphere (3D view)
const sphereWrap = document.querySelector('.sphere-wrap');
const sphere = document.getElementById('sphere');
const AUTO_SPIN = reduceMotion ? 0 : 0.0035;
let sphereItems = [];
let sphereRAF = null;
let rotX = -0.3;
let rotY = 0;
let velX = 0;
let velY = AUTO_SPIN;
let dragging = false;
let lastX = 0;
let lastY = 0;

function buildSphere() {
  const labels = Array.from(document.querySelectorAll('.skill-row h3')).map(h => h.textContent);
  const skills = Array.from(document.querySelectorAll('.skills .tags li')).map(li => li.textContent.replace(/ — .*/, ''));
  // Spread the category labels evenly between the skills
  const words = skills.map(text => ({ text, label: false }));
  labels.forEach((text, i) => words.splice(Math.round(((i + 0.5) * words.length) / labels.length) + i, 0, { text, label: true }));
  const n = words.length;
  sphere.innerHTML = '';
  sphereItems = words.map((word, i) => {
    // Fibonacci sphere: evenly spread points
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = Math.PI * (3 - Math.sqrt(5)) * i;
    const span = document.createElement('span');
    span.textContent = word.text;
    if (word.label) span.classList.add('is-accent');
    sphere.appendChild(span);
    return { el: span, x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
  });
  renderSphere();
}

function renderSphere() {
  const radius = Math.min(sphereWrap.clientWidth * 0.38, 190);
  const cx = Math.cos(rotX), sx = Math.sin(rotX), cy = Math.cos(rotY), sy = Math.sin(rotY);
  sphereItems.forEach(p => {
    // rotate around Y, then X
    const x1 = p.x * cy + p.z * sy;
    const z1 = -p.x * sy + p.z * cy;
    const y2 = p.y * cx - z1 * sx;
    const z2 = p.y * sx + z1 * cx;
    const depth = (z2 + 1) / 2;
    p.el.style.transform = `translate(-50%, -50%) translate3d(${x1 * radius}px, ${y2 * radius}px, 0) scale(${0.6 + depth * 0.55})`;
    p.el.style.opacity = 0.25 + depth * 0.75;
    p.el.style.zIndex = Math.round(depth * 100);
  });
}

function tickSphere() {
  rotY += velY;
  rotX += velX;
  if (!dragging) {
    velX *= 0.95;
    velY = velY * 0.95 + AUTO_SPIN * 0.05;
  }
  renderSphere();
  sphereRAF = requestAnimationFrame(tickSphere);
}

function startSphere() {
  if (!sphereItems.length) buildSphere();
  if (!sphereRAF) sphereRAF = requestAnimationFrame(tickSphere);
}

function stopSphere() {
  cancelAnimationFrame(sphereRAF);
  sphereRAF = null;
}

sphereWrap.addEventListener('pointerdown', (e) => {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  sphereWrap.setPointerCapture(e.pointerId);
});

sphereWrap.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  velY = (e.clientX - lastX) * 0.005;
  velX = -(e.clientY - lastY) * 0.005;
  lastX = e.clientX;
  lastY = e.clientY;
});

['pointerup', 'pointercancel'].forEach(type => sphereWrap.addEventListener(type, () => { dragging = false; }));

// Only animate the sphere while it is on screen
new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (root.getAttribute('data-view') !== '3d') return;
    if (entry.isIntersecting) startSphere(); else stopSphere();
  });
}).observe(sphereWrap);

window.addEventListener('resize', () => { if (sphereItems.length) renderSphere(); });

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
    track('project_filter', { filter });
  });
});

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
    { text: '  3d / 2d      switch the page view' },
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
    { text: 'Database   MySQL, SQLite' },
    { text: 'IoT        ESP32, Arduino, Raspberry Pi, Modbus RTU' },
    { text: 'Tools      Git, Docker, VS Code, LaTeX, Tauri' },
    { text: 'OS         Linux (Fedora, Ubuntu, Arch)' },
  ],

  contact: () => [
    { text: `Email     ${EMAIL}` },
    { text: 'Phone     +880 1580-518992' },
    { text: 'LinkedIn  linkedin.com/in/nurul-huda-arosh-776241168' },
    { text: 'GitHub    github.com/nurulhudaarosh' },
  ],

  quote: () => {
    const q = window.QUOTES[Math.floor(Math.random() * window.QUOTES.length)];
    return [{ text: `"${q.en}"`, class: 'title' }, { text: `  — ${q.src}`, class: 'dim' }];
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
    window.open('https://linkedin.com/in/nurul-huda-arosh-776241168/', '_blank');
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
    return [{ text: 'Switched to 3D view. Hover the cards and spin the skills sphere.', class: 'success' }];
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
if (root.getAttribute('data-view') === '3d') startSphere();
