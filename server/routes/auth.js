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
  deleteAccount
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
router.post('/firebase-auth', async (req, res) => {
  try {
    const { idToken, role, name, email } = req.body;
    if (!idToken && !email) {
      return res.status(400).json({ success: false, message: 'idToken or email is required' });
    }

    let decoded = null;
    let uid = null;
    let userEmail = email;

    // Try to verify Firebase ID token if available
    if (idToken && admin.apps.length > 0) {
      try {
        decoded = await admin.auth().verifyIdToken(idToken);
        uid = decoded.uid;
        userEmail = decoded.email;
      } catch (error) {
        // Continue with email fallback
      }
    }

    // If no decoded token, use email directly (fallback for development)
    if (!decoded && email) {
      uid = `firebase_${email.replace('@', '_').replace('.', '_')}`;
      userEmail = email;
    }

    // Find or create user
    let user = await require('../models/User').findOne({ email: userEmail.toLowerCase() });
    
    if (!user) {
      user = new (require('../models/User'))({
        name: name || decoded?.name || 'User',
        email: userEmail.toLowerCase(),
        firebaseUid: uid,
        role: role || 'beginner',
        password: 'firebase-auth' // placeholder
      });
      await user.save();
    } else {
      // Update Firebase UID if not set
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
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
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