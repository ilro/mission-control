import { useEffect } from 'react';

/**
 * Locks body scroll when a modal is open and listens for Escape key.
 * Call with `isOpen` state and an `onClose` callback.
 */
export function useModalLock(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);
}
