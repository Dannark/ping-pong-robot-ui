import SwiftUI

private let feederModes = ["CONT", "P1/1", "P2/1", "P2/2", "CUSTOM"]

struct FeederPage: View {
  @ObservedObject var session = WatchSessionManager.shared

  @State private var feederModeIndex: Int = 0
  @State private var feederSpeed: Double = 200
  @State private var feederCustomOnMs: Double = 1500
  @State private var feederCustomOffMs: Double = 750

  private var feederMode: String { feederModes[feederModeIndex] }
  private var isCustom: Bool { feederMode == "CUSTOM" }

  var body: some View {
    ScrollView(.vertical, showsIndicators: true) {
      VStack(alignment: .center, spacing: 0) {
        ScreenTitleView(title: "Feeder", systemImage: "tray.full.fill")
          .padding(.bottom, 10)

        modeSection
          .padding(.bottom, 12)

        speedSection
          .padding(.bottom, 12)

        if isCustom {
          customOnSection
            .padding(.bottom, 12)
          customOffSection
        }
      }
      .frame(maxWidth: .infinity)
      .padding(.horizontal, 6)
      .padding(.vertical, 10)
    }
  }

  private var modeSection: some View {
    VStack(alignment: .center, spacing: 6) {
      Text("Mode")
        .font(.caption2)
        .foregroundStyle(.secondary)
      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 6) {
          ForEach(0..<feederModes.count, id: \.self) { index in
            Button {
              feederModeIndex = index
              send("feederMode", feederModes[index])
            } label: {
              Text(feederModes[index])
                .font(.system(size: 10, weight: .medium))
                .padding(.horizontal, 6)
                .padding(.vertical, 4)
            }
            .buttonStyle(.bordered)
            .tint(feederModeIndex == index ? .accentColor : .gray)
          }
        }
      }
      .frame(height: 28)
    }
  }

  private var speedSection: some View {
    VStack(spacing: 4) {
      Text("Speed \(Int(feederSpeed))")
        .font(.caption2)
        .foregroundStyle(.secondary)
      Slider(value: $feederSpeed, in: 0...255, step: 1)
        .onChange(of: feederSpeed) { _, v in send("feederSpeed", String(Int(v))) }
    }
  }

  private var customOnSection: some View {
    VStack(spacing: 4) {
      Text("On \(formatMs(feederCustomOnMs))")
        .font(.caption2)
        .foregroundStyle(.secondary)
      Slider(value: $feederCustomOnMs, in: 500...5000, step: 250)
        .onChange(of: feederCustomOnMs) { _, v in send("feederCustomOnMs", String(Int(v))) }
    }
  }

  private var customOffSection: some View {
    VStack(spacing: 4) {
      Text("Off \(formatMs(feederCustomOffMs))")
        .font(.caption2)
        .foregroundStyle(.secondary)
      Slider(value: $feederCustomOffMs, in: 500...5000, step: 250)
        .onChange(of: feederCustomOffMs) { _, v in send("feederCustomOffMs", String(Int(v))) }
    }
  }

  private func formatMs(_ ms: Double) -> String {
    if ms >= 1000 {
      return String(format: "%.1fs", ms / 1000)
    }
    return "\(Int(ms))ms"
  }

  private func send(_ key: String, _ value: String) {
    session.sendConfig(key: key, value: value)
  }
}
