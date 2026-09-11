// src/modules/tasks/task.model.js
const pool = require('../../config/db');

const TaskModel = {
  /**
   * Get all tasks for a project, each with their assignees array.
   * Results are ordered by status then position.
   */
  async getAllByProject(projectId) {
    const { rows } = await pool.query(
      `SELECT
         t.id, t.project_id, t.title, t.description,
         t.priority, t.status, t.due_date, t.position,
         t.created_at, t.updated_at,
         COALESCE(
           JSON_AGG(
             JSON_BUILD_OBJECT('id', u.id, 'name', u.name, 'email', u.email)
           ) FILTER (WHERE u.id IS NOT NULL),
           '[]'
         ) AS assignees
       FROM tasks t
       LEFT JOIN task_assignees ta ON ta.task_id = t.id
       LEFT JOIN users u           ON u.id = ta.user_id
       WHERE t.project_id = $1
       GROUP BY t.id
       ORDER BY t.status ASC, t.position ASC`,
      [projectId]
    );
    return rows;
  },

  /** Get a single task with assignees */
  async getById(id) {
    const { rows } = await pool.query(
      `SELECT
         t.id, t.project_id, t.title, t.description,
         t.priority, t.status, t.due_date, t.position,
         t.created_at, t.updated_at,
         COALESCE(
           JSON_AGG(
             JSON_BUILD_OBJECT('id', u.id, 'name', u.name, 'email', u.email)
           ) FILTER (WHERE u.id IS NOT NULL),
           '[]'
         ) AS assignees
       FROM tasks t
       LEFT JOIN task_assignees ta ON ta.task_id = t.id
       LEFT JOIN users u           ON u.id = ta.user_id
       WHERE t.id = $1
       GROUP BY t.id`,
      [id]
    );
    return rows[0] || null;
  },

  /** Create a task in a project */
  async create({ projectId, title, description, priority, status, due_date, position }) {
    const { rows } = await pool.query(
      `INSERT INTO tasks (project_id, title, description, priority, status, due_date, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        projectId,
        title,
        description || null,
        priority    || 'medium',
        status      || 'todo',
        due_date    || null,
        position    || 0,
      ]
    );
    return rows[0];
  },

  /** Update task fields */
  async update(id, { title, description, priority, due_date, position }) {
    const { rows } = await pool.query(
      `UPDATE tasks
       SET title       = COALESCE($1, title),
           description = COALESCE($2, description),
           priority    = COALESCE($3, priority),
           due_date    = COALESCE($4, due_date),
           position    = COALESCE($5, position)
       WHERE id = $6
       RETURNING *`,
      [
        title       || null,
        description || null,
        priority    || null,
        due_date    || null,
        position    != null ? position : null,
        id,
      ]
    );
    return rows[0] || null;
  },

  /**
   * Move task to a different status column and update its position.
   * Used for drag-and-drop.
   */
  async move(id, { status, position }) {
    const { rows } = await pool.query(
      `UPDATE tasks
       SET status   = $1,
           position = $2
       WHERE id = $3
       RETURNING *`,
      [status, position, id]
    );
    return rows[0] || null;
  },

  /** Delete a task */
  async delete(id) {
    const { rowCount } = await pool.query(
      'DELETE FROM tasks WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  },

  // ── Assignees ────────────────────────────────────────────

  /** Assign a user to a task */
  async addAssignee(taskId, userId) {
    const { rows } = await pool.query(
      `INSERT INTO task_assignees (task_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [taskId, userId]
    );
    return rows[0] || null;
  },

  /** Unassign a user from a task */
  async removeAssignee(taskId, userId) {
    const { rowCount } = await pool.query(
      'DELETE FROM task_assignees WHERE task_id = $1 AND user_id = $2',
      [taskId, userId]
    );
    return rowCount > 0;
  },
};

module.exports = TaskModel;
