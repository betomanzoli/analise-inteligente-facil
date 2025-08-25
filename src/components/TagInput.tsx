
import React, { useState, useRef, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { useTags } from '@/hooks/useTags';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  placeholder = "Adicionar tags..."
}) => {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: existingTags = [] } = useTags();

  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim().toLowerCase();
    if (trimmedTag && !value.some(tag => tag.toLowerCase() === trimmedTag)) {
      onChange([...value, trimmedTag]);
    }
    setInputValue('');
    setOpen(false);
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const filteredTags = existingTags
    .filter(tag => 
      tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.some(selectedTag => selectedTag.toLowerCase() === tag.name.toLowerCase())
    )
    .slice(0, 5);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button
              onClick={() => removeTag(index)}
              className="ml-1 h-3 w-3 rounded-full hover:bg-muted-foreground/20"
            >
              <X className="h-2 w-2" />
            </button>
          </Badge>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
          />
        </PopoverTrigger>
        {(inputValue || filteredTags.length > 0) && (
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandEmpty>
                {inputValue && (
                  <div 
                    className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-muted"
                    onClick={() => addTag(inputValue)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Criar tag "{inputValue}"
                  </div>
                )}
              </CommandEmpty>
              <CommandGroup>
                {filteredTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => addTag(tag.name)}
                  >
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
};
