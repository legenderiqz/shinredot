// üst seviye 

// üst => alt ✓
// alt => üst X

import { render, initRendering } from './render.js';
import { initUI, initMenuUI, initSettingsUI, statsUI, resetUI } from './ui.js';
import { update, queueSave } from './update.js';
import { getCanvas, initDOM } from './data/dom.js';
import { loadLevel } from './render.js';
import { gs } from './data/state.js';

let lastTime = 0;
let ctx;

function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  update(deltaTime);
  render(gs.ctx);
  requestAnimationFrame(loop);
}


function listenMenus() {
  if (gs.statsRequest) {
    statsUI();
    gs.statsRequest = false;
  }
  if (gs.resetRequest) {
    resetUI();
    gs.resetRequest = false;
  }
  requestAnimationFrame(listenMenus)
}


async function initGame() {
  initDOM();
  const canvas = getCanvas();

  if (!canvas) {
    console.error('Canvas bulunamadı');
    return;
  }

  ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error('CTX alınamadı');
    return;
  }

  gs.ctx = ctx;

  initUI();
  initRendering(ctx);

  await loadLevel(gs.currentLevelId);
  queueSave();
  requestAnimationFrame(loop);
}

function setRealHeight() {
  requestAnimationFrame(() => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
  });
}

function initPage() {
  gs.scene = 'menu';
  initMenuUI();
  checkPlaying();
  loadGame();
  initSettingsUI();
  listenMenus();
}

function checkPlaying() {
  if (gs.scene === 'game') {
    initGame();
  } else if (gs.scene === 'menu') {
    requestAnimationFrame(checkPlaying);
  }
}

export function loadGame() {
  const data = JSON.parse(localStorage.getItem('shinredot_save'));
  if (!data) return;
  
  gs.totalCoins = data.totalCoins ?? 0;
  gs.currentLevelId = data.currentLevelId ?? 1;
  gs.currentRoomId = data.currentRoomId ?? 1;
  gs.totalJumps = data.totalJumps ?? 0;
  gs.totalShadows = data.totalShadows ?? 0;
}

setRealHeight();
initPage();

window.addEventListener('resize', setRealHeight);
window.addEventListener('orientationchange', setRealHeight);