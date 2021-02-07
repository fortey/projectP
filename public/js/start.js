import { BootScene, WorldScene } from './world.js';
import { UIScene } from './gui.js';

var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 1280,
    height: 720,
    zoom: 1,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false // set to true to view zones
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        BootScene,
        WorldScene,
        UIScene,
    ]
};
var game = new Phaser.Game(config);