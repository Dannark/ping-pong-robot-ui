import Combine
import SwiftUI
import WatchConnectivity

final class WatchSessionManager: NSObject, ObservableObject {
  static let shared = WatchSessionManager()
  private let session: WCSession? = WCSession.isSupported() ? WCSession.default : nil

  @Published var reachable = false
  @Published var lastMessage = ""
  @Published var appActive = false
  @Published var robotOk = false
  @Published var robotName = ""
  @Published var isRunning = false
  @Published var runStartTimeMs: Double = 0
  @Published var lastStateUpdatedAtMs: Double = 0
  @Published var lastReplyAtMs: Double = 0
  @Published private var pendingRunAction: PendingRunAction = .none
  private var lastAppActiveTrueAt: Double = 0

  private enum PendingRunAction {
    case none
    case starting
    case stopping
  }

  override init() {
    super.init()
    session?.delegate = self
    session?.activate()
  }

  var isUnlockedCondition: Bool { appActive && robotOk }

  var displayStep1: Bool {
    let now = Date().timeIntervalSince1970
    if appActive { return false }
    if lastAppActiveTrueAt == 0 { return true }
    return (now - lastAppActiveTrueAt) > 5.0
  }

  var controlButtonTitle: String {
    if pendingRunAction == .starting { return "Iniciando…" }
    if pendingRunAction == .stopping { return "Parando…" }
    return isRunning ? "Parar" : "Iniciar"
  }

  var controlButtonSymbol: String {
    if pendingRunAction == .starting { return "hourglass" }
    if pendingRunAction == .stopping { return "hourglass" }
    return isRunning ? "stop.fill" : "play.fill"
  }

  func elapsedText(now: Date) -> String {
    guard runStartTimeMs > 0 else { return "0:00" }
    let elapsed = Int(max(0, (now.timeIntervalSince1970 * 1000 - runStartTimeMs) / 1000))
    return String(format: "%d:%02d", elapsed / 60, elapsed % 60)
  }

  func toggleRun() {
    if isRunning {
      pendingRunAction = .stopping
      sendCommand("stop")
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { self.refreshState() }
    } else {
      pendingRunAction = .starting
      sendCommand("start")
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { self.refreshState() }
    }
  }

  func sendCommand(_ command: String) {
    guard let session = session, session.isReachable else { return }
    session.sendMessage(["command": command], replyHandler: nil) { error in
      print("[Control Watch] sendCommand error: \(error.localizedDescription)")
    }
  }

  func sendConfig(key: String, value: String) {
    guard let session = session, session.isReachable else { return }
    session.sendMessage(["command": "config", "key": key, "value": value], replyHandler: nil) { error in
      print("[Config Watch] error: \(error.localizedDescription)")
    }
  }

  func refreshState() {
    requestState()
  }

  func sendPing() {
    guard let session = session, session.isReachable else { return }
    session.sendMessage(
      ["command": "ping"],
      replyHandler: { [weak self] response in
        let message = response["response"] as? String ?? "sem resposta"
        DispatchQueue.main.async { self?.lastMessage = "Reply: \(message)" }
      },
      errorHandler: { [weak self] error in
        DispatchQueue.main.async { self?.lastMessage = "Erro: \(error.localizedDescription)" }
      }
    )
  }

  private func requestState() {
    guard let session = session, session.isReachable else { return }
    session.sendMessage(
      ["command": "getState"],
      replyHandler: { [weak self] response in
        self?.applyState(response)
      },
      errorHandler: { [weak self] _ in
        DispatchQueue.main.async { self?.appActive = false }
      }
    )
  }

  private func applyState(_ dict: [String: Any]) {
    DispatchQueue.main.async { [weak self] in
      guard let self else { return }
      let appActive: Bool
      if let n = dict["appActive"] as? NSNumber { appActive = n.boolValue }
      else if let b = dict["appActive"] as? Bool { appActive = b }
      else { appActive = false }

      self.appActive = appActive
      if appActive {
        self.lastAppActiveTrueAt = Date().timeIntervalSince1970
      }
      if !appActive {
        self.pendingRunAction = .none
      }

      let robotConnected: Bool
      if let n = dict["robotConnected"] as? NSNumber { robotConnected = n.boolValue }
      else if let b = dict["robotConnected"] as? Bool { robotConnected = b }
      else { robotConnected = false }
      self.robotOk = robotConnected
      self.robotName = dict["robotName"] as? String ?? ""
      if let n = dict["isRunning"] as? NSNumber { self.isRunning = n.boolValue }
      else if let b = dict["isRunning"] as? Bool { self.isRunning = b }
      else { self.isRunning = false }
      if let n = dict["runStartTime"] as? NSNumber { self.runStartTimeMs = n.doubleValue }
      else if let d = dict["runStartTime"] as? Double { self.runStartTimeMs = d }
      else { self.runStartTimeMs = 0 }
      if let n = dict["updatedAtMs"] as? NSNumber { self.lastStateUpdatedAtMs = n.doubleValue }
      else if let d = dict["updatedAtMs"] as? Double { self.lastStateUpdatedAtMs = d }
      else { self.lastStateUpdatedAtMs = 0 }
      if let n = dict["replyAtMs"] as? NSNumber { self.lastReplyAtMs = n.doubleValue }
      else if let d = dict["replyAtMs"] as? Double { self.lastReplyAtMs = d }
      else { self.lastReplyAtMs = 0 }

      if self.isRunning, self.pendingRunAction == .starting { self.pendingRunAction = .none }
      if !self.isRunning, self.pendingRunAction == .stopping { self.pendingRunAction = .none }
    }
  }
}

extension WatchSessionManager: WCSessionDelegate {
  func session(
    _ session: WCSession,
    activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {
    DispatchQueue.main.async { [weak self] in
      self?.reachable = session.isReachable
      if session.isReachable { self?.refreshState() }
    }
  }

  func sessionReachabilityDidChange(_ session: WCSession) {
    DispatchQueue.main.async { [weak self] in
      self?.reachable = session.isReachable
      if session.isReachable { self?.refreshState() }
    }
  }

  func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
    if let response = message["response"] as? String {
      DispatchQueue.main.async { [weak self] in
        self?.lastMessage = "Msg: \(response)"
      }
    }
  }

  func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
    applyState(applicationContext)
  }
}
