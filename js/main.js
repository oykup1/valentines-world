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
    physics: { default: 'arcade', arcade: { gravity: { y:0 }, debug:true } },
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
    this.load.image('bench', 'assets/tiles/bench.png');
    this.load.image('fountain', 'assets/tiles/fountain.png');
    this.load.image('sign', 'assets/tiles/sign.png');
    this.load.image('logs', 'assets/tiles/logs.png');
    this.load.image('house', 'assets/tiles/house.png');
    this.load.image('church', 'assets/tiles/church.png');
    this.load.image('house1', 'assets/tiles/house1.png');
    this.load.image('blanket', 'assets/tiles/blanket.png');
    this.load.image('basket', 'assets/tiles/basket.png');
    this.load.image('flyer', 'assets/tiles/flyer.png');
    this.load.image('barn', 'assets/tiles/barn.png');
    this.load.image('barrel', 'assets/tiles/barrel.png');
    

    

 // RIGHT
this.load.image('right', 'assets/player/right.png');
this.load.image('right_walk', 'assets/player/right_walk.png');
this.load.image('right_walk1', 'assets/player/right_walk1.png');
this.load.image('right_walk2', 'assets/player/right_walk2.png');

// LEFT
this.load.image('left', 'assets/player/left.png');
this.load.image('left_walk', 'assets/player/left_walk.png');
this.load.image('left_walk1', 'assets/player/left_walk1.png');
this.load.image('left_walk2', 'assets/player/left_walk2.png');

// FORWARD
this.load.image('forward', 'assets/player/forward.png');
this.load.image('forward_walk', 'assets/player/forward_walk.png');
this.load.image('forward_walk1', 'assets/player/forward_walk1.png');

// BACK
this.load.image('back', 'assets/player/back.png');
this.load.image('back_walk', 'assets/player/back_walk.png');
this.load.image('back_walk1', 'assets/player/back_walk1.png');}

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
    this.trees = placeTrees(this);
    placeShrubs(this);
    placeFlowers(this);
    // Player (start facing forward)
    player = this.physics.add.sprite(
        243,
        264,
        'forward'
    )
    .setOrigin(0.5, 1)
    .setScale(0.5);
    player.body.setCollideWorldBounds(true);
    player.body.setSize(
    player.displayWidth * 0.75,
    player.displayHeight * 1.5
);

player.body.setOffset(
    player.displayWidth * 0.7,
    player.displayHeight * 0.15
);
//Decorations
    this.bench = placeBench(this, 340, 351);
    this.fountain = placeFountain(this, 350, 375);
    this.sign = placeSign(this, 264, 259);
    this.house = placeHouse(this, 183, 280);
    this.well = placeWell(this, 348, 107);
    placeLogs(this, 147, 270);
    this.church = placeChurch(this, 435, 107);
    this.house1 = placeHouse1(this, 192, 60);
    placeTiles(this, [{x:372, y:224}, {x:380, y:224}], 'blanket');
    placeBasket(this, 384, 219);
    this.flyer = placeFlyer(this, 353, 215);
    this.barn = placeBarn(this, 52, 386);
    placeBarrel(this, 213, 260)
    cursors = this.input.keyboard.createCursorKeys();
    const worldPixelWidth = WORLD_WIDTH * TILE_SIZE;
    const worldPixelHeight = WORLD_HEIGHT * TILE_SIZE;

this.physics.world.setBounds(0, 0, worldPixelWidth, worldPixelHeight);
this.cameras.main.setBounds(0, 0, worldPixelWidth, worldPixelHeight);
    // Camera
    const cam = this.cameras.main;
    cam.startFollow(player);
    cam.setZoom(SCALE);

   // WALK RIGHT
this.anims.create({
    key: 'walk_right',
    frames: [
        { key: 'right_walk' },
        { key: 'right_walk1' },
        { key: 'right_walk2' }
    ],
    frameRate: 8,
    repeat: -1
});

// WALK LEFT
this.anims.create({
    key: 'walk_left',
    frames: [
        { key: 'left_walk' },
        { key: 'left_walk1' },
        { key: 'left_walk2' }
    ],
    frameRate: 8,
    repeat: -1
});

// WALK FORWARD
this.anims.create({
    key: 'walk_forward',
    frames: [
        { key: 'forward_walk' },
        { key: 'forward_walk1' }
    ],
    frameRate: 8,
    repeat: -1
});

// WALK BACK
this.anims.create({
    key: 'walk_back',
    frames: [
        { key: 'back_walk' },
        { key: 'back_walk1' }
    ],
    frameRate: 8,
    repeat: -1
});
}

function update() {
    const speed = 100;
    player.body.setVelocity(0);
    console.log(player.x, player.y);
    player.setDepth(player.y);
   
    this.house.setDepth(this.house.y);
    this.well.setDepth(this.well.y);
    this.bench.setDepth(this.bench.y);
    this.trees.getChildren().forEach(tree => {
        tree.setDepth(tree.y)
    });
    this.fountain.setDepth(this.fountain.y);
    this.sign.setDepth(this.sign.y);
    this.church.setDepth(this.church.y);
    this.house1.setDepth(this.house1.y);
    this.flyer.setDepth(this.flyer.y);
    this.barn.setDepth(this.barn.y);
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

// Idle
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
    const group = scene.add.group();
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
            
            group.add(tree);
        }
    }
    return group;
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
/* ===================== FLOWER PLACEMENT ===================== */

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

function placeWell(scene, x, y) {
   const well = scene.physics.add.staticImage(x, y, 'well')
        .setOrigin(0.5,1)
        .setScale(1);
     
        well.body.updateFromGameObject();

        well.body.setSize(
         well.width * 0.7,
         well.height * 0.15
        );
        well.body.setOffset(
        well.width * 0.15,
        well.height * 0.8
        );

        scene.physics.add.collider(player, well);
        return well;
}
/* ===================== BENCH PLACEMENT ===================== */

 function placeBench(scene, x, y) {
  const bench = scene.physics.add.staticImage(x, y, 'bench')
        .setOrigin(0.5,1)       
        .setScale(0.2)
        .setDepth(9);
    bench.body.updateFromGameObject();

bench.body.setSize(
    bench.displayWidth,
    bench.displayHeight * 0.2
);
bench.body.setOffset(0, bench.displayHeight * 0.7);

    scene.physics.add.collider(player, bench);

    return bench;
}
/* ===================== FOUNTAIN PLACEMENT ===================== */

function placeFountain(scene, x, y) {
    const fountain = scene.physics.add.staticImage(x, y, 'fountain')
        .setOrigin(0.5, 1)   // bottom center anchor (important)
        .setScale(0.2);      // adjust if needed
        fountain.body.updateFromGameObject();

   const bodyWidth = fountain.displayWidth * 0.6;   // narrower than sprite
    const bodyHeight = fountain.displayHeight * 0.25; // VERY thin strip

    fountain.body.setSize(bodyWidth, bodyHeight);

    fountain.body.setOffset(
        (fountain.displayWidth - bodyWidth) / 2,   // center it
        fountain.displayHeight - bodyHeight        // push to bottom
    );

        scene.physics.add.collider(player, fountain);

    return fountain;
}
/* ===================== SIGN PLACEMENT ===================== */

function placeSign(scene, x, y) {
  const sign = scene.physics.add.staticImage(x, y, 'sign')
        .setOrigin(0.5,1)       
        .setScale(0.35);
        sign.body.updateFromGameObject();

        sign.body.setSize(
         sign.width * 0.08,
         sign.height * 0.15
        );
        sign.body.setOffset(
        sign.width * 0.22,
        sign.height * 0.17
        );
        scene.physics.add.collider(player, sign);

    return sign;
}
/* ===================== HOUSE PLACEMENT ===================== */
function placeHouse(scene, x, y) {
    const house = scene.physics.add.staticImage(x, y, 'house')
        .setOrigin(0.5,1)
        .setScale(0.6)
      
        house.body.updateFromGameObject();

        house.body.setSize(
         house.width * 0.4,
         house.height * 0.3
        );
        house.body.setOffset(
        house.width * 0.11,
        house.height * 0.2
        );
        scene.physics.add.collider(player, house);
        return house;
}
/* ===================== LOGS PLACEMENT ===================== */
function placeLogs(scene, x, y) {
    const logs = scene.physics.add.staticImage(x, y, 'logs')
        .setOrigin(0,1)
        .setScale(0.3);
     
        logs.body.updateFromGameObject();

        logs.body.setSize(
         logs.width * 0.2,
         logs.height * 0.15
        );
        logs.body.setOffset(
        logs.width * 0.07,
        logs.height * 0.13
        );

        scene.physics.add.collider(player, logs);
        return logs;
}
/* ===================== CHURCH PLACEMENT ===================== */
function placeChurch(scene, x, y) {
    const church = scene.physics.add.staticImage(x, y, 'church')
        .setOrigin(0.5,0.8)
        .setScale(0.5)
      
        church.body.updateFromGameObject();

        church.body.setSize(
         church.width * 0.35,
         church.height * 0.2
        );
        church.body.setOffset(
        church.width * 0.09,
        church.height * 0.23
        );
        scene.physics.add.collider(player, church);
        return church;
}
/* ===================== HOUSE1 PLACEMENT ===================== */
function placeHouse1(scene, x, y) {
    const house1 = scene.physics.add.staticImage(x, y, 'house1')
        .setOrigin(0.5,1)
        .setScale(0.6)
      
        house1.body.updateFromGameObject();

        house1.body.setSize(
         house1.width * 0.4,
         house1.height * 0.3
        );
        house1.body.setOffset(
        house1.width * 0.11,
        house1.height * 0.2
        );
        scene.physics.add.collider(player, house1);
        return house1;
}
/* ===================== BLANKET PLACEMENT ===================== */
function placeTiles(scene, coords, texture) {
    coords.forEach(coord => {
        scene.physics.add.staticImage(
            coord.x,
            coord.y,
            texture
        )
        .setScale(0.3)
        
    });
    }
    /* ===================== BASKET PLACEMENT ===================== */
function placeBasket(scene, x, y) {
    const basket = scene.physics.add.staticImage(x, y, 'basket')
        .setOrigin(0.5,1)
        .setScale(0.15)
      
        basket.body.updateFromGameObject();

    
        return basket;
}
/* ===================== FLYER PLACEMENT ===================== */
function placeFlyer(scene, x, y) {
    const flyer = scene.physics.add.staticImage(x, y, 'flyer')
        .setOrigin(0.5,1)
        .setScale(0.6)
      
        flyer.body.updateFromGameObject();

        return flyer;
}
/* ===================== BARN PLACEMENT ===================== */
function placeBarn(scene, x, y) {
    const barn = scene.physics.add.staticImage(x, y, 'barn')
        .setOrigin(0.5,1)
        .setScale(0.6)
      
        barn.body.updateFromGameObject();

        barn.body.setSize(
         barn.width * 0.4,
         barn.height * 0.3
        );
        barn.body.setOffset(
        barn.width * 0.11,
        barn.height * 0.2
        );
        scene.physics.add.collider(player, barn);
        return barn;
}
/* ===================== BARREL PLACEMENT ===================== */
function placeBarrel(scene, x, y) {
    const barrel = scene.physics.add.staticImage(x, y, 'barrel')
        .setOrigin(0.5,1)
        .setScale(0.3)
      
        barrel.body.updateFromGameObject();
        barrel.body.setSize(
         barrel.width * 0.2,
         barrel.height * 0.1
        );
        barrel.body.setOffset(
        barrel.width * 0.2,
        barrel.height * 0.2
        );
        scene.physics.add.collider(player, barrel);
        return barrel;
}