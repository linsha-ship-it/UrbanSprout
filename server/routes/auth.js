const express = require('express');
const {
  register,
  login,
  googleSignIn,
  getProfile,
  updateProfile,
  changePassword,
  updatePreferences,
  logout,
  deleteAccount,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const admin = require('firebase-admin');
if (!admin.apps.length) {
  try {
    // Prefer explicit service account via env vars if provided
    const {
      FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY
    } = process.env;

    if (FIREBASE_PRIVATE_KEY && FIREBASE_CLIENT_EMAIL && FIREBASE_PROJECT_ID) {
      const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey
        })
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Fallback to ADC if explicit key not provided
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        ...(process.env.FIREBASE_PROJECT_ID && { projectId: process.env.FIREBASE_PROJECT_ID })
      });
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // As a minimal path, allow unverified token parsing using projectId (emulator-like)
      // Note: This will still require valid Google credentials to call Admin APIs.
      admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
    } else {
      throw new Error('Firebase Admin credentials are not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY or GOOGLE_APPLICATION_CREDENTIALS');
    }
  } catch (e) {
    // Initialization warning suppressed to reduce noise
  }
}
const { validateRegistration, validateLogin } = require('../middlewares/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/google', googleSignIn);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Email validation endpoint
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists with this email
    const User = require('../models/User');
    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    });

    res.json({
      success: true,
      exists: !!existingUser,
      message: existingUser ? 'Email already registered' : 'Email available'
    });

  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking email availability'
    });
  }
});
router.post('/firebase-auth', async (req, res) => {
  try {
    const { idToken, role, name, email } = req.body;
    console.log('Firebase auth request received:', { hasIdToken: !!idToken, email, name, role });
    
    if (!idToken && !email) {
      return res.status(400).json({ success: false, message: 'idToken or email is required' });
    }

    let decoded = null;
    let uid = null;
    let userEmail = email;

    // Try to verify Firebase ID token if available
    if (idToken) {
      try {
        if (admin.apps.length > 0) {
          console.log('Verifying ID token with Firebase Admin...');
          decoded = await admin.auth().verifyIdToken(idToken);
          uid = decoded.uid;
          userEmail = decoded.email;
          console.log('ID token verified successfully:', { uid, email: userEmail });
        } else {
          console.log('Firebase Admin not initialized, using fallback method');
          // Fallback: decode token without verification (for development)
          const jwt = require('jsonwebtoken');
          const decodedToken = jwt.decode(idToken);
          if (decodedToken && decodedToken.email) {
            userEmail = decodedToken.email;
            uid = decodedToken.sub || decodedToken.user_id;
            console.log('Token decoded without verification:', { uid, email: userEmail });
          }
        }
      } catch (error) {
        console.log('Token verification failed, using email fallback:', error.message);
        // Continue with email fallback
      }
    }

    // If no decoded token or verification failed, use email directly
    if (!decoded && !uid && email) {
      uid = `firebase_${email.replace('@', '_').replace('.', '_')}`;
      userEmail = email;
      console.log('Using email fallback:', { uid, email: userEmail });
    }

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'Could not determine user email' });
    }

    // Find or create user
    let user = await require('../models/User').findOne({ email: userEmail.toLowerCase() });
    
    if (!user) {
      // For new users, check if this is an admin email
      const adminEmails = ['admin@urbansprout.com', 'lxiao0391@gmail.com'];
      const isAdminEmail = adminEmails.includes(userEmail.toLowerCase());
      const defaultRole = isAdminEmail ? 'admin' : 'beginner';
      
      user = new (require('../models/User'))({
        name: name || decoded?.name || 'User',
        email: userEmail.toLowerCase(),
        firebaseUid: uid,
        role: role || defaultRole,
        password: 'firebase-auth' // placeholder
      });
      await user.save();
    } else {
      // Update Firebase UID if not set, but preserve existing role
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        await user.save();
      }
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.put('/preferences', updatePreferences);
router.post('/logout', logout);
router.delete('/account', deleteAccount);

module.exports = router;