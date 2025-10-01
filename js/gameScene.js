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
    // 20% chance to spawn armored zombie
    const isArmored = Phaser.Math.Between(1, 100) <= 20;
    const enemyXLocation = Math.floor(Math.random() * 1920) + 1;
    let enemyXVelocity = Math.floor(Math.random() * 5) + 1;
    enemyXVelocity *= Math.round(Math.random()) ? 1 : -1;
    let anEnemy;
    if (isArmored) {
      anEnemy = this.matter.add.sprite(enemyXLocation, 100, "armored-enemy");
      anEnemy.setScale(0.55);
      anEnemy.setBody({ type: 'rectangle', width: anEnemy.width * 0.5, height: anEnemy.height * 0.5 });
      anEnemy.setVelocity(enemyXVelocity, 2);
      anEnemy.setIgnoreGravity(true);
      anEnemy.isEnemy = true;
      anEnemy.isArmored = true;
      anEnemy.hp = 15;
      anEnemy.body.collisionFilter.category = 0x0002; // Enemy category
    } else {
      anEnemy = this.matter.add.sprite(enemyXLocation, 100, "enemy");
      anEnemy.setScale(0.5);
      anEnemy.setBody({ type: 'rectangle', width: anEnemy.width * 0.5, height: anEnemy.height * 0.5 });
      anEnemy.setVelocity(enemyXVelocity, 2);
      anEnemy.setIgnoreGravity(true);
      anEnemy.isEnemy = true;
      anEnemy.isArmored = false;
      anEnemy.hp = 5;
      anEnemy.body.collisionFilter.category = 0x0002; // Enemy category
    }
    this.enemyGroup.push(anEnemy);
  }
  /**
   * This method is the constructor.
   */
  constructor() {
    super({ key: 'gameScene' })

    this.GameSceneBackgroundImage = null;
    this.player = null;
    this.frankPlayer = null;
    this.playerReload = null;
    this.frankPlayerReload = null;
    this.enemy = null;
    this.enemyHurt = null;
    this.armoredEnemy = null;
    this.armoredEnemyHurt = null;
    this.bullet = null;
    this.critBullet = null;
    this.flame = null;
    this.bulletGroup = [];
    this.enemyGroup = [];
    this.grenade = null;
    this.bloodstain = null;
    this.bloodstainQueue = [];
    this.droneDmg = 1; // Drone upgrade damage
    this.droneFirerate = 1000; // ms between shots
    this.droneUpgrade = 0;
    this.splashDrone = null;
    this.explode = null;
    this.critParticle = null;
    // Brice class: healing and defense upgrades
    this.briceRegen = 0;
    this.briceDef = 0;
    this.lastBriceRegen = 0;
    this.splashDroneUpgrade = false; // Track if splash drone upgrade is active
    // Controller class aura/aurawave
    this.controllerAura = null;
    this.controllerAuraRadius = 250 * 1.5; // 1.5x bigger
    this.controllerAuraDamageTimer = 0;
    this.controllerAurawaveTimer = 0;
    this.controllerAurawaves = [];
    this.wallGroup = [];
    // Wall duration upgrade state
    this.wallDurationUpgrade = 0; // 0: 5s, 1: 10s, 2: 30s, 3: 60s, 4: forever
    this.wallDurations = [5000, 10000, 30000, 60000, -1];
    this.wallUpgradeButton = null;
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
    this.bolts = 100000;
    this.crit = 5;
    this.drone = null;
    this.droneBullet = null;
    this.droneDmg = 1;
    this.droneFirerate = 1000;
    this.droneSplash = 0;
    this.duration = 5000;
  }

  /**
   * Can be defined on your own Scenes.
   * Use it to load assets.
   */
  preload() {
    console.log('Game Scene preload')
    this.load.image('game-scene-background', './assets/gameplay-scene.png')
    this.load.image('player', './assets/player.png')
    this.load.image('frank-player', './assets/frank-player.png')
    this.load.image('player-reload', './assets/player-reload.png')
    this.load.image('frank-player-reload', './assets/frank-player-reload.png')
    this.load.image('enemy', './assets/zombie.png')
    this.load.image('enemy-hurt', './assets/zombie-hurt.png')
    this.load.image('armored-enemy-hurt', './assets/armored-zombie-hurt.png')
    this.load.image('armored-enemy', './assets/armored-zombie.png')
    this.load.image('bullet', './assets/bullet.png')
    this.load.image('grenade', './assets/grenade.png')
    this.load.image('flame', './assets/flame.png')
    this.load.image('bloodstain', './assets/bloodstain.png')
    this.load.image('crit-particle', './assets/crit-particle.png')
    this.load.image('crit-bullet', './assets/crit-bullet.png')
    this.load.image('drone', './assets/drone.png')
    this.load.image('drone-bullet', './assets/drone-bullet.png')
    this.load.image('splash-drone', './assets/splash-drone.png')
    this.load.image('explode', './assets/explode.png')
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
    // Determine player class
    this.playerClass = (data && data.playerClass) ? data.playerClass : 'normal';
    // Brokie class: mark for double bolts
    this.isBrokie = (this.playerClass === 'brokie');
    // Tracker class: mark for homing bullets
    this.isTracker = (this.playerClass === 'tracker');
    // Hunter class: mark for double damage
    this.isHunter = (this.playerClass === 'hunter');
    // Arsonist class: has orbiting flames
    this.isArsonist = (this.playerClass === 'arsonist');
    // Demoman class: throws grenade on right click
    this.isDemoman = (this.playerClass === 'demoman');
    // Controller class: mark for aura
    this.isController = (this.playerClass === 'controller');
    // Builder class: can build walls
    this.isBuilder = (this.playerClass === 'builder');
    // Add E key for builder wall placement (ensure this is set!)
    if (this.isBuilder) {
      this.keyEObj = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }
    console.log('Game Scene create')
    this.cameras.main.setBackgroundColor('#222');
    this.background = this.add.sprite(0, 0, 'game-scene-background');
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

    // Determine player class
    this.playerClass = (data && data.playerClass) ? data.playerClass : 'normal';
    if (this.playerClass === 'frank') {
      this.player = this.matter.add.sprite(1920 / 2, 1080 / 2, 'frank-player');
    } else {
      this.player = this.matter.add.sprite(1920 / 2, 1080 / 2, 'player');
    }
    if (this.playerClass === 'brice') {
      this.player.setScale(0.55);
      this.player.setOrigin(0.5);
      this.player.setBody({ type: 'rectangle', width: this.player.width * 0.55, height: this.player.height * 0.55 });
      this.player.hp = 200;
      this.player.isBrice = true;
    } else {
      this.player.setScale(0.5);
      this.player.setOrigin(0.5);
      this.player.setBody({ type: 'rectangle', width: this.player.width * 0.5, height: this.player.height * 0.5 });
      this.player.hp = 3;
    }
    console.log('Player sprite created:', this.player);
    this.isReloadingTexture = false;

    // Frank class: add drones based on droneCount (default 2)
    if (this.playerClass === 'frank') {
      this.droneCount = this.droneCount || 2;
      this.drones = [];
      for (let i = 0; i < this.droneCount; i++) {
        const angle = (Math.PI * 2 * i) / this.droneCount;
        const x = this.player.x + Math.cos(angle) * 100;
        const y = this.player.y + Math.sin(angle) * 100;
        const drone = this.add.sprite(x, y, 'drone');
        drone.setScale(0.4);
        this.drones.push(drone);
      }
      this.droneShootTimers = Array(this.droneCount).fill(0);
    }

    if (this.playerClass === 'arsonist') {
      this.flameCount = 12;
      this.flames = [];
      const flameOrbitRadius = 250; // Increased distance from player
      for (let i = 0; i < this.flameCount; i++) {
        const angle = (Math.PI * 2 * i) / this.flameCount;
        const x = this.player.x + Math.cos(angle) * flameOrbitRadius;
        const y = this.player.y + Math.sin(angle) * flameOrbitRadius;
        const flame = this.add.sprite(x, y, 'flame');
        flame.setScale(0.7); // Make flames larger
        flame.setAlpha(0.95); // Make flames more visible
        flame.setDepth(10); // Ensure flames are above player and enemies
        flame.orbitAngle = angle;
        flame.lastHitEnemies = new Set();
        this.flames.push(flame);
      }
    }

    // Controller class: spawn aura
    if (this.isController) {
      // Aura is a transparent circle sprite
      this.controllerAura = this.add.graphics();
      this.controllerAura.fillStyle(0x00ffff, 0.25);
      this.controllerAura.fillCircle(0, 0, this.controllerAuraRadius); // uses new radius
      this.controllerAura.x = this.player.x;
      this.controllerAura.y = this.player.y;
      this.controllerAura.setDepth(5);
      // For collision, just use distance checks
      this.controllerAuraDamageTimer = 0;
      this.controllerAurawaveTimer = 0;
      this.controllerAurawaves = [];
    }

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
        // --- Splash Drone Bullet/Enemy collision ---
        if (
          ((objA.isBullet && objA.isSplash && objB.isEnemy) ||
            (objB.isBullet && objB.isSplash && objA.isEnemy))
        ) {
          const bullet = objA.isSplash ? objA : objB;
          // Only trigger splash once
          if (bullet._hasSplashed) return;
          bullet._hasSplashed = true;
          // Show explode effect at collision point
          const explodeX = bullet.x;
          const explodeY = bullet.y;
          const explodeSprite = this.add.sprite(explodeX, explodeY, 'explode');
          explodeSprite.setScale(0.5);
          explodeSprite.setAlpha(0.5);
          this.tweens.add({
            targets: explodeSprite,
            alpha: 0,
            duration: 350,
            onComplete: () => explodeSprite.destroy()
          });
          // Deal 5 damage to all enemies in radius (e.g. 120px)
          const splashRadius = 150;
          this.enemyGroup.forEach(enemy => {
            if (!enemy || enemy._destroyed) return;
            const dx = enemy.x - explodeX;
            const dy = enemy.y - explodeY;
            if (Math.sqrt(dx * dx + dy * dy) <= splashRadius) {
              enemy.hp = (enemy.hp || 1) - 5;
              // Hurt texture logic
              if (enemy.isArmored) {
                if (enemy.hp <= 5) {
                  enemy.setTexture('armored-enemy-hurt');
                  enemy.setScale(0.55);
                  enemy.setOrigin(0.5);
                }
              } else {
                if (enemy.hp <= 2) {
                  enemy.setTexture('enemy-hurt');
                  enemy.setScale(0.5);
                  enemy.setOrigin(0.5);
                }
              }
              if (enemy.hp <= 0) {
                // Capture position BEFORE destroy
                const enemyPos = { x: enemy.x, y: enemy.y };
                this.enemyGroup = this.enemyGroup.filter(e => e !== enemy);
                enemy.destroy();
                // Drop bolts
                let boltsDropped;
                if (enemy.isArmored) {
                  boltsDropped = Phaser.Math.Between(11, 14);
                } else {
                  boltsDropped = Phaser.Math.Between(3, 7);
                }
                if (this.isBrokie) {
                  this.bolts += boltsDropped * 2;
                } else {
                  this.bolts += boltsDropped;
                }
                this.updateBoltText();
                // Queue bloodstain for next frame
                this.bloodstainQueue.push(enemyPos);
                // 15% chance to spawn an extra enemy
                if (Phaser.Math.Between(1, 100) <= 15) {
                  this.createEnemy();
                }
                // 10% chance to spawn 2 enemies
                if (Phaser.Math.Between(1, 10) === 1) {
                  this.createEnemy();
                  this.createEnemy();
                } else {
                  this.createEnemy();
                }
              }
            }
          });
          // Remove bullet after splash
          this.bulletGroup = this.bulletGroup.filter(b => b !== bullet);
          bullet.destroy();
          return; // Don't process normal bullet/enemy logic for splash
        }

        // Bullet/enemy collision
        if ((objA.isBullet && objB.isEnemy) || (objB.isBullet && objA.isEnemy)) {
          const bullet = objA.isBullet ? objA : objB;
          const enemy = objA.isEnemy ? objA : objB;
          // Damage enemy
          if (bullet.isDrone) {
            enemy.hp = (enemy.hp || 1) - (bullet.droneDmg || 1);
          } else if (bullet.isCrit) {
            let critDmg = 3;
            if (this.isHunter) critDmg = 6;
            enemy.hp = (enemy.hp || 1) - critDmg;
            // Show crit particle at enemy position
            const critParticle = this.add.sprite(enemy.x, enemy.y, 'crit-particle');
            critParticle.setScale(2);
            critParticle.setAlpha(1);
            this.tweens.add({
              targets: critParticle,
              alpha: 0,
              duration: 500,
              onComplete: () => critParticle.destroy()
            });
          } else {
            let baseDmg = 1;
            if (this.isHunter) baseDmg = 2;
            enemy.hp = (enemy.hp || 1) - baseDmg;
          }
          this.bulletGroup = this.bulletGroup.filter(b => b !== bullet);
          bullet.destroy();
          if (enemy.isArmored) {
            if (enemy.hp <= 5) {
              enemy.setTexture('armored-enemy-hurt');
              enemy.setScale(0.55); // Match normal zombie size
              enemy.setOrigin(0.5);
            }
          } else {
            if (enemy.hp <= 2) {
              enemy.setTexture('enemy-hurt');
              enemy.setScale(0.5);
              enemy.setOrigin(0.5);
            }
          }
          if (enemy.hp <= 0) {
            // Capture position BEFORE destroy
            const enemyPos = { x: enemy.x, y: enemy.y };
            this.enemyGroup = this.enemyGroup.filter(e => e !== enemy);
            enemy.destroy();
            // Drop bolts
            let boltsDropped;
            if (enemy.isArmored) {
              boltsDropped = Phaser.Math.Between(11, 14);
            } else {
              boltsDropped = Phaser.Math.Between(3, 7);
            }
            if (this.isBrokie) {
              this.bolts += boltsDropped * 2;
            } else {
              this.bolts += boltsDropped;
            }
            this.updateBoltText();
            // Optionally show bolt drop effect here
            // Queue bloodstain for next frame
            this.bloodstainQueue.push(enemyPos);
            // 15% chance to spawn an extra enemy
            if (Phaser.Math.Between(1, 100) <= 15) {
              this.createEnemy();
            }
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
          // Player loses HP (Brice defense applies)
          let dmg = 1;
          if (this.playerClass === 'brice' && this.briceDef > 0) {
            dmg = 1 - 0.1 * this.briceDef;
            dmg = Math.round(dmg * 10) / 10;
            dmg = Math.max(dmg, 0.5); // never less than 0.25
          }
          this.player.hp -= dmg;
          this.player.hp = Math.round(this.player.hp * 10) / 10;
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
            if (this.playerClass === 'brice') {
              var bulletOffset = 107; // farther in front of player
            } else {
              var bulletOffset = 90; // default offset
            }
            const bulletX = this.player.x + Math.cos(angle) * bulletOffset;
            const bulletY = this.player.y + Math.sin(angle) * bulletOffset;
            let bullet, isCrit = false;
            if (Phaser.Math.Between(1, 100) <= this.crit) {
              bullet = this.matter.add.sprite(bulletX, bulletY, 'crit-bullet');
              isCrit = true;
            } else {
              bullet = this.matter.add.sprite(bulletX, bulletY, 'bullet');
            }
            bullet.setScale(0.5);
            bullet.setBody({ type: 'rectangle', width: bullet.width * 0.5, height: bullet.height * 0.5 });
            bullet.setIgnoreGravity(true);
            bullet.body.collisionFilter.group = -1;
            bullet.isBullet = true;
            bullet.isCrit = isCrit;
            // Ignore wall collisions
            bullet.body.collisionFilter.mask &= ~0x0008;
            // Tracker class: mark bullet for homing
            if (this.isTracker) bullet.isHoming = true;
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
              if (this.playerClass === 'frank') {
                this.player.setTexture('frank-player-reload');
              } else {
                this.player.setTexture('player-reload');
              }
              this.isReloadingTexture = true;
              this.time.delayedCall(this.reloadTime, () => {
                this.ammo = this.reloadingAmmo;
                this.reloading = false;
                if (this.playerClass === 'frank') {
                  this.player.setTexture('frank-player');
                } else {
                  this.player.setTexture('player');
                }
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
    // Arsonist class: update orbiting flames and check for enemy collisions
    if (this.isArsonist && this.flames && this.flames.length) {
      for (let i = 0; i < this.flameCount; i++) {
        // Orbit flames around player
        const orbitSpeed = 0.090; // radians per frame (faster)
        this.flames[i].orbitAngle += orbitSpeed;
        const flameOrbitRadius = 250;
        const x = this.player.x + Math.cos(this.flames[i].orbitAngle) * flameOrbitRadius;
        const y = this.player.y + Math.sin(this.flames[i].orbitAngle) * flameOrbitRadius;
        this.flames[i].x = x;
        this.flames[i].y = y;
        // Check collision with enemies
        for (const enemy of this.enemyGroup) {
          if (!enemy || enemy._destroyed || enemy.hp <= 0) continue;
          const dx = enemy.x - x;
          const dy = enemy.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 50) { // collision radius
            if (!this.flames[i].lastHitEnemies.has(enemy)) {
              enemy.hp = (enemy.hp || 1) - 2;
              this.flames[i].lastHitEnemies.add(enemy);
              // Hurt texture logic
              if (enemy.isArmored) {
                if (enemy.hp <= 5) {
                  enemy.setTexture('armored-enemy-hurt');
                  enemy.setScale(0.55);
                  enemy.setOrigin(0.5);
                }
              } else {
                if (enemy.hp <= 2) {
                  enemy.setTexture('enemy-hurt');
                  enemy.setScale(0.5);
                  enemy.setOrigin(0.5);
                }
              }
              if (enemy.hp <= 0) {
                // Capture position BEFORE destroy
                const enemyPos = { x: enemy.x, y: enemy.y };
                this.enemyGroup = this.enemyGroup.filter(e => e !== enemy);
                enemy.destroy();
                // Drop bolts
                let boltsDropped;
                if (enemy.isArmored) {
                  boltsDropped = Phaser.Math.Between(11, 14);
                } else {
                  boltsDropped = Phaser.Math.Between(3, 7);
                }
                if (this.isBrokie) {
                  this.bolts += boltsDropped * 2;
                } else {
                  this.bolts += boltsDropped;
                }
                this.updateBoltText();
                // Queue bloodstain for next frame
                this.bloodstainQueue.push(enemyPos);
                // 15% chance to spawn an extra enemy
                if (Phaser.Math.Between(1, 100) <= 15) {
                  this.createEnemy();
                }
                // 10% chance to spawn 2 enemies
                if (Phaser.Math.Between(1, 10) === 1) {
                  this.createEnemy();
                  this.createEnemy();
                } else {
                  this.createEnemy();
                }
              }
            }
          } else {
            // Only remove from lastHitEnemies if enemy is outside collision radius
            if (this.flames[i].lastHitEnemies.has(enemy)) {
              this.flames[i].lastHitEnemies.delete(enemy);
            }
          }
        }
      }
    }
      // Demoman: throw grenade on space bar (moved from create)
      if (this.isDemoman) {
        if (!this._demomanGrenadeCooldown) this._demomanGrenadeCooldown = 0;
        const spaceKey = this.input.keyboard.addKey('SPACE');
        if (spaceKey.isDown && time > this._demomanGrenadeCooldown) {
          const pointer = this.input.activePointer;
          const dx = pointer.x - this.player.x;
          const dy = pointer.y - this.player.y;
          const angle = Math.atan2(dy, dx);
          const grenadeOffset = 120;
          const grenadeX = this.player.x + Math.cos(angle) * grenadeOffset;
          const grenadeY = this.player.y + Math.sin(angle) * grenadeOffset;
          const grenade = this.matter.add.sprite(grenadeX, grenadeY, 'grenade');
          grenade.setScale(0.7);
          grenade.setBody({ type: 'circle', radius: grenade.width * 0.35 });
          grenade.setIgnoreGravity(false);
          grenade.body.collisionFilter.group = -1;
          grenade.isGrenade = true;
          // Give grenade a velocity
    const grenadeSpeed = 12;
    grenade.setVelocity(Math.cos(angle) * grenadeSpeed, Math.sin(angle) * grenadeSpeed);
          grenade.setRotation(angle);
          // Grenade explodes after 1 second
          this.time.delayedCall(1000, () => {
            if (!grenade._destroyed) {
              // Show explode effect
              const explodeSprite = this.add.sprite(grenade.x, grenade.y, 'explode');
              explodeSprite.setScale(1.5);
              explodeSprite.setAlpha(1.5);
              this.tweens.add({
                targets: explodeSprite,
                alpha: 0,
                duration: 350,
                onComplete: () => explodeSprite.destroy()
              });
              // Deal 8 damage to all enemies in radius (e.g. 180px)
              const splashRadius = 180;
              this.enemyGroup.forEach(enemy => {
                if (!enemy || enemy._destroyed) return;
                const dx = enemy.x - grenade.x;
                const dy = enemy.y - grenade.y;
                if (Math.sqrt(dx * dx + dy * dy) <= splashRadius) {
                  enemy.hp = (enemy.hp || 1) - 8;
                  // Hurt texture logic
                  if (enemy.isArmored) {
                    if (enemy.hp <= 5) {
                      enemy.setTexture('armored-enemy-hurt');
                      enemy.setScale(0.55);
                      enemy.setOrigin(0.5);
                    }
                  } else {
                    if (enemy.hp <= 2) {
                      enemy.setTexture('enemy-hurt');
                      enemy.setScale(0.5);
                      enemy.setOrigin(0.5);
                    }
                  }
                  if (enemy.hp <= 0) {
                    const enemyPos = { x: enemy.x, y: enemy.y };
                    this.enemyGroup = this.enemyGroup.filter(e => e !== enemy);
                    enemy.destroy();
                    let boltsDropped;
                    if (enemy.isArmored) {
                      boltsDropped = Phaser.Math.Between(11, 14);
                    } else {
                      boltsDropped = Phaser.Math.Between(3, 7);
                    }
                    if (this.isBrokie) {
                      this.bolts += boltsDropped * 2;
                    } else {
                      this.bolts += boltsDropped;
                    }
                    this.updateBoltText();
                    this.bloodstainQueue.push(enemyPos);
                    // 15% chance to spawn an extra enemy
                    if (Phaser.Math.Between(1, 100) <= 15) {
                      this.createEnemy();
                    }
                    // 10% chance to spawn 2 enemies
                    if (Phaser.Math.Between(1, 10) === 1) {
                      this.createEnemy();
                      this.createEnemy();
                    } else {
                      this.createEnemy();
                    }
                  }
                }
              });
              grenade.destroy();
            }
          });
    // Add cooldown so grenade only fires once per key press
    this._demomanGrenadeCooldown = time + (400 / 1.5); // 1.5x faster cooldown
        }
      }
    // Tracker class: smoothly home bullets toward nearest enemy
    if (this.isTracker && this.bulletGroup && this.enemyGroup) {
      for (const bullet of this.bulletGroup) {
        if (!bullet.isHoming) continue;
        // Find nearest enemy
        let nearest = null, minDist = Infinity;
        for (const enemy of this.enemyGroup) {
          if (!enemy || enemy._destroyed) continue;
          const dx = enemy.x - bullet.x;
          const dy = enemy.y - bullet.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            nearest = enemy;
          }
        }
        if (nearest) {
          const dx = nearest.x - bullet.x;
          const dy = nearest.y - bullet.y;
          const angle = Math.atan2(dy, dx);
          // Smoothly steer toward target
          const speed = Math.sqrt(bullet.body.velocity.x ** 2 + bullet.body.velocity.y ** 2) || 30;
          const steerStrength = 0.15; // 0 = no steer, 1 = instant turn
          const vx = bullet.body.velocity.x * (1 - steerStrength) + Math.cos(angle) * speed * steerStrength;
          const vy = bullet.body.velocity.y * (1 - steerStrength) + Math.sin(angle) * speed * steerStrength;
          const newSpeed = Math.sqrt(vx * vx + vy * vy) || 30;
          bullet.setVelocity((vx / newSpeed) * speed, (vy / newSpeed) * speed);
          bullet.setRotation(Math.atan2(vy, vx));
        }
      }
    }
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
    let speed = 15;
    if (this.playerClass === 'brice') speed = 7;
    if (keyLeftObj.isDown === true) {
      vx -= speed;
    }
    if (keyRightObj.isDown === true) {
      vx += speed;
    }
    if (keyUpObj.isDown === true) {
      vy -= speed;
    }
    if (keyDownObj.isDown === true) {
      vy += speed;
    }
    this.player.setVelocity(vx, vy);

    // --- Remove buggy splash skin logic ---
    // No forced drone skin change here; splash skin only set when splashDroneUpgrade is true

    // Frank class: update drone positions and shooting
    if (this.playerClass === 'frank' && this.drones) {
      // If droneCount changed, add/remove drones
      if (this.drones.length !== this.droneCount) {
        // Remove old drones
        this.drones.forEach(d => d.destroy());
        this.drones = [];
        for (let i = 0; i < this.droneCount; i++) {
          const angle = (Math.PI * 2 * i) / this.droneCount;
          const x = this.player.x + Math.cos(angle) * 100;
          const y = this.player.y + Math.sin(angle) * 100;
          // Use correct skin for splash upgrade
          const droneTexture = this.splashDroneUpgrade ? 'splash-drone' : 'drone';
          const drone = this.add.sprite(x, y, droneTexture);
          drone.setScale(0.4);
          this.drones.push(drone);
        }
        this.droneShootTimers = Array(this.droneCount).fill(0);
      }
      for (let i = 0; i < this.droneCount; i++) {
        const angle = (Math.PI * 2 * i) / this.droneCount;
        this.drones[i].x = this.player.x + Math.cos(angle) * 100;
        this.drones[i].y = this.player.y + Math.sin(angle) * 100;
        // Ensure drone skin matches upgrade
        if (this.splashDroneUpgrade && this.drones[i].texture.key !== 'splash-drone') {
          this.drones[i].setTexture('splash-drone');
        } else if (!this.splashDroneUpgrade && this.drones[i].texture.key !== 'drone') {
          this.drones[i].setTexture('drone');
        }
        // Find nearest enemy for rotation and shooting
        let nearest = null, minDist = Infinity;
        for (const enemy of this.enemyGroup) {
          if (!enemy || enemy._destroyed) continue;
          const dx = this.drones[i].x - enemy.x;
          const dy = this.drones[i].y - enemy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            nearest = enemy;
          }
        }
        if (nearest) {
          // Rotate drone to face nearest enemy
          const dx = nearest.x - this.drones[i].x;
          const dy = nearest.y - this.drones[i].y;
          const droneAngle = Math.atan2(dy, dx);
          this.drones[i].setRotation(droneAngle);
          if (!this.droneShootTimers) this.droneShootTimers = Array(this.droneCount).fill(0);
          if (!this.lastDroneShot) this.lastDroneShot = Array(this.droneCount).fill(0);
          if (time - (this.lastDroneShot[i] || 0) > this.droneFirerate) {
            let bullet;
            if (this.splashDroneUpgrade) {
              bullet = this.matter.add.sprite(
                this.drones[i].x + Math.cos(droneAngle) * 40,
                this.drones[i].y + Math.sin(droneAngle) * 40,
                'drone-bullet'
              );
              bullet.setScale(0.4);
              bullet.setBody({ type: 'rectangle', width: bullet.width * 0.4, height: bullet.height * 0.4 });
              bullet.setIgnoreGravity(true);
              bullet.body.collisionFilter.group = 0;
              bullet.body.collisionFilter.category = 0x0004;
              bullet.body.collisionFilter.mask = 0x0002;
              bullet.isBullet = true;
              bullet.isDrone = true;
              bullet.isSplash = true;
              bullet.droneDmg = this.droneDmg;
              // Ignore wall collisions
              bullet.body.collisionFilter.mask &= ~0x0008;
              this.bulletGroup.push(bullet);
              const bulletSpeed = 25;
              bullet.setVelocity(Math.cos(droneAngle) * bulletSpeed, Math.sin(droneAngle) * bulletSpeed);
              bullet.setRotation(droneAngle);
            } else {
              bullet = this.matter.add.sprite(
                this.drones[i].x + Math.cos(droneAngle) * 40,
                this.drones[i].y + Math.sin(droneAngle) * 40,
                'drone-bullet'
              );
              bullet.setScale(0.4);
              bullet.setBody({ type: 'rectangle', width: bullet.width * 0.4, height: bullet.height * 0.4 });
              bullet.setIgnoreGravity(true);
              bullet.body.collisionFilter.group = 0;
              bullet.body.collisionFilter.category = 0x0004;
              bullet.body.collisionFilter.mask = 0x0002;
              bullet.isBullet = true;
              bullet.isDrone = true;
              bullet.droneDmg = this.droneDmg;
              // Ignore wall collisions
              bullet.body.collisionFilter.mask &= ~0x0008;
              this.bulletGroup.push(bullet);
              const bulletSpeed = 25;
              bullet.setVelocity(Math.cos(droneAngle) * bulletSpeed, Math.sin(droneAngle) * bulletSpeed);
              bullet.setRotation(droneAngle);
            }
            this.lastDroneShot[i] = time;
          }
        }
      }
    }

    this.enemyGroup = this.enemyGroup.filter(e => e && !e._destroyed);
    this.bulletGroup = this.bulletGroup.filter(b => b && !b._destroyed);
    this.enemyGroup.forEach((enemy) => {
      if (!enemy || enemy._destroyed) return;
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const angle = Math.atan2(dy, dx);
      enemy.setRotation(angle);
      if (enemy.isArmored) {
        enemy.setVelocity(Math.cos(angle) * 1.5, Math.sin(angle) * 1.5); // 25% slower
      } else {
        enemy.setVelocity(Math.cos(angle) * 2, Math.sin(angle) * 2);
      }
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

    // Brice class: healing regen per second (0.4 HP/s per upgrade, max 2 HP/s)
    if (this.playerClass === 'brice' && this.briceRegen > 0 && this.player.hp > 0) {
      if (!this._briceRegenBuffer) this._briceRegenBuffer = 0;
      // Regen rate: 0.4 * briceRegen per second
      const regenRate = Math.min(this.briceRegen * 1.6, 8);
      this._briceRegenBuffer += regenRate * (delta / 1000);
      if (this._briceRegenBuffer >= 0.1) {
        const healAmt = Math.floor(this._briceRegenBuffer * 10) / 10;
        this.player.hp = Math.min(this.player.hp + healAmt, 200);
        this.player.hp = Math.round(this.player.hp * 10) / 10;
        this._briceRegenBuffer -= healAmt;
        this.updateHpText();
      }
    }

    // Remove bullets that are stuck or have stopped moving for too long
    if (this.bulletGroup && this.bulletGroup.length) {
      for (const bullet of this.bulletGroup) {
        // Track how long a bullet has been nearly stopped
        if (!bullet._stuckTime) bullet._stuckTime = 0;
        const speed = Math.sqrt(
          bullet.body?.velocity?.x ** 2 + bullet.body?.velocity?.y ** 2
        );
        // If bullet speed is very low, increment stuck time
        if (speed < 10) {
          bullet._stuckTime += delta;
        } else {
          bullet._stuckTime = 0;
        }
        // Remove bullet if stuck for more than 2 seconds
        if (bullet._stuckTime > 2000) {
          bullet.destroy();
        }
      }
      // Clean up bulletGroup array
      this.bulletGroup = this.bulletGroup.filter(b => b && !b._destroyed);
    }

    // Controller class: aura logic
    if (this.isController && this.controllerAura) {
      // Aura follows player
      this.controllerAura.x = this.player.x;
      this.controllerAura.y = this.player.y;

      // Damage enemies inside aura every 0.5s, slow them
      this.controllerAuraDamageTimer += delta;
      if (this.controllerAuraDamageTimer >= 500) {
        for (const enemy of this.enemyGroup) {
          if (!enemy || enemy._destroyed || enemy.hp <= 0) continue;
          const dx = enemy.x - this.player.x;
          const dy = enemy.y - this.player.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= this.controllerAuraRadius) {
            // Damage
            enemy.hp = (enemy.hp || 1) - 1;
            // Slow enemy
            enemy._controllerSlowed = true;
            // Hurt texture logic
            if (enemy.isArmored && enemy.hp <= 5) {
              enemy.setTexture('armored-enemy-hurt');
              enemy.setScale(0.55);
              enemy.setOrigin(0.5);
            } else if (!enemy.isArmored && enemy.hp <= 2) {
              enemy.setTexture('enemy-hurt');
              enemy.setScale(0.5);
              enemy.setOrigin(0.5);
            }
            if (enemy.hp <= 0) {
              const enemyPos = { x: enemy.x, y: enemy.y };
              this.enemyGroup = this.enemyGroup.filter(e => e !== enemy);
              enemy.destroy();
              let boltsDropped = enemy.isArmored ? Phaser.Math.Between(11, 14) : Phaser.Math.Between(3, 7);
              if (this.isBrokie) this.bolts += boltsDropped * 2;
              else this.bolts += boltsDropped;
              this.updateBoltText();
              this.bloodstainQueue.push(enemyPos);
              // 15% chance to spawn an extra enemy
              if (Phaser.Math.Between(1, 100) <= 15) {
                this.createEnemy();
              }
              // 10% chance to spawn 2 enemies
              if (Phaser.Math.Between(1, 10) === 1) {
                this.createEnemy();
                this.createEnemy();
              } else {
                this.createEnemy();
              }
            }
          } else {
            enemy._controllerSlowed = false;
          }
        }
        this.controllerAuraDamageTimer = 0;
      }

      // Aurawave pulse every 1.5s
      this.controllerAurawaveTimer += delta;
      if (this.controllerAurawaveTimer >= 1500) {
        // Create aurawave sprite (use graphics for now)
        const aurawave = this.add.graphics();
        aurawave.x = this.player.x;
        aurawave.y = this.player.y;
        aurawave._radius = 0;
        aurawave._maxRadius = this.controllerAuraRadius * 1.5;
        aurawave._damageDone = new Set();
        aurawave.setDepth(6);
        this.controllerAurawaves.push(aurawave);
        this.controllerAurawaveTimer = 0;
      }

      // Update and expand aurawaves
      for (const aurawave of this.controllerAurawaves) {
        // Make aurawave last longer by expanding more slowly (duration: 4s instead of 3s)
        aurawave._radius += (delta / 5000) * aurawave._maxRadius;
        aurawave.clear();
        aurawave.fillStyle(0x00ffff, 0.15);
        aurawave.fillCircle(0, 0, aurawave._radius);
        // Damage enemies hit by wave (only once per wave)
        for (const enemy of this.enemyGroup) {
          if (!enemy || enemy._destroyed || enemy.hp <= 0) continue;
          if (aurawave._damageDone.has(enemy)) continue;
          const dx = enemy.x - aurawave.x;
          const dy = enemy.y - aurawave.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= aurawave._radius) {
            enemy.hp = (enemy.hp || 1) - 3;
            aurawave._damageDone.add(enemy);
            // Hurt texture logic
            if (enemy.isArmored && enemy.hp <= 5) {
              enemy.setTexture('armored-enemy-hurt');
              enemy.setScale(0.55);
              enemy.setOrigin(0.5);
            } else if (!enemy.isArmored && enemy.hp <= 2) {
              enemy.setTexture('enemy-hurt');
              enemy.setScale(0.5);
              enemy.setOrigin(0.5);
            }
            if (enemy.hp <= 0) {
              const enemyPos = { x: enemy.x, y: enemy.y };
              this.enemyGroup = this.enemyGroup.filter(e => e !== enemy);
              enemy.destroy();
              let boltsDropped = enemy.isArmored ? Phaser.Math.Between(11, 14) : Phaser.Math.Between(3, 7);
              if (this.isBrokie) this.bolts += boltsDropped * 2;
              else this.bolts += boltsDropped;
              this.updateBoltText();
              this.bloodstainQueue.push(enemyPos);
              // 15% chance to spawn an extra enemy
              if (Phaser.Math.Between(1, 100) <= 15) {
                this.createEnemy();
              }
              // 10% chance to spawn 2 enemies
              if (Phaser.Math.Between(1, 10) === 1) {
                this.createEnemy();
                this.createEnemy();
              } else {
                this.createEnemy();
              }
            }
          }
        }
      }
      // Remove finished aurawaves
      this.controllerAurawaves = this.controllerAurawaves.filter(aw => {
        if (aw._radius >= aw._maxRadius) {
          aw.destroy();
          return false;
        }
        return true;
      });
    }

    // Enemy movement (add controller slow logic)
    this.enemyGroup.forEach((enemy) => {
      if (!enemy || enemy._destroyed) return;
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const angle = Math.atan2(dy, dx);
      // Controller aura slow
      let speedMod = 1;
      if (enemy._controllerSlowed) speedMod = 0.5;
      if (enemy.isArmored) {
        enemy.setVelocity(Math.cos(angle) * 1.5 * speedMod, Math.sin(angle) * 1.5 * speedMod);
      } else {
        enemy.setVelocity(Math.cos(angle) * 2 * speedMod, Math.sin(angle) * 2 * speedMod);
      }
    });

    // Builder: place wall with E key
    if (this.isBuilder && this.keyEObj && Phaser.Input.Keyboard.JustDown(this.keyEObj)) {
      if (this.bolts >= 300) {
        this.bolts -= 300;
        this.updateBoltText();
        // Place wall between player and cursor, flat side faces the cursor
        const pointer = this.input.activePointer;
        const dx = pointer.x - this.player.x;
        const dy = pointer.y - this.player.y;
        // Wall's flat side faces the cursor: rotate by angle + Math.PI/2
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        // Increase wall spawn distance (e.g. 240 instead of 120)
        const wallDistance = 240;
        const wallLength = 240;
        const wallThickness = 40;
        const wallX = this.player.x + Math.cos(angle - Math.PI / 2) * wallDistance;
        const wallY = this.player.y + Math.sin(angle - Math.PI / 2) * wallDistance;
        const wallBody = this.matter.add.rectangle(wallX, wallY, wallLength, wallThickness, {
          isStatic: true,
          angle: angle,
          label: 'wall',
          collisionFilter: {
            category: 0x0008,
            mask: 0x0001 | 0x0002
          }
        });
        const wallSprite = this.add.rectangle(wallX, wallY, wallLength, wallThickness, 0x888888, 1);
        wallSprite.setDepth(20);
        wallSprite.setStrokeStyle(4, 0x222222, 1);
        wallSprite.setAlpha(0.85);
        wallSprite.rotation = angle;
        wallSprite._wallBody = wallBody;
        this.wallGroup.push(wallSprite);
        // Wall duration based on upgrade
        let wallDuration = 5000;
        if (typeof this.wallDurationUpgrade === 'number' && Array.isArray(this.wallDurations)) {
          wallDuration = this.wallDurations[this.wallDurationUpgrade];
        }
        if (wallDuration > 0) {
          this.time.delayedCall(wallDuration, () => {
            this.matter.world.remove(wallBody);
            wallSprite.destroy();
          });
        }
        // If wallDuration is -1 (forever), do not destroy
      }
    }
    // Sync wall sprites to their bodies
    if (this.wallGroup && this.wallGroup.length) {
      for (const wallSprite of this.wallGroup) {
        if (wallSprite._wallBody) {
          wallSprite.x = wallSprite._wallBody.position.x;
          wallSprite.y = wallSprite._wallBody.position.y;
          wallSprite.rotation = wallSprite._wallBody.angle;
        }
      }
      this.wallGroup = this.wallGroup.filter(w => w.active && w._wallBody);
    }

    // --- Bullet/wall collision filter: allow bullets to pass through walls ---
    // This is handled by setting bullet mask to not collide with wall category (0x0008)
    // When creating bullets, add:
    // bullet.body.collisionFilter.mask = 0x0002 | 0x0004; // enemy & drone, but not wall

    // Patch bullet creation to ensure bullets ignore walls:
    // (Find all bullet creation and add this after setBody)
    // bullet.body.collisionFilter.mask &= ~0x0008;

    // Example for main gun bullets:
    // bullet.setBody({ ... });
    // bullet.body.collisionFilter.mask &= ~0x0008;

    // Example for drone bullets:
    // bullet.setBody({ ... });
    // bullet.body.collisionFilter.mask &= ~0x0008;

    // Example for splash drone bullets:
    // bullet.setBody({ ... });
    // bullet.body.collisionFilter.mask &= ~0x0008;

    // ...existing code...
  }
}

// --- Patch bullet creation to ignore wall collisions ---
// Find all bullet creation and add this after setBody:
    // bullet.body.collisionFilter.mask &= ~0x0008;

// Example for main gun bullets:
    // bullet.setBody({ ... });
    // bullet.body.collisionFilter.mask &= ~0x0008;

// Example for drone bullets:
    // bullet.setBody({ ... });
    // bullet.body.collisionFilter.mask &= ~0x0008;

// Example for splash drone bullets:
    // bullet.setBody({ ... });
    // bullet.body.collisionFilter.mask &= ~0x0008;

// ...existing code...

export default GameScene
