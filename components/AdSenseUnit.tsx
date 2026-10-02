"use client";

import { useEffect, useRef, useState } from "react";

// Extend the Window type for our custom tracking counter
declare global {
  interface Window {
    __adsense_count?: number;
    __adsense_loaded?: boolean;
  }
}

interface AdSenseUnitProps {
  slot: string;
  format?: string;
  style?: React.CSSProperties;
}

const MAX_UNITS_PER_VIEW = 3;

function loadAdSenseScript(clientId: string) {
  if (typeof window === "undefined" || window.__adsense_loaded) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
  window.__adsense_loaded = true;
}

export default function AdSenseUnit({ slot, format = "auto", style }: AdSenseUnitProps) {
  const [canRender, setCanRender] = useState(false);
  const insRef = useRef<HTMLModElement>(null);
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    if (!clientId) return;

    const tryRender = () => {
      const consent = localStorage.getItem("cookie_consent");
      if (consent !== "accepted") return;

      const count = window.__adsense_count ?? 0;
      if (count >= MAX_UNITS_PER_VIEW) return;

      window.__adsense_count = count + 1;
      setCanRender(true);
      loadAdSenseScript(clientId);
    };

    // Check immediately in case consent was already given
    tryRender();

    // Also listen for the consent event fired by CookieConsent component
    window.addEventListener("cookie_consent_accepted", tryRender);
    return () => window.removeEventListener("cookie_consent_accepted", tryRender);
  }, [clientId]);

  useEffect(() => {
    if (canRender && insRef.current) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch {
        /* AdSense already initialised this unit */
      }
    }
  }, [canRender]);

  if (!clientId || !canRender) return null;

  return (
    <div className="adsense-unit overflow-hidden" aria-label="Advertisement">
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
