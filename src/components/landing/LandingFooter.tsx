import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="border-t border-border/30">
      <div className="container px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Play className="h-3.5 w-3.5 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="font-display font-bold">Vyve</span>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Powered by</span>
            <span className="font-semibold text-[#0052FF]">Base</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/games" className="hover:text-foreground transition-colors">
              Activities
            </Link>
            <Link to="/apply/streamer" className="hover:text-foreground transition-colors">
              Stream
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
