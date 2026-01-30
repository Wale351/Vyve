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

// Extended accent color palette with better blending colors
const ACCENT_COLORS: Record<AccentColor, {
  primary: string;
  secondary: string;
  primaryLight: string;
  muted: string;
  accent: string;
  ring: string;
}> = {
  cyan: {
    primary: '175 85% 45%',
    secondary: '15 75% 55%',
    primaryLight: '175 70% 38%',
    muted: '175 20% 18%',
    accent: '175 25% 16%',
    ring: '175 85% 45%',
  },
  violet: {
    primary: '270 70% 55%',
    secondary: '320 70% 55%',
    primaryLight: '270 60% 50%',
    muted: '270 20% 18%',
    accent: '270 25% 16%',
    ring: '270 70% 55%',
  },
  amber: {
    primary: '38 92% 50%',
    secondary: '15 80% 55%',
    primaryLight: '38 80% 45%',
    muted: '38 20% 18%',
    accent: '38 25% 16%',
    ring: '38 92% 50%',
  },
  emerald: {
    primary: '160 65% 45%',
    secondary: '140 60% 50%',
    primaryLight: '160 55% 40%',
    muted: '160 20% 18%',
    accent: '160 25% 16%',
    ring: '160 65% 45%',
  },
  rose: {
    primary: '345 75% 55%',
    secondary: '10 80% 60%',
    primaryLight: '345 65% 50%',
    muted: '345 20% 18%',
    accent: '345 25% 16%',
    ring: '345 75% 55%',
  },
  blue: {
    primary: '220 75% 55%',
    secondary: '200 70% 55%',
    primaryLight: '220 65% 50%',
    muted: '220 20% 18%',
    accent: '220 25% 16%',
    ring: '220 75% 55%',
  },
};

// Light mode variants
const ACCENT_COLORS_LIGHT: Record<AccentColor, {
  primary: string;
  secondary: string;
  ring: string;
}> = {
  cyan: { primary: '175 85% 38%', secondary: '15 70% 50%', ring: '175 85% 38%' },
  violet: { primary: '270 70% 50%', secondary: '320 65% 50%', ring: '270 70% 50%' },
  amber: { primary: '38 88% 45%', secondary: '15 75% 50%', ring: '38 88% 45%' },
  emerald: { primary: '160 60% 40%', secondary: '140 55% 45%', ring: '160 60% 40%' },
  rose: { primary: '345 70% 50%', secondary: '10 75% 55%', ring: '345 70% 50%' },
  blue: { primary: '220 70% 50%', secondary: '200 65% 50%', ring: '220 70% 50%' },
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
    
    // Re-apply accent colors when theme changes
    applyAccentColors(accentColor, theme);
  }, [theme, accentColor]);

  const applyAccentColors = (color: AccentColor, currentTheme: Theme) => {
    const root = window.document.documentElement;
    
    if (currentTheme === 'dark') {
      const colors = ACCENT_COLORS[color];
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--secondary', colors.secondary);
      root.style.setProperty('--ring', colors.ring);
      root.style.setProperty('--sidebar-primary', colors.primary);
      root.style.setProperty('--sidebar-ring', colors.ring);
      
      // Blend accent with page - subtle tint to muted/accent areas
      root.style.setProperty('--muted', colors.muted);
      root.style.setProperty('--accent', colors.accent);
      root.style.setProperty('--sidebar-accent', colors.accent);
      
      // Update chart colors
      root.style.setProperty('--chart-1', colors.primary);
      root.style.setProperty('--chart-2', colors.secondary);
    } else {
      const colors = ACCENT_COLORS_LIGHT[color];
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--secondary', colors.secondary);
      root.style.setProperty('--ring', colors.ring);
      root.style.setProperty('--sidebar-primary', colors.primary);
      root.style.setProperty('--sidebar-ring', colors.ring);
      
      // Update chart colors
      root.style.setProperty('--chart-1', colors.primary);
      root.style.setProperty('--chart-2', colors.secondary);
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
  { value: 'violet', label: 'Violet', class: 'bg-[hsl(270,70%,55%)]' },
  { value: 'amber', label: 'Amber', class: 'bg-[hsl(38,92%,50%)]' },
  { value: 'emerald', label: 'Emerald', class: 'bg-[hsl(160,65%,45%)]' },
  { value: 'rose', label: 'Rose', class: 'bg-[hsl(345,75%,55%)]' },
  { value: 'blue', label: 'Blue', class: 'bg-[hsl(220,75%,55%)]' },
];
