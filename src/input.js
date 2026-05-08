
import { gs, createInitialGS } from './data/state.js';
import { addShadow } from './update.js';

export function buttonInteractions(up, down, left, right, shadow) {
  [up, down, left, right].forEach((btn) => {
    btn.addEventListener('touchstart', () => {
      switch(btn.id) {
        case 'upBtn': 
          gs.keys.up = true;
          gs.keys.upPressed = true;
          break;
        case 'downBtn': gs.keys.down = true; break;
        case 'leftBtn': gs.keys.left = true; break;
        case 'rightBtn': gs.keys.right = true; break;
      }
    });
    
    btn.addEventListener('touchend', () => {
      switch(btn.id) {
        case 'upBtn': gs.keys.up = false; break;
        case 'downBtn': gs.keys.down = false; break;
        case 'leftBtn': gs.keys.left = false; break;
        case 'rightBtn': gs.keys.right = false; break;
      }
    });
  });
  
  shadow.addEventListener('touchstart', () => {
    if (
      gs.currentMode !== 'normal' ||
      gs.noShadowLock
    ) return;
    
    if (!gs.onTracePlatform && !gs.onNoShadowPlatform && gs.currentLevelId !== 7) {
      addShadow(gs.player.x, gs.player.y);
    }
  });
}

export function menuInteractions(play) {
  const startGame = () => {
    const menuDiv = document.getElementById('menuDiv');
    const gameDiv = document.getElementById('gameDiv');

    if (menuDiv) menuDiv.style.display = 'none';
    if (gameDiv) gameDiv.style.display = 'flex';

    gs.scene = 'game';
  };

  play.addEventListener('pointerup', startGame);
}


export function setupSettingsEvents() {
  const settingsBtn = document.getElementById('settings-btn');
  const overlay = document.getElementById('settings-overlay');
  const closeBtn = document.getElementById('set-close');
  const statsBtn = document.getElementById('stats-btn');
  const resetBtn = document.getElementById('reset-btn');
  
  settingsBtn.addEventListener('click', () => {
    overlay.classList.add('active');
  });

  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
  });
  
  statsBtn.onclick = () => {
    overlay.classList.remove("active");
    gs.statsRequest = true;
  }
  
  resetBtn.onclick = () => {
    overlay.classList.remove("active");
    gs.resetRequest = true;
  }
}

export function setupStatsEvents() {
  const statsClose = document.getElementById('stats-close');
  const overlay = document.getElementById('stats-overlay');
  const setOverlay = document.getElementById('settings-overlay');

  statsClose.onclick = () => {
    setOverlay.classList.add("active");  
    overlay.classList.remove("active");
  }
}

export function setupResetEvents() {
  const resetClose = document.getElementById('reset-close');
  const resetConfirm = document.getElementById('reset-confirm');
  const overlay = document.getElementById('reset-overlay');
  const setOverlay = document.getElementById('settings-overlay');

  resetClose.onclick = () => {
    setOverlay.classList.add("active");  
    overlay.classList.remove("active");
  };

  resetConfirm.onclick = () => {
    applyReset();
  };
}

export function applyReset() {
  localStorage.removeItem('shinredot_save');
  Object.assign(gs, createInitialGS());
  location.reload();
}