import { useState, useRef } from "react";
import { Play, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
}

const VideoPlayer = ({ videoUrl, thumbnailUrl, title }: VideoPlayerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Generate thumbnail from video if not provided
  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!thumbnailUrl && !generatedThumbnail) {
      const video = e.currentTarget;
      video.currentTime = 1; // Seek to 1 second
    }
  };

  const handleSeeked = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!thumbnailUrl && !generatedThumbnail) {
      const video = e.currentTarget;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setGeneratedThumbnail(canvas.toDataURL("image/jpeg", 0.8));
      }
    }
  };

  const displayThumbnail = thumbnailUrl || generatedThumbnail;

  return (
    <>
      {/* Hidden video for thumbnail generation */}
      {!thumbnailUrl && !generatedThumbnail && (
        <video
          src={videoUrl}
          crossOrigin="anonymous"
          onLoadedData={handleVideoLoad}
          onSeeked={handleSeeked}
          className="hidden"
          muted
          playsInline
        />
      )}

      {/* Thumbnail with play button */}
      <div
        className="relative h-56 overflow-hidden cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        {displayThumbnail ? (
          <img
            src={displayThumbnail}
            alt={title || "Video thumbnail"}
            className="w-full h-full object-cover group-hover:scale-105 transition-smooth duration-500"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,127,107,0.8)] group-hover:scale-110 transition-glow">
            <Play className="text-primary-foreground ml-1" size={28} />
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none overflow-hidden">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X size={20} />
          </button>
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay
            controlsList="nodownload"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-auto max-h-[80vh]"
            playsInline
          >
            Your browser does not support the video tag.
          </video>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoPlayer;
