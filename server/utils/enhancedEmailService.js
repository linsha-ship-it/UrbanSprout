const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const handlebars = require('handlebars');
const htmlToText = require('html-to-text');

// Configure SendGrid if API key is provided
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email service configuration
const EMAIL_CONFIG = {
  // Primary email service (Gmail SMTP)
  primary: {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    },
    pool: true,
    maxConnections: 1,
    rateDelta: 20000,
    rateLimit: 5
  },
  
  // SendGrid configuration
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER
  },
  
  // Fallback SMTP configuration
  fallback: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
    }
  }
};

// Create email transporter with multiple fallback options
const createTransporter = () => {
  const emailUser = EMAIL_CONFIG.primary.auth.user;
  const emailPass = EMAIL_CONFIG.primary.auth.pass.replace(/\s+/g, '');
  
  console.log('📧 Email configuration:', {
    user: emailUser,
    passLength: emailPass.length,
    passStartsWith: emailPass.substring(0, 4) + '...',
    sendgridEnabled: !!EMAIL_CONFIG.sendgrid.apiKey
  });
  
  try {
    return nodemailer.createTransporter(EMAIL_CONFIG.primary);
  } catch (error) {
    console.warn('⚠️ Primary email config failed, trying fallback:', error.message);
    return nodemailer.createTransporter(EMAIL_CONFIG.fallback);
  }
};

// Send email using SendGrid
const sendWithSendGrid = async (emailData) => {
  if (!EMAIL_CONFIG.sendgrid.apiKey) {
    throw new Error('SendGrid API key not configured');
  }

  const msg = {
    to: emailData.to,
    from: {
      email: EMAIL_CONFIG.sendgrid.fromEmail,
      name: emailData.fromName || 'UrbanSprout'
    },
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text || htmlToText.convert(emailData.html)
  };

  try {
    const response = await sgMail.send(msg);
    console.log('✅ SendGrid email sent:', response[0].statusCode);
    return {
      success: true,
      messageId: response[0].headers['x-message-id'],
      provider: 'sendgrid'
    };
  } catch (error) {
    console.error('❌ SendGrid email failed:', error.message);
    throw error;
  }
};

// Send email using Nodemailer
const sendWithNodemailer = async (emailData) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"${emailData.fromName || 'UrbanSprout'}" <${EMAIL_CONFIG.primary.auth.user}>`,
    to: emailData.to,
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text || htmlToText.convert(emailData.html)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Nodemailer email sent:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      provider: 'nodemailer'
    };
  } catch (error) {
    console.error('❌ Nodemailer email failed:', error.message);
    throw error;
  }
};

// Main email sending function with fallback
const sendEmail = async (emailData) => {
  const errors = [];
  
  // Try SendGrid first if configured
  if (EMAIL_CONFIG.sendgrid.apiKey) {
    try {
      return await sendWithSendGrid(emailData);
    } catch (error) {
      errors.push({ provider: 'sendgrid', error: error.message });
      console.warn('⚠️ SendGrid failed, trying Nodemailer...');
    }
  }
  
  // Try Nodemailer
  try {
    return await sendWithNodemailer(emailData);
  } catch (error) {
    errors.push({ provider: 'nodemailer', error: error.message });
  }
  
  // All methods failed
  console.error('❌ All email methods failed:', errors);
  return {
    success: false,
    error: 'All email services failed',
    details: errors
  };
};

// Email templates using Handlebars
const emailTemplates = {
  passwordReset: handlebars.compile(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌱 UrbanSprout</h1>
          <h2>Password Reset Request</h2>
        </div>
        
        <div class="content">
          <h3>Hello {{userName}}!</h3>
          
          <p>We received a request to reset your password for your UrbanSprout account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="{{resetUrl}}" class="button">Reset My Password</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul>
              <li>This link will expire in 10 minutes for security</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 5px; font-size: 12px;">
            {{resetUrl}}
          </p>
          
          <p>Happy gardening!<br>
          The UrbanSprout Team 🌿</p>
        </div>
        
        <div class="footer">
          <p>© 2025 UrbanSprout. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `),

  paymentConfirmation: handlebars.compile(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .payment-details { background: white; border: 1px solid #E5E7EB; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .payment-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F3F4F6; }
        .payment-item:last-child { border-bottom: none; }
        .success-badge { background: #D1FAE5; color: #065F46; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💳 Payment Confirmed!</h1>
          <h2>Transaction Successful</h2>
        </div>
        
        <div class="content">
          <h3>Hello {{userName}}!</h3>
          
          <p>Great news! Your payment has been successfully processed.</p>
          
          <div style="text-align: center;">
            <div class="success-badge">✅ Payment Successful</div>
          </div>
          
          <div class="payment-details">
            <h4>💳 Payment Details</h4>
            <div class="payment-item">
              <span><strong>Transaction ID:</strong></span>
              <span>{{transactionId}}</span>
            </div>
            <div class="payment-item">
              <span><strong>Payment Date:</strong></span>
              <span>{{paymentDate}}</span>
            </div>
            <div class="payment-item">
              <span><strong>Payment Method:</strong></span>
              <span>{{paymentMethod}}</span>
            </div>
            <div class="payment-item">
              <span><strong>Amount Paid:</strong></span>
              <span style="color: #10B981; font-weight: bold; font-size: 18px;">\${{amount}}</span>
            </div>
            <div class="payment-item">
              <span><strong>Order Reference:</strong></span>
              <span>{{orderId}}</span>
            </div>
          </div>
          
          <p>Your payment has been processed securely and your order is now being prepared for shipment.</p>
          
          <div style="text-align: center;">
            <a href="{{frontendUrl}}/dashboard" class="button">View Order Status</a>
          </div>
          
          <p>Happy gardening!<br>
          The UrbanSprout Team 🌿</p>
        </div>
        
        <div class="footer">
          <p>© 2025 UrbanSprout. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `)
};

// Enhanced email functions
const sendPasswordResetEmail = async (email, resetUrl, userName = 'User') => {
  const htmlContent = emailTemplates.passwordReset({
    userName,
    resetUrl
  });

  return await sendEmail({
    to: email,
    subject: '🔐 Password Reset Request - UrbanSprout',
    html: htmlContent,
    fromName: 'UrbanSprout Security'
  });
};

const sendPaymentConfirmationEmail = async (email, userName, paymentDetails) => {
  const htmlContent = emailTemplates.paymentConfirmation({
    userName,
    transactionId: paymentDetails.transactionId,
    paymentDate: new Date(paymentDetails.paymentDate).toLocaleDateString(),
    paymentMethod: paymentDetails.paymentMethod,
    amount: paymentDetails.amount,
    orderId: paymentDetails.orderId,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
  });

  return await sendEmail({
    to: email,
    subject: '💳 Payment Confirmed - UrbanSprout',
    html: htmlContent,
    fromName: 'UrbanSprout Payments'
  });
};

const sendOrderConfirmationEmail = async (email, userName, orderDetails) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .order-details { background: white; border: 1px solid #E5E7EB; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .order-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F3F4F6; }
        .order-item:last-child { border-bottom: none; }
        .total { font-weight: bold; font-size: 18px; color: #10B981; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 Order Confirmation</h1>
          <h2>Thank You for Your Purchase!</h2>
        </div>
        
        <div class="content">
          <h3>Hello ${userName}!</h3>
          
          <p>Thank you for your order! We're excited to help you with your gardening journey.</p>
          
          <div class="order-details">
            <h4>📋 Order Details</h4>
            <div class="order-item">
              <span><strong>Order ID:</strong></span>
              <span>${orderDetails.orderId}</span>
            </div>
            <div class="order-item">
              <span><strong>Order Date:</strong></span>
              <span>${new Date(orderDetails.orderDate).toLocaleDateString()}</span>
            </div>
            <div class="order-item">
              <span><strong>Total Amount:</strong></span>
              <span class="total">$${orderDetails.totalAmount}</span>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">Track Your Order</a>
          </div>
          
          <p>Happy gardening!<br>
          The UrbanSprout Team 🌿</p>
        </div>
        
        <div class="footer">
          <p>© 2025 UrbanSprout. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: '🛒 Order Confirmation - UrbanSprout',
    html: htmlContent,
    fromName: 'UrbanSprout Store'
  });
};

// Test email functionality
const testEmailService = async () => {
  console.log('🧪 Testing Enhanced Email Service...');
  
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  
  try {
    const result = await sendEmail({
      to: testEmail,
      subject: '🧪 Email Service Test - UrbanSprout',
      html: `
        <h1>Email Service Test</h1>
        <p>This is a test email to verify the enhanced email service is working correctly.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
      fromName: 'UrbanSprout Test'
    });
    
    console.log('✅ Email service test result:', result);
    return result;
  } catch (error) {
    console.error('❌ Email service test failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendPaymentConfirmationEmail,
  sendOrderConfirmationEmail,
  testEmailService,
  EMAIL_CONFIG
};
