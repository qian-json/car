// Canvas
export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 600;

// Background
export const BACKGROUND_WIDTH = 16830;
export const BACKGROUND_HEIGHT = 14700;
export const BACKGROUND_IMAGE_URL = "https://media.istockphoto.com/id/1333794966/vector/top-down-racing-circuit-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=fEvS411Mvc2TSmAc0zULCX1_yvZZXTV_1Zsz99_ND0A=";

// Player
export const PLAYER_SIZE = 40;

// Physics
export const ACCEL_SPEED = 0.1;
export const MAX_SPEED = 24;
export const BASE_STEER_SPEED = 3;
export const MAX_STEER = 30;
export const SPEED_FRICTION = 0.006;
export const STEER_FRICTION = 0.1;
export const BRAKE_PRESSURE = 0.05;
export const BRAKE_RATE = 8;

// Engine RPM
export const IDLE_RPM = 800;
export const MAX_RPM = 6500;
export const REDLINE_RPM = 7000;
export const RPM_STEP = 50; // RPM change per frame when accelerating
export const RPM_DECAY = 20; // RPM decrease per frame when not accelerating
export const FRICTION = 0.1;          // Friction multiplier, controls how much friction affects the engine
export const ENGINE_TORQUE = 500;     // Torque being applied by the engine (constant for simplicity)

// Gear type definition
interface GearConfig {
    ratio: number;
}

// Game State Interface
export interface GameState {
    x: number;
    y: number;
    speed: number;
    mphSpeed: number;
    steerSpeed: number;
    steering: number;
    steerDirection: number;
    zoom: number;
    baseZoom: number;
    currentGear: keyof typeof GEARS;
    brakePressure: number;
    rpm: number;
    backgroundImage?: HTMLImageElement;
}

// Gears
export const GEARS: Record<string, GearConfig> = {
    R: { ratio: 1 },
    N: { ratio: 0 },
    1: { ratio: 2.8 },
    2: { ratio: 1.8 },
    3: { ratio: 1.4 },
    4: { ratio: 1.1 },
    5: { ratio: 0.85 },
    6: { ratio: 0.6 }
};