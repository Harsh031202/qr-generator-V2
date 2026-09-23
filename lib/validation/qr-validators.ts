/**
 * QR Studio - Input Validation Architecture
 * Pure functional validators separated from UI and presentation components.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Validates a web URL.
 * Requires http or https protocol and a valid domain format or localhost.
 * Rejects dangerous or unverified URI schemes.
 */
export function validateUrl(rawUrl: string): ValidationResult {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { isValid: false, error: "URL cannot be empty." };
  }

  // Explicit check against dangerous/unsupported schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return {
      isValid: false,
      error: "Unsupported URL scheme. Only http:// and https:// are permitted.",
    };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        isValid: false,
        error: "URL must start with http:// or https://",
      };
    }

    const isLocalhost =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname.endsWith(".localhost");

    if (!parsed.hostname || (!parsed.hostname.includes(".") && !isLocalhost)) {
      return {
        isValid: false,
        error: "Enter a valid domain name (e.g. https://example.com).",
      };
    }
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: "Enter a valid URL (e.g. https://example.com).",
    };
  }
}

/**
 * Validates plain text content.
 */
export function validateText(text: string): ValidationResult {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: "Text content cannot be empty." };
  }
  if (text.length > 2953) {
    return {
      isValid: false,
      error: "Text exceeds maximum practical QR capacity (2,953 characters).",
    };
  }
  return { isValid: true };
}

/**
 * Validates Wi-Fi network configuration.
 */
export function validateWifi(data: {
  ssid: string;
  password?: string;
  security: "WPA" | "WEP" | "nopass";
}): ValidationResult {
  const fieldErrors: Record<string, string> = {};

  const trimmedSsid = data.ssid.trim();
  if (!trimmedSsid) {
    fieldErrors.ssid = "Network name (SSID) is required.";
  } else if (new TextEncoder().encode(trimmedSsid).length > 32) {
    fieldErrors.ssid = "SSID cannot exceed 32 bytes.";
  }

  if (data.security === "WPA") {
    const pass = data.password || "";
    if (!pass) {
      fieldErrors.password = "Password is required for WPA/WPA2 networks.";
    } else if (pass.length < 8 || pass.length > 63) {
      fieldErrors.password = "WPA/WPA2 password must be between 8 and 63 characters.";
    }
  } else if (data.security === "WEP") {
    const pass = data.password || "";
    if (!pass) {
      fieldErrors.password = "Password is required for WEP networks.";
    } else if (![5, 10, 13, 26].includes(pass.length)) {
      fieldErrors.password = "WEP key must be 5, 10, 13, or 26 characters.";
    }
  }

  const isValid = Object.keys(fieldErrors).length === 0;
  return {
    isValid,
    error: isValid ? undefined : Object.values(fieldErrors)[0],
    fieldErrors,
  };
}

/**
 * Validates Contact / vCard parameters.
 */
export function validateVCard(data: {
  firstName: string;
  lastName?: string;
  phone?: string;
  email?: string;
  url?: string;
}): ValidationResult {
  const fieldErrors: Record<string, string> = {};

  if (!data.firstName.trim()) {
    fieldErrors.firstName = "First name is required.";
  }

  if (data.email && data.email.trim()) {
    const emailRes = validateEmail(data.email);
    if (!emailRes.isValid && emailRes.error) {
      fieldErrors.email = emailRes.error;
    }
  }

  if (data.url && data.url.trim()) {
    const urlRes = validateUrl(data.url);
    if (!urlRes.isValid && urlRes.error) {
      fieldErrors.url = urlRes.error;
    }
  }

  const isValid = Object.keys(fieldErrors).length === 0;
  return {
    isValid,
    error: isValid ? undefined : Object.values(fieldErrors)[0],
    fieldErrors,
  };
}

/**
 * Validates an email address and mailto fields.
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: "Recipient email address is required." };
  }
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Enter a valid email address." };
  }
  return { isValid: true };
}

/**
 * Validates UPI payment parameters.
 */
export function validateUpi(data: {
  pa: string;
  pn?: string;
  am?: string;
}): ValidationResult {
  const fieldErrors: Record<string, string> = {};

  const trimmedPa = data.pa.trim();
  if (!trimmedPa) {
    fieldErrors.pa = "UPI ID is required (e.g., username@bank).";
  } else {
    const upiRegex = /^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(trimmedPa)) {
      fieldErrors.pa = "Enter a valid UPI ID (e.g. name@okhdfcbank).";
    }
  }

  if (data.am && data.am.trim()) {
    const num = Number(data.am.trim());
    if (isNaN(num) || num <= 0) {
      fieldErrors.am = "Amount must be a number greater than 0.";
    }
  }

  const isValid = Object.keys(fieldErrors).length === 0;
  return {
    isValid,
    error: isValid ? undefined : Object.values(fieldErrors)[0],
    fieldErrors,
  };
}

/**
 * Evaluates whether a generated payload is unusually dense.
 */
export function isHighDensityPayload(payloadLength: number): boolean {
  return payloadLength > 320;
}

/**
 * Validates a color hex code (3, 6, or 8 characters).
 */
export function validateHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(hex.trim());
}
