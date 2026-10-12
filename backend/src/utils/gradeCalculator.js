const calculateGrade = (percentage) => {
  const p = Math.round(Number(percentage) * 10) / 10;
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

const calculateCumulativeGpa = (gradeRecords) => {
  if (!gradeRecords || gradeRecords.length === 0) return 0.0;
  const totalGpa = gradeRecords.reduce((acc, curr) => acc + (curr.gpaPoint || 0), 0);
  return Number((totalGpa / gradeRecords.length).toFixed(2));
};

module.exports = {
  calculateGrade,
  calculateCumulativeGpa
};
