module.exports = (req, res, next) => {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'Instructor')) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: Admins or Instructors only' });
};
