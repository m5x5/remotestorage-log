# Architecture Overview

This document explains how the RemoteStorage integration works in this template.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Your App                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 React Components                     │   │
│  │              (app/page.js, etc.)                    │   │
│  └────────────────────┬────────────────────────────────┘   │
│                       │ useRemoteStorageContext()          │
│                       ↓                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          RemoteStorageContext                        │   │
│  │      (contexts/RemoteStorageContext.js)             │   │
│  │                                                      │   │
│  │  • Provides RemoteStorage instance                  │   │
│  │  • Manages connection state                         │   │
│  │  • Exposes data and methods                         │   │
│  └───────────┬────────────────────────┬─────────────────┘   │
│              │                        │                     │
│              ↓                        ↓                     │
│  ┌──────────────────────┐  ┌──────────────────────┐       │
│  │  useRemoteStorage    │  │     useData          │       │
│  │  (hooks/)            │  │     (hooks/)         │       │
│  │                      │  │                      │       │
│  │  • Singleton RS      │  │  • Load/save data   │       │
│  │  • Module loading    │  │  • State management │       │
│  │  • Access claims     │  │  • Optimistic UI    │       │
│  └──────────┬───────────┘  └───────┬──────────────┘       │
│             │                      │                       │
│             └──────────┬───────────┘                       │
│                        ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          RemoteStorage Module                        │   │
│  │      (lib/remotestorage-module.js)                  │   │
│  │                                                      │   │
│  │  • Type declarations                                │   │
│  │  • CRUD methods                                     │   │
│  │  • Business logic                                   │   │
│  └────────────────────┬────────────────────────────────┘   │
│                       │                                     │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        ↓
         ┌──────────────────────────────┐
         │   RemoteStorage Protocol     │
         │   (remotestoragejs library)  │
         └──────────────┬────────────────┘
                        │
                        ↓
         ┌──────────────────────────────┐
         │    RemoteStorage Server      │
         │  (User's chosen provider)    │
         │                              │
         │  • Data storage              │
         │  • Sync across devices       │
         │  • User owns data            │
         └──────────────────────────────┘
```

## Data Flow

### 1. Initialization

```
App Starts
    ↓
useRemoteStorage hook initializes
    ↓
Load RemoteStorage.js library
    ↓
Create RemoteStorage instance (singleton)
    ↓
Load custom modules
    ↓
Claim access to modules
    ↓
Enable caching
    ↓
Ready for connection
```

### 2. User Connection

```
User clicks widget
    ↓
Enter RemoteStorage address
    ↓
OAuth/WebFinger authentication
    ↓
Grant access permissions
    ↓
Connection established
    ↓
Sync begins (if data exists)
    ↓
useData hook loads initial data
    ↓
UI updates with data
```

### 3. Saving Data

```
User action (e.g., create item)
    ↓
Component calls saveItem()
    ↓
useData hook handles save
    ↓
Optimistic UI update (instant feedback)
    ↓
Call module's saveItem() method
    ↓
Module validates and stores data
    ↓
RemoteStorage.js syncs to server
    ↓
Success/error handling
    ↓
UI reflects final state
```

### 4. Remote Changes

```
Data changes on another device
    ↓
RemoteStorage server pushes update
    ↓
RemoteStorage.js receives change event
    ↓
onChange handler triggered
    ↓
useData reloads affected data
    ↓
State updates
    ↓
UI re-renders with new data
```

## Key Components

### RemoteStorage Instance (Singleton)

- **Location:** `hooks/use-remote-storage.js`
- **Purpose:** Single instance shared across entire app
- **Lifecycle:** Created once, persists for app lifetime
- **Responsibilities:**
  - Initialize RemoteStorage.js
  - Load modules
  - Claim access
  - Enable caching
  - Provide instance to Context

### RemoteStorage Context

- **Location:** `contexts/RemoteStorageContext.js`
- **Purpose:** Make RemoteStorage available to all components
- **Pattern:** React Context API
- **Provides:**
  - RemoteStorage instance
  - Connection state
  - Data from useData hook
  - Methods for CRUD operations

### Data Hook

- **Location:** `hooks/use-data.js`
- **Purpose:** Manage data sync and state
- **Pattern:** Custom React hook
- **Responsibilities:**
  - Track connection status
  - Load data on connect
  - Provide CRUD methods
  - Handle optimistic updates
  - Listen for remote changes
  - Prevent reload loops

### RemoteStorage Module

- **Location:** `lib/remotestorage-module.js`
- **Purpose:** Define data schema and operations
- **Pattern:** RemoteStorage.js module format
- **Contains:**
  - Type declarations (JSON Schema)
  - CRUD methods
  - Validation logic
  - File path structure

### RemoteStorage Widget

- **Location:** `components/RemoteStorageWidget.js`
- **Purpose:** UI for connecting/disconnecting
- **Pattern:** React component wrapping widget library
- **Features:**
  - Connect to server
  - Show connection status
  - Disconnect
  - Settings

## Design Patterns

### 1. Singleton Pattern

The RemoteStorage instance is a singleton:

```javascript
let remoteStorageInstance = null

export function useRemoteStorage() {
  if (remoteStorageInstance) {
    return remoteStorageInstance
  }
  
  remoteStorageInstance = new RemoteStorage({ ... })
  return remoteStorageInstance
}
```

**Why:** RemoteStorage should only be initialized once per app.

### 2. Provider Pattern

RemoteStorage is provided via React Context:

```javascript
<RemoteStorageProvider>
  <YourApp />
</RemoteStorageProvider>
```

**Why:** Makes RemoteStorage available to any component without prop drilling.

### 3. Custom Hooks Pattern

Data operations are encapsulated in custom hooks:

```javascript
const { items, saveItem, deleteItem } = useData(remoteStorage)
```

**Why:** Separates data logic from UI, reusable across components.

### 4. Optimistic Updates

UI updates immediately, then syncs:

```javascript
// Update UI first
setItems([...items, newItem])

// Then save to RemoteStorage
await remoteStorage.mymodule.saveItem(newItem)
```

**Why:** Provides instant feedback, feels faster to users.

### 5. Ref for Loop Prevention

Use ref to prevent reload loops:

```javascript
const isSavingRef = useRef(false)

const save = async () => {
  isSavingRef.current = true
  await remoteStorage.save()
  setTimeout(() => isSavingRef.current = false, 100)
}

// In change listener
if (isSavingRef.current) return
```

**Why:** Saving triggers a change event, which would trigger a reload, creating a loop.

## Security

### Data Privacy

- **Your data stays yours:** Data is stored on user's chosen RemoteStorage server
- **No central server:** Template doesn't store any user data
- **Private by default:** All data is private unless explicitly made public

### Access Control

- **Module-level permissions:** User grants access per module
- **Read/write separation:** Can request read-only or read-write access
- **Revocable:** User can revoke access at any time

### Best Practices

1. **Never store passwords in clear text**
2. **Validate all data before saving**
3. **Use HTTPS for RemoteStorage servers**
4. **Handle sensitive data carefully**
5. **Don't log user data**

## Performance Considerations

### Caching

RemoteStorage.js caches data in IndexedDB:
- **First load:** Fetches from server
- **Subsequent loads:** Uses cache, syncs in background
- **Offline:** Works with cached data

### Optimization Tips

1. **Use list files:** Store metadata separately from full items
2. **Lazy load:** Only load full items when needed
3. **Pagination:** Don't load all data at once
4. **Debounce saves:** Don't save on every keystroke
5. **Batch operations:** Group multiple changes

### Example: Efficient Loading

```javascript
// ❌ Bad: Load all full items
const items = await Promise.all(
  list.map(id => loadItem(id))
)

// ✅ Good: Load metadata, then load full items on demand
const metadata = await getItemsList()
// Display metadata in list
// Load full item only when user clicks
```

## Scaling Considerations

### File Size

- Keep individual files small (< 1MB)
- Split large datasets across multiple files
- Use pagination for lists

### File Organization

```
/mymodule/
  items/
    item-1.json      (small files)
    item-2.json
    list.json        (metadata only)
  settings.json      (app settings)
```

### Sync Performance

- RemoteStorage syncs changed files only
- Use timestamps to track changes
- Avoid unnecessary writes

## Error Handling

### Connection Errors

```javascript
if (!isConnected) {
  // Show "not connected" message
  // Disable features that need connection
}
```

### Not Found Errors

```javascript
try {
  const item = await loadItem(id)
} catch (error) {
  if (isNotFoundError(error)) {
    // File doesn't exist yet, return default
    return null
  }
  // Other error, rethrow
  throw error
}
```

### Sync Conflicts

RemoteStorage uses "last write wins" by default. For custom conflict resolution:

```javascript
// Advanced: Implement custom conflict resolution
remoteStorage.on('conflict', (event) => {
  // Handle conflict
})
```

## Testing

### Unit Tests

Test your module methods:

```javascript
describe('MyModule', () => {
  test('saves item correctly', async () => {
    const item = { id: '1', title: 'Test' }
    await myModule.saveItem(item)
    const loaded = await myModule.loadItem('1')
    expect(loaded).toEqual(item)
  })
})
```

### Integration Tests

Test with real RemoteStorage:

1. Use test server
2. Connect in test
3. Perform operations
4. Verify results

### Manual Testing

1. Test connect/disconnect
2. Test CRUD operations
3. Test sync (multiple devices)
4. Test offline mode
5. Test error scenarios

## Debugging

### Console Logging

RemoteStorage logs to console:

```javascript
remoteStorage.setApiKeys({
  debug: true
})
```

### Browser DevTools

- **Network tab:** See RemoteStorage API calls
- **Application → IndexedDB:** See cached data
- **Console:** See RemoteStorage logs

### Common Issues

1. **Widget not appearing:** Check console for errors
2. **Data not saving:** Verify connection, check permissions
3. **Data not syncing:** Check change listeners
4. **Loop detected:** Check `isSavingRef` implementation

## Further Reading

- [RemoteStorage.js API Docs](https://remotestoragejs.readthedocs.io/)
- [RemoteStorage Protocol Spec](https://remotestorage.io/protocol/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks Guide](https://react.dev/reference/react)

