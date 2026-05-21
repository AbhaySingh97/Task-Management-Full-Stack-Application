import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWorkspaces, createWorkspace } from '../../services/api';
import { ChevronDown, Plus, Check, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import MemberModal from './MemberModal';

const WorkspaceSwitcher = ({ activeWorkspace, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const isOwner = activeWorkspace?.owner?._id === currentUser?._id || 
                  activeWorkspace?.owner === currentUser?._id;

  const { data: workspacesResponse } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
        const { data } = await fetchWorkspaces();
        return data.data;
    },
  });

  const workspaces = workspacesResponse || [];

  const createMutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setShowCreate(false);
      setNewWorkspaceName('');
    },
  });

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            {activeWorkspace?.name?.charAt(0).toUpperCase() || 'P'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Workspace</p>
            <p className="text-sm font-bold text-foreground leading-none">{activeWorkspace?.name || 'Personal'}</p>
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {activeWorkspace && isOwner && (
          <button
            onClick={() => setShowMembers(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all group"
            title="Manage Members"
          >
            <UserPlus className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 glass rounded-2xl border border-white/5 shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2">My Workspaces</p>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onSelect(null);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold">P</div>
                  <span className="text-sm font-medium">Personal</span>
                </div>
                {!activeWorkspace && <Check className="h-4 w-4 text-primary" />}
              </button>
              {workspaces.map((ws) => (
                <button
                  key={ws._id}
                  onClick={() => {
                    onSelect(ws);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{ws.name}</span>
                  </div>
                  {activeWorkspace?._id === ws._id && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 mt-2 pt-2 px-3">
            {showCreate ? (
              <div className="p-2 space-y-3">
                <input
                  autoFocus
                  type="text"
                  placeholder="Workspace name..."
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => createMutation.mutate({ name: newWorkspaceName })}
                    disabled={!newWorkspaceName || createMutation.isPending}
                    className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="flex-1 bg-white/5 text-xs font-bold py-2 rounded-lg hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-primary transition-colors text-sm font-bold"
              >
                <Plus className="h-4 w-4" />
                New Workspace
              </button>
            )}
          </div>
        </div>
      )}

      <MemberModal
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
        workspace={activeWorkspace}
      />
    </div>
  );
};

export default WorkspaceSwitcher;
