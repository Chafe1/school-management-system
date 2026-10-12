const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const AcademicYear = require('../models/AcademicYear');
const Grade = require('../models/Grade');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const Enrollment = require('../models/Enrollment');
const TimetableSlot = require('../models/TimetableSlot');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const GradeRecord = require('../models/GradeRecord');
const Exam = require('../models/Exam');
const ExamSchedule = require('../models/ExamSchedule');

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`[Seed] Database already has ${userCount} users. Skipping seed.`);
      return;
    }

    console.log('[Seed] Seeding High School database with demo data (Grades 9-12)...');

    // 1. Academic Year
    const academicYear = await AcademicYear.create({
      name: '2025–2026 Academic Year',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-06-30'),
      isCurrent: true,
      terms: [
        {
          name: 'Fall Term 1',
          startDate: new Date('2025-09-01'),
          endDate: new Date('2026-01-25'),
          weight: 50
        },
        {
          name: 'Spring Term 2',
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-06-30'),
          weight: 50
        }
      ]
    });
    const term1 = academicYear.terms[0];
    const term2 = academicYear.terms[1];

    // 2. High School Grades 9-12
    const grade9 = await Grade.create({ level: 9, name: 'Grade 9 - Freshman' });
    const grade10 = await Grade.create({ level: 10, name: 'Grade 10 - Sophomore' });
    const grade11 = await Grade.create({ level: 11, name: 'Grade 11 - Junior' });
    const grade12 = await Grade.create({ level: 12, name: 'Grade 12 - Senior' });

    // 3. Sections
    const sec9A = await Section.create({ name: 'A', gradeId: grade9._id, room: 'Room 101' });
    const sec9B = await Section.create({ name: 'B', gradeId: grade9._id, room: 'Room 102' });
    const sec10A = await Section.create({ name: 'A', gradeId: grade10._id, room: 'Room 201' });
    const sec10B = await Section.create({ name: 'B', gradeId: grade10._id, room: 'Room 202' });
    const sec11A = await Section.create({ name: 'A', gradeId: grade11._id, room: 'Room 301' });
    const sec12A = await Section.create({ name: 'A', gradeId: grade12._id, room: 'Room 401' });

    // 4. Subjects
    const math10 = await Subject.create({
      name: 'Algebra II & Trigonometry',
      code: 'MATH-201',
      gradeId: grade10._id,
      credits: 1.0
    });
    const sci10 = await Subject.create({
      name: 'Chemistry Honors',
      code: 'SCI-201',
      gradeId: grade10._id,
      credits: 1.0
    });
    const eng10 = await Subject.create({
      name: 'American Literature & Composition',
      code: 'ENG-201',
      gradeId: grade10._id,
      credits: 1.0
    });
    const hist10 = await Subject.create({
      name: 'World History: 1900–Present',
      code: 'HIST-201',
      gradeId: grade10._id,
      credits: 1.0
    });
    const cs10 = await Subject.create({
      name: 'AP Computer Science Principles',
      code: 'CS-201',
      gradeId: grade10._id,
      isElective: true,
      credits: 1.0
    });
    const math12 = await Subject.create({
      name: 'AP Calculus BC',
      code: 'MATH-401',
      gradeId: grade12._id,
      credits: 1.0
    });
    const sci11 = await Subject.create({
      name: 'AP Physics C: Mechanics',
      code: 'SCI-301',
      gradeId: grade11._id,
      credits: 1.0
    });

    // 5. Users
    // Admin
    const adminUser = await User.create({
      email: 'admin@school.edu',
      password: 'Admin@123',
      role: 'admin',
      firstName: 'Arthur',
      lastName: 'Vance',
      contact: { phone: '+1 (555) 100-0001', address: '100 Admin Ave, Boston, MA' }
    });

    // Teachers
    const teacherUser1 = await User.create({
      email: 'sarah.jenkins@school.edu',
      password: 'Teacher@123',
      role: 'teacher',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      contact: { phone: '+1 (555) 200-0001', address: '202 Faculty Lane, Boston, MA' }
    });
    const teacher1 = await Teacher.create({
      userId: teacherUser1._id,
      employeeId: 'EMP-001',
      qualification: 'Ph.D. in Applied Mathematics (MIT)',
      subjects: [math10._id, math12._id]
    });

    const teacherUser2 = await User.create({
      email: 'robert.chen@school.edu',
      password: 'Teacher@123',
      role: 'teacher',
      firstName: 'Robert',
      lastName: 'Chen',
      contact: { phone: '+1 (555) 200-0002', address: '204 Faculty Lane, Boston, MA' }
    });
    const teacher2 = await Teacher.create({
      userId: teacherUser2._id,
      employeeId: 'EMP-002',
      qualification: 'M.Sc. Chemistry & Science Pedagogy (Columbia)',
      subjects: [sci10._id, sci11._id]
    });

    const teacherUser3 = await User.create({
      email: 'elena.rostova@school.edu',
      password: 'Teacher@123',
      role: 'teacher',
      firstName: 'Elena',
      lastName: 'Rostova',
      contact: { phone: '+1 (555) 200-0003', address: '206 Faculty Lane, Boston, MA' }
    });
    const teacher3 = await Teacher.create({
      userId: teacherUser3._id,
      employeeId: 'EMP-003',
      qualification: 'M.A. English Literature & Modern Languages (Oxford)',
      subjects: [eng10._id, hist10._id]
    });

    // Parents
    const parentUser1 = await User.create({
      email: 'david.morgan@school.edu',
      password: 'Parent@123',
      role: 'parent',
      firstName: 'David',
      lastName: 'Morgan',
      contact: { phone: '+1 (555) 300-0001', address: '45 Elm Street, Cambridge, MA' }
    });

    const parentUser2 = await User.create({
      email: 'jennifer.lin@school.edu',
      password: 'Parent@123',
      role: 'parent',
      firstName: 'Jennifer',
      lastName: 'Lin',
      contact: { phone: '+1 (555) 300-0002', address: '78 Pine Road, Cambridge, MA' }
    });

    // Students
    const studentUser1 = await User.create({
      email: 'alex.morgan@school.edu',
      password: 'Student@123',
      role: 'student',
      firstName: 'Alex',
      lastName: 'Morgan',
      contact: { phone: '+1 (555) 400-0001', address: '45 Elm Street, Cambridge, MA' }
    });
    const student1 = await Student.create({
      userId: studentUser1._id,
      enrollmentNo: 'ENR-202510A',
      dateOfBirth: new Date('2009-04-12'),
      parentIds: [parentUser1._id]
    });

    const studentUser2 = await User.create({
      email: 'maya.lin@school.edu',
      password: 'Student@123',
      role: 'student',
      firstName: 'Maya',
      lastName: 'Lin',
      contact: { phone: '+1 (555) 400-0002', address: '78 Pine Road, Cambridge, MA' }
    });
    const student2 = await Student.create({
      userId: studentUser2._id,
      enrollmentNo: 'ENR-202510B',
      dateOfBirth: new Date('2009-08-20'),
      parentIds: [parentUser2._id]
    });

    const studentUser3 = await User.create({
      email: 'liam.smith@school.edu',
      password: 'Student@123',
      role: 'student',
      firstName: 'Liam',
      lastName: 'Smith',
      contact: { phone: '+1 (555) 400-0003', address: '90 Oak Avenue, Boston, MA' }
    });
    const student3 = await Student.create({
      userId: studentUser3._id,
      enrollmentNo: 'ENR-202511A',
      dateOfBirth: new Date('2008-11-05'),
      parentIds: []
    });

    const studentUser4 = await User.create({
      email: 'chloe.bennett@school.edu',
      password: 'Student@123',
      role: 'student',
      firstName: 'Chloe',
      lastName: 'Bennett',
      contact: { phone: '+1 (555) 400-0004', address: '12 Maple Drive, Boston, MA' }
    });
    const student4 = await Student.create({
      userId: studentUser4._id,
      enrollmentNo: 'ENR-202512A',
      dateOfBirth: new Date('2007-06-15'),
      parentIds: []
    });

    const studentUser5 = await User.create({
      email: 'nora.hughes@school.edu',
      password: 'Student@123',
      role: 'student',
      firstName: 'Nora',
      lastName: 'Hughes',
      contact: { phone: '+1 (555) 400-0005', address: '22 Willow Court, Boston, MA' }
    });
    const student5 = await Student.create({
      userId: studentUser5._id,
      enrollmentNo: 'ENR-20259A',
      dateOfBirth: new Date('2010-02-18'),
      parentIds: [parentUser1._id]
    });

    // 6. Enrollments
    await Enrollment.create({
      studentId: student5._id,
      academicYearId: academicYear._id,
      gradeId: grade9._id,
      sectionId: sec9A._id
    });
    await Enrollment.create({
      studentId: student1._id,
      academicYearId: academicYear._id,
      gradeId: grade10._id,
      sectionId: sec10A._id
    });
    await Enrollment.create({
      studentId: student2._id,
      academicYearId: academicYear._id,
      gradeId: grade10._id,
      sectionId: sec10A._id
    });
    await Enrollment.create({
      studentId: student3._id,
      academicYearId: academicYear._id,
      gradeId: grade11._id,
      sectionId: sec11A._id
    });
    await Enrollment.create({
      studentId: student4._id,
      academicYearId: academicYear._id,
      gradeId: grade12._id,
      sectionId: sec12A._id
    });

    // 7. Timetable Slots (Monday-Friday for Grade 10-A)
    const timetableData = [
      // Monday
      { dayOfWeek: 1, period: 1, startTime: '08:30', endTime: '09:20', subjectId: math10._id, teacherId: teacher1._id, classroom: 'Room 201' },
      { dayOfWeek: 1, period: 2, startTime: '09:25', endTime: '10:15', subjectId: sci10._id, teacherId: teacher2._id, classroom: 'Science Lab 2' },
      { dayOfWeek: 1, period: 3, startTime: '10:30', endTime: '11:20', subjectId: eng10._id, teacherId: teacher3._id, classroom: 'Room 201' },
      { dayOfWeek: 1, period: 4, startTime: '11:25', endTime: '12:15', subjectId: hist10._id, teacherId: teacher3._id, classroom: 'Room 201' },
      { dayOfWeek: 1, period: 5, startTime: '13:00', endTime: '13:50', subjectId: cs10._id, teacherId: teacher1._id, classroom: 'Computer Lab 1' },

      // Tuesday
      { dayOfWeek: 2, period: 1, startTime: '08:30', endTime: '09:20', subjectId: sci10._id, teacherId: teacher2._id, classroom: 'Science Lab 2' },
      { dayOfWeek: 2, period: 2, startTime: '09:25', endTime: '10:15', subjectId: math10._id, teacherId: teacher1._id, classroom: 'Room 201' },
      { dayOfWeek: 2, period: 3, startTime: '10:30', endTime: '11:20', subjectId: hist10._id, teacherId: teacher3._id, classroom: 'Room 201' },
      { dayOfWeek: 2, period: 4, startTime: '11:25', endTime: '12:15', subjectId: eng10._id, teacherId: teacher3._id, classroom: 'Room 201' },

      // Wednesday
      { dayOfWeek: 3, period: 1, startTime: '08:30', endTime: '09:20', subjectId: math10._id, teacherId: teacher1._id, classroom: 'Room 201' },
      { dayOfWeek: 3, period: 2, startTime: '09:25', endTime: '10:15', subjectId: cs10._id, teacherId: teacher1._id, classroom: 'Computer Lab 1' },
      { dayOfWeek: 3, period: 3, startTime: '10:30', endTime: '11:20', subjectId: sci10._id, teacherId: teacher2._id, classroom: 'Science Lab 2' },

      // Thursday
      { dayOfWeek: 4, period: 1, startTime: '08:30', endTime: '09:20', subjectId: eng10._id, teacherId: teacher3._id, classroom: 'Room 201' },
      { dayOfWeek: 4, period: 2, startTime: '09:25', endTime: '10:15', subjectId: hist10._id, teacherId: teacher3._id, classroom: 'Room 201' },
      { dayOfWeek: 4, period: 3, startTime: '10:30', endTime: '11:20', subjectId: math10._id, teacherId: teacher1._id, classroom: 'Room 201' },

      // Friday
      { dayOfWeek: 5, period: 1, startTime: '08:30', endTime: '09:20', subjectId: cs10._id, teacherId: teacher1._id, classroom: 'Computer Lab 1' },
      { dayOfWeek: 5, period: 2, startTime: '09:25', endTime: '10:15', subjectId: sci10._id, teacherId: teacher2._id, classroom: 'Science Lab 2' },
      { dayOfWeek: 5, period: 3, startTime: '10:30', endTime: '11:20', subjectId: math10._id, teacherId: teacher1._id, classroom: 'Room 201' }
    ];

    for (const item of timetableData) {
      await TimetableSlot.create({
        academicYearId: academicYear._id,
        gradeId: grade10._id,
        sectionId: sec10A._id,
        ...item
      });
    }

    // 8. Attendance Logs (last 10 days)
    for (let i = 1; i <= 10; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      // Alex Morgan
      await Attendance.create({
        studentId: student1._id,
        gradeId: grade10._id,
        sectionId: sec10A._id,
        date: d,
        status: i === 3 ? 'late' : 'present',
        remarks: i === 3 ? 'Bus delay' : 'On time',
        markedBy: teacherUser1._id
      });

      // Maya Lin
      await Attendance.create({
        studentId: student2._id,
        gradeId: grade10._id,
        sectionId: sec10A._id,
        date: d,
        status: 'present',
        remarks: 'Attentive',
        markedBy: teacherUser1._id
      });
    }

    // 9. Assignments
    const assign1 = await Assignment.create({
      title: 'Problem Set 4: Quadratic Systems & Parabolas',
      description: 'Solve problems 1 through 15 on Chapter 4. Include graphs for conic sections.',
      subjectId: math10._id,
      teacherId: teacher1._id,
      gradeId: grade10._id,
      sectionId: sec10A._id,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      totalMarks: 100,
      type: 'homework'
    });

    const assign2 = await Assignment.create({
      title: 'Chemistry Lab Report: Spectrophotometry & Beer-Lambert Law',
      description: 'Submit full lab writeup including calibration curve and absorbance measurements.',
      subjectId: sci10._id,
      teacherId: teacher2._id,
      gradeId: grade10._id,
      sectionId: sec10A._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalMarks: 100,
      type: 'project'
    });

    const assign3 = await Assignment.create({
      title: 'Critical Essay: The Great Gatsby Symbolism',
      description: '1,500-word essay examining the green light and the eyes of Dr. T.J. Eckleburg.',
      subjectId: eng10._id,
      teacherId: teacher3._id,
      gradeId: grade10._id,
      sectionId: sec10A._id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      totalMarks: 100,
      type: 'homework'
    });

    // 10. Submissions
    await Submission.create({
      assignmentId: assign1._id,
      studentId: student1._id,
      content: 'Submitted via student portal. Solutions worked out in handwritten notes and digital plots.',
      obtainedMarks: 96,
      feedback: 'Outstanding mathematical reasoning and elegant graphical proofs.',
      status: 'graded'
    });

    await Submission.create({
      assignmentId: assign2._id,
      studentId: student1._id,
      content: 'Complete data tables attached with R^2 = 0.998 linear regression curve.',
      obtainedMarks: 91,
      feedback: 'Very thorough error analysis. Great job on the concentration derivations.',
      status: 'graded'
    });

    await Submission.create({
      assignmentId: assign1._id,
      studentId: student2._id,
      content: 'All 15 problems solved step by step.',
      obtainedMarks: 98,
      feedback: 'Exemplary work!',
      status: 'graded'
    });

    // 11. Grade Records for Alex Morgan (Fall Term 1)
    const alexGrades = [
      { subjectId: math10._id, obtained: 95, max: 100, p: 95, letter: 'A', gpa: 4.0, remarks: 'Top decile performance in algebra' },
      { subjectId: sci10._id, obtained: 90, max: 100, p: 90, letter: 'A-', gpa: 3.7, remarks: 'Strong lab precision and conceptual grasp' },
      { subjectId: eng10._id, obtained: 93, max: 100, p: 93, letter: 'A', gpa: 4.0, remarks: 'Insightful literary analysis' },
      { subjectId: hist10._id, obtained: 88, max: 100, p: 88, letter: 'B+', gpa: 3.3, remarks: 'Active classroom debate participant' },
      { subjectId: cs10._id, obtained: 97, max: 100, p: 97, letter: 'A', gpa: 4.0, remarks: 'Excellent algorithm and logic design skills' }
    ];

    for (const g of alexGrades) {
      await GradeRecord.create({
        studentId: student1._id,
        academicYearId: academicYear._id,
        termId: term1._id,
        termName: term1.name,
        subjectId: g.subjectId,
        obtainedMarks: g.obtained,
        maxMarks: g.max,
        percentage: g.p,
        letterGrade: g.letter,
        gpaPoint: g.gpa,
        teacherRemarks: g.remarks,
        isFinalized: true
      });
    }

    // 12. Exams & Schedule
    const exam1 = await Exam.create({
      name: 'Fall Term Midterm Examinations',
      academicYearId: academicYear._id,
      termId: term1._id,
      startDate: new Date('2025-11-10'),
      endDate: new Date('2025-11-18')
    });

    await ExamSchedule.create({
      examId: exam1._id,
      subjectId: math10._id,
      gradeId: grade10._id,
      sectionId: sec10A._id,
      date: new Date('2025-11-10'),
      startTime: '09:00',
      endTime: '11:00',
      classroom: 'Examination Hall 1'
    });

    await ExamSchedule.create({
      examId: exam1._id,
      subjectId: sci10._id,
      gradeId: grade10._id,
      sectionId: sec10A._id,
      date: new Date('2025-11-12'),
      startTime: '09:00',
      endTime: '11:00',
      classroom: 'Examination Hall 1'
    });

    await ExamSchedule.create({
      examId: exam1._id,
      subjectId: eng10._id,
      gradeId: grade10._id,
      sectionId: sec10A._id,
      date: new Date('2025-11-15'),
      startTime: '09:00',
      endTime: '11:00',
      classroom: 'Auditorium'
    });

    console.log('[Seed] Database successfully seeded with full high school sample data!');
    console.log('--- DEMO CREDENTIALS ---');
    console.log('Admin:   admin@school.edu / Admin@123');
    console.log('Teacher: sarah.jenkins@school.edu / Teacher@123');
    console.log('Student: alex.morgan@school.edu / Student@123');
    console.log('Parent:  david.morgan@school.edu / Parent@123');
    console.log('------------------------');
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
  }
};

module.exports = seedDatabase;
