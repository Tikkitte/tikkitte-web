import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const supabaseHost = 'eqlewbjeyfkhnlrkvjjx.supabase.co';

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
      `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://vitals.vercel-insights.com https://va.vercel-scripts.com https://api.paystack.co`,
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
  images: {
    qualities: [75, 90],
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
