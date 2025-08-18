const db = require('../db');

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
    const categories = await db('categories')
      .orderBy([{ column: 'parent_id', order: 'asc' }, { column: 'position', order: 'asc' }]);
    
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Error listing categories', error: error.message });
  }
};
