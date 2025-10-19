# Quick Start - Homepage Content Management

## 🚀 Get Started in 3 Steps

### Step 1: Access Directus Admin
1. Open http://localhost:8055
2. Login: **admin@example.com** / **admin123**

### Step 2: Create Your First Content

#### Option A: Homepage Hero Text (Easiest to start)
1. Go to **Content** → **Homepage Settings**
2. Edit these fields:
   - **Hero Title Line 1**: "THE"
   - **Hero Title Line 2**: "COFFEE" 
   - **Hero Title Line 3**: "MANIFEST"
   - **Hero CTA Text**: "SHOP COFFEE"
   - **Season Title**: "WE CREATE SOMETHING UNIQUE"
3. Click **Save**
4. Refresh your website - you'll see the changes!

#### Option B: Add a Blog Post
1. Go to **Content** → **Posts**
2. Click **"+ Create Item"**
3. Fill in:
   - **Status**: Published
   - **Title**: Your post title
   - **Slug**: your-post-slug (URL-friendly)
   - **Excerpt**: Short description
   - **Content**: Full article text
4. Click **Save**
5. Your post will appear on the homepage!

### Step 3: View Your Changes
- Homepage: http://localhost:8080
- The content updates automatically!

## 📝 What Can You Control?

### Hero Section
- Main title (3 lines)
- Call-to-action button text and link
- Background video

### Featured Products
- Product titles and descriptions
- Product images
- Links

### Trade Points (Locations)
- Cafe names and addresses
- Opening hours
- Map coordinates

### Blog Posts
- Article titles and content
- Featured images
- Author names

## 🎯 API Endpoints

Your app fetches data from these endpoints:
- Homepage: `/api/cms/homepage`
- Products: `/api/cms/featured-products`
- Locations: `/api/cms/trade-points`
- Posts: `/api/cms/posts`

## 📚 Next Steps

For detailed collection setup instructions, see:
- **[HOMEPAGE-SETUP.md](./HOMEPAGE-SETUP.md)** - Complete collection creation guide
- **[SETUP.md](./SETUP.md)** - Full Directus setup documentation

## 💡 Tips

1. **Start Simple**: Edit homepage settings first - it's a singleton (single record)
2. **Status Field**: Always set status to "Published" to make content visible
3. **Images**: Upload images in Directus for better management
4. **Preview**: Changes appear immediately when you refresh the website
5. **Backup**: Collections are stored in PostgreSQL database

## ❓ Troubleshooting

**Q: I don't see my content on the website**
- Check status is set to "Published"
- Verify Directus is running (http://localhost:8055)
- Check browser console for API errors

**Q: Collections don't exist**
- Follow [HOMEPAGE-SETUP.md](./HOMEPAGE-SETUP.md) to create them
- Make sure you're logged in as admin

**Q: Images not showing**
- Upload images through Directus admin
- Ensure images are in "Published" status



