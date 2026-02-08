import SwiftUI

private let spinDirections = ["NONE", "N", "NE", "E", "SE", "S", "SW", "W", "NW"]

struct LauncherPage: View {
  @ObservedObject var session = WatchSessionManager.shared

  @State private var launcherPower: Double = 255
  @State private var spinRandom: Bool = false
  @State private var spinRandomIntervalSec: Double = 5
  @State private var spinDirectionIndex: Int = 0
  @State private var spinIntensity: Double = 255

  private var spinDirection: String { spinDirections[spinDirectionIndex] }
  private var showIntensity: Bool { spinDirection != "NONE" || spinRandom }

  var body: some View {
    ScrollView(.vertical, showsIndicators: true) {
      VStack(alignment: .center, spacing: 0) {
        ScreenTitleView(title: "Launcher", systemImage: "paperplane.fill")
          .padding(.bottom, 10)

        powerSection
          .padding(.bottom, 12)

        randomSection
          .padding(.bottom, 12)

        if spinRandom {
          intervalSection
            .padding(.bottom, 12)
        } else {
          directionSection
            .padding(.bottom, 12)
        }

        if showIntensity {
          intensitySection
        }
      }
      .frame(maxWidth: .infinity)
      .padding(.horizontal, 6)
      .padding(.vertical, 10)
    }
  }

  private var powerSection: some View {
    VStack(spacing: 4) {
      Text("Power \(Int(launcherPower))")
        .font(.caption2)
        .foregroundStyle(.secondary)
      Slider(value: $launcherPower, in: 0...255, step: 1)
        .onChange(of: launcherPower) { _, v in send("launcherPower", String(Int(v))) }
    }
  }

  private var randomSection: some View {
    HStack {
      Text("Spin random")
        .font(.caption2)
        .foregroundStyle(.secondary)
      Spacer()
      Toggle("", isOn: $spinRandom)
        .labelsHidden()
        .onChange(of: spinRandom) { _, v in send("spinRandom", v ? "true" : "false") }
    }
  }

  private var intervalSection: some View {
    VStack(spacing: 4) {
      Text("Interval \(Int(spinRandomIntervalSec))s")
        .font(.caption2)
        .foregroundStyle(.secondary)
      Slider(value: $spinRandomIntervalSec, in: 2...20, step: 1)
        .onChange(of: spinRandomIntervalSec) { _, v in send("spinRandomIntervalSec", String(Int(v))) }
    }
  }

  private var directionSection: some View {
    VStack(alignment: .center, spacing: 0) {
      Text("Spin")
        .font(.caption2)
        .foregroundStyle(.secondary)
        .padding(.bottom, 12)
      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 6) {
          ForEach(0..<spinDirections.count, id: \.self) { index in
            Button {
              spinDirectionIndex = index
              send("spinDirection", spinDirections[index])
            } label: {
              Text(spinDirections[index])
                .font(.system(size: 10, weight: .medium))
                .padding(.horizontal, 6)
                .padding(.vertical, 4)
            }
            .buttonStyle(.bordered)
            .tint(spinDirectionIndex == index ? .accentColor : .gray)
          }
        }
      }
      .frame(height: 28)
    }
  }

  private var intensitySection: some View {
    VStack(spacing: 4) {
      Text("Intensity \(Int(spinIntensity))")
        .font(.caption2)
        .foregroundStyle(.secondary)
      Slider(value: $spinIntensity, in: 0...512, step: 1)
        .onChange(of: spinIntensity) { _, v in send("spinIntensity", String(Int(v))) }
    }
  }

  private func send(_ key: String, _ value: String) {
    session.sendConfig(key: key, value: value)
  }
}
