import React, { useState, useEffect } from "react";
import { Bell, Info, X, Zap, Calendar, ArrowRight } from "lucide-react";
import { db } from "../firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";

export interface InAppNotification {
  id: string;
  title: string;
  text: string;
  type: string; // "news" | "video" | "banner" | etc.
  createdAt: string;
}

interface NotificationToastAndTrayProps {
  onNavigateTab: (tabId: string) => void;
  onNavigateNewsId: (id: string | null) => void;
}

export default function NotificationToastAndTray({ 
  onNavigateTab, 
  onNavigateNewsId 
}: NotificationToastAndTrayProps) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [activeToast, setActiveToast] = useState<InAppNotification | null>(null);
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    const notifyCollection = collection(db, "notifications");
    const q = query(notifyCollection, orderBy("createdAt", "desc"), limit(25));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: InAppNotification[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as InAppNotification);
      });

      if (fetched.length > 0) {
        // Find if there is a brand new notification that was just added (if it's not the initial loaded list)
        if (!isFirstLoad) {
          const currentNewest = fetched[0];
          // If we have a newer ID than the previous stored state
          if (notifications.length === 0 || currentNewest.id !== notifications[0].id) {
            setActiveToast(currentNewest);
            setUnreadCount((prev) => prev + 1);

            // Automatically hide toast after 6 seconds
            const timer = setTimeout(() => {
              setActiveToast(null);
            }, 6000);
            return () => clearTimeout(timer);
          }
        } else {
          setIsFirstLoad(false);
          // Set unread count based on current loaded items (say, standard default count)
          setUnreadCount(Math.min(fetched.length, 2));
        }
      }
      setNotifications(fetched);
    }, (error) => {
      console.error("Failed to snapshot notifications: ", error);
    });

    return () => unsubscribe();
  }, [isFirstLoad, notifications]);

  const handleNotificationClick = (item: InAppNotification) => {
    setIsTrayOpen(false);
    setActiveToast(null);
    
    if (item.type === "news") {
      onNavigateTab("news");
      // If of format news:newsId
      if (item.id && !item.id.startsWith("notif-")) {
        onNavigateNewsId(item.id);
      }
    } else if (item.type === "video") {
      onNavigateTab("videos");
    } else {
      onNavigateTab("home");
    }
  };

  const clearUnread = () => {
    setUnreadCount(0);
    setIsTrayOpen(!isTrayOpen);
  };

  return (
    <div className="relative font-sans">
      
      {/* Bell Trigger Button */}
      <button
        onClick={clearUnread}
        className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors text-brand-dark hover:text-brand-red cursor-pointer"
        title="In-app Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-brand-red text-white text-[9.5px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Slide-out Tray */}
      <AnimatePresence>
        {isTrayOpen && (
          <>
            {/* Click-outside backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsTrayOpen(false)} 
            />
            
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-150 rounded-2xl shadow-2xl z-50 overflow-hidden text-left"
            >
              <div className="p-4 bg-brand-dark text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <h4 className="text-xs font-black tracking-widest uppercase">Autotopi Broadcasts</h4>
                </div>
                <button 
                  onClick={() => setIsTrayOpen(false)} 
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 space-y-1">
                    <Info className="w-8 h-8 mx-auto text-gray-300 mb-1" />
                    <p className="text-xs font-medium">No system broadcasts yet.</p>
                    <p className="text-[10px] text-gray-400 leading-normal font-light">Updates published by administrators appear instantly here.</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                          item.type === "news" 
                            ? "bg-red-50 text-red-650 border border-red-100" 
                            : item.type === "video" 
                              ? "bg-blue-50 text-blue-650 border border-blue-105" 
                              : "bg-gray-100 text-gray-700 border border-gray-150"
                        }`}>
                          {item.type}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-405 font-mono">
                          <Calendar className="w-3 h-3" />
                          <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-bold text-gray-900 group-hover:text-brand-red transition-colors line-clamp-1">{item.title}</h5>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-light line-clamp-2">{item.text}</p>
                      </div>

                      <div className="flex justify-end pt-1">
                        <span className="text-[9px] font-bold text-red-655 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                          <span>Explore</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Slide-in Top-Right Live In-App Toast */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: 0, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            className="fixed top-6 right-6 z-[9999] w-full max-w-sm bg-white border border-l-8 border-l-brand-red border-gray-205 rounded-xl shadow-2xl p-4 flex items-start gap-3.5 animate-slide-in font-sans cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleNotificationClick(activeToast)}
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-brand-red animate-pulse">
              <Zap className="w-4 h-4 fill-brand-red" />
            </div>
            
            <div className="flex-grow space-y-1 pr-4">
              <span className="text-[9px] font-black uppercase tracking-widest bg-brand-red/10 text-brand-red px-1.5 py-0.5 rounded">
                NEW {activeToast.type}
              </span>
              <h5 className="text-xs font-black text-gray-900 leading-tight pr-2 line-clamp-1">
                {activeToast.title}
              </h5>
              <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                {activeToast.text}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveToast(null);
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-black p-0.5 hover:bg-gray-100 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
