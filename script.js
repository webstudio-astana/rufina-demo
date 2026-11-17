// Rufina beauty time — демо. Без внешних запросов и хранилищ.
document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Окошко демо вместо WhatsApp ----------
const modal = document.getElementById('demoModal');
const modalMsg = document.getElementById('modalMsg');
const modalMsgWrap = document.getElementById('modalMsgWrap');

function openDemo(message) {
  modalMsg.textContent = message || '';
  modalMsgWrap.hidden = !message;
  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    alert('В полной версии здесь откроется WhatsApp салона');
  }
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-wa]');
  if (btn) {
    e.preventDefault();
    openDemo(btn.dataset.msg);
  }
});

modal.addEventListener('click', (e) => {
  // закрыть по кнопке или по клику на фон
  if (e.target.closest('[data-close]') || e.target === modal) modal.close();
});

// ---------- Шапка при прокрутке и плавающая кнопка ----------
const topEl = document.getElementById('top');
const fab = document.querySelector('.fab');
const hero = document.querySelector('.hero');

function onScroll() {
  const y = window.scrollY;
  topEl.classList.toggle('is-scrolled', y > 40);
  fab.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// высота закреплённого верха для отступов при переходе по якорям
function setTopHeight() {
  document.documentElement.style.setProperty('--top-h', topEl.offsetHeight + 'px');
}
window.addEventListener('resize', setTopHeight);
setTopHeight();

// ---------- Статус «открыто / закрыто» по времени Астаны (UTC+5) ----------
const OPEN = 10;
const CLOSE = 22;

function astanaNow() {
  const d = new Date(Date.now() + 5 * 3600 * 1000);
  return { h: d.getUTCHours(), m: d.getUTCMinutes() };
}

function pad(n) { return String(n).padStart(2, '0'); }

function updateStatus() {
  const { h, m } = astanaNow();
  const open = h >= OPEN && h < CLOSE;
  const text = open ? 'Открыто до 22:00' : 'Закрыто, откроемся в 10:00';
  document.querySelectorAll('[data-status]').forEach((el) => {
    el.classList.toggle('is-open', open);
    el.querySelector('[data-status-text]').textContent = text;
  });
  const clock = document.querySelector('[data-clock]');
  if (clock) clock.textContent = 'Сейчас в Астане ' + pad(h) + ':' + pad(m);
}
updateStatus();
setInterval(updateStatus, 30000);

// ---------- Мой бюджет ----------
const range = document.getElementById('budgetRange');
const sum = document.getElementById('budgetSum');
const count = document.getElementById('budgetCount');
const picks = document.querySelectorAll('.pick');

function money(n) {
  return n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₸';
}

function plural(n) {
  const a = n % 10;
  const b = n % 100;
  if (a === 1 && b !== 11) return 'услуга';
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return 'услуги';
  return 'услуг';
}

function updateBudget() {
  const value = Number(range.value);
  sum.textContent = money(value);
  const fill = ((value - range.min) / (range.max - range.min)) * 100;
  range.style.setProperty('--fill', fill + '%');

  let fit = 0;
  picks.forEach((p) => {
    const ok = Number(p.dataset.price) <= value;
    p.classList.toggle('is-fit', ok);
    p.classList.toggle('is-out', !ok);
    if (ok) fit++;
  });
  count.textContent = 'Подходит ' + fit + ' ' + plural(fit) + ' из ' + picks.length;
}
range.addEventListener('input', updateBudget);
updateBudget();

picks.forEach((p) => {
  p.addEventListener('click', () => {
    openDemo('Здравствуйте! Хочу записаться: ' + p.dataset.name + ' (' + p.dataset.label + ').');
  });
});

// ---------- Плитки направлений раскрывают нужную группу цен ----------
document.querySelectorAll('[data-open]').forEach((tile) => {
  tile.addEventListener('click', () => {
    const group = document.getElementById(tile.dataset.open);
    if (group) group.open = true;
  });
});

// ---------- Появление блоков при прокрутке ----------
const reveals = document.querySelectorAll('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach((el) => io.observe(el));
}
