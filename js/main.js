import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://gzlxcythoelqxhgemujs.supabase.co';
const supabaseKey = 'sb_publishable_G7VNJke77qxqMmwR3RDb5w_CaWu0WKZ';

const supabaseClient = createClient(supabaseUrl, supabaseKey);
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
    this.load.image('grass', '/assets/tiles/Grass_1_Middle.png');
    this.load.image('path', '/assets/tiles/Beach_Decor_Tiles.png');
    this.load.image('tree', '/assets/tiles/Peach_Tree.png');
    this.load.image('well', '/assets/tiles/Well.png');
    this.load.image('background', '/assets/tiles/sky.jpg');
    this.load.image('shrub', '/assets/tiles/shrub.png');
    this.load.image('flower_red', '/assets/tiles/flower_red.png');
    this.load.image('flower_pink', '/assets/tiles/flower_pink.png');
    this.load.image('flower_purple', '/assets/tiles/flower_purple.png');
    this.load.image('bench', '/assets/tiles/bench.png');
    this.load.image('fountain', '/assets/tiles/fountain.png');
    this.load.image('sign', '/assets/tiles/sign.png');
    this.load.image('logs', '/assets/tiles/logs.png');
    this.load.image('house', '/assets/tiles/house.png');
    this.load.image('church', '/assets/tiles/church.png');
    this.load.image('house1', '/assets/tiles/house1.png');
    this.load.image('blanket', '/assets/tiles/blanket.png');
    this.load.image('basket', '/assets/tiles/basket.png');
    this.load.image('flyer', '/assets/tiles/flyer.png');
    this.load.image('barn', '/assets/tiles/barn.png');
    this.load.image('barrel', '/assets/tiles/barrel.png');
    this.load.image('fence', '/assets/tiles/fence.png');
    this.load.image('fence1', '/assets/tiles/fence1.png');
    this.load.image('pig', '/assets/tiles/pig.png');
    this.load.image('chicken', '/assets/tiles/chicken.png');
    this.load.image('stump', '/assets/tiles/stump.png');
    this.load.image('rock', '/assets/tiles/rock.png');
    this.load.image('letter', '/assets/tiles/letter.png');
    this.load.image('prompt', '/assets/tiles/prompt.png');
    this.load.image('pressE', '/assets/tiles/PressE.png');


    

 // RIGHT
this.load.image('right', '/assets/player/right.png');
this.load.image('right_walk', '/assets/player/right_walk.png');
this.load.image('right_walk1', '/assets/player/right_walk1.png');
this.load.image('right_walk2', '/assets/player/right_walk2.png');

// LEFT
this.load.image('left', '/assets/player/left.png');
this.load.image('left_walk', '/assets/player/left_walk.png');
this.load.image('left_walk1', '/assets/player/left_walk1.png');
this.load.image('left_walk2', '/assets/player/left_walk2.png');

// FORWARD
this.load.image('forward', '/assets/player/forward.png');
this.load.image('forward_walk', '/assets/player/forward_walk.png');
this.load.image('forward_walk1', '/assets/player/forward_walk1.png');

// BACK
this.load.image('back', '/assets/player/back.png');
this.load.image('back_walk', '/assets/player/back_walk.png');
this.load.image('back_walk1', '/assets/player/back_walk1.png');}

 function create() {
    console.log("Create started");
    this.letterMessages = ["💌","💌","💌","💌","💌","💌"];

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

    this.player = this.physics.add.sprite(
        243,
        264,
        'forward'
    )
    .setOrigin(0.5, 1)
    .setScale(0.5);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(
    this.player.displayWidth * 0.75,
    this.player.displayHeight * 1.5
);

    this.player.body.setOffset(
    this.player.displayWidth * 0.7,
    this.player.displayHeight * 0.15
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
    placeBlanket(this, [{x:372, y:224}, {x:380, y:224}], 'blanket');
    placeBasket(this, 384, 219);
    this.flyer = placeFlyer(this, 353, 215);
    this.barn = placeBarn(this, 52, 386);
    placeBarrel(this, 213, 260);
    placeFence(this, [{x:244, y:20}, {x:118, y:32}, {x:118, y:56}, {x:175, y:409}, {x:175, y:349}, {x:17, y:349}, {x:17, y:371}, {x:17, y:392}], 'fence');
    placeFence1(this, [{x:89, y:322},{x:70, y:322}, {x:47, y:322},{x:27, y:322},{x:108, y:322}, {x:127, y:322}, {x:146, y:322}, {x:165, y:322}, {x:92, y:409},{x:72, y:409}, {x:52, y:409},{x:32, y:409}, {x:108, y:409}, {x:127, y:409}, {x:146, y:409}, {x:165, y:409}], 'fence1');
    placePig(this, 110, 344);
    placeChicken(this, 155, 391);
    placeStump(this, 128, 151);
    placeRock(this, 426, 336);


this.nearLetter = null;
this.promptOpen = false;
this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

//

    cursors = this.input.keyboard.createCursorKeys();
    const worldPixelWidth = WORLD_WIDTH * TILE_SIZE;
    const worldPixelHeight = WORLD_HEIGHT * TILE_SIZE;

this.physics.world.setBounds(0, 0, worldPixelWidth, worldPixelHeight);
this.cameras.main.setBounds(0, 0, worldPixelWidth, worldPixelHeight);
    // Camera
    const cam = this.cameras.main;
    cam.startFollow(this.player);
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
this.loadWorldData = loadWorldData.bind(this);
this.loadWorldData();
}


async function loadWorldData() {

    const worldId = window.location.pathname.split("/game/")[1];

    if (!worldId) return;

    const { data, error } = await supabaseClient
        .from("valentines_worlds")
        .select("prompts")
        .eq("id", worldId)
        .single();

    if (error || !data) {
        console.error("Error loading world:", error);
        return;
    } else {
        this.letterMessages = data.prompts.map(p => ({
            question: p.question,
            answer: p.answer}));
    }
    //Lettter Placement
    this.letters = placeLetters(this, [
        {x: 140, y: 45},
        {x: 350, y: 97},
        {x: 33, y: 405},
        {x: 443, y: 419},
        {x: 446, y: 245},
        {x: 342, y: 347}
    ]);
    this.physics.add.overlap(
    this.player,
    this.letters,
    function(player, letter){
        this.nearLetter = letter;
    },
    null,
    this
);

   
}

function update() {
     // Freeze everything when prompt is open
    if (!this.player) return;

    if (this.promptOpen) {

        if (Phaser.Input.Keyboard.JustDown(this.keyESC)) {
            closePrompt.call(this);
        }

        return;
    }
    //Prompt Container
    if (this.promptOpen && this.promptContainer) {
    if (this.scrollKeys.up.isDown) {
        this.promptContainer.y += this.scrollSpeed;
    } else if (this.scrollKeys.down.isDown) {
        this.promptContainer.y -= this.scrollSpeed;
    }
    }
// Show Press E icon
if (this.nearLetter && !this.promptOpen) {

    if (!this.pressEIcon) {
        this.pressEIcon = this.add.image(
            this.nearLetter.x,
            this.nearLetter.y +20,
            'pressE'
        )
        .setDepth(999)
        .setScale(0.09)
        .setScrollFactor(1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        openPrompt.call(this);
    }
}
else {
    if (this.pressEIcon) {
        this.pressEIcon.destroy();
        this.pressEIcon = null;
    }
}


    //Depth and Player
    const speed = 100;
    this.player.body.setVelocity(0);
    this.player.setDepth(this.player.y);



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
    this.player.body.setVelocityX(-speed);
    this.player.anims.play('walk_left', true);
    moving = true;
}
else if (cursors.right.isDown) {
    this.player.body.setVelocityX(speed);
    this.player.anims.play('walk_right', true);
    moving = true;
}
else if (cursors.up.isDown) {
    this.player.body.setVelocityY(-speed);
    this.player.anims.play('walk_back', true);
    moving = true;
}
else if (cursors.down.isDown) {
    this.player.body.setVelocityY(speed);
    this.player.anims.play('walk_forward', true);
    moving = true;
}

// Idle
if (!moving) {
    const last = this.player.anims.currentAnim?.key;

    switch (last) {
        case 'walk_left': this.player.setTexture('left'); break;
        case 'walk_right': this.player.setTexture('right'); break;
        case 'walk_back': this.player.setTexture('back'); break;
        default: this.player.setTexture('forward');
    }

    this.player.anims.stop();
}
}
function openPrompt() {

     this.promptOpen = true;

    // Stop player
    this.player.body.setVelocity(0);
    this.player.body.enable = false;

    // Get the question + answer object
    const promptData = this.nearLetter?.getData('prompts');
    const question = promptData?.question || "";
    const answer = promptData?.answer || "";

    // Remove Press E icon if it exists
    if (this.pressEIcon) {
        this.pressEIcon.destroy();
        this.pressEIcon = null;
    }

    // Remove the letter after opening
    if (this.nearLetter) {
        this.nearLetter.destroy();
        this.nearLetter = null;
    }

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Overlay background
    this.overlay = this.add.rectangle(
        0, 0,
        this.scale.width,
        this.scale.height,
        0x000000,
        0.6
    )
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(1000);

    // Scroll image
    this.promptImage = this.add.image(centerX, centerY, 'prompt')
        .setOrigin(0.5, 0.5)
        .setScale(0.31)
        .setDepth(1001)
        .setScrollFactor(0);

    // Container to hold text
    const containerHeight = 80; // visible height of the scroll content
    this.promptContainer = this.add.container(centerX, centerY)
        .setDepth(1002)
        .setScrollFactor(0);

    // Question text (bigger)
    this.promptQuestionText = this.add.text(
        0, -containerHeight / 2,
        question,
        {
            fontSize: '16px',
            color: '#000',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: 200 }
        }
    )
    .setOrigin(0.5)
    .setScale(0.4);

    // Answer text (smaller, below question)
    this.promptAnswerText = this.add.text(
        0, this.promptQuestionText.height + 5 - containerHeight / 2,
        answer,
        {
            fontSize: '12px',
            color: '#000',
            align: 'center',
            wordWrap: { width: 200 }
        }
    )
    .setOrigin(0.5)
    .setScale(0.4);

    // Add texts to container
    this.promptContainer.add([this.promptQuestionText, this.promptAnswerText]);

    // Mask so text outside the scroll doesn't show
    const maskShape = this.add.graphics()
        .setScrollFactor(0); // important: mask must not scroll with world
    maskShape.fillStyle(0xffffff,0);
    maskShape.fillRect(
        centerX - 90,          // left
        centerY - containerHeight / 2, // top
        180,                   // width
        containerHeight        // height
    );
    const mask = maskShape.createGeometryMask();
    this.promptContainer.setMask(mask);

    // Mouse wheel scroll
    this.input.on('wheel', (pointer, deltaX, deltaY) => {
        if (!this.promptOpen || !this.promptContainer) return;

        this.promptContainer.y -= deltaY * 0.2; // adjust scroll speed

        // Clamp boundaries
        const textHeight = this.promptContainer.getAll().reduce((h, t) => h + t.height + 5, 0);
        const minY = centerY - (textHeight - containerHeight) / 2;
        const maxY = centerY;
        if (this.promptContainer.y < minY) this.promptContainer.y = minY;
        if (this.promptContainer.y > maxY) this.promptContainer.y = maxY;
    });

    // Optional: arrow keys scrolling
    this.scrollSpeed = 1;
    this.scrollKeys = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S
    });
}


function closePrompt() {

    this.promptOpen = false;

    // Re-enable player
    this.player.body.enable = true;

    if (this.overlay) this.overlay.destroy();
    if (this.promptImage) this.promptImage.destroy();
    if (this.promptText) this.promptText.destroy();
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

        scene.physics.add.collider(scene.player, well);
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

    scene.physics.add.collider(scene.player, bench);

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

        scene.physics.add.collider(scene.player, fountain);

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
        scene.physics.add.collider(scene.player, sign);

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
        scene.physics.add.collider(scene.player, house);
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

        scene.physics.add.collider(scene.player, logs);
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
        scene.physics.add.collider(scene.player, church);
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
        scene.physics.add.collider(scene.player, house1);
        return house1;
}
/* ===================== BLANKET PLACEMENT ===================== */
function placeBlanket(scene, coords, texture) {
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
        .setScale(0.5)
      
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
         barn.width * 0.38,
         barn.height * 0.3
        );
        barn.body.setOffset(
        barn.width * 0.13,
        barn.height * 0.21
        );
        scene.physics.add.collider(scene.player, barn);
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
        scene.physics.add.collider(scene.player, barrel);
        return barrel;
}
/* ===================== FENCE-VERTICAL PLACEMENT ===================== */
function placeFence(scene, coords, texture) {
     coords.forEach(coord => {

        const fence = scene.physics.add.staticImage(
            coord.x,
            coord.y,
            texture
        )
        .setOrigin(0.5, 1)
        .setScale(0.25);

        fence.body.updateFromGameObject();

        fence.body.setSize(
            fence.width * 0.2,
            fence.height * 0.15
        );

        fence.body.setOffset(
            fence.width * 0.1,
            fence.height * 0.1
        );
        scene.physics.add.collider(scene.player, fence);
        fence.setDepth(fence.y);
    });
}
/* ===================== FENCE-HORIZONTAL PLACEMENT ===================== */
function placeFence1(scene, coords, texture) {
     coords.forEach(coord => {

        const fence1 = scene.physics.add.staticImage(
            coord.x,
            coord.y,
            texture
        )
        .setOrigin(0.5, 1)
        .setScale(0.21);

        fence1.body.updateFromGameObject();

        fence1.body.setSize(
            fence1.width * 0.16,
            fence1.height * 0.15
        );

        fence1.body.setOffset(
            fence1.width * 0.03,
            fence1.height * 0.03
        );
        scene.physics.add.collider(scene.player, fence1);
        fence1.setDepth(fence1.y);
    });
}
/* ===================== PIG PLACEMENT ===================== */
function placePig(scene, x, y) {
    const pig = scene.physics.add.staticImage(x, y, 'pig')
        .setOrigin(0.5,1)
        .setScale(0.45)
      
        pig.body.updateFromGameObject();

        return pig;
}
/* ===================== CHICKEN PLACEMENT ===================== */
function placeChicken(scene, x, y) {
    const chicken = scene.physics.add.staticImage(x, y, 'chicken')
        .setOrigin(0.5,1)
        .setScale(0.25)
      
        chicken.body.updateFromGameObject();

        return chicken;
}
/* ===================== STUMP PLACEMENT ===================== */
function placeStump(scene, x, y) {
    const stump = scene.physics.add.staticImage(x, y, 'stump')
        .setOrigin(0.5,1)
        .setScale(0.3)
      
        stump.body.updateFromGameObject();

        return stump;
}
/* ===================== ROCK PLACEMENT ===================== */
function placeRock(scene, x, y,) {
    const rock = scene.physics.add.staticImage(x, y, 'rock')
        .setOrigin(0.5,1)
        .setScale(0.25)
      
        rock.body.updateFromGameObject();

        return rock;
}
/* ===================== LETTER PLACEMENT ===================== */
function placeLetters(scene, coords) {

    const group = scene.physics.add.staticGroup();

    coords.forEach((coord, index) => {

        const letter = group.create(coord.x, coord.y, 'letter')
            .setOrigin(0.5, 1)
            .setScale(0.02);

        letter.setData('prompts', scene.letterMessages[index]);

        letter.body.updateFromGameObject();
        letter.setDepth(letter.y);
    });

    group.refresh();
    return group;
}