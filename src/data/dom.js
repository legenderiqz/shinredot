// dom.js

let canvas = null;
let gameDiv = null;

export function initDOM() {
  gameDiv = document.getElementById('gameDiv');
  canvas = document.getElementById('canvas');
}

export function getCanvas() {
  return canvas;
}

export function getGameDiv() {
  return gameDiv;
}