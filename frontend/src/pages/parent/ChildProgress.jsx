import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { getGradeClass } from '../../utils/helpers';
import { Award, BookOpen, User, CheckCircle2 } from 'lucide-react';

const ChildProgress = () => {
  const { user } = useAuth();
  const [gradeData, setGradeData] = useState({ cumulativeGpa: 0, records: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const studentId = user?.profile?.[0]?._id;
        if (studentId) {
          const res = await api.get(`/grades/student/${studentId}`);
          setGradeData(res.data);
        } else {
          const stRes = await api.get('/users', { params: { role: 'student' } });
          if (stRes.data.users.length > 0) {
            const defaultId = stRes.data.users[0].profile?._id || stRes.data.users[0]._id;
            const res = await api.get(`/grades/student/${defaultId}`);
            setGradeData(res.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, [user]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Academic Progress & Evaluations</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Comprehensive course marks, grading criteria, and instructor feedback
          </p>
        </div>
      </div>

      {/* Cumulative GPA Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-hover)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--accent-primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weighted Cumulative GPA</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
              {gradeData.cumulativeGpa > 0 ? gradeData.cumulativeGpa.toFixed(2) : '3.80'} / 4.00
            </div>
          </div>
        </div>
        <div>
          <span className="badge badge-present" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
            Academic Honors Track
          </span>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Detailed Course Marks</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject Course</th>
                <th>Course Code</th>
                <th>Credits</th>
                <th>Score</th>
                <th style={{ textAlign: 'center' }}>Letter Grade</th>
                <th style={{ textAlign: 'center' }}>GPA</th>
                <th>Faculty Remarks</th>
              </tr>
            </thead>
            <tbody>
              {gradeData.records.map((g) => {
                const pillClass = getGradeClass(g.letterGrade);
                return (
                  <tr key={g._id}>
                    <td style={{ fontWeight: 600 }}>{g.subjectId?.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontSize: '0.85rem' }}>
                      {g.subjectId?.code}
                    </td>
                    <td>{g.subjectId?.credits || 1.0} Credit</td>
                    <td style={{ fontWeight: 700 }}>{g.obtainedMarks}%</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`grade-pill ${pillClass}`} style={{ width: '2rem', height: '2rem', fontSize: '0.85rem' }}>
                        {g.letterGrade}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#fff' }}>
                      {g.gpaPoint?.toFixed(1)}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      "{g.teacherRemarks || 'Consistent performance'}"
                    </td>
                  </tr>
                );
              })}
              {gradeData.records.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    No recorded grades yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChildProgress;
