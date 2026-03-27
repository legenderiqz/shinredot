
import { gs } from './data/state.js';
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
    if (gs.currentMode !== 'normal') return;
    if (!gs.onTracePlatform && gs.currentLevelId !== 7) {
      addShadow(gs.player.x, gs.player.y);
    }
  });
}