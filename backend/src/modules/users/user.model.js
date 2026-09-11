// src/modules/users/user.model.js
// Raw SQL queries for the users table — no ORM
const pool = require('../../config/db');

const UserModel = {
  /** Return all users */
  async getAll() {
    const { rows } = await pool.query(
      'SELECT id, name, email, created_at FROM users ORDER BY id ASC'
    );
    return rows;
  },

  /** Return single user by id */
  async getById(id) {
    const { rows } = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  /** Create new user */
  async create({ name, email }) {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email)
       VALUES ($1, $2)
       RETURNING id, name, email, created_at`,
      [name, email]
    );
    return rows[0];
  },

  /** Update user name or email */
  async update(id, { name, email }) {
    const { rows } = await pool.query(
      `UPDATE users
       SET name  = COALESCE($1, name),
           email = COALESCE($2, email)
       WHERE id = $3
       RETURNING id, name, email, created_at`,
      [name || null, email || null, id]
    );
    return rows[0] || null;
  },

  /** Delete user */
  async delete(id) {
    const { rowCount } = await pool.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  },
};

module.exports = UserModel;
