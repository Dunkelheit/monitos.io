![Monitos](assets/monitos.io.png?raw=true "Monitos.IO")

# Monitos.IO

An extension of [Monitos](https://github.com/dunkelheit/monitos) where all events are emitted to [Socket.IO](http://socket.io).

Example:

```javascript
Monito.openSocket(9183);            // Socket.IO server on port 9183

let chimp = new Monito({
    register: (monito, next) => {
        next(null, 'getProfile');   // Go straight to the state "getProfile"
    },
    getProfile: (monito, next) => {
        next(null, {
            browse: 4               // If your dice rolls 4 or more, go to "browse"
        }, 'shop');                 // Otherwise, by default, go to "shop"
    },
    browse: (monito, next) => {
        next(null, {
            browse: monito => 6     // You can also use functions
        }, 'shop');                 
    },
    shop: (monito, next) => {
        next(null, 'logout');       // Go straight to the state "logout"
    },
    logout: (monito, next) => {
        next();                     // This will be the last state
    }
}, 'register');                     // Initial state

chimp.start();
```

See the [full code of the example](example).

## Usage

```
Monito.openSocket(9183);

let chimp = new Monito(states, initialState);

chimp.on('end', () => {
    Monito.closeSocket()
});
```

### Static methods

* `Monito.openSocket(arguments)` - Initializes Socket.IO. For a full list of options, check the [Socket.IO documentation](http://socket.io/docs/server-api/#server).
* `Monito.closeSocket()` - Closes Socket.IO socket.
* `Monito.getSocket()` - Returns the Socket.IO socket.

### Arguments

There are no new constructor arguments. For a full list of arguments, check the [Monitos documentation](https://github.com/dunkelheit/monitos#arguments).
 
### Events

There are no new events. For a full list of events, check the [Monitos documentation](https://github.com/dunkelheit/monitos#events).

### API

There are no new API methods.  For a full list, check the [Monitos documentation](https://github.com/dunkelheit/monitos#API).

## Testing

Run all the tests (linting and unit tests) with the following npm task:

```
> npm test
```

You can run the linting and the unit tests individually:

```
> gulp test
> gulp lint
```

## License

[MIT](LICENSE)