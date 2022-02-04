import React, { useEffect, useRef, useCallback } from 'react';

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
  function handleStockfishOutput(output: string) {
    console.log('Got output from Stockfish: ' + output);
  }

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
    /////////////////////////////////////////////
    console.log('Sending command UCI to engine');
    /////////////////////////////////////////////
    await sendCommand('uci');
  }, []);

  const searchBestMove = useCallback(async () => {
    /////////////////////////////////////////////
    console.log('Sending command Go to engine');
    /////////////////////////////////////////////
    await sendCommand('go movetime 1000');
  }, []);

  const stockfishEventListener = useRef<EmitterSubscription>();

  function cleanUp() {
    return async () => {
      ///////////////////////////////
      console.log("Cleaning up Stockfish");
      ///////////////////////////////
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
