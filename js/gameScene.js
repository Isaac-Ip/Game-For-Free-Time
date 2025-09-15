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
  createEnemy() {
    const enemyXLocation = Math.floor(Math.random() * 1920) + 1; // this will get a number between 1 and 1920
    let enemyXVelocity = Math.floor(Math.random() * 50) + 1; // this will get a number between 1 and 50
    enemyXVelocity *= Math.round(Math.random()) ? 1 : -1; // this will add minus sign in 50% of cases
    const anEnemy = this.physics.add.sprite(enemyXLocation, 100, "enemy");
    anEnemy.body.velocity.y = 200;
    anEnemy.setScale(0.5);
    anEnemy.body.velocity.x = enemyXVelocity;
    this.enemyGroup.add(anEnemy);
  }
  /**
   * This method is the constructor.
   */
  constructor () {
    super({ key: 'gameScene' })

    this.GameSceneBackgroundImage = null
    this.player = null
    this.playerReload = null
    this.enemy = null
    this.bullet = null
    this.ammo = 15
  }

  /**
   * Can be defined on your own Scenes.
   * This method is called by the Scene Manager when the scene starts,
   * before preload() and create().
   * @param {object} data Any data passed via ScenePlugin.add() or ScenePlugin.start().
   */
  init (data) {
    this.cameras.main.setBackgroundColor('#d06a16ff')
  }

  /**
   * Can be defined on your own Scenes.
   * Use it to load assets.
   */
  preload () {
    console.log('Game Scene')

    // images
    this.load.image('gameSceneBackground', './assets/gameplay-scene.png')
    this.load.image('player', './assets/player.png')
    this.load.image('player-reload', './assets/player-reload.png')
    this.load.image('enemy', './assets/zombie.png')
    this.load.image('bullet', './assets/bullet.png')
  }

  /**
   * Can be defined on your own Scenes.
   * Use it to create your game objects.
   * @param {object} data Any data passed via ScenePlugin.add() or ScenePlugin.start().
   */
  create (data) {
    this.background = this.add.sprite(0, 0, 'gameSceneBackground')
    this.background.x = 1920 / 2
    this.background.y = 1080 / 2

    this.player = this.physics.add.sprite(1920 / 2, 1080 / 2, 'player')
    this.player.setScale(0.5)
    
    this.bulletGroup = this.physics.add.group()
    this.enemyGroup = this.physics.add.group()
    this.createEnemy();

    this.physics.add.overlap(this.bulletGroup, this.enemyGroup, function (bulletCollide, enemyCollide) {
      bulletCollide.destroy()
        enemyCollide.destroy()
        this.createEnemy();
    }.bind(this))

    const fireRate = 90; // Milliseconds between shots (e.g., 500ms for 2 shots per second)

    this.input.on('pointerdown', (pointer) => {


      // --- Start continuous firing ---
      if (!this.firingInterval) {
        this.firingInterval = this.time.addEvent({
          delay: fireRate,
          loop: true,
          callback: () => {
            if (!this.input.activePointer.isDown) {
              this.firingInterval.remove();
              this.firingInterval = null;
              return;
            }
            // Prevent firing while reloading
            if (this.reloading) {
              return;
            }
            if (!this.ammo) this.ammo = 15; // Set initial ammo if undefined
            this.ammo--;
            const bullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet');
            bullet.setScale(0.5);
            this.bulletGroup.add(bullet);

            const dx = this.input.activePointer.x - this.player.x;
            const dy = this.input.activePointer.y - this.player.y;
            // Add a small random spray to the bullet angle
            const baseAngle = Math.atan2(dy, dx);
            const spray = Phaser.Math.DegToRad(Phaser.Math.Between(-15, 15)); // spray of ±15 degrees
            const angle = baseAngle + spray;

            const bulletSpeed = 1500;
            bullet.body.velocity.x = Math.cos(angle) * bulletSpeed;
            bullet.body.velocity.y = Math.sin(angle) * bulletSpeed;
            bullet.rotation = angle;

            // --- Reload logic ---
            if (this.ammo <= 0) {
              this.reloading = true;
              this.playerReload = this.physics.add.sprite(this.player.x, this.player.y, 'player-reload')
              this.playerReload.setScale(0.5)
              this.player.destroy()
              this.time.delayedCall(1500, () => { // 1.5s reload time
                this.ammo = 15;
                this.reloading = false;
                this.player = this.physics.add.sprite(this.playerReload.x, this.playerReload.y, 'player')
                this.player.setScale(0.5)
                this.playerReload.destroy()
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
    })
    
  }

  /**
   * Should be overridden by your own Scenes.
   * This method is called once per game step while the scene is running.
   * @param {number} time - The current time.
   * @param {number} delta - The delta time in ms since the last frame.
   */
  update (time, delta) {

    const pointer = this.input.activePointer
    const dx = pointer.x - this.player.x
    const dy = pointer.y - this.player.y
    const angle = Math.atan2(dy, dx)

    this.player.rotation = angle
    if (this.playerReload) this.playerReload.rotation = angle

    const keyUpObj = this.input.keyboard.addKey('W')
    const keyLeftObj = this.input.keyboard.addKey('A')
    const keyRightObj = this.input.keyboard.addKey('D')
    const keyDownObj = this.input.keyboard.addKey('S')
    const keyUpgradeObj = this.input.keyboard.addKey('P')

    if (keyLeftObj.isDown === true) {
      this.player.x -= 15
      if (this.player.x < 0) this.player.x = 0
      if (this.playerReload) {
        this.playerReload.x -= 15
        if (this.playerReload.x < 0) this.playerReload.x = 0
      }
    }

    if (keyRightObj.isDown === true) {
      this.player.x += 15
      if (this.player.x > 1920) this.player.x = 1920
      if (this.playerReload) {
        this.playerReload.x += 15
        if (this.playerReload.x > 1920) this.playerReload.x = 1920
      }
    }

    if (keyUpObj.isDown === true) {
      this.player.y -= 15
      if (this.player.y < 0) this.player.y = 0
      if (this.playerReload) {
        this.playerReload.y -= 15
        if (this.playerReload.y < 0) this.playerReload.y = 0
      }
    }

    if (keyDownObj.isDown === true) {
      this.player.y += 15
      if (this.player.y > 1080) this.player.y = 1080;
      if (this.playerReload) {
        this.playerReload.y += 15;
        if (this.playerReload.y > 1080) this.playerReload.y = 1080;
      }
    }

    if (keyUpgradeObj.isDown === true) {
      this.scene.switch('upgradeScene')
    }

    this.enemyGroup.children.each(function (enemy) {
      const dx = this.player.x - enemy.x
      const dy = this.player.y - enemy.y
      const angle = Math.atan2(dy, dx)
      enemy.rotation = angle
      enemy.body.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200)
    }, this)

  }
  
}


export default GameScene
