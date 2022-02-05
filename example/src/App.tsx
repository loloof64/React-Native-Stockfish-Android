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
} from 'react-native-stockfish-chess-engine';

import { Chess } from 'chess.ts';

const INITIAL_POSITION =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const chess = new Chess();

export default function App() {
  const [bestMove, setBestMove] = useState<string>('');
  const [startPosition, setStartPosition] = useState<string>(INITIAL_POSITION);
  const [error, setError] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);

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
      /////////////////////////////////
      console.log('Searching move for position: ' + startPosition);
      /////////////////////////////////
      await sendCommand(`position fen ${startPosition}`);
      await sendCommand('go movetime 1000');
    } else {
      setError(true);
    }
  }, [startPosition, countPieceType]);

  const handleNewPositionEntered = useCallback((newValue) => {
    setStartPosition(newValue);
    setError(false);
    setGameOver(false);
  }, []);

  const resetPosition = useCallback(() => {
    setStartPosition(INITIAL_POSITION);
    setError(false);
    setGameOver(false);
  }, []);

  const handleStockfishOutput = useCallback((output: string) => {
    ///////////////////////////
    console.log(output);
    ///////////////////////////
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
      <View style={styles.componentsLine}>
        <TextInput
          onChangeText={handleNewPositionEntered}
          value={startPosition}
        />
        <TouchableHighlight style={styles.button} onPress={resetPosition}>
          <Text style={styles.buttonText}>Reset position</Text>
        </TouchableHighlight>
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
  componentsLine: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {},
});
