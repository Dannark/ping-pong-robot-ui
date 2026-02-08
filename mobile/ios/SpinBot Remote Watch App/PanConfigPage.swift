import SwiftUI

struct PanConfigPage: View {
  @ObservedObject var session = WatchSessionManager.shared
  @State private var selectedIndex: Int = 0

  private static let modes = ["Sweep", "Fixed", "Random"]

  var body: some View {
    ModeConfigPage(
      title: "Pan",
      systemImage: "arrow.left.and.right",
      modes: Self.modes,
      selectedIndex: $selectedIndex
    ) { index in
      session.sendConfig(key: "panMode", value: Self.modes[index])
    }
  }
}
