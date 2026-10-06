/* Мои книги: фрагмент в листалке (как на странице персональной книги) и покупка электронной версии у автора.
   Карточка книги — .store-card[data-book]; фрагмент лежит в <template class="br-frag"> внутри карточки. */
(function () {
  var cards = document.querySelectorAll('.store-card[data-book]');
  if (!cards.length) return;
  var EN = document.documentElement.lang === 'en';
  var ENDPOINT = 'https://isvara-dasa-form.isvara-dasa.workers.dev';
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DUR = REDUCED ? 20 : 900;
  var RATIO = 1.416;
  var PRIVACY = EN ? 'privacy/' : 'privacy/';

  var T = EN ? {
    close: 'Close', prev: 'Previous page', next: 'Next page', reader: 'Book excerpt',
    hint: 'Tap a page, swipe, or use the arrows',
    cover: 'Cover', end: 'End of excerpt', page: 'Page', of: 'of', spread: 'Spread',
    endTitle: 'The rest is in the book', endText: 'The e-book comes to your email: EPUB, PDF or FB2.',
    buy: 'Buy the book', author: 'Īśvara Dāsa',
    buyEyebrow: 'E-book', buyLead: 'Bought directly from the author. The file comes to your email.',
    steps: ['Leave your email and choose a format', 'Within a day I send you a payment link', 'Right after payment the book arrives in your inbox'],
    format: 'Format', fmt: [['EPUB', 'phones and e-readers'], ['PDF', 'computer and print'], ['FB2', 'e-readers']],
    name: 'Name', email: 'Email for the book', contact: 'Telegram or phone (optional)',
    consent: 'By clicking the button, I agree to the <a href="' + PRIVACY + '" target="_blank" rel="noopener">privacy policy</a>.',
    send: 'Buy the book', alt: 'Or message me on Telegram:',
    errName: 'Please enter your name.', errEmail: 'Please enter the email the book should go to.',
    errEmailBad: 'Please check the email address.', errConsent: 'Please tick the box to agree to the privacy policy.',
    sending: 'Sending…', ok: 'Thank you! Within a day I will send a payment link to your email, and the book right after payment.',
    fail: 'The request did not go through. Please try again or message me on Telegram: @Ishvaradasa',
    topic: 'Purchase of the e-book'
  } : {
    close: 'Закрыть', prev: 'Предыдущая страница', next: 'Следующая страница', reader: 'Фрагмент книги',
    hint: 'Нажмите на страницу, смахните или листайте стрелками',
    cover: 'Обложка', end: 'Конец фрагмента', page: 'Страница', of: 'из', spread: 'Разворот',
    endTitle: 'Дальше — в книге', endText: 'Электронная книга придёт Вам на почту: EPUB, PDF или FB2.',
    buy: 'Купить книгу', author: 'Ишвара Дас',
    buyEyebrow: 'Электронная книга', buyLead: 'Покупка напрямую у автора. Файл книги придёт Вам на почту.',
    steps: ['Оставьте почту и выберите формат', 'В течение суток пришлю ссылку на оплату', 'Сразу после оплаты книга придёт на почту'],
    format: 'Формат', fmt: [['EPUB', 'телефон и читалки'], ['PDF', 'компьютер и печать'], ['FB2', 'читалки']],
    name: 'Имя', email: 'Email, куда прислать книгу', contact: 'Telegram или телефон (по желанию)',
    consent: 'Нажимая кнопку, я соглашаюсь с <a href="' + PRIVACY + '" target="_blank" rel="noopener">политикой конфиденциальности</a>.',
    send: 'Купить книгу', alt: 'Или напишите мне в Telegram:',
    errName: 'Напишите, как Вас зовут.', errEmail: 'Укажите email, куда прислать книгу.',
    errEmailBad: 'Проверьте email: похоже, в нём ошибка.', errConsent: 'Поставьте галочку, чтобы согласиться с политикой конфиденциальности.',
    sending: 'Отправляю…', ok: 'Спасибо! В течение суток пришлю на почту ссылку на оплату, а сразу после оплаты — книгу.',
    fail: 'Заявка не ушла. Попробуйте ещё раз или напишите мне в Telegram: @Ishvaradasa',
    topic: 'Покупка электронной книги'
  };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var BOOKS = {};
  cards.forEach(function (c) {
    var img = c.querySelector('.store-cover img');
    var tpl = c.querySelector('template.br-frag');
    BOOKS[c.getAttribute('data-book')] = {
      title: c.querySelector('.store-title').textContent.trim(),
      cover: img ? img.getAttribute('src') : '',
      frag: tpl && tpl.content.children.length ? tpl : null
    };
    var fb = c.querySelector('[data-frag]');
    if (fb && !tpl) fb.hidden = true;
  });

  /* окна */
  var wrap = document.createElement('div');
  wrap.innerHTML =
    '<div class="br-modal br-flip" id="br-reader" role="dialog" aria-modal="true" aria-label="' + T.reader + '" hidden>' +
      '<button class="br-close" type="button" aria-label="' + T.close + '">×</button>' +
      '<div class="br-stage"><div class="br-book"></div></div>' +
      '<div class="br-ui"><button type="button" data-step="-1" aria-label="' + T.prev + '">←</button>' +
      '<span data-count aria-live="polite"></span>' +
      '<button type="button" data-step="1" aria-label="' + T.next + '">→</button></div>' +
      '<p class="br-hint">' + T.hint + '</p>' +
    '</div>' +
    '<div class="br-modal" id="br-buy" role="dialog" aria-modal="true" aria-labelledby="br-buy-h" hidden>' +
      '<div class="br-sheet">' +
        '<button class="br-close" type="button" aria-label="' + T.close + '">×</button>' +
        '<div class="br-buy-head"><span class="book-cover"><img alt="" width="640" height="906"></span>' +
          '<div><p class="br-eyebrow">' + T.buyEyebrow + '</p><h3 id="br-buy-h"></h3><p>' + T.buyLead + '</p></div></div>' +
        '<ol class="br-steps">' + T.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' +
        '<form class="br-form" novalidate>' +
          '<fieldset class="chips"><legend>' + T.format + '</legend>' +
            T.fmt.map(function (f, i) {
              return '<label class="chip"><input type="radio" name="format" value="' + f[0] + '"' + (i ? '' : ' checked') + '><span><b>' + f[0] + '</b> · ' + f[1] + '</span></label>';
            }).join('') +
          '</fieldset>' +
          '<div class="fld"><input id="br-name" name="name" autocomplete="name" placeholder=" " required><label for="br-name">' + T.name + '</label></div>' +
          '<div class="fld"><input id="br-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder=" " required><label for="br-email">' + T.email + '</label></div>' +
          '<div class="fld"><input id="br-contact" name="contact" autocomplete="tel" placeholder=" "><label for="br-contact">' + T.contact + '</label></div>' +
          '<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
          '<button class="btn-send" type="submit">' + T.send + ' <span aria-hidden="true">→</span></button>' +
          '<label class="consent-check"><input type="checkbox" name="consent" required><span class="consent-box" aria-hidden="true"></span><span>' + T.consent + '</span></label>' +
          '<p class="form-status" role="status" aria-live="polite"></p>' +
        '</form>' +
        '<p class="br-alt">' + T.alt + ' <a href="https://t.me/Ishvaradasa" target="_blank" rel="noopener">@Ishvaradasa</a></p>' +
      '</div>' +
    '</div>';
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

  var mr = document.getElementById('br-reader');
  var mb = document.getElementById('br-buy');
  var lastFocus = null;

  function open(m) {
    if (!document.querySelector('.br-modal:not([hidden])')) lastFocus = document.activeElement;
    m.hidden = false;
    document.body.classList.add('br-lock');
    m.querySelector('.br-close').focus();
  }
  function close(m) {
    m.hidden = true;
    if (!document.querySelector('.br-modal:not([hidden])')) {
      document.body.classList.remove('br-lock');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
  }
  [mr, mb].forEach(function (m) {
    m.addEventListener('click', function (e) {
      if (e.target === m || e.target.closest('.br-close')) close(m);
    });
  });
  document.addEventListener('keydown', function (e) {
    var m = document.querySelector('.br-modal:not([hidden])');
    if (!m) return;
    if (e.key === 'Escape') close(m);
    if (m === mr && e.key === 'ArrowRight') step(1);
    if (m === mr && e.key === 'ArrowLeft') step(-1);
    if (e.key === 'Tab') {
      var items = Array.prototype.filter.call(
        m.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])'),
        function (el) { return !el.disabled && el.offsetParent !== null; }
      );
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (!m.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* листалка */
  var book = mr.querySelector('.br-book');
  var count = mr.querySelector('[data-count]');
  var prev = mr.querySelector('[data-step="-1"]');
  var next = mr.querySelector('[data-step="1"]');
  var cur = 0, leaves = [], single = false, busy = false, maxCur = 0, B = null, pages = [];

  function size() {
    var w = window.innerWidth, h = window.innerHeight - 190;
    var pw = single ? Math.min(w - 32, h / RATIO, 460) : Math.min((w - 80) / 2, h / RATIO, 470);
    pw = Math.max(150, Math.floor(pw));
    book.style.setProperty('--pw', pw + 'px');
    book.style.setProperty('--ph', Math.round(pw * RATIO) + 'px');
  }

  // текст фрагмента раскладывается по страницам нужного размера
  function paginate() {
    var meas = document.createElement('div');
    meas.className = 'br-face br-page br-measure';
    meas.innerHTML = '<div class="br-text"></div>';
    book.appendChild(meas);
    var box = meas.firstChild, out = [];
    function fits() { return box.scrollHeight <= box.clientHeight + 1; }
    function flush() { out.push(box.innerHTML); box.innerHTML = ''; }
    Array.prototype.forEach.call(B.frag.content.children, function (src) {
      var node = src.cloneNode(true);
      box.appendChild(node);
      if (fits()) return;
      box.removeChild(node);
      if (node.tagName !== 'P' || node.classList.contains('br-label')) { if (box.childNodes.length) flush(); box.appendChild(node); return; }
      var words = node.textContent.split(' '), cls = node.className;
      while (words.length) {
        var p = document.createElement('p');
        if (cls) p.className = cls;
        box.appendChild(p);
        var lo = 1, hi = words.length, best = 0;
        while (lo <= hi) {
          var mid = (lo + hi) >> 1;
          p.textContent = words.slice(0, mid).join(' ');
          if (fits()) { best = mid; lo = mid + 1; } else hi = mid - 1;
        }
        if (best === words.length) { p.textContent = words.join(' '); break; }
        if (best === 0) {
          box.removeChild(p);
          if (!box.childNodes.length) { p.textContent = words.shift(); box.appendChild(p); }
          flush();
          continue;
        }
        p.textContent = words.slice(0, best).join(' ');
        words = words.slice(best);
        flush();
        cls = 'br-cont';
      }
    });
    if (box.childNodes.length) flush();
    book.removeChild(meas);
    return out;
  }

  function face(side, what, n) {
    var f = document.createElement('div');
    f.className = 'br-face ' + side;
    if (what === 'cover') {
      f.className += ' br-hard';
      f.innerHTML = '<img src="' + esc(B.cover) + '" alt="" draggable="false">';
    } else if (what === 'endpaper') {
      f.className += ' br-endpaper';
      f.innerHTML = '<span><b>' + esc(B.title) + '</b>' + T.author + '</span>';
    } else if (what === 'blank') {
      f.className += ' br-blank';
    } else if (what === 'end') {
      f.className += ' br-endpage';
      f.innerHTML = '<div class="br-end-in"><p class="br-eyebrow">' + T.end + '</p><b>' + T.endTitle + '</b>' +
        '<p>' + T.endText + '</p><button class="br-end-buy" type="button" data-buy-now>' + T.buy + '</button></div>';
    } else {
      f.className += ' br-page';
      f.innerHTML = '<p class="br-run">' + esc(B.title) + '</p><div class="br-text">' + pages[what] + '</div><p class="br-num">' + (what + 1) + '</p>';
    }
    var sh = document.createElement('i');
    sh.className = 'br-shade';
    f.appendChild(sh);
    return f;
  }

  function build() {
    single = window.innerWidth < 720;
    book.innerHTML = '';
    book.classList.toggle('is-single', single);
    size();
    pages = paginate();
    var all = pages.map(function (p, i) { return i; }).concat(['end']);
    var specs = [];
    if (single) {
      specs.push(['cover', 'blank']);
      all.forEach(function (p) { specs.push([p, 'blank']); });
      maxCur = specs.length - 1;
    } else {
      specs.push(['cover', 'endpaper']);
      for (var n = 0; n < all.length; n += 2) specs.push([all[n], n + 1 < all.length ? all[n + 1] : 'blank']);
      maxCur = all.length % 2 ? specs.length - 1 : specs.length;
    }
    var base = document.createElement('div');
    base.className = 'br-base';
    book.appendChild(base);
    leaves = specs.map(function (sp) {
      var l = document.createElement('div');
      l.className = 'br-leaf';
      l.appendChild(face('front', sp[0]));
      l.appendChild(face('back', sp[1]));
      book.appendChild(l);
      return l;
    });
  }

  function zfix() { leaves.forEach(function (l, i) { l.style.zIndex = i < cur ? i + 1 : leaves.length * 2 - i; }); }

  function label() {
    if (cur === 0) return T.cover;
    if (cur >= maxCur) return T.end;
    if (single) return T.page + ' ' + cur + ' ' + T.of + ' ' + pages.length;
    return T.spread + ' ' + cur + ' ' + T.of + ' ' + (maxCur - 1);
  }

  function state() {
    book.classList.toggle('is-closed', cur === 0);
    count.textContent = label();
    prev.disabled = cur === 0;
    next.disabled = cur >= maxCur;
  }

  function step(d) {
    if (busy || mr.hidden) return;
    if (d > 0 && cur >= maxCur) return;
    if (d < 0 && cur === 0) return;
    busy = true;
    var leaf = leaves[d > 0 ? cur : cur - 1];
    leaf.style.zIndex = 999;
    leaf.classList.add(d > 0 ? 'turn-fwd' : 'turn-back');
    leaf.classList.toggle('is-flipped', d > 0);
    cur += d;
    state();
    setTimeout(function () { leaf.classList.remove('turn-fwd', 'turn-back'); zfix(); busy = false; }, DUR);
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

  var downX = null, swiped = false;
  book.addEventListener('pointerdown', function (e) { downX = e.clientX; swiped = false; });
  book.addEventListener('pointerup', function (e) {
    if (downX === null) return;
    var dx = e.clientX - downX;
    downX = null;
    if (Math.abs(dx) > 40) { swiped = true; step(dx < 0 ? 1 : -1); }
  });
  book.addEventListener('click', function (e) {
    if (e.target.closest('[data-buy-now]')) { var id = currentId; close(mr); openBuy(id); return; }
    if (swiped) return;
    var r = book.getBoundingClientRect();
    var mid = single ? r.left + r.width * 0.3 : r.left + r.width / 2;
    step(e.clientX >= mid ? 1 : -1);
  });

  window.addEventListener('resize', function () {
    if (mr.hidden) return;
    var keep = cur;
    var was = single;
    build();
    jump(was === single ? Math.min(keep, maxCur) : 0);
  });

  var currentId = null;
  function openReader(id) {
    B = BOOKS[id];
    if (!B || !B.frag) return;
    currentId = id;
    open(mr);
    build();
    jump(0);
    setTimeout(function () { if (!mr.hidden && cur === 0) step(1); }, REDUCED ? 0 : 650);
  }

  /* покупка */
  var form = mb.querySelector('form');
  var status = form.querySelector('.form-status');
  var buyId = null;
  function openBuy(id) {
    var b = BOOKS[id];
    if (!b) return;
    buyId = id;
    mb.querySelector('#br-buy-h').textContent = b.title;
    mb.querySelector('.br-buy-head img').src = b.cover;
    status.textContent = '';
    open(mb);
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var f = form.elements;
    var name = f.name.value.trim(), email = f.email.value.trim();
    var errs = [], first = null;
    function bad(el, on) { el.setAttribute('aria-invalid', on ? 'true' : 'false'); }
    bad(f.name, !name); bad(f.email, !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)); bad(f.consent, !f.consent.checked);
    if (!name) { errs.push(T.errName); first = f.name; }
    if (!email) { errs.push(T.errEmail); first = first || f.email; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errs.push(T.errEmailBad); first = first || f.email; }
    if (!f.consent.checked) { errs.push(T.errConsent); first = first || f.consent; }
    if (errs.length) { status.textContent = errs.join(' '); first.focus(); return; }
    var btn = form.querySelector('.btn-send');
    btn.disabled = true;
    status.textContent = T.sending;
    var fmt = form.querySelector('input[name="format"]:checked').value;
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name, email: email, contact: f.contact.value.trim(),
        question: (EN ? 'Format: ' : 'Формат: ') + fmt,
        topic: T.topic + ' «' + BOOKS[buyId].title + '»',
        website: f.website.value, lang: EN ? 'en' : 'ru', page: location.href
      })
    }).then(function (r) { return r.json().catch(function () { return null; }); })
      .then(function (j) {
        if (j && j.ok) { form.reset(); status.textContent = T.ok; } else status.textContent = T.fail;
      })
      .catch(function () { status.textContent = T.fail; })
      .then(function () { btn.disabled = false; });
  });

  cards.forEach(function (c) {
    var id = c.getAttribute('data-book');
    var fb = c.querySelector('[data-frag]');
    if (fb) fb.addEventListener('click', function () { openReader(id); });
    var bb = c.querySelector('[data-buy]');
    if (bb) bb.addEventListener('click', function () { openBuy(id); });
  });
})();
