import React, { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import ContactModal from "../components/ContactModal.jsx";
import ToastContainer from "../components/ToastContainer.jsx";
import RewriteText from "../components/RewriteText.jsx";
import SocialLinks from "../components/SocialLinks.jsx";
import { fetchProjects } from "../utils/api.js";
import {
  initCursorFollower,
  initScrollProgress,
  initScrollReveal,
} from "../utils/ui.js";

const ABOUT_METRICS = [
  { value: "100%", label: "Responsive", delay: "reveal-delay-150" },
  { value: "<1s", label: "Fast Execution", delay: "reveal-delay-250" },
  { value: "Clean", label: "Maintainable Code", delay: "reveal-delay-350" },
];

const ABOUT_CARDS = [
  {
    eyebrow: "My Philosophy",
    title: "Visual Elegance × Peak Performance",
    description:
      "A good website shouldn't just look visually astonishing; it must function effortlessly on every screen from smartphones to 4K monitors.",
  },
  {
    eyebrow: "Location & Work",
    title: "Global Reach, Precise Execution",
    description:
      "Operating from Pakistan and collaborating with businesses, startups, and clients internationally to elevate their digital footprint.",
  },
];

const SKILLS = [
  {
    name: "HTML / HTML5",
    sub: "Semantic & Modern Standards",
    pct: "100%",
    barClass: "skill-bar-100",
  },
  {
    name: "CSS / Tailwind",
    sub: "Responsive Systems",
    pct: "100%",
    barClass: "skill-bar-100",
  },
  {
    name: "JavaScript / React JSX",
    sub: "Modular ES6+ & Interactive UI",
    pct: "90%",
    barClass: "skill-bar-90",
  },
  {
    name: "Node.js & PHP",
    sub: "Backend APIs & Fast Responses",
    pct: "85%",
    barClass: "skill-bar-85",
  },
];

const CLIENT_EXPERIENCE_PILLARS = [
  {
    num: "01",
    title: "Responsive Web Design",
    description:
      "You will get pixel-accurate, mobile-first layouts engineered to adapt effortlessly across smartphones, tablets, laptops, and 4K displays.",
    tags: "Mobile-First • Fluid Grids • Cross-Browser",
    iconPath:
      "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    num: "02",
    title: "Clean & Maintainable Code",
    description:
      "You will receive modular, well-structured, and maintainable code architecture so your website remains effortless to scale, update, and hand off.",
    tags: "Modular Components • Scalable • Best Practices",
    iconPath: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  },
  {
    num: "03",
    title: "Modern Web Development",
    description:
      "Built with React JSX, Node.js, and PHP backends for ultra-fast API responses, strong SEO foundations, and dependable real-world performance.",
    tags: "React JSX • Node.js • PHP • High Speed",
    iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    num: "04",
    title: "User-Friendly & Interactive Experiences",
    description:
      "Thoughtful micro-interactions, intuitive navigation, and purposeful animations that engage visitors and turn traffic into loyal clients.",
    tags: "Interactive UI • Motion Design • UX Clarity",
    iconPath:
      "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
  },
];

export default function PortfolioApp() {
  const [projects, setProjects] = useState([]);
  const [backendEngine, setBackendEngine] = useState("Connecting...");
  const [marqueePaused, setMarqueePaused] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(
    "Responsive Web Design",
  );
  const [showSecretLock, setShowSecretLock] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [metricTicks, setMetricTicks] = useState(() =>
    ABOUT_METRICS.map(() => 0),
  );
  const [aboutCardTicks, setAboutCardTicks] = useState(() =>
    ABOUT_CARDS.map(() => 0),
  );
  const [skillTicks, setSkillTicks] = useState(() =>
    [...SKILLS, ...SKILLS].map(() => 0),
  );
  const [serviceTicks, setServiceTicks] = useState(() =>
    CLIENT_EXPERIENCE_PILLARS.map(() => 0),
  );

  const bumpTick = (setter, index) => {
    setter((prev) => prev.map((val, i) => (i === index ? val + 1 : val)));
  };

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  useEffect(() => {
    fetchProjects().then(({ projects: loaded, engine }) => {
      setProjects(loaded);
      setBackendEngine(engine);
    });
  }, []);

  useEffect(() => {
    const stopProgress = initScrollProgress();
    const stopReveal = initScrollReveal();
    const stopCursor = initCursorFollower();

    const sections = document.querySelectorAll("section[id]");
    const onScrollSpy = () => {
      const scrollY = window.scrollY + 180;
      sections.forEach((sec) => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (scrollY >= top && scrollY < top + height) {
          setActiveSection(sec.getAttribute("id"));
        }
      });
    };
    window.addEventListener("scroll", onScrollSpy, { passive: true });

    return () => {
      stopProgress();
      stopReveal();
      stopCursor();
      window.removeEventListener("scroll", onScrollSpy);
    };
  }, []);

  const openContact = (serviceName = "Responsive Web Design") => {
    setSelectedService(serviceName);
    setModalOpen(true);
  };

  return (
    <>
      <div id="scrollProgressBar" className="scroll-progress-bar"></div>
      <div id="cyan-cursor-glow"></div>
      <div id="cyan-cursor-ring"></div>
      <div id="cyan-cursor-dot"></div>
      <ToastContainer toasts={toasts} />

      {/* Top Status Bar */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-16 pt-3 sm:pt-5 pb-2 flex flex-col sm:flex-row justify-between items-center gap-2 text-[9px] sm:text-[10px] tracking-mega text-softSilver/70 uppercase relative z-20 text-center sm:text-left">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accentCyan animate-ping"></span>
          EDITION // NEXT-GEN DIGITAL EXPERIENCES ({backendEngine})
        </span>
        <span className="inline-flex items-center gap-2 text-accentCyan">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          AVAILABLE FOR FREELANCE &amp; COMMISSIONS
        </span>
      </div>

      <Navbar activeSection={activeSection} onOpenContact={openContact} />

      {/* Hero Section */}
      <section
        id="hero"
        className="relative w-full hero-banner-bg min-h-[520px] sm:min-h-[600px] lg:min-h-[680px] flex items-center overflow-hidden border-b border-borderDark/40"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-pitchBlack via-pitchBlack/90 sm:via-pitchBlack/65 to-transparent z-10 pointer-events-none"></div>

        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-16 py-10 sm:py-16 relative z-20">
          <div className="max-w-xl lg:max-w-2xl space-y-5 sm:space-y-6 text-left">
            <div className="flex items-center gap-3 reveal-up">
              <span className="w-8 sm:w-10 h-[2px] bg-accentCyan"></span>
              <span className="text-[10px] sm:text-xs uppercase tracking-ultra text-accentCyan font-semibold">
                Hello, I'm
              </span>
            </div>

            <div className="space-y-2 reveal-up reveal-delay-100">
              <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-extrabold text-titaniumWhite tracking-tight uppercase leading-none font-body break-words">
                Hamood{" "}
                <span className="bg-gradient-to-r from-accentCyan to-accentBlue bg-clip-text text-transparent">
                  Samad
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-mega text-softSilver font-semibold pt-1">
                WEB DESIGNER &amp; DEVELOPER
              </p>
            </div>

            <p className="text-xs sm:text-sm text-softSilver/90 font-light leading-relaxed max-w-lg reveal-up reveal-delay-200">
              I build modern, high-converting digital experiences that blend
              creativity, clean maintainable code, and strategy to help brands
              stand out and scale effortlessly.
            </p>

            <div className="pt-1 reveal-up reveal-delay-300">
              <div className="font-signature text-3xl sm:text-4xl text-accentCyan -rotate-2 select-none">
                Hamood Samad
              </div>
              <div className="text-[8px] sm:text-[9px] uppercase tracking-ultra text-softSilver/70 font-mono mt-1">
                HAMOOD SAMAD
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 reveal-up reveal-delay-400">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-accentCyan to-accentBlue text-pitchBlack font-bold text-[11px] sm:text-xs uppercase tracking-wider hover:opacity-90 transition-all duration-300 shadow-xl shadow-accentCyan/20 group"
              >
                <span>View Portfolio</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </a>
              <a
                href="#about"
                className="inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full border border-borderDark bg-cardDark/80 hover:border-accentCyan text-titaniumWhite font-semibold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-300 backdrop-blur-md"
              >
                <span>Explore Profile</span>
              </a>
            </div>

            {/* Upwork, Fiverr & GitHub Links */}
            <div className="pt-2 reveal-up reveal-delay-400">
              <SocialLinks compact />
            </div>
          </div>
        </div>
      </section>

      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-16 overflow-hidden relative z-10">
        {/* About Section */}
        <section
          id="about"
          className="py-12 sm:py-16 lg:py-20 border-b border-borderDark/60"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 reveal-left">
              <div className="flex items-center gap-3">
                <span className="w-8 h-[2px] bg-accentCyan"></span>
                <span className="text-[11px] sm:text-xs uppercase tracking-ultra text-accentCyan font-mono font-semibold">
                  BIOGRAPHY // WHO I AM
                </span>
              </div>

              <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold text-titaniumWhite tracking-tight uppercase leading-tight font-body">
                Crafting Purpose-Driven <br />
                <span className="bg-gradient-to-r from-accentCyan to-accentBlue bg-clip-text text-transparent">
                  Digital Realities
                </span>
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-softSilver/90 font-light leading-relaxed">
                I am{" "}
                <strong className="text-titaniumWhite font-semibold">
                  Hamood Samad
                </strong>
                , a dedicated Web Designer &amp; Developer based in Pakistan.
                With a keen eye for aesthetics and a passion for clean,
                maintainable code, I engineer modern web experiences that bridge
                the gap between human intuition and technical excellence.
              </p>

              <p className="text-xs sm:text-sm text-softSilver/80 font-light leading-relaxed">
                Whether building high-converting landing pages or crafting
                user-friendly, interactive experiences, my approach remains
                simple: prioritize speed, guarantee 100% responsiveness across
                every device, and build with scalability in mind.
              </p>

              <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 pt-2">
                {ABOUT_METRICS.map((metric, idx) => (
                  <div
                    key={metric.label}
                    onMouseEnter={() => bumpTick(setMetricTicks, idx)}
                    className={`bg-cardDark/80 border border-borderDark hover:border-accentCyan/70 p-4 rounded-xl text-center sm:text-left reveal-scale ${metric.delay} interactive-card cursor-default`}
                  >
                    <span className="block text-accentCyan font-mono text-xl sm:text-2xl font-bold">
                      <RewriteText
                        text={metric.value}
                        trigger={metricTicks[idx]}
                        duration={1050}
                      />
                    </span>
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-softSilver/80 mt-1 block font-medium">
                      <RewriteText
                        text={metric.label}
                        trigger={metricTicks[idx]}
                        duration={1150}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4 reveal-right">
              {ABOUT_CARDS.map((card, idx) => (
                <div
                  key={card.eyebrow}
                  onMouseEnter={() => bumpTick(setAboutCardTicks, idx)}
                  className="bg-cardDark/60 border border-borderDark p-5 sm:p-7 rounded-2xl relative overflow-hidden backdrop-blur-sm group hover:border-accentCyan/60 transition-all duration-300 interactive-card cursor-default"
                >
                  <div className="text-[10px] sm:text-xs uppercase font-mono tracking-ultra text-accentCyan mb-2">
                    <RewriteText
                      text={card.eyebrow}
                      trigger={aboutCardTicks[idx]}
                      duration={1050}
                    />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-titaniumWhite mb-2 group-hover:text-accentCyan transition-colors">
                    <RewriteText
                      text={card.title}
                      trigger={aboutCardTicks[idx]}
                      duration={1200}
                    />
                  </h3>
                  <p
                    key={`about-desc-${idx}-${aboutCardTicks[idx]}`}
                    className={`text-xs text-softSilver/80 leading-relaxed font-light ${
                      aboutCardTicks[idx] > 0 ? "service-recreate-desc" : ""
                    }`}
                  >
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Table of Contents */}
        <section id="toc" className="my-8 sm:my-14 reveal-up">
          <div className="relative bg-cardDark/60 border border-borderDark/80 rounded-2xl p-5 sm:p-10 lg:p-12 overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="lg:col-span-4 space-y-3 sm:space-y-4 sm:pr-4">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-titaniumWhite tracking-tight uppercase leading-none font-body">
                  Table of
                  <br />
                  Contents
                </h2>
                <div className="flex items-center gap-2 text-accentCyan">
                  <span className="inline-block transform rotate-45 text-xs">
                    ◆
                  </span>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-ultra text-softSilver font-semibold">
                    Directory
                  </span>
                </div>
                <p className="text-xs text-softSilver/80 leading-relaxed font-light">
                  Explore tailored services, selected work, technical
                  proficiency, and initiate direct collaboration.
                </p>
              </div>

              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-4 sm:gap-y-6 sm:border-l sm:border-borderDark sm:pl-8 lg:pl-10">
                {[
                  { num: "01", title: "About Me", href: "#about" },
                  { num: "02", title: "Selected Work", href: "#projects" },
                  { num: "03", title: "Technical Skills", href: "#skills" },
                  {
                    num: "04",
                    title: "Services & Experience",
                    href: "#services",
                  },
                ].map((row) => (
                  <a
                    key={row.num}
                    href={row.href}
                    className="group flex items-center justify-between py-2 border-b border-borderDark/60 hover:border-accentCyan transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-lg sm:text-xl font-bold text-accentCyan">
                        {row.num}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-titaniumWhite group-hover:text-accentCyan transition-colors">
                        {row.title}
                      </span>
                    </div>
                    <span className="text-xs text-softSilver group-hover:text-accentCyan group-hover:translate-x-1 transition-all">
                      →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Selected Projects Marquee */}
        <section
          id="projects"
          className="py-10 sm:py-14 border-t border-borderDark/60 overflow-hidden w-full reveal-up"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-titaniumWhite tracking-tight uppercase font-body">
                Selected Work
              </h2>
              <div className="w-8 sm:w-12 h-[1px] bg-accentCyan/40"></div>
            </div>
            <button
              type="button"
              onClick={() => setMarqueePaused((p) => !p)}
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-full border border-borderDark bg-cardDark/80 hover:border-accentCyan text-[10px] uppercase tracking-wider font-mono text-softSilver hover:text-accentCyan transition-colors"
            >
              {marqueePaused ? "Resume Motion" : "Pause Motion"}
            </button>
          </div>

          <div className="marquee-wrapper py-2">
            <div
              className={`marquee-track-l2r ${
                marqueePaused ? "marquee-track-paused" : ""
              }`}
            >
              {[...projects, ...projects].map((proj, idx) => (
                <ProjectCard
                  key={`${proj.id}-${idx}`}
                  project={proj}
                  index={idx % (projects.length || 1)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Technical Skills */}
        <section
          id="skills"
          className="py-10 sm:py-14 border-t border-borderDark/60 overflow-hidden w-full reveal-up"
        >
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-titaniumWhite tracking-tight uppercase font-body">
              Skills &amp; Mastery
            </h2>
            <span className="text-accentCyan text-xs">◆</span>
          </div>

          <div className="marquee-wrapper py-2">
            <div className="marquee-track-l2r">
              {[...SKILLS, ...SKILLS].map((skill, idx) => (
                <div
                  key={`${skill.name}-${idx}`}
                  onMouseEnter={() => bumpTick(setSkillTicks, idx)}
                  className="marquee-card flex-shrink-0 w-[240px] sm:w-[300px] bg-cardDark border border-borderDark rounded-xl p-4 sm:p-6 hover:border-accentCyan transition-all duration-300 shadow-xl cursor-default group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-xs sm:text-sm uppercase font-bold tracking-wider text-titaniumWhite group-hover:text-accentCyan transition-colors">
                        <RewriteText
                          text={skill.name}
                          trigger={skillTicks[idx]}
                          duration={1150}
                        />
                      </h3>
                      <span
                        key={`skill-sub-${idx}-${skillTicks[idx]}`}
                        className={`block text-[9px] sm:text-[10px] text-softSilver/70 font-mono ${
                          skillTicks[idx] > 0 ? "service-recreate-desc" : ""
                        }`}
                      >
                        {skill.sub}
                      </span>
                    </div>
                    <span className="font-mono text-xs sm:text-sm font-bold text-accentCyan">
                      <RewriteText
                        text={skill.pct}
                        trigger={skillTicks[idx]}
                        duration={950}
                      />
                    </span>
                  </div>
                  <div className="w-full bg-deepSpace h-2 rounded-full overflow-hidden p-[1px] border border-borderDark">
                    <div
                      className={`bg-gradient-to-r from-accentBlue to-accentCyan h-full rounded-full ${skill.barClass}`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services & Client Experience */}
        <section
          id="services"
          className="py-10 sm:py-14 border-t border-borderDark/60"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 reveal-up">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-[2px] bg-accentCyan"></span>
                <span className="text-[10px] sm:text-xs uppercase tracking-ultra text-accentCyan font-mono font-semibold">
                  EXPERIENCE YOU RECEIVE WORKING WITH ME
                </span>
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-titaniumWhite tracking-tight uppercase font-body">
                  Services &amp; Experience
                </h2>
                <span className="text-accentCyan text-xs">◆</span>
              </div>
            </div>
            <p className="text-xs text-softSilver/80 max-w-md font-light">
              Every project is delivered with these four pillars so you get a
              fast, reliable, and interactive experience from day one. Click any
              card to start a project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CLIENT_EXPERIENCE_PILLARS.map((item, idx) => (
              <div
                key={item.num}
                onMouseEnter={() => bumpTick(setServiceTicks, idx)}
                onClick={() => openContact(item.title)}
                className={`service-select-card interactive-card cursor-pointer bg-cardDark/75 border border-borderDark rounded-2xl p-6 sm:p-7 hover:border-accentCyan group flex flex-col justify-between space-y-6 shadow-xl reveal-up reveal-delay-${
                  (idx + 1) * 100
                }`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl sm:text-3xl font-extrabold text-accentCyan">
                      {item.num}
                    </span>
                    <div className="w-10 h-10 rounded-lg border border-borderDark bg-deepSpace flex items-center justify-center text-accentCyan group-hover:border-accentCyan transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d={item.iconPath}
                        />
                      </svg>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base uppercase font-bold tracking-wider text-titaniumWhite group-hover:text-accentCyan transition-colors">
                    <RewriteText
                      text={item.title}
                      trigger={serviceTicks[idx]}
                      duration={1150}
                    />
                  </h3>

                  <p
                    key={`card-desc-${idx}-${serviceTicks[idx]}`}
                    className={`text-xs text-softSilver/85 leading-relaxed font-light ${
                      serviceTicks[idx] > 0 ? "service-recreate-desc" : ""
                    }`}
                  >
                    {item.description}
                  </p>
                </div>

                <div
                  key={`card-tags-${idx}-${serviceTicks[idx]}`}
                  className={`pt-3 border-t border-borderDark/60 text-[10px] text-accentCyan uppercase tracking-wider font-mono ${
                    serviceTicks[idx] > 0 ? "service-recreate-tags" : ""
                  }`}
                >
                  {item.tags}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section with Upwork, Fiverr & GitHub Profiles */}
        <section id="contact" className="my-10 sm:my-16 reveal-scale">
          <div className="relative bg-cardDark border border-accentCyan/40 rounded-2xl p-6 sm:p-10 lg:p-14 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-5 space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-accentCyan text-[10px] sm:text-xs uppercase tracking-ultra font-semibold">
                  <span>✧</span>
                  <span>INITIATE COLLABORATION</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-titaniumWhite tracking-tight uppercase leading-none font-body">
                  Let's Build
                  <br />
                  Something Exceptional
                </h2>
                <p className="text-xs text-softSilver/80 max-w-sm font-light">
                  Available for freelance projects, corporate revamps, and
                  worldwide contracts.
                </p>
                <div className="pt-2">
                  <SocialLinks />
                </div>
              </div>

              <div className="lg:col-span-4 space-y-3 lg:border-l lg:border-borderDark lg:pl-8">
                <a
                  href="mailto:hamoodsamad0321@gmail.com"
                  className="flex items-center gap-3 text-xs text-titaniumWhite hover:text-accentCyan transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg border border-borderDark bg-deepSpace flex items-center justify-center text-accentCyan flex-shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="font-mono text-[11px] sm:text-xs break-all">
                    hamoodsamad0321@gmail.com
                  </span>
                </a>

                <a
                  href="tel:+923436956890"
                  className="flex items-center gap-3 text-xs text-titaniumWhite hover:text-accentCyan transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg border border-borderDark bg-deepSpace flex items-center justify-center text-accentCyan flex-shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <span className="font-mono text-[11px] sm:text-xs tracking-wider">
                    +92 343 6956890
                  </span>
                </a>

                <div className="flex items-center gap-3 text-xs text-softSilver">
                  <div className="w-8 h-8 rounded-lg border border-borderDark bg-deepSpace flex items-center justify-center text-accentCyan flex-shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-[11px] sm:text-xs uppercase text-titaniumWhite font-semibold">
                    Pakistan &bull; Worldwide
                  </span>
                </div>
              </div>

              <div className="lg:col-span-3 flex justify-start lg:justify-end">
                <button
                  type="button"
                  onClick={() => openContact("Responsive Web Design")}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-accentCyan to-accentBlue text-pitchBlack font-bold text-xs uppercase tracking-wider rounded-full transition-all duration-300 shadow-xl shadow-accentCyan/20 hover:opacity-90"
                >
                  Start A Project
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with Hidden Admin Logo + Lock Icon + Social Links */}
      <footer className="w-full border-t border-borderDark/60 py-6 sm:py-8 bg-deepSpace/40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-softSilver">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSecretLock((prev) => !prev)}
              className="footer-logo-trigger w-8 h-8 rounded-lg border border-borderDark/80 bg-cardDark/70 flex items-center justify-center focus:outline-none"
              aria-label="HS Brand Mark"
            >
              <span className="font-serif text-xs font-bold text-titaniumWhite">
                H<span className="text-accentCyan italic">S</span>
              </span>
            </button>

            {showSecretLock && (
              <a
                href="/index-admin.html"
                className="footer-lock-reveal w-8 h-8 rounded-lg border border-accentCyan/50 bg-accentCyan/10 hover:bg-accentCyan/20 flex items-center justify-center text-accentCyan transition-colors"
                aria-label="Open Protected Admin Vault"
                title="Admin Vault"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </a>
            )}

            <span>&copy; 2026 Hamood Samad. All Rights Reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <SocialLinks compact />
            <a
              href="#hero"
              className="text-accentCyan hover:underline uppercase tracking-wider"
            >
              Back to Top ↑
            </a>
          </div>
        </div>
      </footer>

      <ContactModal
        isOpen={modalOpen}
        initialService={selectedService}
        onClose={() => setModalOpen(false)}
        onSuccess={(msg) => addToast(msg)}
      />
    </>
  );
}
