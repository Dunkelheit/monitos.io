'use strict';

const expect = require('chai').expect;
const client = require('socket.io/node_modules/socket.io-client');

const Monito = require('../lib/monito.io');

const SOCKET_PORT = 9801;
const SOCKET_URL = 'http://localhost:' + SOCKET_PORT;

function getFooBarStates() {
    return {
        foo: (monito, next) => {
            next(null, 'bar');
        },
        bar: (monito, next) => {
            next();
        }
    };
}

function assertFooBarStates(states) {
    expect(states).to.be.an('array').and.have.length(2);
    expect(states[0]).to.equal('foo');
    expect(states[1]).to.equal('bar');
}

describe('Monitos', () => {

    describe('Happy flows', () => {

        it('Opens a socket to port ' + SOCKET_PORT + ', and this is available on all events', next => {
            let states = [];
            Monito.openSocket(SOCKET_PORT);
            let chimp = new Monito(getFooBarStates(), 'foo');
            chimp.start();
            chimp.on('state', state => {
                var socket = Monito.getSocket();
                expect(socket).to.exist.and.be.an('object');
                states.push(state);
            });
            chimp.on('end', () => {
                var socket = Monito.getSocket();
                expect(socket).to.exist.and.be.an('object');
                Monito.closeSocket();
                assertFooBarStates(states);
                next();
            });
        });

        it('Works when the socket is not opened; closing the socket in this case doesn\'t break anything', next => {
            let states = [];
            let chimp = new Monito(getFooBarStates(), 'foo');
            chimp.start();
            chimp.on('state', state => {
                var socket = Monito.getSocket();
                expect(socket).to.not.exist; // jshint ignore:line
                states.push(state);
            });
            chimp.on('end', () => {
                var socket = Monito.getSocket();
                expect(socket).to.not.exist; // jshint ignore:line
                assertFooBarStates(states);
                Monito.closeSocket();
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
            let chimp = new Monito(getFooBarStates(), 'foo');
            let clientStates = [];
            let serverStates = [];
            clientSocket.on('state', (state) => {
                clientStates.push(state);
            });
            clientSocket.on('end', () => {
                assertFooBarStates(clientStates);
                assertFooBarStates(serverStates);
                next();
            });
            chimp.start();
            chimp.on('state', function (state) {
                serverStates.push(state);
            });
        });
    });
});