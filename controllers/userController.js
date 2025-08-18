const db = require('../db');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
  const { full_name, username, email, password, role, department_group } = req.body;

  const existingEmail = await db('users').where({ email }).first();
  if (existingEmail) return res.status(400).json({ message: 'Email already exists' });

  const existingUsername = await db('users').where({ username }).first();
  if (existingUsername) return res.status(400).json({ message: 'Username already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await db('users')
    .insert({ full_name, username, email, password: hashedPassword, role, department_group })
    .returning('*');

  res.status(201).json({ user });
};

exports.getAllUsers = async (req, res) => {
  const users = await db('users').select('*');
  res.json({ users });
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  const user = await db('users').where({ id }).first();
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { full_name, username, email, role, department_group } = req.body;

  const [user] = await db('users')
    .where({ id })
    .update({ full_name, username, email, role, department_group })
    .returning('*');

  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
};

exports.suspendUser = async (req, res) => {
  const { id } = req.params;
  const { suspension_date, reactivation_date } = req.body;

  const enrollment_status = suspension_date ? 'Suspended' : 'Active';

  const [user] = await db('users')
    .where({ id })
    .update({ enrollment_status, suspension_date, reactivation_date })
    .returning('*');

  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const deleted = await db('users').where({ id }).del();
  if (!deleted) return res.status(404).json({ message: 'User not found' });
  res.status(204).send();
};
