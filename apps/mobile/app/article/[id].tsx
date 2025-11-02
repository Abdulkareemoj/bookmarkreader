"use client";

import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Bookmark, Heart, Share2 } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ArticleScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams();
	const [liked, setLiked] = useState(false);
	const [saved, setSaved] = useState(false);

	// Mock article data
	const article = {
		id,
		title: "Understanding Modern Web Architecture",
		author: "Jane Doe",
		date: "Oct 20, 2025",
		readTime: 8,
		category: "Technology",
		content: `
      Web architecture has evolved significantly over the past decade. Modern applications require careful consideration of performance, scalability, and user experience.

      Key considerations include:
      - Server-side rendering vs client-side rendering
      - State management strategies
      - Database optimization
      - Caching mechanisms
      - API design patterns

      Each of these aspects plays a crucial role in building robust applications that can handle millions of users while maintaining excellent performance.

      The future of web development will likely focus on edge computing, serverless architectures, and improved developer experience tools.
    `,
	};

	return (
		<SafeAreaView className="flex-1 bg-white">
			{/* Header */}
			<View className="flex-row items-center justify-between border-gray-100 border-b px-4 py-3">
				<TouchableOpacity onPress={() => router.back()}>
					<ArrowLeft size={24} color="#1f2937" />
				</TouchableOpacity>
				<View className="flex-row gap-3">
					<TouchableOpacity onPress={() => setLiked(!liked)}>
						<Heart
							size={24}
							color={liked ? "#ef4444" : "#6b7280"}
							fill={liked ? "#ef4444" : "none"}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => setSaved(!saved)}>
						<Bookmark
							size={24}
							color={saved ? "#3b82f6" : "#6b7280"}
							fill={saved ? "#3b82f6" : "none"}
						/>
					</TouchableOpacity>
					<TouchableOpacity>
						<Share2 size={24} color="#6b7280" />
					</TouchableOpacity>
				</View>
			</View>

			{/* Content */}
			<ScrollView className="flex-1 px-4 py-4">
				{/* Title */}
				<Text className="mb-3 font-bold text-3xl text-gray-900">
					{article.title}
				</Text>

				{/* Metadata */}
				<View className="mb-4 flex-row items-center justify-between border-gray-100 border-b pb-4">
					<View>
						<Text className="font-medium text-gray-900 text-sm">
							{article.author}
						</Text>
						<Text className="mt-1 text-gray-600 text-xs">{article.date}</Text>
					</View>
					<View className="rounded-full bg-blue-100 px-3 py-1">
						<Text className="font-medium text-blue-700 text-xs">
							{article.readTime} min read
						</Text>
					</View>
				</View>

				{/* Article Content */}
				<Text className="text-base text-gray-700 leading-7">
					{article.content}
				</Text>

				{/* Category Tag */}
				<View className="mt-6 border-gray-100 border-t pt-4">
					<View className="w-fit rounded-full bg-gray-100 px-3 py-1">
						<Text className="font-medium text-gray-700 text-xs">
							{article.category}
						</Text>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
