var {
    Observable,
    BehaviorSubject
} = require('rxjs');

// Add operators to Observable prototype
require('rxjs/add/operator/map');
require('rxjs/add/operator/takeWhile');
require('rxjs/add/operator/distinctUntilChanged');
require('rxjs/add/operator/do');

var {
    Grid
} = require('./grid');

var R = require('ramda');
var _ = require('lodash');

const noop = () => { };

/**
 * The membrane is an area in which cells are formed and destroyed.
 * It contains a grid of biological cells and provide a way to inspect the evolution
 * of the cells until a satisfied condition about the grid is reached.
 * 
 * @param grid a matrix of biological cells, this is the initial state of the membrane @see Grid
 * @param stopPredicate the condition in which the membrane state is satisfied
 */
function Membrane(grid, stopPredicate) {

    if (!Object.prototype.isPrototypeOf(grid)) {
        throw new TypeError('the grid is not of the right type');
    }

    if (typeof stopPredicate !== 'function') {
        throw new TypeError('the predicate is not in the right format');
    }

    var initialState = {
        generations: 0, // the number of passed generation
        grid: grid // the initial grid of cells
    };

    this.dispatcher$ = new BehaviorSubject(initialState);

    this.stopPredicate = stopPredicate;

    // bind all function prototypes to the new created object
    _.bindAll(this);
}

/**
 * Get the previous state and generate the next state.
 */
function reducer(state) {
    var flatGrid = state.grid.flat();

    // calculate the next state of the cells inside the membrane
    flatGrid.map((cell, index) =>
        // invoke the reduce function of the cell, get its next transformation
        cell.reduce(state.grid.neighbors(index))
    ).forEach((nextCellState, index) => {
        // it's necessary to replace all the cells at once
        flatGrid[index].state = nextCellState;
    });

    // TODO: the reduce function of a cell might be asynchronous, 
    // await for all the cells to complete their transformation

    state.generations++;

    return state;
}

/**
 * Get the last emitted state of the membrane.
 */
Membrane.prototype.snapshot = function () {
    return this.dispatcher$.getValue();
}

Membrane.prototype.state$ = function (mapper) {
    if (mapper && typeof mapper === 'function') {
        return this.dispatcher$.asObservable().map(mapper);
    }

    return this.dispatcher$.asObservable();
}

/**
 * start the game by running the cycle of life and death inside the membrane area.
 */
Membrane.prototype.run = function () {
    // Create a side effect that calculates the generations on every change
    var membraneTransformation = this.state$()
        // stop generating new states by the stop condition
        .takeWhile(R.complement(this.stopPredicate))
        // calculate the next state of the membrane
        .map(reducer.bind(this))
        // multicast the change to listeners
        .subscribe(this.dispatcher$);

    // trigger the membrane transofmration
    // stateUpdatesSubscription = membraneTransformation.subscribe(noop);
};

// fetchers from state
var getGrid = R.prop('grid');
var getGenerations = R.prop('generations');

module.exports = {
    Membrane,
    getGrid,
    getGenerations
};