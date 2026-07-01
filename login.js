
const DB = "https://somsa-c5ae4-default-rtdb.firebaseio.com";
const btn = document.querySelector(".bbtn");

let currentOrderId = null;
let statusTimer = null;

// ══════════════════════════════
//  E'LON BANNER
// ══════════════════════════════
// E'lon uchun animatsiya CSS
(function() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
  `;
  document.head.appendChild(style);
})();

async function loadElon() {
  try {
    const res  = await fetch(DB + "/elon.json");
    const data = await res.json();
    if (!data || !data.title) return;
    const icons  = { aksiya:"🔥", yangi:"✨", xabar:"📢" };
    const colors = {
      aksiya: { bg:"#fff8e1", border:"#ffcc80", color:"#e65100" },
      yangi:  { bg:"#e8f5e9", border:"#a5d6a7", color:"#2e7d32" },
      xabar:  { bg:"#e3f2fd", border:"#90caf9", color:"#1565c0" },
    };
    const style = colors[data.tur] || colors.xabar;
    const icon  = icons[data.tur]  || "📢";
    const banner = document.createElement("div");
    banner.id = "elon-banner";
    banner.style.cssText = `
      position:fixed;bottom:0;left:0;right:0;z-index:998;
      background:${style.bg};border-top:2px solid ${style.border};
      padding:12px 24px;display:flex;align-items:center;gap:12px;
      font-family:'Inter',sans-serif;
      box-shadow:0 -4px 20px rgba(0,0,0,0.1);
      animation:slideUp 0.4s cubic-bezier(0.34,1.2,0.64,1);
    `;
    banner.innerHTML = `
      <span style="font-size:20px;flex-shrink:0">${icon}</span>
      <div style="flex:1">
        <span style="font-size:14px;font-weight:700;color:${style.color}">${data.title}</span>
        ${data.text ? `<span style="font-size:13px;color:#6B5A44;margin-left:8px">${data.text}</span>` : ""}
      </div>
      <button onclick="document.getElementById('elon-banner').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:#9C8268;padding:4px 8px;flex-shrink:0">✕</button>
    `;
    // Body ga qo'shamiz (sticky bottom)
    document.body.appendChild(banner);
    // Body pastiga joy berish
    document.body.style.paddingBottom = "60px";
  } catch(err) { console.log("E'lon xatolik:", err); }
}

// ══════════════════════════════
//  NARX KO'RSATISH
// ══════════════════════════════
const DEFAULT_NARXLAR_NOMI = {
  goshtli:"Go'shtli somsa"
};

async function loadNarxlar() {
  try {
    const res  = await fetch(DB + "/narxlar.json");
    const data = await res.json();
    if (!data) return;
    const existing = document.getElementById("narx-panel");
    if (existing) existing.remove();
    const panel = document.createElement("div");
    panel.id = "narx-panel";
    panel.style.cssText = `background:#fff;border-radius:12px;padding:20px 22px;box-shadow:0 2px 12px rgba(26,18,8,0.07);margin-bottom:16px;font-family:'Inter',sans-serif;`;
    panel.innerHTML = `
      <div style="font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#9C8268;margin-bottom:14px">💰 Narxlar</div>
      ${Object.entries(data).map(([id, narx]) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #F0E8D8">
          <span style="font-size:14px;color:#4A3F2F">🫓 ${DEFAULT_NARXLAR_NOMI[id] || id}</span>
          <span style="font-size:15px;font-weight:700;color:#8B3A1C">${Number(narx).toLocaleString()} so'm</span>
        </div>`).join("")}`;
    const formCard = document.getElementById("form");
    if (formCard) formCard.insertAdjacentElement("beforebegin", panel);
  } catch(err) { console.log("Narxlarni yuklashda xatolik:", err); }
}

// ══════════════════════════════
//  TAB SWITCHING
// ══════════════════════════════
const zakazDiv    = document.querySelector(".zakaz1");
const dastavkaDiv = document.querySelector(".dastavka1");
const zakazBtn    = document.querySelector(".zakaz");
const dastavkaBtn = document.querySelector(".dastavka");
let activeTab = "zakaz";

dastavkaBtn.addEventListener("click", () => {
  activeTab = "dastavka";
  dastavkaDiv.style.display = "block";
  zakazDiv.style.display = "none";
  btn.textContent = "Dastavka Qilish →";
  dastavkaBtn.style.color = "var(--saffron)";
  zakazBtn.style.color = "black";
  setTimeout(initMap, 100);
});
zakazBtn.addEventListener("click", () => {
  activeTab = "zakaz";
  dastavkaDiv.style.display = "none";
  zakazDiv.style.display = "block";
  btn.textContent = "Zakaz Qilish →";
  zakazBtn.style.color = "var(--saffron)";
  dastavkaBtn.style.color = "black";
});

// ══════════════════════════════
//  BUYURTMA YUBORISH
// ══════════════════════════════
btn.addEventListener("click", async function () {
  if (activeTab === "zakaz") await submitZakaz();
  else await submitDastavka();
});

async function submitZakaz() {
  const ismInput  = document.querySelector("#zak .input-Som-Ism");
  const sonInput  = document.querySelector("#zak .input-Som-Son");
  const xonaInput = document.querySelector("#zak .input-Som-Xon");
  const ism = ismInput.value.trim(), son = sonInput.value.trim(), xona = xonaInput.value.trim();
  if (!ism || !son || !xona) { showToast("⚠️ Barcha maydonlarni to'ldiring!", "#e65100"); return; }
  btn.disabled = true; btn.textContent = "Yuborilmoqda...";
  const order = { tur:"zakaz", ism, son:Number(son), xona:Number(xona), status:"pending", vaqt:new Date().toISOString() };
  try {
    const res  = await fetch(DB + "/buyurtmalar.json", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(order) });
    const data = await res.json();
    currentOrderId = data.name;
    btn.textContent = "✅ Yuborildi!";
    showToast("🫓 Zakaz yuborildi!", "#2e7d32", 3000);
    // Tracker ochish
    showOrderTracker(ism, son, xona+"-xona", currentOrderId);
    ismInput.value=""; sonInput.value=""; xonaInput.value="";
    resetBtn("Zakaz Qilish →");
  } catch(err) { showToast("❌ Xatolik yuz berdi!", "crimson"); resetBtn("Zakaz Qilish →"); }
}

async function submitDastavka() {
  const ismInput=document.querySelector("#das .das-ism"), telefonInput=document.querySelector("#das .das-telefon");
  const sonInput=document.querySelector("#das .das-son"), manzilInput=document.querySelector("#das .das-manzil");
  const ism=ismInput.value.trim(), telefon=telefonInput.value.trim(), son=sonInput.value.trim(), manzil=manzilInput.value.trim();
  if (!ism||!telefon||!son||!manzil) { showToast("⚠️ Barcha maydonlarni to'ldiring!", "#e65100"); return; }
  btn.disabled=true; btn.textContent="Yuborilmoqda...";
  const mapLink = window._selectedLatLng
    ? `https://maps.google.com/?q=${window._selectedLatLng.lat},${window._selectedLatLng.lng}`
    : null;
  const order={tur:"dastavka",ism,telefon,son:Number(son),manzil,mapLink,status:"pending",vaqt:new Date().toISOString()};
  try {
    const res=await fetch(DB+"/buyurtmalar.json",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(order)});
    const data=await res.json(); currentOrderId=data.name;
    btn.textContent="✅ Yuborildi!";
    showToast("🛵 Dastavka zakazi yuborildi!", "#2e7d32", 3000);
    showOrderTracker(ism, son, manzil, currentOrderId);
    ismInput.value=""; telefonInput.value=""; sonInput.value=""; manzilInput.value="";
    resetBtn("Dastavka Qilish →");
  } catch(err) { showToast("❌ Xatolik yuz berdi!","crimson"); resetBtn("Dastavka Qilish →"); }
}

function watchStatus(onAccepted) {
  if (statusTimer) clearInterval(statusTimer);
  statusTimer = setInterval(async function() {
    try {
      const res=await fetch(DB+"/buyurtmalar/"+currentOrderId+"/status.json");
      const status=await res.json();
      if (status==="accepted") { clearInterval(statusTimer); onAccepted(); resetBtn(activeTab==="zakaz"?"Zakaz Qilish →":"Dastavka Qilish →"); }
      if (status==="rejected") { clearInterval(statusTimer); showToast("❌ Zakazingiz rad etildi","crimson",5000); resetBtn(activeTab==="zakaz"?"Zakaz Qilish →":"Dastavka Qilish →"); }
    } catch(err) {}
  }, 2000);
}
function resetBtn(text) { btn.disabled=false; btn.textContent=text; }

// ══════════════════════════════
//  ZAKAZ TRACKER
// ══════════════════════════════
function showOrderTracker(ism, son, joy, orderId) {
  const old = document.getElementById("order-tracker");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.id = "order-tracker";
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9999;
    background:rgba(26,18,8,0.6);
    display:flex;align-items:center;justify-content:center;
    font-family:'Inter',sans-serif;
    padding:20px;
  `;

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:36px 32px;max-width:380px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center">
      <div style="font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;color:#1A1208;margin-bottom:4px">Zakazingiz holati</div>
      <div style="font-size:13px;color:#9C8268;margin-bottom:28px">${ism} · ${son} ta somsa · ${joy}</div>

      <div style="display:flex;flex-direction:column;gap:0;margin-bottom:24px;text-align:left">
        <div id="step-pending" style="display:flex;gap:14px;align-items:flex-start;padding:14px 16px;border-radius:12px;background:#fff8e1">
          <div id="icon-pending" style="width:40px;height:40px;border-radius:50%;background:#ffe082;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">📨</div>
          <div style="padding-top:4px">
            <div style="font-size:14px;font-weight:600;color:#1A1208">Zakaz yuborildi</div>
            <div style="font-size:12px;color:#9C8268;margin-top:2px">Admin qabul qilishini kuting...</div>
          </div>
        </div>
        <div style="width:2px;height:14px;background:#E8D9C0;margin-left:35px"></div>
        <div id="step-accepted" style="display:flex;gap:14px;align-items:flex-start;padding:14px 16px;border-radius:12px;opacity:0.4">
          <div id="icon-accepted" style="width:40px;height:40px;border-radius:50%;background:#F0E8D8;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">✅</div>
          <div style="padding-top:4px">
            <div style="font-size:14px;font-weight:600;color:#1A1208">Zakaz qabul qilindi</div>
            <div style="font-size:12px;color:#9C8268;margin-top:2px">Tez orada yetkazamiz 🫓</div>
          </div>
        </div>
      </div>

      <div id="tracker-badge" style="display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:30px;background:#fff8e1;color:#e65100;font-size:14px;font-weight:700;margin-bottom:24px">
        <span style="width:8px;height:8px;border-radius:50%;background:#e65100;animation:pulse 1.4s infinite;display:inline-block"></span>
        Kutilmoqda...
      </div>

      <button onclick="closeTracker()" style="width:100%;padding:12px;background:#F0E8D8;color:#8B3A1C;border:none;border-radius:10px;font-family:'Inter',sans-serif;font-weight:700;font-size:14px;cursor:pointer">
        Yopish
      </button>
      <div style="font-size:11px;color:#C4B49A;margin-top:10px">Sahifani yopsangiz ham zakaz saqlanadi</div>
    </div>
  `;

  document.body.appendChild(overlay);
  startTracking(orderId);
}

function startTracking(orderId) {
  if (window._trackTimer) clearInterval(window._trackTimer);
  window._trackTimer = setInterval(async () => {
    try {
      const res   = await fetch(DB + "/buyurtmalar/" + orderId + ".json");
      const order = await res.json();
      if (!order) { clearInterval(window._trackTimer); return; }

      const badge  = document.getElementById("tracker-badge");
      const stepP  = document.getElementById("step-pending");
      const stepA  = document.getElementById("step-accepted");
      const iconP  = document.getElementById("icon-pending");
      const iconA  = document.getElementById("icon-accepted");

      if (order.status === "accepted") {
        clearInterval(window._trackTimer);
        if (stepP) { stepP.style.background = "#e8f5e9"; }
        if (iconP) { iconP.style.background = "#4caf50"; iconP.textContent = "✅"; }
        if (stepA) { stepA.style.opacity = "1"; stepA.style.background = "#e8f5e9"; }
        if (iconA) { iconA.style.background = "#4caf50"; }
        if (badge) {
          badge.style.background = "#e8f5e9";
          badge.style.color = "#2e7d32";
          badge.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:#4caf50;display:inline-block"></span> Qabul qilindi — yo'lda! 🫓`;
        }
      } else if (order.status === "rejected") {
        clearInterval(window._trackTimer);
        if (badge) {
          badge.style.background = "#fff0f0";
          badge.style.color = "#c62828";
          badge.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:#c62828;display:inline-block"></span> Afsuski rad etildi`;
        }
      }
    } catch(err) {}
  }, 2000);
}

window.closeTracker = function() {
  if (window._trackTimer) clearInterval(window._trackTimer);
  const el = document.getElementById("order-tracker");
  if (el) {
    el.style.opacity = "0";
    el.style.transition = "opacity 0.3s";
    setTimeout(() => el.remove(), 300);
  }
};

function showNotification(ism,son,joy) {
  const old=document.getElementById("zakaz-notif"); if(old) old.remove();
  const box=document.createElement("div"); box.id="zakaz-notif";
  box.style.cssText=`position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:9999;background:#1b5e20;color:#fff;border-radius:14px;padding:18px 28px;font-family:Inter,sans-serif;font-size:15px;font-weight:500;box-shadow:0 8px 32px rgba(0,0,0,0.22);text-align:center;min-width:300px;`;
  box.innerHTML=`<div style="font-size:32px;margin-bottom:8px">✅</div><div style="font-size:17px;font-weight:700;margin-bottom:4px">Zakaz qabul qilindi!</div><div style="font-size:13px;opacity:0.85">${ism} — ${son} ta somsa, ${joy}</div><div style="font-size:12px;opacity:0.7;margin-top:6px">Tez orada yetkazib beramiz 🫓</div>`;
  document.body.appendChild(box);
  setTimeout(()=>box.remove(), 8000);
}

function showToast(msg,color="#1A1208",duration=3000) {
  const old=document.getElementById("toast-notif"); if(old) old.remove();
  const t=document.createElement("div"); t.id="toast-notif";
  t.style.cssText=`position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:${color};color:#fff;border-radius:10px;padding:12px 24px;font-family:Inter,sans-serif;font-size:14px;font-weight:500;z-index:9999;box-shadow:0 4px 18px rgba(0,0,0,0.18);white-space:nowrap;`;
  t.textContent=msg; document.body.appendChild(t);
  setTimeout(()=>t.remove(), duration);
}

// ══════════════════════════════
//  IZOX + REYTING (birlashgan)
// ══════════════════════════════
let selectedStar = 0;

window.selectStar = function(n) {
  selectedStar = n;
  const labels = ["","Yomon 😞","Qoniqarsiz 😕","Yaxshi 🙂","Zo'r 😊","Ajoyib! 🤩"];
  const starLabel = document.getElementById("star-label");
  if (starLabel) starLabel.textContent = labels[n];
  document.querySelectorAll("#star-selector span").forEach((s,i) => {
    s.textContent = i < n ? "⭐" : "☆";
    s.style.transform = i < n ? "scale(1.15)" : "scale(1)";
  });
};

function getInitial(name) { return name ? name.trim()[0].toUpperCase() : "?"; }

// Izox kartasini yaratish — yulduz bilan
function createCard(key, item) {
  const card = document.createElement("div");
  card.classList.add("izox-card");
  card.setAttribute("id", key);
  const starsHtml = item.baho
    ? `<div style="display:flex;gap:2px;margin-top:6px">${"⭐".repeat(item.baho)}${"☆".repeat(5-item.baho)}</div>`
    : "";
  card.innerHTML = `
    <div class="izox-header">
      <div class="izox-avatar">${getInitial(item.ism)}</div>
      <div class="izox-meta">
        <div class="izox-name">${item.ism || "Anonim"}${starsHtml}</div>
        <div class="izox-time">${item.timestamp
          ? new Date(item.timestamp).toLocaleString("uz-UZ",{day:"2-digit",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})
          : ""}</div>
      </div>
    </div>
    <div class="izox-body">${item.comment}</div>`;
  return card;
}

// O'rtacha reyting badge (izoxlar sarlavhasi yonida)
async function loadReytingBadge() {
  try {
    const res  = await fetch(DB + "/commentlar.json");
    const data = await res.json();
    if (!data) return;
    const baholar = Object.values(data).map(r => r.baho).filter(Boolean);
    if (!baholar.length) return;
    const ort = (baholar.reduce((a,b)=>a+b,0)/baholar.length).toFixed(1);
    const badge = document.getElementById("reyting-badge");
    if (badge) {
      badge.textContent = `⭐ ${ort} / 5`;
      badge.style.display = "inline-block";
    }
  } catch(err) {}
}

function getData() {
  const izoxList = document.querySelector(".izoxlar-list");
  if (!izoxList) return;
  izoxList.innerHTML = "";
  fetch(DB + "/commentlar.json")
    .then(res => res.json())
    .then(data => {
      const malumotlar = data ? Object.entries(data).reverse() : [];
      if (!malumotlar.length) {
        izoxList.innerHTML = `<div class="izox-empty"><span class="izox-empty-icon">💬</span><h3>Hali izox yo'q</h3><p>Birinchi izoxni siz qoldiring!</p></div>`;
        return;
      }
      malumotlar.forEach(([key, item]) => izoxList.appendChild(createCard(key, item)));
      loadReytingBadge();
    })
    .catch(err => console.log(err));
}

// Izox + yulduz birgalikda yuborish
function setupIzoxForm() {
  // Yulduz tanlash formaga qo'shamiz
  const izoxFormDiv = document.querySelector(".izox-form");
  if (!izoxFormDiv) return;

  // Yulduzcha qatorini yaratish (tugmadan oldin, textareadan keyin)
  const starRow = document.createElement("div");
  starRow.style.cssText = "margin-bottom:16px;";
  starRow.innerHTML = `
    <div style="font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#1A1208;margin-bottom:8px">Baho (ixtiyoriy)</div>
    <div id="star-selector" style="display:flex;gap:6px;margin-bottom:4px">
      ${[1,2,3,4,5].map(i=>`<span data-star="${i}" onclick="selectStar(${i})" style="font-size:28px;cursor:pointer;transition:transform 0.15s;user-select:none">☆</span>`).join("")}
    </div>
    <div id="star-label" style="font-size:12px;color:#C4B49A;height:16px;"></div>`;

  const formFooter = izoxFormDiv.querySelector(".form-footer");
  if (formFooter) izoxFormDiv.insertBefore(starRow, formFooter);

  // Yuborish tugmasini ulash
  const izoxBtn = document.getElementById("izoxBtn");
  const textarea = document.getElementById("izoxText");
  const izoxInp  = document.getElementById("izoxTextism");
  if (!izoxBtn) return;

  izoxBtn.addEventListener("click", async () => {
    const comment = textarea.value.trim();
    const ism     = izoxInp.value.trim();
    if (!comment || !ism) { showToast("⚠️ Ism va izoxni to'ldiring!", "#e65100"); return; }

    izoxBtn.disabled = true; izoxBtn.textContent = "Yuborilmoqda...";
    try {
      await fetch(DB + "/commentlar.json", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ism, comment, baho: selectedStar || null, timestamp: Date.now() })
      });
      izoxInp.value = ""; textarea.value = "";
      selectedStar = 0;
      document.querySelectorAll("#star-selector span").forEach(s => { s.textContent="☆"; s.style.transform="scale(1)"; });
      const lbl = document.getElementById("star-label"); if(lbl) lbl.textContent="";
      getData();
      showToast("✅ Izoxingiz yuborildi!", "#2e7d32");
    } catch(err) {
      showToast("❌ Xatolik yuz berdi!", "crimson");
    } finally {
      izoxBtn.disabled = false; izoxBtn.textContent = "Izoxni yuborish";
    }
  });
}

// O'rtacha reyting badge ni sarlavhaga qo'shish
function addReytingBadgeToHeader() {
  const sectionTitle = document.querySelector("#izoxlar .section-title");
  if (!sectionTitle) return;
  const badge = document.createElement("span");
  badge.id = "reyting-badge";
  badge.style.cssText = `display:none;margin-left:12px;background:#fff8e1;color:#C8860A;border:1px solid #ffcc80;border-radius:20px;padding:3px 12px;font-size:14px;font-weight:600;vertical-align:middle;`;
  sectionTitle.appendChild(badge);
}

// ══════════════════════════════
//  ISH VAQTI
// ══════════════════════════════
async function checkWorkStatus() {
  try {
    const res=await fetch(DB+"/ishVaqti.json"); const data=await res.json();
    const open=data?.open??4, close=data?.close??11, isActive=data?.isActive??true;
    const now=new Date().getHours(), isOpen=isActive&&now>=open&&now<close;
    const old=document.getElementById("work-status"); if(old) old.remove();
    const box=document.createElement("div"); box.id="work-status";
    box.style.cssText=`position:fixed;top:70px;right:20px;z-index:999;background:${isOpen?"#1b5e20":"#b71c1c"};color:#fff;border-radius:12px;padding:10px 18px;font-family:Inter,sans-serif;font-size:13px;font-weight:600;box-shadow:0 4px 16px rgba(0,0,0,0.2);display:flex;align-items:center;gap:8px;`;
    box.innerHTML=isOpen
      ?`<span style="width:8px;height:8px;border-radius:50%;background:#4caf50;display:inline-block"></span> Ochiq — ${open}:00 dan ${close}:00 gacha`
      :`<span style="width:8px;height:8px;border-radius:50%;background:#ef9a9a;display:inline-block"></span> ${isActive?`Yopiq — ${open}:00 — ${close}:00`:"Hozircha yopiq"}`;
    document.body.appendChild(box);
    if (btn) {
      btn.disabled=!isOpen;
      if (!isOpen) { btn.textContent="🕐 Yopiq"; btn.style.opacity="0.5"; btn.style.cursor="not-allowed"; }
      else { btn.textContent=activeTab==="zakaz"?"Zakaz Qilish →":"Dastavka Qilish →"; btn.style.opacity="1"; btn.style.cursor="pointer"; }
    }
  } catch(err) {}
}


// ══════════════════════════════
//  XARITA (MANZIL TANLASH)
// ══════════════════════════════
let _mapLoaded = false;
let _leafletMap = null;
let _marker = null;

function loadLeaflet(cb) {
  if (_mapLoaded) { cb(); return; }
  // CSS
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
  // JS
  const script = document.createElement("script");
  script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  script.onload = () => { _mapLoaded = true; cb(); };
  document.head.appendChild(script);
}

function initMap() {
  const dastavkaDiv = document.querySelector(".dastavka1");
  if (!dastavkaDiv) return;
  if (document.getElementById("map-container")) return; // allaqachon bor

  // Xarita wrapper
  const wrapper = document.createElement("div");
  wrapper.id = "map-container";
  wrapper.style.cssText = "margin-bottom:16px;width:100%;max-width:100%;overflow:hidden;";
  wrapper.innerHTML = `
    <div style="font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#1A1208;margin-bottom:8px">
      📍 Manzilingizni xaritadan tanlang
    </div>
    <div id="leaflet-map" style="height:220px;border-radius:10px;border:1.5px solid #E8D9C0;overflow:hidden;background:#f0e8d8;display:flex;align-items:center;justify-content:center;">
      <span style="color:#9C8268;font-size:13px">Yuklanmoqda...</span>
    </div>
    <div id="map-hint" style="font-size:12px;color:#9C8268;margin-top:6px;display:flex;align-items:center;gap:6px">
      <span>👆</span> Xaritaga bosib manzilingizni belgilang
    </div>
  `;

  // Manzil inputdan oldin qo'shish
  const manzilField = dastavkaDiv.querySelector(".field:last-of-type");
  if (manzilField) dastavkaDiv.insertBefore(wrapper, manzilField);
  else dastavkaDiv.appendChild(wrapper);

  loadLeaflet(() => {
    const mapEl = document.getElementById("leaflet-map");
    if (!mapEl || _leafletMap) return;

    // Toshkent markazi
    _leafletMap = L.map("leaflet-map").setView([41.2995, 69.2401], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(_leafletMap);

    // ── QIDIRUV QATORI ──
    const searchBox = document.createElement("div");
    searchBox.style.cssText = "display:flex;gap:6px;margin-bottom:10px;width:100%;min-width:0;";
    searchBox.innerHTML = `
      <input id="map-search-input" type="text" placeholder="Ko'cha, mahalla..."
        style="flex:1;min-width:0;padding:10px 10px;border:1.5px solid #E8D9C0;border-radius:8px;font-family:'Inter',sans-serif;font-size:13px;color:#1A1208;background:#FDF6EC;outline:none"/>
      <button id="map-search-btn" style="padding:10px 12px;background:#8B3A1C;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0">🔍</button>
      <button id="map-locate-btn" title="Joylashuvimni aniqlash" style="padding:10px 12px;background:#1565c0;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer;flex-shrink:0">📍</button>
    `;
    const mapEl2 = document.getElementById("leaflet-map");
    mapEl2.parentNode.insertBefore(searchBox, mapEl2);

    // Qidiruv tugmasi
    document.getElementById("map-search-btn").addEventListener("click", async () => {
      const query = document.getElementById("map-search-input").value.trim();
      if (!query) return;
      const btn2 = document.getElementById("map-search-btn");
      btn2.textContent = "..."; btn2.disabled = true;
      try {
        const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=uz`);
        const data = await res.json();
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat), lng = parseFloat(data[0].lon);
          _leafletMap.setView([lat, lng], 16);
          if (_marker) _marker.remove();
          _marker = L.marker([lat, lng]).addTo(_leafletMap);
          window._selectedLatLng = { lat: lat.toFixed(6), lng: lng.toFixed(6) };
          const manzilInput = document.querySelector("#das .das-manzil");
          if (manzilInput) manzilInput.value = data[0].display_name.split(",").slice(0,3).join(", ");
          const hint = document.getElementById("map-hint");
          if (hint) hint.innerHTML = `<span>✅</span> <strong style="color:#2e7d32">${data[0].display_name.split(",").slice(0,3).join(", ")}</strong>`;
        } else {
          showToast("❌ Manzil topilmadi, boshqacha yozing", "#e65100");
        }
      } catch(err) { showToast("❌ Qidirishda xatolik", "#e65100"); }
      finally { btn2.textContent = "🔍 Topish"; btn2.disabled = false; }
    });

    // Enter tugmasi bilan ham qidirish
    document.getElementById("map-search-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("map-search-btn").click();
    });

    // 📍 GPS tugmasi
    document.getElementById("map-locate-btn").addEventListener("click", () => {
      const locBtn = document.getElementById("map-locate-btn");
      locBtn.textContent = "⏳"; locBtn.disabled = true;
      if (!navigator.geolocation) { showToast("❌ GPS qo'llab-quvvatlanmaydi", "#e65100"); locBtn.textContent = "📍"; locBtn.disabled = false; return; }
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        _leafletMap.setView([lat, lng], 16);
        if (_marker) _marker.remove();
        _marker = L.marker([lat, lng]).addTo(_leafletMap);
        window._selectedLatLng = { lat: lat.toFixed(6), lng: lng.toFixed(6) };
        const hint = document.getElementById("map-hint");
        if (hint) hint.innerHTML = `<span>⏳</span> Manzil aniqlanmoqda...`;
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          const parts = [data.address?.road, data.address?.suburb, data.address?.city].filter(Boolean);
          const shortAddr = parts.length ? parts.join(", ") : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          const manzilInput = document.querySelector("#das .das-manzil");
          if (manzilInput) manzilInput.value = shortAddr;
          if (hint) hint.innerHTML = `<span>✅</span> <strong style="color:#2e7d32">${shortAddr}</strong>`;
        } catch(err) {
          const manzilInput = document.querySelector("#das .das-manzil");
          if (manzilInput) manzilInput.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
        locBtn.textContent = "📍"; locBtn.disabled = false;
      }, () => {
        showToast("❌ GPS ruxsatini bering", "#e65100");
        locBtn.textContent = "📍"; locBtn.disabled = false;
      }, { enableHighAccuracy: true, timeout: 8000 });
    });

    // Xaritaga bosish
    _leafletMap.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      window._selectedLatLng = { lat: lat.toFixed(6), lng: lng.toFixed(6) };

      // Marker qo'yish
      if (_marker) _marker.remove();
      _marker = L.marker([lat, lng]).addTo(_leafletMap);

      // Manzilni avtomatik to'ldirish (reverse geocoding)
      const hint = document.getElementById("map-hint");
      if (hint) hint.innerHTML = `<span>⏳</span> Manzil aniqlanmoqda...`;

      try {
        const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await res.json();
        const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        // Qisqa manzil
        const parts = [data.address?.road, data.address?.suburb, data.address?.city].filter(Boolean);
        const shortAddr = parts.length ? parts.join(", ") : addr;

        const manzilInput = document.querySelector("#das .das-manzil");
        if (manzilInput) manzilInput.value = shortAddr;

        if (hint) hint.innerHTML = `<span>✅</span> <strong style="color:#2e7d32">${shortAddr}</strong>`;
      } catch(err) {
        const manzilInput = document.querySelector("#das .das-manzil");
        if (manzilInput) manzilInput.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        if (hint) hint.innerHTML = `<span>📍</span> Manzil belgilandi`;
      }
    });

    // Foydalanuvchi joylashuvini aniqlash
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        _leafletMap.setView([latitude, longitude], 15);
      }, () => {});
    }
  });
}

// ══════════════════════════════
//  START
// ══════════════════════════════
loadElon();
loadNarxlar();
addReytingBadgeToHeader();
setupIzoxForm();
getData();
checkWorkStatus();
setInterval(checkWorkStatus, 60000);
