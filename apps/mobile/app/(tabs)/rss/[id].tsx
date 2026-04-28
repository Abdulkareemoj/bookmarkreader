

import React from "react";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Bookmark, ExternalLink, Heart, Share2 } from "lucide-react-native";
import { Linking, Pressable, ScrollView, Share, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useFeeds } from "@/hooks/use-feeds";

export default function ArticleScreen() {
	const router = useRouter();
	const scrollY = useSharedValue(0);
	const { id } = useLocalSearchParams<{ id: string }>();
	const { articles, feeds, toggleArticleLike, toggleArticleSave, toggleArticleRead } = useFeeds();

	const article = articles.find((a) => a.id === id);
	console.log("article content:", article.content?.slice(0, 100));
console.log("article snippet:", article.contentSnippet?.slice(0, 100));
	const feed = feeds.find((f) => f.id === article?.feedId);

	if (!article) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center p-4">
					<Text className="text-muted-foreground">Article not found</Text>
				</View>
			</SafeAreaView>
		);
	}

	// Mark as read when opened
	React.useEffect(() => {
		if (!article.read) {
			toggleArticleRead(article.id);
		}
	}, [article.id, article.read, toggleArticleRead]);

	const handleOpenSource = () => {
		if (article.link) {
			Haptics.selectionAsync();
			Linking.openURL(article.link);
		}
	};

	const handleShare = async () => {
		if (!article.link) return;
		await Haptics.selectionAsync();
		await Share.share({
			message: `${article.title}\n${article.link || ""}`,
			url: article.link,
			title: article.title,
		});
	};

	const handleToggleLike = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		toggleArticleLike(article.id);
	};

	const handleToggleSave = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		toggleArticleSave(article.id);
	};

	const rawContent = article.content || article.contentSnippet || "No content available.";
const normalizedContent = rawContent
  .replace(/<[^>]*>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/\s+/g, " ")
  .trim();
const sentences = normalizedContent.split(/([.!?])\s+(?=[A-Z0-9])/);
const rejoined: string[] = [];
for (let i = 0; i < sentences.length; i++) {
  if (sentences[i].length === 1 && /[.!?]/.test(sentences[i])) {
    if (rejoined.length > 0) rejoined[rejoined.length - 1] += sentences[i];
  } else {
    rejoined.push(sentences[i]);
  }
}
const paragraphs: string[] = rejoined.reduce((chunks: string[], sentence: string) => {
  const cleaned = sentence.trim();
  if (!cleaned) return chunks;
  const last = chunks[chunks.length - 1];
  if (!last || last.length > 300) {
    chunks.push(cleaned);
  } else {
    chunks[chunks.length - 1] = `${last} ${cleaned}`;
  }
  return chunks;
}, []);
	const articleDomain = article.link
		? article.link.replace(/^https?:\/\//, "").split("/")[0]
		: feed?.title || "RSS Feed";

	const compactTitle = article.title.length > 42
		? `${article.title.slice(0, 42).trimEnd()}...`
		: article.title;

	const headerAnimatedStyle = useAnimatedStyle(() => {
		const borderOpacity = interpolate(scrollY.value, [0, 48], [0, 1]);
		return {
			borderBottomColor: `rgba(228, 228, 231, ${borderOpacity})`,
		};
	});

	const compactTitleStyle = useAnimatedStyle(() => {
		const opacity = interpolate(scrollY.value, [0, 36, 84], [0, 0, 1]);
		const translateY = interpolate(scrollY.value, [0, 84], [8, 0]);
		return { opacity, transform: [{ translateY }] };
	});

	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Header */}
			<Animated.View
				style={headerAnimatedStyle}
				className="flex-row items-center justify-between border-b bg-background/95 px-4 py-3"
			>
				<Pressable
					onPress={() => router.back()}
					className="rounded-xl border border-border bg-card p-2.5 active:opacity-80"
				>
					<ArrowLeft size={20} className="text-foreground" />
				</Pressable>
				<Animated.View className="mx-3 flex-1" style={compactTitleStyle}>
					<Text className="text-center font-semibold text-foreground text-sm" numberOfLines={1}>
						{compactTitle}
					</Text>
				</Animated.View>
				<View className="flex-row gap-2">
					<Pressable
						onPress={handleToggleLike}
						className="rounded-xl border border-border bg-card p-2.5 active:opacity-80"
					>
						<Heart
							size={20}
							className={article.liked ? "text-red-500" : "text-muted-foreground"}
							fill={article.liked ? "#ef4444" : "none"}
						/>
					</Pressable>
					<Pressable
						onPress={handleToggleSave}
						className="rounded-xl border border-border bg-card p-2.5 active:opacity-80"
					>
						<Bookmark
							size={20}
							className={article.saved ? "text-blue-500" : "text-muted-foreground"}
							fill={article.saved ? "#3b82f6" : "none"}
						/>
					</Pressable>
					<Pressable
						onPress={handleShare}
						disabled={!article.link}
						className="rounded-xl border border-border bg-card p-2.5 active:opacity-80"
					>
						<Share2 size={20} className="text-muted-foreground" />
					</Pressable>
					<Pressable
						onPress={handleOpenSource}
						disabled={!article.link}
						className="rounded-xl border border-border bg-card p-2.5 active:opacity-80"
					>
						<ExternalLink size={20} className="text-muted-foreground" />
					</Pressable>
				</View>
			</Animated.View>

			{/* Content */}
			<Animated.ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 18, paddingBottom: 28 }}
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
				onScroll={(event) => {
					const next = event.nativeEvent.contentOffset.y;
					scrollY.value = withTiming(next, { duration: 70 });
				}}
			>
				<View className="mb-5">
					<Text className="mb-2 text-muted-foreground text-xs uppercase tracking-[1.5px]">
						{articleDomain}
					</Text>
					<Text className="text-3xl font-bold leading-10 text-foreground">
						{article.title}
					</Text>
				</View>

				<View className="mb-6 flex-row items-center justify-between border-border border-b pb-4">
					<View>
						<Text className="font-medium text-foreground text-sm">
							{feed?.title || "Unknown Feed"}
						</Text>
						<Text className="mt-1 text-muted-foreground text-xs">
							{new Date(article.pubDate || 0).toLocaleDateString()}
						</Text>
					</View>
					<View className="rounded-full bg-primary/10 px-3 py-1">
						<Text className="font-medium text-primary text-xs">
							{Math.max(1, Math.ceil(normalizedContent.split(" ").length / 220))} min read
						</Text>
					</View>
				</View>

				<View className="gap-5">
					{paragraphs.length > 0 ? (
						paragraphs.map((paragraph: string, idx: number) => (
							<Text key={`${idx}-${paragraph.slice(0, 16)}`} className="text-[17px] leading-8 text-foreground">
								{paragraph}
							</Text>
						))
					) : (
						<Text className="text-[17px] leading-8 text-foreground">
							{normalizedContent}
						</Text>
					)}
				</View>

				<View className="mt-8 border-border border-t pt-5">
					<Button
						onPress={handleOpenSource}
						disabled={!article.link}
						variant="outline"
						className="rounded-xl"
					>
						<Icon as={ExternalLink} size={16} className="text-foreground" />
						<Text>Open Original Article</Text>
					</Button>
				</View>
			</Animated.ScrollView>
		</SafeAreaView>
	);
}
