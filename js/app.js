'use strict';
const C = window.CONFIG;
const $ = (id) => document.getElementById(id);
const show = (id) => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  $(id).classList.add('on');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* ---------- фон: лепестки ---------- */
(function petals() {
  const box = $('petals');
  const glyphs = ['🌸', '🌷', '💗', '🍂', '🌸', '✿'];
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('span');
    s.textContent = glyphs[i % glyphs.length];
    s.style.left = Math.random() * 100 + 'vw';
    s.style.fontSize = 13 + Math.random() * 16 + 'px';
    s.style.animationDuration = 9 + Math.random() * 11 + 's';
    s.style.animationDelay = -Math.random() * 14 + 's';
    s.style.opacity = 0.35 + Math.random() * 0.45;
    box.appendChild(s);
  }
})();

/* ---------- вступиление: согреть сердечко ---------- */
(function intro() {
  const heart = $('warmHeart'), hint = $('warmHint');
  let t0 = null, raf = null;
  const HOLD = 2600;
  const start = (e) => {
    e.preventDefault(); t0 = Date.now(); heart.classList.add('warm');
    hint.textContent = 'ещё чуть-чуть…';
    const tick = () => {
      if (!t0) return;
      if (Date.now() - t0 >= HOLD) { done(); return; }
      raf = requestAnimationFrame(tick);
    };
    tick();
  };
  const stop = () => {
    if (!t0) return;
    t0 = null; cancelAnimationFrame(raf); heart.classList.remove('warm');
    hint.textContent = 'Зажми сердечко и держи 3 секунды';
  };
  const done = () => { stop(); hearts($('s0'), heart.getBoundingClientRect()); setTimeout(first, 240); };
  heart.addEventListener('pointerdown', start);
  heart.addEventListener('pointerup', stop);
  heart.addEventListener('pointerleave', stop);
  heart.addEventListener('pointercancel', stop);
  $('skipIntro').addEventListener('click', first);
})();

/* ---------- сердечки разлетаются ---------- */
function hearts(scope, rect) {
  const gl = ['💕', '❤️', '💖', '💛', '✨'];
  const cx = rect ? rect.left + rect.width / 2 : innerWidth / 2;
  const cy = rect ? rect.top + rect.height / 2 : innerHeight / 2;
  for (let i = 0; i < 22; i++) {
    const h = document.createElement('span');
    h.className = 'flying';
    h.textContent = gl[i % gl.length];
    const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 240;
    h.style.left = cx + 'px';
    h.style.top = cy + 'px';
    h.style.setProperty('--dx', Math.cos(a) * d + 'px');
    h.style.setProperty('--dy', Math.sin(a) * d + 'px');
    h.style.fontSize = 16 + Math.random() * 22 + 'px';
    h.addEventListener('animationend', () => h.remove());
    document.body.appendChild(h);
  }
}

/* ---------- первый экран ---------- */
let noAttempts = 0;
const NO_REPLIES = ['Неа', 'Не хочу', 'Не пойду', 'Точно нет', 'Ни за что',
  'Не сегодня', 'Я пас', 'Нетушки', 'Мимо', 'Отказываюсь'];

function first() {
  show('s1');
  const q = $('question');
  q.textContent = C.question.replace('{name}', C.herName);
  if (C.photo) $('photo').src = C.photo;
}

function wireNo() {
  const no = $('noBtn'), yes = $('yesBtn'), row = $('btnrow');
  const mode = C.noMode || 'runaway';
  let i = 0;
  no.addEventListener(mouseOrTouch, (e) => {
    e.preventDefault();
    noAttempts++;
    no.textContent = NO_REPLIES[i++ % NO_REPLIES.length];

    if (mode === 'shrink') {
      no.style.fontSize = Math.max(9, 16 - noAttempts * 1.8) + 'px';
      no.style.padding = Math.max(4, 15 - noAttempts * 2) + 'px ' +
        Math.max(8, 26 - noAttempts * 3) + 'px';
      if (noAttempts > 7) no.classList.add('gone');
      return;
    }
    if (mode === 'kiss') {
      if (noAttempts > 1) { no.classList.add('gone'); return; }
      no.textContent = '😘'; return;
    }
    if (mode === 'split') {
      const clone = no.cloneNode(true);
      row.appendChild(clone);
      wireClone(clone);
      return;
    }
    // runaway
    const r = no.getBoundingClientRect();
    const rad = 80 * noAttempts;
    const a = Math.random() * Math.PI * 2;
    let dx = Math.cos(a) * rad, dy = Math.sin(a) * rad;
    if (noAttempts <= 4) {
      const pad = 10;
      const nx = Math.min(Math.max(r.left + dx, pad), innerWidth - r.width - pad);
      const ny = Math.min(Math.max(r.top + dy, pad), innerHeight - r.height - pad);
      dx = nx - r.left; dy = ny - r.top;
    }
    no.style.transform = `translate(${dx}px,${dy}px)`;
    if (noAttempts > 6) no.classList.add('gone');
  });
  yes.addEventListener('click', () => {
    hearts(row, yes.getBoundingClientRect());
    setTimeout(() => { show('s2'); buildDates(); }, 520);
  });
}
function wireClone(cl) {
  cl.addEventListener(mouseOrTouch, (e) => {
    e.preventDefault(); cl.classList.add('gone');
    noAttempts++;
  });
}
const mouseOrTouch = window.matchMedia('(hover:hover)').matches ? 'mouseenter' : 'click';

/* ---------- выбор даты и времени ---------- */
const picked = { date: '', time: '', activity: '' };

function chip(text, onClick) {
  const b = document.createElement('button');
  b.className = 'chip';
  b.type = 'button';
  b.textContent = text;
  b.addEventListener('click', () => onClick(b));
  return b;
}

function buildDates() {
  const dBox = $('dateChips'), tBox = $('timeChips');
  if (dBox.dataset.done) return;
  dBox.dataset.done = '1';
  C.dates.forEach((d) => {
    const b = chip(d, (el) => {
      dBox.querySelectorAll('.chip').forEach(x => x.classList.remove('sel'));
      el.classList.add('sel'); picked.date = d; ready($('dateNext'));
    });
    dBox.appendChild(b);
  });
  C.times.forEach((t) => {
    const b = chip(t, (el) => {
      tBox.querySelectorAll('.chip').forEach(x => x.classList.remove('sel'));
      el.classList.add('sel'); picked.time = t; ready($('dateNext'));
    });
    tBox.appendChild(b);
  });
}
const ready = (btn) => { btn.disabled = !(picked.date && picked.time); };

function buildActs() {
  const box = $('actChips');
  if (box.dataset.done) return;
  box.dataset.done = '1';
  C.activities.forEach((a) => {
    const b = chip(a.e + '  ' + a.t, (el) => {
      box.querySelectorAll('.chip').forEach(x => x.classList.remove('sel'));
      el.classList.add('sel'); picked.activity = a.t;
      $('actNext').disabled = false;
    });
    b.type = 'button';
    box.appendChild(b);
  });
  box.style.display = 'grid';
  box.style.gap = '10px';
}

/* ---------- финал ---------- */
function finish() {
  show('s4');
  const txt = 'Жду тебя: ' + picked.date + ', ' + picked.time +
    '. Нас ждёт: ' + picked.activity + '.';
  $('finalText').textContent = txt;
  $('signedBy').textContent = C.myName;
  hearts($('s4'), $('s4').getBoundingClientRect());
  $('envelope').onclick = () => {
    $('envelope').classList.add('open');
    $('secret').textContent = C.secret;
    $('secret').classList.add('show');
  };
  sendAnswer();
}

/* ---------- отправка ответа ---------- */
async function sendAnswer() {
  const msg = [
    '💌 ОНА СКАЗАЛА «ДА»!',
    'Приглашение: ' + C.question.replace('{name}', C.herName),
    'День: ' + picked.date,
    'Время: ' + picked.time,
    'Занятие: ' + picked.activity,
    'Попыток нажать «Нет»: ' + noAttempts
  ].join('\n');
  const payload = {
    text: msg, message: msg, name: C.herName,
    date: picked.date, time: picked.time, activity: picked.activity,
    noAttempts: noAttempts, at: new Date().toISOString()
  };
  try {
    if (C.answerUrl) {
      await fetch(C.answerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    if (C.formsubmitEmail) {
      await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(C.formsubmitEmail), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: '💌 Она сказала «ДА» — ' + C.herName,
          _template: 'table',
          answer: msg
        })
      });
    }
    if (C.webhook) {
      fetch(C.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    }
    if (!C.answerUrl && !C.formsubmitEmail && !C.webhook) {
      console.info('[invite] ответ (задай answerUrl / formsubmitEmail):', payload);
    }
  } catch (e) { console.warn('send failed', e); }
}

/* ---------- старт ---------- */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else init();

function init() {
  wireNo();
  $('dateNext').addEventListener('click', () => { show('s3'); buildActs(); });
  $('actNext').addEventListener('click', finish);
}

