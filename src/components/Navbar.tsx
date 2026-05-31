import React, { useState } from "react";
import { Menu, X, Youtube, Facebook, Headphones, Shield, LogIn, LogOut, User } from "lucide-react";
import { WebsiteSettings } from "../types";
import Logo from "./Logo";
import NotificationToastAndTray from "./NotificationToastAndTray";
import { auth } from "../firebase";

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  settings: WebsiteSettings;
  currentUser: any;
  onAuthClick: () => void;
  onNavigateNewsId: (id: string | null) => void;
}

export default function Navbar({ 
  currentTab, 
  setTab, 
  settings, 
  currentUser, 
  onAuthClick,
  onNavigateNewsId
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const baseItems = [
    { id: "home", label: "HOME", labelBn: "নীড়" },
    { id: "news", label: "NEWS", labelBn: "খবর" },
    { id: "videos", label: "VIDEOS", labelBn: "ভিডিও" },
    { id: "contact", label: "CONTACT", labelBn: "যোগাযোগ" },
  ];

  // Dynamically append Admin Panel ONLY for the official admin email
  const isAdmin = currentUser && (currentUser.email === "tasadddikahanafdre.dev@gmail.com" || currentUser.email === "tasaddikahanafdre.dev@gmail.com");
  
  const navItems = isAdmin 
    ? [...baseItems, { id: "admin", label: "ADMIN PANEL", labelBn: "অ্যাডমিন প্যানেল" }]
    : baseItems;

  const handleNavClick = (id: string) => {
    setTab(id);
    setMobileMenuOpen(false);
  };

  const getUserInitials = () => {
    if (!currentUser?.email) return "U";
    return currentUser.email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b-4 border-brand-red shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Brand click targets index */}
          <div 
            onClick={() => handleNavClick("home")}
            className="flex items-center cursor-pointer group animate-fade-in"
          >
            <Logo showTagline={true} theme="light" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-1 lg:gap-1.5 Items-center">
            {navItems.map((item) => {
              const isActive = currentTab === item.id || (item.id === "news" && currentTab.startsWith("news"));
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3 py-1.5 rounded text-xs font-black tracking-widest transition-all duration-200 uppercase flex flex-col items-center ${
                    item.id === "admin" 
                      ? "text-red-600 bg-red-50 border border-red-200 hover:bg-red-100" 
                      : isActive
                        ? "text-brand-red bg-brand-red/5"
                        : "text-brand-dark hover:text-brand-red hover:bg-gray-50 bg-transparent"
                  }`}
                >
                  <span className="block font-sans">{item.label}</span>
                  <span className="block text-[8.5px] text-gray-400 font-anek font-light -mt-0.5">
                    {item.labelBn}
                  </span>
                  {isActive && item.id !== "admin" && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.75 bg-brand-red rounded" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Utilities with real-time Notifications & Auth */}
          <div className="hidden md:flex items-center gap-3.5">
            
            {/* Realtime In-App Notifications Dropdown Bell */}
            <NotificationToastAndTray 
              onNavigateTab={handleNavClick} 
              onNavigateNewsId={onNavigateNewsId} 
            />

            <div className="h-6 w-px bg-gray-200 mx-0.5" />

            {/* Social Medias */}
            <a
              href={settings.youtubeUrl}
              target="_blank"
              rel="noreferrer referrer"
              className="p-1 px-1.5 text-gray-405 hover:text-brand-red transition-colors"
              title="YouTube"
            >
              <Youtube className="w-5 h-5" />
            </a>
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noreferrer referrer"
              className="p-1 px-1.5 text-gray-405 hover:text-blue-600 transition-colors mr-1"
              title="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>

            {/* Authentication Action Link */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div 
                  className="w-8.5 h-8.5 rounded-full bg-brand-dark text-white flex items-center justify-center text-xs font-black tracking-wider border border-gray-100" 
                  title={`Logged in as ${currentUser.email}`}
                >
                  {getUserInitials()}
                </div>
                <button
                  onClick={() => auth.signOut()}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-brand-red rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 hover:border-brand-red hover:bg-brand-red/5 rounded-lg text-xs font-bold text-gray-700 hover:text-brand-red transition-all duration-200 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>SIGN IN</span>
              </button>
            )}

          </div>

          {/* Mobile hamburger items */}
          <div className="flex md:hidden items-center gap-2">
            <NotificationToastAndTray 
              onNavigateTab={handleNavClick} 
              onNavigateNewsId={onNavigateNewsId} 
            />
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg animate-fade-in px-4 py-3 pb-5 space-y-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id || (item.id === "news" && currentTab.startsWith("news"));
              return (
                <button
                  key={item.id}
                  id={`nav-item-mobile-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-extrabold tracking-widest flex items-center justify-between ${
                    item.id === "admin"
                      ? "text-red-650 bg-red-50 border border-red-105"
                      : isActive
                        ? "text-brand-red bg-brand-red/5"
                        : "text-brand-dark hover:bg-gray-50"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] text-gray-400 font-anek font-light">
                    {item.labelBn}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-gray-100 pt-4 flex flex-col gap-4">
            {/* Auth section */}
            {currentUser ? (
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center text-xs font-black">
                    {getUserInitials()}
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-gray-400">Account Active</p>
                    <p className="text-xs text-gray-900 truncate max-w-[150px]">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    auth.signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-bold rounded-lg text-red-600 cursor-pointer hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onAuthClick();
                }}
                className="w-full py-3 bg-red-600 text-white rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer shadow"
              >
                <LogIn className="w-4 h-4" />
                <span>Join / Sign In</span>
              </button>
            )}

            <div className="flex justify-between items-center px-2">
              <div className="flex gap-4">
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  className="p-1 px-1.5 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                </a>
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  className="p-1 px-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
              <a
                href={`tel:${settings.helpline}`}
                className="text-[11px] font-black text-red-600 hover:underline"
              >
                Helpline: {settings.helpline}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
