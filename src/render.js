// orta seviye

import { getGameDiv, getCanvas } from './data/dom.js';
import { gs, createInitialGS } from './data/state.js';
import { CONFIG } from './data/config.js';
import { renderLevelText } from './ui.js';

// === VARIABLES ===
let lastLevelId = null;
let lastRoomId = null;
let gameDiv;
let canvas;

// === INIT === 
export function initRendering(ctx) {
  gameDiv = getGameDiv()
  canvas = getCanvas()
  canvas.height = CONFIG.C_HEIGHT;
  canvas.width = CONFIG.C_WIDTH;
  ctx.imageSmoothingEnabled = false;
}

// === RENDER ===
export async function render(ctx) {
  ctx.clearRect(0, 0, CONFIG.C_WIDTH, CONFIG.C_HEIGHT);
  
  await levelOrRoomIncreased();
  
  // Background
  if (gs.currentMode === 'shadow') {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, CONFIG.C_WIDTH, CONFIG.C_HEIGHT);
  } else if (gs.currentMode === 'normal') {
    ctx.fillStyle = '#98CE59';
    ctx.fillRect(0, 0, CONFIG.C_WIDTH, CONFIG.C_HEIGHT);
  }
  
  drawLevel(ctx)
  renderCoins(ctx);
  renderCoinEffects(ctx);
  
  // Shadows
  gs.shadows.forEach(shadow => {
    ctx.fillStyle = '#AAA';
    ctx.fillRect(shadow.x, shadow.y, shadow.size, shadow.size);
  });
  
  // Player
  applyColor1(ctx)
  ctx.fillRect(
    Math.round(gs.player.x),
    Math.round(gs.player.y),
    gs.player.size,
    gs.player.size
  )
  
  applyColor2(ctx)
  ctx.fillRect(
    Math.round(gs.player.x + 2),
    Math.round(gs.player.y + 2),
    gs.player.size - 4,
    gs.player.size - 4
  )
}

export function applyColor1(ctx) {
  // Shadow kilidi yok ve tracede değil
  if (!gs.noShadowLock && !gs.onTracePlatform) {
    ctx.fillStyle = '#111'
  } else if (
    gs.noShadowLock && 
    !gs.onTracePlatform
  ) {
    ctx.fillStyle = 'blue'
  } else if (
    !gs.noShadowLock &&
    gs.onTracePlatform
  ) {
    ctx.fillStyle = 'purple'
  }
}

export function applyColor2(ctx) {
  // Shadow kilidi yok ve tracede değil
  if (!gs.noShadowLock && !gs.onTracePlatform) {
    ctx.fillStyle = '#444'
  } else if (
    gs.noShadowLock && 
    !gs.onTracePlatform
  ) {
    ctx.fillStyle = '#444'
  } else if (
    !gs.noShadowLock &&
    gs.onTracePlatform
  ) {
    ctx.fillStyle = '#444'
  }
}

export async function levelOrRoomIncreased() {
  if (
    gs.currentLevelId !== lastLevelId ||
    gs.currentRoomId !== lastRoomId
  ) {
    await loadLevel(gs.currentLevelId, gs.currentRoomId);
    
    lastLevelId = gs.currentLevelId;
    lastRoomId = gs.currentRoomId;
  }
}

export function drawLevel(ctx) {
  let lvl = gs.currentLevelData;
  if (!lvl) return;
  
  if (gs.currentMode === 'normal' && lvl.platforms) {
  
    for (const platform of lvl.platforms) {
    
      // Coinleri platform renderer'da çizme
      if (platform.type === 'coin') continue;
    
      setNormalColors(ctx, platform);
    
      // Platform
      ctx.fillRect(
        platform.x,
        platform.y,
        platform.width,
        platform.height
      );
    }
  }
  
  else if (gs.currentMode === 'shadow' && lvl.platforms) {
    lvl.platforms.forEach(platform => {
      if (platform.type === 'ground' ||
        platform.type === 'spawn' ||
        platform.type === 'goal' ||
        platform.type === 'shadowWall' ||
        platform.type === 'hybridWall'
      ) {
        setShadowColors(ctx, platform);
        // Normal hariç Platform
        ctx.fillRect(
          platform.x,
          platform.y,
          platform.width,
          platform.height
        );
      }
    });
    
    gs.shadows.forEach(shadow => {
      ctx.fillRect(
        shadow.x,
        shadow.y,
        shadow.size,
        shadow.size
      );
    });
  }
}

function normalizePlatform(p) {

  // Compact syntax
  if (Array.isArray(p)) {

    return {
      type: p[0],
      x: p[1],
      y: p[2],
      width: p[3],
      height: p[4],

      // defaults
      collected: false
    };
  }

  // Eski syntax desteklenmeye devam
  return p;
}

export async function loadLevel(levelId, roomId = 1) {
  const response = await fetch('./src/data/levels.json');
  const data = await response.json();
  gs.version = data.version;

  const level = data.levels.find(l => l.id === levelId);
  if (!level) return;

  let platforms;

  if (level.rooms) {
    const room = level.rooms.find(r => r.id === roomId);
    if (!room) return;
    platforms = room.platforms.map(normalizePlatform);
  } else {
    platforms = level.platforms.map(normalizePlatform);
  }

  gs.currentLevelData = {
    ...level,
    platforms
  };

  gs.currentLevel = level.name;
  gs.requiredShadows = level.reqShadows;

  // ❗ BURAYI SAKIN YAPMA:
  // gs.currentLevelId = levelId
  // gs.currentRoomId = roomId

  gs.shadows = [];
  gs.shadowCount = 0;
  gs.activeTraceShadows = {};
  gs.activeTraceShadow = null;
  gs.goalTriggered = false;

  renderLevelText();
  checkLevelConditions();
  
  const spawn = gs.currentLevelData.platforms.find(p => p.type === 'spawn');
  if (spawn) {
    gs.player.x = spawn.x;
    gs.player.y = spawn.y;
    gs.player.vy = 0;
    gs.player.onGround = false;
  }
  
  gs.platformsDirty = true;
}

export function checkLevelConditions() {
  // Level 1 Shadow
  if (gs.currentLevelId === 1) {
    gs.shadows.push({ 
      x: 20,
      y: 140,
      size: gs.player.size,
      type: 'shadow',
      source: 'manual',       // 'manual' || 'trace'
      platformId: null    // tracePlatform'a aitse ID
    });
    gs.shadowCount++;
  }
  
}

export function setNormalColors(ctx, platform) {
  switch (platform.type) {
    case 'ground':
      ctx.fillStyle = '#000';
      break;
    case 'normal':
      ctx.fillStyle = '#888';
      break;
    case 'goal':
      ctx.fillStyle = 'gold';
      break;
    case 'spawn':
      ctx.fillStyle = 'red';
      break;
    case 'trampoline':
      ctx.fillStyle = 'orange';
      break;
    case 'shadowWall':
      ctx.fillStyle = '#AAA';
      break;
    case 'hybridWall':
      ctx.fillStyle = '#444';
      break;
    case 'tracePlatform':
      ctx.fillStyle = 'rebeccapurple';
      break;
    case 'noShadow':
      ctx.fillStyle = 'blue';
      break;
    default:
      ctx.fillStyle = '#000'
      break;
  }
}

export function setShadowColors(ctx, platform) {
  switch (platform.type) {
    case 'ground':
      ctx.fillStyle = 'red';
      break;
    case 'normal':
      ctx.fillStyle = '#888';
      break;
    case 'goal':
      ctx.fillStyle = 'gold';
      break;
    case 'spawn':
      ctx.fillStyle = 'red';
      break;
    case 'trampoline':
      ctx.fillStyle = 'orange';
      break;
    case 'shadowWall':
      ctx.fillStyle = '#000';
      break;
    case 'hybridWall':
      ctx.fillStyle = '#444';
      break;
    default:
      ctx.fillStyle = '#000'
      break;
  }
}

export function renderCoins(ctx) {
  const plats = gs.currentLevelData.platforms;
  
  for (const item of plats) {
    
    if (item.type !== 'coin') continue;
    if (item.collected) continue;
    
    const t = gs.time * 0.004;
    const glow = 0.5 + Math.sin(t) * 0.5;
    
    ctx.save();
    
    ctx.globalAlpha = 0.7 + glow * 0.3;
    
    ctx.fillStyle = '#8DF0FF';
    
    ctx.fillRect(
      item.x,
      item.y,
      item.width,
      item.height
    );
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    
    ctx.strokeRect(
      item.x,
      item.y,
      item.width,
      item.height
    );
    
    ctx.restore();
  }
}

export function renderCoinEffects(ctx) {
  renderLevelText();
  for (const effect of gs.coinEffects) {
    ctx.save();

    ctx.globalAlpha = effect.alpha;
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(
      effect.x,
      effect.y,
      effect.radius,
      0,
      Math.PI * 2
    );

    ctx.stroke();

    ctx.restore();
  }
}