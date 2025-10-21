import { View, TouchableOpacity, Text } from "react-native"
import { Highlight, MessageCircle, X } from "lucide-react-native"

interface HighlightMenuMobileProps {
  onHighlight: (color: string) => void
  onAnnotate: () => void
  onClose: () => void
}

export function HighlightMenuMobile({ onHighlight, onAnnotate, onClose }: HighlightMenuMobileProps) {
  const colors = [
    { name: "yellow", hex: "#fbbf24" },
    { name: "green", hex: "#86efac" },
    { name: "blue", hex: "#60a5fa" },
    { name: "pink", hex: "#f472b6" },
  ]

  return (
    <View className="bg-white rounded-lg shadow-lg p-4 mx-4 mb-4">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="font-semibold text-gray-900">Highlight</Text>
        <TouchableOpacity onPress={onClose}>
          <X size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-2 mb-3">
        {colors.map((color) => (
          <TouchableOpacity
            key={color.name}
            onPress={() => onHighlight(color.name)}
            className="flex-1 py-2 rounded-lg"
            style={{ backgroundColor: color.hex }}
          >
            <Highlight size={20} color="white" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={onAnnotate}
        className="bg-gray-100 py-2 rounded-lg flex-row items-center justify-center"
      >
        <MessageCircle size={18} color="#6b7280" />
        <Text className="ml-2 text-gray-700 font-medium">Add Note</Text>
      </TouchableOpacity>
    </View>
  )
}
