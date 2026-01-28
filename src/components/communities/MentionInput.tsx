import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  maxLength?: number;
  disabled?: boolean;
}

interface UserSuggestion {
  id: string;
  username: string;
  avatar_url: string | null;
}

const MentionInput = ({
  value,
  onChange,
  placeholder,
  className,
  multiline = false,
  maxLength,
  disabled,
}: MentionInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Search for users when mention query changes
  useEffect(() => {
    if (!mentionQuery || mentionQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    const searchUsers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('public_profiles')
          .select('id, username, avatar_url')
          .ilike('username', `${mentionQuery}%`)
          .limit(5);

        if (!error && data) {
          setSuggestions(data as UserSuggestion[]);
        }
      } catch (err) {
        console.error('Error searching users:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 150);
    return () => clearTimeout(debounce);
  }, [mentionQuery]);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);

    // Check for @ mention trigger
    const cursorPos = inputRef.current?.selectionStart || newValue.length;
    const textBeforeCursor = newValue.slice(0, cursorPos);
    
    // Find the last @ that might be a mention
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // Check if @ is at start or preceded by whitespace
      const charBefore = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
      if (charBefore === ' ' || charBefore === '\n' || lastAtIndex === 0) {
        const query = textBeforeCursor.slice(lastAtIndex + 1);
        // Only trigger if query doesn't contain spaces
        if (!query.includes(' ') && query.length <= 20) {
          setMentionStart(lastAtIndex);
          setMentionQuery(query);
          setShowSuggestions(true);
          setSelectedIndex(0);
          return;
        }
      }
    }
    
    setShowSuggestions(false);
    setMentionQuery('');
    setMentionStart(-1);
  };

  const insertMention = (username: string) => {
    if (mentionStart === -1) return;

    const before = value.slice(0, mentionStart);
    const cursorPos = inputRef.current?.selectionStart || value.length;
    const after = value.slice(cursorPos);
    
    const newValue = `${before}@${username} ${after}`;
    onChange(newValue);
    
    setShowSuggestions(false);
    setMentionQuery('');
    setMentionStart(-1);
    
    // Focus and move cursor after mention
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = mentionStart + username.length + 2;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
        if (suggestions[selectedIndex]) {
          e.preventDefault();
          insertMention(suggestions[selectedIndex].username);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
      case 'Tab':
        if (suggestions[selectedIndex]) {
          e.preventDefault();
          insertMention(suggestions[selectedIndex].username);
        }
        break;
    }
  };

  const InputComponent = multiline ? Textarea : Input;

  return (
    <Popover open={showSuggestions && suggestions.length > 0}>
      <PopoverAnchor asChild>
        <InputComponent
          ref={inputRef as any}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={className}
          maxLength={maxLength}
          disabled={disabled}
        />
      </PopoverAnchor>
      <PopoverContent 
        className="w-64 p-0" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            {isLoading ? (
              <div className="py-2 px-3 text-sm text-muted-foreground">
                Searching...
              </div>
            ) : suggestions.length === 0 ? (
              <CommandEmpty>No users found</CommandEmpty>
            ) : (
              <CommandGroup heading="Users">
                {suggestions.map((user, index) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => insertMention(user.username)}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer",
                      index === selectedIndex && "bg-accent"
                    )}
                  >
                    <Avatar className="h-6 w-6">
                      {user.avatar_url ? (
                        <AvatarImage src={user.avatar_url} alt={user.username} />
                      ) : (
                        <AvatarFallback className="text-xs">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-sm">@{user.username}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MentionInput;
