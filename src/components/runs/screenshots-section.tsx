'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* eslint-disable @next/next/no-img-element */

export function ScreenshotsSection({ urls, defaultIndex }: { urls: string[]; defaultIndex?: number }) {
  const [selected, setSelected] = useState(defaultIndex ?? 0);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative overflow-hidden rounded-lg border bg-muted/30 aspect-video">
        <img
          src={urls[selected]}
          alt={`Screenshot ${selected + 1}`}
          className="w-full h-full object-contain"
        />
        {/* Navigation arrows */}
        {urls.length > 1 && (
          <>
            <button
              onClick={() =>
                setSelected((s) => (s > 0 ? s - 1 : urls.length - 1))
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 border shadow-sm hover:bg-background transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                setSelected((s) => (s < urls.length - 1 ? s + 1 : 0))
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 border shadow-sm hover:bg-background transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {/* Counter */}
            <div className="absolute bottom-2 right-2 rounded-full bg-background/80 border px-2.5 py-0.5 text-xs font-medium">
              {selected + 1} / {urls.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {urls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {urls.map((url, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`shrink-0 overflow-hidden rounded border-2 transition-all ${
                i === selected
                  ? 'border-primary ring-1 ring-primary/30'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={url}
                alt={`Thumb ${i + 1}`}
                className="h-14 w-20 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
