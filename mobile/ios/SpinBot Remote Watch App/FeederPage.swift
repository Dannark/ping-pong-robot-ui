import SwiftUI

struct FeederPage: View {
  var body: some View {
    VStack(spacing: 8) {
      Image(systemName: "tray.full.fill")
        .font(.system(size: 34))
      Text("Feeder")
        .font(.headline)
      Text("Em breve")
        .font(.footnote)
        .foregroundStyle(.secondary)
    }
    .padding()
  }
}
