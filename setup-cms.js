import { createDirectus, rest, authentication, createCollection, createField, createItem, updateItem } from '@directus/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

console.log('🚀 Setting up your CMS automatically...\n');

async function setupCMS() {
  try {
    // Create Directus client
    const directus = createDirectus(DIRECTUS_URL).with(rest()).with(authentication());
    
    console.log('🔑 Authenticating...');
    await directus.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Logged in successfully!\n');

    // 1. Create Homepage Settings Collection (Singleton)
    console.log('📝 Creating Homepage Settings collection...');
    
    try {
      await directus.request(createCollection({
        collection: 'homepage_settings',
        meta: {
          collection: 'homepage_settings',
          icon: 'home',
          note: 'Homepage content settings',
          display_template: null,
          hidden: false,
          singleton: true,
          translations: null,
          archive_field: null,
          archive_app_filter: true,
          archive_value: null,
          unarchive_value: null,
          sort_field: null,
          accountability: 'all',
          color: null,
          item_duplication_fields: null,
          sort: 1,
          group: null,
          collapse: 'open',
          preview_url: null
        },
        schema: {
          name: 'homepage_settings'
        }
      }));
      console.log('✅ Homepage Settings collection created');
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log('ℹ️  Homepage Settings collection already exists');
      } else {
        throw error;
      }
    }

    // Add fields to homepage_settings
    const fields = [
      { field: 'hero_title_line1', type: 'string', defaultValue: 'THE', note: 'First line of hero title' },
      { field: 'hero_title_line2', type: 'string', defaultValue: 'COFFEE', note: 'Second line of hero title' },
      { field: 'hero_title_line3', type: 'string', defaultValue: 'MANIFEST', note: 'Third line of hero title' },
      { field: 'hero_cta_text', type: 'string', defaultValue: 'SHOP COFFEE', note: 'Hero button text' },
      { field: 'hero_cta_link', type: 'string', defaultValue: '/coffee', note: 'Hero button link' },
      { field: 'hero_video', type: 'string', defaultValue: '/Coffee_beans_fly_202510011757_183lh.mp4', note: 'Hero background video' },
      { field: 'season_title', type: 'string', defaultValue: 'WE CREATE SOMETHING UNIQUE', note: 'Season section title' },
      { field: 'news_section_title', type: 'string', defaultValue: 'LATEST FROM OUR BLOG', note: 'News section title' },
      { field: 'trade_points_title', type: 'string', defaultValue: 'WHERE TO FIND US', note: 'Trade points section title' }
    ];

    console.log('🔧 Adding fields to Homepage Settings...');
    for (const fieldConfig of fields) {
      try {
        await directus.request(createField('homepage_settings', {
          field: fieldConfig.field,
          type: fieldConfig.type,
          meta: {
            field: fieldConfig.field,
            special: null,
            interface: 'input',
            options: {
              placeholder: fieldConfig.defaultValue
            },
            display: null,
            display_options: null,
            readonly: false,
            hidden: false,
            sort: null,
            width: 'full',
            translations: null,
            note: fieldConfig.note,
            conditions: null,
            required: false,
            group: null,
            validation: null,
            validation_message: null
          },
          schema: {
            name: fieldConfig.field,
            table: 'homepage_settings',
            data_type: 'varchar',
            default_value: fieldConfig.defaultValue,
            max_length: 255,
            numeric_precision: null,
            numeric_scale: null,
            is_generated: false,
            generation_expression: null,
            is_nullable: true,
            is_unique: false,
            is_primary_key: false,
            has_auto_increment: false,
            foreign_key_column: null,
            foreign_key_table: null,
            comment: ''
          }
        }));
        console.log(`  ✅ Added field: ${fieldConfig.field}`);
      } catch (error) {
        if (error.message?.includes('already exists')) {
          console.log(`  ℹ️  Field ${fieldConfig.field} already exists`);
        } else {
          console.log(`  ⚠️  Error adding field ${fieldConfig.field}:`, error.message);
        }
      }
    }

    // 2. Create homepage content
    console.log('\n📝 Creating homepage content...');
    try {
      await directus.request(createItem('homepage_settings', {
        hero_title_line1: 'THE',
        hero_title_line2: 'COFFEE',
        hero_title_line3: 'MANIFEST',
        hero_cta_text: 'SHOP COFFEE',
        hero_cta_link: '/coffee',
        hero_video: '/Coffee_beans_fly_202510011757_183lh.mp4',
        season_title: 'WE CREATE SOMETHING UNIQUE',
        news_section_title: 'LATEST FROM OUR BLOG',
        trade_points_title: 'WHERE TO FIND US'
      }));
      console.log('✅ Homepage content created');
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log('ℹ️  Homepage content already exists');
        // Update existing content
        await directus.request(updateItem('homepage_settings', 1, {
          hero_title_line1: 'THE',
          hero_title_line2: 'COFFEE',
          hero_title_line3: 'MANIFEST',
          hero_cta_text: 'SHOP COFFEE',
          hero_cta_link: '/coffee',
          hero_video: '/Coffee_beans_fly_202510011757_183lh.mp4',
          season_title: 'WE CREATE SOMETHING UNIQUE',
          news_section_title: 'LATEST FROM OUR BLOG',
          trade_points_title: 'WHERE TO FIND US'
        }));
        console.log('✅ Homepage content updated');
      } else {
        throw error;
      }
    }

    // 3. Create Visual Editing Token
    console.log('\n🔑 Creating visual editing token...');
    try {
      const tokenResponse = await directus.request(createItem('directus_tokens', {
        name: 'Visual Editing Token',
        token: 'visual-edit-token-123',
        role: null, // Admin role
        expires: null // Never expires
      }));
      console.log('✅ Visual editing token created: visual-edit-token-123');
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log('ℹ️  Visual editing token already exists: visual-edit-token-123');
      } else {
        console.log('⚠️  Token creation error (might already exist):', error.message);
      }
    }

    console.log('\n🎉 CMS Setup Complete!\n');
    console.log('🌐 Your website: http://localhost:8081');
    console.log('🎨 Visual Editor: http://localhost:8081/?visual-editing=true&token=visual-edit-token-123');
    console.log('⚙️  Directus Admin: http://localhost:8055\n');
    
    console.log('✨ What you can do now:');
    console.log('1. Visit the Visual Editor URL above');
    console.log('2. Click on "THE COFFEE MANIFEST" to edit the hero title');
    console.log('3. Click on "SHOP COFFEE" button to edit button text');
    console.log('4. Click on "WE CREATE SOMETHING UNIQUE" to edit section title');
    console.log('5. Changes save automatically!\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🆘 Troubleshooting:');
    console.log('1. Make sure Directus is running: http://localhost:8055');
    console.log('2. Check login credentials in the script');
    console.log('3. Try running the script again');
  }
}

setupCMS();
