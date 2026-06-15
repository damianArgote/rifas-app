import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

let _client: MercadoPagoConfig | null = null;
let _preference: Preference | null = null;
let _payment: Payment | null = null;

function ensureClients() {
  if (_preference) return;
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN no configurado");
  _client = new MercadoPagoConfig({
    accessToken: token,
    options: { timeout: 10000 },
  });
  _preference = new Preference(_client);
  _payment = new Payment(_client);
}

export function isMpConfigured() {
  return !!process.env.MP_ACCESS_TOKEN;
}

export function getBaseUrl() {
  const url =
    process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ??
    `http://localhost:${process.env.PORT ?? 3000}`;

  return url.replace(/\/$/, "");
}

export function getPreferenceClient(): Preference {
  ensureClients();
  return _preference!;
}

export function getPaymentClient(): Payment {
  ensureClients();
  return _payment!;
}
