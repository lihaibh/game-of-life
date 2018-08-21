var {
    Cell,
    getAliveProp,
    isAlive,
    createCellState
} = require('./cell');

var {
    select
} = require('./utils');
var R = require('ramda');
var _ = require('lodash');

/**
 * The grid is a matrix of cells.
 * The grid is used a state to the current generation.
 */
function Grid(matrix, width, height) {
    this.matrix = matrix;
    this.width = width;
    this.height = height;
}

/**
 * Creating a new grid of cells
 */
Grid.create = (width, height, seed) => {
    // Check the types are ok
    if (typeof seed === 'string') {
        seed = seed.split(" ");
    }

    if (typeof seed !== typeof []) {
        throw new TypeError(`unexpected type: ${typeof seed} for the 'seed' parameter, expected type of array`);
    }

    if (typeof width !== 'number') {
        throw new TypeError(`unexpected type: ${typeof width} for the width parameter, expected type of number`);
    }

    if (typeof height !== 'number') {
        throw new TypeError('');
    }

    // replace with 'Cell' objects
    var matrix = seed.map((isAlive) => new Cell(isAlive, cellReducer))
        // create a matrix (an array of arrays of cell objects)
        // the amount of rows is depends by the height and the amount of columns is depends by the width
        .reduce((rows, cell, index) => {
            (index % width == 0) ? rows.push([cell]) : rows[Math.floor(index / width)].push(cell);

            return rows;
        }, []);

    var invalidRows = matrix.map(R.prop('length'))
        // all rows without the length of 'width'
        .find(R.complement(R.equals(width)));

    // make sure the grid is in the right size
    if (height !== matrix.length || invalidRows) {
        throw new Error('the seed is invalid');
    }

    return new Grid(matrix, width, height);
};

/**
 * Get the grid as 1 line
 */
Grid.prototype.flat = function () {
    return _.flatten(this.matrix);
}

/**
 * Get the neighbors of the wanted cell by an index.
 */
Grid.prototype.neighbors = function (index) {
    var row = Math.floor(index / this.height);
    var col = index % this.height;

    return [
        // top
        select([row - 1, col - 1], this.matrix), select([row - 1, col], this.matrix), select([row - 1, col + 1], this.matrix),
        // center
        select([row, col - 1], this.matrix), select([row, col + 1], this.matrix),
        // down
        select([row + 1, col - 1], this.matrix), select([row + 1, col], this.matrix), select([row + 1, col + 1], this.matrix)
    ];
}

var fewerThan2LiveNeighbors = R.pipe(R.filter(isAlive), R.prop('length'), R.lt(R.__, 2));
var exactly3LiveNeighbors = R.pipe(R.filter(isAlive), R.prop('length'), R.equals(3));
var exactly2LiveNeighbors = R.pipe(R.filter(isAlive), R.prop('length'), R.equals(2));
var twoOrThreeLiveNeighbors = R.converge(R.or, [exactly3LiveNeighbors, exactly2LiveNeighbors]);
var singleLiveNeighbor = R.pipe(R.filter(isAlive), R.prop('length'), R.equals(1));

var noHorizontalOrVerticalLiveNeighbors = R.curry((neighbors) => {
    return !(select([1, 'alive'], neighbors) && select([3, 'alive'], neighbors) &&
        select([4, 'alive'], neighbors) && select([6, 'alive'], neighbors));
});

var nextStateWhenAlive = R.cond([
    // under population
    [fewerThan2LiveNeighbors, () => createCellState(false)],
    // perfect conditions to stay alive
    [twoOrThreeLiveNeighbors, () => createCellState(true)],
    // more than 3 live neighbors (over population)
    [R.T, () => createCellState(false)],
]);

var nextStateWhenDead = R.cond([
    [exactly3LiveNeighbors, () => createCellState(true)],
    // Otherwise, keep the cell dead
    [R.T, () => createCellState(false)]
]);

/**
 * Receives the current cell state and it's neighbors and determines it's next state.
 * ex: (state, neighbors) => nextstate
 */
function cellReducer(state, neighbors) {
    if (getAliveProp(state)) {
        return nextStateWhenAlive(neighbors);
    } else {
        return nextStateWhenDead(neighbors);
    }
};

module.exports = {
    Grid,
    singleLiveNeighbor
};