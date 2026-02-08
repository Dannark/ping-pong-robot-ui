import Combine
import SwiftUI
import WatchConnectivity

struct ContentView: View {
  @StateObject private var session = WatchSessionManager.shared

  var body: some View {
    VStack(spacing: 12) {
      Text("SpinBot")
        .font(.headline)

      Button(action: { session.sendCommand("start") }) {
        Label("Iniciar", systemImage: "play.fill")
          .frame(maxWidth: .infinity)
      }
      .buttonStyle(.borderedProminent)
      .disabled(!session.reachable)

      Button(action: { session.sendCommand("stop") }) {
        Label("Parar", systemImage: "stop.fill")
          .frame(maxWidth: .infinity)
      }
      .buttonStyle(.bordered)
      .disabled(!session.reachable)

      if !session.reachable {
        Text("Abrir app no iPhone")
          .font(.caption2)
          .foregroundStyle(.secondary)
      }
    }
    .padding()
  }
}

final class WatchSessionManager: NSObject, ObservableObject {
  static let shared = WatchSessionManager()
  private let session: WCSession? = WCSession.isSupported() ? WCSession.default : nil

  @Published var reachable = false

  override init() {
    super.init()
    session?.delegate = self
    session?.activate()
  }

  func sendCommand(_ command: String) {
    guard let session = session, session.isReachable else { return }
    session.sendMessage(["command": command], replyHandler: nil) { _ in }
  }
}

extension WatchSessionManager: WCSessionDelegate {
  func session(
    _ session: WCSession,
    activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {
    DispatchQueue.main.async {
      self.reachable = session.isReachable
    }
  }

  func sessionReachabilityDidChange(_ session: WCSession) {
    DispatchQueue.main.async {
      self.reachable = session.isReachable
    }
  }
}

#Preview {
  ContentView()
}
