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
* You must download a stockfish NNUE file (from https://tests.stockfishchess.org/nns) and set option for it to be recognized :
 - put the NNUE file somewhere in your project, I'll recommand you somewhere under your src folder
 - send command `setoption name EvalFile value ${relativePath}` to Stockfish in your setup hook, best is after readyok has been sent by Stockfish
 - send command `setoption name Use NNUE value true` thereafter.
 Also you need to set up Metro Bundler to add nnue file for bundling:
  - add this import `const defaultAssetExts = require("metro-config/src/defaults/defaults").assetExts;` on the imports section at top of the file
  - add this in the `resolver` property :
  ```js
  assetExts: [...defaultAssetExts, 'nnue'],
  ```
  Also don't forget to import the nnue file somewhere in your code `import './nn-b1f33bca03d3.nnue';` and you should be done.
 If you don't want to use NNUE file, don't forget to remove this feature : `setoption name Use NNUE value false`, otherwise, the program may crash.
* You will need to check that the position you set up is valid before sending the command "go" and its variations.
Because if the position is illegal, it will crash.
The same will happen if it is already mate/stalemate.
You can use a package like chess.ts for checking those states.
Please also notice that chess.ts (based on chess.js) does not check everything at the time this plugin has been released, in particular :
- if they are exactly one king for each side
- if the other side is not in check
You will have to check those yourself, as in the example if you want. (The example can be found on the github reposiitory : https://github.com/loloof64/React-Native-Stockfish-Android/tree/main/example).

* In order to run the example, refreshing the metro packager is not enough for the application to run correctly : you will need to run the command `npx react-native run-android` again. And it may be the same for your next application using this plugin.


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

Included code from [Stockfish](https://stockfishchess.org/).