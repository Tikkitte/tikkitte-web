import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { networkInterfaces, hostname } from "node:os";

const supabaseHost = 'eqlewbjeyfkhnlrkvjjx.supabase.co';
const isDev = process.env.NODE_ENV !== 'production';

// Detected fresh at each dev-server start, so testing from a phone on the LAN
// (e.g. the /scan page) keeps working across WiFi/network changes without a
// hardcoded IP going stale. No effect in production builds.
function getLanIPs(): string[] {
  const ips: string[] = [];
  for (const addrs of Object.values(networkInterfaces())) {
    for (const addr of addrs ?? []) {
      if (addr.family === 'IPv4' && !addr.internal) ips.push(addr.address);
    }
  }
  return ips;
}
const lanIPs = isDev ? getLanIPs() : [];
// The Mac's Bonjour/mDNS name (e.g. "Davids-MacBook-Pro.local") — stable
// across WiFi networks (unlike the LAN IP), so this is the preferred way to
// reach the dev server from a phone. Only resolves on networks that allow
// mDNS (most home WiFi; not cellular or some public/guest networks).
const lanHostname = isDev ? hostname() : '';

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    // Allow camera only for same-origin (used by /scan QR scanner). Block mic + geolocation.
    value: 'camera=(self), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js hydration uses inline scripts; Turnstile and Vercel Analytics load from CDN
      `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://va.vercel-scripts.com`,
      // Recharts and Next.js use inline styles; Google Fonts stylesheet
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      // Google Fonts files
      `font-src 'self' https://fonts.gstatic.com`,
      // Supabase storage images, data: URIs (QR codes), blob: (camera preview)
      `img-src 'self' data: blob: https://${supabaseHost}`,
      // API calls: Supabase REST + realtime WS, Vercel analytics, Paystack API
      // Local dev also needs the local Supabase stack — localhost, plain-http
      // LAN IP (dashboard testing), and the mkcert-backed https LAN proxy on
      // :54443 (needed for camera/getUserMedia, which requires a secure
      // context — see .certs/README). Never added in production.
      `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://vitals.vercel-insights.com https://va.vercel-scripts.com https://api.paystack.co${isDev ? ' http://localhost:54321 ws://localhost:54321 https://localhost:54443 wss://localhost:54443' + lanIPs.map((ip) => ` http://${ip}:54321 ws://${ip}:54321 https://${ip}:54443 wss://${ip}:54443`).join('') + (lanHostname ? ` https://${lanHostname}:54443 wss://${lanHostname}:54443` : '') : ''}`,
      // Turnstile renders inside an iframe from Cloudflare
      `frame-src https://challenges.cloudflare.com`,
      // Block Flash/plugins
      `object-src 'none'`,
      // Prevent base tag injection attacks
      `base-uri 'self'`,
      // Restrict form submissions to same origin
      `form-action 'self'`,
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  // Lets the dev server's own resources (HMR websocket, RSC chunks) load when
  // testing from another device on the LAN, e.g. a phone. Dev-only; has no
  // effect in production builds.
  ...(isDev ? { allowedDevOrigins: lanHostname ? [...lanIPs, lanHostname] : lanIPs } : {}),
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/scan/iphone',
        destination: '/scan',
        permanent: true,
      },
    ];
  },
  images: {
    qualities: [20, 75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHost,
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  silent: !process.env.CI,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
