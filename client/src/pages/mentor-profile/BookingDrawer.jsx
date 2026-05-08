import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useProfileReducedMotion } from './profileHooks';

export default function BookingDrawer({ isOpen, onClose, children }) {
  const flat = useProfileReducedMotion();
  const drawerRef = useRef(null);
  const prevFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      prevFocusRef.current = document.activeElement;
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      prevFocusRef.current?.focus?.();
      return;
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusable = Array.from(
        drawer.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.disabled);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKey);
    setTimeout(() => {
      const drawer = drawerRef.current;
      if (drawer) {
        const first = drawer.querySelector('a,button,input,[tabindex]:not([tabindex="-1"])');
        first?.focus();
      }
    }, 80);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            initial={flat ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={flat ? {} : { opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            aria-hidden
          />

          {/* Drawer panel */}
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Book a session"
            className="fixed bottom-0 left-0 right-0 z-50 overflow-y-auto"
            style={{
              background: 'var(--bridge-surface)',
              borderRadius: '24px 24px 0 0',
              maxHeight: '85vh',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
            initial={flat ? false : { y: '100%' }}
            animate={{ y: 0 }}
            exit={flat ? {} : { y: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Drag handle */}
            <div className="pt-5 pb-1 flex justify-center">
              <div
                className="h-1 w-10 rounded-full"
                style={{ background: 'var(--bridge-border)' }}
                aria-hidden
              />
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close booking"
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: 'var(--bridge-surface-muted)',
                color: 'var(--bridge-text-secondary)',
                outlineColor: 'var(--color-primary)',
              }}
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            <div className="px-5 pb-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
