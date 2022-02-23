# react-native-stockfish-chess-engine

Use stockfish chess engine 14 in your project (Only for Android).

## Installation

```sh
npm install react-native-stockfish-android
```

## Usage

```js
// Notice that all methods are asynchronous.
import { mainLoop, shutdownStockfish, sendCommand } from 'react-native-stockfish-android';
import { NativeEventEmitter, NativeModules } from 'react-native'; // in order to read Stockfish output.

// In startup hook
const eventEmitter = new NativeEventEmitter(NativeModules.ReactNativeStockfishChessEngine);
// Also you need to listen to the event 'stockfish-output' in order to get output lines from Stockfish.
const eventListener = eventEmitter.addListener('stockfish-output', (line) => {
      console.log("Stockfish output: "+line);
});
await mainLoop(); // starts the engine process.

// When you need to send a command (e.g) :
await sendCommand("position start");

// In will destroy hook
await shutdownStockfish(); // dispose the engine process
eventListener.remove(); // dispose the Stockfish output reader process.
```

Important notes :
* You will need to check that the position you set up is valid before sending the command "go" and its variations.
Because if the position is illegal, it will crash.
The same will happen if it is already mate/stalemate.
You can use a package like chess.ts for checking those states.
Please also notice that chess.ts (based on chess.js) does not check everything at the time this plugin has been released, in particular :
- if they are exactly one king for each side
- if the other side is not in check
You will have to check those yourself, as in the example if you want.

* In order to run the example, refreshing the metro packager is not enough for the application to run correctly : you will need to run the command `npx react-native run-android` again. And it may be the same for your next application using this plugin.


## Developers

### Changing the downloaded NNUE file

1. Go to [Stockfish NNUE files page](https://tests.stockfishchess.org/nns) and select a reference from the list.
2. Modify CMakeLists.txt, by replacing the NNUE reference with the selected one in both places in the line starting by `file(DOWNLOAD `.
3. Modify the reference name in `evaluate.h` in the line containing `#define EvalFileDefaultName   `.

Then you're to compile again.

## License

MIT

Included code from [Stockfish](https://stockfishchess.org/).