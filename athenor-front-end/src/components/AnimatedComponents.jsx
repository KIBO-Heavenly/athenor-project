import React from 'react';
import { motion } from 'framer-motion';

// Animated container with staggered children
export const AnimatedContainer = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

// Animated card with hover effects
export const AnimatedCard = ({ children, className = '', delay = 0, hoverScale = 1.02 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    whileHover={{ 
      scale: hoverScale, 
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      transition: { duration: 0.2 }
    }}
    whileTap={{ scale: 0.98 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Animated button with spring physics
export const AnimatedButton = ({ children, className = '', onClick, disabled = false, delay = 0 }) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay, type: 'spring', stiffness: 200 }}
    whileHover={{ 
      scale: disabled ? 1 : 1.05,
      transition: { duration: 0.2 }
    }}
    whileTap={{ scale: disabled ? 1 : 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className={className}
  >
    {children}
  </motion.button>
);

// Animated text with typewriter-like reveal
export const AnimatedText = ({ children, className = '', delay = 0, as = 'p' }) => {
  const Tag = motion[as] || motion.p;
  return (
    <Tag
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </Tag>
  );
};

// Animated heading with scale effect
export const AnimatedHeading = ({ children, className = '', delay = 0, level = 'h1' }) => {
  const Tag = motion[level];
  return (
    <Tag
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1],
        scale: { type: 'spring', stiffness: 100, damping: 15 }
      }}
      className={className}
    >
      {children}
    </Tag>
  );
};

// Floating animation wrapper
export const FloatingElement = ({ children, className = '', intensity = 10, duration = 3 }) => (
  <motion.div
    animate={{
      y: [-intensity, intensity, -intensity],
      rotate: [-2, 2, -2],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Pulse animation wrapper
export const PulsingElement = ({ children, className = '', scale = 1.05, duration = 2 }) => (
  <motion.div
    animate={{
      scale: [1, scale, 1],
      opacity: [0.8, 1, 0.8],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Staggered list animation
export const StaggeredList = ({ children, className = '', staggerDelay = 0.1 }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      visible: {
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }}
    className={className}
  >
    {React.Children.map(children, (child, index) => (
      <motion.div
        key={index}
        variants={{
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0 },
        }}
        transition={{ duration: 0.5 }}
      >
        {child}
      </motion.div>
    ))}
  </motion.div>
);

// Slide in from side animation
export const SlideIn = ({ children, className = '', direction = 'left', delay = 0 }) => {
  const directionConfig = {
    left: { x: -50, y: 0 },
    right: { x: 50, y: 0 },
    top: { x: 0, y: -50 },
    bottom: { x: 0, y: 50 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionConfig[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Rotating glow background
export const GlowingBackground = ({ className = '', color = '#10b981' }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl ${className}`}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.5, 0.3],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: 'linear',
    }}
    style={{ background: color }}
  />
);

// Page transition wrapper
export const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
  >
    {children}
  </motion.div>
);

// Reveal on scroll animation (needs IntersectionObserver in parent)
export const RevealOnScroll = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ duration: 0.8, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

// Morphing blob shape
export const MorphingBlob = ({ className = '', colors = ['#10b981', '#06b6d4', '#8b5cf6'] }) => (
  <motion.div
    className={`absolute rounded-full blur-2xl ${className}`}
    animate={{
      background: colors.map(c => `radial-gradient(circle, ${c} 0%, transparent 70%)`),
      scale: [1, 1.1, 0.9, 1],
      borderRadius: ['40% 60% 70% 30%', '60% 40% 30% 70%', '30% 70% 60% 40%', '40% 60% 70% 30%'],
    }}
    transition={{
      duration: 10,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

// Number counter animation
export const AnimatedCounter = ({ value, className = '', duration = 2 }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{count}</span>;
};

export default {
  AnimatedContainer,
  AnimatedCard,
  AnimatedButton,
  AnimatedText,
  AnimatedHeading,
  FloatingElement,
  PulsingElement,
  StaggeredList,
  SlideIn,
  GlowingBackground,
  PageTransition,
  RevealOnScroll,
  MorphingBlob,
  AnimatedCounter,
};
