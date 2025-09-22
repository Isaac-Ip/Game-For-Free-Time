/* global Phaser */

// Copyright (c) 2025 Isaac Ip All rights reserved
//
// Created by: Isaac Ip
// Created on: Sep 2025
// This is the Upgrade Scene

class UpgradeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'upgradeScene' });
    this.upgradeText = null;
    this.maxedParticle = null;
  }

  preload() {
    this.load.image('upgrade', './assets/upgrade.png')
    this.load.image('maxedParticle', './assets/maxed-particle.png')
  }

  create() {
    this.cameras.main.setBackgroundColor('#222222');
    this.upgradeText = this.add.text(1920 / 2, 1080 / 2 - 100, 'Upgrade Gun', {
      font: '48px Arial',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Four evenly spaced upgrade buttons in a row
    const screenWidth = 1920;
    const buttonY = 1080 / 2 + 100;
    const labelOffset = 70;
    const buttonSpacing = screenWidth / 5;
    const buttonScale = 0.5;

    // X positions: 1/5, 2/5, 3/5, 4/5 of screen width
    const firerateX = buttonSpacing * 1;
    const reloadX = buttonSpacing * 2;
    const sprayX = buttonSpacing * 3;
    const ammoX = buttonSpacing * 4;

    const firerateButton = this.add.image(firerateX, buttonY, 'upgrade').setInteractive().setScale(buttonScale);
    this.add.text(firerateX, buttonY + labelOffset, 'Upgrade Firerate', {
      font: '32px Arial', fill: '#fff', align: 'center'
    }).setOrigin(0.5);

    const reloadButton = this.add.image(reloadX, buttonY, 'upgrade').setInteractive().setScale(buttonScale);
    this.add.text(reloadX, buttonY + labelOffset, 'Upgrade Reload', {
      font: '32px Arial', fill: '#fff', align: 'center'
    }).setOrigin(0.5);

    const sprayButton = this.add.image(sprayX, buttonY, 'upgrade').setInteractive().setScale(buttonScale);
    this.add.text(sprayX, buttonY + labelOffset, 'Upgrade Spray', {
      font: '32px Arial', fill: '#fff', align: 'center'
    }).setOrigin(0.5);

    const ammoButton = this.add.image(ammoX, buttonY, 'upgrade').setInteractive().setScale(buttonScale);
    this.add.text(ammoX, buttonY + labelOffset, 'Upgrade Ammo', {
      font: '32px Arial', fill: '#fff', align: 'center'
    }).setOrigin(0.5);

    sprayButton.on('pointerdown', () => {
      // Access GameScene and set spray to 0
      const gameScene = this.scene.get('gameScene');
      if (gameScene.bulletSprayLeft < 0 || gameScene.bulletSprayRight > 0) {
        gameScene.bulletSprayLeft = gameScene.bulletSprayLeft + 1;
        gameScene.bulletSprayRight = gameScene.bulletSprayRight - 1;
      } else {
        // Show maxed particle effect
        const particle = this.add.image(sprayX, buttonY, 'maxedParticle').setScale(0.5);
        this.tweens.add({
          targets: particle,
          y: buttonY - 80,
          alpha: 0,
          duration: 1200,
          ease: 'Cubic.easeOut',
          onComplete: () => particle.destroy()
        });
      }
    });

    ammoButton.on('pointerdown', () => {
      // Access GameScene and increase ammo
      const gameScene = this.scene.get('gameScene');
      if (gameScene) {
        if (gameScene.reloadingAmmo === 6) {
          gameScene.reloadingAmmo = 15;
          gameScene.ammo = 15;
        } else if (gameScene.reloadingAmmo === 15) {
          gameScene.reloadingAmmo = 30;
          gameScene.ammo = 30;
        } else if (gameScene.reloadingAmmo === 30) {
          gameScene.reloadingAmmo = 100;
          gameScene.ammo = 100;
        } else if (gameScene.reloadingAmmo === 100) {
          gameScene.reloadingAmmo = 1000;
          gameScene.ammo = 1000;
        } else {
          // Show maxed particle effect
          const particle = this.add.image(ammoX, buttonY, 'maxedParticle').setScale(0.5);
          this.tweens.add({
            targets: particle,
            y: buttonY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => particle.destroy()
          });
        }
      }
    });

    reloadButton.on('pointerdown', () => {
      // Access GameScene and decrease reload time
      const gameScene = this.scene.get('gameScene');
      if (gameScene) {
        if (gameScene.reloadTime === 3000) {
          gameScene.reloadTime = 2250;
        } else if (gameScene.reloadTime === 2250) {
          gameScene.reloadTime = 1500;
        } else if (gameScene.reloadTime === 1500) {
          gameScene.reloadTime = 750;
        } else if (gameScene.reloadTime === 750) {
          gameScene.reloadTime = 250;
        } else {
          // Show maxed particle effect
          const particle = this.add.image(reloadX, buttonY, 'maxedParticle').setScale(0.5);
          this.tweens.add({
            targets: particle,
            y: buttonY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => particle.destroy()
          });
        }
      }
    });

    firerateButton.on('pointerdown', () => {
      // Access GameScene and increase firerate
      const gameScene = this.scene.get('gameScene');
      if (gameScene) {
        if (gameScene.firerate === 100) {
          gameScene.firerate = 80;
        } else if (gameScene.firerate === 80) {
          gameScene.firerate = 60;
        } else if (gameScene.firerate === 60) {
          gameScene.firerate = 40;
        } else if (gameScene.firerate === 40) {
          gameScene.firerate = 20;
        } else {
          // Show maxed particle effect
          const particle = this.add.image(firerateX, buttonY, 'maxedParticle').setScale(0.5);
          this.tweens.add({
            targets: particle,
            y: buttonY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => particle.destroy()
          });
        }
      }
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.upgradeLevel++;
      this.upgradeText.setText('Upgrade Gun\nCurrent Level: ' + this.upgradeLevel);
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.switch('gameScene');
    });
  }
}


export default UpgradeScene
