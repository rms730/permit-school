"use client";
import { useEffect } from "react";

const DEV_ON = process.env.NEXT_PUBLIC_DEV_CONSOLE_TAP === "1" && process.env.NODE_ENV !== "production";

export default function ConsoleTap() {
  useEffect(() => {
    if (!DEV_ON || typeof window === "undefined") return;

    // Bind originals once
    const original = {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      fetch: typeof globalThis.fetch === "function" ? globalThis.fetch.bind(globalThis) : undefined,
    };

    // Helper to POST logs safely
    const post = async (payload: unknown) => {
      try {
        await original.fetch?.("/api/dev/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // Swallow errors – dev only
      }
    };

    // Patch console
    console.log = (...args: unknown[]) => { original.log(...args); void post({ type: "log", args }); };
    console.warn = (...args: unknown[]) => { original.warn(...args); void post({ type: "warn", args }); };
    console.error = (...args: unknown[]) => { original.error(...args); void post({ type: "error", args }); };

    // Patch fetch (if available)
    if (original.fetch) {
      globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        const startedAt = Date.now();
        try {
          const res = await original.fetch!(input as any, init);
          void post({
            type: "fetch",
            url: typeof input === "string" ? input : (input as any)?.url,
            status: (res as Response)?.status,
            ms: Date.now() - startedAt,
          });
          return res;
        } catch (err) {
          void post({ type: "fetch_error", url: typeof input === "string" ? input : (input as any)?.url, ms: Date.now() - startedAt, err: String(err) });
          throw err;
        }
      }) as typeof fetch;
    }

    // Global runtime errors
    const onError = (event: ErrorEvent) => void post({ type: "window_error", message: event.message, filename: event.filename, lineno: event.lineno, colno: event.colno });
    const onRejection = (event: PromiseRejectionEvent) => void post({ type: "unhandled_rejection", reason: String(event.reason) });

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    // Cleanup: restore originals and remove listeners
    return () => {
      console.log = original.log;
      console.warn = original.warn;
      console.error = original.error;
      if (original.fetch) globalThis.fetch = original.fetch as any;
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
