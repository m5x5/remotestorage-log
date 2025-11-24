# Template Overview

A complete guide to all files in this template and what they do.

## 📁 Project Structure

```
nextjs-remotestorage-template/
├── 📄 Documentation Files
│   ├── README.md              - Main documentation
│   ├── QUICKSTART.md          - 5-minute getting started guide
│   ├── CUSTOMIZATION.md       - Detailed customization guide
│   ├── EXAMPLES.md            - Example implementations
│   ├── ARCHITECTURE.md        - Technical architecture
│   ├── TEMPLATE_OVERVIEW.md   - This file
│   └── LICENSE                - MIT License
│
├── 📦 Configuration Files
│   ├── package.json           - Dependencies and scripts
│   ├── next.config.mjs        - Next.js configuration
│   ├── jsconfig.json          - JavaScript/path configuration
│   ├── tailwind.config.js     - Tailwind CSS configuration
│   ├── postcss.config.js      - PostCSS configuration
│   └── .gitignore            - Git ignore rules
│
├── 🎨 App Directory (Next.js)
│   ├── layout.js             - Root layout with RemoteStorageProvider
│   ├── page.js               - Home page (example UI)
│   └── globals.css           - Global styles and Tailwind imports
│
├── 🧩 Components
│   └── RemoteStorageWidget.js - Connection widget UI component
│
├── 🔗 Contexts
│   └── RemoteStorageContext.js - React Context for RemoteStorage
│
├── 🪝 Hooks
│   ├── use-remote-storage.js  - Initialize RemoteStorage (singleton)
│   └── use-data.js           - Data sync and CRUD operations
│
└── 📚 Library
    ├── remotestorage-module.js - Your custom RemoteStorage module
    └── utils.js              - Utility functions (Tailwind merge)
```

## 📄 Documentation Files

### README.md
**Purpose:** Main documentation for the template  
**Content:** Features, quick start, architecture, patterns, resources  
**When to read:** First - get overview of template  

### QUICKSTART.md
**Purpose:** Get running in 5 minutes  
**Content:** Step-by-step setup, first connection, trying demo  
**When to read:** Second - after reading README  

### CUSTOMIZATION.md
**Purpose:** Detailed guide to customizing template  
**Content:** Step-by-step customization, patterns, common tasks  
**When to read:** When ready to build your app  

### EXAMPLES.md
**Purpose:** Real-world example implementations  
**Content:** Todo app, notes app, expense tracker, recipes  
**When to read:** When looking for implementation patterns  

### ARCHITECTURE.md
**Purpose:** Technical deep dive  
**Content:** Architecture diagrams, data flow, design patterns  
**When to read:** When you need to understand internals  

### TEMPLATE_OVERVIEW.md
**Purpose:** Guide to all files (this document)  
**Content:** Every file explained  
**When to read:** When exploring the template structure  

## 📦 Configuration Files

### package.json
**Purpose:** Project metadata and dependencies  
**Key sections:**
- `dependencies` - Runtime packages
- `devDependencies` - Development packages
- `scripts` - npm commands

**Important dependencies:**
- `remotestoragejs` - RemoteStorage protocol implementation
- `m5x5-remotestorage-widget` - Connection UI widget
- `next` - Next.js framework
- `tailwindcss` - CSS framework

**Don't modify unless:** Adding new packages

### next.config.mjs
**Purpose:** Next.js configuration  
**Default settings:** React strict mode enabled  
**Modify to:** Add redirects, headers, env variables, etc.

### jsconfig.json
**Purpose:** JavaScript project configuration  
**Key feature:** Path aliases (`@/` → root directory)  
**Example:** `import MyComponent from '@/components/MyComponent'`

### tailwind.config.js
**Purpose:** Tailwind CSS configuration  
**Defines:** Content paths, theme extensions, plugins  
**Modify to:** Customize colors, spacing, add plugins

### postcss.config.js
**Purpose:** PostCSS configuration for processing CSS  
**Plugins:** Tailwind CSS, Autoprefixer  
**Don't modify unless:** Adding PostCSS plugins

### .gitignore
**Purpose:** Files to exclude from Git  
**Excludes:** node_modules, .next, .env.local, etc.  
**Modify to:** Add project-specific ignore patterns

## 🎨 App Directory

### app/layout.js
**Purpose:** Root layout component  
**Key features:**
- Wraps app with `RemoteStorageProvider`
- Defines HTML structure
- Sets up responsive container

**Customize:**
- Change page title and meta tags
- Add global navigation
- Modify container width/padding

### app/page.js
**Purpose:** Home page / main UI  
**Current content:** Example CRUD interface  
**Replace with:** Your app's main interface

**Key patterns shown:**
- Using `useRemoteStorageContext()`
- Handling connection status
- CRUD operations
- Loading states
- Error handling

### app/globals.css
**Purpose:** Global styles  
**Contains:**
- Tailwind CSS imports
- CSS variables
- Global utility classes

**Modify to:** Add custom global styles

## 🧩 Components

### components/RemoteStorageWidget.js
**Purpose:** UI widget for RemoteStorage connection  
**Features:**
- Connect/disconnect to RemoteStorage server
- Shows connection status
- Fixed position (bottom right)

**Props:**
- `remoteStorage` - RemoteStorage instance

**Don't modify unless:** Changing widget position/behavior

## 🔗 Contexts

### contexts/RemoteStorageContext.js
**Purpose:** Provide RemoteStorage to entire app  
**Pattern:** React Context API

**Provides:**
- `remoteStorage` - RemoteStorage instance
- `isConnected` - Connection status
- `isLoading` - Loading state
- Data and methods from `useData` hook

**Customize:**
1. Import your module (instead of `MyModule`)
2. Update `modules` array
3. Update `accessClaims` object
4. Modify what's exposed in context value

**Usage in components:**
```javascript
const { isConnected, saveItem } = useRemoteStorageContext()
```

## 🪝 Hooks

### hooks/use-remote-storage.js
**Purpose:** Initialize RemoteStorage instance (singleton)  
**Pattern:** Custom React hook

**Parameters:**
- `modules` - Array of RemoteStorage modules
- `accessClaims` - Object with module permissions

**Returns:** RemoteStorage instance (or null if not ready)

**Key features:**
- Singleton pattern (one instance per app)
- Dynamic import (avoids SSR issues)
- Claims access to modules
- Enables caching

**Don't modify unless:** Changing initialization logic

### hooks/use-data.js
**Purpose:** Manage data sync and state  
**Pattern:** Custom React hook

**Parameters:**
- `remoteStorage` - RemoteStorage instance

**Returns object with:**
- `isLoading` - Loading state
- `isConnected` - Connection status
- `items` / `itemsList` - Your data
- `saveItem`, `loadItem`, `deleteItem` - CRUD methods
- `settings`, `saveSettings` - Settings management
- `reload` - Force reload all data

**Customize:**
1. Update state variables for your data types
2. Update module name (`mymodule` → yours)
3. Update methods to match your module
4. Add business logic as needed

**Key features:**
- Connection status tracking
- Auto-load on connect
- Optimistic updates
- Remote change detection
- Loop prevention

## 📚 Library

### lib/remotestorage-module.js
**Purpose:** Your custom RemoteStorage module  
**Pattern:** RemoteStorage.js module format

**Structure:**
```javascript
export const MyModule = {
  name: 'mymodule',
  builder: function (privateClient, publicClient) {
    // Type declarations
    privateClient.declareType('item', { ... })
    
    // Exported methods
    return {
      exports: {
        saveItem: async function (item) { ... },
        loadItem: async function (id) { ... },
        deleteItem: async function (id) { ... }
      }
    }
  }
}
```

**Customize (MAIN CUSTOMIZATION POINT):**
1. Change module name
2. Define your data types
3. Implement your CRUD methods
4. Add validation and business logic

**This is where your app's data logic lives!**

### lib/utils.js
**Purpose:** Utility functions  
**Current content:** `cn()` function for merging Tailwind classes

**Example:**
```javascript
cn('px-4 py-2', isActive && 'bg-blue-500')
```

**Modify to:** Add more utility functions as needed

## 🎯 What to Modify for Your App

### Must Modify:
1. ✅ `lib/remotestorage-module.js` - Your data schema and methods
2. ✅ `contexts/RemoteStorageContext.js` - Module import and claims
3. ✅ `hooks/use-data.js` - Data state and methods
4. ✅ `app/page.js` - Your app's UI

### Should Modify:
5. `app/layout.js` - Page title and metadata
6. `package.json` - Project name and description
7. `README.md` - Update for your specific app

### Optional Modify:
8. `app/globals.css` - Custom styles
9. `tailwind.config.js` - Theme customization
10. `lib/utils.js` - Add utilities

### Don't Modify:
- `hooks/use-remote-storage.js` (unless advanced needs)
- `components/RemoteStorageWidget.js` (unless styling)
- `.gitignore` (unless specific needs)
- `next.config.mjs` (unless specific needs)
- `postcss.config.js` (unless adding plugins)

## 🚀 Getting Started Checklist

- [ ] Read README.md
- [ ] Follow QUICKSTART.md
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Connect to RemoteStorage
- [ ] Try the demo
- [ ] Read CUSTOMIZATION.md
- [ ] Customize `lib/remotestorage-module.js`
- [ ] Update `contexts/RemoteStorageContext.js`
- [ ] Update `hooks/use-data.js`
- [ ] Build your UI in `app/page.js`
- [ ] Add more pages/components as needed
- [ ] Test thoroughly
- [ ] Deploy!

## 📖 Recommended Reading Order

1. **README.md** - Understand what the template is
2. **QUICKSTART.md** - Get it running
3. **Try the demo** - See it working
4. **CUSTOMIZATION.md** - Learn how to customize
5. **EXAMPLES.md** - See real-world examples
6. **ARCHITECTURE.md** - Understand internals
7. **This file** - Reference for files

## 🎓 Learning Path

### Beginner
Start here if new to RemoteStorage:
1. QUICKSTART.md
2. Try the demo
3. CUSTOMIZATION.md (Steps 1-3)
4. Modify page.js for simple UI

### Intermediate
You know React and Next.js:
1. README.md
2. CUSTOMIZATION.md (all steps)
3. EXAMPLES.md (relevant example)
4. Build your app

### Advanced
You want to understand everything:
1. README.md
2. ARCHITECTURE.md
3. Read all source files
4. Customize as needed

## 💡 Tips

1. **Start simple:** Get basic CRUD working first
2. **Use examples:** Copy patterns from EXAMPLES.md
3. **Test early:** Connect to RemoteStorage early
4. **Read errors:** Console has helpful RemoteStorage logs
5. **Check DevTools:** See cached data in IndexedDB
6. **Reference angebote-next:** Look at the real app this was based on

## 🆘 Need Help?

1. Check relevant docs file
2. Look at EXAMPLES.md
3. Check browser console
4. Review ARCHITECTURE.md
5. Examine angebote-next app
6. Read RemoteStorage.js docs

## 🎉 Have Fun!

This template gives you everything you need to build decentralized apps with RemoteStorage. The architecture is proven (from angebote-next), the patterns are solid, and the docs are comprehensive.

Now go build something awesome! 🚀

