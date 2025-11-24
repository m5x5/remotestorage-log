"use client"

import { useEffect, useState, useRef } from "react"

/**
 * RemoteStorage connection widget component
 * Provides UI for users to connect their RemoteStorage accounts
 *
 * @param {Object} props
 * @param {Object} props.remoteStorage - RemoteStorage instance
 */
export default function RemoteStorageWidget({ remoteStorage }) {
  const [widget, setWidget] = useState(null)
  const initializedRef = useRef(false)

  // Dynamic import to avoid SSR issues
  useEffect(() => {
    // Prevent double initialization (React StrictMode)
    if (initializedRef.current || !remoteStorage) return
    initializedRef.current = true

    async function loadWidget() {
      try {
        const WidgetModule = await import("m5x5-remotestorage-widget")
        const Widget = WidgetModule.default || WidgetModule

        if (!Widget) {
          console.error("Widget module could not be loaded")
          return
        }

        // Wait a bit for the container to be in the DOM
        setTimeout(() => {
          const container = document.getElementById("remotestorage-widget-container")
          if (container) {
            // Check if widget was already attached to avoid duplicates
            if (container.children.length > 0) {
              console.log("Widget already attached")
              return
            }

            // Create widget instance
            const widgetInstance = new Widget(remoteStorage, {
              autoCloseAfter: 2000,
              modalBackdrop: "onlySmallScreens"
            })

            // Attach widget to container
            widgetInstance.attach(container)
            setWidget(widgetInstance)
          } else {
            console.error("Widget container not found in DOM")
          }
        }, 100)
      } catch (error) {
        console.error("Error loading RemoteStorage widget:", error)
      }
    }

    loadWidget()

    return () => {
      // Cleanup widget on unmount
      if (widget) {
        // Widget cleanup if needed
      }
    }
  }, [remoteStorage])

  // Always render the container
  return (
    <div
      id="remotestorage-widget-container"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 1000
      }}
    />
  )
}

