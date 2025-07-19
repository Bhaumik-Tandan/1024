# 1024 Game

A React Native implementation of the classic 1024 sliding puzzle game with a 5x4 grid.

## Features

- **5x4 Grid**: Unique grid size for a different gameplay experience
- **Swipe Controls**: Use swipe gestures to move tiles in all four directions
- **Block Combination**: Tiles with the same value combine when they collide
- **Score Tracking**: Keep track of your score as you play
- **Infinite Gameplay**: No win condition - play infinitely beyond any tile value!
- **Game Over Detection**: Automatic detection when no more moves are possible
- **Restart Functionality**: Easy restart when game ends

## How to Play

1. **Tap** the arrow buttons to move all tiles in that direction
2. **Combine** tiles with the same value by moving them into each other
3. **Score** points for each combination you make
4. **Goal**: Create the highest tile possible and achieve the highest score
5. **Infinite**: Game continues forever - no win condition stops you!

## Controls

- **Arrow Buttons**: Use the arrow buttons below the game board to move tiles
- **↑ Up Arrow**: Move all tiles up
- **↓ Down Arrow**: Move all tiles down
- **← Left Arrow**: Move all tiles to the left
- **→ Right Arrow**: Move all tiles to the right

## Installation & Running

1. Make sure you have Node.js and Expo CLI installed
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Start the development server:
   ```bash
   yarn start
   ```
4. Use the Expo Go app on your mobile device to scan the QR code, or run on iOS/Android simulators

## Game Mechanics

- New tiles (2 or 4) spawn randomly in empty cells after each move
- Tiles only move if there's a valid move in the direction you swipe
- When two tiles with the same value collide, they combine into a single tile with double the value
- The game ends when no more moves are possible
- You win when you create a 1024 tile

## Technical Details

- Built with React Native and Expo
- Uses TouchableOpacity for intuitive button controls
- Responsive design that adapts to different screen sizes
- Clean, modern UI with smooth animations

Enjoy playing 1024! 