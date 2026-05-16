const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    email = email.trim().toLowerCase();
    console.log(`[AUTH] Attempting signup for email: ${email}`);

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.warn(`[AUTH] Signup failed: User already exists (${email})`);
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });

    if (user) {
      console.log(`[AUTH] Signup successful for: ${email}`);
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(`[AUTH] Server Error during signup:`, error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    email = email.trim().toLowerCase();
    console.log(`[AUTH] Attempting login for email: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`[AUTH] Login failed: User not found (${email})`);
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[AUTH] Login failed: Incorrect password for (${email})`);
      return res.status(401).json({ message: 'Incorrect password' });
    }

    console.log(`[AUTH] Login successful for: ${email}`);
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(`[AUTH] Server Error during login:`, error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    let { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Please provide email and new password' });
    }

    email = email.trim().toLowerCase();
    console.log(`[AUTH] Attempting password reset for email: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`[AUTH] Reset failed: User not found (${email})`);
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    console.log(`[AUTH] Password reset successful for: ${email}`);
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(`[AUTH] Server Error during password reset:`, error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = { registerUser, loginUser, resetPassword, getMe };
