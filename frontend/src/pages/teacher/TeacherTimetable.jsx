import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { getDayName } from '../../utils/helpers';
import { Calendar, Clock, MapPin } from 'lucide-react';

const TeacherTimetable = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const teacherId = user?.profile?._id;
        const res = await api.get('/timetable/slots', {
          params: teacherId ? { teacherId } : {}
        });
        setSlots(res.data.slots);
      } catch (err) {
        console.error('Failed to load teacher timetable:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [user]);

  const days = [1, 2, 3, 4, 5];
  const periods = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Teaching Schedule</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Weekly instructional commitments across secondary school classes
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <div style={{ minWidth: '850px' }}>
          {/* Header Days */}
          <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(5, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', padding: '0.5rem' }}>
              Period
            </div>
            {days.map(d => (
              <div
                key={d}
                style={{
                  padding: '0.65rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  color: '#fff',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {getDayName(d)}
              </div>
            ))}
          </div>

          {/* Period Rows */}
          {periods.map(periodNum => (
            <div
              key={periodNum}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px repeat(5, 1fr)',
                gap: '0.75rem',
                marginBottom: '0.75rem',
                alignItems: 'stretch'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(15, 21, 35, 0.85)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.5rem'
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-primary)' }}>
                  P{periodNum}
                </div>
              </div>

              {days.map(dayNum => {
                const match = slots.find(s => s.dayOfWeek === dayNum && s.period === periodNum);
                return (
                  <div
                    key={`${dayNum}-${periodNum}`}
                    style={{
                      minHeight: '85px',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: match ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.015)',
                      border: match ? '1px solid rgba(99, 102, 241, 0.35)' : '1px dashed rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    {match ? (
                      <>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
                            {match.subjectId?.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                            {match.gradeId?.name} • Sec {match.sectionId?.name}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.3rem' }}>
                          {match.classroom} • {match.startTime} - {match.endTime}
                        </div>
                      </>
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                        Planning Period
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherTimetable;
