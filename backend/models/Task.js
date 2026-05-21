import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
      required: false,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    workspace: {
      type: mongoose.Schema.ObjectId,
      ref: 'Workspace',
      required: false, // Optional for now to avoid breaking existing data
    },
    assignees: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    tags: [String],
    attachments: [
      {
        url: String,
        public_id: String,
        name: String,
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model('Task', taskSchema);

// Add text index for search
taskSchema.index({ title: 'text', description: 'text' });

export default Task;
