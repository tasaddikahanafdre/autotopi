import React, { useState } from "react";
import { Search, Play, ExternalLink } from "lucide-react";
import { VideoItem } from "../types";

interface VideosViewProps {
  videos: VideoItem[];
}

export default function VideosView({ videos }: VideosViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Search filter
  const filteredVideos = videos.filter((video) => {
    return video.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans animate-fade-in">
      {/* Page Header */}
      <div className="border-b-2 border-brand-red pb-4 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-brand-dark uppercase tracking-tight">
            AUTOTOPI EPISODES
          </h1>
          <p className="text-gray-500 mt-2 text-sm max-w-xl font-light">
            Browse our full catalog of YouTube video releases, vehicle walkthroughs, and test drive specials. Click any episode card to play directly on YouTube.
          </p>
        </div>

        {/* Searching bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search episodes..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 focus:outline-none focus:border-brand-red rounded-none text-gray-800 shadow-inner"
          />
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
        </div>
      </div>

      {/* Main Grid View */}
      {filteredVideos.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-16 text-center text-gray-500 border border-gray-100">
          No matching videos found. Modify your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => window.open(video.youtubeUrl, "_blank", "noopener,noreferrer")}
              className="bg-white overflow-hidden border border-gray-200 hover:border-brand-red shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-[#1A1A1A] overflow-hidden shrink-0">
                <img
                  src={
                    video.youtubeId
                      ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
                      : "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&auto=format&fit=crop&q=80"
                  }
                  alt={video.title}
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                
                {/* Watch Play Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 flex items-center justify-center transition-colors duration-300">
                  <div className="w-14 h-14 bg-brand-red text-white rounded-full flex items-center justify-center transform transition-transform group-hover:scale-110 shadow-lg">
                    <Play className="w-5 h-5 fill-current text-white translate-x-0.5" />
                  </div>
                </div>
              </div>

              {/* Caption details - Only Title */}
              <div className="p-5 flex flex-col flex-grow justify-between">
                <h3 className="font-extrabold text-brand-dark text-base sm:text-lg tracking-tight leading-snug line-clamp-2 uppercase group-hover:text-brand-red transition-colors">
                  {video.title}
                </h3>
                
                <div className="mt-4 pt-4 border-t border-gray-150 flex items-center justify-between text-xs font-bold text-brand-red">
                  <span className="group-hover:translate-x-1 transition-transform font-bold uppercase">WATCH ON YOUTUBE &rarr;</span>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-brand-red" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
