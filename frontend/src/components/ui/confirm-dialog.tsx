'use client';

import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const ConfirmDialog = AlertDialogPrimitive.Root;
const ConfirmDialogTrigger = AlertDialogPrimitive.Trigger;
const ConfirmDialogPortal = AlertDialogPrimitive.Portal;

const ConfirmDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
ConfirmDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const ConfirmDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & {
    title: string;
    description?: string;
  }
>(({ className, children, title, description, ...props }, ref) => (
  <ConfirmDialogPortal>
    <ConfirmDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl bg-white p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        className
      )}
      {...props}
    >
      <AlertDialogPrimitive.Title className="text-lg font-bold text-gray-900">
        {title}
      </AlertDialogPrimitive.Title>
      {description && (
        <AlertDialogPrimitive.Description className="text-sm text-gray-500">
          {description}
        </AlertDialogPrimitive.Description>
      )}
      {children}
    </AlertDialogPrimitive.Content>
  </ConfirmDialogPortal>
));
ConfirmDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const ConfirmDialogFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('flex justify-end gap-3', className)}>
    {children}
  </div>
);
ConfirmDialogFooter.displayName = 'ConfirmDialogFooter';

export {
  ConfirmDialog,
  ConfirmDialogTrigger,
  ConfirmDialogContent,
  ConfirmDialogFooter,
  AlertDialogPrimitive as ConfirmDialogAction,
};
