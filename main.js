// main.js

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }
    
    preload() {
        const timestamp = new Date().getTime();
        this.load.tilemapTiledJSON('magicAcademy', `assets/town.json?v=${timestamp}`);
        this.load.image('tiles', `assets/blockPack_tilesheet.png?v=${timestamp}`);
        this.load.spritesheet('player', `assets/main_menu.jfif?v=${timestamp}`, { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        const map = this.make.tilemap({ key: 'magicAcademy' });
        const tileset = map.addTilesetImage('tileset', 'tiles');
        const layer = map.createLayer('Tile Layer 1', tileset, 0, 0);

        this.player = this.physics.add.sprite(100, 100, 'player');

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        
        // 碰撞设置
        this.physics.add.collider(this.player, layer);
        layer.setCollisionByExclusion([-1]);

        console.log('进入魔法学院');
    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.stop();
        }
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160);
        } else {
            this.player.setVelocityY(0);
        }
    }
}

class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }

    preload() {
        const timestamp = new Date().getTime();
        this.load.image('tiles', `assets/blockPack_tilesheet.png?v=${timestamp}`);
        this.load.spritesheet('player', `assets/main_menu.jfif?v=${timestamp}`, { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        const mapData = this.generateRandomMap(20, 20);
        const map = this.make.tilemap({ data: mapData, tileWidth: 32, tileHeight: 32 });
        const tileset = map.addTilesetImage('tileset', null, 32, 32);
        const layer = map.createLayer(0, tileset, 0, 0);

        this.player = this.physics.add.sprite(100, 100, 'player');

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        console.log('进入战斗场景');
    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.stop();
        }
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160);
        } else {
            this.player.setVelocityY(0);
        }
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
            gravity: { y: 0 } // 无重力
        }
    },
    scene: [MainScene, BattleScene],
    parent: 'game-container'
};

function startGame() {
    const game = new Phaser.Game(config);

    game.scale.resize(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', () => {
        game.scale.resize(window.innerWidth, window.innerHeight);
    });

    game.scene.start('MainScene');
}

window.startGame = startGame;