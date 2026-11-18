import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/** Phone bottom sheet. Tap the scrim or press Escape to close. */
export default function BottomSheet({ open, onClose, label, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <>
      <div className="m-sheet-scrim" onClick={onClose} aria-hidden="true" />
      <div className="m-sheet" role="dialog" aria-modal="true" aria-label={label}>
        <div className="m-sheet-grip" aria-hidden="true" />
        {children}
      </div>
    </>,
    document.body
  );
}
