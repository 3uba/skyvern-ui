'use client';

export function RecordingSection({ url }: { url: string }) {
  return (
    <div>
      <video
        controls
        className="w-full rounded-lg border bg-black"
        src={url}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
