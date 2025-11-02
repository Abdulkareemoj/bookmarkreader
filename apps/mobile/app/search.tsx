import { Stack } from "expo-router";
import { Text, View } from "react-native";

export default function SearchScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Stack.Screen options={{ title: "Search" }} />
      <Text>Search Screen</Text>
    </View>
  );
}
