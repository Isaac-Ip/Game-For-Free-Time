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

  create(data) {
    // Show bolts count from gameScene
    const gameScene = this.scene.get('gameScene');
    this.boltText = this.add.text(1920 / 2, 1080 / 2 - 260, '', {
      font: '32px Arial', fill: '#fff', align: 'center'
    }).setOrigin(0.5);
    this.updateBoltText = () => {
      this.boltText.setText('Bolts: ' + (gameScene ? gameScene.bolts : 0));
    };
    this.updateBoltText();
    this.cameras.main.setBackgroundColor('#222222');
    this.upgradeText = this.add.text(1920 / 2, 1080 / 2 - 200, 'Upgrade Gun', {
      font: '48px Arial',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Four evenly spaced upgrade buttons in a row
    const screenWidth = 1920;
    const buttonY = 1080 / 2;
    const labelOffset = 70;
    const buttonSpacing = screenWidth / 6;
    const buttonScale = 0.5;

    // X positions: 1/6, 2/6, ... of screen width
    const firerateX = buttonSpacing * 1;
    const reloadX = buttonSpacing * 2;
    const sprayX = buttonSpacing * 3;
    const ammoX = buttonSpacing * 4;
    const critX = buttonSpacing * 5;
    const droneDmgX = buttonSpacing * 1.5;
    const splashX = buttonSpacing * 3;
    const droneFirerateX = buttonSpacing * 4.5;
    // Only show drone upgrades for Frank class
    const frankClass = gameScene && gameScene.playerClass === 'frank';

    const firerateButton = this.add.image(firerateX, buttonY, 'upgrade').setInteractive().setScale(buttonScale);
    this.add.text(firerateX, buttonY + labelOffset, 'Upgrade Firerate', {
      font: '32px Arial', fill: '#fff', align: 'center'
    }).setOrigin(0.5);

    // --- Frank-specific upgrades will be placed below base upgrades ---
    // --- Place Frank-specific upgrades below base upgrades ---
    if (frankClass) {
      const frankY = buttonY + 180;
      // Drone Damage Upgrade
      const droneDmgButton = this.add.image(droneDmgX, frankY, 'upgrade').setInteractive().setScale(buttonScale);
      this.add.text(droneDmgX, frankY + labelOffset, 'Upgrade Drone Dmg', {
        font: '32px Arial', fill: '#fff', align: 'center'
      }).setOrigin(0.5);
      droneDmgButton.on('pointerdown', () => {
        if (gameScene.bolts < 50) {
          const unaffordable = this.add.image(droneDmgX, frankY, 'unaffordableParticle').setScale(0.5);
          this.tweens.add({
            targets: unaffordable,
            y: frankY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => unaffordable.destroy()
          });
          return;
        }
        if (gameScene.droneDmg >= 5) {
          const maxed = this.add.image(droneDmgX, frankY, 'maxedParticle').setScale(0.5);
          this.tweens.add({
            targets: maxed,
            y: frankY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => maxed.destroy()
          });
          return;
        }
        gameScene.droneDmg += 1;
        gameScene.bolts -= 50;
        this.updateBoltText();
        const successful = this.add.image(droneDmgX, frankY, 'successParticle').setScale(0.5);
        this.tweens.add({
          targets: successful,
          y: frankY - 80,
          alpha: 0,
          duration: 1200,
          ease: 'Cubic.easeOut',
          onComplete: () => successful.destroy()
        });
      });

      // Splash Drone Upgrade
      const splashBtn = this.add.image(splashX, frankY, 'upgrade').setInteractive().setScale(buttonScale);
      this.add.text(splashX, frankY + labelOffset, 'Activate Splash', {
        font: '32px Arial', fill: '#fff', align: 'center'
      }).setOrigin(0.5);
      splashBtn.on('pointerdown', () => {
        if (gameScene.droneDmg >= 5 && gameScene.droneFirerate <= 100 && gameScene.droneCount >= 8) {
          if (gameScene.bolts < 500) {
            const unaffordable = this.add.image(splashX, frankY, 'unaffordableParticle').setScale(0.5);
            this.tweens.add({
              targets: unaffordable,
              y: frankY - 80,
              alpha: 0,
              duration: 1200,
              ease: 'Cubic.easeOut',
              onComplete: () => unaffordable.destroy()
            });
            return;
          }
          if (gameScene.splashDroneUpgrade) {
            const maxed = this.add.image(splashX, frankY, 'maxedParticle').setScale(0.5);
            this.tweens.add({
              targets: maxed,
              y: frankY - 80,
              alpha: 0,
              duration: 1200,
              ease: 'Cubic.easeOut',
              onComplete: () => maxed.destroy()
            });
            return;
          }
          gameScene.splashDroneUpgrade = true;
          if (gameScene.drones) {
            gameScene.drones.forEach(drone => {
              drone.setTexture('splash-drone');
            });
          }
          gameScene.bolts -= 500;
          this.updateBoltText();
          const successful = this.add.image(splashX, frankY, 'successParticle').setScale(0.5);
          this.tweens.add({
            targets: successful,
            y: frankY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => successful.destroy()
          });
          splashBtn.disableInteractive();
        }
        // Do nothing if requirements are not met
      });

      // Drone Firerate Upgrade
      const droneFirerateButton = this.add.image(droneFirerateX, frankY, 'upgrade').setInteractive().setScale(buttonScale);
      this.add.text(droneFirerateX, frankY + labelOffset, 'Upgrade Drone Firerate', {
        font: '32px Arial', fill: '#fff', align: 'center'
      }).setOrigin(0.5);
      droneFirerateButton.on('pointerdown', () => {
        if (gameScene.bolts < 50) {
          const unaffordable = this.add.image(droneFirerateX, frankY, 'unaffordableParticle').setScale(0.5);
          this.tweens.add({
            targets: unaffordable,
            y: frankY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => unaffordable.destroy()
          });
          return;
        }
        if (gameScene.droneFirerate <= 100) {
          const maxed = this.add.image(droneFirerateX, frankY, 'maxedParticle').setScale(0.5);
          this.tweens.add({
            targets: maxed,
            y: frankY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => maxed.destroy()
          });
          return;
        }
        gameScene.droneFirerate -= 180;
        gameScene.bolts -= 50;
        this.updateBoltText();
        const successful = this.add.image(droneFirerateX, frankY, 'successParticle').setScale(0.5);
        this.tweens.add({
          targets: successful,
          y: frankY - 80,
          alpha: 0,
          duration: 1200,
          ease: 'Cubic.easeOut',
          onComplete: () => successful.destroy()
        });
      });

      // Drone Count Upgrade (up to 8)
      const droneCountX = (droneDmgX + droneFirerateX) / 2;
      const droneCountButton = this.add.image(droneCountX, frankY + 180, 'upgrade').setInteractive().setScale(buttonScale);
      this.add.text(droneCountX, frankY + labelOffset + 180, 'Upgrade Drone Count', {
        font: '32px Arial', fill: '#fff', align: 'center'
      }).setOrigin(0.5);
      droneCountButton.on('pointerdown', () => {
        if (gameScene.bolts < 100) {
          const unaffordable = this.add.image(droneCountX, frankY + 120, 'unaffordableParticle').setScale(0.5);
          this.tweens.add({
            targets: unaffordable,
            y: frankY + 40,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => unaffordable.destroy()
          });
          return;
        }
        if (!gameScene.droneCount) gameScene.droneCount = 2;
        if (gameScene.droneCount >= 8) {
          const maxed = this.add.image(droneCountX, frankY + 120, 'maxedParticle').setScale(0.5);
          this.tweens.add({
            targets: maxed,
            y: frankY + 40,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => maxed.destroy()
          });
          return;
        }
        gameScene.droneCount += 1;
        gameScene.bolts -= 100;
        this.updateBoltText();
        const successful = this.add.image(droneCountX, frankY + 120, 'successParticle').setScale(0.5);
        this.tweens.add({
          targets: successful,
          y: frankY + 40,
          alpha: 0,
          duration: 1200,
          ease: 'Cubic.easeOut',
          onComplete: () => successful.destroy()
        });
      });
    }

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

    const critButton = this.add.image(critX, buttonY, 'upgrade').setInteractive().setScale(buttonScale);
    this.add.text(critX, buttonY + labelOffset, 'Upgrade Crit', {
      font: '32px Arial', fill: '#fff', align: 'center'
    }).setOrigin(0.5);

    // --- Brice-specific upgrades below base upgrades ---
    const briceClass = gameScene && gameScene.playerClass === 'brice';
    if (briceClass) {
      const briceY = buttonY + 180;
      // Healing Upgrade
      const healX = buttonSpacing * 2.5;
      const healBtn = this.add.image(healX, briceY, 'upgrade').setInteractive().setScale(buttonScale);
      this.add.text(healX, briceY + labelOffset, 'Upgrade Healing', {
        font: '32px Arial', fill: '#fff', align: 'center'
      }).setOrigin(0.5);
      healBtn.on('pointerdown', () => {
        if (gameScene.bolts < 75) {
          const unaffordable = this.add.image(healX, briceY, 'unaffordableParticle').setScale(0.5);
          this.tweens.add({
            targets: unaffordable,
            y: briceY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => unaffordable.destroy()
          });
          return;
        }
        if (!gameScene.briceRegen) gameScene.briceRegen = 0;
        if (gameScene.briceRegen >= 5) {
          const maxed = this.add.image(healX, briceY, 'maxedParticle').setScale(0.5);
          this.tweens.add({
            targets: maxed,
            y: briceY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => maxed.destroy()
          });
          return;
        }
        gameScene.briceRegen += 1;
        gameScene.bolts -= 75;
        this.updateBoltText();
        const successful = this.add.image(healX, briceY, 'successParticle').setScale(0.5);
        this.tweens.add({
          targets: successful,
          y: briceY - 80,
          alpha: 0,
          duration: 1200,
          ease: 'Cubic.easeOut',
          onComplete: () => successful.destroy()
        });
      });
      // Defense Upgrade
      const defX = buttonSpacing * 3.5;
      const defBtn = this.add.image(defX, briceY, 'upgrade').setInteractive().setScale(buttonScale);
      this.add.text(defX, briceY + labelOffset, 'Upgrade Defence', {
        font: '32px Arial', fill: '#fff', align: 'center'
      }).setOrigin(0.5);
      defBtn.on('pointerdown', () => {
        if (gameScene.bolts < 75) {
          const unaffordable = this.add.image(defX, briceY, 'unaffordableParticle').setScale(0.5);
          this.tweens.add({
            targets: unaffordable,
            y: briceY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => unaffordable.destroy()
          });
          return;
        }
        if (!gameScene.briceDef) gameScene.briceDef = 0;
        if (gameScene.briceDef >= 5) {
          const maxed = this.add.image(defX, briceY, 'maxedParticle').setScale(0.5);
          this.tweens.add({
            targets: maxed,
            y: briceY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => maxed.destroy()
          });
          return;
        }
        gameScene.briceDef += 1;
        gameScene.bolts -= 75;
        this.updateBoltText();
        const successful = this.add.image(defX, briceY, 'successParticle').setScale(0.5);
        this.tweens.add({
          targets: successful,
          y: briceY - 80,
          alpha: 0,
          duration: 1200,
          ease: 'Cubic.easeOut',
          onComplete: () => successful.destroy()
        });
      });
    }

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
          gameScene.bolts -= 50;
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
          gameScene.bolts -= 50;
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
          gameScene.bolts -= 50;
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
          gameScene.bolts -= 50;
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

    critButton.on('pointerdown', () => {
      // Always get gameScene reference first
      const gameScene = this.scene.get('gameScene');
      if (gameScene.bolts < 50) {
        const unaffordable = this.add.image(critX, buttonY, 'unaffordableParticle').setScale(0.5);
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
      // Access GameScene and increase crit chance
      if (gameScene.crit === 5 || gameScene.crit === 10 || gameScene.crit === 15 || gameScene.crit === 20) {
        this.chances = Phaser.Math.Between(1, 2);
        if (this.chances === 1) {
          if (gameScene.crit === 5) {
            gameScene.crit = 10;
          } else if (gameScene.crit === 10) {
            gameScene.crit = 15;
          } else if (gameScene.crit === 15) {
            gameScene.crit = 20;
          } else if (gameScene.crit === 20) {
            gameScene.crit = 30;
          }
          gameScene.bolts -= 50;
          this.updateBoltText();
          const successful = this.add.image(critX, buttonY, 'successParticle').setScale(0.5);
          this.tweens.add({
            targets: successful,
            y: buttonY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => successful.destroy()
          });
        } else {
          const failed = this.add.image(critX, buttonY, 'failedParticle').setScale(0.5);
          gameScene.bolts -= 50;
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
        const maxed = this.add.image(critX, buttonY, 'maxedParticle').setScale(0.5);
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

    // Add Splash Drone Upgrade button for Frank if not already active and all drone upgrades are maxed
    critButton.on('pointerdown', () => {
      // Always get gameScene reference first
      const gameScene = this.scene.get('gameScene');
      if (gameScene.bolts < 50) {
        const unaffordable = this.add.image(critX, buttonY, 'unaffordableParticle').setScale(0.5);
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
      // Access GameScene and increase crit chance
      if (gameScene.crit === 5 || gameScene.crit === 10 || gameScene.crit === 15 || gameScene.crit === 20) {
        this.chances = Phaser.Math.Between(1, 2);
        if (this.chances === 1) {
          if (gameScene.crit === 5) {
            gameScene.crit = 10;
          } else if (gameScene.crit === 10) {
            gameScene.crit = 15;
          } else if (gameScene.crit === 15) {
            gameScene.crit = 20;
          } else if (gameScene.crit === 20) {
            gameScene.crit = 30;
          }
          gameScene.bolts -= 50;
          this.updateBoltText();
          const successful = this.add.image(critX, buttonY, 'successParticle').setScale(0.5);
          this.tweens.add({
            targets: successful,
            y: buttonY - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => successful.destroy()
          });
        } else {
          const failed = this.add.image(critX, buttonY, 'failedParticle').setScale(0.5);
          gameScene.bolts -= 50;
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
        const maxed = this.add.image(critX, buttonY, 'maxedParticle').setScale(0.5);
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

