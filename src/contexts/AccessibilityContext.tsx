import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

interface AccessibilityContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  announce: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  small: 'text-size-small',
  medium: 'text-size-medium',
  large: 'text-size-large',
  xlarge: 'text-size-xlarge',
};

const FONT_SIZE_LABELS: Record<FontSize, { he: string; en: string }> = {
  small: { he: 'קטן', en: 'Small' },
  medium: { he: 'בינוני', en: 'Medium' },
  large: { he: 'גדול', en: 'Large' },
  xlarge: { he: 'גדול מאוד', en: 'Extra Large' },
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem('accessibility-font-size');
    return (saved as FontSize) || 'medium';
  });
  
  const [highContrast, setHighContrastState] = useState(() => {
    const saved = localStorage.getItem('accessibility-high-contrast');
    return saved === 'true';
  });

  // Screen reader announcement
  const announce = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
    const label = FONT_SIZE_LABELS[size];
    announce(`גודל טקסט: ${label.he}. Text size: ${label.en}`);
  }, [announce]);

  const setHighContrast = useCallback((enabled: boolean) => {
    setHighContrastState(enabled);
    const message = enabled 
      ? 'ניגודיות גבוהה מופעלת. High contrast enabled.'
      : 'ניגודיות גבוהה כבויה. High contrast disabled.';
    announce(message);
  }, [announce]);

  useEffect(() => {
    localStorage.setItem('accessibility-font-size', fontSize);
    
    // Remove all font size classes and add the current one
    Object.values(FONT_SIZE_CLASSES).forEach(cls => {
      document.documentElement.classList.remove(cls);
    });
    document.documentElement.classList.add(FONT_SIZE_CLASSES[fontSize]);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('accessibility-high-contrast', String(highContrast));
    
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return (
    <AccessibilityContext.Provider value={{ fontSize, setFontSize, highContrast, setHighContrast, announce }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
