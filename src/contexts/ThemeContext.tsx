import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';
type AccentColor = 'cyan' | 'violet' | 'amber' | 'emerald' | 'rose' | 'blue';

interface ThemeContextType {
  theme: Theme;
  accentColor: AccentColor;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Complete accent color system with comprehensive blending for dark mode
const ACCENT_COLORS_DARK: Record<AccentColor, {
  // Core accent colors
  primary: string;
  secondary: string;
  ring: string;
  // Blended surface colors - subtle accent tint
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  // Border with accent tint
  border: string;
  input: string;
  // Card surfaces with subtle accent
  card: string;
  popover: string;
  // Sidebar
  sidebarBackground: string;
  sidebarAccent: string;
  sidebarBorder: string;
  // Chart colors
  chart1: string;
  chart2: string;
  chart3: string;
  // Glow effects
  glowPrimary: string;
}> = {
  cyan: {
    primary: '175 85% 45%',
    secondary: '15 75% 55%',
    ring: '175 85% 45%',
    muted: '180 15% 16%',
    mutedForeground: '175 15% 55%',
    accent: '180 18% 14%',
    accentForeground: '175 20% 94%',
    border: '180 12% 20%',
    input: '180 12% 20%',
    card: '185 18% 11%',
    popover: '185 18% 12%',
    sidebarBackground: '185 18% 9%',
    sidebarAccent: '180 18% 14%',
    sidebarBorder: '180 12% 16%',
    chart1: '175 85% 45%',
    chart2: '15 75% 55%',
    chart3: '160 60% 42%',
    glowPrimary: '175 85% 45%',
  },
  violet: {
    primary: '270 70% 60%',
    secondary: '320 70% 60%',
    ring: '270 70% 60%',
    muted: '270 15% 17%',
    mutedForeground: '270 15% 55%',
    accent: '270 18% 15%',
    accentForeground: '270 20% 94%',
    border: '270 12% 22%',
    input: '270 12% 22%',
    card: '270 16% 12%',
    popover: '270 16% 13%',
    sidebarBackground: '270 16% 10%',
    sidebarAccent: '270 18% 15%',
    sidebarBorder: '270 12% 18%',
    chart1: '270 70% 60%',
    chart2: '320 70% 60%',
    chart3: '290 60% 50%',
    glowPrimary: '270 70% 60%',
  },
  amber: {
    primary: '38 92% 50%',
    secondary: '20 85% 55%',
    ring: '38 92% 50%',
    muted: '35 15% 17%',
    mutedForeground: '38 20% 55%',
    accent: '35 18% 15%',
    accentForeground: '38 25% 94%',
    border: '35 12% 22%',
    input: '35 12% 22%',
    card: '35 14% 12%',
    popover: '35 14% 13%',
    sidebarBackground: '35 14% 10%',
    sidebarAccent: '35 18% 15%',
    sidebarBorder: '35 12% 18%',
    chart1: '38 92% 50%',
    chart2: '20 85% 55%',
    chart3: '45 80% 45%',
    glowPrimary: '38 92% 50%',
  },
  emerald: {
    primary: '160 65% 45%',
    secondary: '140 60% 50%',
    ring: '160 65% 45%',
    muted: '160 15% 16%',
    mutedForeground: '160 15% 55%',
    accent: '160 18% 14%',
    accentForeground: '160 20% 94%',
    border: '160 12% 20%',
    input: '160 12% 20%',
    card: '162 16% 11%',
    popover: '162 16% 12%',
    sidebarBackground: '162 16% 9%',
    sidebarAccent: '160 18% 14%',
    sidebarBorder: '160 12% 16%',
    chart1: '160 65% 45%',
    chart2: '140 60% 50%',
    chart3: '175 55% 42%',
    glowPrimary: '160 65% 45%',
  },
  rose: {
    primary: '345 75% 58%',
    secondary: '15 80% 60%',
    ring: '345 75% 58%',
    muted: '345 15% 17%',
    mutedForeground: '345 15% 55%',
    accent: '345 18% 15%',
    accentForeground: '345 20% 94%',
    border: '345 12% 22%',
    input: '345 12% 22%',
    card: '348 14% 12%',
    popover: '348 14% 13%',
    sidebarBackground: '348 14% 10%',
    sidebarAccent: '345 18% 15%',
    sidebarBorder: '345 12% 18%',
    chart1: '345 75% 58%',
    chart2: '15 80% 60%',
    chart3: '330 65% 50%',
    glowPrimary: '345 75% 58%',
  },
  blue: {
    primary: '220 75% 60%',
    secondary: '200 70% 55%',
    ring: '220 75% 60%',
    muted: '220 15% 17%',
    mutedForeground: '220 15% 55%',
    accent: '220 18% 15%',
    accentForeground: '220 20% 94%',
    border: '220 12% 22%',
    input: '220 12% 22%',
    card: '222 16% 12%',
    popover: '222 16% 13%',
    sidebarBackground: '222 16% 10%',
    sidebarAccent: '220 18% 15%',
    sidebarBorder: '220 12% 18%',
    chart1: '220 75% 60%',
    chart2: '200 70% 55%',
    chart3: '240 65% 55%',
    glowPrimary: '220 75% 60%',
  },
};

// Complete accent color system for light mode
const ACCENT_COLORS_LIGHT: Record<AccentColor, {
  primary: string;
  secondary: string;
  ring: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  input: string;
  card: string;
  popover: string;
  sidebarBackground: string;
  sidebarAccent: string;
  sidebarBorder: string;
  chart1: string;
  chart2: string;
  chart3: string;
}> = {
  cyan: {
    primary: '175 80% 35%',
    secondary: '15 70% 50%',
    ring: '175 80% 35%',
    muted: '175 25% 92%',
    mutedForeground: '175 20% 40%',
    accent: '175 30% 95%',
    accentForeground: '175 80% 25%',
    border: '175 20% 85%',
    input: '175 20% 85%',
    card: '175 30% 99%',
    popover: '175 30% 99%',
    sidebarBackground: '175 25% 97%',
    sidebarAccent: '175 30% 94%',
    sidebarBorder: '175 20% 88%',
    chart1: '175 80% 35%',
    chart2: '15 70% 50%',
    chart3: '160 55% 38%',
  },
  violet: {
    primary: '270 65% 50%',
    secondary: '320 60% 50%',
    ring: '270 65% 50%',
    muted: '270 25% 92%',
    mutedForeground: '270 20% 40%',
    accent: '270 30% 95%',
    accentForeground: '270 65% 35%',
    border: '270 20% 85%',
    input: '270 20% 85%',
    card: '270 30% 99%',
    popover: '270 30% 99%',
    sidebarBackground: '270 25% 97%',
    sidebarAccent: '270 30% 94%',
    sidebarBorder: '270 20% 88%',
    chart1: '270 65% 50%',
    chart2: '320 60% 50%',
    chart3: '290 55% 45%',
  },
  amber: {
    primary: '38 85% 42%',
    secondary: '20 75% 48%',
    ring: '38 85% 42%',
    muted: '38 30% 92%',
    mutedForeground: '38 25% 38%',
    accent: '38 35% 95%',
    accentForeground: '38 85% 30%',
    border: '38 25% 85%',
    input: '38 25% 85%',
    card: '38 35% 99%',
    popover: '38 35% 99%',
    sidebarBackground: '38 30% 97%',
    sidebarAccent: '38 35% 94%',
    sidebarBorder: '38 25% 88%',
    chart1: '38 85% 42%',
    chart2: '20 75% 48%',
    chart3: '45 70% 40%',
  },
  emerald: {
    primary: '160 60% 38%',
    secondary: '140 55% 42%',
    ring: '160 60% 38%',
    muted: '160 25% 92%',
    mutedForeground: '160 20% 38%',
    accent: '160 30% 95%',
    accentForeground: '160 60% 28%',
    border: '160 20% 85%',
    input: '160 20% 85%',
    card: '160 30% 99%',
    popover: '160 30% 99%',
    sidebarBackground: '160 25% 97%',
    sidebarAccent: '160 30% 94%',
    sidebarBorder: '160 20% 88%',
    chart1: '160 60% 38%',
    chart2: '140 55% 42%',
    chart3: '175 50% 35%',
  },
  rose: {
    primary: '345 70% 48%',
    secondary: '15 70% 52%',
    ring: '345 70% 48%',
    muted: '345 25% 92%',
    mutedForeground: '345 20% 40%',
    accent: '345 30% 95%',
    accentForeground: '345 70% 35%',
    border: '345 20% 85%',
    input: '345 20% 85%',
    card: '345 30% 99%',
    popover: '345 30% 99%',
    sidebarBackground: '345 25% 97%',
    sidebarAccent: '345 30% 94%',
    sidebarBorder: '345 20% 88%',
    chart1: '345 70% 48%',
    chart2: '15 70% 52%',
    chart3: '330 60% 45%',
  },
  blue: {
    primary: '220 70% 50%',
    secondary: '200 65% 48%',
    ring: '220 70% 50%',
    muted: '220 25% 92%',
    mutedForeground: '220 20% 40%',
    accent: '220 30% 95%',
    accentForeground: '220 70% 35%',
    border: '220 20% 85%',
    input: '220 20% 85%',
    card: '220 30% 99%',
    popover: '220 30% 99%',
    sidebarBackground: '220 25% 97%',
    sidebarAccent: '220 30% 94%',
    sidebarBorder: '220 20% 88%',
    chart1: '220 70% 50%',
    chart2: '200 65% 48%',
    chart3: '240 60% 50%',
  },
};

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  defaultAccent?: AccentColor;
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  defaultAccent = 'cyan',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vyve-theme') as Theme;
      return stored || defaultTheme;
    }
    return defaultTheme;
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vyve-accent') as AccentColor;
      return stored || defaultAccent;
    }
    return defaultAccent;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('vyve-theme', theme);
    
    // Apply accent colors when theme changes
    applyAccentColors(accentColor, theme);
  }, [theme, accentColor]);

  const applyAccentColors = (color: AccentColor, currentTheme: Theme) => {
    const root = window.document.documentElement;
    
    if (currentTheme === 'dark') {
      const colors = ACCENT_COLORS_DARK[color];
      
      // Core colors
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--secondary', colors.secondary);
      root.style.setProperty('--ring', colors.ring);
      
      // Surface colors with accent tint
      root.style.setProperty('--muted', colors.muted);
      root.style.setProperty('--muted-foreground', colors.mutedForeground);
      root.style.setProperty('--accent', colors.accent);
      root.style.setProperty('--accent-foreground', colors.accentForeground);
      
      // Borders with accent tint
      root.style.setProperty('--border', colors.border);
      root.style.setProperty('--input', colors.input);
      
      // Card surfaces
      root.style.setProperty('--card', colors.card);
      root.style.setProperty('--popover', colors.popover);
      
      // Sidebar
      root.style.setProperty('--sidebar-background', colors.sidebarBackground);
      root.style.setProperty('--sidebar-primary', colors.primary);
      root.style.setProperty('--sidebar-accent', colors.sidebarAccent);
      root.style.setProperty('--sidebar-border', colors.sidebarBorder);
      root.style.setProperty('--sidebar-ring', colors.ring);
      
      // Chart colors
      root.style.setProperty('--chart-1', colors.chart1);
      root.style.setProperty('--chart-2', colors.chart2);
      root.style.setProperty('--chart-3', colors.chart3);
      
      // Glow effect
      root.style.setProperty('--glow-primary', `0 0 20px hsl(${colors.glowPrimary} / 0.25)`);
    } else {
      const colors = ACCENT_COLORS_LIGHT[color];
      
      // Core colors
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--secondary', colors.secondary);
      root.style.setProperty('--ring', colors.ring);
      
      // Surface colors with accent tint
      root.style.setProperty('--muted', colors.muted);
      root.style.setProperty('--muted-foreground', colors.mutedForeground);
      root.style.setProperty('--accent', colors.accent);
      root.style.setProperty('--accent-foreground', colors.accentForeground);
      
      // Borders with accent tint
      root.style.setProperty('--border', colors.border);
      root.style.setProperty('--input', colors.input);
      
      // Card surfaces
      root.style.setProperty('--card', colors.card);
      root.style.setProperty('--popover', colors.popover);
      
      // Sidebar
      root.style.setProperty('--sidebar-background', colors.sidebarBackground);
      root.style.setProperty('--sidebar-primary', colors.primary);
      root.style.setProperty('--sidebar-accent', colors.sidebarAccent);
      root.style.setProperty('--sidebar-border', colors.sidebarBorder);
      root.style.setProperty('--sidebar-ring', colors.ring);
      
      // Chart colors
      root.style.setProperty('--chart-1', colors.chart1);
      root.style.setProperty('--chart-2', colors.chart2);
      root.style.setProperty('--chart-3', colors.chart3);
    }
    
    localStorage.setItem('vyve-accent', color);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        accentColor, 
        setTheme, 
        setAccentColor, 
        toggleTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export const accentColorOptions: { value: AccentColor; label: string; class: string }[] = [
  { value: 'cyan', label: 'Cyan', class: 'bg-[hsl(175,85%,45%)]' },
  { value: 'violet', label: 'Violet', class: 'bg-[hsl(270,70%,60%)]' },
  { value: 'amber', label: 'Amber', class: 'bg-[hsl(38,92%,50%)]' },
  { value: 'emerald', label: 'Emerald', class: 'bg-[hsl(160,65%,45%)]' },
  { value: 'rose', label: 'Rose', class: 'bg-[hsl(345,75%,58%)]' },
  { value: 'blue', label: 'Blue', class: 'bg-[hsl(220,75%,60%)]' },
];
