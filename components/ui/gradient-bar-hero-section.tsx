"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Instagram } from 'lucide-react';
import { FaWhatsapp, FaGooglePlay, FaApple, FaLinkedin } from 'react-icons/fa';
import { SiGmail } from 'react-icons/si';
import { HoverButton } from '@/components/ui/hover-glow-button';

// Dynamically import GLSLHills to reduce initial bundle size
// This defers Three.js loading until the component is actually rendered
const GLSLHills = dynamic(
  () => import('@/components/ui/glsl-hills').then((mod) => ({ default: mod.GLSLHills })),
  { ssr: false }
);

const WaitlistForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="relative z-10 w-full flex justify-center px-4">
      {!isSubmitted ? (
        <div className="flex flex-row gap-2 sm:gap-3 items-center">
          <HoverButton
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-[200px] h-[52px] sm:h-[56px] px-6 sm:px-8 rounded-full whitespace-nowrap text-sm sm:text-base font-medium bg-primary text-primary-foreground flex items-center justify-center"
            glowColor="#000000"
            backgroundColor="transparent"
            textColor="inherit"
            hoverTextColor="inherit"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-muted-foreground border-t-primary-foreground rounded-full animate-spin"></div>
            ) : (
              'Ver Eventos'
            )}
          </HoverButton>

          <HoverButton
            className="w-full sm:w-[200px] h-[52px] sm:h-[56px] px-6 sm:px-8 rounded-full whitespace-nowrap text-sm sm:text-base font-medium bg-background/50 text-foreground border border-[#303030] backdrop-blur-sm flex items-center justify-center"
            glowColor="#ffffff"
            backgroundColor="transparent"
            textColor="inherit"
            hoverTextColor="inherit"
          >
            Soy Productor
          </HoverButton>
        </div>
      ) : (
        <div className="bg-green-500/20 border border-green-500/30 text-green-600 dark:text-green-300 rounded-full px-6 sm:px-8 py-3 sm:py-4 text-center animate-fadeIn text-sm sm:text-base">
          Thanks! We&apos;ll notify you when we launch.
        </div>
      )}
    </div>
  );
};

const AnimatedShaderBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <GLSLHills />
      {/* Gradient overlay for better text readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
    </div>
  );
};

export const Component: React.FC = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const words = ['Experiences', 'Events', 'Adventures', 'Moments', 'Vibes'];

  useEffect(() => {
    const currentWord = words[currentWordIndex];

    if (isTyping) {
      // Typing effect
      if (displayedText.length < currentWord.length) {
        const timer = setTimeout(() => {
          setDisplayedText(currentWord.slice(0, displayedText.length + 1));
        }, 100);
        return () => clearTimeout(timer);
      } else {
        // Word complete, wait then start deleting
        const timer = setTimeout(() => {
          setIsTyping(false);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } else {
      // Deleting effect
      if (displayedText.length > 0) {
        const timer = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 50);
        return () => clearTimeout(timer);
      } else {
        // Deletion complete, move to next word
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        setIsTyping(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedText, isTyping, currentWordIndex]);

  return (
    <section className="relative h-full w-full overflow-hidden">
      <AnimatedShaderBackground />

      <div className="relative z-10 text-center w-full max-w-4xl mx-auto flex flex-col items-center justify-center h-full pb-8 px-6 sm:px-8 md:px-12">
        <h1 className="w-full text-foreground leading-tight tracking-tight mb-6 sm:mb-8 animate-fadeIn px-4 flex justify-center">
          <span className="font-black text-[clamp(1.5rem,6vw,3.75rem)] whitespace-nowrap inline-flex items-center gap-2 sm:gap-3" style={{ fontFamily: 'LOT, sans-serif' }}>
            HUNT YOUR <span className="text-primary inline-flex items-center min-w-[1ch]">{displayedText}<span className="animate-pulse">|</span></span>
          </span>
        </h1>

        <div className="mb-6 sm:mb-10 px-4">
          <p className="text-[clamp(1rem,3vw,1.5rem)] text-[#B0B0B0] leading-relaxed animate-fadeIn animation-delay-200">
            Descubre, compara y compra los tickets que van con tu estilo.
          </p>
        </div>

        <div className="w-full max-w-2xl mb-6 sm:mb-8 px-4">
          <WaitlistForm />
        </div>

        <div className="flex justify-center space-x-6">
          <a href="https://www.instagram.com/hunt____tickets/" target="_blank" rel="noopener noreferrer" className="text-[#B0B0B0] hover:text-foreground transition-colors duration-300">
            <Instagram size={20} className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
          </a>
          <a href="https://www.linkedin.com/company/hunt-tickets-co/" target="_blank" rel="noopener noreferrer" className="text-[#B0B0B0] hover:text-foreground transition-colors duration-300">
            <FaLinkedin size={20} className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
          </a>
          <a href="mailto:" className="text-[#B0B0B0] hover:text-foreground transition-colors duration-300">
            <SiGmail size={20} className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
          </a>
          <a href="https://wa.me/573228597640" target="_blank" rel="noopener noreferrer" className="text-[#B0B0B0] hover:text-foreground transition-colors duration-300">
            <FaWhatsapp size={20} className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
          </a>
          <a href="#" className="text-[#B0B0B0] hover:text-foreground transition-colors duration-300">
            <FaApple size={20} className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
          </a>
          <a href="#" className="text-[#B0B0B0] hover:text-foreground transition-colors duration-300">
            <FaGooglePlay size={20} className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
          </a>
        </div>
      </div>
    </section>
  );
};