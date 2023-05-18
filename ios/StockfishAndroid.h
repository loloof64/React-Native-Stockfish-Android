#ifdef __cplusplus
#import "react-native-stockfish-android.h"
#endif

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNStockfishAndroidSpec.h"

@interface StockfishAndroid : NSObject <NativeStockfishAndroidSpec>
#else
#import <React/RCTBridgeModule.h>

@interface StockfishAndroid : NSObject <RCTBridgeModule>
#endif

@end
