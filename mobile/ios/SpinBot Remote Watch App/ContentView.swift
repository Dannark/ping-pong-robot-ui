import Combine
import SwiftUI
import WatchConnectivity

struct ContentView: View {
  @StateObject private var session = WatchSessionManager.shared
  @State private var phase: Phase = .setup
  @State private var selectedTab: Int = 0
  @State private var unlocked = false

  enum Phase {
    case setup
    case readyTransition
    case carousel
  }

  var body: some View {
    Group {
      switch phase {
      case .setup:
        SetupPage(session: session)
      case .readyTransition:
        ReadyTransitionPage()
      case .carousel:
        TabView(selection: $selectedTab) {
          ControlPage(session: session)
            .tag(0)
          ConfigPlaceholderPage()
            .tag(1)
          StatsPlaceholderPage()
            .tag(2)
        }
        .tabViewStyle(.verticalPage)
      }
    }
    .onAppear { session.refreshState() }
    .onChange(of: session.isUnlockedCondition) { canUnlock in
      guard phase == .setup, canUnlock else { return }
      unlocked = true
      phase = .readyTransition
      DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
        if phase == .readyTransition {
          phase = .carousel
        }
      }
    }
    .onChange(of: session.robotOk) { robotOk in
      // Evita loop: só volta pro setup se realmente desconectar por um tempo.
      if !robotOk, unlocked {
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
          if !session.robotOk {
            unlocked = false
            phase = .setup
          }
        }
      }
    }
    .onChange(of: session.reachable) { reachable in
      if !reachable, unlocked {
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
          if !session.reachable {
            unlocked = false
            phase = .setup
          }
        }
      }
    }
    .onChange(of: session.isRunning) { isRunning in
      // Quando iniciar/parar, garantimos que o usuário veja o controle.
      if phase == .carousel {
        selectedTab = 0
      }
      // Se iniciou, força uma atualização rápida.
      if isRunning {
        session.refreshState()
      }
    }
  }
}

struct WaitingStepView: View {
  let step: String
  let title: String
  let subtitle: String
  let systemImage: String
  let accent: Color

  @State private var pulse = false

  var body: some View {
    VStack(spacing: 10) {
      Text(step)
        .font(.footnote)
        .foregroundStyle(.secondary)

      Image(systemName: systemImage)
        .font(.system(size: 38))
        .foregroundStyle(.primary)
        .symbolEffect(.pulse, options: .repeating, value: pulse)

      Text(title)
        .font(.headline)
        .lineLimit(2)
        .minimumScaleFactor(0.85)
        .multilineTextAlignment(.center)

      Text(subtitle)
        .font(.footnote)
        .foregroundStyle(.secondary)
        .lineLimit(3)
        .minimumScaleFactor(0.85)
        .multilineTextAlignment(.center)
    }
    .padding()
    .onAppear { pulse = true }
  }
}

struct SetupPage: View {
  @ObservedObject var session: WatchSessionManager

  var body: some View {
    Group {
      if session.displayStep1 {
        WaitingStepView(
          step: "Passo 1/2",
          title: "Abra o SpinBot no iPhone",
          subtitle: session.reachable ? "Deixe o app aberto em primeiro plano." : "Aproxime o iPhone para sincronizar.",
          systemImage: "iphone.and.arrow.forward",
          accent: .blue
        )
      } else if !session.robotOk {
        WaitingStepView(
          step: "Passo 2/2",
          title: "Conecte o robô no iPhone",
          subtitle: "Vá em Bluetooth no app e conecte via BLE.",
          systemImage: "antenna.radiowaves.left.and.right",
          accent: .orange
        )
      } else {
        WaitingStepView(
          step: "Pronto",
          title: "Tudo certo",
          subtitle: "Role para acessar o Controle.",
          systemImage: "checkmark.circle.fill",
          accent: .green
        )
      }
    }
    .onAppear { session.refreshState() }
    .onReceive(Timer.publish(every: 1.2, on: .main, in: .common).autoconnect()) { _ in
      session.refreshState()
    }
  }
}

struct ReadyTransitionPage: View {
  @State private var pulse = false

  var body: some View {
    VStack(spacing: 10) {
      Image(systemName: "checkmark.circle.fill")
        .font(.system(size: 44))
        .foregroundStyle(.primary)
        .symbolEffect(.pulse, options: .repeating, value: pulse)
      Text("Conectado")
        .font(.headline)
      Text("Abrindo controle…")
        .font(.footnote)
        .foregroundStyle(.secondary)
    }
    .padding()
    .onAppear { pulse = true }
  }
}

struct ControlPage: View {
  @ObservedObject var session: WatchSessionManager

  var body: some View {
    VStack(spacing: 10) {
      Text(session.robotName.isEmpty ? "Robô" : session.robotName)
        .font(.headline)
        .lineLimit(1)
        .minimumScaleFactor(0.7)

      if session.isRunning {
        TimelineView(.periodic(from: .now, by: 1.0)) { context in
          Text(session.elapsedText(now: context.date))
            .font(.system(.title2, design: .monospaced))
        }
      } else {
        Text("Pronto para iniciar")
          .font(.footnote)
          .foregroundStyle(.secondary)
      }

      Button(action: { session.toggleRun() }) {
        Label(session.controlButtonTitle, systemImage: session.controlButtonSymbol)
          .frame(maxWidth: .infinity)
      }
      .buttonStyle(.borderedProminent)
      .tint(session.isRunning ? .red : .green)
      .disabled(!session.robotOk || !session.reachable)
    }
    .padding()
    .onAppear { session.refreshState() }
    .onReceive(Timer.publish(every: 1.0, on: .main, in: .common).autoconnect()) { _ in
      // Enquanto estiver no controle, atualiza mais rápido pra refletir start/stop.
      session.refreshState()
    }
  }
}

struct ConfigPlaceholderPage: View {
  var body: some View {
    VStack(spacing: 8) {
      Image(systemName: "slider.horizontal.3")
        .font(.system(size: 34))
      Text("Config")
        .font(.headline)
      Text("Em breve")
        .font(.footnote)
        .foregroundStyle(.secondary)
    }
    .padding()
  }
}

struct StatsPlaceholderPage: View {
  var body: some View {
    VStack(spacing: 8) {
      Image(systemName: "chart.bar.xaxis")
        .font(.system(size: 34))
      Text("Stats")
        .font(.headline)
      Text("Em breve")
        .font(.footnote)
        .foregroundStyle(.secondary)
    }
    .padding()
  }
}

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

  // condição de desbloqueio: app em foreground + robô conectado
  var isUnlockedCondition: Bool { appActive && robotOk }

  /// Para não piscar entre passo 1 e 2: consideramos "step 1" só se app inativo há > 5s.
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
      // refresh rápido para refletir o estado
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

  func refreshState() {
    requestState()
  }

  func sendPing() {
    guard let session = session, session.isReachable else { return }
    print("[PingTest Watch] sending ping")
    session.sendMessage(
      ["command": "ping"],
      replyHandler: { [weak self] response in
        let message = response["response"] as? String ?? "sem resposta"
        print("[PingTest Watch] reply: \(message)")
        DispatchQueue.main.async { self?.lastMessage = "Reply: \(message)" }
      },
      errorHandler: { [weak self] error in
        print("[PingTest Watch] error: \(error.localizedDescription)")
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
      errorHandler: { [weak self] error in
        print("[State Watch] getState error: \(error.localizedDescription)")
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

      // Se o estado confirmou a ação, limpamos o pending.
      if self.isRunning, self.pendingRunAction == .starting { self.pendingRunAction = .none }
      if !self.isRunning, self.pendingRunAction == .stopping { self.pendingRunAction = .none }
      print("[State Watch] applied appActive=\(self.appActive) robotOk=\(self.robotOk) robotName=\"\(self.robotName)\" isRunning=\(self.isRunning)")
    }
  }
}

extension WatchSessionManager: WCSessionDelegate {
  func session(
    _ session: WCSession,
    activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {
    print("[PingTest Watch] activationDidComplete reachable=\(session.isReachable)")
    DispatchQueue.main.async { [weak self] in
      self?.reachable = session.isReachable
      if session.isReachable { self?.refreshState() }
    }
  }

  func sessionReachabilityDidChange(_ session: WCSession) {
    print("[PingTest Watch] sessionReachabilityDidChange reachable=\(session.isReachable)")
    DispatchQueue.main.async { [weak self] in
      self?.reachable = session.isReachable
      if session.isReachable { self?.refreshState() }
    }
  }

  func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
    if let response = message["response"] as? String {
      print("[PingTest Watch] received message: \(response)")
      DispatchQueue.main.async { [weak self] in
        self?.lastMessage = "Msg: \(response)"
      }
    }
  }

  // Para eliminar o warning do WCSession e aceitar push opcional (não é a fonte principal).
  func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
    // Se algum dia o iPhone voltar a usar applicationContext, aplicamos aqui.
    self.applyState(applicationContext)
  }
}

#Preview {
  ContentView()
}
