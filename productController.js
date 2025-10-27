import db from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export const getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = 'SELECT * FROM products WHERE is_active = true';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [products] = await db.query(query, params);

    res.json({
      success: true,
      products
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await db.query(
      'SELECT * FROM products WHERE id = ? AND is_active = true',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product: products[0]
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { title, category, description, price, thumbnail, demoVideo, downloadUrl } = req.body;
    const id = uuidv4();

    await db.query(
      'INSERT INTO products (id, title, category, description, price, thumbnail, demo_video, download_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, category, description, price, thumbnail, demoVideo, downloadUrl]
    );

    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: products[0]
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product'
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, price, thumbnail, demoVideo, downloadUrl } = req.body;

    const [result] = await db.query(
      'UPDATE products SET title = ?, category = ?, description = ?, price = ?, thumbnail = ?, demo_video = ?, download_url = ? WHERE id = ?',
      [title, category, description, price, thumbnail, demoVideo, downloadUrl, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: products[0]
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete - set is_active to false
    const [result] = await db.query(
      'UPDATE products SET is_active = false WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT DISTINCT category FROM products WHERE is_active = true ORDER BY category'
    );

    res.json({
      success: true,
      categories: categories.map(c => c.category)
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
};
