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
  protected ReactApplicationContext reactContext;

  public StockfishChessEngineModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  protected void loopReadingEngineOutput() {
    int timeoutMs = 30;
    while (true) {
      if (Thread.currentThread().isInterrupted()) {
        break;
      }

      String nextLine = nativeReadNextOutput();
      if (!nextLine.startsWith("@@@")) {
        reactContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
          .emit("stockfish-output", nextLine);
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
  public void mainLoop() {
    engineLineReader =
      new Thread(
        new Runnable() {
          public void run() {
            loopReadingEngineOutput();
          }
        }
      );
    engineLineReader.start();
    nativeMainLoop();
  }

  @ReactMethod
  public void shutdownStockfish() {
    sendCommand("quit");

    try {
      Thread.sleep(150);
    } catch (InterruptedException e) {}
    
    if (engineLineReader != null) {
      engineLineReader.interrupt();
    }
  }

  public static native void nativeMainLoop();

  protected static native String nativeReadNextOutput();

  @ReactMethod
  public void sendCommand(String command) {
    nativeSendCommand(command);
  }

  public static native void nativeSendCommand(String command);
}
