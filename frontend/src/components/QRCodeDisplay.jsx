import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function QRCodeDisplay({ value, size = 200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!value) return;
    const canvas = canvasRef.current;
    QRCode.toCanvas(canvas, value, { width: size }, function (error) {
      if (error) console.error('QR generation error', error);
    });
  }, [value, size]);

  if (!value) return null;

  return (
    <div className="mt-6 flex flex-col items-center">
      <canvas ref={canvasRef} />
      <p className="text-sm text-gray-600 mt-2">Show this QR to passengers for quick verification</p>
    </div>
  );
}
