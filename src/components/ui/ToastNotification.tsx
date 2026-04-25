'use client';

import { useEffect, useState, useCallback } from 'react';
import { Bell, X, Sparkles } from 'lucide-react';
import Link from 'next/link';

export interface Toast {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  href?: string;
}

// ── Global event bus for toasts ─────────────────────────────────────────────
type ToastListener = (toast: Toast) => void;
const listeners = new Set<ToastListener>();

/**
 * Push a toast from anywhere in the app — no React context needed.
 * Call this from notifications.ts, hooks, or any module.
 */
export function pushToast(title: string, body: string, href?: string) {
  const toast: Toast = {
    id: Math.random().toString(36).slice(2),
    title,
    body,
    timestamp: Date.now(),
    href,
  };
  listeners.forEach((fn) => fn(toast));
}

// ── React component ─────────────────────────────────────────────────────────
export const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Subscribe to the global event bus
  useEffect(() => {
    const handler: ToastListener = (toast) => {
      setToasts((prev) => [...prev, toast]);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 8000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        width: '92%',
        maxWidth: 420,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        const inner = (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: 20,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              boxShadow:
                '0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)',
              animation: 'toastSlideIn 0.4s cubic-bezier(0.16,1,0.3,1)',
              cursor: toast.href ? 'pointer' : 'default',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={20} color="#fff" />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 900,
                  color: '#fff',
                  letterSpacing: '0.02em',
                  lineHeight: 1.3,
                }}
              >
                {toast.title}
              </p>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.55)',
                  lineHeight: 1.4,
                }}
              >
                {toast.body}
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dismiss(toast.id);
              }}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: 10,
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                color: 'rgba(255,255,255,0.4)',
              }}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );

        return toast.href ? (
          <Link
            key={toast.id}
            href={toast.href}
            style={{ textDecoration: 'none' }}
            onClick={() => dismiss(toast.id)}
          >
            {inner}
          </Link>
        ) : (
          <div key={toast.id}>{inner}</div>
        );
      })}

      {/* Keyframe animation */}
      <style jsx global>{`
        @keyframes toastSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-24px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
