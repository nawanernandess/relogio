function pad(value) {
  return value >= 10 ? String(value) : `0${value}`;
}

// Tab persistence

const TAB_KEY = "chronora_active_tab";

document.addEventListener("DOMContentLoaded", () => {
  const savedTab = sessionStorage.getItem(TAB_KEY);
  if (savedTab) {
    const tabEl = document.getElementById(savedTab);
    if (tabEl) new bootstrap.Tab(tabEl).show();
  }

  document.querySelectorAll('[data-bs-toggle="pill"]').forEach((tabEl) => {
    tabEl.addEventListener("shown.bs.tab", () => {
      sessionStorage.setItem(TAB_KEY, tabEl.id);
    });
  });
});

// Clock

const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");

function updateClock() {
  const now = new Date();
  timeEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function updateDate() {
  dateEl.textContent = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

updateClock();
updateDate();
setInterval(updateClock, 1000);
setInterval(updateDate, 60000);

// Stopwatch

const swHours   = document.getElementById("sw-hours");
const swMinutes = document.getElementById("sw-minutes");
const swSeconds = document.getElementById("sw-seconds");
const swMs      = document.getElementById("sw-milliseconds");
const lapsEl    = document.getElementById("laps");

const btnStart = document.getElementById("start");
const btnPause = document.getElementById("pause");
const btnFlag  = document.getElementById("flag");
const btnReset = document.getElementById("reset");

const STORAGE_KEY = "chronora_stopwatch";

let elapsedMs  = 0;
let startedAt  = null;
let intervalId = null;
let laps       = [];

function getTotalElapsed() {
  return startedAt !== null ? elapsedMs + (Date.now() - startedAt) : elapsedMs;
}

function msToComponents(total) {
  const ms  = total % 1000;
  const s   = Math.floor(total / 1000) % 60;
  const m   = Math.floor(total / 60000) % 60;
  const h   = Math.floor(total / 3600000);
  return { h, m, s, ms };
}

function updateDisplay() {
  const { h, m, s, ms } = msToComponents(getTotalElapsed());
  swHours.textContent   = pad(h);
  swMinutes.textContent = pad(m);
  swSeconds.textContent = pad(s);
  swMs.textContent      = pad(Math.floor(ms / 10));
}

function saveState() {
  const state = {
    elapsedMs,
    savedAt:   startedAt !== null ? Date.now() : null,
    isRunning: startedAt !== null,
    laps,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  let state;
  try {
    state = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (_) {
    state = null;
  }
  if (!state) return;

  laps = Array.isArray(state.laps) ? state.laps : [];

  if (state.isRunning && state.savedAt) {
    elapsedMs = (state.elapsedMs || 0) + (Date.now() - state.savedAt);
    startedAt = Date.now();
  } else {
    elapsedMs = state.elapsedMs || 0;
    startedAt = null;
  }

  laps.forEach((lapText) => {
    const li = document.createElement("li");
    li.textContent = lapText;
    lapsEl.appendChild(li);
  });

  updateDisplay();

  if (state.isRunning) {
    intervalId = setInterval(updateDisplay, 10);
    btnStart.classList.add("d-none");
    btnReset.classList.add("d-none");
    btnFlag.classList.remove("d-none");
    btnPause.classList.remove("d-none");
  } else if (elapsedMs > 0) {
    btnReset.classList.remove("d-none");
  }
}

function startStopwatch() {
  startedAt  = Date.now();
  intervalId = setInterval(updateDisplay, 10);
  btnStart.classList.add("d-none");
  btnReset.classList.add("d-none");
  btnFlag.classList.remove("d-none");
  btnPause.classList.remove("d-none");
  saveState();
}

function pauseStopwatch() {
  elapsedMs += Date.now() - startedAt;
  startedAt  = null;
  clearInterval(intervalId);
  intervalId = null;
  btnStart.classList.remove("d-none");
  btnReset.classList.remove("d-none");
  btnFlag.classList.add("d-none");
  btnPause.classList.add("d-none");
  saveState();
}

function recordLap() {
  const { h, m, s, ms } = msToComponents(getTotalElapsed());
  const lapText = `${pad(h)}:${pad(m)}:${pad(s)}.${pad(Math.floor(ms / 10))}`;
  laps.push(lapText);
  const li = document.createElement("li");
  li.textContent = lapText;
  lapsEl.appendChild(li);
  li.scrollIntoView({ block: "nearest", behavior: "smooth" });
  saveState();
}

function resetStopwatch() {
  clearInterval(intervalId);
  intervalId = null;
  elapsedMs  = 0;
  startedAt  = null;
  laps       = [];

  swHours.textContent   = "00";
  swMinutes.textContent = "00";
  swSeconds.textContent = "00";
  swMs.textContent      = "00";

  btnReset.classList.add("d-none");
  btnStart.classList.remove("d-none");
  btnFlag.classList.add("d-none");
  btnPause.classList.add("d-none");
  lapsEl.innerHTML = "";

  localStorage.removeItem(STORAGE_KEY);
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveState();
});
window.addEventListener("beforeunload", saveState);

loadState();

btnStart.addEventListener("click", startStopwatch);
btnPause.addEventListener("click", pauseStopwatch);
btnFlag.addEventListener("click",  recordLap);
btnReset.addEventListener("click", resetStopwatch);