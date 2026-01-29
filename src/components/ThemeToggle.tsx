import { motion } from 'framer-motion';
import { Moon, Sun, Palette } from 'lucide-react';
import { useTheme, accentColorOptions } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, accentColor, toggleTheme, setAccentColor } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-xl glass-subtle"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 glass-card">
        <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sun className="h-3.5 w-3.5" />
          Theme
        </DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={toggleTheme}
          className="flex items-center justify-between"
        >
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          <motion.div
            initial={false}
            animate={{ rotate: theme === 'dark' ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground" />
            )}
          </motion.div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
          <Palette className="h-3.5 w-3.5" />
          Accent Color
        </DropdownMenuLabel>
        
        <div className="grid grid-cols-3 gap-2 p-2">
          {accentColorOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setAccentColor(option.value)}
              className={cn(
                'w-full h-8 rounded-lg transition-all duration-200',
                option.class,
                accentColor === option.value 
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110' 
                  : 'opacity-70 hover:opacity-100 hover:scale-105'
              )}
              title={option.label}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
