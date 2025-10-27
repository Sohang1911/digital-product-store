import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail', // Use 'gmail', 'outlook', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ Email service error:', error);
    } else {
      console.log('✅ Email service ready');
    }
  });
} else {
  console.log('⚠️  Email credentials not configured');
}

export const sendOrderConfirmationEmail = async (to, orderData) => {
  const { orderId, customerName, items, total } = orderData;

  const itemsList = items.map(item => 
    `<li>${item.title} x ${item.quantity} - ₹${Number(item.price * item.quantity).toFixed(2)}</li>`
  ).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'Order Confirmation - Digital Store',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Order Confirmation</h2>
        <p>Dear ${customerName},</p>
        <p>Thank you for your order! We have received your payment and it's being processed.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Total Amount:</strong> ₹${Number(total).toFixed(2)}</p>
          
          <h4>Items:</h4>
          <ul>${itemsList}</ul>
        </div>

        <p>Your order is currently under review. Once approved by our team, you will receive a download link via email.</p>
        
        <p>If you have any questions, please contact us at ${process.env.SUPPORT_EMAIL || 'support@digitalstore.com'}</p>
        
        <p>Best regards,<br>Digital Store Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', to);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

export const sendDownloadLinkEmail = async (to, downloadData) => {
  const { customerName, orderId, downloadLink, expiryDate, items } = downloadData;

  const itemsList = items.map(item => 
    `<li>
      <strong>${item.product_title}</strong> x ${item.quantity}
      ${item.download_url ? `<br/><a href="${item.download_url}" style="color: #4F46E5; text-decoration: none;">📥 Download Link</a>` : ''}
    </li>`
  ).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'Your Order is Approved - Download Link',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Payment Approved! 🎉</h2>
        <p>Dear ${customerName},</p>
        <p>Great news! Your payment has been verified and approved.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          
          <h4>Products:</h4>
          <ul>${itemsList}</ul>
        </div>

        <div style="background-color: #EFF6FF; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <h3 style="color: #4F46E5;">Download Your Products</h3>
          <a href="${downloadLink}" 
             style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold;">
            Click Here to Download
          </a>
          <p style="font-size: 12px; color: #10B981; margin-top: 10px;">
            ✅ This link is valid for lifetime access
          </p>
        </div>

        <p><strong>Important Notes:</strong></p>
        <ul>
          <li>The download link has lifetime validity</li>
          <li>You can download your products anytime</li>
          <li>Keep this email for your records</li>
        </ul>
        
        <p>Thank you for your purchase!</p>
        
        <p>If you have any issues with the download, please contact us at ${process.env.SUPPORT_EMAIL || 'support@digitalstore.com'}</p>
        
        <p>Best regards,<br>Digital Store Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Download link email sent to:', to);
  } catch (error) {
    console.error('Error sending download link email:', error);
    throw error;
  }
};
