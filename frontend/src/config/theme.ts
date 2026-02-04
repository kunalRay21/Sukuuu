export const theme = {
  colors: {
    primary: {
      50: "#fdf2f8",
      100: "#fce7f3",
      200: "#fbcfe8",
      300: "#f9a8d4",
      400: "#f472b6",
      500: "#ec4899", // Rose pink - primary
      600: "#db2777",
      700: "#be185d",
      800: "#9d174d",
      900: "#831843",
    },
    secondary: {
      50: "#eef2ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#6366f1", // Indigo - secondary
      600: "#4f46e5",
      700: "#4338ca",
      800: "#3730a3",
      900: "#312e81",
    },
    neutral: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
      950: "#020617",
    },
    // Emotional palette for scrollytelling
    emotions: {
      positive: { from: "#fdf2f8", to: "#fce7f3" },
      neutral: { from: "#f8fafc", to: "#f1f5f9" },
      negative: { from: "#fef2f2", to: "#fee2e2" },
      excited: { from: "#fefce8", to: "#fef9c3" },
      nostalgic: { from: "#f5f3ff", to: "#ede9fe" },
      longing: { from: "#ecfeff", to: "#cffafe" },
      love: { from: "#fff1f2", to: "#ffe4e6" },
    },
    background: "#fafafa",
    surface: "#ffffff",
    error: "#ef4444",
    success: "#22c55e",
    warning: "#f59e0b",
  },
  typography: {
    fontFamily: {
      // Playfair Display for narrative headers
      serif: '"Playfair Display", Georgia, serif',
      // Inter for body text
      sans: '"Inter", system-ui, -apple-system, sans-serif',
      // JetBrains Mono for data labels
      mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "3.75rem",
    },
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    glass: "0 4px 30px rgba(0, 0, 0, 0.1)",
  },
  // Animation timing for narrative feel
  animation: {
    slow: "1.5s ease-in-out",
    medium: "0.8s ease-out",
    fast: "0.3s ease",
  },
} as const;

export type Theme = typeof theme;
