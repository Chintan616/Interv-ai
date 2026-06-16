import React, { useEffect, useRef, useState } from 'react';

// Animated cursor follower with a glow trail
// - Follows mouse with smoothing
// - Grows on interactive hover via window 'cursor-hover' custom event
// - Slight press feedback on mousedown
const CursorFollower = ({ color = '#e99a4b', size = 14, glowSize = 42, zIndex = 50 }) => {
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const slowPos = useRef({ x: 0, y: 0 });
  const followerRef = useRef(null);
  const glowRef = useRef(null);
  const rafRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onMouseMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (!visible) setVisible(true);
    };
    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);
    const onDown = () => setScale((s) => Math.max(0.9, s - 0.1));
    const onUp = () => setScale((s) => (s < 1 ? 1 : s));
    const onHover = (e) => {
      const active = !!e.detail?.active;
      setScale(active ? 1.8 : 1);
    };

    // initialize to center
    pos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    slowPos.current = { ...pos.current };
    target.current = { ...pos.current };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseenter', onEnter);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('cursor-hover', onHover);

    const tick = () => {
      // Fast follower smoothing
      pos.current.x += (target.current.x - pos.current.x) * 0.18;
      pos.current.y += (target.current.y - pos.current.y) * 0.18;
      // Slower glow smoothing
      slowPos.current.x += (target.current.x - slowPos.current.x) * 0.08;
      slowPos.current.y += (target.current.y - slowPos.current.y) * 0.08;

      if (followerRef.current) {
        const dx = pos.current.x - size / 2;
        const dy = pos.current.y - size / 2;
        followerRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`;
        followerRef.current.style.opacity = visible ? '1' : '0';
      }
      if (glowRef.current) {
        const dx = slowPos.current.x - glowSize / 2;
        const dy = slowPos.current.y - glowSize / 2;
        glowRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        glowRef.current.style.opacity = visible ? '0.25' : '0';
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('cursor-hover', onHover);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [size, glowSize, visible]);

  const followerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '9999px',
    background: color,
    pointerEvents: 'none',
    zIndex,
    transition: 'opacity 120ms ease',
    boxShadow: `0 0 10px ${color}55`,
    mixBlendMode: 'normal',
  };

  const glowStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: `${glowSize}px`,
    height: `${glowSize}px`,
    borderRadius: '9999px',
    background: `radial-gradient(closest-side, ${color}55, ${color}00)`,
    filter: 'blur(8px)',
    pointerEvents: 'none',
    zIndex: zIndex - 1,
    transition: 'opacity 200ms ease',
    mixBlendMode: 'multiply',
  };

  return (
    <>
      <div ref={glowRef} style={glowStyle} />
      <div ref={followerRef} style={followerStyle} />
    </>
  );
};

export default CursorFollower;
