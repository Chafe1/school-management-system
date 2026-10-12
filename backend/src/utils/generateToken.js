const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required in production.');
  }

  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'school_management_super_secret_jwt_key_2026',
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;
