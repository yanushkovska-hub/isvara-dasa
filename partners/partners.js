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
