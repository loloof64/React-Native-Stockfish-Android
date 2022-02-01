import React, { useEffect, useRef, useCallback } from 'react';

import {
  StyleSheet,
  View,
  Button,
  Text,
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

    setTimeout(() => {
      mainLoop();
      sendCommand('uci');

      setTimeout(() => {
        sendCommand('isready');
      }, 150);
    }, 100);
  }, []);

  const sendUCICommand = useCallback(() => sendCommand('uci'), []);

  const stockfishEventListener = useRef<EmitterSubscription>();

  useEffect(() => {
    setup();

    return () => {
      shutdownStockfish();
    };
  }, []);
  return (
    <View style={styles.container}>
      <Button onPress={sendUCICommand} title='Get engine options'/>
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
});
