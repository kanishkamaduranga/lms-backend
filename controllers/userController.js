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
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json({ message: 'Page must be greater than 0' });
    }
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ message: 'Limit must be between 1 and 100' });
    }

    // Get total count for pagination info
    const totalCount = await db('users').count('* as count').first();

    // Get paginated users
    const users = await db('users')
      .orderBy('created_at', 'desc') // or order by any other field you prefer
      .limit(limit)
      .offset(offset);

    // Calculate pagination metadata
    const total = parseInt(totalCount.count);
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({ 
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    // Validate role parameter
    const validRoles = ['Admin', 'Instructor', 'Student', 'Guest'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role parameter', 
        validRoles: validRoles 
      });
    }

    const users = await db('users')
      .where({ role })
      .select('id', 'full_name')
      .orderBy('full_name');
    
    res.json({ 
      message: `${role}s retrieved successfully`,
      count: users.length,
      role: role,
      users 
    });
  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    // The auth middleware should have attached the user ID to req.user
    const user = await db('users')
      .where({ id: req.user.userId })
      .first();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
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
