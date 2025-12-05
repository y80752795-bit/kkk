export interface VideoFile {
  id: string;
  file: File;
  url: string;
}

export interface VideoSlotProps {
  video: VideoFile;
  onVideoEnd: (id: string) => void;
  onDelete: (id: string) => void;
  isActive: boolean;
}
