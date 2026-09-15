/* Гравированная таблица: 360 градусов, 108 пад, 27 накшатр, 12 знаков */
(function () {
  var svg = document.getElementById('plate-svg');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg', C = 300;
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(e);
    return e;
  }
  function pt(r, deg) {
    var a = (deg - 90) * Math.PI / 180;
    return [+(C + r * Math.cos(a)).toFixed(2), +(C + r * Math.sin(a)).toFixed(2)];
  }
  function radial(g, r1, r2, deg) {
    var p1 = pt(r1, deg), p2 = pt(r2, deg);
    return el('line', { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], style: '--d:' + deg.toFixed(2) }, g);
  }
  var defs = el('defs', {});

  var rings = el('g', { 'class': 'p-rings' });
  [292, 287, 262, 226, 220, 156, 150, 92].forEach(function (r, i) {
    el('circle', { cx: C, cy: C, r: r, pathLength: 1, style: '--i:' + i }, rings);
  });

  var degs = el('g', { 'class': 'p-deg' });
  for (var d = 0; d < 360; d++) {
    radial(degs, 287, 287 - (d % 10 === 0 ? 15 : d % 5 === 0 ? 10 : 5), d);
  }
  var degLabels = el('g', { 'class': 'p-deglabels' });
  for (var d2 = 0; d2 < 360; d2 += 30) {
    var lp = pt(308, d2);
    var lt = el('text', { x: lp[0], y: lp[1], 'text-anchor': 'middle', 'dominant-baseline': 'central', style: '--d:' + d2 }, degLabels);
    lt.textContent = d2 + '°';
  }

  var nak = el('g', { 'class': 'p-nak' });
  var nakNum = el('g', { 'class': 'p-naknum' });
  for (var n = 0; n < 27; n++) {
    var start = n * 360 / 27;
    radial(nak, 262, 226, start);
    var mid = start + 180 / 27, np = pt(244, mid);
    var nt = el('text', { x: np[0], y: np[1], 'text-anchor': 'middle', 'dominant-baseline': 'central', style: '--d:' + mid.toFixed(2) }, nakNum);
    nt.textContent = n + 1;
  }

  var pada = el('g', { 'class': 'p-pada' });
  for (var p = 0; p < 108; p++) radial(pada, 226, 220, p * 10 / 3);

  var rashi = el('g', { 'class': 'p-rashi' });
  var rashiNames = el('g', { 'class': 'p-rashiname' });
  (document.documentElement.lang === 'en'
    ? ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena']
    : ['Меша', 'Вришабха', 'Митхуна', 'Карка', 'Симха', 'Канья', 'Тула', 'Вришчика', 'Дхану', 'Макара', 'Кумбха', 'Мина']).forEach(function (name, k) {
    var a0 = k * 30, R = 186, m = a0 + 15, bottom = m > 90 && m < 270;
    radial(rashi, 220, 150, a0);
    var s = pt(R, bottom ? a0 + 29.5 : a0 + 0.5), e = pt(R, bottom ? a0 + 0.5 : a0 + 29.5);
    var id = 'rashi-arc-' + k;
    el('path', { id: id, d: 'M' + s[0] + ' ' + s[1] + ' A' + R + ' ' + R + ' 0 0 ' + (bottom ? 0 : 1) + ' ' + e[0] + ' ' + e[1] }, defs);
    var t = el('text', { style: '--d:' + m }, rashiNames);
    var tp = el('textPath', { href: '#' + id, startOffset: '50%', 'text-anchor': 'middle' }, t);
    tp.textContent = name;
  });

  var core = el('g', { 'class': 'p-core' });
  [0, 90, 180, 270].forEach(function (a) { radial(core, 142, 12, a); });
  el('circle', { cx: C, cy: C, r: 3 }, core);

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
    ok: 'The form is not connected yet. Please message me on Telegram: @Ishvaradass.'
  } : {
    name: 'Напишите, как Вас зовут.',
    contact: 'Оставьте email или Telegram/телефон, чтобы я мог ответить.',
    email: 'Проверьте email: похоже, в нём ошибка.',
    consent: 'Поставьте галочку, чтобы согласиться с политикой конфиденциальности.',
    ok: 'Форма ещё не подключена. Напишите напрямую в Telegram: @Ishvaradass.'
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
