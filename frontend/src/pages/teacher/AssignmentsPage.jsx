import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import { BookOpen, Plus, Trash2, Eye, Award, CheckCircle2, Calendar } from 'lucide-react';

const AssignmentsPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Modals
  const [isCreateModal, setIsCreateModal] = useState(false);
  const [isSubmissionsModal, setIsSubmissionsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    subjectId: '',
    gradeId: '',
    sectionId: '',
    dueDate: '',
    totalMarks: 100,
    type: 'homework'
  });

  const [gradingSubId, setGradingSubId] = useState(null);
  const [gradeMarks, setGradeMarks] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  const fetchData = async () => {
    try {
      const [aRes, gRes, secRes, subRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/grades'),
        api.get('/sections'),
        api.get('/subjects')
      ]);

      setAssignments(aRes.data.assignments);
      setGrades(gRes.data.grades);
      setSections(secRes.data.sections);
      setSubjects(subRes.data.subjects);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assignments', {
        ...form,
        teacherId: user?.profile?._id
      });
      setIsCreateModal(false);
      setForm({
        title: '',
        description: '',
        subjectId: '',
        gradeId: '',
        sectionId: '',
        dueDate: '',
        totalMarks: 100,
        type: 'homework'
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating assignment');
    }
  };

  const handleOpenSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmissionsModal(true);
    try {
      const res = await api.get(`/assignments/${assignment._id}/submissions`);
      setSubmissions(res.data.submissions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/assignments/submissions/${gradingSubId}/grade`, {
        obtainedMarks: Number(gradeMarks),
        feedback: gradeFeedback
      });
      setGradingSubId(null);
      setGradeMarks('');
      setGradeFeedback('');
      // Reload submissions
      const res = await api.get(`/assignments/${selectedAssignment._id}/submissions`);
      setSubmissions(res.data.submissions);
    } catch (err) {
      alert(err.response?.data?.message || 'Error grading submission');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment and all turned-in submissions?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting assignment');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Course Assignments & Grading</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Publish homework problem sets, laboratory investigations, and score turn-ins
          </p>
        </div>
        <button onClick={() => setIsCreateModal(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Assignments List */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Assignment Title</th>
                <th>Course Subject</th>
                <th>Grade & Section</th>
                <th>Type</th>
                <th>Total Points</th>
                <th>Due Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{a.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.description}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{a.subjectId?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>{a.subjectId?.code}</div>
                  </td>
                  <td>{a.gradeId?.name} • Sec {a.sectionId?.name}</td>
                  <td>
                    <span className="badge badge-late">{a.type}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#fff' }}>{a.totalMarks} pts</td>
                  <td style={{ color: 'var(--text-muted)' }}>{formatDate(a.dueDate)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenSubmissions(a)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Eye size={14} />
                        <span>Submissions</span>
                      </button>
                      <button
                        onClick={() => handleDelete(a._id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.3rem 0.5rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    No assignments posted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Assignment Modal */}
      <Modal isOpen={isCreateModal} onClose={() => setIsCreateModal(false)} title="Create New Course Assignment">
        <form onSubmit={handleCreateAssignment}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Problem Set 5: Matrices & Transformations"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <select
              className="form-select"
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Target Grade</label>
              <select
                className="form-select"
                value={form.gradeId}
                onChange={(e) => setForm({ ...form, gradeId: e.target.value })}
                required
              >
                <option value="">Select Grade</option>
                {grades.map(g => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Section</label>
              <select
                className="form-select"
                value={form.sectionId}
                onChange={(e) => setForm({ ...form, sectionId: e.target.value })}
                required
              >
                <option value="">Select Section</option>
                {sections
                  .filter(s => !form.gradeId || s.gradeId?._id === form.gradeId || s.gradeId === form.gradeId)
                  .map(s => (
                    <option key={s._id} value={s._id}>Section {s.name}</option>
                  ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Score</label>
              <input
                type="number"
                className="form-input"
                value={form.totalMarks}
                onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="homework">Homework</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project / Lab</option>
                <option value="exam">Exam</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Instructions / Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Detailed guidelines, questions, or lab instructions..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsCreateModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Post Assignment</button>
          </div>
        </form>
      </Modal>

      {/* Submissions & Grading Modal */}
      <Modal
        isOpen={isSubmissionsModal}
        onClose={() => {
          setIsSubmissionsModal(false);
          setGradingSubId(null);
        }}
        title={`Student Submissions — ${selectedAssignment?.title}`}
        maxWidth="700px"
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Course: <strong style={{ color: '#fff' }}>{selectedAssignment?.subjectId?.name}</strong> • Max Points: <strong style={{ color: '#fff' }}>{selectedAssignment?.totalMarks}</strong>
          </div>
        </div>

        {/* Grading Form Drawer if active */}
        {gradingSubId && (
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Award Score & Qualitative Feedback</h4>
            <form onSubmit={handleGradeSubmission}>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Score (/{selectedAssignment?.totalMarks})</label>
                  <input
                    type="number"
                    min="0"
                    max={selectedAssignment?.totalMarks || 100}
                    step="0.5"
                    className="form-input"
                    value={gradeMarks}
                    onChange={(e) => setGradeMarks(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Faculty Feedback</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Excellent graphical proofs; expand step 3"
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary btn-sm">Save Score</button>
                <button type="button" onClick={() => setGradingSubId(null)} className="btn btn-secondary btn-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Turned In</th>
                <th>Content Preview</th>
                <th>Awarded Score</th>
                <th style={{ textAlign: 'right' }}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub._id}>
                  <td style={{ fontWeight: 600 }}>
                    {sub.studentId?.userId?.firstName} {sub.studentId?.userId?.lastName}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {formatDate(sub.submittedAt)}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {sub.content || 'Submission file attached'}
                  </td>
                  <td>
                    {sub.obtainedMarks !== null ? (
                      <span style={{ fontWeight: 700, color: '#34d399' }}>
                        {sub.obtainedMarks} / {selectedAssignment?.totalMarks}
                      </span>
                    ) : (
                      <span className="badge badge-late">Pending Score</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setGradingSubId(sub._id);
                        setGradeMarks(sub.obtainedMarks ?? '');
                        setGradeFeedback(sub.feedback || '');
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '0.3rem 0.6rem' }}
                    >
                      <Award size={14} />
                      <span>{sub.obtainedMarks !== null ? 'Edit' : 'Score'}</span>
                    </button>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    No students have turned in this assignment yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default AssignmentsPage;
