/* Страница для партнёров: вкладки по направлениям, заявка и выдача предложения.
   Заявка уходит тому же обработчику, что и на странице книги; цели свои. */
(function () {
  var EN = document.documentElement.lang === 'en';
  var COUNTER = 114081491;
  function goal(id) { if (window.ym) ym(COUNTER, 'reachGoal', id); }

  /* Ссылки на PDF по направлениям. В них есть цена, поэтому сами файлы в открытый репозиторий не кладём.
     Пустая ссылка: после заявки человек видит обещание ответить лично. Английских PDF пока нет. */
  var PDF = EN ? {} : { astro: '', school: '', yoga: '', psy: '', blog: '', club: '' };

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="t.me/"]');
    if (a) goal('partner_telegram');
  });

  var form = document.getElementById('partner-form');
  var select = form && form.elements.type;

  /* Вкладки. Без JS все направления видны списком. Ссылка ?for=psy сразу открывает нужное. */
  var tabs = [].slice.call(document.querySelectorAll('.pt-tab'));
  function choose(type, syncForm) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-type') === type;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById('panel-' + t.getAttribute('data-type')).hidden = !on;
    });
    if (syncForm && select) select.value = type;
  }
  if (tabs.length) {
    document.documentElement.classList.add('pt-js');
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { choose(t.getAttribute('data-type'), true); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var next = tabs[(i + d + tabs.length) % tabs.length];
        next.focus();
        choose(next.getAttribute('data-type'), true);
      });
    });
    var wanted = (location.search.match(/[?&]for=([a-z]+)/) || [])[1];
    var known = tabs.some(function (t) { return t.getAttribute('data-type') === wanted; });
    choose(known ? wanted : tabs[0].getAttribute('data-type'), true);
    if (select) select.addEventListener('change', function () { choose(select.value, false); });
  }

  var status = document.getElementById('form-status');
  var pdfLink = document.getElementById('pt-pdf');
  if (!form) return;
  var ENDPOINT = 'https://isvara-dasa-form.isvara-dasa.workers.dev';
  var T = EN ? {
    name: 'Please tell me your name.',
    contact: 'Leave your Telegram, phone or email so I can reply.',
    consent: 'Please tick the box to accept the privacy policy.',
    sending: 'Sending…',
    ok: 'Thank you, I have your request. I will send you the offer personally within a day.',
    okPdf: 'Thank you, I have your request. Here is your offer:',
    fail: 'The request did not go through. Please try again or message me on Telegram: @Ishvaradasa'
  } : {
    name: 'Напишите, как Вас зовут.',
    contact: 'Оставьте Telegram, телефон или email, чтобы я мог ответить.',
    consent: 'Поставьте галочку, чтобы согласиться с политикой конфиденциальности.',
    sending: 'Отправляю…',
    ok: 'Спасибо, заявка у меня. Пришлю предложение лично, в течение суток.',
    okPdf: 'Спасибо, заявка у меня. Вот Ваше предложение:',
    fail: 'Заявка не ушла. Попробуйте ещё раз или напишите мне в Telegram: @Ishvaradasa'
  };
  function mark(el, bad) { if (el) el.setAttribute('aria-invalid', bad ? 'true' : 'false'); }
  function val(n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var name = form.elements.name, contact = form.elements.contact, consent = form.elements.consent;
    var noName = !val('name'), noContact = !val('contact'), noConsent = !consent.checked;
    mark(name, noName); mark(contact, noContact); mark(consent, noConsent);
    var errors = [], first = null;
    if (noName) { errors.push(T.name); first = name; }
    if (noContact) { errors.push(T.contact); first = first || contact; }
    if (noConsent) { errors.push(T.consent); first = first || consent; }
    if (errors.length) { status.textContent = errors.join(' '); if (first) first.focus(); return; }

    /* Один контакт: если похоже на email, отправляем как email, иначе как Telegram или телефон */
    var c = val('contact');
    var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
    var type = select ? select.options[select.selectedIndex].text : '';
    var about = val('question');
    var typeKey = select ? select.value : '';

    var btn = form.querySelector('.btn-send');
    btn.disabled = true;
    pdfLink.hidden = true;
    status.textContent = T.sending;
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: val('name'), email: isEmail ? c : '', contact: isEmail ? '' : c,
        question: type + (about ? '. ' + about : ''), topic: val('topic'), website: val('website'),
        lang: EN ? 'en' : 'ru', page: location.href
      })
    }).then(function (r) {
      return r.json().catch(function () { return null; });
    }).then(function (j) {
      if (j && j.ok) {
        goal('partner_form');
        form.reset();
        if (select) select.value = typeKey;
        var url = PDF[typeKey];
        if (url) { status.textContent = T.okPdf; pdfLink.href = url; pdfLink.hidden = false; }
        else { status.textContent = T.ok; }
      } else { status.textContent = T.fail; }
    }).catch(function () {
      status.textContent = T.fail;
    }).then(function () {
      btn.disabled = false;
    });
  });
})();

/* Листатель страниц книги: та же механика, что на странице книги (стили в kniga.css).
   Последняя страница фрагмента ведёт к заявке партнёра. */
(function () {
  var EN = document.documentElement.lang === 'en';
  var mr = document.getElementById('m-reader');
  var book = document.getElementById('flip-book');
  if (!mr || !book) return;
  var ROOT = EN ? '../../' : '../';
  var count = mr.querySelector('[data-count]');
  var prev = mr.querySelector('[data-step="-1"]');
  var next = mr.querySelector('[data-step="1"]');
  var PAGES = [];
  for (var i = 1; i <= 12; i++) PAGES.push(ROOT + 'img/kniga/stranica-' + (i < 10 ? '0' + i : i) + '.webp');
  var RATIO = 1419 / 1000;
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DUR = REDUCED ? 20 : 900;
  var leaves = [], cur = 0, single = false, busy = false, last = null;

  function open() {
    last = document.activeElement;
    mr.hidden = false;
    document.body.classList.add('modal-open');
    mr.querySelector('.modal-close').focus();
  }
  function close() {
    mr.hidden = true;
    document.body.classList.remove('modal-open');
    if (last && last.focus) last.focus();
  }
  mr.querySelector('.modal-close').addEventListener('click', close);
  mr.addEventListener('click', function (e) { if (e.target === mr) close(); });
  document.addEventListener('keydown', function (e) {
    if (mr.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'Tab') {
      // фокус не уходит из открытого окна на страницу за ним
      var items = Array.prototype.filter.call(mr.querySelectorAll('button, [href]'), function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!items.length) return;
      var first = items[0], lastItem = items[items.length - 1];
      if (!mr.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastItem.focus(); }
      else if (!e.shiftKey && document.activeElement === lastItem) { e.preventDefault(); first.focus(); }
    }
  });

  function face(side, what) {
    var f = document.createElement('div');
    f.className = 'face ' + side;
    if (what === 'endpaper') {
      f.className += ' endpaper';
      if (side === 'back') f.innerHTML = EN ? '<span>This book was written for one person</span>' : '<span>Эта книга написана для одного человека</span>';
    } else if (what === 'blank') {
      f.className += ' blank';
    } else if (what === 'end') {
      f.className += ' endpage';
      f.innerHTML = EN
        ? '<div class="end-in"><b>Next comes your client’s life</b>' +
          '<p>Every book is written for one person. Offer it to someone who needs it.</p>' +
          '<a class="btn btn-gold" href="#contact" data-close>Get the offer</a></div>'
        : '<div class="end-in"><b>Дальше — жизнь Вашего клиента</b>' +
          '<p>Каждая книга пишется для одного человека. Предложите её тому, кому она нужна.</p>' +
          '<a class="btn btn-gold" href="#contact" data-close>Получить предложение</a></div>';
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
    if (EN) {
      if (cur === 0) return 'Cover';
      if (cur === leaves.length) return 'End of excerpt';
      if (single) return cur === leaves.length - 1 ? 'End of excerpt' : 'Page ' + (cur + 1) + ' of ' + PAGES.length;
      return 'Spread ' + cur + ' of ' + (leaves.length - 1);
    }
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
    if (e.target.closest('[data-close]')) { close(); return; }
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
      open();
      if (target === 0) setTimeout(function () { if (!mr.hidden && cur === 0) step(1); }, REDUCED ? 0 : 650);
    });
  });
})();
