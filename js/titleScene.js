/* global Phaser */

// Copyright (c) 2025 Isaac Ip All rights reserved
//
// Created by: Isaac Ip
// Created on: Apr 2025
// This is the Title Scene

/**
 * This class is the Title Scene.
 */
class TitleScene extends Phaser.Scene {
  /**
   * This method is the constructor.
   */
  constructor() {
    super({ key: 'titleScene' })

    this.titleSceneBackgroundImage = null
    this.startButton = null
  }

  /**
   * Can be defined on your own Scenes.
   * This method is called by the Scene Manager when the scene starts,
   * before preload() and create().
   * @param {object} data Any data passed via ScenePlugin.add() or ScenePlugin.start().
   */
  init(data) {
    this.cameras.main.setBackgroundColor('#ffffff')
  }

  /**
   * Can be defined on your own Scenes.
   * Use it to load assets.
   */
  preload() {
    console.log('Title Scene')
    this.load.image('titleSceneBackground', './assets/title-scene.png')
    this.load.image('startButton', './assets/start-button.png')
  }

  /**
   * Can be defined on your own Scenes.
   * Use it to create your game objects.
   * @param {object} data Any data passed via ScenePlugin.add() or ScenePlugin.start().
   */
  create(data) {
    this.titleSceneBackgroundImage = this.add
      .sprite(0, 0, 'titleSceneBackground')
    this.titleSceneBackgroundImage.x = 1920 / 2
    this.titleSceneBackgroundImage.y = 1080 / 2

    this.startButton = this.add.sprite(1920 / 2, 1080 / 2 + 100, 'startButton')
    this.startButton.setScale(4)
    this.startButton.setInteractive({ useHandCursor: true })
    this.startButton.on('pointerdown', () => this.clickButton())
    this.startButton.on('pointerover', () => {
      this.startButton.setScale(4.8)
    })
    this.startButton.on('pointerout', () => {
      this.startButton.setScale(4)
    })
  }

  /**
   * Should be overridden by your own Scenes.
   * This method is called once per game step while the scene is running.
   * @param {number} time The current time.
   * @param {number} delta The delta time in ms since the last frame.
   */
  update(time, delta) {
    // pass
  }

  clickButton() {
    this.scene.start('gameScene')
  }
}



export default TitleScene
