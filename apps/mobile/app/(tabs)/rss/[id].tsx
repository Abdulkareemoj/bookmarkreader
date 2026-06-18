import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Bookmark,
  ExternalLink,
  Heart,
  Share2,
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Share,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import RenderHtml from "react-native-render-html";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { useFeeds } from "@/hooks/use-feeds";
import { useColorScheme } from "react-native";
import { THEME } from "@/lib/theme";
// ─── HTML helpers ─────────────────────────────────────────────────────────────

function cleanHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br>/gi, "<br/>")
    .replace(/<hr>/gi, "<hr/>")
    .trim();
}


// ─── Component ────────────────────────────────────────────────────────────────

export default function ArticleScreen() {
  
  const router = useRouter();
  const scrollY = useSharedValue(0);
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  
// ─── Tag styles ───────────────────────────────────────────────────────────────

const colorScheme = useColorScheme();
const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

const tagsStyles: Record<string, object> = {
  p:          { fontSize: 17, lineHeight: 28, marginBottom: 20, color: theme.foreground },
  h1:         { fontSize: 26, fontWeight: "700", marginBottom: 12, marginTop: 24, color: theme.foreground },
  h2:         { fontSize: 22, fontWeight: "700", marginBottom: 10, marginTop: 20, color: theme.foreground },
  h3:         { fontSize: 19, fontWeight: "600", marginBottom: 8, marginTop: 16, color: theme.foreground },
  a:          { color: theme.primary, textDecorationLine: "underline" },
  blockquote: { borderLeftWidth: 3, borderLeftColor: theme.primary, paddingLeft: 12, marginLeft: 0, marginVertical: 16, opacity: 0.8 },
  ul:         { marginBottom: 16 },
  ol:         { marginBottom: 16 },
  li:         { fontSize: 17, lineHeight: 28, marginBottom: 4, color: theme.foreground },
  code:       { fontFamily: "monospace", fontSize: 14, backgroundColor: theme.muted, borderRadius: 4 },
  pre:        { backgroundColor: theme.muted, padding: 12, borderRadius: 8, marginBottom: 16 },
  img:        { borderRadius: 8, marginBottom: 16 },
  figcaption: { fontSize: 13, color: theme.mutedForeground, textAlign: "center", marginTop: 4 },
  strong:     { fontWeight: "700", color: theme.foreground },
  em:         { fontStyle: "italic" },
};
  // All hooks must be inside the component
  const {
    articles,
    feeds,
    toggleArticleLike,
    toggleArticleSave,
    toggleArticleRead,
    fetchArticleContent,
  } = useFeeds();

  const article = articles.find((a) => a.id === id);
  console.log("[ArticleScreen] found article:", !!article, "id:", id);
console.log("[ArticleScreen] articles count:", articles.length);
  const feed = feeds.find((f) => f.id === article?.feedId);

  // Mark as read + fetch full content on mount
  React.useEffect(() => {
    if (!article) return;
    if (!article.read) toggleArticleRead(article.id);
    void fetchArticleContent(article.id);
  }, [article?.id]);

  const htmlSource = useMemo(() => {
    const raw = (article as any)?.fullContent || article?.content || article?.contentSnippet || "";
    const isPlainText = !/<[a-z][\s\S]*>/i.test(raw);
    const html = isPlainText
      ? raw.split(/\n\n+/).map((p: string) => `<p>${p.replace(/\n/g, " ").trim()}</p>`).join("")
      : cleanHtml(raw);
    return { html };
  }, [(article as any)?.fullContent, article?.content, article?.contentSnippet]);
console.log("[ArticleScreen] article:", article?.id);
console.log("[ArticleScreen] content:", article?.content?.slice(0, 50));
console.log("[ArticleScreen] fullContent:", (article as any)?.fullContent?.slice(0, 50));
console.log("[ArticleScreen] htmlSource:", htmlSource.html?.slice(0, 50));
  const readTime = useMemo(() => {
    const raw = (article as any)?.fullContent || article?.content || article?.contentSnippet || "";
    const text = raw.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(text / 220));
  }, [(article as any)?.fullContent, article?.content, article?.contentSnippet]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    borderBottomColor: `rgba(228,228,231,${interpolate(scrollY.value, [0, 48], [0, 1])})`,
  }));

  const compactTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 36, 84], [0, 0, 1]),
    transform: [{ translateY: interpolate(scrollY.value, [0, 84], [8, 0]) }],
  }));

  if (!article) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-lg text-muted-foreground">Article not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const date = article.pubDate
    ? new Date(article.pubDate).toLocaleDateString(undefined, {
        year: "numeric", month: "long", day: "numeric",
      })
    : "";

  const compactTitle =
    article.title.length > 42
      ? `${article.title.slice(0, 42).trimEnd()}…`
      : article.title;

  const handleOpenSource = () => {
    if (article.link) { Haptics.selectionAsync(); Linking.openURL(article.link); }
  };

  const handleShare = async () => {
    if (!article.link) return;
    await Haptics.selectionAsync();
    await Share.share({ message: `${article.title}\n${article.link}`, url: article.link, title: article.title });
  };

  return (
    
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <Animated.View
        style={headerAnimatedStyle}
        className="flex-row items-center justify-between border-border border-b bg-background/95 px-4 py-3"
      >
        <Pressable onPress={() => router.back()} className="rounded-xl border border-border bg-card p-2.5 active:opacity-80">
          <ArrowLeft size={20} className="text-foreground" />
        </Pressable>

        <Animated.View className="mx-3 flex-1" style={compactTitleStyle}>
          <Text className="text-center font-semibold text-foreground text-sm" numberOfLines={1}>
            {compactTitle}
          </Text>
        </Animated.View>

        <View className="flex-row gap-2">
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleArticleLike(article.id); }}
            className="rounded-xl border border-border bg-card p-2.5 active:opacity-80"
          >
            <Heart size={20} className={article.liked ? "text-red-500" : "text-muted-foreground"} fill={article.liked ? "#ef4444" : "none"} />
          </Pressable>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleArticleSave(article.id); }}
            className="rounded-xl border border-border bg-card p-2.5 active:opacity-80"
          >
            <Bookmark size={20} className={article.saved ? "text-blue-500" : "text-muted-foreground"} fill={article.saved ? "#3b82f6" : "none"} />
          </Pressable>
          <Pressable onPress={handleShare} disabled={!article.link} className="rounded-xl border border-border bg-card p-2.5 active:opacity-80">
            <Share2 size={20} className="text-muted-foreground" />
          </Pressable>
          <Pressable onPress={handleOpenSource} disabled={!article.link} className="rounded-xl border border-border bg-card p-2.5 active:opacity-80">
            <ExternalLink size={20} className="text-muted-foreground" />
          </Pressable>
        </View>
      </Animated.View>

      {/* Content */}
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          scrollY.value = withTiming(e.nativeEvent.contentOffset.y, { duration: 70 });
        }}
      >
        <View className="px-5 pt-6 pb-4">
          {feed?.title && (
            <Text className="mb-2 text-xs font-semibold text-primary uppercase tracking-widest">
              {feed.title}
            </Text>
          )}
          <Text className="font-bold text-[28px] text-foreground leading-[1.25] mb-4">
            {article.title}
          </Text>
          <View className="flex-row items-center gap-3 pb-4 border-b border-border">
            <View className="rounded-full bg-muted px-3 py-1">
              <Text className="text-xs font-medium text-muted-foreground">{readTime} min read</Text>
            </View>
            {date ? <Text className="text-xs text-muted-foreground">{date}</Text> : null}
          </View>
        </View>

        {/* Hero image */}
        {article.imageUrl ? (
          <View className="mx-5 mb-6 overflow-hidden rounded-2xl">
            <Image source={{ uri: article.imageUrl }} className="h-52 w-full" contentFit="cover" />
          </View>
        ) : null}

        {/* Content */}
<View style={{ paddingHorizontal: 20 }}>
  {htmlSource.html ? (
   <RenderHtml
  contentWidth={width - 40}
  source={htmlSource}
  tagsStyles={tagsStyles}
  baseStyle={{ color: theme.foreground, fontSize: 17, lineHeight: 28 }}
  enableExperimentalMarginCollapsing
  renderersProps={{
    img: { enableExperimentalPercentWidth: true },
    a: { onPress: (_e: any, href: string) => Linking.openURL(href) },
  }}
  ignoredDomTags={[
    "script", "style", "iframe", "form", "input",
    "button", "select", "textarea", "nav", "header", "footer",
  ]}
/>
  ) : (
    <Text className="text-foreground text-[17px] leading-8">
      {article.contentSnippet?.replace(/<[^>]*>/g, "") || "Loading content..."}
    </Text>
  )}
</View>

        <View className="mx-5 mt-8 pt-6 border-t border-border">
          <Pressable
            onPress={handleOpenSource}
            disabled={!article.link}
            className="flex-row items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 active:opacity-70 disabled:opacity-40"
          >
            <ExternalLink size={16} className="text-foreground" />
            <Text className="font-medium text-foreground">Open Original Article</Text>
          </Pressable>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}