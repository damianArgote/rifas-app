import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const accessToken = process.env.MP_ACCESS_TOKEN;

if (!accessToken) {
  console.warn("MP_ACCESS_TOKEN no configurado — Mercado Pago deshabilitado");
}

const client = new MercadoPagoConfig({
  accessToken: accessToken ?? "",
  options: { timeout: 10000 },
});

export const preferenceClient = accessToken
  ? new Preference(client)
  : null;

export const paymentClient = accessToken
  ? new Payment(client)
  : null;

export function isMpConfigured() {
  return !!accessToken;
}

export function getBaseUrl() {
  return process.env.SITE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
}
