// orta seviye
import { gameDiv } from './data/dom.js';
import { buttonInteractions } from './input.js';
import { gs } from './data/state.js';

export function initUI() {
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
  
  upBtn.textContent = '↑';
  downBtn.textContent = '↓';
  leftBtn.textContent = '←';
  rightBtn.textContent = '→';
  shadowBtn.textContent = '▣';
  
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

  const text = `Level ${gs.currentLevelId}
  "${gs.currentLevel}"`;
  const desc = `${gs.currentLevelData.description}`;
  
  levelText.textContent = text;
  levelDesc.textContent = desc;
}