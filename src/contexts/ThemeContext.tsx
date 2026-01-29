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

const ACCENT_COLORS: Record<AccentColor, { primary: string; secondary: string }> = {
  cyan: { primary: '175 85% 45%', secondary: '15 75% 55%' },
  violet: { primary: '270 70% 55%', secondary: '320 70% 55%' },
  amber: { primary: '38 92% 50%', secondary: '15 75% 55%' },
  emerald: { primary: '160 65% 45%', secondary: '175 70% 45%' },
  rose: { primary: '345 75% 55%', secondary: '15 80% 60%' },
  blue: { primary: '220 75% 55%', secondary: '260 70% 55%' },
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
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    const colors = ACCENT_COLORS[accentColor];
    
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--ring', colors.primary);
    root.style.setProperty('--sidebar-primary', colors.primary);
    root.style.setProperty('--sidebar-ring', colors.primary);
    
    localStorage.setItem('vyve-accent', accentColor);
  }, [accentColor]);

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
