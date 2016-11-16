'use strict';

const expect = require('chai').expect;
const client = require('socket.io/node_modules/socket.io-client');

const Monito = require('../lib/monito.io');

const SOCKET_PORT = 9801;
const SOCKET_URL = 'http://localhost:' + SOCKET_PORT;

function getFooBarStates() {
    return {
        foo: (next) => {
            next(null, 'bar');
        },
        bar: (next) => {
            next();
        }
    };
}

function assertFooBarStates(states) {
    expect(states).to.be.an('array').and.have.length(2);
    expect(states[0].previousState).to.be.undefined; // jshint ignore:line
    expect(states[0]).to.have.property('nextState', 'foo');
    expect(states[1]).to.have.property('previousState', 'foo');
    expect(states[1]).to.have.property('nextState', 'bar');
}

function getOptions() {
    return {
        states: getFooBarStates(),
        initialState: 'foo'
    };
}

describe('Monitos', () => {

    describe('Happy flows', () => {

        it('Opens a socket to port ' + SOCKET_PORT + ', and this is available on all events', next => {
            let states = [];
            Monito.openSocket(SOCKET_PORT);
            let chimp = new Monito(getOptions());
            chimp.start();
            chimp.on('transition', data => {
                var socket = Monito.getSocket();
                expect(socket).to.exist.and.be.an('object');
                states.push(data);
            });
            chimp.on('end', data => {
                var socket = Monito.getSocket();
                expect(socket).to.exist.and.be.an('object');
                Monito.closeSocket();
                expect(data).to.have.property('finalState', 'bar');
                assertFooBarStates(states);
                next();
            });
        });

        it('Works when the socket is not opened; closing the socket in this case doesn\'t break anything', next => {
            let states = [];
            let chimp = new Monito(getOptions());
            chimp.start();
            chimp.on('transition', data => {
                var socket = Monito.getSocket();
                expect(socket).to.not.exist; // jshint ignore:line
                states.push(data);
            });
            chimp.on('end', data => {
                var socket = Monito.getSocket();
                expect(socket).to.not.exist; // jshint ignore:line
                Monito.closeSocket();
                expect(data).to.have.property('finalState', 'bar');
                assertFooBarStates(states);
                next();
            });
        });
    });

    describe('Socket communication', () => {

        let clientSocket;

        beforeEach(done => {
            Monito.openSocket(SOCKET_PORT);
            clientSocket = client.connect(SOCKET_URL);
            clientSocket.on('connect', () => {
                // TODO: Why is the timeout necessary>
                setTimeout(done, 100);
            });
        });

        afterEach(done => {
            if (clientSocket.connected) {
                clientSocket.disconnect();
            }
            Monito.closeSocket();
            done();
        });

        it('Communicates with the client', next => {
            let chimp = new Monito(getOptions());
            let clientStates = [];
            let serverStates = [];
            clientSocket.on('transition', data => {
                clientStates.push(data);
            });
            clientSocket.on('end', data => {
                assertFooBarStates(clientStates);
                assertFooBarStates(serverStates);
                expect(data).to.have.property('finalState', 'bar');
                next();
            });
            chimp.start();
            chimp.on('transition', data => {
                serverStates.push(data);
            });
        });
    });
});