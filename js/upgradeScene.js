/* global Phaser */

// Copyright (c) 2025 Isaac Ip All rights reserved
//
// Created by: Isaac Ip
// Created on: Sep 2025
// This is the Upgrade Scene

class UpgradeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'upgradeScene' });
    this.upgradeLevel = 0;
    this.upgradeText = null;
  }

  preload() {
    // You can load upgrade-related assets here
  }

  create() {
    this.cameras.main.setBackgroundColor('#222222');
    this.upgradeText = this.add.text(1920 / 2, 1080 / 2, 'Upgrade Gun\nCurrent Level: ' + this.upgradeLevel, {
      font: '48px Arial',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-ENTER', () => {
      this.upgradeLevel++;
      this.upgradeText.setText('Upgrade Gun\nCurrent Level: ' + this.upgradeLevel);
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.switch('gameScene');
    });
  }
}

export default UpgradeScene;
