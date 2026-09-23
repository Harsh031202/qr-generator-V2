import QRCode from "qrcode";
import jsQR from "jsqr";
import type {
  QRErrorCorrection,
  QRPatternStyle,
  QRCornerStyle,
  QRLogoConfig,
  QRVerificationResult,
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
  logo?: QRLogoConfig;
}

/**
 * Computes raw QR module matrix client-side using qrcode core.
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

interface LogoClearanceArea {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
  logoRow: number;
  logoCol: number;
  logoSize: number;
}

/**
 * Calculates matrix coordinates reserved for logo placement and padding.
 */
function getLogoClearanceArea(
  size: number,
  logo?: QRLogoConfig
): LogoClearanceArea | null {
  if (!logo?.dataUrl) return null;

  // Logo size clamped between 10% and 28% of total matrix size
  const clampedPercent = Math.min(28, Math.max(10, logo.sizePercent || 20));
  const logoModules = Math.max(3, Math.round((size * clampedPercent) / 100));

  const paddingModules = logo.hasPadding ? Math.max(1, logo.paddingSize ?? 1) : 0;
  const totalClearance = logoModules + paddingModules * 2;

  const center = size / 2;
  const minRow = Math.floor(center - totalClearance / 2);
  const maxRow = Math.ceil(center + totalClearance / 2) - 1;
  const minCol = Math.floor(center - totalClearance / 2);
  const maxCol = Math.ceil(center + totalClearance / 2) - 1;

  const logoRow = center - logoModules / 2;
  const logoCol = center - logoModules / 2;

  return {
    minRow,
    maxRow,
    minCol,
    maxCol,
    logoRow,
    logoCol,
    logoSize: logoModules,
  };
}

/**
 * Generates an SVG path or markup for a single finder pattern at (originX, originY).
 */
function renderFinderPatternSvg(
  originX: number,
  originY: number,
  style: QRCornerStyle,
  fg: string,
  bg: string
): string {
  switch (style) {
    case "rounded":
      return `
        <rect x="${originX}" y="${originY}" width="7" height="7" rx="1.5" ry="1.5" fill="${fg}" />
        <rect x="${originX + 1}" y="${originY + 1}" width="5" height="5" rx="1.0" ry="1.0" fill="${bg}" />
        <rect x="${originX + 2}" y="${originY + 2}" width="3" height="3" rx="0.6" ry="0.6" fill="${fg}" />
      `;
    case "circle":
      return `
        <circle cx="${originX + 3.5}" cy="${originY + 3.5}" r="3.5" fill="${fg}" />
        <circle cx="${originX + 3.5}" cy="${originY + 3.5}" r="2.5" fill="${bg}" />
        <circle cx="${originX + 3.5}" cy="${originY + 3.5}" r="1.5" fill="${fg}" />
      `;
    case "square":
    default:
      return `
        <rect x="${originX}" y="${originY}" width="7" height="7" fill="${fg}" />
        <rect x="${originX + 1}" y="${originY + 1}" width="5" height="5" fill="${bg}" />
        <rect x="${originX + 2}" y="${originY + 2}" width="3" height="3" fill="${fg}" />
      `;
  }
}

/**
 * Generates a 100% pure vector SVG representation of the QR code with custom
 * module patterns (Square, Rounded, Dots), corner styles, and logo embedding.
 */
export async function generateQRSvg(
  payload: string,
  options: QRRenderOptions = {}
): Promise<string> {
  const {
    errorCorrection = "M",
    margin = 3,
    foregroundColor = "#0f172a",
    backgroundColor = "#ffffff",
    pattern = "square",
    cornerStyle = "square",
    logo,
  } = options;

  const matrixData = computeQRMatrix(payload, errorCorrection);
  const { modules, size } = matrixData;
  const totalSize = size + margin * 2;

  const logoClearance = getLogoClearanceArea(size, logo);

  // 1. Finder patterns at Top-Left, Top-Right, Bottom-Left
  const finderPatternsMarkup = [
    renderFinderPatternSvg(0, 0, cornerStyle, foregroundColor, backgroundColor),
    renderFinderPatternSvg(size - 7, 0, cornerStyle, foregroundColor, backgroundColor),
    renderFinderPatternSvg(0, size - 7, cornerStyle, foregroundColor, backgroundColor),
  ].join("\n");

  // 2. Data modules
  const dataModules: string[] = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // Skip finder patterns
      if (isFinderPattern(row, col, size)) continue;

      // Skip logo clearance area
      if (
        logoClearance &&
        row >= logoClearance.minRow &&
        row <= logoClearance.maxRow &&
        col >= logoClearance.minCol &&
        col <= logoClearance.maxCol
      ) {
        continue;
      }

      const isDark = modules[row * size + col];
      if (!isDark) continue;

      switch (pattern) {
        case "dots":
          dataModules.push(
            `<circle cx="${col + 0.5}" cy="${row + 0.5}" r="0.43" fill="${foregroundColor}" />`
          );
          break;
        case "rounded":
          dataModules.push(
            `<rect x="${col + 0.05}" y="${row + 0.05}" width="0.9" height="0.9" rx="0.32" ry="0.32" fill="${foregroundColor}" />`
          );
          break;
        case "square":
        default:
          dataModules.push(
            `<rect x="${col}" y="${row}" width="1" height="1" fill="${foregroundColor}" />`
          );
          break;
      }
    }
  }

  // 3. Logo embedding
  let logoMarkup = "";
  if (logoClearance && logo?.dataUrl) {
    const padX = logoClearance.minCol;
    const padY = logoClearance.minRow;
    const padW = logoClearance.maxCol - logoClearance.minCol + 1;
    const padH = logoClearance.maxRow - logoClearance.minRow + 1;

    // Draw background clearing pad
    if (logo.hasPadding) {
      logoMarkup += `<rect x="${padX}" y="${padY}" width="${padW}" height="${padH}" rx="0.8" fill="${backgroundColor}" />`;
    }

    // Embed logo image
    logoMarkup += `<image href="${logo.dataUrl}" x="${logoClearance.logoRow}" y="${logoClearance.logoCol}" width="${logoClearance.logoSize}" height="${logoClearance.logoSize}" preserveAspectRatio="xMidYMid meet" />`;
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${totalSize} ${totalSize}" shape-rendering="crispEdges">
  <rect width="100%" height="100%" fill="${backgroundColor}" />
  <g transform="translate(${margin}, ${margin})">
    ${finderPatternsMarkup}
    <g shape-rendering="${pattern === "square" ? "crispEdges" : "geometricPrecision"}">
      ${dataModules.join("\n      ")}
    </g>
    ${logoMarkup}
  </g>
</svg>`;
}

/**
 * Draws a single finder pattern onto an HTML Canvas 2D context.
 */
function drawFinderPatternCanvas(
  ctx: CanvasRenderingContext2D,
  originX: number,
  originY: number,
  style: QRCornerStyle,
  modulePx: number,
  fg: string,
  bg: string
) {
  const x = originX * modulePx;
  const y = originY * modulePx;
  const s7 = 7 * modulePx;
  const s5 = 5 * modulePx;
  const s3 = 3 * modulePx;
  const off1 = 1 * modulePx;
  const off2 = 2 * modulePx;

  if (style === "rounded") {
    const r7 = 1.5 * modulePx;
    const r5 = 1.0 * modulePx;
    const r3 = 0.6 * modulePx;

    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.roundRect(x, y, s7, s7, r7);
    ctx.fill();

    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(x + off1, y + off1, s5, s5, r5);
    ctx.fill();

    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.roundRect(x + off2, y + off2, s3, s3, r3);
    ctx.fill();
  } else if (style === "circle") {
    const cx = x + 3.5 * modulePx;
    const cy = y + 3.5 * modulePx;

    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5 * modulePx, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5 * modulePx, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5 * modulePx, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = fg;
    ctx.fillRect(x, y, s7, s7);

    ctx.fillStyle = bg;
    ctx.fillRect(x + off1, y + off1, s5, s5);

    ctx.fillStyle = fg;
    ctx.fillRect(x + off2, y + off2, s3, s3);
  }
}

/**
 * Generates a PNG Data URL using an in-memory Canvas rendered with custom
 * module patterns (Square, Rounded, Dots), corner styles, and logo embedding.
 */
export async function generateQRPngDataUrl(
  payload: string,
  targetWidth: number = 512,
  options: QRRenderOptions = {}
): Promise<string> {
  const {
    errorCorrection = "M",
    margin = 3,
    foregroundColor = "#0f172a",
    backgroundColor = "#ffffff",
    pattern = "square",
    cornerStyle = "square",
    logo,
  } = options;

  const matrixData = computeQRMatrix(payload, errorCorrection);
  const { modules, size } = matrixData;
  const totalModules = size + margin * 2;

  const modulePx = targetWidth / totalModules;
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetWidth;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Unable to create canvas 2D rendering context");
  }

  // 1. Background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, targetWidth, targetWidth);

  ctx.save();
  ctx.translate(margin * modulePx, margin * modulePx);

  // 2. Finder patterns
  drawFinderPatternCanvas(ctx, 0, 0, cornerStyle, modulePx, foregroundColor, backgroundColor);
  drawFinderPatternCanvas(ctx, size - 7, 0, cornerStyle, modulePx, foregroundColor, backgroundColor);
  drawFinderPatternCanvas(ctx, 0, size - 7, cornerStyle, modulePx, foregroundColor, backgroundColor);

  // 3. Logo clearance calculation
  const logoClearance = getLogoClearanceArea(size, logo);

  // 4. Data modules
  ctx.fillStyle = foregroundColor;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (isFinderPattern(row, col, size)) continue;

      if (
        logoClearance &&
        row >= logoClearance.minRow &&
        row <= logoClearance.maxRow &&
        col >= logoClearance.minCol &&
        col <= logoClearance.maxCol
      ) {
        continue;
      }

      const isDark = modules[row * size + col];
      if (!isDark) continue;

      const x = col * modulePx;
      const y = row * modulePx;

      if (pattern === "dots") {
        ctx.beginPath();
        ctx.arc(x + modulePx / 2, y + modulePx / 2, modulePx * 0.43, 0, Math.PI * 2);
        ctx.fill();
      } else if (pattern === "rounded") {
        ctx.beginPath();
        ctx.roundRect(
          x + modulePx * 0.05,
          y + modulePx * 0.05,
          modulePx * 0.9,
          modulePx * 0.9,
          modulePx * 0.32
        );
        ctx.fill();
      } else {
        ctx.fillRect(x, y, modulePx, modulePx);
      }
    }
  }

  // 5. Draw logo if present
  if (logoClearance && logo?.dataUrl) {
    if (logo.hasPadding) {
      const padX = logoClearance.minCol * modulePx;
      const padY = logoClearance.minRow * modulePx;
      const padW = (logoClearance.maxCol - logoClearance.minCol + 1) * modulePx;
      const padH = (logoClearance.maxRow - logoClearance.minRow + 1) * modulePx;

      ctx.fillStyle = backgroundColor;
      ctx.beginPath();
      ctx.roundRect(padX, padY, padW, padH, modulePx * 0.8);
      ctx.fill();
    }

    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const lx = logoClearance.logoCol * modulePx;
        const ly = logoClearance.logoRow * modulePx;
        const ls = logoClearance.logoSize * modulePx;
        ctx.drawImage(img, lx, ly, ls, ls);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = logo.dataUrl;
    });
  }

  ctx.restore();

  return canvas.toDataURL("image/png");
}

/**
 * Decodes an in-memory QR image using jsQR and verifies that it strictly matches
 * the canonical expected payload. Runs 100% in browser.
 */
export async function verifyQRCode(
  payload: string,
  options: QRRenderOptions = {}
): Promise<QRVerificationResult> {
  const contrastRatio = getContrastRatio(
    options.foregroundColor || "#0f172a",
    options.backgroundColor || "#ffffff"
  );
  const isGoodContrast = contrastRatio >= 3.0;

  try {
    // Generate raster image on offscreen canvas for decoding
    const dataUrl = await generateQRPngDataUrl(payload, 512, options);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve({
            status: "failed",
            message: "Canvas context creation failed during verification.",
            contrastRatio,
            isGoodContrast,
          });
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = jsQR(imageData.data, imageData.width, imageData.height);

        if (!decoded) {
          resolve({
            status: "failed",
            message: "The generated image could not be decoded reliably.",
            contrastRatio,
            isGoodContrast,
          });
          return;
        }

        if (decoded.data === payload) {
          resolve({
            status: "verified",
            decodedPayload: decoded.data,
            message: "The generated QR decodes correctly.",
            contrastRatio,
            isGoodContrast,
          });
        } else {
          resolve({
            status: "failed",
            decodedPayload: decoded.data,
            message: "Decoded content did not match intended payload.",
            contrastRatio,
            isGoodContrast,
          });
        }
      };

      img.onerror = () => {
        resolve({
          status: "failed",
          message: "Failed to render QR for verification.",
          contrastRatio,
          isGoodContrast,
        });
      };

      img.src = dataUrl;
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Verification error";
    return {
      status: "failed",
      message: errorMsg,
      contrastRatio,
      isGoodContrast,
    };
  }
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
    return 21;
  }
}
