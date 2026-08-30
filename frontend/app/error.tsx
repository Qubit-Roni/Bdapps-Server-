'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg border-l-4 border-red-500 p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-full text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Something went wrong!</h2>
        </div>
        
        <div className="bg-red-50 text-red-700 text-sm font-mono p-3 rounded overflow-x-auto">
          {error.message || "An unexpected error occurred."}
        </div>
        
        <p className="text-sm text-gray-600">
          We caught an error in the UI. Check your code where the page crashed.
        </p>

        <button
          onClick={() => reset()}
          className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
