import { Highlighter, MessageCircle } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface ArticleReaderProps {
	title: string;
	content: string;
	author: string;
	date: string;
}

export function ArticleReader({
	title,
	content,
	author,
	date,
}: ArticleReaderProps) {
	const [selectedText, setSelectedText] = useState("");
	const [showHighlightMenu, setShowHighlightMenu] = useState(false);

	return (
		<ScrollView className="flex-1 px-4 py-4">
			{/* Title */}
			<Text className="mb-2 font-bold text-2xl text-gray-900">{title}</Text>

			{/* Metadata */}
			<View className="mb-4 flex-row items-center justify-between border-gray-100 border-b pb-4">
				<View>
					<Text className="font-medium text-gray-900 text-sm">{author}</Text>
					<Text className="mt-1 text-gray-600 text-xs">{date}</Text>
				</View>
			</View>

			{/* Content */}
			<Text className="text-base text-gray-700 leading-7">{content}</Text>

			{/* Highlight Menu */}
			{showHighlightMenu && (
				<View className="absolute right-4 bottom-4 left-4 flex-row justify-around rounded-lg bg-white p-3 shadow-lg">
					<TouchableOpacity className="items-center">
						<Highlighter size={20} color="#fbbf24" />
						<Text className="mt-1 text-gray-700 text-xs">Yellow</Text>
					</TouchableOpacity>
					<TouchableOpacity className="items-center">
						<Highlighter size={20} color="#86efac" />
						<Text className="mt-1 text-gray-700 text-xs">Green</Text>
					</TouchableOpacity>
					<TouchableOpacity className="items-center">
						<Highlighter size={20} color="#60a5fa" />
						<Text className="mt-1 text-gray-700 text-xs">Blue</Text>
					</TouchableOpacity>
					<TouchableOpacity className="items-center">
						<MessageCircle size={20} color="#f472b6" />
						<Text className="mt-1 text-gray-700 text-xs">Note</Text>
					</TouchableOpacity>
				</View>
			)}
		</ScrollView>
	);
}
