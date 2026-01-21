# Instructions

## How to Run
- `npm run dev` to start the development server.
- `npm run build` to build the application.
- `npm start` to start the production server (verified PWA behavior).

## PWA Features
- **Manifest**: Located at `public/manifest.json`.
- **Service Worker**: Generated as `public/sw.js` (and `workbox-*.js`) during build.
- **Update Prompt**: Implemented in `src/app/components/PwaUpdater.tsx`.

## Manual Verification (WSL2 / Windows)
1. **Build and Start**:
   ```bash
   npm run build
   npm start
   ```
2. **Access in Browser**:
   - Open `http://localhost:3000` (or `http://<your-wsl-ip>:3000`).
3. **Verify Manifest**:
   - Check `http://localhost:3000/manifest.json` loads correctly.
4. **Verify Service Worker**:
   - Open DevTools -> Application -> Service Workers.
   - You should see the SW registered.
5. **Update Prompt**:
   - Make a change to the code, rebuild, and reload. You should eventually see the reload prompt.
