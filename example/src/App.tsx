import React, { useEffect, useRef } from 'react';

import {
  StyleSheet,
  View,
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
    console.log("Got output from Stockfish: "+output);
  }

  const stockfishEventListener = useRef<EmitterSubscription>();

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(
      NativeModules.ReactNativeStockfishChessEngine
    );
    stockfishEventListener.current = eventEmitter.addListener(
      'stockfish-output',
      (event) => {
        handleStockfishOutput(event);
      }
    );
    mainLoop();
    sendCommand('uci');

    setTimeout(() => {
      sendCommand('isready');
    }, 50);

    return () => {
      shutdownStockfish();
    };
  }, [stockfishEventListener]);

  return (
    <View style={styles.container}>
      <Text>Stockfish demo</Text>
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
