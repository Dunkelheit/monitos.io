'use strict';

var Monito = require('monitos');

class MonitoIo extends Monito {

    constructor(states, startState) {
        super(states, startState);
    }
}

module.exports = MonitoIo;