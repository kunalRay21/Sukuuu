export const theme = {
  colors: {
    personA: "#6366f1",
    personB: "#ec4899",
    background: "#fafafa",
    text: "#2d3748",
    accent: "#f59e0b",
  },
  fonts: {
    narrative: "Merriweather, Georgia, serif",
    data: "Inter, system-ui, sans-serif",
  },
} as const;

export type Theme = typeof theme;
