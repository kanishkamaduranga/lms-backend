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
    const totalCount = await db('courses').count('* as count').first();

    // Get paginated courses
    const courses = await db('courses')
      .orderBy('created_at', 'desc') // or any other ordering you prefer
      .limit(limit)
      .offset(offset);
    
    // If no courses found, return empty response
    if (courses.length === 0) {
      return res.json({ 
        courses: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null
        }
      });
    }

    // Get course IDs for batch querying categories
    const courseIds = courses.map(course => course.id);

    // Get all course-category relationships for the paginated courses
    const courseCategories = await db('course_categories')
      .whereIn('course_categories.course_id', courseIds)
      .join('categories', 'categories.id', 'course_categories.category_id')
      .select(
        'course_categories.course_id',
        'categories.id',
        'categories.name',
        'categories.parent_id',
        'categories.position'
      );
    
    // Group categories by course_id
    const categoriesByCourse = {};
    courseCategories.forEach(cc => {
      if (!categoriesByCourse[cc.course_id]) {
        categoriesByCourse[cc.course_id] = [];
      }
      categoriesByCourse[cc.course_id].push({
        id: cc.id,
        name: cc.name,
        parent_id: cc.parent_id,
        position: cc.position
      });
    });
    
    // Add categories to each course
    const coursesWithCategories = courses.map(course => ({
      ...course,
      categories: categoriesByCourse[course.id] || []
    }));

    // Calculate pagination metadata
    const total = parseInt(totalCount.count);
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({ 
      courses: coursesWithCategories,
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
