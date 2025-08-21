# Dev Console Tap

The Dev Console Tap is a development-only feature that forwards client-side console logs, errors, and network requests to the server console for easier debugging.

## Features

- **Console Logs**: Captures `console.log`, `console.warn`, and `console.error`
- **Runtime Errors**: Captures unhandled JavaScript errors and promise rejections
- **Network Requests**: Monitors `fetch` requests with timing and status codes
- **Global Errors**: Captures React rendering errors via global error boundary

## Usage

### Enable the Console Tap

Set the environment variable in your `.env.local` file:

```bash
NEXT_PUBLIC_DEV_CONSOLE_TAP=1
```

Or run the development server with the flag:

```bash
NEXT_PUBLIC_DEV_CONSOLE_TAP=1 npm run dev
```

### View Logs

When enabled, all client-side activity will be logged to your server console with the prefix `[DEV LOG]`:

```
[DEV LOG] {"ts":1703123456789,"type":"console.log","args":["Hello from client"]}
[DEV LOG] {"ts":1703123456790,"type":"fetch","url":"/api/users","method":"GET","status":200,"ms":45}
[DEV LOG] {"ts":1703123456791,"type":"window.error","message":"Cannot read property 'x' of undefined","filename":"/app.js","lineno":10,"colno":15}
```

### Disable the Console Tap

To disable the console tap, either:

1. Remove the environment variable from `.env.local`
2. Set it to `0`: `NEXT_PUBLIC_DEV_CONSOLE_TAP=0`
3. Don't set it at all (defaults to disabled)

## Security

- **Development Only**: The console tap only works in development mode (`NODE_ENV !== 'production'`)
- **No Production Impact**: The API endpoint returns immediately in production
- **Local Only**: Logs are only sent to your local development server

## API Endpoint

The console tap sends data to `/api/dev/log` which:

- Accepts POST requests with JSON payload
- Logs the data to the server console
- Returns `{ok: true}` on success
- Returns `{ok: false}` on error

## Example Output

```bash
# Server console output when console tap is enabled
[DEV LOG] {"ts":1703123456789,"type":"console.log","args":["User clicked button"]}
[DEV LOG] {"ts":1703123456790,"type":"fetch","url":"/api/auth/login","method":"POST","status":200,"ms":123}
[DEV LOG] {"ts":1703123456791,"type":"window.error","message":"TypeError: Cannot read property 'name' of undefined","filename":"/app.js","lineno":25,"colno":10,"stack":"TypeError: Cannot read property 'name' of undefined\n    at handleSubmit (/app.js:25:10)\n    at onClick (/app.js:30:5)"}
[DEV LOG] {"ts":1703123456792,"type":"unhandledrejection","reason":"Network request failed"}
```

## Troubleshooting

### Console Tap Not Working

1. **Check Environment Variable**: Ensure `NEXT_PUBLIC_DEV_CONSOLE_TAP=1` is set
2. **Restart Dev Server**: The environment variable requires a server restart
3. **Check Browser Console**: Look for any errors in the browser's developer tools
4. **Verify API Endpoint**: Test that `/api/dev/log` responds to POST requests

### Too Many Logs

If you're getting too many logs, you can:

1. **Filter in Terminal**: Use `grep` to filter specific log types:
   ```bash
   npm run dev | grep "\[DEV LOG\]"
   ```

2. **Temporarily Disable**: Set `NEXT_PUBLIC_DEV_CONSOLE_TAP=0` to disable

3. **Use Browser DevTools**: Use the browser's built-in console for more detailed debugging

## Integration with Testing

The console tap is automatically enabled during Playwright tests when `NEXT_PUBLIC_DEV_CONSOLE_TAP=1` is set, allowing you to capture client-side errors and logs during automated testing.

## Files

- **Component**: `src/components/dev/ConsoleTap.tsx`
- **API Route**: `src/app/api/dev/log/route.ts`
- **Global Error**: `src/app/global-error.tsx`
- **Layout Integration**: `src/app/layout.tsx`
