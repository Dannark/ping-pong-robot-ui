import Combine
import SwiftUI

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
