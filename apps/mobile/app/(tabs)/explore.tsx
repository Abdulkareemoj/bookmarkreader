import { View, Text } from "react-native"
import { Compass } from "lucide-react-native"

export default function ExploreScreen() {
  return (
    <View className="flex-1 bg-white justify-center items-center">
      <Compass size={48} color="#9ca3af" />
      <Text className="text-xl font-semibold text-gray-900 mt-4">Explore</Text>
      <Text className="text-gray-600 mt-2">Coming soon</Text>
    </View>
  )
}
