import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { getDayName } from '../../utils/helpers';
import { Calendar, Plus, Trash2, Clock, MapPin, User, AlertCircle } from 'lucide-react';

const TimetableManager = () => {
  const [slots, setSlots] = useState([]);
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isSlotModal, setIsSlotModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [slotForm, setSlotForm] = useState({
    academicYearId: '',
    dayOfWeek: 1,
    period: 1,
    startTime: '08:30',
    endTime: '09:20',
    subjectId: '',
    teacherId: '',
    gradeId: '',
    sectionId: '',
    classroom: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gRes, secRes, subRes, tRes, yrRes] = await Promise.all([
        api.get('/grades'),
        api.get('/sections'),
        api.get('/subjects'),
        api.get('/users', { params: { role: 'teacher' } }),
        api.get('/academic-years')
      ]);

      setGrades(gRes.data.grades);
      setSections(secRes.data.sections);
      setSubjects(subRes.data.subjects);
      setTeachers(tRes.data.users);
      setAcademicYears(yrRes.data.academicYears);

      // Default select Grade 10 and Section A if available
      const g10 = gRes.data.grades.find(g => g.level === 10) || gRes.data.grades[0];
      const initialGradeId = selectedGrade || g10?._id || '';
      setSelectedGrade(initialGradeId);

      const secA = secRes.data.sections.find(s => s.name === 'A' && (s.gradeId?._id === initialGradeId || s.gradeId === initialGradeId)) || secRes.data.sections[0];
      const initialSecId = selectedSection || secA?._id || '';
      setSelectedSection(initialSecId);

      // Fetch slots
      if (initialGradeId && initialSecId) {
        const slotsRes = await api.get('/timetable/slots', {
          params: { gradeId: initialGradeId, sectionId: initialSecId }
        });
        setSlots(slotsRes.data.slots);
      }
    } catch (err) {
      console.error('Failed to load timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchFilteredSlots = async (gradeId, sectionId) => {
    if (!gradeId || !sectionId) return;
    try {
      setLoading(true);
      const res = await api.get('/timetable/slots', {
        params: { gradeId, sectionId }
      });
      setSlots(res.data.slots);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (gradeId) => {
    setSelectedGrade(gradeId);
    const relatedSec = sections.find(s => s.gradeId?._id === gradeId || s.gradeId === gradeId);
    const secId = relatedSec?._id || '';
    setSelectedSection(secId);
    fetchFilteredSlots(gradeId, secId);
  };

  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
    fetchFilteredSlots(selectedGrade, sectionId);
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await api.post('/timetable/slots', {
        ...slotForm,
        academicYearId: slotForm.academicYearId || academicYears[0]?._id,
        gradeId: selectedGrade,
        sectionId: selectedSection
      });
      setIsSlotModal(false);
      fetchFilteredSlots(selectedGrade, selectedSection);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Conflict detected: could not schedule slot.');
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Delete this scheduled period slot?')) return;
    try {
      await api.delete(`/timetable/slots/${id}`);
      fetchFilteredSlots(selectedGrade, selectedSection);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting slot');
    }
  };

  const days = [1, 2, 3, 4, 5]; // Mon to Fri
  const periods = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Master Timetable Scheduling</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Weekly high school period allocations with automated teacher & room conflict protection
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMsg('');
            setSlotForm({
              ...slotForm,
              gradeId: selectedGrade,
              sectionId: selectedSection,
              academicYearId: academicYears[0]?._id || ''
            });
            setIsSlotModal(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Add Period Slot</span>
        </button>
      </div>

      {/* Filter Selector */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Viewing Class:</span>
        </div>

        <select
          className="form-select"
          style={{ width: '220px' }}
          value={selectedGrade}
          onChange={(e) => handleGradeChange(e.target.value)}
        >
          {grades.map(g => (
            <option key={g._id} value={g._id}>{g.name}</option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={selectedSection}
          onChange={(e) => handleSectionChange(e.target.value)}
        >
          {sections
            .filter(s => s.gradeId?._id === selectedGrade || s.gradeId === selectedGrade)
            .map(s => (
              <option key={s._id} value={s._id}>Section {s.name}</option>
            ))}
        </select>
      </div>

      {/* Timetable Grid */}
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <div style={{ minWidth: '850px' }}>
          {/* Header Row: Days */}
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
              {/* Period Number & Time Column */}
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
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                  {periodNum === 1 ? '08:30' : periodNum === 2 ? '09:25' : periodNum === 3 ? '10:30' : periodNum === 4 ? '11:25' : periodNum === 5 ? '13:00' : '14:00'}
                </div>
              </div>

              {/* 5 Day Cells for this period */}
              {days.map(dayNum => {
                const match = slots.find(s => s.dayOfWeek === dayNum && s.period === periodNum);
                return (
                  <div
                    key={`${dayNum}-${periodNum}`}
                    style={{
                      minHeight: '96px',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: match ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.015)',
                      border: match ? '1px solid rgba(99, 102, 241, 0.3)' : '1px dashed rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}
                  >
                    {match ? (
                      <>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff', marginBottom: '0.2rem' }}>
                            {match.subjectId?.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                            {match.subjectId?.code}
                          </div>
                        </div>

                        <div style={{ marginTop: '0.4rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {match.teacherId?.userId?.firstName ? `Dr. ${match.teacherId.userId.lastName}` : 'Faculty'} • {match.classroom}
                          </div>
                          <button
                            onClick={() => handleDeleteSlot(match._id)}
                            style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}
                            title="Remove Slot"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                        Free
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Add Slot Modal */}
      <Modal isOpen={isSlotModal} onClose={() => setIsSlotModal(false)} title="Schedule Timetable Period">
        {errorMsg && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}
        <form onSubmit={handleCreateSlot}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Day of Week</label>
              <select
                className="form-select"
                value={slotForm.dayOfWeek}
                onChange={(e) => setSlotForm({ ...slotForm, dayOfWeek: Number(e.target.value) })}
              >
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Period (1 to 7)</label>
              <select
                className="form-select"
                value={slotForm.period}
                onChange={(e) => setSlotForm({ ...slotForm, period: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5, 6, 7].map(p => (
                  <option key={p} value={p}>Period {p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <select
              className="form-select"
              value={slotForm.subjectId}
              onChange={(e) => setSlotForm({ ...slotForm, subjectId: e.target.value })}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Teacher</label>
            <select
              className="form-select"
              value={slotForm.teacherId}
              onChange={(e) => setSlotForm({ ...slotForm, teacherId: e.target.value })}
              required
            >
              <option value="">Select Teacher</option>
              {teachers.map(t => (
                <option key={t.profile?._id || t._id} value={t.profile?._id || t._id}>
                  {t.firstName} {t.lastName} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Classroom / Laboratory</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Room 201, Science Lab 2"
              value={slotForm.classroom}
              onChange={(e) => setSlotForm({ ...slotForm, classroom: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsSlotModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Schedule Slot</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TimetableManager;
