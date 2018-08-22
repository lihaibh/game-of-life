var R = require('ramda');
var _ = require('lodash');
var { select } = require('./utils');

/**
 * The reduce is a function that receive the neighbors of the cell and
 * generate the next state of the cell
 */
function Cell(alive, reducer) {
    this.state = createCellState(Boolean(alive));
    this.reducer = reducer;

    // make sure when reduce function is changed the result of the reduce function 
    Object.defineProperty(this, 'reduce', {
        get() {
            return function (neighbors) {
                return this.reducer(this.state, neighbors)
            };
        },
        set(newReducer) {
            this.reducer = newReducer;
        },
        configurable: true
    });

    _.bindAll(this);
}

Cell.prototype = Object.create(Object.prototype);

function createCellState(alive) {
    return {
        // is the cell alive or dead?
        alive
    };
}

// Util functions
var getState = select(['state']);
var getAliveProp = select(['alive']);
var getAlive = R.pipe(getState, getAliveProp);
var isAlive = R.pipe(getAlive, R.equals(true));
var isDead = R.complement(isAlive);

module.exports = {
    Cell,
    isAlive,
    isDead,
    getAlive,
    getAliveProp,
    createCellState
};