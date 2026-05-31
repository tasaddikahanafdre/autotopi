import React, { useState, useEffect } from "react";
import { 
  db, 
  storage, 
  auth 
} from "../firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { 
  Settings as SettingsIcon, 
  Image as ImageIcon, 
  FileText, 
  Video as VideoIcon, 
  Mail, 
  UploadCloud, 
  Copy, 
  Check, 
  Trash2, 
  Plus, 
  Save, 
  Layout, 
  Bell, 
  Loader2, 
  LogOut,
  TrendingUp
} from "lucide-react";
import { Banner, NewsPost, VideoItem, ContactMessage, WebsiteSettings } from "../types";

interface AdminPanelProps {
  banners: Banner[];
  news: NewsPost[];
  videos: VideoItem[];
  messages: ContactMessage[];
  settings: WebsiteSettings;
  onRefreshData?: () => void; // Unused but kept for signature safety
}

export default function AdminPanel({
  banners,
  news,
  videos,
  messages,
  settings
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"settings" | "banners" | "news" | "videos" | "messages">("settings");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // States for Image Upload
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Edit / Input States
  const [settingsForm, setSettingsForm] = useState<WebsiteSettings>({ ...settings });
  
  // Banner creation state
  const [newBanner, setNewBanner] = useState<Omit<Banner, "id">>({
    imageUrl: "",
    title: "",
    subtitle: "",
    ctaText: "Read Story",
    ctaLink: "/news"
  });

  // News creation state
  const [newNews, setNewNews] = useState<Omit<NewsPost, "id">>({
    title: "",
    excerpt: "",
    content: "",
    category: "Launches",
    imageUrl: "",
    publishDate: new Date().toISOString(),
    author: "Autotopi Newsdesk"
  });

  // Video creation state
  const [newVideo, setNewVideo] = useState<Omit<VideoItem, "id">>({
    title: "",
    description: "",
    youtubeUrl: "",
    youtubeId: "",
    publishDate: new Date().toISOString().substring(0, 10)
  });

  // News delete safety prompt
  const [newsToDelete, setNewsToDelete] = useState<string | null>(null);

  // Update Settings Form when props load
  useEffect(() => {
    if (settings) {
      setSettingsForm({ ...settings });
    }
  }, [settings]);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Helper, parse youtube info
  function getYoutubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : "";
  }

  // --- Broadcast Trigger helper ---
  const sendRealtimeNotification = async (title: string, text: string, type: string, linkedId: string) => {
    try {
      const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await setDoc(doc(db, "notifications", linkedId || notifId), {
        id: linkedId || notifId,
        title,
        text,
        type,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Failed to post notification:", e);
    }
  };

  // 1. SAVE WEBSITE CONFIG
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "settings", "global"), settingsForm);
      showFeedback("success", "Global Autotopi configurations saved instantly in Firestore!");
    } catch (err: any) {
      showFeedback("error", `Settings update failed: ${err.message}`);
    }
  };

  // 2. ADD CAROUSEL SLIDE
  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.imageUrl || !newBanner.title) {
      showFeedback("error", "Slide needs an image URL and headline title.");
      return;
    }
    try {
      const id = `banner-${Date.now()}`;
      await setDoc(doc(db, "banners", id), {
        id,
        ...newBanner
      });
      setNewBanner({
        imageUrl: "",
        title: "",
        subtitle: "",
        ctaText: "Read Story",
        ctaLink: "/news"
      });
      showFeedback("success", "Premium home carousel banner slide added!");
      await sendRealtimeNotification(
        "New Homepage Promo",
        `New featured content is now online: ${newBanner.title}`,
        "banner",
        id
      );
    } catch (err: any) {
      showFeedback("error", `Failed to add slide: ${err.message}`);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm("Remove this carousel slide?")) return;
    try {
      await deleteDoc(doc(db, "banners", id));
      showFeedback("success", "Slide successfully cleared.");
    } catch (err: any) {
      showFeedback("error", `Purge failed: ${err.message}`);
    }
  };

  // 3. PUBLISH AUTOMOTIVE NEWS
  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNews.title || !newNews.content || !newNews.imageUrl) {
      showFeedback("error", "News requires a headline title, content markdown text, and a cover image graphics URL.");
      return;
    }
    try {
      const id = `news-${Date.now()}`;
      const payload: NewsPost = {
        id,
        ...newNews,
        publishDate: new Date().toISOString()
      };
      await setDoc(doc(db, "news", id), payload);
      setNewNews({
        title: "",
        excerpt: "",
        content: "",
        category: "Launches",
        imageUrl: "",
        publishDate: new Date().toISOString(),
        author: "Autotopi Newsdesk"
      });
      showFeedback("success", "Premium news article has been securely published to Autotopi!");
      
      // Trigger notification alert
      await sendRealtimeNotification(
        "New Article Published",
        `${payload.category}: ${payload.title}`,
        "news",
        id
      );
    } catch (err: any) {
      showFeedback("error", `News generation failed: ${err.message}`);
    }
  };

  const handleDeleteNews = async (id: string) => {
    try {
      await deleteDoc(doc(db, "news", id));
      // Try to delete corresponding notification if any
      try { await deleteDoc(doc(db, "notifications", id)); } catch(e){}
      showFeedback("success", "News post successfully deleted from the portal.");
      setNewsToDelete(null);
    } catch (err: any) {
      showFeedback("error", `Delete failed: ${err.message}`);
    }
  };

  // 4. ADD EXQUISITE REVIEW VIDEO LINK
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = getYoutubeId(newVideo.youtubeUrl);
    if (!newVideo.title || !newVideo.youtubeUrl) {
      showFeedback("error", "Please provide a video title and full browser YouTube URL.");
      return;
    }
    if (!ytId) {
      showFeedback("error", "Could not parse YouTube ID from URL. Ensure format is like youtube.com/watch?v=... or youtu.be/...");
      return;
    }
    try {
      const id = `video-${Date.now()}`;
      const payload: VideoItem = {
        id,
        ...newVideo,
        youtubeId: ytId
      };
      await setDoc(doc(db, "videos", id), payload);
      setNewVideo({
        title: "",
        description: "",
        youtubeUrl: "",
        youtubeId: "",
        publishDate: new Date().toISOString().substring(0, 10)
      });
      showFeedback("success", "Official video review added and synchronized!");
      
      await sendRealtimeNotification(
        "New Video Release",
        `Watch: ${payload.title}`,
        "video",
        id
      );
    } catch (err: any) {
      showFeedback("error", `Failed to add video record: ${err.message}`);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm("Purge this video asset linkage?")) return;
    try {
      await deleteDoc(doc(db, "videos", id));
      try { await deleteDoc(doc(db, "notifications", id)); } catch(e){}
      showFeedback("success", "Video cleared.");
    } catch (err: any) {
      showFeedback("error", `Purge failed: ${err.message}`);
    }
  };

  // 5. INQUIRIES RESPONSE MANAGEMENT
  const handleToggleMessageState = async (id: string, currentStatus: "pending" | "completed") => {
    try {
      const next: "pending" | "completed" = currentStatus === "pending" ? "completed" : "pending";
      await updateDoc(doc(db, "messages", id), { status: next });
      showFeedback("success", `Message updated to status: ${next.toUpperCase()}`);
    } catch (err: any) {
      showFeedback("error", `Update failed: ${err.message}`);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message log permanently?")) return;
    try {
      await deleteDoc(doc(db, "messages", id));
      showFeedback("success", "Message safely cleared.");
    } catch (err: any) {
      showFeedback("error", `Delete failed: ${err.message}`);
    }
  };

  // 6. CLIENT UPLOAD TO FIREBASE STORAGE
  const handleUploadToStorage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingFile) {
      showFeedback("error", "Please drag or select an image file first.");
      return;
    }
    setIsUploading(true);
    try {
      // Create folder ref
      const imageRef = ref(storage, `uploads/images/${Date.now()}-${uploadingFile.name}`);
      const uploadedValue = await uploadBytes(imageRef, uploadingFile);
      const downloadUrl = await getDownloadURL(uploadedValue.ref);
      
      setUploadedUrls((prev) => [downloadUrl, ...prev]);
      setUploadingFile(null);
      showFeedback("success", "Cover graphics uploaded to Firebase Storage and indexed!");
      const fileInput = document.getElementById("admin-graphics-uploader") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      console.error(err);
      showFeedback("error", `Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-gray-800">
      
      {/* Admin Panel Header */}
      <div className="bg-gradient-to-r from-brand-dark to-gray-900 text-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-red-650 text-white font-black px-3 py-1 rounded-full uppercase tracking-widest leading-none">
              Verified Administrator Profile
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">Autotopi Database Dashboard</h2>
          <p className="text-gray-300 text-xs font-light tracking-wide max-w-xl">
            You are logged in as <b className="text-red-500 font-semibold">{auth.currentUser?.email}</b>. Live synchronization and rules security are handled dynamically by Google Fire Cloud database.
          </p>
        </div>
        <button
          onClick={() => auth.signOut()}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-650 hover:bg-black rounded-lg text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Admin Modus</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Controller Tabs + Media Library */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm space-y-1.5 flex flex-col">
            <h3 className="text-[11px] font-black tracking-wider text-gray-400 uppercase px-3 mb-2">Management Panels</h3>
            
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-3 px-3 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                activeTab === "settings" ? "bg-red-50 text-brand-red font-black" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <SettingsIcon className="w-4 h-4 text-gray-444" />
              <span>Platform Info</span>
            </button>

            <button
              onClick={() => setActiveTab("banners")}
              className={`flex items-center gap-3 px-3 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                activeTab === "banners" ? "bg-red-50 text-brand-red font-black" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ImageIcon className="w-4 h-4 text-gray-444" />
              <span>Home Carousel</span>
            </button>

            <button
              onClick={() => setActiveTab("news")}
              className={`flex items-center gap-3 px-3 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                activeTab === "news" ? "bg-red-50 text-brand-red font-black" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FileText className="w-4 h-4 text-gray-444" />
              <span>Reviews & News</span>
            </button>

            <button
              onClick={() => setActiveTab("videos")}
              className={`flex items-center gap-3 px-3 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                activeTab === "videos" ? "bg-red-50 text-brand-red font-black" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <VideoIcon className="w-4 h-4 text-gray-444" />
              <span>Video Reviews</span>
            </button>

            <button
              onClick={() => setActiveTab("messages")}
              className={`flex items-center gap-3 px-3 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                activeTab === "messages" ? "bg-red-50 text-brand-red font-black" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Mail className="w-4 h-4 text-gray-444" />
              <span>Visitor Inquiries</span>
              {messages.filter(m => m.status === "pending").length > 0 && (
                <span className="ml-auto w-5 h-5 bg-red-600 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                  {messages.filter(m => m.status === "pending").length}
                </span>
              )}
            </button>
          </div>

          {/* Core Storage Graphics Upload Widget */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-[11px] font-black tracking-wider text-gray-900 uppercase flex items-center gap-1.5">
              <UploadCloud className="w-4.5 h-4.5 text-red-600" />
              <span>Cloud Storage Library</span>
            </h4>
            <p className="text-[11px] font-light leading-relaxed text-gray-405">
              Select or drop any image file to host on Firebase High-Speed Storage, then copy its web address reference to use in post headers!
            </p>
            
            <form onSubmit={handleUploadToStorage} className="space-y-3">
              <input
                id="admin-graphics-uploader"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setUploadingFile(e.target.files[0]);
                  }
                }}
                className="w-full text-xs text-gray-444 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
              />
              <button
                type="submit"
                disabled={isUploading || !uploadingFile}
                className="w-full py-2 bg-brand-dark hover:bg-brand-red text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Launch Asset Upload</span>
                )}
              </button>
            </form>

            {/* Media Upload list view */}
            {uploadedUrls.length > 0 && (
              <div className="pt-3 border-t border-gray-150 space-y-2">
                <span className="text-[9.5px] font-bold text-gray-600 uppercase tracking-widest block">Session Uploads</span>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
                  {uploadedUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-1.5 border border-gray-100 rounded-lg bg-gray-50 gap-2">
                      <img src={url} className="w-8 h-8 rounded object-cover flex-shrink-0" alt="Preupload" />
                      <div className="flex-grow min-w-0">
                        <p className="text-[9.5px] truncate text-gray-400">...{url.substring(url.length - 20)}</p>
                      </div>
                      <button
                        onClick={() => handleCopyUrl(url, idx)}
                        className="p-1 px-1.5 text-[9px] font-bold bg-white border border-gray-200 rounded text-red-655 hover:bg-red-50 flex items-center gap-0.5 cursor-pointer"
                        title="Copy image link address"
                      >
                        {copiedIndex === idx ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIndex === idx ? "Copied" : "Link"}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Admin Tab Form */}
        <div className="lg:col-span-3 space-y-6">
          
          {feedback && (
            <div className={`p-4 rounded-2xl text-xs font-bold text-center border animate-fade-in ${
              feedback.type === "success" 
                ? "bg-green-50 text-green-600 border-green-200" 
                : "bg-red-50 text-red-650 border-red-200"
            }`}>
              {feedback.text}
            </div>
          )}

          {/* TAB 1: WEBSITE GLOBAL SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-gray-150 pb-4">
                <h3 className="text-base font-black tracking-tight text-gray-950 uppercase flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-red-600" />
                  <span>Platform System Configurations</span>
                </h3>
                <p className="text-gray-400 text-xs font-light mt-0.5">Control the footer and contacts information across the website dynamically.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest block">Logo Brand Title</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.logoText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logoText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest block">Helpline Number</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.helpline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, helpline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest block">Website Tagline</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest block">Corporate Address</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest block">Publishing Email</label>
                  <input
                    type="email"
                    required
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest block">YouTube URL</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.youtubeUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, youtubeUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest block">Facebook Page URL</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.facebookUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest block">Instagram Handle URL</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.instagramUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest block">Copyright Text</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.copyright}
                    onChange={(e) => setSettingsForm({ ...settingsForm, copyright: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                
                <div className="md:col-span-2 pt-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-red-650 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg flex items-center gap-1.5 cursor-pointer shadow transition-all active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Overwrite Configurations</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: CAROUSEL HERO SLIDER */}
          {activeTab === "banners" && (
            <div className="space-y-6">
              
              {/* Slide Generator Form */}
              <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="border-b border-gray-150 pb-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-red-600" />
                  <h4 className="text-sm font-black uppercase tracking-tight text-gray-900">Add Hero Promo Poster Slide</h4>
                </div>

                <form onSubmit={handleAddBanner} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9.5px] font-bold text-gray-700 uppercase tracking-widest block">Image URL (Public address or Storage Url)</label>
                    <input
                      type="text"
                      required
                      placeholder="https://firestoreUrl..."
                      value={newBanner.imageUrl}
                      onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9.5px] font-bold text-gray-700 uppercase tracking-widest block">Slide Bold Heading</label>
                    <input
                      type="text"
                      required
                      placeholder="Premier Automotive platform"
                      value={newBanner.title}
                      onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9.5px] font-bold text-gray-700 uppercase tracking-widest block">Slide Supporting Subheading</label>
                    <input
                      type="text"
                      placeholder="Brief review or content descriptive tagline text"
                      value={newBanner.subtitle}
                      onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-gray-700 uppercase tracking-widest block">Action Button Text</label>
                    <input
                      type="text"
                      required
                      placeholder="Read Story"
                      value={newBanner.ctaText}
                      onChange={(e) => setNewBanner({ ...newBanner, ctaText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-gray-700 uppercase tracking-widest block">Action Button Redirect Tab</label>
                    <input
                      type="text"
                      required
                      placeholder="news or videos"
                      value={newBanner.ctaLink}
                      onChange={(e) => setNewBanner({ ...newBanner, ctaLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-red-650 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-1.5 cursor-pointer transition-all hover:shadow active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Inject Carousel Slide</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Slider list */}
              <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-4">
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 block pb-1 border-b border-gray-100">Currently Mounted Carousel Slides ({banners.length})</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {banners.map((item) => (
                    <div key={item.id} className="border border-gray-150 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                      <img src={item.imageUrl} alt="banner-prev" className="w-full h-32 object-cover" />
                      <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                        <div className="space-y-1">
                          <h5 className="font-bold text-xs truncate max-w-full text-gray-900">{item.title}</h5>
                          <p className="text-[10px] text-gray-434 line-clamp-2">{item.subtitle}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1.5">
                          <span className="text-[9px] font-mono text-gray-405">{item.id}</span>
                          <button
                            onClick={() => handleDeleteBanner(item.id)}
                            className="p-1 px-2.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Purge</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WRITE AND PUBLISH VEHICLE NEWS */}
          {activeTab === "news" && (
            <div className="space-y-6">
              
              {/* Creator Form */}
              <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="border-b border-gray-150 pb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  <h4 className="text-sm font-black uppercase tracking-tight text-gray-900">Publish Interactive News or Automobile Review</h4>
                </div>

                <form onSubmit={handleAddNews} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9.5px] font-bold text-gray-700 uppercase tracking-widest block">Article Title / Headline</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suzuki Hybrid Wagon debuts in Dhaka"
                      value={newNews.title}
                      onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9.5px] font-bold text-gray-700 uppercase tracking-widest block">Cover Image Graphics URL (Copy from Library on left)</label>
                    <input
                      type="text"
                      required
                      placeholder="https://firebasestorage.googleapis.com..."
                      value={newNews.imageUrl}
                      onChange={(e) => setNewNews({ ...newNews, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-gray-700 uppercase tracking-widest block">Author Tag</label>
                    <input
                      type="text"
                      required
                      value={newNews.author}
                      onChange={(e) => setNewNews({ ...newNews, author: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-gray-700 uppercase tracking-widest block">Channel Category</label>
                    <select
                      value={newNews.category}
                      onChange={(e) => setNewNews({ ...newNews, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    >
                      <option value="Launches">Launches & Releases</option>
                      <option value="Reviews">Thorough Reviews</option>
                      <option value="Industry Insight">Industry Insight</option>
                      <option value="Event logs">Events & Rallies</option>
                    </select>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9.5px] font-bold text-gray-700 uppercase tracking-widest block">Short Preview Excerpt</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter a brief, juicy summary line for news indexes..."
                      value={newNews.excerpt}
                      onChange={(e) => setNewNews({ ...newNews, excerpt: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[9.5px] font-bold text-gray-700 uppercase tracking-widest block">Markdown Article Body Content</label>
                      <span className="text-[9px] text-gray-400 font-medium tracking-wide">Supports standard bolding, dashes list, blocks</span>
                    </div>
                    <textarea
                      required
                      rows={10}
                      placeholder="Write your beautiful markdown-formatted editorial content details here..."
                      value={newNews.content}
                      onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-red-650 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Transmit Article to Live Broadcast</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* News database logs with customized single deletion */}
              <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-4">
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 block pb-1 border-b border-gray-100">Manage Published News Catalog ({news.length})</span>
                
                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {news.map((item) => (
                    <div key={item.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <img src={item.imageUrl} alt="headline" className="w-16 h-12 object-cover rounded-md flex-shrink-0 border border-gray-100" />
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase bg-red-50 text-red-650 px-1.5 py-0.5 rounded">{item.category}</span>
                            <span className="text-[9.5px] text-gray-400 font-mono">{new Date(item.publishDate).toLocaleDateString()}</span>
                          </div>
                          <h5 className="font-extrabold text-xs text-gray-900 truncate pr-4">{item.title}</h5>
                          <p className="text-[10px] text-gray-434 truncate font-light leading-relaxed">{item.excerpt}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNewsToDelete(item.id)}
                        className="p-2 bg-red-50 hover:bg-red-150 rounded-xl text-red-600 transition-colors flex-shrink-0 cursor-pointer"
                        title="Delete News Post"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))}
                  {news.length === 0 && (
                    <p className="p-8 text-center text-xs text-gray-400">0 news blogs published currently in Firestore-Autotopi.</p>
                  )}
                </div>
              </div>

              {/* News precise delete confirmation dialogue box modal */}
              {newsToDelete && (
                <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white max-w-sm w-full p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-2xl space-y-6 animate-fade-in font-sans">
                    <div className="text-center space-y-2">
                      <Trash2 className="w-12 h-12 text-red-600 mx-auto animate-bounce" />
                      <h4 className="text-sm font-black uppercase text-gray-900 tracking-wide">Revoke Digital Coverage?</h4>
                      <p className="text-xs text-gray-500 font-light leading-normal">
                        Are you sure you want to remove the selected news story from the Autotopi portal? This action cannot be undone.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setNewsToDelete(null)}
                        className="flex-grow py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 uppercase text-[10px] font-black tracking-widest rounded-xl cursor-pointer"
                      >
                        Abort
                      </button>
                      <button
                        onClick={() => handleDeleteNews(newsToDelete)}
                        className="flex-grow py-2.5 bg-red-600 hover:bg-black text-white uppercase text-[10px] font-black tracking-widest rounded-xl transition-all cursor-pointer"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: ADD EXQUISITE REVIEW VIDEO LINK */}
          {activeTab === "videos" && (
            <div className="space-y-6">
              
              {/* Creator Form */}
              <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="border-b border-gray-150 pb-3 flex items-center gap-2">
                  <VideoIcon className="w-5 h-5 text-red-600" />
                  <h4 className="text-sm font-black uppercase tracking-tight text-gray-900">Add YouTube Video Video Episode</h4>
                </div>

                <form onSubmit={handleAddVideo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9.5px] font-bold text-gray-700 uppercase tracking-widest block">Video Title Headline</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Brand New Land Cruiser 2026 In-depth Drive!"
                      value={newVideo.title}
                      onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9.5px] font-bold text-gray-700 uppercase tracking-widest block">YouTube URL</label>
                    <input
                      type="text"
                      required
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={newVideo.youtubeUrl}
                      onChange={(e) => setNewVideo({ ...newVideo, youtubeUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9.5px] font-bold text-gray-700 uppercase tracking-widest block">Short Clip Description</label>
                    <input
                      type="text"
                      placeholder="Summarize key features evaluated in the video..."
                      value={newVideo.description}
                      onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-red-650 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Sync Video Release</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Video List */}
              <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-4">
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 block pb-1 border-b border-gray-100">Currently Active Video Linkages ({videos.length})</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.map((item) => (
                    <div key={item.id} className="border border-gray-150 rounded-xl p-3 flex gap-3 h-28 hover:shadow-sm">
                      <div className="w-28 bg-gray-105 rounded-lg overflow-hidden flex-shrink-0 relative">
                        <img src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`} className="w-full h-full object-cover" alt="prev-thumbnail" />
                      </div>
                      <div className="flex-grow min-w-0 flex flex-col justify-between">
                        <div>
                          <h6 className="font-extrabold text-xs text-gray-900 truncate leading-tight pr-1">{item.title}</h6>
                          <p className="text-[9.5px] text-gray-434 line-clamp-2 mt-0.5">{item.description}</p>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-gray-50">
                          <span className="text-[9px] font-mono text-gray-400">{item.youtubeId}</span>
                          <button
                            onClick={() => handleDeleteVideo(item.id)}
                            className="p-1 px-2.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-[9.5px] font-bold flex items-center gap-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: VISITOR CONTACT INQUIRIES */}
          {activeTab === "messages" && (
            <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="border-b border-gray-150 pb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-red-600" />
                <h4 className="text-sm font-black uppercase tracking-tight text-gray-900">Reader Contact Inquiries Directory</h4>
              </div>

              <div className="space-y-4 max-h-[550px] overflow-y-auto custom-scrollbar pr-1.5">
                {messages.length === 0 ? (
                  <p className="p-8 text-center text-xs text-gray-400">0 customer inquiries submitted in dynamic database currently.</p>
                ) : (
                  messages.map((item) => (
                    <div
                      key={item.id}
                      className={`p-5 rounded-2xl border text-xs space-y-3.5 hover:shadow-sm transition-all ${
                        item.status === "completed" 
                          ? "bg-gray-50/50 border-gray-150/60 opacity-80" 
                          : "bg-red-50/15 border-red-100"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-gray-900">{item.name}</span>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                              item.status === "completed" ? "bg-gray-200 text-gray-600" : "bg-red-600 text-white"
                            }`}>
                              {item.status === "completed" ? "Reviewed" : "Unread Inquiry"}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-405 font-mono">
                            <span>Email: <b className="font-semibold text-gray-600">{item.email}</b></span>
                            <span className="mx-2">•</span>
                            <span>Phone: <b className="font-semibold text-gray-600">{item.phone || "N/A"}</b></span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleToggleMessageState(item.id, item.status)}
                            className={`p-1.5 px-3 rounded-lg text-[10px] font-extrabold uppercase tracking-wide cursor-pointer flex items-center gap-1 border ${
                              item.status === "completed" 
                                ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50" 
                                : "bg-red-650 hover:bg-red-750 text-white border-red-650"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{item.status === "completed" ? "Re-open" : "Mark Reviewed"}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteMessage(item.id)}
                            className="p-1.5 bg-white border border-gray-250 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer"
                            title="Delete Inquiry Log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="bg-white/80 p-3.5 border border-gray-100 rounded-xl space-y-1">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Subject: {item.subject}</span>
                        <p className="text-[11.5px] leading-relaxed text-gray-800 whitespace-pre-line font-light">{item.message}</p>
                      </div>

                      <div className="flex justify-between items-center text-[9.5px] text-gray-400 font-mono">
                        <span>ID: {item.id}</span>
                        <span>Received at: {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
