import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-5xl font-extrabold text-[#1d67ba] mb-4">404</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-sm text-gray-500 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#1d67ba] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#1555a0] transition-colors"
        >
          Go to home page
        </Link>
      </div>
    </div>
  )
}
