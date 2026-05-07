import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function useDialogFocus(
  open: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
  triggerRef?: React.RefObject<HTMLElement | null>
) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const saved = triggerRef?.current ?? (document.activeElement as HTMLElement | null);
    previousFocusRef.current = saved && saved !== document.body && saved !== document.documentElement ? saved : null;

    const container = containerRef.current;
    if (!container) return;

    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((el) => el.offsetParent !== null);

    const alreadyFocusedInside = container.contains(document.activeElement);
    if (!alreadyFocusedInside) {
      const target = focusable[0] ?? container;
      target.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !container) return;

      const elements = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null);

      if (elements.length === 0) {
        e.preventDefault();
        return;
      }

      const isInside = container.contains(document.activeElement);
      if (!isInside) {
        e.preventDefault();
        if (e.shiftKey) {
          elements[elements.length - 1].focus();
        } else {
          elements[0].focus();
        }
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      if (triggerRef) {
        requestAnimationFrame(() => {
          triggerRef.current?.focus();
        });
      } else {
        previousFocusRef.current?.focus();
      }
    };
  }, [open, containerRef, triggerRef]);
}
