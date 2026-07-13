declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/** Dispara o evento Lead pro GTM (dataLayer) ao final do onboarding. */
export function trackLead() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: "Lead" });
}

/** Dispara o evento CompleteRegistration pro GTM (dataLayer) ao final do onboarding de empresa. */
export function trackCompleteRegistration() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: "CompleteRegistration" });
}
