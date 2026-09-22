import type { QRContentType } from "@/types/qr";

/**
 * Interface for normalized QR content payloads.
 * Decouples domain form fields from the raw string payload passed to the QR renderer.
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
  phone: {
    number: string;
  };
  sms: {
    phone: string;
    message?: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  upi: {
    pa: string; // Payee address (UPI ID)
    pn: string; // Payee name
    am?: string; // Amount
    tn?: string; // Note
    cu?: string; // Currency (defaults to INR)
  };
  event: {
    title: string;
    startDate: string;
    endDate?: string;
    location?: string;
    description?: string;
  };
}

/**
 * Encoders convert structured data into standardized QR payload strings
 * conforming to industry standards (MECARD/vCard, MeBKM, mailto, WIFI, UPI).
 */
export const qrEncoders = {
  url: (data: QRContentPayloadMap["url"]): string => {
    return data.url.trim();
  },

  text: (data: QRContentPayloadMap["text"]): string => {
    return data.text;
  },

  wifi: (data: QRContentPayloadMap["wifi"]): string => {
    const escape = (str: string) => str.replace(/([\\;,:"])/g, "\\$1");
    const ssid = escape(data.ssid);
    const pass = data.password ? escape(data.password) : "";
    const type = data.security;
    const hidden = data.hidden ? "H:true;" : "";
    return `WIFI:T:${type};S:${ssid};P:${pass};${hidden};`;
  },

  vcard: (data: QRContentPayloadMap["vcard"]): string => {
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${data.lastName || ""};${data.firstName};;;`,
      `FN:${data.firstName} ${data.lastName || ""}`.trim(),
    ];
    if (data.organization) lines.push(`ORG:${data.organization}`);
    if (data.title) lines.push(`TITLE:${data.title}`);
    if (data.phone) lines.push(`TEL;TYPE=CELL:${data.phone}`);
    if (data.email) lines.push(`EMAIL:${data.email}`);
    if (data.url) lines.push(`URL:${data.url}`);
    lines.push("END:VCARD");
    return lines.join("\n");
  },

  email: (data: QRContentPayloadMap["email"]): string => {
    const params = new URLSearchParams();
    if (data.subject) params.append("subject", data.subject);
    if (data.body) params.append("body", data.body);
    const query = params.toString();
    return `mailto:${data.to.trim()}${query ? `?${query}` : ""}`;
  },

  phone: (data: QRContentPayloadMap["phone"]): string => {
    return `tel:${data.number.replace(/\s+/g, "")}`;
  },

  sms: (data: QRContentPayloadMap["sms"]): string => {
    const num = data.phone.replace(/\s+/g, "");
    return data.message ? `smsto:${num}:${data.message}` : `smsto:${num}`;
  },

  location: (data: QRContentPayloadMap["location"]): string => {
    return `geo:${data.latitude},${data.longitude}`;
  },

  upi: (data: QRContentPayloadMap["upi"]): string => {
    const params = new URLSearchParams();
    params.append("pa", data.pa.trim());
    params.append("pn", data.pn.trim());
    if (data.am && Number(data.am) > 0) params.append("am", data.am);
    if (data.tn) params.append("tn", data.tn);
    params.append("cu", data.cu || "INR");
    return `upi://pay?${params.toString()}`;
  },

  event: (data: QRContentPayloadMap["event"]): string => {
    const lines = [
      "BEGIN:VEVENT",
      `SUMMARY:${data.title}`,
      `DTSTART:${data.startDate.replace(/[-:]/g, "")}`,
    ];
    if (data.endDate) {
      lines.push(`DTEND:${data.endDate.replace(/[-:]/g, "")}`);
    }
    if (data.location) lines.push(`LOCATION:${data.location}`);
    if (data.description) lines.push(`DESCRIPTION:${data.description}`);
    lines.push("END:VEVENT");
    return lines.join("\n");
  },
};

/**
 * Universal payload serializer.
 * Given a type and its payload data, produces the standardized QR string.
 */
export function encodePayload<K extends QRContentType>(
  type: K,
  data: QRContentPayloadMap[K]
): string {
  const encoder = qrEncoders[type] as (d: QRContentPayloadMap[K]) => string;
  if (!encoder) {
    throw new Error(`Unsupported QR content type: ${type}`);
  }
  return encoder(data);
}
