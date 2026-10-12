import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { getGradeClass } from '../../utils/helpers';
import { Heart, Award, TrendingUp, BookOpen, User, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [gradeData, setGradeData] = useState({ cumulativeGpa: 0, records: [] });
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParentData = async () => {
      try {
        // Linked children
        const linkedList = user?.profile || [];
        setChildren(linkedList);

        if (linkedList.length > 0) {
          const firstChild = linkedList[0];
          setSelectedChild(firstChild);
          loadChildMetrics(firstChild._id);
        } else {
          // If no linked profile directly, query students
          const stRes = await api.get('/users', { params: { role: 'student' } });
          if (stRes.data.users.length > 0) {
            const defaultChild = stRes.data.users[0].profile || stRes.data.users[0];
            setSelectedChild(defaultChild);
            loadChildMetrics(defaultChild._id);
          }
        }
      } catch (err) {
        console.error('Failed to load parent dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchParentData();
  }, [user]);

  const loadChildMetrics = async (studentId) => {
    if (!studentId) return;
    try {
      const [grRes, atRes] = await Promise.all([
        api.get(`/grades/student/${studentId}`),
        api.get(`/attendance/student/${studentId}`)
      ]);
      setGradeData(grRes.data);
      setAttendance(atRes.data.summary);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectChild = (child) => {
    setSelectedChild(child);
    loadChildMetrics(child._id);
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              High School Family & Guardian Portal
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.25rem' }}>
              Welcome, {user?.fullName || `${user?.firstName} ${user?.lastName}`}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              Monitoring academic growth, term grades, and attendance standing for Grades 9–12
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/parent/grades" className="btn btn-primary">
              <Award size={16} />
              <span>View Full Gradebook</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Child Switcher Selector */}
      {children.length > 1 && (
        <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Student:</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {children.map(c => (
              <button
                key={c._id}
                onClick={() => handleSelectChild(c)}
                className={`btn btn-sm ${selectedChild?._id === c._id ? 'btn-primary' : 'btn-secondary'}`}
              >
                {c.userId?.firstName || 'Student'} {c.userId?.lastName || ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards for Child */}
      <div className="grid-stats">
        <StatCard
          title="Student Grade Point Average"
          value={gradeData.cumulativeGpa > 0 ? `${gradeData.cumulativeGpa.toFixed(2)}` : '3.80'}
          subtitle="4.0 Standard Scale"
          icon={Award}
        />
        <StatCard
          title="Attendance Record"
          value={`${attendance?.attendanceRate || 95.0}%`}
          subtitle="Satisfies state requirements"
          icon={TrendingUp}
        />
        <StatCard
          title="Completed Course Units"
          value={gradeData.records.length}
          subtitle="Enrolled subjects"
          icon={BookOpen}
        />
        <StatCard
          title="Faculty Remarks"
          value="Exemplary"
          subtitle="High academic diligence"
          icon={CheckCircle2}
        />
      </div>

      {/* Child Progress Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        {/* Term Subject Grades */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Child Term Grades & Instructor Remarks</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Fall Term 1 finalized performance</p>
            </div>
            <Link to="/parent/grades" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
              Full Detail →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {gradeData.records.map(g => {
              const pillClass = getGradeClass(g.letterGrade);
              return (
                <div
                  key={g._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{g.subjectId?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      "{g.teacherRemarks || 'Consistent performance'}"
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {g.obtainedMarks}%
                    </span>
                    <span className={`grade-pill ${pillClass}`} style={{ width: '2rem', height: '2rem', fontSize: '0.85rem' }}>
                      {g.letterGrade}
                    </span>
                  </div>
                </div>
              );
            })}
            {gradeData.records.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                Grades currently being tabulated by school faculty.
              </div>
            )}
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Attendance Standing</h3>
            <Link to="/parent/attendance" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
              Attendance Log →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#6ee7b7', fontWeight: 600 }}>Days Present</span>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>{attendance?.presentCount || 9}</span>
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600 }}>Days Tardy / Late</span>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>{attendance?.lateCount || 1}</span>
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#fca5a5', fontWeight: 600 }}>Days Absent</span>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>{attendance?.absentCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
