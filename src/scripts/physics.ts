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
}

export class Physics {
    private state: GameState;

    constructor(initialState: GameState) {
        this.state = initialState;
    }

    update(): GameState {
        if (this.state.speed > 0) this.state.speed -= CONST.SPEED_FRICTION;
        else if (this.state.speed < 0) this.state.speed += CONST.SPEED_FRICTION;

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

    public updateControls(controls: { speed: number, steerDirection: number }): void {
        this.state.speed = controls.speed;
        this.state.steerDirection = controls.steerDirection;
    }
}