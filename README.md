# react-native-stockfish-chess-engine

Use stockfish chess engine in your project.

## Installation

```sh
npm install react-native-stockfish-chess-engine
```

## Usage

```js
import { mainLoop, shutdownStockfish, sendCommand } from 'react-native-stockfish-chess-engine';
import { NativeEventEmitter, NativeModules } from 'react-native'; // in order to read Stockfish output.

// In startup hook
const eventEmitter = new NativeEventEmitter(NativeModules.ReactNativeStockfishChessEngine);
const eventListener = eventEmitter.addListener('stockfish-output', (line) => {
      console.log("Stockfish output: "+line);
});
mainLoop(); // starts the engine process.

// When you want to read next output line :
readNextOutput();

// When you need to send a command (e.g) :
sendCommand("position start");

// In will destroy hook
shutdownStockfish(); // dispose the engine process
eventListener.remove(); // dispose the Stockfish output reader process.
```

// Also you need to listen to the event 'stockfish-output' in order to get output lines from Stockfish.


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

Included code from [Stockfish](https://stockfishchess.org/) and from [react-native-stockfish](https://github.com/sunify/react-native-stockfish).
