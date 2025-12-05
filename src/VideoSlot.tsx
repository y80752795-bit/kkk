import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Trash2, RotateCw } from 'lucide-react';
import { VideoFile } from '../types';

interface VideoSlotProps {
  video: VideoFile;
  onVideoEnd: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const VideoSlot: React.FC<VideoSlotProps> = ({ video, onVideoEnd, onDelete, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDeleted, setIsDeleted] = useState(false);
  
  // Framer motion values for swipe interaction
  // Changed from y to x to support horizontal swiping
  const x = useMotionValue(0);
  
  // Transform values based on X axis (dragging right -> positive values)
  const opacity = useTransform(x, [0, 200], [1, 0]);
  const scale = useTransform(x, [0, 200], [1, 0.9]);
  const deleteIndicatorOpacity = useTransform(x, [50, 150], [0, 1]);
  const backgroundRed = useTransform(x, [0, 200], ["rgba(0,0,0,0)", "rgba(127,29,29,0.5)"]);

  useEffect(() => {
    // Reset video state when the video source changes (even if component persists)
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Auto-play prevented:", error);
        });
      }
    }
  }, [video.url]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Check for significant Right swipe (Positive X)
    if (info.offset.x > 100) {
      setIsDeleted(true);
      setTimeout(() => {
        onDelete(video.id);
      }, 200); // Wait for animation
    }
  };

  if (isDeleted) {
    return <div className={`flex-1 bg-neutral-900 ${className}`} />;
  }

  return (
    <motion.div 
      className={`relative flex-1 overflow-hidden bg-black border-b border-neutral-800 ${className}`}
      // Apply transforms
      style={{ x, opacity, scale, touchAction: 'pan-y' }} 
      // Change drag axis to X
      drag="x"
      // Restrict dragging: Allow pulling Right, resist pulling Left
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ right: 0.6, left: 0.05 }} 
      onDragEnd={handleDragEnd}
    >
      {/* Delete Indicator Overlay */}
      <motion.div 
        className="absolute inset-0 z-20 flex items-center justify-start pl-10 pointer-events-none"
        style={{ 
          opacity: deleteIndicatorOpacity,
          backgroundColor: backgroundRed
        }}
      >
        <div className="flex flex-row items-center text-white">
          <Trash2 size={48} />
          <span className="font-bold text-lg ml-4">RELEASE TO DELETE</span>
        </div>
      </motion.div>

      {/* Video Container - Applying the 90 degree rotation logic */}
      <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
        <video
          ref={videoRef}
          src={video.url}
          onEnded={() => onVideoEnd(video.id)}
          playsInline
          muted // Muted needed for better autoplay policy support
          className="max-w-[none]"
          style={{
            // Rotate 90deg clockwise
            transform: 'rotate(90deg)',
            // Swapping width/height logic for the container coverage
            height: '100vw', 
            width: '100%', 
            objectFit: 'contain',
          }}
          controls={false} 
        />
      </div>

      {/* Info Overlay */}
      <div className="absolute bottom-2 right-2 z-10 bg-black/50 px-2 py-1 rounded text-xs text-white/70 pointer-events-none">
         {video.file.name.slice(0, 15)}...
      </div>
      
      {/* Rotation Indicator (Visual only) */}
      <div className="absolute top-2 right-2 z-10 text-white/30">
        <RotateCw size={16} />
      </div>

    </motion.div>
  );
};

export default VideoSlot;