import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onResult, onError }) {
  const qrRef = useRef(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    
    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onResult?.(decodedText);
            html5QrCode.stop();
          },
          (errorMessage) => {
            console.log(errorMessage);
            onError?.(errorMessage);
          }
        );
      } catch (err) {
        console.error("Error starting scanner:", err);
        onError?.(err);
      }
    };

    if (qrRef.current) {
      startScanner();
    }

    return () => {
      html5QrCode.stop().catch(console.error);
    };
  }, [onResult, onError]);

  return (
    <div className="qr-scanner-container">
      <div id="qr-reader" ref={qrRef} className="w-full max-w-md mx-auto rounded-lg overflow-hidden" />
    </div>
  );
}
