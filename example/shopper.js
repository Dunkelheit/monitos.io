'use strict';

const Monito = require('../lib/monito.io');

class Shopper extends Monito {

    constructor(states, startState) {
        super(states, startState);
    }
}

function delay(done) {
    setTimeout(done, 200);
}

const states = {
    register: (monito, next) => {
        delay(() => {
            next(null, 'getProfile');
        });
    },
    getProfile: (monito, next) => {
        delay(() => {
            next(null, {
                browse: 4
            }, 'shop');
        });
    },
    browse: (monito, next) => {
        delay(() => {
            next(null, {
                browse: (/* monito */) => 6
            }, 'shop');
        });
    },
    shop: (monito, next) => {
        delay(() => {
            next(null, 'logout');
        });
    },
    logout: (monito, next) => {
        delay(() => {
            next(null, 'register');
        });
    }
};

Monito.openSocket(9183);

let chimp = new Shopper(states, 'register');

chimp.on('error', function (err) {
    console.log('An error has occurred');
    console.log(err);
});

chimp.on('state', function (state) {
    console.log('New state:', state);
});

chimp.on('end', function () {
    console.log('Ok bye!');
    Monito.closeSocket();
});

chimp.start();
