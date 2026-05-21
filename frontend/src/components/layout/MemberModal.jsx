import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addWorkspaceMember } from '../../services/api';
import { X, UserPlus, Shield, User as UserIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MemberModal = ({ isOpen, onClose, workspace }) => {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('member');
  const queryClient = useQueryClient();

  const addMemberMutation = useMutation({
    mutationFn: addWorkspaceMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Member added successfully');
      setUserId('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add member');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-foreground">{workspace?.name}</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Manage Members</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              addMemberMutation.mutate({ workspaceId: workspace._id, userId, role });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Invite by User ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste user ID here..."
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="member" className="bg-[#0c0c0e]">Member</option>
                  <option value="admin" className="bg-[#0c0c0e]">Admin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={!userId || addMemberMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {addMemberMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Invite Member
            </button>
          </form>

          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Current Members</p>
            <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar pr-2">
              {workspace?.members?.map((member) => (
                <div key={member.user._id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                      {member.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{member.user.username}</p>
                      <p className="text-[10px] text-muted-foreground">{member.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {member.role === 'owner' ? <Shield className="h-3 w-3 text-primary" /> : <UserIcon className="h-3 w-3" />}
                    {member.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberModal;
