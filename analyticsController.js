import db from '../database/db.js';

export const getAnalytics = async (req, res) => {
  try {
    // Get overall stats
    const [productCount] = await db.query(
      'SELECT COUNT(*) as count FROM products WHERE is_active = true'
    );

    const [orderStats] = await db.query(`
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(total_amount), 0) as total_revenue
      FROM orders 
      WHERE status = 'paid'
    `);

    const [analyticsData] = await db.query(
      'SELECT SUM(visitors) as total_visitors FROM analytics'
    );

    // Get recent orders
    const [recentOrders] = await db.query(`
      SELECT 
        o.id,
        o.created_at,
        o.total_amount,
        o.status,
        c.name as customer_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    // Get analytics chart data (last 30 days)
    const [chartData] = await db.query(`
      SELECT 
        date,
        visitors,
        sales,
        revenue
      FROM analytics
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      ORDER BY date ASC
    `);

    // Get top selling products
    const [topProducts] = await db.query(`
      SELECT 
        p.title,
        p.category,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'paid'
      GROUP BY p.id, p.title, p.category
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      analytics: {
        overview: {
          totalProducts: productCount[0].count,
          totalSales: orderStats[0].total_sales,
          totalRevenue: parseFloat(orderStats[0].total_revenue),
          totalVisitors: analyticsData[0].total_visitors || 0
        },
        recentOrders,
        chartData,
        topProducts
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
};

export const trackVisitor = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    await db.query(
      `INSERT INTO analytics (date, visitors) 
       VALUES (?, 1) 
       ON DUPLICATE KEY UPDATE visitors = visitors + 1`,
      [today]
    );

    res.json({
      success: true,
      message: 'Visitor tracked'
    });

  } catch (error) {
    console.error('Track visitor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking visitor'
    });
  }
};
