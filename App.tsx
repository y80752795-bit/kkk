import React, { useState, useCallback } from 'react';
import { FolderOpen, AlertCircle } from 'lucide-react';
import { VideoFile } from './types';
import BatchController from './components/BatchController';

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [isSelectorVisible, setIsSelectorVisible] = useState(true);

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const videoFiles: VideoFile[] = [];
    
    // Filter for video types
    // Fixed: Explicitly type 'file' as File to avoid 'unknown' type inference
    Array.from(files).forEach((file: File) => {
      if (file.type.startsWith('video/')) {
        videoFiles.push({
          id: generateId(),
          file,
          url: URL.createObjectURL(file),
        });
      }
    });

    if (videoFiles.length > 0) {
      // Sort alphabetically usually helps with folder logic
      videoFiles.sort((a, b) => a.file.name.localeCompare(b.file.name));
      setVideos(videoFiles);
      setIsSelectorVisible(false);
    } else {
      alert("No video files found in the selected folder.");
    }
  };

  const handleDeleteVideo = useCallback((idToDelete: string) => {
    setVideos((prev) => {
      const newVideos = prev.filter((v) => v.id !== idToDelete);
      // Revoke object URL to prevent memory leaks for the deleted video
      const deletedVideo = prev.find(v => v.id === idToDelete);
      if (deletedVideo) {
        URL.revokeObjectURL(deletedVideo.url);
      }
      return newVideos;
    });
  }, []);

  // Cleanup URLs on unmount
  React.useEffect(() => {
    return () => {
      videos.forEach(v => URL.revokeObjectURL(v.url));
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-black overflow-hidden flex flex-col relative font-sans">
      
      {/* Main Content Area */}
      <main className="flex-1 h-full w-full">
        {videos.length > 0 ? (
          <BatchController 
            videos={videos} 
            onDeleteVideo={handleDeleteVideo} 
          />
        ) : (
          /* Empty State / Initial Load */
          !isSelectorVisible && (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-4">
              <AlertCircle size={48} />
              <p>No videos loaded.</p>
              <button 
                onClick={() => setIsSelectorVisible(true)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
              >
                Select Folder
              </button>
            </div>
          )
        )}
      </main>

      {/* Floating Control / Initial Selector */}
      {isSelectorVisible && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-neutral-900 border border-neutral-700 p-8 rounded-2xl shadow-2xl max-w-md w-full">
            <h1 className="text-3xl font-bold mb-2 text-white">TriFlow Player</h1>
            <p className="text-neutral-400 mb-8">
              Select a folder to play videos. Videos will be:
            </p>
            <ul className="text-left text-neutral-300 space-y-2 mb-8 list-disc pl-6 text-sm">
              <li>Rotated 90° clockwise</li>
              <li>Displayed in stacks of 3</li>
              <li>Auto-advanced when batch finishes</li>
              <li>Swipe <strong>RIGHT</strong> to delete a video</li>
            </ul>

            <label className="relative inline-flex items-center justify-center w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl cursor-pointer transition-all hover:scale-105 active:scale-95 group">
              <FolderOpen className="mr-3 group-hover:animate-bounce" />
              <span>Select Video Folder</span>
              <input
                type="file"
                // @ts-ignore - webkitdirectory is standard in modern browsers but not in standard TS defs
                webkitdirectory="true"
                directory="true"
                multiple
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFolderSelect}
              />
            </label>
            <p className="mt-4 text-xs text-neutral-500">
              Note: This runs locally in your browser. No files are uploaded.
            </p>
          </div>
        </div>
      )}

      {/* Persistent Controls (Top Left) */}
      {!isSelectorVisible && videos.length > 0 && (
        <div className="absolute top-4 left-4 z-40 opacity-50 hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setIsSelectorVisible(true)}
            className="p-2 bg-black/50 text-white rounded-full backdrop-blur hover:bg-white/20"
            title="Open New Folder"
          >
            <FolderOpen size={20} />
          </button>
          <div className="mt-2 text-xs font-mono text-white/50 bg-black/50 px-2 py-1 rounded">
            {videos.length} clips
          </div>
        </div>
      )}
    </div>
  );
}