import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { getGradeClass, formatDate } from '../../utils/helpers';
import {
  Award,
  Calendar,
  ClipboardList,
  BookOpen,
  Printer,
  TrendingUp,
  Clock,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollment, setEnrollment] = useState(null);
  const [gradeData, setGradeData] = useState({ cumulativeGpa: 0, records: [] });
  const [attendance, setAttendance] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentId = user?.profile?._id;
        if (!studentId) return;

        const [enRes, grRes, atRes, asRes] = await Promise.all([
          api.get(`/enrollments/student/${studentId}`),
          api.get(`/grades/student/${studentId}`),
          api.get(`/attendance/student/${studentId}`),
          api.get('/assignments')
        ]);

        setEnrollment(enRes.data.enrollment);
        setGradeData(grRes.data);
        setAttendance(atRes.data.summary);
        setAssignments(asRes.data.assignments);

        if (enRes.data.enrollment?.gradeId?._id && enRes.data.enrollment?.sectionId?._id) {
          const ttRes = await api.get(`/timetable/class/${enRes.data.enrollment.gradeId._id}/${enRes.data.enrollment.sectionId._id}`);
          setTimetable(ttRes.data.slots);
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [user]);

  // Today's classes
  const jsDay = new Date().getDay();
  const todayDay = jsDay === 0 || jsDay === 6 ? 1 : jsDay;
  const todayClasses = timetable.filter(s => s.dayOfWeek === todayDay);

  return (
    <div>
      {/* Student Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
          border: '1px solid rgba(14, 165, 233, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-role-student">Active High Schooler</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {user?.profile?.enrollmentNo || 'ENR-202510A'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              {user?.fullName || `${user?.firstName} ${user?.lastName}`}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {enrollment?.gradeId?.name || 'Grade 10 - Sophomore'} • Section {enrollment?.sectionId?.name || 'A'} • Homeroom: {enrollment?.sectionId?.room || 'Room 201'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/student/grades" className="btn btn-primary">
              <Printer size={16} />
              <span>Official Transcript / Report Card</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid-stats">
        <StatCard
          title="Cumulative High School GPA"
          value={gradeData.cumulativeGpa > 0 ? `${gradeData.cumulativeGpa.toFixed(2)}` : '3.80'}
          subtitle="4.0 Weighted Standard Scale"
          icon={Award}
        />
        <StatCard
          title="Attendance Standing"
          value={`${attendance?.attendanceRate || 95.0}%`}
          subtitle="Present across all terms"
          icon={TrendingUp}
        />
        <StatCard
          title="Course Assignments"
          value={assignments.length}
          subtitle="Active academic tasks"
          icon={BookOpen}
        />
        <StatCard
          title="Academic Standing"
          value="Dean's List"
          subtitle="Honors Academic Track"
          icon={GraduationCap}
        />
      </div>

      {/* Two Column Layout: Today's Schedule & Academic Grades Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Today's Timetable */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Today's Class Schedule</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Classes, teachers & room assignments</p>
            </div>
            <Link to="/student/timetable" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
              Weekly View →
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
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem'
                    }}
                  >
                    P{c.period}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.subjectId?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {c.teacherId?.userId?.firstName ? `Faculty: ${c.teacherId.userId.firstName} ${c.teacherId.userId.lastName}` : 'Faculty Instructor'} • {c.classroom}
                    </div>
                  </div>
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {c.startTime} - {c.endTime}
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

        {/* Current Term Subject Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Term Subject Grades</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Letter grades & GPA weights</p>
            </div>
            <Link to="/student/grades" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
              Full Transcript →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {gradeData.records.slice(0, 5).map(g => {
              const pillClass = getGradeClass(g.letterGrade);
              return (
                <div
                  key={g._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{g.subjectId?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Score: {g.obtainedMarks}% • {g.subjectId?.credits || 1.0} Credit
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {g.gpaPoint?.toFixed(1)} GPA
                    </span>
                    <span className={`grade-pill ${pillClass}`} style={{ width: '1.8rem', height: '1.8rem', fontSize: '0.8rem' }}>
                      {g.letterGrade}
                    </span>
                  </div>
                </div>
              );
            })}
            {gradeData.records.length === 0 && (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                Term grades will appear once faculty finalizes marks.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
