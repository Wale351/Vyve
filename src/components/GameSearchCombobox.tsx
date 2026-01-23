import * as React from 'react';
import { Check, ChevronsUpDown, Gamepad2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useGames, Game } from '@/hooks/useGames';

interface GameSearchComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const GameSearchCombobox = ({ value, onValueChange, placeholder = "Select activity..." }: GameSearchComboboxProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const { data: games = [] } = useGames();

  const selectedGame = games.find(game => game.id === value);

  // Filter games based on search
  const filteredGames = React.useMemo(() => {
    if (!search) return games;
    const searchLower = search.toLowerCase();
    return games.filter(game => 
      game.name.toLowerCase().includes(searchLower) ||
      game.category.toLowerCase().includes(searchLower)
    );
  }, [games, search]);

  // Group games by category
  const groupedGames = React.useMemo(() => {
    const groups: Record<string, Game[]> = {};
    filteredGames.forEach(game => {
      if (!groups[game.category]) {
        groups[game.category] = [];
      }
      groups[game.category].push(game);
    });
    return groups;
  }, [filteredGames]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-muted/30 border-border/50 h-10 md:h-12 text-sm md:text-base"
        >
          {selectedGame ? (
            <div className="flex items-center gap-2 truncate">
              {selectedGame.thumbnail_url ? (
                <img 
                  src={selectedGame.thumbnail_url} 
                  alt={selectedGame.name}
                  className="w-5 h-5 rounded object-cover"
                />
              ) : (
                <Gamepad2 className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="truncate">{selectedGame.name}</span>
              <span className="text-xs text-muted-foreground">({selectedGame.category})</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No games found.</CommandEmpty>
            {Object.entries(groupedGames).map(([category, categoryGames]) => (
              <CommandGroup key={category} heading={category}>
                {categoryGames.map(game => (
                  <CommandItem
                    key={game.id}
                    value={game.id}
                    onSelect={() => {
                      onValueChange(game.id === value ? '' : game.id);
                      setOpen(false);
                      setSearch('');
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded overflow-hidden bg-muted/50 flex-shrink-0">
                      {game.thumbnail_url ? (
                        <img 
                          src={game.thumbnail_url} 
                          alt={game.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gamepad2 className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <span className="flex-1 truncate">{game.name}</span>
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === game.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default GameSearchCombobox;
