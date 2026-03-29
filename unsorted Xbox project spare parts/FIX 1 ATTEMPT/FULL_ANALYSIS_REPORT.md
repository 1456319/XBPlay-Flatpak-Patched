# FULL ANALYSIS REPORT: Xbox Play PWA Splash Screen Hang

## Issue Description
The Xbox Play PWA (Progressive Web App) hangs indefinitely on the splash screen when launched via Microsoft Edge on Steam Deck (Flatpak). However, it works correctly when launched via Brave Browser.

## Diagnostic Findings
1. **Renderer Activity:** Strace shows high frequency of `futex` calls (84%), indicating a tight polling loop or thread synchronization issue in the JavaScript renderer.
2. **Network State:** The app appears to be waiting for a response from `chat.xboxlive.com` which returns a 404 error for the WebSocket upgrade request.
3. **Process State:** The Edge renderer is consuming ~34% CPU while sitting on the splash screen.
4. **Environment:** Edge version 133.0.3065.69 (stable) via Flatpak.

## Root Cause
The primary cause appears to be a failure in the initialization sequence, specifically related to the chat endpoint WebSocket connection. While the 404 is expected for an unsupported endpoint, the app's error handling in Edge seems to trigger an infinite retry loop instead of falling back.

## Recommendations
- Block `chat.xboxlive.com` in `/etc/hosts` to force a fast failure.
- Clear Service Worker cache for Edge.
- Use Brave Browser as a reliable workaround.
