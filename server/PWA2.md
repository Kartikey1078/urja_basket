Implement the custom PWA install prompt for Urja Basket following the approved implementation plan.

Requirements:
- Keep the implementation frontend-only (Next.js).
- Do not modify the backend or add any API calls.
- Use the browser's `beforeinstallprompt` event on supported browsers.
- Show a branded bottom-sheet after meaningful user engagement (5–10 seconds or after scrolling), not immediately.
- Never show the prompt on checkout pages or admin routes.
- Respect a 1-day dismissal using localStorage.
- Detect if the app is already installed (`display-mode: standalone`) and never show the prompt again.
- On iOS Safari, show an "Add to Home Screen" guide instead of an Install button.
- Keep the implementation lightweight with minimal re-renders (single hook + isolated component).
- Add proper PNG PWA icons (192×192 and 512×512) to the manifest if required.
- Follow React and Next.js best practices, keeping the code modular, production-ready, accessible, and well documented.

After implementation:
1. Summarize every file changed.
2. Explain why each change was made.
3. Confirm there are no unnecessary API calls, performance regressions, or additional re-renders.
4. List any browser limitations (Android/iOS) that still exist.