"use client";

import React, { useRef, useState } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  glowColor?: string;
  backgroundColor?: string;
  textColor?: string;
  hoverTextColor?: string;
}

const HoverButton: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  glowColor = '#00ffc3',
  backgroundColor = '#111827', // gray-900 equivalent
  textColor = '#ffffff',
  hoverTextColor = '#67e8f9', // cyan-300 equivalent
  ...rest
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setGlowPosition({ x, y });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const buttonStyle: React.CSSProperties = {};
  if (backgroundColor !== 'transparent') {
    buttonStyle.backgroundColor = backgroundColor;
  }
  if (textColor !== 'inherit') {
    buttonStyle.color = isHovered ? hoverTextColor : textColor;
  }

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative inline-block
        cursor-pointer overflow-hidden transition-colors duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={buttonStyle}
      {...rest}
    >
      {/* Glow effect div */}
      <div
        className={`
          absolute w-[200px] h-[200px] rounded-full opacity-75 pointer-events-none
          transition-transform duration-400 ease-out -translate-x-1/2 -translate-y-1/2
          ${isHovered ? 'scale-150' : 'scale-0'}
        `}
        style={{
          left: `${glowPosition.x}px`,
          top: `${glowPosition.y}px`,
          background: `radial-gradient(circle, ${glowColor} 0%, ${glowColor}88 20%, transparent 60%)`,
          zIndex: 0,
        }}
      />

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center">{children}</span>
    </button>
  );
};

export { HoverButton };
