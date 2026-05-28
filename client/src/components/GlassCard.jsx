import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

const GlassCard = ({ children, className = '', onClick, onContextMenu, style = {}, accentColor }) => {
  const ref = useRef(null);
  const [isPressed, setIsPressed] = useState(false);

  // Motion values for x/y mouse coordinates relative to card center
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for high-fidelity physics feel
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), springConfig);

  // Shimmer tracking values
  const shimmerX = useSpring(useTransform(x, [-0.5, 0.5], ['0%', '100%']), springConfig);
  const shimmerY = useSpring(useTransform(y, [-0.5, 0.5], ['0%', '100%']), springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    // Normalize coordinates to range [-0.5, 0.5]
    const relativeX = (e.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (e.clientY - rect.top) / rect.height - 0.5;
    
    x.set(relativeX);
    y.set(relativeY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}

      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
        zIndex: isPressed ? 30 : 1,
        ...style,
      }}
      className={`glass-panel glow-card relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/80 cursor-pointer ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {accentColor && (
        <div
          className="absolute left-0 top-0 h-full w-[6px] rounded-l-2xl pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />
      )}

      {/* 3D glare overlay shimmer effect */}
      {!isPressed && (
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_50%)]"
          style={{
            '--x': shimmerX,
            '--y': shimmerY,
          }}
        />
      )}
      
      {/* Inner child layout with 3D translation support */}
      <div style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;
