// Custom Cursor
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
const links = document.querySelectorAll('a, button');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (finePointer) document.body.classList.add('has-custom-cursor');

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  
  follower.style.left = e.clientX - 20 + 'px';
  follower.style.top = e.clientY - 20 + 'px';
});

links.forEach(link => {
  link.addEventListener('mouseenter', () => {
    cursor.style.transform = 'scale(2)';
    follower.style.transform = 'scale(1.5)';
    follower.style.borderColor = 'var(--primary)';
  });
  
  link.addEventListener('mouseleave', () => {
    cursor.style.transform = 'scale(1)';
    follower.style.transform = 'scale(1)';
    follower.style.borderColor = 'var(--primary-light)';
  });
});

// Navbar
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('active');
  navToggle.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Active nav link
const sections = document.querySelectorAll('section[id]');

function highlightNav() {
  const scrollY = window.scrollY + 100;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      navLinks.querySelectorAll('a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', highlightNav, { passive: true });

// Typing Effect
const heroTitle = document.getElementById('heroTitle');
const titles = [
  'B.Sc. CSE Student',
  'Full Stack Developer',
  'IoT Enthusiast',
  'Problem Solver'
];
let titleIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
  const currentTitle = titles[titleIndex];

  if (isDeleting) {
    heroTitle.textContent = currentTitle.substring(0, charIndex - 1);
    charIndex--;
  } else {
    heroTitle.textContent = currentTitle.substring(0, charIndex + 1);
    charIndex++;
  }

  let typeSpeed = isDeleting ? 30 : 80;

  if (!isDeleting && charIndex === currentTitle.length) {
    typeSpeed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    titleIndex = (titleIndex + 1) % titles.length;
    typeSpeed = 500;
  }

  setTimeout(typeEffect, typeSpeed);
}

if (reduceMotion) {
  heroTitle.textContent = titles[0];
} else {
  setTimeout(typeEffect, 1000);
}

// Scroll Animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.glass-card, .timeline-item, .section-header, .terminal, .orbit-scene').forEach(el => {
  el.classList.add('fade-up');
  observer.observe(el);
});

// 3D Tilt Effect on Cards
const cards = document.querySelectorAll('.glass-card');

if (finePointer && !reduceMotion) cards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
  });
});

// Terminal Functionality
const terminal = document.querySelector('.terminal');
const terminalBody = document.getElementById('terminalBody');
const terminalInput = document.getElementById('terminalInput');
const terminalOutput = terminalBody.querySelector('.terminal-output');

const commands = {
  help: () => [
    { text: 'Available commands:', class: 'info' },
    { text: '  help       - Show this help message', class: 'output' },
    { text: '  about      - About me', class: 'output' },
    { text: '  skills     - List my skills', class: 'output' },
    { text: '  projects   - Show my projects', class: 'output' },
    { text: '  education  - My education info', class: 'output' },
    { text: '  contact    - Get my contact info', class: 'output' },
    { text: '  github     - Open my GitHub', class: 'output' },
    { text: '  linkedin   - Open my LinkedIn', class: 'output' },
    { text: '  email      - Copy my email', class: 'output' },
    { text: '  cv         - Open my CV (PDF)', class: 'output' },
    { text: '  clear      - Clear terminal', class: 'output' },
    { text: '  whoami     - Who am I?', class: 'output' },
    { text: '  date       - Current date', class: 'output' },
    { text: '', class: 'output' },
    { text: 'Tip: use ↑/↓ for history, Tab to autocomplete.', class: 'output' },
  ],
  
  about: () => [
    { text: 'MD. Nurul Huda', class: 'info' },
    { text: 'B.Sc. in Computer Science and Engineering', class: 'output' },
    { text: 'United International University, Dhaka', class: 'output' },
    { text: 'CGPA: 3.74 | Expected Graduation: 2026', class: 'output' },
    { text: '', class: 'output' },
    { text: 'As a student at UIU, I aim to apply my skills', class: 'output' },
    { text: 'and knowledge to contribute effectively in a', class: 'output' },
    { text: 'dynamic environment.', class: 'output' },
  ],
  
  skills: () => [
    { text: 'Technical Skills:', class: 'info' },
    { text: '', class: 'output' },
    { text: 'Languages:    C, C++, Python, JavaScript, SQL', class: 'output' },
    { text: 'Web:          HTML, CSS, Tailwind, React, Node.js, Express.js', class: 'output' },
    { text: 'Database:     MySQL', class: 'output' },
    { text: 'Tools:        Git, Docker, VS Code, LaTeX', class: 'output' },
    { text: 'IoT:          ESP32, Arduino, Raspberry Pi', class: 'output' },
    { text: 'OS:           Linux (Fedora, Ubuntu, Arch)', class: 'output' },
  ],
  
  projects: () => [
    { text: 'Featured Projects:', class: 'info' },
    { text: '', class: 'output' },
    { text: '1. Agentic Trade - Self-correcting LLM trading agent', class: 'command-name' },
    { text: '   Research | Python, LLM agents, Alpaca paper trading', class: 'output' },
    { text: '', class: 'output' },
    { text: '2. Green Code Interaction Benchmark', class: 'command-name' },
    { text: '   Research | Energy efficiency of AI-generated code', class: 'output' },
    { text: '', class: 'output' },
    { text: '3. SPAK - Smart Precision Agricultural Kit', class: 'command-name' },
    { text: '   Team Leader | ESP32, NPK Sensor, Web Dashboard', class: 'output' },
    { text: '', class: 'output' },
    { text: '4. UniHub - Social Platform', class: 'command-name' },
    { text: '   DBMS Lab Project | HTML, JS, Tailwind, Express.js, MySQL', class: 'output' },
    { text: '', class: 'output' },
    { text: '5. Hisab Nikash Pro - Offline-first finance PWA', class: 'command-name' },
    { text: '6. IPTV Player - Tauri + React desktop app', class: 'command-name' },
    { text: '7. Self Management System - JavaFX | 2nd Runner-Up', class: 'command-name' },
    { text: '8. CLI Download Manager - Python Textual TUI', class: 'command-name' },
  ],
  
  education: () => [
    { text: 'Education:', class: 'info' },
    { text: '', class: 'output' },
    { text: 'United International University (UIU)', class: 'command-name' },
    { text: '  B.Sc. in Computer Science and Engineering', class: 'output' },
    { text: '  Expected Graduation: 2026 | CGPA: 3.74', class: 'output' },
    { text: '', class: 'output' },
    { text: 'Mosjid Mission Academy School and College', class: 'command-name' },
    { text: '  H.S.C. (Science), 2021 | GPA: 5.00', class: 'output' },
  ],
  
  contact: () => [
    { text: 'Contact Information:', class: 'info' },
    { text: '', class: 'output' },
    { text: 'Email:    mhuda223303@bscse.uiu.ac.bd', class: 'output' },
    { text: 'Phone:    +880 1792-021499', class: 'output' },
    { text: 'LinkedIn: linkedin.com/in/nurul-huda-arosh', class: 'output' },
    { text: 'GitHub:   github.com/nurulhudaarosh', class: 'output' },
    { text: 'Address:  Queen\'s Garden, Nurerchala, Vatara, Dhaka', class: 'output' },
  ],
  
  github: () => {
    window.open('https://github.com/nurulhudaarosh', '_blank');
    return [{ text: 'Opening GitHub profile...', class: 'success' }];
  },
  
  linkedin: () => {
    window.open('https://linkedin.com/in/nurul-huda-arosh-776241168/', '_blank');
    return [{ text: 'Opening LinkedIn profile...', class: 'success' }];
  },
  
  email: () => {
    const address = 'mhuda223303@bscse.uiu.ac.bd';
    if (!navigator.clipboard) return [{ text: address, class: 'output' }];
    navigator.clipboard.writeText(address).then(
      () => addOutput([{ text: 'Email copied to clipboard!', class: 'success' }]),
      () => addOutput([{ text: address, class: 'output' }])
    );
    return [];
  },

  cv: () => {
    window.open('MD-Nurul-Huda-CV.pdf', '_blank');
    return [{ text: 'Opening CV...', class: 'success' }];
  },
  
  clear: () => {
    terminalOutput.innerHTML = '';
    return [];
  },
  
  whoami: () => [
    { text: 'nurul', class: 'info' },
  ],
  
  date: () => [
    { text: new Date().toString(), class: 'output' },
  ],
  
  ls: () => [
    { text: 'about.md  skills.txt  projects/  contact.info', class: 'output' },
  ],
  
  pwd: () => [
    { text: '/home/nurul/portfolio', class: 'output' },
  ],
};

function addOutput(lines) {
  lines.forEach(line => {
    const p = document.createElement('p');
    p.className = `terminal-line ${line.class || ''}`;
    p.textContent = line.text;
    terminalOutput.appendChild(p);
  });
}

function addCommand(cmd) {
  const p = document.createElement('p');
  p.className = 'terminal-line cmd';
  const prompt = document.createElement('span');
  prompt.className = 'terminal-prompt';
  prompt.textContent = 'nurul@portfolio ~ %';
  p.append(prompt, ' ' + cmd);
  terminalOutput.appendChild(p);
}

function processCommand(input) {
  const trimmed = input.trim().toLowerCase();
  
  addCommand(input);
  
  if (trimmed === '') {
    return;
  }
  
  if (commands[trimmed]) {
    const output = commands[trimmed]();
    if (output && output.length > 0) {
      addOutput(output);
    }
  } else {
    addOutput([
      { text: `command not found: ${trimmed}`, class: 'error' },
      { text: 'Type "help" to see available commands.', class: 'output' },
    ]);
  }
  
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

const history = [];
let historyIndex = 0;

terminalInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const value = terminalInput.value;
    if (value.trim()) history.push(value);
    historyIndex = history.length;
    processCommand(value);
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
        addCommand(terminalInput.value);
        addOutput([{ text: matches.join('  '), class: 'output' }]);
        terminalBody.scrollTop = terminalBody.scrollHeight;
      }
    }
  }
});

// Focus terminal input when clicking on terminal
terminal.addEventListener('click', () => {
  terminalInput.focus();
});

// Terminal 3D Effect
if (finePointer && !reduceMotion) terminal.addEventListener('mousemove', (e) => {
  const rect = terminal.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const rotateX = (y - centerY) / 40;
  const rotateY = (centerX - x) / 40;
  
  terminal.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

if (finePointer && !reduceMotion) terminal.addEventListener('mouseleave', () => {
  terminal.style.transform = 'rotateY(-10deg) rotateX(5deg)';
});

// Parallax Effect on Hero
if (finePointer && !reduceMotion) document.addEventListener('mousemove', (e) => {
  const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
  const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
  
  document.querySelectorAll('.gradient-orb').forEach((orb, index) => {
    const speed = (index + 1) * 0.5;
    orb.style.transform = `translate(${moveX * speed}px, ${moveY * speed}px)`;
  });
});

// Contact Form (no backend: opens a prefilled email draft)
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    alert('Please fill in all fields.');
    return;
  }

  const subject = `Portfolio contact from ${name}`;
  const body = `${message}\n\n— ${name} (${email})`;
  window.location.href = `mailto:mhuda223303@bscse.uiu.ac.bd?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  contactForm.reset();
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    const target = href.length > 1 && document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  });
});

// 3D Orbit Engine
(function initOrbit() {
  const scene = document.getElementById('orbitScene');
  if (!scene) return;
  const planets = Array.from(scene.querySelectorAll('.planet'));
  const ellipses = [scene.querySelector('.e1'), scene.querySelector('.e2'), scene.querySelector('.e3')];
  const RING_SPEED = [0.28, -0.2, 0.14]; // rad/s, different timeframe + direction per orbit
  const TILT = 0.42;

  // Assign planets round-robin to the 3 rings
  const byRing = [[], [], []];
  planets.forEach((p, i) => byRing[i % 3].push(p));
  byRing.forEach((group, r) => group.forEach((p, k) => {
    p._ring = r;
    p._angle = (k / group.length) * Math.PI * 2 + r * 0.5;
  }));

  let paused = false;
  planets.forEach(p => {
    p.addEventListener('mouseenter', () => {
      paused = true;
      cursor.style.transform = 'scale(2)';
    });
    p.addEventListener('mouseleave', () => {
      paused = false;
      cursor.style.transform = 'scale(1)';
    });
  });

  function layout() {
    const W = scene.clientWidth, H = scene.clientHeight;
    const base = Math.max(80, Math.min(W / 2 - 58, (H / 2 - 58) / TILT, 330));
    const radii = [0.45, 0.72, 1.0].map(f => base * f);
    ellipses.forEach((el, r) => {
      if (!el) return;
      el.style.width = radii[r] * 2 + 'px';
      el.style.height = radii[r] * 2 * TILT + 'px';
    });
    return { cx: W / 2, cy: H / 2, radii };
  }

  let geo = layout();
  window.addEventListener('resize', () => { geo = layout(); });

  function frame() {
    planets.forEach(p => {
      const r = p._ring;
      const x = geo.cx + geo.radii[r] * Math.cos(p._angle);
      const y = geo.cy + geo.radii[r] * TILT * Math.sin(p._angle);
      const depth = (Math.sin(p._angle) + 1) / 2; // 0 = back, 1 = front
      const s = 0.72 + 0.38 * depth;
      p.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${s})`;
      p.style.opacity = 0.55 + 0.45 * depth;
      p.style.zIndex = Math.round(1 + 18 * depth);
    });
  }

  if (reduceMotion) {
    frame();
    return;
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!paused) planets.forEach(p => { p._angle += RING_SPEED[p._ring] * dt; });
    frame();
    requestAnimationFrame(tick);
  }
  frame();
  requestAnimationFrame(tick);
})();

// Theme Toggle (dark / light)
const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
});

// Page Load Animation
window.addEventListener('load', () => {
  document.body.style.opacity = '1';
  
  // Animate hero elements
  const heroElements = document.querySelectorAll('.hero-greeting, .hero-name, .hero-title-wrapper, .hero-description, .hero-buttons, .hero-social');
  
  heroElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
      el.style.transition = 'all 0.6s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 200 + index * 100);
  });
});

document.getElementById('year').textContent = new Date().getFullYear();
