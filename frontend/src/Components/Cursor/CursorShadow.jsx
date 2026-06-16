import React, { useEffect, useRef } from 'react';

// Cursor shadow effect - just a glow/shadow that follows the mouse
// No visible ball, only the shadow effect
const CursorShadow = ({ color = '#e99a4b', shadowSize = 120, blur = 40, zIndex = 50 }) => {
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const shadowRef = useRef(null);
  const rafRef = useRef(null);
  
  // Use refs for animation state to avoid re-renders
  const visible = useRef(false);
  const scale = useRef(1);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onMouseMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (!visible.current) visible.current = true;
    };
    const onEnter = () => { visible.current = true; };
    const onLeave = () => { visible.current = false; };
    const onHover = (e) => {
      const active = !!e.detail?.active;
      scale.current = active ? 1.5 : 1;
    };

    // initialize to center
    pos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    target.current = { ...pos.current };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseenter', onEnter);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('cursor-hover', onHover);

    const tick = () => {
      // Smooth shadow movement
      pos.current.x += (target.current.x - pos.current.x) * 0.12;
      pos.current.y += (target.current.y - pos.current.y) * 0.12;

      if (shadowRef.current) {
        const dx = pos.current.x - shadowSize / 2;
        const dy = pos.current.y - shadowSize / 2;
        shadowRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scale.current})`;
        shadowRef.current.style.opacity = visible.current ? '0.75' : '0';
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('cursor-hover', onHover);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [shadowSize]); // Optimized dependencies

  const shadowStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: `${shadowSize}px`,
    height: `${shadowSize}px`,
    borderRadius: '9999px',
    background: `radial-gradient(circle, ${color}dd, ${color}88 30%, ${color}44 60%, ${color}00 80%)`,
    filter: `blur(${blur}px)`,
    pointerEvents: 'none',
    zIndex,
    transformOrigin: 'center center',
    willChange: 'transform, opacity', // Performance hint
    transition: 'opacity 300ms ease',
    mixBlendMode: 'normal',
  };

  return <div ref={shadowRef} style={shadowStyle} />;
};

export default CursorShadow;
