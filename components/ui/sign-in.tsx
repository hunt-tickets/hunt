"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AnimatedBackground } from './animated-background';

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C37.023 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);


// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSendOtp?: (email: string) => void;
  onVerifyOtp?: (email: string, otp: string) => void;
  onResendOtp?: (email: string) => void;
  onGoogleSignIn?: () => void;
  onCreateAccount?: () => void;
  isOtpSent?: boolean;
  isLoading?: boolean;
  error?: string | null;
  message?: string | null;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border dark:border-[#303030] bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-primary/50 focus-within:bg-primary/5">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 p-5 w-64 shadow-lg`}>
    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
      <img src={testimonial.avatarSrc} className="w-full h-full object-cover" alt="avatar" />
    </div>
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium text-foreground">{testimonial.name}</p>
      <p className="text-foreground/80">{testimonial.handle}</p>
      <p className="mt-1 text-foreground/90">{testimonial.text}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span className="font-light text-foreground tracking-tighter">Bienvenido</span>,
  description = "Accede a tu cuenta y continúa tu experiencia con nosotros",
  heroImageSrc,
  testimonials = [],
  onSendOtp,
  onVerifyOtp,
  onResendOtp,
  onGoogleSignIn,
  onCreateAccount,
  isOtpSent = false,
  isLoading = false,
  error = null,
  message = null,
}) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (isOtpSent && resendCountdown > 0) {
      const timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOtpSent, resendCountdown]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    onSendOtp?.(email);
  };

  const handleResendOtp = () => {
    setResendCountdown(60);
    setCanResend(false);
    onResendOtp?.(email);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    onVerifyOtp?.(email, otp.join(""));
  };

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw] relative">
      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <div className="p-2 rounded-full border dark:border-[#303030] bg-background/80 backdrop-blur-sm group-hover:bg-background transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="hidden sm:inline">Volver</span>
      </Link>

      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight">{title}</h1>
            <p className="animate-element animate-delay-200 text-muted-foreground">{description}</p>

            {!isOtpSent ? (
              <form className="space-y-5" onSubmit={handleSendOtp}>
                <div className="animate-element animate-delay-300">
                  <label className="text-sm font-medium text-muted-foreground">Correo electrónico</label>
                  <GlassInputWrapper>
                    <input
                      name="email"
                      type="email"
                      placeholder="tu@correo.com"
                      className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      required
                    />
                  </GlassInputWrapper>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                {message && <p className="text-sm text-green-600">{message}</p>}

                <button
                  type="submit"
                  className="animate-element animate-delay-600 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar código"}
                </button>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleVerifyOtp}>
                <div className="animate-element animate-delay-300">
                  <label className="text-sm font-medium text-muted-foreground">Correo electrónico</label>
                  <GlassInputWrapper>
                    <input
                      name="email"
                      type="email"
                      className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none bg-muted/50"
                      value={email}
                      disabled
                    />
                  </GlassInputWrapper>
                </div>

                <div className="animate-element animate-delay-400">
                  <label className="text-sm font-medium text-muted-foreground">Código de verificación</label>
                  <div className="flex gap-2 justify-between">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="w-full h-14 text-center text-lg font-semibold rounded-2xl border dark:border-[#303030] bg-foreground/5 backdrop-blur-sm transition-colors focus:outline-none focus:border-primary/50 focus:bg-primary/5"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        required
                      />
                    ))}
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                {message && <p className="text-sm text-green-600">{message}</p>}

                <button
                  type="submit"
                  className="animate-element animate-delay-600 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Verificando..." : "Verificar código"}
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="flex-1 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!canResend || isLoading}
                  >
                    {canResend ? "Reenviar código" : `Reenviar en ${resendCountdown}s`}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="flex-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Usar otro correo
                  </button>
                </div>
              </form>
            )}

            {!isOtpSent && (
              <>
                {onGoogleSignIn && (
                  <>
                    <div className="animate-element animate-delay-700 relative flex items-center justify-center">
                      <span className="w-full border-t dark:border-[#303030]"></span>
                      <span className="px-4 text-sm text-muted-foreground bg-background absolute">O continuar con</span>
                    </div>

                    <button
                      onClick={onGoogleSignIn}
                      className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border dark:border-[#303030] rounded-2xl py-4 hover:bg-secondary transition-colors"
                    >
                        <GoogleIcon />
                        Continuar con Google
                    </button>
                  </>
                )}

                <p className="animate-element animate-delay-900 text-center text-sm text-muted-foreground">
                  ¿Nuevo en nuestra plataforma? <a href="#" onClick={(e) => { e.preventDefault(); onCreateAccount?.(); }} className="text-foreground hover:underline transition-colors">Crear cuenta</a>
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Right column: animated background + testimonials */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4 overflow-hidden">
          <div className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl overflow-hidden">
            <AnimatedBackground
              colors={["#7700ff", "#ff006e", "#00e5ff", "#ff00aa", "#00ffaa", "#aa00ff"]}
              distortion={1.2}
              speed={0.42}
              swirl={0.6}
              veilOpacity="bg-black/30"
            />
          </div>
          {testimonials.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center z-10">
              <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
              {testimonials[1] && <div className="hidden xl:flex"><TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" /></div>}
              {testimonials[2] && <div className="hidden 2xl:flex"><TestimonialCard testimonial={testimonials[2]} delay="animate-delay-1400" /></div>}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
