const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
const register = async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;

    // Already exists check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered!' });
    }

    // Role decide
    let role = 'student';
    if (adminCode) {
      if (adminCode !== process.env.ADMIN_SECRET_CODE) {
        return res.status(400).json({ message: 'Invalid admin secret code!' });
      }
      role = 'admin';
    }

    // Password encrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // User create
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({ message: 'User registered successfully!', user });

  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // User check
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password!' });
    }

    // Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password!' });
    }

    // Token create
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

module.exports = { register, login };