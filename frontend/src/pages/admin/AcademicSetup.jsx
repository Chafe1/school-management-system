import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { Layers, BookOpen, Calendar, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const AcademicSetup = () => {
  const [activeTab, setActiveTab] = useState('subjects');
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  // Modals
  const [isSubjectModal, setIsSubjectModal] = useState(false);
  const [isSectionModal, setIsSectionModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', gradeId: '', isElective: false, credits: 1.0 });
  const [sectionForm, setSectionForm] = useState({ name: '', gradeId: '', room: '' });

  const fetchData = async () => {
    try {
      const [gRes, secRes, subRes, yRes] = await Promise.all([
        api.get('/grades'),
        api.get('/sections'),
        api.get('/subjects'),
        api.get('/academic-years')
      ]);
      setGrades(gRes.data.grades);
      setSections(secRes.data.sections);
      setSubjects(subRes.data.subjects);
      setAcademicYears(yRes.data.academicYears);
    } catch (err) {
      console.error('Failed to load academic setup:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subjects', subjectForm);
      setIsSubjectModal(false);
      setSubjectForm({ name: '', code: '', gradeId: '', isElective: false, credits: 1.0 });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating subject');
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sections', sectionForm);
      setIsSectionModal(false);
      setSectionForm({ name: '', gradeId: '', room: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating section');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting subject');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Academic Structure & Curriculum</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Configure high school grades 9–12, sections, course catalogue, and terms
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`btn btn-sm ${activeTab === 'subjects' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <BookOpen size={16} />
          <span>Subjects & Courses ({subjects.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('sections')}
          className={`btn btn-sm ${activeTab === 'sections' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Layers size={16} />
          <span>Sections & Rooms ({sections.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('grades')}
          className={`btn btn-sm ${activeTab === 'grades' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Layers size={16} />
          <span>Grade Levels (9–12)</span>
        </button>
        <button
          onClick={() => setActiveTab('years')}
          className={`btn btn-sm ${activeTab === 'years' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Calendar size={16} />
          <span>Academic Years & Terms</span>
        </button>
      </div>

      {/* TAB 1: SUBJECTS */}
      {activeTab === 'subjects' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>High School Curriculum Course Catalogue</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Core sciences, mathematics, humanities, and AP electives</p>
            </div>
            <button onClick={() => setIsSubjectModal(true)} className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Subject Name</th>
                  <th>Designated Grade</th>
                  <th>Credits</th>
                  <th>Curriculum Type</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s._id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>
                      {s.code}
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.gradeId?.name || 'All High School'}</td>
                    <td>{s.credits || 1.0} Credit</td>
                    <td>
                      {s.isElective ? (
                        <span className="badge badge-late">Elective</span>
                      ) : (
                        <span className="badge badge-present">Core Requirement</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDeleteSubject(s._id)} className="btn btn-danger btn-sm" style={{ padding: '0.3rem 0.5rem' }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SECTIONS */}
      {activeTab === 'sections' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Grade Sections & Homerooms</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Roster division per grade level</p>
            </div>
            <button onClick={() => setIsSectionModal(true)} className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>Add Section</span>
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Grade Level</th>
                  <th>Homeroom Classroom</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((sec) => (
                  <tr key={sec._id}>
                    <td style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-primary)' }}>
                      Section {sec.name}
                    </td>
                    <td>{sec.gradeId?.name}</td>
                    <td>{sec.room || 'TBD'}</td>
                    <td style={{ color: 'var(--text-dim)' }}>{new Date(sec.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GRADES */}
      {activeTab === 'grades' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>High School Academic Cohorts</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {grades.map((g) => (
              <div
                key={g._id}
                style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Level {g.level}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: '0.4rem 0' }}>
                  {g.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Standard Secondary School Education Tier
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ACADEMIC YEARS */}
      {activeTab === 'years' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Academic Calendar & Weighted Terms</h3>
          {academicYears.map((yr) => (
            <div
              key={yr._id}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: yr.isCurrent ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                marginBottom: '1rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h4 style={{ fontSize: '1.1rem' }}>{yr.name}</h4>
                  {yr.isCurrent && <span className="badge badge-present">Current Active Session</span>}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(yr.startDate).toLocaleDateString()} — {new Date(yr.endDate).toLocaleDateString()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                {yr.terms?.map((term, idx) => (
                  <div key={idx} style={{ padding: '0.75rem 1rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{term.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                      Weight: {term.weight}% of Final GPA
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subject Modal */}
      <Modal isOpen={isSubjectModal} onClose={() => setIsSubjectModal(false)} title="Add High School Subject">
        <form onSubmit={handleCreateSubject}>
          <div className="form-group">
            <label className="form-label">Subject Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. AP Biology, AP Statistics"
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Course Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. BIO-301, STAT-401"
              value={subjectForm.code}
              onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Grade Level</label>
            <select
              className="form-select"
              value={subjectForm.gradeId}
              onChange={(e) => setSubjectForm({ ...subjectForm, gradeId: e.target.value })}
            >
              <option value="">All High School (Multi-grade)</option>
              {grades.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="isElective"
              checked={subjectForm.isElective}
              onChange={(e) => setSubjectForm({ ...subjectForm, isElective: e.target.checked })}
            />
            <label htmlFor="isElective" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Is Elective Subject
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsSubjectModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Course</button>
          </div>
        </form>
      </Modal>

      {/* Add Section Modal */}
      <Modal isOpen={isSectionModal} onClose={() => setIsSectionModal(false)} title="Add Grade Section">
        <form onSubmit={handleCreateSection}>
          <div className="form-group">
            <label className="form-label">Section Identifier (e.g. C, D)</label>
            <input
              type="text"
              className="form-input"
              value={sectionForm.name}
              onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value.toUpperCase() })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Grade</label>
            <select
              className="form-select"
              value={sectionForm.gradeId}
              onChange={(e) => setSectionForm({ ...sectionForm, gradeId: e.target.value })}
              required
            >
              <option value="">Select Grade</option>
              {grades.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Classroom / Room Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Room 205"
              value={sectionForm.room}
              onChange={(e) => setSectionForm({ ...sectionForm, room: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsSectionModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Section</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AcademicSetup;
