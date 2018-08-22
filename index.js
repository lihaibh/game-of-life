var { of
} = require('rxjs');
var {
    Membrane,
    getGrid,
    getGenerations
} = require('./membrane');
var {
    parseProgramInput
} = require('./utils');
var {
    Grid,
} = require('./grid');

var {
    getAlive
} = require('./cell');

var {
    width,
    height,
    infectAfter,
    maxGenerations,
    seed
} = parseProgramInput();
var {
    Virus
} = require('./virus');

require('rxjs/add/operator/map');
require('rxjs/add/operator/skip');
require('rxjs/add/operator/first');

var R = require('ramda');

var biggerThanMaxGenerations = R.pipe(getGenerations, R.gte(R.__, maxGenerations));
var infectionAfterGenerations = R.pipe(getGenerations, R.equals(infectAfter));

// Create a membrane and track it's state
var membrane = new Membrane(Grid.create(width, height, seed), biggerThanMaxGenerations);

// listen to changes in the grid and after specific amount of generations activate the virus
var virus = new Virus(infectionAfterGenerations);
virus.infect(membrane);

// Observe each state of the membrane and output it to the standard output (console)
var pipeGrid2Stdout = membrane.state$(getGrid)
    .skip(1)
    // get list of cells
    .map(grid => grid.flat())
    // get the alive state of each cell
    .map(R.map(getAlive))
    .map((isAlive) => isAlive ? 1 : 0)
    // display to the console
    .subscribe(console.log);

// trigger the game of life
membrane.run();