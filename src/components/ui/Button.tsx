'use client';

import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variantStyles: Record<Variant, string> = {
  primary: 'bg-amber-600 hover:bg-amber-500 text-white',
  secondary: 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100',
  danger: 'bg-red-700 hover:bg-red-600 text-white',
  ghost: 'bg-transparent hover:bg-zinc-800 text-zinc-300',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded font-medium transition-[background-color,transform] duration-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    />
  );
}
