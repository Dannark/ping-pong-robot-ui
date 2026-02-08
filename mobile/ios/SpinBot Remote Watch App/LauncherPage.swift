import SwiftUI

struct LauncherPage: View {
  var body: some View {
    VStack(spacing: 8) {
      Image(systemName: "paperplane.fill")
        .font(.system(size: 34))
      Text("Launcher")
        .font(.headline)
      Text("Em breve")
        .font(.footnote)
        .foregroundStyle(.secondary)
    }
    .padding()
  }
}
