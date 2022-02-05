declare module 'react-native-stockfish-android' {
  export function mainLoop();
  export function shutdownStockfish();
  export function sendCommand(command: string);
}
