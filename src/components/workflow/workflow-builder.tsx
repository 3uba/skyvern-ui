'use client';

import { useState, useCallback, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BlockCard } from './block-card';
import { AddBlockButton } from './add-block-button';
import { createDefaultBlock, getBlockConfig } from './block-config';
import { Plus } from 'lucide-react';
import { nanoid } from 'nanoid';

interface WorkflowBuilderProps {
  blocks: Record<string, unknown>[];
  onBlocksChange: (blocks: Record<string, unknown>[]) => void;
}

export function WorkflowBuilder({ blocks, onBlocksChange }: WorkflowBuilderProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Stable keys: maintain a map of block index -> stable id
  const keysRef = useRef<string[]>([]);
  if (keysRef.current.length !== blocks.length) {
    // Grow or rebuild keys array to match blocks length
    const next: string[] = [];
    for (let i = 0; i < blocks.length; i++) {
      next.push(keysRef.current[i] ?? nanoid(8));
    }
    keysRef.current = next;
  }

  const regenerateKey = (index: number) => {
    keysRef.current[index] = nanoid(8);
  };

  const handleAdd = useCallback(
    (atIndex: number, blockType: string) => {
      const newBlock = createDefaultBlock(blockType);
      const next = [...blocks];
      next.splice(atIndex, 0, newBlock);
      // Insert a new key at the same position
      keysRef.current.splice(atIndex, 0, nanoid(8));
      onBlocksChange(next);
      setExpandedIndex(atIndex);
    },
    [blocks, onBlocksChange],
  );

  const handleChange = useCallback(
    (index: number, updated: Record<string, unknown>) => {
      const next = [...blocks];
      next[index] = updated;
      onBlocksChange(next);
    },
    [blocks, onBlocksChange],
  );

  const handleDuplicate = useCallback(
    (index: number) => {
      const original = blocks[index];
      const copy = {
        ...structuredClone(original),
        label: ((original.label as string) || '') + '_copy',
      };
      const next = [...blocks];
      next.splice(index + 1, 0, copy);
      keysRef.current.splice(index + 1, 0, nanoid(8));
      onBlocksChange(next);
      setExpandedIndex(index + 1);
    },
    [blocks, onBlocksChange],
  );

  const handleDelete = useCallback(
    (index: number) => {
      const next = blocks.filter((_, i) => i !== index);
      keysRef.current.splice(index, 1);
      onBlocksChange(next);
      if (expandedIndex === index) setExpandedIndex(null);
      else if (expandedIndex !== null && expandedIndex > index) {
        setExpandedIndex(expandedIndex - 1);
      }
    },
    [blocks, onBlocksChange, expandedIndex],
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const next = [...blocks];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      // Swap keys too
      [keysRef.current[index - 1], keysRef.current[index]] = [keysRef.current[index], keysRef.current[index - 1]];
      onBlocksChange(next);
      if (expandedIndex === index) setExpandedIndex(index - 1);
      else if (expandedIndex === index - 1) setExpandedIndex(index);
    },
    [blocks, onBlocksChange, expandedIndex],
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index >= blocks.length - 1) return;
      const next = [...blocks];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      [keysRef.current[index], keysRef.current[index + 1]] = [keysRef.current[index + 1], keysRef.current[index]];
      onBlocksChange(next);
      if (expandedIndex === index) setExpandedIndex(index + 1);
      else if (expandedIndex === index + 1) setExpandedIndex(index);
    },
    [blocks, onBlocksChange, expandedIndex],
  );

  // Empty state
  if (blocks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-4">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium mb-1">No blocks yet</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Add your first block to start building this workflow.
          </p>
          <AddBlockButton
            onAdd={(type) => handleAdd(0, type)}
            variant="end"
          />
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {blocks.map((block, i) => (
          <div key={keysRef.current[i]}>
            {/* Connector + add button between blocks */}
            {i > 0 && (
              <AddBlockButton onAdd={(type) => handleAdd(i, type)} variant="between" />
            )}

            {/* Block card */}
            <BlockCard
              block={block}
              index={i}
              total={blocks.length}
              expanded={expandedIndex === i}
              onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
              onChange={(updated) => handleChange(i, updated)}
              onDuplicate={() => handleDuplicate(i)}
              onDelete={() => handleDelete(i)}
              onMoveUp={() => handleMoveUp(i)}
              onMoveDown={() => handleMoveDown(i)}
            />
          </div>
        ))}

        {/* Final connector + add block CTA */}
        <div className="mt-2">
          {blocks.length > 0 && (
            <div className="flex justify-center py-2">
              <div className="w-px h-4 bg-border" />
            </div>
          )}
          <AddBlockButton
            onAdd={(type) => handleAdd(blocks.length, type)}
            variant="end"
          />
        </div>
      </div>
    </ScrollArea>
  );
}
