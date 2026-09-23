export type QRContentType =
  | "url"
  | "text"
  | "wifi"
  | "vcard"
  | "email"
  | "upi";

export type QRErrorCorrection = "L" | "M" | "Q" | "H";

export type QRPatternStyle = "square" | "rounded" | "dots";

export type QRCornerStyle = "square" | "rounded" | "circle";

export type QROutputSize = 256 | 512 | 768 | 1024 | 2048;

export interface QRLogoConfig {
  dataUrl: string;
  filename: string;
  sizePercent: number; // 10% to 28%
  hasPadding: boolean;
  paddingSize?: number; // 0 to 4 modules
}

export interface QRAppearanceConfig {
  foregroundColor: string;
  backgroundColor: string;
  pattern: QRPatternStyle;
  cornerStyle: QRCornerStyle;
  margin: number; // quiet zone (1 - 6 modules)
  errorCorrection: QRErrorCorrection;
  outputSize: QROutputSize;
  logo?: QRLogoConfig;
}

export type QRVerificationStatus =
  | "idle"
  | "verifying"
  | "verified"
  | "failed";

export interface QRVerificationResult {
  status: QRVerificationStatus;
  decodedPayload?: string;
  message?: string;
  contrastRatio: number;
  isGoodContrast: boolean;
}

export interface QRMetadata {
  title: string;
  previewSummary: string;
  createdAt: string;
}

export interface QRHistoryRecord {
  id: string;
  type: QRContentType;
  payload: string;
  appearance: QRAppearanceConfig;
  metadata: QRMetadata;
  createdAt: number;
}
