import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

const SESSION_KEY = "tymflo_session_id";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function useAnalytics() {
  const [location] = useLocation();
  const lastTrackedPath = useRef<string>("");

  useEffect(() => {
    if (location === lastTrackedPath.current) return;
    if (location.startsWith("/admin")) return;

    lastTrackedPath.current = location;

    const trackPageView = async () => {
      try {
        const response = await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: location,
            referrer: document.referrer || null,
            sessionId: getSessionId(),
          }),
        });
        if (!response.ok) return;
      } catch (e) {
        return;
      }
    };

    // Small delay to avoid tracking during rapid navigation
    const timeout = setTimeout(trackPageView, 100);
    return () => clearTimeout(timeout);
  }, [location]);
}
