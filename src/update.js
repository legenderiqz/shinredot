// orta seviye
import { gs } from './data/state.js';
import { CONFIG } from './data/config.js';

// ---- UPDATE & LEVELS ----
export function update(dt) {
  if (!gs.currentLevelData) return;
  
  checkUpdateConditions(dt);
  tryMove(dt);
  applyGravity(dt, true);  // Gravity uygulansın, y konumu henüz güncellenmesin
  checkPlatCollision(dt);  // Platform ve ground çarpışmalarını kontrol et
  finalizeGravity(dt);     // Gravity sonucu y konumunu güncelle
  clampPosition();         // Oyuncuyu ekran sınırları içinde tut
  
  gs.keys.upPressed = false; // Sadece tıklandığı an true
}

export function checkUpdateConditions(dt) {
  if (gs.goalCooldown > 0) {
    gs.goalCooldown -= 1;
    if (gs.goalCooldown <= 0) {
      gs.goalTriggered = false;
    }
  }
  
  //Coyote Time
  if (gs.player.onGround) {
    gs.coyoteTimer = CONFIG.COYOTE_TIME;
  } else {
    gs.coyoteTimer -= 1000 * dt;
  }
  
  // Input Lock
  if (gs.inputLock > 0) gs.inputLock -= 1000 * dt;
}

// Bir sonraki seviyeye geçiş
export function nextLevel() {
  const level = gs.currentLevelData;

  if (level.maxRooms && gs.currentRoomId < level.maxRooms) {
    gs.currentRoomId++;
  } else {
    gs.currentLevelId++;
    gs.currentRoomId = 1;
  }
}

// Level resetleme (shadow veya normal mod geçişi)
export function restartLevel() {
  if (gs.currentMode !== 'shadow') return;
  gs.currentMode = 'normal';
  gs.player.x = CONFIG.SPAWN_X;
  gs.player.y = CONFIG.SPAWN_Y;
  gs.shadows = [];
  gs.shadowCount = 0;
}
// ------------


// ---- MOVEMENT ----
// Hareket (Zıplama Hariç)
export function tryMove(dt) {
  const p = gs.player;
  if (gs.inputLock > 0) return;
  if (gs.keys.down && gs.keys.up) return;
  if (gs.keys.left && gs.keys.right) return;

  // Hız ayarı (crouch durumu)
  let speed = CONFIG.P_SPEED;
  if (gs.keys.down && p.onGround) speed *= CONFIG.CROUCH_FACTOR;

  if (gs.keys.left) p.x -= speed * dt * CONFIG.FRAME_RATE;
  if (gs.keys.right) p.x += speed * dt * CONFIG.FRAME_RATE;

  // Zıplama
  if (gs.keys.up && (p.onGround || gs.coyoteTimer > 0) && !gs.keys.down) {
    p.vy = CONFIG.JUMP_FORCE;
    p.onGround = false;
    gs.coyoteTimer = 0;
  }
}

// Gravity ve zıplama
export function applyGravity(dt, skipY = false) {
  const p = gs.player;

  // Gravity artırımı (düşme hızı)
  let gravity = CONFIG.GRAVITY;
  if (gs.keys.down && !gs.keys.up && !p.onGround) gravity *= 3;

  p.vy += gravity * dt * CONFIG.FRAME_RATE;
  if (p.vy > CONFIG.MAX_FALL_SPEED) p.vy = CONFIG.MAX_FALL_SPEED;

  if (!skipY) p.y += p.vy * dt * CONFIG.FRAME_RATE;
}

// Gravity sonucu y konumunu güncelle
export function finalizeGravity(dt) {
  const p = gs.player;
  if (!p.onGround) p.y += p.vy * dt * CONFIG.FRAME_RATE;
}

// Ekran sınırları dışına çıkmayı engeller
export function clampPosition() {
  const p = gs.player;
  if (p.x < 0) p.x = 0;
  if (p.x + p.size > CONFIG.C_WIDTH) p.x = CONFIG.C_WIDTH - p.size;
  if (p.y < 0) {
    p.y = 0;
    p.vy = 0;
  }
  if (p.y + p.size > CONFIG.C_HEIGHT) p.y = CONFIG.C_HEIGHT - p.size;
}
// ------------


// COLLISION SİSTEMİ
// Platform ve çarpışma kontrolü
export function checkPlatCollision(dt) {
  if (!gs.currentLevelData || !gs.currentLevelData.platforms) return;
  const p = gs.player;
  p.onGround = false;

  let activePlatforms = setPlatforms();
  checkPlatforms(dt, p, activePlatforms);

  // Ground fallback
  if (!p.onGround && p.y + p.size >= gs.groundY) {
    p.y = gs.groundY - p.size;
    p.vy = 0;
    p.onGround = true;
  }
}

export function setPlatforms() {
  if (gs.currentMode === 'normal') {
    return gs.currentLevelData.platforms || [];
  } else if (gs.currentMode === 'shadow') {
    const specialPlatforms = (gs.currentLevelData.platforms || []).filter(
      plat => 
      plat.type === 'ground' ||
      plat.type === 'goal' ||
      plat.type === 'spawn' ||
      plat.type === 'shadowWall' ||
      plat.type === 'hybridWall'
    );
    const shadowPlatforms = gs.shadows.map(shadow => ({
      x: shadow.x,
      y: shadow.y,
      width: shadow.size,
      height: shadow.size,
      type: 'shadow'
    }));
    return [...specialPlatforms, ...shadowPlatforms];
  }
}

export function checkPlatforms(dt, p, activePlatforms) {
  gs.onTracePlatform = false;
  gs.currentLevelData.platforms.forEach((plat, index) => {
    plat._id = index; // otomatik unique ID
  });
  
  for (const plat of activePlatforms) {
    if (plat.type === 'spawn' || (plat.type === 'shadowWall' && gs.currentMode === 'normal')) continue;
    
    const nextY = p.y + p.vy * dt * CONFIG.FRAME_RATE;

    const px1 = p.x;
    const px2 = p.x + p.size;
    const py1 = p.y;
    const py2 = p.y + p.size;

    const platX1 = plat.x;
    const platX2 = plat.x + plat.width;
    const platY1 = plat.y;
    const platY2 = plat.y + plat.height;

    // Goal çarpışması (oyun ilerlemesini tetikler)
    const isColliding =
    px2 > platX1 && px1 < platX2 &&
    py2 > platY1 && py1 < platY2;

    if (plat.type === 'goal') {

      checkGoal(isColliding)
      continue;
    }

    // AABB çarpışma
    const hitX = px2 > platX1 && px1 < platX2;
    const hitY = py2 > platY1 && py1 < platY2;

    // umarım aşağıdaki kod asla bozulmaz
    if (hitX && hitY) {
      if (plat.type === 'wall' || plat.type === 'shadowWall' || plat.type === 'hybridWall') {
        if (plat.type === 'shadowWall' && gs.currentMode === 'normal') continue;
        // Wall için hangi taraftan çarpıldığına göre düzelt
        const overlapLeft = px2 - platX1;
        const overlapRight = platX2 - px1;
        const overlapTop = py2 - platY1;
        const overlapBottom = platY2 - py1;

        const minXOverlap = Math.min(overlapLeft, overlapRight);
        const minYOverlap = Math.min(overlapTop, overlapBottom);

        if (minXOverlap < minYOverlap) {
          // X ekseninde itme
          if (overlapLeft < overlapRight) p.x = platX1 - p.size;
          else p.x = platX2;
        } else {
          // Y ekseninde itme
          if (overlapTop < overlapBottom) {
            p.y = platY1 - p.size;  // Üstten basma
            p.vy = 0;
            p.onGround = true;
          } else {
            p.y = platY2;  // Alttan çarpma
            if (p.vy < 0) p.vy = 0;
          }
        }
        continue;
      }
    }

    // Sadece üstten çarpışma (ground, trampoline)
    const hitYTop = py2 <= platY1 && nextY + p.size >= platY1;
    if (hitX && hitYTop && p.vy >= 0) {
      if (plat.type === 'ground' && gs.currentMode === 'shadow') {
        restartLevel();
        return;
      }

      if (plat.type === 'trampoline') {
        p.vy = CONFIG.JUMP_FORCE * CONFIG.TRAMPOLINE_FORCE;
        p.onGround = false;
        return;
      }
      
      checkTracePlatforms(p, plat);
      
      // Normal platform
      p.y = plat.y - p.size;
      p.vy = 0;
      p.onGround = true;
    }
  }
}

// checkTracePlatforms'i basitleştir
export function checkTracePlatforms(p, plat) {
  if (plat.type !== 'tracePlatform') return;
  gs.onTracePlatform = true;
  
  const clampedX = Math.max(
    plat.x,
    Math.min(p.x, plat.x + plat.width - p.size)
  );

  addShadowWithLimit({
    x: clampedX,
    y: plat.y - p.size,
    size: p.size,
    type: 'shadow',
    source: 'trace',
    platformId: plat._id
  });
}

export function checkGoal(isColliding) {
  if (gs.goalCooldown > 0) return;

  if (isColliding && !gs.goalTriggered) {
    gs.goalTriggered = true;
    gs.goalCooldown = 20; // ~20 frame lock
    goalReached();
  }
}

// Oyuncu hedefe ulaştığında çağrılır
export function goalReached() {
  gs.goalTriggered = true;
  if (gs.currentMode === 'normal') {
    gs.currentMode = 'shadow';
    gs.inputLock = CONFIG.INPUT_LOCK;

    // spawn'a ışınla
    const spawn = gs.currentLevelData.platforms.find(p => p.type === 'spawn');
    gs.player.x = spawn.x;
    gs.player.y = spawn.y;

    // ❗ trace state temizle
    gs.activeTraceShadow = null;
    gs.onTracePlatform = false;

  } else if (gs.currentMode === 'shadow') {
    gs.currentMode = 'normal';

    nextLevel(); // sadece state değiştirir
  }
}
// ------------


// ---- SHADOW EKLEME ----
// Merkezi shadow ekleme
export function addShadowWithLimit(shadow) {
  // Aynı trace platformdan shadow varsa ve güncelleniyorsa özel durum
  if (shadow.source === 'trace' && shadow.platformId !== undefined) {
    const existing = gs.activeTraceShadows?.[shadow.platformId];
    if (existing) {
      const index = gs.shadows.indexOf(existing);
      if (index !== -1) {
        gs.shadows.splice(index, 1);
        gs.shadowCount--;
      }
      if (gs.activeTraceShadows) {
        gs.activeTraceShadows[shadow.platformId] = null;
      }
    }
  }
  
  // FIFO: Limit doluysa en eskiyi sil
  if (gs.shadowCount >= gs.requiredShadows) {
    const removed = gs.shadows.shift();
    if (removed) {
      gs.shadowCount--;
      // Trace shadow referansını temizle
      if (removed.source === 'trace' && removed.platformId !== undefined) {
        if (gs.activeTraceShadows && gs.activeTraceShadows[removed.platformId] === removed) {
          gs.activeTraceShadows[removed.platformId] = null;
        }
      }
    }
  }
  
  // Yeni shadow'u ekle
  gs.shadows.push(shadow);
  gs.shadowCount++;
  
  // Trace shadow referansını kaydet
  if (shadow.source === 'trace' && shadow.platformId !== undefined) {
    if (!gs.activeTraceShadows) gs.activeTraceShadows = {};
    gs.activeTraceShadows[shadow.platformId] = shadow;
  }
}

// addShadow fonksiyonunu da aynı merkezi fonksiyonu kullanacak şekilde güncelle
export function addShadow(x, y, source = 'manual', platformId = null) {
  if (gs.currentMode === 'shadow') return;
  if (x === undefined || y === undefined) return;
  
  addShadowWithLimit({
    x, y,
    size: gs.player.size,
    type: 'shadow',
    source,
    platformId
  });
}