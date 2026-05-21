import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';

export const createComment = asyncHandler(async (req, res, next) => {
  const { taskId, content } = req.body;

  const task = await Task.findById(taskId);
  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  const comment = await Comment.create({
    content,
    task: taskId,
    user: req.user._id,
  });

  const populatedComment = await comment.populate('user', 'username email');

  res.status(201).json({
    status: 'success',
    data: populatedComment,
  });
});

export const getComments = asyncHandler(async (req, res, next) => {
  const comments = await Comment.find({ task: req.params.taskId })
    .populate('user', 'username email')
    .sort({ createdAt: 1 });

  res.status(200).json({
    status: 'success',
    results: comments.length,
    data: comments,
  });
});
