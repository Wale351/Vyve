import { motion, HTMLMotionProps, Variants, useReducedMotion } from 'framer-motion';
import { forwardRef, ReactNode } from 'react';

// Shared easing curves
export const ease = {
  out: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  spring: { type: 'spring', stiffness: 300, damping: 30 } as const,
};

// Page transition variants
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: ease.out } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.2, ease: ease.inOut } },
};

// Modal/dialog variants
export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: ease.out } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15, ease: ease.inOut } },
};

// Fade in variants
export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, ease: ease.out } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: ease.inOut } },
};

// Stagger container variants
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Stagger item variants
export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: ease.out } },
};

// Card hover variants
export const cardHoverVariants: Variants = {
  initial: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.01, transition: { duration: 0.2, ease: ease.out } },
  tap: { scale: 0.98, transition: { duration: 0.1 } },
};

// Micro interaction for buttons
export const buttonHoverVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.15, ease: ease.out } },
  tap: { scale: 0.98, transition: { duration: 0.1 } },
};

// Page wrapper with transitions
interface MotionPageProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
}

export const MotionPage = forwardRef<HTMLDivElement, MotionPageProps>(
  ({ children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    
    return (
      <motion.div
        ref={ref}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={shouldReduceMotion ? fadeInVariants : pageVariants}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionPage.displayName = 'MotionPage';

// Stagger container wrapper
interface MotionStaggerContainerProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
}

export const MotionStaggerContainer = forwardRef<HTMLDivElement, MotionStaggerContainerProps>(
  ({ children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial="initial"
        animate="animate"
        variants={staggerContainerVariants}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionStaggerContainer.displayName = 'MotionStaggerContainer';

// Stagger item wrapper
interface MotionStaggerItemProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
}

export const MotionStaggerItem = forwardRef<HTMLDivElement, MotionStaggerItemProps>(
  ({ children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    
    return (
      <motion.div
        ref={ref}
        variants={shouldReduceMotion ? fadeInVariants : staggerItemVariants}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionStaggerItem.displayName = 'MotionStaggerItem';

// Interactive card wrapper
interface MotionCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  disableHover?: boolean;
}

export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, disableHover = false, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    
    if (shouldReduceMotion || disableHover) {
      return (
        <motion.div ref={ref} {...props}>
          {children}
        </motion.div>
      );
    }
    
    return (
      <motion.div
        ref={ref}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        variants={cardHoverVariants}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionCard.displayName = 'MotionCard';

// Export motion for direct use
export { motion, useReducedMotion };
