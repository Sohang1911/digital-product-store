import db from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';
import { sendOrderConfirmationEmail, sendDownloadLinkEmail } from '../utils/emailService.js';

export const createOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { items, customer, transactionId } = req.body;
    const paymentProof = req.file ? `/uploads/payment-proofs/${req.file.filename}` : null;

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Insert customer
    const [customerResult] = await connection.query(
      'INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)',
      [customer.name, customer.email, customer.phone, customer.address || '']
    );

    const customerId = customerResult.insertId;

    // Create order
    const orderId = uuidv4();
    await connection.query(
      'INSERT INTO orders (id, customer_id, total_amount, transaction_id, payment_proof, status) VALUES (?, ?, ?, ?, ?, ?)',
      [orderId, customerId, totalAmount, transactionId, paymentProof, 'pending']
    );

    // Insert order items
    for (const item of items) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, product_title, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.id, item.title, item.quantity, item.price]
      );
    }

    // Track visitor and update analytics
    const today = new Date().toISOString().split('T')[0];
    await connection.query(
      'INSERT INTO analytics (date, visitors) VALUES (?, 1) ON DUPLICATE KEY UPDATE visitors = visitors',
      [today]
    );

    await connection.commit();

    // Send order confirmation email (FREE)
    try {
      await sendOrderConfirmationEmail(customer.email, {
        orderId,
        customerName: customer.name,
        items,
        total: totalAmount
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the order if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  } finally {
    connection.release();
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT 
        o.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
    `;
    
    const params = [];

    if (status && status !== 'all') {
      query += ' WHERE o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.created_at DESC';

    const [orders] = await db.query(query, params);

    // Get order items for each order with product download links
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.download_url 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await db.query(
      `SELECT 
        o.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];

    // Get order items with product download links
    const [items] = await db.query(
      `SELECT oi.*, p.download_url 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [id]
    );
    
    order.items = items;

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
};

export const approveOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Get order details
    const [orders] = await connection.query(
      `SELECT o.*, c.email, c.name 
       FROM orders o 
       JOIN customers c ON o.customer_id = c.id 
       WHERE o.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];

    // Generate download link (lifetime access)
    const downloadToken = uuidv4();
    const downloadLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}?download=${downloadToken}`;
    const linkExpiry = new Date();
    linkExpiry.setFullYear(linkExpiry.getFullYear() + 10); // Lifetime (10 years)

    // Update order
    await connection.query(
      'UPDATE orders SET status = ?, download_link = ?, link_expiry = ? WHERE id = ?',
      ['paid', downloadLink, linkExpiry, id]
    );

    // Update analytics
    const today = new Date().toISOString().split('T')[0];
    await connection.query(
      `INSERT INTO analytics (date, sales, revenue) 
       VALUES (?, 1, ?) 
       ON DUPLICATE KEY UPDATE 
       sales = sales + 1, 
       revenue = revenue + ?`,
      [today, order.total_amount, order.total_amount]
    );

    await connection.commit();

    // Get order items with product download links
    const [items] = await db.query(
      `SELECT oi.*, p.download_url 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [id]
    );

    // Send download link email (FREE)
    try {
      await sendDownloadLinkEmail(order.email, {
        customerName: order.name,
        orderId: id,
        downloadLink,
        expiryDate: linkExpiry,
        items
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    // NOTE: WhatsApp link can be manually sent by admin from order details
    console.log('📱 Download link ready to share via WhatsApp:', downloadLink);

    res.json({
      success: true,
      message: 'Order approved successfully',
      downloadLink
    });

  } catch (error) {
    await connection.rollback();
    console.error('Approve order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving order'
    });
  } finally {
    connection.release();
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as completed_orders,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount END), 0) as total_revenue
      FROM orders
    `);

    res.json({
      success: true,
      stats: stats[0]
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics'
    });
  }
};
