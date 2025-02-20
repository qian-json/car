import * as CONST from '../constants/gameConstants';

// Helper function for cleaner code
const abs = Math.abs;

// Final drive ratio (constant for simplicity)
const FINAL_DRIVE: number = 1;

/**
 * Converts game speed (pixels/sec) to engine RPM
 * @param speed Speed in pixels per second
 * @param gearRatio Current gear ratio
 * @returns Engine RPM
 */
function speedToRPM(speed: number, gearRatio: number): number {
    return (speed * 60) / (gearRatio * FINAL_DRIVE);
}

/**
 * Converts engine RPM to game speed (pixels/sec)
 * @param rpm Engine RPM
 * @param gearRatio Current gear ratio
 * @returns Speed in pixels per second
 */
function rpmToSpeed(rpm: number, gearRatio: number): number {
    return (rpm * gearRatio * FINAL_DRIVE) / 60;
}

// ADD HERE - MARKER 1234

/**
 * Interface to track collision state with world boundaries
 * Used to prevent the car from moving outside the game world
 */
interface TouchingBorder {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
}

/**
 * Physics engine that handles all vehicle dynamics including:
 * - Movement and acceleration
 * - Gear system and transmission
 * - Steering and handling
 * - Collision detection
 * - Friction and braking
 */
export class Physics {
    private state: CONST.GameState;
    private touchingBorder: TouchingBorder = {
        left: false,
        right: false,
        top: false,
        bottom: false
    };
    private revLimiterActive: boolean = false;

    constructor(initialState: CONST.GameState) {
        this.state = {
            ...initialState,
            currentGear: 'N',
            brakePressure: 0,
            rpm: CONST.IDLE_RPM
        };
    }

    /**
     * Main physics update loop that:
     * - Handles world boundary collisions
     * - Applies gear-based speed limits
     * - Processes steering physics
     * - Updates position based on velocity
     * - Applies friction and drag
     * - Updates camera zoom based on speed
     */
    update(): CONST.GameState {
        this.handleCollisions();
        const currentGearConfig = CONST.GEARS[this.state.currentGear];

        // Apply gear-based friction
        if (this.state.speed > 0) {
            this.state.speed -= CONST.SPEED_FRICTION;
        } else if (this.state.speed < 0) {
            this.state.speed += CONST.SPEED_FRICTION;
        }

        // No artificial speed limits - gear ratios naturally limit speed
        // Higher gear ratios = lower top speeds

        // Convert steering input based on speed - higher speed = more sensitive steering
        // At speed 0, no steering happens. Otherwise, steering gets stronger with speed
        const convertedSteer = this.state.speed === 0 ? 0 : this.state.steerDirection * (this.state.speed / 100);
        
        // Add the converted steering to current angle
        this.state.steering += convertedSteer;
        
        // Reduce speed slightly when turning - sharper turns = more speed loss
        // Different formulas for forward/reverse to maintain correct steering behavior
        this.state.speed -= this.state.speed > 0 ? abs(convertedSteer / 500) : -abs(convertedSteer / 500);
        
        // Gradually return steering direction to center
        // If turning right (positive), decrease toward 0
        // If turning left (negative), increase toward 0
        this.state.steerDirection = this.state.steerDirection > 0
            ? Math.max(0, this.state.steerDirection - abs(convertedSteer))
            : Math.min(0, this.state.steerDirection + abs(convertedSteer));

        // Adjust steering sensitivity based on speed
        // Faster speed = less sensitive steering for better control
        this.state.steerSpeed = Math.max(1, CONST.BASE_STEER_SPEED - abs(this.state.speed / 10));

        // Keep steering angle between 0-360 degrees
        if (this.state.steering > 360) this.state.steering -= 360;
        if (this.state.steering < 0) this.state.steering += 360;

        // Round all floating point values to 3 decimal places for performance and display
        // This prevents numbers from getting too long while maintaining sufficient precision
        this.state.speed = Math.round(this.state.speed * 1000) / 1000;
        this.state.steerDirection = Math.round(this.state.steerDirection * 1000) / 1000;
        this.state.steering = Math.round(this.state.steering * 1000) / 1000;

        // Reset speed to exactly 0 if it's very close to prevent "creeping"
        // This ensures the car comes to a complete stop instead of moving infinitesimally
        if (abs(this.state.speed) < 0.01 && abs(this.state.speed) > 0) this.state.speed = 0;

        // Update car's position using trigonometry
        // cos(angle) gives x component of movement
        // sin(angle) gives y component of movement
        // Multiply by speed to get actual distance moved
        this.state.x += this.state.speed * Math.cos((this.state.steering * Math.PI) / 180);
        this.state.y += this.state.speed * Math.sin((this.state.steering * Math.PI) / 180);

        // Convert internal speed units to MPH for display
        // Multiplier (68.75) is calibrated to give realistic speed values
        this.state.mphSpeed = Math.round(this.state.speed * 68.75);

        // Adjust camera zoom based on speed
        // Higher speeds = camera zooms out to show more of the world
        // The zoom amount is proportional to speed but limited by baseZoom
        this.state.zoom = this.state.baseZoom - abs(this.state.speed / 100) * this.state.baseZoom;

        return this.state;
    }

    public updateBaseZoom(baseZoom: number): void {
        this.state.baseZoom = baseZoom;
    }

    /**
     * Detects and handles collisions with world boundaries
     * Prevents the car from moving outside the game world by
     * clamping position values to valid ranges
     */
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

    /**
     * Processes steering input and updates vehicle direction
     * - Applies steering rate limits based on speed
     * - Handles gradual steering return-to-center
     * - Implements realistic steering feel
     */
    private handleSteering(controls: { leftTurn: boolean; rightTurn: boolean }): void {
        // For left turns: decrease steerDirection (negative values)
        // Limited by MAX_STEER to prevent unrealistic turning
        // steerSpeed controls how quickly the steering angle changes
        if (controls.leftTurn)
            this.state.steerDirection = Math.max(-CONST.MAX_STEER, this.state.steerDirection - this.state.steerSpeed);

        // For right turns: increase steerDirection (positive values)
        // Also limited by MAX_STEER for consistency
        // The actual turning effect is calculated in the update() method
        if (controls.rightTurn)
            this.state.steerDirection = Math.min(CONST.MAX_STEER, this.state.steerDirection + this.state.steerSpeed);
    }

    /**
     * Manages manual transmission gear changes
     * - Implements sequential shifting (R-N-1-2-3-4)
     * - Prevents invalid gear selections
     * - Affects vehicle acceleration and top speed
     */
    private handleGearChange(gearAction: { up: boolean; down: boolean }): void {
        type GearType = keyof typeof CONST.GEARS;
        // Define fixed gear order for consistent shifting
        const gearOrder: GearType[] = ['R', 'N', '1', '2', '3', '4', '5', '6'];

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

    /**
     * Processes all player inputs and updates vehicle state
     * - Handles acceleration and braking
     * - Manages gear changes
     * - Controls steering
     * - Implements progressive brake pressure
     */
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
            this.state.brakePressure = Math.min(1, this.state.brakePressure + CONST.BRAKE_RATE*0.01);
        } else {
            this.state.brakePressure = Math.max(0, this.state.brakePressure - CONST.BRAKE_RATE*0.01);
        }

        // Apply brake force based on brake pressure percentage
        if (this.state.brakePressure > 0) {
            const brakingForce = this.state.brakePressure * CONST.BRAKE_PRESSURE;
            this.state.speed = this.state.speed > 0 
                ? Math.max(0, this.state.speed - brakingForce)
                : Math.min(0, this.state.speed + brakingForce);
        }

        if (this.state.currentGear === 'N') {
            // MARKER A1 START
            const inertiaFactor = (this.state.rpm / CONST.REDLINE_RPM);
            const decayFactor = CONST.RPM_DECAY * inertiaFactor;
            const frictionLoss = CONST.FRICTION * this.state.rpm * 0.1/*ARBITRARY NUMBER ALERT*/; // Simulate friction loss
            this.state.rpm = Math.max(CONST.IDLE_RPM, this.state.rpm - decayFactor - frictionLoss);
            // MARKER A1 END
        } else {
            // MARKER A2 START
            // const rpm = speedToRPM(this.state.speed, currentGearConfig.ratio);
            const rpm = (this.state.speed * currentGearConfig.ratio) / 0.002;
            
            // Add friction and decay effects from neutral gear logic
            const inertiaFactor = (this.state.rpm / CONST.REDLINE_RPM);
            const decayFactor = CONST.RPM_DECAY * inertiaFactor;
            const frictionLoss = CONST.FRICTION * this.state.rpm * 0.001/*ARBITRARY NUMBER ALERT*/;

            console.log("RPM DELTA: ", rpm);
            console.log("DECAY FACTOR: ", decayFactor);
            console.log("FRICTION: ", frictionLoss);
            
            // Combine wheel speed sync with mechanical losses
            // this.state.rpm += rpmDelta * smoothFactor - decayFactor - frictionLoss;
            this.state.rpm = rpm - decayFactor - frictionLoss;
            
            // Prevent stalling
            if (this.state.rpm < CONST.IDLE_RPM) {
                console.log("STALL");
                this.state.rpm = CONST.IDLE_RPM;
            }
            // MARKER A2 START
        }

        console.log("#1: ", this.state.rpm);
        

        // REV LIMITER
        if (this.state.rpm >= CONST.REDLINE_RPM && !this.revLimiterActive) {
            this.revLimiterActive = true;
            console.log("[Rev Limiter] PAH!");
            setTimeout(() => {
                this.revLimiterActive = false;
            }, Math.round(Math.random() * 50) + 50);
            // }, 0);
        }

        // Handle acceleration and engine revving with inertia
        if (controls.accelerate && !this.revLimiterActive) {
            // MARKER A START
            const inertiaFactor = (this.state.rpm / CONST.REDLINE_RPM); // Higher RPM = more inertia
            this.state.rpm += (CONST.RPM_STEP * (this.state.currentGear === 'N' ? 5/*ARBITRARY NUMBER ALERT*/ : currentGearConfig.ratio)) * inertiaFactor;
            // MARKER A END
        }

        console.log(this.state.speed)

        
        if (this.state.currentGear !== 'N') {
            // const targetSpeed = (this.state.rpm / currentGearConfig.ratio) * 0.002;
            // const speedDelta = targetSpeed - this.state.speed;
            // Smooth factor controls how fast speed updates (0.1 = smooth, 1.0 = instant)
            // const smoothFactor = 0.2;
            this.state.speed = (this.state.rpm / currentGearConfig.ratio) * 0.002;
            // this.state.speed = rpmToSpeed(this.state.rpm, currentGearConfig.ratio);

            console.log("#2: ", this.state.speed);

            // REVERSE GEAR
            if (this.state.currentGear === 'R') this.state.speed *= -1;
        }

        console.log(this.state.speed)

    }
}