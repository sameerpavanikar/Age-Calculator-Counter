const birthDateInput = document.getElementById("birthDate");
const birthTimeInput = document.getElementById("birthTime");
const timezoneSelect = document.getElementById("timezone");
const saveBtn = document.getElementById("saveBtn");
const themeToggle = document.getElementById("themeToggle");

const ymdEl = document.getElementById("ymd");
const monthsEl = document.getElementById("months");
const weeksEl = document.getElementById("weeks");
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const presentCountdownEl = document.getElementById("presentCountdown");

let timer;

/* ---------- THEME ---------- */
const savedTheme = localStorage.getItem("theme") || "dark";
document.body.classList.toggle("dark", savedTheme === "dark");
themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
});

/* ---------- LOAD SAVED DATA ---------- */
window.addEventListener("load", () => {
  const saved = JSON.parse(localStorage.getItem("ageData"));
  if (!saved) return;

  birthDateInput.value = saved.date;
  birthTimeInput.value = saved.time;
  timezoneSelect.value = saved.tz;
  startCounter();
});

/* ---------- SAVE ---------- */
saveBtn.addEventListener("click", () => {
  if (!birthDateInput.value || !birthTimeInput.value) return;

  localStorage.setItem("ageData", JSON.stringify({
    date: birthDateInput.value,
    time: birthTimeInput.value,
    tz: timezoneSelect.value
  }));

  startCounter();
});

/* ---------- START ---------- */
function startCounter() {
  clearInterval(timer);

  const [h, m, s = 0] = birthTimeInput.value.split(":");
  const birthDate = new Date(birthDateInput.value);
  birthDate.setHours(h, m, s);

  timer = setInterval(() => {
    updateAge(birthDate);
    updatePresentCountdown();
  }, 1000);
}

/* ---------- AGE ---------- */
function updateAge(birthDate) {
  const now = new Date();
  if (now < birthDate) return;

  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const diffMs = now - birthDate;
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const d = Math.floor(hr / 24);
  const w = Math.floor(d / 7);

  ymdEl.textContent = `${years} years ${months} months ${days} days`;
  monthsEl.textContent = `${years * 12 + months} months`;
  weeksEl.textContent = `${w} weeks ${d % 7} days`;
  daysEl.textContent = `${d.toLocaleString()} days`;
  hoursEl.textContent = `${hr.toLocaleString()} hours`;
  minutesEl.textContent = `${min.toLocaleString()} minutes`;
  secondsEl.textContent = `${sec.toLocaleString()} seconds`;
}

/* ---------- PRESENT DAY COUNTDOWN ---------- */
function updatePresentCountdown() {
  const now = new Date();
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const diff = end - now;
  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  presentCountdownEl.textContent = `Today ends in ${h}h ${m}m ${s}s`;
}


const analogClock = document.getElementById("analogClock");
const digitalClock = document.getElementById("digitalClock");
const analogBtn = document.getElementById("analogBtn");
const digitalBtn = document.getElementById("digitalBtn");
const formatToggle = document.getElementById("formatToggle");

const hourHand = document.getElementById("hourHand");
const minuteHand = document.getElementById("minuteHand");
const secondHand = document.getElementById("secondHand");

let is24Hour = true;

analogBtn.onclick = () => {
  analogClock.classList.remove("hidden");
  digitalClock.classList.add("hidden");
};

digitalBtn.onclick = () => {
  digitalClock.classList.remove("hidden");
  analogClock.classList.add("hidden");
};

formatToggle.onclick = () => {
  is24Hour = !is24Hour;
  formatToggle.textContent = is24Hour ? "24H" : "12H";
};


function getTimeByZone() {
  const tz = timezoneSelect.value;
  if (tz === "local") return new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  const get = t => parts.find(p => p.type === t).value;
  const now = new Date();
  now.setHours(get("hour"), get("minute"), get("second"));
  return now;
}

function updateClock() {
  const now = getTimeByZone();

  const ms = now.getMilliseconds();
  const sec = now.getSeconds() + ms / 1000;
  const min = now.getMinutes() + sec / 60;
  const hr = now.getHours() % 12 + min / 60;

  secondHand.style.transform =
    `translateX(-50%) rotate(${sec * 6}deg)`;
  minuteHand.style.transform =
    `translateX(-50%) rotate(${min * 6}deg)`;
  hourHand.style.transform =
    `translateX(-50%) rotate(${hr * 30}deg)`;

  let h = now.getHours();
  let suffix = "";

  if (!is24Hour) {
    suffix = h >= 12 ? " PM" : " AM";
    h = h % 12 || 12;
  }

  digitalClock.textContent =
    `${String(h).padStart(2, "0")}:` +
    `${String(now.getMinutes()).padStart(2, "0")}:` +
    `${String(now.getSeconds()).padStart(2, "0")}${suffix}`;

  requestAnimationFrame(updateClock);
}

updateClock();
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

analogClock.style.position = "absolute";
analogClock.style.cursor = "grab";

analogClock.addEventListener("mousedown", startDrag);
analogClock.addEventListener("touchstart", startDrag);

document.addEventListener("mousemove", drag);
document.addEventListener("touchmove", drag);

document.addEventListener("mouseup", stopDrag);
document.addEventListener("touchend", stopDrag);

function startDrag(e) {
  isDragging = true;
  analogClock.style.cursor = "grabbing";
  const rect = analogClock.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  offsetX = clientX - rect.left;
  offsetY = clientY - rect.top;
}

function drag(e) {
  if (!isDragging) return;
  const x = e.touches ? e.touches[0].clientX : e.clientX;
  const y = e.touches ? e.touches[0].clientY : e.clientY;

  analogClock.style.left = `${x - offsetX}px`;
  analogClock.style.top = `${y - offsetY}px`;
}

function stopDrag() {
  isDragging = false;
  analogClock.style.cursor = "grab";
}

const dayDateEl = document.getElementById("dayDate");
const greetingEl = document.getElementById("greeting");

function updateDayDate() {
  const tz = timezoneSelect.value === "local" ? undefined : timezoneSelect.value;

  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  dayDateEl.textContent = formatter.format(now);
}

updateDayDate();
setInterval(updateDayDate, 60 * 1000); // refresh every minute 

/* ---------- RESET BUTTON ---------- */
const resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", () => {
  // Stop timers
  clearInterval(timer);

  // Clear inputs
  birthDateInput.value = "";
  birthTimeInput.value = "";
  timezoneSelect.value = "local";

  // Clear outputs
  ymdEl.textContent = "";
  monthsEl.textContent = "";
  weeksEl.textContent = "";
  daysEl.textContent = "";
  hoursEl.textContent = "";
  minutesEl.textContent = "";
  secondsEl.textContent = "";
  presentCountdownEl.textContent = "";

  // Hide greeting
  greetingEl.classList.add("hidden");

  // Reset clocks
  digitalClock.textContent = "--:--:--";
  secondHand.style.transform = "translateX(-50%) rotate(0deg)";
  minuteHand.style.transform = "translateX(-50%) rotate(0deg)";
  hourHand.style.transform   = "translateX(-50%) rotate(0deg)";

  // Remove stored age data (keep theme)
  localStorage.removeItem("ageData");
});

