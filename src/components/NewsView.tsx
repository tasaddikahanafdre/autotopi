import React, { useState, useEffect } from "react";
import { Search, Calendar, User, ChevronLeft, Share2, Facebook, Twitter, Copy, Check } from "lucide-react";
import { NewsPost } from "../types";

interface NewsViewProps {
  news: NewsPost[];
  selectedNewsId: string | null;
  setSelectedNewsId: (id: string | null) => void;
}

export default function NewsView({ news, selectedNewsId, setSelectedNewsId }: NewsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-scroll on single view change
  useEffect(() => {
    if (selectedNewsId) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedNewsId]);

  // Extract list of all unique categories from publications
  const categories = ["ALL", ...Array.from(new Set(news.map((item) => item.category?.toUpperCase() || "GENERAL")))];

  // Filter posts
  const filteredPosts = news.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());

    const postCat = post.category?.toUpperCase() || "GENERAL";
    const matchesCategory = selectedCategory === "ALL" || postCat === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const activePost = news.find((post) => post.id === selectedNewsId);

  // Get related posts (excluding active post, matching category)
  const relatedPosts = activePost
    ? news
        .filter((post) => post.id !== activePost.id && (post.category === activePost.category))
        .slice(0, 3)
    : [];

  const handleShareCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Simple, elegant custom markdown parser inside React to avoid external package bloat
  const renderMarkdownContent = (text: string) => {
    if (!text) return null;
    const paragraphs = text.split("\n\n");

    return (
      <div className="news-article-content text-gray-700 space-y-4">
        {paragraphs.map((p, pIdx) => {
          const trimmed = p.trim();
          if (!trimmed) return null;

          // Headers ### High
          if (trimmed.startsWith("### ")) {
            return <h3 key={pIdx} className="text-xl font-bold font-anek mt-6 mb-2 text-gray-900">{trimmed.replace("### ", "")}</h3>;
          }
          if (trimmed.startsWith("## ")) {
            return <h2 key={pIdx} className="text-2xl font-black font-anek mt-8 mb-3 text-gray-900">{trimmed.replace("## ", "")}</h2>;
          }
          if (trimmed.startsWith("# ")) {
            return <h1 key={pIdx} className="text-3xl font-black font-anek mt-10 mb-4 text-gray-900">{trimmed.replace("# ", "")}</h1>;
          }

          // Bullet lists - item
          if (trimmed.startsWith("- ")) {
            const listItems = trimmed.split("\n").map((line) => line.trim().replace("- ", ""));
            return (
              <ul key={pIdx} className="list-disc pl-6 space-y-2 my-4 text-gray-700">
                {listItems.map((item, lIdx) => {
                  // check for bold markers **text** inside list item
                  return <li key={lIdx}>{renderInlineStyling(item)}</li>;
                })}
              </ul>
            );
          }

          return <p key={pIdx} className="leading-relaxed text-base font-light text-gray-700">{renderInlineStyling(trimmed)}</p>;
        })}
      </div>
    );
  };

  // inline styling helpers for bolding e.g. **text**
  const renderInlineStyling = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    if (parts.length === 1) return text;
    return parts.map((part, idx) => (idx % 2 === 1 ? <strong key={idx} className="font-extrabold text-gray-950">{part}</strong> : part));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {activePost ? (
        /* ======================== SINGLE NEWS READER VIEW ======================== */
        <div className="max-w-4xl mx-auto">
          {/* Back Action */}
          <button
            onClick={() => setSelectedNewsId(null)}
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-red hover:text-brand-dark mb-6 cursor-pointer uppercase transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to News Archive</span>
          </button>

          {/* Article Header Card */}
          <div className="space-y-4 mb-8">
            <span className="inline-block px-3 py-1 bg-brand-red text-white font-black text-xs uppercase tracking-wider">
              {activePost.category || "General"}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#1A1A1A] leading-tight uppercase font-anek">
              {activePost.title}
            </h1>
            
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pt-2 border-y border-gray-200 py-3">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-brand-red" />
                {new Date(activePost.publishDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <User className="w-4 h-4 text-brand-red" />
                Authored by <strong className="text-brand-dark">{activePost.author || "Autotopi Crew"}</strong>
              </span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative aspect-video overflow-hidden bg-brand-dark mb-10 shadow-sm border border-gray-200">
            <img
              src={activePost.imageUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80"}
              alt={activePost.title}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Content & Sharing grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Main Content Body */}
            <div className="lg:col-span-3 space-y-6">
              {renderMarkdownContent(activePost.content)}

              {/* Share utilities footer */}
              <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Please Share This News</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(`https://web.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank")}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-bold rounded cursor-pointer transition-colors"
                  >
                    <Facebook className="w-4 h-4 text-white" />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={handleShareCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded cursor-pointer transition-colors border border-gray-200"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                    <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar with related articles */}
            <div className="space-y-6">
              <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-3">
                RELATED ON AUTOTOPI
              </h3>
              {relatedPosts.length === 0 ? (
                <p className="text-xs text-gray-400">No other articles in this category currently.</p>
              ) : (
                <div className="space-y-4">
                  {relatedPosts.map((rPost) => (
                    <div
                      key={rPost.id}
                      onClick={() => setSelectedNewsId(rPost.id)}
                      className="group cursor-pointer space-y-2 border-b border-gray-200 pb-3 last:border-0"
                    >
                      <div className="aspect-video bg-brand-dark border border-gray-200 overflow-hidden h-24">
                        <img
                          src={rPost.imageUrl}
                          alt={rPost.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                          refPolicy="no-referrer"
                          loading="lazy"
                        />
                      </div>
                      <h4 className="text-xs font-black text-brand-dark uppercase line-clamp-2 leading-snug group-hover:text-brand-red transition-colors">
                        {rPost.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono block">
                        {new Date(rPost.publishDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ======================== ARCHIVE / LIST VIEW ======================== */
        <div className="space-y-10">
          {/* Header titles */}
          <div className="border-b-2 border-brand-red pb-4">
            <h1 className="text-3xl sm:text-5xl font-black text-brand-dark uppercase tracking-tight">
              AUTOMOTIVE NEWS DESK
            </h1>
            <p className="text-gray-500 mt-2 text-sm max-w-xl font-light">
              Explore professional launches, industry reviews, motor chronicles, and in-depth specs reported directly from Bangladesh.
            </p>
          </div>

          {/* Filtering Utilities Search & Action tags */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 border border-gray-200 p-4">
            {/* Category selection */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-none text-xs font-bold tracking-wider uppercase cursor-pointer transition-all ${
                    selectedCategory === cat
                      ? "bg-brand-red text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Searching Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 focus:outline-none focus:border-brand-red rounded-none text-gray-800 shadow-inner"
              />
              <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
            </div>
          </div>

          {/* Posts grid */}
          {filteredPosts.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-16 text-center text-gray-500 border border-gray-100">
              No matching articles found based on criteria. Try searching other categories.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => setSelectedNewsId(post.id)}
                  className="bg-white overflow-hidden border border-gray-200 hover:border-brand-red shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer"
                >
                  {/* Category overlay */}
                  <div className="relative h-48 overflow-hidden bg-[#1A1A1A] shrink-0">
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

                  {/* Main descriptions area */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3.5 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-red" />
                        {new Date(post.publishDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-brand-red" />
                        {post.author || "Staff"}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-brand-dark leading-snug group-hover:text-brand-red transition-colors line-clamp-2 uppercase font-anek tracking-tight">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-500 text-sm mt-3.5 leading-relaxed line-clamp-3 font-light">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-brand-red group-hover:text-brand-dark">
                      <span>READ ARTICLE &rarr;</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
