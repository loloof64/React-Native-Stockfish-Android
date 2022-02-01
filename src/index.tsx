import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-stockfish-chess-engine' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const StockfishChessEngine = NativeModules.StockfishChessEngine
  ? NativeModules.StockfishChessEngine
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

/**
Starts the main loop, and runs forever, unless the command 'quit' is sent !
So don't forget to send 'quit' command when you're about to exit !
Also, you'd better launch this command in a new "thread".
*/
export function mainLoop(): void {
  StockfishChessEngine.mainLoop();
}

/**
Disposes Stockfish engine.
*/
export function shutdownStockfish() {
  return StockfishChessEngine.shutdownStockfish();
}

/**
 * Sends ac command to the stockfish process input. Sending several commands without reading them 
 * will simply have them queued one after the other.
 * @param command - String - command to be sent to the stockfish process input.
 */
export function sendCommand(command: string): void {
  return StockfishChessEngine.sendCommand(command);
}
