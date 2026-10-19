'use strict';
/* Конструктор приглашения: форма → ссылка. Данные живут в самой ссылке (#d=base64url). */

const $ = (id) => document.getElementById(id);
const DRAFT = 'invite-draft-v1';

const DEFAULT = {
  herName: 'Алёна',
  myName: 'Дмитрий',
  question: '{name}, пойдёшь со мной на свидание?',
  dates: ['пятница, 24 октября', 'суббота, 25 октября', 'воскресенье, 26 октября'],
  times: ['17:00', '18:30', '20:00'],
  activities: [
    { t: 'Кофе и разговор', e: '☕' },
    { t: 'Кино', e: '🎬' },
    { t: 'Прогулка у моря', e: '🌊' }
  ],
  secret: 'Я хотел позвать тебя ещё в тот день, когда мы впервые проговорили до самого утра. Просто не решался.',
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
function payload() {
  return {
    v: 1,
    herName: state.herName,
    myName: state.myName,
    question: state.question,
    secret: state.secret,
    noMode: state.noMode,
    dates: state.dates,
    times: state.times,
    activities: state.activities,
    theme: state.theme,
    font: state.font,
    cats: state.cats,
    formsubmitEmail: state.formsubmitEmail
  };
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
function parseActs(text) {
  return splitLines(text).map((line) => {
    const m = line.match(/^([^\p{L}\p{N}]+)\s*(.+)$/u);
    return m ? { e: m[1].trim(), t: m[2].trim() } : { e: '💛', t: line };
  });
}
function fillForm() {
  $('herName').value = state.herName;
  $('myName').value = state.myName;
  $('question').value = state.question;
  $('dates').value = state.dates.join('\n');
  $('times').value = state.times.join(', ');
  $('acts').value = state.activities.map((a) => (a.e ? a.e + ' ' : '') + a.t).join('\n');
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
  const long = link.length > 1900;
  $('lenHint').textContent = 'Длина ссылки: ' + link.length + ' символов' +
    (long ? ' — длинновато, часть мессенджеров может обрезать. Сократим, когда поднимем хранилище на VPS.' : '');
  saveDraft();
}

/* ---------- поля ---------- */
function bind() {
  const simple = {
    herName: 'herName', myName: 'myName', question: 'question',
    noMode: 'noMode', font: 'font', email: 'formsubmitEmail'
  };
  Object.keys(simple).forEach((id) => {
    $(id).addEventListener('input', () => { state[simple[id]] = $(id).value; update(); });
  });
  $('dates').addEventListener('input', () => { state.dates = splitLines($('dates').value); update(); });
  $('times').addEventListener('input', () => {
    state.times = $('times').value.split(',').map((s) => s.trim()).filter(Boolean);
    update();
  });
  $('acts').addEventListener('input', () => { state.activities = parseActs($('acts').value); update(); });
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
