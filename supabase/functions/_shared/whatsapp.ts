export type WhatsappSubmission = {
  id: string;
  first_name: string;
  last_name: string;
  phone_normalized: string;
  message: string;
  created_at?: string;
};

type WhatsappSuccess = {
  ok: true;
  messageId: string | null;
  response: unknown;
};

type WhatsappFailure = {
  ok: false;
  error: string;
  response?: unknown;
};

export type WhatsappResult = WhatsappSuccess | WhatsappFailure;

const TEMPLATE_NAME = "new_reservation_request";
const TEMPLATE_LANGUAGE = "tr";

function formatTimestamp(value?: string): string {
  const date = value ? new Date(value) : new Date();

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(date);
}

function templateText(value: string): { type: "text"; text: string } {
  return {
    type: "text",
    text: value,
  };
}

export async function sendWhatsappTemplate(
  submission: WhatsappSubmission,
): Promise<WhatsappResult> {
  const token = Deno.env.get("WHATSAPP_TOKEN");
  const phoneId = Deno.env.get("WHATSAPP_PHONE_ID");
  const ownerPhone = Deno.env.get("OWNER_PHONE")?.replace(/[^\d]/g, "");
  const graphVersion = Deno.env.get("WHATSAPP_GRAPH_VERSION") ?? "v23.0";

  if (!token || !phoneId || !ownerPhone) {
    return {
      ok: false,
      error: "WhatsApp configuration is missing.",
    };
  }

  const payload = {
    messaging_product: "whatsapp",
    to: ownerPhone,
    type: "template",
    template: {
      name: TEMPLATE_NAME,
      language: {
        code: TEMPLATE_LANGUAGE,
      },
      components: [
        {
          type: "body",
          parameters: [
            templateText(submission.first_name),
            templateText(submission.last_name),
            templateText(submission.phone_normalized),
            templateText(submission.message.slice(0, 900)),
            templateText(formatTimestamp(submission.created_at)),
          ],
        },
      ],
    },
  };

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      error: `WhatsApp API failed with ${response.status}.`,
      response: responseBody,
    };
  }

  return {
    ok: true,
    messageId: responseBody?.messages?.[0]?.id ?? null,
    response: responseBody,
  };
}
