#include <jni.h>
#include "react-native-stockfish-android.h"

extern "C"
JNIEXPORT jint JNICALL
Java_com_stockfishandroid_StockfishAndroidModule_nativeMultiply(JNIEnv *env, jclass type, jdouble a, jdouble b) {
    return stockfishandroid::multiply(a, b);
}
