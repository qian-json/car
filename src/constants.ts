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
export const MAX_STEER = 40;
export const SPEED_FRICTION = 0.01;
export const STEER_FRICTION = 0.1;

// Gear type definition
interface GearConfig {
    maxSpeed: number;
    accelMultiplier: number;
    brakingForce: number;
}

// Gears
export const GEARS: Record<string, GearConfig> = {
    R: { maxSpeed: 6, accelMultiplier: 0.7, brakingForce: 0.02 },
    N: { maxSpeed: 12, accelMultiplier: 0, brakingForce: 0.005 },
    1: { maxSpeed: 4, accelMultiplier: 1.2, brakingForce: 0.03 },
    2: { maxSpeed: 6, accelMultiplier: 1.0, brakingForce: 0.025 },
    3: { maxSpeed: 9, accelMultiplier: 0.8, brakingForce: 0.02 },
    4: { maxSpeed: 12, accelMultiplier: 0.6, brakingForce: 0.015 }
};