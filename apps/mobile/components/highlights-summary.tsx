import { View, ScrollView, TouchableOpacity } from "react-native";
import { Trash2 } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import type { Highlight } from "@packages/store";
import React from "react";

interface HighlightsSummaryProps {
  highlights: Highlight[];
  onDeleteHighlight: (id: string) => void;
}

const COLOR_MAP: Record<string, string> = {
  yellow: "#fbbf24",
  green:  "#86efac",
  blue:   "#60a5fa",
  pink:   "#f472b6",
};

export function HighlightsSummary({
  highlights,
  onDeleteHighlight,
}: HighlightsSummaryProps) {
  if (highlights.length === 0) return null;

  return (
    <View className="mt-6 pt-4 border-t border-border">
      <Text className="text-base font-bold text-foreground mb-3">
        Highlights ({highlights.length})
      </Text>
      <ScrollView>
        {highlights.map((highlight) => (
          <View
            key={highlight.id}
            className="mb-3 p-3 bg-muted/40 rounded-xl border-l-4"
            style={{ borderLeftColor: COLOR_MAP[highlight.color] ?? "#3b82f6" }}
          >
            <Text className="text-sm text-foreground italic mb-2">
              "{highlight.text}"
            </Text>
            {highlight.annotations.length > 0 && (
              <View className="bg-card p-2 rounded-lg mb-2 gap-1">
                {highlight.annotations.map((annotation) => (
                  <Text key={annotation.id} className="text-xs text-muted-foreground">
                    💬 {annotation.text}
                  </Text>
                ))}
              </View>
            )}
            <TouchableOpacity
              onPress={() => onDeleteHighlight(highlight.id)}
              className="self-end"
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}