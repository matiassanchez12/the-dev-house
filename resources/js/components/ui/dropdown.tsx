import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@radix-ui/react-dropdown-menu';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export const Dropdown = ({ children }: { children: React.ReactNode }) => (
  <DropdownMenu>{children}</DropdownMenu>
);
Dropdown.Trigger = DropdownMenuTrigger;
Dropdown.Content = ({
  align = 'right',
  className,
  children,
  ...props
}: DropdownMenuContent.Props & { children?: React.ReactNode }) => (
  <DropdownMenuContent align={align} className={cn('z-50 bg-card shadow-md rounded-lg border border-border min-w-[8rem] p-1', className)} {...props}>
    {children}
  </DropdownMenuContent>
);
Dropdown.Link = ({
  href,
  method,
  as,
  children,
  className,
  ...props
}: React.ComponentProps<typeof Link> & { href: string; method?: string; as?: string }) => (
  <DropdownMenuItem asChild>
    <Link
      href={href}
      method={method as 'get' | 'post' | 'put' | 'patch' | 'delete'}
      as={as}
      className={cn(
        'block w-full px-4 py-2 text-start text-sm leading-5 text-foreground transition duration-150 ease-in-out hover:bg-muted focus:bg-muted focus:outline-none cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  </DropdownMenuItem>
);
Dropdown.Separator = DropdownMenuSeparator;
