# Homepage Content Management - Directus Setup

This guide will help you create collections in Directus to manage your homepage content through the admin panel.

## Step 1: Access Directus Admin

1. Make sure Directus is running: http://localhost:8055
2. Login with: admin@example.com / admin123

## Step 2: Create Collections

### Collection 1: Homepage Settings (Singleton)

1. Go to **Settings** → **Data Model** → Click **"+"** to create new collection
2. Collection Details:
   - **Collection Name**: `homepage_settings`
   - **Type**: **Singleton** (toggle this on)
   - **Icon**: Choose "home" icon
   - Click **Save**

3. Add Fields:
   - Click **"+ Create Field"**
   
   **Hero Title Line 1** (Input)
   - **Field**: `hero_title_line1`
   - **Type**: String
   - **Interface**: Input
   - **Default Value**: "THE"
   
   **Hero Title Line 2** (Input)
   - **Field**: `hero_title_line2`
   - **Type**: String
   - **Interface**: Input
   - **Default Value**: "COFFEE"
   
   **Hero Title Line 3** (Input)
   - **Field**: `hero_title_line3`
   - **Type**: String
   - **Interface**: Input
   - **Default Value**: "MANIFEST"
   
   **Hero CTA Text** (Input)
   - **Field**: `hero_cta_text`
   - **Type**: String
   - **Interface**: Input
   - **Default Value**: "SHOP COFFEE"
   
   **Hero CTA Link** (Input)
   - **Field**: `hero_cta_link`
   - **Type**: String
   - **Interface**: Input
   - **Default Value**: "/coffee"
   
   **Hero Video URL** (Input)
   - **Field**: `hero_video`
   - **Type**: String
   - **Interface**: Input
   - **Default Value**: "/Coffee_beans_fly_202510011757_183lh.mp4"
   
   **Season Section Title** (Input)
   - **Field**: `season_title`
   - **Type**: String
   - **Interface**: Input
   - **Default Value**: "WE CREATE SOMETHING UNIQUE"
   
   **News Section Title** (Input)
   - **Field**: `news_section_title`
   - **Type**: String
   - **Interface**: Input
   - **Default Value**: "OUR LATEST NEWS"
   
   **News Section Subtitle** (Input)
   - **Field**: `news_section_subtitle`
   - **Type**: Text
   - **Interface**: Textarea
   
   **Trade Points Section Title** (Input)
   - **Field**: `trade_points_title`
   - **Type**: String
   - **Interface**: Input
   - **Default Value**: "WHERE TO FIND US"

4. Click **Save** after adding each field

### Collection 2: Featured Products

1. Create new collection:
   - **Collection Name**: `homepage_featured_products`
   - **Type**: **Standard Collection**
   - **Icon**: Choose "coffee" icon

2. Add Fields:
   
   **Status** (already created by default)
   
   **Sort** (Number)
   - **Field**: `sort`
   - **Type**: Integer
   - **Interface**: Input
   
   **Title** (Input)
   - **Field**: `title`
   - **Type**: String
   - **Interface**: Input
   - **Required**: Yes
   
   **Description** (Textarea)
   - **Field**: `description`
   - **Type**: Text
   - **Interface**: Textarea
   
   **Image** (File/Image)
   - **Field**: `image`
   - **Type**: UUID (File)
   - **Interface**: File
   
   **Hover Image** (File/Image)
   - **Field**: `hover_image`
   - **Type**: UUID (File)
   - **Interface**: File
   
   **Link URL** (Input)
   - **Field**: `link_url`
   - **Type**: String
   - **Interface**: Input
   - **Default Value**: "/coffee"

### Collection 3: Trade Points (Locations)

1. Create new collection:
   - **Collection Name**: `trade_points`
   - **Type**: **Standard Collection**
   - **Icon**: Choose "map-pin" icon

2. Add Fields:
   
   **Status** (already created)
   
   **Name** (Input)
   - **Field**: `name`
   - **Type**: String
   - **Interface**: Input
   - **Required**: Yes
   
   **Address** (Textarea)
   - **Field**: `address`
   - **Type**: Text
   - **Interface**: Textarea
   - **Required**: Yes
   
   **Hours** (Input)
   - **Field**: `hours`
   - **Type**: String
   - **Interface**: Input
   - **Example**: "Субота: 6:00 - 14:00"
   
   **Day of Week** (Dropdown)
   - **Field**: `day_of_week`
   - **Type**: String
   - **Interface**: Dropdown
   - **Choices**:
     - 0 = Sunday
     - 1 = Monday
     - 2 = Tuesday
     - 3 = Wednesday
     - 4 = Thursday
     - 5 = Friday
     - 6 = Saturday
   
   **Open Hour** (Number)
   - **Field**: `open_hour`
   - **Type**: Integer
   - **Interface**: Input
   - **Note**: 24-hour format (e.g., 6 for 6:00, 14 for 14:00)
   
   **Close Hour** (Number)
   - **Field**: `close_hour`
   - **Type**: Integer
   - **Interface**: Input
   
   **Latitude** (Decimal)
   - **Field**: `latitude`
   - **Type**: Float
   - **Interface**: Input
   - **Required**: Yes
   
   **Longitude** (Decimal)
   - **Field**: `longitude`
   - **Type**: Float
   - **Interface**: Input
   - **Required**: Yes

## Step 3: Set Permissions

1. Go to **Settings** → **Roles & Permissions**
2. Find **Public** role
3. For each collection (`homepage_settings`, `homepage_featured_products`, `trade_points`, and `posts`):
   - Enable **Read** permission
   - Set filter to: `status = published`

## Step 4: Add Content

### Add Homepage Settings

1. Go to **Content** → **Homepage Settings**
2. Fill in the values:
   - Hero Title Line 1: "THE"
   - Hero Title Line 2: "COFFEE"
   - Hero Title Line 3: "MANIFEST"
   - Hero CTA Text: "SHOP COFFEE"
   - Hero CTA Link: "/coffee"
   - Season Title: "WE CREATE SOMETHING UNIQUE"
   - News Section Title: "LATEST FROM OUR BLOG"
   - Trade Points Title: "WHERE TO FIND US"
3. Click **Save**

### Add Featured Products

1. Go to **Content** → **Homepage Featured Products**
2. Click **"+ Create Item"**
3. Add products:
   
   **Product 1:**
   - Status: Published
   - Sort: 1
   - Title: "COLOMBIA SUPREMO"
   - Description: "Premium single-origin beans"
   - Link URL: "/coffee"
   - Upload images for Image and Hover Image
   
   **Product 2:**
   - Status: Published
   - Sort: 2
   - Title: "ETHIOPIA GUJI"
   - Description: "Organic fruity notes"
   - Link URL: "/coffee"
   
   **Product 3:**
   - Status: Published
   - Sort: 3
   - Title: "BRAZIL SANTOS"
   - Description: "Smooth and balanced"
   - Link URL: "/coffee"

### Add Trade Points

1. Go to **Content** → **Trade Points**
2. Add locations:

   **Location 1:**
   - Status: Published
   - Name: "The Coffee Manifest Cafe #1"
   - Address: "вул. Прикордонна 1"
   - Hours: "Субота: 6:00 - 14:00"
   - Day of Week: 6 (Saturday)
   - Open Hour: 6
   - Close Hour: 14
   - Latitude: 50.4067
   - Longitude: 30.6493

   **Location 2:**
   - Status: Published
   - Name: "The Coffee Manifest Cafe #2"
   - Address: "вул. Окружна 1В"
   - Hours: "Неділя: 6:00 - 14:00"
   - Day of Week: 0 (Sunday)
   - Open Hour: 6
   - Close Hour: 14
   - Latitude: 50.3824
   - Longitude: 30.4590

## Step 5: Test API

Once you've added content, test these URLs in your browser:

- Homepage Settings: http://localhost:8080/api/cms/homepage
- Featured Products: http://localhost:8080/api/cms/featured-products
- Trade Points: http://localhost:8080/api/cms/trade-points
- Posts: http://localhost:8080/api/cms/posts

## Step 6: Update Content Anytime

To change homepage content:
1. Go to Directus Admin
2. Navigate to the collection
3. Edit the content
4. Click Save
5. Your website will automatically fetch the new content!

## Tips

- **Images**: Upload images to Directus for better management
- **Multilingual**: You can add translations later using Directus translations feature
- **Draft vs Published**: Use status field to preview content before publishing


