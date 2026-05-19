import { useEffect } from 'react';
import { useBoardStore } from '../store/boardStore';

interface Options {
  onNewCard?: () => void;
  onFocusSearch?: () => void;
}

export function useKeyboardShortcuts({ onNewCard, onFocusSearch }: Options = {}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditing =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;
      

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useBoardStore.getState().undo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        useBoardStore.getState().redo();
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
  }, [onNewCard, onFocusSearch]);
}
