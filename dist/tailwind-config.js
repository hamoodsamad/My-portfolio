window.tailwind.config = {
  theme: {
    screens: {
      xs: "380px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      colors: {
        pitchBlack: "#05070b",
        deepSpace: "#0A0E17",
        cardDark: "#111827",
        accentCyan: "#38BDF8",
        accentBlue: "#0EA5E9",
        accentTeal: "#2DD4BF",
        titaniumWhite: "#F8FAFC",
        softSilver: "#94A3B8",
        borderDark: "#1E293B",
      },
      fontFamily: {
        body: ['"Inter"', "sans-serif"],
        serif: ['"Cinzel"', "serif"],
        signature: ['"MonteCarlo"', "cursive"],
      },
      letterSpacing: {
        ultra: "0.25em",
        mega: "0.35em",
      },
    },
  },
};
