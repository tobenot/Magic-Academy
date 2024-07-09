// main.js

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }
    
    preload() {
        const timestamp = new Date().getTime();
        this.load.tilemapTiledJSON('magicAcademy', `assets/town.json?v=${timestamp}`);
        this.load.image('tiles', `assets/blockPack_tilesheet.png?v=${timestamp}`);
    }

    create() {
        const map = this.make.tilemap({ key: 'magicAcademy' });
        const tileset = map.addTilesetImage('tileset', 'tiles');
        const layer = map.createLayer('Tile Layer 1', tileset, 0, 0);

        console.log('进入魔法学院');
    }
}

class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }

    preload() {
        const timestamp = new Date().getTime();
        this.load.image('tiles', `assets/blockPack_tilesheet.png?v=${timestamp}`);
    }

    create() {
        const mapData = this.generateRandomMap(20, 20);
        const map = this.make.tilemap({ data: mapData, tileWidth: 32, tileHeight: 32 });
        const tileset = map.addTilesetImage('tileset', null, 32, 32);
        const layer = map.createLayer(0, tileset, 0, 0);

        console.log('进入战斗场景');
    }

    generateRandomMap(width, height) {
        const map = [];
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                row.push(Math.floor(Math.random() * 10));
            }
            map.push(row);
        }
        return map;
    }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }
        }
    },
    scene: [MainScene, BattleScene],
    parent: 'game-container'
};

function startGame() {
    const game = new Phaser.Game(config);
    game.scene.start('MainScene');
}