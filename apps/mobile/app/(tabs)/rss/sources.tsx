import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  Edit3,
  Plus,
  RefreshCw,
  Rss,
  Trash2,
} from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AddFeedModal } from "@/components/add-feed-modal";
import { EditFeedModal } from "@/components/edit-feed-modal";
import { Text } from "@/components/ui/text";
import { useFeeds } from "@/hooks/use-feeds";
import type { Feed } from "@packages/store";

export default function SourcesScreen() {
  const router = useRouter();
  const { feeds, articles, addFeed, removeFeed, refreshFeed } = useFeeds();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<Feed | null>(null);
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());

  // Unread count per feed
  const unreadByFeed = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of articles) {
      if (!a.read) map.set(a.feedId, (map.get(a.feedId) ?? 0) + 1);
    }
    return map;
  }, [articles]);

  const articleCountByFeed = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of articles) {
      map.set(a.feedId, (map.get(a.feedId) ?? 0) + 1);
    }
    return map;
  }, [articles]);

  const openEditModal = useCallback((feed: Feed) => {
    setSelectedFeed(feed);
    setEditModalOpen(true);
  }, []);

  const handleRefresh = useCallback(
    async (feedId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setRefreshingIds((s) => new Set(s).add(feedId));
      try {
        await refreshFeed(feedId);
      } catch (e) {
        console.error("Refresh failed:", e);
      } finally {
        setRefreshingIds((s) => {
          const next = new Set(s);
          next.delete(feedId);
          return next;
        });
      }
    },
    [refreshFeed]
  );

  const handleDelete = useCallback(
    (feed: Feed) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert(
        "Remove Feed",
        `Remove "${feed.title}"? All its articles will be deleted.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => removeFeed(feed.id),
          },
        ]
      );
    },
    [removeFeed]
  );

  const handleSaveTitle = useCallback((id: string, data: { title: string; feedUrl: string }) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // TODO: Implement updateFeed in store when available
    console.log("Save feed:", id, data);
  }, []);

  const renderFeed = useCallback(
    ({ item: feed }: { item: Feed }) => {
      const unread = unreadByFeed.get(feed.id) ?? 0;
      const total = articleCountByFeed.get(feed.id) ?? 0;
      const isRefreshing = refreshingIds.has(feed.id);

      return (
        <Pressable
          onPress={() => openEditModal(feed)}
          className="mx-4 mb-3 overflow-hidden rounded-2xl border border-border bg-card active:opacity-90"
        >
          {/* Main row */}
          <View className="flex-row items-center gap-3 px-4 py-4">
            {/* Feed icon */}
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Rss size={18} className="text-primary" />
            </View>

            {/* Title + meta */}
            <View className="flex-1 min-w-0">
              <Text
                className="font-semibold text-foreground text-base"
                numberOfLines={1}
              >
                {feed.title}
              </Text>
              <Text
                className="mt-0.5 text-muted-foreground text-xs"
                numberOfLines={1}
              >
                {feed.feedUrl}
              </Text>
            </View>

            {/* Unread badge */}
            {unread > 0 && (
              <View className="items-center justify-center rounded-full bg-primary px-2 py-0.5 min-w-[24px]">
                <Text className="text-[11px] font-bold text-primary-foreground">
                  {unread > 99 ? "99+" : unread}
                </Text>
              </View>
            )}

            <ChevronRight size={16} className="text-muted-foreground" />
          </View>

          {/* Stats + actions bar */}
          <View className="flex-row items-center justify-between border-t border-border/50 bg-muted/30 px-4 py-2">
            <Text className="text-muted-foreground text-xs">
              {total} article{total !== 1 ? "s" : ""}
              {feed.lastFetched
                ? ` · ${new Date(feed.lastFetched).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                : ""}
            </Text>

            <View className="flex-row items-center gap-1">
              {/* Refresh */}
              <Pressable
                onPress={(e) => {
                  e.stopPropagation?.();
                  handleRefresh(feed.id);
                }}
                disabled={isRefreshing}
                className="rounded-lg p-2 active:opacity-60"
                hitSlop={8}
              >
                {isRefreshing ? (
                  <ActivityIndicator size={15} color="hsl(var(--muted-foreground))" />
                ) : (
                  <RefreshCw size={15} className="text-muted-foreground" />
                )}
              </Pressable>

              {/* Edit */}
              <Pressable
                onPress={(e) => {
                  e.stopPropagation?.();
                  openEditModal(feed);
                }}
                className="rounded-lg p-2 active:opacity-60"
                hitSlop={8}
              >
                <Edit3 size={15} className="text-muted-foreground" />
              </Pressable>

              {/* Delete */}
              <Pressable
                onPress={(e) => {
                  e.stopPropagation?.();
                  handleDelete(feed);
                }}
                className="rounded-lg p-2 active:opacity-60"
                hitSlop={8}
              >
                <Trash2 size={15} className="text-destructive" />
              </Pressable>
            </View>
          </View>
        </Pressable>
      );
    },
    [
      unreadByFeed,
      articleCountByFeed,
      refreshingIds,
      handleRefresh,
      handleDelete,
      openEditModal,
    ]
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
          onPress={() => router.back()}
          className="rounded-xl border border-border bg-card p-2.5 active:opacity-80"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </Pressable>

        <View className="flex-1 mx-3">
          <Text className="font-semibold text-foreground text-lg text-center">
            Sources
          </Text>
          <Text className="text-muted-foreground text-xs text-center mt-0.5">
            {feeds.length} feed{feeds.length !== 1 ? "s" : ""} subscribed
          </Text>
        </View>

        <Pressable
          onPress={() => setAddModalOpen(true)}
          className="rounded-xl bg-primary p-2.5 active:opacity-80"
        >
          <Plus size={20} className="text-primary-foreground" />
        </Pressable>
      </View>

      {/* Feed list */}
      {feeds.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8 gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Rss size={28} className="text-muted-foreground" />
          </View>
          <View className="items-center gap-1">
            <Text className="font-semibold text-foreground text-lg">
              No sources yet
            </Text>
            <Text className="text-muted-foreground text-sm text-center">
              Add RSS feeds to start reading articles from your favourite sites
            </Text>
          </View>
          <Pressable
            onPress={() => setAddModalOpen(true)}
            className="mt-2 flex-row items-center gap-2 rounded-xl bg-primary px-5 py-3 active:opacity-80"
          >
            <Plus size={18} className="text-primary-foreground" />
            <Text className="font-semibold text-primary-foreground">
              Add your first feed
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={feeds}
          renderItem={renderFeed}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modals */}
      <AddFeedModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAddFeed={(data) => {
          addFeed({
            feedUrl: data.feedUrl,
            title: data.title || "New Feed",
          });
        }}
      />

      <EditFeedModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        feed={selectedFeed}
        onSave={handleSaveTitle}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  );
}