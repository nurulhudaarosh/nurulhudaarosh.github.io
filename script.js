const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EMAIL = 'mhuda223303@bscse.uiu.ac.bd';
const CV_URL = 'MD-Nurul-Huda-CV.pdf';

// Analytics helper (Google Analytics is loaded in <head>)
function track(name, params) {
  if (typeof gtag === 'function') gtag('event', name, params);
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
  return document.documentElement.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
});

// Dhaka local time
const clock = document.getElementById('clock');
const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dhaka' });

function updateClock() {
  clock.textContent = `Dhaka ${timeFormat.format(new Date())}`;
}

updateClock();
setInterval(updateClock, 30000);

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
    { text: '  cv           open my CV (PDF)' },
    { text: '  github       open my GitHub' },
    { text: '  linkedin     open my LinkedIn' },
    { text: '  email        copy my email' },
    { text: '  theme        toggle light/dark' },
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
  if (commands[cmd]) {
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

document.getElementById('year').textContent = new Date().getFullYear();
