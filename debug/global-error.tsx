"use client";
import * as React from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    // Optionally report to Sentry here
    // console.error("GlobalError", error);
  }, [error]);

  return (
    <html>
      <body>
        <div role="alert" style={{ padding: 24 }}>
          <h1>Something went wrong</h1>
          <p>{error?.message ?? "Unknown error"}</p>
          <button onClick={() => reset()}>Try again</button>
        </div>
      </body>
    </html>
  );
}
