"use server";

import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getPreferenceClient, getBaseUrl, isMpConfigured } from "@/lib/mp";

interface CreatePreferenceParams {
  raffleId: string;
  raffleTitle: string;
  ticketIds: string[];
  numbers: number[];
  totalAmount: number;
  buyerName: string;
  buyerPhone: string;
}

export async function createPaymentPreference(params: CreatePreferenceParams) {
  if (!isMpConfigured()) {
    return { error: "Mercado Pago no está configurado. Contactá al administrador." };
  }

  const {
    raffleId,
    raffleTitle,
    ticketIds,
    numbers,
    totalAmount,
    buyerName,
    buyerPhone,
  } = params;

  // Verify tickets are still reserved by this buyer
  const validTickets = await db
    .select({ id: tickets.id, number: tickets.number, status: tickets.status })
    .from(tickets)
    .where(
      and(
        eq(tickets.raffleId, raffleId),
        inArray(tickets.id, ticketIds),
        eq(tickets.status, "reserved"),
      ),
    );

  if (validTickets.length === 0) {
    return { error: "Los números ya no están reservados. Volvé a seleccionarlos." };
  }

  if (validTickets.length !== ticketIds.length) {
    return { error: "Algunos números ya no están disponibles. Volvé a intentar." };
  }

  const baseUrl = getBaseUrl();
  const numberList = numbers
    .sort((a, b) => a - b)
    .map((n) => String(n).padStart(3, "0"))
    .join(", ");

  const externalRef = `${raffleId}:${ticketIds.join(",")}`;

  try {
    const preference = await getPreferenceClient().create({
      body: {
        items: [
          {
            id: raffleId,
            title: raffleTitle,
            description: `Números: ${numberList}`,
            quantity: 1,
            unit_price: totalAmount,
            currency_id: "ARS",
          },
        ],
        payer: {
          name: buyerName,
          phone: {
            area_code: "",
            number: buyerPhone.replace(/^\+?54/, ""),
          },
        },
        external_reference: externalRef,
        notification_url: `${baseUrl}/api/webhooks/mp`,
        back_urls: {
          success: `${baseUrl}/rifa/${raffleId}?mp=success`,
          pending: `${baseUrl}/rifa/${raffleId}?mp=pending`,
          failure: `${baseUrl}/rifa/${raffleId}?mp=failure`,
        },
        auto_return: "approved",
      },
    });

    if (!preference.id || !preference.init_point) {
      return { error: "Error al crear el pago. Intentá de nuevo." };
    }

    return {
      success: true,
      initPoint: preference.init_point,
      preferenceId: preference.id,
    };
  } catch (err) {
    console.error("MP createPreference error:", err);
    return {
      error:
        "Error al conectar con Mercado Pago. Usá transferencia manual.",
    };
  }
}
