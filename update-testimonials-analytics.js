import db from './database/db.js';

const testimonialsWithAnalytics = [
  {
    name: 'Priya Sharma',
    // YouTube analytics screenshot showing growth
    image: 'https://img.freepik.com/free-vector/youtube-analytics-concept-illustration_114360-7253.jpg',
    rating: 5,
    feedback: 'Excellent content! Mere YouTube channel ki growth dekh kar main khud shocked thi. 1 month mein 10K subscribers se 50K+ ho gaye. Screenshot mein dekh sakte hain - Views aur watch time bhi 400% badh gaye! Quality stories aur professional editing ne game change kar diya! 🚀📈',
    order: 1,
    featured: true
  },
  {
    name: 'Rajesh Verma',
    image: 'https://img.freepik.com/free-photo/graph-chart-analysis-financial-economy_53876-31215.jpg',
    rating: 5,
    feedback: 'Best investment ever! Analytics dekh kar believe nahi ho raha. Pehle 100-200 daily views the, ab 10K+ daily views mil rahe hain. Channel 3 months mein monetize ho gaya. Revenue graph continuously upward trend pe hai! 💯📊',
    order: 2,
    featured: true
  },
  {
    name: 'Anjali Gupta',
    image: 'https://img.freepik.com/free-vector/gradient-ui-ux-background_23-2149065783.jpg',
    rating: 5,
    feedback: 'Absolutely worth it! Screenshot mein clear dikh raha hai - 6 months mein 0 se 100K subscribers! Engagement rate 15% hai jo ki bahut high hai. Hindi kahaniyan ki demand bahut hai. Watch time aur CTR dono excellent hain! 🙏🎯',
    order: 3,
    featured: true
  },
  {
    name: 'Sanjay Patel',
    image: 'https://img.freepik.com/free-vector/gradient-stock-market-concept_23-2149166925.jpg',
    rating: 5,
    feedback: 'Life changing! Ye dekho mere analytics - 2K se direct 75K subscribers in 4 months! Har week consistent 5-10K growth. Revenue bhi $500+ per month ho gaya. Ye content ka magic hai! 🎯💰',
    order: 4,
    featured: false
  }
];

async function updateTestimonials() {
  try {
    console.log('🔄 Updating testimonials with analytics screenshots...\n');
    
    // Delete old testimonials
    await db.query('DELETE FROM testimonials');
    console.log('✅ Cleared old testimonials\n');
    
    // Add new ones with analytics images
    for (const t of testimonialsWithAnalytics) {
      await db.query(
        'INSERT INTO testimonials (customer_name, customer_image, rating, feedback, display_order, is_featured) VALUES (?, ?, ?, ?, ?, ?)',
        [t.name, t.image, t.rating, t.feedback, t.order, t.featured]
      );
      console.log(`✅ Added: ${t.name} (with analytics screenshot)`);
    }
    
    console.log('\n🎉 All testimonials updated with analytics screenshots!');
    console.log('📊 Screenshots show: Growth graphs, subscriber counts, revenue charts\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateTestimonials();
