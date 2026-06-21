import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_9KXqGch-gpAT-yugK0uukV4DiH_gVQ0",
  authDomain: "somsa-c5ae4.firebaseapp.com",
  projectId: "somsa-c5ae4",
  storageBucket: "somsa-c5ae4.firebasestorage.app",
  messagingSenderId: "429696645543",
  appId: "1:429696645543:web:cd6aa01c72fdfadf3e1e82",
  databaseURL: "https://somsa-c5ae4-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const btn = document.querySelector('.bbtn');
let currentOrderKey = null;

btn.addEventListener('click', async () => {
  const ism  = document.querySelector('.input-Som-Ism').value.trim();
  const son  = document.querySelector('.input-Som-Son').value.trim();
  const xona = document.querySelector('.input-Som-Xon').value.trim();

  if (!ism || !son || !xona) {
    showToast('❗ Barcha maydonlarni to\'ldiring!', '#e65100');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Yuborilmoqda...';

  const newRef = await push(ref(db, 'buyurtmalar'), {
    ism, son: parseInt(son), xona: parseInt(xona),
    status: 'pending',
    vaqt: new Date().toISOString()
  });

  currentOrderKey = newRef.key;
  btn.textContent = '✅ Yuborildi!';
  showToast('📤 Buyurtmangiz yuborildi! Admin tasdiqlashini kuting...', '#1565c0', 6000);

  // Admin qabul qilishini real-time kuzat
  onValue(ref(db, 'buyurtmalar/' + currentOrderKey + '/status'), (snap) => {
    if (snap.val() === 'accepted') {
      showNotification(ism, son, xona);
      btn.disabled = false;
      btn.textContent = 'Zakaz Qilish →';
      document.querySelector('.input-Som-Ism').value = '';
      document.querySelector('.input-Som-Son').value = '';
      document.querySelector('.input-Som-Xon').value = '';
    }
  });
});

function showNotification(ism, son, xona) {
  // Eski notification o'chir
  const old = document.getElementById('zakaz-notif');
  if (old) old.remove();

  const box = document.createElement('div');
  box.id = 'zakaz-notif';
  box.style.cssText = `
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    background: #1b5e20;
    color: #fff;
    border-radius: 14px;
    padding: 18px 28px;
    font-family: Inter, sans-serif;
    font-size: 15px;
    font-weight: 500;
    box-shadow: 0 8px 32px rgba(0,0,0,0.22);
    text-align: center;
    min-width: 300px;
    animation: slideDown 0.4s ease;
  `;
  box.innerHTML = `
    <div style="font-size:32px; margin-bottom:8px;">✅</div>
    <div style="font-size:17px; font-weight:700; margin-bottom:4px;">Zakaz qabul qilindi!</div>
    <div style="font-size:13px; opacity:0.85;">${ism} — ${son} ta somsa, ${xona}-xona</div>
    <div style="font-size:12px; opacity:0.7; margin-top:6px;">Tez orada yetkazib beramiz 🫓</div>
  `;

  const style = document.createElement('style');
  style.textContent = `@keyframes slideDown { from { opacity:0; top:0; } to { opacity:1; top:24px; } }`;
  document.head.appendChild(style);
  document.body.appendChild(box);

  // 8 soniyadan keyin o'chir
  setTimeout(() => { box.style.opacity = '0'; box.style.transition = 'opacity 0.5s'; setTimeout(() => box.remove(), 500); }, 8000);
}

function showToast(msg, color, duration = 3000) {
  const old = document.getElementById('toast-notif');
  if (old) old.remove();
  const t = document.createElement('div');
  t.id = 'toast-notif';
  t.style.cssText = `
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
    background: ${color}; color: #fff; border-radius: 10px;
    padding: 12px 24px; font-family: Inter, sans-serif; font-size: 14px;
    font-weight: 500; z-index: 9999; box-shadow: 0 4px 18px rgba(0,0,0,0.18);
    white-space: nowrap;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), duration);
}
