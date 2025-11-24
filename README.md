# Next.js RemoteStorage Template

A clean, production-ready Next.js template for building apps with RemoteStorage.js integration. Based on the successful implementation from the angebote-next project.

## Features

- ✅ Next.js 14+ with App Router
- ✅ RemoteStorage.js for decentralized data storage
- ✅ Custom RemoteStorage module pattern
- ✅ React hooks for data synchronization
- ✅ RemoteStorage widget for user authentication
- ✅ Tailwind CSS for styling
- ✅ TypeScript-ready structure
- ✅ Clean, extensible architecture

## Quick Start

```bash
# Copy this template to your new project
cp -r nextjs-remotestorage-template my-new-project
cd my-new-project

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Project Structure

```
├── app/
│   ├── layout.js           # Root layout with RemoteStorageProvider
│   ├── page.js             # Example page showing RemoteStorage usage
│   └── globals.css         # Global styles
├── components/
│   └── RemoteStorageWidget.js  # Connection widget UI
├── contexts/
│   └── RemoteStorageContext.js # RemoteStorage React Context
├── hooks/
│   ├── use-remote-storage.js   # RemoteStorage initialization
│   └── use-data.js             # Data sync and CRUD operations
├── lib/
│   ├── remotestorage-module.js # Custom RemoteStorage module
│   └── utils.js                # Utility functions
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.mjs
```

## Key Concepts

### 1. RemoteStorage Module

Define your data schema and methods in `lib/remotestorage-module.js`:

```javascript
export const MyModule = {
  name: 'mymodule',
  builder: function (privateClient, publicClient) {
    // Declare data types
    privateClient.declareType('item', { ... })
    
    return {
      exports: {
        // Your CRUD methods
        saveItem: async function(item) { ... },
        loadItem: async function(id) { ... }
      }
    }
  }
}
```

### 2. Custom Hook for Data

Create a custom hook in `hooks/use-data.js` that wraps your module's methods and provides React state:

```javascript
export function useData(remoteStorage) {
  const [items, setItems] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  
  // Load data when connected
  // Provide methods to save/update/delete
  // Handle optimistic updates
  
  return { items, saveItem, deleteItem, isConnected }
}
```

### 3. Provider Setup

Wrap your app in the `RemoteStorageProvider` in `app/layout.js`:

```javascript
<RemoteStorageProvider>
  {children}
</RemoteStorageProvider>
```

### 4. Use in Components

Access RemoteStorage in your components:

```javascript
'use client'
import { useRemoteStorageContext } from '@/contexts/RemoteStorageContext'

export default function MyComponent() {
  const { data, isConnected, saveItem } = useRemoteStorageContext()
  
  // Use your data and methods
}
```

## Customizing for Your Project

### Step 1: Define Your Data Schema

Edit `lib/remotestorage-module.js`:

1. Change the module name from `'mymodule'` to your module name
2. Define your data types using `declareType()`
3. Implement your CRUD methods in the `exports` object

### Step 2: Update the Data Hook

Edit `hooks/use-data.js`:

1. Update state variables to match your data
2. Implement load/save/delete methods
3. Add any business logic needed

### Step 3: Update the Context

Edit `contexts/RemoteStorageContext.js`:

1. Update the module import
2. Update `accessClaims` to match your module name
3. Update the context value to expose what you need

### Step 4: Build Your UI

Update `app/page.js` and create new components as needed.

## RemoteStorage Patterns

### Optimistic Updates

Update local state immediately for responsive UI, then sync to RemoteStorage:

```javascript
const saveItem = useCallback(async (item) => {
  // Optimistic update
  setItems(prev => [...prev, item])
  
  try {
    // Sync to RemoteStorage
    await remoteStorage.mymodule.saveItem(item)
  } catch (error) {
    // Revert on error
    loadAllData()
    throw error
  }
}, [remoteStorage])
```

### Preventing Reload Loops

Use a ref to prevent infinite loops when saving triggers a change event:

```javascript
const isSavingRef = useRef(false)

const save = async () => {
  isSavingRef.current = true
  await remoteStorage.mymodule.save(data)
  setTimeout(() => { isSavingRef.current = false }, 100)
}

// In change listener
if (isSavingRef.current) return
```

### Connection Status

Always check connection before operations:

```javascript
if (!remoteStorage?.mymodule || !isConnected) {
  throw new Error("Not connected to RemoteStorage")
}
```

## Testing RemoteStorage

1. **Local Testing**: Use https://remotestorage-widget.m5x5.com/ or similar test server
2. **Browser DevTools**: Check Application → IndexedDB for cached data
3. **Network Tab**: Monitor API calls to RemoteStorage server
4. **Test Scenarios**:
   - Connect/disconnect
   - Multiple devices syncing
   - Offline usage
   - Conflict resolution

## Dependencies

- `remotestoragejs@^2.0.0-beta.8` - Core RemoteStorage protocol
- `m5x5-remotestorage-widget@^1.8.0` - UI widget for connecting
- `next@^14.2.15` - Next.js framework
- `react@^18.3.1` - React library
- `tailwindcss@^3.4.14` - CSS framework

## Additional Resources

- [RemoteStorage.js Documentation](https://remotestoragejs.readthedocs.io/)
- [RemoteStorage Protocol](https://remotestorage.io/)
- [Next.js Documentation](https://nextjs.org/docs)

## Tips

1. **Module Names**: Use lowercase, no special characters
2. **File Paths**: Use forward slashes, end folders with `/`
3. **Type Declarations**: Define all types upfront for better caching
4. **Error Handling**: Always handle 404s gracefully (file doesn't exist yet)
5. **Timestamps**: Use ISO format for consistency across timezones
6. **List Files**: Keep separate list files for quick metadata access

## License

MIT - Use this template for any project!

