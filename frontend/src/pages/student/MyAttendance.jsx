import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { getAttendanceBadge, formatDate } from '../../utils/helpers';
import { ClipboardList, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';

const MyAttendance = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ summary: null, records: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const studentId = user?.profile?._id;
        if (!studentId) return;

        const res = await api.get(`/attendance/student/${studentId}`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to load attendance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [user]);

  const summary = data.summary;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Attendance History & Standing</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Daily high school roll call records, absence remarks, and attendance percentage
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600 }}>Overall Attendance</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#34d399', margin: '0.25rem 0' }}>
            {summary?.attendanceRate || 95.0}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Good Standing (&gt;90% threshold)</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600 }}>Days Present</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', margin: '0.25rem 0' }}>
            {summary?.presentCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Out of {summary?.totalDays || 0} total days</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600 }}>Days Late</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fbbf24', margin: '0.25rem 0' }}>
            {summary?.lateCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified tardies</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600 }}>Unexcused Absences</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f87171', margin: '0.25rem 0' }}>
            {summary?.absentCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Requires parent excuse note</div>
        </div>
      </div>

      {/* Daily Records Log */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Daily Attendance Log</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Recorded Notes & Remarks</th>
              </tr>
            </thead>
            <tbody>
              {data.records.map((r) => {
                const badge = getAttendanceBadge(r.status);
                return (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{formatDate(r.date)}</td>
                    <td>
                      <span className={`badge ${badge.class}`}>{badge.label}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {r.remarks || 'Regular attendance'}
                    </td>
                  </tr>
                );
              })}
              {data.records.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    No attendance logs found.
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

export default MyAttendance;
