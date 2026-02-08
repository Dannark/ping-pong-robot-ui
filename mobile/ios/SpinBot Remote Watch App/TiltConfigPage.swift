import SwiftUI

struct TiltConfigPage: View {
  @ObservedObject var session = WatchSessionManager.shared
  @State private var selectedIndex: Int = 0

  private static let modes = ["Low", "Medium", "High"]

  var body: some View {
    ModeConfigPage(
      title: "Tilt",
      systemImage: "arrow.up.and.down",
      modes: Self.modes,
      selectedIndex: $selectedIndex
    ) { index in
      session.sendConfig(key: "tiltMode", value: Self.modes[index])
    }
  }
}
