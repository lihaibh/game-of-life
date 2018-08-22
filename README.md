# Game Of Life Game
[![Build Status](https://travis-ci.org/lihaibh/game-of-life.svg?branch=feature%2Fgame-implementation-v1.0.0)](http://travis-ci.org/lihaibh/game-of-life)

This is a simple implementation of the game "game of life" in which ther e is a grid of cells, each cell has a state "live" or "dead", the grid is continously evolved until a specific condition about it's state is satisfied.

Additionally it's possible to create a "Virus" object that can be injected into the grid and change the behavior of cells.

# How To Run The Game?
make sure all dependancies are installed
`npm install`
running the game:
`npm start -- [width] [height] [​infect-after​] [​max-generations​] [seed]`

# Tests
running tests is simple, just run the command:
`npm test`
