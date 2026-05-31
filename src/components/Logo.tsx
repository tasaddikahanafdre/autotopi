import React from "react";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  theme?: "light" | "dark";
}

export default function Logo({ className = "h-11", showTagline = true, theme = "light" }: LogoProps) {
  const isDark = theme === "dark";
  
  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src="/logo.png"
        alt="Autotopi Logo"
        referrerPolicy="no-referrer"
        className={`h-full object-contain ${
          isDark 
            ? "bg-white px-3 py-1.5 rounded-lg shadow-md border border-gray-100/50" 
            : ""
        }`}
      />
    </div>
  );
}

