"use client";

import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { SimpleDatePicker } from './simple-date-picker';
import { NeuralNetworkBackground } from './neural-network-background';

// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

export interface SignUpFormData {
  email: string;
  nombre: string;
  apellido: string;
  prefijo: string;
  telefono: string;
  birthday: string;
  tipoDocumento: string;
  numeroDocumento: string;
}

interface SignUpPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignUp?: (data: SignUpFormData) => void;
  onLogin?: () => void;
  isLoading?: boolean;
  error?: string | null;
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

export const SignUpPage: React.FC<SignUpPageProps> = ({
  title = <span className="font-light text-foreground tracking-tighter">Crear cuenta</span>,
  description = "Únete a nosotros y comienza tu experiencia",
  heroImageSrc,
  testimonials = [],
  onSignUp,
  onLogin,
  isLoading = false,
  error = null,
}) => {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [prefijo, setPrefijo] = useState("+57");
  const [telefono, setTelefono] = useState("");
  const [birthday, setBirthday] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("CC");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      return;
    }
    onSignUp?.({
      email,
      nombre,
      apellido,
      prefijo,
      telefono,
      birthday,
      tipoDocumento,
      numeroDocumento,
    });
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

      {/* Left column: sign-up form */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight">{title}</h1>
            <p className="animate-element animate-delay-200 text-muted-foreground">{description}</p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div className="animate-element animate-delay-300">
                  <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                  <GlassInputWrapper>
                    <input
                      name="nombre"
                      type="text"
                      placeholder="Tu nombre"
                      className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </GlassInputWrapper>
                </div>

                <div className="animate-element animate-delay-350">
                  <label className="text-sm font-medium text-muted-foreground">Apellido</label>
                  <GlassInputWrapper>
                    <input
                      name="apellido"
                      type="text"
                      placeholder="Tu apellido"
                      className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      required
                    />
                  </GlassInputWrapper>
                </div>
              </div>

              <div className="animate-element animate-delay-400">
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

              <div className="grid grid-cols-3 gap-3">
                <div className="animate-element animate-delay-450">
                  <label className="text-sm font-medium text-muted-foreground">Prefijo</label>
                  <GlassInputWrapper>
                    <select
                      name="prefijo"
                      className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                      value={prefijo}
                      onChange={(e) => setPrefijo(e.target.value)}
                      required
                    >
                      <option value="+57">+57</option>
                      <option value="+1">+1</option>
                      <option value="+52">+52</option>
                      <option value="+54">+54</option>
                      <option value="+56">+56</option>
                      <option value="+51">+51</option>
                      <option value="+58">+58</option>
                      <option value="+593">+593</option>
                      <option value="+507">+507</option>
                      <option value="+506">+506</option>
                    </select>
                  </GlassInputWrapper>
                </div>

                <div className="col-span-2 animate-element animate-delay-500">
                  <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                  <GlassInputWrapper>
                    <input
                      name="telefono"
                      type="tel"
                      inputMode="numeric"
                      placeholder="3001234567"
                      className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                      value={telefono}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setTelefono(value);
                      }}
                      required
                    />
                  </GlassInputWrapper>
                </div>
              </div>

              <div className="animate-element animate-delay-550">
                <label className="text-sm font-medium text-muted-foreground">Fecha de nacimiento</label>
                <SimpleDatePicker
                  name="birthday"
                  value={birthday}
                  onChange={setBirthday}
                  placeholder="Selecciona tu fecha de nacimiento"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="animate-element animate-delay-600">
                  <label className="text-sm font-medium text-muted-foreground">Tipo de documento</label>
                  <GlassInputWrapper>
                    <select
                      name="tipoDocumento"
                      className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                      value={tipoDocumento}
                      onChange={(e) => setTipoDocumento(e.target.value)}
                      required
                    >
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="TI">Tarjeta de Identidad</option>
                      <option value="PAS">Pasaporte</option>
                      <option value="NIT">NIT</option>
                    </select>
                  </GlassInputWrapper>
                </div>

                <div className="animate-element animate-delay-650">
                  <label className="text-sm font-medium text-muted-foreground">Número de documento</label>
                  <GlassInputWrapper>
                    <input
                      name="numeroDocumento"
                      type="text"
                      inputMode="numeric"
                      placeholder="1234567890"
                      className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                      value={numeroDocumento}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setNumeroDocumento(value);
                      }}
                      required
                    />
                  </GlassInputWrapper>
                </div>
              </div>

              <div className="animate-element animate-delay-700">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-muted-foreground/30 bg-background/50 transition-all peer-checked:bg-primary peer-checked:border-primary peer-focus:ring-2 peer-focus:ring-primary/50 flex items-center justify-center">
                      <Check
                        className={`w-3.5 h-3.5 text-primary-foreground transition-all ${
                          acceptedTerms ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                        }`}
                        strokeWidth={3}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    Acepto los{" "}
                    <Link
                      href="/terms-and-conditions"
                      className="text-foreground font-medium hover:text-primary transition-colors underline-offset-2 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      términos y condiciones
                    </Link>
                    {" "}y la{" "}
                    <Link
                      href="/privacy"
                      className="text-foreground font-medium hover:text-primary transition-colors underline-offset-2 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      política de privacidad
                    </Link>
                  </span>
                </label>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                className="animate-element animate-delay-750 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                disabled={isLoading || !acceptedTerms}
              >
                {isLoading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>

            <p className="animate-element animate-delay-800 text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta? <a href="#" onClick={(e) => { e.preventDefault(); onLogin?.(); }} className="text-foreground hover:underline transition-colors">Iniciar sesión</a>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: animated background + testimonials */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4 overflow-hidden">
          <div className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl overflow-hidden bg-black">
            <NeuralNetworkBackground />
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
