# Westlake Academic — School Management System (Grades 9–12)

A comprehensive, production-ready Full-Stack School Management System built specifically for High School education (Grades 9 through 12) using the **MERN Stack** (MongoDB, Express.js, React, Node.js).

---

## 🚀 Key Features

### 1. 👥 Four-Tier Role-Based Architecture
- **Administrator**: Complete control over users, high school grades (9 to 12), sections, subjects, annual sessions, enrollments, master timetables, and exam schedules.
- **Faculty / Teacher**: View assigned teaching periods, roll call attendance marking with bulk toggles, gradebook marks entry with real-time GPA and letter grade generation, and assignment turn-in scoring.
- **High School Student**: View weekly period timetable, track cumulative 4.0 weighted GPA, check course assignments & turn in solutions, view attendance rate, and print official academic transcripts.
- **Parent / Guardian**: Monitor linked child's academic trajectory, subject grades, faculty remarks, and verified attendance standing.

### 2. ⚡ 1-Click Demo Login
The login screen features pre-configured 1-click demo buttons for immediate testing:
- **Admin**: `admin@school.edu` / `Admin@123` (Admin Arthur Vance)
- **Teacher**: `sarah.jenkins@school.edu` / `Teacher@123` (Dr. Sarah Jenkins - Mathematics)
- **Student**: `alex.morgan@school.edu` / `Student@123` (Alex Morgan - Grade 10-A)
- **Parent**: `david.morgan@school.edu` / `Parent@123` (David Morgan)

### 3. 🎯 High School Academic Engine
- **Target Grades**: Grade 9 (Freshman), Grade 10 (Sophomore), Grade 11 (Junior), Grade 12 (Senior).
- **Curriculum Catalogue**: Core Sciences (AP Physics, Chemistry Honors, Biology), Mathematics (Algebra II, AP Calculus BC), Humanities (American Lit, World History), and Electives (AP Computer Science).
- **4.0 Scale GPA & Letter Grade Engine**: Automatic calculation mapping 93%+ to A (4.0), 90-92% to A- (3.7), 87-89% to B+ (3.3), 83-86% to B (3.0), etc.
- **Grade Advancement / Rollover**: 1-click automatic student promotion from Grade 9 → 10 → 11 → 12, or Senior Graduation.

### 4. 📅 Master Timetable & Conflict Prevention
- Interactive 5-day matrix (Periods 1 to 7, Monday through Friday).
- Backend conflict prevention engine checks and blocks:
  - Teacher double-booking
  - Classroom occupancy conflicts
  - Class section overlapping periods

### 5. 📋 Daily Attendance Roster
- Period / daily roll call.
- One-click "Mark All Present" fast workflow.
- Statuses: `Present`, `Absent`, `Late`, `Excused` with remarks.
- Real-time percentage tracking and unexcused absence counters.

### 6. 🖨️ Official Transcripts & Report Cards
- Beautiful printable High School Transcript modal.
- Includes official letterhead, seal, student registration credentials, course credits, GPA, and registrar signature block.
- Formatted with `@media print` rules for clean PDF printing.

---

## 🛠️ Technology Stack

- **Backend**:
  - Node.js (v24+) & Express.js
  - MongoDB with Mongoose ODM
  - Automatic `mongodb-memory-server` fallback for zero-configuration testing
  - JWT (JSON Web Tokens) & bcryptjs password hashing
  - Morgan HTTP logger & CORS
- **Frontend**:
  - React 18 & Vite
  - React Router v6
  - Context API for global session state
  - Axios API client with automatic token attachment
  - Lucide React iconography
  - Curated Dark/Light glassmorphism CSS design system

---

## 🏃 Running the Application

### 1. Start Backend API
```bash
cd backend
npm install
npm start
```
*The server will start on `http://localhost:5000` and automatically connect to MongoDB (or spin up the in-memory fallback) and auto-seed the database if empty.*

### 2. Start Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*The React application will launch on `http://localhost:5173` with proxy configured to the backend API.*

---

## 📡 REST API Endpoints Overview

All endpoints are prefixed with `/api/v1`:

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | POST | `/auth/login` | Authenticate user & return JWT |
| | POST | `/auth/register` | Self-register new student/parent |
| | GET | `/auth/me` | Fetch authenticated user profile |
| **Users** | GET | `/users` | List users with role filter & search |
| | POST | `/users` | Admin create new user |
| | DELETE | `/users/:id` | Remove user record |
| **Academics** | GET | `/grades` | List high school grades 9–12 |
| | GET | `/sections` | List grade sections & rooms |
| | GET | `/subjects` | List course catalogue |
| | GET | `/academic-years` | List terms & weights |
| **Enrollment** | GET | `/enrollments` | View student rosters by grade/section |
| | POST | `/enrollments` | Enroll student into cohort |
| | PUT | `/enrollments/:id/rollover` | Promote student to next grade level |
| **Timetable** | GET | `/timetable/slots` | Query slots by grade or teacher |
| | POST | `/timetable/slots` | Add slot with conflict validation |
| | DELETE | `/timetable/slots/:id` | Remove timetable slot |
| **Attendance** | POST | `/attendance/mark` | Batch mark class attendance |
| | GET | `/attendance/student/:id` | Student attendance rate & log |
| | GET | `/attendance/class/:gradeId/:sectionId` | Date-based class roll call |
| **Gradebook** | POST | `/grades/record` | Record term marks & calculate GPA |
| | GET | `/grades/student/:id` | Student term grade report |
| **Assignments**| GET | `/assignments` | List course assignments |
| | POST | `/assignments` | Create homework, lab, or exam |
| | POST | `/assignments/submit` | Student turn in work |
| | PUT | `/assignments/submissions/:id/grade` | Faculty award score & feedback |
| **Reports** | GET | `/reports/transcript/:studentId` | Full official high school transcript |
| | GET | `/reports/dashboard-stats` | Institutional summary statistics |
