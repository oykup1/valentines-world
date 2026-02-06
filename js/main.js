const TILE_SIZE = 10;
const WORLD_WIDTH = 50;
const WORLD_HEIGHT = 50;
const SCALE = 3;

/* ===================== WORLD SEED ===================== */
// Change this string → different world
// Keep it the same → frozen layout
const WORLD_SEED = 'butt';

let world = [];
let tileType = [];
let player;
let cursors;
let rng;

const config = {
    type: Phaser.AUTO,
    width: 320 * SCALE,
    height: 180 * SCALE,
    pixelArt: true,
   // backgroundColor: 0xebb4d8,
    physics: { default: 'arcade', arcade: { gravity: { y:0 }, debug:false } },
    scene: { preload, create, update }
};

new Phaser.Game(config);

function preload() {
    this.load.image('grass', 'assets/tiles/Grass_1_Middle.png');
    this.load.image('path', 'assets/tiles/Beach_Decor_Tiles.png');
    this.load.image('tree', 'assets/tiles/Peach_Tree.png');
    this.load.image('well', 'assets/tiles/Well.png');
    this.load.image('background', 'assets/tiles/sky.jpg');
    this.load.image('shrub', 'assets/tiles/shrub.png');
    this.load.image('flower_red', 'assets/tiles/flower_red.png');
    this.load.image('flower_pink', 'assets/tiles/flower_pink.png');
    this.load.image('flower_purple', 'assets/tiles/flower_purple.png');

 // Player animations (spritesheets)
    this.load.spritesheet('left_walk', 'assets/player/left_walk.png', { frameWidth: 16, frameHeight: 24 });
    this.load.image('left', 'assets/player/left.png');

    this.load.spritesheet('right_walk', 'assets/player/right_walk.png', { frameWidth: 16, frameHeight: 24 });
    this.load.image('right', 'assets/player/right.png');

    this.load.spritesheet('forward_walk', 'assets/player/forward_walk.png', { frameWidth: 16, frameHeight: 24 });
    this.load.image('forward', 'assets/player/forward.png');

    this.load.spritesheet('back_walk', 'assets/player/back_walk.png', { frameWidth: 16, frameHeight: 24 });
    this.load.image('back', 'assets/player/back.png');}

function create() {
    rng = new Phaser.Math.RandomDataGenerator([WORLD_SEED]);
    this.add.image(500, 250, 'background')
    //.setOrigin(0)
    .setScrollFactor(0)
    .setDepth(-100)
    .setScale(0.65);    
    // Base grass
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        world[y] = [];
        tileType[y] = [];

        for (let x = 0; x < WORLD_WIDTH; x++) {
            const tile = this.add.image(x * TILE_SIZE, y * TILE_SIZE, 'grass')
                .setOrigin(0)
                .setDepth(0);

            world[y][x] = tile;
            tileType[y][x] = 'grass';
        }
    }

    // Paths
    const branchPoint = createMainPath();
    createBranchPath(branchPoint.x, branchPoint.y);

    // Decorations
    placeWell(this);
    placeTrees(this);
    placeShrubs(this);
    placeFlowers(this);

    // Player (start facing forward)
    player = this.physics.add.sprite(
        10 * TILE_SIZE,
        10 * TILE_SIZE,
        'forward'
    )
    .setOrigin(0.5, 1)
    .setScale(0.5);
    player.body.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();

    // Camera
    const cam = this.cameras.main;
    cam.startFollow(player);
    cam.setZoom(SCALE);

    // Animations
    this.anims.create({
        key: 'walk_left',
        frames: this.anims.generateFrameNumbers('left_walk'),
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: 'walk_right',
        frames: this.anims.generateFrameNumbers('right_walk'),
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: 'walk_forward',
        frames: this.anims.generateFrameNumbers('forward_walk'),
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: 'walk_back',
        frames: this.anims.generateFrameNumbers('back_walk'),
        frameRate: 8,
        repeat: -1
    });
}

function update() {
    const speed = 100;
    player.body.setVelocity(0);

    let moving = false;

    if (cursors.left.isDown) {
        player.body.setVelocityX(-speed);
        player.anims.play('walk_left', true);
        moving = true;
    }
    else if (cursors.right.isDown) {
        player.body.setVelocityX(speed);
        player.anims.play('walk_right', true);
        moving = true;
    }
    else if (cursors.up.isDown) {
        player.body.setVelocityY(-speed);
        player.anims.play('walk_back', true);
        moving = true;
    }
    else if (cursors.down.isDown) {
        player.body.setVelocityY(speed);
        player.anims.play('walk_forward', true);
        moving = true;
    }

    // Idle frames
    if (!moving) {
        const last = player.anims.currentAnim?.key;

        switch (last) {
            case 'walk_left': player.setTexture('left'); break;
            case 'walk_right': player.setTexture('right'); break;
            case 'walk_back': player.setTexture('back'); break;
            default: player.setTexture('forward');
        }

        player.anims.stop();
    }
}

/* ===================== PATH GENERATION ===================== */

function createMainPath() {
    const PATH_WIDTH = 3;
    let x = Math.floor(WORLD_WIDTH / 2);
    let y = 0;
    let branchX = 0, branchY = 0;
    let horizontalDirection = -1;
    let segmentLength = 0;
    const SEGMENT_LENGTH = 8;

    while (y < WORLD_HEIGHT) {
        for (let w = 0; w < PATH_WIDTH; w++) {
            if (x + w >= 0 && x + w < WORLD_WIDTH) {
                world[y][x + w].setTexture('path');
                tileType[y][x + w] = 'path';
            }
        }

        if (y === Math.floor(WORLD_HEIGHT / 2)) {
            branchX = x;
            branchY = y;
        }

        segmentLength++;
        if (segmentLength >= SEGMENT_LENGTH) {
            segmentLength = 0;
            horizontalDirection *= -1;
        }

        y++;

        if (y % 2 === 0) {
            x += horizontalDirection;
            x = Phaser.Math.Clamp(x, 2, WORLD_WIDTH - PATH_WIDTH - 2);
        }
    }

    return { x: branchX, y: branchY };
}

function createBranchPath(startX, startY) {
    const PATH_WIDTH = 3;
    let x = startX;
    let y = startY;
    let verticalDirection = 1;
    let segmentLength = 0;
    const SEGMENT_LENGTH = 6;

    while (x > 0) {
        for (let w = 0; w < PATH_WIDTH; w++) {
            if (y + w >= 0 && y + w < WORLD_HEIGHT) {
                world[y + w][x].setTexture('path');
                tileType[y + w][x] = 'path';
            }
        }

        segmentLength++;
        if (segmentLength >= SEGMENT_LENGTH) {
            segmentLength = 0;
            verticalDirection *= -1;
        }

        x--;

        if (x % 2 === 0) {
            y += verticalDirection;
            y = Phaser.Math.Clamp(y, 2, WORLD_HEIGHT - PATH_WIDTH - 2);
        }
    }
}

/* ===================== TREE PLACEMENT ===================== */

function placeTrees(scene) {
    const TREE_CHANCE = 0.04;

    for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            if (tileType[y][x] !== 'grass') continue;
            if (rng.frac() > TREE_CHANCE) continue;

            const tree = scene.add.image(
                x * TILE_SIZE + TILE_SIZE / 2,
                y * TILE_SIZE + TILE_SIZE,
                'tree'
            );

            tree.setOrigin(0.5, 1);
            tree.setScale(1);
            tree.setDepth(10);
        }
    }
}
/* ===================== SHRUB PLACEMENT ===================== */

function placeShrubs(scene) {
    const SHRUB_CHANCE = 0.10; // shrubs appear more often than trees

    for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            if (tileType[y][x] !== 'grass') continue; // only on grass
            if (rng.frac() > SHRUB_CHANCE) continue;

            const shrub = scene.add.image(
                x * TILE_SIZE + TILE_SIZE / 2,
                y * TILE_SIZE + TILE_SIZE,
                'shrub' // make sure you have a shrub sprite
            );

            shrub.setOrigin(0.5, 1); // bottom center
            shrub.setScale(0.2);     // smaller than trees
            shrub.setDepth(0);       // slightly lower depth than trees
        }
    }
}
function placeFlowers(scene) {
    const flowerColors = ['flower_red', 'flower_pink', 'flower_purple',]; // your sprite keys
    const SPACING = 3; // try 6, 8, 10 etc.

    for (let y = 0; y < WORLD_HEIGHT; y += SPACING) {
        for (let x = 0; x < WORLD_WIDTH; x += SPACING) {

            // checkerboard inside the spaced grid
            if (((x / SPACING) + (y / SPACING)) % 2 !== 0) continue;

            if (tileType[y][x] !== 'grass') continue;

            const color = flowerColors[Math.floor(rng.frac() * flowerColors.length)];

            const flower = scene.add.image(
                x * TILE_SIZE + TILE_SIZE / 2,
                y * TILE_SIZE + TILE_SIZE,
                color
            );

            flower.setOrigin(0.5, 1); // bottom center
            flower.setScale(0.15); // random size between 0.3-0.5
            flower.setDepth(0); // just above grass but below shrubs/trees
        }
    }
}
/* ===================== WELL PLACEMENT ===================== */

function placeWell(scene) {
    let placed = false;

    for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            if (placed) return;
            if (tileType[y][x] !== 'grass') continue;
            if (rng.frac() > 0.002) continue;

            const well = scene.add.image(
                x * TILE_SIZE + TILE_SIZE / 2,
                y * TILE_SIZE + TILE_SIZE,
                'well'
            );

            well.setOrigin(0.5, 1);
            well.setScale(1);
            well.setDepth(9);

            placed = true;
        }
    }
}
