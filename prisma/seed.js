const { Pool } = require('pg');
const { hash } = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

async function main() {
    console.log('Start seeding ...');

    try {
        // 1. Create Department
        const deptResult = await pool.query(`
      INSERT INTO department (name, code)
      VALUES ($1, $2)
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name
    `, ['Computer Engineering', 'CE']);
        const deptId = deptResult.rows[0].id;
        console.log('Created department:', deptResult.rows[0].name);

        // 2. Create Batch
        const batchResult = await pool.query(`
      INSERT INTO batch (name, start_year, end_year, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name
    `, ['2022-2026', 2022, 2026, true]);
        const batchId = batchResult.rows[0].id;
        console.log('Created batch:', batchResult.rows[0].name);

        // 3. Create Faculty (Guide)
        const password = await hash('password123', 12);
        const facultyResult = await pool.query(`
      INSERT INTO staff (name, email, password, role, phone, is_verified, department_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name
    `, ['Dr. Faculty Test', 'faculty@test.com', password, 'FACULTY', '1234567890', true, deptId]);
        const facultyId = facultyResult.rows[0].id;
        console.log('Created faculty:', facultyResult.rows[0].name);

        // 4. Create Student
        const studentResult = await pool.query(`
      INSERT INTO student (name, email, enrollment_no, password, phone, department_id, batch_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name
    `, ['Student Test', 'student@test.com', 'CE001', password, '0987654321', deptId, batchId]);
        const studentId = studentResult.rows[0].id;
        console.log('Created student:', studentResult.rows[0].name);

        // 5. Create Project Type
        const typeResult = await pool.query(`
      INSERT INTO project_type (name, description)
      VALUES ($1, $2)
      RETURNING id, name
    `, ['Final Year Project', 'Main project for final year students']);
        const typeId = typeResult.rows[0].id;
        console.log('Created project type:', typeResult.rows[0].name);

        // 6. Create Project Group
        const groupResult = await pool.query(`
      INSERT INTO project_group (name, title, area, description, project_type_id, guide_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name
    `, ['Team Alpha', 'Smart Project Management System', 'Web Development', 'A system to manage student projects', typeId, facultyId]);
        const groupId = groupResult.rows[0].id;
        console.log('Created project group:', groupResult.rows[0].name);

        // 7. Add Student to Group
        await pool.query(`
      INSERT INTO project_group_member (group_id, student_id, is_leader)
      VALUES ($1, $2, $3)
    `, [groupId, studentId, true]);
        console.log('Added student to group');

    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        await pool.end();
    }
}

main();
