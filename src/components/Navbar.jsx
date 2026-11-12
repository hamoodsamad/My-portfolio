import React, { useState } from "react";

export default function Navbar({ activeSection, onOpenContact }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: "hero", label: "Home" },
    { id: "about", label: "About" },
    { id: "projects", label: "Portfolio" },
    { id: "skills", label: "Skills" },
    { id: "services", label: "Services" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 bg-pitchBlack/80 backdrop-blur-lg w-full border-b border-borderDark/60 z-30">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-16 py-4 sm:py-5 flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-2.5 sm:gap-3.5 group">
          <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center border border-accentCyan/40 bg-cardDark/70 group-hover:border-accentCyan transition-all duration-300 flex-shrink-0">
            <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-titaniumWhite group-hover:text-accentCyan transition-colors">
              H<span className="text-accentCyan italic">S</span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-titaniumWhite text-[11px] sm:text-xs uppercase tracking-widest font-bold">
              Hamood Samad
            </span>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-ultra text-softSilver/70 mt-0.5 font-medium">
              Web Designer &amp; Dev
            </span>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs uppercase tracking-wider font-medium">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-link pb-1 transition-all ${
                activeSection === item.id ? "active-nav-link" : ""
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => onOpenContact("Responsive Web Design")}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full border border-accentCyan/40 bg-cardDark hover:border-accentCyan hover:bg-accentCyan/10 text-titaniumWhite text-[11px] sm:text-xs uppercase tracking-wider font-medium transition-all duration-300"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accentCyan"></span>
            Let's Talk
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg border border-borderDark bg-cardDark text-softSilver hover:text-accentCyan focus:outline-none"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileOpen}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-4 sm:px-10 pt-3 pb-4 border-t border-borderDark/60 flex flex-col gap-2 text-xs uppercase tracking-wider font-medium bg-deepSpace/95">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMobileOpen(false)}
              className={`py-1.5 ${
                activeSection === item.id
                  ? "text-accentCyan"
                  : "text-softSilver hover:text-accentCyan"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
