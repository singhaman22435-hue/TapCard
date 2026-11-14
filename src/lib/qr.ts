import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

const DEFAULT_OPTIONS: QRCodeOptions = {
  width: 400,
  margin: 2,
  errorCorrectionLevel: 'H', // High error correction for robust phone scanning even if damaged
  color: {
    dark: '#0f172a',
    light: '#ffffff',
  },
};

/**
 * Generate a PNG Data URL of the QR code
 */
export async function generateQRCodeDataUrl(
  text: string,
  options?: Partial<QRCodeOptions>
): Promise<string> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  return QRCode.toDataURL(text, mergedOptions);
}

/**
 * Generate an SVG string of the QR code
 */
export async function generateQRCodeSvg(
  text: string,
  options?: Partial<QRCodeOptions>
): Promise<string> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  return QRCode.toString(text, {
    ...mergedOptions,
    type: 'svg',
  });
}

/**
 * Trigger download of QR code as PNG image
 */
export async function downloadQRCodePng(
  text: string,
  filename: string = 'tapcard-qr.png',
  options?: Partial<QRCodeOptions>
): Promise<void> {
  const dataUrl = await generateQRCodeDataUrl(text, options);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Trigger download of QR code as SVG vector file
 */
export async function downloadQRCodeSvg(
  text: string,
  filename: string = 'tapcard-qr.svg',
  options?: Partial<QRCodeOptions>
): Promise<void> {
  const svgString = await generateQRCodeSvg(text, options);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
