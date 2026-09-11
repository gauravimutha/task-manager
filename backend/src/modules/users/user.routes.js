// src/modules/users/user.routes.js
const { Router } = require('express');
const UserController = require('./user.controller');

const router = Router();

router.get('/',     UserController.getAll);
router.get('/:id',  UserController.getById);
router.post('/',    UserController.create);
router.put('/:id',  UserController.update);
router.delete('/:id', UserController.delete);

module.exports = router;
