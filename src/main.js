import { GameScene } from './game/scenes/GameScene.js';

const canvas = document.querySelector('#game');
const game = new GameScene(canvas);
game.start();
