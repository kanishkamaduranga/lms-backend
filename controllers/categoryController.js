const db = require('../db');


exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parent_id, position } = req.body;

    if (!name) return res.status(400).json({ message: 'Name is required' });
    
    const [category] = await db('categories')
      .where({ id })
      .update({ name, parent_id: parent_id || null, position: position || 0 })
      .returning('*');
    
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    res.status(201).json({ category });

  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, parent_id, position } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    
    const [category] = await db('categories')
      .insert({ name, parent_id: parent_id || null, position: position || 0 })
      .returning('*');
    
    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

exports.renameCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    
    const [category] = await db('categories')
      .where({ id })
      .update({ name })
      .returning('*');
    
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    res.json({ category });
  } catch (error) {
    res.status(500).json({ message: 'Error renaming category', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db('categories').where({ id }).del();
    
    if (!deleted) return res.status(404).json({ message: 'Category not found' });
    
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

exports.reorderCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { position } = req.body;
    
    const [category] = await db('categories')
      .where({ id })
      .update({ position })
      .returning('*');
    
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    res.json({ category });
  } catch (error) {
    res.status(500).json({ message: 'Error reordering category', error: error.message });
  }
};

exports.listCategories = async (req, res) => {
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
    const totalCount = await db('categories').count('* as count').first();

    // Get paginated categories
    const categories = await db('categories')
      .orderBy([{ column: 'parent_id', order: 'asc' }, { column: 'position', order: 'asc' }])
      .limit(limit)
      .offset(offset);
    
    // Calculate pagination metadata
    const total = parseInt(totalCount.count);
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({ 
      categories,
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
    res.status(500).json({ message: 'Error listing categories', error: error.message });
  }
};
