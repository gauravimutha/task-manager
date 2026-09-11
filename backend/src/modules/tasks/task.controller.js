// src/modules/tasks/task.controller.js
const TaskModel = require('./task.model');
const { requireFields } = require('../../middleware/validate');

const VALID_STATUSES  = ['todo', 'inprogress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

const TaskController = {
  /** GET /api/projects/:projectId/tasks */
  async getAllByProject(req, res, next) {
    try {
      const tasks = await TaskModel.getAllByProject(req.params.projectId);
      res.json({ success: true, data: tasks });
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/tasks/:id */
  async getById(req, res, next) {
    try {
      const task = await TaskModel.getById(req.params.id);
      if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
      res.json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  },

  /** POST /api/projects/:projectId/tasks */
  async create(req, res, next) {
    try {
      const err = requireFields(['title'], req.body);
      if (err) return next(err);

      const { priority, status } = req.body;

      if (priority && !VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ success: false, error: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
      }
      if (status && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
      }

      const task = await TaskModel.create({
        ...req.body,
        projectId: req.params.projectId,
      });
      res.status(201).json({ success: true, data: task });
    } catch (err) {
      // FK violation — project doesn't exist
      if (err.code === '23503') {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      next(err);
    }
  },

  /** PUT /api/tasks/:id */
  async update(req, res, next) {
    try {
      const { priority, status } = req.body;
      if (priority && !VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ success: false, error: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
      }
      if (status && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
      }

      const task = await TaskModel.update(req.params.id, req.body);
      if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
      res.json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  },

  /** PATCH /api/tasks/:id/move  — drag-and-drop column change */
  async move(req, res, next) {
    try {
      const err = requireFields(['status'], req.body);
      if (err) return next(err);

      const { status, position = 0 } = req.body;

      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
      }

      const task = await TaskModel.move(req.params.id, { status, position });
      if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
      res.json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /api/tasks/:id */
  async delete(req, res, next) {
    try {
      const deleted = await TaskModel.delete(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Task not found' });
      res.json({ success: true, message: 'Task deleted' });
    } catch (err) {
      next(err);
    }
  },

  // ── Assignees ───────────────────────────────────────────

  /** POST /api/tasks/:id/assignees  body: { userId } */
  async addAssignee(req, res, next) {
    try {
      const err = requireFields(['userId'], req.body);
      if (err) return next(err);

      await TaskModel.addAssignee(req.params.id, req.body.userId);
      const task = await TaskModel.getById(req.params.id);
      res.status(201).json({ success: true, data: task });
    } catch (err) {
      if (err.code === '23503') {
        return res.status(404).json({ success: false, error: 'Task or user not found' });
      }
      next(err);
    }
  },

  /** DELETE /api/tasks/:id/assignees/:userId */
  async removeAssignee(req, res, next) {
    try {
      const removed = await TaskModel.removeAssignee(req.params.id, req.params.userId);
      if (!removed) return res.status(404).json({ success: false, error: 'Assignee not found on task' });
      const task = await TaskModel.getById(req.params.id);
      res.json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = TaskController;
