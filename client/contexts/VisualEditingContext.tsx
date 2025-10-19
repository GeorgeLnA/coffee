import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { apply, setAttr, remove } from '@directus/visual-editing';

interface VisualEditingContextType {
  isEnabled: boolean;
  token: string | null;
  setAttr: typeof setAttr;
  isReady: boolean;
}

const VisualEditingContext = createContext<VisualEditingContextType | undefined>(undefined);

// Helper functions
function isVisualEditingEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('visual-editing') === 'true';
}

function getVisualEditingToken(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('token');
}

export function VisualEditingProvider({ children }: { children: ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const enabled = isVisualEditingEnabled();
    const currentToken = getVisualEditingToken();
    
    setIsEnabled(enabled);
    setToken(currentToken);

    if (enabled && currentToken) {
      // Initialize visual editing
      const directusUrl = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';
      
      // Wait for DOM to be ready
      const initVisualEditing = async () => {
        try {
          await apply({ 
            directusUrl,
            onSaved: ({ collection, item, payload }) => {
              console.log('Content saved:', { collection, item, payload });
              // Refresh page to show changes
              window.location.reload();
            }
          });
          setIsReady(true);
          console.log('✅ Visual editing initialized');
        } catch (error) {
          console.error('❌ Visual editing failed to initialize:', error);
        }
      };

      // Initialize after a short delay to ensure DOM is ready
      setTimeout(initVisualEditing, 1000);

      // Cleanup on navigation
      return () => {
        remove();
      };
    }
  }, []);

  return (
    <VisualEditingContext.Provider value={{ isEnabled, token, setAttr, isReady }}>
      {children}
    </VisualEditingContext.Provider>
  );
}

export function useVisualEditing() {
  const context = useContext(VisualEditingContext);
  if (context === undefined) {
    throw new Error('useVisualEditing must be used within a VisualEditingProvider');
  }
  return context;
}

