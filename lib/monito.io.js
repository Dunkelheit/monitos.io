'use strict';

const Monito = require('monitos');
const socketio = require('socket.io');

let io;

class MonitoIo extends Monito {

    static openSocket(server, options) {
        io = socketio(server, options);
        return io;
    }

    static closeSocket() {
        if (!io) {
            return;
        }
        io.close();
        io = null;
    }

    static getSocket() {
        return io;
    }

    constructor(states, startState) {
        super(states, startState);
    }

    emit() {
        super.emit.apply(this, arguments);
        if (io) {
            io.emit.apply(io, arguments);
        }
    }
}

module.exports = MonitoIo;