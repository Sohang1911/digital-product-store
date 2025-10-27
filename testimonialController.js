import db from '../database/db.js';

export const getAllTestimonials = async (req, res) => {
  try {
    const [testimonials] = await db.query(
      'SELECT * FROM testimonials ORDER BY is_featured DESC, display_order ASC, created_at DESC'
    );

    res.json({
      success: true,
      testimonials
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching testimonials'
    });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const { customerName, customerImage, rating, feedback, displayOrder, isFeatured } = req.body;

    const [result] = await db.query(
      'INSERT INTO testimonials (customer_name, customer_image, rating, feedback, display_order, is_featured) VALUES (?, ?, ?, ?, ?, ?)',
      [customerName, customerImage || '', rating || 5, feedback, displayOrder || 0, isFeatured || false]
    );

    const [testimonials] = await db.query('SELECT * FROM testimonials WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      testimonial: testimonials[0]
    });
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating testimonial'
    });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, customerImage, rating, feedback, displayOrder, isFeatured } = req.body;

    await db.query(
      'UPDATE testimonials SET customer_name = ?, customer_image = ?, rating = ?, feedback = ?, display_order = ?, is_featured = ? WHERE id = ?',
      [customerName, customerImage, rating, feedback, displayOrder, isFeatured, id]
    );

    const [testimonials] = await db.query('SELECT * FROM testimonials WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Testimonial updated successfully',
      testimonial: testimonials[0]
    });
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating testimonial'
    });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM testimonials WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting testimonial'
    });
  }
};
