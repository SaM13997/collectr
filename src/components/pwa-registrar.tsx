import { useEffect } from "react";
import { PwaInstallBanner } from "./pwa-install-banner";

export function PwaRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return <PwaInstallBanner />;
}
