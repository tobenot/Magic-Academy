class VirtualJoystick {
    constructor(scene, x, y, radius) {
        this.scene = scene;
        this.radius = radius;
        this.base = scene.add.circle(x, y, radius, 0x888888).setScrollFactor(0);
        this.thumb = scene.add.circle(x, y, radius / 2, 0xcccccc).setScrollFactor(0);
        this.pointer = null;
        this.value = { x: 0, y: 0 };

        this.base.setInteractive();
        this.base.on('pointerdown', this.onPointerDown, this);
        scene.input.on('pointerup', this.onPointerUp, this);
        scene.input.on('pointermove', this.onPointerMove, this);
    }

    onPointerDown(pointer) {
        this.pointer = pointer;
        this.updateThumb(pointer);
    }

    onPointerUp() {
        this.pointer = null;
        this.thumb.setPosition(this.base.x, this.base.y);
        this.value = { x: 0, y: 0 };
    }

    onPointerMove(pointer) {
        if (this.pointer && this.pointer.id === pointer.id) {
            this.updateThumb(pointer);
        }
    }

    updateThumb(pointer) {
        const dx = pointer.x - this.base.x;
        const dy = pointer.y - this.base.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        if (distance > this.radius) {
            this.thumb.setPosition(
                this.base.x + Math.cos(angle) * this.radius,
                this.base.y + Math.sin(angle) * this.radius
            );
        } else {
            this.thumb.setPosition(pointer.x, pointer.y);
        }

        this.value = {
            x: Math.cos(angle) * Math.min(distance / this.radius, 1),
            y: Math.sin(angle) * Math.min(distance / this.radius, 1)
        };
    }

    createCursorKeys() {
        return {
            left: { isDown: this.value.x < -0.5 },
            right: { isDown: this.value.x > 0.5 },
            up: { isDown: this.value.y < -0.5 },
            down: { isDown: this.value.y > 0.5 }
        };
    }
}

class BaseScene extends Phaser.Scene {
    preloadAssets() {
        const timestamp = new Date().getTime();
        this.load.image('tiles', `assets/blockPack_tilesheet.png?v=${timestamp}`);
        this.load.spritesheet('player', `assets/main_menu.jfif?v=${timestamp}`, { frameWidth: 32, frameHeight: 48 });
    }

    createPlayerAnims() {
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
    }

    createJoystick() {
        // 检查是否在移动设备上
        let deviceOS = this.sys.game.device.os;
        this.isMobile = deviceOS.iOS || deviceOS.android;

        // 如果是在移动设备上，则创建虚拟摇杆
        if (true){//this.isMobile) {
            this.joystick = new VirtualJoystick(this, 100, this.cameras.main.height - 100, 50);
        }
    }

    updatePlayerMovement() {
        const cursors = this.joystick ? this.joystick.createCursorKeys() : this.cursors;

        if (cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.stop();
        }

        if (cursors.up.isDown) {
            this.player.setVelocityY(-160);
        } else if (cursors.down.isDown) {
            this.player.setVelocityY(160);
        } else {
            this.player.setVelocityY(0);
        }
    }

    update() {
        this.updatePlayerMovement();
    }
}

class MainScene extends BaseScene {
    constructor() {
        super({ key: 'MainScene' });
    }
    
    preload() {
        const timestamp = new Date().getTime();
        this.load.tilemapTiledJSON('magicAcademy', `assets/town.json?v=${timestamp}`);
        this.load.image('tiles', `assets/blockPack_tilesheet.png?v=${timestamp}`);
        this.preloadAssets();
    }

    create() {
        const map = this.make.tilemap({ key: 'magicAcademy' });
        const tileset = map.addTilesetImage('tileset', 'tiles');
        const layer = map.createLayer('Tile Layer 1', tileset, 0, 0);

        this.player = this.physics.add.sprite(100, 100, 'player');

        this.createPlayerAnims();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.createJoystick();

        // 碰撞设置
        this.physics.add.collider(this.player, layer);
        layer.setCollisionByExclusion([-1]);

        console.log('进入魔法学院');
    }
}

class BattleScene extends BaseScene {
    constructor() {
        super({ key: 'BattleScene' });
    }

    preload() {
        const timestamp = new Date().getTime();
        this.preloadAssets();
    }

    create() {
        const mapData = this.generateRandomMap(20, 20);
        const map = this.make.tilemap({ data: mapData, tileWidth: 32, tileHeight: 32 });
        const tileset = map.addTilesetImage('tileset', null, 32, 32);
        const layer = map.createLayer(0, tileset, 0, 0);

        this.player = this.physics.add.sprite(100, 100, 'player');

        this.createPlayerAnims();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.createJoystick();

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
            gravity: { y: 0 } // 无重力
        }
    },
    scene: [MainScene, BattleScene],
    parent: 'game-container',
    plugins: {}
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