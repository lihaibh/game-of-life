var R = require('ramda');

module.exports = {
    select: R.curry((path, outerObj) => {
        return path.reduce((innerObj, key) =>
            (innerObj && innerObj[key] !== 'undefined') ? innerObj[key] : undefined, outerObj);
    }),
    parseProgramInput: () => {
        var input = process.argv.slice(2);
        var result = {};

        if (!Array.prototype.isPrototypeOf(input)) {
            throw new TypeError('the program input must be of type array');
        }

        result.width = parseInt(input[0], 10);
        result.height = parseInt(input[1], 10);
        result.infectAfter = parseInt(input[2], 10);
        result.maxGenerations = parseInt(input[3], 10);
        result.seed = input[4].split(" ").map((num) => parseInt(num, 10));

        return result;
    }
}