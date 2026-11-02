import QRCode from 'qrcode';

export async function generateQrCodeBuffer(verificationUrl: string): Promise<Buffer> {
  return QRCode.toBuffer(verificationUrl, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 240,
    margin: 1,
    color: {
      dark: '#0B192C',
      light: '#FFFFFF',
    },
  });
}
