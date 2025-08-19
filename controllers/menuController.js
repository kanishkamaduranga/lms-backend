const getMenuItems = (req, res) => {
  const baseMenu = [
    { title: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { title: 'Courses', path: '/courses', icon: 'book' },
    { title: 'Profile', path: '/profile', icon: 'user' }
  ];

  const adminMenu = [
    ...baseMenu,
    { title: 'Users', path: '/admin/users', icon: 'users' },
    { title: 'Categories', path: '/admin/categories', icon: 'folder' },
    { title: 'System Settings', path: '/admin/settings', icon: 'settings' }
  ];

  const instructorMenu = [
    ...baseMenu,
    { title: 'My Courses', path: '/instructor/courses', icon: 'book-open' },
    { title: 'Create Course', path: '/instructor/courses/new', icon: 'plus-circle' },
    { title: 'Analytics', path: '/instructor/analytics', icon: 'bar-chart' }
  ];

  const studentMenu = [
    ...baseMenu,
    { title: 'My Learning', path: '/learning', icon: 'monitor' },
    { title: 'Progress', path: '/progress', icon: 'trending-up' }
  ];

  if (!req.user) {
    return res.json({ menu: baseMenu });
  }

  switch (req.user.role) {
    case 'Admin':
      return res.json({ menu: adminMenu });
    case 'Instructor':
      return res.json({ menu: instructorMenu });
    default:
      return res.json({ menu: studentMenu });
  }
};

module.exports = { getMenuItems };