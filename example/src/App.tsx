import React, { useEffect, useRef, useCallback, useState } from 'react';

import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  NativeEventEmitter,
  NativeModules,
  EmitterSubscription,
} from 'react-native';
import {
  mainLoop,
  shutdownStockfish,
  sendCommand,
} from 'react-native-stockfish-chess-engine';

export default function App() {

  const [bestMove, setBestMove] = useState("");

  const handleStockfishOutput = useCallback((output: string) => {
    if (output.startsWith('bestmove')) {
      const parts = output.split(' ');
      setBestMove(parts[1]);
    }
  }, []);

  const setup = useCallback(() => {
    const eventEmitter = new NativeEventEmitter(
      NativeModules.ReactNativeStockfishChessEngine
    );
    stockfishEventListener.current = eventEmitter.addListener(
      'stockfish-output',
      (event) => {
        handleStockfishOutput(event);
      }
    );

    setTimeout(async () => {
      await mainLoop();
      await sendCommand('uci');

      setTimeout(async () => {
        await sendCommand('isready');
      }, 150);
    }, 100);
  }, []);

  const sendUCICommand = useCallback(async () => {
    await sendCommand('uci');
  }, []);

  const searchBestMove = useCallback(async () => {
    await sendCommand('go movetime 1000');
  }, []);

  const stockfishEventListener = useRef<EmitterSubscription>();

  function cleanUp() {
    return async () => {
      await shutdownStockfish();
    };
  }

  useEffect(() => {
    setup();

    cleanUp;
  }, []);

  return (
    <View style={styles.container}>
      <TouchableHighlight style={styles.button} onPress={sendUCICommand}>
        <Text style={styles.buttonText}>Get engine options</Text>
      </TouchableHighlight>
      <TouchableHighlight style={styles.button} onPress={searchBestMove}>
        <Text style={styles.buttonText}>Compute best move</Text>
      </TouchableHighlight>
      <Text>Best move: {bestMove}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  button: {
    backgroundColor: 'blue',
    marginVertical: 8,
    padding: 5,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
  },
});
