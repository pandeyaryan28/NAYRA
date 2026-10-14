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
          'relative w-full z-10 bg-white/80 dark:bg-[#1c1c1e]/80 swiftui-modal-surface border border-white/80 dark:border-white/[0.14] rounded-2xl shadow-[0_28px_72px_-12px_rgba(0,0,0,0.22),0_10px_24px_-4px_rgba(0,0,0,0.08),inset_0_1px_1.5px_0_rgba(255,255,255,0.95),inset_0_-1px_1px_0_rgba(0,0,0,0.03)] dark:shadow-[0_36px_84px_-12px_rgba(0,0,0,0.85),0_14px_32px_-4px_rgba(0,0,0,0.65),inset_0_1px_1.5px_0_rgba(255,255,255,0.18),inset_0_-1px_1px_0_rgba(0,0,0,0.4)] overflow-hidden animate-scale-in-spring',
          maxWidthClasses[maxWidth]
        )}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.03] backdrop-blur-md">
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
              className="h-7 w-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] rounded-lg swiftui-press"
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
