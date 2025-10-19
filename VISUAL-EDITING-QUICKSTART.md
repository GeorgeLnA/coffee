# ✨ Visual Editing Quick Start

Enable inline editing on your website just like the [Directus Pizza demo](https://directus-pizza.vercel.app?visual-editing=true&token=2_v3i2MvgyJwbTxvBHu3xFRC3U23kIzx)!

## 🚀 3 Steps to Visual Editing

### Step 1: Create a Token (2 minutes)

1. Open Directus Admin: **http://localhost:8055**
2. Login: `admin@example.com` / `admin123`
3. Go to **Settings** (gear icon) → **Access Tokens**
4. Click **"+ Create Item"**
5. Fill in:
   ```
   Name: Visual Editing
   Token: (leave auto-generated or create your own like: my-edit-token-123)
   ```
6. Click **Save**
7. **Copy the token value**

### Step 2: Open Visual Editing Mode

Use this URL format:
```
http://localhost:8080/?visual-editing=true&token=YOUR_TOKEN
```

**Replace `YOUR_TOKEN` with the token you just created.**

Example:
```
http://localhost:8080/?visual-editing=true&token=abc123def456
```

### Step 3: Edit Content!

1. You'll see a **blue toolbar** at the bottom-right
2. **Hover over content** to see edit buttons (pencil icons)
3. **Click the pencil** to edit in Directus
4. **Save changes** - they appear instantly!

## 📍 What You'll See

- 🟢 **Blue Toolbar**: Shows visual editing is active
- ✏️ **Edit Buttons**: Appear on hover over editable content
- 🔗 **Open Directus**: Quick link to admin panel

## ✏️ What Can You Edit?

### Hero Section
- Hero title (3 lines)
- CTA button text and link
- Hover and click pencil to edit

### Featured Products
- Product titles and descriptions
- Each card has its own edit button

### Section Titles
- "WE CREATE SOMETHING UNIQUE"
- News section title
- All major headings

## 🎯 Quick Test

1. **Create token** in http://localhost:8055/admin/settings/access-tokens
2. **Visit**: `http://localhost:8080/?visual-editing=true&token=YOUR_TOKEN`
3. **Hover** over the hero title "THE COFFEE MANIFEST"
4. **Click** the pencil icon
5. **Edit** the text in Directus
6. **Save** and see it change!

## 💡 Pro Tips

- **Stay Logged In**: Keep Directus admin tab open
- **Multiple Pages**: Add `?visual-editing=true&token=YOUR_TOKEN` to any page URL
- **Hide Toolbar**: Click the eye icon to minimize
- **Exit Mode**: Remove the URL parameters to exit visual editing

## 🔒 Security

- Keep tokens private
- Don't commit tokens to Git
- Create separate tokens for each team member
- Revoke tokens when not needed

## 🆘 Troubleshooting

**No edit buttons?**
- Check URL has `?visual-editing=true&token=YOUR_TOKEN`
- Verify token exists in Directus
- Refresh the page

**Can't save changes?**
- Make sure you're logged into Directus
- Check token permissions
- Look for errors in browser console

---

**Next**: See [my-directus-project/VISUAL-EDITING.md](my-directus-project/VISUAL-EDITING.md) for advanced features!



