export interface PressedKeys {
    accelerate: boolean;
    leftTurn: boolean;
    brake: boolean;  // Changed from reverse
    rightTurn: boolean;
    space: boolean;
}

export class Controls {
    public pressed: {
        accelerate: boolean;
        brake: boolean;
        leftTurn: boolean;
        rightTurn: boolean;
        space: boolean;
        gearUp: boolean;
        gearDown: boolean;
    };
    private gearUpPressed: boolean = false;
    private gearDownPressed: boolean = false;

    constructor() {
        this.pressed = {
            accelerate: false,
            brake: false,
            leftTurn: false,
            rightTurn: false,
            space: false,
            gearUp: false,
            gearDown: false
        };

        document.addEventListener('keydown', ({ key }) => {
            switch (key.toLowerCase()) {
                case "w":
                case "ArrowUp":
                    this.pressed.accelerate = true;
                    break;
                case "a":
                case "ArrowLeft":
                    this.pressed.leftTurn = true;
                    break;
                case "s":
                case "ArrowDown":
                    this.pressed.brake = true;
                    break;
                case "d":
                case "ArrowRight":
                    this.pressed.rightTurn = true;
                    break;
                case " ": // space
                    this.pressed.space = true;
                    break;
                case 'x':
                    if (!this.gearUpPressed) {
                        this.pressed.gearUp = true;
                        this.gearUpPressed = true;
                    }
                    break;
                case 'z':
                    if (!this.gearDownPressed) {
                        this.pressed.gearDown = true;
                        this.gearDownPressed = true;
                    }
                    break;
            }
        });

        document.addEventListener('keyup', ({ key }) => {
            switch (key.toLowerCase()) {
                case "w":
                case "ArrowUp":
                    this.pressed.accelerate = false;
                    break;
                case "a":
                case "ArrowLeft":
                    this.pressed.leftTurn = false;
                    break;
                case "s":
                case "ArrowDown":
                    this.pressed.brake = false;
                    break;
                case "d":
                case "ArrowRight":
                    this.pressed.rightTurn = false;
                    break;
                case " ": // space
                    this.pressed.space = false;
                    break;
                case 'x':
                    this.pressed.gearUp = false;
                    this.gearUpPressed = false;
                    break;
                case 'z':
                    this.pressed.gearDown = false;
                    this.gearDownPressed = false;
                    break;
            }
        });
    }
}