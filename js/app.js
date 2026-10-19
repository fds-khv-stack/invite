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
  const glyphs = (window.CONFIG && window.CONFIG.glyphs) || ['🌸', '🌷', '💗', '🍂', '🌸', '✿'];
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

/* ---------- вступление: согреть сердечко ---------- */
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

/* ---------- кнопка «Нет» ---------- */
let noAttempts = 0;
const NO_REPLIES = ['Неа', 'Не хочу', 'Не пойду', 'Точно нет', 'Ни за что',
  'Не сегодня', 'Я пас', 'Нетушки', 'Мимо', 'Отказываюсь'];

const mouseOrTouch = window.matchMedia('(hover:hover)').matches ? 'mouseenter' : 'click';

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
    setTimeout(stepEvening, 520);
  });
}

function wireClone(cl) {
  cl.addEventListener(mouseOrTouch, (e) => {
    e.preventDefault(); cl.classList.add('gone');
    noAttempts++;
  });
}

/* ---------- состояние ответов ---------- */
const picked = { evening: '', eveningLabel: '', branch: [], own: '', morning: [] };

/* ---------- экран 1: вопрос ---------- */
function first() {
  show('s1');
  $('question').textContent = C.question.replace('{name}', C.herName);
  if (C.photo) $('photo').src = C.photo;
}

/* ---------- кнопка-опция со смайликом ---------- */
function optionButton(o) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'chip';
  b.dataset.id = o.id || '';
  const emo = document.createElement('span');
  emo.className = 'emo';
  emo.textContent = o.e || '💛';
  const lbl = document.createElement('span');
  lbl.className = 'lbl';
  lbl.textContent = o.t;
  b.append(emo, lbl);
  return b;
}

/* ---------- экран 2: кафе или дома ---------- */
function stepEvening() {
  show('s2');
  $('evenTitle').textContent = C.evening.title;
  $('evenSub').textContent = C.evening.sub || '';
  const box = $('evenChips');
  if (!box.dataset.done) {
    box.dataset.done = '1';
    C.evening.options.forEach((o) => {
      const b = optionButton(o);
      b.addEventListener('click', () => {
        picked.evening = o.id;
        picked.eveningLabel = o.t;
        box.querySelectorAll('.chip').forEach((x) => x.classList.remove('sel'));
        b.classList.add('sel');
        setTimeout(stepBranch, 300);
      });
      box.appendChild(b);
    });
  }
}

/* ---------- экран 3: ветка ---------- */
function stepBranch() {
  show('s3');
  const cfg = C.branches[picked.evening] || C.branches.cafe;
  $('bTitle').textContent = cfg.title;
  $('bSub').textContent = cfg.sub || '';
  const box = $('bChips');
  box.innerHTML = '';
  picked.branch = [];
  picked.own = '';
  $('ownWrap').hidden = true;
  $('ownInput').value = '';
  $('bNext').disabled = true;

  const refresh = () => {
    $('bNext').disabled = !(picked.branch.length || picked.own.trim());
  };

  cfg.options.forEach((o) => {
    const b = optionButton(o);
    b.addEventListener('click', () => {
      const on = b.classList.toggle('sel');
      if (on) picked.branch.push(o.t);
      else picked.branch = picked.branch.filter((t) => t !== o.t);
      refresh();
    });
    box.appendChild(b);
  });

  if (cfg.own) {
    const b = optionButton({ e: cfg.own.e, t: cfg.own.t, id: 'own' });
    b.addEventListener('click', () => {
      const on = b.classList.toggle('sel');
      $('ownWrap').hidden = !on;
      if (on) {
        $('ownInput').placeholder = cfg.own.placeholder || 'Как ты хочешь?';
        $('ownInput').focus();
      } else {
        picked.own = '';
        $('ownInput').value = '';
      }
      refresh();
    });
    box.appendChild(b);
  }
}

/* ---------- экран 4: утро субботы ---------- */
function stepMorning() {
  show('s4');
  $('mTitle').textContent = C.morning.title;
  $('mSub').textContent = C.morning.sub || '';
  const box = $('mChips');
  box.innerHTML = '';
  picked.morning = [];
  $('mNext').disabled = true;
  C.morning.options.forEach((o) => {
    const b = optionButton(o);
    b.addEventListener('click', () => {
      const on = b.classList.toggle('sel');
      if (on) picked.morning.push(o.t);
      else picked.morning = picked.morning.filter((t) => t !== o.t);
      $('mNext').disabled = !picked.morning.length;
    });
    box.appendChild(b);
  });
}

/* ---------- итоги ---------- */
function branchSummary() {
  const parts = picked.branch.slice();
  if (picked.own.trim()) parts.push('«' + picked.own.trim() + '»');
  return parts.join(', ');
}
function answerLines() {
  const lines = ['💌 ' + C.herName + ' согласилась'];
  lines.push('📅 ' + C.dateLabel);
  lines.push('🍽 ' + (picked.eveningLabel || '—'));
  const after = branchSummary();
  if (after) lines.push((picked.evening === 'home' ? '🥡 ' : '🌙 ') + after);
  if (picked.morning.length) lines.push('☀️ ' + picked.morning.join(', '));
  return lines;
}

/* ---------- финал ---------- */
function finish() {
  show('s5');
  const lines = ['📅 ' + C.dateLabel, '🍽 ' + (picked.eveningLabel || '—')];
  const after = branchSummary();
  if (after) lines.push((picked.evening === 'home' ? '🥡 ' : '🌙 ') + after);
  if (picked.morning.length) lines.push('☀️ ' + picked.morning.join(', '));

  const el = $('finalText');
  el.textContent = '';
  lines.forEach((t, i) => {
    if (i) el.appendChild(document.createElement('br'));
    el.appendChild(document.createTextNode(t));
  });

  $('signedBy').textContent = C.myName;
  hearts($('s5'), $('s5').getBoundingClientRect());
  $('envelope').onclick = () => {
    $('envelope').classList.add('open');
    $('secret').textContent = C.secret;
    $('secret').classList.add('show');
  };
  sendAnswer();
}

/* ---------- отправка ответа ---------- */
async function sendAnswer() {
  const msg = answerLines().join('\n');
  const payload = {
    text: msg, message: msg, name: C.herName,
    date: C.dateLabel, evening: picked.eveningLabel,
    after: branchSummary(), morning: picked.morning.join(', '),
    noAttempts: noAttempts, at: new Date().toISOString()
  };
  try {
    if (C.tg && C.tg.token && C.tg.chat) {
      await fetch('https://api.telegram.org/bot' + C.tg.token + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: C.tg.chat, text: msg, disable_web_page_preview: true })
      });
    }
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
          _subject: '💌 ' + C.herName + ' сказала «ДА»',
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
    if (!(C.tg && C.tg.token) && !C.answerUrl && !C.formsubmitEmail && !C.webhook) {
      console.info('[invite] ответ (задай tg / formsubmitEmail):', payload);
    }
  } catch (e) { console.warn('send failed', e); }
}

/* ---------- старт ---------- */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else init();

function init() {
  wireNo();
  $('bNext').addEventListener('click', stepMorning);
  $('mNext').addEventListener('click', finish);
  $('ownInput').addEventListener('input', () => {
    picked.own = $('ownInput').value;
    $('bNext').disabled = !(picked.branch.length || picked.own.trim());
  });
  if (C.cats === false) { const box = $('cats'); if (box) box.remove(); }
  const pic = $('saturdayPic');
  if (pic) { if (C.saturdayPhoto) pic.src = C.saturdayPhoto; else pic.remove(); }
  if (C.previewSkip) first();
}
