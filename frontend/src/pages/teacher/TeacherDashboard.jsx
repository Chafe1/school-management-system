import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import {
  ClipboardList,
  Award,
  BookOpen,
  Clock,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const teacherId = user?.profile?._id;
        const [slotsRes, assignRes] = await Promise.all([
          api.get('/timetable/slots', { params: teacherId ? { teacherId } : {} }),
          api.get('/assignments')
        ]);
        setSlots(slotsRes.data.slots);
        setAssignments(assignRes.data.assignments);
      } catch (err) {
        console.error('Failed to load teacher dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherData();
  }, [user]);

  // Today's day of week (1: Monday .. 5: Friday)
  const jsDay = new Date().getDay();
  const todayDay = jsDay === 0 || jsDay === 6 ? 1 : jsDay; // default Monday if weekend
  const todayClasses = slots.filter(s => s.dayOfWeek === todayDay);

  return (
    <div>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Faculty Academic Workspace
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.25rem' }}>
              Welcome back, {user?.fullName || `${user?.firstName} ${user?.lastName}`}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              {user?.profile?.qualification || 'High School Faculty Instructor'} • Department of Mathematics & Sciences
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/teacher/attendance" className="btn btn-primary">
              <ClipboardList size={18} />
              <span>Mark Attendance</span>
            </Link>
            <Link to="/teacher/grades" className="btn btn-secondary">
              <Award size={18} />
              <span>Gradebook Entry</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-stats">
        <StatCard
          title="Scheduled Weekly Periods"
          value={slots.length}
          subtitle="Class sessions per week"
          icon={Clock}
        />
        <StatCard
          title="Active Course Assignments"
          value={assignments.length}
          subtitle="Homework, labs, and projects"
          icon={BookOpen}
        />
        <StatCard
          title="Grade Levels Instructed"
          value="Grades 9–12"
          subtitle="Secondary school curriculum"
          icon={Layers}
        />
        <StatCard
          title="Term Grade Progress"
          value="On Track"
          subtitle="Fall Term 1 submissions"
          icon={CheckCircle2}
        />
      </div>

      {/* Two Column Layout: Today's Schedule & Quick Grading Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        {/* Today's Classes */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Today's Scheduled Class Periods</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Classroom locations and period timings</p>
            </div>
            <Link to="/teacher/timetable" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
              Full Week →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {todayClasses.map(c => (
              <div
                key={c._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.9rem'
                    }}
                  >
                    P{c.period}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.subjectId?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {c.gradeId?.name} • Section {c.sectionId?.name} • Room: {c.classroom}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                    {c.startTime} – {c.endTime}
                  </div>
                  <Link
                    to="/teacher/attendance"
                    style={{ fontSize: '0.75rem', color: '#34d399', textDecoration: 'none', fontWeight: 600 }}
                  >
                    Take Roll →
                  </Link>
                </div>
              </div>
            ))}
            {todayClasses.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                No classes scheduled for today.
              </div>
            )}
          </div>
        </div>

        {/* Quick Assignments & Grading */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Recent Assignments</h3>
            <Link to="/teacher/assignments" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
              Manage →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {assignments.slice(0, 3).map(a => (
              <div
                key={a._id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{a.title}</div>
                  <span className="badge badge-late" style={{ fontSize: '0.65rem' }}>{a.type}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  {a.subjectId?.name} • Due: {new Date(a.dueDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
