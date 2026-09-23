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
    defaultData: { url: "" },
    validate: (data) => validateUrl(data.url),
    encode: (data) => encodePayload("url", data),
    getSummary: (data) => data.url.trim() || "Empty URL",
  },

  text: {
    type: "text",
    label: "Plain Text",
    defaultData: { text: "" },
    validate: (data) => validateText(data.text),
    encode: (data) => encodePayload("text", data),
    getSummary: (data) => (data.text.trim() ? `${data.text.trim().slice(0, 48)}...` : "Empty text"),
  },

  wifi: {
    type: "wifi",
    label: "Wi-Fi",
    defaultData: { ssid: "", password: "", security: "WPA", hidden: false },
    validate: (data) => validateWifi(data),
    encode: (data) => encodePayload("wifi", data),
    getSummary: (data) =>
      data.ssid.trim() ? `Network: ${data.ssid.trim()} (${data.security})` : "Configure Wi-Fi",
  },

  vcard: {
    type: "vcard",
    label: "Contact",
    defaultData: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      organization: "",
      title: "",
      url: "",
    },
    validate: (data) => validateVCard(data),
    encode: (data) => encodePayload("vcard", data),
    getSummary: (data) =>
      data.firstName.trim()
        ? `${data.firstName.trim()} ${data.lastName?.trim() || ""} • ${data.organization?.trim() || data.phone?.trim() || "Contact"}`.trim()
        : "Contact Card",
  },

  email: {
    type: "email",
    label: "Email",
    defaultData: {
      to: "",
      subject: "",
      body: "",
    },
    validate: (data) => validateEmail(data.to),
    encode: (data) => encodePayload("email", data),
    getSummary: (data) =>
      data.to.trim() ? `Mail to: ${data.to.trim()}${data.subject?.trim() ? ` (${data.subject.trim()})` : ""}` : "Compose Email",
  },

  upi: {
    type: "upi",
    label: "UPI Payment",
    defaultData: {
      pa: "",
      pn: "",
      am: "",
      tn: "",
      cu: "INR",
    },
    validate: (data) => validateUpi(data),
    encode: (data) => encodePayload("upi", data),
    getSummary: (data) =>
      data.pa.trim()
        ? `Pay ${data.am?.trim() ? `₹${data.am.trim()} to ` : ""}${data.pn?.trim() || data.pa.trim()}`
        : "UPI Payment Request",
  },
};
