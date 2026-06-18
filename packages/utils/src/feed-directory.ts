export interface CuratedFeed {
  name: string;
  description: string;
  url: string;
  category: string;
  icon: string;
}

export const curatedFeedsByCategory: Record<string, CuratedFeed[]> = {
  "Tech & Programming": [
    { name: "Hacker News", description: "Top stories from tech & startups", url: "https://news.ycombinator.com/rss", category: "Tech & Programming", icon: "🔶" },
    { name: "r/programming", description: "Computer programming discussion", url: "https://www.reddit.com/r/programming/.rss", category: "Tech & Programming", icon: "🟣" },
    { name: "Ars Technica", description: "Technology news and analysis", url: "https://feeds.arstechnica.com/arstechnica/index", category: "Tech & Programming", icon: "🔴" },
    { name: "The Verge", description: "Tech, science, and culture", url: "https://www.theverge.com/rss/index.xml", category: "Tech & Programming", icon: "🔵" },
    { name: "TechCrunch", description: "Startup and technology news", url: "https://techcrunch.com/feed/", category: "Tech & Programming", icon: "🟢" },
    { name: "Wired", description: "Tech, science, and culture", url: "https://www.wired.com/feed/rss", category: "Tech & Programming", icon: "⬛" },
    { name: "AnandTech", description: "Hardware and semiconductor analysis", url: "https://www.anandtech.com/rss", category: "Tech & Programming", icon: "🟠" },
    { name: "Stack Overflow Blog", description: "Engineering and dev community insights", url: "https://stackoverflow.blog/feed/", category: "Tech & Programming", icon: "🟡" },
  ],
  "Web Development & Design": [
    { name: "r/webdev", description: "Web development news", url: "https://www.reddit.com/r/webdev/.rss", category: "Web Development & Design", icon: "🌐" },
    { name: "Smashing Magazine", description: "Web design & development", url: "https://www.smashingmagazine.com/feed", category: "Web Development & Design", icon: "🔨" },
    { name: "CSS-Tricks", description: "Tips, tricks, and techniques on CSS", url: "https://css-tricks.com/feed", category: "Web Development & Design", icon: "⭐" },
    { name: "Vercel Blog", description: "Updates from the Vercel team", url: "https://vercel.com/atom", category: "Web Development & Design", icon: "▲" },
    { name: "GitHub Blog", description: "Product news and engineering", url: "https://github.blog/feed/", category: "Web Development & Design", icon: "⬜" },
    { name: "DEV Community", description: "Dev articles and discussions", url: "https://dev.to/feed", category: "Web Development & Design", icon: "🟤" },
    { name: "React Status", description: "Weekly React news", url: "https://react.statuscode.com/rss", category: "Web Development & Design", icon: "🔵" },
    { name: "Tailwind CSS Blog", description: "Tailwind CSS updates", url: "https://tailwindcss.com/blog/feed.xml", category: "Web Development & Design", icon: "🩵" },
  ],
  "AI & Machine Learning": [
    { name: "Google AI Blog", description: "AI research from Google", url: "https://blog.research.google/feed.xml", category: "AI & Machine Learning", icon: "🔵" },
    { name: "OpenAI Blog", description: "AI research and product news", url: "https://openai.com/blog/rss.xml", category: "AI & Machine Learning", icon: "🟢" },
    { name: "Hugging Face Blog", description: "ML and NLP news", url: "https://huggingface.co/blog/feed.xml", category: "AI & Machine Learning", icon: "🟡" },
    { name: "MIT AI News", description: "AI research at MIT", url: "https://news.mit.edu/topic/mitartificial-intelligence2/rss", category: "AI & Machine Learning", icon: "🟠" },
    { name: "Machine Learning Mastery", description: "ML tutorials and guides", url: "https://machinelearningmastery.com/feed/", category: "AI & Machine Learning", icon: "🟣" },
    { name: "DeepMind Blog", description: "DeepMind research", url: "https://deepmind.google/blog/rss.xml", category: "AI & Machine Learning", icon: "🔴" },
  ],
  Science: [
    { name: "NASA Breaking News", description: "Latest NASA news", url: "https://www.nasa.gov/rss/dyn/breaking_news.rss", category: "Science", icon: "🚀" },
    { name: "Scientific American", description: "Science news and analysis", url: "https://www.scientificamerican.com/rss/", category: "Science", icon: "🔬" },
    { name: "Nature", description: "Leading science journal", url: "https://feeds.nature.com/nature/rss/current", category: "Science", icon: "📖" },
    { name: "New Scientist", description: "Science and technology news", url: "https://www.newscientist.com/feed/home", category: "Science", icon: "🧪" },
    { name: "BBC Science", description: "Science and environment news", url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", category: "Science", icon: "📡" },
  ],
  "News & Politics": [
    { name: "BBC News", description: "World news from BBC", url: "https://feeds.bbci.co.uk/news/rss.xml", category: "News & Politics", icon: "📰" },
    { name: "Reuters", description: "World news and analysis", url: "https://www.reutersagency.com/feed/", category: "News & Politics", icon: "📯" },
    { name: "NPR", description: "News and culture", url: "https://feeds.npr.org/1001/rss.xml", category: "News & Politics", icon: "🎙️" },
    { name: "The Guardian", description: "World news and commentary", url: "https://www.theguardian.com/world/rss", category: "News & Politics", icon: "🟢" },
    { name: "Associated Press", description: "Breaking news wire", url: "https://feeds.ap.org/ap/feed.rss", category: "News & Politics", icon: "📲" },
  ],
  "Business & Startups": [
    { name: "Y Combinator Blog", description: "Startup advice and news", url: "https://www.ycombinator.com/blog/feed.xml", category: "Business & Startups", icon: "🟠" },
    { name: "Stripe Blog", description: "Payments and commerce", url: "https://stripe.com/blog/feed.rss", category: "Business & Startups", icon: "🔵" },
    { name: "Harvard Business Review", description: "Management and strategy", url: "https://hbr.org/feed/latest", category: "Business & Startups", icon: "🔴" },
    { name: "Signal v. Noise", description: "Basecamp blog", url: "https://world.hey.com/dhh/feed", category: "Business & Startups", icon: "🟡" },
    { name: "Lenny's Newsletter", description: "Product and growth insights", url: "https://www.lennysnewsletter.com/feed", category: "Business & Startups", icon: "✉️" },
  ],
  Design: [
    { name: "A List Apart", description: "Web design and development", url: "https://alistapart.com/main/feed/", category: "Design", icon: "🎨" },
    { name: "Figma Blog", description: "Design tool updates and tips", url: "https://www.figma.com/blog/feed/", category: "Design", icon: "🟣" },
    { name: "Dribbble Blog", description: "Design community news", url: "https://dribbble.com/stories/feed", category: "Design", icon: "🔵" },
    { name: "Adobe Blog", description: "Creative tool updates", url: "https://blog.adobe.com/feed", category: "Design", icon: "🔴" },
    { name: "UX Design", description: "User experience articles", url: "https://uxdesign.cc/feed", category: "Design", icon: "🧑‍🎨" },
  ],
  Gaming: [
    { name: "Polygon", description: "Gaming and entertainment", url: "https://www.polygon.com/rss/index.xml", category: "Gaming", icon: "🎮" },
    { name: "Eurogamer", description: "Video game news", url: "https://www.eurogamer.net/feed", category: "Gaming", icon: "🟢" },
    { name: "Rock Paper Shotgun", description: "PC gaming news", url: "https://www.rockpapershotgun.com/feed", category: "Gaming", icon: "🔫" },
    { name: "IGN", description: "Game reviews and news", url: "https://feeds.feedburner.com/ign/all", category: "Gaming", icon: "🔥" },
  ],
  "Lifestyle & Culture": [
    { name: "The Atlantic", description: "Culture, politics, and ideas", url: "https://feeds.feedburner.com/TheAtlantic", category: "Lifestyle & Culture", icon: "🌊" },
    { name: "Medium", description: "Stories and ideas", url: "https://medium.com/feed/top-stories", category: "Lifestyle & Culture", icon: "📝" },
    { name: "Lifehacker", description: "Productivity and life tips", url: "https://lifehacker.com/rss", category: "Lifestyle & Culture", icon: "💡" },
    { name: "Wait But Why", description: "Long-form articles on everything", url: "https://waitbutwhy.com/feed", category: "Lifestyle & Culture", icon: "🤔" },
    { name: "r/selfimprovement", description: "Self improvement community", url: "https://www.reddit.com/r/selfimprovement/.rss", category: "Lifestyle & Culture", icon: "🌱" },
  ],
};

export function getAllCuratedFeeds(): CuratedFeed[] {
  return Object.values(curatedFeedsByCategory).flat();
}

export function getRandomFeeds(count: number = 5): CuratedFeed[] {
  const all = getAllCuratedFeeds();
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getCategories(): string[] {
  return Object.keys(curatedFeedsByCategory);
}
