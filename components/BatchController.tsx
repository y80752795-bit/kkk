import React, { useEffect, useState } from 'react';
import { VideoFile } from '../types';
import VideoSlot from './VideoSlot';

interface BatchControllerProps {
  videos: VideoFile[];
  onDeleteVideo: (id: string) => void;
}

const BatchController: React.FC<BatchControllerProps> = ({ videos, onDeleteVideo }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [finishedVideos, setFinishedVideos] = useState<Set<string>>(new Set());

  // Get current batch of up to 3 videos
  const currentBatch = videos.slice(startIndex, startIndex + 3);

  // If the list shrinks due to deletion and our start index is now out of bounds or leaves empty space unexpectedly
  useEffect(() => {
    if (startIndex >= videos.length && videos.length > 0) {
        // Reset to 0 if we ran out
        setStartIndex(0);
        setFinishedVideos(new Set());
    } else if (videos.length === 0) {
        // No videos left
        setStartIndex(0);
    }
  }, [videos.length, startIndex]);

  const handleVideoEnd = (id: string) => {
    setFinishedVideos(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // Check if we should advance
  useEffect(() => {
    if (currentBatch.length === 0) return;

    // Logic: Advance when ALL currently visible videos have finished.
    // Alternatively, the prompt says "3 screens play 3 videos after finished jump to 4".
    // This usually implies when the *set* is done. 
    
    const allFinished = currentBatch.every(v => finishedVideos.has(v.id));

    if (allFinished) {
      // Delay slightly for UX so it doesn't snap immediately
      const timer = setTimeout(() => {
        const nextIndex = startIndex + 3;
        if (nextIndex < videos.length) {
          setStartIndex(nextIndex);
          setFinishedVideos(new Set()); // Reset finished tracker for new batch
        } else {
            // Loop back to start or stop? Prompt says "until all videos played".
            // "Round" logic usually implies stopping or looping. 
            // Let's loop for continuous playback or just stop. 
            // "round down until all videos finished".
            // If we are at the end, we just stay there? Or loop?
            // Let's implement Loop to start for continuous utility.
            setStartIndex(0);
            setFinishedVideos(new Set());
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [finishedVideos, currentBatch, startIndex, videos.length]);

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        No videos loaded.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* 
        We render 3 slots. 
        If the batch has fewer than 3 (end of list), we render placeholders.
      */}
      {[0, 1, 2].map((offset) => {
        const video = currentBatch[offset];
        if (!video) {
          // Empty slot placeholder
          return <div key={`empty-${offset}`} className="flex-1 bg-black border-b border-neutral-800" />;
        }
        return (
          <VideoSlot
            key={video.id}
            video={video}
            onVideoEnd={handleVideoEnd}
            onDelete={onDeleteVideo}
            className="h-[33.33vh]"
          />
        );
      })}
    </div>
  );
};

export default BatchController;
