import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass';
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hover = false,
  onClick,
}) => {
  const cardClasses = clsx(
    variant === 'glass' ? 'glass-card' : 'card',
    hover && 'cursor-pointer',
    className
  );

  const cardProps = {
    className: cardClasses,
    onClick,
    ...(hover && {
      whileHover: { y: -2, scale: 1.02 },
      whileTap: { scale: 0.98 },
    }),
  };

  if (hover || onClick) {
    return (
      <motion.div {...cardProps}>
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};