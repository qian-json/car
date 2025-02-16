export interface PressedKeys {
    accelerate: boolean;
    leftTurn: boolean;
    reverse: boolean;
    rightTurn: boolean;
    space: boolean;
}

export class Controls {
    pressed: PressedKeys;

    constructor() {
        this.pressed = {
            accelerate: false,
            leftTurn: false,
            reverse: false,
            rightTurn: false,
            space: false,
        };

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        window.addEventListener(
            "keydown",
            (e: KeyboardEvent) => {
                switch (e.key) {
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
                        this.pressed.reverse = true;
                        break;
                    case "d":
                    case "ArrowRight":
                        this.pressed.rightTurn = true;
                        break;
                    case " ": // space
                        this.pressed.space = true;
                        break;
                }
            },
            false
        );

        window.addEventListener(
            "keyup",
            (e: KeyboardEvent) => {
                switch (e.key) {
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
                        this.pressed.reverse = false;
                        break;
                    case "d":
                    case "ArrowRight":
                        this.pressed.rightTurn = false;
                        break;
                    case " ": // space
                        this.pressed.space = false;
                        break;
                }
            },
            false
        );
    }
}