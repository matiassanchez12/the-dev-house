import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { FormError } from '@/components/ui/form-error';
import { ReactNode } from 'react';

interface FieldProps {
  id: string;
  label?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function Field({ id, label, error, className, children }: FieldProps) {
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : undefined;

  return (
    <div className={cn('space-y-2', className)} data-invalid={error ? 'true' : undefined}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <div>
        {children}
      </div>
      {error && (
        <FormError id={errorId} message={error} className="text-sm text-destructive" aria-live="assertive" />
      )}
    </div>
  );
}

// Helper to inject aria-invalid and aria-describedby into any child element
export function FieldControl({ 
  id, 
  error, 
  children 
}: { 
  id: string; 
  error?: string; 
  children: React.ReactElement 
}) {
  const errorId = `${id}-error`;
  
  return (
    <div>
      {React.cloneElement(children, {
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': error ? errorId : undefined,
      } as any)}
    </div>
  );
}
