export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getDayName = (dayNumber) => {
  const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[dayNumber] || `Day ${dayNumber}`;
};

export const getGradeClass = (letterGrade) => {
  if (!letterGrade) return 'grade-pill-c';
  const first = letterGrade.charAt(0).toUpperCase();
  switch (first) {
    case 'A': return 'grade-pill-a';
    case 'B': return 'grade-pill-b';
    case 'C': return 'grade-pill-c';
    case 'D': return 'grade-pill-d';
    case 'F': return 'grade-pill-f';
    default: return 'grade-pill-c';
  }
};

export const getAttendanceBadge = (status) => {
  switch (status?.toLowerCase()) {
    case 'present': return { label: 'Present', class: 'badge-present' };
    case 'absent': return { label: 'Absent', class: 'badge-absent' };
    case 'late': return { label: 'Late', class: 'badge-late' };
    case 'excused': return { label: 'Excused', class: 'badge-excused' };
    default: return { label: status, class: 'badge-present' };
  }
};

export const getRoleBadge = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin': return { label: 'Admin', class: 'badge-role-admin' };
    case 'teacher': return { label: 'Faculty', class: 'badge-role-teacher' };
    case 'student': return { label: 'Student', class: 'badge-role-student' };
    case 'parent': return { label: 'Parent / Guardian', class: 'badge-role-parent' };
    default: return { label: role, class: 'badge-role-student' };
  }
};
