import Foundation
import UIKit
import WatchConnectivity

@objc(WatchConnectivityModule)
class WatchConnectivityModule: RCTEventEmitter, WCSessionDelegate {

  private var hasListeners = false
  private var cachedState: [String: Any] = [
    "robotConnected": false,
    "robotName": "",
    "isRunning": false,
    "runStartTime": 0.0,
    "updatedAtMs": 0.0,
  ]
  private let stateLock = NSLock()

  override init() {
    super.init()
    if WCSession.isSupported() {
      let session = WCSession.default
      session.delegate = self
      session.activate()
    }
  }

  override func supportedEvents() -> [String]! {
    ["WatchCommand", "WatchStateRequest"]
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
  ) {
    if activationState == .activated, hasListeners {
      sendEvent(withName: "WatchStateRequest", body: nil)
    }
  }

  func sessionDidBecomeInactive(_ session: WCSession) {}

  func sessionDidDeactivate(_ session: WCSession) {}

  func sessionReachabilityDidChange(_ session: WCSession) {
    if session.isReachable, hasListeners {
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
        guard let self, self.hasListeners else { return }
        self.sendEvent(withName: "WatchStateRequest", body: nil)
      }
    }
  }

  func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
    guard let command = message["command"] as? String else { return }
    DispatchQueue.main.async { [weak self] in
      guard let self else { return }
      if command == "ping" {
        if session.isReachable {
          session.sendMessage(["response": "pong"], replyHandler: nil, errorHandler: nil)
        }
        return
      }
      if command == "getState" {
        if self.hasListeners {
          self.sendEvent(withName: "WatchStateRequest", body: nil)
        }
        return
      }
      if command == "config", let key = message["key"] as? String, let value = message["value"] as? String {
        self.sendEvent(withName: "WatchCommand", body: ["command": command, "key": key, "value": value])
        return
      }
      self.sendEvent(withName: "WatchCommand", body: ["command": command])
    }
  }

  // When the Watch sends a message with a replyHandler, watchOS expects this delegate method.
  func session(
    _ session: WCSession,
    didReceiveMessage message: [String: Any],
    replyHandler: @escaping ([String: Any]) -> Void
  ) {
    guard let command = message["command"] as? String else {
      replyHandler([:])
      return
    }
    if command == "ping" {
      print("[PingTest iPhone] received ping (with replyHandler)")
      replyHandler(["response": "pong"])
      return
    }
    if command == "getState" {
      stateLock.lock()
      var snapshot = cachedState
      stateLock.unlock()
      let appActive = UIApplication.shared.applicationState == .active
      snapshot["appActive"] = appActive
      snapshot["appState"] = appActive ? "active" : "not_active"
      snapshot["replyAtMs"] = Date().timeIntervalSince1970 * 1000
      replyHandler(snapshot)
      return
    }
    if command == "config", let key = message["key"] as? String, let value = message["value"] as? String {
      sendEvent(withName: "WatchCommand", body: ["command": command, "key": key, "value": value])
      replyHandler(["ok": true])
      return
    }
    replyHandler([:])
  }

  @objc func updateWatchState(_ state: NSDictionary) {
    guard WCSession.isSupported() else { return }
    let session = WCSession.default
    let robotConnected = (state["robotConnected"] as? NSNumber)?.boolValue ?? false
    let robotName = (state["robotName"] as? String) ?? ""
    let isRunning = (state["isRunning"] as? NSNumber)?.boolValue ?? false
    let runStartTime = (state["runStartTime"] as? NSNumber)?.doubleValue ?? 0.0
    let updatedAtMs = Date().timeIntervalSince1970 * 1000
    print("[State iPhone] updateWatchState robotConnected=\(robotConnected) robotName=\"\(robotName)\" isRunning=\(isRunning)")

    let context: [String: Any] = [
      "robotConnected": robotConnected,
      "robotName": robotName,
      "isRunning": isRunning,
      "runStartTime": runStartTime,
      "updatedAtMs": updatedAtMs,
    ]

    stateLock.lock()
    cachedState = context
    stateLock.unlock()

    if session.activationState == .activated {
      try? session.updateApplicationContext(context)
    }
  }
}
