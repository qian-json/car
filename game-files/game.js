const abs = Math.abs;

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

function rotate(x, y, angle, render) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  render();
  ctx.restore();
}

function e() {
  // start game lol

  // constants
  const zoomRange = document.getElementById("zoomRange");
  let ZOOM = zoomRange.value / 10;
  // zoomRange.addEventListener("change", () => {
  //   ZOOM = zoomRange.value / 10;
  //   console.log(ZOOM);
  // });

  const CANVAS_WIDTH = (canvas.width = 600);
  const CANVAS_HEIGHT = (canvas.height = 600);
  const BACKGROUND_WIDTH = 16830 * ZOOM;
  const BACKGROUND_HEIGHT = 14700 * ZOOM;
  const backgroundImage = new Image();
  backgroundImage.src =
    "https://media.istockphoto.com/id/1333794966/vector/top-down-racing-circuit-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=fEvS411Mvc2TSmAc0zULCX1_yvZZXTV_1Zsz99_ND0A=";

  const ACCEL_SPEED = 0.1 * ZOOM;
  const MAX_SPEED = 12 * ZOOM;
  const BASE_STEER_SPEED = 4;
  const MAX_STEER = 48;
  const PLAYER_SIZE = 40 * ZOOM;

  const PLAYER_CANVAS = CANVAS_WIDTH / 2 - PLAYER_SIZE / 2;

  let x = 5850 * ZOOM;
  let y = 5000 * ZOOM;

  let speed = 0;
  let mphSpeed = 0; // MAX REAL SPEED = 220 mph / MAX GAME SPEED = 2 = 110 * speed
  const speedFriction = 0.01 * ZOOM;
  let steerSpeed;
  let steering = 180;
  let steerDirection = 0;
  const steerFriction = 0.1;

  let touchingBorder = {left: false, right: false, top: false, bottom: false};

  // controls
  const pressed = {
    accelerate: false,
    leftTurn: false,
    reverse: false,
    rightTurn: false,
    space: false,
  };

  window.addEventListener(
    "keydown",
    e => {
      switch (e.key) {
        case "w":
        case "ArrowUp":
          pressed.accelerate = true;
          break;
        case "a":
        case "ArrowLeft":
          pressed.leftTurn = true;
          break;
        case "s":
        case "ArrowDown":
          pressed.reverse = true;
          break;
        case "d":
        case "ArrowRight":
          pressed.rightTurn = true;
          break;
        case " ": // space
          pressed.space = true;
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
        case "ArrowUp":
          pressed.accelerate = false;
          break;
        case "a":
        case "ArrowLeft":
          pressed.leftTurn = false;
          break;
        case "s":
        case "ArrowDown":
          pressed.reverse = false;
          break;
        case "d":
        case "ArrowRight":
          pressed.rightTurn = false;
          break;
        case " ": // space
          pressed.space = false;
          break;
      }
    },
    false
  );

  // drawing functions
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

  function drawStats() {
    ctx.font = "bold 35pt Tahoma";
    ctx.fillText(`Speed: ${Math.round((speed * 30) / ZOOM)}mph`, 10, 40);
    ctx.font = "bold 10pt Tahoma";
    ctx.fillText(`raw speed: ${speed}px/ps`, 10, 100);
    ctx.fillText(`direction ${steering}deg`, 10, 120);
    ctx.fillText(`steering ${steerDirection}deg`, 10, 140);
  }

  // main helper functions
  function handleControls() {
    if (pressed.accelerate) speed = Math.min(MAX_SPEED, speed + ACCEL_SPEED);
    if (pressed.leftTurn)
      steerDirection = Math.max(-MAX_STEER, steerDirection - steerSpeed);
    if (pressed.reverse)
      speed = Math.max(-(MAX_SPEED / 2), speed - ACCEL_SPEED / 1.5);
    if (pressed.rightTurn)
      steerDirection = Math.min(MAX_STEER, steerDirection + steerSpeed);

    if (pressed.space) speed = Math.max(0, speed - ACCEL_SPEED);
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

  function physics() {
    // friction
    // friction must be claculated before max speed cap. this way the max speed can be reached :ok: same with steering
    if (speed > 0) speed -= speedFriction;
    else if (speed < 0) speed += speedFriction;

    // steering ----

    const convertedSteer = speed == 0 ? 0 : steerDirection * (speed / 100);
    steering += convertedSteer;
    //
    speed -= speed > 0 ? abs(convertedSteer / 500) : -abs(convertedSteer / 500);
    //
    steerDirection =
      steerDirection > 0
        ? Math.max(0, steerDirection - abs(convertedSteer))
        : Math.min(0, steerDirection + abs(convertedSteer));

    if (steering > 360) steering -= 360;
    if (steering < 0) steering += 360;

    steerSpeed = BASE_STEER_SPEED / abs(speed + 0.5 /*/ 2*/);
    console.log("steer: ", steerSpeed);

    // rounding and stuff idk

    speed = Math.round(speed * 1000) / 1000;
    steerDirection = Math.round(steerDirection * 1000) / 1000;
    steering = Math.round(steering * 1000) / 1000;

    if (abs(speed) < 0.01 && abs(speed) > 0) speed = 0;
    x += speed * Math.cos((steering * Math.PI) / 180);
    y += speed * Math.sin((steering * Math.PI) / 180);
    mphSpeed = Math.round(speed * 68.75);
  }

  // main loop
  function main() {
    physics(); // must be run before controls because in controls, the max cap is calculated, this ensures the max caps can be reached

    handleCollisions();
    handleControls();

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    console.log(speed, steering, steerDirection, x, y);

    ctx.drawImage(
      backgroundImage,
      -x + PLAYER_CANVAS,
      -y + PLAYER_CANVAS,
      BACKGROUND_WIDTH,
      BACKGROUND_HEIGHT
    );

    rotate(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      (steering * Math.PI) / 180,
      () => {
        ctx.fillStyle = "red";
        ctx.fillRect(
          -PLAYER_SIZE / 2,
          -PLAYER_SIZE / 2,
          2 * PLAYER_SIZE,
          PLAYER_SIZE
        );
      }
    );

    drawArrow();
    drawStats();

    requestAnimationFrame(main);
  }

  main();
}
