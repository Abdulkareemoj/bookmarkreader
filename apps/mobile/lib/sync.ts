// Shared sync utilities for web and mobile
export async function syncBookmarks(bookmarks: any[]) {
  try {
    // This would connect to your backend API
    // For now, it's a placeholder for future implementation
    console.log("[v0] Syncing bookmarks:", bookmarks.length)
    return true
  } catch (error) {
    console.error("[v0] Sync error:", error)
    return false
  }
}

export async function syncHighlights(highlights: any[]) {
  try {
    console.log("[v0] Syncing highlights:", highlights.length)
    return true
  } catch (error) {
    console.error("[v0] Sync error:", error)
    return false
  }
}

export function getStorageKey(key: string): string {
  return `reader-${key}`
}
