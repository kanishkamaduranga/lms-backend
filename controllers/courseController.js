const db = require('../db');

exports.createCourse = async (req, res) => {
  try {
    const { name, description, duration_minutes, start_date, end_date, tags, instructor_id, category_ids } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const [course] = await db('courses')
      .insert({ 
        name, 
        description, 
        duration_minutes, 
        start_date, 
        end_date, 
        tags: Array.isArray(tags) ? tags : [], 
        instructor_id: instructor_id || req.user?.userId || null 
      })
      .returning('*');

    if (Array.isArray(category_ids) && category_ids.length > 0) {
      const rows = category_ids.map(category_id => ({ course_id: course.id, category_id }));
      await db('course_categories').insert(rows).onConflict(['course_id','category_id']).ignore();
    }

    res.status(201).json({ course });
  } catch (error) {
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
};

exports.addContent = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { content_type, content_text, file_url, metadata, position } = req.body;
    
    if (!content_type) return res.status(400).json({ message: 'Content type is required' });
    
    const [content] = await db('course_contents')
      .insert({ 
        course_id, 
        content_type, 
        content_text, 
        file_url, 
        metadata: metadata || {}, 
        position: position || 0 
      })
      .returning('*');
    
    res.status(201).json({ content });
  } catch (error) {
    res.status(500).json({ message: 'Error adding content', error: error.message });
  }
};

exports.listCourses = async (req, res) => {
  try {
    const rows = await db('courses as c')
      .leftJoin('course_categories as cc', 'cc.course_id', 'c.id')
      .leftJoin('categories as cat', 'cat.id', 'cc.category_id')
      .select('c.*')
      .select(
        db.raw(
          "COALESCE(json_agg(DISTINCT jsonb_build_object('id', cat.id, 'name', cat.name, 'parent_id', cat.parent_id, 'position', cat.position)) FILTER (WHERE cat.id IS NOT NULL), '[]') as categories"
        )
      )
      .groupBy('c.id');

    res.json({ courses: rows });
  } catch (error) {
    res.status(500).json({ message: 'Error listing courses', error: error.message });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await db('courses').where({ id }).first();
    
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    const categories = await db('course_categories')
      .where({ course_id: id })
      .join('categories', 'categories.id', 'course_categories.category_id')
      .select('categories.*');
    
    const contents = await db('course_contents')
      .where({ course_id: id })
      .orderBy('position');
    
    res.json({ course, categories, contents });
  } catch (error) {
    res.status(500).json({ message: 'Error getting course', error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration_minutes, start_date, end_date, tags, category_ids } = req.body;
    
    const [course] = await db('courses')
      .where({ id })
      .update({ 
        name, 
        description, 
        duration_minutes, 
        start_date, 
        end_date, 
        tags: Array.isArray(tags) ? tags : [] 
      })
      .returning('*');
    
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    if (Array.isArray(category_ids)) {
      await db('course_categories').where({ course_id: id }).del();
      const rows = category_ids.map(category_id => ({ course_id: id, category_id }));
      if (rows.length) await db('course_categories').insert(rows);
    }
    
    res.json({ course });
  } catch (error) {
    res.status(500).json({ message: 'Error updating course', error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db('courses').where({ id }).del();
    
    if (!deleted) return res.status(404).json({ message: 'Course not found' });
    
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course', error: error.message });
  }
};
