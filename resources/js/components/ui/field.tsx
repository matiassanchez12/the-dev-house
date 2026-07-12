import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { FormError } from '@/components/ui/form-error';
import { cloneElement, isValidElement, ReactElement, ReactNode } from 'react';

interface FieldProps {
  id: string;
  label?: string;
  labelClassName?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function Field({ id, label, labelClassName, error, className, children }: FieldProps) {
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : undefined;
  const childProps = isValidElement(children) ? (children.props as Record<string, unknown>) : {};
  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id,
        'aria-invalid': error ? 'true' : childProps['aria-invalid'],
        'aria-describedby': [childProps['aria-describedby'], describedBy]
          .filter(Boolean)
          .join(' ') || undefined,
      } as Record<string, unknown>)
    : children;

  return (
    <div className={cn('space-y-2', className)} data-invalid={error ? 'true' : undefined}>
      {label && (
        <Label htmlFor={id} className={cn('text-sm font-medium', labelClassName)}>
          {label}
        </Label>
      )}
      <div>
        {child}
      </div>
      {error && (
        <FormError id={errorId} message={error} className="text-sm text-destructive" aria-live="assertive" />
      )}
    </div>
  );
}
