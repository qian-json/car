import * as CONST from './constants';

const abs = Math.abs;

interface TouchingBorder {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
}



export class Physics {
    private state: CONST.GameState;
    private touchingBorder: TouchingBorder = {
        left: false,
        right: false,
        top: false,
        bottom: false
    };

    constructor(initialState: CONST.GameState) {
        this.state = {
            ...initialState,
            currentGear: 'N',
            brakePressure: 0
        };
    }

    update(): CONST.GameState {
        this.handleCollisions();
        const currentGearConfig = CONST.GEARS[this.state.currentGear];

        // Apply gear-based friction
        if (this.state.speed > 0) {
            this.state.speed -= CONST.SPEED_FRICTION;
        } else if (this.state.speed < 0) {
            this.state.speed += CONST.SPEED_FRICTION;
        }

        // Limit speed based on current gear
        if (this.state.currentGear !== 'N') {
            const maxSpeed = CONST.MAX_SPEED * currentGearConfig.maxSpeed;
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

    private handleCollisions(): void {
        this.touchingBorder = {
            top: this.state.y <= 0,
            bottom: this.state.y >= CONST.BACKGROUND_HEIGHT - CONST.PLAYER_SIZE,
            left: this.state.x <= 0,
            right: this.state.x >= CONST.BACKGROUND_WIDTH - CONST.PLAYER_SIZE,
        };

        if (this.touchingBorder.left) this.state.x = 0;
        if (this.touchingBorder.right) this.state.x = CONST.BACKGROUND_WIDTH - CONST.PLAYER_SIZE;
        if (this.touchingBorder.top) this.state.y = 0;
        if (this.touchingBorder.bottom) this.state.y = CONST.BACKGROUND_HEIGHT - CONST.PLAYER_SIZE;
    }

    private handleSteering(controls: { leftTurn: boolean; rightTurn: boolean }): void {
        if (controls.leftTurn)
            this.state.steerDirection = Math.max(-CONST.MAX_STEER, this.state.steerDirection - this.state.steerSpeed);
        if (controls.rightTurn)
            this.state.steerDirection = Math.min(CONST.MAX_STEER, this.state.steerDirection + this.state.steerSpeed);
    }

    private handleGearChange(gearAction: { up: boolean; down: boolean }): void {
        type GearType = keyof typeof CONST.GEARS;
        const gearOrder: GearType[] = ['R', 'N', '1', '2', '3', '4'];

        if (gearAction.up) {
            const currentIndex = gearOrder.indexOf(this.state.currentGear);
            if (currentIndex < gearOrder.length - 1) {
                this.state.currentGear = gearOrder[currentIndex + 1];
            }
        } else if (gearAction.down) {
            const currentIndex = gearOrder.indexOf(this.state.currentGear);
            if (currentIndex > 0) {
                this.state.currentGear = gearOrder[currentIndex - 1];
            }
        }
    }

    public updateControls(controls: { 
        accelerate: boolean;
        brake: boolean;
        leftTurn: boolean;
        rightTurn: boolean;
        gearUp: boolean;
        gearDown: boolean;
    }): void {
        this.handleSteering({
            leftTurn: controls.leftTurn,
            rightTurn: controls.rightTurn
        });

        this.handleGearChange({
            up: controls.gearUp,
            down: controls.gearDown
        });

        const currentGearConfig = CONST.GEARS[this.state.currentGear];

        // Handle braking
        if (controls.brake) {
            this.state.brakePressure = Math.min(CONST.MAX_BRAKE_PRESSURE, this.state.brakePressure + CONST.BRAKE_RATE);
        } else {
            this.state.brakePressure = Math.max(0, this.state.brakePressure - CONST.BRAKE_RATE);
        }

        // Apply brake force based on brake pressure
        if (this.state.brakePressure > 0) {
            const brakeForce = (CONST.ACCEL_SPEED * 1.5) * (this.state.brakePressure / CONST.MAX_BRAKE_PRESSURE);
            this.state.speed = this.state.speed > 0 
                ? Math.max(0, this.state.speed - brakeForce)
                : Math.min(0, this.state.speed + brakeForce);
        }
        
        // Handle acceleration
        if (controls.accelerate && this.state.currentGear !== 'N') {
            const acceleration = CONST.ACCEL_SPEED * (currentGearConfig.ratio);
            this.state.speed += acceleration;
        }
    }
}