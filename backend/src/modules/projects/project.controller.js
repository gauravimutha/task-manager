// src/modules/projects/project.controller.js
const ProjectModel = require('./project.model');
const { requireFields } = require('../../middleware/validate');

const ProjectController = {
  /** GET /api/projects */
  async getAll(req, res, next) {
    try {
      const projects = await ProjectModel.getAll();
      res.json({ success: true, data: projects });
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/projects/:id */
  async getById(req, res, next) {
    try {
      const project = await ProjectModel.getById(req.params.id);
      if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
      res.json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  },

  /** POST /api/projects */
  async create(req, res, next) {
    try {
      const err = requireFields(['title'], req.body);
      if (err) return next(err);

      const project = await ProjectModel.create(req.body);
      res.status(201).json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  },

  /** PUT /api/projects/:id */
  async update(req, res, next) {
    try {
      const project = await ProjectModel.update(req.params.id, req.body);
      if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
      res.json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /api/projects/:id */
  async delete(req, res, next) {
    try {
      const deleted = await ProjectModel.delete(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Project not found' });
      res.json({ success: true, message: 'Project deleted' });
    } catch (err) {
      next(err);
    }
  },

  // ── Membership ────────────────────────────────────────────

  /** GET /api/projects/:id/members */
  async getMembers(req, res, next) {
    try {
      const members = await ProjectModel.getMembers(req.params.id);
      res.json({ success: true, data: members });
    } catch (err) {
      next(err);
    }
  },

  /** POST /api/projects/:id/members  body: { userId, role? } */
  async addMember(req, res, next) {
    try {
      const err = requireFields(['userId'], req.body);
      if (err) return next(err);

      const { userId, role } = req.body;
      const member = await ProjectModel.addMember(req.params.id, userId, role);
      res.status(201).json({ success: true, data: member });
    } catch (err) {
      // FK violation — user or project not found
      if (err.code === '23503') {
        return res.status(404).json({ success: false, error: 'User or project not found' });
      }
      next(err);
    }
  },

  /** DELETE /api/projects/:id/members/:userId */
  async removeMember(req, res, next) {
    try {
      const removed = await ProjectModel.removeMember(req.params.id, req.params.userId);
      if (!removed) return res.status(404).json({ success: false, error: 'Member not found in project' });
      res.json({ success: true, message: 'Member removed from project' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ProjectController;
