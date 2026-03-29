function pad(value) {
  return value >= 10 ? String(value) : `0${value}`;
}

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

let hours        = 0;
let minutes      = 0;
let seconds      = 0;
let milliseconds = 0;
let intervalId   = null;

function tick() {
  milliseconds += 10;

  if (milliseconds === 1000) {
    milliseconds = 0;
    seconds++;
  }
  if (seconds === 60) {
    seconds = 0;
    minutes++;
  }
  if (minutes === 60) {
    minutes = 0;
    hours++;
  }

  swHours.textContent   = pad(hours);
  swMinutes.textContent = pad(minutes);
  swSeconds.textContent = pad(seconds);
  swMs.textContent      = pad(Math.floor(milliseconds / 10));
}

function startStopwatch() {
  intervalId = setInterval(tick, 10);
  btnStart.classList.add("d-none");
  btnReset.classList.add("d-none");
  btnFlag.classList.remove("d-none");
  btnPause.classList.remove("d-none");
}

function pauseStopwatch() {
  clearInterval(intervalId);
  btnStart.classList.remove("d-none");
  btnReset.classList.remove("d-none");
  btnFlag.classList.add("d-none");
  btnPause.classList.add("d-none");
}

function recordLap() {
  const lapsTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(Math.floor(milliseconds / 10))}`;
  const li = document.createElement("li");
  li.textContent = lapsTime;
  lapsEl.appendChild(li);
  li.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function resetStopwatch() {
  hours        = 0;
  minutes      = 0;
  seconds      = 0;
  milliseconds = 0;

  swHours.textContent   = "00";
  swMinutes.textContent = "00";
  swSeconds.textContent = "00";
  swMs.textContent      = "00";

  btnReset.classList.add("d-none");
  lapsEl.innerHTML = "";
}

btnStart.addEventListener("click", startStopwatch);
btnPause.addEventListener("click", pauseStopwatch);
btnFlag.addEventListener("click",  recordLap);
btnReset.addEventListener("click", resetStopwatch);