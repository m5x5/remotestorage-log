# Example Use Cases

This document shows examples of how to customize the template for different types of applications.

## Example 1: Todo List App

### Module Definition

```javascript
// lib/remotestorage-module.js
export const Todos = {
  name: 'todos',
  
  builder: function (privateClient) {
    privateClient.declareType('todo', {
      type: 'object',
      properties: {
        id: { type: 'string' },
        text: { type: 'string' },
        completed: { type: 'boolean' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        dueDate: { type: 'string' },
        created_at: { type: 'string' }
      },
      required: ['id', 'text', 'completed', 'created_at']
    })
    
    return {
      exports: {
        saveTodo: async function (todo) {
          const data = {
            ...todo,
            updated_at: new Date().toISOString()
          }
          await privateClient.storeObject('todo', `todos/${todo.id}.json`, data)
          
          // Update list
          const list = await this.getTodosList()
          const idx = list.findIndex(t => t.id === todo.id)
          const listItem = {
            id: todo.id,
            text: todo.text,
            completed: todo.completed,
            priority: todo.priority,
            updated_at: data.updated_at
          }
          
          if (idx >= 0) {
            list[idx] = listItem
          } else {
            list.push(listItem)
          }
          
          await privateClient.storeFile('application/json', 'todos/list.json', JSON.stringify(list))
        },
        
        getTodosList: async function () {
          try {
            const file = await privateClient.getFile('todos/list.json')
            if (file?.data) {
              const parsed = typeof file.data === 'string' ? JSON.parse(file.data) : file.data
              return Array.isArray(parsed) ? parsed : []
            }
            return []
          } catch (error) {
            return []
          }
        },
        
        deleteTodo: async function (id) {
          await privateClient.remove(`todos/${id}.json`)
          const list = await this.getTodosList()
          const filtered = list.filter(t => t.id !== id)
          await privateClient.storeFile('application/json', 'todos/list.json', JSON.stringify(filtered))
        }
      }
    }
  }
}
```

## Example 2: Notes App with Tags

### Module Definition

```javascript
// lib/remotestorage-module.js
export const Notes = {
  name: 'notes',
  
  builder: function (privateClient) {
    privateClient.declareType('note', {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        content: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        created_at: { type: 'string' },
        updated_at: { type: 'string' }
      },
      required: ['id', 'title', 'content', 'created_at']
    })
    
    return {
      exports: {
        saveNote: async function (note) {
          const data = {
            ...note,
            updated_at: new Date().toISOString()
          }
          await privateClient.storeObject('note', `notes/${note.id}.json`, data)
          
          // Update tags index
          await this.updateTagsIndex(note.tags)
        },
        
        getNotesByTag: async function (tag) {
          const allNotes = await this.getNotesList()
          const notesWithTag = []
          
          for (const noteInfo of allNotes) {
            const note = await privateClient.getObject(`notes/${noteInfo.id}.json`)
            if (note && note.tags && note.tags.includes(tag)) {
              notesWithTag.push(note)
            }
          }
          
          return notesWithTag
        },
        
        getAllTags: async function () {
          try {
            const file = await privateClient.getFile('tags.json')
            if (file?.data) {
              const parsed = typeof file.data === 'string' ? JSON.parse(file.data) : file.data
              return Array.isArray(parsed) ? parsed : []
            }
            return []
          } catch (error) {
            return []
          }
        },
        
        updateTagsIndex: async function (tags) {
          const allTags = await this.getAllTags()
          const uniqueTags = [...new Set([...allTags, ...tags])]
          await privateClient.storeFile('application/json', 'tags.json', JSON.stringify(uniqueTags))
        }
      }
    }
  }
}
```

## Example 3: Expense Tracker

### Module Definition

```javascript
// lib/remotestorage-module.js
export const Expenses = {
  name: 'expenses',
  
  builder: function (privateClient) {
    privateClient.declareType('expense', {
      type: 'object',
      properties: {
        id: { type: 'string' },
        amount: { type: 'number' },
        category: { type: 'string' },
        description: { type: 'string' },
        date: { type: 'string' },
        currency: { type: 'string' }
      },
      required: ['id', 'amount', 'category', 'date']
    })
    
    return {
      exports: {
        saveExpense: async function (expense) {
          const date = new Date(expense.date)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          
          // Store in year/month folders
          const path = `expenses/${year}/${month}/${expense.id}.json`
          await privateClient.storeObject('expense', path, expense)
          
          // Update monthly index
          await this.updateMonthlyIndex(year, month, expense)
        },
        
        getExpensesByMonth: async function (year, month) {
          try {
            const indexPath = `expenses/${year}/${month}/index.json`
            const file = await privateClient.getFile(indexPath)
            
            if (file?.data) {
              const parsed = typeof file.data === 'string' ? JSON.parse(file.data) : file.data
              return parsed || { expenses: [], total: 0 }
            }
            
            return { expenses: [], total: 0 }
          } catch (error) {
            return { expenses: [], total: 0 }
          }
        },
        
        updateMonthlyIndex: async function (year, month, expense) {
          const current = await this.getExpensesByMonth(year, month)
          const existingIdx = current.expenses.findIndex(e => e.id === expense.id)
          
          if (existingIdx >= 0) {
            current.expenses[existingIdx] = {
              id: expense.id,
              amount: expense.amount,
              category: expense.category,
              date: expense.date
            }
          } else {
            current.expenses.push({
              id: expense.id,
              amount: expense.amount,
              category: expense.category,
              date: expense.date
            })
          }
          
          // Recalculate total
          current.total = current.expenses.reduce((sum, e) => sum + e.amount, 0)
          
          const indexPath = `expenses/${year}/${month}/index.json`
          await privateClient.storeFile('application/json', indexPath, JSON.stringify(current))
        },
        
        getCategoryTotals: async function (year, month) {
          const data = await this.getExpensesByMonth(year, month)
          const totals = {}
          
          data.expenses.forEach(expense => {
            totals[expense.category] = (totals[expense.category] || 0) + expense.amount
          })
          
          return totals
        }
      }
    }
  }
}
```

## Example 4: Recipe Manager

### Module Definition

```javascript
// lib/remotestorage-module.js
export const Recipes = {
  name: 'recipes',
  
  builder: function (privateClient) {
    privateClient.declareType('recipe', {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        ingredients: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              amount: { type: 'string' },
              unit: { type: 'string' }
            }
          }
        },
        instructions: { type: 'array', items: { type: 'string' } },
        prepTime: { type: 'number' },
        cookTime: { type: 'number' },
        servings: { type: 'number' },
        tags: { type: 'array', items: { type: 'string' } },
        rating: { type: 'number' },
        imageUrl: { type: 'string' }
      },
      required: ['id', 'title', 'ingredients', 'instructions']
    })
    
    return {
      exports: {
        saveRecipe: async function (recipe) {
          const data = {
            ...recipe,
            updated_at: new Date().toISOString()
          }
          await privateClient.storeObject('recipe', `recipes/${recipe.id}.json`, data)
          
          // Update search index
          await this.updateSearchIndex(recipe)
        },
        
        searchRecipes: async function (query) {
          const index = await this.getSearchIndex()
          const lowerQuery = query.toLowerCase()
          
          const results = index.filter(item => 
            item.title.toLowerCase().includes(lowerQuery) ||
            item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
          )
          
          // Load full recipes
          const recipes = await Promise.all(
            results.map(item => privateClient.getObject(`recipes/${item.id}.json`))
          )
          
          return recipes.filter(Boolean)
        },
        
        getSearchIndex: async function () {
          try {
            const file = await privateClient.getFile('recipes/search-index.json')
            if (file?.data) {
              const parsed = typeof file.data === 'string' ? JSON.parse(file.data) : file.data
              return Array.isArray(parsed) ? parsed : []
            }
            return []
          } catch (error) {
            return []
          }
        },
        
        updateSearchIndex: async function (recipe) {
          const index = await this.getSearchIndex()
          const existingIdx = index.findIndex(item => item.id === recipe.id)
          
          const indexItem = {
            id: recipe.id,
            title: recipe.title,
            tags: recipe.tags || [],
            rating: recipe.rating || 0
          }
          
          if (existingIdx >= 0) {
            index[existingIdx] = indexItem
          } else {
            index.push(indexItem)
          }
          
          await privateClient.storeFile('application/json', 'recipes/search-index.json', JSON.stringify(index))
        }
      }
    }
  }
}
```

## Pattern: Handling Images/Binary Data

For apps that need to store images or other binary data:

```javascript
saveImage: async function (imageId, blob) {
  // Convert blob to base64
  const reader = new FileReader()
  const base64Promise = new Promise((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
  })
  reader.readAsDataURL(blob)
  
  const base64 = await base64Promise
  
  // Store as JSON with base64 data
  await privateClient.storeFile('application/json', `images/${imageId}.json`, JSON.stringify({
    id: imageId,
    data: base64,
    mimeType: blob.type,
    size: blob.size
  }))
},

loadImage: async function (imageId) {
  try {
    const file = await privateClient.getFile(`images/${imageId}.json`)
    if (file?.data) {
      const parsed = typeof file.data === 'string' ? JSON.parse(file.data) : file.data
      return parsed
    }
    return null
  } catch (error) {
    return null
  }
}
```

## Pattern: Syncing with External APIs

For apps that sync with external services:

```javascript
syncWithExternalAPI: async function () {
  // Load sync state
  const syncState = await this.getSyncState()
  const lastSync = syncState.lastSyncTime || 0
  
  // Fetch updates from external API
  const updates = await fetch(`https://api.example.com/updates?since=${lastSync}`)
  const data = await updates.json()
  
  // Save updates locally
  for (const item of data.items) {
    await this.saveItem(item)
  }
  
  // Update sync state
  await privateClient.storeObject('sync-state', 'sync-state.json', {
    lastSyncTime: Date.now(),
    itemCount: data.items.length
  })
}
```

## Choose Your Starting Point

1. **Simple CRUD app** → Use Example 1 (Todo List)
2. **Content with categories** → Use Example 2 (Notes with Tags)
3. **Time-based data** → Use Example 3 (Expense Tracker)
4. **Complex data structures** → Use Example 4 (Recipe Manager)

Each example can be adapted to your specific needs!

