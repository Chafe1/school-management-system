import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { getGradeClass } from '../../utils/helpers';
import { Award, CheckCircle2, Save, BookOpen } from 'lucide-react';

const GradeEntry = () => {
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  const [roster, setRoster] = useState([]);
  const [marksMap, setMarksMap] = useState({}); // { [studentId]: { marks: 95, remarks: '' } }
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  // High school grade helper
  const computeLetter = (pct) => {
    const p = Number(pct);
    if (isNaN(p) || pct === '') return { letter: '-', gpa: 0.0 };
    if (p >= 93) return { letter: 'A', gpa: 4.0 };
    if (p >= 90) return { letter: 'A-', gpa: 3.7 };
    if (p >= 87) return { letter: 'B+', gpa: 3.3 };
    if (p >= 83) return { letter: 'B', gpa: 3.0 };
    if (p >= 80) return { letter: 'B-', gpa: 2.7 };
    if (p >= 77) return { letter: 'C+', gpa: 2.3 };
    if (p >= 73) return { letter: 'C', gpa: 2.0 };
    if (p >= 70) return { letter: 'C-', gpa: 1.7 };
    if (p >= 65) return { letter: 'D', gpa: 1.0 };
    return { letter: 'F', gpa: 0.0 };
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [gRes, secRes, subRes, yrRes] = await Promise.all([
          api.get('/grades'),
          api.get('/sections'),
          api.get('/subjects'),
          api.get('/academic-years')
        ]);
        setGrades(gRes.data.grades);
        setSections(secRes.data.sections);
        setSubjects(subRes.data.subjects);
        setAcademicYears(yrRes.data.academicYears);

        // Pre-select Grade 10, Sec A, Algebra II
        const g10 = gRes.data.grades.find(g => g.level === 10) || gRes.data.grades[0];
        if (g10) {
          setSelectedGrade(g10._id);
          const secA = secRes.data.sections.find(s => s.name === 'A' && (s.gradeId?._id === g10._id || s.gradeId === g10._id)) || secRes.data.sections[0];
          if (secA) setSelectedSection(secA._id);
        }
        if (subRes.data.subjects.length > 0) setSelectedSubject(subRes.data.subjects[0]._id);
        if (yrRes.data.academicYears[0]?.terms?.[0]) setSelectedTerm(yrRes.data.academicYears[0].terms[0]._id);
      } catch (err) {
        console.error('Failed to load grade setup:', err);
      }
    };
    init();
  }, []);

  // Fetch roster when grade & section change
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedGrade || !selectedSection) return;
      try {
        const res = await api.get('/enrollments', {
          params: { gradeId: selectedGrade, sectionId: selectedSection }
        });
        setRoster(res.data.enrollments);

        // Initialize marks map
        const initial = {};
        res.data.enrollments.forEach(en => {
          initial[en.studentId?._id] = { marks: 88, remarks: 'Consistent classroom participation' };
        });
        setMarksMap(initial);
      } catch (err) {
        console.error('Failed to fetch students for grading:', err);
      }
    };
    fetchStudents();
  }, [selectedGrade, selectedSection]);

  const handleMarkChange = (studentId, val) => {
    setMarksMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marks: val
      }
    }));
  };

  const handleRemarksChange = (studentId, val) => {
    setMarksMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: val
      }
    }));
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');

    try {
      const currentYear = academicYears[0];
      const termObj = currentYear?.terms?.find(t => t._id === selectedTerm) || currentYear?.terms?.[0];

      let count = 0;
      for (const en of roster) {
        const sId = en.studentId?._id;
        const entry = marksMap[sId];
        if (entry && entry.marks !== '') {
          await api.post('/grades/record', {
            studentId: sId,
            academicYearId: currentYear?._id,
            termId: termObj?._id,
            termName: termObj?.name || 'Fall Term 1',
            subjectId: selectedSubject,
            obtainedMarks: Number(entry.marks),
            maxMarks: 100,
            teacherRemarks: entry.remarks
          });
          count++;
        }
      }

      setFeedback(`Successfully finalized and recorded term grades for ${count} students!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving grades');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>High School Gradebook & GPA Entry</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Record term marks, automatic letter conversion (A–F), and 4.0 scale GPA calculation
          </p>
        </div>
      </div>

      {feedback && (
        <div style={{ padding: '0.85rem 1rem', marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <select
          className="form-select"
          style={{ width: '200px' }}
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
          style={{ width: '160px' }}
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
        >
          {sections
            .filter(s => s.gradeId?._id === selectedGrade || s.gradeId === selectedGrade)
            .map(s => (
              <option key={s._id} value={s._id}>Section {s.name}</option>
            ))}
        </select>

        <select
          className="form-select"
          style={{ width: '250px' }}
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          {subjects.map(s => (
            <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
        >
          {academicYears[0]?.terms?.map(t => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Grade Entry Table */}
      <form onSubmit={handleSaveAll}>
        <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Enrollment No</th>
                  <th>Student Name</th>
                  <th style={{ width: '140px' }}>Score (Max 100)</th>
                  <th style={{ textAlign: 'center' }}>Letter Grade</th>
                  <th style={{ textAlign: 'center' }}>GPA Equivalent</th>
                  <th>Teacher Remark & Feedback</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((en) => {
                  const sId = en.studentId?._id;
                  const score = marksMap[sId]?.marks ?? '';
                  const remarks = marksMap[sId]?.remarks ?? '';
                  const calc = computeLetter(score);
                  const pillClass = getGradeClass(calc.letter);

                  return (
                    <tr key={en._id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                        {en.studentId?.enrollmentNo || 'ENR-TBD'}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {en.studentId?.userId?.firstName} {en.studentId?.userId?.lastName}
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          className="form-input"
                          style={{ width: '110px', textAlign: 'center', fontWeight: 700 }}
                          value={score}
                          onChange={(e) => handleMarkChange(sId, e.target.value)}
                          required
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`grade-pill ${pillClass}`}>
                          {calc.letter}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#fff' }}>
                        {calc.gpa.toFixed(1)} / 4.0
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          style={{ fontSize: '0.85rem' }}
                          placeholder="e.g. Demonstrates exceptional critical reasoning"
                          value={remarks}
                          onChange={(e) => handleRemarksChange(sId, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
                {roster.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
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
            disabled={saving || roster.length === 0}
            style={{ padding: '0.75rem 2rem' }}
          >
            <Save size={16} />
            <span>{saving ? 'Recording...' : 'Finalize & Post Term Grades'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default GradeEntry;
