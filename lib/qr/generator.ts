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
  animate?: boolean;
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
 * Supports "squares", "rounded", and "dots" pattern styles with high scannability.
 * When `animate: true`, groups modules into staggered horizontal layers for 3D jelly drop animations.
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
    pattern = "square",
    animate = false,
  } = options;

  if (!payload || payload.trim() === "") {
    return "";
  }

  const qr = QRCode.create(payload, {
    errorCorrectionLevel: errorCorrection,
  });

  const size = qr.modules.size;
  const totalSize = size + margin * 2;

  const elements: string[] = [];

  // Background rectangle
  if (backgroundColor && backgroundColor.toLowerCase() !== "transparent") {
    elements.push(
      `<rect width="${totalSize}" height="${totalSize}" fill="${backgroundColor}" />`
    );
  }

  // Helper: check if (r, c) is part of a 7x7 finder pattern
  const isFinder = (r: number, c: number) => {
    if (r < 7 && c < 7) return true;
    if (r < 7 && c >= size - 7) return true;
    if (r >= size - 7 && c < 7) return true;
    return false;
  };

  // 1. Finder Pattern Eyes (Anchors)
  const center = (size - 1) / 2;
  const maxDist = Math.max(1, center * Math.SQRT2);
  const WAVE_DURATION = 0.44; // Total wave transit time from center to furthest corner (seconds)

  const finders: [number, number, number, number][] = [
    [0, 0, 3.5, 3.5], // Top-Left
    [0, size - 7, size - 3.5, 3.5], // Top-Right
    [size - 7, 0, 3.5, size - 3.5], // Bottom-Left
  ];

  finders.forEach(([fr, fc, ecx, ecy]) => {
    const fx = margin + fc;
    const fy = margin + fr;

    const dx = ecx - center;
    const dy = ecy - center;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const eyeDelay = ((dist / maxDist) * WAVE_DURATION).toFixed(3);
    const eyeClass = animate
      ? ` class="qr-ripple-eye" style="animation-delay: ${eyeDelay}s;"`
      : "";

    const eyeShapes: string[] = [];
    if (pattern === "dots") {
      eyeShapes.push(
        `<rect x="${fx}" y="${fy}" width="7" height="7" rx="2" fill="${foregroundColor}" />`,
        `<rect x="${fx + 1}" y="${fy + 1}" width="5" height="5" rx="1.2" fill="${backgroundColor}" />`,
        `<circle cx="${fx + 3.5}" cy="${fy + 3.5}" r="1.5" fill="${foregroundColor}" />`
      );
    } else if (pattern === "rounded") {
      eyeShapes.push(
        `<rect x="${fx}" y="${fy}" width="7" height="7" rx="1.6" fill="${foregroundColor}" />`,
        `<rect x="${fx + 1}" y="${fy + 1}" width="5" height="5" rx="1" fill="${backgroundColor}" />`,
        `<rect x="${fx + 2}" y="${fy + 2}" width="3" height="3" rx="0.8" fill="${foregroundColor}" />`
      );
    } else {
      eyeShapes.push(
        `<rect x="${fx}" y="${fy}" width="7" height="7" fill="${foregroundColor}" />`,
        `<rect x="${fx + 1}" y="${fy + 1}" width="5" height="5" fill="${backgroundColor}" />`,
        `<rect x="${fx + 2}" y="${fy + 2}" width="3" height="3" fill="${foregroundColor}" />`
      );
    }

    elements.push(`<g${eyeClass}>${eyeShapes.join("")}</g>`);
  });

  // 2. Data Modules with Circular Ripple Delay Radiating from Center
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isFinder(r, c) || !qr.modules.get(r, c)) continue;

      const mx = margin + c;
      const my = margin + r;

      const dx = (c + 0.5) - center;
      const dy = (r + 0.5) - center;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const delay = (Math.min(1, dist / maxDist) * WAVE_DURATION).toFixed(3);
      const animAttr = animate
        ? ` class="qr-ripple-module" style="animation-delay: ${delay}s;"`
        : "";

      if (pattern === "dots") {
        elements.push(
          `<circle cx="${mx + 0.5}" cy="${my + 0.5}" r="0.51" fill="${foregroundColor}"${animAttr} />`
        );
      } else if (pattern === "rounded") {
        elements.push(
          `<rect x="${mx}" y="${my}" width="1" height="1" rx="0.32" fill="${foregroundColor}"${animAttr} />`
        );
      } else {
        elements.push(
          `<rect x="${mx}" y="${my}" width="1" height="1" fill="${foregroundColor}"${animAttr} />`
        );
      }
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}">`,
    ...elements,
    `</svg>`,
  ].join("");
}

/**
 * Generates a PNG Data URL entirely client-side in the browser.
 * Respects custom patterns ("squares", "rounded", "dots") and colors.
 */
export async function generateQRPngDataUrl(
  payload: string,
  width: number = 512,
  options: QRRenderOptions = {}
): Promise<string> {
  const svg = await generateQRSvg(payload, options);
  if (!svg) return "";

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svgBase64 = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = width;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not initialize canvas context"));
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, width);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => {
        // Fallback to standard qrcode
        QRCode.toDataURL(payload, {
          width,
          errorCorrectionLevel: options.errorCorrection ?? "M",
          margin: options.margin ?? 4,
          color: {
            dark: options.foregroundColor ?? "#000000",
            light: options.backgroundColor ?? "#ffffff",
          },
        }).then(resolve).catch(reject);
      };
      img.src = svgBase64;
    });
  }

  return QRCode.toDataURL(payload, {
    width,
    errorCorrectionLevel: options.errorCorrection ?? "M",
    margin: options.margin ?? 4,
    color: {
      dark: options.foregroundColor ?? "#000000",
      light: options.backgroundColor ?? "#ffffff",
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
