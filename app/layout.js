"use client"
import "./globals.css"
import { RemoteStorageProvider } from "../contexts/RemoteStorageContext"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Next.js RemoteStorage App</title>
        <meta name="description" content="A Next.js app with RemoteStorage integration" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <RemoteStorageProvider>
          <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </RemoteStorageProvider>
      </body>
    </html>
  )
}

