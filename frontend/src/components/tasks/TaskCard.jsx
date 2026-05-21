import { format } from 'date-fns';
import { Edit2, Trash2, Calendar } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, onClick }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div 
      onClick={onClick}
      className={`glass rounded-2xl p-6 border border-white/5 card-hover relative overflow-hidden group cursor-pointer ${isOverdue ? 'border-destructive/30' : ''}`}
    >
      {isOverdue && (
        <div className="absolute top-0 right-0 p-1 bg-destructive text-[10px] font-bold text-white uppercase tracking-wider rounded-bl-lg">
          Overdue
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className={`text-lg font-bold tracking-tight transition-all duration-300 ${task.status === 'completed' ? 'text-muted-foreground/50 line-through' : 'text-foreground'}`}>
            {task.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${
              task.status === 'completed' ? 'bg-green-500' : 
              task.status === 'in-progress' ? 'bg-blue-500' : 'bg-orange-500'
            }`} />
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              {task.status.replace('-', ' ')}
            </span>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }} 
            className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all active:scale-90"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }} 
            className="p-2 rounded-lg bg-white/5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all active:scale-90"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
        {task.description}
      </p>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {task.tags.map((tag, idx) => (
            <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {task.assignees?.map((assignee, idx) => (
              <div 
                key={idx} 
                className="w-7 h-7 rounded-full border-2 border-[#0c0c0e] bg-secondary flex items-center justify-center text-[10px] font-bold"
                title={assignee.username}
              >
                {assignee.username.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          {task.dueDate && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-white/5 text-muted-foreground'}`}>
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(task.dueDate), 'MMM dd')}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            className="text-[11px] font-bold uppercase tracking-wider bg-secondary/50 border border-white/5 text-foreground rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">Active</option>
            <option value="completed">Done</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
