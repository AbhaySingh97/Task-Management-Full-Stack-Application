import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import { sendEmail } from '../config/mail.js';
import logger from '../config/logger.js';

export const createWorkspace = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const workspace = await Workspace.create({
    name,
    owner: req.user._id,
    members: [{ user: req.user._id, role: 'owner' }],
  });

  res.status(201).json({
    status: 'success',
    data: workspace,
  });
});

export const getWorkspaces = asyncHandler(async (req, res, next) => {
  const workspaces = await Workspace.find({
    'members.user': req.user._id,
  })
    .populate('owner', 'username email')
    .populate('members.user', 'username email');

  res.status(200).json({
    status: 'success',
    results: workspaces.length,
    data: workspaces,
  });
});

export const addMember = asyncHandler(async (req, res, next) => {
  const { workspaceId, userId, role } = req.body;

  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    return next(new AppError('Workspace not found', 404));
  }

  // Check if current user is admin/owner
  const currentUser = workspace.members.find(m => m.user.toString() === req.user._id.toString());
  if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'admin')) {
    return next(new AppError('Not authorized to add members', 403));
  }

  // Check if user already a member
  const isMember = workspace.members.some(m => m.user.toString() === userId);
  if (isMember) {
    return next(new AppError('User is already a member', 400));
  }

  workspace.members.push({ user: userId, role: role || 'member' });
  await workspace.save();

  // Send invitation email
  const invitedUser = await User.findById(userId);
  if (invitedUser) {
    try {
      await sendEmail({
        email: invitedUser.email,
        subject: `Workspace Invitation: ${workspace.name}`,
        message: `Hello ${invitedUser.username},\n\nYou have been added to the workspace "${workspace.name}" on TaskFlow.\n\nLogin to start collaborating!`,
      });
    } catch (error) {
      logger.error('Email failed to send:', error);
    }
  }

  res.status(200).json({
    status: 'success',
    data: workspace,
  });
});
