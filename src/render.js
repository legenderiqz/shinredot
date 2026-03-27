// orta seviye

import { gameDiv, canvas } from './data/dom.js';
import { gs } from './data/state.js';
import { CONFIG } from './data/config.js';
import { renderLevelText } from './ui.js';
 
// === VARIABLES ===
let lastLevelId = null;
let lastRoomId = null;

// === INIT === 
export function initRendering(ctx) {
  canvas.height = CONFIG.C_HEIGHT;
  canvas.width = CONFIG.C_WIDTH;
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
    ctx.fillStyle = '#55D63C';
    ctx.fillRect(0, 0, CONFIG.C_WIDTH, CONFIG.C_HEIGHT);
  }
  
  drawLevel(ctx)
  
  // Shadows
  gs.shadows.forEach(shadow => {
    ctx.fillStyle = '#AAA';
    ctx.fillRect(shadow.x, shadow.y, shadow.size, shadow.size);
  });
  
  // Player
  ctx.fillStyle = '#111'
  ctx.fillRect(
    gs.player.x,
    gs.player.y,
    gs.player.size,
    gs.player.size
  )
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
    lvl.platforms.forEach(platform => {
      
      setNormalColors(ctx, platform);
      
      // Platform
      ctx.fillRect(
        platform.x,
        platform.y,
        platform.width,
        platform.height
      );
      
    });
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

export async function loadLevel(levelId, roomId = 1) {
  const response = await fetch('./src/data/levels.json');
  const data = await response.json();

  const level = data.levels.find(l => l.id === levelId);
  if (!level) return;

  let platforms;

  if (level.rooms) {
    const room = level.rooms.find(r => r.id === roomId);
    if (!room) return;
    platforms = room.platforms;
  } else {
    platforms = level.platforms;
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
      ctx.fillStyle = 'purple';
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