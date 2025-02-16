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
export const MAX_SPEED = 12;
export const BASE_STEER_SPEED = 3;
export const MAX_STEER = 30;
export const SPEED_FRICTION = 0.01;
export const STEER_FRICTION = 0.1;

// Gear type definition
interface GearConfig {
    ratio: number;
    maxSpeed: number;
}

// Gears
export const GEARS: Record<string, GearConfig> = {
    R: { ratio: -0.5, maxSpeed: 4 },
    N: { ratio: 0, maxSpeed: 0 },
    1: { ratio: 1, maxSpeed: 4 },
    2: { ratio: 0.7, maxSpeed: 6 },
    3: { ratio: 0.4, maxSpeed: 9 },
    4: { ratio: 0.2, maxSpeed: 12 }
};