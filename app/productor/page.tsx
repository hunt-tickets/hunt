import { ProductorHero } from "@/components/productor-hero";
import SectionWithMockup from "@/components/ui/section-with-mockup";

export default function ProductorPage() {
  return (
    <>
      <ProductorHero />

      {/* Analytics Dashboard */}
      <SectionWithMockup
        title={
          <>
            Métricas en tiempo real
            <br />
            para tomar decisiones
          </>
        }
        description={
          <>
            Accede a un dashboard completo con estadísticas de ventas,
            <br />
            comportamiento de usuarios y rendimiento de tus eventos.
            <br />
            Todo en un solo lugar, actualizado en tiempo real.
          </>
        }
        primaryImageSrc="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
        secondaryImageSrc="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
      />

      {/* Ticket Management */}
      <SectionWithMockup
        title={
          <>
            Gestión de tickets
            <br />
            simplificada
          </>
        }
        description={
          <>
            Crea y administra tus entradas de forma intuitiva.
            <br />
            Control total sobre precios, disponibilidad y categorías.
            <br />
            Escaneo QR integrado para validación instantánea.
          </>
        }
        primaryImageSrc="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80"
        secondaryImageSrc="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80"
        reverseLayout={true}
      />

      {/* Promotional Tools */}
      <SectionWithMockup
        title={
          <>
            Promociona tus eventos
            <br />
            al máximo
          </>
        }
        description={
          <>
            Herramientas integradas de marketing y promoción.
            <br />
            Conecta con miles de usuarios interesados en tu contenido.
            <br />
            Maximiza la visibilidad y las ventas de tus eventos.
          </>
        }
        primaryImageSrc="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80"
        secondaryImageSrc="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80"
      />
    </>
  );
}
