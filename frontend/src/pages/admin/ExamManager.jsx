import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import { ShieldCheck, Plus, Trash2, Calendar, MapPin, Clock } from 'lucide-react';

const ExamManager = () => {
  const [exams, setExams] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  // Modals
  const [isExamModal, setIsExamModal] = useState(false);
  const [isScheduleModal, setIsScheduleModal] = useState(false);

  const [examForm, setExamForm] = useState({
    name: '',
    academicYearId: '',
    termId: '',
    startDate: '',
    endDate: ''
  });

  const [schedForm, setSchedForm] = useState({
    examId: '',
    subjectId: '',
    gradeId: '',
    date: '',
    startTime: '09:00',
    endTime: '11:00',
    classroom: ''
  });

  const fetchData = async () => {
    try {
      const [exRes, scRes, gRes, subRes, yrRes] = await Promise.all([
        api.get('/exams'),
        api.get('/exams/schedules'),
        api.get('/grades'),
        api.get('/subjects'),
        api.get('/academic-years')
      ]);

      setExams(exRes.data.exams);
      setSchedules(scRes.data.schedules);
      setGrades(gRes.data.grades);
      setSubjects(subRes.data.subjects);
      setAcademicYears(yrRes.data.academicYears);
    } catch (err) {
      console.error('Failed to load exams:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const yr = academicYears.find(y => y._id === examForm.academicYearId) || academicYears[0];
      await api.post('/exams', {
        ...examForm,
        academicYearId: yr._id,
        termId: yr.terms?.[0]?._id
      });
      setIsExamModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating exam session');
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exams/schedules', schedForm);
      setIsScheduleModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Classroom conflict: could not schedule exam.');
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Delete exam schedule entry?')) return;
    try {
      await api.delete(`/exams/schedules/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting schedule');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>High School Examination Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Midterm, final, and standardized assessment schedules & halls
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setIsExamModal(true)} className="btn btn-secondary btn-sm">
            <Plus size={16} />
            <span>New Exam Period</span>
          </button>
          <button onClick={() => setIsScheduleModal(true)} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Schedule Exam Paper</span>
          </button>
        </div>
      </div>

      {/* Exam Sessions Overview */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Active High School Exam Periods</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {exams.map(ex => (
            <div
              key={ex._id}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', marginBottom: '0.4rem' }}>
                <ShieldCheck size={18} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{ex.name}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {formatDate(ex.startDate)} — {formatDate(ex.endDate)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                Session: {ex.academicYearId?.name || 'Academic Year'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Schedules Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Master Exam Timetable & Classrooms</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Exam Period</th>
                <th>Subject Paper</th>
                <th>Target Grade</th>
                <th>Exam Date</th>
                <th>Timings</th>
                <th>Examination Hall</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(sc => (
                <tr key={sc._id}>
                  <td style={{ fontWeight: 600 }}>{sc.examId?.name}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{sc.subjectId?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>{sc.subjectId?.code}</div>
                  </td>
                  <td>{sc.gradeId?.name}</td>
                  <td>{formatDate(sc.date)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    {sc.startTime} - {sc.endTime}
                  </td>
                  <td>
                    <span className="badge badge-present">{sc.classroom}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => handleDeleteSchedule(sc._id)} className="btn btn-danger btn-sm" style={{ padding: '0.3rem 0.5rem' }}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    No exam papers currently scheduled.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Exam Period Modal */}
      <Modal isOpen={isExamModal} onClose={() => setIsExamModal(false)} title="Create Exam Session">
        <form onSubmit={handleCreateExam}>
          <div className="form-group">
            <label className="form-label">Exam Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Spring Term Final Examinations"
              value={examForm.name}
              onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Academic Year</label>
            <select
              className="form-select"
              value={examForm.academicYearId}
              onChange={(e) => setExamForm({ ...examForm, academicYearId: e.target.value })}
              required
            >
              <option value="">Select Year</option>
              {academicYears.map(y => (
                <option key={y._id} value={y._id}>{y.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={examForm.startDate}
                onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={examForm.endDate}
                onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsExamModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Create Session</button>
          </div>
        </form>
      </Modal>

      {/* Schedule Exam Paper Modal */}
      <Modal isOpen={isScheduleModal} onClose={() => setIsScheduleModal(false)} title="Schedule Exam Paper">
        <form onSubmit={handleCreateSchedule}>
          <div className="form-group">
            <label className="form-label">Exam Session</label>
            <select
              className="form-select"
              value={schedForm.examId}
              onChange={(e) => setSchedForm({ ...schedForm, examId: e.target.value })}
              required
            >
              <option value="">Select Exam Period</option>
              {exams.map(e => (
                <option key={e._id} value={e._id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <select
              className="form-select"
              value={schedForm.subjectId}
              onChange={(e) => setSchedForm({ ...schedForm, subjectId: e.target.value })}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Target Grade Level</label>
            <select
              className="form-select"
              value={schedForm.gradeId}
              onChange={(e) => setSchedForm({ ...schedForm, gradeId: e.target.value })}
              required
            >
              <option value="">Select Grade</option>
              {grades.map(g => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={schedForm.date}
              onChange={(e) => setSchedForm({ ...schedForm, date: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="text"
                className="form-input"
                placeholder="09:00"
                value={schedForm.startTime}
                onChange={(e) => setSchedForm({ ...schedForm, startTime: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="text"
                className="form-input"
                placeholder="11:00"
                value={schedForm.endTime}
                onChange={(e) => setSchedForm({ ...schedForm, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Examination Hall / Classroom</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Auditorium, Exam Hall 1"
              value={schedForm.classroom}
              onChange={(e) => setSchedForm({ ...schedForm, classroom: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsScheduleModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Schedule Exam</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExamManager;
