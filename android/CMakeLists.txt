cmake_minimum_required(VERSION 3.8)
project(stockfish)

set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 17)

# Include stockfish NNUE
set (NNUE_NAME nn-d0b74ce1e5eb.nnue)
file(DOWNLOAD https://tests.stockfishchess.org/api/nn/${NNUE_NAME} ../cpp/${NNUE_NAME} SHOW_PROGRESS)
file(COPY ../cpp/${NNUE_NAME} DESTINATION ${CMAKE_BINARY_DIR})

file(GLOB_RECURSE stockfishCppPaths "../cpp/stockfish/src/*.cpp")
file(GLOB_RECURSE bridgeCppPaths "../cpp/bridge/*.cpp")

add_library(stockfish
            SHARED
            ${stockfishCppPaths}
            ${bridgeCppPaths}
)