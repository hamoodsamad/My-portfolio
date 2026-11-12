import React from "react";
import { normalizeUrl } from "../utils/ui.js";

export default function ProjectCard({ project, index, isPreview = false }) {
  const displayNum = String(index + 1).padStart(2, "0");
  const href = normalizeUrl(project.link);
  const isExternal = href.startsWith("http");

  return (
    <a
      href={isPreview ? undefined : href}
      target={isExternal && !isPreview ? "_blank" : undefined}
      rel={isExternal && !isPreview ? "noopener noreferrer" : undefined}
      onClick={isPreview ? (e) => e.preventDefault() : undefined}
      className="marquee-card flex-shrink-0 w-[260px] sm:w-[320px] group bg-cardDark border border-borderDark rounded-xl p-3 sm:p-3.5 hover:border-accentCyan transition-all duration-300 block shadow-xl"
    >
      <div className="relative overflow-hidden rounded-lg bg-black aspect-[4/3] mb-3 sm:mb-4">
        <img
          src={
            project.image ||
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=700&q=80"
          }
          alt={project.title || "Project Preview"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-pitchBlack/85 border border-borderDark text-[8px] sm:text-[9px] uppercase tracking-wider text-accentCyan font-mono rounded">
          {project.category || "PROJECT"}
        </div>
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-pitchBlack/80 border border-accentCyan/40 text-[9px] uppercase tracking-wider text-titaniumWhite font-mono rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Open ↗
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-mono text-xs sm:text-sm font-bold text-accentCyan">
            {displayNum}
          </span>
          <h3 className="text-xs uppercase font-bold tracking-wider text-titaniumWhite group-hover:text-accentCyan transition-colors truncate">
            {project.title || "Untitled Project"}
          </h3>
        </div>
        <p className="text-[10px] sm:text-[11px] text-softSilver/75 truncate">
          {project.description || "Custom modern web experience"}
        </p>
      </div>
    </a>
  );
}
