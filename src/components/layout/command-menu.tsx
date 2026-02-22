'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  ListChecks,
  Workflow,
  History,
  KeyRound,
  Globe,
  Settings,
  Users,
  Plus,
} from 'lucide-react';

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const navigate = (href: string) => {
    router.push(href);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => navigate('/dashboard')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => navigate('/tasks')}>
            <ListChecks className="mr-2 h-4 w-4" />
            Tasks
          </CommandItem>
          <CommandItem onSelect={() => navigate('/workflows')}>
            <Workflow className="mr-2 h-4 w-4" />
            Workflows
          </CommandItem>
          <CommandItem onSelect={() => navigate('/runs')}>
            <History className="mr-2 h-4 w-4" />
            Runs
          </CommandItem>
          <CommandItem onSelect={() => navigate('/credentials')}>
            <KeyRound className="mr-2 h-4 w-4" />
            Credentials
          </CommandItem>
          <CommandItem onSelect={() => navigate('/sessions')}>
            <Globe className="mr-2 h-4 w-4" />
            Browser Sessions
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => navigate('/tasks/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </CommandItem>
          <CommandItem onSelect={() => navigate('/workflows')}>
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
          <CommandItem onSelect={() => navigate('/settings/users')}>
            <Users className="mr-2 h-4 w-4" />
            User Management
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
