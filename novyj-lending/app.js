/* Персональная книга · поведение лендинга */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* Появление при прокрутке */
  $$('.up').forEach(function (el) { requestAnimationFrame(function () { el.classList.add('is-in'); }); });
  var items = $$('.reveal, .shelf');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Фраза о вине: слова загораются по мере прокрутки */
  var glow = $('[data-glow]'), glowWords = [];
  if (glow && !reduce) {
    Array.prototype.slice.call(glow.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/( )/).forEach(function (part) {
          if (part === ' ' || part === '') { frag.appendChild(document.createTextNode(part)); return; }
          var s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
        });
        glow.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        node.classList.add('w');
      }
    });
    glowWords = $$('.w', glow);
  }

  var heroBook = $('#hero-book');
  var words = $('#words');
  var track = $('#sph-track');
  var sph = track ? $$('.sph', track) : [];
  var dots = track ? $$('.sph-dots i', track) : [];
  var current = -1;

  function frame() {
    var vh = window.innerHeight;
    if (heroBook) heroBook.style.setProperty('--p', clamp(window.scrollY / (vh * .8)).toFixed(3));
    if (words) {
      var t = words.getBoundingClientRect().top;
      words.style.setProperty('--fade', clamp((vh * .62 - t) / (vh * .4)).toFixed(3));
    }
    if (glowWords.length) {
      var g = glow.getBoundingClientRect();
      var p = clamp((vh * .85 - g.top) / (vh * .5));
      var on = Math.round(p * glowWords.length);
      glowWords.forEach(function (w, i) { w.classList.toggle('on', i < on); });
    }
    if (sph.length) {
      var r = track.getBoundingClientRect();
      var prog = clamp(-r.top / (r.height - vh));
      var idx = Math.min(sph.length - 1, Math.floor(prog * sph.length));
      if (idx !== current) {
        current = idx;
        sph.forEach(function (el, i) {
          el.classList.toggle('is-on', i === idx);
          el.classList.toggle('is-past', i < idx);
        });
        dots.forEach(function (d, i) { d.classList.toggle('is-on', i === idx); });
      }
    }
  }
  if (!reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { ticking = false; frame(); });
    }, { passive: true });
    window.addEventListener('resize', frame);
    frame();
  } else if (track) {
    track.style.height = 'auto';
    $('.sticky-stage', track).style.position = 'static';
    $('.sticky-stage', track).style.height = 'auto';
    sph.forEach(function (el) { el.style.position = 'static'; el.style.opacity = 1; el.style.transform = 'none'; el.style.marginBottom = '56px'; });
  }

  /* Примерка обложки */
  var engIn = $('#eng-in'), engOut = $('#eng-out');
  if (engIn && engOut) {
    var def = engOut.textContent;
    engIn.addEventListener('input', function () {
      var v = engIn.value.trim();
      engOut.textContent = v ? v.charAt(0).toUpperCase() + v.slice(1) : def;
    });
  }

  /* Срок готовности */
  var eta = $('[data-eta]');
  if (eta) {
    var months = ['январю', 'февралю', 'марту', 'апрелю', 'маю', 'июню', 'июлю', 'августу', 'сентябрю', 'октябрю', 'ноябрю', 'декабрю'];
    var d = new Date(); d.setMonth(d.getMonth() + 3);
    var m = d.getMonth();
    eta.textContent = 'ориентировочно к ' + months[m];
    if (m === 11 || m === 0) eta.insertAdjacentText('afterend', ' — как раз к Новому году');
  }

  /* Окна */
  var lastFocus = null;
  function open(id) {
    var m = document.getElementById(id); if (!m) return;
    lastFocus = document.activeElement;
    m.hidden = false; document.body.style.overflow = 'hidden';
    var c = $('[data-close]', m); if (c) c.focus();
  }
  function closeAll() {
    $$('.modal').forEach(function (m) {
      if (m.hidden) return;
      m.hidden = true;
      var v = $('video', m); if (v) v.pause();
    });
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $$('[data-close]').forEach(function (b) { b.addEventListener('click', closeAll); });
  $$('.modal').forEach(function (m) { m.addEventListener('click', function (e) { if (e.target === m) closeAll(); }); });

  var video = $('#m-video video');
  $$('[data-video]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (video && !video.src) video.src = video.getAttribute('data-src');
      open('m-video');
      if (video) { var pr = video.play(); if (pr && pr.catch) pr.catch(function () {}); }
    });
  });

  var pages = [];
  for (var i = 1; i <= 12; i++) pages.push('../img/kniga/stranica-' + (i < 10 ? '0' : '') + i + '.webp');
  var page = 0, pImg = $('#m-reader .m-page'), pCount = $('#m-reader .m-count');
  var prev = $('#m-reader [data-prev]'), next = $('#m-reader [data-next]');
  function show(n) {
    page = Math.max(0, Math.min(pages.length - 1, n));
    pImg.src = pages[page];
    pImg.alt = 'Страница ' + (page + 1) + ' из ' + pages.length;
    pCount.textContent = (page + 1) + ' / ' + pages.length;
    prev.disabled = page === 0; next.disabled = page === pages.length - 1;
    if (pages[page + 1]) { var pre = new Image(); pre.src = pages[page + 1]; }
  }
  $$('[data-reader]').forEach(function (b) { b.addEventListener('click', function () { show(0); open('m-reader'); }); });
  if (prev) prev.addEventListener('click', function () { show(page - 1); });
  if (next) next.addEventListener('click', function () { show(page + 1); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
    var r = $('#m-reader');
    if (r && !r.hidden) {
      if (e.key === 'ArrowLeft') show(page - 1);
      if (e.key === 'ArrowRight') show(page + 1);
    }
  });
})();

/* Форма: отправка через приёмник на Cloudflare, оттуда в Telegram */
(function () {
  var form = document.getElementById('lead-form');
  var status = document.getElementById('form-status');
  if (!form) return;
  var ENDPOINT = 'https://isvara-dasa-form.isvara-dasa.workers.dev';
  function val(n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; }
  function mark(el, bad) { if (el) el.setAttribute('aria-invalid', bad ? 'true' : 'false'); }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var name = form.elements.name, contact = form.elements.contact, consent = form.elements.consent;
    var errors = [], first = null;
    mark(name, !val('name')); mark(contact, !val('contact')); mark(consent, !consent.checked);
    if (!val('name')) { errors.push('Напишите, как вас зовут.'); first = name; }
    if (!val('contact')) { errors.push('Оставьте Telegram или телефон, чтобы я мог ответить.'); first = first || contact; }
    if (!consent.checked) { errors.push('Поставьте галочку согласия с политикой конфиденциальности.'); first = first || consent; }
    if (errors.length) { status.textContent = errors.join(' '); first.focus(); return; }

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    status.textContent = 'Отправляю…';
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: val('name'), email: '', contact: val('contact'),
        question: val('question'), topic: val('topic'), website: val('website'),
        lang: 'ru', page: location.href
      })
    }).then(function (r) { return r.json().catch(function () { return null; }); })
      .then(function (j) {
        if (j && j.ok) { form.reset(); status.textContent = 'Спасибо, заявка у меня. Отвечу лично, в течение суток.'; }
        else { status.textContent = 'Заявка не ушла. Попробуйте ещё раз или напишите мне в Telegram: @Ishvaradasa'; }
      })
      .catch(function () { status.textContent = 'Заявка не ушла. Попробуйте ещё раз или напишите мне в Telegram: @Ishvaradasa'; })
      .then(function () { btn.disabled = false; });
  });
})();
