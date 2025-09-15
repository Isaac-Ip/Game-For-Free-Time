/* global Phaser */

// Copyright (c) 2025 Isaac Ip All rights reserved
//
// Created by: Isaac Ip
// Created on: Apr 2025
// This is the Level Scene

/**
 * This class is the Level Scene.
 */
class UpgradeScene extends Phaser.Scene {
  /**
   * This method is the constructor.
   */
  constructor() {
    super({ key: 'upgradeScene' })

    this.upgradeableAssaultRifle = null
  }

  /**
   * Can be defined on your own Scenes.
   * This method is called by the Scene Manager when the scene starts,
   * before preload() and create().
   * @param {object} data Any data passed via ScenePlugin.add() or ScenePlugin.start().
   */
  init(data) {
    this.cameras.main.setBackgroundColor('#d2d3d5')

  }

  /**
   * Can be defined on your own Scenes.
   * Use it to load assets.
   */
  preload() {
    console.log('Upgrade Scene')

    this.load.image('upgradeableAssaultRifle', './assets/.upgradeable-ar.png')
  }

  /**
   * Can be defined on your own Scenes.
   * Use it to create your game objects.
   * @param {object} data Any data passed via ScenePlugin.add() or ScenePlugin.start().
   */
  create(data) {
    // Create the key object once and store it for reuse
  }

  /**
   * Should be overridden by your own Scenes.
   * This method is called once per game step while the scene is running.
   * @param {number} time The current time.
   * @param {number} delta The delta time in ms since the last frame.
   */
  update(time, delta) {
    const keyGameObj = this.input.keyboard.addKey('P')

    if (keyGameObj.isDown === true) {
      this.scene.switch('gameScene')
    }
  }
}

export default UpgradeScene
