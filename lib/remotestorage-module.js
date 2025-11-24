/**
 * Custom RemoteStorage module template
 * 
 * Customize this module for your app:
 * 1. Change the module name
 * 2. Define your data types using declareType()
 * 3. Implement your CRUD methods in the exports object
 */

export const MyModule = {
  name: 'mymodule',

  builder: function (privateClient, publicClient) {
    // ==================== TYPE DECLARATIONS ====================
    
    /**
     * Declare your data types here
     * This helps RemoteStorage cache and sync data efficiently
     */
    privateClient.declareType('item', {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        created_at: { type: 'string' },
        updated_at: { type: 'string' }
      },
      required: ['id', 'created_at']
    })

    privateClient.declareType('settings', {
      type: 'object',
      properties: {
        theme: { type: 'string' },
        language: { type: 'string' },
        updated_at: { type: 'string' }
      }
    })

    // ==================== EXPORTED METHODS ====================

    return {
      exports: {
        /**
         * Save an item
         * @param {Object} item - The item to save
         * @returns {Promise<void>}
         */
        saveItem: async function (item) {
          const timestamp = new Date().toISOString()
          const data = {
            ...item,
            updated_at: timestamp
          }

          // Save to RemoteStorage
          await privateClient.storeObject('item', `items/${item.id}.json`, data)

          // Update the items list
          const itemsList = await this.getItemsList()
          const existingIndex = itemsList.findIndex(i => i.id === item.id)

          if (existingIndex >= 0) {
            itemsList[existingIndex] = { id: item.id, title: item.title, updated_at: timestamp }
          } else {
            itemsList.push({ id: item.id, title: item.title, updated_at: timestamp })
          }

          // Sort by updated date, newest first
          itemsList.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))

          await privateClient.storeFile('application/json', 'items/list.json', JSON.stringify(itemsList))
        },

        /**
         * Load an item by ID
         * @param {string} id - The item ID
         * @returns {Promise<Object|null>}
         */
        loadItem: async function (id) {
          try {
            const data = await privateClient.getObject(`items/${id}.json`)
            return data || null
          } catch (error) {
            if (isNotFoundError(error)) {
              return null
            }
            throw error
          }
        },

        /**
         * Get list of all items (metadata only)
         * @returns {Promise<Array>}
         */
        getItemsList: async function () {
          try {
            const file = await privateClient.getFile('items/list.json')

            if (file && file.data) {
              const parsed = typeof file.data === 'string' ? JSON.parse(file.data) : file.data
              return Array.isArray(parsed) ? parsed : []
            }

            return []
          } catch (error) {
            if (isNotFoundError(error)) {
              return []
            }
            console.error("Error loading items list:", error)
            return []
          }
        },

        /**
         * Delete an item by ID
         * @param {string} id - The item ID
         * @returns {Promise<void>}
         */
        deleteItem: async function (id) {
          try {
            // Remove the item file
            await privateClient.remove(`items/${id}.json`)

            // Update the items list
            const itemsList = await this.getItemsList()
            const updatedList = itemsList.filter(i => i.id !== id)

            // Save updated list
            await privateClient.storeFile('application/json', 'items/list.json', JSON.stringify(updatedList))
          } catch (error) {
            console.error("Error deleting item:", error)
            throw error
          }
        },

        // ==================== SETTINGS METHODS ====================

        /**
         * Save settings
         * @param {Object} settings - Settings object
         * @returns {Promise<void>}
         */
        saveSettings: async function (settings) {
          const data = {
            ...settings,
            updated_at: new Date().toISOString()
          }
          await privateClient.storeObject('settings', 'settings.json', data)
        },

        /**
         * Load settings
         * @returns {Promise<Object>}
         */
        loadSettings: async function () {
          const defaultSettings = {
            theme: 'light',
            language: 'en'
          }

          try {
            const data = await privateClient.getObject('settings.json')
            return data ? { ...defaultSettings, ...data } : defaultSettings
          } catch (error) {
            if (isNotFoundError(error)) {
              return defaultSettings
            }
            console.error("Error loading settings:", error)
            return defaultSettings
          }
        }
      }
    }
  }
}

/**
 * Helper function to check if error is a "not found" error
 * @param {Error} error - The error to check
 * @returns {boolean}
 */
function isNotFoundError(error) {
  return (
    error?.status === 404 ||
    error?.code === 404 ||
    error?.code === "NotFound" ||
    error?.name === "NotFoundError" ||
    (error?.message && error.message.includes("404")) ||
    (error?.message && error.message.includes("Not Found")) ||
    (error?.message && error.message.includes("Not a folder"))
  )
}

