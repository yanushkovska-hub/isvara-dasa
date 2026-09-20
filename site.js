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

/* Книга на первом экране страницы книги: объём и оживание при прокрутке.
   Только десктоп и только если человек не просил убрать анимацию.
   Разметку не трогаем - если скрипт не сработал, остаётся обычная обложка. */
(function () {
  var fig = document.querySelector('.hero-cloth .book-object');
  if (!fig) return;
  if (!window.matchMedia('(min-width:1000px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var section = fig.closest('section');
  var img = fig.querySelector('.book-cover img');
  if (!section || !img || !section.parentNode) return;

  var stage = document.createElement('div');
  stage.className = 'book3d-stage';
  stage.style.height = '320vh';
  section.parentNode.insertBefore(stage, section);
  stage.appendChild(section);
  section.classList.add('book3d-sticky');

  var sheets = '';
  for (var i = 0; i < 6; i++) sheets += '<span class="b-sheet" style="--i:' + i + '"></span>';
  var scene = document.createElement('div');
  scene.className = 'book3d-scene';
  scene.innerHTML = '<div class="book3d">' +
    '<span class="b-back"></span><span class="b-block"></span><span class="b-spine"></span>' +
    '<span class="b-leaves">' + sheets + '</span>' +
    '<span class="b-front"><img src="' + img.getAttribute('src') + '" alt=""><span class="b-glare"></span></span>' +
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

    // 1. камера подходит к книге и скользит по обложке
    var a = ease(span(p, 0, 0.18));
    // 2. книга поворачивается
    var b = ease(span(p, 0.18, 0.38));
    // 3. камера отходит
    var c = ease(span(p, 0.38, 0.52));
    // 4. книга открывается и листаются страницы
    var d = ease(span(p, 0.52, 0.80));
    // 5. книга уходит влево, появляется текст
    var e = ease(span(p, 0.80, 1));

    var scale = lerp(0.82, 1.5, a);
    scale = lerp(scale, 1.32, b);
    scale = lerp(scale, 1.02, c);
    scale = lerp(scale, 0.92, e);
    var rotY = lerp(-6, 2, a);
    rotY = lerp(rotY, -42, b);
    rotY = lerp(rotY, -16, c);
    rotY = lerp(rotY, -8, d);
    rotY = lerp(rotY, 0, e);
    var rotX = lerp(6, 0, a) + lerp(0, 4, b) - lerp(0, 4, c);
    // книга уезжает влево раньше, чем проявляется текст,
    // чтобы они не накладывались друг на друга
    var move = ease(span(p, 0.70, 0.93));
    var shift = centerShift * (1 - move);
    var lift = lerp(30, 0, a) - lerp(0, 10, d);

    scene.style.transform = 'translate3d(' + shift.toFixed(1) + 'px,' + lift.toFixed(1) + 'px,0)';
    book.style.transform = 'scale(' + scale.toFixed(3) + ') rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg)';
    glare.style.transform = 'translateX(' + lerp(-70, 70, a).toFixed(1) + '%)';
    glare.style.opacity = (a > 0 && a < 1 ? 1 : 0.12).toFixed(2);
    // к концу книга закрывается, чтобы первый экран замер на обложке,
    // а не на пустой странице
    var open = d * (1 - e);
    front.style.transform = 'rotateY(' + (-152 * open).toFixed(2) + 'deg)';

    for (var i = 0; i < leaves.length; i++) {
      var from = 0.56 + i * 0.035, to = from + 0.06;
      var t = ease(span(p, from, to));
      leaves[i].style.transform = 'translateZ(' + (-2 * i) + 'px) rotateY(' + (-150 * t * (1 - e)).toFixed(2) + 'deg)';
    }

    // прозрачность ставим прямо здесь: если скрипт не дойдёт сюда,
    // текст останется видимым, а не пропадёт со страницы
    var show = ease(span(p, 0.80, 0.96));
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
