const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

exports.register = async (req, res) => {
  const { full_name, username, email, password, role } = req.body;

  const existingEmail = await db('users').where({ email }).first();
  if (existingEmail) return res.status(400).json({ message: 'Email already exists' });

  const existingUsername = await db('users').where({ username }).first();
  if (existingUsername) return res.status(400).json({ message: 'Username already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await db('users')
    .insert({ full_name, username, email, password: hashedPassword, role })
    .returning(['id', 'full_name', 'username', 'email', 'role']);

  res.status(201).json({ user });
};

// Updated login logic to allow login with either email or username
exports.login = async (req, res) => {
  const { identifier, password } = req.body;
  // Try to find user by email or username
  const user = await db('users')
    .where('email', identifier)
    .orWhere('username', identifier)
    .first();

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  await db('users').where({ id: user.id }).update({ last_login_date: new Date() });

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};
