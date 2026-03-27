// üst seviye 

// üst => alt ✓
// alt => üst X

import { render, initRendering } from './render.js';
import { initUI } from './ui.js';
import { update } from './update.js';
import { canvas } from './data/dom.js';
import { loadLevel } from './render.js';
import { gs } from './data/state.js';

//ctx
const ctx = canvas.getContext('2d');

let lastTime = 0;

function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  update(deltaTime);
  render(ctx);
  requestAnimationFrame(loop);
}

async function init() {
  initUI();
  initRendering(ctx);
  await loadLevel(gs.currentLevelId);
  requestAnimationFrame(loop);
}


init();