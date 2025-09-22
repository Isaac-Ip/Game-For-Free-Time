/* global Phaser */

// Copyright (c) 2025 Isaac Ip All rights reserved
//
// Created by: Isaac Ip
// Created on: Apr 2025
// This is the Game Scene

/**
 * This class is the Game Scene.
 */
class GameScene extends Phaser.Scene {
  bolts = 0;
  createEnemy() {
    // Spawn enemy at a random position within the game bounds, not at the player's position
    const enemyXLocation = Math.floor(Math.random() * 1920) + 1;
    let enemyXVelocity = Math.floor(Math.random() * 5) + 1; // Lower velocity for Matter.js
    enemyXVelocity *= Math.round(Math.random()) ? 1 : -1;
    const anEnemy = this.matter.add.sprite(enemyXLocation, 100, "enemy");
    anEnemy.setScale(0.5);
    anEnemy.setBody({ type: 'rectangle', width: anEnemy.width * 0.5, height: anEnemy.height * 0.5 });
    anEnemy.setVelocity(enemyXVelocity, 2); // Set initial velocity using Matter.js
    anEnemy.setIgnoreGravity(true); // If you want enemies to move only by velocity
    anEnemy.isEnemy = true;
    anEnemy.hp = 5; // Add HP property
    this.enemyGroup.push(anEnemy);
  }
  /**
   * This method is the constructor.
   */
  constructor() {
    super({ key: 'gameScene' })

    this.GameSceneBackgroundImage = null;
    this.player = null;
    this.playerReload = null;
    this.enemy = null;
    this.enemyHurt = null;
    this.bullet = null;
    this.bulletGroup = [];
    this.enemyGroup = [];
    this.bloodstain = null;
    this.bloodstainQueue = [];
  }

  /**
   * Can be defined on your own Scenes.
   * This method is called by the Scene Manager when the scene starts,
   * before preload() and create().
   * @param {object} data Any data passed via ScenePlugin.add() or ScenePlugin.start().
   */
  init(data) {
    this.cameras.main.setBackgroundColor('#d06a16ff')
    this.bulletSprayLeft = -10;
    this.bulletSprayRight = 10;
    this.ammo = 6;
    this.reloadingAmmo = 6;
    this.firerate = 100;
    this.reloadTime = 3000;
    this.bolts = 0;
  }

  /**
   * Can be defined on your own Scenes.
   * Use it to load assets.
   */
  preload() {
    console.log('Game Scene preload')
    this.load.image('gameSceneBackground', './assets/gameplay-scene.png')
    this.load.image('player', './assets/player.png')
    this.load.image('player-reload', './assets/player-reload.png')
    this.load.image('enemy', './assets/zombie.png')
    this.load.image('enemy-hurt', './assets/zombie-hurt.png')
    this.load.image('bullet', './assets/bullet.png')
    this.load.image('bloodstain', './assets/bloodstain.png')
    this.load.on('loaderror', (file) => {
      console.error('Failed to load asset:', file.src);
    });
  }

  /**
   * Can be defined on your own Scenes.
   * Use it to create your game objects.
   * @param {object} data Any data passed via ScenePlugin.add() or ScenePlugin.start().
   */
  create(data) {
    console.log('Game Scene create')
    this.cameras.main.setBackgroundColor('#222');
    this.background = this.add.sprite(0, 0, 'gameSceneBackground');
    this.background.x = 1920 / 2;
    this.background.y = 1080 / 2;
    console.log('Background sprite created:', this.background);

    // Display bolts count in top left
    this.boltText = this.add.text(32, 32, '', {
      font: '64px Arial', fill: '#fff', align: 'left'
    }).setOrigin(0, 0);
    this.updateBoltText = () => {
      this.boltText.setText('Bolts: ' + this.bolts);
    };

    // Display player HP in bottom left
    this.hpText = this.add.text(32, 1080 - 64, '', {
      font: '64px Arial', fill: '#fff', align: 'left'
    }).setOrigin(0, 0);
    this.updateHpText = () => {
      this.hpText.setText('HP: ' + (this.player && typeof this.player.hp !== 'undefined' ? this.player.hp : 0));
    };

    this.player = this.matter.add.sprite(1920 / 2, 1080 / 2, 'player');
    this.player.setScale(0.5);
    this.player.setOrigin(0.5);
    this.player.setBody({ type: 'rectangle', width: this.player.width * 0.5, height: this.player.height * 0.5 });
    this.player.hp = 3;
    console.log('Player sprite created:', this.player);
    this.isReloadingTexture = false;

    this.updateHpText();

    this.bulletGroup = [];
    this.enemyGroup = [];
    this.createEnemy();
    console.log('Enemy group after first spawn:', this.enemyGroup);

    // Matter.js collision event
    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach((pair) => {
        const objA = pair.bodyA.gameObject;
        const objB = pair.bodyB.gameObject;
        if (!objA || !objB) return;
        // Bullet/enemy collision
        if ((objA.isBullet && objB.isEnemy) || (objB.isBullet && objA.isEnemy)) {
          const bullet = objA.isBullet ? objA : objB;
          const enemy = objA.isEnemy ? objA : objB;
          // Damage enemy
          enemy.hp = (enemy.hp || 1) - 1;
          this.bulletGroup = this.bulletGroup.filter(b => b !== bullet);
          bullet.destroy();
          if (enemy.hp === 2) {
            enemy.setTexture('enemy-hurt');
            enemy.setScale(0.5);
            enemy.setOrigin(0.5);
          }
          if (enemy.hp <= 0) {
            // Capture position BEFORE destroy
            const enemyPos = { x: enemy.x, y: enemy.y };
            this.enemyGroup = this.enemyGroup.filter(e => e !== enemy);
            enemy.destroy();
            // Drop bolts
            const boltsDropped = Phaser.Math.Between(3, 7);
            this.bolts += boltsDropped;
            this.updateBoltText();
            // Optionally show bolt drop effect here
            // Queue bloodstain for next frame
            this.bloodstainQueue.push(enemyPos);
            // 10% chance to spawn 2 enemies
            if (Phaser.Math.Between(1, 10) === 1) {
              this.createEnemy();
              this.createEnemy();
            } else {
              this.createEnemy();
            }
          }
        }
        // Player/enemy collision
        if ((objA === this.player && objB.isEnemy) || (objB === this.player && objA.isEnemy)) {
          const enemy = objA.isEnemy ? objA : objB;
          const enemyPos = { x: enemy.x, y: enemy.y };
          this.enemyGroup = this.enemyGroup.filter(e => e !== enemy);
          enemy.destroy();
          // Queue bloodstain for next frame
          this.bloodstainQueue.push(enemyPos);
          this.createEnemy();
          // Player loses 1 HP
          this.player.hp--;
          if (this.player.hp <= 0) {
            this.scene.start('deathScene');
          }
        }
      });
    });

    // Only block firing, not all input, during reload
    this.isFiringBlocked = false;
    this.input.on('pointerdown', (pointer) => {
      if (this.isFiringBlocked) return;
      // --- Start continuous firing ---
      if (!this.firingInterval && !this.reloading) {
        this.firingInterval = this.time.addEvent({
          delay: this.firerate,
          loop: true,
          callback: () => {
            if (!this.input.activePointer.isDown) {
              this.firingInterval.remove();
              this.firingInterval = null;
              return;
            }
            if (this.reloading) {
              return;
            }
            if (!this.ammo) this.ammo = this.reloadingAmmo;
            this.ammo--;
            const dx = this.input.activePointer.x - this.player.x;
            const dy = this.input.activePointer.y - this.player.y;
            const baseAngle = Math.atan2(dy, dx);
            const spray = Phaser.Math.DegToRad(Phaser.Math.Between(this.bulletSprayLeft, this.bulletSprayRight));
            const angle = baseAngle + spray;

            // Spawn bullet slightly in front of player
            const bulletOffset = 90; // farther in front of player
            const bulletX = this.player.x + Math.cos(angle) * bulletOffset;
            const bulletY = this.player.y + Math.sin(angle) * bulletOffset;
            const bullet = this.matter.add.sprite(bulletX, bulletY, 'bullet');
            bullet.setScale(0.5);
            bullet.setBody({ type: 'rectangle', width: bullet.width * 0.5, height: bullet.height * 0.5 });
            bullet.setIgnoreGravity(true);
            // Set bullet collision filter to avoid player
            bullet.body.collisionFilter.group = -1;
            bullet.isBullet = true;
            this.bulletGroup.push(bullet);

            const bulletSpeed = 30;
            bullet.setVelocity(Math.cos(angle) * bulletSpeed, Math.sin(angle) * bulletSpeed);
            bullet.setRotation(angle);

            if (this.ammo <= 0) {
              this.reloading = true;
              this.isFiringBlocked = true;
              this.firingInterval.remove();
              this.firingInterval = null;
              // Swap player texture to reload
              this.player.setTexture('player-reload');
              this.isReloadingTexture = true;
              this.time.delayedCall(this.reloadTime, () => {
                this.ammo = this.reloadingAmmo;
                this.reloading = false;
                this.player.setTexture('player');
                this.isReloadingTexture = false;
                this.isFiringBlocked = false;
                // If pointer is still down, resume firing
                if (this.input.activePointer.isDown) {
                  this.input.emit('pointerdown', this.input.activePointer);
                }
              });
            }
          }
        });
      }
      // --- End continuous firing ---

      // Stop firing on pointerup
      if (!this.pointerUpListenerAdded) {
        this.input.on('pointerup', () => {
          if (this.firingInterval) {
            this.firingInterval.remove();
            this.firingInterval = null;
          }
        });
        this.pointerUpListenerAdded = true;
      }
    });

  }

  /**
   * Should be overridden by your own Scenes.
   * This method is called once per game step while the scene is running.
   * @param {number} time - The current time.
   * @param {number} delta - The delta time in ms since the last frame.
   */
  update(time, delta) {
    // Update HP display every frame
    if (this.hpText) {
      this.updateHpText();
    }
    // Update bolt count display every frame
    if (this.boltText) {
      this.updateBoltText();
    }
    // Only rotate player to face pointer, do not move player toward pointer
    const pointer = this.input.activePointer;
    const dx = pointer.x - this.player.x;
    const dy = pointer.y - this.player.y;
    const angle = Math.atan2(dy, dx);
    this.player.setRotation(angle);

    const keyUpObj = this.input.keyboard.addKey('W');
    const keyLeftObj = this.input.keyboard.addKey('A');
    const keyRightObj = this.input.keyboard.addKey('D');
    const keyDownObj = this.input.keyboard.addKey('S');
    const keyUpgradeObj = this.input.keyboard.addKey('P');

    let vx = 0, vy = 0;
    if (keyLeftObj.isDown === true) {
      vx -= 15;
    }
    if (keyRightObj.isDown === true) {
      vx += 15;
    }
    if (keyUpObj.isDown === true) {
      vy -= 15;
    }
    if (keyDownObj.isDown === true) {
      vy += 15;
    }
    this.player.setVelocity(vx, vy);

    this.enemyGroup = this.enemyGroup.filter(e => e && !e._destroyed);
    this.bulletGroup = this.bulletGroup.filter(b => b && !b._destroyed);
    this.enemyGroup.forEach((enemy) => {
      if (!enemy || enemy._destroyed) return;
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const angle = Math.atan2(dy, dx);
      enemy.setRotation(angle);
      enemy.setVelocity(Math.cos(angle) * 2, Math.sin(angle) * 2);
    });

    if (keyUpgradeObj.isDown === true) {
      this.scene.switch('upgradeScene');
    }

    // Show bloodstains queued from collision event
    if (this.bloodstainQueue.length > 0) {
      this.bloodstainQueue.forEach(pos => {
        const blood = this.add.sprite(pos.x, pos.y, 'bloodstain');
        blood.setAlpha(1);
        this.tweens.add({
          targets: blood,
          alpha: 0,
          duration: 2000,
          onComplete: () => blood.destroy()
        });
      });
      this.bloodstainQueue = [];
    }
  }

}


export default GameScene
