import { useVisualEditing } from "../contexts/VisualEditingContext";
import { Eye, EyeOff, ExternalLink, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

export function VisualEditingToolbar() {
  const { isEnabled, isReady } = useVisualEditing();
  const [isVisible, setIsVisible] = useState(true);

  if (!isEnabled) return null;

  const directusUrl = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isVisible ? (
        <div className="bg-blue-600 text-white rounded-lg shadow-2xl p-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isReady ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <Clock className="w-4 h-4 text-yellow-400 animate-spin" />
            )}
            <span className="font-semibold">
              {isReady ? 'Visual Editing Active' : 'Initializing...'}
            </span>
          </div>
          
          <a
            href={`${directusUrl}/admin`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Directus</span>
          </a>

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-2xl hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

