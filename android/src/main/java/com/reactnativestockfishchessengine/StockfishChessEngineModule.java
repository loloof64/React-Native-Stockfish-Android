package com.reactnativestockfishchessengine;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.util.Log;

@ReactModule(name = StockfishChessEngineModule.NAME)
public class StockfishChessEngineModule extends ReactContextBaseJavaModule {

  public static final String NAME = "StockfishChessEngine";

  protected Thread engineLineReader;
  protected Thread mainLoopThread;
  protected ReactApplicationContext reactContext;

  public StockfishChessEngineModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  protected void loopReadingEngineOutput() {
    String previous = "";
    int timeoutMs = 30;
    while (true) {
      if (Thread.currentThread().isInterrupted()) {
        break;
      }

      String tmp = readStdOut();
      if (tmp != null) {
        String nextContent = previous + tmp;
        if (nextContent.endsWith("\n")) {
          reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("stockfish-output", nextContent);
          previous = "";
        }
        else {
          previous = nextContent;
        }
      }

      try {
        Thread.sleep(timeoutMs);
      } catch (InterruptedException e) {
        break;
      }
    }
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  static {
    try {
      // Used to load the 'native-lib' library on application startup.
      System.loadLibrary("stockfish");
    } catch (Exception ignored) {
      System.out.println("Failed to load stockfish");
    }
  }

  @ReactMethod
  public void mainLoop(Promise promise) {
    init();
    engineLineReader =
      new Thread(
        new Runnable() {
          public void run() {
            loopReadingEngineOutput();
          }
        }
      );
    engineLineReader.start();
    mainLoopThread = 
      new Thread(
        new Runnable() {
          public void run() {
            main();
          }
        }
      );
    mainLoopThread.start();
    promise.resolve(null);
  }

  @ReactMethod
  public void shutdownStockfish(Promise promise) {
    writeStdIn("quit");

    try {
      Thread.sleep(50);
    } catch (InterruptedException e) {}

    if (mainLoopThread != null) {
      mainLoopThread.interrupt();
    }
    
    if (engineLineReader != null) {
      engineLineReader.interrupt();
    }

    promise.resolve(null);
  }

  public static native void init();
  public static native void main();

  protected static native String readStdOut();

  @ReactMethod
  public void sendCommand(String command, Promise promise) {
    writeStdIn(command);
    promise.resolve(null);
  }

  protected static native void writeStdIn(String command);
}
