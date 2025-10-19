# ⚡ Super Easy CMS Setup (30 seconds!)

Forget the complex stuff! Here's the **fastest way** to get visual editing working:

## 🚀 Step 1: One Command Setup

**Just run this in Directus:**

1. **Go to**: http://localhost:8055
2. **Login**: `admin@example.com` / `admin123` 
3. **Paste this URL** in your browser:

```
http://localhost:8055/admin/settings/data-model?collection=homepage_settings&singleton=true&fields=hero_title_line1:string:THE,hero_title_line2:string:COFFEE,hero_title_line3:string:MANIFEST,hero_cta_text:string:SHOP_COFFEE,season_title:string:WE_CREATE_SOMETHING_UNIQUE
```

4. **Or do it manually** (2 minutes):
   - Settings → Data Model → "+" 
   - Collection: `homepage_settings`
   - **Singleton**: ✅ Turn ON
   - Add fields: `hero_title_line1`, `hero_title_line2`, `hero_title_line3`, `hero_cta_text`, `season_title`

## 🚀 Step 2: Add Content

1. **Content** → **Homepage Settings**
2. Fill in:
   - hero_title_line1: **THE**
   - hero_title_line2: **COFFEE**  
   - hero_title_line3: **MANIFEST**
   - hero_cta_text: **SHOP COFFEE**
   - season_title: **WE CREATE SOMETHING UNIQUE**
3. **Save** ✅

## 🚀 Step 3: Create Token

1. **Settings** → **Access Tokens** → **"+"**
2. **Name**: Visual Editor
3. **Token**: `edit123` (or anything you want)
4. **Save** ✅

## 🎨 Step 4: Use Visual Editor!

**Visit this URL:**
```
http://localhost:8081/?visual-editing=true&token=edit123
```

**You'll see:**
- 🟢 Blue toolbar "Visual Editing Active"
- ✏️ **Click "THE COFFEE MANIFEST"** → Edit in modal!
- ✏️ **Click "SHOP COFFEE"** → Quick edit!
- ✏️ **Click "WE CREATE SOMETHING UNIQUE"** → Edit title!

## 🔥 Even Easier: Quick Copy-Paste

**Copy this and paste in Directus SQL console** (Settings → Data Model → SQL):

```sql
-- This creates everything automatically
INSERT INTO directus_collections (collection, meta) VALUES 
('homepage_settings', '{"singleton": true, "icon": "home"}');

INSERT INTO directus_fields (collection, field, type, meta) VALUES 
('homepage_settings', 'hero_title_line1', 'string', '{"interface": "input"}'),
('homepage_settings', 'hero_title_line2', 'string', '{"interface": "input"}'),
('homepage_settings', 'hero_title_line3', 'string', '{"interface": "input"}'),
('homepage_settings', 'hero_cta_text', 'string', '{"interface": "input"}'),
('homepage_settings', 'season_title', 'string', '{"interface": "input"}');

INSERT INTO homepage_settings (hero_title_line1, hero_title_line2, hero_title_line3, hero_cta_text, season_title) VALUES 
('THE', 'COFFEE', 'MANIFEST', 'SHOP COFFEE', 'WE CREATE SOMETHING UNIQUE');
```

## 🎯 Ready URLs

**Your site**: http://localhost:8081  
**Visual editor**: http://localhost:8081/?visual-editing=true&token=edit123  
**Admin**: http://localhost:8055  

---

**That's it! Your CMS is ready in 30 seconds!** 🎉

## 💡 What Makes This Cool

- **No complex setup** - Just a few clicks
- **Visual editing** - Like the Pizza demo
- **Instant changes** - Edit and see results immediately  
- **Professional** - Uses official Directus library
- **Fast** - Works in 30 seconds

**Click and edit your website live!** ✨


