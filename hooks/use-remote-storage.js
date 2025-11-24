"use client"

import { useEffect, useRef, useState } from "react"

// Singleton instance - lives outside React lifecycle
let remoteStorageInstance = null
let isInitialized = false

/**
 * Hook to get the singleton RemoteStorage instance
 * @param {Object} options - Configuration options
 * @param {Array} options.modules - RemoteStorage modules to load
 * @param {Object} options.accessClaims - Module access claims { moduleName: 'r' | 'rw' }
 * @returns {Object|null} RemoteStorage instance or null if not ready
 */
export function useRemoteStorage(options = {}) {
  const { modules = [], accessClaims = {} } = options
  const hasClaimedAccess = useRef(false)
  const [instance, setInstance] = useState(remoteStorageInstance)

  useEffect(() => {
    async function initializeRemoteStorage() {
      // Only initialize once
      if (remoteStorageInstance) {
        setInstance(remoteStorageInstance)
        return
      }

      try {
        // Dynamic import to avoid SSR issues
        const RemoteStorageModule = await import("remotestoragejs")
        const RemoteStorage = RemoteStorageModule.default || RemoteStorageModule.RemoteStorage || RemoteStorageModule

        if (!RemoteStorage) {
          throw new Error("RemoteStorage could not be loaded")
        }

        // Create singleton instance with modules
        remoteStorageInstance = new RemoteStorage({
          modules: modules
        })

        setInstance(remoteStorageInstance)
      } catch (error) {
        console.error("Error initializing RemoteStorage:", error)
      }
    }

    initializeRemoteStorage()
  }, []) // Only run once on mount

  // Claim access to modules after instance is ready
  useEffect(() => {
    if (!remoteStorageInstance || !remoteStorageInstance.access || hasClaimedAccess.current || isInitialized) {
      return
    }

    // Use setTimeout to avoid race conditions with RemoteStorage initialization
    const timeoutId = setTimeout(() => {
      if (!remoteStorageInstance?.access || !remoteStorageInstance?.caching) {
        console.warn('RemoteStorage not ready yet')
        return
      }

      try {
        // Claim access for each module
        Object.entries(accessClaims).forEach(([module, mode]) => {
          remoteStorageInstance.access.claim(module, mode)
          remoteStorageInstance.caching.enable(`/${module}/`)
        })

        hasClaimedAccess.current = true
        isInitialized = true
      } catch (error) {
        console.error("Error claiming access:", error)
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [instance, accessClaims])

  return instance
}

