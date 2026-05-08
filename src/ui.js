// orta seviye
import { getGameDiv, getCanvas } from './data/dom.js';
import { buttonInteractions, menuInteractions, setupSettingsEvents, setupStatsEvents, setupResetEvents } from './input.js';
import { gs, createInitialGS } from './data/state.js';

let gameDiv;
let canvas;

// GAME UI
export function initUI() {
  gameDiv = getGameDiv()
  canvas = getCanvas()
  renderInfoText();
  renderButtons();
}

export function renderButtons() {
  const upBtn = document.createElement('button');
  const downBtn = document.createElement('button');
  const leftBtn = document.createElement('button');
  const rightBtn = document.createElement('button');
  const shadowBtn = document.createElement('button');
  
  gameDiv.appendChild(upBtn);
  gameDiv.appendChild(downBtn);
  gameDiv.appendChild(leftBtn);
  gameDiv.appendChild(rightBtn);
  gameDiv.appendChild(shadowBtn);
  
  upBtn.id = 'upBtn';
  downBtn.id = 'downBtn';
  leftBtn.id = 'leftBtn';
  rightBtn.id = 'rightBtn';
  shadowBtn.id = 'shadowBtn';
  
  /*
  ESKİ HAL
  upBtn.textContent = '↑';
  downBtn.textContent = '↓';
  leftBtn.textContent = '←';
  rightBtn.textContent = '→';
  shadowBtn.textContent = '▣';
  */
  
  // innerHTML + Font Awesome
  upBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  downBtn.innerHTML = '<i class="fas fa-arrow-down"></i>';
  leftBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';
  rightBtn.innerHTML = '<i class="fas fa-arrow-right"></i>';
  shadowBtn.innerHTML = '<i class="far fa-square"></i>';
  
  buttonInteractions(upBtn, downBtn, leftBtn, rightBtn, shadowBtn);
}

export function renderInfoText() {
  const infoContainer = document.createElement('div');
  const levelText = document.createElement('p');
  const levelDesc = document.createElement('p');
  
  gameDiv.appendChild(infoContainer);
  infoContainer.appendChild(levelText);
  infoContainer.appendChild(levelDesc);
  
  infoContainer.id = 'infoContainer';
  levelText.id = 'levelText';
  levelDesc.id = 'levelDesc';
  
  renderLevelText();
}

export function renderLevelText() {
  const levelText = document.getElementById('levelText');
  const levelDesc = document.getElementById('levelDesc');
  
  if (!levelText) return;
  if (!levelDesc) return;
  if (!gs.currentLevelId) return;
  if (!gs.currentLevelData) return;

  const text = gs.currentLevelId >= 7 ? `Level ${gs.currentLevelId} "${gs.currentLevel}" - Room ${gs.currentRoomId}` : `Level ${gs.currentLevelId} "${gs.currentLevel}"`;
  const desc =
  `Shadow Limit: ${gs.requiredShadows}<br>
  Echo Coins: ${gs.totalCoins}<br>
  Bilgi: ${gs.currentLevelData.description}`;
  
  levelText.textContent = text;
  levelDesc.innerHTML = desc;
}


// MENU UI
export function initMenuUI() {
  const menuDiv = document.getElementById('menuDiv');
  if (!menuDiv) return;

  // Temizle (tekrar çağrılırsa sorun olmasın)
  menuDiv.innerHTML = '';

  // Container
  const container = document.createElement('div');
  container.id = 'menuContainer';

  // Title
  const title = document.createElement('h1');
  title.id = 'titleDiv';
  title.textContent = 'Shinredot';

  // Play Button
  const playBtn = document.createElement('button');
  playBtn.id = 'playBtn';
  playBtn.textContent = 'Play';

  // Append
  container.appendChild(title);
  container.appendChild(playBtn);
  menuDiv.appendChild(container);

  // Events
  menuInteractions(playBtn);
}


// SETTINGS UI
export function initSettingsUI() {
  const wrapper = document.createElement('div');

  wrapper.innerHTML = `
    <button id="settings-btn">
      <i class="fas fa-cog"></i>
    </button>
    <div id="settings-overlay">
      <div class="set-menu">
        <p id="set-title">Ayarlar</p>
        <button id="set-close">
          <i class="far fa-times-circle fa-lg" style="color: red;"></i>
        </button>    
        <div class="set-btns">
          <button id="stats-btn">İstatistikleri Gör</button>
          <hr>
          <button id="reset-btn">Oyunu Sıfırla</button>
        </div>
      </div>
    </div>
  `;
  
  /* TODO: Bunlar eklenecek
  <button id="sfx-toggle">Ses Efektleri: Açık</button>
  */
  
  document.body.appendChild(wrapper);

  setupSettingsEvents();
}

// STATS UI
export function statsUI() {
  const existing = document.getElementById('stats-overlay');
  if (existing) existing.remove();

  const wrapper = document.createElement('div');

  wrapper.innerHTML = `
  <div id="stats-overlay">
    <div class="stats-menu">
      <p id="stats-title">İstatistikler</p>
      <button id="stats-close">
        <i class="fas fa-arrow-left" style="color:red;"></i>
      </button>
      <div id="stats-text"></div>
    </div>
  </div>
  `;

  document.body.appendChild(wrapper);

  document.getElementById('stats-text').innerHTML = applyStats();
  document.getElementById('stats-overlay').classList.add('active');
  setupStatsEvents();
}

export function applyStats() {
  let result = `
  Toplam Zıplama: ${gs.totalJumps} <br>
  Toplam Gölgeler: ${gs.totalShadows} <br>
  Mod: ${gs.currentMode} <br>
  Sürüm: ${gs.version || 'Belirlenmemiş'} <br>
  <br>
  - Debug - <br>
  İz Platformunda Mı: ${gs.onTracePlatform} <br>
  Gölge Yasak Platformda Mı: ${gs.onNoShadowPlatform} <br>
  Gölge Yasak Kilidi: ${gs.noShadowLock} <br>
  Sahne: ${gs.scene} <br>
  `
  
  return result;
}

// RESET UI
export function resetUI() {
  const existing = document.getElementById('reset-overlay');
  if (existing) existing.remove();

  const wrapper = document.createElement('div');

  wrapper.innerHTML = `
  <div id="reset-overlay">
    <div class="reset-menu">
      <p id="reset-title">Sıfırlayacağına Emin Misin?</p>
      <button id="reset-close">
        <i class="fas fa-arrow-left" style="color:red;"></i>
      </button>
      <button id="reset-confirm" style="background: tomato; border: 1px solid red; color: white;">Evet</button>
    </div>
  </div>
  `;

  document.body.appendChild(wrapper);
  document.getElementById('reset-overlay').classList.add('active');
  setupResetEvents();
}

