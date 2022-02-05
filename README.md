# react-native-stockfish-chess-engine

Use stockfish chess engine 14 in your project (Only for Android).

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
// Also you need to listen to the event 'stockfish-output' in order to get output lines from Stockfish.
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

Important notes :
* You will need to check that the position you set up is valid before sending the command "go" and its variations.
Because if the position is illegal, it will crash.
The same will happen if it is already mate/stalemate.
You can use a package like chess.ts for checking those states.

* In order to run the example, refreshing the metro packager is not enough for the application to run correctly : you will need to run the command `npx react-native run-android` again. And it may be the same for your next application using this plugin.


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

Included code from [Stockfish](https://stockfishchess.org/).