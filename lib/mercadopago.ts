import { MercadoPagoConfig, OAuth } from "mercadopago";

export const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

// Generar la URL a donde vamos a redirigir al usuario para que autorice al Marketplace a crear preferencias de pago en su nombre
export async function getMercadopagoAuthorizationUrl(organizationId?: string) {
  // Use organization ID directly as state parameter (simpler format)
  const state = organizationId || undefined;

  // Obtenemos la url de autorización
  const url = new OAuth(mercadopago).getAuthorizationURL({
    options: {
      client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
      redirect_uri: `${process.env.APP_URL}/api/mercadopago/connect`,
      state,
    },
  });

  console.log(url);

  // Devolvemos la url
  return url;
}

export async function connectMercadopagoAccount(code: string) {
  // Obtenemos las credenciales del usuario usando el code que obtuvimos de oauth
  const credentials = await new OAuth(mercadopago).create({
    body: {
      client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
      client_secret: process.env.MP_CLIENT_SECRET,
      code,
      redirect_uri: `${process.env.APP_URL}/api/mercadopago/connect`,
    },
  });

  // Devolvemos las credenciales (access token)
  return credentials;
}

export async function getMercadopagoUserInfo(accessToken: string) {
  try {
    // Fetch user information from MercadoPago API
    const response = await fetch("https://api.mercadopago.com/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`MercadoPago API error: ${response.status}`);
    }

    const userInfo = await response.json();
    return userInfo;
  } catch (error) {
    console.error("Error fetching MercadoPago user info:", error);
    return null;
  }
}

/**
 * Refresh an expired or soon-to-expire MercadoPago access token
 *
 * According to MercadoPago docs:
 * - Access tokens are valid for 180 days
 * - When you refresh the access_token, the refresh_token is also refreshed
 * - You need to store both the new access_token and refresh_token
 *
 * @param refreshToken - The refresh token from the database
 * @returns New credentials with updated access_token and refresh_token
 */
export async function refreshMercadopagoToken(refreshToken: string) {
  try {
    // Use the OAuth client to refresh the token
    const credentials = await new OAuth(mercadopago).refresh({
      body: {
        client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
        client_secret: process.env.MP_CLIENT_SECRET,
        refresh_token: refreshToken,
      },
    });

    // Return the new credentials
    // Contains: access_token, refresh_token, expires_in, scope, etc.
    return credentials;
  } catch (error) {
    console.error("Error refreshing MercadoPago token:", error);
    throw new Error("Failed to refresh MercadoPago token");
  }
}

/**
 * Check if a token needs to be refreshed
 * Best practice: Refresh tokens 30 days before expiration to avoid service interruption
 *
 * @param expiresAt - The token expiration date from database
 * @returns true if token should be refreshed
 */
export function shouldRefreshToken(expiresAt: Date | null): boolean {
  if (!expiresAt) {
    // If no expiration date, assume it needs refresh
    return true;
  }

  const now = new Date();
  const daysUntilExpiry = Math.floor(
    (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Refresh if less than 30 days until expiration
  return daysUntilExpiry < 30;
}

// export async function submit(marketplace: string) {
//   // Creamos el cliente de Mercado Pago usando el access token del Marketplace
//   const client: MercadoPagoConfig = new MercadoPagoConfig({
//     accessToken: marketplace,
//   });

//   // Creamos la preferencia incluyendo el precio, titulo y metadata. La información de `items` es standard de Mercado Pago. La información que nosotros necesitamos para nuestra DB debería vivir en `metadata`.
//   const preference = await new Preference(client).create({
//     body: {
//       items: [
//         {
//           id: "message",
//           unit_price: 10000,
//           quantity: 1,
//           title: "Mensaje de muro",
//         },
//       ],
//       metadata: {},
//       // Le agregamos COP $3.000 de comisión
//       marketplace_fee: 3000,
//     },
//   });

//   // Devolvemos el init point (url de pago) para que el usuario pueda pagar
//   return preference.init_point!;
// }
