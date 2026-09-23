import type { QRContentType } from "@/types/qr";

/**
 * Interface for normalized QR content payloads.
 * Decouples form field representations from the raw string payload passed to the QR renderer.
 */
export interface QRContentPayloadMap {
  url: {
    url: string;
  };
  text: {
    text: string;
  };
  wifi: {
    ssid: string;
    password?: string;
    security: "WPA" | "WEP" | "nopass";
    hidden?: boolean;
  };
  vcard: {
    firstName: string;
    lastName?: string;
    phone?: string;
    email?: string;
    organization?: string;
    title?: string;
    url?: string;
  };
  email: {
    to: string;
    subject?: string;
    body?: string;
  };
  upi: {
    pa: string; // Payee Address (UPI ID)
    pn?: string; // Payee Name
    am?: string; // Amount
    tn?: string; // Note / Remarks
    cu?: string; // Currency
  };
}

/**
 * Wi-Fi string escaping according to the ZXing standard:
 * Escapes characters '\', ';', ',', ':', '"' with a leading backslash.
 */
function escapeWifi(str: string): string {
  return str.replace(/([\\;,:\"])/g, "\\$1");
}

/**
 * Encoders convert structured data into standardized QR payload strings
 * conforming to industry standards (RFC, ZXing, MECARD/vCard 3.0, NPCI UPI).
 */
export const qrEncoders = {
  url: (data: QRContentPayloadMap["url"]): string => {
    return data.url.trim();
  },

  text: (data: QRContentPayloadMap["text"]): string => {
    return data.text;
  },

  wifi: (data: QRContentPayloadMap["wifi"]): string => {
    const ssid = escapeWifi(data.ssid.trim());
    const sec = data.security;
    let payload = `WIFI:T:${sec};S:${ssid};`;
    if (sec !== "nopass" && data.password) {
      payload += `P:${escapeWifi(data.password)};`;
    }
    if (data.hidden) {
      payload += "H:true;";
    }
    payload += ";";
    return payload;
  },

  vcard: (data: QRContentPayloadMap["vcard"]): string => {
    const first = data.firstName.trim();
    const last = (data.lastName || "").trim();
    const formattedName = last ? `${first} ${last}` : first;

    const lines: string[] = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${last};${first};;;`,
      `FN:${formattedName}`,
    ];

    if (data.organization?.trim()) {
      lines.push(`ORG:${data.organization.trim()}`);
    }
    if (data.title?.trim()) {
      lines.push(`TITLE:${data.title.trim()}`);
    }
    if (data.phone?.trim()) {
      lines.push(`TEL;TYPE=CELL:${data.phone.trim()}`);
    }
    if (data.email?.trim()) {
      lines.push(`EMAIL:${data.email.trim()}`);
    }
    if (data.url?.trim()) {
      lines.push(`URL:${data.url.trim()}`);
    }

    lines.push("END:VCARD");
    return lines.join("\n");
  },

  email: (data: QRContentPayloadMap["email"]): string => {
    const to = data.to.trim();
    const queryParts: string[] = [];

    if (data.subject?.trim()) {
      queryParts.push(`subject=${encodeURIComponent(data.subject.trim())}`);
    }
    if (data.body?.trim()) {
      queryParts.push(`body=${encodeURIComponent(data.body.trim())}`);
    }

    const query = queryParts.join("&");
    return query ? `mailto:${to}?${query}` : `mailto:${to}`;
  },

  upi: (data: QRContentPayloadMap["upi"]): string => {
    const params = new URLSearchParams();
    params.append("pa", data.pa.trim());

    if (data.pn?.trim()) {
      params.append("pn", data.pn.trim());
    }
    if (data.am?.trim()) {
      const num = Number(data.am.trim());
      if (!isNaN(num) && num > 0) {
        params.append("am", num.toFixed(2));
      }
    }
    if (data.tn?.trim()) {
      params.append("tn", data.tn.trim());
    }
    params.append("cu", data.cu || "INR");

    return `upi://pay?${params.toString()}`;
  },
};

/**
 * Universal payload serializer.
 * Given a type and its payload data, produces the standardized QR string.
 */
export function encodePayload<K extends keyof QRContentPayloadMap>(
  type: K,
  data: QRContentPayloadMap[K]
): string {
  const encoder = qrEncoders[type] as (d: QRContentPayloadMap[K]) => string;
  if (!encoder) {
    throw new Error(`Unsupported QR content type: ${type}`);
  }
  return encoder(data);
}
