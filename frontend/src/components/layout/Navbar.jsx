import { useAuth } from '../../context/AuthContext';
import { LogOut, CheckSquare } from 'lucide-react';
import WorkspaceSwitcher from './WorkspaceSwitcher';

const Navbar = ({ activeWorkspace, setActiveWorkspace }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <CheckSquare className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gradient">TaskFlow</span>
          </div>
          
          {user && (
            <div className="hidden md:block h-6 w-px bg-white/10 mx-2" />
          )}
          
          {user && (
            <WorkspaceSwitcher 
              activeWorkspace={activeWorkspace} 
              onSelect={setActiveWorkspace} 
            />
          )}
        </div>
        <div className="flex items-center gap-6">
          {user && (
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-foreground">Welcome back,</span>
                <span className="text-xs text-muted-foreground">{user.username}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-all duration-300 border border-white/5 active:scale-95"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
