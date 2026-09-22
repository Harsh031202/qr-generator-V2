/**
 * QR Studio - Input Validation Architecture
 * Pure functional validators separated from UI and presentation components.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a web URL.
 * Requires http or https protocol and a valid domain format.
 */
export function validateUrl(rawUrl: string): ValidationResult {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { isValid: false, error: "URL cannot be empty." };
  }

  // Prevent dangerous schemes like javascript:, data:, etc.
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        isValid: false,
        error: "URL must use http:// or https:// protocol.",
      };
    }
    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return {
        isValid: false,
        error: "Enter a valid domain name (e.g. https://example.com).",
      };
    }
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: "Please enter a valid URL (including https://).",
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
    // Upper practical limit for QR codes with error correction
    return {
      isValid: false,
      error: "Text exceeds maximum practical QR capacity (2,953 characters).",
    };
  }
  return { isValid: true };
}

/**
 * Validates an email address.
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: "Email address is required." };
  }
  // Standard RFC 5322 compliant regex for web forms
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Enter a valid email address." };
  }
  return { isValid: true };
}

/**
 * Validates UPI payment identifiers (e.g. user@bank or user@upi).
 */
export function validateUpiId(upiId: string): ValidationResult {
  const trimmed = upiId.trim();
  if (!trimmed) {
    return { isValid: false, error: "UPI ID is required." };
  }
  const upiRegex = /^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  if (!upiRegex.test(trimmed)) {
    return {
      isValid: false,
      error: "Enter a valid UPI ID (e.g., name@okbank).",
    };
  }
  return { isValid: true };
}

/**
 * Validates a color hex code (3, 6, or 8 characters).
 */
export function validateHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(hex.trim());
}
