/* global Phaser */

// Copyright (c) 2025 Isaac Ip All rights reserved
//
// Created by: Isaac Ip
// Created on: Apr 2025
// This is the Phaser 3 game configuration file.

// scene import statements
import SplashScene from './splashScene.js'
import TitleScene from './titleScene.js'
import GameScene from './gameScene.js'
import DeathScene from './deathScene.js'
import UpgradeScene from './upgradeScene.js'
import ClassScene from './classScene.js'

// create the new scenes
const splashScene = new SplashScene()
const titleScene = new TitleScene()
const gameScene = new GameScene()
const deathScene = new DeathScene()
const upgradeScene = new UpgradeScene();
const classScene = new ClassScene();

/**
 * Start Phaser Game.
 */
const config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  physics: {
    default: 'matter',
    matter: {
      debug: true,
      gravity: { y: 0 }
    }
  },
  backgroundColor: 0x5f6e7a,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);

game.scene.start('splashScene');
game.scene.add('splashScene', splashScene);
game.scene.add('titleScene', titleScene);
game.scene.add('gameScene', gameScene);
game.scene.add('deathScene', deathScene);
game.scene.add('upgradeScene', upgradeScene);
game.scene.add('classScene', classScene);

game.scene.start('splashScene');
