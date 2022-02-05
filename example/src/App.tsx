import React, { useEffect, useRef, useCallback, useState } from 'react';

import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableHighlight,
  NativeEventEmitter,
  NativeModules,
  EmitterSubscription,
} from 'react-native';
import {
  mainLoop,
  shutdownStockfish,
  sendCommand,
} from 'react-native-stockfish-android';

import { Slider } from '@miblanchard/react-native-slider';

import { Chess } from 'chess.ts';

const INITIAL_POSITION =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const chess = new Chess();

export default function App() {
  const [bestMove, setBestMove] = useState<string>('');
  const [startPosition, setStartPosition] = useState<string>(INITIAL_POSITION);
  const [error, setError] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [thinkingTime, setThinkingTime] = useState<number>(500);
  const [playedMoves, setPlayedMoves] = useState<string>('');
  const [isReady, setIsReady] = useState<boolean>(false);

  const countPieceType = useCallback((board, pieceType) => {
    let count = 0;
    for (let line of board) {
      for (let piece of line) {
        if (piece === pieceType) count++;
      }
    }
    return count;
  }, []);

  const searchBestMove = useCallback(async () => {
    if (!isReady) return;
    const positionWithTurnReversed = startPosition
      .split(' ')
      .map((elt, index) => {
        if (index === 1) {
          return elt.toLowerCase() === 'w' ? 'b' : 'w';
        } else {
          return elt;
        }
      })
      .join(' ');

    const validatedByChessJS = chess.validateFen(startPosition).valid;
    const otherKingInChess = validatedByChessJS
      ? new Chess(positionWithTurnReversed).inCheck()
      : false;
    const localChess = validatedByChessJS ? new Chess(startPosition) : null;

    const isChessmateOrStalemate =
      localChess?.inCheckmate() || localChess?.inStalemate();

    const boardPart = startPosition.split(' ')[0];
    const boardArray = boardPart.split('/').map((line) => line.split(''));
    const whiteKings = countPieceType(boardArray, 'K');
    const blackKings = countPieceType(boardArray, 'k');

    const isValidPosition =
      validatedByChessJS &&
      whiteKings === 1 &&
      blackKings === 1 &&
      !otherKingInChess;
    if (isChessmateOrStalemate) {
      setGameOver(true);
    } else if (isValidPosition) {
      await sendCommand(
        `position fen ${startPosition} ${
          playedMoves.length > 0 ? ' moves ' + playedMoves : ''
        }`
      );
      await sendCommand(`go movetime ${thinkingTime}`);
    } else {
      setError(true);
    }
  }, [startPosition, countPieceType, thinkingTime, playedMoves, isReady]);

  const handleThinkingTimeUpdate = useCallback((newValue) => {
    setThinkingTime(newValue[0]);
  }, []);

  const handleNewPositionEntered = useCallback((newValue) => {
    setStartPosition(newValue);
    setError(false);
    setGameOver(false);
  }, []);

  const handlePlayedMovesEntered = useCallback((newValue) => {
    setPlayedMoves(newValue);
  }, []);

  const resetPosition = useCallback(() => {
    setStartPosition(INITIAL_POSITION);
    setError(false);
    setGameOver(false);
  }, []);

  const handleStockfishOutput = useCallback((output: string) => {
    console.log(output);
    if (output.startsWith('bestmove')) {
      const parts = output.split(' ');
      setBestMove(parts[1]);
    } else if (output === 'readyok') {
      sendCommand('setoption name EvalFile value ./nn-b1f33bca03d3.nnue');
      sendCommand('setoption name Use NNUE value true');
      setIsReady(true);
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
  }, [handleStockfishOutput]);

  const stockfishEventListener = useRef<EmitterSubscription>();

  function cleanUp() {
    return async () => {
      await shutdownStockfish();
    };
  }

  useEffect(() => {
    setup();

    cleanUp;
  }, [setup]);

  return (
    <View style={styles.container}>
      <View style={styles.componentsColumn}>
        <TextInput
          onChangeText={handleNewPositionEntered}
          value={startPosition}
          placeholder="Your position"
        />
        <TouchableHighlight style={styles.button} onPress={resetPosition}>
          <Text style={styles.buttonText}>Reset position</Text>
        </TouchableHighlight>
      </View>
      <View style={styles.componentsColumn}>
        <Text>Thinking time</Text>
        <View style={styles.componentsRow}>
          <Slider
            containerStyle={styles.slider}
            minimumValue={500}
            maximumValue={3000}
            value={thinkingTime}
            onValueChange={handleThinkingTimeUpdate}
          />
          <Text>&nbsp;{Math.round(thinkingTime)} ms</Text>
        </View>
      </View>
      <View style={styles.componentsRow}>
        <Text>Played moves</Text>
        <TextInput
          onChangeText={handlePlayedMovesEntered}
          value={playedMoves}
          placeholder="Your moves, e.g : e2e4 c7c5"
        />
      </View>
      <TouchableHighlight style={styles.button} onPress={searchBestMove}>
        <Text style={styles.buttonText}>Compute best move</Text>
      </TouchableHighlight>
      <Text>Best move: {bestMove}</Text>

      {gameOver ? <Text>Game is already over in this position !</Text> : null}
      {error ? <Text>Illegal position !</Text> : null}
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
  componentsColumn: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  componentsRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    width: 200,
  },
});
