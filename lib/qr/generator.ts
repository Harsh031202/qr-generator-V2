import QRCode from "qrcode";
import type {
  QRErrorCorrection,
  QRPatternStyle,
  QRCornerStyle,
} from "@/types/qr";

export interface QRMatrixData {
  modules: boolean[];
  size: number;
}

export interface QRRenderOptions {
  errorCorrection?: QRErrorCorrection;
  margin?: number;
  foregroundColor?: string;
  backgroundColor?: string;
  pattern?: QRPatternStyle;
  cornerStyle?: QRCornerStyle;
}

/**
 * Computes raw QR module matrix client-side.
 * Runs completely in the browser environment with 0 external network requests.
 */
export function computeQRMatrix(
  payload: string,
  errorCorrection: QRErrorCorrection = "M"
): QRMatrixData {
  if (!payload || payload.trim() === "") {
    throw new Error("Payload cannot be empty");
  }

  const qr = QRCode.create(payload, {
    errorCorrectionLevel: errorCorrection,
  });

  return {
    modules: Array.from(qr.modules.data).map((val) => Boolean(val)),
    size: qr.modules.size,
  };
}

/**
 * Checks whether a given module (row, col) is part of a 7x7 finder pattern.
 */
export function isFinderPattern(
  row: number,
  col: number,
  size: number
): boolean {
  if (row < 7 && col < 7) return true;
  if (row < 7 && col >= size - 7) return true;
  if (row >= size - 7 && col < 7) return true;
  return false;
}

/**
 * Generates an SVG string representation of the QR code entirely client-side.
 */
export async function generateQRSvg(
  payload: string,
  options: QRRenderOptions = {}
): Promise<string> {
  const {
    errorCorrection = "M",
    margin = 4,
    foregroundColor = "#000000",
    backgroundColor = "#ffffff",
  } = options;

  return QRCode.toString(payload, {
    type: "svg",
    errorCorrectionLevel: errorCorrection,
    margin,
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
  });
}

/**
 * Generates a PNG Data URL entirely client-side in the browser.
 */
export async function generateQRPngDataUrl(
  payload: string,
  width: number = 512,
  options: QRRenderOptions = {}
): Promise<string> {
  const {
    errorCorrection = "M",
    margin = 4,
    foregroundColor = "#000000",
    backgroundColor = "#ffffff",
  } = options;

  return QRCode.toDataURL(payload, {
    width,
    errorCorrectionLevel: errorCorrection,
    margin,
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
  });
}

/**
 * Trigger client-side file download for SVG text or data URL without server trips.
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Trigger client-side file download from a Data URL (e.g. image/png).
 */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Calculates WCAG 2.1 relative luminance and contrast ratio between foreground and background.
 * Used for client-side scannability guarantees.
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const getLuminance = (hex: string): number => {
    let clean = hex.replace("#", "").trim();
    if (clean.length === 3) {
      clean = clean
        .split("")
        .map((c) => c + c)
        .join("");
    }
    if (clean.length !== 6) return 0.5;

    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;

    const transform = (val: number) =>
      val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);

    return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
  };

  try {
    const lum1 = getLuminance(hex1);
    const lum2 = getLuminance(hex2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch {
    return 21; // fallback default
  }
}
