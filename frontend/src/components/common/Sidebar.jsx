import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Layers,
  UserCheck,
  Calendar,
  ClipboardList,
  Award,
  BookOpen,
  FileText,
  Clock,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  const adminLinks = [
    { to: '/admin', label: 'Admin Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/academic', label: 'Academic Structure', icon: Layers },
    { to: '/admin/enrollments', label: 'Enrollments & Rollover', icon: UserCheck },
    { to: '/admin/timetable', label: 'Timetable Scheduling', icon: Calendar },
    { to: '/admin/exams', label: 'Examinations', icon: ShieldCheck }
  ];

  const teacherLinks = [
    { to: '/teacher', label: 'Teacher Dashboard', icon: LayoutDashboard },
    { to: '/teacher/attendance', label: 'Mark Attendance', icon: ClipboardList },
    { to: '/teacher/grades', label: 'Gradebook Entry', icon: Award },
    { to: '/teacher/assignments', label: 'Assignments', icon: BookOpen },
    { to: '/teacher/timetable', label: 'My Teaching Schedule', icon: Clock }
  ];

  const studentLinks = [
    { to: '/student', label: 'Student Dashboard', icon: LayoutDashboard },
    { to: '/student/timetable', label: 'My Timetable', icon: Calendar },
    { to: '/student/grades', label: 'Grades & Report Card', icon: Award },
    { to: '/student/attendance', label: 'Attendance History', icon: ClipboardList },
    { to: '/student/assignments', label: 'Assignments', icon: BookOpen }
  ];

  const parentLinks = [
    { to: '/parent', label: 'Child Overview', icon: LayoutDashboard },
    { to: '/parent/grades', label: 'Grades & Remarks', icon: Award },
    { to: '/parent/attendance', label: 'Attendance Records', icon: ClipboardList }
  ];

  let links = [];
  if (role === 'admin') links = adminLinks;
  else if (role === 'teacher') links = teacherLinks;
  else if (role === 'student') links = studentLinks;
  else if (role === 'parent') links = parentLinks;

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#0c101a',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 70px)'
      }}
    >
      <div style={{ padding: '1.5rem 1rem 0.5rem 1rem' }}>
        <div
          style={{
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-dim)',
            paddingLeft: '0.75rem',
            marginBottom: '0.75rem',
            fontWeight: 700
          }}
        >
          Navigation Menu
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0 0.75rem', flex: 1 }}>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/teacher' || item.to === '/student' || item.to === '/parent'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? '#fff' : 'var(--text-muted)',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.15s ease'
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* High school badge footer in sidebar */}
      <div
        style={{
          padding: '1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          margin: '0.75rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <GraduationCap size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>Grades 9–12 Academic</span>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          High school standard GPA 4.0 weighted system
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
