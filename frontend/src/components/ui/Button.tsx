import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { ButtonProps } from '../../types';

const buttonVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'bg-transparent text-text-primary hover:bg-background-secondary border-0',
  danger: 'bg-red-500 hover:bg-red-600 text-white border-0',
};

const buttonSizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
  type = 'button',
  className,
  ...props
}) => {
  const baseClasses = clsx(
    'inline-flex items-center justify-center font-medium rounded-element',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    'transition-all duration-200 cursor-pointer',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    buttonVariants[variant],
    buttonSizes[size],
    className
  );

  return (
    <motion.button
      type={type}
      className={baseClasses}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={disabled || loading ? {} : { y: -1 }}
      whileTap={disabled || loading ? {} : { y: 0 }}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </motion.button>
  );
};