import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import { BookOpen, CheckCircle2, Clock, Upload, Send } from 'lucide-react';

const MyAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isSubmitModal, setIsSubmitModal] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const studentId = user?.profile?._id;
      if (!studentId) return;

      const [asRes, subRes] = await Promise.all([
        api.get('/assignments'),
        api.get(`/assignments/student/${studentId}/submissions`)
      ]);

      setAssignments(asRes.data.assignments);
      setMySubmissions(subRes.data.submissions);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    try {
      const studentId = user?.profile?._id;
      await api.post('/assignments/submit', {
        assignmentId: selectedAssignment._id,
        studentId,
        content: submissionText
      });
      setIsSubmitModal(false);
      setSubmissionText('');
      setFeedbackMsg(`Successfully turned in "${selectedAssignment.title}"!`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting assignment');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Course Assignments & Turn-Ins</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Submit problem sets, laboratory write-ups, and review instructor grades
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div style={{ padding: '0.85rem 1rem', marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Assignment Title</th>
                <th>Subject Course</th>
                <th>Points</th>
                <th>Due Date</th>
                <th>Submission Status</th>
                <th>Grade / Score</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => {
                const sub = mySubmissions.find(s => s.assignmentId?._id === a._id || s.assignmentId === a._id);
                const isSubmitted = !!sub;
                const isGraded = sub?.obtainedMarks !== null && sub?.obtainedMarks !== undefined;

                return (
                  <tr key={a._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.description}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.subjectId?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>{a.subjectId?.code}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>{a.totalMarks} pts</td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatDate(a.dueDate)}</td>
                    <td>
                      {isGraded ? (
                        <span className="badge badge-present">Graded</span>
                      ) : isSubmitted ? (
                        <span className="badge badge-excused">Turned In</span>
                      ) : (
                        <span className="badge badge-late">Pending</span>
                      )}
                    </td>
                    <td>
                      {isGraded ? (
                        <div>
                          <span style={{ fontWeight: 800, color: '#34d399', fontSize: '0.95rem' }}>
                            {sub.obtainedMarks} / {a.totalMarks}
                          </span>
                          {sub.feedback && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '200px' }}>
                              "{sub.feedback}"
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedAssignment(a);
                          setSubmissionText(sub?.content || '');
                          setIsSubmitModal(true);
                        }}
                        className={`btn btn-sm ${isSubmitted ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Upload size={14} />
                        <span>{isSubmitted ? 'Resubmit' : 'Turn In Work'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    No assignments posted.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Turn In Assignment Modal */}
      <Modal
        isOpen={isSubmitModal}
        onClose={() => setIsSubmitModal(false)}
        title={`Turn In — ${selectedAssignment?.title}`}
        maxWidth="600px"
      >
        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Course: <strong style={{ color: '#fff' }}>{selectedAssignment?.subjectId?.name}</strong> • Max Points: <strong style={{ color: '#fff' }}>{selectedAssignment?.totalMarks}</strong>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
            {selectedAssignment?.description}
          </p>
        </div>

        <form onSubmit={handleSubmitWork}>
          <div className="form-group">
            <label className="form-label">Solution, Write-up, or Repository / Document Link</label>
            <textarea
              className="form-textarea"
              rows={6}
              placeholder="Enter your completed proof, lab answers, or paste link to document..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsSubmitModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Send size={15} />
              <span>Submit to Teacher</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyAssignments;
