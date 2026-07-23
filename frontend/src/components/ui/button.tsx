import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all outline-none disabled:opacity-50 disabled:pointer-events-none';
    
    let variantStyles = 'bg-indigo-600 text-white hover:bg-indigo-700';
    if (variant === 'outline') {
      variantStyles = 'border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800';
    } else if (variant === 'secondary') {
      variantStyles = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700';
    } else if (variant === 'destructive') {
      variantStyles = 'bg-rose-600 text-white hover:bg-rose-700';
    } else if (variant === 'ghost') {
      variantStyles = 'bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800';
    } else if (variant === 'link') {
      variantStyles = 'text-indigo-600 underline-offset-4 hover:underline p-0';
    }

    let sizeStyles = 'px-4 py-2 text-xs';
    if (size === 'sm') sizeStyles = 'px-3 py-1.5 text-xs';
    else if (size === 'lg') sizeStyles = 'px-6 py-3 text-sm';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
