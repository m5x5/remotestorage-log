"use client"

import { useState, useEffect, useCallback, useRef } from "react"

/**
 * Hook to sync data with RemoteStorage
 * Provides methods for CRUD operations and automatic syncing
 *
 * @param {Object|null} remoteStorage - RemoteStorage instance from useRemoteStorage
 * @returns {Object} Data and methods for managing your data
 */
export function useData(remoteStorage) {
  // State
  const [items, setItems] = useState([])
  const [itemsList, setItemsList] = useState([])
  const [settings, setSettings] = useState({ theme: 'light', language: 'en' })
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  // Ref to prevent reload loops during saves
  const isSavingRef = useRef(false)

  // Check connection status
  useEffect(() => {
    if (!remoteStorage) {
      setIsConnected(false)
      return
    }

    const updateConnectionStatus = () => {
      setIsConnected(remoteStorage.connected || false)
    }

    updateConnectionStatus()

    // Listen for connection events
    remoteStorage.on?.('connected', updateConnectionStatus)
    remoteStorage.on?.('disconnected', updateConnectionStatus)

    return () => {
      remoteStorage.off?.('connected', updateConnectionStatus)
      remoteStorage.off?.('disconnected', updateConnectionStatus)
    }
  }, [remoteStorage])

  // Load all data when connected
  const loadAllData = useCallback(async () => {
    if (!remoteStorage?.mymodule || !isConnected) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      // Load items list (metadata)
      const list = await remoteStorage.mymodule.getItemsList()
      setItemsList(list)

      // Load settings
      const loadedSettings = await remoteStorage.mymodule.loadSettings()
      setSettings(loadedSettings)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [remoteStorage, isConnected])

  // Initial load
  useEffect(() => {
    if (!remoteStorage?.mymodule || !isConnected) {
      setIsLoading(false)
      return
    }

    loadAllData()
  }, [remoteStorage, isConnected, loadAllData])

  // Listen for remote changes
  useEffect(() => {
    if (!remoteStorage || !isConnected) return

    const changeHandler = (event) => {
      // Don't reload if we're currently saving (prevents loops)
      if (isSavingRef.current) return

      // Reload data when remote changes occur
      loadAllData()
    }

    // RemoteStorage uses onChange with a path
    try {
      remoteStorage.onChange?.('/mymodule/', changeHandler)
    } catch (error) {
      console.warn("Could not attach change listener:", error)
    }

    return () => {
      // Cleanup: RemoteStorage handles cleanup automatically
    }
  }, [remoteStorage, isConnected, loadAllData])

  // ==================== ITEMS METHODS ====================

  /**
   * Save an item
   * @param {Object} item - The item to save
   */
  const saveItem = useCallback(async (item) => {
    if (!remoteStorage?.mymodule || !isConnected) {
      throw new Error("RemoteStorage is not connected. Please connect to RemoteStorage.")
    }

    isSavingRef.current = true

    try {
      // Save to RemoteStorage
      await remoteStorage.mymodule.saveItem(item)

      // Reload items list to get updated metadata
      const updatedList = await remoteStorage.mymodule.getItemsList()
      setItemsList(updatedList)
    } catch (error) {
      console.error("Error saving item:", error)
      // Reload to get correct state
      await loadAllData()
      throw error
    } finally {
      setTimeout(() => {
        isSavingRef.current = false
      }, 100)
    }
  }, [remoteStorage, isConnected, loadAllData])

  /**
   * Load an item by ID
   * @param {string} id - The item ID
   * @returns {Promise<Object|null>}
   */
  const loadItem = useCallback(async (id) => {
    if (!remoteStorage?.mymodule || !isConnected) {
      return null
    }

    try {
      return await remoteStorage.mymodule.loadItem(id)
    } catch (error) {
      console.error("Error loading item:", error)
      return null
    }
  }, [remoteStorage, isConnected])

  /**
   * Delete an item by ID
   * @param {string} id - The item ID
   */
  const deleteItem = useCallback(async (id) => {
    if (!remoteStorage?.mymodule || !isConnected) {
      throw new Error("RemoteStorage is not connected")
    }

    isSavingRef.current = true

    try {
      await remoteStorage.mymodule.deleteItem(id)

      // Reload items list
      const updatedList = await remoteStorage.mymodule.getItemsList()
      setItemsList(updatedList)
    } catch (error) {
      console.error("Error deleting item:", error)
      throw error
    } finally {
      setTimeout(() => {
        isSavingRef.current = false
      }, 100)
    }
  }, [remoteStorage, isConnected])

  // ==================== SETTINGS METHODS ====================

  /**
   * Save settings
   * @param {Object} newSettings - Settings object to save
   */
  const saveSettings = useCallback(async (newSettings) => {
    if (!remoteStorage?.mymodule || !isConnected) {
      throw new Error("RemoteStorage is not connected")
    }

    isSavingRef.current = true

    try {
      // Optimistic update
      setSettings(newSettings)

      // Save to RemoteStorage
      await remoteStorage.mymodule.saveSettings(newSettings)
    } catch (error) {
      console.error("Error saving settings:", error)
      // Reload to get correct state
      await loadAllData()
      throw error
    } finally {
      setTimeout(() => {
        isSavingRef.current = false
      }, 100)
    }
  }, [remoteStorage, isConnected, loadAllData])

  return {
    // State
    isLoading,
    isConnected,

    // Items
    items,
    itemsList,
    saveItem,
    loadItem,
    deleteItem,

    // Settings
    settings,
    saveSettings,

    // Utility
    reload: loadAllData
  }
}

