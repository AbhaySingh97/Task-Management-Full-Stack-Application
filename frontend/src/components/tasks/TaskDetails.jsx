import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchComments, createComment } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { X, Send, MessageSquare, Paperclip, Loader2, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';

const TaskDetails = ({ task, isOpen, onClose }) => {
  const [newComment, setNewComment] = useState('');
  const [viewingUsers, setViewingUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const socket = useSocket();
  const queryClient = useQueryClient();

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
    if (socket && task) {
      if (e.target.value.trim()) {
        socket.emit('typingTask', { taskId: task._id, userId: user._id, username: user.username });
      } else {
        socket.emit('stoppedTypingTask', { taskId: task._id, userId: user._id });
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const user = JSON.parse(localStorage.getItem('userInfo'));
      await axios.post(`http://127.0.0.1:5000/api/tasks/${task._id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('File uploaded successfully');
    } catch (_) {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const { data: commentsResponse } = useQuery({
    queryKey: ['comments', task?._id],
    queryFn: async () => {
        const { data } = await fetchComments(task._id);
        return data.data;
    },
    enabled: !!task && isOpen,
  });

  const comments = commentsResponse || [];

  const commentMutation = useMutation({
    mutationFn: (content) => createComment({ taskId: task._id, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', task._id] });
      setNewComment('');
      if (socket && task) {
        socket.emit('stoppedTypingTask', { taskId: task._id, userId: user._id });
      }
    },
  });

  useEffect(() => {
    if (socket && task && isOpen) {
      socket.emit('viewingTask', { taskId: task._id, userId: user._id, username: user.username });

      const handleUserViewing = ({ userId, username }) => {
        setViewingUsers(prev => [...prev.filter(u => u.userId !== userId), { userId, username }]);
      };

      const handleUserLeft = ({ userId }) => {
        setViewingUsers(prev => prev.filter(u => u.userId !== userId));
      };

      const handleUserTyping = ({ userId, username }) => {
        setTypingUsers(prev => [...prev.filter(u => u.userId !== userId), { userId, username }]);
      };

      const handleUserStoppedTyping = ({ userId }) => {
        setTypingUsers(prev => prev.filter(u => u.userId !== userId));
      };

      socket.on('userViewing', handleUserViewing);
      socket.on('userLeft', handleUserLeft);
      socket.on('userTyping', handleUserTyping);
      socket.on('userStoppedTyping', handleUserStoppedTyping);

      return () => {
        socket.emit('leavingTask', { taskId: task._id, userId: user._id });
        socket.off('userViewing', handleUserViewing);
        socket.off('userLeft', handleUserLeft);
        socket.off('userTyping', handleUserTyping);
        socket.off('userStoppedTyping', handleUserStoppedTyping);
      };
    }
  }, [socket, task, isOpen, user]);

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl glass rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-8 py-6 border-b border-white/5">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{task.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              {viewingUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {viewingUsers.map((u, i) => (
                      <div key={i} className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[8px] font-bold" title={u.username}>
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Also viewing</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className={`p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload} 
                disabled={isUploading}
              />
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <Paperclip className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              )}
            </label>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-8 h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="mb-8">
            <p className="text-muted-foreground leading-relaxed">{task.description || 'No description provided.'}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-white/5">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {task.tags && task.tags.length > 0 ? (
                  task.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">No tags</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3 block">Assignees</label>
              <div className="flex flex-wrap gap-2">
                {task.assignees && task.assignees.length > 0 ? (
                  task.assignees.map((assignee, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5">
                      <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center text-[8px] font-bold">
                        {assignee.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-foreground">{assignee.username}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">Unassigned</span>
                )}
              </div>
            </div>
          </div>

          {task.attachments && task.attachments.length > 0 && (
            <div className="mb-8 pb-8 border-b border-white/5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3 block">Attachments</label>
              <div className="grid grid-cols-2 gap-4">
                {task.attachments.map((file, i) => (
                  <a 
                    key={i}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <CheckSquare className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">{file.type.split('/')[1]}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Discussion</h3>
            </div>

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {comment.user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-foreground">{comment.user.username}</span>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(comment.createdAt), 'MMM dd, HH:mm')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/5 border-t border-white/5">
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 mb-3 ml-1 animate-pulse">
              <div className="flex gap-1">
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span className="w-1 h-1 rounded-full bg-primary" />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium italic">
                {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          )}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (newComment.trim()) commentMutation.mutate(newComment);
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={handleCommentChange}
              className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button 
              type="submit"
              disabled={!newComment.trim() || commentMutation.isPending}
              className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
