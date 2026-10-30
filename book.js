// 3D view: the portfolio as a book with turning pages and bookmark ribbons.
// Pages are built from the 2D page's content; interactive parts (terminal,
// contact form, skills sphere) are moved in and moved back when leaving.
(function () {
  const root = document.documentElement;
  const stage = document.getElementById('bookStage');
  const scaler = document.getElementById('bookScaler');
  const book = document.getElementById('book');
  const prevBtn = document.getElementById('bookPrev');
  const nextBtn = document.getElementById('bookNext');
  const indicator = document.getElementById('bookIndicator');
  const singleQuery = window.matchMedia('(max-width: 760px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FLIP_MS = 900;
  const FAST_FLIP_MS = 420;

  const CHAPTERS = [
    { id: 'about', label: 'About', color: '#c8401a' },
    { id: 'experience', label: 'Experience', color: '#2f6f73' },
    { id: 'projects', label: 'Projects', color: '#b07d12' },
    { id: 'skills', label: 'Skills', color: '#3b5bdb' },
    { id: 'contact', label: 'Contact', color: '#7b3f9e' },
  ];

  let pages = [];
  let sheets = [];
  let flipped = 0;
  let single = singleQuery.matches;
  let built = false;
  let busy = Promise.resolve();
  const moved = [];

  const $ = (sel) => document.querySelector(sel);
  const isOpen = () => root.getAttribute('data-view') === '3d';

  function el(tag, cls, html) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }

  // Copy static content without ids, animation classes or decorative extras
  function copy(selector) {
    const node = $(selector).cloneNode(true);
    [node, ...node.querySelectorAll('*')].forEach(n => {
      n.removeAttribute('id');
      n.classList.remove('reveal', 'is-visible', 'is-hidden');
    });
    return node;
  }

  // Move a live element into the book, leaving a placeholder to return it to
  function borrow(selector) {
    const node = $(selector);
    const placeholder = document.createComment('book');
    node.parentNode.insertBefore(placeholder, node);
    moved.push({ node, placeholder });
    return node;
  }

  function giveBack() {
    moved.forEach(({ node, placeholder }) => {
      placeholder.parentNode.insertBefore(node, placeholder);
      placeholder.remove();
    });
    moved.length = 0;
  }

  function chapterPage(chapter, title, ...content) {
    const body = el('div', 'page-body');
    body.append(el('h2', 'page-title', title), ...content);
    return { chapter, title, body };
  }

  function buildPages() {
    const list = [];

    // Cover
    const cover = el('div', 'cover');
    const photo = el('div', 'cover-photo');
    photo.append($('.portrait-frame picture').cloneNode(true));
    cover.append(
      el('p', 'cover-kicker mono', 'Portfolio · 2026'),
      photo,
      el('h1', 'cover-title', 'MD. Nurul Huda'),
      el('p', 'cover-sub', $('.hero-sub').innerHTML),
      el('p', 'cover-foot mono', 'B.Sc. in CSE · United International University'),
      el('p', 'cover-hint hand', 'open me →'),
    );
    list.push({ kind: 'cover', body: cover });

    // Epigraph
    const q = window.QUOTES.find(x => x.orig.text.includes('زِدْنِي')) || window.QUOTES[0];
    const epi = el('div', 'epigraph');
    epi.append(
      el('p', 'epigraph-orig', q.orig.text),
      el('p', 'epigraph-trans', q.trans ? q.trans.text : ''),
      el('p', 'epigraph-src', `— ${q.src}`),
    );
    epi.querySelector('.epigraph-orig').lang = q.orig.lang;
    epi.querySelector('.epigraph-orig').dir = 'rtl';
    epi.querySelector('.epigraph-trans').lang = 'bn';
    epi.querySelector('.epigraph-src').lang = 'bn';
    list.push({ kind: 'plain', body: epi });

    // Contents (filled in once page numbers are known)
    list.push({ kind: 'contents', chapter: null, title: 'Contents', body: el('div', 'page-body') });

    // About + education
    list.push(chapterPage('about', 'About', copy('.about-text')));
    const edu = copy('.edu');
    edu.querySelector('.label')?.remove();
    list.push(chapterPage('about', 'Education', edu, copy('.stats')));

    // Experience + achievements
    list.push(chapterPage('experience', 'Experience & Leadership', copy('.xp')));
    list.push(chapterPage('experience', 'Achievements', copy('.awards')));

    // Projects, three per page
    const projects = Array.from(document.querySelectorAll('.projects .project'));
    for (let i = 0; i < projects.length; i += 3) {
      const group = el('div', 'book-projects');
      projects.slice(i, i + 3).forEach(p => {
        const c = p.cloneNode(true);
        c.classList.remove('reveal', 'is-visible', 'is-hidden', 'project-feature');
        group.append(c);
      });
      list.push(chapterPage('projects', i === 0 ? 'Selected Projects' : 'Projects, continued', group));
    }

    // Skills (with the live sphere) + terminal
    const sphereWrap = borrow('.sphere-wrap');
    list.push(chapterPage('skills', 'Skills & Tools', sphereWrap, copy('.skills')));
    list.push(chapterPage('skills', 'Command Line', el('p', 'page-lead', 'Explore from a tiny terminal. Try <code>help</code>, <code>projects</code> or <code>cv</code>.'), borrow('#terminal')));

    // Contact + letter form
    list.push(chapterPage('contact', 'Contact', copy('.contact-grid > div')));
    list.push(chapterPage('contact', 'Write to Me', borrow('#contactForm')));

    // Colophon
    list.push({
      kind: 'plain',
      body: el('div', 'colophon',
        '<p class="mono">Colophon</p>' +
        '<p>Set in Fraunces, Bricolage Grotesque and JetBrains Mono. Quotes in Amiri, Tiro Bangla and Noto Serif.</p>' +
        '<p>Hand-built with HTML, CSS and JavaScript, with a three.js background. Hosted on GitHub Pages.</p>' +
        '<p class="hand">Thanks for turning the pages!</p>'),
    });

    // Back cover
    const back = el('div', 'cover cover-back');
    back.append(
      el('p', 'cover-kicker mono', 'The End'),
      el('h2', 'cover-title', 'Let’s build something.'),
      el('p', 'cover-sub', 'mhuda223303@bscse.uiu.ac.bd'),
    );
    const links = el('div', 'cover-links');
    links.innerHTML =
      '<a class="btn btn-solid" href="MD-Nurul-Huda-CV.pdf" target="_blank" rel="noopener">Download CV</a>' +
      '<a href="https://github.com/nurulhudaarosh" target="_blank" rel="noopener">GitHub ↗</a>' +
      '<a href="https://linkedin.com/in/nurul-huda-arosh-776241168/" target="_blank" rel="noopener">LinkedIn ↗</a>';
    back.append(links, el('p', 'cover-foot mono', '23.794001° N, 90.429589° E'));
    list.push({ kind: 'cover', body: back });

    // Two-page spreads need an even page count
    if (!single && list.length % 2) list.splice(list.length - 1, 0, { kind: 'plain', body: el('div', 'page-blank') });
    return list;
  }

  function firstPageOf(chapter) {
    return pages.findIndex(p => p.chapter === chapter);
  }

  function fillContents() {
    const contents = pages.find(p => p.kind === 'contents');
    const list = el('ol', 'toc');
    CHAPTERS.forEach((c, i) => {
      const item = el('li');
      const btn = el('button', 'toc-link',
        `<span class="toc-num mono">0${i + 1}</span><span class="toc-label">${c.label}</span><span class="toc-dots"></span><span class="toc-page mono">${firstPageOf(c.id) + 1}</span>`);
      btn.addEventListener('click', () => goTo(firstPageOf(c.id)));
      item.append(btn);
      list.append(item);
    });
    contents.body.append(el('h2', 'page-title', 'Contents'), list);
  }

  function renderPage(page, index) {
    const face = el('div', `page page-${page.kind || 'chapter'}`);
    if (page.kind !== 'cover') {
      const side = single || index % 2 === 0 ? 'right' : 'left';
      face.classList.add(`page-${side}`);
      if (page.kind !== 'plain') {
        face.append(el('header', 'page-head mono', `<span>MD. Nurul Huda</span><span>${page.title || ''}</span>`));
      }
      face.append(page.body);
      face.append(el('footer', 'page-foot mono', String(index + 1)));
      const corner = el('button', 'page-corner');
      corner.setAttribute('aria-label', side === 'right' ? 'Next page' : 'Previous page');
      corner.addEventListener('click', () => (side === 'right' ? next() : prev()));
      face.append(corner);
    } else {
      face.append(page.body);
    }
    return face;
  }

  function build() {
    single = singleQuery.matches;
    pages = buildPages();
    fillContents();

    book.innerHTML = '';
    book.classList.toggle('is-single', single);
    const inner = el('div', 'book-inner');
    sheets = [];

    const perSheet = single ? 1 : 2;
    const count = Math.ceil(pages.length / perSheet);
    for (let s = 0; s < count; s++) {
      const sheet = el('div', 'sheet');
      const front = el('div', 'face face-front');
      const back = el('div', 'face face-back');
      front.append(renderPage(pages[s * perSheet], s * perSheet));
      if (!single && pages[s * 2 + 1]) back.append(renderPage(pages[s * 2 + 1], s * 2 + 1));
      sheet.append(front, back);
      sheet.addEventListener('transitionend', (e) => {
        if (e.target === sheet && e.propertyName === 'transform') sheet.classList.remove('is-turning');
      });
      inner.append(sheet);
      sheets.push(sheet);
    }

    // Bookmark ribbons
    const marks = el('nav', 'bookmarks');
    marks.setAttribute('aria-label', 'Bookmarks');
    CHAPTERS.forEach(c => {
      const mark = el('button', 'bookmark', `<span>${c.label}</span>`);
      mark.style.setProperty('--mark', c.color);
      mark.dataset.chapter = c.id;
      mark.addEventListener('click', () => goTo(firstPageOf(c.id)));
      marks.append(mark);
    });
    inner.append(marks);

    book.append(inner);
    built = true;
    applyState(true);
    layout();
  }

  function pageOfFlipped(f) {
    return single ? f : Math.max(0, 2 * f - 1);
  }

  function applyState(instant) {
    sheets.forEach((sheet, i) => {
      const isFlipped = i < flipped;
      sheet.classList.toggle('is-flipped', isFlipped);
      if (instant || !sheet.classList.contains('is-turning')) {
        sheet.style.zIndex = isFlipped ? i + 1 : sheets.length - i;
      }
      // Only the visible faces are reachable by keyboard / screen readers
      const front = sheet.children[0];
      const back = sheet.children[1];
      front.inert = !(i === flipped);
      back.inert = single || !(i === flipped - 1);
      if (single) sheet.classList.toggle('is-gone', isFlipped && !sheet.classList.contains('is-turning'));
    });

    book.classList.toggle('is-closed', !single && flipped === 0);
    book.classList.toggle('is-ended', !single && flipped === sheets.length);
    prevBtn.disabled = flipped === 0;
    nextBtn.disabled = flipped === sheets.length - (single ? 1 : 0);

    const p = pageOfFlipped(flipped);
    const total = pages.length;
    if (flipped === 0) indicator.textContent = 'Cover';
    else if (!single && flipped < sheets.length) indicator.textContent = `Pages ${p + 1}–${p + 2} of ${total}`;
    else indicator.textContent = `Page ${p + 1} of ${total}`;

    const visiblePages = single ? [p] : [p, p + 1];
    const current = visiblePages.map(i => pages[i] && pages[i].chapter).find(Boolean);
    book.querySelectorAll('.bookmark').forEach(m => m.classList.toggle('is-active', m.dataset.chapter === current));
  }

  function turn(sheetIndex, forward, duration) {
    return new Promise(resolve => {
      const sheet = sheets[sheetIndex];
      sheet.style.setProperty('--flip-ms', `${duration}ms`);
      sheet.style.zIndex = sheets.length + 2;
      sheet.classList.add('is-turning');
      sheet.classList.remove('is-gone');
      flipped += forward ? 1 : -1;
      // Force the start state to paint before turning
      void sheet.offsetWidth;
      applyState(false);
      setTimeout(() => {
        sheet.classList.remove('is-turning');
        applyState(true);
        resolve();
      }, reduceMotion ? 0 : duration);
    });
  }

  function flipTo(target) {
    const max = sheets.length - (single ? 1 : 0);
    target = Math.max(0, Math.min(max, target));
    busy = busy.then(async () => {
      const steps = Math.abs(target - flipped);
      if (!steps) return;
      const duration = reduceMotion ? 0 : steps > 1 ? FAST_FLIP_MS : FLIP_MS;
      const forward = target > flipped;
      const turns = [];
      for (let k = 0; k < steps; k++) {
        const index = forward ? flipped + k : flipped - 1 - k;
        turns.push(new Promise(r => setTimeout(r, k * (reduceMotion ? 0 : 90))).then(() => turn(index, forward, duration)));
      }
      await Promise.all(turns);
    });
    return busy;
  }

  function goTo(pageIndex) {
    if (pageIndex < 0) return;
    if (window.gtag) gtag('event', 'book_goto', { page: pageIndex + 1 });
    return flipTo(single ? pageIndex : Math.floor((pageIndex + 1) / 2));
  }

  const next = () => flipTo(flipped + 1);
  const prev = () => flipTo(flipped - 1);

  function layout() {
    if (!built) return;
    const designW = single ? 420 : 1040;
    const designH = single ? 640 : 680;
    const marksSpace = single ? 0 : 120;
    const marksTop = single ? 44 : 0;
    const controls = stage.querySelector('.book-controls').offsetHeight + 24;
    const availW = stage.clientWidth - 32 - marksSpace;
    const availH = stage.clientHeight - parseFloat(getComputedStyle(stage).paddingTop) - controls - marksTop - 24;
    const scale = Math.max(0.3, Math.min(availW / designW, availH / designH, 1.25));
    book.style.width = `${designW}px`;
    book.style.height = `${designH}px`;
    book.style.transform = `scale(${scale})`;
    scaler.style.width = `${designW * scale}px`;
    scaler.style.height = `${designH * scale}px`;
    scaler.style.marginTop = `${marksTop * scale}px`;
  }

  function open() {
    if (!built || single !== singleQuery.matches) {
      const page = pageOfFlipped(flipped);
      if (built) giveBack();
      build();
      flipped = 0;
      if (page) { flipped = single ? page : Math.floor((page + 1) / 2); applyState(true); }
    }
    layout();
  }

  function close() {
    if (!built) return;
    giveBack();
    book.innerHTML = '';
    built = false;
  }

  // React to the 2D/3D toggle
  new MutationObserver(() => (isOpen() ? open() : close())).observe(root, { attributes: true, attributeFilter: ['data-view'] });
  window.addEventListener('resize', () => {
    if (!isOpen()) return;
    if (single !== singleQuery.matches) open(); else layout();
  });

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  document.addEventListener('keydown', (e) => {
    if (!isOpen() || e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    if (e.key === 'Home') goTo(0);
  });

  // Swipe to turn (ignored on the sphere, terminal and form)
  let startX = null;
  book.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.sphere-wrap, .terminal, form, a, button')) return;
    startX = e.clientX;
  });
  book.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
  });

  // Nav links and the logo open the matching chapter while in the book
  document.querySelectorAll('.nav-links a, .brand').forEach(link => {
    link.addEventListener('click', (e) => {
      if (!isOpen()) return;
      e.preventDefault();
      const id = link.getAttribute('href').slice(1);
      goTo(id === 'top' ? 0 : firstPageOf(id));
    });
  });

  window.portfolioBook = { goTo, next, prev };
  if (isOpen()) open();
})();
