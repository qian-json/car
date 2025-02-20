import * as CONST from '../constants/gameConstants';
import { Controls } from './controls';
import { Renderer } from './renderer';
import { Physics } from './physics';

// Get the main canvas element and its 2D rendering context
const canvas = document.getElementById("canvas1") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

/**
 * Main Game class that orchestrates all game components:
 * - Manages the game state
 * - Coordinates physics calculations
 * - Handles user input
 * - Controls rendering
 * - Maintains the game loop
 */
class Game {
    // Initial game state configuration
    // x,y: Starting position in the world
    // speed: Current velocity
    // mphSpeed: Speed converted to MPH for display
    // steerSpeed: Rate of turning
    // steering: Current angle of the car (0-360 degrees)
    // steerDirection: Current turning input (-max to +max)
    // zoom: Current view zoom level
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
        baseZoom: 1,
        rpm: CONST.IDLE_RPM
    };

    private backgroundImage!: HTMLImageElement;
    private controls!: Controls;
    private renderer!: Renderer;
    private physics!: Physics;


    /**
     * Initializes the game by:
     * - Setting up the canvas dimensions
     * - Creating the renderer
     * - Loading the background
     * - Initializing controls
     * - Setting up zoom functionality
     * - Creating the physics engine
     */
    constructor() {
        canvas.width = CONST.CANVAS_WIDTH;
        canvas.height = CONST.CANVAS_HEIGHT;

        this.renderer = new Renderer(ctx);
        this.setupBackground();
        this.setupControls();
        this.setupZoom();
        this.setupPhysics();

    }

    /**
     * Initializes the physics engine with the current game state
     * The physics engine handles movement, collision, and car dynamics
     */
    private setupPhysics(): void {
        this.physics = new Physics(this.gameState);
    }


    /**
     * Loads the background image for the game world
     * This creates the environment in which the car operates
     */
    private setupBackground(): void {
        this.backgroundImage = new Image();
        this.backgroundImage.src = CONST.BACKGROUND_IMAGE_URL;
    }

    /**
     * Initializes the control system that handles user input
     * This includes keyboard controls for steering, acceleration, braking, and gear changes
     */
    private setupControls(): void {
        this.controls = new Controls();
    }

    /**
     * Sets up the zoom functionality allowing players to adjust their view distance
     * The zoom level is controlled by an input range element and affects the camera's field of view
     */
    private setupZoom(): void {
        const zoomRange = document.getElementById('zoomRange') as HTMLInputElement;
        this.gameState.baseZoom = Number(zoomRange.value) / 50;
        
        zoomRange.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            this.gameState.baseZoom = Number(target.value) / 50;
            this.physics.updateBaseZoom(this.gameState.baseZoom);
        });
    }

    /**
     * Processes current control inputs and updates the physics engine accordingly
     * This includes handling acceleration, braking, steering, and gear changes
     * Also resets gear controls after processing to prevent continuous gear changes
     */
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

    /**
     * Updates the game state with new values from the physics engine
     * Creates a new state object to maintain immutability
     * @param newState The updated state from the physics engine
     */
    private updateGameState(newState: CONST.GameState): void {
        this.gameState = { ...newState };
    }

    /**
     * Triggers the rendering system to draw the current game state
     * Combines the game state with the background image for complete scene rendering
     */
    private render(): void {
        this.renderer.render({
            ...this.gameState,
            backgroundImage: this.backgroundImage
        });
    }

    /**
     * Main game loop that:
     * 1. Processes user input
     * 2. Updates physics
     * 3. Updates game state
     * 4. Renders the scene
     * 5. Schedules the next frame
     */
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