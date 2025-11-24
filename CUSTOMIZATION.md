# Customization Guide

This guide walks you through customizing the template for your specific use case.

## Step-by-Step Customization

### 1. Choose Your Module Name

The module name defines the namespace for your data in RemoteStorage.

**File:** `lib/remotestorage-module.js`

```javascript
export const MyModule = {
  name: 'mymodule',  // ← Change this to your app name (lowercase, no spaces)
  // ...
}
```

**Example module names:**
- `'todos'` - For a todo app
- `'notes'` - For a notes app
- `'expenses'` - For an expense tracker
- `'recipes'` - For a recipe manager

### 2. Define Your Data Schema

Define the structure of your data using JSON Schema.

**File:** `lib/remotestorage-module.js`

```javascript
privateClient.declareType('item', {
  type: 'object',
  properties: {
    id: { type: 'string' },
    // Add your fields here
    name: { type: 'string' },
    amount: { type: 'number' },
    date: { type: 'string' },
    tags: { 
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['id', 'name']
})
```

**Common field types:**
- `string` - Text data
- `number` - Numeric data
- `boolean` - True/false values
- `array` - Lists
- `object` - Nested objects

### 3. Implement CRUD Methods

Add methods for creating, reading, updating, and deleting your data.

**File:** `lib/remotestorage-module.js`

```javascript
return {
  exports: {
    // CREATE/UPDATE
    saveItem: async function (item) {
      await privateClient.storeObject('item', `items/${item.id}.json`, item)
      // Update list if needed
    },
    
    // READ
    loadItem: async function (id) {
      try {
        return await privateClient.getObject(`items/${id}.json`)
      } catch (error) {
        if (isNotFoundError(error)) return null
        throw error
      }
    },
    
    // DELETE
    deleteItem: async function (id) {
      await privateClient.remove(`items/${id}.json`)
      // Update list if needed
    },
    
    // LIST
    getItemsList: async function () {
      // Return list of items metadata
    }
  }
}
```

### 4. Update the Data Hook

Adapt the data hook to match your module's methods.

**File:** `hooks/use-data.js`

1. **Update state variables:**
```javascript
const [todos, setTodos] = useState([])  // Rename from items
const [todosList, setTodosList] = useState([])
```

2. **Update module name:**
```javascript
if (!remoteStorage?.todos || !isConnected) {  // Change mymodule to your module name
  return
}
```

3. **Update methods:**
```javascript
const saveTodo = useCallback(async (todo) => {
  await remoteStorage.todos.saveTodo(todo)
  // ...
}, [remoteStorage, isConnected])
```

4. **Update return value:**
```javascript
return {
  isLoading,
  isConnected,
  todos,
  todosList,
  saveTodo,
  loadTodo,
  deleteTodo,
  // ...
}
```

### 5. Update the Context

**File:** `contexts/RemoteStorageContext.js`

1. **Import your module:**
```javascript
import { Todos } from "../lib/remotestorage-module"  // Change MyModule to Todos
```

2. **Update module initialization:**
```javascript
const remoteStorage = useRemoteStorage({
  modules: [Todos],  // Use your module
  accessClaims: {
    'todos': 'rw'  // Use your module name
  }
})
```

### 6. Build Your UI

**File:** `app/page.js`

Replace the example UI with your own components. The context provides all your data and methods:

```javascript
const { 
  isConnected, 
  isLoading, 
  todos,        // Your data
  saveTodo,     // Your methods
  deleteTodo 
} = useRemoteStorageContext()
```

## Common Patterns

### Pattern 1: Simple Item Storage

For apps that store a collection of items (todos, notes, etc.):

```javascript
// Structure
/mymodule/
  items/
    item-1.json
    item-2.json
    list.json  (metadata)
```

### Pattern 2: Hierarchical Storage

For apps with categories or folders:

```javascript
// Structure
/mymodule/
  categories/
    work/
      item-1.json
      item-2.json
    personal/
      item-3.json
  categories.json  (list of categories)
```

### Pattern 3: Time-Based Storage

For apps with dated entries (diary, expenses):

```javascript
// Structure
/mymodule/
  2024/
    01/
      entry-2024-01-15.json
      entry-2024-01-20.json
  years.json  (index)
```

### Pattern 4: Current + History

For apps with one "current" document plus history:

```javascript
// Structure
/mymodule/
  current.json  (latest version)
  history/
    2024-01-15T10-30-00.json
    2024-01-20T14-45-00.json
  history-list.json  (metadata)
```

## File Naming Conventions

1. **Use lowercase with hyphens:**
   - ✅ `my-item-123.json`
   - ❌ `MyItem_123.json`

2. **Include timestamps for uniqueness:**
   - `item-2024-01-15T10-30-00.json`
   - Use `new Date().toISOString().replace(/[:.]/g, "-")`

3. **Group related files:**
   - Use folders: `items/`, `categories/`, `settings/`

4. **Use .json extension:**
   - Always use `.json` for JSON data

## Advanced Customization

### Adding Multiple Data Types

You can have multiple types of data in your module:

```javascript
// Declare multiple types
privateClient.declareType('todo', { ... })
privateClient.declareType('project', { ... })
privateClient.declareType('tag', { ... })

// Organize by type
/mymodule/
  todos/
    todo-1.json
  projects/
    project-1.json
  tags/
    tag-1.json
```

### Public vs Private Data

By default, all data is private. To make data public:

```javascript
// Use publicClient instead of privateClient
publicClient.declareType('public-item', { ... })

return {
  exports: {
    publishItem: async function (item) {
      await publicClient.storeObject('public-item', `public/${item.id}.json`, item)
    }
  }
}
```

### Data Validation

Add validation before saving:

```javascript
saveItem: async function (item) {
  // Validate required fields
  if (!item.id || !item.title) {
    throw new Error('Missing required fields')
  }
  
  // Validate data types
  if (typeof item.amount !== 'number') {
    throw new Error('Amount must be a number')
  }
  
  // Save
  await privateClient.storeObject('item', `items/${item.id}.json`, item)
}
```

### Computed Properties

Add computed properties when loading:

```javascript
loadItem: async function (id) {
  const item = await privateClient.getObject(`items/${id}.json`)
  
  if (item) {
    // Add computed properties
    item.isExpired = new Date(item.expiryDate) < new Date()
    item.daysRemaining = Math.floor((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
  }
  
  return item
}
```

## Testing Your Changes

After customization:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run dev server:**
   ```bash
   npm run dev
   ```

3. **Connect to RemoteStorage:**
   - Click the widget in bottom right
   - Use a test server like https://remotestorage-widget.m5x5.com/

4. **Test your CRUD operations:**
   - Create items
   - Load items
   - Update items
   - Delete items
   - Check RemoteStorage server to see your files

5. **Test sync:**
   - Open app in two browser windows
   - Connect both to same RemoteStorage account
   - Changes in one should appear in the other

## Troubleshooting

**Module not loading:**
- Check module name matches in all files
- Check accessClaims uses correct module name
- Check console for errors

**Data not saving:**
- Verify you're connected (check isConnected)
- Check browser console for errors
- Verify RemoteStorage server is accessible
- Check network tab in DevTools

**Data not syncing:**
- Check change listener is attached
- Verify `isSavingRef` logic to prevent loops
- Check RemoteStorage server supports sync

**Type errors:**
- Verify data matches declared schema
- Check required fields are present
- Validate data types match schema

