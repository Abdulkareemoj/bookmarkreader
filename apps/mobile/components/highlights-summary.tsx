import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { Trash2 } from "lucide-react-native"
import type { Highlight } from "@/lib/store"

interface HighlightsSummaryProps {
  highlights: Highlight[]
  onDeleteHighlight: (id: string) => void
}

export function HighlightsSummary({ highlights, onDeleteHighlight }: HighlightsSummaryProps) {
  if (highlights.length === 0) return null

  const colorMap: Record<string, string> = {
    yellow: "#fbbf24",
    green: "#86efac",
    blue: "#60a5fa",
    pink: "#f472b6",
  }

  return (
    <View className="mt-6 pt-4 border-t border-gray-200">
      <Text className="text-lg font-bold text-gray-900 mb-3">Highlights ({highlights.length})</Text>
      <ScrollView>
        {highlights.map((highlight) => (
          <View
            key={highlight.id}
            className="mb-3 p-3 bg-gray-50 rounded-lg border-l-4"
            style={{ borderLeftColor: colorMap[highlight.color] || "#3b82f6" }}
          >
            <Text className="text-sm text-gray-700 italic mb-2">"{highlight.text}"</Text>
            {highlight.annotations.length > 0 && (
              <View className="bg-white p-2 rounded mb-2">
                {highlight.annotations.map((annotation) => (
                  <Text key={annotation.id} className="text-xs text-gray-600">
                    {annotation.text}
                  </Text>
                ))}
              </View>
            )}
            <TouchableOpacity onPress={() => onDeleteHighlight(highlight.id)} className="self-end">
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
