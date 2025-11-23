import { MercadoPagoConfig, Preference, OAuth } from "mercadopago";

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

export async function submit(marketplace: string) {
  // Creamos el cliente de Mercado Pago usando el access token del Marketplace
  const client: MercadoPagoConfig = new MercadoPagoConfig({
    accessToken: marketplace,
  });

  // Creamos la preferencia incluyendo el precio, titulo y metadata. La información de `items` es standard de Mercado Pago. La información que nosotros necesitamos para nuestra DB debería vivir en `metadata`.
  const preference = await new Preference(client).create({
    body: {
      items: [
        {
          id: "message",
          unit_price: 10000,
          quantity: 1,
          title: "Mensaje de muro",
        },
      ],
      metadata: {},
      // Le agregamos COP $3.000 de comisión
      marketplace_fee: 3000,
    },
  });

  // Devolvemos el init point (url de pago) para que el usuario pueda pagar
  return preference.init_point!;
}
