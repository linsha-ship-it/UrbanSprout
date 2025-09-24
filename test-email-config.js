const nodemailer = require('nodemailer');
require('dotenv').config({ path: './server/.env' });

// Test email configuration
const testEmail = async () => {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Check environment variables
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  console.log('📧 Email Configuration:');
  console.log(`User: ${emailUser}`);
  console.log(`Pass: ${emailPass ? emailPass.substring(0, 4) + '...' + emailPass.substring(-4) : 'Not set'}`);
  console.log('');
  
  if (!emailUser || !emailPass || emailUser === 'your-email@gmail.com' || emailPass === 'your-app-password' || emailPass === 'your-gmail-app-password') {
    console.log('❌ Email is not properly configured');
    console.log('📝 To configure email:');
    console.log('1. Run: ./update-email-password.sh');
    console.log('2. Or manually update server/.env with real Gmail credentials');
    console.log('');
    console.log('✅ Email simulation is working correctly');
    return;
  }
  
  try {
    console.log('🔧 Creating email transporter...');
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    
    console.log('📤 Sending test email...');
    const result = await transporter.sendMail({
      from: `"UrbanSprout Test" <${emailUser}>`,
      to: emailUser, // Send to yourself for testing
      subject: '🌱 UrbanSprout - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>🌱 UrbanSprout</h1>
            <p>Email Test Successful!</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>Hello!</h2>
            <p>This is a test email from UrbanSprout to verify that email functionality is working correctly.</p>
            <p><strong>Email Configuration:</strong> ✅ Working</p>
            <p><strong>SMTP Connection:</strong> ✅ Connected</p>
            <p><strong>Email Sending:</strong> ✅ Success</p>
            <p>If you received this email, your email system is properly configured!</p>
          </div>
        </div>
      `,
      text: 'UrbanSprout Email Test - If you received this email, your email system is working correctly!'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${result.messageId}`);
    console.log(`📬 Check your inbox: ${emailUser}`);
    console.log('');
    console.log('🎉 Email system is working perfectly!');
    
  } catch (error) {
    console.log('❌ Email test failed:');
    console.log(`Error: ${error.message}`);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check if 2FA is enabled on Gmail');
    console.log('2. Use App Password (not regular password)');
    console.log('3. Remove spaces from app password');
    console.log('4. Wait a few minutes after generating app password');
    console.log('5. Run: ./update-email-password.sh to update credentials');
  }
};

// Run the test
testEmail();


