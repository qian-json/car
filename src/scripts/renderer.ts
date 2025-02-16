import * as CONST from './constants';

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

    private rotate(x: number, y: number, angle: number, render: () => void): void {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        render();
        this.ctx.restore();
    }
    
        private wheels = {
            fl: { x: CONST.PLAYER_SIZE * 0.8, y: -CONST.PLAYER_SIZE * 0.35 - CONST.PLAYER_SIZE * 0.12, steerable: true },
            fr: { x: CONST.PLAYER_SIZE * 0.8, y: CONST.PLAYER_SIZE * 0.35 + CONST.PLAYER_SIZE * 0.12, steerable: true },
            rl: { x: -CONST.PLAYER_SIZE + CONST.PLAYER_SIZE / 1.5, y: -CONST.PLAYER_SIZE * 0.35 - CONST.PLAYER_SIZE * 0.12, steerable: false },
            rr: { x: -CONST.PLAYER_SIZE + CONST.PLAYER_SIZE / 1.5, y: CONST.PLAYER_SIZE * 0.35 + CONST.PLAYER_SIZE * 0.12, steerable: false }
        };
    
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

    drawArrow(steering: number, steerDirection: number): void {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "blue";
        this.ctx.moveTo(this.CENTER_X, this.CENTER_Y);
        this.ctx.lineTo(
            this.CENTER_X + 50 * Math.cos((steering * Math.PI) / 180),
            this.CENTER_Y + 50 * Math.sin((steering * Math.PI) / 180)
        );
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.strokeStyle = "black";
        this.ctx.moveTo(this.CENTER_X, this.CENTER_Y);
        const blackSteering = steering + steerDirection;
        this.ctx.lineTo(
            this.CENTER_X + 20 * Math.cos((blackSteering * Math.PI) / 180),
            this.CENTER_Y + 20 * Math.sin((blackSteering * Math.PI) / 180)
        );
        this.ctx.stroke();
    }

    drawStats(speed: number, steering: number, steerDirection: number): void {
        this.ctx.font = "bold 35pt Tahoma";
        this.ctx.fillText(`Speed: ${Math.round(speed * 30)}mph`, 10, 40);
        this.ctx.font = "bold 10pt Tahoma";
        this.ctx.fillText(`raw speed: ${speed}px/ps`, 10, 100);
        this.ctx.fillText(`direction ${steering}deg`, 10, 120);
        this.ctx.fillText(`steering ${steerDirection}deg`, 10, 140);
    }

    render(gameState: {
        x: number,
        y: number,
        zoom: number,
        steering: number,
        steerDirection: number,
        speed: number,
        backgroundImage: HTMLImageElement
    }): void {
        const { x, y, zoom, steering, steerDirection, speed, backgroundImage } = gameState;

        this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.ctx.save();
        this.ctx.translate(this.CENTER_X, this.CENTER_Y);
        this.ctx.scale(zoom, zoom);
        this.ctx.translate(-this.CENTER_X, -this.CENTER_Y);

        this.ctx.drawImage(
            backgroundImage,
            -x + this.PLAYER_CANVAS,
            -y + this.PLAYER_CANVAS,
            CONST.BACKGROUND_WIDTH,
            CONST.BACKGROUND_HEIGHT
        );

        this.rotate(this.CENTER_X, this.CENTER_Y, (steering * Math.PI) / 180, 
            () => this.drawCar(steerDirection));

        this.ctx.restore();
        this.drawArrow(steering, steerDirection);
        this.drawStats(speed, steering, steerDirection);
    }
}