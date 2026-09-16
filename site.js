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

/* Форма: пока не подключена к Telegram-боту */
(function () {
  var form = document.getElementById('lead-form');
  var status = document.getElementById('form-status');
  if (!form) return;
  var T = document.documentElement.lang === 'en' ? {
    name: 'Please enter your name.',
    contact: 'Leave an email or Telegram/phone so I can reply.',
    email: 'Please check the email address.',
    consent: 'Please tick the box to agree to the privacy policy.',
    ok: 'The form is not connected yet. Please message me on Telegram: @Ishvaradasa.'
  } : {
    name: 'Напишите, как Вас зовут.',
    contact: 'Оставьте email или Telegram/телефон, чтобы я мог ответить.',
    email: 'Проверьте email: похоже, в нём ошибка.',
    consent: 'Поставьте галочку, чтобы согласиться с политикой конфиденциальности.',
    ok: 'Форма ещё не подключена. Напишите напрямую в Telegram: @Ishvaradasa.'
  };
  function mark(input, bad) { if (input) input.setAttribute('aria-invalid', bad ? 'true' : 'false'); }
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
    status.textContent = T.ok;
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
