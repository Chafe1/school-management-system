import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { getGradeClass } from '../../utils/helpers';
import { Award, Printer, GraduationCap, CheckCircle2, FileText } from 'lucide-react';

const MyGrades = () => {
  const { user } = useAuth();
  const [gradeData, setGradeData] = useState({ cumulativeGpa: 0, records: [] });
  const [transcript, setTranscript] = useState(null);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const studentId = user?.profile?._id;
        if (!studentId) return;

        const [gRes, tRes] = await Promise.all([
          api.get(`/grades/student/${studentId}`),
          api.get(`/reports/transcript/${studentId}`)
        ]);

        setGradeData(gRes.data);
        setTranscript(tRes.data.transcript);
      } catch (err) {
        console.error('Failed to load grades:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Academic Gradebook & Transcripts</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            High school weighted GPA, course credit hours, and official transcripts
          </p>
        </div>
        <button onClick={() => setIsTranscriptOpen(true)} className="btn btn-primary">
          <Printer size={16} />
          <span>View / Print Official Transcript</span>
        </button>
      </div>

      {/* GPA Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          border: '1px solid var(--border-hover)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--accent-primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)'
            }}
          >
            <Award size={28} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Cumulative Academic Record
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
              {gradeData.cumulativeGpa > 0 ? gradeData.cumulativeGpa.toFixed(2) : '3.80'}{' '}
              <span style={{ fontSize: '1rem', color: 'var(--text-dim)', fontWeight: 600 }}>/ 4.00 Scale</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Credits Earned</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
              {gradeData.records.reduce((acc, curr) => acc + (curr.subjectId?.credits || 1.0), 0)} Credits
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Academic Standing</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399' }}>Dean's Honors</div>
          </div>
        </div>
      </div>

      {/* Grade Records Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Term 1 Course Breakdown & Teacher Evaluations</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course Subject</th>
                <th>Course Code</th>
                <th>Credits</th>
                <th>Score</th>
                <th style={{ textAlign: 'center' }}>Letter Grade</th>
                <th style={{ textAlign: 'center' }}>GPA</th>
                <th>Instructor Comments</th>
              </tr>
            </thead>
            <tbody>
              {gradeData.records.map((r) => {
                const pillClass = getGradeClass(r.letterGrade);
                return (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{r.subjectId?.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontSize: '0.85rem' }}>
                      {r.subjectId?.code}
                    </td>
                    <td>{r.subjectId?.credits || 1.0} Credit</td>
                    <td style={{ fontWeight: 700 }}>{r.obtainedMarks}%</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`grade-pill ${pillClass}`} style={{ width: '2rem', height: '2rem', fontSize: '0.85rem' }}>
                        {r.letterGrade}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#fff' }}>
                      {r.gpaPoint?.toFixed(1)}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      "{r.teacherRemarks || 'Excellent work'}"
                    </td>
                  </tr>
                );
              })}
              {gradeData.records.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    No finalized grades for this term yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Printable High School Transcript Modal */}
      <Modal
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
        title="Official High School Academic Transcript"
        maxWidth="820px"
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }} className="no-print">
          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            <Printer size={16} />
            <span>Print to PDF</span>
          </button>
        </div>

        {/* Printable Transcript Document Paper */}
        <div
          className="report-card-paper"
          style={{
            background: '#ffffff',
            color: '#1e293b',
            padding: '2.5rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            fontFamily: 'var(--font-sans)'
          }}
        >
          {/* Official Letterhead */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #4338ca', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <GraduationCap size={28} color="#4338ca" />
              <h2 style={{ color: '#1e1b4b', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                {transcript?.schoolName || 'WESTLAKE ACADEMIC HIGH SCHOOL'}
              </h2>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {transcript?.schoolAddress || '1000 Academy Way, Cambridge, MA • Accredited Secondary Education'}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4338ca', marginTop: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Official High School Academic Transcript (Grades 9–12)
            </div>
          </div>

          {/* Student Header Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
            <div>
              <div><strong>Student Name:</strong> {transcript?.student?.fullName}</div>
              <div style={{ marginTop: '0.25rem' }}><strong>Enrollment ID:</strong> {transcript?.student?.enrollmentNo}</div>
              <div style={{ marginTop: '0.25rem' }}><strong>Grade Level:</strong> {transcript?.academic?.grade} (Section {transcript?.academic?.section})</div>
            </div>
            <div>
              <div><strong>Academic Session:</strong> {transcript?.academic?.academicYear}</div>
              <div style={{ marginTop: '0.25rem' }}><strong>Date of Issue:</strong> {transcript?.issueDate}</div>
              <div style={{ marginTop: '0.25rem' }}><strong>Attendance Rate:</strong> {transcript?.attendance?.attendanceRate}% ({transcript?.attendance?.totalDays} Days)</div>
            </div>
          </div>

          {/* Grades Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#334155' }}>Code</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#334155' }}>Course Description</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: '#334155' }}>Credits</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: '#334155' }}>Percent</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: '#334155' }}>Grade</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: '#334155' }}>Points</th>
              </tr>
            </thead>
            <tbody>
              {transcript?.grades?.map((g) => (
                <tr key={g._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>{g.subjectId?.code}</td>
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>{g.subjectId?.name}</td>
                  <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{g.subjectId?.credits || 1.0}</td>
                  <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{g.obtainedMarks}%</td>
                  <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 800, color: '#1e1b4b' }}>{g.letterGrade}</td>
                  <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>{g.gpaPoint?.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Transcript Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Credits Attempted / Earned</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{transcript?.academic?.totalCredits} Units</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Cumulative Grade Point Average</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4338ca' }}>
                {transcript?.academic?.cumulativeGpa > 0 ? transcript.academic.cumulativeGpa.toFixed(2) : '3.80'} / 4.00
              </div>
            </div>
          </div>

          {/* Official Signatures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #cbd5e1' }}>
            <div>
              <div style={{ height: '35px', borderBottom: '1px solid #94a3b8', width: '80%' }}></div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>Principal / Head of High School</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ height: '35px', borderBottom: '1px solid #94a3b8', width: '80%', marginLeft: 'auto' }}></div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>Academic Registrar & Seal</div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyGrades;
