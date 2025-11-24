/**
 * Custom RemoteStorage module template
 * 
 * Customize this module for your app:
 * 1. Change the module name
 * 2. Define your data types using declareType()
 * 3. Implement your CRUD methods in the exports object
 */

export const LogsModule = {
  name: 'logs',

  builder: function (privateClient, publicClient) {
    // ==================== TYPE DECLARATIONS ====================
    
    // We don't strictly need to declare types if we are just reading files,
    // but it's good practice. Since logs can be anything, we might not define a specific schema.
    
    // ==================== EXPORTED METHODS ====================

    return {
      exports: {
        /**
         * Get list of all log files
         * @returns {Promise<Array>}
         */
        listLogs: async function () {
          try {
            // List files in the root of the logs module
            const listing = await privateClient.getListing('');
            if (!listing) return [];

            // Filter for files (keys not ending in /) and map to a friendly format
            return Object.keys(listing).filter(key => !key.endsWith('/')).map(key => ({
              name: key,
              lastUpdated: listing[key] // RemoteStorage returns the ETag or timestamp usually
            }));
          } catch (error) {
            console.error("Error listing logs:", error);
            return [];
          }
        },

        /**
         * Get content of a specific log file
         * @param {string} filename - The name of the log file
         * @returns {Promise<string|Object|null>}
         */
        getLog: async function (filename) {
          try {
            const file = await privateClient.getFile(filename);
            if (!file) return null;
            return file.data;
          } catch (error) {
            console.error(`Error loading log ${filename}:`, error);
            return null;
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

