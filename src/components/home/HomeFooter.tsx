import vyveLogo from '@/assets/vyve-logo.png';

export default function HomeFooter() {
  return (
    <footer className="border-t border-border/50 mt-6">
      <div className="container px-4 py-4">
        <div className="flex flex-col items-center gap-2 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <img src={vyveLogo} alt="Vyve" className="w-5 h-5 rounded" />
            <span className="text-xs font-medium">Vyve</span>
          </div>
          
          <p className="text-[10px] text-muted-foreground">
            Built on Base • Powered by Livepeer
          </p>
          
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <button className="hover:text-foreground transition-colors">Terms</button>
            <button className="hover:text-foreground transition-colors">Privacy</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
