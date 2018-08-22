var sinon = require('sinon');
var { Membrane } = require('./membrane');
var { Grid, cellReducer } = require('./grid');
var { Virus, infectedCellBehavior } = require('./virus');
var { Observable, timer } = require('rxjs');

var should = require('should');
require('rxjs/add/operator/takeUntil');
require('rxjs/add/operator/finally');

// Make sure the virus functionality is ok
describe('Virus', () => {
    it('should infect a membrane by changing it\'s cells behavior when the virus has the right conditions to spread', () => {
        var width = 3;
        var height = 2;

        // create a membrane to infect
        var grid = Grid.create(width, height, "1 0 0 1 1 0");
        var timeout = timer(5000);
        var maxGenerations = 6;
        var finishCondition = (grid) => grid.generations == maxGenerations;

        var spyError = sinon.spy((err) => console.log(err));
        var spyComplete = sinon.spy();
        var spyCheckExpectedState = sinon.spy((state) => {
            expect(state).toMatchSnapshot();
        });

        var membrane = new Membrane(grid, finishCondition);
        var stateUnderTest$ = membrane.state$().takeUntil(timeout);

        // as the virus infect the membrane we should expect the reduce function of the cells to be replaced
        stateUnderTest$.subscribe(spyCheckExpectedState, spyError, spyComplete);

        stateUnderTest$.finally(() => {
            spyError.callCount.should.be.eql(0);
            spyComplete.callCount.should.be.eql(1);

            // the first call is for getting the initial state and the others is for new generations
            spyCheckExpectedState.callCount.should.be.eql(7);
        }).subscribe(() => { });

        // create the virus under test
        var virus = new Virus((state) => state.generations == 5);
        virus.infect(membrane);

        membrane.run();
    });

    it('should not infect a membrane if it doesnt have the right conditions', () => {
        var width = 3;
        var height = 2;

        // create a membrane to infect
        var grid = Grid.create(width, height, "1 0 0 1 1 0");
        var timeout = timer(5000);
        var maxGenerations = 6;
        var finishCondition = (grid) => grid.generations == maxGenerations;

        var spyError = sinon.spy((err) => console.log(err));
        var spyComplete = sinon.spy();
        var spyCheckExpectedState = sinon.spy((state) => {
            expect(state).toMatchSnapshot();
        });

        var membrane = new Membrane(grid, finishCondition);
        var stateUnderTest$ = membrane.state$().takeUntil(timeout);

        // as the virus infect the membrane we should expect the reduce function of the cells to be replaced
        stateUnderTest$.subscribe(spyCheckExpectedState, spyError, spyComplete);

        stateUnderTest$.finally(() => {
            spyError.callCount.should.be.eql(0);
            spyComplete.callCount.should.be.eql(1);

            // the first call is for getting the initial state and the others is for new generations
            spyCheckExpectedState.callCount.should.be.eql(7);
        }).subscribe(() => { });

        // create the virus under test - it will never have the right conditions to spread
        var virus = new Virus((state) => false);
        virus.infect(membrane);

        membrane.run();
    });
});