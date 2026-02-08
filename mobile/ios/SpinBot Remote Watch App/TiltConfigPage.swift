import SwiftUI

struct TiltConfigPage: View {
  @ObservedObject var session = WatchSessionManager.shared

  var body: some View {
    AxisConfigPage(axis: .tilt, session: session)
  }
}
