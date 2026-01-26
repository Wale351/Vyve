import { Play } from 'lucide-react';

export default function HomeFooter() {
  return (
    <footer className="border-t border-border/10 mt-6 md:mt-8">
      <div className="container px-4 py-4 md:py-6">
        <div className="flex flex-col items-center gap-2 md:gap-3 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Play className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="font-display text-xs md:text-sm font-bold">Vyve</span>
          </div>
          
          <p className="text-[10px] md:text-xs text-muted-foreground text-center">
            Built on Base • Powered by Livepeer
          </p>
          
          <div className="flex items-center gap-4 text-[10px] md:text-xs text-muted-foreground">
            <button className="hover:text-foreground transition-colors">Terms</button>
            <button className="hover:text-foreground transition-colors">Privacy</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
