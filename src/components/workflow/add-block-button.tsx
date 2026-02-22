'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BlockTypePicker } from './block-type-picker';

interface AddBlockButtonProps {
  onAdd: (blockType: string) => void;
  variant?: 'between' | 'end';
}

export function AddBlockButton({ onAdd, variant = 'between' }: AddBlockButtonProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (blockType: string) => {
    setOpen(false);
    onAdd(blockType);
  };

  if (variant === 'end') {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="w-full border-2 border-dashed border-muted-foreground/20 rounded-xl py-5 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 cursor-pointer">
            <Plus className="h-4 w-4" />
            Add Block
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="center" sideOffset={8}>
          <BlockTypePicker onSelect={handleSelect} />
        </PopoverContent>
      </Popover>
    );
  }

  // "between" variant — connector line with centered + button, revealed on hover
  return (
    <div className="group relative flex items-center justify-center h-8">
      {/* Vertical connector line */}
      <div className="absolute inset-x-1/2 top-0 bottom-0 w-px bg-border" />

      {/* Plus button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="relative z-10 h-6 w-6 rounded-full border-2 border-border bg-background text-muted-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 hover:!opacity-100 hover:border-primary hover:text-primary hover:scale-110 focus:opacity-100 focus:border-primary focus:text-primary transition-all cursor-pointer"
            aria-label="Add block here"
          >
            <Plus className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="center" sideOffset={8}>
          <BlockTypePicker onSelect={handleSelect} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
