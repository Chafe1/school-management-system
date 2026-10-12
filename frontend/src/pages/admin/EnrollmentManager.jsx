import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { UserCheck, ArrowUpRight, Plus, Filter, CheckCircle2, Award } from 'lucide-react';

const EnrollmentManager = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isEnrollModal, setIsEnrollModal] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    studentId: '',
    gradeId: '',
    sectionId: '',
    academicYearId: ''
  });
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedGrade) params.gradeId = selectedGrade;
      if (selectedSection) params.sectionId = selectedSection;

      const [enRes, gRes, secRes, stRes, yrRes] = await Promise.all([
        api.get('/enrollments', { params }),
        api.get('/grades'),
        api.get('/sections'),
        api.get('/users', { params: { role: 'student' } }),
        api.get('/academic-years')
      ]);

      setEnrollments(enRes.data.enrollments);
      setGrades(gRes.data.grades);
      setSections(secRes.data.sections);
      setStudents(stRes.data.users);
      setAcademicYears(yrRes.data.academicYears);
    } catch (err) {
      console.error('Failed to load enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedGrade, selectedSection]);

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/enrollments', enrollForm);
      setIsEnrollModal(false);
      setMessage('Student successfully enrolled into class roster.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error enrolling student');
    }
  };

  // Student rollover / promotion to next grade
  const handleRollover = async (enrollmentId, studentName, currentGrade) => {
    if (!window.confirm(`Promote ${studentName} from ${currentGrade} to the next high school grade level?`)) return;
    try {
      const res = await api.put(`/enrollments/${enrollmentId}/rollover`, {});
      setMessage(res.data.message);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing promotion');
    }
  };

  const filteredSections = selectedGrade
    ? sections.filter(s => s.gradeId?._id === selectedGrade || s.gradeId === selectedGrade)
    : sections;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Enrollment & Rollover</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Roster assignments and annual grade level advancement (9 → 10 → 11 → 12)
          </p>
        </div>
        <button onClick={() => setIsEnrollModal(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Enroll Student</span>
        </button>
      </div>

      {message && (
        <div style={{ padding: '0.85rem 1rem', marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-dim)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter Roster:</span>
        </div>

        <select
          className="form-select"
          style={{ width: '200px' }}
          value={selectedGrade}
          onChange={(e) => {
            setSelectedGrade(e.target.value);
            setSelectedSection('');
          }}
        >
          <option value="">All Grade Cohorts</option>
          {grades.map(g => (
            <option key={g._id} value={g._id}>{g.name}</option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          disabled={!selectedGrade && sections.length === 0}
        >
          <option value="">All Sections</option>
          {filteredSections.map(s => (
            <option key={s._id} value={s._id}>Section {s.name}</option>
          ))}
        </select>
      </div>

      {/* Enrollments Table */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Enrollment ID</th>
                <th>Student</th>
                <th>Grade Level</th>
                <th>Section</th>
                <th>Academic Year</th>
                <th>Promotion Action</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((en) => {
                const studentName = `${en.studentId?.userId?.firstName || ''} ${en.studentId?.userId?.lastName || ''}`;
                const gradeName = en.gradeId?.name || 'High School';
                const level = en.gradeId?.level;

                return (
                  <tr key={en._id}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      {en.studentId?.enrollmentNo || 'ENR-TBD'}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{en.studentId?.userId?.email}</div>
                    </td>
                    <td>{gradeName}</td>
                    <td>Section {en.sectionId?.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{en.academicYearId?.name}</td>
                    <td>
                      <button
                        onClick={() => handleRollover(en._id, studentName, gradeName)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        {level >= 12 ? <Award size={14} color="#f59e0b" /> : <ArrowUpRight size={14} color="var(--accent-primary)" />}
                        <span>{level >= 12 ? 'Graduate Senior' : `Promote to Grade ${level + 1}`}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {enrollments.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    No student enrollments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll Student Modal */}
      <Modal isOpen={isEnrollModal} onClose={() => setIsEnrollModal(false)} title="Enroll Student into Cohort">
        <form onSubmit={handleEnrollSubmit}>
          <div className="form-group">
            <label className="form-label">Student</label>
            <select
              className="form-select"
              value={enrollForm.studentId}
              onChange={(e) => setEnrollForm({ ...enrollForm, studentId: e.target.value })}
              required
            >
              <option value="">Select Student</option>
              {students.map((st) => (
                <option key={st.profile?._id || st._id} value={st.profile?._id || st._id}>
                  {st.firstName} {st.lastName} ({st.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Grade</label>
            <select
              className="form-select"
              value={enrollForm.gradeId}
              onChange={(e) => setEnrollForm({ ...enrollForm, gradeId: e.target.value })}
              required
            >
              <option value="">Select Grade Level</option>
              {grades.map(g => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Section</label>
            <select
              className="form-select"
              value={enrollForm.sectionId}
              onChange={(e) => setEnrollForm({ ...enrollForm, sectionId: e.target.value })}
              required
            >
              <option value="">Select Section</option>
              {sections
                .filter(s => !enrollForm.gradeId || s.gradeId?._id === enrollForm.gradeId || s.gradeId === enrollForm.gradeId)
                .map(s => (
                  <option key={s._id} value={s._id}>Section {s.name}</option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Academic Year</label>
            <select
              className="form-select"
              value={enrollForm.academicYearId}
              onChange={(e) => setEnrollForm({ ...enrollForm, academicYearId: e.target.value })}
              required
            >
              <option value="">Select Academic Year</option>
              {academicYears.map(yr => (
                <option key={yr._id} value={yr._id}>{yr.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsEnrollModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Enroll Student</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EnrollmentManager;
