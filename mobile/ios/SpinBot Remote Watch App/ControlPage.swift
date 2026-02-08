import Combine
import SwiftUI

struct ControlPage: View {
  @ObservedObject var session: WatchSessionManager

  var body: some View {
    VStack(spacing: 0) {
      ScreenTitleView(title: "Controle", systemImage: "play.rectangle.fill")
        .padding(.bottom, 10)

      VStack(spacing: 10) {
        Text(session.robotName.isEmpty ? "Robô" : session.robotName)
          .font(.subheadline)
          .lineLimit(1)
          .minimumScaleFactor(0.7)
          .foregroundStyle(.secondary)

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
      .frame(maxWidth: .infinity)
      .padding(.horizontal)
    }
    .padding(.vertical)
    .onAppear { session.refreshState() }
    .onReceive(Timer.publish(every: 1.0, on: .main, in: .common).autoconnect()) { _ in
      session.refreshState()
    }
  }
}
