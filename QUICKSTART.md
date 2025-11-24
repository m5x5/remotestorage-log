# Quick Start Guide

Get your RemoteStorage app running in 5 minutes!

## 1. Copy the Template

```bash
# Navigate to your projects directory
cd ~/projects

# Copy the template
cp -r /path/to/nextjs-remotestorage-template my-new-app

# Go to your new project
cd my-new-app
```

## 2. Install Dependencies

```bash
npm install
```

This installs:
- Next.js
- RemoteStorage.js
- RemoteStorage Widget
- Tailwind CSS
- Utility libraries

## 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 4. Connect to RemoteStorage

1. Look for the RemoteStorage widget in the **bottom right corner**
2. Click on it
3. Enter a RemoteStorage address:
   - For testing: Use https://remotestorage-widget.m5x5.com/
   - Or your own RemoteStorage server
4. Click "Connect"
5. Authorize the app

You're now connected! 🎉

## 5. Try the Demo

The template includes a working example:

1. **Create an item:**
   - Enter a title and description
   - Click "Save Item"

2. **View your items:**
   - See the list of saved items
   - Click "View" to see details
   - Click "Delete" to remove an item

3. **Check RemoteStorage:**
   - Open your RemoteStorage server in a browser
   - Navigate to `/mymodule/items/`
   - See your data files!

## 6. Customize for Your App

Now make it your own! See [CUSTOMIZATION.md](CUSTOMIZATION.md) for detailed instructions.

### Quick Customization Steps:

1. **Choose your module name** (e.g., 'todos', 'notes', 'expenses')
   - Edit `lib/remotestorage-module.js`
   - Change `name: 'mymodule'` to your name

2. **Define your data structure**
   - Edit type definitions in `lib/remotestorage-module.js`
   - Add/remove fields as needed

3. **Update the context**
   - Edit `contexts/RemoteStorageContext.js`
   - Update module import and accessClaims

4. **Build your UI**
   - Edit `app/page.js`
   - Create new components in `components/`

## Common Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Project Structure

```
my-new-app/
├── app/                    # Next.js app directory
│   ├── layout.js          # Root layout with provider
│   ├── page.js            # Home page (customize this!)
│   └── globals.css        # Global styles
├── components/            # React components
│   └── RemoteStorageWidget.js
├── contexts/              # React contexts
│   └── RemoteStorageContext.js
├── hooks/                 # Custom hooks
│   ├── use-remote-storage.js
│   └── use-data.js
├── lib/                   # Utilities and modules
│   ├── remotestorage-module.js  # Your data module (customize!)
│   └── utils.js
└── package.json           # Dependencies
```

## Next Steps

1. **Read the docs:**
   - [CUSTOMIZATION.md](CUSTOMIZATION.md) - Detailed customization guide
   - [EXAMPLES.md](EXAMPLES.md) - Example applications
   - [README.md](README.md) - Full documentation

2. **Explore RemoteStorage:**
   - [RemoteStorage.js Docs](https://remotestoragejs.readthedocs.io/)
   - [RemoteStorage Protocol](https://remotestorage.io/)

3. **Build your app:**
   - Customize the module
   - Design your UI
   - Add features
   - Deploy!

## Deployment

Deploy to Vercel (recommended):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or deploy to any platform that supports Next.js:
- Netlify
- Railway
- Your own server

## Troubleshooting

**Widget not showing:**
- Check browser console for errors
- Make sure RemoteStorage initialized (check Network tab)

**Can't connect:**
- Verify RemoteStorage server address
- Check if server supports CORS
- Try the test server: https://remotestorage-widget.m5x5.com/

**Data not saving:**
- Verify you're connected (check widget)
- Look for errors in browser console
- Check RemoteStorage server is accessible

**Changes not appearing:**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear browser cache
- Check if RemoteStorage sync is working

## Get Help

- Check [CUSTOMIZATION.md](CUSTOMIZATION.md) for detailed guides
- Look at [EXAMPLES.md](EXAMPLES.md) for example implementations
- Review the [angebote-next](../angebote-next) app for a real-world example
- Search RemoteStorage.js documentation

## Tips

1. **Start small:** Get the basic CRUD working before adding features
2. **Test often:** Connect to RemoteStorage early and test data flow
3. **Use browser DevTools:** Check Application → IndexedDB to see cached data
4. **Version your data:** Include timestamps and version numbers
5. **Handle errors:** Always handle 404s gracefully (file doesn't exist yet)

Happy coding! 🚀

