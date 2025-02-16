import * as CONST from './constants';

const abs = Math.abs;

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
    currentGear: keyof typeof CONST.GEARS;  // Add this line
}

export class Physics {
    private state: GameState;

    constructor(initialState: GameState) {
        this.state = {
            ...initialState,
            currentGear: 'N'
        };
    }

    update(): GameState {
        const currentGearConfig = CONST.GEARS[this.state.currentGear];

        // Apply gear-based friction
        if (this.state.speed > 0) {
            this.state.speed -= CONST.SPEED_FRICTION;
        } else if (this.state.speed < 0) {
            this.state.speed += CONST.SPEED_FRICTION;
        }

        // Limit speed based on current gear
        if (this.state.currentGear !== 'N') {
            const maxSpeed = currentGearConfig.maxSpeed * (this.state.speed > 0 ? 1 : -1);
            this.state.speed = Math.min(
                Math.abs(this.state.speed),
                Math.abs(maxSpeed)
            ) * Math.sign(this.state.speed);
        }

        const convertedSteer = this.state.speed === 0 ? 0 : this.state.steerDirection * (this.state.speed / 200);
        this.state.steering += convertedSteer;
        this.state.speed -= this.state.speed > 0 ? abs(convertedSteer / 500) : -abs(convertedSteer / 500);
        this.state.steerDirection = this.state.steerDirection > 0
            ? Math.max(0, this.state.steerDirection - abs(convertedSteer))
            : Math.min(0, this.state.steerDirection + abs(convertedSteer));

        this.state.steerSpeed = Math.max(1, CONST.BASE_STEER_SPEED - abs(this.state.speed / 10));

        if (this.state.steering > 360) this.state.steering -= 360;
        if (this.state.steering < 0) this.state.steering += 360;

        this.state.speed = Math.round(this.state.speed * 1000) / 1000;
        this.state.steerDirection = Math.round(this.state.steerDirection * 1000) / 1000;
        this.state.steering = Math.round(this.state.steering * 1000) / 1000;

        if (abs(this.state.speed) < 0.01 && abs(this.state.speed) > 0) this.state.speed = 0;
        this.state.x += this.state.speed * Math.cos((this.state.steering * Math.PI) / 180);
        this.state.y += this.state.speed * Math.sin((this.state.steering * Math.PI) / 180);
        this.state.mphSpeed = Math.round(this.state.speed * 68.75);

        this.state.zoom = this.state.baseZoom - abs(this.state.speed / 100) * this.state.baseZoom;

        return this.state;
    }

    public updateBaseZoom(baseZoom: number): void {
        this.state.baseZoom = baseZoom;
    }

    public updateControls(controls: { 
        accelerate: boolean,
        brake: boolean,
        steerDirection: number, 
        gear?: keyof typeof CONST.GEARS
    }): void {
        if (controls.gear) {
            this.state.currentGear = controls.gear;
        }

        const currentGearConfig = CONST.GEARS[this.state.currentGear];

        // Handle braking
        if (controls.brake) {
            const brakeForce = CONST.ACCEL_SPEED * 1.5;
            this.state.speed = this.state.speed > 0 
                ? Math.max(0, this.state.speed - brakeForce)
                : Math.min(0, this.state.speed + brakeForce);
        }
        
        // Handle acceleration
        if (controls.accelerate && this.state.currentGear !== 'N') {
            const acceleration = CONST.ACCEL_SPEED * (currentGearConfig.ratio);
            this.state.speed += acceleration;
        }

        this.state.steerDirection = controls.steerDirection;
    }
}