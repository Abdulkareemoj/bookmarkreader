import { Search, X } from "lucide-react-native";
import { TextInput, TouchableOpacity, View } from "react-native";

interface SearchBarMobileProps {
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
}

export function SearchBarMobile({
  value,
  onChange,
  placeholder = "Search bookmarks...",
}: SearchBarMobileProps) {
  const handleClear = () => {
    onChange("");
  };

  return (
    <View className="border-gray-100 border-b bg-white px-4 py-3">
      <View className="flex-row items-center rounded-lg bg-gray-100 px-3 py-2">
        <Search size={20} color="#9ca3af" />
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
          placeholderTextColor="#9ca3af"
          className="ml-2 flex-1 text-gray-900"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <X size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
