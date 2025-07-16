const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log('[DEBUG] Incoming Authorization Header:', authHeader);

  if (!authHeader) {
    console.log('[DEBUG] No Authorization header found');
    return res.status(403).json({ error: 'No token provided' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.log('[DEBUG] Invalid Authorization header format');
    return res.status(403).json({ error: 'Invalid token format' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[DEBUG] Token decoded:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('[DEBUG] Token verification failed:', err.message);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
