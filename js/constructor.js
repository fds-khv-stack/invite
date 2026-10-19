'use strict';
/* Конструктор приглашения: форма → ссылка. Данные живут в самой ссылке (#d=base64url). */

const $ = (id) => document.getElementById(id);
const DRAFT = 'invite-draft-v2';

const DEFAULT = {
  herName: 'Алёна',
  myName: 'Дмитрий',
  question: '{name}, ты останешься у меня в эту пятницу, 23 октября?',
  dateLabel: 'пятница, 23 октября',
  eveningTitle: 'Как бы ты хотела провести вечер?',
  eveningOpts: [
    { e: '🍽', t: 'Ужинаем в кафе' },
    { e: '🏠', t: 'Ужинаем дома' }
  ],
  // ветка «в кафе»: чем займёмся после
  cafeTitle: 'Что выберешь после ужина?',
  cafeOpts: [
    { e: '🍷', t: 'Вино' },
    { e: '🥂', t: 'Шампанское' },
    { e: '💨', t: 'Кальян' },
    { e: '💆', t: 'Я делаю тебе массаж' },
    { e: '🎬', t: 'Смотрим киношку' },
    { e: '📺', t: 'Сериал' }
  ],
  // ветка «дома»: сначала еда, потом «после ужина»
  dinnerTitle: 'Какие пожелания на ужин?',
  dinnerOpts: [
    { e: '🍕', t: 'Пицца' },
    { e: '🍣', t: 'Роллы' },
    { e: '🥗', t: 'Салаты' },
    { e: '🧀', t: 'Лёгкая закуска' }
  ],
  homeTitle: 'Что выберешь после ужина?',
  homeOpts: [
    { e: '🍷', t: 'Вино' },
    { e: '🥂', t: 'Шампанское' },
    { e: '💨', t: 'Кальян' },
    { e: '💆', t: 'Я делаю тебе массаж' },
    { e: '🎬', t: 'Смотрим киношку' },
    { e: '📺', t: 'Сериал' }
  ],
  morningTitle: 'Утро субботы. Завтрак?',
  morningOpts: [
    { e: '☕', t: 'Кофе' },
    { e: '🤗', t: 'Обнимашки' },
    { e: '📺', t: 'Сериальчик' },
    { e: '🎬', t: 'Киношка' },
    { e: '🥪', t: 'Бутерброды' },
    { e: '🥞', t: 'Блинчики с мёдом' }
  ],
  secret: 'Я очень рад, что встретил тебя! ❤️',
  noMode: 'runaway',
  theme: 'coral',
  font: 'geo',
  cats: true,
  formsubmitEmail: 'frolovds.khv@gmail.com'
};

function loadDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT) || 'null'); } catch (e) { return null; }
}
function saveDraft() {
  try { localStorage.setItem(DRAFT, JSON.stringify(state)); } catch (e) {}
}

let state = Object.assign({}, DEFAULT, loadDraft() || {});

/* ---------- кодирование в ссылку ---------- */
function b64url(json) {
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function shape(s) {
  const opt = (o, id) => ({ id: id || o.id || '', t: o.t, e: o.e || '💛' });
  const eve = s.eveningOpts.slice(0, 2).map((o, i) => opt(o, i === 0 ? 'cafe' : 'home'));
  return {
    herName: s.herName,
    myName: s.myName,
    question: s.question,
    dateLabel: s.dateLabel,
    noMode: s.noMode,
    secret: s.secret,
    theme: s.theme,
    font: s.font,
    cats: s.cats,
    formsubmitEmail: s.formsubmitEmail,
    evening: { title: s.eveningTitle, sub: 'Выбери — подстроюсь под тебя.', options: eve },
    branches: {
      cafe: {
        title: s.cafeTitle,
        sub: 'Можно несколько.',
        multi: true,
        options: s.cafeOpts.map((o) => opt(o)),
        own: { t: 'Твой вариант', e: '✨', placeholder: 'Что бы ты хотела?' }
      },
      home: {
        title: s.homeTitle,
        sub: 'Можно несколько.',
        multi: true,
        dinner: {
          title: s.dinnerTitle,
          sub: 'Можно несколько — соберу стол.',
          multi: true,
          options: s.dinnerOpts.map((o) => opt(o)),
          own: { t: 'Твой вариант', e: '✨', placeholder: 'Что закажем?' }
        },
        options: s.homeOpts.map((o) => opt(o)),
        own: { t: 'Твой вариант', e: '✨', placeholder: 'Что бы ты хотела?' }
      }
    },
    morning: {
      title: s.morningTitle,
      sub: 'Можно всё сразу.',
      multi: true,
      options: s.morningOpts.map((o) => opt(o)),
      own: { t: 'Твой вариант', e: '✨', placeholder: 'Что бы ты хотела на завтрак?' }
    }
  };
}
/* В ссылку кладём только отличия от значений по умолчанию — иначе она раздувается до 3 КБ */
function payload() {
  const full = shape(state);
  const base = shape(DEFAULT);
  const out = { v: 2 };
  Object.keys(full).forEach((k) => {
    if (JSON.stringify(full[k]) !== JSON.stringify(base[k])) out[k] = full[k];
  });
  return out;
}
function baseDir() {
  return location.href.replace(/constructor\.html.*$/, '');
}
function buildLink(preview) {
  return baseDir() + '#d=' + b64url(JSON.stringify(payload())) + (preview ? '&preview&skip' : '');
}
/* превью: тот же адрес с меткой времени, иначе браузер не перезагружает iframe при смене hash */
function previewLink() {
  return baseDir() + 'index.html?t=' + Date.now() + '#d=' + b64url(JSON.stringify(payload())) + '&preview&skip';
}

/* ---------- темы ---------- */
function renderThemes() {
  const box = $('themeCards');
  box.innerHTML = '';
  Object.keys(window.VIBES).forEach((key) => {
    const v = window.VIBES[key];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'theme-card' + (state.theme === key ? ' sel' : '');
    b.style.setProperty('--tg', v.grad);
    b.innerHTML = '<span class="sw"></span><b>' + v.label + '</b>';
    b.addEventListener('click', () => {
      state.theme = key;
      renderThemes();
      applyPageVibe();
      update();
    });
    box.appendChild(b);
  });
}
function applyPageVibe() {
  const v = window.VIBES[state.theme] || window.VIBES.coral;
  document.body.style.background = v.grad;
}

/* ---------- чтение формы ---------- */
function splitLines(text) {
  return text.split('\n').map((s) => s.trim()).filter(Boolean);
}
function parseOpts(text) {
  return splitLines(text).map((line) => {
    const m = line.match(/^([^\p{L}\p{N}]+)\s*(.+)$/u);
    return m ? { e: m[1].trim(), t: m[2].trim() } : { e: '💛', t: line };
  });
}
function toLines(opts) {
  return (opts || []).map((o) => (o.e ? o.e + ' ' : '') + o.t).join('\n');
}
function fillForm() {
  $('herName').value = state.herName;
  $('myName').value = state.myName;
  $('question').value = state.question;
  $('dateLabel').value = state.dateLabel;
  $('eveningTitle').value = state.eveningTitle;
  $('eveningOpts').value = toLines(state.eveningOpts);
  $('cafeTitle').value = state.cafeTitle;
  $('cafeOpts').value = toLines(state.cafeOpts);
  $('homeTitle').value = state.homeTitle;
  $('dinnerTitle').value = state.dinnerTitle;
  $('dinnerOpts').value = toLines(state.dinnerOpts);
  $('homeOpts').value = toLines(state.homeOpts);
  $('morningTitle').value = state.morningTitle;
  $('morningOpts').value = toLines(state.morningOpts);
  $('secret').value = state.secret;
  $('noMode').value = state.noMode;
  $('font').value = state.font;
  $('cats').checked = state.cats !== false;
  $('email').value = state.formsubmitEmail;
  renderThemes();
  applyPageVibe();
}

/* ---------- превью и ссылка ---------- */
let timer = null;
function update() {
  clearTimeout(timer);
  timer = setTimeout(render, 350);
}
function render() {
  $('preview').src = previewLink();
  const link = buildLink(false);
  $('linkOut').value = link;
  $('lenHint').textContent = 'Длина ссылки: ' + link.length + ' символов' +
    (link.length > 1900 ? ' — длинновато, часть мессенджеров может обрезать.' : '');
  saveDraft();
}

/* ---------- поля ---------- */
function bind() {
  const simple = {
    herName: 'herName', myName: 'myName', question: 'question', dateLabel: 'dateLabel',
    eveningTitle: 'eveningTitle', cafeTitle: 'cafeTitle', homeTitle: 'homeTitle',
    dinnerTitle: 'dinnerTitle',
    morningTitle: 'morningTitle', noMode: 'noMode', font: 'font', email: 'formsubmitEmail'
  };
  Object.keys(simple).forEach((id) => {
    $(id).addEventListener('input', () => { state[simple[id]] = $(id).value; update(); });
  });
  const lists = {
    eveningOpts: 'eveningOpts', cafeOpts: 'cafeOpts', dinnerOpts: 'dinnerOpts',
    homeOpts: 'homeOpts', morningOpts: 'morningOpts'
  };
  Object.keys(lists).forEach((id) => {
    $(id).addEventListener('input', () => { state[lists[id]] = parseOpts($(id).value); update(); });
  });
  $('secret').addEventListener('input', () => { state.secret = $('secret').value; update(); });
  $('cats').addEventListener('change', () => { state.cats = $('cats').checked; update(); });

  $('copyBtn').addEventListener('click', copyLink);
  $('openBtn').addEventListener('click', () => window.open(buildLink(false), '_blank'));
  $('resetBtn').addEventListener('click', () => {
    if (!confirm('Вернуть значения по умолчанию?')) return;
    state = Object.assign({}, DEFAULT);
    try { localStorage.removeItem(DRAFT); } catch (e) {}
    fillForm();
    render();
  });
}

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

async function copyLink() {
  const link = buildLink(false);
  try {
    await navigator.clipboard.writeText(link);
    toast('Ссылка скопирована');
  } catch (e) {
    const ta = $('linkOut');
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch (e2) {}
    toast('Ссылка скопирована');
  }
}

bind();
fillForm();
render();
