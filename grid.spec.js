var { Grid } = require('./grid');

describe("Grid", () => {
    describe("creation", () => {
        it('should fail when providing an invalid seed by the length', () => {
            expect(() => Grid.create(3, 3, "1 0 0 1 1 0")).toThrowErrorMatchingSnapshot();
        });
    });

    describe("neighbors", () => {
        it('should return an array of 8 cell neighbors', () => {
            var grid = Grid.create(3, 3, "1 0 0 1 1 0 0 1 0");

            // out of range
            expect(grid.neighbors(7)).toMatchSnapshot();
            expect(grid.neighbors(-1)).toMatchSnapshot();

            // in the center
            expect(grid.neighbors(4)).toMatchSnapshot();

            // in the edges
            expect(grid.neighbors(0)).toMatchSnapshot();
            expect(grid.neighbors(2)).toMatchSnapshot();
            expect(grid.neighbors(6)).toMatchSnapshot();
            expect(grid.neighbors(8)).toMatchSnapshot();
        });
    });
});