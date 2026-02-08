import SwiftUI

struct PanConfigPage: View {
  @ObservedObject var session = WatchSessionManager.shared

  var body: some View {
    AxisConfigPage(axis: .pan, session: session)
  }
}
