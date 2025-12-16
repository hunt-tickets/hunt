import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface ForgotPasswordEmailProps {
  username: string;
  resetUrl: string;
  userEmail: string;
}

const ForgotPasswordEmail = (props: ForgotPasswordEmailProps) => {
  const { username, resetUrl, userEmail } = props;

  return (
    <Html lang="es" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>Restablecer tu contraseña de Hunt Tickets</Preview>
        <Body className="bg-gray-50 font-sans py-[40px]">
          <Container className="bg-white rounded-[16px] p-[40px] max-w-[580px] mx-auto shadow-lg">
            <Section>
              {/* Header with Logo */}
              <div className="text-center mb-[32px]">
                <Img
                  src="https://jtfcfsnksywotlbsddqb.supabase.co/storage/v1/object/public/default/hunt_logo.png"
                  alt="Hunt Tickets"
                  width="140"
                  height="46"
                  className="mx-auto"
                />
              </div>

              {/* Reset Message */}
              <Text className="text-[28px] font-bold text-gray-900 mb-[8px] mt-0 text-center">
                Restablecer contraseña
              </Text>

              <Text className="text-[16px] text-gray-600 mb-[32px] mt-0 text-center leading-[26px]">
                Hola {username}, vamos a recuperar el acceso a tu cuenta
              </Text>

              {/* Main CTA Button */}
              <Section className="text-center mb-[32px]">
                <Button
                  href={resetUrl}
                  style={{
                    backgroundColor: "#000000",
                    color: "#ffffff",
                    padding: "16px 48px",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "600",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Restablecer Contraseña →
                </Button>
              </Section>

              {/* Security Info Section */}
              <Section className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-[12px] p-[24px] mb-[24px] border border-purple-200">
                <Text className="text-[14px] font-semibold text-gray-900 mb-[12px] mt-0">
                  🔐 Información de seguridad:
                </Text>
                <div className="space-y-[8px]">
                  <Text className="text-[14px] text-gray-600 m-0 leading-[20px]">
                    ✓ Este enlace expira en 1 hora
                  </Text>
                  <Text className="text-[14px] text-gray-600 m-0 leading-[20px]">
                    ✓ Crearás una nueva contraseña en la siguiente página
                  </Text>
                  <Text className="text-[14px] text-gray-600 m-0 leading-[20px]">
                    ✓ Tu cuenta estará protegida inmediatamente
                  </Text>
                </div>
              </Section>

              {/* Alternative Link Section */}
              <Section className="bg-amber-50 border border-amber-200 rounded-[8px] p-[16px] mb-[24px]">
                <Text className="text-[13px] text-gray-700 m-0 mb-[8px]">
                  ¿El botón no funciona? Copia este enlace:
                </Text>
                <Text className="text-[12px] text-blue-600 m-0 break-all font-mono">
                  {resetUrl}
                </Text>
              </Section>

              {/* Not You Section */}
              <Section className="bg-gray-50 border border-gray-200 rounded-[8px] p-[16px] mb-[24px]">
                <Text className="text-[13px] text-gray-700 m-0">
                  <strong>¿No solicitaste esto?</strong> Puedes ignorar este
                  correo de forma segura. Tu contraseña no será modificada a
                  menos que hagas clic en el enlace.
                </Text>
              </Section>

              {/* Account Info */}
              <Text className="text-[13px] text-gray-500 text-center mb-[24px] mt-0">
                Esta solicitud fue enviada a: {userEmail}
              </Text>

              <Hr className="border-gray-200 my-[24px]" />

              {/* Footer */}
              <Text className="text-[14px] text-gray-600 text-center m-0">
                ¿Necesitas ayuda? Escríbenos a info@hunt-tickets.com
                <br />
                <span className="text-[13px] text-gray-400">
                  Hunt Tickets - Tu plataforma de eventos
                </span>
              </Text>
            </Section>
          </Container>

          {/* Copyright Footer */}
          <Text className="text-[11px] text-gray-400 text-center mt-[24px] mb-0">
            © {new Date().getFullYear()} Hunt Tickets S.A.S. NIT 901881747-0.
            Todos los derechos reservados.
          </Text>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ForgotPasswordEmail;
