"use client"

import { createContext, useContext, useMemo } from "react"
import { useRemoteStorage } from "../hooks/use-remote-storage"
import { useData } from "../hooks/use-data"
import { MyModule } from "../lib/remotestorage-module"
import RemoteStorageWidget from "../components/RemoteStorageWidget"

const RemoteStorageContext = createContext(null)

/**
 * RemoteStorageProvider using the hook-based architecture
 * Wraps your app to provide RemoteStorage functionality
 */
export function RemoteStorageProvider({ children }) {
  // Initialize RemoteStorage with your module
  const remoteStorage = useRemoteStorage({
    modules: [MyModule],
    accessClaims: {
      'mymodule': 'rw'  // Read-write access to your module
    }
  })

  // Initialize data sync
  const data = useData(remoteStorage)

  // Memoize context value to prevent unnecessary rerenders
  const value = useMemo(() => ({
    // RemoteStorage instance
    remoteStorage,

    // Connection state
    isConnected: data.isConnected,
    isLoading: data.isLoading,

    // Data and methods from useData hook
    ...data
  }), [remoteStorage, data])

  return (
    <RemoteStorageContext.Provider value={value}>
      {children}
      {/* Widget for connecting to RemoteStorage */}
      {remoteStorage && <RemoteStorageWidget remoteStorage={remoteStorage} />}
    </RemoteStorageContext.Provider>
  )
}

/**
 * Hook to access RemoteStorage context
 * @returns {Object} RemoteStorage context value
 */
export function useRemoteStorageContext() {
  const context = useContext(RemoteStorageContext)
  if (!context) {
    throw new Error("useRemoteStorageContext must be used within a RemoteStorageProvider")
  }
  return context
}

