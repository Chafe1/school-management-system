import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import {
  Users,
  GraduationCap,
  Calendar,
  Layers,
  Award,
  ArrowUpRight,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [grades, setGrades] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, gradesRes, enrollRes] = await Promise.all([
          api.get('/reports/dashboard-stats'),
          api.get('/grades'),
          api.get('/enrollments')
        ]);
        setStats(statsRes.data.stats);
        setGrades(gradesRes.data.grades);
        setEnrollments(enrollRes.data.enrollments);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>High School Administration</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Comprehensive institutional oversight for Grades 9 through 12
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/enrollments" className="btn btn-primary btn-sm">
            <UserCheck size={16} />
            <span>Manage Enrollments</span>
          </Link>
          <Link to="/admin/timetable" className="btn btn-secondary btn-sm">
            <Calendar size={16} />
            <span>Schedule Timetable</span>
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid-stats">
        <StatCard
          title="Total Students Enrolled"
          value={stats?.totalStudents || 0}
          subtitle="Grades 9–12 high schoolers"
          icon={Users}
        />
        <StatCard
          title="Faculty Members"
          value={stats?.totalTeachers || 0}
          subtitle="Department teachers"
          icon={GraduationCap}
        />
        <StatCard
          title="Academic Grade Levels"
          value="4"
          subtitle="Freshman, Soph, Junior, Senior"
          icon={Layers}
        />
        <StatCard
          title="Average Attendance Rate"
          value={`${stats?.overallAttendanceRate || 96.5}%`}
          subtitle="High school institutional average"
          icon={TrendingUp}
        />
      </div>

      {/* Middle Layout: High School Cohort Breakdown & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Cohort Distribution */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>High School Cohort Distribution (Grades 9–12)</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Academic Year 2025–2026</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
            {grades.map((g) => {
              const count = enrollments.filter(e => e.gradeId?._id === g._id || e.gradeId?.level === g.level).length;
              return (
                <div
                  key={g._id}
                  style={{
                    padding: '1.25rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {g.name}
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-primary)', margin: '0.5rem 0' }}>
                    {count}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Active Students
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="var(--accent-primary)" />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Curriculum standards configured: 4 core cohorts, weighted high school GPA calculations (4.0 scale), period conflict validation active.
            </div>
          </div>
        </div>

        {/* Quick Management Hub */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Quick Admin Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to="/admin/users"
              className="glass-panel-interactive"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: '#fff',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={18} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Create / Manage Users</span>
              </div>
              <ArrowUpRight size={16} color="var(--text-dim)" />
            </Link>

            <Link
              to="/admin/academic"
              className="glass-panel-interactive"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: '#fff',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Layers size={18} color="#8b5cf6" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Subjects & Sections</span>
              </div>
              <ArrowUpRight size={16} color="var(--text-dim)" />
            </Link>

            <Link
              to="/admin/exams"
              className="glass-panel-interactive"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: '#fff',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Award size={18} color="#10b981" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Exam Timetables</span>
              </div>
              <ArrowUpRight size={16} color="var(--text-dim)" />
            </Link>
          </div>
        </div>
      </div>

      {/* Active Enrollments Preview */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Recently Enrolled High School Students</h3>
          <Link to="/admin/enrollments" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
            View Full Class Rosters →
          </Link>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Enrollment No</th>
                <th>Student Name</th>
                <th>Grade Level</th>
                <th>Section</th>
                <th>Academic Year</th>
                <th>Enrollment Status</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.slice(0, 5).map((e) => (
                <tr key={e._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                    {e.studentId?.enrollmentNo || 'ENR-GEN'}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {e.studentId?.userId?.firstName} {e.studentId?.userId?.lastName}
                  </td>
                  <td>{e.gradeId?.name}</td>
                  <td>Section {e.sectionId?.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{e.academicYearId?.name}</td>
                  <td>
                    <span className="badge badge-present">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
