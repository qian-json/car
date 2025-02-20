import * as CONST from '../constants/gameConstants';

/**
 * Renderer class responsible for all visual aspects of the game:
 * - Drawing the car and its components
 * - Rendering UI elements (speed, gear indicator, etc)
 * - Managing camera and zoom effects
 * - Handling coordinate transformations
 */
export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private CANVAS_WIDTH: number;
    private CANVAS_HEIGHT: number;
    private CENTER_X: number;
    private CENTER_Y: number;
    private PLAYER_CANVAS: number;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.CANVAS_WIDTH = CONST.CANVAS_WIDTH;
        this.CANVAS_HEIGHT = CONST.CANVAS_HEIGHT;
        this.CENTER_X = this.CANVAS_WIDTH / 2;
        this.CENTER_Y = this.CANVAS_HEIGHT / 2;
        this.PLAYER_CANVAS = this.CENTER_X - CONST.PLAYER_SIZE / 2;
    }

    /**
     * Helper method to handle rotation transformations
     * Saves current context, applies rotation, executes render function,
     * then restores context to prevent transform stacking
     */
    private rotate(x: number, y: number, angle: number, render: () => void): void {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        render();
        this.ctx.restore();
    }
    
        /**
     * Wheel configuration defining positions and steering properties
     * for each wheel relative to the car body
     */
    private wheels = {
            fl: { x: CONST.PLAYER_SIZE * 0.8, y: -CONST.PLAYER_SIZE * 0.35 - CONST.PLAYER_SIZE * 0.12, steerable: true },
            fr: { x: CONST.PLAYER_SIZE * 0.8, y: CONST.PLAYER_SIZE * 0.35 + CONST.PLAYER_SIZE * 0.12, steerable: true },
            rl: { x: -CONST.PLAYER_SIZE + CONST.PLAYER_SIZE / 1.5, y: -CONST.PLAYER_SIZE * 0.35 - CONST.PLAYER_SIZE * 0.12, steerable: false },
            rr: { x: -CONST.PLAYER_SIZE + CONST.PLAYER_SIZE / 1.5, y: CONST.PLAYER_SIZE * 0.35 + CONST.PLAYER_SIZE * 0.12, steerable: false }
        };
    
    /**
     * Renders a single wheel with proper positioning and rotation
     * Handles both steerable and non-steerable wheels
     */
    private drawWheel(x: number, y: number, steerAngle: number = 0): void {
        const wheelWidth = CONST.PLAYER_SIZE / 2;
        const wheelHeight = CONST.PLAYER_SIZE / 5;

        this.ctx.save();
        this.ctx.translate(x + wheelWidth/2, y);
        this.ctx.rotate((steerAngle * Math.PI) / 180);
        this.ctx.fillRect(
            -wheelWidth/2,
            -wheelHeight/2,
            wheelWidth,
            wheelHeight
        );
        this.ctx.restore();
    }

    /**
     * Renders the complete car including:
     * - All four wheels with proper steering angles
     * - Car body with correct orientation
     * - Visual elements for vehicle state
     */
    private drawCar(steerDirection: number): void {
        // DRAW WHEELS
        this.ctx.fillStyle = "black";
        Object.values(this.wheels).forEach(wheel => {
            this.drawWheel(wheel.x, wheel.y, wheel.steerable ? steerDirection : 0);
        });

        // DRAW BODY
        this.ctx.fillStyle = "red";
        this.ctx.fillRect(
            -CONST.PLAYER_SIZE / 2,
            -CONST.PLAYER_SIZE / 2,
            2 * CONST.PLAYER_SIZE,
            CONST.PLAYER_SIZE
        );
    }

    /**
     * Draws direction indicators showing:
     * - Current steering angle (blue)
     * - Actual movement direction (black)
     * Helps visualize vehicle dynamics
     */
    private drawArrow(gameState: CONST.GameState): void {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "blue";
        this.ctx.moveTo(this.CENTER_X, this.CENTER_Y);
        this.ctx.lineTo(
            this.CENTER_X + 50 * Math.cos((gameState.steering * Math.PI) / 180),
            this.CENTER_Y + 50 * Math.sin((gameState.steering * Math.PI) / 180)
        );
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.strokeStyle = "black";
        this.ctx.moveTo(this.CENTER_X, this.CENTER_Y);
        const blackSteering = gameState.steering + gameState.steerDirection;
        this.ctx.lineTo(
            this.CENTER_X + 20 * Math.cos((blackSteering * Math.PI) / 180),
            this.CENTER_Y + 20 * Math.sin((blackSteering * Math.PI) / 180)
        );
        this.ctx.stroke();
    }

    /**
     * Renders all UI elements including:
     * - Speed display (MPH)
     * - Raw speed value
     * - Steering angles
     * - Current gear
     * - Brake pressure indicator
     */
    /**
     * Renders the tachometer display showing:
     * - Current RPM
     * - Redline zone
     * - RPM gauge and needle
     */
    private drawTachometer(rpm: number): void {
        const centerX = 500;
        const centerY = 150;
        const radius = 60;
        const startAngle = Math.PI * 0.75; // Start at 135 degrees
        const endAngle = Math.PI * 2.25;   // End at 405 degrees
        const redlineRPM = CONST.REDLINE_RPM;
        const maxRPM = redlineRPM * 1.2;    // Scale slightly past redline

        // Draw tachometer background
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        this.ctx.lineWidth = 20;
        this.ctx.strokeStyle = '#ddd';
        this.ctx.stroke();

        // Draw redline zone (from redline to max)
        const redlineAngle = startAngle + (endAngle - startAngle) * (CONST.REDLINE_RPM / maxRPM);
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, redlineAngle, endAngle);
        this.ctx.strokeStyle = 'red';
        this.ctx.stroke();

        // Draw RPM indicator
        // const rpmAngle = startAngle + (endAngle - startAngle) * (rpm / maxRPM);
        // this.ctx.beginPath();
        // this.ctx.arc(centerX, centerY, radius, startAngle, rpmAngle);
        // this.ctx.strokeStyle = 'blue';
        // this.ctx.stroke();

        // Draw RPM markers
        this.ctx.font = 'bold 12pt Tahoma';
        this.ctx.fillStyle = 'black';
        const markerRadius = radius + 15;
        for (let i = 1; i <= 7; i++) {
            const markerAngle = startAngle + (endAngle - startAngle) * (i / 8.34);
            const x = centerX + markerRadius * Math.cos(markerAngle);
            const y = centerY + markerRadius * Math.sin(markerAngle);
            
            // Save context for text rotation
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(markerAngle + Math.PI/2);
            this.ctx.fillText(i.toString(), -6, 0);
            this.ctx.restore();
        }

        // Draw the needle
        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = '#333';
        this.ctx.moveTo(centerX, centerY);
        const needleLength = radius + 2;
        const needleAngle = startAngle + (endAngle - startAngle) * (rpm / maxRPM);
        this.ctx.lineTo(
            centerX + needleLength * Math.cos(needleAngle),
            centerY + needleLength * Math.sin(needleAngle)
        );
        this.ctx.stroke();

        // Draw the center cap of the needle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = '#333';
        this.ctx.fill();

        // Draw RPM numbers
        this.ctx.fillStyle = 'black';
        this.ctx.font = 'bold 20pt Tahoma';
        this.ctx.fillText(`${Math.round(rpm)}`, centerX - 30, centerY + 40);
        this.ctx.font = 'bold 12pt Tahoma';
        this.ctx.fillText('RPM', centerX - 15, centerY + 60);

        this.ctx.lineWidth = 2;
    }

    private drawStats(gameState: CONST.GameState): void {
        this.ctx.font = "bold 35pt Tahoma";
        this.ctx.fillText(`Speed: ${Math.round(gameState.speed * 6)}mph`, 10, 40);
        this.ctx.font = "bold 10pt Tahoma";
        this.ctx.fillText(`raw speed: ${gameState.speed}px/ps`, 10, 100);
        this.ctx.fillText(`direction ${gameState.steering}deg`, 10, 120);
        this.ctx.fillText(`steering ${gameState.steerDirection}deg`, 10, 140);

        // Draw tachometer
        this.drawTachometer(gameState.rpm);

        // Draw gear display
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(500, 10, 50, 30);
        this.ctx.fillStyle = 'black';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`${gameState.currentGear}`, 519, 30);

        // Draw brake pressure bar
        const barWidth = 100;
        const barHeight = 10;
        const barX = 475;
        const barY = 50;
        
        // Draw background bar
        this.ctx.fillStyle = '#ddd';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Draw brake pressure fill
        this.ctx.fillStyle = 'red';
        const fillWidth = (gameState.brakePressure) * barWidth;
        this.ctx.fillRect(barX, barY, fillWidth, barHeight);

        // Reset text color to black for subsequent text rendering
        this.ctx.fillStyle = 'black';
    }

    /**
     * Main render method that:
     * - Clears previous frame
     * - Applies camera transformations
     * - Draws background
     * - Renders car
     * - Updates UI elements
     */
    render(gameState: CONST.GameState): void {
        const { x, y, zoom, steering, steerDirection, backgroundImage } = gameState;

        this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.ctx.save();
        this.ctx.translate(this.CENTER_X, this.CENTER_Y);
        this.ctx.scale(zoom, zoom);
        this.ctx.translate(-this.CENTER_X, -this.CENTER_Y);

        if (backgroundImage) {
            this.ctx.drawImage(
                backgroundImage,
                -x + this.PLAYER_CANVAS,
                -y + this.PLAYER_CANVAS,
                CONST.BACKGROUND_WIDTH,
                CONST.BACKGROUND_HEIGHT
            );
        }

        this.rotate(this.CENTER_X, this.CENTER_Y, (steering * Math.PI) / 180, 
            () => this.drawCar(steerDirection));

        this.ctx.restore();
        this.drawArrow(gameState);
        this.drawStats(gameState);
    }
}