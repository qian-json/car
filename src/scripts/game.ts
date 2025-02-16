import * as CONST from './constants';
import '../style.css';
import { Controls } from './controls';
import { Renderer } from './renderer';
import { Physics, GameState } from './physics';

const canvas = document.getElementById("canvas1") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

interface TouchingBorder {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
}

class Game {
    private x: number = 5850;
    private y: number = 5000;
    private speed: number = 0;
    private mphSpeed: number = 0;
    private steerSpeed: number = 0;
    private steering: number = 180;
    private steerDirection: number = 0;
    private touchingBorder: TouchingBorder = {
        left: false,
        right: false,
        top: false,
        bottom: false
    };

    private backgroundImage!: HTMLImageElement;
    private controls!: Controls;
    private renderer!: Renderer;
    private physics!: Physics;
    private zoom: number = 1;
    private baseZoom: number = 1;

    constructor() {
        canvas.width = CONST.CANVAS_WIDTH;
        canvas.height = CONST.CANVAS_HEIGHT;

        this.renderer = new Renderer(ctx);
        this.setupBackground();
        this.setupControls();
        this.setupZoom();
        this.setupPhysics();
    }

    private setupPhysics(): void {
        const initialState: GameState = {
            x: this.x,
            y: this.y,
            speed: this.speed,
            mphSpeed: this.mphSpeed,
            steerSpeed: this.steerSpeed,
            steering: this.steering,
            steerDirection: this.steerDirection,
            zoom: this.zoom,
            baseZoom: this.baseZoom
        };
        this.physics = new Physics(initialState);
    }

    private setupBackground(): void {
        this.backgroundImage = new Image();
        this.backgroundImage.src = CONST.BACKGROUND_IMAGE_URL;
    }

    private setupControls(): void {
        this.controls = new Controls();
    }

    private setupZoom(): void {
        const zoomRange = document.getElementById('zoomRange') as HTMLInputElement;
        this.baseZoom = Number(zoomRange.value) / 50;
        
        zoomRange.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            this.baseZoom = Number(target.value) / 50;
            this.physics.updateBaseZoom(this.baseZoom);
        });
    }

    private handleControls(): void {
        if (this.controls.pressed.accelerate) 
            this.speed = Math.min(CONST.MAX_SPEED, this.speed + CONST.ACCEL_SPEED);
        if (this.controls.pressed.leftTurn)
            this.steerDirection = Math.max(-CONST.MAX_STEER, this.steerDirection - this.steerSpeed);
        if (this.controls.pressed.reverse)
            this.speed = Math.max(-(CONST.MAX_SPEED / 2), this.speed - CONST.ACCEL_SPEED / 1.5);
        if (this.controls.pressed.rightTurn)
            this.steerDirection = Math.min(CONST.MAX_STEER, this.steerDirection + this.steerSpeed);
        if (this.controls.pressed.space) 
            this.speed = Math.max(0, this.speed - CONST.ACCEL_SPEED);

        this.physics.updateControls({
            speed: this.speed,
            steerDirection: this.steerDirection
        });
    }

    private handleCollisions(): void {
        this.touchingBorder = {
            top: this.y <= 0,
            bottom: this.y >= CONST.BACKGROUND_HEIGHT - CONST.PLAYER_SIZE,
            left: this.x <= 0,
            right: this.x >= CONST.BACKGROUND_WIDTH - CONST.PLAYER_SIZE,
        };

        if (this.touchingBorder.left) this.x = 0;
        if (this.touchingBorder.right) this.x = CONST.BACKGROUND_WIDTH - CONST.PLAYER_SIZE;
        if (this.touchingBorder.top) this.y = 0;
        if (this.touchingBorder.bottom) this.y = CONST.BACKGROUND_HEIGHT - CONST.PLAYER_SIZE;
    }

    private updateGameState(newState: GameState): void {
        this.x = newState.x;
        this.y = newState.y;
        this.speed = newState.speed;
        this.mphSpeed = newState.mphSpeed;
        this.steerSpeed = newState.steerSpeed;
        this.steering = newState.steering;
        this.steerDirection = newState.steerDirection;
        this.zoom = newState.zoom;
        this.baseZoom = newState.baseZoom;
    }

    private render(): void {
        this.renderer.render({
            x: this.x,
            y: this.y,
            zoom: this.zoom,
            steering: this.steering,
            steerDirection: this.steerDirection,
            speed: this.speed,
            backgroundImage: this.backgroundImage
        });
    }

    public update(): void {
        this.handleControls();
        this.handleCollisions();
        const newState = this.physics.update();
        this.updateGameState(newState);
        this.render();
        requestAnimationFrame(() => this.update());
    }
}

export function initGame(): void {
    const game = new Game();
    game.update();
}