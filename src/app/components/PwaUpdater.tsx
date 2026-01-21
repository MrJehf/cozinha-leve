"use client";

import { useEffect, useState } from "react";

export default function PwaUpdater() {
  const [showReload, setShowReload] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Basic implementation to detect waiting worker
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setShowReload(true);
        }
        // Listen for new workers installing and becoming waiting
        registration.addEventListener('updatefound', () => {
             const newWorker = registration.installing;
             if (newWorker) {
                 newWorker.addEventListener('statechange', () => {
                     if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        setWaitingWorker(newWorker);
                        setShowReload(true);
                     }
                 });
             }
        });
      });
    }
  }, []);

  const reloadPage = () => {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
    setShowReload(false);
    window.location.reload();
  };

  if (!showReload) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#333",
        color: "#fff",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <span>New update available!</span>
      <button
        onClick={reloadPage}
        style={{
          padding: "8px 12px",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Reload
      </button>
    </div>
  );
}
