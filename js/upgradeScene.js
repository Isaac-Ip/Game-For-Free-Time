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
    this.failedParticle = null;
    this.successParticle = null;
    this.unaffordableParticle = null;
    this.chances = 0;
  }

  preload() {
    this.load.image('upgrade', './assets/upgrade.png')
    this.load.image('maxedParticle', './assets/maxed-particle.png')
    this.load.image('failedParticle', './assets/failed-particle.png')
    this.load.image('successParticle', './assets/success-particle.png')
    this.load.image('unaffordableParticle', './assets/unaffordable-particle.png')
  }

  create() {
    // Show bolts count from gameScene
    const gameScene = this.scene.get('gameScene');
    this.boltText = this.add.text(1920 / 2, 1080 / 2 - 160, '', {
      font: '32px Arial', fill: '#fff', align: 'center'
    }).setOrigin(0.5);
    this.updateBoltText = () => {
      this.boltText.setText('Bolts: ' + (gameScene ? gameScene.bolts : 0));
    };
    this.updateBoltText();
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
      // Always get gameScene reference first
      const gameScene = this.scene.get('gameScene');
      if (gameScene.bolts < 50) {
        const unaffordable = this.add.image(sprayX, buttonY, 'unaffordableParticle').setScale(0.5);
        this.tweens.add({
          targets: unaffordable,
          y: buttonY - 80,
          alpha: 0,
          duration: 1200,
          ease: 'Cubic.easeOut',
          onComplete: () => unaffordable.destroy()
        });
        return;
      }
      if (gameScene.bulletSprayLeft < 0 || gameScene.bulletSprayRight > 0) {
        this.chances = Phaser.Math.Between(1, 2);
        if (this.chances === 1) {
          gameScene.bulletSprayLeft = gameScene.bulletSprayLeft + 1;
          gameScene.bulletSprayRight = gameScene.bulletSprayRight - 1;
          gameScene.bolts -= 50;
          this.updateBoltText();
          const successful = this.add.image(sprayX, buttonY, 'successParticle').setScale(0.5);
          this.tweens.add({
            targets: successful,
            y: buttonY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => successful.destroy()
          });
        } else {
          const failed = this.add.image(sprayX, buttonY, 'failedParticle').setScale(0.5);
          this.tweens.add({
            targets: failed,
            y: buttonY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => failed.destroy()
          });
        }
      } else {
        // Show maxed particle effect
        const maxed = this.add.image(sprayX, buttonY, 'maxedParticle').setScale(0.5);
        this.tweens.add({
          targets: maxed,
          y: buttonY - 80,
          alpha: 0,
          duration: 1200,
          ease: 'Cubic.easeOut',
          onComplete: () => maxed.destroy()
        });
      }
    });

    ammoButton.on('pointerdown', () => {
      // Always get gameScene reference first
      const gameScene = this.scene.get('gameScene');
      if (gameScene.bolts < 50) {
        const unaffordable = this.add.image(ammoX, buttonY, 'unaffordableParticle').setScale(0.5);
        this.tweens.add({
          targets: unaffordable,
          y: buttonY - 80,
          alpha: 0,
          duration: 1200,
          ease: 'Cubic.easeOut',
          onComplete: () => unaffordable.destroy()
        });
        return;
      }
      if (gameScene.reloadingAmmo === 6 || gameScene.reloadingAmmo === 15 || gameScene.reloadingAmmo === 30 || gameScene.reloadingAmmo === 100) {
        this.chances = Phaser.Math.Between(1, 2);
        if (this.chances === 1) {
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
          }
          gameScene.bolts -= 50;
          this.updateBoltText();
          const successful = this.add.image(ammoX, buttonY, 'successParticle').setScale(0.5);
          this.tweens.add({
            targets: successful,
            y: buttonY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => successful.destroy()
          });
        } else {
          const failed = this.add.image(ammoX, buttonY, 'failedParticle').setScale(0.5);
          this.tweens.add({
            targets: failed,
            y: buttonY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => failed.destroy()
          });
        }
      } else {
        // Show maxed particle effect
        const maxed = this.add.image(ammoX, buttonY, 'maxedParticle').setScale(0.5);
        this.tweens.add({
          targets: maxed,
          y: buttonY - 80,
          alpha: 0,
          duration: 1200,
          ease: 'Cubic.easeOut',
          onComplete: () => maxed.destroy()
        });
      }
    });

    reloadButton.on('pointerdown', () => {
      // Always get gameScene reference first
      const gameScene = this.scene.get('gameScene');
      if (gameScene.bolts < 50) {
        const unaffordable = this.add.image(reloadX, buttonY, 'unaffordableParticle').setScale(0.5);
        this.tweens.add({
          targets: unaffordable,
          y: buttonY - 80,
          alpha: 0,
          duration: 1200,
          ease: 'Cubic.easeOut',
          onComplete: () => unaffordable.destroy()
        });
        return;
      }
      // Access GameScene and decrease reload time
      if (gameScene.reloadTime === 3000 || gameScene.reloadTime === 2250 || gameScene.reloadTime === 1500 || gameScene.reloadTime === 750) {
        this.chances = Phaser.Math.Between(1, 2);
        if (this.chances === 1) {
          if (gameScene.reloadTime === 3000) {
            gameScene.reloadTime = 2250;
          } else if (gameScene.reloadTime === 2250) {
            gameScene.reloadTime = 1500;
          } else if (gameScene.reloadTime === 1500) {
            gameScene.reloadTime = 750;
          } else if (gameScene.reloadTime === 750) {
            gameScene.reloadTime = 250;
          }
          gameScene.bolts -= 50;
          this.updateBoltText();
          const successful = this.add.image(reloadX, buttonY, 'successParticle').setScale(0.5);
          this.tweens.add({
            targets: successful,
            y: buttonY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => successful.destroy()
          });
        } else {
          const failed = this.add.image(reloadX, buttonY, 'failedParticle').setScale(0.5);
          this.tweens.add({
            targets: failed,
            y: buttonY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => failed.destroy()
          });
        }
      } else {
        // Show maxed particle effect
        const maxed = this.add.image(reloadX, buttonY, 'maxedParticle').setScale(0.5);
        this.tweens.add({
          targets: maxed,
          y: buttonY - 80,
          alpha: 0,
          duration: 1200,
          ease: 'Cubic.easeOut',
          onComplete: () => maxed.destroy()
        });
      }
    });

    firerateButton.on('pointerdown', () => {
      // Always get gameScene reference first
      const gameScene = this.scene.get('gameScene');
      if (gameScene.bolts < 50) {
        const unaffordable = this.add.image(firerateX, buttonY, 'unaffordableParticle').setScale(0.5);
        this.tweens.add({
          targets: unaffordable,
          y: buttonY - 80,
          alpha: 0,
          duration: 1200,
          ease: 'Cubic.easeOut',
          onComplete: () => unaffordable.destroy()
        });
        return;
      }
      // Access GameScene and increase firerate
      if (gameScene.firerate === 100 || gameScene.firerate === 80 || gameScene.firerate === 60 || gameScene.firerate === 40) {
        this.chances = Phaser.Math.Between(1, 2);
        if (this.chances === 1) {
          if (gameScene.firerate === 100) {
            gameScene.firerate = 80;
          } else if (gameScene.firerate === 80) {
            gameScene.firerate = 60;
          } else if (gameScene.firerate === 60) {
            gameScene.firerate = 40;
          } else if (gameScene.firerate === 40) {
            gameScene.firerate = 20;
          }
          gameScene.bolts -= 50;
          this.updateBoltText();
          const successful = this.add.image(firerateX, buttonY, 'successParticle').setScale(0.5);
          this.tweens.add({
            targets: successful,
            y: buttonY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => successful.destroy()
          });
        } else {
          const failed = this.add.image(firerateX, buttonY, 'failedParticle').setScale(0.5);
          this.tweens.add({
            targets: failed,
            y: buttonY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => failed.destroy()
          });
        }
      } else {
        // Show maxed particle effect
        const maxed = this.add.image(firerateX, buttonY, 'maxedParticle').setScale(0.5);
        this.tweens.add({
          targets: maxed,
          y: buttonY - 80,
          alpha: 0,
          duration: 1200,
          ease: 'Cubic.easeOut',
          onComplete: () => maxed.destroy()
        });
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

  update(time, delta) {
    if (this.updateBoltText) {
      this.updateBoltText();
    }
  }
}


export default UpgradeScene
