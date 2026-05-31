import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Banner } from "../types";

interface HeroSliderProps {
  banners: Banner[];
  setTab: (tab: string) => void;
}

export default function HeroSlider({ banners, setTab }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) {
    return (
      <div className="h-[400px] sm:h-[550px] w-full bg-gray-900 flex items-center justify-center text-white">
        <p className="font-semibold text-lg">No active banners. Add some from the Admin panel.</p>
      </div>
    );
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleCtaClick = (link: string) => {
    if (link.startsWith("/")) {
      const tabName = link.replace("/", "");
      setTab(tabName);
    } else {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="relative w-full h-[450px] sm:h-[580px] bg-black overflow-hidden group">
      {/* Slides Container */}
      {banners.map((banner, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={banner.id || index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-102"
            } transform duration-[2000ms]`}
          >
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/55 to-transparent z-10" />
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="w-full h-full object-cover object-center transform transition-transform duration-[6000ms]"
              referrerPolicy="no-referrer"
            />

            {/* Slide Content */}
            <div className="absolute inset-x-0 bottom-0 top-0 z-20 flex items-center px-4 sm:px-12 lg:px-24">
              <div className="max-w-2xl text-white space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 rounded text-[10px] sm:text-xs font-black uppercase tracking-widest animate-pulse">
                  <span>★ HOT AUTO SHOW</span>
                </div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-sans text-white leading-tight uppercase">
                  {banner.title}
                </h1>
                <p className="text-sm sm:text-lg text-gray-200 leading-relaxed max-w-xl font-light">
                  {banner.subtitle}
                </p>
                <div className="pt-2 sm:pt-4">
                  <button
                    onClick={() => handleCtaClick(banner.ctaLink)}
                    className="px-6 py-3 bg-red-600 hover:bg-white text-white hover:text-red-600 font-bold text-xs sm:text-sm uppercase tracking-wider rounded border border-red-600 shadow-lg hover:shadow-red-900/30 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    {banner.ctaText || "Explore Now"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Manual Slideshow Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-black/40 hover:bg-red-600 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-black/40 hover:bg-red-600 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Bottom Slider Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3.5 sm:w-8 h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex ? "bg-red-600 w-6 sm:w-12" : "bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
