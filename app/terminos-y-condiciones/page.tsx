"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const sections = [
  { id: "section-1", title: "1. Aceptación y Alcance" },
  { id: "section-2", title: "2. Definiciones Básicas" },
  { id: "section-3", title: "3. Naturaleza del Servicio" },
  { id: "section-4", title: "4. Objeto de la Plataforma" },
  { id: "section-5", title: "5. Registro y Seguridad" },
  { id: "section-6", title: "6. Proceso de Compra" },
  { id: "section-7", title: "7. Precios y Cargos" },
  { id: "section-8", title: "8. Uso de Entradas" },
  { id: "section-9", title: "9. Condiciones de Acceso" },
  { id: "section-10", title: "10. Reembolsos" },
  { id: "section-11", title: "11. Derecho de Retracto" },
  { id: "section-12", title: "12. Pérdida y Robo" },
  { id: "section-13", title: "13. Propiedad Intelectual" },
  { id: "section-14", title: "14. Datos Personales" },
  { id: "section-15", title: "15. Limitación de Responsabilidad" },
  { id: "section-16", title: "16. Modificaciones" },
  { id: "section-17", title: "17. Ley Aplicable" },
  { id: "section-18", title: "18. Contacto" },
  { id: "section-b", title: "Parte B - Productores" },
  { id: "section-c", title: "Parte C - Disposiciones Finales" },
];

export default function TermsAndConditionsPage() {
  const [activeSection, setActiveSection] = useState<string>("section-1");
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const TableOfContents = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={mobile ? "" : "bg-background/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg"} style={mobile ? {} : { border: '1px solid #303030' }}>
      {!mobile && (
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
          Tabla de Contenido
        </h3>
      )}
      <ul className="space-y-1.5">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => scrollToSection(section.id)}
              className={`text-left text-sm transition-all w-full py-2.5 px-4 rounded-lg ${
                activeSection === section.id
                  ? "bg-[#303030]/20 text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              style={activeSection === section.id ? { border: '1px solid #303030' } : {}}
            >
              {section.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-16 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader className="border-b pb-4 mb-4">
                  <SheetTitle className="text-left">
                    Tabla de Contenido
                  </SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto">
                  <TableOfContents mobile />
                </div>
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="text-base font-bold">Hunt Tickets</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Términos y Condiciones
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 lg:grid lg:grid-cols-[300px_1fr] lg:gap-12 xl:gap-16 py-8 lg:py-12">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
          <TableOfContents />
        </aside>

        {/* Main content */}
        <main className="max-w-4xl">
          {/* Hero section */}
          <div className="mb-16 space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
                Términos y Condiciones de Uso
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground font-medium">
                Hunt Tickets S.A.S.
              </p>
            </div>
          </div>

          {/* Introduction */}
          <div className="mb-20">
            <div className="rounded-2xl bg-muted/30 p-8 lg:p-10" style={{ border: '1px solid #303030' }}>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="p-5 rounded-xl bg-card" style={{ border: '1px solid #303030' }}>
                  <p className="text-sm text-muted-foreground mb-1">Razón social</p>
                  <p className="font-semibold text-foreground">Hunt Tickets S.A.S.</p>
                </div>
                <div className="p-5 rounded-xl bg-card" style={{ border: '1px solid #303030' }}>
                  <p className="text-sm text-muted-foreground mb-1">NIT</p>
                  <p className="font-semibold text-foreground">901881747</p>
                </div>
                <div className="p-5 rounded-xl bg-card" style={{ border: '1px solid #303030' }}>
                  <p className="text-sm text-muted-foreground mb-1">Domicilio</p>
                  <p className="font-semibold text-foreground">Calle 94 #9-44, Bogotá D.C.</p>
                </div>
                <div className="p-5 rounded-xl bg-card" style={{ border: '1px solid #303030' }}>
                  <p className="text-sm text-muted-foreground mb-1">Correo</p>
                  <p className="font-semibold text-foreground">info@hunt-tickets.com</p>
                </div>
                <div className="p-5 rounded-xl bg-card sm:col-span-2" style={{ border: '1px solid #303030' }}>
                  <p className="text-sm text-muted-foreground mb-1">WhatsApp</p>
                  <p className="font-semibold text-foreground">+57 322 8597640</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <section id="section-1" className="mb-20 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-balance">
              1. Aceptación y Alcance
            </h2>
            <div className="space-y-4">
              <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4">
                  Al registrarse, acceder o utilizar los servicios de HUNT (la &ldquo;Plataforma&rdquo;), el Usuario declara que ha leído, comprende y acepta íntegramente estos Términos y Condiciones (&ldquo;T&C&rdquo;). Si no está de acuerdo, deberá abstenerse de usar la Plataforma.
                </p>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Estos T&C regulan el uso de: (i) la aplicación móvil, (ii) el sitio web, (iii) los módulos de venta, control de acceso y transferencia de entradas, y (iv) los demás canales habilitados por HUNT (incluido WhatsApp, cuando aplique).
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="mb-20 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-balance">
              2. Definiciones Básicas
            </h2>
            <div className="space-y-3">
              {[
                { term: "Usuario Comprador", def: "Persona que adquiere entradas a través de HUNT." },
                { term: "Asistente", def: "Persona que utiliza la entrada para ingresar al evento." },
                { term: "Productor/Organizador", def: "Persona natural o jurídica responsable de la realización del evento." },
                { term: "Entrada/Boleto", def: "Derecho de acceso a un evento, en formato digital o físico." },
                { term: "Servicios", def: "Conjunto de funcionalidades que provee HUNT." },
              ].map((item, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-card" style={{ border: '1px solid #303030' }}>
                  <p className="text-base text-foreground">
                    <span className="font-semibold">{item.term}:</span>{" "}
                    <span className="text-muted-foreground">{item.def}</span>
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="mb-20 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-balance">
              3. Naturaleza del Servicio e Intermediación
            </h2>
            <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                HUNT opera como plataforma tecnológica y operador de boletería, comercializando entradas por mandato de los Productores. La organización, realización, calidad, contenido, horarios, cambios de fecha o cancelaciones de los eventos no dependen de HUNT y son responsabilidad exclusiva del Productor. HUNT no es organizador ni coorganizador de los eventos.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="mb-20 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-balance">
              4. Objeto de la Plataforma
            </h2>
            <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4">
                A través de la Plataforma, los Usuarios pueden:
              </p>
              <ul className="space-y-3">
                {[
                  "Descubrir eventos",
                  "Comprar entradas",
                  "Recibir entradas digitales (por ejemplo, con código QR)",
                  "Transferir entradas a otros Usuarios habilitados",
                  "Recibir notificaciones, recordatorios y comunicaciones asociadas",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#303030] mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="mb-20 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-balance">
              5. Registro, Cuenta y Seguridad
            </h2>
            <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
              <ul className="space-y-4">
                {[
                  "El Usuario declara ser mayor de edad y tener capacidad legal para contratar.",
                  "La información suministrada debe ser veraz, completa y actualizada.",
                  "El Usuario es responsable por la confidencialidad de sus credenciales y por toda actividad realizada desde su cuenta.",
                  "HUNT podrá suspender o cancelar cuentas ante uso indebido, fraude o incumplimiento de estos T&C.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#303030] mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="mb-20 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-balance">
              6. Proceso de Compra y Entrega
            </h2>
            <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
              <ul className="space-y-4">
                {[
                  "Las transacciones están sujetas a verificación y aprobación por el banco, pasarela o medio de pago utilizado.",
                  "La entrega de la entrada se realizará en formato digital (o físico, si aplica), una vez aprobada la operación.",
                  "En compras con tarjeta, las devoluciones se realizarán al titular del medio de pago utilizado.",
                  "Por seguridad, HUNT puede anular, bloquear o invalidar entradas ante contracargos, fraude, uso de bots, suplantaciones o inconsistencias detectadas.",
                  "Cuando el evento cuente con localidades numeradas, el Comprador confirma número de entradas, función/fecha y ubicación antes de pagar.",
                  "Queda prohibido el uso de bots, multicuentas o cualquier sistema automatizado para comprar entradas.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#303030] mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section id="section-7" className="mb-20 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-balance">
              7. Precios, Cargos y Facturación
            </h2>
            <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
              <ul className="space-y-4">
                {[
                  "El Comprador acepta que, además del precio de la entrada fijado por el Productor, HUNT cobra un cargo por servicio.",
                  "Los cargos por servicio están gravados con IVA según la normatividad vigente.",
                  "Impuestos, tasas y contribuciones aplicables a la transacción serán informados y asumidos por quien corresponda conforme a ley.",
                  "En caso de errores de digitación o publicación manifiestos en precios, HUNT podrá anular la operación y realizar la reversión correspondiente.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#303030] mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section id="section-8" className="mb-20 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-balance">
              8. Uso de Entradas, Transferencias y Reventa
            </h2>
            <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
              <ul className="space-y-4">
                {[
                  "La entrada es válida exclusivamente para la fecha, hora, lugar y localidad indicados.",
                  "El Comprador/Asistente debe conservar su entrada (digital o física) durante el evento.",
                  "La transferencia de entradas es una funcionalidad sujeta a disponibilidad, requisitos de identificación y controles antifraude.",
                  "Queda prohibido usar la entrada para fines publicitarios o promocionales sin autorización previa y escrita del Productor.",
                  "La reventa no autorizada puede dar lugar a la anulación de la entrada sin derecho a reembolso.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#303030] mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 9 */}
          <section id="section-9" className="mb-20 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-balance">
              9. Condiciones de Acceso y Permanencia en el Evento
            </h2>
            <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
              <ul className="space-y-4">
                {[
                  "El ingreso está condicionado a la presentación de una entrada válida y al cumplimiento de las políticas del Productor y del Venue.",
                  "El personal de seguridad/logística podrá negar el acceso o retirar al Asistente por razones de seguridad, sin derecho a reembolso.",
                  "El Asistente asume los riesgos inherentes a eventos de afluencia masiva.",
                  "Pueden existir restricciones de edad u otras condiciones especiales de acceso informadas en cada evento.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#303030] mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 10 */}
          <section id="section-10" className="mb-20 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-balance">
              10. Reembolsos, Cancelaciones y Reprogramaciones
            </h2>
            <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
              <ul className="space-y-4">
                {[
                  "Como regla general, no hay cambios, reembolsos ni cancelaciones por errores del Comprador o por causas ajenas a HUNT.",
                  "Si el evento es cancelado o reprogramado, HUNT informará las instrucciones del Productor y el procedimiento aplicable.",
                  "Salvo instrucción en contrario del Productor o mandato legal/administrativo, los cargos por servicio no son reembolsables.",
                  "Cuando proceda una devolución, se efectuará al mismo medio de pago del titular de la compra.",
                  "Si hay contracargos sobre una transacción, las entradas asociadas podrán ser canceladas.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#303030] mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 11 */}
          <section id="section-11" className="mb-20 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-balance">
              11. Derecho de Retracto
            </h2>
            <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                El Usuario podrá ejercer el derecho de retracto en los términos y condiciones que contempla la Ley 1480 de 2011 &ldquo;Estatuto del consumidor&rdquo; en su artículo 47 para ventas no presenciales, cuando sea aplicable al tipo de servicio adquirido.
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section id="section-12" className="mb-20 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-balance">
              12. Pérdida, Robo, Deterioro, Falsificación
            </h2>
            <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
              <ul className="space-y-4">
                {[
                  "HUNT no repone entradas perdidas, deterioradas, rotas o robadas.",
                  "Entradas adulteradas, duplicadas o falsificadas serán anuladas; HUNT podrá adoptar medidas técnicas y legales correspondientes.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#303030] mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 13 */}
          <section id="section-13" className="mb-20 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-balance">
              13. Propiedad Intelectual
            </h2>
            <div className="space-y-6">
              <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-foreground">
                  Titularidad Integral
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Todo el contenido y activos de la Plataforma son de titularidad exclusiva de Hunt Tickets S.A.S. o de sus terceros licenciantes, incluyendo software, bases de datos, marcas, diseños, interfaces y cualquier otro elemento protegido por derechos de propiedad intelectual o industrial.
                </p>
              </div>

              <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-foreground">
                  Licencia Limitada al Usuario
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  El acceso a la Plataforma confiere al Usuario una licencia personal, revocable, no exclusiva, intransferible y no sublicenciable para usar los Servicios conforme a estos T&C.
                </p>
              </div>

              <div className="rounded-xl bg-[#303030]/10 p-6" style={{ border: '1px solid #303030' }}>
                <p className="text-sm sm:text-base text-foreground">
                  <span className="font-semibold">Nota importante:</span> Ante cualquier uso no autorizado de los activos protegidos de HUNT, ésta podrá ejercer acciones civiles, comerciales, administrativas y penales.
                </p>
              </div>
            </div>
          </section>

          {/* Section 14 */}
          <section id="section-14" className="mb-20 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-balance">
              14. Tratamiento de Datos Personales
            </h2>
            <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4">
                Al registrarse, el Usuario autoriza a HUNT para recolectar, almacenar, usar, analizar, circular, transmitir y compartir sus datos personales conforme a la Ley 1581 de 2012 para:
              </p>
              <ul className="space-y-3">
                {[
                  "Prestar los Servicios",
                  "Verificación antifraude y seguridad",
                  "Atención al usuario",
                  "Comunicaciones transaccionales y promocionales",
                  "Analítica de datos y personalización",
                  "Cumplimiento de obligaciones legales/contractuales",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#303030] mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 15 */}
          <section id="section-15" className="mb-20 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-balance">
              15. Limitación de Responsabilidad
            </h2>
            <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
              <ul className="space-y-4">
                {[
                  "HUNT no es responsable por la organización, realización, calidad, contenido, cambios, cancelaciones o condiciones del evento.",
                  "HUNT no será responsable por fallas de pasarelas o medios de pago, rechazo de transacciones o políticas de seguridad de terceros.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#303030] mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 16 */}
          <section id="section-16" className="mb-20 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-balance">
              16. Modificaciones a los T&C
            </h2>
            <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                HUNT podrá modificar estos T&C en cualquier momento. La versión vigente estará disponible en los canales oficiales. El uso continuado de la Plataforma implica aceptación de la versión vigente.
              </p>
            </div>
          </section>

          {/* Section 17 */}
          <section id="section-17" className="mb-20 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-balance">
              17. Ley Aplicable y Resolución de Controversias
            </h2>
            <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Estos T&C se rigen por las leyes de la República de Colombia. Cualquier controversia se resolverá ante los jueces de Bogotá D.C., sin perjuicio de los mecanismos alternativos de solución de controversias que las partes puedan adelantar.
              </p>
            </div>
          </section>

          {/* Section 18 */}
          <section id="section-18" className="mb-20 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-balance">
              18. Contacto y Canales de Atención
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-xl bg-card" style={{ border: '1px solid #303030' }}>
                <p className="text-sm text-muted-foreground mb-2">Correo electrónico</p>
                <p className="font-semibold text-foreground">info@hunt-tickets.com</p>
              </div>
              <div className="p-6 rounded-xl bg-card" style={{ border: '1px solid #303030' }}>
                <p className="text-sm text-muted-foreground mb-2">WhatsApp</p>
                <p className="font-semibold text-foreground">+57 322 8597640</p>
              </div>
              <div className="p-6 rounded-xl bg-card sm:col-span-2" style={{ border: '1px solid #303030' }}>
                <p className="text-sm text-muted-foreground mb-2">Dirección</p>
                <p className="font-semibold text-foreground">Calle 94 #9-44, Bogotá D.C., Colombia</p>
              </div>
            </div>
          </section>

          {/* Section B - Productores */}
          <section id="section-b" className="mb-20 scroll-mt-24">
            <div className="mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
                Parte B - Condiciones para Productores / Organizadores
              </h2>
              <p className="text-lg text-muted-foreground">
                Las siguientes condiciones aplican cuando el Productor contrata o utiliza los servicios de HUNT.
              </p>
            </div>

            <div className="space-y-8">
              {/* B1 */}
              <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  B1. Relación Contractual y Alcance
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed mb-4">
                  HUNT presta servicios de operador de boletería y software para la comercialización y gestión de accesos del evento. HUNT no es organizador, realizador, productor ni responsable de las obligaciones frente a asistentes, autoridades o terceros.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  El Productor es exclusivamente responsable por permisos, licencias, seguros, seguridad, logística, veracidad de información y cumplimiento normativo.
                </p>
              </div>

              {/* B2 */}
              <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  B2. Tarifas, Comisiones, Impuestos y Retención
                </h3>
                <ul className="space-y-3">
                  {[
                    "HUNT cobrará al Productor una comisión del diez por ciento (10%) del valor de cada boleta vendida, más el IVA aplicable únicamente sobre ese 10%.",
                    "La comisión aplica a todas las ventas de boletería del evento realizadas a través de HUNT, incluyendo ventas en efectivo y taquilla.",
                    "HUNT podrá retener su comisión e impuestos directamente del recaudo de boletería.",
                    "En ventas efectivo/taquilla, el Productor deberá reportar y transferir a HUNT el valor de la comisión dentro de los cinco (5) días hábiles.",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#303030] mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* B3 */}
              <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  B3. Liquidaciones y Desembolsos
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  HUNT liquidará y desembolsará al Productor el valor neto recaudado dentro de los diez (10) días hábiles siguientes a la fecha del evento, sujeto a contracargos, devoluciones y retenciones aplicables.
                </p>
              </div>

              {/* B4 */}
              <div className="rounded-2xl bg-card p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  B4. Contracargos, Fraude y Devoluciones
                </h3>
                <ul className="space-y-3">
                  {[
                    "Los contracargos y devoluciones derivados del evento son a cargo del Productor.",
                    "HUNT podrá anular transacciones y bloquear códigos ante riesgo de fraude, reventa no autorizada o uso de bots.",
                    "En cancelaciones o reprogramaciones, el Productor financiará las devoluciones que correspondan.",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#303030] mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Section C - Disposiciones Finales */}
          <section id="section-c" className="mb-12 scroll-mt-24">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-balance">
              Parte C - Disposiciones Finales
            </h2>
            <div className="rounded-2xl bg-[#303030]/10 p-6 lg:p-8" style={{ border: '1px solid #303030' }}>
              <ul className="space-y-4">
                {[
                  "Estos T&C sustituyen versiones anteriores.",
                  "La nulidad de alguna cláusula no afectará la validez del resto.",
                  "Las comunicaciones se entenderán válidas cuando se envíen a los datos de contacto registrados en HUNT.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-foreground mt-2 flex-shrink-0" />
                    <span className="text-foreground text-base font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-[#303030]">
                <p className="text-base sm:text-lg leading-relaxed text-foreground font-semibold">
                  Al usar la Plataforma, el Usuario y/o el Productor manifiestan su aceptación libre, expresa e informada de estos Términos y Condiciones.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
