import SwiftUI

struct ScreenTitleView: View {
  let title: String
  let systemImage: String

  var body: some View {
    HStack(spacing: 6) {
      Image(systemName: systemImage)
        .font(.system(size: 16, weight: .semibold))
        .foregroundStyle(.white)
      Text(title)
        .font(.headline)
        .foregroundStyle(.white)
    }
    .frame(maxWidth: .infinity)
    .padding(.vertical, 4)
  }
}
