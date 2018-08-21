var sinon = require('sinon');
var { Membrane } = require('./membrane');
var { Grid } = require('./Grid');
var { Observable, timer } = require('rxjs');

var should = require('should');
require('rxjs/add/operator/takeUntil');
require('rxjs/add/operator/finally');

describe("Membrane", () => {
    it('should fail when trying to create a membrane with invalid stopPredicate', () => {
        var grid = Grid.create(3, 2, "1 0 0 1 1 0");

        expect(() => new Membrane(grid, null)).toThrowErrorMatchingSnapshot();
    });

    describe("state$", () => {
        it('should cast new grid states until a satisfied condition', () => {
            var grid = Grid.create(3, 2, "1 0 0 1 1 0");
            var maxGenerations = 6;
            var timeout = timer(5000);
            var finishCondition = (grid) => grid.generations == maxGenerations;

            var spyError = sinon.spy();
            var spyComplete = sinon.spy();
            var spyCheckExpectedState = sinon.spy((state) => {
                expect(state).toMatchSnapshot();
            });

            // spy the reduce function from each of the cells
            grid.flat().forEach((cell) => sinon.spy(cell, "reducer"));

            // create a new membrane instance to test
            var membrane = new Membrane(grid, finishCondition);

            // The membrane's state that is under test
            // make sure test take no longer than the timeout
            var stateUnderTest$ = membrane.state$().takeUntil(timeout);

            stateUnderTest$.subscribe(spyCheckExpectedState, spyError, spyComplete);

            stateUnderTest$.finally(() => {
                spyError.callCount.should.be.eql(0);
                spyComplete.callCount.should.be.eql(1);

                // the first call is for getting the initial state and the others is for new generations
                spyCheckExpectedState.callCount.should.be.eql(7)

                // make sure the reduce function is called by each of the cells and invoked the total amount of generations
                grid.flat().map((cell) => cell.reducer)
                    .filter((spyReduce) => spyReduce.callCount === maxGenerations)
                    .length.should.be.eql(grid.flat().length);

            }).subscribe(() => { });

            // run the generations
            membrane.run();
        });
    });
});