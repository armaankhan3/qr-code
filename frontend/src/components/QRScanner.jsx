import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onResult, onError, running = true }) {
  const qrRef = useRef(null);
  const htmlRef = useRef(null);
  const lastSeen = useRef({ text: null, ts: 0 });

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    htmlRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // dedupe identical scans within 2s
            const now = Date.now();
            if (decodedText === lastSeen.current.text && (now - lastSeen.current.ts) < 2000) return;
            lastSeen.current = { text: decodedText, ts: now };
            onResult?.(decodedText);
            // keep scanning continuously
          },
          (errorMessage) => {
            onError?.(errorMessage);
          }
        );
      } catch (err) {
        onError?.(err.message || String(err));
      }
    };

    if (qrRef.current && running) startScanner();

    return () => {
      html5QrCode.stop().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!htmlRef.current) return;
    if (running) {
      htmlRef.current.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 250, height: 250 } }).catch(() => {});
    } else {
      htmlRef.current.stop().catch(() => {});
    }
  }, [running]);

  return (
    <div className="qr-scanner-container">
      <div id="qr-reader" ref={qrRef} className="w-full max-w-md mx-auto rounded-lg overflow-hidden" />
    </div>
  );
}
