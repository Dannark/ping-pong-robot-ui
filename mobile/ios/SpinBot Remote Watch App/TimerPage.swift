import SwiftUI

struct TimerPage: View {
  var body: some View {
    VStack(spacing: 0) {
      ScreenTitleView(title: "Timer", systemImage: "timer")
        .padding(.bottom, 10)
      Text("Em breve")
        .font(.footnote)
        .foregroundStyle(.secondary)
        .frame(maxWidth: .infinity)
    }
    .padding()
  }
}
