var {
    getGrid
} = require('./membrane');
var {
    singleLiveNeighbor,
    noHorizontalOrVerticalLiveNeighbors
} = require('./grid');
var {
    getAliveProp,
    createCellState
} = require('./cell');

var R = require('ramda');
var _ = require('lodash');

require('rxjs/add/operator/first');

var nextStateWhenAlive = (neighbors) => {
    if (noHorizontalOrVerticalLiveNeighbors(neighbors)) {
        return createCellState(false);
    }

    return null;
};

var nextStateWhenDead = R.cond([
    [singleLiveNeighbor, () => createCellState(true)],
    [R.T, () => null]
]);

var infectedCellBehavior = R.curry((state, neighbors) => {
    if (getAliveProp(state)) {
        return nextStateWhenAlive(neighbors) || state;
    } else {
        return nextStateWhenDead(neighbors) || state;
    }
});

function Virus(isSuitableToSpreadPredicate) {
    _.bindAll(this);

    this.isSuitableToSpread = isSuitableToSpreadPredicate;
}

Virus.prototype = Object.create(Object.prototype);

/**
 * The virus infection method.
 * By accessing a membrane a virus can either infect a particular cell or the entire colony of cells
 * injecting it's poision and changes the cell's behavior.
 * Additionally the virus can be sleep until the environment of the membrane is suitable enough for it to spread.
 */
Virus.prototype.infect = function (membrane) {
    // trigger the consciousness of the virus by changing the cells behavior  
    membrane.state$()
        .first(this.isSuitableToSpread)
        // Get data that is ralavent to this function
        .map(getGrid)
        // replace each of the cells behavior
        .subscribe((grid) => grid.flat().forEach((cell) => cell.reduce = infectedCellBehavior.bind(cell)));
}

module.exports = {
    Virus
};