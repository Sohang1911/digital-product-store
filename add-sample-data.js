import db from './database/db.js';

const testimonials = [
  {
    name: 'Priya Sharma',
    image: 'https://i.pravatar.cc/150?img=47',
    rating: 5,
    feedback: 'Excellent content! Mere YouTube channel ki growth dekh kar main khud shocked thi. 1 month mein 10K subscribers se 50K+ ho gaye. Quality stories aur professional editing ne game change kar diya! 🚀',
    order: 1,
    featured: true
  },
  {
    name: 'Rajesh Verma',
    image: 'https://i.pravatar.cc/150?img=12',
    rating: 5,
    feedback: 'Best investment ever! Pehle struggle kar raha tha content creation mein. Ab ye ready-made quality videos se mera channel 3 months mein monetize ho gaya. Views aur subscribers dono badh rahe hain consistently! 💯',
    order: 2,
    featured: true
  },
  {
    name: 'Anjali Gupta',
    image: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    feedback: 'Absolutely worth it! Hindi kahaniyan ki demand bahut hai YouTube pe. Is content ko use karke maine 6 months mein 100K subscribers complete kiya. Engagement bhi kaafi high hai. Thank you so much! 🙏',
    order: 3,
    featured: true
  },
  {
    name: 'Sanjay Patel',
    image: 'https://i.pravatar.cc/150?img=33',
    rating: 5,
    feedback: 'Life changing experience! Mera channel pehle 2K subscribers pe stuck tha. Ye high-quality videos use karne ke baad har week 5-10K new subscribers aa rahe hain. Revenue bhi bahut achha mil raha hai! Highly recommended! 🎯',
    order: 4,
    featured: false
  }
];

async function addTestimonials() {
  try {
    console.log('Adding sample testimonials...');
    
    for (const t of testimonials) {
      await db.query(
        'INSERT INTO testimonials (customer_name, customer_image, rating, feedback, display_order, is_featured) VALUES (?, ?, ?, ?, ?, ?)',
        [t.name, t.image, t.rating, t.feedback, t.order, t.featured]
      );
      console.log(`✅ Added: ${t.name}`);
    }
    
    console.log('\n🎉 All testimonials added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addTestimonials();
