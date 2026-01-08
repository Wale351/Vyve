import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, User, X, Loader2, BadgeCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  verified_creator: boolean | null;
  role: string | null;
}

interface MobileSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileSearch({ open, onOpenChange }: MobileSearchProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('public_profiles')
          .select('id, username, avatar_url, bio, verified_creator, role')
          .ilike('username', `%${query}%`)
          .limit(10);

        if (error) throw error;
        setResults((data || []) as SearchResult[]);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    if (result.id) {
      navigate(`/profile/${result.id}`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-0 translate-y-0 sm:top-[50%] sm:translate-y-[-50%] p-0 gap-0 max-w-full sm:max-w-lg h-[100dvh] sm:h-auto sm:max-h-[80vh] rounded-none sm:rounded-lg">
        {/* Search input */}
        <div className="flex items-center gap-2 p-3 border-b border-border/30">
          <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 px-0 h-9 text-base"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto p-2">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && query.length >= 2 && results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No users found for "{query}"
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-1">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <Avatar className="h-10 w-10 border border-border">
                    {result.avatar_url ? (
                      <AvatarImage src={result.avatar_url} alt={result.username || ''} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-sm">
                        {result.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-medium truncate">{result.username}</p>
                      {result.verified_creator && (
                        <BadgeCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      )}
                    </div>
                    {result.bio ? (
                      <p className="text-xs text-muted-foreground truncate">{result.bio}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground capitalize">{result.role || 'Viewer'}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!isLoading && query.length < 2 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
