import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AcademicSetup from './pages/admin/AcademicSetup';
import EnrollmentManager from './pages/admin/EnrollmentManager';
import TimetableManager from './pages/admin/TimetableManager';
import ExamManager from './pages/admin/ExamManager';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AttendanceMarking from './pages/teacher/AttendanceMarking';
import GradeEntry from './pages/teacher/GradeEntry';
import AssignmentsPage from './pages/teacher/AssignmentsPage';
import TeacherTimetable from './pages/teacher/TeacherTimetable';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyTimetable from './pages/student/MyTimetable';
import MyGrades from './pages/student/MyGrades';
import MyAttendance from './pages/student/MyAttendance';
import MyAssignments from './pages/student/MyAssignments';

// Parent Pages
import ParentDashboard from './pages/parent/ParentDashboard';
import ChildProgress from './pages/parent/ChildProgress';
import ChildAttendance from './pages/parent/ChildAttendance';

const HomeRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  switch (user?.role) {
    case 'admin': return <Navigate to="/admin" replace />;
    case 'teacher': return <Navigate to="/teacher" replace />;
    case 'student': return <Navigate to="/student" replace />;
    case 'parent': return <Navigate to="/parent" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/" element={<HomeRedirect />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/academic" element={<AcademicSetup />} />
              <Route path="/admin/enrollments" element={<EnrollmentManager />} />
              <Route path="/admin/timetable" element={<TimetableManager />} />
              <Route path="/admin/exams" element={<ExamManager />} />
            </Route>
          </Route>

          {/* Teacher Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/attendance" element={<AttendanceMarking />} />
              <Route path="/teacher/grades" element={<GradeEntry />} />
              <Route path="/teacher/assignments" element={<AssignmentsPage />} />
              <Route path="/teacher/timetable" element={<TeacherTimetable />} />
            </Route>
          </Route>

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/timetable" element={<MyTimetable />} />
              <Route path="/student/grades" element={<MyGrades />} />
              <Route path="/student/attendance" element={<MyAttendance />} />
              <Route path="/student/assignments" element={<MyAssignments />} />
            </Route>
          </Route>

          {/* Parent Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['parent', 'admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/parent" element={<ParentDashboard />} />
              <Route path="/parent/grades" element={<ChildProgress />} />
              <Route path="/parent/attendance" element={<ChildAttendance />} />
            </Route>
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
