import express from 'express';
import { createComment, getComments } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createComment);
router.get('/:taskId', getComments);

export default router;
