# Page snapshot

```yaml
- alert
- dialog "Server Error":
  - navigation:
    - button "previous" [disabled]:
      - img "previous"
    - button "next" [disabled]:
      - img "next"
    - text: 1 of 1 error Next.js (14.2.7) is outdated
    - link "(learn more)":
      - /url: https://nextjs.org/docs/messages/version-staleness
  - heading "Server Error" [level=1]
  - paragraph: "Error: Cannot find module './vendor-chunks/@opentelemetry.js' Require stack: - /Users/rsternke/Developer/valleyApps/permit-school/web/.next/server/webpack-runtime.js - /Users/rsternke/Developer/valleyApps/permit-school/web/.next/server/app/[locale]/page.js - /Users/rsternke/Developer/valleyApps/permit-school/web/node_modules/next/dist/server/require.js - /Users/rsternke/Developer/valleyApps/permit-school/web/node_modules/next/dist/server/load-components.js - /Users/rsternke/Developer/valleyApps/permit-school/web/node_modules/next/dist/build/utils.js - /Users/rsternke/Developer/valleyApps/permit-school/web/node_modules/next/dist/server/dev/static-paths-worker.js - /Users/rsternke/Developer/valleyApps/permit-school/web/node_modules/next/dist/compiled/jest-worker/processChild.js"
  - text: This error happened while generating the page. Any console logs will be displayed in the terminal window.
  - heading "Call Stack" [level=2]
  - group:
    - img
    - img
    - text: Next.js
  - heading "TracingChannel.traceSync" [level=3]
  - text: node:diagnostics_channel (322:14)
  - group:
    - img
    - img
    - text: Next.js
```