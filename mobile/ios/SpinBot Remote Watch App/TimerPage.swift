import SwiftUI

private let timerOptions = ["OFF", "15s", "30s", "1m", "2m", "5m"]

struct TimerPage: View {
  @ObservedObject var session = WatchSessionManager.shared

  @State private var timerIndex: Int = 0
  @State private var timerSoundAlert: Bool = false

  private var timerEnabled: Bool { timerIndex != 0 }

  var body: some View {
    ScrollView(.vertical, showsIndicators: true) {
      VStack(alignment: .center, spacing: 0) {
        ScreenTitleView(title: "Timer", systemImage: "timer")
          .padding(.bottom, 10)

        durationSection
          .padding(.bottom, 12)

        if timerEnabled {
          soundSection
        }
      }
      .frame(maxWidth: .infinity)
      .padding(.horizontal, 6)
      .padding(.vertical, 10)
    }
  }

  private var durationSection: some View {
    VStack(alignment: .center, spacing: 6) {
      Text("Duration")
        .font(.caption2)
        .foregroundStyle(.secondary)
      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 6) {
          ForEach(0..<timerOptions.count, id: \.self) { index in
            Button {
              timerIndex = index
              send("timerIndex", String(index))
            } label: {
              Text(timerOptions[index])
                .font(.system(size: 11, weight: .medium))
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
            }
            .buttonStyle(.bordered)
            .tint(timerIndex == index ? .accentColor : .gray)
          }
        }
      }
      .frame(height: 30)
    }
  }

  private var soundSection: some View {
    HStack {
      Text("Sound alert")
        .font(.caption2)
        .foregroundStyle(.secondary)
      Spacer()
      Toggle("", isOn: $timerSoundAlert)
        .labelsHidden()
        .onChange(of: timerSoundAlert) { _, v in send("timerSoundAlert", v ? "true" : "false") }
    }
  }

  private func send(_ key: String, _ value: String) {
    session.sendConfig(key: key, value: value)
  }
}
