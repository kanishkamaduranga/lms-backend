const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await db('users').where({ email }).first();
  if (existing) return res.status(400).json({ message: 'Email already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await db('users')
    .insert({ name, email, password: hashedPassword })
    .returning(['id', 'name', 'email']);

  res.status(201).json({ user });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await db('users').where({ email }).first();

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};
