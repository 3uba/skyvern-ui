'use client';

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { BLOCK_CATEGORIES, BLOCK_CONFIG, getBlockConfig } from './block-config';
import { cn } from '@/lib/utils';

interface BlockTypePickerProps {
  onSelect: (blockType: string) => void;
}

export function BlockTypePicker({ onSelect }: BlockTypePickerProps) {
  return (
    <Command className="w-[320px]">
      <CommandInput placeholder="Search block types..." />
      <CommandList className="max-h-[340px]">
        <CommandEmpty>No block type found.</CommandEmpty>
        {BLOCK_CATEGORIES.map((category) => (
          <CommandGroup key={category.label} heading={category.label}>
            {category.types
              .filter((t) => BLOCK_CONFIG[t])
              .map((blockType) => {
                const config = getBlockConfig(blockType);
                const Icon = config.icon;
                return (
                  <CommandItem
                    key={blockType}
                    value={`${config.displayName} ${blockType} ${config.description}`}
                    onSelect={() => onSelect(blockType)}
                    className="cursor-pointer py-2"
                  >
                    <div className={cn('p-1.5 rounded-md shrink-0', config.bg)}>
                      <Icon className={cn('h-4 w-4', config.color)} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{config.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {config.description}
                      </p>
                    </div>
                  </CommandItem>
                );
              })}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
}
