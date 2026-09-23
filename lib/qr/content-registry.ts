import type { QRContentType } from "@/types/qr";
import {
  type QRContentPayloadMap,
  encodePayload,
} from "./encoder";
import {
  validateUrl,
  validateText,
  validateWifi,
  validateVCard,
  validateEmail,
  validateUpi,
  type ValidationResult,
} from "@/lib/validation/qr-validators";

export interface QRTypeHandler<K extends keyof QRContentPayloadMap = keyof QRContentPayloadMap> {
  type: K;
  label: string;
  defaultData: QRContentPayloadMap[K];
  validate: (data: QRContentPayloadMap[K]) => ValidationResult;
  encode: (data: QRContentPayloadMap[K]) => string;
  getSummary: (data: QRContentPayloadMap[K]) => string;
}

export const QR_TYPE_HANDLERS: {
  [K in keyof QRContentPayloadMap]: QRTypeHandler<K>;
} = {
  url: {
    type: "url",
    label: "URL",
    defaultData: { url: "https://github.com" },
    validate: (data) => validateUrl(data.url),
    encode: (data) => encodePayload("url", data),
    getSummary: (data) => data.url || "Empty URL",
  },

  text: {
    type: "text",
    label: "Plain Text",
    defaultData: { text: "Hello from QR Studio!" },
    validate: (data) => validateText(data.text),
    encode: (data) => encodePayload("text", data),
    getSummary: (data) => (data.text ? `${data.text.slice(0, 48)}...` : "Empty text"),
  },

  wifi: {
    type: "wifi",
    label: "Wi-Fi",
    defaultData: { ssid: "Studio_WiFi", password: "", security: "WPA", hidden: false },
    validate: (data) => validateWifi(data),
    encode: (data) => encodePayload("wifi", data),
    getSummary: (data) =>
      data.ssid ? `Network: ${data.ssid} (${data.security})` : "Configure Wi-Fi",
  },

  vcard: {
    type: "vcard",
    label: "Contact",
    defaultData: {
      firstName: "Alex",
      lastName: "Rivera",
      phone: "+1 555-0199",
      email: "alex@example.com",
      organization: "QR Studio",
      title: "Product Lead",
      url: "https://example.com",
    },
    validate: (data) => validateVCard(data),
    encode: (data) => encodePayload("vcard", data),
    getSummary: (data) =>
      data.firstName
        ? `${data.firstName} ${data.lastName || ""} • ${data.organization || data.phone || "vCard"}`.trim()
        : "Contact Card",
  },

  email: {
    type: "email",
    label: "Email",
    defaultData: {
      to: "contact@example.com",
      subject: "Hello from QR Studio",
      body: "Hi, I scanned your QR code and wanted to connect.",
    },
    validate: (data) => validateEmail(data.to),
    encode: (data) => encodePayload("email", data),
    getSummary: (data) =>
      data.to ? `Mail to: ${data.to}${data.subject ? ` (${data.subject})` : ""}` : "Compose Email",
  },

  upi: {
    type: "upi",
    label: "UPI Payment",
    defaultData: {
      pa: "merchant@bank",
      pn: "QR Studio Store",
      am: "150.00",
      tn: "Payment for order",
      cu: "INR",
    },
    validate: (data) => validateUpi(data),
    encode: (data) => encodePayload("upi", data),
    getSummary: (data) =>
      data.pa
        ? `Pay ${data.am ? `₹${data.am} to ` : ""}${data.pn || data.pa}`
        : "UPI Payment Request",
  },
};
