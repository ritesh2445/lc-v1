import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface GalleryLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  caption?: string | null;
}

/**
 * Lightbox component for viewing full-resolution gallery images.
 * Only loads full-resolution when opened.
 */
const GalleryLightbox = ({
  isOpen,
  onClose,
  imageUrl,
  caption,
}: GalleryLightboxProps) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      // Reset loading state for next open
      setTimeout(() => setIsLoading(true), 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 p-2 rounded-full bg-background/80 hover:bg-background text-foreground z-10 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          {/* Loading spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Full resolution image - loads only when dialog opens */}
          <img
            src={imageUrl}
            alt={caption || "Gallery image"}
            className={`w-full h-auto max-h-[85vh] object-contain rounded-lg transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setIsLoading(false)}
          />

          {/* Caption */}
          {caption && !isLoading && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
              <p className="text-white text-center">{caption}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryLightbox;
