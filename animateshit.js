// const canvas = document.getElementById("canvas1");
// const ctx = canvas.getContext("2d");

// const CANVAS_WIDTH = (canvas.width = 600);
// const CANVAS_HEIGHT = (canvas.height = 600);

// const playerImage = new Image();
// playerImage.src =
//   "https://kidscancode.org/godot_recipes/4.x/img/adventurer_sprite_sheet_v1.1.png";
// const spriteWidth = 32;
// const spriteHeight = 32;
// let gameFrame = 0;
// const staggerFrames = 10;
// const spriteAnimations = [];
// const animationStates = [
//   {
//     name: "idle",
//     frames: 13,
//   },
//   {
//     name: "run",
//     frames: 8,
//   },
// ];
// animationStates.forEach((state, index) => {
//   let frames = {
//     loc: [],
//   };

//   for (let j = 0; j < state.frames; j++) {
//     let positionX = j * spriteWidth;
//     let positionY = index * spriteHeight;
//     frames.loc.push({x: positionX, y: positionY});
//   }

//   spriteAnimations[state.name] = frames;
// });

// function animate() {
//   ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
//   let position =
//     Math.floor(gameFrame / staggerFrames) % spriteAnimations["run"].loc.length;
//   let frameX = spriteWidth * position;
//   let frameY = spriteAnimations["run"].loc[position].y;
//   ctx.drawImage(
//     playerImage,
//     frameX,
//     frameY,
//     spriteWidth,
//     spriteHeight,
//     0,
//     0,
//     CANVAS_WIDTH,
//     CANVAS_WIDTH
//   );

//   gameFrame++;
//   requestAnimationFrame(animate);
// }

// animate();