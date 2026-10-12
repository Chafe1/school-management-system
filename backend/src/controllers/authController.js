const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const generateToken = require('../utils/generateToken');

const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

// @desc Register user
// @route POST /api/v1/auth/register
const register = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, phone, address, employeeId, qualification } = req.body;

    if (!password || !passwordStrengthRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
      });
    }

    if (role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Students must be registered by the school administration.'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      email,
      password,
      role: role || 'student',
      firstName,
      lastName,
      contact: { phone, address }
    });

    let extraProfile = null;
    if (user.role === 'student') {
      const enrollmentNo = 'ENR-' + Date.now().toString().slice(-6);
      extraProfile = await Student.create({
        userId: user._id,
        enrollmentNo
      });
    } else if (user.role === 'teacher') {
      const empId = employeeId || 'EMP-' + Date.now().toString().slice(-4);
      extraProfile = await Teacher.create({
        userId: user._id,
        employeeId: empId,
        qualification: qualification || 'B.Ed'
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        contact: user.contact,
        profile: extraProfile
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Login user
// @route POST /api/v1/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    let extraProfile = null;
    if (user.role === 'student') {
      extraProfile = await Student.findOne({ userId: user._id }).populate('parentIds', 'firstName lastName email contact');
    } else if (user.role === 'teacher') {
      extraProfile = await Teacher.findOne({ userId: user._id }).populate('subjects');
    } else if (user.role === 'parent') {
      // Find students linked to this parent
      extraProfile = await Student.find({ parentIds: user._id }).populate('userId', 'firstName lastName email');
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        contact: user.contact,
        profilePicture: user.profilePicture,
        profile: extraProfile
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get current authenticated user
// @route GET /api/v1/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let extraProfile = null;

    if (user.role === 'student') {
      extraProfile = await Student.findOne({ userId: user._id }).populate('parentIds', 'firstName lastName email contact');
    } else if (user.role === 'teacher') {
      extraProfile = await Teacher.findOne({ userId: user._id }).populate('subjects');
    } else if (user.role === 'parent') {
      extraProfile = await Student.find({ parentIds: user._id }).populate('userId', 'firstName lastName email');
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        contact: user.contact,
        profilePicture: user.profilePicture,
        profile: extraProfile
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  register,
  login,
  getMe
};
