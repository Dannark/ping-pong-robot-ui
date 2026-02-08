import SwiftUI

struct ModeConfigPage: View {
  let title: String
  let systemImage: String
  let modes: [String]
  @Binding var selectedIndex: Int
  var onSelect: ((Int) -> Void)?

  var body: some View {
    VStack(spacing: 8) {
      Label(title, systemImage: systemImage)
        .font(.headline)

      List(modes.indices, id: \.self) { index in
        Button {
          selectedIndex = index
          onSelect?(index)
        } label: {
          HStack {
            Text(modes[index])
              .foregroundStyle(.primary)
            Spacer()
            if index == selectedIndex {
              Image(systemName: "checkmark.circle.fill")
                .foregroundStyle(.tint)
            }
          }
        }
      }
      .listStyle(.carousel)
    }
    .padding(.vertical, 4)
  }
}
