const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = (canvas.width = 600);
const CANVAS_HEIGHT = (canvas.height = 600);

const MOVE_SPEED = 2;

let x = 275;
let y = 275;

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
  if (pressedW) {
    if (touchingBorder.bottom) {
      // if touching ground
      speedY -= MOVE_SPEED * 10;
    }
  } //jump
  if (pressedA) speedX -= MOVE_SPEED;
  if (pressedS) speedY += MOVE_SPEED;
  if (pressedD) speedX += MOVE_SPEED;
}

function handleCollisions() {
  const BORDER_WIDTH = 50;
  touchingBorder = {
    top: y <= 0,
    bottom: y >= CANVAS_HEIGHT - BORDER_WIDTH,
    left: x <= 0,
    right: x >= CANVAS_WIDTH - BORDER_WIDTH,
  };

  if (touchingBorder.left) {
    x = 0;
    speedX = 0;
  }
  if (touchingBorder.right) {
    x = CANVAS_WIDTH - BORDER_WIDTH;
    speedX = 0;
  }
//   if (touchingBorder.top) {
//     y = 0;
//     if (speedY < 0) speedY = 0;
//   }
  if (touchingBorder.bottom) {
    y = CANVAS_HEIGHT - BORDER_WIDTH;
    if (speedY > 0) speedY = 0;
  }
}

let lastPositions = [];

function main() {
  handleCollisions();
  handleKeyPress();
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  console.log(speedX, speedY, x, y);

  speedY += 1; // gravity
  if (speedX > 0) speedX--;
  else if (speedX < 0) speedX++;

  speedX = Math.floor(speedX);
  speedY = Math.floor(speedY);

  x += speedX;
  y += speedY;

  // Push the current position to the lastPositions array
  lastPositions.push({x: x, y: y});

  // If there are more than 3 positions in the array, remove the oldest one
  if (lastPositions.length > 20) {
    lastPositions.shift();
  }

  // Draw a rectangle at each of the positions in the lastPositions array
  lastPositions.forEach((pos, index) => {
    let colorValue = Math.floor(255 - (index / 20) * 255);
    ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
    ctx.fillRect(pos.x, pos.y, 50, 50);
  });
  ctx.fillStyle = "black";

  requestAnimationFrame(main);
}

main();
