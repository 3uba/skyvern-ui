'use client';

import { proxyArtifactUrl } from '@/lib/utils/artifact-url';

export function RecordingSection({ url }: { url: string }) {
  return (
    <div>
      <video
        controls
        className="w-full rounded-lg border bg-black"
        src={proxyArtifactUrl(url)}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
