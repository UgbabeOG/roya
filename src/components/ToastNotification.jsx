import React, { useEffect } from 'react';
import { CheckCircle2, ShieldCheck, X, Sparkles, AlertCircle, Info } from 'lucide-react';

export default function ToastNotification({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div 
      id="toast-container" 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '420px',
        width: 'calc(100vw - 32px)',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => (
        <SingleToast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function SingleToast({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div
      style={{
        pointerEvents: 'auto',
        background: isSuccess 
          ? 'linear-gradient(135deg, rgba(14, 21, 38, 0.98) 0%, rgba(7, 26, 20, 0.98) 100%)' 
          : isError 
            ? 'linear-gradient(135deg, rgba(38, 14, 14, 0.98) 0%, rgba(20, 7, 7, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(14, 21, 38, 0.98) 0%, rgba(18, 28, 50, 0.98) 100%)',
        border: isSuccess 
          ? '1.5px solid #10B981' 
          : isError 
            ? '1.5px solid #EF4444' 
            : '1.5px solid var(--color-gold)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(229, 193, 88, 0.15)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 18px',
        color: '#FFF',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        backdropFilter: 'blur(16px)',
        animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        position: 'relative'
      }}
    >
      {/* Icon */}
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {isSuccess ? (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid #10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={18} color="#10B981" />
          </div>
        ) : isError ? (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertCircle size={18} color="#EF4444" />
          </div>
        ) : (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(229, 193, 88, 0.2)',
            border: '1px solid var(--color-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={18} color="var(--color-gold-bright)" />
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingRight: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF', margin: 0 }}>
            {toast.title}
          </h4>
          {toast.pnr && (
            <span style={{
              background: 'rgba(229, 193, 88, 0.18)',
              border: '1px solid var(--color-gold)',
              color: 'var(--color-gold-bright)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.05em'
            }}>
              PNR: {toast.pnr}
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0, lineHeight: 1.45 }}>
          {toast.message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: '#94A3B8',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s ease',
          flexShrink: 0
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#FFF'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
      >
        <X size={16} />
      </button>

      {/* Progress Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: isSuccess ? '#10B981' : isError ? '#EF4444' : 'var(--color-gold)',
        borderBottomLeftRadius: 'var(--radius-md)',
        borderBottomRightRadius: 'var(--radius-md)',
        animation: `toastProgress ${toast.duration || 5000}ms linear forwards`
      }} />

      <style>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
