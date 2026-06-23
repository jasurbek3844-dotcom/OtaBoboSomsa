const btn = document.querySelector(".bbtn");
// const dbUrl = "https://somsa-c5ae4-default-rtdb.firebaseio.com";

let currentOrderId = null;
let statusTimer = null;

btn.addEventListener("click", async function () {
  const ismInput = document.querySelector(".input-Som-Ism");
  const sonInput = document.querySelector(".input-Som-Son");
  const xonaInput = document.querySelector(".input-Som-Xon");

  const ism = ismInput.value.trim();
  const son = sonInput.value.trim();
  const xona = xonaInput.value.trim();

  if (!ism || !son || !xona) {
    showToast(" Barcha maydonlarni to'ldiring!", "#e65100");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Yuborilmoqda...";

  const order = {
    ism: ism,
    son: Number(son),
    xona: Number(xona),
    status: "pending",
    vaqt: new Date().toISOString()
  };

  try {
    const res = await fetch("https://somsa-c5ae4-default-rtdb.firebaseio.com" + "/buyurtmalar.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(order)
    });

    const data = await res.json();
    currentOrderId = data.name;

    btn.textContent = " Yuborildi!";
    showToast(" Buyurtmangiz yuborildi! Admin tasdiqlashini kuting...", "#1565c0", 6000);

    if (statusTimer) {
      clearInterval(statusTimer);
    }

    statusTimer = setInterval(async function () {
      try {
        const statusRes = await fetch("https://somsa-c5ae4-default-rtdb.firebaseio.com" + "/buyurtmalar/" + currentOrderId + "/status.json");
        const status = await statusRes.json();

        if (status === "accepted") {
          clearInterval(statusTimer);

          showNotification(ism, son, xona);

          btn.disabled = false;
          btn.textContent = "Zakaz Qilish →";

          ismInput.value = "";
          sonInput.value = "";
          xonaInput.value = "";
        }

        if (status === "rejected") {
          clearInterval(statusTimer);

          showToast(" Zakazingiz rad etildi", "crimson", 5000);

          btn.disabled = false;
          btn.textContent = "Zakaz Qilish →";
        }
      } catch (error) {
        console.log("Statusni tekshirishda xatolik:", error);
      }
    }, 2000);

  } catch (error) {
    console.log("Zakaz yuborishda xatolik:", error);
    showToast(" Xatolik yuz berdi!", "crimson");
    btn.disabled = false;
    btn.textContent = "Zakaz Qilish →";
  }
});

function showNotification(ism, son, xona) {
  const old = document.getElementById("zakaz-notif");
  if (old) old.remove();

  const box = document.createElement("div");
  box.id = "zakaz-notif";
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
  `;

  box.innerHTML = `
    <div style="font-size:32px; margin-bottom:8px;">✅</div>
    <div style="font-size:17px; font-weight:700; margin-bottom:4px;">Zakaz qabul qilindi!</div>
    <div style="font-size:13px; opacity:0.85;">${ism} — ${son} ta somsa, ${xona}-xona</div>
    <div style="font-size:12px; opacity:0.7; margin-top:6px;">Tez orada yetkazib beramiz 🫓</div>
  `;

  document.body.appendChild(box);

  setTimeout(function () {
    box.remove();
  }, 8000);
}

function showToast(msg, color, duration = 3000) {
  const old = document.getElementById("toast-notif");
  if (old) old.remove();

  const t = document.createElement("div");
  t.id = "toast-notif";
  t.style.cssText = `
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    background: ${color};
    color: #fff;
    border-radius: 10px;
    padding: 12px 24px;
    font-family: Inter, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 9999;
    box-shadow: 0 4px 18px rgba(0,0,0,0.18);
    white-space: nowrap;
  `;

  t.textContent = msg;
  document.body.appendChild(t);

  setTimeout(function () {
    t.remove();
  }, duration);
}


const textarea = document.querySelector(".izox-textarea")
const izoxInp = document.querySelector(".izox-textarea-ism")
const izoxBtn = document.querySelector(".izox-btn")
const izoxList = document.querySelector(".izoxlar-list")

  function getInitial(name) {
  return name ? name.trim()[0].toUpperCase() : "?"
}

function createCard(key, item) {
  const card = document.createElement("div")
  card.classList.add("izox-card")
  card.setAttribute("id", key)

  card.innerHTML = `
    <div class="izox-header">
      <div class="izox-avatar">${getInitial(item.ism)}</div>
      <div class="izox-meta">
        <div class="izox-name">${item.ism}</div>
        <div class="izox-time">${item.timestamp
          ? new Date(item.timestamp).toLocaleString("uz-UZ", {
              day:"2-digit", month:"long", year:"numeric",
              hour:"2-digit", minute:"2-digit"
            })
          : ""
        }</div>
      </div>
    </div>
    <div class="izox-body">${item.comment}</div>
  `

  return card
}

function getData() {
  izoxList.innerHTML = ""
  fetch("https://somsa-c5ae4-default-rtdb.firebaseio.com/commentlar.json")
    .then(res => res.json())
    .then(data => {
      const malumotlar = data ? Object.entries(data) : []
      malumotlar.forEach(([key, item]) => {
        izoxList.appendChild(createCard(key, item))
      })
    })
    .catch(err => console.log(err, "error"))
}

izoxBtn.addEventListener("click", async () => {
  const comment = textarea.value.trim()      // ✅ click ichida o'qilmoqda
  const commentIsm = izoxInp.value.trim()    // ✅ to'g'ri elementdan

  if (!comment || !commentIsm) return        // bo'sh bo'lsa chiqib ket

  const comment1 = {
    comment: comment,
    ism: commentIsm
  }

  await fetch("https://somsa-c5ae4-default-rtdb.firebaseio.com/commentlar.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(comment1)
  })
  
  izoxInp.value = ""
  textarea.value = ""

  getData() // ma'lumotlarni yangilash
})

getData() // sahifa yuklanishida ham chaqir


// ══════════════════════════════
//  ISH VAQTI — Firebase dan o'qish
// ══════════════════════════════
const DB = "https://somsa-c5ae4-default-rtdb.firebaseio.com";

async function checkWorkStatus() {
  try {
    const res  = await fetch(DB + "/ishVaqti.json");
    const data = await res.json();

    const open     = data?.open     ?? 4;
    const close    = data?.close    ?? 11;
    const isActive = data?.isActive ?? true;

    const now    = new Date().getHours();
    const isOpen = isActive && now >= open && now < close;

    // Badge yangilash
    const old = document.getElementById("work-status");
    if (old) old.remove();

    const box = document.createElement("div");
    box.id = "work-status";
    box.style.cssText = `
      position: fixed;
      top: 70px; right: 20px;
      z-index: 999;
      background: ${isOpen ? "#1b5e20" : "#b71c1c"};
      color: #fff;
      border-radius: 12px;
      padding: 10px 18px;
      font-family: Inter, sans-serif;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    box.innerHTML = isOpen
      ? `<span style="width:8px;height:8px;border-radius:50%;background:#4caf50;display:inline-block;animation:pulse 1.4s infinite"></span> Ochiq — ${open}:00 dan ${close}:00 gacha`
      : `<span style="width:8px;height:8px;border-radius:50%;background:#ef9a9a;display:inline-block"></span> ${isActive ? `Yopiq — ish vaqti ${open}:00 — ${close}:00` : "Hozircha yopiq"}`;

    document.body.appendChild(box);

    // Zakaz tugmasini bloklash
    if (btn) {
      btn.disabled = !isOpen;
      if (!isOpen) {
        btn.textContent = "🕐 Yopiq";
        btn.style.opacity = "0.5";
        btn.style.cursor  = "not-allowed";
      } else {
        btn.textContent = "Zakaz Qilish →";
        btn.style.opacity = "1";
        btn.style.cursor  = "pointer";
      }
    }

  } catch(err) {
    console.log("Ish vaqtini tekshirishda xatolik:", err);
  }
}

// Sahifa yuklanishida tekshir
checkWorkStatus();

// Har 1 daqiqada yangilash
setInterval(checkWorkStatus, 60000);