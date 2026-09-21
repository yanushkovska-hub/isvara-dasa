/* Карта рождения: 12 домов северо-индийского чертежа, знаки и планеты в них */
(function () {
  var svg = document.getElementById('plate-svg');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var M = 20, S = 560, EN = document.documentElement.lang === 'en';

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(e);
    return e;
  }
  function X(u) { return +(M + S * u).toFixed(1); }
  function Y(v) { return +(M + S * v).toFixed(1); }

  /* n - знак в доме; nu/nv - где стоит число; u/v - где начинается столбик подписей */
  var HOUSES = [
    { n: 4, nu: 0.500, nv: 0.405, u: 0.500, v: 0.175, body: [['Лг', 'Asc', 'lg'], ['Гу', 'Ju', ''], ['Ча', 'Mo', '']] },
    { n: 5, nu: 0.300, nv: 0.085 },
    { n: 6, nu: 0.090, nv: 0.310, u: 0.157, v: 0.190, body: [['Ша', 'Sa', ''], ['Гл', 'Gk', 'dim'], ['Мн', 'Md', 'dim']] },
    { n: 7, nu: 0.403, nv: 0.500 },
    { n: 8, nu: 0.085, nv: 0.690, u: 0.170, v: 0.755, body: [['Пл', 'Pl', '']] },
    { n: 9, nu: 0.300, nv: 0.905, u: 0.232, v: 0.825, body: [['(Ра)', '(Ra)', 'sh']] },
    { n: 10, nu: 0.500, nv: 0.592 },
    { n: 11, nu: 0.700, nv: 0.905, u: 0.765, v: 0.825, body: [['Ур', 'Ur', '']] },
    { n: 12, nu: 0.930, nv: 0.712, u: 0.845, v: 0.688, body: [['Шу', 'Ve', ''], ['Не', 'Ne', ''], ['УП', 'UL', 'pt']] },
    { n: 1, nu: 0.567, nv: 0.500, u: 0.775, v: 0.440, body: [['Су', 'Su', ''], ['Ма', 'Ma', ''], ['АЛ', 'AL', 'pt']] },
    { n: 2, nu: 0.912, nv: 0.310, u: 0.800, v: 0.220, body: [['Бу', 'Me', '']] },
    { n: 3, nu: 0.690, nv: 0.085, u: 0.752, v: 0.152, body: [['(Ке)', '(Ke)', 'sh']] }
  ];
  var LINE = 30;

  var frame = el('g', { 'class': 'k-frame' });
  el('rect', { x: M, y: M, width: S, height: S, pathLength: 1 }, frame);

  var grid = el('g', { 'class': 'k-grid' });
  el('line', { x1: X(0), y1: Y(0), x2: X(1), y2: Y(1), pathLength: 1, style: '--i:0' }, grid);
  el('line', { x1: X(1), y1: Y(0), x2: X(0), y2: Y(1), pathLength: 1, style: '--i:1' }, grid);
  el('polygon', {
    points: [[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]].map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' '),
    pathLength: 1, style: '--i:2'
  }, grid);

  var nums = el('g', { 'class': 'k-num' });
  var body = el('g', { 'class': 'k-body' });
  HOUSES.forEach(function (h, i) {
    var t = el('text', { x: X(h.nu), y: Y(h.nv), style: '--i:' + i }, nums);
    t.textContent = h.n;
    if (!h.body) return;
    h.body.forEach(function (row, j) {
      var b = el('text', { x: X(h.u), y: Y(h.v) + j * LINE, 'class': row[2], style: '--i:' + (i + j) }, body);
      b.textContent = EN ? row[1] : row[0];
    });
  });

  requestAnimationFrame(function () { svg.classList.add('is-drawn'); });
})();

/* Пометки черновика: показать или скрыть */
(function () {
  var btn = document.getElementById('notes-toggle');
  if (!btn) return;
  var count = document.querySelectorAll('mark.note').length;
  function set(on) {
    document.body.classList.toggle('notes-off', !on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.textContent = on ? 'Скрыть пометки (' + count + ')' : 'Показать пометки (' + count + ')';
    try { localStorage.setItem('ishvara-notes', on ? '1' : '0'); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem('ishvara-notes'); } catch (e) {}
  set(saved !== '0');
  btn.addEventListener('click', function () { set(document.body.classList.contains('notes-off')); });
})();

/* Форма заявки: отправка через приёмник на Cloudflare, оттуда в Telegram */
(function () {
  var form = document.getElementById('lead-form');
  var status = document.getElementById('form-status');
  if (!form) return;
  var ENDPOINT = 'https://isvara-dasa-form.isvara-dasa.workers.dev';
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    name: 'Please enter your name.',
    contact: 'Leave an email or Telegram/phone so I can reply.',
    email: 'Please check the email address.',
    consent: 'Please tick the box to agree to the privacy policy.',
    sending: 'Sending\u2026',
    ok: 'Thank you, your request has reached me. I reply personally, within 24 hours.',
    fail: 'The request did not go through. Please try again, or message me on Telegram: @Ishvaradasa'
  } : {
    name: '\u041d\u0430\u043f\u0438\u0448\u0438\u0442\u0435, \u043a\u0430\u043a \u0412\u0430\u0441 \u0437\u043e\u0432\u0443\u0442.',
    contact: '\u041e\u0441\u0442\u0430\u0432\u044c\u0442\u0435 email \u0438\u043b\u0438 Telegram/\u0442\u0435\u043b\u0435\u0444\u043e\u043d, \u0447\u0442\u043e\u0431\u044b \u044f \u043c\u043e\u0433 \u043e\u0442\u0432\u0435\u0442\u0438\u0442\u044c.',
    email: '\u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 email: \u043f\u043e\u0445\u043e\u0436\u0435, \u0432 \u043d\u0451\u043c \u043e\u0448\u0438\u0431\u043a\u0430.',
    consent: '\u041f\u043e\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u0433\u0430\u043b\u043e\u0447\u043a\u0443, \u0447\u0442\u043e\u0431\u044b \u0441\u043e\u0433\u043b\u0430\u0441\u0438\u0442\u044c\u0441\u044f \u0441 \u043f\u043e\u043b\u0438\u0442\u0438\u043a\u043e\u0439 \u043a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u0438.',
    sending: '\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u044f\u044e\u2026',
    ok: '\u0421\u043f\u0430\u0441\u0438\u0431\u043e, \u0437\u0430\u044f\u0432\u043a\u0430 \u0443 \u043c\u0435\u043d\u044f. \u041e\u0442\u0432\u0435\u0447\u0443 \u043b\u0438\u0447\u043d\u043e, \u0432 \u0442\u0435\u0447\u0435\u043d\u0438\u0435 \u0441\u0443\u0442\u043e\u043a.',
    fail: '\u0417\u0430\u044f\u0432\u043a\u0430 \u043d\u0435 \u0443\u0448\u043b\u0430. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437 \u0438\u043b\u0438 \u043d\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u043c\u043d\u0435 \u0432 Telegram: @Ishvaradasa'
  };
  function mark(input, bad) { if (input) input.setAttribute('aria-invalid', bad ? 'true' : 'false'); }
  function val(n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var name = form.elements.name, email = form.elements.email, contact = form.elements.contact;
    var emailVal = email ? email.value.trim() : '';
    var contactVal = contact ? contact.value.trim() : '';
    var errors = [], first = null;
    var noName = !name.value.trim();
    var noContact = !emailVal && !contactVal;
    var badEmail = !!emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    mark(name, noName);
    mark(email, noContact || badEmail);
    mark(contact, noContact);
    var consent = form.elements.consent;
    var noConsent = !!consent && !consent.checked;
    mark(consent, noConsent);
    if (noName) { errors.push(T.name); first = name; }
    if (noContact) { errors.push(T.contact); first = first || email || contact; }
    else if (badEmail) { errors.push(T.email); first = first || email; }
    if (noConsent) { errors.push(T.consent); first = first || consent; }
    if (errors.length) { status.textContent = errors.join(' '); if (first) first.focus(); return; }

    var btn = form.querySelector('.btn-send');
    if (btn) btn.disabled = true;
    status.textContent = T.sending;

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: val('name'), email: emailVal, contact: contactVal,
        question: val('question'), topic: val('topic'), website: val('website'),
        lang: EN ? 'en' : 'ru', page: location.href
      })
    }).then(function (r) {
      return r.json().catch(function () { return null; });
    }).then(function (j) {
      if (j && j.ok) { form.reset(); status.textContent = T.ok; }
      else { status.textContent = T.fail; }
    }).catch(function () {
      status.textContent = T.fail;
    }).then(function () {
      if (btn) btn.disabled = false;
    });
  });
})();

/* Ссылки, которых ещё нет (магазин книги): никуда не ведут */
(function () {
  document.querySelectorAll('a[data-pending]').forEach(function (a) {
    a.addEventListener('click', function (ev) { ev.preventDefault(); });
  });
})();

/* ===== v6: мягкое появление блоков - НАЧАЛО ===== */
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var pending = Array.prototype.slice.call(document.querySelectorAll('.leaf, .toc-leaf'));
  if (!pending.length) return;
  document.documentElement.classList.add('reveal-on');
  function show(el) { el.classList.add('is-in'); }
  function check() {
    var limit = window.innerHeight * 0.94;
    pending = pending.filter(function (el) {
      if (el.getBoundingClientRect().top < limit) { show(el); return false; }
      return true;
    });
    if (!pending.length) {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    }
  }
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  window.addEventListener('load', check);
  window.addEventListener('beforeprint', function () { pending.forEach(show); pending = []; });
  check();
})();
/* ===== v6: мягкое появление блоков - КОНЕЦ ===== */

/* ===== v17: отзывы - раскладка по колонкам, «Показать все», просмотр крупно ===== */
(function () {
  var walls = document.querySelectorAll('.rv-wall');
  if (!walls.length) return;
  var en = document.documentElement.lang === 'en';
  var dlg = null, dlgImg = null;

  function openShot(img) {
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'rv-lightbox';
      dlg.innerHTML = '<button class="rv-close" type="button" aria-label="' + (en ? 'Close' : 'Закрыть') + '">×</button><img alt="">';
      document.body.appendChild(dlg);
      dlgImg = dlg.querySelector('img');
      dlg.addEventListener('click', function (e) {
        if (e.target === dlg || e.target.classList.contains('rv-close')) dlg.close();
      });
    }
    dlgImg.src = img.currentSrc || img.src;
    dlgImg.alt = img.alt;
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else window.open(dlgImg.src, '_blank');
  }

  walls.forEach(function (wall) {
    var items = Array.prototype.slice.call(wall.querySelectorAll('.rv'));
    var limit = parseInt(wall.getAttribute('data-limit') || '0', 10);
    var limitSm = parseInt(wall.getAttribute('data-limit-sm') || '0', 10) || limit;
    var wrap = wall.nextElementSibling;
    var more = wrap && wrap.classList.contains('rv-more-wrap') ? wrap.querySelector('.rv-more') : null;
    var expanded = !limit;
    var lastKey = '';

    items.forEach(function (it) {
      var btn = it.querySelector('.rv-shot');
      if (btn) btn.addEventListener('click', function () { openShot(btn.querySelector('img')); });
    });

    function ratio(it) {
      var media = it.querySelector('img, video');
      var w = +media.getAttribute('width'), h = +media.getAttribute('height');
      return w && h ? h / w : 1;
    }

    function layout() {
      var width = wall.clientWidth;
      if (!width) return;
      var cols = Math.min(width >= 880 ? 3 : width >= 540 ? 2 : 1, items.length);
      var lim = expanded ? items.length : (cols === 1 ? limitSm : limit);
      var key = cols + '/' + lim;
      if (key === lastKey) return;
      lastKey = key;
      var columns = [], heights = [];
      wall.textContent = '';
      for (var c = 0; c < cols; c++) {
        var col = document.createElement('div');
        col.className = 'rv-col';
        wall.appendChild(col);
        columns.push(col);
        heights.push(0);
      }
      items.forEach(function (it, i) {
        if (i >= lim) return;
        var k = heights.indexOf(Math.min.apply(null, heights));
        columns[k].appendChild(it);
        heights[k] += ratio(it) + 0.18;
      });
      wall.classList.add('is-laid');
      if (more) more.hidden = lim >= items.length;
    }

    if (more) {
      more.addEventListener('click', function () {
        var shown = wall.querySelectorAll('.rv').length;
        expanded = true;
        lastKey = '';
        layout();
        var next = items[shown] && items[shown].querySelector('button, video');
        if (next) next.focus({ preventScroll: true });
      });
    }

    layout();
    var raf = 0;
    window.addEventListener('resize', function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(layout);
    });
  });
})();

/* Книга на первом экране страницы книги: крупный план и оживание при прокрутке.
   Сделано по образцу «часовых» сайтов: сначала камера идёт вплотную к обложке
   и скользит по ней, потом отходит, книга поворачивается и раскрывается.
   Только десктоп; разметку не трогаем - без скрипта остаётся обычная обложка. */
(function () {
  var fig = document.querySelector('.hero-cloth .book-object');
  if (!fig) return;
  if (!window.matchMedia('(min-width:1000px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var section = fig.closest('section');
  var img = fig.querySelector('.book-cover img');
  if (!section || !img || !section.parentNode) return;

  var COVER = img.getAttribute('src').replace(/img\/personal-book\.jpg.*$/, 'img/book-cover-hd.webp');

  var stage = document.createElement('div');
  stage.className = 'book3d-stage';
  stage.style.height = '380vh';
  section.parentNode.insertBefore(stage, section);
  stage.appendChild(section);
  section.classList.add('book3d-sticky');

  var echo = document.createElement('div');
  echo.className = 'book3d-echo';
  echo.innerHTML = '<img src="' + COVER + '" alt="">';
  fig.appendChild(echo);

  var sheets = '';
  for (var i = 0; i < 7; i++) sheets += '<span class="b-sheet" style="--i:' + i + '"></span>';
  var scene = document.createElement('div');
  scene.className = 'book3d-scene';
  scene.innerHTML = '<div class="book3d">' +
    '<span class="b-back"></span><span class="b-block"></span><span class="b-spine"></span>' +
    '<span class="b-leaves">' + sheets + '</span>' +
    '<span class="b-front"><img src="' + COVER + '" alt=""><span class="b-glare"></span></span>' +
    '</div>';
  fig.appendChild(scene);
  fig.classList.add('is-3d');

  var book = scene.querySelector('.book3d');
  var front = scene.querySelector('.b-front');
  var glare = scene.querySelector('.b-glare');
  var leaves = scene.querySelectorAll('.b-sheet');
  var text = section.querySelector('.hero-grid > div:not(.book-object)');
  var crumb = section.querySelector('.crumb');
  if (text) text.classList.add('hero-late');
  if (crumb) crumb.classList.add('hero-late');

  function lerp(a, b, t) { return a + (b - a) * t; }
  function span(p, from, to) { return Math.max(0, Math.min(1, (p - from) / (to - from))); }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  var centerShift = 0;
  function measure() {
    var r = fig.getBoundingClientRect();
    centerShift = window.innerWidth / 2 - (r.left + r.width / 2);
  }

  function frame() {
    var rect = stage.getBoundingClientRect();
    var total = stage.offsetHeight - window.innerHeight;
    var p = Math.max(0, Math.min(1, -rect.top / (total || 1)));

    var a = ease(span(p, 0, 0.24));     // вплотную: камера скользит по обложке
    var b = ease(span(p, 0.24, 0.44));  // камера отходит, книга поворачивается
    var c = ease(span(p, 0.44, 0.56));  // разворот к зрителю
    var d = ease(span(p, 0.56, 0.82));  // раскрывается, листаются страницы
    var e = ease(span(p, 0.82, 1));     // закрывается и уходит влево
    var move = ease(span(p, 0.72, 0.95));

    var scale = lerp(2.62, 2.15, a);
    scale = lerp(scale, 1.18, b);
    scale = lerp(scale, 1.02, c);
    scale = lerp(scale, 0.78, e);

    var rotY = lerp(-5, 4, a);
    rotY = lerp(rotY, -40, b);
    rotY = lerp(rotY, -13, c);
    rotY = lerp(rotY, -7, d);
    rotY = lerp(rotY, 0, e);

    var rotX = lerp(3, -2, a) + lerp(0, 4, b) - lerp(0, 4, c);

    // скольжение камеры по обложке в первой фазе
    var panX = lerp(-9, 7, a) * (1 - b);
    var panY = lerp(7, -6, a) * (1 - b);

    var shift = centerShift * (1 - move);
    var vw = window.innerWidth / 100;

    scene.style.transform = 'translate3d(' + (shift + panX * vw).toFixed(1) + 'px,' +
      (panY * vw).toFixed(1) + 'px,0)';
    // внутренние слои книги проявляются, только когда камера отошла:
    // вплотную к обложке они выглядывают по краям из-за перспективы
    book.style.setProperty('--inner', Math.min(1, b * 1.7).toFixed(2));
    book.style.transform = 'scale(' + scale.toFixed(3) + ') rotateX(' + rotX.toFixed(2) +
      'deg) rotateY(' + rotY.toFixed(2) + 'deg)';

    echo.style.transform = 'translate3d(' + (shift + panX * vw * 0.45).toFixed(1) + 'px,' +
      (panY * vw * 0.45 - 20).toFixed(1) + 'px,0) scale(' + (scale * 1.5).toFixed(3) + ')';
    echo.style.opacity = (0.42 * (1 - Math.max(c, e))).toFixed(3);

    glare.style.transform = 'translateX(' + lerp(-75, 75, a).toFixed(1) + '%)';
    glare.style.opacity = (a > 0.02 && a < 0.98 ? 0.9 : 0.1).toFixed(2);

    // закрывается быстрее, чем уезжает, чтобы не мелькать тёмной изнанкой
    var open = d * (1 - ease(span(p, 0.78, 0.88)));
    front.style.transform = 'rotateY(' + (-152 * open).toFixed(2) + 'deg)';
    for (var i = 0; i < leaves.length; i++) {
      var from = 0.60 + i * 0.028, to = from + 0.05;
      var t = ease(span(p, from, to)) * (1 - ease(span(p, 0.78, 0.88)));
      leaves[i].style.transform = 'translateZ(' + (-2.5 * i) + 'px) rotateY(' + (-150 * t).toFixed(2) + 'deg)';
    }

    // прозрачность ставим прямо здесь: если скрипт не дойдёт сюда,
    // текст останется видимым, а не пропадёт со страницы
    var show = ease(span(p, 0.84, 0.97));
    if (text) {
      text.style.opacity = show.toFixed(3);
      text.style.transform = 'translateY(' + lerp(22, 0, show).toFixed(1) + 'px)';
    }
    if (crumb) crumb.style.opacity = show.toFixed(3);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { frame(); ticking = false; });
  }
  measure();
  frame();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measure(); frame(); });
})();

/* Витрина книг: появляется шторкой снизу вверх, когда доходит до экрана */
(function () {
  var items = document.querySelectorAll('.sc-item');
  if (!items.length) return;
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    for (var i = 0; i < items.length; i++) items[i].classList.add('is-seen');
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-seen'); io.unobserve(en.target); }
    });
  }, { threshold: 0.2 });
  for (var j = 0; j < items.length; j++) io.observe(items[j]);
})();

/* Читалка: настоящие страницы книги, перелистывание стрелками */
(function () {
  var btn = document.querySelector('[data-reader]');
  if (!btn) return;
  var anchor = document.querySelector('.era-showcase img') || document.querySelector('.showcase img') || document.querySelector('.book-cover img');
  if (!anchor) return;
  var base = anchor.getAttribute('src').replace(/img\/.*$/, '');
  var EN = document.documentElement.lang === 'en';
  var T = EN ? { close: 'Close', prev: 'Previous page', next: 'Next page',
                 hint: 'Arrow keys or click the arrows · Esc to close' }
             : { close: 'Закрыть', prev: 'Предыдущая страница', next: 'Следующая страница',
                 hint: 'Стрелки на клавиатуре или кнопки по краям · Esc закрывает' };

  var pages = [];
  for (var i = 1; i <= 12; i++) {
    pages.push(base + 'img/kniga/stranica-' + (i < 10 ? '0' + i : i) + '.webp');
  }

  var box, page, prev, next, count, idx = 0, lastFocus = null;

  function build() {
    box = document.createElement('div');
    box.className = 'reader';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.hidden = true;
    box.innerHTML =
      '<button class="reader-close" type="button" aria-label="' + T.close + '">&#215;</button>' +
      '<button class="reader-nav reader-prev" type="button" aria-label="' + T.prev + '">&#8592;</button>' +
      '<div class="reader-stage"><img class="reader-page" alt=""></div>' +
      '<button class="reader-nav reader-next" type="button" aria-label="' + T.next + '">&#8594;</button>' +
      '<p class="reader-hint">' + T.hint + '</p>' +
      '<p class="reader-count"></p>';
    document.body.appendChild(box);
    page = box.querySelector('.reader-page');
    prev = box.querySelector('.reader-prev');
    next = box.querySelector('.reader-next');
    count = box.querySelector('.reader-count');
    prev.addEventListener('click', function () { show(idx - 1); });
    next.addEventListener('click', function () { show(idx + 1); });
    box.querySelector('.reader-close').addEventListener('click', close);
    box.addEventListener('click', function (ev) { if (ev.target === box) close(); });
    document.addEventListener('keydown', function (ev) {
      if (box.hidden) return;
      if (ev.key === 'Escape') close();
      if (ev.key === 'ArrowRight') show(idx + 1);
      if (ev.key === 'ArrowLeft') show(idx - 1);
    });
  }

  function preload(n) {
    if (n < 0 || n >= pages.length) return;
    var im = new Image();
    im.src = pages[n];
  }

  function show(n) {
    if (n < 0 || n >= pages.length) return;
    idx = n;
    count.textContent = (idx + 1) + ' / ' + pages.length;
    prev.disabled = idx === 0;
    next.disabled = idx === pages.length - 1;
    // ждём, пока страница загрузится, и только потом показываем:
    // иначе на секунду мелькает пустой лист
    var want = idx;
    var im = new Image();
    im.onload = function () {
      if (want !== idx) return;
      page.classList.remove('is-in');
      void page.offsetWidth;
      page.src = im.src;
      page.classList.add('is-in');
      preload(idx + 1);
      preload(idx - 1);
    };
    im.src = pages[idx];
  }

  function open() {
    if (!box) build();
    lastFocus = document.activeElement;
    box.hidden = false;
    document.body.classList.add('reader-open');
    show(0);
    requestAnimationFrame(function () { box.classList.add('is-open'); });
    next.focus();
  }

  function close() {
    box.classList.remove('is-open');
    document.body.classList.remove('reader-open');
    setTimeout(function () { box.hidden = true; }, 450);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  btn.addEventListener('click', open);
})();

/* ===== v24: первый экран и блоки в духе ERA - НАЧАЛО (откат: удалить до маркера КОНЕЦ) ===== */
(function () {
  // первый экран может стоять и на странице со старыми блоками
  if (!document.querySelector('.era-stage')) return;

  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function span(p, from, to) { return clamp((p - from) / (to - from), 0, 1); }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  /* --- верхняя строка: прозрачная над первым экраном, плотная ниже --- */
  (function () {
    var bar = document.querySelector('.topbar');
    var stage = document.querySelector('.era-stage');
    if (!bar || !stage) return;
    function tick() {
      bar.classList.toggle('is-solid', stage.getBoundingClientRect().bottom <= 96);
    }
    tick();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
  })();

  /* --- блоки поднимаются при подходе к экрану --- */
  (function () {
    var sel = '.leaf .era-head, .leaf .era-showcase, .leaf .era-body, .leaf .era-index-head,' +
              '.leaf .era-index li, .leaf .era-fact, .leaf .era-steps li, .leaf .era-price,' +
              '.leaf .era-two, .leaf .era-faq, .leaf .rv-wall, .era-quote';
    var items = Array.prototype.slice.call(document.querySelectorAll(sel));
    if (!items.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-up'); });
      return;
    }
    // соседи в одном списке всплывают друг за другом, а не разом
    var seen = {};
    items.forEach(function (el) {
      var key = el.parentNode && el.parentNode.className ? String(el.parentNode.className) : '-';
      seen[key] = (seen[key] || 0) + 1;
      el.style.transitionDelay = Math.min(seen[key] - 1, 8) * 55 + 'ms';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-up');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
    window.addEventListener('beforeprint', function () {
      items.forEach(function (el) { el.classList.add('is-up'); });
    });
  })();

  /* --- бегущая строка: уезжает вбок по мере прокрутки --- */
  (function () {
    var strip = document.querySelector('.era-strip');
    if (!strip || reduce) return;
    var track = strip.querySelector('.era-strip-track');
    if (!track) return;
    var ticking = false;
    function frame() {
      var r = strip.getBoundingClientRect();
      var t = clamp((window.innerHeight - r.top) / (window.innerHeight + r.height), 0, 1);
      track.style.transform = 'translate3d(' + (10 - 38 * t).toFixed(2) + '%,0,0)';
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { frame(); ticking = false; });
    }
    frame();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', frame);
  })();

  /* --- первый экран: книга раскрывается, листается веером и закрывается ---
     Всё ведёт прокрутка секции .era-stage: 0 - начало секции, 1 - её конец.
     Прогресс считаем по window.pageYOffset, а размеры меряем отдельно -
     чтобы в кадре не было ни одного принудительного пересчёта раскладки. */
  (function () {
    var stage = document.querySelector('.era-stage');
    var wrap = document.querySelector('.era-book-wrap');
    var bk = document.querySelector('.bk');
    if (!stage || !wrap || !bk) return;

    var leafByI = [];
    Array.prototype.forEach.call(bk.querySelectorAll('.bk-leaf'), function (el) {
      leafByI[parseInt(el.style.getPropertyValue('--i'), 10) || 0] = el;
    });
    var cover = leafByI[0];
    var pages = leafByI.slice(1).filter(Boolean);
    if (!cover || !pages.length) return;

    var edge = bk.querySelector('.bk-edge');
    var next = document.querySelector('.bk-next');
    var coverImg = cover.querySelector('.pg-r img');
    var title = document.querySelector('.era-title');
    var eyebrow = document.querySelector('.era-eyebrow');
    var split = document.querySelector('.era-split');
    var cta = document.querySelector('.era-cta-hero');
    var pins = document.querySelector('.era-pins');
    var fill = document.querySelector('.rail-line i');
    var bg = document.querySelector('.era-bg-img');
    var toggles = document.querySelectorAll('.et-btn');

    var wantPages = 0;                       // 0 - обложка, 1 - раскрытая книга
    var hand = 0;                            // сколько листов перевёрнуто вручную стрелкой
    var lastP = -1;

    Array.prototype.forEach.call(toggles, function (b) {
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(toggles, function (o) { o.classList.remove('is-on'); });
        b.classList.add('is-on');
        wantPages = b.getAttribute('data-book') === 'pages' ? 1 : 0;
        hand = 0;
        bk.classList.add('is-smooth');       // по кнопке книга открывается плавно
        draw(lastP < 0 ? 0 : lastP);
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        hand = hand >= active.length ? 0 : hand + 1;
        bk.classList.add('is-smooth');
        draw(lastP < 0 ? 0 : lastP);
      });
    }

    if (reduce) return;                      // в системе выключено движение - книга лежит закрытой

    /* ---- раскадровка по прогрессу секции ---- */
    var TXT1 = 0.18;                 // 0.00-0.18 текст первого экрана уходит вверх
    var OPN0 = 0.18, OPN1 = 0.36;    // обложка распахивается влево
    var RIF0 = 0.36, RIF1 = 0.74;    // веер страниц
    var SHT0 = 0.74, SHT1 = 0.88;    // книга закрывается, снова видна обложка
    var OUT0 = 0.88, OUT1 = 1.00;    // передача следующей секции

    // веер с нахлёстом: пока один лист долетает, следующий уже пошёл
    var OVER = 3.6;                          // сколько листов в воздухе разом
    var active = pages;                      // на телефоне часть листов скрыта
    var N = pages.length, STAG = 0, DUR = 0, boost = 0;

    function leaf(el, rot, bow) {
      el.style.setProperty('--rot', rot.toFixed(1) + 'deg');
      el.style.setProperty('--lift', (17 * bow).toFixed(1) + 'px');
      el.style.setProperty('--turn', bow.toFixed(3));
    }

    function draw(p) {
      lastP = p;
      var textOut = ease(span(p, 0.02, TXT1));
      var early = ease(span(p, 0.01, TXT1 - 0.04));
      var openP = ease(span(p, OPN0, OPN1));
      var shutP = ease(span(p, SHT0, SHT1));
      var outP = ease(span(p, OUT0, OUT1));
      var grow = ease(span(p, 0, OPN1));
      // у верха страницы книгой управляет кнопка, ниже - прокрутка
      var byHand = wantPages && p < OPN0;
      if (byHand) openP = 1;
      if (next) next.classList.toggle('is-on', !!byHand);

      var live = 1 - shutP;                          // 1 - раскрыта, 0 - захлопнулась

      // обложка: распахивается влево и остаётся лежать слева
      leaf(cover, -180 * openP * live, Math.sin(Math.PI * openP) * live);

      // страницы: одна за другой, с нахлёстом
      for (var i = 0; i < N; i++) {
        var a = RIF0 + i * STAG;
        var pr = byHand ? (i < hand ? 1 : 0) : ease(span(p, a, a + DUR));
        leaf(active[i], -180 * pr * live, Math.sin(Math.PI * pr) * live);
      }

      var openAmt = openP * live;
      if (edge) edge.style.opacity = (1 - Math.min(1, openP * 1.6) * live).toFixed(2);

      // закрытая книга стоит вполоборота, раскрытая - почти прямо
      var rotY = -(14 - 9 * openAmt);
      var rotX = 4 - 7 * ease(span(p, 0.02, OPN1));
      bk.style.transform = 'rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg)';

      // закрытая книга - это правая половина кадра, поэтому ведём её к центру
      var shift = -25 * (1 - openAmt) * Math.cos(rotY * Math.PI / 180);
      var scale = (1 + boost * (1 - openAmt)) * (1 - 0.10 * grow - 0.09 * outP);
      var lift = (1 - grow) * 13;
      wrap.style.transform = 'translate3d(' + (-50 + shift).toFixed(2) + '%,' +
        (-50 + lift).toFixed(2) + '%,0) scale(' + scale.toFixed(3) + ')';

      if (pins) {
        pins.style.opacity = (1 - Math.min(1, openP * 3)).toFixed(2);
        pins.style.pointerEvents = openP > 0.12 ? 'none' : 'auto';
      }
      if (bg) bg.style.transform = 'scale(' + (1.14 + 0.12 * grow).toFixed(3) + ')';

      // текст первого экрана: уходит вверх и растворяется - как и было
      if (title) {
        title.style.transform = 'translate3d(-50%,' + (-88 * textOut).toFixed(1) + 'px,0)';
        title.style.opacity = (1 - textOut).toFixed(3);
      }
      if (eyebrow) eyebrow.style.opacity = (1 - early).toFixed(3);
      if (split) split.style.opacity = (1 - early).toFixed(3);
      if (cta) cta.style.opacity = (1 - early).toFixed(3);
      if (fill) fill.style.height = (p * 100).toFixed(1) + '%';
    }

    /* ---- размеры меряем отдельно от отрисовки ---- */
    var total = 1;
    function measure() {
      total = Math.max(1, stage.offsetHeight - window.innerHeight);
      boost = parseFloat(getComputedStyle(wrap).getPropertyValue('--closed-boost')) || 0;
      active = pages.filter(function (el) { return getComputedStyle(el).display !== 'none'; });
      N = active.length || 1;
      STAG = (RIF1 - RIF0) / (N - 1 + OVER);
      DUR = OVER * STAG;
    }
    // положение берём у самой сцены, а не у окна: так работает и внутри
    // рамки предпросмотра, где прокручивается не окно, а вложенный документ
    function progress() {
      return clamp(-stage.getBoundingClientRect().top / total, 0, 1);
    }

    var ticking = false;
    function tick() {
      ticking = false;
      var p = progress();
      if (Math.abs(p - lastP) < 0.0004) return;      // лишние кадры не рисуем
      draw(p);
    }
    function onScroll() {
      bk.classList.remove('is-smooth');              // при прокрутке ведём кадр за кадром
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(tick);
    }
    function refresh() { measure(); lastP = -1; tick(); }

    measure();
    draw(progress());
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', refresh);
    window.addEventListener('load', refresh);
  })();
})();
/* ===== v24: первый экран и блоки в духе ERA - КОНЕЦ ===== */
