-- 1. Create Department
INSERT INTO department (name, code)
VALUES ('Computer Engineering', 'CE')
ON CONFLICT (code) DO NOTHING;

-- 2. Create Batch
INSERT INTO batch (name, start_year, end_year, is_active)
VALUES ('2022-2026', 2022, 2026, true);

-- 3. Create Faculty (Guide)
-- Password 'password123' hashed with bcrypt (cost 12)
INSERT INTO staff (name, email, password, role, phone, is_verified, department_id)
VALUES ('Dr. Faculty Test', 'faculty@test.com', '$2a$12$R9h/cIPz0gi.URNNXRFXjOios9Id9SHVP7YFffZR1Xj.k.Z.y.t.m', 'FACULTY', '1234567890', true, (SELECT id FROM department WHERE code = 'CE'))
ON CONFLICT (email) DO NOTHING;

-- 4. Create Student
INSERT INTO student (name, email, enrollment_no, password, phone, department_id, batch_id)
VALUES ('Student Test', 'student@test.com', 'CE001', '$2a$12$R9h/cIPz0gi.URNNXRFXjOios9Id9SHVP7YFffZR1Xj.k.Z.y.t.m', '0987654321', (SELECT id FROM department WHERE code = 'CE'), (SELECT id FROM batch WHERE name = '2022-2026'))
ON CONFLICT (email) DO NOTHING;

-- 5. Create Project Type
INSERT INTO project_type (name, description)
VALUES ('Final Year Project', 'Main project for final year students');

-- 6. Create Project Group
INSERT INTO project_group (name, title, area, description, project_type_id, guide_id)
VALUES (
    'Team Alpha', 
    'Smart Project Management System', 
    'Web Development', 
    'A system to manage student projects', 
    (SELECT id FROM project_type WHERE name = 'Final Year Project' LIMIT 1), 
    (SELECT id FROM staff WHERE email = 'faculty@test.com')
);

-- 7. Add Student to Group
INSERT INTO project_group_member (group_id, student_id, is_leader)
VALUES (
    (SELECT id FROM project_group WHERE name = 'Team Alpha' LIMIT 1), 
    (SELECT id FROM student WHERE email = 'student@test.com'), 
    true
);
