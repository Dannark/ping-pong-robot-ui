import Foundation
import WatchConnectivity

@objc(WatchConnectivityModule)
class WatchConnectivityModule: RCTEventEmitter, WCSessionDelegate {

  private var hasListeners = false

  override init() {
    super.init()
    if WCSession.isSupported() {
      let session = WCSession.default
      session.delegate = self
      session.activate()
    }
  }

  override func supportedEvents() -> [String]! {
    ["WatchCommand"]
  }

  override func startObserving() {
    hasListeners = true
  }

  override func stopObserving() {
    hasListeners = false
  }

  func session(
    _ session: WCSession,
    activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {}

  func sessionDidBecomeInactive(_ session: WCSession) {}

  func sessionDidDeactivate(_ session: WCSession) {}

  func sessionReachabilityDidChange(_ session: WCSession) {}

  func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
    guard let command = message["command"] as? String else { return }
    DispatchQueue.main.async { [weak self] in
      self?.sendEvent(withName: "WatchCommand", body: ["command": command])
    }
  }
}
