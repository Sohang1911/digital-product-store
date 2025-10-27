import db from '../database/db.js';

export const getPaymentSettings = async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM payment_settings WHERE id = 1');

    res.json({
      success: true,
      settings: settings[0] || {}
    });

  } catch (error) {
    console.error('Get payment settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment settings'
    });
  }
};

export const updatePaymentSettings = async (req, res) => {
  try {
    const { upiId, accountName, accountNumber, ifscCode, bankName } = req.body;
    const qrCodePath = req.file ? `/uploads/qr-codes/${req.file.filename}` : null;

    let query = `
      UPDATE payment_settings 
      SET upi_id = ?, account_name = ?, account_number = ?, ifsc_code = ?, bank_name = ?
    `;
    const params = [upiId, accountName, accountNumber, ifscCode, bankName];

    if (qrCodePath) {
      query += ', qr_code_path = ?';
      params.push(qrCodePath);
    }

    query += ' WHERE id = 1';

    await db.query(query, params);

    const [settings] = await db.query('SELECT * FROM payment_settings WHERE id = 1');

    res.json({
      success: true,
      message: 'Payment settings updated successfully',
      settings: settings[0]
    });

  } catch (error) {
    console.error('Update payment settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment settings'
    });
  }
};

export const getSiteSettings = async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM site_settings WHERE id = 1');

    res.json({
      success: true,
      settings: settings[0] || {}
    });

  } catch (error) {
    console.error('Get site settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching site settings'
    });
  }
};

export const updateSiteSettings = async (req, res) => {
  try {
    const { whatsapp, email, instagram, facebook } = req.body;

    await db.query(
      `UPDATE site_settings 
       SET whatsapp = ?, email = ?, instagram = ?, facebook = ? 
       WHERE id = 1`,
      [whatsapp, email, instagram, facebook]
    );

    const [settings] = await db.query('SELECT * FROM site_settings WHERE id = 1');

    res.json({
      success: true,
      message: 'Site settings updated successfully',
      settings: settings[0]
    });

  } catch (error) {
    console.error('Update site settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating site settings'
    });
  }
};
