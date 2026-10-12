const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent'
};

const PERMISSIONS = {
  [ROLES.ADMIN]: ['all'],
  [ROLES.TEACHER]: ['manage_classes', 'mark_attendance', 'grade_entry', 'create_assignments', 'view_timetable'],
  [ROLES.STUDENT]: ['view_timetable', 'view_grades', 'view_attendance', 'submit_assignments', 'view_report_card'],
  [ROLES.PARENT]: ['view_child_progress', 'view_child_grades', 'view_child_attendance', 'view_child_report_card']
};

module.exports = {
  ROLES,
  PERMISSIONS
};
