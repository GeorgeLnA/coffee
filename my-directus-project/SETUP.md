# Directus CMS Setup Guide

This guide will help you set up and run your self-hosted Directus CMS instance.

## Prerequisites

- Docker and Docker Compose installed
- Node.js and npm/pnpm installed

## Step 1: Configure Environment Variables

1. Navigate to the Directus directory:
   ```bash
   cd my-directus-project/directus
   ```

2. Create a `.env` file (copy from the example below):
   ```bash
   # Database Configuration
   DB_USER=directus
   DB_PASSWORD=directus_password
   DB_DATABASE=directus

   # Directus Configuration
   DIRECTUS_PORT=8055
   DIRECTUS_SECRET=replace-with-random-value-at-least-32-characters-long

   # Cache Configuration
   CACHE_ENABLED=true
   CACHE_AUTO_PURGE=true

   # Admin Account (created on first start)
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=admin_password

   # WebSockets
   WEBSOCKETS_ENABLED=true

   # Public URL (adjust for your environment)
   PUBLIC_URL=http://localhost:8055

   # CORS Configuration
   CORS_ENABLED=true
   CORS_ORIGIN=http://localhost:8080,http://localhost:5173

   # Security Settings
   REFRESH_TOKEN_COOKIE_SECURE=false
   REFRESH_TOKEN_COOKIE_SAME_SITE=lax
   REFRESH_TOKEN_COOKIE_DOMAIN=localhost

   SESSION_COOKIE_SECURE=false
   SESSION_COOKIE_SAME_SITE=lax
   SESSION_COOKIE_DOMAIN=localhost

   # Extensions
   EXTENSIONS_PATH=./extensions
   EXTENSIONS_AUTO_RELOAD=true

   # Content Security Policy
   CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC=*

   # Email (optional)
   EMAIL_TRANSPORT=smtp
   EMAIL_FROM=noreply@example.com
   EMAIL_SMTP_HOST=smtp.example.com
   EMAIL_SMTP_PORT=587
   EMAIL_SMTP_USER=
   EMAIL_SMTP_PASSWORD=
   ```

3. **Important**: Generate a secure random secret for `DIRECTUS_SECRET`:
   - Use a password generator or run: `openssl rand -base64 32`
   - Replace the placeholder value in your `.env` file

## Step 2: Start Directus

1. Start Docker containers:
   ```bash
   docker-compose up -d
   ```

2. Check if containers are running:
   ```bash
   docker-compose ps
   ```

3. View logs (optional):
   ```bash
   docker-compose logs -f directus
   ```

4. Access Directus Admin Panel:
   - Open: http://localhost:8055
   - Login with credentials from `.env` (ADMIN_EMAIL and ADMIN_PASSWORD)

## Step 3: Import Template Data

The `template` folder contains pre-configured collections, content, and schema for a CMS.

1. In the Directus Admin Panel, go to **Settings** → **Data Model**
2. You should see pre-configured collections like:
   - Posts
   - Pages
   - Navigation
   - Globals
   - Blocks (for page builder)
   - Forms

The template data is automatically loaded on first startup.

## Step 4: Configure Main App

1. Go back to the root project directory:
   ```bash
   cd ../..
   ```

2. Create/update `.env` file in the root:
   ```bash
   # Server Configuration
   PING_MESSAGE=pong

   # Directus Configuration
   VITE_DIRECTUS_URL=http://localhost:8055
   DIRECTUS_URL=http://localhost:8055
   DIRECTUS_ADMIN_EMAIL=admin@example.com
   DIRECTUS_ADMIN_PASSWORD=admin_password

   # Development
   NODE_ENV=development
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Step 5: Test the Integration

1. With both Directus and your app running, test the API endpoints:
   - http://localhost:8080/api/cms/posts
   - http://localhost:8080/api/cms/pages
   - http://localhost:8080/api/cms/globals
   - http://localhost:8080/api/cms/navigation

2. Use the React hooks in your components:
   ```tsx
   import { usePosts } from '@/hooks/use-directus';

   function BlogList() {
     const { data: posts, isLoading, error } = usePosts(10);

     if (isLoading) return <div>Loading...</div>;
     if (error) return <div>Error: {error.message}</div>;

     return (
       <div>
         {posts?.map(post => (
           <article key={post.id}>
             <h2>{post.title}</h2>
             <p>{post.excerpt}</p>
           </article>
         ))}
       </div>
     );
   }
   ```

## Available API Endpoints

- `GET /api/cms/posts` - Get all published posts
- `GET /api/cms/posts/:slug` - Get post by slug
- `GET /api/cms/pages` - Get all published pages
- `GET /api/cms/pages/:slug` - Get page by slug
- `GET /api/cms/globals` - Get global settings
- `GET /api/cms/navigation` - Get navigation menus

## Useful Commands

```bash
# Stop Directus
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v

# Restart Directus
docker-compose restart

# View logs
docker-compose logs -f
```

## Creating Static Token (Optional)

For production or if you prefer using a static token:

1. In Directus Admin Panel, go to **Settings** → **Access Tokens**
2. Create a new token with appropriate permissions
3. Add to your `.env`:
   ```
   DIRECTUS_STATIC_TOKEN=your-token-here
   ```

## Troubleshooting

### Directus won't start
- Check if port 8055 is already in use
- Check Docker logs: `docker-compose logs directus`
- Ensure `.env` file is in the correct location

### Authentication fails
- Verify ADMIN_EMAIL and ADMIN_PASSWORD in both `.env` files match
- Check CORS settings include your app's URL

### Data not loading
- Ensure Directus is running and accessible
- Check network tab in browser dev tools for API errors
- Verify collections exist in Directus admin panel

