# BookmarkReader

<div align="center">

A personal cross-platform bookmark and RSS reader app built for desktop, web, and mobile.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB)](https://reactjs.org/)
[![Expo](https://img.shields.io/badge/Expo-51-000080)](https://expo.dev/)

</div>

## Features

- 📚 **Bookmark Management** - Organize bookmarks with tags, descriptions, and favicons
- 📰 **RSS Reader** - Subscribe to RSS feeds and read articles offline
- 🎨 **Cross-Platform UI** - Consistent design across web, desktop, and mobile
- 💾 **Local-First** - All data stored locally with SQLite/AsyncStorage
- � **Dark Mode** - Built-in dark theme support
- 🔍 **Search & Filter** - Quickly find bookmarks and articles
- 📱 **Mobile Optimized** - Native-feeling mobile experience with Expo

## Tech Stack

### Frontend

- **Web/Desktop**: React 19 + Vite + TailwindCSS + Tanstack Start
- **Mobile**: React Native (Expo) + UniWind
- **Desktop Shell**: Tauri

### Backend

- **Database**: SQLite (Drizzle ORM) / AsyncStorage (mobile)
- **State Management**: Zustand
- **RSS Parsing**: Extractus (browser-compatible)
- **Build Tool**: Turborepo

### Development

- **Language**: TypeScript
- **Linting**: Biome
- **Package Manager**: pnpm
- **Testing**:

## Project Structure

```
bookmark-tool/
├── apps/
│   ├── web/          # Web application (React + shadcn/ui)
│   ├── desktop/      # Desktop application (Tauri + React)
│   ├── mobile/       # Mobile application (Expo + React Native)
│   └── website/      # Website (React + shadcn/ui)
├── packages/
│   ├── db/           # Database schema and migrations (Drizzle)
│   ├── store/        # Zustand state management
│   ├── hooks/        # Shared React hooks
│   ├── utils/        # Shared utilities (RSS parsing, metadata fetching)
│   └── agents/       # Shared agent implementations (bookmark, RSS)
└── package.json      # Root package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- (For desktop) Rust and Cargo
- (For mobile) Expo CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bookmark-tool.git
cd bookmark-tool

# Install dependencies
pnpm install

# Run development servers
pnpm dev
```

### Platform-Specific Setup

#### Web

```bash
cd apps/web
pnpm dev
```

#### Desktop

```bash
cd apps/desktop
pnpm tauri dev
```

#### Mobile

```bash
cd apps/mobile
pnpm start
# Or use Expo Go app
```

## Usage

### Adding Bookmarks

1. Navigate to the Bookmarks section
2. Click "Add Bookmark"
3. Enter the URL
4. The app will automatically fetch title, description, and favicon

### Managing RSS Feeds

1. Navigate to the RSS section
2. Click "Add Feed"
3. Enter the RSS feed URL
4. Articles will be fetched and cached locally

### Reading Articles

- Click on any article to open the reader view
- Articles are marked as read automatically
- Use the action buttons to like, save, or share

## Development

### Running Tests

```bash
pnpm test
```

### Building for Production

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter @apps/web build
pnpm --filter @apps/desktop build
pnpm --filter @apps/mobile build
```

### Code Style

This project uses ESLint and Prettier for code formatting:

```bash
# Lint code
pnpm lint

# Format code
pnpm format
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure cross-platform compatibility

## Roadmap

- [ ] Some form of User authentication and cloud sync
- [ ] Browser extension for quick bookmarking
- [ ] Full-text search with SQLite FTS
- [ ] Push notifications for new RSS articles
- [ ] AI-powered summarization
- [ ] Import/Export bookmarks (OPML, HTML)
- [ ] Collections and folders
- [ ] Advanced filtering and sorting
<!--

## License

## This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. -->

<div align="center">
  <sub>Built with ❤️ by the open-source community</sub>
</div>
