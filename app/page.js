"use client"

import { useState } from "react"
import { useRemoteStorageContext } from "../contexts/RemoteStorageContext"

export default function Home() {
  const { isConnected, isLoading, itemsList, saveItem, loadItem, deleteItem, settings, saveSettings } = useRemoteStorageContext()
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedItem, setSelectedItem] = useState(null)
  const [message, setMessage] = useState("")

  // Handle save new item
  const handleSave = async (e) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setMessage("Please enter a title")
      return
    }

    try {
      const newItem = {
        id: Date.now().toString(),
        title: title,
        description: description,
        created_at: new Date().toISOString()
      }
      
      await saveItem(newItem)
      setMessage("Item saved successfully!")
      setTitle("")
      setDescription("")
      
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage("Error saving item: " + error.message)
    }
  }

  // Handle load item
  const handleLoadItem = async (id) => {
    try {
      const item = await loadItem(id)
      setSelectedItem(item)
    } catch (error) {
      setMessage("Error loading item: " + error.message)
    }
  }

  // Handle delete item
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    
    try {
      await deleteItem(id)
      setMessage("Item deleted successfully!")
      setSelectedItem(null)
      
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage("Error deleting item: " + error.message)
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Next.js RemoteStorage Template
        </h1>
        <p className="text-gray-600 mb-8">
          A minimal example showing RemoteStorage integration
        </p>

        {/* Connection Status */}
        <div className="mb-8 p-4 rounded-lg bg-white shadow">
          <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
          {isLoading ? (
            <p className="text-gray-600">Loading...</p>
          ) : isConnected ? (
            <p className="text-green-600 font-medium">✓ Connected to RemoteStorage</p>
          ) : (
            <div>
              <p className="text-orange-600 font-medium">⚠ Not connected</p>
              <p className="text-sm text-gray-600 mt-1">
                Click the RemoteStorage widget in the bottom right to connect
              </p>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-blue-800">{message}</p>
          </div>
        )}

        {/* Only show content if connected */}
        {isConnected && (
          <>
            {/* Create New Item */}
            <div className="mb-8 p-6 rounded-lg bg-white shadow">
              <h2 className="text-xl font-semibold mb-4">Create New Item</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter item title"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter item description (optional)"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Save Item
                </button>
              </form>
            </div>

            {/* Items List */}
            <div className="mb-8 p-6 rounded-lg bg-white shadow">
              <h2 className="text-xl font-semibold mb-4">Your Items</h2>
              {itemsList.length === 0 ? (
                <p className="text-gray-600">No items yet. Create one above!</p>
              ) : (
                <div className="space-y-2">
                  {itemsList.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500">
                          Updated: {new Date(item.updated_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadItem(item.id)}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Item Details */}
            {selectedItem && (
              <div className="mb-8 p-6 rounded-lg bg-white shadow">
                <h2 className="text-xl font-semibold mb-4">Item Details</h2>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Title:</span>
                    <p className="text-gray-900">{selectedItem.title}</p>
                  </div>
                  {selectedItem.description && (
                    <div>
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="text-gray-900">{selectedItem.description}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <p className="text-gray-600">
                      {new Date(selectedItem.created_at).toLocaleString()}
                    </p>
                  </div>
                  {selectedItem.updated_at && (
                    <div>
                      <span className="font-medium text-gray-700">Updated:</span>
                      <p className="text-gray-600">
                        {new Date(selectedItem.updated_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="mt-4 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            )}

            {/* Settings */}
            <div className="p-6 rounded-lg bg-white shadow">
              <h2 className="text-xl font-semibold mb-4">Settings</h2>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Theme:</span>
                  <p className="text-gray-900">{settings.theme}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Language:</span>
                  <p className="text-gray-900">{settings.language}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                This demonstrates settings storage. Extend this in your app!
              </p>
            </div>
          </>
        )}

        {/* Instructions */}
        {!isConnected && (
          <div className="mt-8 p-6 rounded-lg bg-white shadow">
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Click the RemoteStorage widget in the bottom right corner</li>
              <li>Connect to a RemoteStorage server (e.g., https://remotestorage-widget.m5x5.com/)</li>
              <li>Grant access to your data</li>
              <li>Start creating and managing items!</li>
            </ol>
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Your data is stored on your own RemoteStorage server, 
                giving you full control and ownership of your information.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

