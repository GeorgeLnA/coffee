@echo off
echo 🚀 One-Click CMS Setup
echo.
echo This will automatically:
echo - Create all collections in Directus
echo - Add your homepage content
echo - Create visual editing token
echo - Set up everything for you!
echo.
pause

echo 📦 Installing dependencies...
npm install

echo 🔧 Running CMS setup...
node setup-cms.js

echo.
echo ✅ Setup complete! Your links:
echo 🌐 Website: http://localhost:8081
echo 🎨 Visual Editor: http://localhost:8081/?visual-editing=true^&token=visual-edit-token-123
echo ⚙️  Admin Panel: http://localhost:8055
echo.
pause


