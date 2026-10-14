import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  headerActions?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  headerActions,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div
        className={cn(
          'relative w-full z-10 bg-white/95 dark:bg-[#1c1c1e]/95 swiftui-modal-surface border border-black/[0.08] dark:border-white/[0.12] rounded-2xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.2),0_8px_16px_-4px_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.95)] dark:shadow-[0_28px_60px_-12px_rgba(0,0,0,0.85),0_8px_20px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.12)] overflow-hidden animate-scale-in-spring',
          maxWidthClasses[maxWidth]
        )}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-black/[0.06] dark:border-white/[0.07] bg-transparent">
          <div className="min-w-0 flex-1 pr-3">
            <h3 className="text-sm sm:text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {headerActions}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close dialog"
              className="h-7 w-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg swiftui-press"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-5 sm:p-6 max-h-[82vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
