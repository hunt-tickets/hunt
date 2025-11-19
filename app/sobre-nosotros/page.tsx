"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

export default function SobreNosotrosPage() {
  const achievements = [
    { label: "Usuarios en waitlist", value: "2.4K+" },
    { label: "Eventos disponibles", value: "500+" },
    { label: "Ciudades cubiertas", value: "50+" },
    { label: "Satisfacción", value: "99%" },
  ]

  return (
    <div className="flex flex-col">

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="py-16 md:py-28 bg-background">
        <div className="mx-auto max-w-6xl space-y-2 px-6">
          <Image
            className="rounded-xl object-cover w-full h-[240px] md:h-[460px]"
            src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=600&fit=crop"
            alt="Concierto en vivo con multitud"
            width={1200}
            height={600}
            priority
          />

          <div className="grid gap-6 md:grid-cols-2 md:gap-12">
            <h1
              className="text-3xl md:text-4xl font-bold text-foreground leading-snug"
              style={{ fontFamily: 'LOT, sans-serif' }}
            >
              EL ECOSISTEMA <span className="text-primary">HUNT</span>{" "}
              <span className="text-muted-foreground">
                conecta personas con experiencias inolvidables.
              </span>
            </h1>
            <div className="space-y-6 text-muted-foreground">
              <p>
                Hunt está evolucionando para ser más que una plataforma de tickets.
                Conectamos eventos, productores y asistentes en un ecosistema donde descubrir
                y vivir experiencias únicas es tan emocionante como el evento mismo.
              </p>
              <Button
                asChild
                variant="default"
                size="sm"
                className="gap-1 pr-1.5 rounded-full"
              >
                <Link href="/eventos">
                  <span>Ver Eventos</span>
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- ABOUT SECTION ---------------- */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl space-y-16 px-6">

          {/* Header */}
          <div className="grid gap-6 text-center md:grid-cols-2 md:gap-12 md:text-left">
            <h1
              className="text-4xl md:text-5xl font-bold text-foreground"
              style={{ fontFamily: 'LOT, sans-serif' }}
            >
              SOBRE NOSOTROS
            </h1>
            <p className="text-muted-foreground text-lg">
              Somos un equipo apasionado dedicado a crear soluciones innovadoras
              que revolucionan la forma en que las personas descubren y disfrutan eventos.
            </p>
          </div>

          {/* ---------------- THREE CARDS LAYOUT ---------------- */}
          <div className="flex flex-col md:flex-row gap-6 mt-16">

            {/* LEFT BIG IMAGE */}
            <div className="md:flex-1">
              <Image
                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=550&fit=crop"
                alt="Evento musical en vivo"
                className="rounded-xl object-cover w-full h-[300px] sm:h-[360px] md:h-[100%]"
                width={800}
                height={550}
              />
            </div>

            {/* RIGHT TWO CARDS */}
            <div className="flex flex-col gap-6 md:flex-1">
              {/* FIRST CARD - Misión */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
                className="relative overflow-hidden rounded-xl bg-black dark:bg-zinc-950 text-white shadow-lg"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="relative h-60 sm:h-64 md:h-48 w-full overflow-hidden"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop"
                    alt="Multitud disfrutando concierto"
                    className="h-full w-full object-cover"
                    width={600}
                    height={400}
                  />
                  <div className="absolute bottom-0 h-32 w-full bg-gradient-to-t from-black via-black/70 to-transparent" />
                </motion.div>
                <div className="p-6">
                  <h3
                    className="text-xl font-bold"
                    style={{ fontFamily: 'LOT, sans-serif' }}
                  >
                    NUESTRA MISIÓN
                  </h3>
                  <p className="mt-2 text-sm text-gray-300">
                    Democratizar el acceso a eventos increíbles, facilitando la conexión entre
                    personas y experiencias que crean recuerdos inolvidables.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-4 border-white text-white hover:bg-white hover:text-black rounded-full"
                  >
                    <Link href="/eventos">Ver Eventos</Link>
                  </Button>
                </div>
              </motion.div>

              {/* SECOND CARD - Visión */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
                className="relative overflow-hidden rounded-xl bg-muted shadow-lg"
              >
                <Image
                  src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop"
                  alt="DJ en concierto"
                  className="h-full w-full object-cover min-h-[220px] sm:min-h-[240px] md:min-h-[220px]"
                  width={600}
                  height={400}
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent text-white">
                  <h3
                    className="text-xl font-bold"
                    style={{ fontFamily: 'LOT, sans-serif' }}
                  >
                    NUESTRA VISIÓN
                  </h3>
                  <p className="mt-2 text-sm text-gray-200">
                    Ser la plataforma líder en Latinoamérica donde cada experiencia cuenta
                    y cada evento es una oportunidad de crear momentos únicos.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </section>

      {/* ---------------- STATS SECTION ---------------- */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6">
          <h2
            className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12"
            style={{ fontFamily: 'LOT, sans-serif' }}
          >
            HUNT EN NÚMEROS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div
                  className="text-4xl sm:text-5xl font-bold text-primary mb-2"
                  style={{ fontFamily: 'LOT, sans-serif' }}
                >
                  {achievement.value}
                </div>
                <p className="text-muted-foreground text-sm">{achievement.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- VALUES SECTION ---------------- */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <h2
            className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12"
            style={{ fontFamily: 'LOT, sans-serif' }}
          >
            NUESTROS VALORES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Value 1 */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative overflow-hidden rounded-xl group"
            >
              <Image
                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&h=400&fit=crop"
                alt="Personas en concierto"
                className="w-full h-64 object-cover"
                width={600}
                height={400}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6 flex flex-col justify-end text-white">
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: 'LOT, sans-serif' }}
                >
                  USUARIO PRIMERO
                </h3>
                <p className="text-sm text-gray-200">
                  Cada decisión que tomamos prioriza la experiencia y satisfacción del usuario.
                </p>
              </div>
            </motion.div>

            {/* Value 2 */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative overflow-hidden rounded-xl group"
            >
              <Image
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop"
                alt="Tecnología y música"
                className="w-full h-64 object-cover"
                width={600}
                height={400}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6 flex flex-col justify-end text-white">
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: 'LOT, sans-serif' }}
                >
                  INNOVACIÓN
                </h3>
                <p className="text-sm text-gray-200">
                  Buscamos constantemente nuevas formas de mejorar la experiencia de eventos.
                </p>
              </div>
            </motion.div>

            {/* Value 3 */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative overflow-hidden rounded-xl group"
            >
              <Image
                src="https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=400&fit=crop"
                alt="Comunidad en evento"
                className="w-full h-64 object-cover"
                width={600}
                height={400}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6 flex flex-col justify-end text-white">
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: 'LOT, sans-serif' }}
                >
                  TRANSPARENCIA
                </h3>
                <p className="text-sm text-gray-200">
                  Claridad total en precios, comisiones y procesos. Sin sorpresas.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------------- CTA SECTION ---------------- */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="mx-auto max-w-4xl text-center px-6">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6"
            style={{ fontFamily: 'LOT, sans-serif' }}
          >
            ¿LISTO PARA LA AVENTURA?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a miles de personas que ya están descubriendo los mejores eventos con Hunt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="px-8 py-6 rounded-full text-base font-medium"
            >
              <Link href="/eventos">Explorar Eventos</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-6 rounded-full text-base font-medium"
            >
              <Link href="https://wa.me/573228597640" target="_blank" rel="noopener noreferrer">
                Contáctanos
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
