import { useEffect } from 'react';

interface Options {
  onNewCard?: () => void;
  onFocusSearch?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function useKeyboardShortcuts({ onNewCard, onFocusSearch, onUndo, onRedo }: Options = {}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditing =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;
      

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        onRedo?.();
        return;
      }

      if (e.key === '/' && !isEditing) {
        e.preventDefault();
        onFocusSearch?.();
      }

      if (isEditing) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        onNewCard?.();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNewCard, onFocusSearch, onUndo, onRedo]);
}
