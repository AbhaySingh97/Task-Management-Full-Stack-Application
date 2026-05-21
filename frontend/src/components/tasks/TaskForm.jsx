import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TaskForm = ({ isOpen, onClose, onSubmit, taskToEdit, activeWorkspace }) => {
  const [formData, setFormData] = useState({
    title: taskToEdit?.title || '',
    description: taskToEdit?.description || '',
    status: taskToEdit?.status || 'pending',
    dueDate: taskToEdit?.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '',
    tags: taskToEdit?.tags ? taskToEdit.tags.join(', ') : '',
    assignees: taskToEdit?.assignees?.map(a => a._id || a) || [],
  });

  // Reset form when taskToEdit changes or modal opens for new task
  useEffect(() => {
    if (!isOpen) return;
    
    setFormData({
      title: taskToEdit?.title || '',
      description: taskToEdit?.description || '',
      status: taskToEdit?.status || 'pending',
      dueDate: taskToEdit?.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '',
      tags: taskToEdit?.tags ? taskToEdit.tags.join(', ') : '',
      assignees: taskToEdit?.assignees?.map(a => a._id || a) || [],
    });
  }, [taskToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      workspace: activeWorkspace?._id,
    };
    onSubmit(dataToSubmit);
  };

  const toggleAssignee = (userId) => {
    setFormData(prev => {
      const isAssigned = prev.assignees.includes(userId);
      return {
        ...prev,
        assignees: isAssigned 
          ? prev.assignees.filter(id => id !== userId)
          : [...prev.assignees, userId]
      };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-in max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-8 border-b border-white/5">
          <div>
            <h2 className="text-2xl font-bold text-gradient">{taskToEdit ? 'Refine Task' : 'Draft New Task'}</h2>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium">Keep your flow organized</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Title</label>
            <input
              type="text"
              required
              placeholder="What needs to be done?"
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Description</label>
            <textarea
              placeholder="Add some context..."
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[100px] resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Tags (comma separated)</label>
            <input
              type="text"
              placeholder="design, urgent, api"
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          {activeWorkspace && activeWorkspace.members && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Assignees</label>
              <div className="flex flex-wrap gap-2 p-4 bg-white/5 border border-white/5 rounded-2xl">
                {activeWorkspace.members.map((member) => (
                  <button
                    key={member.user._id}
                    type="button"
                    onClick={() => toggleAssignee(member.user._id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      formData.assignees.includes(member.user._id)
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10'
                    }`}
                  >
                    {member.user.username}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Priority Status</label>
              <select
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending" className="bg-[#0c0c0e]">Pending</option>
                <option value="in-progress" className="bg-[#0c0c0e]">Active</option>
                <option value="completed" className="bg-[#0c0c0e]">Done</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Deadline</label>
              <input
                type="date"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
          
          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-foreground font-semibold transition-all active:scale-95 border border-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] px-6 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {taskToEdit ? 'Update Task' : 'Launch Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
