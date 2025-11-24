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
  const [logsList, setLogsList] = useState([])
  const [selectedLog, setSelectedLog] = useState(null)
  const [selectedLogContent, setSelectedLogContent] = useState(null)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

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

  // Load logs list when connected
  const loadLogsList = useCallback(async () => {
    if (!remoteStorage?.logs || !isConnected) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const list = await remoteStorage.logs.listLogs()
      setLogsList(list)
    } catch (error) {
      console.error("Error loading logs list:", error)
    } finally {
      setIsLoading(false)
    }
  }, [remoteStorage, isConnected])

  // Initial load
  useEffect(() => {
    if (!remoteStorage?.logs || !isConnected) {
      setIsLoading(false)
      return
    }

    loadLogsList()
  }, [remoteStorage, isConnected, loadLogsList])

  // Listen for remote changes
  useEffect(() => {
    if (!remoteStorage || !isConnected) return

    const changeHandler = (event) => {
      // Reload list when remote changes occur
      loadLogsList()
    }

    // RemoteStorage uses onChange with a path
    try {
      remoteStorage.onChange?.('/logs/', changeHandler)
    } catch (error) {
      console.warn("Could not attach change listener:", error)
    }

    return () => {
      // Cleanup: RemoteStorage handles cleanup automatically
    }
  }, [remoteStorage, isConnected, loadLogsList])

  /**
   * Load content of a specific log
   * @param {string} filename - The log filename
   */
  const loadLogContent = useCallback(async (filename) => {
    if (!remoteStorage?.logs || !isConnected) {
      return
    }

    try {
      const content = await remoteStorage.logs.getLog(filename)
      setSelectedLog(filename)
      setSelectedLogContent(content)
    } catch (error) {
      console.error("Error loading log content:", error)
      setSelectedLogContent(null)
    }
  }, [remoteStorage, isConnected])

  /**
   * Load analytics data (log types)
   * Caches the result to avoid re-fetching unless forced
   */
  const loadAnalyticsData = useCallback(async (force = false) => {
    if (!remoteStorage?.logs || !isConnected || logsList.length === 0) {
      return
    }

    // Return cached data if available and not forced
    if (analyticsData && !force) {
      return analyticsData
    }

    setIsAnalyticsLoading(true)

    try {
      const promises = logsList.map(async (log) => {
        try {
          const content = await remoteStorage.logs.getLog(log.name)
          return { ...log, content }
        } catch (e) {
          return { ...log, content: null }
        }
      })
      
      const logsWithContent = await Promise.all(promises)

      const typeCounts = {}
      logsWithContent.forEach(log => {
        try {
          const parsed = typeof log.content === 'object' ? log.content : JSON.parse(log.content)
          const action = parsed.action || 'Unknown'
          typeCounts[action] = (typeCounts[action] || 0) + 1
        } catch (e) {
          typeCounts['Error/Invalid'] = (typeCounts['Error/Invalid'] || 0) + 1
        }
      })

      const data = Object.entries(typeCounts).map(([name, value]) => ({
        name,
        value
      }))

      setAnalyticsData(data)
      return data
    } catch (error) {
      console.error("Error loading analytics data:", error)
      return []
    } finally {
      setIsAnalyticsLoading(false)
    }
  }, [remoteStorage, isConnected, logsList, analyticsData])

  return {
    // State
    isLoading,
    isConnected,
    analyticsData,
    isAnalyticsLoading,

    // Logs
    logsList,
    selectedLog,
    selectedLogContent,
    loadLogContent,
    loadAnalyticsData,

    // Utility
    reload: loadLogsList
  }
}

