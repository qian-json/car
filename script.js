const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = (canvas.width = 600);
const CANVAS_HEIGHT = (canvas.height = 600);
const BACKGROUND_WIDTH = 5620;
const BACKGROUND_HEIGHT = 4900;
const backgroundImage = new Image();
backgroundImage.src =
  "https://media.istockphoto.com/id/1333794966/vector/top-down-racing-circuit-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=fEvS411Mvc2TSmAc0zULCX1_yvZZXTV_1Zsz99_ND0A=";

const MOVE_SPEED = 0.2;
const MAX_SPEED = 10;
const PLAYER_SIZE = 50;

const PLAYER_CANVAS = CANVAS_WIDTH / 2 - PLAYER_SIZE / 2;

let x = 200;
let y = 200;

let speedX = 0;
let speedY = 0;

let pressedW = false;
let pressedA = false;
let pressedS = false;
let pressedD = false;

let touchingBorder = {left: false, right: false, top: false, bottom: false};

window.addEventListener(
  "keydown",
  e => {
    switch (e.key) {
      case "w":
        pressedW = true;
        break;
      case "a":
        pressedA = true;
        break;
      case "s":
        pressedS = true;
        break;
      case "d":
        pressedD = true;
        break;
    }
  },
  false
);

window.addEventListener(
  "keyup",
  e => {
    switch (e.key) {
      case "w":
        pressedW = false;
        break;
      case "a":
        pressedA = false;
        break;
      case "s":
        pressedS = false;
        break;
      case "d":
        pressedD = false;
        break;
    }
  },
  false
);

function handleKeyPress() {
  if (pressedW) speedY = Math.max(-MAX_SPEED, speedY - MOVE_SPEED);
  if (pressedA) speedX = Math.max(-MAX_SPEED, speedX - MOVE_SPEED);
  if (pressedS) speedY = Math.min(MAX_SPEED, speedY + MOVE_SPEED);
  if (pressedD) speedX = Math.min(MAX_SPEED, speedX + MOVE_SPEED);
}

function handleCollisions() {
  touchingBorder = {
    top: y <= 0,
    bottom: y >= BACKGROUND_HEIGHT - PLAYER_SIZE,
    left: x <= 0,
    right: x >= BACKGROUND_WIDTH - PLAYER_SIZE,
  };

  if (touchingBorder.left) {
    x = 0;
    speedX = 0;
  }
  if (touchingBorder.right) {
    x = BACKGROUND_WIDTH - PLAYER_SIZE;
    speedX = 0;
  }
  if (touchingBorder.top) {
    y = 0;
    speedY = 0;
  }
  if (touchingBorder.bottom) {
    y = BACKGROUND_HEIGHT - PLAYER_SIZE;
    speedY = 0;
  }
}

let lastPositions = [];

function main() {
  handleCollisions();
  handleKeyPress();
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  console.log(speedX, speedY, x, y);

  //   speedY += 1; // gravity
  if (speedX > 0) speedX -= 0.1;
  else if (speedX < 0) speedX += 0.1;
  if (speedY > 0) speedY -= 0.1;
  else if (speedY < 0) speedY += 0.1;

  speedX = Math.round(speedX * 1000) / 1000;
  speedY = Math.round(speedY * 1000) / 1000;

  x += speedX;
  y += speedY;

  ctx.drawImage(
    backgroundImage,
    -x + PLAYER_CANVAS,
    -y + PLAYER_CANVAS,
    BACKGROUND_WIDTH,
    BACKGROUND_HEIGHT
  );

  // Push the current position to the lastPositions array
  lastPositions.push({x: PLAYER_CANVAS, y: PLAYER_CANVAS});
  //   lastPositions.push({x: x, y: y});

  // If there are more than 3 positions in the array, remove the oldest one
  if (lastPositions.length > 20) {
    lastPositions.shift();
  }

  // Draw a rectangle at each of the positions in the lastPositions array
  lastPositions.forEach((pos, index) => {
    let colorValue = Math.floor(255 - (index / 20) * 255);
    ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
    ctx.fillRect(pos.x, pos.y, PLAYER_SIZE, PLAYER_SIZE);
  });
  ctx.fillStyle = "black";

  requestAnimationFrame(main);
}

main();
