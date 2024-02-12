function e() {
  // start game lol
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");

  const zoomRange = document.getElementById("zoomRange");
  let ZOOM = zoomRange.value / 10;
  // zoomRange.addEventListener("change", () => {
  //   ZOOM = zoomRange.value / 10;
  //   console.log(ZOOM);
  // });

  const CANVAS_WIDTH = (canvas.width = 600);
  const CANVAS_HEIGHT = (canvas.height = 600);
  const BACKGROUND_WIDTH = 8430 * ZOOM;
  const BACKGROUND_HEIGHT = 7350 * ZOOM;
  const backgroundImage = new Image();
  backgroundImage.src =
    "https://media.istockphoto.com/id/1333794966/vector/top-down-racing-circuit-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=fEvS411Mvc2TSmAc0zULCX1_yvZZXTV_1Zsz99_ND0A=";

  const MOVE_SPEED = 0.2 * ZOOM;
  const MAX_SPEED = 10 * ZOOM;
  const STEER_SPEED = 2;
  const MAX_STEER = 12;
  const PLAYER_SIZE = 25 * ZOOM;

  const PLAYER_CANVAS = CANVAS_WIDTH / 2 - PLAYER_SIZE / 2;

  let x = 2925 * ZOOM;
  let y = 2500 * ZOOM;

  let speed = 0;
  const speedFriction = 0.1 * ZOOM;
  let steering = 180;
  let steerDirection = 0;
  const steerFriction = 0.1;

  let pressedW = false;
  let pressedA = false;
  let pressedS = false;
  let pressedD = false;
  let pressedSpace = false;

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
        case " ": // space
          pressedSpace = true;
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
        case " ": // space
          pressedSpace = false;
          break;
      }
    },
    false
  );

  function drawArrow() {
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.moveTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.lineTo(
      CANVAS_WIDTH / 2 + 50 * Math.cos((steering * Math.PI) / 180),
      CANVAS_HEIGHT / 2 + 50 * Math.sin((steering * Math.PI) / 180)
    );
    ctx.stroke();

    // Start a new path for the black line
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    // Make the black line follow the direction of the blue line
    let blackSteering = steering + steerDirection;
    ctx.lineTo(
      CANVAS_WIDTH / 2 + 20 * Math.cos((blackSteering * Math.PI) / 180),
      CANVAS_HEIGHT / 2 + 20 * Math.sin((blackSteering * Math.PI) / 180)
    );
    ctx.stroke();
  }

  function handleControls() {
    if (pressedW) speed = Math.min(MAX_SPEED, speed + MOVE_SPEED);
    if (pressedA)
      steerDirection = Math.max(-MAX_STEER, steerDirection - STEER_SPEED);
    if (pressedS) speed = Math.max(-MAX_SPEED, speed - MOVE_SPEED / 1.5);
    if (pressedD)
      steerDirection = Math.min(MAX_STEER, steerDirection + STEER_SPEED);

    if (pressedSpace) speed = Math.max(0, speed - MOVE_SPEED);

    const convertedSteer =
      speed == 0 ? 0 : steerDirection * 0.2 * (speed / MAX_SPEED);
    steering += convertedSteer;
    steerDirection =
      steerDirection > 0
        ? Math.max(0, steerDirection - Math.abs(convertedSteer))
        : Math.min(0, steerDirection + Math.abs(convertedSteer));

    if (steering > 360) steering -= 360;
    if (steering < 0) steering += 360;
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
      // speedX = 0;
    }
    if (touchingBorder.right) {
      x = BACKGROUND_WIDTH - PLAYER_SIZE;
      // speedX = 0;
    }
    if (touchingBorder.top) {
      y = 0;
      // speedY = 0;
    }
    if (touchingBorder.bottom) {
      y = BACKGROUND_HEIGHT - PLAYER_SIZE;
      // speedY = 0;
    }
  }

  let lastPositions = [];

  function main() {
    handleCollisions();
    handleControls();
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    console.log(speed, steering, steerDirection, x, y);

    //   speedY += 1; // gravity
    if (speed > 0) speed -= speedFriction;
    else if (speed < 0) speed += speedFriction;
    // if (steerDirection > 0) steerDirection -= steerFriction;
    // else if (steerDirection < 0) steerDirection += steerFriction;

    speed = Math.round(speed * 1000) / 1000;
    steerDirection = Math.round(steerDirection * 1000) / 1000;
    steering = Math.round(steering * 1000) / 1000;

    x += speed * Math.cos((steering * Math.PI) / 180);
    y += speed * Math.sin((steering * Math.PI) / 180);
    //   x += speedX;
    //   y += speedY;

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

    drawArrow();

    requestAnimationFrame(main);
  }

  main();
}
