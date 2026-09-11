// src/modules/users/user.controller.js
// Handles HTTP req/res — delegates data work to UserModel
const UserModel = require('./user.model');
const { requireFields } = require('../../middleware/validate');

const UserController = {
  /** GET /api/users */
  async getAll(req, res, next) {
    try {
      const users = await UserModel.getAll();
      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/users/:id */
  async getById(req, res, next) {
    try {
      const user = await UserModel.getById(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  /** POST /api/users */
  async create(req, res, next) {
    try {
      const validationErr = requireFields(['name', 'email'], req.body);
      if (validationErr) return next(validationErr);

      const user = await UserModel.create(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      // Unique email violation
      if (err.code === '23505') {
        return res.status(409).json({ success: false, error: 'Email already exists' });
      }
      next(err);
    }
  },

  /** PUT /api/users/:id */
  async update(req, res, next) {
    try {
      const user = await UserModel.update(req.params.id, req.body);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /api/users/:id */
  async delete(req, res, next) {
    try {
      const deleted = await UserModel.delete(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, error: 'User not found' });
      res.json({ success: true, message: 'User deleted' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = UserController;
