import { body, validationResult } from 'express-validator';
import { AppError } from '../middleware/errorMiddleware.js';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

    return next(new AppError('Validation failed', 422));
  };
};

export const registerSchema = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginSchema = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const taskSchema = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']),
  body('dueDate').optional().isISO8601().toDate().withMessage('Invalid date format'),
];
