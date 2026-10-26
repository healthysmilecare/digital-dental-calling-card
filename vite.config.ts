import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Content Security Policy for production builds.
 *
 * Injected only at build time: the Vite dev server and React Fast Refresh rely
 * on inline scripts, which this policy intentionally forbids.
 *
 * Note: `frame-ancestors` cannot be expressed in a <meta> tag. Set it (and
 * X-Content-Type-Options, Referrer-Policy, etc.) as real HTTP headers at the
 * hosting layer when the site is deployed.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ')

function cspPlugin(): Plugin {
  return {
    name: 'hsc-csp-meta',
    apply: 'build',
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
          injectTo: 'head-prepend',
        },
      ]
    },
  }
}

export default defineConfig({
  plugins: [react(), cspPlugin()],
  build: {
    target: 'es2022',
    sourcemap: false,
    // Never inline assets as data: URIs so the strict CSP above (no `data:` in
    // font-src/script-src) holds for every font subset.
    assetsInlineLimit: 0,
  },
  server: {
    // Serve only this project directory; never expose files above it.
    fs: { strict: true },
  },
})
