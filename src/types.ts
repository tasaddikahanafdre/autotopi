export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

export interface NewsPost {
  id: string;
  title: string;
  content: string; // Markdown or Rich HTML
  excerpt: string;
  category: string;
  imageUrl: string;
  publishDate: string;
  author: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeId: string; // Extracted ID
  publishDate: string;
}

export interface ServiceItem {
  id: string;
  iconName: string; // Lucide icon identifier
  title: string;
  description: string;
  images: string[]; // Gallery URLs
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface WebsiteSettings {
  logoText: string;
  tagline: string;
  address: string;
  helpline: string;
  email: string;
  youtubeUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  copyright: string;
  adminPasswordHash?: string; // We'll handle authentication
}

export interface AppData {
  banners: Banner[];
  news: NewsPost[];
  videos: VideoItem[];
  services: ServiceItem[];
  messages: ContactMessage[];
  settings: WebsiteSettings;
}
