import React from "react";
import { MapPin, Phone, Mail, Youtube, Facebook, Instagram } from "lucide-react";
import { WebsiteSettings } from "../types";
import Logo from "./Logo";

interface FooterProps {
  setTab: (tab: string) => void;
  settings: WebsiteSettings;
}

export default function Footer({ setTab, settings }: FooterProps) {
  // Hidden easter egg to navigate to the secret admin desk
  const handleCopyrightDoubleClick = () => {
    // Navigate via standard hash router path triggers
    window.location.hash = "#/admin";
    setTab("admin");
  };

  return (
    <footer className="bg-brand-dark text-gray-300 pt-16 pb-8 border-t-4 border-brand-red font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand & Desc */}
          <div className="space-y-4">
            <div className="flex items-center cursor-pointer group" onClick={() => setTab("home")}>
              <Logo showTagline={true} theme="dark" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Autotopi is Bangladesh&apos;s leading automotive TV show and media production household, showcasing vehicle launches, exclusive reviews, road tests, and local motor events.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noreferrer referrer"
                className="w-9 h-9 rounded-full bg-gray-900 border border-gray-800 hover:border-red-600 hover:text-white flex items-center justify-center text-gray-400 transition-colors"
                title="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noreferrer referrer"
                className="w-9 h-9 rounded-full bg-gray-900 border border-gray-800 hover:border-blue-600 hover:text-white flex items-center justify-center text-gray-400 transition-colors"
                title="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer referrer"
                className="w-9 h-9 rounded-full bg-gray-900 border border-gray-800 hover:border-pink-600 hover:text-white flex items-center justify-center text-gray-400 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base tracking-wider uppercase mb-6 relative pb-2">
              QUICK NAVIGATION
              <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-brand-red" />
            </h3>
            <ul className="space-y-3.5 text-sm">
              {[
                { label: "Home Base", id: "home" },
                { label: "Automotive News", id: "news" },
                { label: "Video Episodes", id: "videos" },
                { label: "Submit Inquiries", id: "contact" }
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => {
                      setTab(link.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-brand-red transition-colors flex items-center gap-1 cursor-pointer text-left font-medium"
                  >
                    <span className="text-brand-red mr-1">›</span> {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-white font-bold text-base tracking-wider uppercase mb-6 relative pb-2">
              CONTACT INFORMATION
              <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-brand-red" />
            </h3>
            <div className="space-y-4 text-sm text-gray-400">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-gray-200 font-semibold text-xs uppercase tracking-wide">Head Office Address</h4>
                  <p className="mt-1 leading-relaxed text-gray-400 font-anek">
                    {settings.address || "House 44, Kayes Vobon (2nd Floor), Road: Kazi Nazrul Islam Avenue, Dhaka, Bangladesh."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-gray-200 font-semibold text-xs uppercase tracking-wide">24/7 Helpline</h4>
                    <p className="mt-1 leading-relaxed font-semibold text-gray-300">
                      <a href={`tel:${settings.helpline}`} className="hover:text-brand-red transition-colors">
                        {settings.helpline || "+880 1882-201114"}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-gray-200 font-semibold text-xs uppercase tracking-wide">Email Desk</h4>
                    <p className="mt-1 leading-relaxed text-gray-300 truncate">
                      <a href={`mailto:${settings.email}`} className="hover:text-brand-red transition-colors">
                        {settings.email || "autotopibd@gmail.com"}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner Area */}
        <div className="border-t border-gray-900 pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <p 
            onDoubleClick={handleCopyrightDoubleClick}
            className="select-none cursor-help hover:text-brand-red transition-colors duration-500 text-center sm:text-left"
            title="Double-click to access secret admin deck"
          >
            {settings.copyright || "© 2026 AUTOTOPI. All Rights Reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
}
