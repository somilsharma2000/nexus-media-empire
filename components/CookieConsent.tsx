"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if no consent has been recorded yet
    const existing = localStorage.getItem(CONSENT_KEY);
    if (!existing) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
    // Fire custom event so AdSense units can load lazily
    window.dispatchEvent(new Event("cookie_consent_accepted"));
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-[9999] bg-gray-950 border-t border-gray-800 shadow-2xl"
    >
      <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-300 leading-relaxed">
          We use cookies for analytics and advertising.{" "}
          <span className="text-gray-400">Accept to continue.</span>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={decline}
            className="px-5 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 text-sm font-bold transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
