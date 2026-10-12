import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ClipboardList, CheckCircle2, UserCheck, Calendar, Check, AlertTriangle } from 'lucide-react';

const AttendanceMarking = () => {
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { [studentId]: { status, remarks } }
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Load Grades and Sections
  useEffect(() => {
    const init = async () => {
      try {
        const [gRes, secRes] = await Promise.all([
          api.get('/grades'),
          api.get('/sections')
        ]);
        setGrades(gRes.data.grades);
        setSections(secRes.data.sections);

        // Default to Grade 10 Section A
        const g10 = gRes.data.grades.find(g => g.level === 10) || gRes.data.grades[0];
        if (g10) {
          setSelectedGrade(g10._id);
          const secA = secRes.data.sections.find(s => s.name === 'A' && (s.gradeId?._id === g10._id || s.gradeId === g10._id)) || secRes.data.sections[0];
          if (secA) setSelectedSection(secA._id);
        }
      } catch (err) {
        console.error('Failed to load classes:', err);
      }
    };
    init();
  }, []);

  // Fetch Class Roster & Existing Attendance for date
  useEffect(() => {
    const fetchClassStudents = async () => {
      if (!selectedGrade || !selectedSection) return;
      try {
        const [enrollRes, attendRes] = await Promise.all([
          api.get('/enrollments', { params: { gradeId: selectedGrade, sectionId: selectedSection } }),
          api.get(`/attendance/class/${selectedGrade}/${selectedSection}`, { params: { date: attendanceDate } })
        ]);

        const roster = enrollRes.data.enrollments;
        setStudents(roster);

        const newMap = {};
        const existingRecords = attendRes.data.records || [];

        roster.forEach(en => {
          const sId = en.studentId?._id;
          const match = existingRecords.find(r => r.studentId?._id === sId || r.studentId === sId);
          newMap[sId] = {
            status: match ? match.status : 'present',
            remarks: match ? match.remarks : ''
          };
        });

        setAttendanceMap(newMap);
      } catch (err) {
        console.error('Failed to fetch class roster:', err);
      }
    };
    fetchClassStudents();
  }, [selectedGrade, selectedSection, attendanceDate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  // One-click bulk action
  const markAll = (status) => {
    const updated = {};
    Object.keys(attendanceMap).forEach(id => {
      updated[id] = { ...attendanceMap[id], status };
    });
    setAttendanceMap(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');

    try {
      const records = Object.keys(attendanceMap).map(studentId => ({
        studentId,
        status: attendanceMap[studentId].status,
        remarks: attendanceMap[studentId].remarks
      }));

      const res = await api.post('/attendance/mark', {
        gradeId: selectedGrade,
        sectionId: selectedSection,
        date: attendanceDate,
        records
      });

      setFeedback(res.data.message || 'Attendance saved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  // Counters
  const presentCount = Object.values(attendanceMap).filter(v => v.status === 'present').length;
  const absentCount = Object.values(attendanceMap).filter(v => v.status === 'absent').length;
  const lateCount = Object.values(attendanceMap).filter(v => v.status === 'late').length;
  const excusedCount = Object.values(attendanceMap).filter(v => v.status === 'excused').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Daily Attendance Roster</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            High school period roll call with instant status tracking and parent notification logs
          </p>
        </div>
      </div>

      {feedback && (
        <div style={{ padding: '0.85rem 1rem', marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Class and Date Selector Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: '220px' }}
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(e.target.value);
              const related = sections.find(s => s.gradeId?._id === e.target.value || s.gradeId === e.target.value);
              if (related) setSelectedSection(related._id);
            }}
          >
            {grades.map(g => (
              <option key={g._id} value={g._id}>{g.name}</option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: '180px' }}
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            {sections
              .filter(s => s.gradeId?._id === selectedGrade || s.gradeId === selectedGrade)
              .map(s => (
                <option key={s._id} value={s._id}>Section {s.name}</option>
              ))}
          </select>

          <input
            type="date"
            className="form-input"
            style={{ width: '170px' }}
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </div>

        {/* Quick Batch Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => markAll('present')}
            className="btn btn-secondary btn-sm"
            style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}
          >
            <Check size={14} />
            <span>Mark All Present</span>
          </button>
        </div>
      </div>

      {/* Status Counters Strip */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Present</span>
          <span className="badge badge-present" style={{ fontSize: '0.9rem' }}>{presentCount}</span>
        </div>
        <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Absent</span>
          <span className="badge badge-absent" style={{ fontSize: '0.9rem' }}>{absentCount}</span>
        </div>
        <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Late</span>
          <span className="badge badge-late" style={{ fontSize: '0.9rem' }}>{lateCount}</span>
        </div>
        <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Excused</span>
          <span className="badge badge-excused" style={{ fontSize: '0.9rem' }}>{excusedCount}</span>
        </div>
      </div>

      {/* Attendance Sheet */}
      <form onSubmit={handleSubmit}>
        <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Enrollment No</th>
                  <th>Student Name</th>
                  <th>Attendance Status</th>
                  <th>Teacher Remarks</th>
                </tr>
              </thead>
              <tbody>
                {students.map((en) => {
                  const sId = en.studentId?._id;
                  const currentStatus = attendanceMap[sId]?.status || 'present';
                  const currentRemarks = attendanceMap[sId]?.remarks || '';

                  return (
                    <tr key={en._id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                        {en.studentId?.enrollmentNo || 'ENR-TBD'}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {en.studentId?.userId?.firstName} {en.studentId?.userId?.lastName}
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', gap: '0.35rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
                          {[
                            { id: 'present', label: 'Present', color: '#10b981' },
                            { id: 'absent', label: 'Absent', color: '#ef4444' },
                            { id: 'late', label: 'Late', color: '#f59e0b' },
                            { id: 'excused', label: 'Excused', color: '#3b82f6' }
                          ].map(opt => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleStatusChange(sId, opt.id)}
                              style={{
                                padding: '0.35rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: currentStatus === opt.id ? opt.color : 'transparent',
                                color: currentStatus === opt.id ? '#fff' : 'var(--text-dim)',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                          placeholder="e.g. Verified by parent call, doctor note"
                          value={currentRemarks}
                          onChange={(e) => handleRemarksChange(sId, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                      No students enrolled in this section.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || students.length === 0}
            style={{ padding: '0.75rem 2rem' }}
          >
            {saving ? 'Saving...' : 'Save & Record Attendance'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceMarking;
