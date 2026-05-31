import React from "react";
import { ChevronRight, Calendar, User, Play, Award, Globe, Zap, Settings2, Sparkles, Youtube, Facebook } from "lucide-react";
import HeroSlider from "./HeroSlider";
import { Banner, NewsPost, VideoItem, ServiceItem, WebsiteSettings } from "../types";

// Dynamic Lucide icon lookup helper
import * as Icons from "lucide-react";

interface HomeViewProps {
  banners: Banner[];
  news: NewsPost[];
  videos: VideoItem[];
  settings: WebsiteSettings;
  setTab: (tab: string) => void;
  setSelectedNewsId: (id: string | null) => void;
}

export default function HomeView({
  banners,
  news,
  videos,
  settings,
  setTab,
  setSelectedNewsId,
}: HomeViewProps) {
  // Take latest 6 news posts
  const latestNews = [...news]
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 6);

  // Take latest 4 videos
  const latestVideos = [...videos].slice(0, 4);

  const handleNewsClick = (id: string) => {
    setSelectedNewsId(id);
    setTab("news");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-16 pb-16 font-sans">
      {/* 1. HERO SLIDER */}
      <HeroSlider banners={banners} setTab={setTab} />

      {/* Brand Intro Badge area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-30">
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-600 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-sm tracking-wide uppercase">Leading TV Platform</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Bangladesh&apos;s premium automotive showcase bringing national broadcasts and extreme web specials.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 border-t md:border-t-0 md:border-x border-gray-100 pt-6 md:pt-0 md:px-6">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-600 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-sm tracking-wide uppercase">Hot Launch Reviews</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Honest, exhaustively detailed test drives under real-world Bangladeshi traffic and weather conditions.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 border-t md:border-t-0 pt-6 md:pt-0">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-600 shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-sm tracking-wide uppercase">Massive Reach</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Active, dynamic communities across YouTube, Facebook & Instagram bringing fans closer to the action.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LATEST NEWS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end border-b-2 border-brand-red pb-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-brand-red rounded-full" />
              <p className="text-xs text-brand-red font-extrabold tracking-widest uppercase">STAY UPDATED</p>
            </div>
            <h2 className="text-2xl sm:text-3.5xl font-black tracking-tight text-brand-dark uppercase mt-1">
              LATEST AUTOMOTIVE NEWS
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedNewsId(null);
              setTab("news");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-1 text-xs font-bold text-brand-red hover:text-brand-dark transition-colors uppercase cursor-pointer"
          >
            <span>View All News</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {latestNews.length === 0 ? (
          <div className="bg-gray-100/50 rounded p-12 text-center text-gray-500 border border-gray-200">
            No news articles posted yet. Populate them in the Admin portal!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestNews.map((post) => (
              <article
                key={post.id}
                onClick={() => handleNewsClick(post.id)}
                className="bg-white overflow-hidden border border-gray-200 hover:border-brand-red shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer"
              >
                {/* Image Wrap */}
                <div className="relative h-48 overflow-hidden bg-gray-900 shrink-0">
                  <img
                    src={post.imageUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80"}
                    alt={post.title}
                    className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-103"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-brand-red text-white font-black text-[10px] uppercase px-3 py-1 tracking-wider shadow">
                    {post.category || "General"}
                  </div>
                </div>

                {/* Info Area */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3.5">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-brand-red" />
                      {new Date(post.publishDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-brand-red" />
                      {post.author || "Newsdesk"}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-brand-dark leading-snug group-hover:text-brand-red transition-colors line-clamp-2 uppercase tracking-tight">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-500 text-sm mt-3 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-brand-red">
                    <span className="group-hover:translate-x-1.5 transition-transform duration-300 block">
                      READ FULL ARTICLE &rarr;
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 4. LATEST VIDEOS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end border-b-2 border-brand-red pb-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-brand-red rounded-full" />
              <p className="text-xs text-brand-red font-extrabold tracking-widest uppercase">EPISODES & SHORTS</p>
            </div>
            <h2 className="text-2xl sm:text-3.5xl font-black tracking-tight text-brand-dark uppercase mt-1">
              LATEST VIDEO EMISSIONS
            </h2>
          </div>
          <button
            onClick={() => {
              setTab("videos");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-1 text-xs font-bold text-brand-red hover:text-brand-dark transition-colors uppercase cursor-pointer"
          >
            <span>View All Videos</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {latestVideos.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-500 border border-gray-100">
            No videos uploaded yet. Populate them in the Admin portal!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {latestVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => {
                  setTab("videos");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-white overflow-hidden border border-gray-200 hover:border-brand-red shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
              >
                {/* Thumbnail Wrap */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden">
                  <img
                    src={
                      video.youtubeId
                        ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
                        : "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80"
                    }
                    alt={video.title}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-103"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 top-0 bg-black/35 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-14 h-14 bg-brand-red text-white rounded-full flex items-center justify-center shadow-lg transform transition-all group-hover:scale-110">
                      <Play className="w-6 h-6 fill-current text-white translate-x-0.5" />
                    </div>
                  </div>
                </div>

                {/* Info Text */}
                <div className="p-6">
                  <span className="text-[10px] text-gray-400 font-mono tracking-widest block uppercase mb-1">
                    YouTube Exclusive • {video.publishDate}
                  </span>
                  <h3 className="font-extrabold text-brand-dark text-base sm:text-lg tracking-tight leading-snug line-clamp-2 uppercase group-hover:text-brand-red transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-gray-500 text-xs mt-2 line-clamp-2 font-light">
                    {video.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
