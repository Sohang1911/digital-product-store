import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin user
    const [users] = await db.query(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        isAdmin: true 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, newUsername } = req.body;
    const userId = req.user.id;

    // Get current user
    const [users] = await db.query(
      'SELECT * FROM admins WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and username if provided
    await db.query(
      'UPDATE admins SET password = ?, username = ? WHERE id = ?',
      [hashedPassword, newUsername || user.username, userId]
    );

    res.json({
      success: true,
      message: 'Credentials updated successfully'
    });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password update'
    });
  }
};

export const verifyToken = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username
    }
  });
};
