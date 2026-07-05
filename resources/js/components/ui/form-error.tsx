import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface FormErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  message?: string;
  className?: string;
}

export function FormError({ message, className, ...props }: FormErrorProps) {
  if (!message) return null;
  
  return (
    <p 
      className={cn('text-sm text-destructive', className)} 
      aria-live="assertive" 
      role="alert"
      {...props}
    >
      {message}
    </p>
  );
}
