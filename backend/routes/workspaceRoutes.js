import express from 'express';
import { createWorkspace, getWorkspaces, addMember } from '../controllers/workspaceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWorkspaces)
  .post(createWorkspace);

router.post('/add-member', addMember);

export default router;
