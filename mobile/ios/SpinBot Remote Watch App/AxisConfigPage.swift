import SwiftUI

enum AxisKind {
  case pan
  case tilt

  var title: String {
    switch self {
    case .pan: return "Pan"
    case .tilt: return "Tilt"
    }
  }

  var systemImage: String {
    switch self {
    case .pan: return "arrow.left.and.right"
    case .tilt: return "arrow.up.and.down"
    }
  }

  func key(_ suffix: String) -> String {
    switch self {
    case .pan: return "pan" + suffix
    case .tilt: return "tilt" + suffix
    }
  }
}

private let axisModes = ["LIVE", "AUTO1", "AUTO2", "RANDOM"]

private struct ModeChip: View {
  let title: String
  let isSelected: Bool
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      Text(title)
        .font(.system(size: 11, weight: .medium))
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
    }
    .buttonStyle(.bordered)
    .tint(isSelected ? .accentColor : .gray)
  }
}

struct AxisConfigPage: View {
  let axis: AxisKind
  @ObservedObject var session: WatchSessionManager

  @State private var selectedModeIndex: Int = 0
  @State private var target: Double = 0
  @State private var minVal: Double = -1
  @State private var maxVal: Double = 1
  @State private var auto1Speed: Double = 0.035
  @State private var auto2Step: Double = 0.25
  @State private var auto2PauseMs: Double = 1000
  @State private var randomMinDist: Double = 0.2
  @State private var randomPauseMs: Double = 1500

  private var mode: String { axisModes[selectedModeIndex] }

  var body: some View {
    ScrollView(.vertical, showsIndicators: true) {
      VStack(alignment: .center, spacing: 0) {
        axisHeader
          .padding(.bottom, 10)

        modeStrip
          .padding(.bottom, 12)

        modeContent
          .padding(.top, 2)
      }
      .frame(maxWidth: .infinity)
      .padding(.horizontal, 6)
      .padding(.vertical, 10)
    }
  }

  private var axisHeader: some View {
    ScreenTitleView(title: axis.title, systemImage: axis.systemImage)
  }

  private var modeStrip: some View {
    ScrollView(.horizontal, showsIndicators: false) {
      modeStripButtons
    }
    .frame(height: 30)
  }

  private var modeStripButtons: some View {
    HStack(spacing: 6) {
      ForEach(0..<axisModes.count, id: \.self) { index in
        ModeChip(
          title: axisModes[index],
          isSelected: selectedModeIndex == index,
          action: {
            selectedModeIndex = index
            sendMode(axisModes[index])
          }
        )
      }
    }
    .padding(.horizontal, 4)
  }

  @ViewBuilder
  private var modeContent: some View {
    switch mode {
    case "LIVE":
      liveContent
    case "AUTO1":
      auto1Content
    case "AUTO2":
      auto2Content
    case "RANDOM":
      randomContent
    default:
      EmptyView()
    }
  }

  private var liveContent: some View {
    VStack(spacing: 4) {
      Text("Target \(format(target))")
        .font(.caption2)
          .foregroundStyle(.secondary)
      Slider(value: $target, in: -1...1, step: 0.1)
        .onChange(of: target) { _, newValue in
          sendDouble(axis.key("Target"), newValue)
        }
    }
    .padding(.horizontal, 8)
  }

  private var auto1Content: some View {
    VStack(spacing: 4) {
      Text("Speed \(format(auto1Speed))")
        .font(.caption2)
        .foregroundStyle(.secondary)
      Slider(value: $auto1Speed, in: 0.01...0.1, step: 0.005)
        .onChange(of: auto1Speed) { _, newValue in
          sendDouble(axis.key("Auto1Speed"), newValue)
        }
      rangeSliders
    }
    .padding(.horizontal, 8)
  }

  private var auto2Content: some View {
    VStack(spacing: 4) {
      Text("Step \(format(auto2Step))")
        .font(.caption2)
        .foregroundStyle(.secondary)
      Slider(value: $auto2Step, in: 0.05...0.5, step: 0.05)
        .onChange(of: auto2Step) { _, newValue in
          sendDouble(axis.key("Auto2Step"), newValue)
        }
      Text("Pause \(Int(auto2PauseMs)) ms")
        .font(.caption2)
        .foregroundStyle(.secondary)
      Slider(value: $auto2PauseMs, in: 200...3000, step: 100)
        .onChange(of: auto2PauseMs) { _, newValue in
          sendDouble(axis.key("Auto2PauseMs"), newValue)
        }
      rangeSliders
    }
    .padding(.horizontal, 8)
  }

  private var randomContent: some View {
    VStack(spacing: 4) {
      Text("Min dist \(format(randomMinDist))")
        .font(.caption2)
        .foregroundStyle(.secondary)
      Slider(value: $randomMinDist, in: 0.1...1, step: 0.1)
        .onChange(of: randomMinDist) { _, newValue in
          sendDouble(axis.key("RandomMinDist"), newValue)
        }
      Text("Pause \(Int(randomPauseMs)) ms")
        .font(.caption2)
        .foregroundStyle(.secondary)
      Slider(value: $randomPauseMs, in: 1500...5000, step: 100)
        .onChange(of: randomPauseMs) { _, newValue in
          sendDouble(axis.key("RandomPauseMs"), newValue)
        }
      rangeSliders
    }
    .padding(.horizontal, 8)
  }

  @ViewBuilder
  private var rangeSliders: some View {
    if mode != "LIVE" {
      VStack(spacing: 2) {
        Text("Min \(format(minVal))")
          .font(.caption2)
          .foregroundStyle(.tertiary)
        Slider(value: $minVal, in: -1...maxVal - 0.1, step: 0.1)
          .onChange(of: minVal) { _, newValue in
            sendDouble(axis.key("Min"), newValue)
          }
        Text("Max \(format(maxVal))")
          .font(.caption2)
          .foregroundStyle(.tertiary)
        Slider(value: $maxVal, in: minVal + 0.1...1, step: 0.1)
          .onChange(of: maxVal) { _, newValue in
            sendDouble(axis.key("Max"), newValue)
          }
      }
    }
  }

  private func format(_ v: Double) -> String {
    if v.truncatingRemainder(dividingBy: 1) == 0 {
      return String(format: "%.0f", v)
    }
    return String(format: "%.2f", v)
  }

  private func sendMode(_ value: String) {
    session.sendConfig(key: axis.key("Mode"), value: value)
  }

  private func sendDouble(_ key: String, _ value: Double) {
    session.sendConfig(key: key, value: String(value))
  }
}
