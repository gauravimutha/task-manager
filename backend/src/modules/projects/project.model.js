// src/modules/projects/project.model.js
const pool = require('../../config/db');

const ProjectModel = {
  /** List all projects */
  async getAll() {
    const { rows } = await pool.query(
      `SELECT p.id, p.title, p.description, p.created_at,
              COUNT(DISTINCT pm.user_id)::int  AS member_count,
              COUNT(DISTINCT t.id)::int        AS task_count
       FROM projects p
       LEFT JOIN project_members pm ON pm.project_id = p.id
       LEFT JOIN tasks t            ON t.project_id  = p.id
       GROUP BY p.id
       ORDER BY p.id ASC`
    );
    return rows;
  },

  /** Get single project with its members */
  async getById(id) {
    const projectRes = await pool.query(
      'SELECT id, title, description, created_at FROM projects WHERE id = $1',
      [id]
    );
    if (!projectRes.rows[0]) return null;

    const membersRes = await pool.query(
      `SELECT u.id, u.name, u.email, pm.role
       FROM project_members pm
       JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = $1
       ORDER BY u.name ASC`,
      [id]
    );

    return { ...projectRes.rows[0], members: membersRes.rows };
  },

  /** Create project */
  async create({ title, description }) {
    const { rows } = await pool.query(
      `INSERT INTO projects (title, description)
       VALUES ($1, $2)
       RETURNING id, title, description, created_at`,
      [title, description || null]
    );
    return rows[0];
  },

  /** Update project */
  async update(id, { title, description }) {
    const { rows } = await pool.query(
      `UPDATE projects
       SET title       = COALESCE($1, title),
           description = COALESCE($2, description)
       WHERE id = $3
       RETURNING id, title, description, created_at`,
      [title || null, description || null, id]
    );
    return rows[0] || null;
  },

  /** Delete project (cascades tasks + members) */
  async delete(id) {
    const { rowCount } = await pool.query(
      'DELETE FROM projects WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  },

  // ── Membership ──────────────────────────────────────────────

  /** Add user to project */
  async addMember(projectId, userId, role = 'member') {
    const { rows } = await pool.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, user_id) DO UPDATE SET role = $3
       RETURNING *`,
      [projectId, userId, role]
    );
    return rows[0];
  },

  /** Remove user from project */
  async removeMember(projectId, userId) {
    const { rowCount } = await pool.query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );
    return rowCount > 0;
  },

  /** Get all members of a project */
  async getMembers(projectId) {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, pm.role, pm.joined_at
       FROM project_members pm
       JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = $1
       ORDER BY u.name ASC`,
      [projectId]
    );
    return rows;
  },
};

module.exports = ProjectModel;
