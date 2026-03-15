# StudentSync - Project Summary

## 1. Executive Summary
The **Student Project Management System (SPMS)** is a comprehensive web portal designed to streamline and digitize the academic project lifecycle. Built with a modern technology stack (Next.js App Router, Prisma ORM, and PostgreSQL), it provides dedicated workflows for three main user roles: **Administrators**, **Faculty members**, and **Students**.

The platform is engineered to facilitate group formation, project topic proposals, scheduled meetings, attendance tracking, and final deliverable submissions, all while maintaining rigorous access controls and a centralized notification architecture.

---

## 2. Global Working Flow
The system operates on a state-based progress model for project groups:
1. **Foundation Setup:** Administrators define the foundational academic structure (Batches, Departments, Project Types) and register Faculty/Staff.
2. **Team Formation:** Students register/login, form or join `project_groups`, and propose project topics including selecting a preferred Faculty Guide.
3. **Approval Process:** Faculty (or Admin) reviews the group proposal. The `project_group` status transitions from `PENDING` to either `APPROVED` or `REJECTED`.
4. **Active Project Phase:** Once approved, Faculty schedule `project_meetings`, which Students attend. Faculty track attendance and record performance/meeting notes. The groups also engage in internal and faculty communication via `group_messages`.
5. **Final Submissions:** Students submit final reports or project links (`project_submission`). Faculty evaluate these, updating their status to `APPROVED` or `REJECTED`.

---

## 3. Role-Based Workflows & CRUD Operations

### 3.1 Admin Workflows
The Administrator oversees the entire system's structure and acts as the gatekeeper for institutional data.

* **Batches & Departments:** 
  * **Create/Update/Delete:** Set up the university's active academic years (Batches) and study branches (Departments).
* **Project Types:**
  * **Create/Update:** Define different project scales (e.g., Major Project, Mini Project, Dissertation).
* **Staff & Student Management:**
  * **Create/Read/Update/Delete (CRUD):** Manage the active cohort of students and the verified roster of faculty staff. Admins can manually verify/add new faculty members.
* **Global Monitoring (Projects & Reports):**
  * **Read:** View an aggregated dashboard of all registered `project_groups` across the institution, their current statuses (`PENDING`, `APPROVED`), and assigned faculty.
  * **Export:** Generate overarching reports on project completion rates, attendance statistics, and systemic evaluations.
* **Notifications:**
  * **Create:** Dispatch system-wide or targeted notifications to specific roles or users regarding deadlines and announcements.

### 3.2 Faculty Workflows
Faculty members assume critical mentoring and evaluating roles, classified primarily as Guides, Conveners, or Experts per project group.

* **Project Group Management:**
  * **Read/Update:** Faculty can view the unapproved `project_group` requests routed to them. They execute `Update` operations to move a group's status from `PENDING` to `APPROVED` or `REJECTED`.
* **Meeting & Attendance Lifecycle (CRUD):**
  * **Create/Update/Delete:** Schedule `project_meetings` by setting dates, locations, meeting links, and agendas. 
  * **Update:** Post-meeting, Faculty evaluate and record the attendance status (`project_meeting_attendance`) and remarks for each group member.
* **Submission Evaluation:**
  * **Read/Update:** Students submit `project_submissions` (documents, external links). Faculty review these and modify the submission status accordingly.
* **Internal Messages:**
  * **Create/Read:** Send direct guidance or announcements to assigned groups within the localized `group_message` board.

### 3.3 Student Workflows
Students are the primary end-users, tracking their graduation project milestones through the platform.

* **Profile & Settings:**
  * **Update:** Maintain their contact information, password, and view their assigned CGPA, Batch, and Department details.
* **Team & Topic Conception:**
  * **Create/Update:** Initiate a `project_group`, formulating the project title, area of research, and abstract description. Add peers to the group (`project_group_member`) creating a consolidated team entity.
* **Meeting Participation:**
  * **Read:** View the calendar of upcoming `project_meetings` scheduled by their Faculty Guide, including joining links and prerequisite agendas. Track their own cumulative attendance records natively.
* **Project Submissions:**
  * **Create/Update:** Make formal digital `project_submissions` mapping to specific final project deliverables.
* **Internal Messages:**
  * **Create/Read:** Utilize the `group_message` feature for asynchronous communications amongst their team members and tracking faculty feedback without relying on external messaging apps.

---

## 4. Key Architectural Models (Prisma Database Core)
The system leverages a strictly relational PostgreSQL database to guarantee data integrity:
* **`user_role` Enum:** Hardcoded access control segregating `ADMIN`, `FACULTY`, and `STUDENT`.
* **Foreign Key Constraints:** `project_group` serves as the nucleus table. All related entities like `project_meeting`, `project_submission`, and `group_message` cascade or relationally bind back to it, ensuring that deleting a group cleanly purges its historic data.
* **Pivot Tables:** `project_group_member` acts as the many-to-many pivot determining the specific list of Students composing an overarching Project Group, alongside capturing their individual metadata (e.g., who is the team leader).

---
*Summary generated sequentially from backend routes and Prisma Schema analysis.*
