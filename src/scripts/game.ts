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
    private currentGear: keyof typeof CONST.GEARS = 'N';
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
            baseZoom: this.baseZoom,
            currentGear: this.currentGear
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
        // Only handle steering in game class
        if (this.controls.pressed.leftTurn)
            this.steerDirection = Math.max(-CONST.MAX_STEER, this.steerDirection - this.steerSpeed);
        if (this.controls.pressed.rightTurn)
            this.steerDirection = Math.min(CONST.MAX_STEER, this.steerDirection + this.steerSpeed);

        // Handle gear changes
        type GearType = keyof typeof CONST.GEARS;
        const gearOrder: GearType[] = ['R', 'N', '1', '2', '3', '4'];

        if (this.controls.pressed.gearUp) {
            const currentIndex = gearOrder.indexOf(this.currentGear);
            if (currentIndex < gearOrder.length - 1) {
                this.currentGear = gearOrder[currentIndex + 1];
            }
            this.controls.pressed.gearUp = false;
        }
        if (this.controls.pressed.gearDown) {
            const currentIndex = gearOrder.indexOf(this.currentGear);
            if (currentIndex > 0) {
                this.currentGear = gearOrder[currentIndex - 1];
            }
            this.controls.pressed.gearDown = false;
        }

        // Pass control states to physics
        this.physics.updateControls({
            accelerate: this.controls.pressed.accelerate,
            brake: this.controls.pressed.brake,
            steerDirection: this.steerDirection,
            gear: this.currentGear
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
        this.currentGear = newState.currentGear;
    }

    private render(): void {
        this.renderer.render({
            x: this.x,
            y: this.y,
            zoom: this.zoom,
            steering: this.steering,
            steerDirection: this.steerDirection,
            speed: this.speed,
            backgroundImage: this.backgroundImage,
            currentGear: this.currentGear
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