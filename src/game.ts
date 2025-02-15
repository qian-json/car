import * as CONST from './constants';
import './style.css';

const abs = Math.abs;
const canvas = document.getElementById("canvas1") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

interface TouchingBorder {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
}

interface PressedKeys {
    accelerate: boolean;
    leftTurn: boolean;
    reverse: boolean;
    rightTurn: boolean;
    space: boolean;
}

let ZOOM = 1;
let BASE_ZOOM = 1;

function rotate(x: number, y: number, angle: number, render: () => void): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    render();
    ctx.restore();
}

export function initGame(): void {
    // Canvas setup
    const CANVAS_WIDTH = (canvas.width = CONST.CANVAS_WIDTH);
    const CANVAS_HEIGHT = (canvas.height = CONST.CANVAS_HEIGHT);
    const CENTER_X = CANVAS_WIDTH / 2;
    const CENTER_Y = CANVAS_HEIGHT / 2;
    const PLAYER_CANVAS = CENTER_X - CONST.PLAYER_SIZE / 2;

    // Game state
    let x = 5850;
    let y = 5000;
    let speed = 0;
    let mphSpeed = 0;
    let steerSpeed: number;
    let steering = 180;
    let steerDirection = 0;
    let touchingBorder: TouchingBorder = {left: false, right: false, top: false, bottom: false};

    // Background setup
    const backgroundImage = new Image();
    backgroundImage.src = CONST.BACKGROUND_IMAGE_URL;

    // Controls state
    const pressed: PressedKeys = {
        accelerate: false,
        leftTurn: false,
        reverse: false,
        rightTurn: false,
        space: false,
    };

    window.addEventListener(
        "keydown",
        (e: KeyboardEvent) => {
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
        (e: KeyboardEvent) => {
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

    function drawArrow(): void {
        ctx.beginPath();
        ctx.strokeStyle = "blue";
        ctx.moveTo(CENTER_X, CENTER_Y);
        ctx.lineTo(
            CENTER_X + 50 * Math.cos((steering * Math.PI) / 180),
            CENTER_Y + 50 * Math.sin((steering * Math.PI) / 180)
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.moveTo(CENTER_X, CENTER_Y);

        let blackSteering = steering + steerDirection;
        ctx.lineTo(
            CENTER_X + 20 * Math.cos((blackSteering * Math.PI) / 180),
            CENTER_Y + 20 * Math.sin((blackSteering * Math.PI) / 180)
        );
        ctx.stroke();
    }

    function drawStats(): void {
        ctx.font = "bold 35pt Tahoma";
        ctx.fillText(`Speed: ${Math.round(speed * 30)}mph`, 10, 40);
        ctx.font = "bold 10pt Tahoma";
        ctx.fillText(`raw speed: ${speed}px/ps`, 10, 100);
        ctx.fillText(`direction ${steering}deg`, 10, 120);
        ctx.fillText(`steering ${steerDirection}deg`, 10, 140);
    }

    function handleControls(): void {
        if (pressed.accelerate) speed = Math.min(CONST.MAX_SPEED, speed + CONST.ACCEL_SPEED);
        if (pressed.leftTurn)
            steerDirection = Math.max(-CONST.MAX_STEER, steerDirection - steerSpeed);
        if (pressed.reverse)
            speed = Math.max(-(CONST.MAX_SPEED / 2), speed - CONST.ACCEL_SPEED / 1.5);
        if (pressed.rightTurn)
            steerDirection = Math.min(CONST.MAX_STEER, steerDirection + steerSpeed);

        if (pressed.space) speed = Math.max(0, speed - CONST.ACCEL_SPEED);
    }

    function handleCollisions(): void {
        touchingBorder = {
            top: y <= 0,
            bottom: y >= CONST.BACKGROUND_HEIGHT - CONST.PLAYER_SIZE,
            left: x <= 0,
            right: x >= CONST.BACKGROUND_WIDTH - CONST.PLAYER_SIZE,
        };

        if (touchingBorder.left) x = 0;
        if (touchingBorder.right) x = CONST.BACKGROUND_WIDTH - CONST.PLAYER_SIZE;
        if (touchingBorder.top) y = 0;
        if (touchingBorder.bottom) y = CONST.BACKGROUND_HEIGHT - CONST.PLAYER_SIZE;
    }

    function drawWheel(x: number, y: number, steerAngle: number = 0): void {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((steerAngle * Math.PI) / 180);
        ctx.fillRect(
            -CONST.PLAYER_SIZE / 10,
            -CONST.PLAYER_SIZE / 4,
            CONST.PLAYER_SIZE / 2,
            CONST.PLAYER_SIZE / 5
        );
        ctx.restore();
    }

    function drawCar(): void {
        ctx.fillStyle = "red";
        ctx.fillRect(
            -CONST.PLAYER_SIZE / 2,
            -CONST.PLAYER_SIZE / 2,
            2 * CONST.PLAYER_SIZE,
            CONST.PLAYER_SIZE
        );

        ctx.fillStyle = "black";
        drawWheel(CONST.PLAYER_SIZE, -CONST.PLAYER_SIZE / 2, steerDirection);
        drawWheel(CONST.PLAYER_SIZE, CONST.PLAYER_SIZE / 2 - -CONST.PLAYER_SIZE / 4, steerDirection);
        drawWheel(-CONST.PLAYER_SIZE - -CONST.PLAYER_SIZE / 1.5, -CONST.PLAYER_SIZE / 2);
        drawWheel(-CONST.PLAYER_SIZE - -CONST.PLAYER_SIZE / 1.5, CONST.PLAYER_SIZE / 2 - -CONST.PLAYER_SIZE / 4);
    }

    // Add zoom range handler
    const zoomRange = document.getElementById('zoomRange') as HTMLInputElement;
    BASE_ZOOM = Number(zoomRange.value) / 50; // Convert range value to zoom scale
    
    zoomRange.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        BASE_ZOOM = Number(target.value) / 50;
    });

    function physics(): void {
        if (speed > 0) speed -= CONST.SPEED_FRICTION;
        else if (speed < 0) speed += CONST.SPEED_FRICTION;

        const convertedSteer = speed === 0 ? 0 : steerDirection * (speed / 200);
        steering += convertedSteer;
        speed -= speed > 0 ? abs(convertedSteer / 500) : -abs(convertedSteer / 500);
        steerDirection = steerDirection > 0
            ? Math.max(0, steerDirection - abs(convertedSteer))
            : Math.min(0, steerDirection + abs(convertedSteer));

        steerSpeed = Math.max(1, CONST.BASE_STEER_SPEED - abs(speed / 10));

        if (steering > 360) steering -= 360;
        if (steering < 0) steering += 360;

        speed = Math.round(speed * 1000) / 1000;
        steerDirection = Math.round(steerDirection * 1000) / 1000;
        steering = Math.round(steering * 1000) / 1000;

        if (abs(speed) < 0.01 && abs(speed) > 0) speed = 0;
        x += speed * Math.cos((steering * Math.PI) / 180);
        y += speed * Math.sin((steering * Math.PI) / 180);
        mphSpeed = Math.round(speed * 68.75);

        // Modify the ZOOM calculation to use BASE_ZOOM
        ZOOM = BASE_ZOOM - abs(speed / 100) * BASE_ZOOM;
    }

    function main(): void {
        physics();
        handleCollisions();
        handleControls();

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.save();
        ctx.translate(CENTER_X, CENTER_Y);
        ctx.scale(ZOOM, ZOOM);
        ctx.translate(-CENTER_X, -CENTER_Y);

        ctx.drawImage(
            backgroundImage,
            -x + PLAYER_CANVAS,
            -y + PLAYER_CANVAS,
            CONST.BACKGROUND_WIDTH,
            CONST.BACKGROUND_HEIGHT
        );

        rotate(CENTER_X, CENTER_Y, (steering * Math.PI) / 180, drawCar);

        ctx.restore();
        drawArrow();
        drawStats();

        requestAnimationFrame(main);
    }

    main();
}
// Call the function when the module loads
initGame();