import * as CONST from './constants';
import '../style.css';
import { Controls } from './controls';
import { Renderer } from './renderer';
import { Physics } from './physics';

const canvas = document.getElementById("canvas1") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

class Game {
    private gameState: CONST.GameState = {
        x: 5850,
        y: 5000,
        speed: 0,
        mphSpeed: 0,
        steerSpeed: 0,
        steering: 180,
        steerDirection: 0,
        brakePressure: 0,
        currentGear: 'N',
        zoom: 1,
        baseZoom: 1
    };

    private backgroundImage!: HTMLImageElement;
    private controls!: Controls;
    private renderer!: Renderer;
    private physics!: Physics;

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
        this.physics = new Physics(this.gameState);
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
        this.gameState.baseZoom = Number(zoomRange.value) / 50;
        
        zoomRange.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            this.gameState.baseZoom = Number(target.value) / 50;
            this.physics.updateBaseZoom(this.gameState.baseZoom);
        });
    }

    private handleControls(): void {
        this.physics.updateControls({
            accelerate: this.controls.pressed.accelerate,
            brake: this.controls.pressed.brake,
            leftTurn: this.controls.pressed.leftTurn,
            rightTurn: this.controls.pressed.rightTurn,
            gearUp: this.controls.pressed.gearUp,
            gearDown: this.controls.pressed.gearDown
        });
        
        this.controls.resetGearControls();
    }

    private updateGameState(newState: CONST.GameState): void {
        this.gameState = { ...newState };
    }

    private render(): void {
        this.renderer.render({
            ...this.gameState,
            backgroundImage: this.backgroundImage
        });
    }

    public update(): void {
        this.handleControls();
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