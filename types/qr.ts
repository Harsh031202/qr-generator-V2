export type QRContentType =
  | "url"
  | "text"
  | "wifi"
  | "vcard"
  | "email"
  | "phone"
  | "sms"
  | "location"
  | "upi"
  | "event";

export type QRErrorCorrection = "L" | "M" | "Q" | "H";

export type QRPatternStyle = "square" | "rounded" | "dots";

export type QRCornerStyle = "square" | "rounded" | "dot";

export interface QRLogoConfig {
  dataUrl: string;
  filename: string;
  sizePercent: number; // 10% to 30%
  hasPadding: boolean;
}

export interface QRAppearanceConfig {
  foregroundColor: string;
  backgroundColor: string;
  pattern: QRPatternStyle;
  cornerStyle: QRCornerStyle;
  margin: number; // quiet zone (1 - 6)
  errorCorrection: QRErrorCorrection;
  logo?: QRLogoConfig;
}

export interface QRVerificationResult {
  verified: boolean;
  decodedPayload?: string;
  warning?: string;
  contrastRatio: number;
  contrastSufficient: boolean;
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
