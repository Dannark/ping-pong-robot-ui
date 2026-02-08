import SwiftUI

struct FeederPage: View {
  var body: some View {
    VStack(spacing: 0) {
      ScreenTitleView(title: "Feeder", systemImage: "tray.full.fill")
        .padding(.bottom, 10)
      Text("Em breve")
        .font(.footnote)
        .foregroundStyle(.secondary)
        .frame(maxWidth: .infinity)
    }
    .padding()
  }
}
