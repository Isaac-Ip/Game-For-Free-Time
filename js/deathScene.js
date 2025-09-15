/* global Phaser */

// Copyright (c) 2025 Isaac Ip All rights reserved
//
// Created by: Isaac Ip
// Created on: Apr 2025
// This is the Death Scene; when the player dies, this scene will be shown

/**
 * This class is the Death Scene.
 */
class DeathScene extends Phaser.Scene {
  /**
   * This method is the constructor.
   */
  constructor() {
    super({ key: 'deathScene' })

    this.gameOverTextStyle = { font: '80px Courier New', fill: '#ff0000', align: 'center' }

    this.quoteNumber = 0
    this.quoteText = null
    this.deathMessage = null
  }

  /**
   * Can be defined on your own Scenes.
   * This method is called by the Scene Manager when the scene starts,
   * before preload() and create().
   * @param {object} data Any data passed via ScenePlugin.add() or ScenePlugin.start().
   */
  init(data) {
    this.cameras.main.setBackgroundColor('#000000')
  }

  /**
   * Can be defined on your own Scenes.
   * Use it to load assets.
   */
  preload() {
    console.log('Death Scene')
  }

  /**
   * Can be defined on your own Scenes.
   * Use it to create your game objects.
   * @param {object} data Any data passed via ScenePlugin.add() or ScenePlugin.start().
   */
  create(data) {
this.deathMessage = this.add.text(1920 / 2, 1080 / 2, 'Game Over', this.gameOverTextStyle)
  .setOrigin(0.5)
  .setInteractive()
  .on('pointerdown', () => {
    window.location.reload()
  })
  }

  /**
   * Should be overridden by your own Scenes.
   * This method is called once per game step while the scene is running.
   * @param {number} time - The current time.
   * @param {number} delta - The delta time in ms since the last frame.
   */
  update(time, delta) {
    // pass
  }
}

export default DeathScene
