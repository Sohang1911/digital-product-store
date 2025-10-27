import db from './db.js';
import { v4 as uuidv4 } from 'uuid';

// Sample products data
const sampleProducts = [
  {
    id: uuidv4(),
    title: 'Hindi Story Collection Vol 1',
    category: 'Hindi Stories',
    description: 'A beautiful collection of 50+ moral stories in Hindi for children. Perfect for bedtime storytelling. Includes animated videos with engaging narration.',
    price: 299,
    thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    demo_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    download_url: 'https://example.com/downloads/stories-vol1.zip'
  },
  {
    id: uuidv4(),
    title: 'Panchatantra Stories Bundle',
    category: 'Hindi Stories',
    description: 'Classic Panchatantra tales narrated in beautiful Hindi with animated visuals. 30 timeless stories teaching valuable life lessons.',
    price: 399,
    thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    demo_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    download_url: 'https://example.com/downloads/panchatantra.zip'
  },
  {
    id: uuidv4(),
    title: 'Educational Videos Bundle',
    category: 'Educational',
    description: 'Complete educational video series covering basic concepts for young learners. Includes math, science, and language lessons.',
    price: 499,
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    demo_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    download_url: 'https://example.com/downloads/educational-bundle.zip'
  },
  {
    id: uuidv4(),
    title: 'Rhymes Collection Pro',
    category: 'Kids Entertainment',
    description: '100+ popular Hindi and English rhymes with colorful animations. Perfect for toddlers and preschoolers.',
    price: 349,
    thumbnail: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400',
    demo_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    download_url: 'https://example.com/downloads/rhymes-pro.zip'
  },
  {
    id: uuidv4(),
    title: 'Akbar Birbal Stories',
    category: 'Hindi Stories',
    description: 'Witty and entertaining stories of Akbar and Birbal. 25 stories showcasing Birbal\'s intelligence and wit.',
    price: 249,
    thumbnail: 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=400',
    demo_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    download_url: 'https://example.com/downloads/akbar-birbal.zip'
  },
  {
    id: uuidv4(),
    title: 'Jataka Tales Collection',
    category: 'Hindi Stories',
    description: 'Beautiful Jataka Tales from Buddhist literature. Stories about Buddha\'s previous lives with moral teachings.',
    price: 279,
    thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    demo_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    download_url: 'https://example.com/downloads/jataka-tales.zip'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Check if products already exist
    const [existingProducts] = await db.query('SELECT COUNT(*) as count FROM products WHERE is_active = true');
    
    if (existingProducts[0].count > 0) {
      console.log(`⚠️  Database already has ${existingProducts[0].count} products.`);
      console.log('Do you want to add more sample products? (This will not delete existing ones)\n');
      console.log('Run this script with --force flag to add anyway:\n');
      console.log('node database/seed.js --force\n');
      
      if (!process.argv.includes('--force')) {
        return;
      }
    }

    // Insert sample products
    console.log('📦 Adding sample products...\n');
    
    for (const product of sampleProducts) {
      await db.query(
        'INSERT INTO products (id, title, category, description, price, thumbnail, demo_video, download_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [product.id, product.title, product.category, product.description, product.price, product.thumbnail, product.demo_video, product.download_url]
      );
      console.log(`✅ Added: ${product.title}`);
    }

    console.log(`\n🎉 Successfully added ${sampleProducts.length} sample products!\n`);
    console.log('You can now:');
    console.log('1. Visit http://localhost:3000 to see products');
    console.log('2. Login to admin panel to manage them');
    console.log('3. Edit or delete these sample products\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
