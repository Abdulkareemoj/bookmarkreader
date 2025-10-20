# Project: Cross-Platform Bookmark & RSS Manager

🎯 Overview

A personal cross-platform bookmark and RSS reader app built for desktop (Tauri + React), web, and mobile (Expo + React Native).
The app helps users organize, tag, and read bookmarked links and RSS feeds offline.
Syncing and user accounts will be added later.

🧩 Core Goals

Manage and organize bookmarks with metadata (title, description, tags, favicon, etc.)

Read and manage RSS feeds directly within the app

Local-first data storage (SQLite / AsyncStorage)

Consistent design system across platforms

Offline-ready with future sync support

🏗️ Architecture Overview
Monorepo (Turborepo)

```bash
apps/
  web/        → React + shadcn/ui (Tailwind)
  desktop/    → Tauri + React (reuses web UI)
  mobile/     → React Native (Expo)
packages/
  ui/         → Reusable React Native components (NativeWind or Tamagui)
  db/         → Drizzle ORM schema + migrations
  utils/      → Shared hooks, types, logic (bookmark parsers, feed fetchers)
  api/        → Future sync and server API helpers
```

| Layer                      | Tools                                                     |
| -------------------------- | --------------------------------------------------------- |
| **Frontend (Web/Desktop)** | React + Vite + TailwindCSS + shadcn/ui                    |
| **Frontend (Mobile)**      | React Native (Expo) + NativeWind/Tamagui                  |
| **App Shell**              | Tauri (for desktop app bundling)                          |
| **ORM / Data Layer**       | Drizzle ORM (SQLite / AsyncStorage)                       |
| **State Management**       | Zustand / Jotai (lightweight, cross-platform)             |
| **RSS Parsing**            | rss-parser or custom fetcher using DOMParser              |
| **Local Storage**          | SQLite (Drizzle) for desktop/web, AsyncStorage for mobile |
| **Build & Tooling**        | Turborepo + TypeScript + ESlint + Prettier                |

🧠 Core Modules & Responsibilities

1. Bookmark

Handles creation, organization, and metadata management for bookmarks.

Responsibilities

Add/edit/delete bookmarks

Group by tags or collections

Auto-fetch title, favicon, description from URL

Local caching and search filtering

Handle favorites and read-later lists

Core Types
type Bookmark = {
id: string;
title: string;
url: string;
description?: string;
favicon?: string;
tags?: string[];
dateAdded: string;
favorite?: boolean;
};

1. RSS Reader

Manages feed subscriptions, parsing, and article reading.

Responsibilities

Add/edit/remove RSS feeds

Fetch and parse feed XML into articles

Track read/unread states

Cache feed data locally

Refresh feeds periodically

Core Types
type Feed = {
id: string;
title: string;
feedUrl: string;
siteUrl?: string;
lastFetched?: string;
unreadCount?: number;
};

type Article = {
id: string;
feedId: string;
title: string;
link: string;
contentSnippet?: string;
content?: string;
pubDate?: string;
read?: boolean;
};

1. UI

Defines the shared design principles and reusable components.

Responsibilities

Maintain consistent theme (light/dark)

Define typography, spacing, and color tokens

Provide shared UI elements:

Buttons, Cards, Tabs, Modals, Inputs

Bookmark List + Feed List layouts

Empty States and Skeleton Loaders

Web: Built with shadcn/ui + Tailwind
Mobile: Built with NativeWind or Tamagui, reusing component patterns.

1. Storage

Handles persistence and data migration.

Responsibilities

Manage SQLite connections via Drizzle

Migrate schema on version updates

Abstract AsyncStorage or SQLite (for mobile)

Provide CRUD methods to BookmarkAgent and RssAgent

5. Sync Agent (Future)

Will handle user accounts, syncing, and backups (e.g. Supabase, remote API).

Responsibilities

User authentication

Cloud backup and restore

Conflict resolution

Cross-device syncing

6. Utility Agent

Provides cross-platform helpers and services.

Responsibilities

RSS XML parsing

Bookmark URL metadata extraction (via Open Graph tags)

Date formatting

Error handling and logging

Network helpers and caching

| Step | Action                                                                   |
| ---- | ------------------------------------------------------------------------ |
| 1️⃣   | Build UIs in `apps/web` using shadcn/ui                                  |
| 2️⃣   | Mirror component patterns in `packages/ui` for mobile                    |
| 3️⃣   | Define Drizzle schema in `packages/db`                                   |
| 4️⃣   | Implement core agents (`BookmarkAgent`, `RssAgent`) in `packages/utils`  |
| 5️⃣   | Wire up storage with Drizzle for local persistence                       |
| 6️⃣   | Later add syncing with Supabase / custom backend (Not necessary for now) |

🧩 Future Enhancements

Browser extension for quick bookmark saving

Full-text search (using SQLite FTS)

Notifications for new RSS posts

Custom article reader view (distraction-free)

AI summarization or tag suggestions

User authentication & cloud sync
