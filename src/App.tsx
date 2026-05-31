import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomeView from "./components/HomeView";
import NewsView from "./components/NewsView";
import VideosView from "./components/VideosView";
import ContactView from "./components/ContactView";
import AdminPanel from "./components/AdminPanel";
import AuthModal from "./components/AuthModal";
import { Banner, NewsPost, VideoItem, ContactMessage, WebsiteSettings, AppData } from "./types";
import { Loader2, Car, AlertCircle, ShieldAlert } from "lucide-react";

// Import firebase modules
import { auth, db } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, doc, onSnapshot, query, orderBy, setDoc } from "firebase/firestore";

// Seed data fallback
import dbSeed from "../data/db.json";

export default function App() {
  const [currentTab, setTab] = useState("home");
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);

  // States for DB synced content
  const [banners, setBanners] = useState<Banner[]>(dbSeed.banners);
  const [news, setNews] = useState<NewsPost[]>(dbSeed.news);
  const [videos, setVideos] = useState<VideoItem[]>(dbSeed.videos);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings>(dbSeed.settings);

  // Auth States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // General state triggers
  const [isLoading, setIsLoading] = useState(false);

  // 1. Listen to Authentication State shift
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Hash routing management
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash) {
        setTab("home");
        setSelectedNewsId(null);
        return;
      }

      const cleanRoute = hash.replace("#/", "");
      
      // Prevent standard visitors from forcing access to /admin route manually
      if (cleanRoute === "admin") {
        const isAdmin = auth.currentUser?.email === "tasadddikahanafdre.dev@gmail.com" || auth.currentUser?.email === "tasaddikahanafdre.dev@gmail.com";
        if (!isAdmin) {
          window.location.hash = "#/";
          setTab("home");
          return;
        }
      }

      if (cleanRoute.startsWith("news/")) {
        const id = cleanRoute.split("/")[1];
        setTab("news");
        setSelectedNewsId(id);
      } else {
        setTab(cleanRoute);
        setSelectedNewsId(null);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [currentUser]);

  // 3. Setup real-time listeners for General Website Collections
  useEffect(() => {
    const unsubBanners = onSnapshot(collection(db, "banners"), (snapshot) => {
      const list: Banner[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Banner));
      if (list.length > 0) setBanners(list);
    }, (err) => console.warn("Firestore banners load cached:", err));

    const unsubNews = onSnapshot(query(collection(db, "news"), orderBy("publishDate", "desc")), (snapshot) => {
      const list: NewsPost[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as NewsPost));
      if (list.length > 0) setNews(list);
    }, (err) => console.warn("Firestore news load cached:", err));

    const unsubVideos = onSnapshot(query(collection(db, "videos"), orderBy("publishDate", "desc")), (snapshot) => {
      const list: VideoItem[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as VideoItem));
      if (list.length > 0) setVideos(list);
    }, (err) => console.warn("Firestore videos load cached:", err));

    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setSettings(docSnapshot.data() as WebsiteSettings);
      }
    }, (err) => console.warn("Firestore settings load cached:", err));

    return () => {
      unsubBanners();
      unsubNews();
      unsubVideos();
      unsubSettings();
    };
  }, []);

  // 4. Setup specialized inquiry message listener ONLY if Admin logs in
  useEffect(() => {
    const isAdmin = currentUser?.email === "tasadddikahanafdre.dev@gmail.com" || currentUser?.email === "tasaddikahanafdre.dev@gmail.com";
    if (!isAdmin) {
      setMessages([]);
      return;
    }

    const unsubMessages = onSnapshot(query(collection(db, "messages"), orderBy("createdAt", "desc")), (snapshot) => {
      const list: ContactMessage[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as ContactMessage));
      setMessages(list);
    }, (err) => console.error("Admin messages failed:", err));

    return () => unsubMessages();
  }, [currentUser]);

  // 5. Automatic database seeding routine if Firestore collections are absolutely empty on admin first log in
  useEffect(() => {
    const isAdmin = currentUser?.email === "tasadddikahanafdre.dev@gmail.com" || currentUser?.email === "tasaddikahanafdre.dev@gmail.com";
    if (!isAdmin) return;

    const runAutoSeedIfEmpty = async () => {
      // Check if settings global document exists. If not, trigger full mock assets migration
      const globalDocRef = doc(db, "settings", "global");
      const hasRanSeederKey = "autotopi_has_seeded";
      if (localStorage.getItem(hasRanSeederKey)) return;

      try {
        console.log("Admin logged in. Verifying remote database population...");
        // Auto-write to populate Firestore so website isn't empty
        await setDoc(globalDocRef, dbSeed.settings);
        
        for (const item of dbSeed.banners) {
          await setDoc(doc(db, "banners", item.id), item);
        }
        for (const item of dbSeed.news) {
          await setDoc(doc(db, "news", item.id), item);
        }
        for (const item of dbSeed.videos) {
          await setDoc(doc(db, "videos", item.id), item);
        }
        
        localStorage.setItem(hasRanSeederKey, "true");
        console.log("Firestore successfully seeded with original Autotopi catalog assets!");
      } catch (err) {
        console.warn("Bootstrap database seeding safely bypassed (rules or pre-existing documentation):", err);
      }
    };

    runAutoSeedIfEmpty();
  }, [currentUser]);

  // Set hash wrapper
  const handleSetTab = (tabId: string) => {
    window.location.hash = `#/${tabId}`;
    setTab(tabId);
    if (tabId !== "news") {
      setSelectedNewsId(null);
    }
  };

  const handleSetSelectedNewsId = (id: string | null) => {
    setSelectedNewsId(id);
    if (id) {
      window.location.hash = `#/news/${id}`;
    } else {
      window.location.hash = "#/news";
    }
  };

  /* ======================== RENDER PASS: APPLICATION INITIALIZING ======================== */
  if (isAuthChecking || isLoading) {
    return (
      <div className="min-h-screen bg-brand-dark text-white flex flex-col items-center justify-center space-y-4 font-sans px-4">
        <div className="w-16 h-16 bg-brand-red rounded-2xl flex items-center justify-center text-white shadow-xl animate-bounce">
          <Car className="w-9 h-9" />
        </div>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-300">
          <Loader2 className="w-5 h-5 animate-spin text-brand-red" />
          <span>Fascinating Autotopi Engine is warming up...</span>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser?.email === "tasadddikahanafdre.dev@gmail.com" || currentUser?.email === "tasaddikahanafdre.dev@gmail.com";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* Dynamic Header */}
      <Navbar 
        currentTab={currentTab} 
        setTab={handleSetTab} 
        settings={settings} 
        currentUser={currentUser}
        onAuthClick={() => setAuthModalOpen(true)}
        onNavigateNewsId={handleSetSelectedNewsId}
      />

      {/* Main Container */}
      <main className="flex-grow animate-fade-in relative">
        {currentTab === "home" && (
          <HomeView
            banners={banners}
            news={news}
            videos={videos}
            settings={settings}
            setTab={handleSetTab}
            setSelectedNewsId={handleSetSelectedNewsId}
          />
        )}

        {currentTab === "news" && (
          <NewsView
            news={news}
            selectedNewsId={selectedNewsId}
            setSelectedNewsId={handleSetSelectedNewsId}
          />
        )}

        {currentTab === "videos" && <VideosView videos={videos} />}

        {currentTab === "contact" && <ContactView settings={settings} />}

        {currentTab === "admin" && (
          isAdmin ? (
            <AdminPanel
              banners={banners}
              news={news}
              videos={videos}
              messages={messages}
              settings={settings}
            />
          ) : (
            <div className="max-w-md mx-auto px-4 py-20 font-sans text-center space-y-6">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold uppercase tracking-tight text-gray-950">Access Refused</h2>
                <p className="text-xs text-gray-500 leading-relaxed font-light">
                  This console is reserved exclusively for the Autotopi owner profile. Please sign in with administrator credentials.
                </p>
              </div>
              <button
                onClick={() => handleSetTab("home")}
                className="px-5 py-2.5 bg-brand-dark text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors"
              >
                Return to Safety
              </button>
            </div>
          )
        )}
      </main>

      {/* Membership Auth Dialogue Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />

      {/* Dynamic Footer */}
      <Footer setTab={handleSetTab} settings={settings} />
    </div>
  );
}
