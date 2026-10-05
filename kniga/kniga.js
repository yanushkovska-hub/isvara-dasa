/* Персональная книга: сезон и свободные места, срок готовности, примерка обложки,
   окна (видео, оригиналы отзывов, страницы книги), переход «до / после», заявка. */

/* Сезон, свободные места и ориентировочный срок готовности */
(function () {
  var now = new Date();
  var m = now.getMonth();
  var season = m === 11 || m < 2 ? 'зиму' : m < 5 ? 'весну' : m < 8 ? 'лето' : 'осень';
  var free = document.querySelectorAll('.slot.free').length;
  var words = ['', 'одно место', 'два места', 'три места', 'четыре места', 'пять мест'];
  var title = document.querySelector('[data-season-title]');
  if (title) title.textContent = free ? 'На эту ' + season + ' — ' + words[free] : 'На эту ' + season + ' мест больше нет';
  var freeText = free ? 'Свободно ' + free + (free === 1 ? ' место' : ' места') + ' на ' + season : 'Все места на ' + season + ' заняты';
  document.querySelectorAll('[data-free]').forEach(function (el) { el.textContent = freeText; });

  // книга будет готова через два календарных месяца после текущего: в октябре это декабрь
  var MONTHS = ['январе', 'феврале', 'марте', 'апреле', 'мае', 'июне', 'июле', 'августе', 'сентябре', 'октябре', 'ноябре', 'декабре'];
  var eta = new Date(now.getFullYear(), m + 2, 1);
  var etaEl = document.querySelector('[data-eta]');
  if (etaEl) etaEl.textContent = 'в ' + MONTHS[eta.getMonth()] + ' ' + eta.getFullYear() + ' года';
})();

/* Примерка обложки: имя появляется на плашке вместо названия */
(function () {
  var input = document.getElementById('try-name');
  var plate = document.getElementById('cover-name');
  if (!input || !plate) return;
  input.addEventListener('input', function () {
    var v = input.value.trim();
    plate.textContent = v;
    plate.classList.toggle('is-on', !!v);
  });
})();

/* Окна */
(function () {
  var last = null;
  function open(m) {
    last = document.activeElement;
    m.hidden = false;
    document.body.classList.add('modal-open');
    var c = m.querySelector('.modal-close');
    if (c) c.focus();
  }
  function close(m) {
    m.hidden = true;
    document.body.classList.remove('modal-open');
    var v = m.querySelector('video');
    if (v) v.pause();
    if (last && last.focus) last.focus();
  }
  document.querySelectorAll('.modal').forEach(function (m) {
    m.querySelector('.modal-close').addEventListener('click', function () { close(m); });
    m.addEventListener('click', function (e) { if (e.target === m) close(m); });
  });
  document.addEventListener('keydown', function (e) {
    var m = document.querySelector('.modal:not([hidden])');
    if (!m) return;
    if (e.key === 'Escape') close(m);
    if (m.id === 'm-reader' && e.key === 'ArrowRight') step(1);
    if (m.id === 'm-reader' && e.key === 'ArrowLeft') step(-1);
  });

  // видео вручения
  var mv = document.getElementById('m-video');
  document.querySelectorAll('[data-video]').forEach(function (b) {
    b.addEventListener('click', function () {
      open(mv);
      var v = mv.querySelector('video');
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    });
  });

  // оригиналы отзывов
  var ms = document.getElementById('m-shot');
  document.querySelectorAll('[data-shot]').forEach(function (b) {
    b.addEventListener('click', function () {
      ms.querySelector('img').src = b.getAttribute('data-shot');
      open(ms);
    });
  });

  // видео автора: пока «скоро»
  var mso = document.getElementById('m-soon');
  document.querySelectorAll('[data-soon]').forEach(function (b) {
    b.addEventListener('click', function () { open(mso); });
  });

  // книга: обложка открывается, страницы переворачиваются вокруг корешка
  var mr = document.getElementById('m-reader');
  var book = document.getElementById('flip-book');
  var count = mr.querySelector('[data-count]');
  var prev = mr.querySelector('[data-step="-1"]');
  var next = mr.querySelector('[data-step="1"]');
  var PAGES = [];
  for (var i = 1; i <= 12; i++) PAGES.push('../img/kniga/stranica-' + (i < 10 ? '0' + i : i) + '.webp');
  var RATIO = 1419 / 1000;
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DUR = REDUCED ? 20 : 900;
  var leaves = [], cur = 0, single = false, busy = false;

  function face(side, what) {
    var f = document.createElement('div');
    f.className = 'face ' + side;
    if (what === 'endpaper') {
      f.className += ' endpaper';
      if (side === 'back') f.innerHTML = '<span>Эта книга написана для одного человека</span>';
    } else if (what === 'blank') {
      f.className += ' blank';
    } else if (what === 'end') {
      f.className += ' endpage';
      f.innerHTML = '<div class="end-in"><p class="eyebrow">Конец фрагмента</p><b>Дальше — ваша жизнь</b>' +
        '<p>Каждая книга пишется для одного человека. Ваша начнётся со знакомства.</p>' +
        '<a class="btn btn-gold" href="#contact" data-close>Обсудить мою книгу</a></div>';
    } else {
      var im = document.createElement('img');
      im.src = what;
      im.alt = '';
      im.draggable = false;
      f.appendChild(im);
      if (what === PAGES[0]) f.className += ' hard';
    }
    var sh = document.createElement('i');
    sh.className = 'shade';
    f.appendChild(sh);
    return f;
  }

  function build() {
    single = window.innerWidth < 720;
    book.innerHTML = '';
    book.classList.toggle('is-single', single);
    var specs = [];
    if (single) {
      PAGES.forEach(function (p, n) { specs.push([p, n === 0 ? 'endpaper' : 'blank']); });
      specs.push(['end', 'blank']);
    } else {
      specs.push([PAGES[0], 'endpaper']);
      for (var n = 1; n < PAGES.length; n += 2) specs.push([PAGES[n], PAGES[n + 1] || 'end']);
      if (PAGES.length % 2 === 0) specs[specs.length - 1][1] = 'end';
    }
    var base = document.createElement('div');
    base.className = 'base';
    book.appendChild(base);
    leaves = specs.map(function (sp) {
      var l = document.createElement('div');
      l.className = 'leaf';
      l.appendChild(face('front', sp[0]));
      l.appendChild(face('back', sp[1]));
      book.appendChild(l);
      return l;
    });
    layout();
  }

  function layout() {
    var w = window.innerWidth, h = window.innerHeight - 200;
    var pw = single ? Math.min(w - 32, h / RATIO, 460) : Math.min((w - 80) / 2, h / RATIO, 480);
    pw = Math.max(140, Math.floor(pw));
    book.style.setProperty('--pw', pw + 'px');
    book.style.setProperty('--ph', Math.round(pw * RATIO) + 'px');
  }

  function zfix() {
    leaves.forEach(function (l, i) { l.style.zIndex = i < cur ? i + 1 : leaves.length * 2 - i; });
  }

  function label() {
    if (cur === 0) return 'Обложка';
    if (cur === leaves.length) return 'Конец фрагмента';
    if (single) return cur === leaves.length - 1 ? 'Конец фрагмента' : 'Страница ' + (cur + 1) + ' из ' + PAGES.length;
    return 'Разворот ' + cur + ' из ' + (leaves.length - 1);
  }

  function state() {
    book.classList.toggle('is-closed', cur === 0);
    count.textContent = label();
    prev.disabled = cur === 0;
    next.disabled = cur >= leaves.length - (single ? 1 : 0);
  }

  function step(d) {
    if (busy) return;
    if (d > 0 && next.disabled) return;
    if (d < 0 && cur === 0) return;
    busy = true;
    var leaf = leaves[d > 0 ? cur : cur - 1];
    leaf.style.zIndex = 999;
    leaf.classList.add(d > 0 ? 'turn-fwd' : 'turn-back');
    leaf.classList.toggle('is-flipped', d > 0);
    cur += d;
    state();
    setTimeout(function () {
      leaf.classList.remove('turn-fwd', 'turn-back');
      zfix();
      busy = false;
    }, DUR);
  }

  function jump(n) {
    book.classList.add('no-anim');
    cur = n;
    leaves.forEach(function (l, i) { l.classList.toggle('is-flipped', i < cur); });
    zfix();
    state();
    void book.offsetWidth;
    book.classList.remove('no-anim');
  }

  prev.addEventListener('click', function () { step(-1); });
  next.addEventListener('click', function () { step(1); });

  // нажатие по правой половине листает вперёд, по левой назад; смахивание тоже листает
  var downX = null, swiped = false;
  book.addEventListener('pointerdown', function (e) { downX = e.clientX; swiped = false; });
  book.addEventListener('pointerup', function (e) {
    if (downX === null) return;
    var dx = e.clientX - downX;
    downX = null;
    if (Math.abs(dx) > 40) { swiped = true; step(dx < 0 ? 1 : -1); }
  });
  book.addEventListener('click', function (e) {
    var a = e.target.closest('[data-close]');
    if (a) { close(mr); return; }
    if (swiped) return;
    var r = book.getBoundingClientRect();
    var mid = single ? r.left + r.width * 0.3 : r.left + r.width / 2;
    step(e.clientX >= mid ? 1 : -1);
  });

  window.addEventListener('resize', function () {
    if (mr.hidden) return;
    if ((window.innerWidth < 720) !== single) { build(); jump(0); } else layout();
  });

  document.querySelectorAll('[data-reader]').forEach(function (b) {
    b.addEventListener('click', function () {
      var n = +b.getAttribute('data-reader') || 0;
      build();
      var target = single ? n : n === 0 ? 0 : n % 2 ? (n + 1) / 2 : n / 2 + 1;
      jump(target);
      open(mr);
      // с первой страницы книга сама открывает обложку
      if (target === 0) setTimeout(function () { if (!mr.hidden && cur === 0) step(1); }, REDUCED ? 0 : 650);
    });
  });
})();

/* Том в телефоне: вопросы прокручиваются сами, их можно листать и вручную */
(function () {
  var list = document.querySelector('.ph-list');
  var roll = document.querySelector('.ph-roll');
  if (!list || !roll) return;
  var SPEED = 26, last = 0, hold = 0, visible = false, raf = 0, pos = 0;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) SPEED = 0;
  function half() { return roll.scrollHeight / 2; }
  function loop(t) {
    raf = 0;
    if (!visible) return;
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    if (t > hold && SPEED) {
      if (Math.abs(list.scrollTop - pos) > 2) pos = list.scrollTop;
      pos += SPEED * dt;
      if (pos >= half()) pos -= half();
      list.scrollTop = pos;
    } else {
      if (list.scrollTop >= half()) list.scrollTop -= half();
      if (list.scrollTop <= 0) list.scrollTop += half();
      pos = list.scrollTop;
    }
    raf = requestAnimationFrame(loop);
  }
  function pause() { hold = performance.now() + 2500; }
  ['wheel', 'touchstart', 'pointerdown', 'mouseenter'].forEach(function (ev) { list.addEventListener(ev, pause, { passive: true }); });
  list.addEventListener('mousemove', pause, { passive: true });
  new IntersectionObserver(function (es) {
    visible = es[0].isIntersecting;
    last = 0;
    if (visible && !raf) raf = requestAnimationFrame(loop);
  }).observe(list);
})();

/* Лента страниц: стрелки листают вбок */
(function () {
  var strip = document.querySelector('.pages');
  if (!strip) return;
  var prev = document.querySelector('[data-pg="-1"]'), next = document.querySelector('[data-pg="1"]');
  function upd() {
    prev.disabled = strip.scrollLeft < 4;
    next.disabled = strip.scrollLeft + strip.clientWidth > strip.scrollWidth - 4;
  }
  function go(d) {
    var item = strip.querySelector('button');
    var w = item ? item.getBoundingClientRect().width + 14 : 200;
    strip.scrollBy({ left: d * w * 2, behavior: 'smooth' });
  }
  prev.addEventListener('click', function () { go(-1); });
  next.addEventListener('click', function () { go(1); });
  strip.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd);
  upd();
})();

/* Шапка перекрашивается под блок и подсвечивает текущий раздел; на телефоне внизу панель с записью */
(function () {
  var top = document.querySelector('.top');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[data-ch]'));
  var dock = document.getElementById('dock');
  var hero = document.getElementById('top');
  var contact = document.getElementById('contact');
  var ticking = false;
  function sectionAt(y) {
    var el = document.elementFromPoint(Math.round(window.innerWidth / 2), y);
    return el && el.closest ? el.closest('[data-theme]') : null;
  }
  function frame() {
    ticking = false;
    var h = top.offsetHeight;
    var sec = sectionAt(h + 2);
    if (sec && !sec.closest('.top')) top.classList.toggle('is-light', sec.getAttribute('data-theme') !== 'night');
    var mid = sectionAt(Math.round(window.innerHeight * 0.4));
    var ch = mid ? mid.getAttribute('data-ch') : '';
    links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('data-ch') === ch); });
    if (dock) {
      var pastHero = hero.getBoundingClientRect().bottom < 0;
      var atContact = contact.getBoundingClientRect().top < window.innerHeight;
      dock.classList.toggle('is-on', pastHero && !atContact);
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();
})();

/* Переход «до / после»: правая часть загорается, когда блок появляется на экране */
(function () {
  var sec = document.getElementById('change');
  if (!sec) return;
  var items = sec.querySelectorAll('.after li');
  items.forEach(function (li, i) { li.style.transitionDelay = (0.25 + i * 0.18) + 's'; });
  if (!('IntersectionObserver' in window)) { sec.classList.add('is-on'); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { sec.classList.add('is-on'); io.disconnect(); }
    });
  }, { threshold: 0.35 });
  io.observe(sec);
})();

/* Заявка: уходит тем же путём, что и на остальном сайте */
(function () {
  var form = document.getElementById('lead-form');
  var status = document.getElementById('form-status');
  if (!form) return;
  var ENDPOINT = 'https://isvara-dasa-form.isvara-dasa.workers.dev';
  var T = {
    name: 'Напишите, как вас зовут.',
    contact: 'Оставьте Telegram, телефон или email, чтобы я мог ответить.',
    email: 'Проверьте email: похоже, в нём ошибка.',
    consent: 'Поставьте галочку, чтобы согласиться с политикой конфиденциальности.',
    sending: 'Отправляю…',
    ok: 'Спасибо, заявка у меня. Отвечу лично, в течение суток.',
    fail: 'Заявка не ушла. Попробуйте ещё раз или напишите мне в Telegram: @Ishvaradasa'
  };
  function mark(el, bad) { if (el) el.setAttribute('aria-invalid', bad ? 'true' : 'false'); }
  function val(n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var name = form.elements.name, email = form.elements.email, contact = form.elements.contact, consent = form.elements.consent;
    var emailVal = val('email'), contactVal = val('contact');
    var noName = !val('name');
    var noContact = !emailVal && !contactVal;
    var badEmail = !!emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    var noConsent = !consent.checked;
    mark(name, noName); mark(contact, noContact); mark(email, noContact || badEmail); mark(consent, noConsent);
    var errors = [], first = null;
    if (noName) { errors.push(T.name); first = name; }
    if (noContact) { errors.push(T.contact); first = first || contact; }
    else if (badEmail) { errors.push(T.email); first = first || email; }
    if (noConsent) { errors.push(T.consent); first = first || consent; }
    if (errors.length) { status.textContent = errors.join(' '); if (first) first.focus(); return; }

    var btn = form.querySelector('.btn-send');
    btn.disabled = true;
    status.textContent = T.sending;
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: val('name'), email: emailVal, contact: contactVal,
        question: val('question'), topic: val('topic'), website: val('website'),
        lang: 'ru', page: location.href
      })
    }).then(function (r) {
      return r.json().catch(function () { return null; });
    }).then(function (j) {
      if (j && j.ok) { form.reset(); status.textContent = T.ok; }
      else { status.textContent = T.fail; }
    }).catch(function () {
      status.textContent = T.fail;
    }).then(function () {
      btn.disabled = false;
    });
  });
})();

/* Появление при прокрутке: блоки проявляются и поднимаются, в сетках по очереди; цифры досчитывают */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var SEL = [
    '.head > *', '.thesis q', '.thesis .by', '.why-h', '.why > div', '.facts .voice', '.facts li', '.facts-cta', '#change .cta-row',
    '.state', '.bridge', '.inside-top .tile', '.fan', '.sph-head > *', '.pack-list > li', '.pkg-cta', '.spheres li', '.relic > div',
    '.answers > .shell > .eyebrow', '.answers .h2', '.answers .lead', '.ph-stats > div', '.phone',
    '.calc > *', '.method-head .mh-text > *', '.kundali', '.part-h', '.author > div', '.bio p', '.no-photo', '.abook', '.vcard', '.proof article', '.proof-note', '.path li', '.path-note', '#path .cta-row',
    '.revs figure', '.voices-h', '.voices figure', '.cta-row', '.moments figure', '.moments dl > div',
    '.now .h2', '.slot', '.now .lead', '.eta', '.faq details', '.final-head > *', '.form'
  ].join(',');
  var els = Array.prototype.slice.call(document.querySelectorAll(SEL));
  els.forEach(function (el) {
    el.classList.add('rv');
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return els.indexOf(c) !== -1; });
    var i = sibs.indexOf(el);
    if (i > 0) {
      el.style.transitionDelay = Math.min(i, 8) * 90 + 'ms';
      el.style.setProperty('--d', Math.min(i, 8) * 90 + 'ms');
    }
  });

  // цифры досчитывают до своего значения, диапазоны «200–500» тоже
  function countUp(b) {
    if (!b || b.dataset.counted) return;
    var m = /^(\d+)(?:–(\d+))?([+%]?)$/.exec(b.textContent.trim());
    if (!m) return;
    b.dataset.counted = '1';
    var a = +m[1], z = m[2] ? +m[2] : null, suf = m[3], t0 = null, dur = 1500;
    if (a < 5 && z === null) return;
    function fmt(e) { return Math.round(a * e) + (z !== null ? '–' + Math.round(z * e) : '') + suf; }
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      b.textContent = fmt(1 - Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(tick);
    }
    b.textContent = fmt(0);
    setTimeout(function () { requestAnimationFrame(tick); }, parseFloat(b.parentNode.style.transitionDelay || 0) || 0);
  }

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll && e.target.querySelectorAll('.facts b, .author b').forEach(countUp);
      if (e.target.matches('.facts li, .author > div')) countUp(e.target.querySelector('b'));
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(function (el) { io.observe(el); });
})();
