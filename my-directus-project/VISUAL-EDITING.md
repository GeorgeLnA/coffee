# Visual Editing Guide

## 🎨 How to Use Visual Editing

Visual editing allows you to edit content directly on your website (localhost:8080) with inline edit buttons, just like the [Directus Pizza demo](https://directus-pizza.vercel.app?visual-editing=true&token=2_v3i2MvgyJwbTxvBHu3xFRC3U23kIzx).

## Step 1: Create a Static Token in Directus

1. Go to **http://localhost:8055**
2. Login: `admin@example.com` / `admin123`
3. Navigate to **Settings** → **Access Tokens**
4. Click **"+ Create Item"**
5. Fill in:
   - **Name**: "Visual Editing Token"
   - **Token**: (auto-generated or set your own)
   - **Permissions**: Admin (or custom permissions)
6. Click **Save**
7. **Copy the token** (you'll need it for the URL)

## Step 2: Enable Visual Editing Mode

Visit your website with these URL parameters:

```
http://localhost:8080/?visual-editing=true&token=YOUR_TOKEN_HERE
```

**Example:**
```
http://localhost:8080/?visual-editing=true&token=abc123xyz789
```

Replace `YOUR_TOKEN_HERE` with the token you created in Step 1.

## Step 3: Edit Content Visually

Once visual editing is enabled:

1. **Visual Editing Toolbar** appears at the bottom-right
2. **Edit Buttons** (pencil icon) appear when you hover over editable content
3. Click any edit button to open the Directus editor for that content
4. Edit the content in Directus
5. Save and see changes instantly on your site!

## What Can You Edit?

### Hero Section
- Hover over the hero title or CTA button
- Click the pencil icon to edit
- Changes: title lines, button text, button link

### Featured Products
- Each product card is editable
- Edit: title, description, images, links

### Blog Posts
- Click edit on any news article
- Edit: title, excerpt, content, images

### Trade Points (Locations)
- Edit cafe names, addresses, hours
- Update map coordinates

## Visual Editing Toolbar Features

The toolbar shows:
- 🟢 **Green dot**: Visual editing is active
- **"Open Directus"** button: Quick access to admin panel
- **Eye icon**: Show/hide toolbar

## Tips for Visual Editing

1. **Stay Logged In**: Keep your Directus admin tab open
2. **Refresh**: If changes don't appear, refresh the page
3. **Token Security**: Keep your token private (don't share publicly)
4. **Multiple Editors**: Each person needs their own token
5. **Exit Mode**: Remove `?visual-editing=true&token=...` from URL to exit

## Advanced: Create Multiple Tokens

For different team members:
1. Create separate tokens for each person
2. Assign different permissions per token
3. Track who edited what in Directus activity logs

## Troubleshooting

**Q: Edit buttons don't appear**
- Check URL has `?visual-editing=true&token=YOUR_TOKEN`
- Verify token is valid in Directus Settings → Access Tokens
- Make sure you're logged into Directus

**Q: "Permission denied" errors**
- Check token has correct permissions
- Use an admin token or set custom permissions

**Q: Changes don't save**
- Verify you're logged into Directus
- Check token hasn't expired
- Look for errors in browser console

## Example URLs

**Homepage with visual editing:**
```
http://localhost:8080/?visual-editing=true&token=YOUR_TOKEN
```

**Coffee page with visual editing:**
```
http://localhost:8080/coffee?visual-editing=true&token=YOUR_TOKEN
```

**News page with visual editing:**
```
http://localhost:8080/news?visual-editing=true&token=YOUR_TOKEN
```

## Security Note

⚠️ **Never commit tokens to Git!**
- Tokens are sensitive credentials
- Add to `.gitignore` if stored in files
- Use environment variables for production
- Regenerate tokens if exposed

---

Enjoy visual editing! 🎨✨



