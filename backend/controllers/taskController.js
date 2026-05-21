import Task from '../models/Task.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Upload task attachment
// @route   POST /api/tasks/:id/attachments
// @access  Private
export const uploadAttachment = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'task_attachments',
    resource_type: 'auto',
  });

  const attachment = {
    url: result.secure_url,
    public_id: result.public_id,
    name: req.file.originalname,
    type: req.file.mimetype,
  };

  task.attachments.push(attachment);
  await task.save();

  res.status(200).json({
    status: 'success',
    data: attachment,
  });
});

// @desc    Get all user tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = asyncHandler(async (req, res, next) => {
  const { workspaceId, search, sort, page = 1, limit = 100 } = req.query;
  
  let query = {
    $or: [
      { user: req.user._id },
      { assignees: req.user._id }
    ]
  };

  if (workspaceId) {
    query.workspace = workspaceId;
  }

  // Full-text search
  if (search) {
    query.$text = { $search: search };
  }

  // Sorting
  let sortBy = '-createdAt';
  if (sort) {
    sortBy = sort.split(',').join(' ');
  }

  // Pagination
  const skip = (page - 1) * limit;

  const tasks = await Task.find(query)
    .sort(sortBy)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('user', 'username email')
    .populate('assignees', 'username email');

  res.json({
    status: 'success',
    results: tasks.length,
    page: parseInt(page),
    data: tasks,
  });
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
export const createTask = asyncHandler(async (req, res, next) => {
  const { title, description, status, dueDate, workspace, assignees, tags } = req.body;

  const task = await Task.create({
    title,
    description,
    status,
    dueDate,
    workspace,
    assignees: assignees || [req.user._id],
    tags,
    user: req.user._id,
  });

  const io = req.app.get('io');
  if (io) {
    const target = workspace ? `workspace_${workspace.toString()}` : `user_${req.user._id.toString()}`;
    io.to(target).emit('taskCreated', task);
  }

  res.status(201).json({
    status: 'success',
    data: task,
  });
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  const isOwner = task.user.toString() === req.user._id.toString();
  const isAssignee = task.assignees.some(id => id.toString() === req.user._id.toString());

  if (!isOwner && !isAssignee) {
    return next(new AppError('User not authorized', 401));
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  const io = req.app.get('io');
  if (io) {
    const target = task.workspace ? `workspace_${task.workspace.toString()}` : `user_${req.user._id.toString()}`;
    io.to(target).emit('taskUpdated', task);
  }

  res.json({
    status: 'success',
    data: task,
  });
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  if (task.user.toString() !== req.user._id.toString()) {
    return next(new AppError('User not authorized', 401));
  }

  await task.deleteOne();

  const io = req.app.get('io');
  if (io) {
    const target = task.workspace ? `workspace_${task.workspace.toString()}` : `user_${req.user._id.toString()}`;
    io.to(target).emit('taskDeleted', req.params.id);
  }

  res.json({
    status: 'success',
    message: 'Task removed',
    id: req.params.id,
  });
});
