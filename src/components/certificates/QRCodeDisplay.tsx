import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';

interface QRCodeDisplayProps {
  certificateId: string;
  size?: number;
  showLinkCopy?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  certificateId,
  size = 140,
  showLinkCopy = true,
}) => {
  const [copied, setCopied] = useState(false);

  // Construct full public verification URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const verificationUrl = `${origin}/verify/${certificateId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm inline-block">
        <QRCodeSVG
          value={verificationUrl}
          size={size}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231E3E62'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/></svg>",
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
      </div>

      <div className="mt-2 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
        ID: {certificateId}
      </div>

      {showLinkCopy && (
        <div className="mt-3 w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="w-full text-xs"
            icon={copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          >
            {copied ? 'Copied Verification URL' : 'Copy Verification URL'}
          </Button>
        </div>
      )}
    </div>
  );
};
