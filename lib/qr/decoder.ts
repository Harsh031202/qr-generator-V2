/**
 * Comprehensive client-side QR Code payload decoder.
 * Parses raw decoded strings into rich structured fields for Wi-Fi, vCard, Email, UPI, URL, and Plain Text.
 */

export type DecodedQRType = "wifi" | "vcard" | "email" | "upi" | "url" | "text";

export interface DecodedWifiPayload {
  type: "wifi";
  raw: string;
  ssid: string;
  password?: string;
  security: string;
  hidden: boolean;
}

export interface DecodedVCardPayload {
  type: "vcard";
  raw: string;
  formattedName: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  url?: string;
  address?: string;
  note?: string;
}

export interface DecodedEmailPayload {
  type: "email";
  raw: string;
  to: string;
  subject?: string;
  body?: string;
}

export interface DecodedUpiPayload {
  type: "upi";
  raw: string;
  pa: string; // VPA / UPI ID
  pn?: string; // Payee Name
  am?: string; // Amount
  tn?: string; // Note
  cu?: string; // Currency
}

export interface DecodedUrlPayload {
  type: "url";
  raw: string;
  url: string;
  hostname: string;
  protocol: string;
  pathname?: string;
  search?: string;
}

export interface DecodedTextPayload {
  type: "text";
  raw: string;
  text: string;
  charCount: number;
  wordCount: number;
}

export type DecodedQRPayload =
  | DecodedWifiPayload
  | DecodedVCardPayload
  | DecodedEmailPayload
  | DecodedUpiPayload
  | DecodedUrlPayload
  | DecodedTextPayload;

/**
 * Tokenizes ZXing-standard Wi-Fi strings, handling escaped characters (\;, \:, \\, \", etc.)
 */
function parseWifiTags(raw: string): Record<string, string> {
  const content = raw.replace(/^wifi:/i, "");
  const tags: Record<string, string> = {};
  let currentKey = "";
  let currentVal = "";
  let readingKey = true;
  let i = 0;

  while (i < content.length) {
    const char = content[i];
    if (char === "\\" && i + 1 < content.length) {
      currentVal += content[i + 1];
      i += 2;
      continue;
    }
    if (readingKey) {
      if (char === ":") {
        readingKey = false;
      } else {
        currentKey += char;
      }
    } else {
      if (char === ";") {
        if (currentKey) {
          tags[currentKey.toUpperCase()] = currentVal;
        }
        currentKey = "";
        currentVal = "";
        readingKey = true;
      } else {
        currentVal += char;
      }
    }
    i++;
  }
  if (currentKey && !readingKey) {
    tags[currentKey.toUpperCase()] = currentVal;
  }
  return tags;
}

/**
 * Parses Wi-Fi configuration (ZXing format).
 */
export function parseWifi(raw: string): DecodedWifiPayload | null {
  if (!raw.toLowerCase().startsWith("wifi:")) return null;

  const tags = parseWifiTags(raw);
  const ssid = tags["S"] || "Unnamed Network";
  const password = tags["P"] || undefined;
  const rawSec = (tags["T"] || "nopass").toUpperCase();
  const security =
    rawSec === "WPA" || rawSec === "WPA2" || rawSec === "WPA3"
      ? "WPA / WPA2"
      : rawSec === "WEP"
      ? "WEP"
      : rawSec === "NOPASS" || !rawSec
      ? "Open (No Password)"
      : rawSec;
  const hidden = tags["H"] === "true" || tags["H"] === "1";

  return {
    type: "wifi",
    raw,
    ssid,
    password,
    security,
    hidden,
  };
}

/**
 * Parses vCard 2.1/3.0/4.0 or MECARD formatted contact info.
 */
export function parseVCard(raw: string): DecodedVCardPayload | null {
  const trimmed = raw.trim();

  // Standard vCard
  if (/^BEGIN:VCARD/i.test(trimmed)) {
    const rawLines = trimmed.split(/\r?\n/);
    const unfoldedLines: string[] = [];

    // Unfold multiline fields starting with space/tab
    for (const line of rawLines) {
      if (/^\s/.test(line) && unfoldedLines.length > 0) {
        unfoldedLines[unfoldedLines.length - 1] += line.trim();
      } else {
        unfoldedLines.push(line.trim());
      }
    }

    let fn = "";
    let lastName = "";
    let firstName = "";
    let org = "";
    let title = "";
    let phone = "";
    let email = "";
    let url = "";
    let address = "";
    let note = "";

    for (const line of unfoldedLines) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;

      const keyPart = line.substring(0, colonIdx).toUpperCase();
      const val = line.substring(colonIdx + 1).trim();

      if (keyPart === "FN") {
        fn = val;
      } else if (keyPart === "N") {
        const parts = val.split(";");
        lastName = parts[0] || "";
        firstName = parts[1] || "";
      } else if (keyPart.startsWith("ORG")) {
        org = val.replace(/;/g, " - ").trim();
      } else if (keyPart.startsWith("TITLE")) {
        title = val;
      } else if (keyPart.startsWith("TEL")) {
        if (!phone) phone = val;
      } else if (keyPart.startsWith("EMAIL")) {
        if (!email) email = val;
      } else if (keyPart.startsWith("URL")) {
        if (!url) url = val;
      } else if (keyPart.startsWith("ADR")) {
        address = val.replace(/;/g, " ").trim();
      } else if (keyPart.startsWith("NOTE")) {
        note = val;
      }
    }

    const formattedName = fn || [firstName, lastName].filter(Boolean).join(" ") || "Contact";

    return {
      type: "vcard",
      raw,
      formattedName,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      organization: org || undefined,
      title: title || undefined,
      phone: phone || undefined,
      email: email || undefined,
      url: url || undefined,
      address: address || undefined,
      note: note || undefined,
    };
  }

  // MECARD format: MECARD:N:Doe,John;TEL:12345;EMAIL:john@example.com;;
  if (/^MECARD:/i.test(trimmed)) {
    const content = trimmed.substring(7);
    const tags: Record<string, string> = {};
    const parts = content.split(";");
    for (const part of parts) {
      const idx = part.indexOf(":");
      if (idx !== -1) {
        const k = part.substring(0, idx).trim().toUpperCase();
        const v = part.substring(idx + 1).trim();
        tags[k] = v;
      }
    }

    const name = (tags["N"] || "").replace(",", " ").trim() || "Contact";
    return {
      type: "vcard",
      raw,
      formattedName: name,
      phone: tags["TEL"] || undefined,
      email: tags["EMAIL"] || undefined,
      url: tags["URL"] || undefined,
      note: tags["NOTE"] || undefined,
    };
  }

  return null;
}

/**
 * Parses UPI Payment string: upi://pay?pa=...&pn=...&am=...
 */
export function parseUpi(raw: string): DecodedUpiPayload | null {
  if (!raw.toLowerCase().startsWith("upi://pay")) return null;

  try {
    const url = new URL(raw);
    const params = url.searchParams;
    const pa = params.get("pa") || "";
    if (!pa) return null;

    const pn = params.get("pn") || undefined;
    const am = params.get("am") || undefined;
    const tn = params.get("tn") || undefined;
    const cu = params.get("cu") || "INR";

    return {
      type: "upi",
      raw,
      pa,
      pn,
      am,
      tn,
      cu,
    };
  } catch {
    return null;
  }
}

/**
 * Parses Email strings: mailto:... or MATMSG:...
 */
export function parseEmail(raw: string): DecodedEmailPayload | null {
  const trimmed = raw.trim();

  // mailto: URI
  if (/^mailto:/i.test(trimmed)) {
    try {
      const withoutPrefix = trimmed.replace(/^mailto:/i, "");
      const [toPart, queryPart] = withoutPrefix.split("?");
      const to = decodeURIComponent(toPart || "").trim();

      let subject: string | undefined;
      let body: string | undefined;

      if (queryPart) {
        const params = new URLSearchParams(queryPart);
        subject = params.get("subject") ? decodeURIComponent(params.get("subject")!) : undefined;
        body = params.get("body") ? decodeURIComponent(params.get("body")!) : undefined;
      }

      return {
        type: "email",
        raw,
        to: to || "Unknown Recipient",
        subject,
        body,
      };
    } catch {
      return null;
    }
  }

  // MATMSG format: MATMSG:TO:user@example.com;SUB:Hello;BODY:World;;
  if (/^MATMSG:/i.test(trimmed)) {
    const toMatch = trimmed.match(/TO:([^;]+)/i);
    const subMatch = trimmed.match(/SUB:([^;]+)/i);
    const bodyMatch = trimmed.match(/BODY:([^;]+)/i);

    if (toMatch && toMatch[1]) {
      return {
        type: "email",
        raw,
        to: toMatch[1].trim(),
        subject: subMatch ? subMatch[1].trim() : undefined,
        body: bodyMatch ? bodyMatch[1].trim() : undefined,
      };
    }
  }

  return null;
}

/**
 * Parses Web URLs: http://, https://, ftp://, or leading www.
 */
export function parseUrl(raw: string): DecodedUrlPayload | null {
  const trimmed = raw.trim();

  let candidate = trimmed;
  if (/^www\./i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  if (/^(https?|ftp):\/\//i.test(candidate)) {
    try {
      const parsed = new URL(candidate);
      return {
        type: "url",
        raw,
        url: candidate,
        hostname: parsed.hostname,
        protocol: parsed.protocol.replace(":", "").toUpperCase(),
        pathname: parsed.pathname !== "/" ? parsed.pathname : undefined,
        search: parsed.search || undefined,
      };
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Fallback parser for plain text.
 */
export function parseText(raw: string): DecodedTextPayload {
  const trimmed = raw.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  return {
    type: "text",
    raw,
    text: raw,
    charCount: raw.length,
    wordCount,
  };
}

/**
 * Main parser entry point: analyzes raw QR matrix text and returns structured fields.
 */
export function parseDecodedQR(raw: string): DecodedQRPayload {
  if (!raw) {
    return parseText("");
  }

  return (
    parseWifi(raw) ||
    parseVCard(raw) ||
    parseUpi(raw) ||
    parseEmail(raw) ||
    parseUrl(raw) ||
    parseText(raw)
  );
}
