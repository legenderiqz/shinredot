// alt seviye

import { CONFIG } from './config.js';

function createPlayer() {
  return {
    x: 0,
    y: 0,
    onGround: true,
    vy: 0,
    speed: CONFIG.P_SPEED,
    size: CONFIG.P_SIZE,
  };
}

function createKeys() {
  return {
    upPressed: false,
    up: false,
    down: false,
    left: false,
    right: false
  }
}

export function createInitialGS() {
  return {
    version: null,
    saveQueued: false,
    saveTimer: 0,
    cachedPlatforms: [],
    platformsDirty: true,
    time: 0,
    statsRequest: false,
    resetRequest: false,
    totalJumps: 0,
    totalShadows: 0,
    totalCoins: 0,
    coinsCollectedInLevel: 0,
    coinEffects: [],
    ctx: null,
    scene: 'menu',
    currentLevel: null,
    currentLevelId: 1,
    currentRoomId: 1,
    currentLevelData: null,
    currentMode: 'normal',
    
    shadowCount: 0,
    requiredShadows: 5,
    groundY: CONFIG.C_HEIGHT,
    inputLock: 0,
    coyoteTimer: 0,
    
    activeTraceShadow: null,  
    onTracePlatform: false,
    onNoShadowPlatform: false,
    noShadowLock: false,
    
    goalTriggered: false,
    goalCooldown: 0,
    levelNeedsLoad: true,
    
    player: createPlayer(),
    keys: createKeys(),
    platforms: [],
    shadows: []
  }
}

export let gs = createInitialGS();
