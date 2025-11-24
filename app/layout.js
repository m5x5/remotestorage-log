"use client"
import "./globals.css"
import { RemoteStorageProvider } from "../contexts/RemoteStorageContext"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>RemoteStorage Log Viewer</title>
        <meta name="description" content="View logs from your RemoteStorage apps" />
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

