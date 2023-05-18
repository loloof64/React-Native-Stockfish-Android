#include <stdio.h>
#include <unistd.h>
#include <jni.h>

#include "../stockfish/src/bitboard.h"
#include "../stockfish/src/endgame.h"
#include "../stockfish/src/position.h"
#include "../stockfish/src/psqt.h"
#include "../stockfish/src/search.h"
#include "../stockfish/src/syzygy/tbprobe.h"
#include "../stockfish/src/thread.h"
#include "../stockfish/src/tt.h"
#include "../stockfish/src/uci.h"

// https://jineshkj.wordpress.com/2006/12/22/how-to-capture-stdin-stdout-and-stderr-of-child-program/
#define NUM_PIPES 2
#define PARENT_WRITE_PIPE 0
#define PARENT_READ_PIPE 1
#define READ_FD 0
#define WRITE_FD 1
#define PARENT_READ_FD (pipes[PARENT_READ_PIPE][READ_FD])
#define PARENT_WRITE_FD (pipes[PARENT_WRITE_PIPE][WRITE_FD])
#define CHILD_READ_FD (pipes[PARENT_WRITE_PIPE][READ_FD])
#define CHILD_WRITE_FD (pipes[PARENT_READ_PIPE][WRITE_FD])

#define STRINGS_SIZE 250

int main(int, char **);

const char *QUITOK = "quitok\n";
int pipes[NUM_PIPES][2];
char buffer[STRINGS_SIZE+1];

int stockfish_init()
{
  pipe(pipes[PARENT_READ_PIPE]);
  pipe(pipes[PARENT_WRITE_PIPE]);

  return 0;
}

int stockfish_main()
{
  dup2(CHILD_READ_FD, STDIN_FILENO);
  dup2(CHILD_WRITE_FD, STDOUT_FILENO);

  int argc = 1;
  char *argv[] = {(char *) ""};

  int exitCode = main(argc, argv);

  std::cout << QUITOK << std::flush;

  return exitCode;
}

ssize_t stockfish_stdin_write(const char *data)
{
  return write(PARENT_WRITE_FD, data, strlen(data));
}

char *stockfish_stdout_read()
{
  char tmp[1];
  int index;
  for (index = 0; index < STRINGS_SIZE; index++) {
    read(PARENT_READ_FD, tmp, 1);
    char nextChar = tmp[0];
    buffer[index] = nextChar;
    if (nextChar == '\n'){
      break;
    }
  }
  buffer[index+1] = 0;

  return buffer;
}

using namespace Stockfish;

int main(int argc, char* argv[]) {
  using namespace Stockfish;
  
  std::cout << engine_info() << std::endl;

  CommandLine::init(argc, argv);
  UCI::init(Options);
  Tune::init();
  PSQT::init();
  Bitboards::init();
  Position::init();
  Bitbases::init();
  Endgames::init();
  Threads.set(size_t(Options["Threads"]));
  Search::clear(); // After threads are up
  Eval::NNUE::init();

  UCI::loop(argc, argv);

  Threads.set(0);
  return 0;
}

extern "C"
JNIEXPORT void JNICALL
Java_com_reactnativestockfishchessengine_StockfishChessEngineModule_init(JNIEnv * /*env*/, jobject /*thisz*/) {
    stockfish_init();
}


extern "C"
JNIEXPORT void JNICALL
Java_com_reactnativestockfishchessengine_StockfishChessEngineModule_main(JNIEnv * /*env*/, jobject /*thisz*/) {
    stockfish_main();
}

extern "C"
JNIEXPORT jstring JNICALL
Java_com_reactnativestockfishchessengine_StockfishChessEngineModule_readStdOut(JNIEnv * env, jobject /*thisz*/) {
    char *output = stockfish_stdout_read();
    // An error occured
    if (output == NULL) {
        return NULL;
    }

    return env->NewStringUTF(buffer);
}

extern "C"
JNIEXPORT jboolean JNICALL
Java_com_reactnativestockfishchessengine_StockfishChessEngineModule_writeStdIn(JNIEnv * env, jobject /*thisz*/, jstring command) {
    ssize_t result;

    jboolean isCopy;
    const char * str = env->GetStringUTFChars(command, &isCopy);

    result = stockfish_stdin_write(str);
    env->ReleaseStringUTFChars(command, str);

    if (result < 0) {
        return JNI_FALSE;
    }

    return JNI_TRUE;
}