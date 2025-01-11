const jwt =require('jsonwebtoken');

// Generate JWT token for the user
const generateToken = (id) => {
  return jwt.sign({ id }, 'VIDEO_CALL', {
    expiresIn: '30d',
  });
};

module.exports =  generateToken;
