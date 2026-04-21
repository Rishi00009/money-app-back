const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');

  // DEBUG LOGS - Check your terminal!
  console.log("Token received:", token ? "YES" : "NO");

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.log("Token verification failed:", err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};