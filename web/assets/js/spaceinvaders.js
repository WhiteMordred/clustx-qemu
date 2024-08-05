const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const ammoElement = document.getElementById('ammo');
const levelElement = document.getElementById('level');
const restartButton = document.getElementById('restartButton');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const playerWidth = 50;
const playerHeight = 30;
let playerX = (canvasWidth - playerWidth) / 2;
let playerY = canvasHeight - playerHeight - 10;

const playerSpeed = 5;
const bulletSpeed = 7;
const initialInvaderSpeed = 2;
let invaderSpeed = initialInvaderSpeed;
const invaderMinWidth = 20;
const invaderMaxWidth = 100;
const invaderHeight = 20;
const invaderSpawnInterval = 1000;

let invaders = [];
let bullets = [];
let rightPressed = false;
let leftPressed = false;
let spacePressed = false;
let score = 0;
let ammo = 500;
let level = 1;

let gameInterval;
let spawnInterval;
let specialBrickInterval;
let logoBrick = null;
let logoImage = new Image();
logoImage.src = './assets/img/logo/logo.png';

const colors = {
    1: '#0f0', // Green
    5: '#f00', // Red
    10: '#800080', // Purple
    ammo: '#ff0', // Yellow
};

function updateInfo() {
    scoreElement.textContent = score;
    ammoElement.textContent = ammo;
    levelElement.textContent = level;
}

function resetGame() {
    playerX = (canvasWidth - playerWidth) / 2;
    invaders = [];
    bullets = [];
    score = 0;
    ammo = 500;
    invaderSpeed = 2;
    level = 1;
    logoBrick = null;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    clearInterval(specialBrickInterval);
    startGame();
}

function createInvader() {
    const invaderWidth = Math.random() * (invaderMaxWidth - invaderMinWidth) + invaderMinWidth;
    const invaderX = Math.random() * (canvasWidth - invaderWidth);
    const isAmmo = Math.random() < 0.1; // 10% chance to be an ammo block
    const points = isAmmo ? 'ammo' : invaderWidth < 40 ? 10 : invaderWidth < 80 ? 5 : 1; // Points based on width
    invaders.push({ x: invaderX, y: 0, width: invaderWidth, height: invaderHeight, points: points });
}

function createLogoBrick() {
    const invaderX = Math.random() * (canvasWidth - 70); // Ensure the brick stays within bounds
    logoBrick = { x: invaderX, y: 0, width: 70, height: 70, points: 'logo' };
    invaders.push(logoBrick);
}

function moveInvaders() {
    for (let i = 0; i < invaders.length; i++) {
        invaders[i].y += invaderSpeed;
        if (invaders[i].y > canvasHeight) {
            invaders.splice(i, 1);
            i--;
        }
    }
}

function drawPlayer() {
    context.fillStyle = '#00f';
    context.beginPath();
    context.moveTo(playerX, playerY);
    context.lineTo(playerX + playerWidth / 2, playerY - playerHeight);
    context.lineTo(playerX + playerWidth, playerY);
    context.closePath();
    context.fill();
}

function drawInvaders() {
    for (let i = 0; i < invaders.length; i++) {
        if (invaders[i].points === 'logo') {
            context.fillStyle = 'orange';
            context.fillRect(invaders[i].x, invaders[i].y, invaders[i].width, invaders[i].height);
            const logoX = invaders[i].x + (invaders[i].width - 55) / 2;
            const logoY = invaders[i].y + (invaders[i].height - 55) / 2;
            context.drawImage(logoImage, logoX, logoY, 55, 55);
        } else {
            context.fillStyle = colors[invaders[i].points];
            context.fillRect(invaders[i].x, invaders[i].y, invaders[i].width, invaders[i].height);
        }
    }
}

function movePlayer() {
    if (rightPressed && playerX < canvasWidth - playerWidth) {
        playerX += playerSpeed;
    } else if (leftPressed && playerX > 0) {
        playerX -= playerSpeed;
    }
}

function shootBullet() {
    if (ammo > 0) {
        bullets.push({ x: playerX + playerWidth / 2 - 2.5, y: playerY, status: 1 });
        ammo--;
        updateInfo();
    }
}

function drawBullets() {
    context.fillStyle = '#ff0';
    for (let i = 0; i < bullets.length; i++) {
        if (bullets[i].status === 1) {
            context.fillRect(bullets[i].x, bullets[i].y, 5, 10);
            bullets[i].y -= bulletSpeed;
            if (bullets[i].y < 0) {
                bullets[i].status = 0;
            }
        }
    }
}

function detectBulletCollisions() {
    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < invaders.length; j++) {
            if (bullets[i].status === 1 && 
                bullets[i].x > invaders[j].x && 
                bullets[i].x < invaders[j].x + invaders[j].width && 
                bullets[i].y > invaders[j].y && 
                bullets[i].y < invaders[j].y + invaders[j].height) {
                bullets[i].status = 0;
                if (invaders[j].points !== 'ammo' && invaders[j].points !== 'logo') {
                    score += invaders[j].points;
                    invaders.splice(j, 1);
                } else if (invaders[j].points === 'logo') {
                    score += 1000;
                    invaderSpeed *= 1.02; // Increase speed by 2% for more gradual increase
                    level++;
                    invaders.splice(j, 1);
                    startGame();
                }
                updateInfo();
                break;
            }
        }
    }
}

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function keyDownHandler(event) {
    if (event.key === 'Right' || event.key === 'ArrowRight') {
        rightPressed = true;
    } else if (event.key === 'Left' || event.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (event.key === ' ' || event.key === 'Spacebar') {
        spacePressed = true;
    }
}

function keyUpHandler(event) {
    if (event.key === 'Right' || event.key === 'ArrowRight') {
        rightPressed = false;
    } else if (event.key === 'Left' || event.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (event.key === ' ' || event.key === 'Spacebar') {
        spacePressed = false;
        shootBullet();
    }
}

function detectCollisions() {
    for (let i = 0; i < invaders.length; i++) {
        if (playerX < invaders[i].x + invaders[i].width &&
            playerX + playerWidth > invaders[i].x &&
            playerY < invaders[i].y + invaders[i].height &&
            playerY + playerHeight > invaders[i].y) {
            if (invaders[i].points === 'ammo') {
                ammo += 100;
                invaders.splice(i, 1);
            } else if (invaders[i].points !== 'logo') {
                resetGame();
            }
            updateInfo();
        }
    }
}

function draw() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    drawPlayer();
    drawInvaders();
    drawBullets();
    movePlayer();
    moveInvaders();
    detectBulletCollisions();
    detectCollisions();
}

function startGame() {
    gameInterval = setInterval(draw, 20);
    spawnInterval = setInterval(createInvader, invaderSpawnInterval);
    specialBrickInterval = setInterval(createLogoBrick, 30000); // Create logo brick every 30 seconds
    updateInfo();
}

restartButton.addEventListener('click', resetGame);

startGame();