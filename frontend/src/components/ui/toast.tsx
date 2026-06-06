'use client';

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn('fixed top-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2', className)}
    {...props}
  />
));
ToastViewport.displayName = 'ToastViewport';

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & { variant?: 'default' | 'success' | 'destructive' }
>(({ className, variant = 'default', ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(
      'flex items-center justify-between gap-4 rounded-xl border p-4 shadow-lg transition-all data-[swipe=end]:translate-x-[--radix-toast-swipe-end-x] data-[state=closed]:animate-out data-[state=open]:animate-in',
      variant === 'success' && 'border-green-200 bg-green-50 text-green-800',
      variant === 'destructive' && 'border-red-200 bg-red-50 text-red-800',
      variant === 'default' && 'border-gray-200 bg-white text-gray-900',
      className
    )}
    {...props}
  />
));
Toast.displayName = 'Toast';

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
));
ToastTitle.displayName = 'ToastTitle';

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
));
ToastDescription.displayName = 'ToastDescription';

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn('rounded-md opacity-70 hover:opacity-100 focus:outline-none focus:ring-2', className)}
    toast-close=""
    {...props}
  >
    <X className="size-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = 'ToastClose';

export { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport };
