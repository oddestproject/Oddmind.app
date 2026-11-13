"use client";

import { useEffect, useRef, type ReactNode } from "react";

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

// Dialog modal: overlay yang menutup halaman, Esc/klik overlay menutup, scroll latar terkunci,
// fokus masuk ke dialog (Tab dikurung) dan kembali ke pemicu saat tertutup.
// shortcut: fokus di dalam iframe tidak bisa dikurung, dan Esc yang ditekan di dalam iframe tidak sampai ke halaman.
export default function Modal({
  open, onClose, label, overlayClass = "bg-black/50", panelClass, children,
}: { open: boolean; onClose: () => void; label: string; overlayClass?: string; panelClass: string; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closeRef.current(); return; }
      if (e.key !== "Tab" || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1], active = document.activeElement;
      if (e.shiftKey && (active === first || active === panel.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 z-50 ${overlayClass}`}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={panel} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} className={`${panelClass} outline-none`}>
        {children}
      </div>
    </div>
  );
}
