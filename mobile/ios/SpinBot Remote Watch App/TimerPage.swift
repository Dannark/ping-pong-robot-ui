import SwiftUI

struct TimerPage: View {
  var body: some View {
    VStack(spacing: 8) {
      Image(systemName: "timer")
        .font(.system(size: 34))
      Text("Timer")
        .font(.headline)
      Text("Em breve")
        .font(.footnote)
        .foregroundStyle(.secondary)
    }
    .padding()
  }
}
