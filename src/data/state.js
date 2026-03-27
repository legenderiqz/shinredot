// alt seviye

import { CONFIG } from './config.js';

export let gs = {
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
  goalTriggered: false,
  goalCooldown: 0,
  levelNeedsLoad: true,
  
  player: {
    x: 0,
    y: 0,
    onGround: true,
    vy: 0,
    speed: CONFIG.P_SPEED,
    size: 16,
  },
  
  keys: {
    upPressed: false,
    up: false,
    down: false,
    left: false,
    right: false
  },
  
  platforms: [],
  
  shadows: []
}

