import SwiftUI

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
          PanConfigPage()
            .tag(1)
          TiltConfigPage()
            .tag(2)
          LauncherPage()
            .tag(3)
          FeederPage()
            .tag(4)
          TimerPage()
            .tag(5)
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
      if phase == .carousel {
        selectedTab = 0
      }
      if isRunning {
        session.refreshState()
      }
    }
  }
}

#Preview {
  ContentView()
}
