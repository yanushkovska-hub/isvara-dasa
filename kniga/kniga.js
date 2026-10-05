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
  if (title) title.textContent = free ? 'На эту ' + season + ' — ' + words[free] + '.' : 'На эту ' + season + ' мест больше нет.';
  var pill = document.querySelector('[data-free]');
  if (pill) pill.textContent = free ? 'Свободно ' + free + (free === 1 ? ' место' : ' места') + ' на ' + season : 'Все места на ' + season + ' заняты';

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

  // страницы книги
  var mr = document.getElementById('m-reader');
  var img = mr.querySelector('.reader-stage img');
  var count = mr.querySelector('[data-count]');
  var prev = mr.querySelector('[data-step="-1"]');
  var next = mr.querySelector('[data-step="1"]');
  var pages = [], idx = 0;
  for (var i = 1; i <= 12; i++) pages.push('../img/kniga/stranica-' + (i < 10 ? '0' + i : i) + '.webp');
  function show(n) {
    idx = Math.max(0, Math.min(pages.length - 1, n));
    img.src = pages[idx];
    img.alt = 'Страница ' + (idx + 1);
    count.textContent = (idx + 1) + ' / ' + pages.length;
    prev.disabled = idx === 0;
    next.disabled = idx === pages.length - 1;
    if (idx + 1 < pages.length) new Image().src = pages[idx + 1];
  }
  function step(d) { show(idx + d); }
  prev.addEventListener('click', function () { step(-1); });
  next.addEventListener('click', function () { step(1); });
  document.querySelectorAll('[data-reader]').forEach(function (b) {
    b.addEventListener('click', function () {
      show(+b.getAttribute('data-reader') || 0);
      open(mr);
    });
  });
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
