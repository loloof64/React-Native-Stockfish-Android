cmake_minimum_required(VERSION 3.8)
project(stockfish)

set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 17)

add_library(stockfish
            SHARED
            ../cpp/stockfish/benchmark.cpp
            ../cpp/stockfish/bitbase.cpp
            ../cpp/stockfish/bitboard.cpp
            ../cpp/stockfish/endgame.cpp
            ../cpp/stockfish/evaluate.cpp
            ../cpp/stockfish/lockedstringqueue.cpp
            ../cpp/stockfish/material.cpp
            ../cpp/stockfish/misc.cpp
            ../cpp/stockfish/movegen.cpp
            ../cpp/stockfish/movepick.cpp
            ../cpp/stockfish/pawns.cpp
            ../cpp/stockfish/position.cpp
            ../cpp/stockfish/psqt.cpp
            ../cpp/stockfish/search.cpp
            ../cpp/stockfish/sharedioqueues.h
            ../cpp/stockfish/stockfish.cpp
            ../cpp/stockfish/thread.cpp
            ../cpp/stockfish/timeman.cpp
            ../cpp/stockfish/tt.cpp
            ../cpp/stockfish/tune.cpp
            ../cpp/stockfish/uci.cpp
            ../cpp/stockfish/ucioption.cpp
            ../cpp/stockfish/nnue/evaluate_nnue.cpp
            ../cpp/stockfish/nnue/features/half_ka_v2_hm.cpp
            ../cpp/stockfish/syzygy/tbprobe.cpp
)

# Specifies a path to native header files.
include_directories(
            ../cpp
            ../cpp/stockfish/
            ../cpp/stockfish/incbin
            ../cpp/stockfish/nnue
            ../cpp/stockfish/syzygy
)
