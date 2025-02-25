import { X } from "lucide-react";
import { useState } from "react";

interface ImagePreviewProps {
  src: string;
  alt: string;
}

export function ImagePreview({ src, alt }: ImagePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <img 
        src={src} 
        alt={alt}
        onClick={() => setIsExpanded(true)}
        className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
      />

      {/* Expanded Image Modal */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsExpanded(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setIsExpanded(false)}
          >
            <X className="h-6 w-6" />
          </button>
          <img 
            src={src} 
            alt={alt}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
} 