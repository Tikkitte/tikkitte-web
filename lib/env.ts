const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key])

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variable${missingEnvVars.length === 1 ? '' : 's'}: ${missingEnvVars.join(', ')}. ` +
      'Set them in .env.local for development and in Vercel for deployed environments.'
  )
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
}
