import SwiftUI

struct LauncherPage: View {
  var body: some View {
    VStack(spacing: 0) {
      ScreenTitleView(title: "Launcher", systemImage: "paperplane.fill")
        .padding(.bottom, 10)
      Text("Em breve")
        .font(.footnote)
        .foregroundStyle(.secondary)
        .frame(maxWidth: .infinity)
    }
    .padding()
  }
}
