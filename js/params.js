/* Настройки из ссылки: #d=<base64url(JSON)>&preview
   Загружается между config.js и app.js — дополняет window.CONFIG тем, что собрано в конструкторе. */
(function () {
  var C = window.CONFIG || (window.CONFIG = {});

  /* ---------- темы оформления ---------- */
  window.VIBES = {
    coral: {
      label: 'Коралл', grad: 'linear-gradient(150deg,#FF6B6B,#FF9E5E)',
      coral: '#FF6B6B', peach: '#FF9E5E', ink: '#3A2A2E', soft: '#7A6266',
      card: 'rgba(255,255,255,.86)', line: 'rgba(58,42,46,.10)',
      glyphs: ['🌸', '🌷', '💗', '🍂', '🌸', '✿'], dark: 0
    },
    rose: {
      label: 'Розовый закат', grad: 'linear-gradient(160deg,#FF7EB6,#FFB86B)',
      coral: '#FF6FA8', peach: '#FFB86B', ink: '#3B2430', soft: '#7C5F6B',
      card: 'rgba(255,255,255,.88)', line: 'rgba(59,36,48,.10)',
      glyphs: ['💗', '🌹', '✨', '💞', '🌸'], dark: 0
    },
    lavender: {
      label: 'Лаванда', grad: 'linear-gradient(155deg,#A78BFA,#F0ABFC)',
      coral: '#8B5CF6', peach: '#F0ABFC', ink: '#2E2545', soft: '#6B5F85',
      card: 'rgba(255,255,255,.87)', line: 'rgba(46,37,69,.10)',
      glyphs: ['✨', '💜', '🌙', '⭐', '🌷'], dark: 0
    },
    mint: {
      label: 'Мята', grad: 'linear-gradient(150deg,#34D399,#60A5FA)',
      coral: '#10B981', peach: '#60A5FA', ink: '#173A3A', soft: '#4E7272',
      card: 'rgba(255,255,255,.88)', line: 'rgba(23,58,58,.10)',
      glyphs: ['🍃', '💚', '✨', '🌿', '💙'], dark: 0
    },
    night: {
      label: 'Ночь', grad: 'linear-gradient(165deg,#1E1B4B,#4C1D95 70%,#312E81)',
      coral: '#C4B5FD', peach: '#A78BFA', ink: '#F7F2EA', soft: '#C9C1D6',
      card: 'rgba(24,20,34,.72)', line: 'rgba(255,255,255,.12)',
      glyphs: ['✨', '🌙', '⭐', '💫', '🌌'], dark: 1
    },
    gold: {
      label: 'Золото', grad: 'linear-gradient(160deg,#141210,#2A2118 55%,#3A2A1A)',
      coral: '#D4AF37', peach: '#E8CE8A', ink: '#F5EEDF', soft: '#C0B49B',
      card: 'rgba(26,22,18,.78)', line: 'rgba(212,175,55,.28)',
      glyphs: ['✨', '🥂', '🕯', '💛', '✦'], dark: 1
    }
  };

  /* ---------- разбор ссылки ---------- */
  function fromB64(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  var hash = location.hash || '';
  var m = hash.match(/[#&]d=([^&]+)/);
  if (m) {
    try { Object.assign(C, fromB64(decodeURIComponent(m[1]))); } catch (e) { console.warn('[invite] ссылка не разобрана', e); }
  }
  /* режим превью в конструкторе: ответы никуда не отправляем */
  if (/preview/.test(hash)) { C.formsubmitEmail = ''; C.answerUrl = ''; C.webhook = ''; }
  if (/skip/.test(hash)) C.previewSkip = true;

  /* ---------- применяем вайб ---------- */
  var v = (window.VIBES[C.theme] || window.VIBES.coral);
  var r = document.documentElement.style;
  r.setProperty('--grad', v.grad);
  r.setProperty('--coral', v.coral);
  r.setProperty('--peach', v.peach);
  r.setProperty('--ink', v.ink);
  r.setProperty('--soft', v.soft);
  r.setProperty('--card', v.card);
  r.setProperty('--line', v.line);
  document.documentElement.setAttribute('data-font', C.font || 'geo');
  document.documentElement.setAttribute('data-dark', v.dark ? '1' : '0');

  if (!C.glyphs) C.glyphs = v.glyphs;
  C.font = C.font || 'geo';
  C.theme = C.theme || 'coral';
})();
