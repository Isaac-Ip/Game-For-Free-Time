/* global Phaser */

// classScene.js - Player class selection scene

class ClassScene extends Phaser.Scene {
  constructor() {
    super({ key: 'classScene' });
  }

  preload() {
    // Optionally load any assets for class selection UI or previews
  }

  create() {
    this.cameras.main.setBackgroundColor('#222');
    this.add.text(960, 100, 'Choose Your Class', { font: '64px Arial', fill: '#fff' }).setOrigin(0.5);

    let startY = 300;
    const gap = 25;

    // Normal class button
    const normalBtn = this.add.text(960, startY, 'Normal', { font: '48px Arial', fill: '#fff', backgroundColor: '#444' })
      .setOrigin(0.5)
      .setInteractive();
    normalBtn.on('pointerdown', () => {
      this.scene.start('gameScene', { playerClass: 'normal' });
    });

    // Frank class button (password protected)
    const frankBtn = this.add.text(960, startY += 48 + gap, 'Frank (2 Drones)', { font: '48px Arial', fill: '#fff', backgroundColor: '#444' })
      .setOrigin(0.5)
      .setInteractive();
    frankBtn.on('pointerdown', () => {
      this.getPassword('Enter password for Frank:', (pw) => {
        if (pw === 'frankpass') {
          this.scene.start('gameScene', { playerClass: 'frank' });
        } else {
          this.showError('Incorrect password!');
        }
      });
    });

    // Brice class button (password protected)
    const briceBtn = this.add.text(960, startY += 48 + gap, 'Brice (Big, 200 HP)', { font: '48px Arial', fill: '#fff', backgroundColor: '#444' })
      .setOrigin(0.5)
      .setInteractive();
    briceBtn.on('pointerdown', () => {
      this.getPassword('Enter password for Brice:', (pw) => {
        if (pw === 'bricepass') {
          this.scene.start('gameScene', { playerClass: 'brice' });
        } else {
          this.showError('Incorrect password!');
        }
      });
    });

    // Tracker class button
    const trackerBtn = this.add.text(960, startY += 48 + gap, 'Tracker (Homing Bullets)', { font: '48px Arial', fill: '#fff', backgroundColor: '#444' })
      .setOrigin(0.5)
      .setInteractive();
    trackerBtn.on('pointerdown', () => {
      this.scene.start('gameScene', { playerClass: 'tracker' });
    });

    // Brokie class button
    const brokieBtn = this.add.text(960, startY += 48 + gap, 'Brokie (Double Bolts)', { font: '48px Arial', fill: '#fff', backgroundColor: '#444' })
      .setOrigin(0.5)
      .setInteractive();
    brokieBtn.on('pointerdown', () => {
      this.scene.start('gameScene', { playerClass: 'brokie' });
    });

    // Hunter class button
    const hunterBtn = this.add.text(960, startY += 48 + gap, 'Hunter (Double Dmg)', { font: '48px Arial', fill: '#fff', backgroundColor: '#444' })
      .setOrigin(0.5)
      .setInteractive();
    hunterBtn.on('pointerdown', () => {
      this.scene.start('gameScene', { playerClass: 'hunter' });
    });

    // Arsonist class button
    const arsonistBtn = this.add.text(960, startY += 48 + gap, 'Arsonist (Orbiting Flames)', { font: '48px Arial', fill: '#fff', backgroundColor: '#444' })
      .setOrigin(0.5)
      .setInteractive();
    arsonistBtn.on('pointerdown', () => {
      this.getPassword('Enter password for Arsonist:', (pw) => {
        if (pw === 'pyropass') {
          this.scene.start('gameScene', { playerClass: 'arsonist' });
        } else {
          this.showError('Incorrect password!');
        }
      });
    });

    // Demoman class button
    const demomanBtn = this.add.text(960, startY += 48 + gap, 'Demoman (Throws Grenade on Right Click)', { font: '48px Arial', fill: '#fff', backgroundColor: '#444' })
      .setOrigin(0.5)
      .setInteractive();
    demomanBtn.on('pointerdown', () => {
      this.scene.start('gameScene', { playerClass: 'demoman' });
    });

    // Controller class button
    const controllerBtn = this.add.text(960, startY += 48 + gap, 'Controller (Aura & Aurawave)', { font: '48px Arial', fill: '#fff', backgroundColor: '#444' })
      .setOrigin(0.5)
      .setInteractive();
    controllerBtn.on('pointerdown', () => {
      this.getPassword('Enter password for Controller:', (pw) => {
        if (pw === 'idk') {
          this.scene.start('gameScene', { playerClass: 'controller' });
        } else {
          this.showError('Incorrect password!');
        }
      });
    });

    // Add "Builder" class button/option
    const builderButton = this.add.text(960, startY += 48 + gap, 'Builder', {
      font: '48px Arial',
      fill: '#ffcc00',
      align: 'center',
      backgroundColor: '#333'
    }).setOrigin(0.5, 0.5).setInteractive();

    builderButton.on('pointerdown', () => {
      this.scene.start('gameScene', { playerClass: 'builder' });
    });
  }




  // Helper to prompt for password (uses browser prompt)
  getPassword(promptText, callback) {
    const pw = window.prompt(promptText);
    callback(pw);
  }

  // Helper to show error (simple alert)
  showError(msg) {
    window.alert(msg);
  }

}

export default ClassScene;
