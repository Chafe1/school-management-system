const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

// @desc Get all users with optional role filter
// @route GET /api/v1/users
const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    // Fetch related details for teachers and students
    const usersWithProfiles = await Promise.all(
      users.map(async (u) => {
        let profile = null;
        if (u.role === 'student') {
          profile = await Student.findOne({ userId: u._id }).populate('parentIds', 'firstName lastName email');
        } else if (u.role === 'teacher') {
          profile = await Teacher.findOne({ userId: u._id }).populate('subjects');
        }
        return {
          ...u.toObject(),
          profile
        };
      })
    );

    res.json({ success: true, count: usersWithProfiles.length, users: usersWithProfiles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get user by ID
// @route GET /api/v1/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ userId: user._id }).populate('parentIds');
    } else if (user.role === 'teacher') {
      profile = await Teacher.findOne({ userId: user._id }).populate('subjects');
    }

    res.json({ success: true, user: { ...user.toObject(), profile } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create new user (Admin only)
// @route POST /api/v1/users
const createUser = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, phone, address, employeeId, qualification, subjects, enrollmentNo, parentIds } = req.body;

    if (!password || !passwordStrengthRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      email,
      password: password || 'Default@123',
      role,
      firstName,
      lastName,
      contact: { phone, address }
    });

    let profile = null;
    if (role === 'student') {
      profile = await Student.create({
        userId: user._id,
        enrollmentNo: enrollmentNo || 'ENR-' + Date.now().toString().slice(-6),
        parentIds: parentIds || []
      });
    } else if (role === 'teacher') {
      profile = await Teacher.create({
        userId: user._id,
        employeeId: employeeId || 'EMP-' + Date.now().toString().slice(-4),
        qualification: qualification || 'Master in Education',
        subjects: subjects || []
      });
    }

    res.status(201).json({ success: true, user: { ...user.toObject(), profile } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update user
// @route PUT /api/v1/users/:id
const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, isActive, qualification, subjects, parentIds } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.contact.phone = phone;
    if (address !== undefined) user.contact.address = address;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    let profile = null;
    if (user.role === 'teacher') {
      profile = await Teacher.findOneAndUpdate(
        { userId: user._id },
        { qualification, subjects },
        { new: true }
      );
    } else if (user.role === 'student') {
      profile = await Student.findOneAndUpdate(
        { userId: user._id },
        { parentIds },
        { new: true }
      );
    }

    res.json({ success: true, user: { ...user.toObject(), profile } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Delete user
// @route DELETE /api/v1/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'student') {
      await Student.deleteOne({ userId: user._id });
    } else if (user.role === 'teacher') {
      await Teacher.deleteOne({ userId: user._id });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Link parent to student
// @route POST /api/v1/users/:id/link-parent
const linkParent = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.params.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const { parentId } = req.body;
    if (!parentId) {
      return res.status(400).json({ success: false, message: 'Parent ID required' });
    }

    if (!student.parentIds.includes(parentId)) {
      student.parentIds.push(parentId);
      await student.save();
    }

    res.json({ success: true, message: 'Parent linked successfully', student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  linkParent
};
