# ROOT CAUSE: WebSocket 404 Hang

The PWA attempts to connect to `wss://chat.xboxlive.com/`. 
This endpoint returns a 404 Not Found.
In Edge, the Service Worker (entry.worker.js) catches this and attempts an immediate retry.
This creates a tight loop that blocks the main UI thread from progressing past the splash screen.
