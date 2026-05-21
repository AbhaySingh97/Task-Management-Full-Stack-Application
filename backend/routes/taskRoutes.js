import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  uploadAttachment,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, taskSchema } from '../middleware/validatorMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect); // Protect all task routes

router.route('/')
  .get(getTasks)
  .post(validate(taskSchema), createTask);

router.post('/:id/attachments', upload.single('file'), uploadAttachment);

router.route('/:id')
  .put(validate(taskSchema), updateTask)
  .delete(deleteTask);

export default router;
