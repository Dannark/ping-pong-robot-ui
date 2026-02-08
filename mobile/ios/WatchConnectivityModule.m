#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(WatchConnectivityModule, RCTEventEmitter)
RCT_EXTERN_METHOD(updateWatchState:(NSDictionary *)state)
@end
